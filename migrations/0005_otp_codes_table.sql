-- Migration: Create persistent OTP codes table
-- Replaces in-memory Map for multi-instance support and server restart resilience

CREATE TABLE IF NOT EXISTS "otp_codes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" text NOT NULL,
  "code" text NOT NULL,
  "attempts" integer NOT NULL DEFAULT 0,
  "full_name" text,
  "join_coop" boolean NOT NULL DEFAULT false,
  "phone" text,
  "curp" text,
  "expires_at" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_otp_codes_email" ON "otp_codes" ("email");
CREATE INDEX IF NOT EXISTS "idx_otp_codes_expires" ON "otp_codes" ("expires_at");
