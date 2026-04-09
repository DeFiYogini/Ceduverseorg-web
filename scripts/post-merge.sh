#!/bin/bash
set -e
npm install
npm run db:push -- --force
psql "$DATABASE_URL" -c "CREATE SEQUENCE IF NOT EXISTS membership_seq START WITH 1;" 2>&1 || echo "[post-merge] membership_seq already exists"
psql "$DATABASE_URL" -c "CREATE INDEX IF NOT EXISTS idx_ep_plan_recomendado ON empresas_prospectos (plan_recomendado) WHERE plan_recomendado IS NOT NULL;" 2>&1 || true
psql "$DATABASE_URL" -c "CREATE INDEX IF NOT EXISTS idx_ep_lead_score ON empresas_prospectos (lead_score DESC);" 2>&1 || true
psql "$DATABASE_URL" -c "CREATE INDEX IF NOT EXISTS idx_ep_estado ON empresas_prospectos (estado);" 2>&1 || true
psql "$DATABASE_URL" -c "
CREATE TABLE IF NOT EXISTS efos_prospectos_match (
  prospecto_id UUID NOT NULL,
  efos_rfc VARCHAR NOT NULL,
  efos_situacion VARCHAR NOT NULL,
  efos_nombre VARCHAR NOT NULL,
  match_field VARCHAR NOT NULL DEFAULT 'razon_social',
  PRIMARY KEY (prospecto_id, efos_rfc)
);
CREATE INDEX IF NOT EXISTS idx_efos_pm_prospecto ON efos_prospectos_match (prospecto_id);
" 2>&1 || echo "[post-merge] efos_prospectos_match table creation skipped"
psql "$DATABASE_URL" -c "
DO \$\$
BEGIN
  IF (SELECT COUNT(*) FROM empresas_prospectos) > 1000 THEN
    EXECUTE 'CREATE MATERIALIZED VIEW IF NOT EXISTS mv_prosp_municipios AS SELECT DISTINCT estado, municipio FROM empresas_prospectos WHERE municipio IS NOT NULL AND plan_recomendado IS NOT NULL ORDER BY estado, municipio';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_mv_prosp_mun_estado ON mv_prosp_municipios (estado)';
    EXECUTE 'CREATE MATERIALIZED VIEW IF NOT EXISTS mv_prosp_sectores AS SELECT DISTINCT codigo_scian, actividad_economica FROM empresas_prospectos WHERE codigo_scian IS NOT NULL AND plan_recomendado IS NOT NULL ORDER BY codigo_scian LIMIT 200';
    IF NOT EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'mv_prospectos_global_stats') THEN
      EXECUTE 'CREATE MATERIALIZED VIEW mv_prospectos_global_stats AS
        SELECT COUNT(*) as total, ROUND(AVG(empleados_estimados)) as avg_empleados,
        COUNT(*) FILTER (WHERE correo_electronico IS NOT NULL AND correo_electronico != '''') as con_correo,
        COUNT(*) FILTER (WHERE telefono IS NOT NULL AND telefono != '''') as con_telefono,
        ROUND(COALESCE(SUM(potencial_aportacion_mensual), 0)::numeric, 0) as valor_mercado,
        COUNT(*) FILTER (WHERE stage != ''nuevo'') as trabajados,
        COUNT(*) FILTER (WHERE stage = ''cliente'') as clientes,
        COUNT(*) FILTER (WHERE prioridad = ''alta'') as prio_alta,
        COUNT(*) FILTER (WHERE prioridad = ''media'') as prio_media,
        COUNT(*) FILTER (WHERE prioridad = ''baja'') as prio_baja,
        COUNT(*) FILTER (WHERE plan_recomendado IS NOT NULL) as enriquecidas,
        ROUND(AVG(lead_score)) as avg_score,
        COUNT(*) FILTER (WHERE stage = ''nuevo'') as stage_nuevo,
        COUNT(*) FILTER (WHERE stage = ''contactado'') as stage_contactado,
        COUNT(*) FILTER (WHERE stage = ''demo'') as stage_demo,
        COUNT(*) FILTER (WHERE stage = ''propuesta'') as stage_propuesta,
        COUNT(*) FILTER (WHERE stage = ''negociacion'') as stage_negociacion,
        COUNT(*) FILTER (WHERE stage = ''cliente'') as stage_cliente
        FROM empresas_prospectos';
    ELSE
      EXECUTE 'REFRESH MATERIALIZED VIEW mv_prospectos_global_stats';
    END IF;
    RAISE NOTICE '[post-merge] Materialized views ensured';
  END IF;
END \$\$;
" 2>&1 || echo "[post-merge] MV creation skipped"
