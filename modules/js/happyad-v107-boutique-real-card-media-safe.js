// V107 SAFE — Remplace seulement l'icône sac des cartes par le vrai média produit.
// Objectif: laisser tous les anciens systèmes fonctionnels et hydrater uniquement l'affichage.
(function(){
  if(window.__HAPPYAD_V107_BOUTIQUE_REAL_CARD_MEDIA_SAFE__) return;
  window.__HAPPYAD_V107_BOUTIQUE_REAL_CARD_MEDIA_SAFE__ = true;

  function escAttr(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function txt(el){return String((el&&el.textContent)||'').trim().replace(/\s+/g,' ');}
  function listProducts(){try{return Array.isArray(window.products)?window.products:(Array.isArray(products)?products:[]);}catch(e){return [];}}
  function arr(v){return Array.isArray(v)?v:[];}
  function isHttp(u){return /^https?:\/\//i.test(String(u||'')) || /^blob:/i.test(String(u||'')) || /^data:/i.test(String(u||''));}
  function firstMediaFromArray(a){
    a=arr(a);
    for(var i=0;i<a.length;i++){
      var m=a[i]||{};
      var u=m.url||m.media_url||m.mediaUrl||m.src||m.path||m.publicUrl||m.public_url||m.image||m.imageUrl||'';
      if(u) return {url:String(u),type:String(m.type||m.media_type||m.kind||'').toLowerCase()};
    }
    return null;
  }
  function mediaOf(p){
    p=p||{};
    var direct=p.homeMediaUrl||p.home_media_url||p.mediaUrl||p.media_url||p.imageUrl||p.image_url||p.coverUrl||p.cover_url||p.thumbnailUrl||p.thumbnail_url||p.posterUrl||p.poster_url||p.url||'';
    var type=String(p.homeMediaType||p.home_media_type||p.mediaType||p.media_type||p.kind||p.type||'').toLowerCase();
    var m=null;
    if(!direct){
      m=firstMediaFromArray(p.homeMedia)||firstMediaFromArray(p.home_media)||firstMediaFromArray(p.media)||firstMediaFromArray(p.medias)||firstMediaFromArray(p.boutiqueMedia)||firstMediaFromArray(p.product_media)||firstMediaFromArray(p.photos)||firstMediaFromArray(p.images)||firstMediaFromArray(p.files);
      if(m){direct=m.url; if(!type)type=m.type;}
    }
    if(!direct || !isHttp(direct)) return null;
    if(!type){
      type=/\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(direct)?'video':'photo';
    }
    if(type.indexOf('video')>=0) type='video'; else type='photo';
    return {url:direct,type:type};
  }
  function productMatchesCard(p, name, price, cat){
    if(!p) return 0;
    var score=0;
    if(name && txtMatch(p.name,name)) score+=5;
    if(price && txtMatch(p.price,price)) score+=2;
    if(cat && txtMatch(p.cat,cat)) score+=1;
    return score;
  }
  function txtMatch(a,b){return String(a||'').trim().toLowerCase()===String(b||'').trim().toLowerCase();}
  function productForCard(card){
    var name=txt(card.querySelector('.name'));
    var price=txt(card.querySelector('.price'));
    var cat=txt(card.querySelector('.cat'));
    var products=listProducts();
    var best=null,bestScore=0;
    for(var i=0;i<products.length;i++){
      var s=productMatchesCard(products[i],name,price,cat);
      if(s>bestScore){best=products[i];bestScore=s;}
    }
    return bestScore>=5?best:null;
  }
  function mediaHTML(media){
    if(!media) return '';
    var url=escAttr(media.url);
    if(media.type==='video') return '<div class="happyadRealMedia"><video src="'+url+'" muted playsinline webkit-playsinline preload="metadata"></video><span class="happyadVideoMark">▶</span></div>';
    return '<div class="happyadRealMedia"><img src="'+url+'" alt="Produit boutique" loading="lazy" decoding="async"></div>';
  }
  function hydrateCard(card){
    if(!card || card.__happyadV107Hydrated) return;
    var pic=card.querySelector('.pic');
    if(!pic) return;
    var p=productForCard(card);
    var m=mediaOf(p);
    if(!m) return;
    var old=pic.querySelector('.bag');
    if(old){ old.insertAdjacentHTML('beforebegin',mediaHTML(m)); old.style.display='none'; }
    else if(!pic.querySelector('.happyadRealMedia')){ pic.insertAdjacentHTML('afterbegin',mediaHTML(m)); }
    pic.classList.add('hasRealMedia');
    card.__happyadV107Hydrated=true;
  }
  function hydrateCards(root){
    root=root||document;
    try{root.querySelectorAll('.product').forEach(hydrateCard);}catch(e){}
    try{hydratePreviewStrip();}catch(e){}
  }
  window.HAPPYAD_BOUTIQUE_MEDIA_SAFE = window.HAPPYAD_BOUTIQUE_MEDIA_SAFE || {};
  window.HAPPYAD_BOUTIQUE_MEDIA_SAFE.hydrate = hydrateCards;
  window.HAPPYAD_BOUTIQUE_MEDIA_SAFE.hydrateCard = hydrateCard;
  function hydratePreviewStrip(){
    var tiles=document.querySelectorAll('.previewTile');
    if(!tiles.length) return;
    var products=listProducts();
    tiles.forEach(function(tile,i){
      if(tile.__happyadV107Hydrated || i>=products.length) return;
      var m=mediaOf(products[i]); if(!m) return;
      tile.innerHTML=(m.type==='video')?'<video src="'+escAttr(m.url)+'" muted playsinline webkit-playsinline preload="metadata"></video>':'<img src="'+escAttr(m.url)+'" alt="Produit boutique">';
      tile.classList.add('hasRealMedia'); tile.__happyadV107Hydrated=true;
    });
  }
  function after(fnName){
    var old=window[fnName];
    if(typeof old!=='function' || old.__happyadV107Wrapped) return;
    var wrapped=function(){var r=old.apply(this,arguments); setTimeout(function(){hydrateCards(document);},0); return r;};
    wrapped.__happyadV107Wrapped=true;
    window[fnName]=wrapped;
    try{ if(typeof eval(fnName)==='function') eval(fnName+'=window[fnName]'); }catch(e){}
  }
  ['renderProducts','renderHomeSections','renderProfilePublications','renderVendorPublications','openCategoryView','renderMine','renderStats'].forEach(after);
  function observeVisibleBoxes(){
    if(!window.MutationObserver) return;
    ['catalog','homeSections','profilePreview','vendorPublications','myList'].forEach(function(id){
      try{
        var box=document.getElementById(id);
        if(!box || box.__happyadV107Observed) return;
        box.__happyadV107Observed=true;
        new MutationObserver(function(){ hydrateCards(box); }).observe(box,{childList:true,subtree:true});
      }catch(e){}
    });
  }
  document.addEventListener('DOMContentLoaded',function(){setTimeout(function(){hydrateCards(document);observeVisibleBoxes();},80);});
  setTimeout(function(){hydrateCards(document);observeVisibleBoxes();},300);
})();
