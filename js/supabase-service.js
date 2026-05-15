// js/supabase-service.js
// Client-side Supabase service scaffold for Atlas Horizon.
// Requires the supabase-js client to be included in HTML before this file.
// Example HTML:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js/dist/umd/supabase.min.js"></script>
// <script src="js/supabase-service.js"></script>

(function (global) {
  const svc = {};
  let client = null;

  function ensureClient() {
    if (!client) throw new Error('Supabase client not initialized. Call supabaseService.init(url, anonKey).');
  }

  function getAuthStorageKey() {
    return global.SUPABASE_AUTH_STORAGE_KEY || 'atlas-horizon-supabase-auth';
  }

  function getAuthStorageSnapshot() {
    if (!global.localStorage) return [];
    return Object.keys(global.localStorage)
      .filter((key) => /supabase|sb-|code-verifier|atlas/i.test(key))
      .map((key) => ({
        key,
        hasValue: !!global.localStorage.getItem(key),
        length: (global.localStorage.getItem(key) || '').length
      }));
  }

  svc.isInitialized = function () {
    return !!client;
  };

  // Initialize Supabase client (browser/anon-key usage)
  svc.init = function (supabaseUrl, supabaseAnonKey) {
    if (!supabaseUrl || !supabaseAnonKey) throw new Error('supabaseUrl and supabaseAnonKey are required.');
    if (typeof createClient !== 'function' && typeof supabase !== 'object') {
      throw new Error('Supabase client factory not found. Include supabase-js before this file.');
    }
    // Support both UMD var `supabase` and v2 `createClient` globals
    const options = {
      auth: {
        flowType: 'pkce',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storageKey: getAuthStorageKey()
      }
    };
    if (typeof createClient === 'function') {
      client = createClient(supabaseUrl, supabaseAnonKey, options);
    } else if (typeof supabase === 'object' && typeof supabase.createClient === 'function') {
      client = supabase.createClient(supabaseUrl, supabaseAnonKey, options);
    } else if (typeof Supabase !== 'undefined' && Supabase.createClient) {
      client = Supabase.createClient(supabaseUrl, supabaseAnonKey, options);
    } else {
      throw new Error('Unsupported supabase-js build.');
    }
    if (client.auth && typeof client.auth.onAuthStateChange === 'function') {
      client.auth.onAuthStateChange((event, session) => {
        console.log('AUTH EVENT:', event);
        console.log('SESSION:', session);
      });
    }
    return client;
  };

  // Auth helpers
  svc.getCurrentUser = async function () {
    ensureClient();
    if (client.auth && client.auth.getSession) {
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      return data?.session?.user || null;
    }
    // fallback for very old clients: attempt getUser if available
    if (client.auth && client.auth.getUser) {
      const { data, error } = await client.auth.getUser();
      if (error) throw error;
      return data?.user || null;
    }
    return null;
  };

  // Profile helpers: fetch and upsert application-level profile rows
  svc.fetchProfileById = async function (id) {
    ensureClient();
    try {
      const { data, error } = await client.from('profiles').select('*').eq('id', id).single();
      if (error) {
        if (error.code === 'PGRST116' || error.message && error.message.includes('no rows')) return null;
        // if table doesn't exist or other error, rethrow
        throw error;
      }
      return data || null;
    } catch (e) {
      // table may not exist; return null to allow fallback flow
      return null;
    }
  };

  svc.upsertProfile = async function (profile) {
    ensureClient();
    if (!profile || !profile.id) throw new Error('profile.id is required for upsertProfile');
    // Best-effort upsert into `profiles` table. If table missing, surface error.
    const { data, error } = await client.from('profiles').upsert([profile], { returning: 'representation' }).select().single();
    if (error) throw error;
    return data;
  };

  svc.onAuthStateChange = function (cb) {
    ensureClient();
    if (!client.auth || !client.auth.onAuthStateChange) return () => {};
    return client.auth.onAuthStateChange((event, session) => cb(event, session));
  };

  // Return the raw auth.getUser() result from the underlying client.
  // This gives callers access to the freshest authenticated user data
  // and mirrors the supabase-js v2 return shape: { data: { user }, error }
  svc.getAuthUserNow = async function () {
    ensureClient();
    if (!client.auth || !client.auth.getUser) {
      throw new Error('auth.getUser not available on Supabase client');
    }
    return await client.auth.getUser();
  };

  svc.signOut = async function () {
    ensureClient();
    if (!client.auth || !client.auth.signOut) return true;
    const { error } = await client.auth.signOut();
    if (error) throw error;
    return true;
  };

  svc.signInWithProvider = async function (provider) {
    ensureClient();
    // Use a path-relative callback so GitHub Pages subpaths keep /atlas-horizon.
    const redirectTo = (typeof window !== 'undefined' && window.location)
      ? new URL('./auth/callback/', window.location.href).toString()
      : undefined;
    if (global.localStorage && redirectTo) {
      global.localStorage.setItem('atlas_oauth_start_origin', global.location.origin);
      global.localStorage.setItem('atlas_oauth_redirect_to', redirectTo);
      global.localStorage.setItem('atlas_oauth_started_at', new Date().toISOString());
    }
    console.log('OAUTH PROVIDER:', provider);
    console.log('OAUTH REDIRECT TO:', redirectTo);
    console.log('OAUTH ORIGIN:', global.location?.origin);
    console.log('OAUTH AUTH STORAGE KEY:', getAuthStorageKey());
    console.log('OAUTH STORAGE BEFORE:', getAuthStorageSnapshot());
    const result = await client.auth.signInWithOAuth({ provider, options: redirectTo ? { redirectTo } : undefined });
    console.log('OAUTH RESULT DATA:', result?.data);
    if (result?.error) console.error('OAUTH RESULT ERROR:', result.error);
    console.log('OAUTH STORAGE AFTER:', getAuthStorageSnapshot());
    return result;
  };

  // Maps metadata CRUD
  svc.createMap = async function (meta) {
    ensureClient();
    // Ensure there's an authenticated session before inserting.
    // DO NOT send user_id from the client. The DB/RLS (or trigger) should assign ownership.
    try {
      // Prefer using the client's auth.getUser() to read the authenticated user id
      let user = null;
      try {
        if (client.auth && client.auth.getUser) {
          const res = await client.auth.getUser();
          user = res?.data?.user || null;
        }
      } catch (e) {
        // fallthrough to svc.getCurrentUser as a fallback
      }
      if (!user) {
        // fallback: use svc.getCurrentUser() for older client variants
        try { user = await svc.getCurrentUser(); } catch (e) { user = null; }
      }
      if (!user || !user.id) throw new Error('Not authenticated');
    } catch (e) {
      console.error('supabaseService.createMap blocked: no authenticated user', { message: e.message || e });
      throw e;
    }
    // Build payload and include the authenticated user's id so RLS WITH CHECK passes
    const payload = Object.assign({}, meta);
    // Verify real Supabase session and user (do NOT trust localStorage)
    try {
      let user = null;
      let session = null;
      let userError = null;
      let sessionError = null;
      try {
        if (client.auth && client.auth.getUser) {
          const res = await client.auth.getUser();
          user = res?.data?.user || null;
          userError = res?.error || null;
        }
      } catch (e) {
        userError = e;
      }
      try {
        if (client.auth && client.auth.getSession) {
          const res2 = await client.auth.getSession();
          session = res2?.data?.session || null;
          sessionError = res2?.error || null;
        }
      } catch (e) {
        sessionError = e;
      }
      console.log('USER:', user);
      console.log('SESSION:', session);
      console.log('AUTH ERRORS:', userError, sessionError);

      if (!user || !session) {
        console.error('NO VALID SUPABASE SESSION');
        throw new Error('NO_VALID_SUPABASE_SESSION');
      }
      if (!user.id || !session.access_token) {
        console.error('NO_VALID_SUPABASE_SESSION');
        throw new Error('NO_VALID_SUPABASE_SESSION');
      }

      // ensure payload.user_id matches authenticated user
      payload.user_id = user.id;
      // Note: supabase-js will include the Authorization header automatically when using client
      // with an active session; ensure callers initialize client via supabaseService.init()
    } catch (e) {
      console.error('supabaseService.createMap blocked: cannot resolve authenticated user/session', { message: e.message || e });
      throw e;
    }

    // Perform insert and request the created row back so callers receive an object
    try {
      const { data, error } = await client.from('maps').insert([payload]).select().single();
      if (error) {
        console.error('supabaseService.createMap failed', { payload, error });
        throw error;
      }
      return data;
    } catch (e) {
      console.error('supabaseService.createMap exception', { payload, message: e.message || e });
      throw e;
    }
  };

  svc.fetchMapMeta = async function (mapId) {
    ensureClient();
    const { data, error } = await client.from('maps').select('*').eq('id', mapId).single();
    if (error) throw error;
    return data;
  };

  svc.updateMapMeta = async function (mapId, updates) {
    ensureClient();
    const { data, error } = await client.from('maps').update(updates).eq('id', mapId).select().single();
    if (error) throw error;
    return data;
  };

  svc.deleteMap = async function (mapId) {
    ensureClient();
    const { error } = await client.from('maps').delete().eq('id', mapId);
    if (error) throw error;
    return true;
  };

  // Tile operations
  svc.fetchMapTiles = async function (mapId) {
    ensureClient();
    const { data, error } = await client.from('map_tiles').select('*').eq('map_id', mapId);
    if (error) throw error;
    return data || [];
  };

  // List maps with optional filters: { user_id, limit, order }
  svc.listMaps = async function (filters = {}) {
    ensureClient();
    // Do not rely on client-supplied user_id. RLS will filter rows to the authenticated user.
    let query = client.from('maps').select('*');
    if (filters.limit) query = query.limit(filters.limit);
    if (filters.order) query = query.order(filters.order.column, { ascending: filters.order.ascending });
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  };

  // Fetch maps for current authenticated user (RLS ensures privacy)
  svc.fetchMapsByUser = async function () {
    ensureClient();
    const { data, error } = await client.from('maps').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('supabaseService.fetchMapsByUser failed', { error });
      throw error;
    }
    return data || [];
  };

  // Ensure the client is authenticated and return the user object (throws if not authenticated)
  svc.ensureAuthenticated = async function () {
    const user = await svc.getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    return user;
  };

  svc.batchUpsertTiles = async function (mapId, tiles) {
    ensureClient();
    // filter out default tiles to enforce sparse storage
    const rows = (tiles || [])
      .map(t => Object.assign({}, t, { map_id: mapId }))
      .filter(r => !svc.isDefaultTile({ tile_type: r.tile_type, variant: r.variant, rotation: r.rotation, data: r.data }, r));
    if (!rows.length) return { count: 0 };
    try {
      const { data, error } = await client.from('map_tiles').upsert(rows, { onConflict: 'map_id,x,y,layer' }).select();
      if (error) {
        console.error('supabaseService.batchUpsertTiles failed', { mapId, rowsCount: rows.length, error });
        throw error;
      }
      return data;
    } catch (e) {
      console.error('supabaseService.batchUpsertTiles exception', { mapId, rowsCount: rows.length, message: e.message || e });
      throw e;
    }
  };

  // Default tile predicate: returns true if a tile is the "default" and should be skipped
  svc.isDefaultTile = function (tile, coords) {
    if (!tile) return true;
    const tt = tile.tile_type;
    if (tt === undefined || tt === null || tt === '') return true;
    if (tt === 0 || tt === '0' || tt === '.') return true;
    if (tile.data && tile.data.default === true) return true;
    return false;
  };

  svc.batchDeleteTiles = async function (mapId, tileKeys) {
    ensureClient();
    if (!tileKeys || !tileKeys.length) return { deleted: 0 };
    // Prefer calling an RPC delete_tiles if present
    try {
      if (client.rpc) {
        const payload = tileKeys.map(k => ({ map_id: mapId, x: k.x, y: k.y, layer: k.layer ?? 0 }));
        const { data, error } = await client.rpc('delete_tiles', { tiles_json: payload });
        if (error) throw error;
        return data;
      }
    } catch (e) {
      // fallthrough to per-item deletes
    }

    // Fallback: sequential deletes
    for (const k of tileKeys) {
      const { error } = await client.from('map_tiles').delete().match({ map_id: mapId, x: k.x, y: k.y, layer: k.layer ?? 0 });
      if (error) throw error;
    }
    return { deleted: tileKeys.length };
  };

  // Utility: convert dense 3D map array to sparse rows
  svc.mapArrayToSparseRows = function (mapId, mapArray, defaultPredicate) {
    const rows = [];
    const layers = mapArray.layers || 1;
    for (let layer = 0; layer < layers; layer++) {
      for (let y = 0; y < mapArray.height; y++) {
        for (let x = 0; x < mapArray.width; x++) {
          const tile = mapArray.getTile(layer, x, y);
          if (!tile) continue;
          if (typeof defaultPredicate === 'function' && defaultPredicate(tile, { x, y, layer })) continue;
          rows.push({
            map_id: mapId,
            x,
            y,
            layer,
            tile_type: tile.tile_type,
            variant: tile.variant ?? null,
            rotation: tile.rotation ?? null,
            data: tile.data ?? null
          });
        }
      }
    }
    return rows;
  };

  svc.rpc = async function (fnName, params) {
    ensureClient();
    const { data, error } = await client.rpc(fnName, params);
    if (error) throw error;
    return data;
  };

  global.supabaseService = svc;
})(window);
