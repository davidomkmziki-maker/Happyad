// V112 SAFE — Cacher bouton message dans panier si tous les produits appartiennent au propriétaire
(function(){
  if(window.__HAPPYAD_V112_HIDE_OWNER_MSG_CART__) return;
  window.__HAPPYAD_V112_HIDE_OWNER_MSG_CART__ = true;

  function clean(v){ return String(v==null?'':v).trim(); }
  function lower(v){ return clean(v).toLowerCase().replace(/^@+/,''); }
  function safeJson(key){ try{ const v=JSON.parse(localStorage.getItem(key)||'null'); return v&&typeof v==='object'?v:null; }catch(e){ return null; } }
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
  function productsList(){ try{ if(Array.isArray(products)) return products; }catch(e){} try{ if(Array.isArray(window.products)) return window.products; }catch(e){} return []; }
  function cartList(){ try{ if(Array.isArray(cart)) return cart; }catch(e){} try{ if(Array.isArray(window.cart)) return window.cart; }catch(e){} return []; }
  function productById(id){ return productsList().find(function(p){ return String(p&&p.id)===String(id); }) || null; }
  function productSellerId(p){ return clean(p && (p.seller_id || p.user_id || p.owner_id || p.creator_id || p.vendor_id)); }
  function productSellerName(p){ return clean(p && (p.seller_name || p.sellerName || p.seller || p.vendor_name || p.vendor)); }
  function isOwner(p){
    if(!p) return false;
    const sid=lower(productSellerId(p));
    const aid=lower(authId());
    if(sid && aid && sid===aid) return true;
    const sn=lower(productSellerName(p));
    const an=lower(authName());
    return !!(sn && an && sn===an);
  }
  function cartOwnerOnly(){
    const items = cartList().filter(function(x){ return x && (Number(x.qty)||0)>0; }).map(function(x){ return productById(x.id); }).filter(Boolean);
    if(!items.length) return false;
    return items.every(isOwner);
  }
  function updateCartMessageVisibility(){
    try{
      const box=document.getElementById('cartRows');
      if(!box) return;
      const card = box.querySelector('.card');
      if(!card) return;
      const buttons = Array.from(card.querySelectorAll('button.btn'));
      const messageBtn = buttons.find(function(btn){ return /message vendeur/i.test(btn.textContent||''); });
      if(!messageBtn) return;
      if(cartOwnerOnly()){
        messageBtn.style.display='none';
        const br = messageBtn.nextElementSibling;
        if(br && br.tagName==='BR') br.style.display='none';
      } else {
        messageBtn.style.display='';
        const br = messageBtn.nextElementSibling;
        if(br && br.tagName==='BR') br.style.display='';
      }
    }catch(e){ console.warn('[HAPPYAD V112] cart message visibility', e); }
  }

  const oldRender=window.renderCart;
  if(typeof oldRender==='function' && !oldRender.__v112HideOwnerMessage){
    const wrapped=function(){ const r=oldRender.apply(this, arguments); setTimeout(updateCartMessageVisibility, 30); setTimeout(updateCartMessageVisibility, 180); return r; };
    wrapped.__v112HideOwnerMessage = true;
    window.renderCart = wrapped;
  }

  const oldShow=window.show;
  if(typeof oldShow==='function' && !oldShow.__v112HideOwnerMessage){
    const wrappedShow=function(id){ const r=oldShow.apply(this, arguments); if(id==='cart') { setTimeout(updateCartMessageVisibility, 50); setTimeout(updateCartMessageVisibility, 220);} return r; };
    wrappedShow.__v112HideOwnerMessage = true;
    window.show = wrappedShow;
  }

  const mo = new MutationObserver(function(){ setTimeout(updateCartMessageVisibility, 10); });
  setTimeout(function(){
    const box=document.getElementById('cartRows');
    if(box) mo.observe(box, {childList:true, subtree:true});
    updateCartMessageVisibility();
  }, 250);
})();
