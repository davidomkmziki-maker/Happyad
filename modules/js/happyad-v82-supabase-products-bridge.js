// HAPPYAD Boutique V82 - Connexion Supabase produits seulement
// Objectif : charger/publier/modifier les produits sans toucher aux commandes existantes.
(function(){
  if(window.__happyadV82SupabaseProductsBridge) return;
  window.__happyadV82SupabaseProductsBridge = true;

  const cfg = window.HAPPYAD_SUPABASE_CONFIG || {};
  let db = null;
  let realtimeStarted = false;
  let loading = false;
  let reloadTimer = null;
  let cacheLoadedOnce = false;
  const CACHE_KEY = 'HAPPYAD_BOUTIQUE_PRODUCTS_CACHE_V1';
  const MAP_KEY = 'HAPPYAD_BOUTIQUE_POST_PRODUCT_MAP_V1';

  function configured(){
    return !!(cfg.enabled && cfg.url && cfg.anonKey && window.supabase && window.supabase.createClient);
  }
  function client(){
    if(!configured()) return null;
    if(!db) db = window.supabase.createClient(cfg.url, cfg.anonKey, {
      auth: { persistSession: true, autoRefreshToken: true }
    });
    return db;
  }
  function toastSafe(msg){ try{ if(typeof toast==='function') toast(msg); }catch(e){} }
  function log(){ try{ console.log.apply(console, ['[HAPPYAD V82 Supabase]'].concat([].slice.call(arguments))); }catch(e){} }
  function productList(){ try{ return Array.isArray(products) ? products : []; }catch(e){ return []; } }
  function activeScreen(){
    try{ return String(currentScreen || 'home'); }catch(e){}
    try{ return String(window.currentScreen || 'home'); }catch(e){}
    var active = document.querySelector('.module.active');
    return active ? String(active.id || 'home') : 'home';
  }
  function callRender(fn){
    try{ if(typeof window[fn]==='function') return window[fn](); }catch(e){}
    try{ if(typeof eval(fn)==='function') return eval(fn)(); }catch(e){}
  }
  function refreshVisibleOnly(){
    // Ne recharge plus toute la Boutique à chaque sync Supabase : seulement l'écran visible + compteurs.
    var screen = activeScreen();
    try{ callRender('renderProducts'); }catch(e){}
    try{ if(screen==='home') callRender('renderHomeSections'); }catch(e){}
    try{ if(screen==='profile') callRender('renderProfilePublications'); }catch(e){}
    try{ if(screen==='vendor') callRender('renderVendorPublications'); }catch(e){}
    try{ if(screen==='products') callRender('renderMine'); }catch(e){}
    try{ if(screen==='stats') callRender('renderStats'); }catch(e){}
    try{ if(screen==='cart') callRender('renderCart'); }catch(e){}
    try{ if(screen==='sellerOrders') callRender('renderSellerOrders'); }catch(e){}
    try{ callRender('syncCartCount'); callRender('updatePublicPreviewRating'); callRender('updateDeliveryCounters'); }catch(e){}
    try{ hydrateIcons(document.querySelector('.module.active') || document); }catch(e){}
    try{ if(window.HAPPYAD_BOUTIQUE_MEDIA_SAFE && typeof window.HAPPYAD_BOUTIQUE_MEDIA_SAFE.hydrate==='function') window.HAPPYAD_BOUTIQUE_MEDIA_SAFE.hydrate(document.querySelector('.module.active') || document); }catch(e){}
  }
  function refreshAll(){ refreshVisibleOnly(); }
  function saveProductsCache(items){
    try{
      localStorage.setItem(CACHE_KEY, JSON.stringify({t:Date.now(), items:Array.isArray(items)?items:[]}));
      savePostProductMap(items);
    }catch(e){}
  }
  function savePostProductMap(items){
    try{
      const old = JSON.parse(localStorage.getItem(MAP_KEY) || '{}') || {};
      (items||[]).forEach(function(p){
        const postId = String((p&& (p.linkedHappyadPostId||p.happyadPostId||p.linked_post_id||p.happyad_post_id||p.postId||p.post_id)) || '').trim();
        const productId = String((p&& (p.id||p.product_id)) || '').trim();
        if(postId && productId) old[postId] = productId;
      });
      localStorage.setItem(MAP_KEY, JSON.stringify(old));
    }catch(e){}
  }

  function loadProductsCache(){
    if(cacheLoadedOnce) return false;
    cacheLoadedOnce = true;
    try{
      const raw = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if(!raw || !Array.isArray(raw.items) || !raw.items.length) return false;
      const arr = productList();
      (raw.items||[]).forEach(function(p){ try{ rememberSeller(normalizeSellerProfile({}, p), p); }catch(e){} });
      arr.splice.apply(arr, [0, arr.length].concat(raw.items));
      savePostProductMap(raw.items);
      refreshVisibleOnly();
      return true;
    }catch(e){ return false; }
  }
  function money(amount,currency){
    amount = Number(amount||0) || 0;
    currency = String(currency||'UGX').toUpperCase();
    try{ if(typeof window.formatBoutiqueMoney==='function') return window.formatBoutiqueMoney(amount,currency); }catch(e){}
    if(currency==='UGX'){
      if(amount>=1000000){ var m=amount/1000000; return (m%1===0?Math.round(m):m.toFixed(1).replace(/\.0$/,''))+'M UGX'; }
      if(amount>=1000){ var k=amount/1000; return (k%1===0?Math.round(k):k.toFixed(1).replace(/\.0$/,''))+'K UGX'; }
    }
    return Math.round(amount)+' '+currency;
  }
  function parsePriceFromProduct(p){
    try{ if(window.HAPPYAD_CURRENCY_TOOLS && typeof window.HAPPYAD_CURRENCY_TOOLS.parsePrice==='function') return window.HAPPYAD_CURRENCY_TOOLS.parsePrice(p); }catch(e){}
    const currency = String(p.currency || p.currencyCode || p.devise || 'UGX').toUpperCase();
    let amount = Number(p.priceAmount || p.unitAmount || p.amount || 0);
    if(!amount){
      const raw = String(p.price || p.priceText || '').replace(/,/g,'.');
      const n = Number((raw.match(/[0-9.]+/)||['0'])[0]) || 0;
      amount = /\bK\b/i.test(raw) ? n*1000 : (/\bM\b/i.test(raw) ? n*1000000 : n);
    }
    return {amount:amount, currency:currency};
  }
  function normalizeMediaRow(row, idx){
    row = row || {};
    return {
      id: row.id || ('media-'+idx),
      url: row.media_url || row.url || row.src || '',
      type: String(row.media_type || row.type || 'photo').toLowerCase()==='video' ? 'video' : 'photo',
      label: row.label || (String(row.media_type || row.type || 'photo').toLowerCase()==='video' ? 'Vidéo' : 'Photo '+(idx+1)),
      orientation: row.orientation || 'natural',
      sort_order: Number(row.sort_order==null?idx:row.sort_order)||idx,
      is_home_cover: !!row.is_home_cover
    };
  }
  function normalizeZoneRow(row){
    row = row || {};
    return {
      name: row.zone_name || row.name || row.zone || 'Zone livraison',
      hours: Math.max(1, Number(row.delivery_hours || row.hours || row.delay || 2)||2)
    };
  }
  function normalizeProductRow(row, mediaRows, zoneRows){
    row = row || {};
    const media = (mediaRows||[]).map(normalizeMediaRow).sort(function(a,b){return (a.sort_order||0)-(b.sort_order||0)});
    const homeMedia = media.filter(function(m){return !!m.is_home_cover});
    const boutiqueMedia = media.filter(function(m){return !m.is_home_cover});
    const amount = Number(row.price_amount || row.amount || 0) || 0;
    const currency = String(row.currency || 'UGX').toUpperCase();
    const rating = row.rating_avg==null ? '0' : String(Math.round(Number(row.rating_avg||0)*10)/10);
    return {
      id: row.id,
      name: row.title || row.name || 'Produit boutique',
      cat: String(row.category || row.cat || 'mode').toLowerCase(),
      seller: row.seller_name || row.seller || row.vendor_name || cfg.currentUserName || 'Vendeur HAPPYAD',
      seller_id: row.seller_id || row.user_id || null,
      price: money(amount,currency),
      priceText: money(amount,currency),
      unitAmount: amount,
      priceAmount: amount,
      currency: currency,
      currencyCode: currency,
      devise: currency,
      tag: row.tag || 'Boutique',
      rate: rating,
      desc: row.description || row.caption || '',
      postType: 'boutique',
      source: 'supabase',
      linkedHappyadPostId: row.linked_post_id || row.happyad_post_id || null,
      happyadPostId: row.linked_post_id || row.happyad_post_id || null,
      homeMedia: homeMedia.length ? homeMedia : media.slice(0,1),
      homeMediaUrl: (homeMedia[0] || media[0] || {}).url || '',
      homeMediaType: 'photo',
      homeVisibleCount: homeMedia.length || (media.length ? 1 : 0),
      boutiqueMedia: boutiqueMedia.length ? boutiqueMedia : media,
      media: media,
      mediaCount: media.length,
      deliveryZones: (zoneRows||[]).map(normalizeZoneRow),
      cart_enabled: row.cart_enabled !== false,
      status: row.status || 'active',
      created_at: row.created_at,
      updated_at: row.updated_at,
      _supabase: true
    };
  }
  function setProductCartStateFromRows(rows){
    try{
      if(typeof productCartEnabled==='undefined') return;
      (rows||[]).forEach(function(row){ productCartEnabled[row.id] = row.cart_enabled !== false; });
    }catch(e){}
  }
  function groupBy(rows, key){
    const out = {};
    (rows||[]).forEach(function(r){ const k=String(r[key]); (out[k]=out[k]||[]).push(r); });
    return out;
  }
  function clean(v){ return String(v==null?'':v).trim(); }
  function profileName(row){ return clean(row && (row.full_name || row.display_name || row.name || row.username || row.seller_name || row.seller)); }
  function profileAvatar(row){ return clean(row && (row.avatar_url || row.avatar || row.photo_url || row.photo || row.profile_photo || row.picture || row.image)); }
  function profileBadge(row){ return clean(row && (row.badge || row.user_badge || row.badge_type || row.certification || row.blue_badge || row.verifyBadge || row.verified_badge || row.role_badge || row.profile_badge)); }
  function normalizeSellerProfile(row, fallback){
    row=row||{}; fallback=fallback||{};
    const id=clean(row.id || row.user_id || row.uid || row.auth_id || fallback.seller_id || fallback.user_id);
    const name=profileName(row) || clean(fallback.seller_name || fallback.seller || fallback.vendor_name) || 'Vendeur HAPPYAD';
    const username=clean(row.username || row.handle || fallback.seller_username || fallback.seller_handle);
    const avatar=profileAvatar(row) || clean(fallback.seller_avatar || fallback.avatar_url || fallback.avatar);
    const badge=profileBadge(row) || clean(fallback.seller_badge || fallback.badge);
    return Object.assign({}, row, {id:id||row.id, user_id:id||row.user_id, displayName:name, full_name:name, name:name, username:username, handle:username, avatar:avatar, avatar_url:avatar, badge:badge||'none'});
  }
  function rememberSeller(profile, product){
    try{
      if(typeof window.rememberHappyadSellerProfile==='function') return window.rememberHappyadSellerProfile(profile, product||{});
    }catch(e){}
    return normalizeSellerProfile(profile, product||{});
  }
  function applySellerProfile(product, profile){
    if(!product || !profile) return product;
    const prof=normalizeSellerProfile(profile, product);
    product.seller_id = product.seller_id || prof.id || prof.user_id || null;
    product.seller = prof.displayName || product.seller || 'Vendeur HAPPYAD';
    product.seller_name = prof.displayName || product.seller;
    product.seller_display_name = prof.displayName || product.seller;
    product.seller_username = prof.username || prof.handle || product.seller_username || '';
    product.seller_avatar = prof.avatar || prof.avatar_url || product.seller_avatar || '';
    product.avatar_url = product.seller_avatar || product.avatar_url || '';
    product.seller_badge = prof.badge || product.seller_badge || 'none';
    product.badge = product.seller_badge;
    rememberSeller(prof, product);
    return product;
  }
  async function loadSellerProfiles(c, productRows){
    const map={};
    const byName={};
    const ids=[];
    (productRows||[]).forEach(function(row){
      const id=clean(row && (row.seller_id || row.user_id || row.owner_id || row.creator_id));
      if(id && ids.indexOf(id)<0) ids.push(id);
      const name=clean(row && (row.seller_name || row.seller || row.vendor_name));
      if(name) byName[name.toLowerCase()]=normalizeSellerProfile({full_name:name,id:id}, row);
    });
    try{
      if(ids.length){
        const res = await c.from('profiles').select('id,full_name,username,avatar_url,badge').in('id', ids);
        if(!res.error){
          (res.data||[]).forEach(function(row){
            const prof=normalizeSellerProfile(row, {});
            if(prof.id) map[String(prof.id)] = prof;
            if(prof.user_id) map[String(prof.user_id)] = prof;
            if(prof.displayName) byName[String(prof.displayName).toLowerCase()] = prof;
            if(prof.username) byName[String(prof.username).toLowerCase()] = prof;
            rememberSeller(prof, {});
          });
        }else{
          log('profiles non bloquant', res.error);
        }
      }
    }catch(e){ log('chargement profils vendeurs non bloquant', e); }
    return {byId:map, byName:byName};
  }
  async function loadProductsFromSupabase(opts){
    const c = client();
    if(!c || loading) return false;
    loading = true;
    try{
      const productQuery = c.from('boutique_products').select('*').neq('status','deleted').order('created_at', {ascending:false});
      const productRes = await productQuery;
      if(productRes.error) throw productRes.error;
      const rows = productRes.data || [];
      const ids = rows.map(function(p){return p.id}).filter(function(x){return x!=null});
      let mediaRows=[], zoneRows=[];
      if(ids.length){
        const pair = await Promise.all([
          c.from('boutique_product_media').select('*').in('product_id', ids).order('sort_order', {ascending:true}),
          c.from('boutique_delivery_zones').select('*').in('product_id', ids).eq('is_active', true).order('sort_order', {ascending:true})
        ]);
        const mediaRes = pair[0], zoneRes = pair[1];
        if(mediaRes.error) throw mediaRes.error;
        if(zoneRes.error) throw zoneRes.error;
        mediaRows = mediaRes.data || [];
        zoneRows = zoneRes.data || [];
      }
      const mediaByProduct = groupBy(mediaRows, 'product_id');
      const zonesByProduct = groupBy(zoneRows, 'product_id');
      const sellerProfiles = await loadSellerProfiles(c, rows);
      const mapped = rows.map(function(row){
        const p = normalizeProductRow(row, mediaByProduct[String(row.id)]||[], zonesByProduct[String(row.id)]||[]);
        const sid = clean(p.seller_id || row.seller_id || row.user_id);
        const sname = clean(p.seller || row.seller_name || row.seller || row.vendor_name).toLowerCase();
        const prof = (sid && sellerProfiles.byId[sid]) || (sname && sellerProfiles.byName[sname]) || normalizeSellerProfile({}, row);
        return applySellerProfile(p, prof);
      });
      const arr = productList();
      arr.splice.apply(arr, [0, arr.length].concat(mapped));
      saveProductsCache(mapped);
      setProductCartStateFromRows(rows);
      refreshVisibleOnly();
      if(opts && opts.toast) toastSafe(mapped.length+' produit'+(mapped.length>1?'s':'')+' chargé'+(mapped.length>1?'s':''));
      startRealtime();
      return true;
    }catch(err){
      console.error('[HAPPYAD V82 Supabase] load products failed', err);
      if(!opts || opts.toast) toastSafe('Connexion produits Supabase impossible');
      return false;
    }finally{
      loading = false;
    }
  }
  async function replaceProductMedia(productId, media){
    const c = client(); if(!c || !productId) return;
    await c.from('boutique_product_media').delete().eq('product_id', productId);
    const rows = (Array.isArray(media)?media:[]).map(function(m,i){
      return {
        product_id: productId,
        media_url: m.url || m.media_url || m.src || '',
        media_type: String(m.type || m.media_type || 'photo').toLowerCase()==='video' ? 'video' : 'photo',
        label: m.label || null,
        orientation: m.orientation || 'natural',
        sort_order: Number(m.sort_order==null?i:m.sort_order)||i,
        is_home_cover: !!m.is_home_cover
      };
    }).filter(function(r){return !!r.media_url});
    if(rows.length) await c.from('boutique_product_media').insert(rows);
  }
  async function replaceDeliveryZones(productId, zones){
    const c = client(); if(!c || !productId) return;
    await c.from('boutique_delivery_zones').delete().eq('product_id', productId);
    const rows = (Array.isArray(zones)?zones:[]).map(function(z,i){
      return {product_id:productId, zone_name:z.name||z.zone||'Zone livraison', delivery_hours:Math.max(1,Number(z.hours||z.delay||2)||2), sort_order:i, is_active:true};
    });
    if(rows.length) await c.from('boutique_delivery_zones').insert(rows);
  }
  function buildWithExistingBridge(payload){
    if(window.HAPPYAD_BOUTIQUE_BRIDGE && typeof window.HAPPYAD_BOUTIQUE_BRIDGE.buildPostAndProduct==='function') return window.HAPPYAD_BOUTIQUE_BRIDGE.buildPostAndProduct(payload||{});
    return {ok:false, errors:['Pont Boutique indisponible']};
  }
  async function publishToSupabase(payload){
    const c = client();
    if(!c) return null;
    const built = buildWithExistingBridge(payload||{});
    if(!built.ok){ toastSafe((built.errors||[])[0] || 'Publication impossible'); return built; }
    const p = built.product;
    const row = {
      seller_id: p.seller_id || cfg.currentUserId || null,
      seller_name: p.seller || cfg.currentUserName || 'Vendeur HAPPYAD',
      linked_post_id: p.linkedHappyadPostId || null,
      title: p.name,
      description: p.desc || '',
      category: p.cat || 'mode',
      price_amount: Number(p.priceAmount || p.unitAmount || 0)||0,
      currency: String(p.currency || 'UGX').toUpperCase(),
      cart_enabled: p.cart_enabled !== false,
      status: 'active'
    };
    try{
      const res = await c.from('boutique_products').insert(row).select('*').single();
      if(res.error) throw res.error;
      const created = res.data;
      const allMedia = (built.media||[]).map(function(m){return Object.assign({}, m)});
      const homeIds = {};
      (built.homeMedia||[]).forEach(function(h){ homeIds[h.id||h.url]=true; });
      allMedia.forEach(function(m){ if(homeIds[m.id||m.url]) m.is_home_cover=true; });
      await replaceProductMedia(created.id, allMedia);
      await replaceDeliveryZones(created.id, p.deliveryZones || []);
      try{
        if(built.post){
          await c.from('happyad_posts').upsert({
            id: built.post.id,
            user_id: built.post.user_id || row.seller_id,
            post_type: 'boutique',
            caption: built.post.caption || row.description || row.title,
            home_media_url: built.post.home_media_url || (built.homeMedia[0]&&built.homeMedia[0].url) || null,
            home_media_type: 'photo',
            boutique_product_id: created.id,
            is_active: true
          }, {onConflict:'id'});
        }
      }catch(postErr){ log('happyad_posts non bloquant', postErr); }
      await loadProductsFromSupabase();
      toastSafe('Produit publié dans Supabase');
      return {ok:true, product:created, media:allMedia};
    }catch(err){
      console.error('[HAPPYAD V82 Supabase] publish failed', err);
      toastSafe('Publication Supabase impossible');
      return {ok:false, errors:[err.message||String(err)]};
    }
  }
  async function updateProductInSupabase(productId, patch){
    const c = client(); if(!c || !productId) return false;
    try{
      const res = await c.from('boutique_products').update(Object.assign({}, patch, {updated_at:new Date().toISOString()})).eq('id', productId).select('*').single();
      if(res.error) throw res.error;
      return true;
    }catch(err){
      console.error('[HAPPYAD V82 Supabase] update failed', err);
      toastSafe('Mise à jour Supabase impossible');
      return false;
    }
  }
  async function saveCurrentProductToSupabase(productId){
    const p = productList().find(function(x){return String(x.id)===String(productId)});
    if(!p) return false;
    const moneyInfo = parsePriceFromProduct(p);
    const ok = await updateProductInSupabase(productId, {
      title: p.name || 'Produit boutique',
      description: p.desc || '',
      category: p.cat || 'mode',
      price_amount: Number(moneyInfo.amount||0)||0,
      currency: String(moneyInfo.currency||'UGX').toUpperCase(),
      cart_enabled: productCartEnabled && productCartEnabled[p.id] !== false
    });
    if(ok){
      await replaceDeliveryZones(productId, p.deliveryZones || []);
      toastSafe('Produit mis à jour dans Supabase');
    }
    return ok;
  }
  async function setProductCartEnabled(productId, enabled){
    const ok = await updateProductInSupabase(productId, {cart_enabled: !!enabled});
    return ok;
  }
  async function setAllVisibleProductsCartEnabled(enabled){
    const c = client(); if(!c) return false;
    const ids = productList().map(function(p){return p.id}).filter(function(x){return x!=null});
    if(!ids.length) return false;
    try{
      const res = await c.from('boutique_products').update({cart_enabled:!!enabled, updated_at:new Date().toISOString()}).in('id', ids);
      if(res.error) throw res.error;
      return true;
    }catch(err){ console.error('[HAPPYAD V82 Supabase] update all cart failed',err); return false; }
  }
  function scheduleProductsReload(){
    clearTimeout(reloadTimer);
    reloadTimer = setTimeout(function(){ loadProductsFromSupabase({toast:false}); }, 700);
  }
  function startRealtime(){
    const c = client();
    if(!c || realtimeStarted) return;
    realtimeStarted = true;
    try{
      c.channel('happyad-boutique-products-v82')
        .on('postgres_changes', {event:'*', schema:'public', table:'boutique_products'}, scheduleProductsReload)
        .on('postgres_changes', {event:'*', schema:'public', table:'boutique_product_media'}, scheduleProductsReload)
        .on('postgres_changes', {event:'*', schema:'public', table:'boutique_delivery_zones'}, scheduleProductsReload)
        .subscribe();
    }catch(e){ console.warn('[HAPPYAD V82 Supabase] realtime disabled', e); }
  }

  const oldRefreshMarket = window.refreshMarket || (typeof refreshMarket==='function' ? refreshMarket : null);
  window.refreshMarket = function(){
    if(configured()) return loadProductsFromSupabase({toast:true});
    if(typeof oldRefreshMarket==='function') return oldRefreshMarket.apply(this, arguments);
  };

  const oldPublish = window.publishHappyadBoutique;
  window.publishHappyadBoutique = function(payload){
    if(configured()) return publishToSupabase(payload);
    if(typeof oldPublish==='function') return oldPublish.apply(this, arguments);
    return buildWithExistingBridge(payload||{});
  };

  const oldSaveProductEdit = window.saveProductEdit || (typeof saveProductEdit==='function' ? saveProductEdit : null);
  window.saveProductEdit = function(){
    let id = null;
    try{ id = editingProductId; }catch(e){}
    const r = oldSaveProductEdit ? oldSaveProductEdit.apply(this, arguments) : undefined;
    if(configured() && id!=null) saveCurrentProductToSupabase(id).then(function(){ return loadProductsFromSupabase(); });
    return r;
  };

  const oldToggleProductCart = window.toggleProductCart || (typeof toggleProductCart==='function' ? toggleProductCart : null);
  window.toggleProductCart = function(id){
    const r = oldToggleProductCart ? oldToggleProductCart.apply(this, arguments) : undefined;
    try{ if(configured()) setProductCartEnabled(id, productCartEnabled[id] !== false); }catch(e){}
    return r;
  };

  const oldToggleGlobalCart = window.toggleGlobalCart || (typeof toggleGlobalCart==='function' ? toggleGlobalCart : null);
  window.toggleGlobalCart = function(){
    const r = oldToggleGlobalCart ? oldToggleGlobalCart.apply(this, arguments) : undefined;
    try{ if(configured()) setAllVisibleProductsCartEnabled(globalCartEnabled); }catch(e){}
    return r;
  };

  window.HAPPYAD_SUPABASE_PRODUCTS = {
    configured: configured,
    client: client,
    loadProducts: loadProductsFromSupabase,
    publishProduct: publishToSupabase,
    updateProduct: updateProductInSupabase,
    syncCurrentProduct: saveCurrentProductToSupabase,
    setCartEnabled: setProductCartEnabled,
    loadCache: loadProductsCache,
    refreshVisibleOnly: refreshVisibleOnly,
    loadSellerProfiles: loadSellerProfiles,
    rememberSeller: rememberSeller
  };

  setTimeout(function(){
    loadProductsCache();
    if(configured()) loadProductsFromSupabase({toast:false});
    else log('désactivé : remplir happyad-v82-supabase-config.js');
  }, 80);
})();
