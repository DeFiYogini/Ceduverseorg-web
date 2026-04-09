#!/bin/bash
set -e

BATCH_SIZE=100
LAST_ID="00000000-0000-0000-0000-000000000000"
MIGRATED=0
ERRORS=0
START=$(date +%s)

TOTAL=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM empresas_prospectos WHERE plan_recomendado IS NOT NULL AND lead_score IS NOT NULL" | tr -d ' ')
echo "Total to migrate: $TOTAL"

while true; do
  ROWS=$(psql "$DB_URL" -t -A -F'|||' -c "
    SELECT id, denue_id, nombre_comercial, razon_social, actividad_economica, codigo_scian,
     tipo_establecimiento, estrato_personal, empleados_min, empleados_max, telefono,
     correo_electronico, sitio_web, tipo_vialidad, calle, num_exterior, num_interior,
     colonia, codigo_postal, municipio, estado, latitud, longitud, lead_score,
     score_desglose, stage, partner_id, noms_aplicables, fecha_alta, import_batch_id,
     zona_comercial, prioridad, empleados_estimados, potencial_aportacion_mensual,
     nivel_riesgo, grupo_sector, plan_recomendado, direccion_completa
     FROM empresas_prospectos 
     WHERE id > '$LAST_ID' AND plan_recomendado IS NOT NULL AND lead_score IS NOT NULL 
     ORDER BY id LIMIT $BATCH_SIZE
  " 2>/dev/null)
  
  if [ -z "$ROWS" ]; then
    echo "No more rows"
    break
  fi

  JSON_ROWS="["
  FIRST=true
  while IFS='|||' read -r id denue_id nombre_comercial razon_social actividad_economica codigo_scian tipo_establecimiento estrato_personal empleados_min empleados_max telefono correo_electronico sitio_web tipo_vialidad calle num_exterior num_interior colonia codigo_postal municipio estado latitud longitud lead_score score_desglose stage partner_id noms_aplicables fecha_alta import_batch_id zona_comercial prioridad empleados_estimados potencial_aportacion_mensual nivel_riesgo grupo_sector plan_recomendado direccion_completa; do
    if [ -z "$id" ]; then continue; fi
    LAST_ID="$id"
    
    if [ "$FIRST" = true ]; then FIRST=false; else JSON_ROWS+=","; fi
    
    # Escape JSON special chars
    nombre_comercial=$(echo "$nombre_comercial" | sed 's/\\/\\\\/g; s/"/\\"/g; s/\t/\\t/g')
    razon_social=$(echo "$razon_social" | sed 's/\\/\\\\/g; s/"/\\"/g; s/\t/\\t/g')
    actividad_economica=$(echo "$actividad_economica" | sed 's/\\/\\\\/g; s/"/\\"/g; s/\t/\\t/g')
    calle=$(echo "$calle" | sed 's/\\/\\\\/g; s/"/\\"/g; s/\t/\\t/g')
    colonia=$(echo "$colonia" | sed 's/\\/\\\\/g; s/"/\\"/g; s/\t/\\t/g')
    direccion_completa=$(echo "$direccion_completa" | sed 's/\\/\\\\/g; s/"/\\"/g; s/\t/\\t/g')
    
    # Build JSON row
    ROW="{\"id\":\"$id\""
    [ -n "$denue_id" ] && ROW+=",\"denue_id\":\"$denue_id\""
    ROW+=",\"nombre_comercial\":\"$nombre_comercial\""
    [ -n "$razon_social" ] && ROW+=",\"razon_social\":\"$razon_social\""
    [ -n "$actividad_economica" ] && ROW+=",\"actividad_economica\":\"$actividad_economica\""
    [ -n "$codigo_scian" ] && ROW+=",\"codigo_scian\":\"$codigo_scian\""
    [ -n "$tipo_establecimiento" ] && ROW+=",\"tipo_establecimiento\":\"$tipo_establecimiento\""
    [ -n "$estrato_personal" ] && ROW+=",\"estrato_personal\":\"$estrato_personal\""
    [ -n "$empleados_min" ] && ROW+=",\"empleados_min\":$empleados_min"
    [ -n "$empleados_max" ] && ROW+=",\"empleados_max\":$empleados_max"
    [ -n "$telefono" ] && ROW+=",\"telefono\":\"$telefono\""
    [ -n "$correo_electronico" ] && ROW+=",\"correo_electronico\":\"$correo_electronico\""
    [ -n "$sitio_web" ] && ROW+=",\"sitio_web\":\"$sitio_web\""
    [ -n "$tipo_vialidad" ] && ROW+=",\"tipo_vialidad\":\"$tipo_vialidad\""
    [ -n "$calle" ] && ROW+=",\"calle\":\"$calle\""
    [ -n "$num_exterior" ] && ROW+=",\"num_exterior\":\"$num_exterior\""
    [ -n "$num_interior" ] && ROW+=",\"num_interior\":\"$num_interior\""
    [ -n "$colonia" ] && ROW+=",\"colonia\":\"$colonia\""
    [ -n "$codigo_postal" ] && ROW+=",\"codigo_postal\":\"$codigo_postal\""
    [ -n "$municipio" ] && ROW+=",\"municipio\":\"$municipio\""
    [ -n "$estado" ] && ROW+=",\"estado\":\"$estado\""
    [ -n "$latitud" ] && ROW+=",\"latitud\":$latitud"
    [ -n "$longitud" ] && ROW+=",\"longitud\":$longitud"
    ROW+=",\"lead_score\":$lead_score"
    [ -n "$score_desglose" ] && ROW+=",\"score_desglose\":$score_desglose"
    ROW+=",\"stage\":\"${stage:-nuevo}\""
    [ -n "$partner_id" ] && ROW+=",\"partner_id\":\"$partner_id\""
    [ -n "$noms_aplicables" ] && ROW+=",\"noms_aplicables\":$(echo "$noms_aplicables" | sed 's/{/["/; s/}/"]/' | sed 's/,/","/g')"
    [ -n "$import_batch_id" ] && ROW+=",\"import_batch_id\":\"$import_batch_id\""
    [ -n "$zona_comercial" ] && ROW+=",\"zona_comercial\":\"$zona_comercial\""
    [ -n "$prioridad" ] && ROW+=",\"prioridad\":\"$prioridad\""
    [ -n "$empleados_estimados" ] && ROW+=",\"empleados_estimados\":$empleados_estimados"
    [ -n "$potencial_aportacion_mensual" ] && ROW+=",\"potencial_aportacion_mensual\":$potencial_aportacion_mensual"
    [ -n "$nivel_riesgo" ] && ROW+=",\"nivel_riesgo\":\"$nivel_riesgo\""
    [ -n "$grupo_sector" ] && ROW+=",\"grupo_sector\":\"$grupo_sector\""
    [ -n "$plan_recomendado" ] && ROW+=",\"plan_recomendado\":\"$plan_recomendado\""
    [ -n "$direccion_completa" ] && ROW+=",\"direccion_completa\":\"$direccion_completa\""
    ROW+="}"
    
    JSON_ROWS+="$ROW"
  done <<< "$ROWS"
  JSON_ROWS+="]"

  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "https://www.ceduverse.org/api/admin/bulk-migrate-prospectos" \
    -H "Content-Type: application/json" \
    -H "x-migrate-key: ${ADMIN_API_KEY:-$SESSION_SECRET}" \
    --max-time 60 \
    -d "{\"rows\":$JSON_ROWS}" 2>/dev/null)
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -1)
  BODY=$(echo "$RESPONSE" | head -1)
  
  if [ "$HTTP_CODE" != "200" ]; then
    ERRORS=$((ERRORS + 1))
    echo "Error $HTTP_CODE: $(echo $BODY | head -c 100)"
    if [ $ERRORS -gt 100 ]; then echo "Too many errors"; break; fi
    sleep 2
    continue
  fi
  
  COUNT=$(echo "$ROWS" | grep -c "." || echo 0)
  MIGRATED=$((MIGRATED + COUNT))
  
  NOW=$(date +%s)
  ELAPSED=$((NOW - START))
  if [ $ELAPSED -gt 0 ]; then
    RATE=$((MIGRATED / ELAPSED))
    REMAINING=$((TOTAL - MIGRATED))
    if [ $RATE -gt 0 ]; then
      ETA=$((REMAINING / RATE / 60))
    else
      ETA=999
    fi
    PCT=$((MIGRATED * 100 / TOTAL))
    echo "$PCT% | $MIGRATED / $TOTAL | ${RATE}/s | ETA: ${ETA}m | err: $ERRORS"
  fi
done

echo "Done: $MIGRATED migrated, $ERRORS errors"
