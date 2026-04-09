#!/bin/bash
BATCH_SIZE=50
CHECKPOINT_FILE="/tmp/migrate-checkpoint.txt"
ERRORS=0
MAX_ERRORS=100
MIGRATED=0
START=$(date +%s)

TOTAL=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM empresas_prospectos WHERE plan_recomendado IS NOT NULL AND lead_score IS NOT NULL" | tr -d ' ')

LAST_ID=$(cat "$CHECKPOINT_FILE" 2>/dev/null || echo "00000000-0000-0000-0000-000000000000")
echo "Total: $TOTAL | Resuming from: ${LAST_ID:0:8}"

while true; do
  psql "$DB_URL" -t -A -c "
    SELECT json_build_object('rows', json_agg(row_to_json(t))) FROM (
      SELECT id, denue_id, nombre_comercial, razon_social, actividad_economica, codigo_scian,
       tipo_establecimiento, estrato_personal, empleados_min, empleados_max, telefono,
       correo_electronico, sitio_web, tipo_vialidad, calle, num_exterior, num_interior,
       colonia, codigo_postal, municipio, estado, latitud, longitud, lead_score,
       score_desglose, stage, partner_id, noms_aplicables, import_batch_id,
       zona_comercial, prioridad, empleados_estimados, potencial_aportacion_mensual,
       nivel_riesgo, grupo_sector, plan_recomendado, direccion_completa
       FROM empresas_prospectos 
       WHERE id > '$LAST_ID' AND plan_recomendado IS NOT NULL AND lead_score IS NOT NULL 
       ORDER BY id LIMIT $BATCH_SIZE
    ) t
  " > /tmp/migrate-batch.json 2>/dev/null

  BATCH_INFO=$(node -e "
    const fs=require('fs');
    try {
      const d=JSON.parse(fs.readFileSync('/tmp/migrate-batch.json','utf8'));
      const rows=d.rows;
      if(!rows||rows.length===0){process.exit(1)}
      console.log(rows.length);
      console.log(rows[rows.length-1].id);
    } catch(e){process.exit(1)}
  " 2>/dev/null)

  if [ $? -ne 0 ] || [ -z "$BATCH_INFO" ]; then
    echo "Done! No more rows."
    break
  fi

  COUNT=$(echo "$BATCH_INFO" | head -1)
  NEW_LAST=$(echo "$BATCH_INFO" | tail -1)

  HTTP_CODE=$(curl -s -o /tmp/migrate-response.txt -w "%{http_code}" \
    -X POST "https://www.ceduverse.org/api/admin/bulk-migrate-prospectos" \
    -H "Content-Type: application/json" \
    -H "x-migrate-key: ${ADMIN_API_KEY:-$SESSION_SECRET}" \
    --max-time 30 \
    -d @/tmp/migrate-batch.json 2>/dev/null)

  if [ "$HTTP_CODE" != "200" ]; then
    ERRORS=$((ERRORS + 1))
    RESP=$(cat /tmp/migrate-response.txt 2>/dev/null | head -c 100)
    echo "ERR $HTTP_CODE: $RESP (total errors: $ERRORS)"
    if [ $ERRORS -ge $MAX_ERRORS ]; then
      echo "Too many errors, stopping."
      break
    fi
    sleep 2
    continue
  fi

  LAST_ID="$NEW_LAST"
  echo "$LAST_ID" > "$CHECKPOINT_FILE"
  MIGRATED=$((MIGRATED + COUNT))

  NOW=$(date +%s)
  ELAPSED=$((NOW - START))
  if [ $ELAPSED -gt 0 ] && [ $((MIGRATED % 500)) -lt $BATCH_SIZE ]; then
    RATE=$((MIGRATED / ELAPSED))
    if [ $RATE -gt 0 ]; then
      REMAINING=$((TOTAL - MIGRATED))
      ETA=$((REMAINING / RATE / 60))
    else
      ETA=999
    fi
    PCT=$((MIGRATED * 100 / TOTAL))
    echo "$PCT% | $MIGRATED / $TOTAL | ${RATE}/s | ETA: ${ETA}m | err: $ERRORS"
  fi
done

echo "Finished: $MIGRATED rows, $ERRORS errors"
