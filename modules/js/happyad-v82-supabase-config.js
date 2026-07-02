// HAPPYAD Boutique V84 - Configuration Supabase reliée au projet principal
// Clé publique uniquement. Ne jamais mettre la clé service_role dans un fichier public.
(function(){
  const USER_KEY = 'HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL';
  function readLocalUser(){
    try{return JSON.parse(localStorage.getItem(USER_KEY)||'{}')||{}}catch(e){return {}}
  }
  function pickName(u){
    return u.name || u.full_name || u.display_name || u.username || u.handle || 'Vendeur HAPPYAD';
  }
  const localUser = readLocalUser();
  const url = window.HAPPYAD_SUPABASE_URL || 'https://txjjyhupbejgjcianrmr.supabase.co';
  const anonKey = window.HAPPYAD_SUPABASE_KEY || 'sb_publishable_35EsjCOhZtaPtoZwdyAYOw_KaqlSKHD';

  window.HAPPYAD_SUPABASE_CONFIG = Object.assign({
    enabled: !!(url && anonKey),
    url,
    anonKey,
    currentUserId: localUser.id || localUser.user_id || localStorage.getItem('HAPPYAD_AUTH_UID') || null,
    currentUserName: pickName(localUser),
    source: 'happyad-professional-v84'
  }, window.HAPPYAD_SUPABASE_CONFIG || {});

  // Après chargement Supabase, corrige l'identité vendeur avec la session réelle si disponible.
  setTimeout(async function(){
    try{
      const cfg = window.HAPPYAD_SUPABASE_CONFIG;
      if(!cfg || !cfg.enabled || !window.supabase || !window.supabase.createClient) return;
      const c = window.happyadBoutiqueSupabase || window.supabase.createClient(cfg.url, cfg.anonKey, {auth:{persistSession:true,autoRefreshToken:true}});
      window.happyadBoutiqueSupabase = c;
      const r = await c.auth.getUser();
      const user = r && r.data && r.data.user;
      if(user && user.id){
        cfg.currentUserId = user.id;
        try{localStorage.setItem('HAPPYAD_AUTH_UID', user.id)}catch(e){}
        try{
          const pr = await c.from('profiles').select('*').eq('id', user.id).maybeSingle();
          if(pr && pr.data){
            cfg.currentUserName = pr.data.full_name || pr.data.username || cfg.currentUserName || 'Vendeur HAPPYAD';
          }
        }catch(e){}
      }
    }catch(e){console.warn('[HAPPYAD Boutique V84] identité vendeur non chargée', e)}
  }, 350);
})();
