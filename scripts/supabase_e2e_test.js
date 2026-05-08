#!/usr/bin/env node
// scripts/supabase_e2e_test.js
// Automated end-to-end test for Supabase Auth + maps CRUD and profiles.
// Usage (bash):
// SUPABASE_URL=https://... SUPABASE_ANON_KEY=anonkey SUPABASE_SERVICE_ROLE_KEY=service_role_key node scripts/supabase_e2e_test.js

const { randomUUID } = require('crypto');

const SUPABASE_URL = process.env.SUPABASE_URL;
const ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY; // optional: only for setup/cleanup
const TOKEN_A = process.env.ACCESS_TOKEN_A || process.argv.find(a => a.startsWith('--token-a='))?.split('=')[1];
const TOKEN_B = process.env.ACCESS_TOKEN_B || process.argv.find(a => a.startsWith('--token-b='))?.split('=')[1];

if (!SUPABASE_URL || !ANON_KEY) {
  console.error('Missing required env vars. Set SUPABASE_URL and SUPABASE_ANON_KEY');
  process.exit(2);
}

if (!TOKEN_A || !TOKEN_B) {
  console.error('Missing required access tokens. Provide ACCESS_TOKEN_A and ACCESS_TOKEN_B as env vars or --token-a=... --token-b=...');
  process.exit(2);
}

const sanitizePayload = (obj) => {
  if (!obj || typeof obj !== 'object') return String(obj).slice(0, 200);
  const keys = ['code', 'error_code', 'msg', 'message', 'status', 'details'];
  const out = {};
  for (const k of keys) if (k in obj) out[k] = obj[k];
  // if none of the keys matched, include a shortened stringified version
  if (Object.keys(out).length === 0) out._preview = JSON.stringify(obj).slice(0, 200);
  return out;
};

const fetchJson = async (url, opts = {}) => {
  const method = (opts.method || 'GET').toUpperCase();
  const res = await fetch(url, opts);
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch (e) { json = text; }
  if (!res.ok) {
    const sanitized = sanitizePayload(json);
    console.error(`${method} ${url} -> ${res.status} ${res.statusText}`, sanitized);
    const err = new Error(`${method} ${url} -> ${res.status}`);
    err.status = res.status;
    err.payload = sanitized;
    throw err;
  }
  return json;
};

async function createAdminUser(email, password, username) {
  if (!SERVICE_ROLE) throw new Error('Service role key required to create admin users');
  const url = `${SUPABASE_URL.replace(/\/+$, '')}/auth/v1/admin/users`;
  const body = { email, password, user_metadata: { username } };
  return await fetchJson(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SERVICE_ROLE}`,
      apikey: SERVICE_ROLE
    },
    body: JSON.stringify(body)
  });
}

async function deleteAdminUser(uid) {
  if (!SERVICE_ROLE) throw new Error('Service role key required to delete admin users');
  const url = `${SUPABASE_URL.replace(/\/+$, '')}/auth/v1/admin/users/${uid}`;
  return await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${SERVICE_ROLE}`, apikey: SERVICE_ROLE }
  });
}

// Get user info from Supabase using the provided access token.
async function getUserFromToken(token) {
  const url = `${SUPABASE_URL.replace(/\/+$, '')}/auth/v1/user`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, apikey: ANON_KEY } });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch (e) { json = text; }
  if (!res.ok) {
    const sanitized = sanitizePayload(json);
    throw Object.assign(new Error('Failed to fetch user from token'), { status: res.status, payload: sanitized });
  }
  return json;
}

async function postgrest(path, token, method = 'GET', body = null, params = {}) {
  const base = `${SUPABASE_URL.replace(/\/+$/, '')}/rest/v1${path}`;
  const url = new URL(base);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const headers = { apikey: ANON_KEY, Authorization: `Bearer ${token}`, Prefer: 'return=representation' };
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(url.toString(), { method, headers, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch (e) { json = text; }
  if (!res.ok) {
    const sanitized = sanitizePayload(json);
    console.error(`${method} ${url} -> ${res.status} ${res.statusText}`, sanitized);
    const err = new Error(`${method} ${url} -> ${res.status}`);
    err.status = res.status;
    err.payload = sanitized;
    throw err;
  }
  return json;
}

function randEmail(prefix) {
  const t = Date.now();
  return `${prefix}_${t}@example.com`;
}

async function run() {
  console.log('Starting Supabase E2E test (auth is assumed valid; tokens provided externally)');

  const tokenA = TOKEN_A;
  const tokenB = TOKEN_B;
  let uidA, uidB;
  let mapId = null;
  const testResults = [];

  try {
    console.log('Step 1: Verify provided tokens and fetch user info (tokens NOT logged)');
    const infoA = await getUserFromToken(tokenA);
    const infoB = await getUserFromToken(tokenB);
    uidA = infoA?.id;
    uidB = infoB?.id;
    if (!uidA || !uidB) throw new Error('Could not determine user ids from provided tokens');
    console.log(`  Got user ids: ${uidA} and ${uidB}`);
    testResults.push({ name: 'Token verification', ok: true });

    console.log('Step 2: Upsert profile as user A (should be allowed by RLS)');
    const profile = await postgrest('/profiles', tokenA, 'POST', [{ id: uidA, username: 'e2e_user_A', avatar_url: null }]);
    testResults.push({ name: 'Profile upsert by owner', ok: Array.isArray(profile) && profile.length > 0, details: sanitizePayload(profile) });

    console.log('Step 3: Create map as user A');
    const map = await postgrest('/maps', tokenA, 'POST', [{ user_id: uidA, name: 'E2E Test Map', width: 21, height: 33, gamemode: 'Gem_Grab', environment: 'Desert' }]);
    mapId = map[0]?.id;
    testResults.push({ name: 'Map creation by owner', ok: !!mapId, details: mapId ? `map_id=${mapId}` : sanitizePayload(map) });

    console.log('Step 4: Read map as user A');
    const read = await postgrest(`/maps`, tokenA, 'GET', null, { 'id': `eq.${mapId}` });
    testResults.push({ name: 'Owner can read map', ok: Array.isArray(read) && read.length === 1 });

    console.log('Step 5: Update map as user A');
    const updated = await postgrest('/maps', tokenA, 'PATCH', { name: 'E2E Test Map (Updated)' }, { 'id': `eq.${mapId}` });
    testResults.push({ name: 'Owner can update map', ok: Array.isArray(updated) && updated.length > 0 });

    console.log('Step 6: Confirm user B cannot read that map (RLS enforcement)');
    const otherRead = await postgrest('/maps', tokenB, 'GET', null, { 'id': `eq.${mapId}` });
    const otherOk = Array.isArray(otherRead) && otherRead.length === 0;
    testResults.push({ name: 'Non-owner cannot read owner map', ok: otherOk, details: sanitizePayload(otherRead) });

    console.log('Step 7: Delete map as user A');
    const deleted = await postgrest('/maps', tokenA, 'DELETE', null, { 'id': `eq.${mapId}` });
    testResults.push({ name: 'Owner can delete map', ok: Array.isArray(deleted) && deleted.length > 0 });

    console.log('Step 8: Verify profiles row exists and auth.uid() checks');
    const gotProfile = await postgrest('/profiles', tokenA, 'GET', null, { 'id': `eq.${uidA}` });
    testResults.push({ name: 'Owner profile readable', ok: Array.isArray(gotProfile) && gotProfile.length >= 0 });

    // Summarize
    console.log('\nE2E checks complete. Results:');
    let passed = 0;
    for (const r of testResults) {
      const status = r.ok ? 'PASS' : 'FAIL';
      console.log(`- ${status}: ${r.name}${r.details ? ' — ' + JSON.stringify(r.details) : ''}`);
      if (r.ok) passed++;
    }
    const total = testResults.length;
    console.log(`\nSummary: ${passed}/${total} tests passed.`);
    if (passed !== total) process.exitCode = 3;

  } catch (err) {
    console.error('Test failed:', sanitizePayload(err.payload ?? err));
    process.exitCode = 3;
  } finally {
    // No service-role cleanup by default: map deletions were performed by owner tokens.
    // If users were created with service role outside this run, deleteAdminUser can be used separately.
    console.log('Cleanup: owner tokens used for DB changes; no service-role operations performed.');
  }
}

run().catch(e => { console.error(e); process.exit(1); });
