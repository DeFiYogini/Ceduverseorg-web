import { db } from "./db";
import { storeProducts, storeStock, storeReferralCodes } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function seedStoreProducts() {
  const existingProducts = await db.select({ id: storeProducts.id }).from(storeProducts).limit(1);
  if (existingProducts.length === 0) {
    const [vault] = await db.insert(storeProducts).values({
      slug: "vault_kit",
      name: "Ceduverse Vault Kit — Black Edition",
      description: "Tarjeta metálica acero inoxidable sin chip bancario — cold storage exclusivo. Grid grabable para frase semilla, QR→NFT Polygon, Scriber de tungsteno, estuche tarjetero personalizado.",
      priceMxn: 2999,
      weightKg: "0.35",
      dimensionsJson: { length: 20, width: 12, height: 4 },
      imageUrl: null,
      deliveryDays: "30-45 días",
      isActive: true,
      isSoldOut: false,
      seedPhraseOptions: [12, 18, 24],
    }).returning();

    const [tangem2] = await db.insert(storeProducts).values({
      slug: "tangem_2pack",
      name: "Tangem Wallet 2-Pack",
      description: "Wallet hardware Tangem con 2 tarjetas NFC. Compatible con BTC, ETH, USDT y +7000 tokens. Backup integrado, sin batería, resistente al agua.",
      priceMxn: 1375,
      weightKg: "0.10",
      dimensionsJson: { length: 12, width: 8, height: 2 },
      imageUrl: null,
      deliveryDays: "30-60 días",
      isActive: true,
      isSoldOut: false,
      seedPhraseOptions: null,
    }).returning();

    const [tangem3] = await db.insert(storeProducts).values({
      slug: "tangem_3pack",
      name: "Tangem Wallet 3-Pack",
      description: "Wallet hardware Tangem con 3 tarjetas NFC. Máxima redundancia de backup. Compatible con BTC, ETH, USDT y +7000 tokens.",
      priceMxn: 1750,
      weightKg: "0.15",
      dimensionsJson: { length: 12, width: 8, height: 3 },
      imageUrl: null,
      deliveryDays: "30-60 días",
      isActive: true,
      isSoldOut: false,
      seedPhraseOptions: null,
    }).returning();

    await db.insert(storeStock).values([
      { productId: vault.id, quantity: 13, reserved: 0, lowStockThreshold: 3 },
      { productId: tangem2.id, quantity: 20, reserved: 0, lowStockThreshold: 5 },
      { productId: tangem3.id, quantity: 15, reserved: 0, lowStockThreshold: 5 },
    ]);

    console.log("[seed] Store products seeded: 3 products, 3 stock entries");
  } else {
    console.log("[seed] Store products already exist, skipping");
  }

  const existingReferrals = await db.select({ id: storeReferralCodes.id }).from(storeReferralCodes).limit(1);
  if (existingReferrals.length === 0) {
    await db.insert(storeReferralCodes).values([
      { code: "SOCIO2026", ownerName: "Demo Socio", discountPct: 15, maxUses: 100 },
      { code: "CEDUVERSE15", ownerName: "Ceduverse Team", discountPct: 15, maxUses: 500 },
      { code: "PARTNER10", ownerName: "Partner Demo", discountPct: 10, maxUses: 50 },
    ]);
    console.log("[seed] Store referral codes seeded: 3 codes");
  } else {
    console.log("[seed] Store referral codes already exist, skipping");
  }
}
