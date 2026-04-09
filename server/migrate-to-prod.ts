import pg from "pg";
import fs from "fs";
const { Pool } = pg;

const PROD_URL = "https://www.ceduverse.org";
const BATCH_SIZE = 50;
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || process.env.SESSION_SECRET!;
const CHECKPOINT_FILE = "/tmp/migrate-checkpoint.txt";

if (!ADMIN_API_KEY) {
  console.error("ADMIN_API_KEY or SESSION_SECRET not set");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DB_URL!, max: 1 });

function readCheckpoint(): string {
  try {
    return fs.readFileSync(CHECKPOINT_FILE, "utf8").trim();
  } catch {
    return "00000000-0000-0000-0000-000000000000";
  }
}

function writeCheckpoint(id: string) {
  fs.writeFileSync(CHECKPOINT_FILE, id);
}

async function sendBatch(rows: any[]): Promise<boolean> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      const response = await fetch(`${PROD_URL}/api/admin/bulk-migrate-prospectos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-migrate-key": ADMIN_API_KEY,
        },
        body: JSON.stringify({ rows }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!response.ok) {
        const t = await response.text();
        if (attempt < 2) { await new Promise(r => setTimeout(r, 1000)); continue; }
        return false;
      }
      await response.json();
      return true;
    } catch (err: any) {
      if (attempt < 2) await new Promise(r => setTimeout(r, 1000));
      else return false;
    }
  }
  return false;
}

async function migrate() {
  const countRes = await pool.query("SELECT COUNT(*) as total FROM empresas_prospectos WHERE plan_recomendado IS NOT NULL AND lead_score IS NOT NULL");
  const total = parseInt(countRes.rows[0].total);
  
  let lastId = readCheckpoint();
  const startFromScratch = lastId === "00000000-0000-0000-0000-000000000000";
  console.log(`Total: ${total.toLocaleString()} | Resume from: ${startFromScratch ? "start" : lastId.slice(0,8)}`);

  let migrated = 0;
  let errors = 0;
  const startTime = Date.now();

  while (true) {
    const res = await pool.query(
      `SELECT id, denue_id, nombre_comercial, razon_social, actividad_economica, codigo_scian,
       tipo_establecimiento, estrato_personal, empleados_min, empleados_max, telefono,
       correo_electronico, sitio_web, tipo_vialidad, calle, num_exterior, num_interior,
       colonia, codigo_postal, municipio, estado, latitud, longitud, lead_score,
       score_desglose, stage, partner_id, noms_aplicables, fecha_alta, import_batch_id,
       zona_comercial, prioridad, empleados_estimados, potencial_aportacion_mensual,
       nivel_riesgo, grupo_sector, plan_recomendado, direccion_completa
       FROM empresas_prospectos WHERE id > $1 AND plan_recomendado IS NOT NULL AND lead_score IS NOT NULL ORDER BY id LIMIT $2`,
      [lastId, BATCH_SIZE]
    );

    if (res.rows.length === 0) break;

    const rows = res.rows.map(r => ({
      ...r,
      score_desglose: r.score_desglose || null,
      noms_aplicables: r.noms_aplicables || null,
      fecha_alta: r.fecha_alta ? new Date(r.fecha_alta).toISOString() : null,
    }));

    const ok = await sendBatch(rows);
    if (!ok) {
      errors++;
      if (errors > 50) { console.error("Too many errors"); break; }
      await new Promise(r => setTimeout(r, 3000));
      continue;
    }

    lastId = rows[rows.length - 1].id;
    writeCheckpoint(lastId);
    migrated += rows.length;

    if (migrated % 500 === 0 || migrated < 200) {
      const elapsed = (Date.now() - startTime) / 1000;
      const rate = migrated / elapsed;
      const eta = ((total - migrated) / rate / 60).toFixed(1);
      const pct = ((migrated / total) * 100).toFixed(2);
      process.stdout.write(`\r${pct}% | ${migrated.toLocaleString()} / ${total.toLocaleString()} | ${rate.toFixed(0)}/s | ETA: ${eta}m | err: ${errors}    `);
    }
  }

  console.log(`\nDone: ${migrated.toLocaleString()} migrated, ${errors} errors`);
  await pool.end();
}

process.on("uncaughtException", (err) => console.error(`Uncaught: ${err.message}`));
process.on("unhandledRejection", (err: any) => console.error(`Unhandled: ${err?.message || err}`));

migrate().catch(e => { console.error(e); process.exit(1); });
