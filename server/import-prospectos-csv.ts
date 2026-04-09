import { execFile } from "child_process";
import { promisify } from "util";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const execFileAsync = promisify(execFile);

const __esmDirname = typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));
const CSV_GZ_PATH = path.join(__esmDirname, "data", "prospectos_perfilados.csv.gz");
const CSV_PATH = "/tmp/prospectos_perfilados_import.csv";

export async function importProspectosIfNeeded() {
  if (!existsSync(CSV_GZ_PATH)) {
    console.log("[import] No CSV data file found, skipping");
    return;
  }

  const pool = new pg.Pool({ connectionString: process.env.DB_URL! });
  try {
    const { rows } = await pool.query("SELECT COUNT(*) as c FROM empresas_prospectos");
    const count = parseInt(rows[0].c);
    const EXPECTED_MIN = 5_000_000;
    if (count >= EXPECTED_MIN) {
      console.log(`[import] empresas_prospectos has ${count.toLocaleString()} rows (>= ${EXPECTED_MIN.toLocaleString()}), skipping import`);
      await ensureProspectosViews(pool);
      return;
    }

    console.log(`[import] empresas_prospectos has ${count.toLocaleString()} rows (need >= ${EXPECTED_MIN.toLocaleString()}) — importing full dataset...`);
    
    await execFileAsync("sh", ["-c", `gunzip -c "${CSV_GZ_PATH}" > "${CSV_PATH}"`]);
    console.log("[import] Decompressed CSV file");

    if (count > 0) {
      console.log("[import] Truncating existing data...");
      await pool.query("TRUNCATE TABLE empresas_prospectos CASCADE");
    }

    const dbUrl = process.env.DB_URL;
    if (!dbUrl) throw new Error("DB_URL not configured");

    const copyStatement = `\\COPY empresas_prospectos (id,denue_id,nombre_comercial,razon_social,actividad_economica,codigo_scian,tipo_establecimiento,estrato_personal,empleados_min,empleados_max,telefono,correo_electronico,sitio_web,tipo_vialidad,calle,num_exterior,num_interior,colonia,codigo_postal,municipio,estado,latitud,longitud,lead_score,score_desglose,stage,noms_aplicables,import_batch_id,zona_comercial,prioridad,empleados_estimados,potencial_aportacion_mensual,nivel_riesgo,grupo_sector,plan_recomendado,direccion_completa) FROM '${CSV_PATH}' WITH CSV HEADER`;

    console.log("[import] Running COPY command (this may take several minutes for 6M+ rows)...");
    const { stdout } = await execFileAsync("psql", [dbUrl, "-c", copyStatement], {
      timeout: 900000,
    });
    console.log(`[import] ${stdout.trim()}`);

    const { rows: afterRows } = await pool.query("SELECT COUNT(*) as c FROM empresas_prospectos");
    console.log(`[import] Done! Table now has ${parseInt(afterRows[0].c).toLocaleString()} rows`);

    try { const fsModule = await import("fs"); fsModule.unlinkSync(CSV_PATH); } catch {}

    await ensureProspectosViews(pool);
  } catch (err: any) {
    console.error(`[import] Error: ${err.message}`);
  } finally {
    await pool.end();
  }
}

export async function ensureProspectosViews(pool?: pg.Pool) {
  const ownPool = !pool;
  if (!pool) pool = new pg.Pool({ connectionString: process.env.DB_URL! });
  try {
    await pool.query(`CREATE MATERIALIZED VIEW IF NOT EXISTS mv_prosp_municipios AS SELECT DISTINCT estado, municipio FROM empresas_prospectos WHERE municipio IS NOT NULL AND plan_recomendado IS NOT NULL ORDER BY estado, municipio`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_mv_prosp_mun_estado ON mv_prosp_municipios (estado)`);
    await pool.query(`CREATE MATERIALIZED VIEW IF NOT EXISTS mv_prosp_sectores AS SELECT DISTINCT codigo_scian, actividad_economica FROM empresas_prospectos WHERE codigo_scian IS NOT NULL AND plan_recomendado IS NOT NULL ORDER BY codigo_scian LIMIT 200`);
    await refreshGlobalStats(pool);
    console.log("[import] Materialized views ensured");
  } catch (err: any) {
    console.error(`[import] MV error: ${err.message}`);
  } finally {
    if (ownPool) await pool.end();
  }
}

export async function refreshGlobalStats(pool: pg.Pool) {
  try {
    const { rows } = await pool.query(`SELECT COUNT(*) as c FROM information_schema.tables WHERE table_name = 'mv_prospectos_global_stats' AND table_type = 'VIEW'`);
    const existsResult = await pool.query(`SELECT to_regclass('mv_prospectos_global_stats') as exists`);
    if (existsResult.rows[0].exists) {
      await pool.query(`REFRESH MATERIALIZED VIEW mv_prospectos_global_stats`);
      console.log("[import] Global stats MV refreshed");
    } else {
      await pool.query(`
        CREATE MATERIALIZED VIEW mv_prospectos_global_stats AS
        SELECT 
          COUNT(*) as total,
          ROUND(AVG(empleados_estimados)) as avg_empleados,
          COUNT(*) FILTER (WHERE correo_electronico IS NOT NULL AND correo_electronico != '') as con_correo,
          COUNT(*) FILTER (WHERE telefono IS NOT NULL AND telefono != '') as con_telefono,
          ROUND(COALESCE(SUM(potencial_aportacion_mensual), 0)::numeric, 0) as valor_mercado,
          COUNT(*) FILTER (WHERE stage != 'nuevo') as trabajados,
          COUNT(*) FILTER (WHERE stage = 'cliente') as clientes,
          COUNT(*) FILTER (WHERE prioridad = 'alta') as prio_alta,
          COUNT(*) FILTER (WHERE prioridad = 'media') as prio_media,
          COUNT(*) FILTER (WHERE prioridad = 'baja') as prio_baja,
          COUNT(*) FILTER (WHERE plan_recomendado IS NOT NULL) as enriquecidas,
          ROUND(AVG(lead_score)) as avg_score,
          COUNT(*) FILTER (WHERE stage = 'nuevo') as stage_nuevo,
          COUNT(*) FILTER (WHERE stage = 'contactado') as stage_contactado,
          COUNT(*) FILTER (WHERE stage = 'demo') as stage_demo,
          COUNT(*) FILTER (WHERE stage = 'propuesta') as stage_propuesta,
          COUNT(*) FILTER (WHERE stage = 'negociacion') as stage_negociacion,
          COUNT(*) FILTER (WHERE stage = 'cliente') as stage_cliente
        FROM empresas_prospectos
      `);
      console.log("[import] Global stats MV created");
    }
  } catch (err: any) {
    console.error(`[import] Global stats MV error: ${err.message}`);
  }
}
