-- 003_repair_auth_profiles_trigger.sql
-- Repair Discord OAuth user creation failures caused by auth.users profile triggers.
-- Run this in the Supabase SQL editor for the live project.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text,
  discord_id text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS discord_id text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE OR REPLACE FUNCTION public.create_profile_on_user_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    username,
    discord_id,
    avatar_url,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data ->> 'user_name',
      NEW.raw_user_meta_data ->> 'username',
      NEW.raw_user_meta_data ->> 'preferred_username',
      NEW.raw_user_meta_data ->> 'name',
      NEW.email
    ),
    COALESCE(
      NEW.raw_user_meta_data ->> 'provider_id',
      NEW.raw_user_meta_data ->> 'sub',
      NEW.raw_user_meta_data ->> 'discord_id'
    ),
    COALESCE(
      NEW.raw_user_meta_data ->> 'avatar_url',
      NEW.raw_user_meta_data ->> 'picture'
    ),
    COALESCE(NEW.created_at, now()),
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    username = COALESCE(public.profiles.username, EXCLUDED.username),
    discord_id = COALESCE(public.profiles.discord_id, EXCLUDED.discord_id),
    avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
    updated_at = now();

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Never block auth.users creation. The warning appears in Postgres logs,
    -- and the backfill below can repair rows after schema/policy fixes.
    RAISE WARNING 'create_profile_on_user_insert failed for auth user %: [%] %',
      NEW.id, SQLSTATE, SQLERRM;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.create_profile_on_user_insert();

CREATE OR REPLACE FUNCTION public.profiles_touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_touch_updated_at ON public.profiles;
CREATE TRIGGER profiles_touch_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.profiles_touch_updated_at();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_owner_policy ON public.profiles;
CREATE POLICY profiles_owner_policy ON public.profiles
FOR ALL
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;

INSERT INTO public.profiles (
  id,
  username,
  discord_id,
  avatar_url,
  created_at,
  updated_at
)
SELECT
  u.id,
  COALESCE(
    u.raw_user_meta_data ->> 'user_name',
    u.raw_user_meta_data ->> 'username',
    u.raw_user_meta_data ->> 'preferred_username',
    u.raw_user_meta_data ->> 'name',
    u.email
  ),
  COALESCE(
    u.raw_user_meta_data ->> 'provider_id',
    u.raw_user_meta_data ->> 'sub',
    u.raw_user_meta_data ->> 'discord_id'
  ),
  COALESCE(
    u.raw_user_meta_data ->> 'avatar_url',
    u.raw_user_meta_data ->> 'picture'
  ),
  COALESCE(u.created_at, now()),
  now()
FROM auth.users u
ON CONFLICT (id) DO UPDATE
SET
  username = COALESCE(public.profiles.username, EXCLUDED.username),
  discord_id = COALESCE(public.profiles.discord_id, EXCLUDED.discord_id),
  avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
  updated_at = now();

-- Useful post-run checks:
-- SELECT tgname FROM pg_trigger WHERE tgrelid = 'auth.users'::regclass AND NOT tgisinternal;
-- SELECT id, username, discord_id, avatar_url FROM public.profiles ORDER BY created_at DESC LIMIT 10;
