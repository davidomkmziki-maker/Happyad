// V89 - Boutique -> Messages HAPPYAD principal
// Ouvre la vraie conversation messages.html avec le vendeur réel du produit.
(function(){
  function clean(v){return String(v==null?'':v).trim();}
  function safeJson(v,fb){try{return JSON.parse(v)}catch(e){return fb;}}
  function ico(name,cls){try{return icon(name,cls||'icoMini')}catch(e){return ''}}
  function isUuid(v){return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(clean(v));}
  function readObj(keys){
    for(const k of keys){
      try{const o=safeJson(localStorage.getItem(k),null); if(o&&typeof o==='object'&&Object.keys(o).length) return o;}catch(e){}
    }
    return null;
  }
  function currentUser(){
    return readObj(['HAPPYAD_LOGGED_USER','HAPPYAD_CURRENT_USER','HAPPYAD_USER','HAPPYAD_USER_V1','HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL']) || {};
  }
  function currentName(){
    const u=currentUser();
    return clean(u.name||u.full_name||u.display_name||u.username||u.handle||u.email)||'Utilisateur HAPPYAD';
  }
  function currentId(){
    const u=currentUser();
    return clean(u.id||u.user_id||u.uid||u.uuid||u.auth_id||'');
  }
  function normProfile(p){
    p=p||{};
    const name=clean(p.name||p.full_name||p.display_name||p.seller_name||p.seller||p.username||p.handle||p.email);
    const id=clean(p.id||p.user_id||p.seller_id||p.uid||p.uuid||p.auth_id||'');
    const handle=clean(p.handle||p.username||'').replace(/^@+/, '');
    const avatar=clean(p.avatar||p.avatar_url||p.photo||p.photo_url||p.image||p.profile_photo||p.picture||'');
    const badge=clean(p.badge||p.verifiedBadge||p.verifyLevel||p.userBadge||p.user_badge||'');
    return {id:id,user_id:id,name:name||handle||id||'Vendeur HAPPYAD',full_name:name||handle||id||'Vendeur HAPPYAD',username:handle,handle:handle,avatar_url:avatar,avatar:avatar,badge:badge};
  }
  function profileFromProduct(product){
    const p=product||{};
    return normProfile({
      id:p.seller_id||p.user_id||p.owner_id||p.creator_id||p.vendor_id,
      user_id:p.seller_id||p.user_id||p.owner_id||p.creator_id||p.vendor_id,
      name:p.seller_name||p.seller||p.vendor_name||p.owner_name,
      full_name:p.seller_name||p.seller||p.vendor_name||p.owner_name,
      username:p.seller_username||p.seller_handle||p.handle,
      handle:p.seller_handle||p.seller_username||p.handle,
      avatar_url:p.seller_avatar_url||p.seller_avatar||p.avatar_url,
      badge:p.seller_badge||p.badge
    });
  }
  function bridgePayload(context, extra){
    return Object.assign({
      source:'happyad_boutique',
      context:context||'general',
      product:window.currentDetailProduct||window.activeDetailProduct||null,
      order:window.currentResolutionOrder||null,
      seller:'HAPPYAD_PROFILE',
      badge:'HAPPYAD_BADGE'
    }, extra||{});
  }
  function sameAsMe(profile){
    const me=currentUser();
    const ids=[currentId(),me.id,me.user_id,me.uid,me.uuid,me.auth_id,me.email,me.handle,me.username,me.name].map(clean).filter(Boolean);
    const t=[profile&&profile.id,profile&&profile.user_id,profile&&profile.email,profile&&profile.handle,profile&&profile.username,profile&&profile.name].map(clean).filter(Boolean);
    return t.some(x=>ids.some(y=>String(x).replace(/^@+/,'').toLowerCase()===String(y).replace(/^@+/,'').toLowerCase()));
  }
  function mainMessagesUrl(profile, payload){
    profile=normProfile(profile);
    const qs=new URLSearchParams();
    qs.set('source','boutique');
    qs.set('user', profile.name || profile.handle || 'Vendeur HAPPYAD');
    if(profile.id) qs.set('user_id', profile.id);
    const product=payload&&payload.product;
    if(product&&product.id) qs.set('product_id', product.id);
    if(product&&(product.name||product.title)) qs.set('product', product.name||product.title);
    return 'messages.html?'+qs.toString();
  }
  function openMainMessages(profile, payload){
    profile=normProfile(profile);
    if(!profile.id && !profile.name && !profile.handle){
      try{toast('Vendeur introuvable pour ouvrir le message')}catch(e){}
      return false;
    }
    if(sameAsMe(profile)){
      try{toast('Impossible d’ouvrir un message avec votre propre profil')}catch(e){}
      return false;
    }
    try{localStorage.setItem('HAPPYAD_OPEN_CHAT_PROFILE', JSON.stringify(profile));}catch(e){}
    try{localStorage.setItem('HAPPYAD_OPEN_CHAT_NAME', profile.name || profile.handle || 'Vendeur HAPPYAD');}catch(e){}
    try{localStorage.setItem('HAPPYAD_LAST_BOUTIQUE_CHAT_PROFILE', JSON.stringify(profile));}catch(e){}
    window.location.href=mainMessagesUrl(profile,payload||{});
    return true;
  }
  window.openProductSellerMessage=function(productId){
    const list=Array.isArray(window.products)?window.products:[];
    const p=list.find(x=>String(x&&x.id)===String(productId)) || window.currentDetailProduct || window.activeDetailProduct || null;
    if(!p){try{toast('Produit introuvable')}catch(e){} return false;}
    return openMainMessages(profileFromProduct(p), bridgePayload('seller',{product:p}));
  };
  window.openHappyadMessages=function(context, extra){
    const payload=bridgePayload(context,extra);
    const product=(extra&&extra.product)||payload.product;
    if(context==='seller' || context==='product' || (product&&(product.seller_id||product.user_id||product.seller||product.seller_name))){
      return openMainMessages(profileFromProduct(product), payload);
    }
    // V416: le bouton central ne doit jamais ouvrir un chat générique avec mon propre profil.
    // Si une vraie dernière discussion existe on l'ouvre, sinon on ouvre directement la liste Messages.
    const last=safeJson(localStorage.getItem('HAPPYAD_LAST_BOUTIQUE_CHAT_PROFILE'),null);
    if(last && (last.id||last.user_id||last.name||last.handle)){
      if(openMainMessages(last, payload)) return true;
    }
    window.location.href='modules/notifications.html?cat=messages&source=boutique';
    return true;
  };
  window.renderHappyadMessagesBridge=function(payload){
    const sec=document.getElementById('messages'); if(!sec) return;
    const label=payload&&payload.order?('Commande '+payload.order.id):(payload&&payload.product?(payload.product.name||payload.product.title||'Produit'):'Centrale');
    sec.innerHTML=`<div class="messageBridge happyadMessagesBridge">
      <div class="bridgeCard">
        <div class="section"><h3>Messages HAPPYAD</h3><span>${label}</span></div>
        <div class="accessLine"><span data-ico="message"></span><span>Connecté à la messagerie principale HAPPYAD.</span></div>
        <button class="btn" style="width:100%" onclick="openHappyadMessages('central')">${ico('message')} Ouvrir Messages HAPPYAD</button>
        <div class="bridgeMiniNote">Les messages Boutique utilisent la même conversation que le message principal.</div>
      </div>
      <div class="bridgeCard">
        <h3>Revendications boutique</h3>
        <p>Dossier séparé par commande.</p>
        <button class="btn dark" style="width:100%" onclick="openResolution()">${ico('shield')} Centre de résolution</button>
      </div>
    </div>`;
    try{hydrateIcons(sec)}catch(e){}
  };
  if(!window.__originalShowForMessagesBridge && typeof window.show==='function'){
    window.__originalShowForMessagesBridge=window.show;
    window.show=function(id,opts){
      const r=window.__originalShowForMessagesBridge.apply(this,arguments);
      if(id==='messages') try{renderHappyadMessagesBridge(window.HAPPYAD_BOUTIQUE_MESSAGE_BRIDGE||bridgePayload('central'))}catch(e){}
      return r;
    };
  }
  try{renderHappyadMessagesBridge(window.HAPPYAD_BOUTIQUE_MESSAGE_BRIDGE||bridgePayload('central'))}catch(e){}
})();
