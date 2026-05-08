-- 001_create_maps_and_tiles.sql
-- Supabase migration: maps + map_tiles + RPCs + RLS
-- Run with psql or Supabase SQL editor.

-- Enable helper extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- maps table: metadata for each map
CREATE TABLE IF NOT EXISTS maps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Single source of truth for ownership: default to the authenticated user
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL,
  width int NOT NULL,
  height int NOT NULL,
  gamemode text NULL,
  environment text NULL,
  preview_url text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- map_tiles: sparse, row-per-tile storage (only non-default tiles)
CREATE TABLE IF NOT EXISTS map_tiles (
  map_id uuid NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
  x int NOT NULL,
  y int NOT NULL,
  layer int NOT NULL DEFAULT 0,
  tile_type text NOT NULL,
  variant text NULL,
  rotation smallint NULL,
  data jsonb NULL,
  PRIMARY KEY (map_id, x, y, layer),
  CONSTRAINT map_tiles_rotation_range CHECK (rotation IS NULL OR (rotation >= 0 AND rotation < 360))
);

-- Indexes for common lookups
CREATE INDEX IF NOT EXISTS idx_map_tiles_mapid_xy ON map_tiles(map_id, x, y);
CREATE INDEX IF NOT EXISTS idx_maps_user_id ON maps(user_id);

-- Add FK constraint to auth.users for referential integrity (optional)
ALTER TABLE maps
  ADD CONSTRAINT maps_user_fk FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Trigger: update maps.updated_at on update
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS maps_touch_updated_at ON maps;
CREATE TRIGGER maps_touch_updated_at
BEFORE UPDATE ON maps
FOR EACH ROW EXECUTE PROCEDURE touch_updated_at();

-- RPC: upsert_tiles(jsonb)
-- Accepts an array of tile objects: {map_id, x, y, layer, tile_type, variant, rotation, data}
CREATE OR REPLACE FUNCTION upsert_tiles(tiles_json jsonb)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO map_tiles(map_id, x, y, layer, tile_type, variant, rotation, data)
  SELECT
    (t.map_id)::uuid,
    (t.x)::int,
    (t.y)::int,
    COALESCE((t.layer)::int, 0),
    t.tile_type,
    t.variant,
    NULLIF(t.rotation,'')::smallint,
    t.data
  FROM jsonb_to_recordset(tiles_json) AS t(map_id text, x int, y int, layer int, tile_type text, variant text, rotation text, data jsonb)
  ON CONFLICT (map_id, x, y, layer)
  DO UPDATE SET tile_type = EXCLUDED.tile_type,
                variant = EXCLUDED.variant,
                rotation = EXCLUDED.rotation,
                data = EXCLUDED.data;
END; $$;

-- RPC: delete_tiles(jsonb)
-- Accepts array of keys: {map_id, x, y, layer}
CREATE OR REPLACE FUNCTION delete_tiles(tiles_json jsonb)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM map_tiles
  USING (
    SELECT (t.map_id)::uuid AS map_id, (t.x)::int AS x, (t.y)::int AS y, COALESCE((t.layer)::int,0) AS layer
    FROM jsonb_to_recordset(tiles_json) AS t(map_id text, x int, y int, layer int)
  ) AS rows
  WHERE map_tiles.map_id = rows.map_id
    AND map_tiles.x = rows.x
    AND map_tiles.y = rows.y
    AND map_tiles.layer = rows.layer;
END; $$;

-- Enable RLS
ALTER TABLE maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE map_tiles ENABLE ROW LEVEL SECURITY;

-- Single authoritative policy for `maps`: owner-only for all operations
DROP POLICY IF EXISTS maps_owner_policy ON maps;
CREATE POLICY maps_owner_policy ON maps
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: allow access to map_tiles only if parent map belongs to user
DROP POLICY IF EXISTS map_tiles_owner_policy ON map_tiles;
CREATE POLICY map_tiles_owner_policy ON map_tiles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM maps m WHERE m.id = map_tiles.map_id AND m.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM maps m WHERE m.id = map_tiles.map_id AND m.user_id = auth.uid()
  )
);

-- -----------------------------------------------------------------------------
-- profiles table: per-user profile metadata (used by client upsert/fetch)
-- This is a fresh migration for a Supabase-auth-only setup.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text,
  discord_id text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Trigger: update profiles.updated_at on update
CREATE OR REPLACE FUNCTION profiles_touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS profiles_touch_updated_at ON profiles;
CREATE TRIGGER profiles_touch_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE PROCEDURE profiles_touch_updated_at();

-- Enable RLS on profiles and restrict access to the owning authenticated user
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_owner_policy ON profiles
FOR ALL
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);


-- Notes:
-- - Use the Supabase SQL editor or `psql` to run this file.
-- - For large migrations, run server-side scripts using the `service_role` key (DO NOT commit the key).
-- - Consider adding additional constraints, quotas, or triggers as needed.
