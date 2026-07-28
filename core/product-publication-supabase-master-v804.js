/* HAPPYAD V804 — publication Produit dans public.happyad_posts, auditée depuis V803.
   - vendeur obligatoirement approuvé par Admin (V801) ;
   - 1 à 6 images/vidéos dans le bucket happyad-media ;
   - aucune table d'annonces parallèle ;
   - mise à jour immédiate des caches et de la centrale Annonces.
*/
(function(){
  'use strict';
  if(window.__HAPPYAD_PRODUCT_PUBLICATION_SUPABASE_V804__)return;
  window.__HAPPYAD_PRODUCT_PUBLICATION_SUPABASE_V804__=true;

  var VERSION='V804_PRODUCT_PUBLICATION_AUDIT_STABLE';
  var BUCKET='happyad-media';
  var RPC='happyad_publish_product_v1';
  var priorBridge=window.HAPPYAD_PUBLICATION_BRIDGE||null;
  /* Capture directe du maître V801 avant que l'intégration Chat n'installe son proxy. */
  var verificationBridge=window.HAPPYAD_VERIFICATION_BRIDGE||null;

  function clean(value){return String(value==null?'':value).replace(/\s+/g,' ').trim();}
  function num(value){var n=Number(String(value==null?'':value).replace(/\s/g,'').replace(',','.'));return Number.isFinite(n)?n:0;}
  function client(){
    try{if(typeof window.happyadSb==='function'){var c=window.happyadSb();if(c&&c.from&&c.storage&&c.auth)return c;}}catch(_e){}
    try{if(window.happyadSupabase&&window.happyadSupabase.from)return window.happyadSupabase;}catch(_e){}
    try{if(window.supabaseClient&&window.supabaseClient.from)return window.supabaseClient;}catch(_e){}
    try{if(window.HAPPYAD_SUPABASE&&window.HAPPYAD_SUPABASE.from)return window.HAPPYAD_SUPABASE;}catch(_e){}
    return null;
  }
  function uuid(){
    try{if(window.crypto&&typeof window.crypto.randomUUID==='function')return window.crypto.randomUUID();}catch(_e){}
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(ch){var r=Math.random()*16|0,v=ch==='x'?r:(r&3|8);return v.toString(16);});
  }
  function extension(file){
    var name=clean(file&&file.name).toLowerCase();
    var match=name.match(/\.([a-z0-9]{1,8})$/);
    if(match)return match[1].replace(/[^a-z0-9]/g,'')||'bin';
    var type=clean(file&&file.type).toLowerCase();
    if(type==='image/jpeg')return 'jpg';
    if(type==='image/png')return 'png';
    if(type==='image/webp')return 'webp';
    if(type==='video/mp4')return 'mp4';
    if(type==='video/webm')return 'webm';
    if(type==='video/quicktime')return 'mov';
    return 'bin';
  }
  function isProduct(category){
    category=clean(category).toLowerCase();
    return category==='produit'||category==='électronique'||category==='electronique';
  }
  function productCategory(category){
    return clean(category).toLowerCase().indexOf('électron')>=0||clean(category).toLowerCase().indexOf('electron')>=0?'Électronique':'Produit';
  }
  function errorText(error){
    var message=clean(error&&error.message||error);
    if(message.indexOf('SELLER_NOT_APPROVED')>=0)return 'Ton compte vendeur doit d’abord être approuvé par l’équipe HAPPYAD.';
    if(message.indexOf('HAPPYAD_V801_VERIFICATION_REQUIRED')>=0)return 'Le SQL de vérification vendeur V801 doit être installé avant la publication.';
    if(message.indexOf('HAPPYAD_POSTS_TABLE_REQUIRED')>=0)return 'La centrale happyad_posts est introuvable.';
    if(message.indexOf('MEDIA_UPLOAD_MISSING')>=0)return 'Un média n’a pas été chargé correctement. Réessaie.';
    if(message.indexOf('MEDIA_COUNT_INVALID')>=0)return 'Ajoute entre 1 et 6 images ou vidéos.';
    if(message.indexOf('TITLE_INVALID')>=0)return 'Le titre du produit est invalide.';
    if(message.indexOf('DESCRIPTION_INVALID')>=0)return 'La description doit contenir au moins 50 caractères.';
    if(message.indexOf('PRICE_INVALID')>=0)return 'Indique un prix supérieur à zéro.';
    if(message.indexOf('CONDITION_INVALID')>=0)return 'Choisis l’état réel du produit.';
    if(message.indexOf('QUANTITY_INVALID')>=0)return 'Indique une quantité disponible valide.';
    if(message.indexOf('PUBLICATION_RETURN_INVALID')>=0)return 'HAPPYAD n’a pas confirmé l’identifiant du produit publié.';
    if(message.indexOf('Could not find the function')>=0||message.indexOf(RPC)>=0)return 'Le service de publication Produit doit être mis à jour.';
    if(message.indexOf('row-level security')>=0||message.indexOf('policy')>=0)return 'Les règles Storage Produit V803 ne sont pas encore installées.';
    return message||'Publication du produit impossible.';
  }
  async function currentUser(c){
    var result=await c.auth.getUser();
    if(result&&result.error)throw result.error;
    var user=result&&result.data&&result.data.user;
    if(!user||!user.id)throw new Error('Connecte-toi à ton compte HAPPYAD avant de publier.');
    return user;
  }
  async function approvedSeller(){
    var bridge=verificationBridge||window.HAPPYAD_VERIFICATION_BRIDGE;
    if(!bridge)throw new Error('Le service de vérification vendeur est indisponible.');
    var state=null;
    try{
      if(typeof bridge.getCachedStatus==='function')state=bridge.getCachedStatus();
    }catch(_e){}
    var status=clean(state&&state.status).toLowerCase();
    if(['approved','verified','validated','active'].indexOf(status)>=0)return state;
    if(typeof bridge.getStatus!=='function')throw new Error('Le service de vérification vendeur est indisponible.');
    state=await bridge.getStatus();
    status=clean(state&&state.status).toLowerCase();
    if(['approved','verified','validated','active'].indexOf(status)<0)throw new Error('SELLER_NOT_APPROVED');
    return state;
  }
  function validate(payload){
    payload=payload&&typeof payload==='object'?payload:{};
    var offer=payload.offer&&typeof payload.offer==='object'?payload.offer:{};
    var proofs=payload.proofs&&typeof payload.proofs==='object'?payload.proofs:{};
    var files=Array.isArray(proofs.evidence)?proofs.evidence.filter(Boolean):[];
    if(!isProduct(offer.category))throw new Error('Cette étape V804 connecte uniquement les catégories Produit et Électronique.');
    if(clean(offer.title).length<3)throw new Error('Indique le nom exact du produit.');
    if(clean(offer.description).length<50)throw new Error('La description doit contenir au moins 50 caractères.');
    if(clean(offer.country).length<2||clean(offer.city).length<2)throw new Error('Indique le pays et la ville du produit.');
    if(num(offer.price)<=0)throw new Error('Indique un prix supérieur à zéro.');
    if(clean(offer.currency).length<2)throw new Error('Choisis la monnaie du prix.');
    if(clean(offer.availability).length<2)throw new Error('Choisis la disponibilité du produit.');
    if(['Neuf','Comme neuf','Occasion','Reconditionné'].indexOf(clean(offer.condition))<0)throw new Error('Choisis l’état réel du produit.');
    if(num(offer.quantity)<1)throw new Error('Indique une quantité disponible valide.');
    if(files.length<1||files.length>6)throw new Error('Ajoute entre 1 et 6 images ou vidéos.');
    if(proofs.attested!==true)throw new Error('Confirme l’attestation avant de publier.');
    files.forEach(function(file){
      var type=clean(file&&file.type).toLowerCase();
      var image=type.indexOf('image/')===0,video=type.indexOf('video/')===0;
      if(!image&&!video)throw new Error('Les produits acceptent uniquement des images ou vidéos.');
      if(image&&file.size>12*1024*1024)throw new Error('Chaque image doit faire au maximum 12 Mo.');
      if(video&&file.size>40*1024*1024)throw new Error('Chaque vidéo doit faire au maximum 40 Mo.');
    });
    return {offer:offer,proofs:proofs,files:files};
  }
  async function upload(c,user,listingId,file,index){
    var type=clean(file.type).toLowerCase();
    var kind=type.indexOf('video/')===0?'video':'image';
    var path=user.id+'/marketplace/'+listingId+'/'+String(index+1).padStart(2,'0')+'-'+uuid()+'.'+extension(file);
    var result=await c.storage.from(BUCKET).upload(path,file,{
      upsert:false,
      cacheControl:'31536000',
      contentType:file.type||'application/octet-stream'
    });
    if(result&&result.error)throw result.error;
    var publicResult=c.storage.from(BUCKET).getPublicUrl(path);
    var src=publicResult&&publicResult.data&&publicResult.data.publicUrl||'';
    if(!src)throw new Error('URL publique du média introuvable.');
    return {path:path,src:src,type:kind,mime:file.type||'',name:file.name||'',size:Number(file.size||0),poster:''};
  }
  async function cleanup(c,paths){
    if(!paths.length)return;
    try{await c.storage.from(BUCKET).remove(paths);}catch(_e){}
  }
  function normalizedListing(row,offer,media,user,verification){
    row=row&&typeof row==='object'?row:{};
    var first=media[0]||{};
    var id=clean(row.id||row.listing_id||row.post_id);
    return Object.assign({},row,{
      id:id,
      post_id:id,
      user_id:user.id,
      owner_id:user.id,
      seller_id:user.id,
      mode:'marketplace',
      happyad_marketplace:true,
      is_marketplace:true,
      marketplace_category:productCategory(offer.category),
      category:productCategory(offer.category),
      listing_type:clean(offer.type||'À vendre'),
      listing_status:'active',
      status:'active',
      is_active:true,
      title:clean(offer.title),
      description:clean(offer.description),
      country:clean(offer.country),
      city:clean(offer.city),
      location:clean(offer.location||[offer.city,offer.country].filter(Boolean).join(' · ')),
      marketplace_price:num(offer.price),
      price:num(offer.price),
      price_label:clean(offer.priceLabel||offer.price+' '+offer.currency),
      currency:clean(offer.currency),
      availability:clean(offer.availability),
      product_condition:clean(offer.condition),
      condition:clean(offer.condition),
      quantity:Math.max(1,Math.floor(num(offer.quantity))),
      product_brand:clean(offer.productBrand),
      product_model:clean(offer.productModel),
      marketplace_media:media,
      media:media,
      media_url:first.src||'',
      media_path:first.path||'',
      media_type:first.type||'image',
      seller_verification_id:clean(verification&&verification.id||verification&&verification.requestId),
      created_at:row.created_at||new Date().toISOString()
    });
  }
  function patchOneCache(key,listing){
    try{
      var raw=JSON.parse(localStorage.getItem(key)||'null');
      var shape='array',list=raw;
      if(raw&&Array.isArray(raw.posts)){shape='posts';list=raw.posts;}
      else if(raw&&Array.isArray(raw.data)){shape='data';list=raw.data;}
      if(!Array.isArray(list))list=[];
      var next=[listing].concat(list.filter(function(item){return clean(item&&item.id)!==clean(listing.id);})).slice(0,420);
      if(shape==='posts'){raw=raw||{};raw.posts=next;localStorage.setItem(key,JSON.stringify(raw));}
      else if(shape==='data'){raw=raw||{};raw.data=next;localStorage.setItem(key,JSON.stringify(raw));}
      else localStorage.setItem(key,JSON.stringify(next));
    }catch(_e){}
  }
  function patchCaches(listing){
    [
      'HAPPYAD_GLOBAL_POSTS_CACHE_V1','HAPPYAD_PUBLISH_POSTS_V2','HAPPYAD_HOME_POSTS_CACHE_V1',
      'HAPPYAD_ALL_POSTS_V1','HAPPYAD_SEARCH_POSTS_FAST_CACHE_V1','HAPPYAD_PROFILE_POSTS_CACHE_V1'
    ].forEach(function(key){patchOneCache(key,listing);});
    try{localStorage.setItem('HAPPYAD_HOME_REFRESH_NEEDED','1');}catch(_e){}
    try{sessionStorage.removeItem('HAPPYAD_ALL_POSTS_LAST_SYNC');sessionStorage.removeItem('HAPPYAD_PROFILE_POSTS_LAST_SYNC');}catch(_e){}
  }
  async function publishProduct(payload){
    var parsed=validate(payload);
    var c=client();
    if(!c)throw new Error('Le service HAPPYAD est momentanément indisponible.');
    var user=await currentUser(c);
    var verification=await approvedSeller();
    var listingId='market_'+Date.now().toString(36)+'_'+uuid().replace(/-/g,'').slice(0,12);
    var media=[],paths=[];
    try{
      for(var i=0;i<parsed.files.length;i++){
        var item=await upload(c,user,listingId,parsed.files[i],i);
        media.push(item);paths.push(item.path);
      }
      var offer=parsed.offer;
      var result=await c.rpc(RPC,{
        p_listing_id:listingId,
        p_title:clean(offer.title),
        p_description:clean(offer.description),
        p_offer_type:clean(offer.type||'À vendre'),
        p_category:productCategory(offer.category),
        p_country:clean(offer.country),
        p_city:clean(offer.city),
        p_price:num(offer.price),
        p_currency:clean(offer.currency),
        p_availability:clean(offer.availability),
        p_condition:clean(offer.condition),
        p_quantity:Math.max(1,Math.floor(num(offer.quantity))),
        p_brand:clean(offer.productBrand),
        p_model:clean(offer.productModel),
        p_media_paths:paths,
        p_media_items:media,
        p_attested:true
      });
      if(result&&result.error)throw result.error;
      var data=result&&result.data||{};
      var listing=normalizedListing(data.listing||{},offer,media,user,verification);
      if(!clean(listing&&listing.id))throw new Error('PUBLICATION_RETURN_INVALID');
      patchCaches(listing);
      try{document.dispatchEvent(new CustomEvent('happyad:marketplace-product-published',{detail:{listing:listing,source:VERSION}}));}catch(_e){}
      try{document.dispatchEvent(new CustomEvent('HAPPYAD_REAL_OFFERS_READY',{detail:{count:1,listing:listing,source:VERSION}}));}catch(_e){}
      try{
        if(window.HappyadChatIntegrationV795&&typeof window.HappyadChatIntegrationV795.reloadListings==='function'){
          setTimeout(function(){window.HappyadChatIntegrationV795.reloadListings();},80);
        }
      }catch(_e){}
      return {ok:true,listing:listing,source:'supabase-v804'};
    }catch(error){
      await cleanup(c,paths);
      throw new Error(errorText(error));
    }
  }

  window.HAPPYAD_PUBLICATION_BRIDGE={
    version:VERSION,
    publishOffer:function(payload){
      var category=payload&&payload.offer&&payload.offer.category;
      if(isProduct(category))return publishProduct(payload);
      if(priorBridge&&typeof priorBridge.publishOffer==='function')return priorBridge.publishOffer(payload);
      return Promise.reject(new Error('Cette étape connecte uniquement la publication Produit et Électronique.'));
    },
    publishProduct:publishProduct,
    previous:priorBridge||null
  };

  try{if(window.HappyMasterRegistry)window.HappyMasterRegistry.register('product-publication-supabase',{file:'core/product-publication-supabase-master-v804.js',responsibility:'publication Produit dans happyad_posts et happyad-media après validation Admin',active:true,version:VERSION});}catch(_e){}
})();
