// auth/callback/supabase-client.js
// Minimal ESM module that exports a configured Supabase client instance.
// This file is intentionally colocated with the callback page so the
// callback can `import { supabase } from './supabase-client.js'`.

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const url = window.SUPABASE_URL;
const anon = window.SUPABASE_ANON_KEY;
const storageKey = window.SUPABASE_AUTH_STORAGE_KEY || 'atlas-horizon-supabase-auth';

if (!url || !anon) {
  console.error('Supabase config missing for supabase-client');
}

export const supabase = createClient(url, anon, {
  auth: {
    flowType: 'pkce',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storageKey
  }
});

// Instrument auth state changes for debugging during callback exchange
if (supabase && supabase.auth && typeof supabase.auth.onAuthStateChange === 'function') {
  try {
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('AUTH EVENT:', event);
      console.log('SESSION:', session);
    });
  } catch (e) {
    console.error('onAuthStateChange attach failed', e);
  }
}
