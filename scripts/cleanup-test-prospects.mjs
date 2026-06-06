/**
 * Purge CRM test data from the prospect pipeline.
 *
 * Usage:
 *   node --env-file=.env scripts/cleanup-test-prospects.mjs                    # DRY RUN — lists what would be removed
 *   node --env-file=.env scripts/cleanup-test-prospects.mjs --confirm          # delete tagged test prospects
 *   node --env-file=.env scripts/cleanup-test-prospects.mjs --reset-claims-for someone@email.com --confirm
 *
 * What it does:
 *   1. Deletes every prospect tagged TEST-DATA (import_batch_id = 'TEST-DATA',
 *      created via the "🧪 Prospecto de prueba" checkbox). Their interaction
 *      rows cascade-delete automatically.
 *   2. With --reset-claims-for <email>: returns every prospect that account
 *      claimed back to the unassigned pool (partner_id -> NULL) and removes the
 *      audit interactions that account wrote. Use this to undo a tester's
 *      claim/stage activity on REAL prospects without deleting them.
 *
 * Reads DATABASE_URL (or DB_URL) from .env. Dry-run unless --confirm is passed.
 */
import pg from "pg";

const args = process.argv.slice(2);
const CONFIRM = args.includes("--confirm");
const resetIdx = args.indexOf("--reset-claims-for");
const resetEmail = resetIdx !== -1 ? args[resetIdx + 1] : null;

const connectionString = process.env.DATABASE_URL || process.env.DB_URL;
if (!connectionString) {
  console.error("ERROR: DATABASE_URL (or DB_URL) not set. Run with: node --env-file=.env scripts/cleanup-test-prospects.mjs");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });

const TAG = "TEST-DATA";

async function main() {
  console.log(`\n${CONFIRM ? "🔴 LIVE RUN (deleting)" : "🟡 DRY RUN (no changes — add --confirm to execute)"}\n`);

  // 1) Tagged test prospects
  const tagged = await pool.query(
    `SELECT id, nombre_comercial, stage, created_at FROM empresas_prospectos WHERE import_batch_id = $1 ORDER BY created_at DESC`,
    [TAG]
  );
  console.log(`Tagged test prospects (import_batch_id = '${TAG}'): ${tagged.rowCount}`);
  for (const r of tagged.rows) {
    console.log(`   • ${r.nombre_comercial}  [${r.stage}]  ${new Date(r.created_at).toISOString().slice(0, 10)}`);
  }

  // 2) Optional: undo claims by a specific account
  let resetCount = 0;
  let acct = null;
  if (resetEmail) {
    const u = await pool.query(
      `SELECT a.id FROM accounts a JOIN users u ON u.id = a.id WHERE lower(u.email) = lower($1) LIMIT 1`,
      [resetEmail]
    );
    if (u.rowCount === 0) {
      console.log(`\n⚠️  --reset-claims-for: no account found for ${resetEmail} — skipping claim reset.`);
    } else {
      acct = u.rows[0].id;
      const owned = await pool.query(
        `SELECT count(*)::int n FROM empresas_prospectos WHERE partner_id = $1 AND import_batch_id IS DISTINCT FROM $2`,
        [acct, TAG]
      );
      resetCount = owned.rows[0].n;
      console.log(`\nReal prospects claimed by ${resetEmail} to release (partner_id -> NULL): ${resetCount}`);
    }
  }

  if (!CONFIRM) {
    console.log(`\nNothing changed. Re-run with --confirm to apply.\n`);
    await pool.end();
    return;
  }

  // Execute
  const del = await pool.query(`DELETE FROM empresas_prospectos WHERE import_batch_id = $1 RETURNING id`, [TAG]);
  console.log(`\n✅ Deleted ${del.rowCount} tagged test prospect(s) (their interactions cascaded).`);

  if (acct) {
    await pool.query(`DELETE FROM interacciones_prospectos WHERE user_id = $1`, [acct]);
    const upd = await pool.query(
      `UPDATE empresas_prospectos SET partner_id = NULL, updated_at = now() WHERE partner_id = $1 RETURNING id`,
      [acct]
    );
    console.log(`✅ Released ${upd.rowCount} prospect(s) back to the pool and cleared that account's interactions.`);
  }

  console.log(`\nDone.\n`);
  await pool.end();
}

main().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
