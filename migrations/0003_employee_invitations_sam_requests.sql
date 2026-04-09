DO $$ BEGIN
  CREATE TYPE "invitation_status" AS ENUM('pending', 'accepted', 'expired');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "sam_request_status" AS ENUM('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "employee_invitations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "team_id" text NOT NULL REFERENCES "teams"("id") ON DELETE CASCADE,
  "email" text NOT NULL,
  "nombre" text NOT NULL,
  "apellido" text,
  "puesto" text,
  "departamento" text,
  "token" text NOT NULL UNIQUE,
  "referral_code" text,
  "status" "invitation_status" NOT NULL DEFAULT 'pending',
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_employee_invitations_team" ON "employee_invitations" ("team_id");
CREATE INDEX IF NOT EXISTS "idx_employee_invitations_email" ON "employee_invitations" ("email");
CREATE INDEX IF NOT EXISTS "idx_employee_invitations_token" ON "employee_invitations" ("token");

CREATE TABLE IF NOT EXISTS "sam_requests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "team_id" text NOT NULL REFERENCES "teams"("id") ON DELETE CASCADE,
  "period_year" integer NOT NULL,
  "period_month" integer NOT NULL,
  "file_url" text,
  "employee_count" integer NOT NULL DEFAULT 0,
  "status" "sam_request_status" NOT NULL DEFAULT 'pending',
  "submitted_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "reviewed_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "review_note" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone
);

CREATE UNIQUE INDEX IF NOT EXISTS "uq_sam_requests_period" ON "sam_requests" ("team_id", "period_year", "period_month");
CREATE INDEX IF NOT EXISTS "idx_sam_requests_team" ON "sam_requests" ("team_id");
CREATE INDEX IF NOT EXISTS "idx_sam_requests_status" ON "sam_requests" ("status");
