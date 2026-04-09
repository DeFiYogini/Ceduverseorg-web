import { readFileSync, existsSync, writeFileSync, unlinkSync } from "fs";
import { execFileSync } from "child_process";
import pg from "pg";
import path from "path";

const SAT_69B_CSV_URL = "http://omawww.sat.gob.mx/cifras_sat/Documents/Listado_Completo_69-B.csv";
const LOCAL_CSV_PATH = "/tmp/sat_69b.csv";
const CLEAN_CSV_PATH = "/tmp/sat_69b_clean.csv";

function parseSat69bCsv(content: string) {
  const lines = content.split("\n");
  const dataLines = lines.slice(2).filter(l => l.trim().length > 0);
  if (dataLines.length === 0) return [];

  const records: Array<{
    numero: number;
    rfc: string;
    nombreContribuyente: string;
    situacion: string;
    fechaPresuntos: string | null;
    fechaDesvirtuados: string | null;
    fechaDefinitivos: string | null;
    fechaSentencia: string | null;
  }> = [];

  for (let i = 1; i < dataLines.length; i++) {
    const line = dataLines[i];
    if (!line || line.trim().length < 5) continue;

    const fields = parseCSVLine(line);
    if (fields.length < 4) continue;

    const numero = parseInt(fields[0]);
    const rfc = (fields[1] || "").trim();
    const nombre = (fields[2] || "").trim();
    const situacion = (fields[3] || "").trim();

    if (!rfc || !nombre || !situacion) continue;

    const fechaPresuntos = extractDate(fields[5]) || null;
    const fechaDesvirtuados = extractDate(fields[9]) || null;
    const fechaDefinitivos = extractDate(fields[13]) || null;
    const fechaSentencia = extractDate(fields[17]) || null;

    records.push({
      numero: isNaN(numero) ? 0 : numero,
      rfc,
      nombreContribuyente: nombre,
      situacion: normalizeSituacion(situacion),
      fechaPresuntos,
      fechaDesvirtuados,
      fechaDefinitivos,
      fechaSentencia,
    });
  }

  return records;
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      fields.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

function extractDate(field: string | undefined): string | null {
  if (!field) return null;
  const trimmed = field.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/(\d{2}\/\d{2}\/\d{4})/);
  return match ? match[1] : trimmed || null;
}

function normalizeSituacion(sit: string): string {
  const lower = sit.toLowerCase().trim();
  if (lower.includes("presunt")) return "Presunto";
  if (lower.includes("definitiv")) return "Definitivo";
  if (lower.includes("desvirtua")) return "Desvirtuado";
  if (lower.includes("sentencia")) return "Sentencia Favorable";
  return sit;
}

export async function importSat69b() {
  console.log("[69b] Starting SAT 69-B import...");

  const pool = new pg.Pool({ connectionString: process.env.DB_URL! });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sat_69b (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        numero INTEGER,
        rfc TEXT NOT NULL,
        nombre_contribuyente TEXT NOT NULL,
        situacion TEXT NOT NULL,
        fecha_publicacion_presuntos TEXT,
        fecha_publicacion_desvirtuados TEXT,
        fecha_publicacion_definitivos TEXT,
        fecha_publicacion_sentencia TEXT,
        nombre_norm TEXT,
        imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await pool.query(`ALTER TABLE sat_69b ADD COLUMN IF NOT EXISTS nombre_norm TEXT`);
    await pool.query(`UPDATE sat_69b SET nombre_norm = TRIM(REGEXP_REPLACE(UPPER(REGEXP_REPLACE(nombre_contribuyente, '[^A-Z0-9 ]', '', 'g')), '\\s+', ' ', 'g')) WHERE nombre_norm IS NULL`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_sat_69b_rfc ON sat_69b (rfc)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_sat_69b_nombre ON sat_69b (nombre_contribuyente)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_sat_69b_situacion ON sat_69b (situacion)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_sat_69b_nombre_norm ON sat_69b (nombre_norm)`);

    const { rows: existing } = await pool.query("SELECT COUNT(*) as c FROM sat_69b");
    const existingCount = parseInt(existing[0].c);

    if (existingCount > 10000) {
      console.log(`[69b] Already have ${existingCount.toLocaleString()} records, skipping import`);
      return;
    }

    try {
      console.log("[69b] Downloading 69-B list from SAT...");
      execFileSync("curl", ["-sL", "-o", LOCAL_CSV_PATH, SAT_69B_CSV_URL, "--max-time", "120"], { stdio: "pipe" });
      console.log("[69b] Downloaded CSV");
    } catch (err: any) {
      console.error("[69b] Failed to download CSV:", err.message);
      return;
    }

    const csvContent = readFileSync(LOCAL_CSV_PATH, "latin1");
    const records = parseSat69bCsv(csvContent);
    console.log(`[69b] Parsed ${records.length.toLocaleString()} records from CSV`);

    if (records.length === 0) {
      console.error("[69b] No records parsed, aborting");
      return;
    }

    if (existingCount > 0) {
      await pool.query("TRUNCATE TABLE sat_69b");
      console.log("[69b] Truncated existing data");
    }

    const batchSize = 500;
    let inserted = 0;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const values: any[] = [];
      const placeholders: string[] = [];

      batch.forEach((r, idx) => {
        const base = idx * 9;
        placeholders.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9})`);
        const nombreNorm = r.nombreContribuyente.toUpperCase().replace(/[^A-Z0-9 ]/g, "").replace(/\s+/g, " ").trim();
        values.push(
          r.numero,
          r.rfc,
          r.nombreContribuyente,
          r.situacion,
          r.fechaPresuntos,
          r.fechaDesvirtuados,
          r.fechaDefinitivos,
          r.fechaSentencia,
          nombreNorm,
        );
      });

      const queryText = "INSERT INTO sat_69b (numero, rfc, nombre_contribuyente, situacion, fecha_publicacion_presuntos, fecha_publicacion_desvirtuados, fecha_publicacion_definitivos, fecha_publicacion_sentencia, nombre_norm) VALUES " + placeholders.join(",");
      await pool.query(queryText, values);
      inserted += batch.length;

      if (inserted % 5000 === 0 || inserted === records.length) {
        console.log(`[69b] Inserted ${inserted.toLocaleString()} / ${records.length.toLocaleString()}`);
      }
    }

    console.log(`[69b] Import complete: ${inserted.toLocaleString()} contribuyentes in lista 69-B`);

    const { rows: stats } = await pool.query(`
      SELECT situacion, COUNT(*) as cnt 
      FROM sat_69b 
      GROUP BY situacion 
      ORDER BY cnt DESC
    `);
    console.log("[69b] Breakdown:", stats.map(s => `${s.situacion}: ${parseInt(s.cnt).toLocaleString()}`).join(", "));

    await refreshEfosMatches(pool);

    try { unlinkSync(LOCAL_CSV_PATH); } catch {}
  } catch (err: any) {
    console.error(`[69b] Error: ${err.message}`);
  } finally {
    await pool.end();
  }
}

export async function insertEfosAsProspectos(pool?: pg.Pool): Promise<void> {
  const ownPool = !pool;
  if (!pool) {
    pool = new pg.Pool({ connectionString: process.env.DB_URL });
  }
  try {
    console.log("[efos-insert] Checking for EFOS contribuyentes to insert as prospectos...");

    await pool.query(`ALTER TABLE empresas_prospectos ADD COLUMN IF NOT EXISTS is_efos BOOLEAN DEFAULT false`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_empresas_prospectos_is_efos ON empresas_prospectos (is_efos) WHERE is_efos = true`);

    const updateResult = await pool.query(`
      UPDATE empresas_prospectos SET is_efos = true
      WHERE id IN (SELECT prospecto_id FROM efos_prospectos_match)
      AND (is_efos IS NULL OR is_efos = false)
    `);
    if (updateResult.rowCount && updateResult.rowCount > 0) {
      console.log(`[efos-insert] Marked ${updateResult.rowCount} existing matching prospectos as is_efos = true`);
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS efos_prospectos_match (
        prospecto_id UUID NOT NULL,
        efos_rfc VARCHAR NOT NULL,
        efos_situacion VARCHAR NOT NULL,
        efos_nombre VARCHAR NOT NULL,
        match_field VARCHAR NOT NULL DEFAULT 'razon_social',
        PRIMARY KEY (prospecto_id, efos_rfc)
      )
    `);

    const matchedRfcs = new Set<string>();
    const { rows: existingMatches } = await pool.query(
      `SELECT DISTINCT efos_rfc FROM efos_prospectos_match`
    );
    for (const m of existingMatches) matchedRfcs.add(m.efos_rfc);

    const { rows: existingRfcs } = await pool.query(
      `SELECT DISTINCT rfc FROM empresas_prospectos WHERE rfc IS NOT NULL AND rfc != ''`
    );
    const prospectoRfcSet = new Set<string>();
    for (const r of existingRfcs) prospectoRfcSet.add(r.rfc);

    const { rows: allEfos } = await pool.query(
      `SELECT rfc, nombre_contribuyente, situacion FROM sat_69b ORDER BY numero`
    );

    const toInsert = allEfos.filter(e => !matchedRfcs.has(e.rfc) && !prospectoRfcSet.has(e.rfc));

    if (toInsert.length === 0) {
      console.log("[efos-insert] All EFOS already present as prospectos, nothing to insert");
      return;
    }

    const { rows: satOficinas } = await pool.query(`SELECT DISTINCT estado, latitud, longitud FROM sat_oficinas WHERE estado IS NOT NULL AND latitud IS NOT NULL`);
    const oficinas = satOficinas.map(o => ({
      estado: o.estado as string,
      lat: Number(o.latitud),
      lng: Number(o.longitud),
    }));
    const hasOficinas = oficinas.length > 0;
    if (!hasOficinas) {
      console.log("[efos-insert] Warning: no SAT oficinas found — EFOS will be inserted without geographic data");
    }

    console.log(`[efos-insert] Inserting ${toInsert.length.toLocaleString()} EFOS contribuyentes as prospectos...`);

    const batchSize = 500;
    let inserted = 0;
    const colsWithGeo = 8;
    const colsNoGeo = 5;

    for (let i = 0; i < toInsert.length; i += batchSize) {
      const batch = toInsert.slice(i, i + batchSize);
      const values: any[] = [];
      const placeholders: string[] = [];

      batch.forEach((r, idx) => {
        if (hasOficinas) {
          const base = idx * colsWithGeo;
          placeholders.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8})`);
          const oficina = oficinas[(i + idx) % oficinas.length];
          const jitterLat = (Math.random() - 0.5) * 0.3;
          const jitterLng = (Math.random() - 0.5) * 0.3;
          values.push(
            r.nombre_contribuyente,
            r.nombre_contribuyente,
            r.rfc,
            true,
            'nuevo',
            oficina.estado,
            oficina.lat + jitterLat,
            oficina.lng + jitterLng,
          );
        } else {
          const base = idx * colsNoGeo;
          placeholders.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`);
          values.push(
            r.nombre_contribuyente,
            r.nombre_contribuyente,
            r.rfc,
            true,
            'nuevo',
          );
        }
      });

      const queryText = hasOficinas
        ? "INSERT INTO empresas_prospectos (nombre_comercial, razon_social, rfc, is_efos, stage, estado, latitud, longitud) VALUES " + placeholders.join(",") + " ON CONFLICT DO NOTHING"
        : "INSERT INTO empresas_prospectos (nombre_comercial, razon_social, rfc, is_efos, stage) VALUES " + placeholders.join(",") + " ON CONFLICT DO NOTHING";

      const insertResult = await pool.query(queryText, values);
      inserted += insertResult.rowCount ?? 0;

      if (inserted % 5000 === 0 || inserted === toInsert.length) {
        console.log(`[efos-insert] Inserted ${inserted.toLocaleString()} / ${toInsert.length.toLocaleString()}`);
      }
    }

    console.log(`[efos-insert] Done: ${inserted.toLocaleString()} EFOS contribuyentes added as prospectos`);

    try {
      const existsResult = await pool.query(`SELECT to_regclass('mv_prospectos_global_stats') as exists`);
      if (existsResult.rows[0].exists) {
        await pool.query(`REFRESH MATERIALIZED VIEW mv_prospectos_global_stats`);
        console.log("[efos-insert] Global stats MV refreshed");
      }
    } catch (mvErr: any) {
      console.error(`[efos-insert] MV refresh error: ${mvErr.message}`);
    }
  } catch (err: any) {
    console.error(`[efos-insert] Error: ${err.message}`);
  } finally {
    if (ownPool && pool) await pool.end();
  }
}

export async function refreshEfosMatches(pool?: pg.Pool): Promise<void> {
  const ownPool = !pool;
  if (!pool) {
    pool = new pg.Pool({ connectionString: process.env.DB_URL });
  }
  try {
    console.log("[efos-match] Refreshing EFOS prospectos match table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS efos_prospectos_match (
        prospecto_id UUID NOT NULL,
        efos_rfc VARCHAR NOT NULL,
        efos_situacion VARCHAR NOT NULL,
        efos_nombre VARCHAR NOT NULL,
        match_field VARCHAR NOT NULL DEFAULT 'razon_social',
        PRIMARY KEY (prospecto_id, efos_rfc)
      )
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_efos_pm_prospecto ON efos_prospectos_match (prospecto_id)`);

    await pool.query(`TRUNCATE efos_prospectos_match`);

    await pool.query(`
      INSERT INTO efos_prospectos_match (prospecto_id, efos_rfc, efos_situacion, efos_nombre, match_field)
      SELECT ep.id, s.rfc, s.situacion, s.nombre_contribuyente, 'razon_social'
      FROM empresas_prospectos ep
      JOIN sat_69b s ON s.nombre_norm = UPPER(REGEXP_REPLACE(ep.razon_social, '[^A-Za-z0-9 ]', '', 'g'))
      ON CONFLICT DO NOTHING
    `);
    await pool.query(`
      INSERT INTO efos_prospectos_match (prospecto_id, efos_rfc, efos_situacion, efos_nombre, match_field)
      SELECT ep.id, s.rfc, s.situacion, s.nombre_contribuyente, 'nombre_comercial'
      FROM empresas_prospectos ep
      JOIN sat_69b s ON s.nombre_norm = UPPER(REGEXP_REPLACE(ep.nombre_comercial, '[^A-Za-z0-9 ]', '', 'g'))
      ON CONFLICT DO NOTHING
    `);
    await pool.query(`
      INSERT INTO efos_prospectos_match (prospecto_id, efos_rfc, efos_situacion, efos_nombre, match_field)
      SELECT ep.id, s.rfc, s.situacion, s.nombre_contribuyente, 'rfc'
      FROM empresas_prospectos ep
      JOIN sat_69b s ON s.rfc = ep.rfc AND ep.rfc IS NOT NULL AND ep.rfc != ''
      ON CONFLICT DO NOTHING
    `);

    await pool.query(`
      UPDATE empresas_prospectos SET is_efos = true
      WHERE id IN (SELECT DISTINCT prospecto_id FROM efos_prospectos_match)
      AND (is_efos IS NULL OR is_efos = false)
    `);

    const countResult = await pool.query(`SELECT COUNT(*) as cnt FROM efos_prospectos_match`);
    const isEfosCount = await pool.query(`SELECT COUNT(*) as cnt FROM empresas_prospectos WHERE is_efos = true`);
    console.log(`[efos-match] Matched ${countResult.rows[0].cnt} prospectos with EFOS 69-B list (${isEfosCount.rows[0].cnt} marked is_efos)`);
  } catch (err: any) {
    console.error(`[efos-match] Error: ${err.message}`);
  } finally {
    if (ownPool && pool) await pool.end();
  }
}
