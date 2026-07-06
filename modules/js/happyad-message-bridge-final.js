// HAPPYAD Messages V2 — pont propre vers le nouveau système messages.
(function(){
  if(window.__HAPPYAD_MESSAGE_BRIDGE_V2__) return;
  window.__HAPPYAD_MESSAGE_BRIDGE_V2__ = true;

  function clean(v){ return String(v == null ? '' : v).trim(); }
  function safeJson(key){ try{ var x=JSON.parse(localStorage.getItem(key)||'null'); return x&&typeof x==='object'?x:null; }catch(e){ return null; } }
  function toastSafe(msg){ try{ if(typeof toast==='function') toast(msg); }catch(e){} }
  function baseMessagesUrl(){ return /\/modules\//.test(location.pathname) ? '../messages.html' : 'messages.html'; }
  function idOf(x){ return clean(x && (x.id||x.user_id||x.uid||x.uuid||x.auth_id||x.seller_id||x.owner_id||x.creator_id||x.vendor_id)); }
  function nameOf(x){ return clean(x && (x.full_name||x.display_name||x.name||x.seller_name||x.sellerName||x.vendor_name||x.vendor||x.username||x.handle)); }
  function avatarOf(x){ return clean(x && (x.avatar_url||x.avatar||x.photo_url||x.picture||x.seller_avatar||x.sellerAvatar||x.vendor_avatar)); }
  function badgeOf(x){ return clean(x && (x.badge||x.user_badge||x.seller_badge||x.vendor_badge||x.role)); }

  function buildProfile(obj){
    obj = obj || {};
    var p = {
      id: idOf(obj),
      user_id: idOf(obj),
      uid: idOf(obj),
      uuid: idOf(obj),
      name: nameOf(obj),
      full_name: nameOf(obj),
      display_name: nameOf(obj),
      username: clean(obj.username||obj.handle).replace(/^@+/,''),
      handle: clean(obj.handle||obj.username).replace(/^@+/,''),
      avatar_url: avatarOf(obj),
      avatar: avatarOf(obj),
      badge: badgeOf(obj),
      user_badge: badgeOf(obj),
      conversation_id: clean(obj.conversation_id||obj.cid||obj.chat_id||obj.thread_id)
    };
    return p;
  }

  function storeProfile(profile){
    profile = buildProfile(profile);
    try{ localStorage.setItem('HAPPYAD_OPEN_CHAT_PROFILE', JSON.stringify(profile)); }catch(e){}
    return profile;
  }

  function openMessages(profile){
    profile = storeProfile(profile || {});
    var parts=[];
    if(profile.id) parts.push('user_id='+encodeURIComponent(profile.id));
    if(profile.conversation_id) parts.push('conversation_id='+encodeURIComponent(profile.conversation_id));
    if(profile.name) parts.push('name='+encodeURIComponent(profile.name));
    if(profile.avatar_url) parts.push('avatar='+encodeURIComponent(profile.avatar_url));
    if(profile.badge) parts.push('badge='+encodeURIComponent(profile.badge));
    var url = baseMessagesUrl() + (parts.length ? '?' + parts.join('&') : '');
    try{
      if(window.parent && window.parent !== window && window.parent.postMessage){
        window.parent.postMessage({type:'HAPPYAD_OPEN_INTERNAL_URL',url:url,source:'happyad-message-bridge-v2'}, '*');
        return true;
      }
    }catch(e){}
    try{ location.href = url; return true; }catch(e){ return false; }
  }

  function productsList(){
    try{ if(Array.isArray(window.products)) return window.products; }catch(e){}
    try{ if(typeof products !== 'undefined' && Array.isArray(products)) return products; }catch(e){}
    return [];
  }
  function productById(id){
    id=clean(id);
    var list=productsList();
    return list.find(function(p){ return clean(p&&p.id)===id; }) || window.currentDetailProduct || window.activeDetailProduct || null;
  }

  window.happyadOpenNativeChat = function(url, meta){
    meta = meta || {};
    if(url){
      try{
        var u = new URL(url, location.href);
        meta.user_id = meta.user_id || u.searchParams.get('user_id') || u.searchParams.get('uid') || u.searchParams.get('to');
        meta.conversation_id = meta.conversation_id || u.searchParams.get('conversation_id') || u.searchParams.get('cid');
        meta.name = meta.name || u.searchParams.get('name') || u.searchParams.get('user');
        meta.avatar = meta.avatar || u.searchParams.get('avatar') || u.searchParams.get('avatar_url');
        meta.badge = meta.badge || u.searchParams.get('badge');
      }catch(e){}
    }
    return openMessages(meta);
  };

  window.openHappyadMessages = function(profile){ return openMessages(profile || {}); };

  window.openProductSellerMessage = function(productId){
    var p = productById(productId);
    if(!p){ toastSafe('Produit introuvable'); return openMessages({}); }
    var seller = {
      id: clean(p.seller_id||p.user_id||p.owner_id||p.creator_id||p.vendor_id),
      name: clean(p.seller_name||p.sellerName||p.seller||p.vendor_name||p.vendor||p.creatorName||p.owner_name),
      username: clean(p.seller_username||p.vendor_username||p.username||p.handle),
      avatar_url: clean(p.seller_avatar||p.sellerAvatar||p.avatar_url||p.avatar||p.vendor_avatar),
      badge: clean(p.seller_badge||p.sellerBadge||p.badge||p.user_badge)
    };
    return openMessages(seller);
  };

  window.renderHappyadMessagesBridge = function(){
    try{
      var sec=document.getElementById('messages'); if(!sec) return;
      sec.innerHTML='<div class="messageBridge happyadMessagesBridge"><div class="bridgeCard"><div class="section"><h3>Messages HAPPYAD</h3><span>Nouveau système prêt</span></div><p>Conversations connectées au compte HAPPYAD.</p><button class="btn" style="width:100%" onclick="openHappyadMessages()">Ouvrir Messages</button></div></div>';
      try{ if(typeof hydrateIcons==='function') hydrateIcons(sec); }catch(e){}
    }catch(e){}
  };
})();
