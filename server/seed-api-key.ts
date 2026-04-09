import { db } from "./db";
import { apiKeys } from "@shared/schema";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { eq, and } from "drizzle-orm";

export async function seedInitialApiKey() {
  const [existing] = await db.select().from(apiKeys)
    .where(and(eq(apiKeys.name, "mecorrieron-production"), eq(apiKeys.isActive, true)));

  if (existing) {
    console.log(`[seed-api-key] API key 'mecorrieron-production' already exists (prefix: ${existing.keyPrefix}). Skipping.`);
    return;
  }

  const rawKey = `cdv_${crypto.randomBytes(32).toString("hex")}`;
  const keyHash = await bcrypt.hash(rawKey, 10);
  const keyPrefix = rawKey.slice(0, 8);

  await db.insert(apiKeys).values({
    name: "mecorrieron-production",
    keyHash,
    keyPrefix,
    owner: "MeCorrieron.mx",
    isActive: true,
    allowedOrigins: ["*"],
    rateLimitPerMinute: 120,
    rateLimitPerDay: 50000,
  });

  console.log("=".repeat(60));
  console.log("[seed-api-key] API KEY GENERADA");
  console.log(`[seed-api-key] Raw Key: ${rawKey}`);
  console.log(`[seed-api-key] Key Prefix: ${keyPrefix}`);
  console.log("[seed-api-key] GUARDA ESTA KEY - NO SE MOSTRARÁ DE NUEVO");
  console.log("=".repeat(60));
}
