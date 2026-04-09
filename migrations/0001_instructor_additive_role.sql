-- Migration: Make instructor role additive
-- This migration adds the is_instructor boolean field and instructor_badge_type enum
-- Then backfills existing instructors and resets their userRole

-- Add instructor_badge_type enum (if not exists)
DO $$ BEGIN
  CREATE TYPE instructor_badge_type AS ENUM ('interno', 'acreditado_dc5');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add is_instructor column to accounts (if not exists)
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS is_instructor BOOLEAN NOT NULL DEFAULT false;

-- Add instructor_badge_type column to instructor_profiles (if not exists)
ALTER TABLE instructor_profiles ADD COLUMN IF NOT EXISTS instructor_badge_type instructor_badge_type;

-- Backfill: set is_instructor=true for accounts with userRole='instructor'
UPDATE accounts SET is_instructor = true WHERE user_role = 'instructor';

-- Reset their userRole back to 'user' since isInstructor is now the flag
UPDATE accounts SET user_role = 'user' WHERE user_role = 'instructor' AND is_instructor = true;
