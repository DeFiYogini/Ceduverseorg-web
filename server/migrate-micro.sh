#!/bin/bash
BATCH=200
MIGRATED=0

LAST_ID=$(cat /tmp/migrate-checkpoint.txt 2>/dev/null || echo "00000000-0000-0000-0000-000000000000")
echo "Checkpoint: ${LAST_ID:0:8}"

psql "$DB_URL" -t -A -c "
  SELECT json_build_object('rows', json_agg(row_to_json(t))) FROM (
    SELECT id, denue_id, nombre_comercial, razon_social, actividad_economica, codigo_scian,
     tipo_establecimiento, estrato_personal, empleados_min, empleados_max, telefono,
     correo_electronico, sitio_web, tipo_vialidad, calle, num_exterior, num_interior,
     colonia, codigo_postal, municipio, estado, latitud, longitud, lead_score,
     score_desglose, stage, NULL as partner_id, noms_aplicables, import_batch_id,
     zona_comercial, prioridad, empleados_estimados, potencial_aportacion_mensual,
     nivel_riesgo, grupo_sector, plan_recomendado, direccion_completa
     FROM empresas_prospectos 
     WHERE id > '$LAST_ID' AND plan_recomendado IS NOT NULL AND lead_score IS NOT NULL 
     ORDER BY id LIMIT $BATCH
  ) t
" > /tmp/migrate-batch.json 2>/dev/null

INFO=$(node -e "
  const fs=require('fs');
  try {
    const d=JSON.parse(fs.readFileSync('/tmp/migrate-batch.json','utf8'));
    if(!d.rows||d.rows.length===0){process.exit(1)}
    console.log(d.rows.length);
    console.log(d.rows[d.rows.length-1].id);
  } catch(e){process.exit(1)}
" 2>/dev/null)

if [ $? -ne 0 ]; then
  echo "No more rows!"
  exit 0
fi

COUNT=$(echo "$INFO" | head -1)
NEW_LAST=$(echo "$INFO" | tail -1)

HTTP_CODE=$(curl -s -o /tmp/migrate-response.txt -w "%{http_code}" \
  -X POST "https://www.ceduverse.org/api/admin/bulk-migrate-prospectos" \
  -H "Content-Type: application/json" \
  -H "x-migrate-key: ${ADMIN_API_KEY:-$SESSION_SECRET}" \
  --max-time 60 \
  -d @/tmp/migrate-batch.json 2>/dev/null)

if [ "$HTTP_CODE" = "200" ]; then
  echo "$NEW_LAST" > /tmp/migrate-checkpoint.txt
  echo "OK: $COUNT rows, last: ${NEW_LAST:0:8}"
else
  echo "ERR $HTTP_CODE: $(cat /tmp/migrate-response.txt 2>/dev/null | head -c 100)"
  exit 1
fi
