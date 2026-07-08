// V124 SAFE — Panier : afficher la vraie photo/vidéo du produit dans le panier.
// Correction ciblée : remplace uniquement l'icône sac du panier par le média réel déjà présent sur la carte produit.
(function(){
  if(window.__HAPPYAD_V124_CART_PRODUCT_REAL_MEDIA_FIX__) return;
  window.__HAPPYAD_V124_CART_PRODUCT_REAL_MEDIA_FIX__ = true;

  function clean(v){ return String(v==null?'':v).trim(); }
  function esc(v){ return clean(v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]}); }
  function lower(v){ return clean(v).toLowerCase(); }
  function isRealUrl(u){
    u=clean(u);
    return !!u && (/^(https?:|blob:|data:)/i.test(u) || /^\//.test(u));
  }
  function listProducts(){
    try{ if(Array.isArray(products)) return products; }catch(e){}
    try{ if(Array.isArray(window.products)) return window.products; }catch(e){}
    return [];
  }
  function listCart(){
    try{ if(Array.isArray(cart)) return cart; }catch(e){}
    try{ if(Array.isArray(window.cart)) return window.cart; }catch(e){}
    return [];
  }
  function parseMaybeJsonArray(v){
    if(Array.isArray(v)) return v;
    if(typeof v !== 'string') return [];
    var s=v.trim();
    if(!s || (s[0] !== '[' && s[0] !== '{')) return [];
    try{ var j=JSON.parse(s); return Array.isArray(j)?j:[j]; }catch(e){ return []; }
  }
  function mediaUrlOf(m){
    if(!m) return '';
    if(typeof m === 'string') return m;
    return clean(
      m.url || m.media_url || m.mediaUrl || m.publicUrl || m.public_url ||
      m.image_url || m.imageUrl || m.video_url || m.videoUrl ||
      m.cover_url || m.coverUrl || m.thumbnail_url || m.thumbnailUrl ||
      m.poster_url || m.posterUrl || m.src || m.path || m.file_url || m.fileUrl || ''
    );
  }
  function mediaTypeOf(m, url){
    var t='';
    if(m && typeof m === 'object') t=clean(m.type || m.media_type || m.mediaType || m.kind || m.mime || m.mime_type).toLowerCase();
    if(t.indexOf('video')>=0) return 'video';
    if(/\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(clean(url))) return 'video';
    return 'photo';
  }
  function addCandidate(list, source, forcedType){
    if(!source) return;
    if(Array.isArray(source)){ source.forEach(function(x){ addCandidate(list,x,forcedType); }); return; }
    var parsed=parseMaybeJsonArray(source);
    if(parsed.length){ parsed.forEach(function(x){ addCandidate(list,x,forcedType); }); return; }
    var url=mediaUrlOf(source);
    if(isRealUrl(url)) list.push({url:url,type:forcedType || mediaTypeOf(source,url)});
  }
  function firstMedia(p, rawCart){
    var candidates=[];
    p=p||{}; rawCart=rawCart||{};

    // Priorité : média d'accueil du produit, puis tous les médias Boutique.
    [
      p.homeMediaUrl, p.home_media_url, p.mediaUrl, p.media_url, p.imageUrl, p.image_url,
      p.coverUrl, p.cover_url, p.thumbnailUrl, p.thumbnail_url, p.posterUrl, p.poster_url,
      p.videoUrl, p.video_url, p.url, p.src,
      rawCart.homeMediaUrl, rawCart.home_media_url, rawCart.mediaUrl, rawCart.media_url,
      rawCart.imageUrl, rawCart.image_url, rawCart.productImage, rawCart.product_image,
      rawCart.photo, rawCart.picture, rawCart.src, rawCart.url
    ].forEach(function(x){ addCandidate(candidates,x); });

    [
      p.homeMedia, p.home_media, p.media, p.medias, p.boutiqueMedia, p.boutique_media,
      p.product_media, p.productMedia, p.photos, p.images, p.files,
      rawCart.homeMedia, rawCart.home_media, rawCart.media, rawCart.medias, rawCart.boutiqueMedia,
      rawCart.product_media, rawCart.photos, rawCart.images, rawCart.files
    ].forEach(function(x){ addCandidate(candidates,x); });

    // Si une ancienne carte produit a déjà été hydratée, récupérer sa vraie image comme dernier secours.
    var id=clean(p.id || rawCart.id || rawCart.product_id || rawCart.productId);
    if(id){
      try{
        var card=document.querySelector('.product[data-product-id="'+CSS.escape(id)+'"]');
        var img=card && card.querySelector('.happyadRealMedia img,.pic img');
        var vid=card && card.querySelector('.happyadRealMedia video,.pic video');
        if(img && isRealUrl(img.currentSrc || img.src)) candidates.push({url:img.currentSrc || img.src,type:'photo'});
        if(vid && isRealUrl(vid.currentSrc || vid.src)) candidates.push({url:vid.currentSrc || vid.src,type:'video'});
      }catch(e){}
    }

    for(var i=0;i<candidates.length;i++){
      if(isRealUrl(candidates[i].url)) return candidates[i];
    }
    return null;
  }
  function productById(id){
    id=clean(id);
    if(!id) return null;
    var products=listProducts();
    for(var i=0;i<products.length;i++){
      if(clean(products[i] && products[i].id) === id) return products[i];
    }
    return null;
  }
  function productFromCard(card, idx){
    var carts=listCart();
    var raw=carts[idx] || {};
    var id=clean(card.getAttribute('data-v124-product-id') || card.getAttribute('data-v111-product-id') || raw.id || raw.product_id || raw.productId || raw.productId);
    var p=productById(id);
    if(p) return {product:p,raw:raw};

    var title=clean((card.querySelector('.cartProductTitle,.rowInfo b')||{}).textContent);
    if(title){
      var products=listProducts();
      for(var i=0;i<products.length;i++){
        if(lower(products[i] && products[i].name) === lower(title)) return {product:products[i],raw:raw};
      }
    }
    if(raw.product && typeof raw.product === 'object') return {product:raw.product,raw:raw};
    return {product:null,raw:raw};
  }
  function mediaHtml(media, name){
    if(!media) return '';
    if(media.type === 'video'){
      return '<video src="'+esc(media.url)+'" muted playsinline webkit-playsinline preload="metadata"></video><span class="cartVideoMini">▶</span>';
    }
    return '<img src="'+esc(media.url)+'" alt="'+esc(name || 'Produit')+'" loading="lazy" decoding="async">';
  }
  function patchBox(box, product, raw){
    if(!box || !product) return;
    var media=firstMedia(product, raw);
    if(!media) return;
    var html=mediaHtml(media, product.name || raw.name || 'Produit');
    if(!html) return;
    box.classList.add('hasRealCartMedia','v124RealCartMedia');
    box.innerHTML=html;
  }
  function patchCart(){
    var root=document.getElementById('cartRows');
    if(!root) return;

    var cards=Array.prototype.slice.call(root.querySelectorAll('.cartProductCard'));
    cards.forEach(function(card,idx){
      var info=productFromCard(card,idx);
      if(!info.product) return;
      card.setAttribute('data-v124-product-id', clean(info.product.id));
      patchBox(card.querySelector('.cartProductMedia'), info.product, info.raw);
    });

    // Ancien layout : .row + .mini
    var rows=Array.prototype.slice.call(root.querySelectorAll('.card > .row'));
    rows.forEach(function(row,idx){
      if(row.closest('.orderCard')) return;
      var info=productFromCard(row,idx);
      if(!info.product) return;
      row.setAttribute('data-v124-product-id', clean(info.product.id));
      patchBox(row.querySelector('.mini'), info.product, info.raw);
    });
  }
  function schedulePatch(){
    setTimeout(patchCart,0);
    setTimeout(patchCart,80);
    setTimeout(patchCart,300);
  }

  var oldRender=window.renderCart;
  if(typeof oldRender === 'function' && !oldRender.__v124CartRealMedia){
    var wrapped=function(){ var r=oldRender.apply(this,arguments); schedulePatch(); return r; };
    wrapped.__v124CartRealMedia=true;
    window.renderCart=wrapped;
    try{ renderCart=wrapped; }catch(e){}
  }

  var oldShow=window.show;
  if(typeof oldShow === 'function' && !oldShow.__v124CartRealMedia){
    var wrappedShow=function(id){ var r=oldShow.apply(this,arguments); if(id==='cart') schedulePatch(); return r; };
    wrappedShow.__v124CartRealMedia=true;
    window.show=wrappedShow;
    try{ show=wrappedShow; }catch(e){}
  }

  document.addEventListener('DOMContentLoaded', schedulePatch);
  setTimeout(schedulePatch,250);
  setTimeout(schedulePatch,900);
  try{
    var mo=new MutationObserver(function(){ schedulePatch(); });
    setTimeout(function(){ var box=document.getElementById('cartRows'); if(box) mo.observe(box,{childList:true,subtree:true}); },300);
  }catch(e){}
})();
