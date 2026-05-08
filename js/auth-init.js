// js/auth-init.js
(function(){
  const auth = {};
  const url = window.SUPABASE_URL || localStorage.getItem('SUPABASE_URL');
  const anon = window.SUPABASE_ANON_KEY || localStorage.getItem('SUPABASE_ANON_KEY');

  function safeInit() {
    if (!window.supabaseService) {
      console.warn('supabaseService not found. Ensure js/supabase-service.js is loaded before auth-init.js');
      return;
    }
    try {
      supabaseService.init(url, anon);
    } catch (e) {
      console.warn('supabaseService.init failed', e);
    }

    // Keep UI/local state in sync with auth
    if (typeof supabaseService.onAuthStateChange === 'function') {
      supabaseService.onAuthStateChange(async (event, session) => {
        const user = session?.user || await supabaseService.getCurrentUser().catch(()=>null);
        if (user && user.id) {
            // Do NOT persist user id in localStorage. Use Supabase session API instead.
            localStorage.setItem('username', user.user_metadata?.user_name || user.email || '');
            localStorage.setItem('avatar', user.user_metadata?.avatar_url || localStorage.getItem('avatar') || '');
            const loginBtn = document.getElementById('loginBtn'); if (loginBtn) loginBtn.style.display = 'none';
            const avatarElem = document.getElementById('avatar'); if (avatarElem) { avatarElem.style.display = 'block'; avatarElem.src = user.user_metadata?.avatar_url || localStorage.getItem('avatar') || ''; }
          } else {
            // Clear stored profile display values, but do not remove auth configuration keys
            localStorage.removeItem('username');
            localStorage.removeItem('avatar');
            const loginBtn = document.getElementById('loginBtn'); if (loginBtn) loginBtn.style.display = 'block';
          }
      });
    }
  }

  if (url && anon) {
    safeInit();
  } else {
    // still expose no-op facades so pages can call signIn/signOut without checking
    console.log('Supabase not configured (SUPABASE_URL / SUPABASE_ANON_KEY missing)');
  }

  auth.signIn = async function() {
    if (!window.supabaseService) throw new Error('supabaseService missing');
    return supabaseService.signInWithProvider('discord');
  };

  auth.signOut = async function() {
    try {
      if (window.supabaseService && supabaseService.signOut) await supabaseService.signOut();
    } catch (e) {
      console.warn('signOut failed', e);
    }
    // Clear only profile display keys; do not clear config
    localStorage.removeItem('username');
    localStorage.removeItem('avatar');
    // navigate home after sign out
    try { window.location.href = './index.html'; } catch (e) {}
  };

  auth.getCurrentUser = function() {
    if (!window.supabaseService) return Promise.resolve(null);
    return supabaseService.getCurrentUser();
  };

  window.authInit = auth;
})();
