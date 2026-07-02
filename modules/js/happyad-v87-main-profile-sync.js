// HAPPYAD Boutique V88 — Profil + badge réel reliés au vrai profil principal HAPPYAD.
// Supprime les badges test et affiche le même badge réel que le profil principal.
(function(){
  if(window.__happyadBoutiqueMainProfileSyncV87) return;
  window.__happyadBoutiqueMainProfileSyncV87 = true;


  function ensureRealBadgeStyle(){
    if(document.getElementById('HAPPYAD_BOUTIQUE_REAL_BADGE_STYLE_V88')) return;
    const st=document.createElement('style');
    st.id='HAPPYAD_BOUTIQUE_REAL_BADGE_STYLE_V88';
    st.textContent=`
      .happyBadgeMark{position:relative!important;display:inline-block!important;width:16px!important;height:16px!important;margin-left:5px!important;vertical-align:-2px!important;overflow:visible!important;font-size:0!important;line-height:1!important;clip-path:polygon(50% 0%,58% 12%,71% 6%,76% 20%,91% 22%,88% 38%,100% 50%,88% 62%,91% 78%,76% 80%,71% 94%,58% 88%,50% 100%,42% 88%,29% 94%,24% 80%,9% 78%,12% 62%,0% 50%,12% 38%,9% 22%,24% 20%,29% 6%,42% 12%)!important;flex:0 0 auto!important;background:transparent!important;border-radius:0!important;box-shadow:none!important}
      .happyBadgeMark:before{content:''!important;position:absolute!important;inset:0!important;clip-path:inherit!important;z-index:0!important}
      .happyBadgeMark:after{content:'✓'!important;position:absolute!important;top:50%!important;left:50%!important;transform:translate(-50%,-52%)!important;color:#fff!important;font-size:10px!important;font-weight:1000!important;line-height:1!important;text-shadow:0 0 3px rgba(255,255,255,.75)!important;z-index:1!important}
      .happyBadgeMark.bleu:before,.happyBadgeMark.blue:before{background:linear-gradient(135deg,#6fd4ff,#38b6ff,#0090ff)!important;box-shadow:0 0 3px rgba(79,195,255,.45),0 0 8px rgba(0,120,255,.25)!important}
      .happyBadgeMark.violet:before,.happyBadgeMark.purple:before{background:linear-gradient(135deg,#e9d5ff,#c084fc,#9333ea)!important;box-shadow:0 0 3px rgba(147,51,234,.45),0 0 8px rgba(109,40,217,.25)!important}
      .happyBadgeMark.jaune:before,.happyBadgeMark.yellow:before{background:linear-gradient(135deg,#ffe27a,#ffb020,#ff7a00)!important;box-shadow:0 0 3px rgba(255,176,32,.45),0 0 8px rgba(255,122,0,.25)!important}
      .happyadName .happyBadgeMark,.publicCardTop h3 .happyBadgeMark,.sellerMetaName .happyBadgeMark,.cartSellerLine .happyBadgeMark{width:16px!important;height:16px!important;margin-left:5px!important}
    `;
    document.head.appendChild(st);
  }
  ensureRealBadgeStyle();

  const USER_KEYS = [
    'HAPPYAD_LOGGED_USER',
    'HAPPYAD_CURRENT_USER',
    'HAPPYAD_USER',
    'HAPPYAD_USER_V1',
    'HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL'
  ];

  function safeJSON(key){
    try{ const raw=localStorage.getItem(key); return raw ? (JSON.parse(raw)||{}) : {}; }catch(e){ return {}; }
  }
  function clean(v){ return String(v||'').trim(); }
  function normHandle(v){ return clean(v).replace(/^@+/,'').trim(); }
  function badgeValueFromAny(u){
    u=u||{};
    return clean(u.badge||u.user_badge||u.badge_type||u.certification||u.certified||u.is_verified||u.verified||u.blue_badge||u.verifyBadge||u.verify_badge||u.verifiedBadge||u.verified_badge||u.role_badge||u.profile_badge||u.admin_badge||u.badge_color||'');
  }
  function realBadgeClass(v){
    v=String(v||'').toLowerCase().trim();
    if(!v||v==='aucun'||v==='none'||v==='false'||v==='0'||v==='null'||v==='undefined')return '';
    if(v.indexOf('bleu')>=0||v.indexOf('blue')>=0||v.indexOf('verify')>=0||v.indexOf('cert')>=0||v==='true'||v==='1')return 'blue';
    if(v.indexOf('violet')>=0||v.indexOf('purple')>=0)return 'violet';
    if(v.indexOf('jaune')>=0||v.indexOf('yellow')>=0||v.indexOf('business')>=0||v.indexOf('premium')>=0)return 'yellow';
    return 'blue';
  }
  function validUser(u){
    if(!u || typeof u!=='object') return false;
    const id=clean(u.id||u.user_id||u.uid||u.uuid||u.auth_id).toLowerCase();
    const name=clean(u.name||u.full_name||u.display_name).toLowerCase();
    const handle=normHandle(u.handle||u.username).toLowerCase();
    if(!id && !name && !handle && !clean(u.avatar||u.avatar_url)) return false;
    if(id.indexOf('guest')===0 || id.indexOf('logged_out')===0) return false;
    if(name==='utilisateur' || name==='utilisateur happyad' || name.indexOf('aucun compte')>-1) return false;
    return true;
  }
  function readLocalProfile(){
    for(const key of USER_KEYS){
      const u=safeJSON(key);
      if(validUser(u)) return Object.assign({__source:key},u);
    }
    return {};
  }
  function profileFromAny(u){
    u = u || {};
    const name = clean(u.name||u.full_name||u.display_name||u.fullname||u.username||u.handle)||'Profil HAPPYAD';
    const handle = normHandle(u.handle||u.username||u.user_name||'');
    const avatar = clean(u.avatar||u.avatar_url||u.photo_url||u.picture||'');
    const badge = badgeValueFromAny(u);  // vrai badge du profil principal
    const bio = clean(u.bio||u.description||'');
    const id = clean(u.id||u.user_id||u.uid||u.uuid||localStorage.getItem('HAPPYAD_AUTH_UID')||'');
    return {id,name,handle,avatar,badge,bio,raw:u};
  }
  function escapeHTML(x){
    return String(x||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});
  }
  function badgeHTML(p, cls){
    const raw=badgeValueFromAny(p.raw||p)||p.badge;
    const c=realBadgeClass(raw);
    if(!c) return '';
    return '<span class="'+(cls||'happyBadgeMark')+' happyBadgeMark '+c+'" title="Badge HAPPYAD officiel" data-happyad-badge="'+escapeHTML(raw)+'"></span>';
  }
  function setAvatar(el, p){
    if(!el) return;
    el.classList.add('mainHappyadAvatar');
    const init=(p.name||'H').trim().charAt(0).toUpperCase()||'H';
    if(p.avatar){
      el.style.backgroundImage='url("'+String(p.avatar).replace(/"/g,'%22')+'")';
      el.style.backgroundSize='cover';
      el.style.backgroundPosition='center';
      el.textContent='';
    }else{
      el.style.backgroundImage='';
      el.textContent=init;
    }
  }
  function setText(el, text){ if(el) el.textContent=text; }
  function updateHappyadProfiles(p){
    try{
      window.happyadProfiles = window.happyadProfiles || (typeof happyadProfiles!=='undefined'?happyadProfiles:{});
      const prof={displayName:p.name,badge:badgeValueFromAny(p.raw||p)||p.badge||'none',avatar:p.avatar,handle:p.handle,id:p.id};
      [p.name,p.handle,p.id,'me','current','Vendeur HAPPYAD','Profil boutique'].forEach(function(k){ if(k) window.happyadProfiles[k]=prof; });
    }catch(e){}
    try{
      if(window.HAPPYAD_SUPABASE_CONFIG){
        window.HAPPYAD_SUPABASE_CONFIG.currentUserId = p.id || window.HAPPYAD_SUPABASE_CONFIG.currentUserId || null;
        window.HAPPYAD_SUPABASE_CONFIG.currentUserName = p.name || window.HAPPYAD_SUPABASE_CONFIG.currentUserName || 'Vendeur HAPPYAD';
      }
    }catch(e){}
  }
  function updateProfileProductsOwner(p){
    try{
      const uid=String(p.id||'');
      const handle=String(p.handle||'').replace(/^@+/,'').toLowerCase();
      const name=String(p.name||'').toLowerCase();
      window.happyadBoutiqueIsMine=function(prod){
        prod=prod||{};
        const sid=String(prod.seller_id||prod.user_id||prod.owner_id||'');
        const sh=String(prod.seller_handle||prod.username||prod.handle||'').replace(/^@+/,'').toLowerCase();
        const sn=String(prod.seller||prod.seller_name||prod.vendor_name||'').toLowerCase();
        return (!!uid && sid===uid) || (!!handle && sh===handle) || (!!name && sn===name);
      };
      const oldRender=window.renderProfilePublications || (typeof renderProfilePublications==='function'?renderProfilePublications:null);
      if(oldRender && !oldRender.__v87OwnFilter){
        window.renderProfilePublications=function(){
          try{
            const src=(typeof products!=='undefined' && Array.isArray(products)) ? products : (window.products||[]);
            const mine=src.filter(function(x){ return window.happyadBoutiqueIsMine(x); });
            const activeCat=(window.profileCat||profileCat||'all');
            const list=mine.filter(function(x){return activeCat==='all'||x.cat===activeCat;});
            const box=document.getElementById('profilePreview');
            if(box){
              box.innerHTML=list.length ? list.map(function(x){return publicationCard(x,true)}).join('') : '<div class="emptyBoutiqueBox"><b>Aucune publication</b><span>Les produits publiés depuis votre vrai profil HAPPYAD apparaîtront ici.</span></div>';
              if(typeof hydrateIcons==='function') hydrateIcons(box);
              return;
            }
          }catch(e){}
          return oldRender.apply(this,arguments);
        };
        window.renderProfilePublications.__v87OwnFilter=true;
      }
    }catch(e){}
  }
  function applyProfile(p){
    p=profileFromAny(p);
    updateHappyadProfiles(p);
    updateProfileProductsOwner(p);
    const hero=document.querySelector('#profile .vendorHero');
    if(hero){
      setAvatar(hero.querySelector('.vendorTop .avatar'),p);
      const nameEl=hero.querySelector('.happyadName');
      if(nameEl){ nameEl.innerHTML=escapeHTML(p.name)+' '+badgeHTML(p,'happyadBadge'); }
      setText(hero.querySelector('.vendorTop .small'), p.handle ? '@'+p.handle : 'Profil HAPPYAD principal');
      const status=hero.querySelector('.status');
      if(status){
        const dot=status.querySelector('i');
        status.textContent='Connecté au profil principal';
        if(dot) status.prepend(dot);
      }
    }
    const publicCard=document.querySelector('#profile .publicCard');
    if(publicCard){
      setAvatar(publicCard.querySelector('.publicCardTop .avatar'),p);
      setText(publicCard.querySelector('.publicCardTop h3'),p.name);
      setText(publicCard.querySelector('.publicCardTop p'),p.handle ? '@'+p.handle : (p.bio || 'Profil HAPPYAD principal'));
      const spans=publicCard.querySelectorAll('.ratingLine span');
      if(spans && spans.length>1) spans[1].textContent='Profil boutique HAPPYAD';
      const summary=publicCard.querySelector('div[style*="margin-top"]');
      if(summary) summary.textContent='Connecté au vrai profil principal';
    }
    const settings=document.querySelector('#settings .infoItem .rowInfo span');
    if(settings) settings.textContent=(p.handle?'@'+p.handle:'Profil principal')+' · '+p.name;
    const n=document.getElementById('editShopName'); if(n && !n.value) n.value=p.name;
    const d=document.getElementById('editShopDesc'); if(d && !d.value) d.value=p.bio||'';
    const pn=document.getElementById('previewShopName'); if(pn) pn.textContent=p.name;
    const pd=document.getElementById('previewShopDesc'); if(pd) pd.textContent=p.bio||'Profil connecté à HAPPYAD principal';
    try{ if(typeof hydrateIcons==='function') hydrateIcons(document.getElementById('profile')||document); }catch(e){}
    try{ if(typeof renderProfilePublications==='function') renderProfilePublications(); }catch(e){}
  }
  async function loadRemoteProfile(){
    let local=profileFromAny(readLocalProfile());
    applyProfile(local);
    try{
      const cfg=window.HAPPYAD_SUPABASE_CONFIG||{};
      const c=window.happyadBoutiqueSupabase || (window.supabase&&window.supabase.createClient&&cfg.url&&cfg.anonKey ? window.supabase.createClient(cfg.url,cfg.anonKey,{auth:{persistSession:true,autoRefreshToken:true}}) : null);
      if(!c || !c.auth || !c.auth.getUser) return local;
      window.happyadBoutiqueSupabase=c;
      const gu=await c.auth.getUser();
      const au=gu&&gu.data&&gu.data.user;
      if(!au || !au.id) return local;
      try{ localStorage.setItem('HAPPYAD_AUTH_UID',au.id); }catch(e){}
      const pr=await c.from('profiles').select('*').eq('id',au.id).maybeSingle();
      if(pr && pr.data){
        const merged=Object.assign({}, local.raw||{}, {
          id: pr.data.id || au.id,
          name: pr.data.full_name || local.name,
          full_name: pr.data.full_name || local.name,
          handle: pr.data.username || local.handle,
          username: pr.data.username || local.handle,
          avatar: pr.data.avatar_url || local.avatar,
          avatar_url: pr.data.avatar_url || local.avatar,
          badge: badgeValueFromAny(pr.data) || local.badge,
          bio: pr.data.bio || local.bio
        });
        try{ localStorage.setItem('HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL', JSON.stringify(merged)); }catch(e){}
        applyProfile(merged);
        return profileFromAny(merged);
      }
    }catch(e){ console.warn('[HAPPYAD Boutique V87] profil principal non chargé depuis Supabase', e); }
    return local;
  }
  const oldShow=window.show;
  if(typeof oldShow==='function' && !oldShow.__v87ProfileSync){
    window.show=function(){
      const r=oldShow.apply(this,arguments);
      setTimeout(function(){applyProfile(readLocalProfile());},10);
      return r;
    };
    window.show.__v87ProfileSync=true;
  }
  window.HAPPYAD_BOUTIQUE_PROFILE_SYNC={readLocalProfile,applyProfile,loadRemoteProfile};
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){loadRemoteProfile();});
  else loadRemoteProfile();
  setTimeout(loadRemoteProfile,700);
})();
