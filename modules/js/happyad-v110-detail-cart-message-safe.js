// V110 SAFE — Boutons Détails produit : panier fonctionnel + message caché pour propriétaire
(function(){
  if(window.__HAPPYAD_V110_DETAIL_ACTIONS_SAFE__) return;
  window.__HAPPYAD_V110_DETAIL_ACTIONS_SAFE__ = true;

  const oldAddCart = window.addCart;
  const oldOpenMsg = window.openProductSellerMessage;

  function clean(v){ return String(v==null?'':v).trim(); }
  function lower(v){ return clean(v).toLowerCase().replace(/^@+/, ''); }
  function safeJson(key){
    try{ const v=JSON.parse(localStorage.getItem(key)||'null'); return v&&typeof v==='object'?v:null; }catch(e){ return null; }
  }
  function toastSafe(msg){ try{ if(typeof toast==='function') toast(msg); }catch(e){} }

  function listProductsSafe(){
    try{ if(Array.isArray(products)) return products; }catch(e){}
    try{ if(Array.isArray(window.products)) return window.products; }catch(e){}
    return [];
  }
  function productById(id){
    const list = listProductsSafe();
    return list.find(p=>String(p&&p.id)===String(id))
        || window.currentDetailProduct
        || window.activeDetailProduct
        || null;
  }
  function authId(){
    try{ if(window.HAPPYAD_SUPABASE_CONFIG && window.HAPPYAD_SUPABASE_CONFIG.currentUserId) return clean(window.HAPPYAD_SUPABASE_CONFIG.currentUserId); }catch(e){}
    try{ const v=clean(localStorage.getItem('HAPPYAD_AUTH_UID')); if(v) return v; }catch(e){}
    const p = safeJson('HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL') || safeJson('HAPPYAD_USER') || safeJson('HAPPYAD_ACTIVE_PROFILE') || {};
    return clean(p.id || p.user_id || p.uid || p.uuid || p.auth_id);
  }
  function authName(){
    try{ if(window.HAPPYAD_SUPABASE_CONFIG && window.HAPPYAD_SUPABASE_CONFIG.currentUserName) return clean(window.HAPPYAD_SUPABASE_CONFIG.currentUserName); }catch(e){}
    const p = safeJson('HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL') || safeJson('HAPPYAD_USER') || safeJson('HAPPYAD_ACTIVE_PROFILE') || {};
    return clean(p.name || p.full_name || p.display_name || p.username || p.handle || p.email);
  }
  function productSellerId(p){ return clean(p && (p.seller_id || p.user_id || p.owner_id || p.creator_id || p.vendor_id)); }
  function productSellerName(p){ return clean(p && (p.seller_name || p.sellerName || p.seller || p.vendor_name || p.vendor)); }

  function isOwner(p){
    if(!p) return false;
    const sid = lower(productSellerId(p));
    const aid = lower(authId());
    if(sid && aid && sid === aid) return true;
    const sn = lower(productSellerName(p));
    const an = lower(authName());
    return !!(sn && an && sn === an);
  }

  function ensureCartCount(){
    try{ if(typeof syncCartCount==='function') syncCartCount(); }catch(e){}
    try{
      const n=document.getElementById('cartN');
      if(n && typeof cart !== 'undefined' && Array.isArray(cart)){
        n.textContent = cart.reduce((s,it)=>s+(Number(it.qty)||0),0);
      }
    }catch(e){}
  }

  function addCartSafe(id, opts){
    opts = opts || {};
    const p = productById(id);
    if(!p){ toastSafe('Produit introuvable'); return false; }

    let enabled = true;
    try{ enabled = (typeof globalCartEnabled==='undefined' || globalCartEnabled) && (typeof productCartEnabled==='undefined' || productCartEnabled[p.id] !== false); }catch(e){}
    if(!enabled){ toastSafe('Panier désactivé par le vendeur'); return false; }

    try{
      if(typeof cart === 'undefined' || !Array.isArray(cart)) window.cart = window.cart || [];
      const targetCart = (typeof cart !== 'undefined' && Array.isArray(cart)) ? cart : window.cart;
      let existing = targetCart.find(item=>String(item.id)===String(p.id));
      if(existing) existing.qty = (Number(existing.qty)||0) + 1;
      else targetCart.push({id:p.id, qty:1, product_id:p.id, linkedPostId:p.linkedHappyadPostId||p.happyadPostId||null});
      ensureCartCount();
      try{ if(currentScreen==='cart' && typeof renderCart==='function') renderCart(); }catch(e){}
      toastSafe(existing ? 'Quantité ajoutée' : 'Produit ajouté au panier');
      return true;
    }catch(err){
      console.warn('[HAPPYAD V110] addCartSafe erreur', err);
      try{
        if(typeof oldAddCart==='function') return oldAddCart(id);
      }catch(e){}
      toastSafe('Panier indisponible');
      return false;
    }
  }

  window.addCart = function(id){
    return addCartSafe(id);
  };

  window.openProductSellerMessage = function(productId){
    try{ if(typeof oldOpenMsg==='function') return oldOpenMsg(productId); }catch(e){}
    var p = productById(productId);
    try{
      var seller = p ? {
        id: productSellerId(p), user_id: productSellerId(p), uid: productSellerId(p),
        name: productSellerName(p) || 'Vendeur HAPPYAD', full_name: productSellerName(p) || 'Vendeur HAPPYAD',
        avatar_url: clean(p.seller_avatar || p.sellerAvatar || p.avatar_url || p.avatar || ''),
        badge: clean(p.seller_badge || p.sellerBadge || p.badge || p.user_badge || '')
      } : {};
      localStorage.setItem('HAPPYAD_OPEN_CHAT_PROFILE', JSON.stringify(seller));
      var url = 'messages.html' + (seller.id ? '?user_id=' + encodeURIComponent(seller.id) : '');
      window.location.href = url;
    }catch(e){ try{window.location.href='messages.html';}catch(_e){} }
    return true;
  };

  function detailProduct(){
    return window.currentDetailProduct || window.activeDetailProduct || null;
  }

  function refreshDetailActionButtons(){
    const p = detailProduct();
    const bar = document.querySelector('#detailBox .detailActionBar');
    if(!p || !bar) return;
    const owner = isOwner(p);
    const productId = String(p.id);
    const cartLabel = owner ? 'Ajouter au panier' : 'Ajouter au panier';

    bar.innerHTML =
      '<button type="button" class="btn" data-v110-cart data-product-id="'+productId.replace(/"/g,'&quot;')+'">'
        + (typeof icon==='function'?icon('cart','icoMini'):'🛒') + ' ' + cartLabel +
      '</button>' +
      (owner ? '' :
        '<button type="button" class="btn dark" data-v110-message data-product-id="'+productId.replace(/"/g,'&quot;')+'">'
          + (typeof icon==='function'?icon('message','icoMini'):'💬') + ' Message vendeur' +
        '</button>');
    try{ if(typeof hydrateIcons==='function') hydrateIcons(bar); }catch(e){}
  }

  document.addEventListener('click', function(e){
    const cartBtn = e.target && e.target.closest && e.target.closest('[data-v110-cart]');
    if(cartBtn){
      e.preventDefault(); e.stopPropagation();
      if(e.stopImmediatePropagation) e.stopImmediatePropagation();
      addCartSafe(cartBtn.getAttribute('data-product-id'));
      return;
    }
    const msgBtn = e.target && e.target.closest && e.target.closest('[data-v110-message]');
    if(msgBtn){
      e.preventDefault(); e.stopPropagation();
      if(e.stopImmediatePropagation) e.stopImmediatePropagation();
      window.openProductSellerMessage(msgBtn.getAttribute('data-product-id'));
      return;
    }
  }, true);

  const oldOpenDetail = window.openDetail;
  if(typeof oldOpenDetail === 'function' && !oldOpenDetail.__v110DetailActions){
    const wrapped = function(){
      const r = oldOpenDetail.apply(this, arguments);
      setTimeout(refreshDetailActionButtons, 80);
      setTimeout(refreshDetailActionButtons, 450);
      return r;
    };
    wrapped.__v110DetailActions = true;
    window.openDetail = wrapped;
  }

  const mo = new MutationObserver(function(){
    const bar = document.querySelector('#detailBox .detailActionBar');
    if(bar && !bar.querySelector('[data-v110-cart]')) setTimeout(refreshDetailActionButtons, 20);
  });
  setTimeout(function(){
    const box=document.getElementById('detailBox');
    if(box) mo.observe(box,{childList:true,subtree:true});
    refreshDetailActionButtons();
  }, 300);
})();
