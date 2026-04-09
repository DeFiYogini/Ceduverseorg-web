-- Enable required extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- Enums
-- =====================================================
CREATE TYPE achievement_status AS ENUM ('pending', 'active', 'revoked');
CREATE TYPE account_type AS ENUM ('free', 'premium', 'admin'); -- adjust as needed
CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');  -- adjust as needed
-- Optional: create an enum for achievement categories if they are fixed
-- CREATE TYPE achievement_category AS ENUM ('course', 'quiz', 'social', ...);

-- =====================================================
-- Core entity tables
-- =====================================================

-- Courses (added to enforce referential integrity)
CREATE TABLE public.courses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text UNIQUE NOT NULL,
    title text NOT NULL,
    description text,
    cover_url text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz
);
COMMENT ON TABLE public.courses IS 'Stores course metadata';

-- Achievements
CREATE TABLE public.achievements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text UNIQUE NOT NULL,
    name text NOT NULL,
    short_description text,
    description text,
    value integer NOT NULL DEFAULT 1000 CHECK (value > 0),
    category text, -- or achievement_category if using enum
    icon text,
    cover_url text,
    contract_address text, -- for blockchain integration
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz
);

-- Teams
CREATE TABLE public.teams (
    id text PRIMARY KEY, -- business key (slug)
    name text NOT NULL,
    description text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz
);

-- =====================================================
-- User-related tables (linked to auth.users)
-- =====================================================

-- Accounts (extends auth.users)
CREATE TABLE public.accounts (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    account_type account_type NOT NULL DEFAULT 'free',
    account_setup smallint NOT NULL DEFAULT 0, -- 0 = incomplete, 1-100% progress
    referral_code text UNIQUE,
    referred_by text, -- references referral_code of another account (self-reference)
    user_role user_role NOT NULL DEFAULT 'user',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz,
    FOREIGN KEY (referred_by) REFERENCES public.accounts(referral_code) ON DELETE SET NULL
);
CREATE INDEX idx_accounts_referred_by ON public.accounts(referred_by);

-- Profiles
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text CHECK (char_length(full_name) >= 3 AND char_length(full_name) <= 100),
    country text,
    city text,
    phone_number text,
    wallet_address text,
    interest jsonb DEFAULT '[]'::jsonb, -- or consider normalizing
    genre text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz
);
CREATE INDEX idx_profiles_wallet_address ON public.profiles(wallet_address);

-- =====================================================
-- Junction tables (many-to-many relationships)
-- =====================================================

-- User achievements
CREATE TABLE public.achievement_users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    is_active boolean NOT NULL DEFAULT true,
    status achievement_status NOT NULL,
    contract_address text,
    token_id text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz,
    UNIQUE (user_id, achievement_id) -- prevent duplicate awards
);
CREATE INDEX idx_achievement_users_user_id ON public.achievement_users(user_id);
CREATE INDEX idx_achievement_users_achievement_id ON public.achievement_users(achievement_id);

-- User courses (progress tracking)
CREATE TABLE public.course_users (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    course_slug text NOT NULL, -- denormalized for convenience (could be dropped if not needed)
    completed smallint NOT NULL DEFAULT 0 CHECK (completed >= 0 AND completed <= 100),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz,
    UNIQUE (user_id, course_id)
);
CREATE INDEX idx_course_users_user_id ON public.course_users(user_id);
CREATE INDEX idx_course_users_course_id ON public.course_users(course_id);

-- Team membership
CREATE TABLE public.team_users (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    team_id text NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role text NOT NULL, -- e.g., 'leader', 'member'
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz,
    UNIQUE (team_id, user_id)
);
CREATE INDEX idx_team_users_team_id ON public.team_users(team_id);
CREATE INDEX idx_team_users_user_id ON public.team_users(user_id);

-- =====================================================
-- Optional: Functions for automatic updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON public.accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_achievements_updated_at BEFORE UPDATE ON public.achievements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_achievement_users_updated_at BEFORE UPDATE ON public.achievement_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_users_updated_at BEFORE UPDATE ON public.course_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_users_updated_at BEFORE UPDATE ON public.team_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();