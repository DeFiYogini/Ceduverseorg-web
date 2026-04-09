-- Migration: Add avatar_preferences and preview video columns to instructor_avatars
-- Supports the Gemelo Digital tab customization and preview video tracking

ALTER TABLE instructor_avatars ADD COLUMN IF NOT EXISTS avatar_preferences JSONB;
ALTER TABLE instructor_avatars ADD COLUMN IF NOT EXISTS preview_video_url TEXT;
ALTER TABLE instructor_avatars ADD COLUMN IF NOT EXISTS preview_video_id TEXT;
