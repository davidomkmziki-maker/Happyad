// HAPPYAD V126 — Détails produit + recommandations : médias réels rapides
// Corrige deux points sans toucher panier/paiement/commandes :
// 1) les cartes recommandations dans Détails affichent leur vraie photo produit ;
// 2) l'image principale du détail utilise immédiatement le vrai média disponible.
(function(){
  if(window.__HAPPYAD_V126_DETAIL_IMAGES_RECOS_FAST_FIX__) return;
  window.__HAPPYAD_V126_DETAIL_IMAGES_RECOS_FAST_FIX__ = true;

  function escAttr(v){
    return String(v==null?'':v)
      .replace(/&/g,'&amp;')
      .replace(/"/g,'&quot;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;');
  }
  function cssUrl(v){return String(v||'').replace(/[\\"'\n\r\)]/g,'');}
  function cleanUrl(v){return String(v==null?'':v).trim();}
  function isUrl(u){return /^(https?:|blob:|data:)/i.test(String(u||''));}
  function listProducts(){
    try{ if(Array.isArray(window.products)) return window.products; }catch(e){}
    try{ if(Array.isArray(products)) return products; }catch(e){}
    return [];
  }
  function normType(t,u){
    t=String(t||'').toLowerCase();
    if(t.indexOf('video')>=0) return 'video';
    if(/\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(String(u||''))) return 'video';
    return 'photo';
  }
  function normMediaItem(item,idx){
    if(typeof item==='string') item={url:item};
    item=item||{};
    var u=cleanUrl(item.url || item.media_url || item.mediaUrl || item.src || item.path || item.publicUrl || item.public_url || item.image || item.imageUrl || item.image_url || item.video_url || item.coverUrl || item.cover_url || item.thumbnailUrl || item.thumbnail_url || item.posterUrl || item.poster_url || '');
    if(!u || !isUrl(u)) return null;
    var type=normType(item.type || item.media_type || item.mediaType || item.kind, u);
    return {
      id:item.id || u,
      url:u,
      type:type,
      label:item.label || item.name || (type==='video'?'Vidéo':'Photo '+(idx+1)),
      orientation:item.orientation || 'natural',
      sort_order:Number(item.sort_order==null?idx:item.sort_order)||idx,
      is_home_cover:!!item.is_home_cover
    };
  }
  function addArray(out,a){
    if(!Array.isArray(a)) return;
    a.forEach(function(x,i){ var m=normMediaItem(x,i); if(m) out.push(m); });
  }
  function directMedia(p){
    p=p||{};
    var keys=['homeMediaUrl','home_media_url','mediaUrl','media_url','imageUrl','image_url','coverUrl','cover_url','thumbnailUrl','thumbnail_url','posterUrl','poster_url','url','src'];
    for(var i=0;i<keys.length;i++){
      var u=cleanUrl(p[keys[i]]);
      if(u && isUrl(u)) return normMediaItem({url:u,type:p.homeMediaType||p.mediaType||p.media_type||p.type},0);
    }
    return null;
  }
  function productMedia(p){
    var out=[];
    // Pour Détails, on veut toutes les photos/vidéos. Certains produits ont seulement homeMedia,
    // d'autres seulement boutiqueMedia ou media selon l'ancien module qui a publié le produit.
    addArray(out,p&&p.boutiqueMedia);
    addArray(out,p&&p.media);
    addArray(out,p&&p.medias);
    addArray(out,p&&p.product_media);
    addArray(out,p&&p.photos);
    addArray(out,p&&p.images);
    addArray(out,p&&p.homeMedia);
    addArray(out,p&&p.home_media);
    var d=directMedia(p); if(d) out.push(d);
    var seen={};
    out=out.filter(function(m){ if(!m||!m.url||seen[m.url]) return false; seen[m.url]=true; return true; });
    out.sort(function(a,b){return (a.sort_order||0)-(b.sort_order||0);});
    return out;
  }
  function firstMedia(p){return productMedia(p)[0]||null;}
  function productById(id){
    var sid=String(id==null?'':id);
    return listProducts().find(function(p){return String(p&&p.id)===sid || String(p&&p.linkedHappyadPostId||'')===sid || String(p&&p.happyadPostId||'')===sid;}) || null;
  }
  function productFromCard(card){
    if(!card) return null;
    var id = card.getAttribute('data-product-id') || card.dataset.productId || '';
    if(!id){
      var onclick = card.getAttribute('onclick') || '';
      var m = onclick.match(/openDetail\((['"]?)([^'"\)]+)\1\)/);
      if(m) id = m[2];
    }
    if(id){
      var p=productById(id);
      if(p) return p;
    }
    var name=(card.querySelector('.name')&&card.querySelector('.name').textContent||'').trim().toLowerCase();
    var price=(card.querySelector('.price')&&card.querySelector('.price').textContent||'').trim().toLowerCase();
    if(!name) return null;
    var best=null, score=0;
    listProducts().forEach(function(p){
      var s=0;
      if(String(p.name||'').trim().toLowerCase()===name) s+=5;
      if(price && String(p.price||p.priceText||'').trim().toLowerCase()===price) s+=2;
      if(s>score){best=p;score=s;}
    });
    return score>=5?best:null;
  }
  function mediaHTML(m){
    if(!m) return '';
    var u=escAttr(m.url);
    if(m.type==='video'){
      return '<div class="happyadRealMedia v126RealMedia"><video src="'+u+'" muted playsinline webkit-playsinline preload="metadata"></video><span class="happyadVideoMark">▶</span></div>';
    }
    return '<div class="happyadRealMedia v126RealMedia"><img src="'+u+'" alt="Produit boutique" loading="eager" decoding="async"></div>';
  }
  function hydrateProductCards(root){
    root=root||document;
    try{
      root.querySelectorAll('.product').forEach(function(card){
        var pic=card.querySelector('.pic'); if(!pic) return;
        if(pic.querySelector('.happyadRealMedia img,.happyadRealMedia video')) return;
        var p=productFromCard(card);
        var m=firstMedia(p);
        if(!m) return;
        var old=pic.querySelector('.bag');
        if(old){ old.insertAdjacentHTML('beforebegin', mediaHTML(m)); old.style.display='none'; }
        else{ pic.insertAdjacentHTML('afterbegin', mediaHTML(m)); }
        pic.classList.add('hasRealMedia','v126HasRealMedia');
      });
    }catch(e){}
  }
  function renderThumbs(media){
    var thumbs=document.getElementById('detailThumbs');
    if(!thumbs || !media.length) return;
    thumbs.innerHTML=media.map(function(m,i){
      var bg=m.type==='photo' && m.url ? ' style="background-image:url(\''+cssUrl(m.url)+'\')"' : '';
      var ico=(typeof icon==='function') ? icon(m.type==='video'?'play':'image','ico') : (m.type==='video'?'▶':'');
      return '<button class="mediaThumb hasRealMedia v126Thumb '+(i===0?'active':'')+'" '+bg+' onclick="selectDetailMedia('+i+')" aria-label="'+escAttr(m.label||('Média '+(i+1)))+'">'+ico+'<small>'+(i+1)+'</small></button>';
    }).join('');
  }
  function setRealDetailMedia(productId){
    var p=productById(productId) || window.activeDetailProduct || window.currentDetailProduct;
    var media=productMedia(p);
    if(!p || !media.length) return false;
    window.activeDetailProduct=p;
    window.currentDetailProduct=p;
    window.activeDetailMedia=media;
    window.detailMedia=media;
    window.activeMediaIndex=0;
    window.detailMediaIndex=0;
    window.detailVideoPlaying=false;
    renderThumbs(media);
    try{ if(typeof window.renderDetailMedia==='function') window.renderDetailMedia(); }
    catch(e){ try{ if(typeof renderDetailMedia==='function') renderDetailMedia(); }catch(_){} }
    preloadNext(media);
    return true;
  }
  function preloadNext(media){
    try{
      (media||[]).slice(0,3).forEach(function(m){
        if(!m || !m.url || m.type==='video') return;
        var im=new Image();
        im.decoding='async';
        im.src=m.url;
      });
    }catch(e){}
  }

  // Remplace le rendu détail réel pour éviter : placeholder sac -> attente -> image.
  // Ici l'image réelle est injectée immédiatement si le média est déjà dans products/cache.
  var oldRenderDetail = window.renderDetailMedia || (typeof renderDetailMedia==='function' ? renderDetailMedia : null);
  if(typeof oldRenderDetail==='function' && !oldRenderDetail.__happyadV126RealDetail){
    var renderWrapped=function(){
      var media=window.activeDetailMedia||window.detailMedia||[];
      var idx=Number(window.activeMediaIndex||window.detailMediaIndex||0)||0;
      var m=media[idx]||media[0];
      var p=window.activeDetailProduct||window.currentDetailProduct||{};
      var box=document.getElementById('detailMainMedia');
      if(box && m && m.url){
        var isVideo=m.type==='video';
        var tag=(isVideo?'Vidéo':(p.tag||'Photo'));
        var body=isVideo
          ? '<video class="detailRealMedia v126DetailVideo" src="'+escAttr(m.url)+'" playsinline webkit-playsinline controls preload="metadata"></video><div class="playBubble">'+(typeof icon==='function'?icon('play','ico'):'▶')+'</div>'
          : '<img class="detailRealMedia v126DetailImage" src="'+escAttr(m.url)+'" alt="'+escAttr(p.name||'Produit boutique')+'" loading="eager" decoding="async">';
        box.innerHTML='<button class="fullBtn" onclick="event.stopPropagation();openMediaViewer(true)" aria-label="Plein écran">'+(typeof icon==='function'?icon('fullscreen','icoMini'):'')+'</button><span class="tag">'+escAttr(tag)+'</span><button class="heart" onclick="event.stopPropagation();this.classList.toggle(\'liked\')">'+(typeof icon==='function'?icon('heart','ico'):'♡')+'</button><div class="detailVisual hasRealMedia v126DetailVisual '+(isVideo?'video':'photo')+'">'+body+'</div><div class="mediaHint">'+escAttr(m.label||'Média boutique')+'</div>';
        try{document.querySelectorAll('#detailThumbs .mediaThumb').forEach(function(b,k){b.classList.toggle('active',k===idx);});}catch(e){}
        try{ if(typeof hydrateIcons==='function') hydrateIcons(box); }catch(e){}
        return;
      }
      return oldRenderDetail.apply(this,arguments);
    };
    renderWrapped.__happyadV126RealDetail=true;
    window.renderDetailMedia=renderWrapped;
    try{ renderDetailMedia=window.renderDetailMedia; }catch(e){}
  }

  var oldOpenDetail = window.openDetail || (typeof openDetail==='function' ? openDetail : null);
  if(typeof oldOpenDetail==='function' && !oldOpenDetail.__happyadV126FastDetail){
    var openWrapped=function(id){
      var r=oldOpenDetail.apply(this,arguments);
      setRealDetailMedia(id);
      hydrateProductCards(document.getElementById('detailBox')||document);
      // Deuxième passage après les autres wrappers anciens, pour éviter qu'ils remettent le placeholder.
      setTimeout(function(){ setRealDetailMedia(id); hydrateProductCards(document.getElementById('detailBox')||document); }, 60);
      setTimeout(function(){ hydrateProductCards(document.getElementById('detailBox')||document); }, 250);
      return r;
    };
    openWrapped.__happyadV126FastDetail=true;
    window.openDetail=openWrapped;
    try{ openDetail=window.openDetail; }catch(e){}
  }

  function wrapAfterRender(name){
    var old=window[name] || null;
    if(typeof old!=='function' || old.__happyadV126HydrateCards) return;
    var w=function(){
      var r=old.apply(this,arguments);
      hydrateProductCards(document.querySelector('.module.active')||document);
      return r;
    };
    w.__happyadV126HydrateCards=true;
    window[name]=w;
    try{ eval(name+'=window[name]'); }catch(e){}
  }
  ['renderProducts','renderHomeSections','renderProfilePublications','renderVendorPublications','openCategoryView','renderMine','renderStats'].forEach(wrapAfterRender);

  document.addEventListener('DOMContentLoaded',function(){setTimeout(function(){hydrateProductCards(document);},120);});
  setTimeout(function(){hydrateProductCards(document);},450);

  window.HAPPYAD_DETAIL_MEDIA_FAST_FIX={
    hydrateCards:hydrateProductCards,
    applyDetail:setRealDetailMedia,
    mediaOf:productMedia
  };
})();
