import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

const dbUrl = process.env.DB_URL;
if (!dbUrl) {
  console.error("[FATAL] DB_URL must be set. Did you forget to provision a database?");
  setTimeout(() => process.exit(1), 1000);
}

export const pool = new Pool({
  connectionString: dbUrl,
  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 30_000,
});

pool.on("error", (err) => {
  console.error("[db] Idle pool client error:", err.message);
});

export const db = drizzle(pool, { schema });

function gracefulShutdown(signal: string) {
  console.log(`[db] ${signal} received, closing pool...`);
  pool.end().then(() => {
    console.log("[db] Pool closed");
    process.exit(0);
  }).catch((err) => {
    console.error("[db] Error closing pool:", err.message);
    process.exit(1);
  });
}

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
