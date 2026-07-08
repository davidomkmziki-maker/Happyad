// Extracted from index.html. Keep load order.
(function(){
  if(window.__happyadV78BoutiqueBridge)return;
  window.__happyadV78BoutiqueBridge=true;

  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]})}
  function money(amount,currency){
    currency=String(currency||'UGX').toUpperCase();
    amount=Number(amount||0)||0;
    try{if(typeof formatBoutiqueMoney==='function')return formatBoutiqueMoney(amount,currency)}catch(e){}
    if(amount>=1000000){var m=amount/1000000;return (m%1===0?Math.round(m):m.toFixed(1).replace(/\.0$/,''))+'M '+currency}
    if(amount>=1000){var k=amount/1000;return (k%1===0?Math.round(k):k.toFixed(1).replace(/\.0$/,''))+'K '+currency}
    return Math.round(amount)+' '+currency;
  }
  function listProducts(){try{return Array.isArray(window.products)?window.products:products}catch(e){return []}}
  function nextProductId(){
    var arr=listProducts();
    var max=arr.reduce(function(m,p){return Math.max(m,Number(p.id)||0)},0);
    return max+1;
  }
  function normalizeType(t){
    t=String(t||'photo').toLowerCase();
    if(t==='image'||t==='img')return 'photo';
    if(t==='video'||t==='vid')return 'video';
    return 'photo';
  }
  function normalizeMedia(item,idx){
    if(typeof item==='string')item={url:item,type:'photo'};
    item=item||{};
    var type=normalizeType(item.type||item.media_type||item.kind);
    return {
      id:item.id||('m-'+Date.now()+'-'+idx),
      url:item.url||item.media_url||item.src||item.path||'',
      type:type,
      label:item.label||item.name||(type==='video'?'Vidéo':'Photo '+(idx+1)),
      orientation:item.orientation||'natural',
      sort_order:Number(item.sort_order==null?idx:item.sort_order)||idx,
      is_home_cover:!!item.is_home_cover
    };
  }
  function normalizeMediaList(media){
    return (Array.isArray(media)?media:[]).map(normalizeMedia).sort(function(a,b){return (a.sort_order||0)-(b.sort_order||0)});
  }
  function photoCount(media){return media.filter(function(m){return m.type==='photo'}).length}
  function selectedHomeIndexes(payload,media){
    var idxs=Array.isArray(payload.homeMediaIndexes)?payload.homeMediaIndexes.slice():null;
    if(!idxs||!idxs.length){
      var count=Number(payload.homeVisibleCount||payload.home_media_count||1)||1;
      count=Math.max(1,Math.min(count,media.length));
      idxs=[];
      for(var i=0;i<media.length&&idxs.length<count;i++){if(media[i].type==='photo')idxs.push(i)}
    }
    idxs=idxs.map(function(x){return Number(x)||0}).filter(function(x,i,a){return x>=0&&x<media.length&&a.indexOf(x)===i});
    return idxs;
  }
  function validateDraft(payload){
    payload=payload||{};
    var media=normalizeMediaList(payload.media||payload.photos||payload.product_media||[]);
    var errors=[];
    if(!String(payload.title||payload.name||'').trim())errors.push('Titre produit obligatoire');
    if(!(Number(payload.priceAmount||payload.price_amount||payload.amount)||0))errors.push('Montant obligatoire');
    if(photoCount(media)<6)errors.push('6 photos minimum pour publier en boutique');
    var idxs=selectedHomeIndexes(payload,media);
    if(!idxs.length)errors.push('Choisissez au moins 1 photo pour l’accueil HAPPYAD');
    if(idxs.some(function(i){return media[i]&&media[i].type!=='photo'}))errors.push('L’accueil HAPPYAD accepte seulement les photos du produit');
    return {ok:!errors.length,errors:errors,media:media,homeIndexes:idxs};
  }
  function buildPostAndProduct(payload){
    var v=validateDraft(payload);
    if(!v.ok)return {ok:false,errors:v.errors};
    var media=v.media, homeIdx=v.homeIndexes;
    var homeMedia=homeIdx.map(function(i){var m=Object.assign({},media[i]);m.is_home_cover=true;return m});
    var homeSet={}; homeIdx.forEach(function(i){homeSet[i]=true});
    var boutiqueMedia=media.filter(function(_,i){return !homeSet[i]}).map(function(m){return Object.assign({},m,{is_home_cover:false})});
    if(!boutiqueMedia.length)boutiqueMedia=media.map(function(m){return Object.assign({},m,{is_home_cover:false})});
    var id=Number(payload.productId||payload.id)||nextProductId();
    var currency=String(payload.currency||payload.currencyCode||payload.devise||'UGX').toUpperCase();
    var amount=Number(payload.priceAmount||payload.price_amount||payload.amount)||0;
    var seller=payload.sellerName||payload.seller||payload.displayName||'Vendeur HAPPYAD';
    var postId=payload.postId||payload.linkedPostId||('HP-'+Date.now());
    var product={
      id:id,
      name:String(payload.title||payload.name).trim(),
      cat:String(payload.category||payload.cat||'mode').toLowerCase(),
      seller:seller,
      seller_id:payload.sellerId||payload.user_id||payload.seller_id||null,
      price:money(amount,currency),
      priceText:money(amount,currency),
      unitAmount:amount,
      priceAmount:amount,
      currency:currency,
      currencyCode:currency,
      devise:currency,
      tag:payload.tag||'Boutique',
      rate:payload.rate||'0',
      desc:payload.description||payload.caption||'',
      postType:'boutique',
      source:'happyad',
      linkedHappyadPostId:postId,
      happyadPostId:postId,
      happyadCartButtonOnly:true,
      homeMedia:homeMedia,
      homeMediaUrl:homeMedia[0]&&homeMedia[0].url||'',
      homeMediaType:'photo',
      homeVisibleCount:homeMedia.length,
      boutiqueMedia:boutiqueMedia,
      mediaCount:media.length,
      deliveryZones:payload.deliveryZones||payload.delivery_zones||[{name:'Kampala centre',hours:2}],
      cart_enabled:payload.cartEnabled!==false,
      status:'active'
    };
    var post={
      id:postId,
      user_id:product.seller_id,
      post_type:'boutique',
      caption:payload.caption||product.desc||product.name,
      home_media:homeMedia,
      home_media_url:product.homeMediaUrl,
      home_media_type:'photo',
      boutique_product_id:id,
      action:'cart_only',
      button_label:''
    };
    return {ok:true,post:post,product:product,media:media,homeMedia:homeMedia,boutiqueMedia:boutiqueMedia};
  }
  function refreshAll(){
    ['renderProducts','renderHomeSections','renderProfilePublications','renderVendorPublications','renderMine','renderStats','renderCart','syncCartCount','updatePublicPreviewRating'].forEach(function(fn){try{if(typeof window[fn]==='function')window[fn]()}catch(e){}});
    try{hydrateIcons(document)}catch(e){}
  }
  function publishFromHappyad(payload){
    var built=buildPostAndProduct(payload||{});
    if(!built.ok){try{toast(built.errors[0]||'Publication boutique impossible')}catch(e){} return built;}
    var arr=listProducts();
    var existing=arr.find(function(p){return String(p.id)===String(built.product.id)||String(p.linkedHappyadPostId||'')===String(built.post.id)});
    if(existing){Object.assign(existing,built.product)}else{arr.push(built.product)}
    window.__happyadBoutiqueLinkedPosts=window.__happyadBoutiqueLinkedPosts||[];
    var oldPost=window.__happyadBoutiqueLinkedPosts.find(function(p){return String(p.id)===String(built.post.id)});
    if(oldPost)Object.assign(oldPost,built.post); else window.__happyadBoutiqueLinkedPosts.push(built.post);
    refreshAll();
    try{toast('Publié dans HAPPYAD et Boutique')}catch(e){}
    return built;
  }
  function openCartFromHappyad(productId,qty){
    qty=Math.max(1,Number(qty)||1);
    var p=listProducts().find(function(x){return String(x.id)===String(productId)||String(x.linkedHappyadPostId||'')===String(productId)});
    if(!p){try{toast('Produit boutique introuvable')}catch(e){} return false;}
    var enabled=true;
    try{enabled=(typeof globalCartEnabled==='undefined'||globalCartEnabled)&&(!window.productCartEnabled||productCartEnabled[p.id]!==false)}catch(e){}
    if(!enabled){try{toast('Panier désactivé par le vendeur')}catch(e){} return false;}
    try{
      var existing=cart.find(function(item){return String(item.id)===String(p.id)});
      if(existing)existing.qty+=qty; else cart.push({id:p.id,qty:qty,fromHappyad:true,linkedPostId:p.linkedHappyadPostId||null});
    }catch(e){window.cart=[{id:p.id,qty:qty,fromHappyad:true,linkedPostId:p.linkedHappyadPostId||null}]}
    try{syncCartCount()}catch(e){}
    try{show('cart')}catch(e){try{window.currentScreen='cart'}catch(_){}}
    try{renderCart()}catch(e){}
    try{toast('Produit sélectionné')}catch(e){}
    return true;
  }
  function cartButtonHTML(productId,label){ return ''; }
  function postFromProduct(productId){
    var p=listProducts().find(function(x){return String(x.id)===String(productId)});
    if(!p)return null;
    return {id:p.linkedHappyadPostId||('HP-PROD-'+p.id),post_type:'boutique',caption:p.desc||p.name,home_media:p.homeMedia||[],home_media_url:p.homeMediaUrl||'',boutique_product_id:p.id,button_label:'',button_html:''};
  }

  window.validateHappyadBoutiqueDraft=validateDraft;
  window.publishHappyadBoutique=publishFromHappyad;
  window.openBoutiqueCartFromHappyad=openCartFromHappyad;
  window.happyadBoutiqueCartButtonHTML=cartButtonHTML;
  window.createHappyadHomePostFromProduct=postFromProduct;
  window.HAPPYAD_BOUTIQUE_BRIDGE={
    validateDraft:validateDraft,
    buildPostAndProduct:buildPostAndProduct,
    publishFromHappyad:publishFromHappyad,
    openCartFromHappyad:openCartFromHappyad,
    cartButtonHTML:cartButtonHTML,
    postFromProduct:postFromProduct,
    rules:{minPhotos:6,homeRequiresPhoto:true,homeAction:'cart_only',onePublishCreates:['happyad_post','boutique_product']}
  };
  window.HAPPYAD_BOUTIQUE_SCHEMA={
    happyad_posts:['id','user_id','post_type','caption','home_media_url','home_media_type','boutique_product_id','created_at','updated_at','is_active'],
    boutique_products:['id','seller_id','linked_post_id','title','description','category','price_amount','currency','cart_enabled','status','created_at','updated_at'],
    boutique_product_media:['id','product_id','media_url','media_type','sort_order','is_home_cover','created_at'],
    boutique_delivery_zones:['id','product_id','zone_name','delivery_hours','is_active'],
    boutique_orders:['id','product_id','post_id','buyer_id','seller_id','quantity','locked_title','locked_price_amount','locked_currency','locked_delivery_zone','locked_delivery_hours','status','paid_at','seller_delivered_at','client_received_at','created_at']
  };

  var oldOpenDetail=window.openDetail;
  function cssUrl(url){return String(url||'').replace(/[\\"\n\r]/g,'')}
  function productMedia(p){
    var arr=normalizeMediaList(p&&p.boutiqueMedia||[]);
    if(!arr.length)arr=normalizeMediaList(p&&p.media||[]);
    return arr;
  }
  function applyProductMedia(id){
    var p=listProducts().find(function(x){return String(x.id)===String(id)});
    if(!p)return;
    var media=productMedia(p);
    if(!media.length)return;
    window.activeDetailMedia=media; window.detailMedia=media; window.activeMediaIndex=0; window.detailMediaIndex=0;
    var thumbs=document.getElementById('detailThumbs');
    if(thumbs){
      thumbs.innerHTML=media.map(function(m,i){
        var bg=m.url?' style="background-image:url(\''+cssUrl(m.url)+'\')"':'';
        return '<button class="mediaThumb hasRealMedia '+(i===0?'active':'')+'" '+bg+' onclick="selectDetailMedia('+i+')" aria-label="'+esc(m.label)+'">'+(m.type==='video'&&typeof icon==='function'?icon('play','ico'):(typeof icon==='function'?icon('image','ico'):''))+'<small>'+(i+1)+'</small></button>';
      }).join('');
    }
    try{window.renderDetailMedia()}catch(e){}
  }
  if(typeof oldOpenDetail==='function'&&!oldOpenDetail.__v78Bridge){
    var wrapped=function(id){var r=oldOpenDetail.apply(this,arguments);setTimeout(function(){applyProductMedia(id)},30);return r;};
    wrapped.__v78Bridge=true;
    window.openDetail=wrapped;
  }
  var oldRender=window.renderDetailMedia;
  if(typeof oldRender==='function'&&!oldRender.__v78Bridge){
    var renderWrapped=function(){
      var media=window.activeDetailMedia||window.detailMedia||[];
      var m=media[window.activeMediaIndex||0];
      if(m&&m.url){
        var box=document.getElementById('detailMainMedia');
        var p=window.activeDetailProduct||window.currentDetailProduct||{};
        if(box){
          var isVideo=m.type==='video';
          box.innerHTML='<button class="fullBtn" onclick="event.stopPropagation();openMediaViewer(true)" aria-label="Plein écran">'+(typeof icon==='function'?icon('fullscreen','icoMini'):'')+'</button><span class="tag">'+esc(isVideo?'Vidéo':(p.tag||'Photo'))+'</span><div class="detailVisual hasRealMedia '+(isVideo?'video':'photo')+'" style="background-image:url(\''+cssUrl(m.url)+'\')">'+(isVideo?'<div class="playBubble">'+(typeof icon==='function'?icon('play','ico'):'▶')+'</div>':'')+'</div><div class="mediaHint">'+esc(m.label||'Média boutique')+'</div>';
          document.querySelectorAll('#detailThumbs .mediaThumb').forEach(function(b,k){b.classList.toggle('active',k===(window.activeMediaIndex||0))});
          try{hydrateIcons(box)}catch(e){}
          return;
        }
      }
      return oldRender.apply(this,arguments);
    };
    renderWrapped.__v78Bridge=true;
    window.renderDetailMedia=renderWrapped;
  }
})();
