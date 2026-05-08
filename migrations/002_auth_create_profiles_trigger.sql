-- 002_auth_create_profiles_trigger.sql
-- Create trigger to populate `profiles` when a new auth.users row is created
-- Also backfill any existing auth.users that don't have a profile yet

-- Function: handle new auth user -> insert into public.profiles
-- Minimal function to insert a profile row when a new auth.user is created.
CREATE OR REPLACE FUNCTION public.create_profile_on_user_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  _rows int;
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
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    username = COALESCE(public.profiles.username, EXCLUDED.username),
    discord_id = COALESCE(public.profiles.discord_id, EXCLUDED.discord_id),
    avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
    updated_at = now();

  GET DIAGNOSTICS _rows = ROW_COUNT;
  RAISE NOTICE 'create_profile_on_user_insert: id=% inserted=%', NEW.id, _rows;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS auth_user_created ON auth.users;
CREATE TRIGGER auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE PROCEDURE public.create_profile_on_user_insert();

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

-- Notes: creates and backfills profile rows from Supabase Auth metadata.
