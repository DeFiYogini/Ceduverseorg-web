/**
 * Centralized environment variable validation.
 * Import this module early in server startup to fail fast on missing config.
 */

interface EnvVar {
  name: string;
  required: boolean;
  description: string;
}

const ENV_VARS: EnvVar[] = [
  // Core — server won't start without these
  { name: "DB_URL", required: true, description: "PostgreSQL connection string" },
  { name: "SESSION_SECRET", required: true, description: "JWT signing secret" },

  // Admin — separate secret for admin API endpoints
  { name: "ADMIN_API_KEY", required: false, description: "Admin API key for migration/import endpoints (falls back to SESSION_SECRET if not set)" },

  // Email
  { name: "RESEND_API_KEY", required: false, description: "Resend email API key" },

  // AI services
  { name: "OPENAI_API_KEY", required: false, description: "OpenAI API key for AI tutoring" },
  { name: "ANTHROPIC_API_KEY", required: false, description: "Anthropic API key for Claude AI" },

  // Video/Avatar
  { name: "HEYGEN_API_KEY", required: false, description: "HeyGen avatar video API key" },
  { name: "DAILY_API_KEY", required: false, description: "Daily.co video conferencing API key" },

  // Payments
  { name: "MP_ACCESS_TOKEN", required: false, description: "MercadoPago access token" },

  // Invoicing
  { name: "FACTURAPI_API_KEY", required: false, description: "FacturAPI invoicing key" },

  // Shipping
  { name: "ENVIA_API_KEY", required: false, description: "Envia.com shipping API key" },

  // Bank info for SAM payments
  { name: "BANK_NAME", required: false, description: "Bank name for SAM payment info" },
  { name: "BANK_CLABE", required: false, description: "CLABE interbancaria for SAM payments" },
  { name: "BANK_BENEFICIARY", required: false, description: "Beneficiary name for SAM payments" },

  // Superadmin
  { name: "SUPERADMIN_PASSWORD", required: false, description: "Initial superadmin password" },

  // Demo accounts (JSON array, optional)
  { name: "DEMO_ACCOUNTS", required: false, description: "JSON array of demo account configs" },
];

export function validateEnv(): void {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const v of ENV_VARS) {
    if (!process.env[v.name]) {
      if (v.required) {
        missing.push(`  ${v.name} — ${v.description}`);
      } else {
        warnings.push(`  ${v.name} — ${v.description}`);
      }
    }
  }

  if (warnings.length > 0) {
    console.warn(`[env] Optional variables not set (features may be limited):\n${warnings.join("\n")}`);
  }

  if (missing.length > 0) {
    console.error(`[FATAL] Required environment variables missing:\n${missing.join("\n")}`);
    process.exit(1);
  }

  console.log("[env] Environment validation passed");
}

/** Get the admin API key — uses dedicated ADMIN_API_KEY, falls back to SESSION_SECRET */
export function getAdminApiKey(): string {
  return process.env.ADMIN_API_KEY || process.env.SESSION_SECRET || "";
}

/** Get bank info from env vars with defaults */
export function getBankInfo() {
  return {
    bank: process.env.BANK_NAME || "BanRegio",
    type: "Cuenta Empresarial",
    clabe: process.env.BANK_CLABE || "",
    beneficiary: process.env.BANK_BENEFICIARY || "Ceduverse S.C.",
  };
}
