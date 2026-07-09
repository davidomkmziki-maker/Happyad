// V109 SAFE — Profil vendeur réel dans détails boutique
// Corrige uniquement : photo profil réelle + clic Profil depuis Détails produit.
(function(){
  if(window.__HAPPYAD_V109_BOUTIQUE_PROFILE_REAL__) return;
  window.__HAPPYAD_V109_BOUTIQUE_PROFILE_REAL__ = true;

  const PROFILE_KEYS = [
    'HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL',
    'HAPPYAD_USER',
    'HAPPYAD_ACTIVE_PROFILE',
    'HAPPYAD_OPEN_CHAT_PROFILE',
    'HAPPYAD_MAIN_PROFILE',
    'HAPPYAD_PROFILE'
  ];
  const cache = {};

  function clean(v){return String(v==null?'':v).trim();}
  function lower(v){return clean(v).toLowerCase().replace(/^@+/, '');}
  function safeJson(key){
    try{const v=JSON.parse(localStorage.getItem(key)||'null'); return v&&typeof v==='object'?v:null;}catch(e){return null;}
  }
  function avatarOf(p){
    return clean(p && (p.avatar || p.avatar_url || p.photo || p.photo_url || p.image || p.profile_photo || p.picture || p.userAvatar || p.authorAvatar || p.sellerAvatar || p.seller_avatar));
  }
  function nameOf(p){
    return clean(p && (p.name || p.full_name || p.display_name || p.seller_name || p.sellerName || p.seller || p.username || p.handle || p.email));
  }
  function badgeOf(p){
    return clean(p && (p.badge || p.verifiedBadge || p.verifyLevel || p.userBadge || p.user_badge || p.sellerBadge || p.seller_badge));
  }
  function handleOf(p){ return clean(p && (p.handle || p.username || p.seller_handle || p.sellerHandle)); }
  function idOf(p){ return clean(p && (p.id || p.user_id || p.uid || p.uuid || p.auth_id || p.seller_id || p.owner_id || p.creator_id)); }

  function currentProduct(){
    return window.activeDetailProduct || window.currentDetailProduct || null;
  }
  function productProfileFields(p){
    p = p || {};
    return {
      id: clean(p.seller_id || p.user_id || p.owner_id || p.creator_id || p.vendor_id),
      name: clean(p.seller_name || p.sellerName || p.seller || p.vendor_name || p.vendor || ''),
      full_name: clean(p.seller_name || p.sellerName || p.seller || p.vendor_name || p.vendor || ''),
      username: clean(p.seller_username || p.sellerHandle || p.seller_handle || ''),
      handle: clean(p.seller_username || p.sellerHandle || p.seller_handle || ''),
      avatar: avatarOf(p),
      avatar_url: avatarOf(p),
      badge: badgeOf(p)
    };
  }
  function allLocalProfiles(){
    const out = [];
    PROFILE_KEYS.forEach(k=>{const p=safeJson(k); if(p) out.push(p);});
    try{
      const raw = JSON.parse(localStorage.getItem('HAPPYAD_KNOWN_PROFILES_V1')||'[]');
      if(Array.isArray(raw)) raw.forEach(x=>x&&out.push(x));
    }catch(e){}
    return out;
  }
  function sameProfile(profile, product){
    const pf = productProfileFields(product);
    const ids = [idOf(profile), clean(profile && profile.user_id), clean(profile && profile.auth_id)].map(lower).filter(Boolean);
    const names = [nameOf(profile), handleOf(profile)].map(lower).filter(Boolean);
    const pids = [pf.id].map(lower).filter(Boolean);
    const pnames = [pf.name, pf.handle].map(lower).filter(Boolean);
    if(ids.length && pids.length && ids.some(x=>pids.includes(x))) return true;
    if(names.length && pnames.length && names.some(x=>pnames.includes(x))) return true;
    return false;
  }
  function cachedProfileForProduct(product){
    const pf = productProfileFields(product);
    try{
      const hp = window.happyadProfiles || (typeof happyadProfiles!=='undefined' ? happyadProfiles : {});
      const keys = [pf.id, pf.name, pf.handle, product&&product.seller, product&&product.seller_id].map(clean).filter(Boolean);
      for(const k of keys){
        const direct = hp[k] || hp[lower(k)];
        if(direct && (avatarOf(direct) || badgeOf(direct) || nameOf(direct))) return normalizeProfile(direct, product);
      }
    }catch(e){}
    return null;
  }
  function rememberProfile(profile, product){
    try{ if(typeof window.rememberHappyadSellerProfile==='function') window.rememberHappyadSellerProfile(profile, product||{}); }catch(e){}
    try{
      if(product && profile){
        const norm = normalizeProfile(profile, product);
        product.seller = norm.name || product.seller;
        product.seller_name = norm.name || product.seller_name;
        product.seller_display_name = norm.name || product.seller_display_name;
        product.seller_username = norm.username || product.seller_username || '';
        product.seller_avatar = norm.avatar || product.seller_avatar || '';
        product.avatar_url = norm.avatar || product.avatar_url || '';
        product.seller_badge = norm.badge || product.seller_badge || 'none';
        product.badge = product.seller_badge;
      }
    }catch(e){}
  }
  function localProfileForProduct(product){
    const cached = cachedProfileForProduct(product);
    if(cached && (cached.avatar || cached.badge || cached.name)) return cached;
    const direct = productProfileFields(product);
    if(direct.avatar || (direct.badge && direct.badge!=='none')) return normalizeProfile(direct, product);
    const all = allLocalProfiles();
    const found = all.find(p=>sameProfile(p, product));
    if(found) return normalizeProfile(found, product);
    return normalizeProfile(direct, product);
  }
  function normalizeProfile(profile, product){
    const pf = productProfileFields(product);
    profile = profile || {};
    const id = idOf(profile) || pf.id;
    const name = nameOf(profile) || pf.name || 'Vendeur HAPPYAD';
    const handle = handleOf(profile) || pf.handle || '';
    const avatar = avatarOf(profile) || pf.avatar || '';
    const badge = badgeOf(profile) || pf.badge || '';
    return {id:id, user_id:id, name:name, full_name:name, username:handle, handle:handle, avatar:avatar, avatar_url:avatar, badge:badge};
  }
  function isCurrentUserProduct(product, profile){
    const me = normalizeProfile(safeJson('HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL') || safeJson('HAPPYAD_USER') || {}, {});
    const pid = lower((profile&&profile.id) || (product&&product.seller_id) || '');
    if(pid && lower(me.id) && pid === lower(me.id)) return true;
    const pn = lower((profile&&profile.name) || (product&&product.seller) || '');
    return !!(pn && lower(me.name) && pn === lower(me.name));
  }

  async function remoteProfileForProduct(product){
    try{
      const pf = productProfileFields(product);
      const id = pf.id;
      if(!id) return null;
      if(cache[id]) return cache[id];
      let c = null;
      try{ if(window.HAPPYAD_SUPABASE_PRODUCTS && typeof window.HAPPYAD_SUPABASE_PRODUCTS.client==='function') c = window.HAPPYAD_SUPABASE_PRODUCTS.client(); }catch(e){}
      if(!c) c = window.happyadBoutiqueSupabase || null;
      if(!c || !c.from) return null;
      const r = await c.from('profiles').select('id,full_name,username,avatar_url,badge,bio').eq('id', id).maybeSingle();
      if(r && r.data){
        cache[id] = normalizeProfile(r.data, product);
        rememberProfile(cache[id], product);
        return cache[id];
      }
    }catch(e){ console.warn('[HAPPYAD V109] profil vendeur distant non chargé', e); }
    return null;
  }

  function setAvatar(el, profile, product){
    if(!el) return;
    profile = normalizeProfile(profile, product);
    const av = avatarOf(profile);
    if(av){
      el.classList.add('hasRealAvatar');
      el.innerHTML = '<img src="'+av.replace(/"/g,'&quot;')+'" alt="'+(profile.name||'Profil').replace(/"/g,'&quot;')+'">';
    }else{
      el.classList.remove('hasRealAvatar');
      el.textContent = (profile.name || (product&&product.seller) || 'V').trim().slice(0,1).toUpperCase();
    }
  }
  function updateSellerCompact(profile){
    const p = currentProduct();
    if(!p) return;
    profile = normalizeProfile(profile || localProfileForProduct(p), p);
    const box = document.querySelector('#detailBox .sellerCompact');
    if(!box) return;
    setAvatar(box.querySelector('.avatar'), profile, p);

    const nameNode = box.querySelector('.sellerLineName');
    if(nameNode && profile.name){
      // Garder le badge déjà rendu par le système original, remplacer seulement le texte si nécessaire.
      const badge = nameNode.querySelector('.happyBadgeMark,.sellerBadge');
      nameNode.childNodes.forEach(n=>{ if(n.nodeType===3) n.textContent=''; });
      if(!nameNode.querySelector('.v109SellerName')){
        const span = document.createElement('span');
        span.className = 'v109SellerName';
        nameNode.insertBefore(span, nameNode.firstChild);
      }
      nameNode.querySelector('.v109SellerName').textContent = profile.name + ' ';
      if(!badge && profile.badge && typeof badgeSvg === 'function'){
        try{ rememberProfile(profile, p); nameNode.insertAdjacentHTML('beforeend', badgeSvg((p&&p.seller)||profile.name)); }catch(e){}
      }
    }
  }
  function updateVendorHero(profile, product){
    profile = normalizeProfile(profile, product || currentProduct());
    const box = document.querySelector('#vendorBox .vendorHero .avatar, #profile .vendorHero .avatar');
    if(box) setAvatar(box, profile, product || currentProduct());
  }
  function applyProfileNow(){
    const p = currentProduct();
    if(!p) return;
    const local = localProfileForProduct(p);
    rememberProfile(local, p);
    updateSellerCompact(local);
    remoteProfileForProduct(p).then(remote=>{
      if(remote){
        updateSellerCompact(remote);
        updateVendorHero(remote, p);
      }
    }).catch(()=>{});
  }

  function openRealSellerProfile(product){
    product = product || currentProduct();
    if(!product) return;
    const local = localProfileForProduct(product);
    const openOwn = isCurrentUserProduct(product, local);
    if(openOwn && typeof show === 'function'){
      show('profile');
      setTimeout(()=>updateVendorHero(local, product), 80);
      return;
    }
    if(typeof window.openVendor === 'function'){
      window.openVendor(product.seller || local.name || 'Vendeur HAPPYAD');
      setTimeout(()=>updateVendorHero(local, product), 80);
      remoteProfileForProduct(product).then(remote=>{ if(remote) setTimeout(()=>updateVendorHero(remote, product), 30); });
    }
  }

  function bindDetailSellerClick(){
    document.addEventListener('click', function(e){
      const hit = e.target && e.target.closest && e.target.closest('#detailBox .sellerCompact, #detailBox .sellerCompact .btn');
      if(!hit) return;
      e.preventDefault();
      e.stopPropagation();
      if(e.stopImmediatePropagation) e.stopImmediatePropagation();
      openRealSellerProfile(currentProduct());
    }, true);
  }

  const oldOpenDetail = window.openDetail;
  if(typeof oldOpenDetail === 'function' && !oldOpenDetail.__v109ProfileReal){
    const wrapped = function(){
      const r = oldOpenDetail.apply(this, arguments);
      setTimeout(applyProfileNow, 60);
      setTimeout(applyProfileNow, 500);
      return r;
    };
    wrapped.__v109ProfileReal = true;
    window.openDetail = wrapped;
  }

  const oldOpenVendor = window.openVendor;
  if(typeof oldOpenVendor === 'function' && !oldOpenVendor.__v109ProfileReal){
    const wrappedVendor = function(){
      const r = oldOpenVendor.apply(this, arguments);
      const p = currentProduct();
      if(p) setTimeout(()=>updateVendorHero(localProfileForProduct(p), p), 80);
      return r;
    };
    wrappedVendor.__v109ProfileReal = true;
    window.openVendor = wrappedVendor;
  }

  bindDetailSellerClick();
  setTimeout(applyProfileNow, 700);
})();
