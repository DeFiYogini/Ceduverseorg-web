#!/bin/bash
TOTAL_GOAL=781773
CHUNK_ROWS=5000

echo "Starting chunked migration..."
echo "Each chunk: $CHUNK_ROWS rows"

ITERATION=0
while true; do
  ITERATION=$((ITERATION + 1))
  
  CHECKPOINT=$(cat /tmp/migrate-checkpoint.txt 2>/dev/null || echo "00000000-0000-0000-0000-000000000000")
  
  REMAINING=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM empresas_prospectos WHERE id > '$CHECKPOINT' AND plan_recomendado IS NOT NULL AND lead_score IS NOT NULL" 2>/dev/null | tr -d ' ')
  
  if [ -z "$REMAINING" ] || [ "$REMAINING" = "0" ]; then
    echo "Migration complete!"
    break
  fi
  
  echo "Chunk $ITERATION: $REMAINING rows remaining, checkpoint: ${CHECKPOINT:0:8}..."
  
  timeout 120 npx tsx server/migrate-to-prod.ts 2>&1 | tail -5
  
  EXIT_CODE=$?
  
  NEW_CHECKPOINT=$(cat /tmp/migrate-checkpoint.txt 2>/dev/null || echo "")
  if [ "$NEW_CHECKPOINT" = "$CHECKPOINT" ]; then
    echo "No progress made, waiting 10s..."
    sleep 10
  fi
  
  sleep 2
done

echo "All done!"
