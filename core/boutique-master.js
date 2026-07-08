(function(){
  'use strict';
  if(window.__HAPPYAD_BOUTIQUE_MASTER_V10__)return;
  window.__HAPPYAD_BOUTIQUE_MASTER_V10__=true;

  var MASTER_VERSION='BOUTIQUE_MASTER_V10';
  var CART_KEY='HAPPYAD_BOUTIQUE_CART_REQUEST_V409';
  var legacyCart=typeof window.happyadOpenBoutiqueCartRequest==='function'?window.happyadOpenBoutiqueCartRequest:null;
  var legacyReturn=typeof window.happyadReturnFromBoutiqueToMainProfileV503==='function'?window.happyadReturnFromBoutiqueToMainProfileV503:null;

  function clean(v){return String(v==null?'':v).trim();}
  function qs(params){params=params||{};var out=[];Object.keys(params).forEach(function(k){var v=params[k];if(v!==undefined&&v!==null&&clean(v)!=='')out.push(encodeURIComponent(k)+'='+encodeURIComponent(clean(v)));});return out.length?'?'+out.join('&'):'';}
  function productIdOf(p){p=p||{};try{if(typeof window.happyadBoutiqueProductId==='function')return clean(window.happyadBoutiqueProductId(p));}catch(_e){}return clean(p.boutique_product_id||p.boutiqueProductId||p.product_id||p.linked_product_id||p.linkedProductId||p.id);}
  function postIdOf(p){p=p||{};return clean(p.id||p.post_id||p.happyadPostId);}
  function clearReturnKeys(reason){
    ['HAPPYAD_BOUTIQUE_RETURN_VIEW_V503','HAPPYAD_BOUTIQUE_RETURN_URL_V503','HAPPYAD_BOUTIQUE_RETURN_PAGE_V499','HAPPYAD_BOUTIQUE_ENTRY_LOCK_V499','HAPPYAD_BOUTIQUE_BACK_FORCE_MAIN_PROFILE_V501','HAPPYAD_PENDING_BOUTIQUE_RETURN_TARGET_V503'].forEach(function(k){try{sessionStorage.removeItem(k);}catch(_e){}});
    try{delete window.__HAPPYAD_BOUTIQUE_RETURN_V503;}catch(_d){window.__HAPPYAD_BOUTIQUE_RETURN_V503=null;}
    try{sessionStorage.setItem('HAPPYAD_BOUTIQUE_MASTER_LAST_CLEAR',JSON.stringify({reason:reason||MASTER_VERSION,t:Date.now?Date.now():new Date().getTime()}));}catch(_e2){}
  }
  function rememberReturn(from){
    try{
      var view=clean(from&&from.view)||clean(sessionStorage.getItem('HAPPYAD_ACTIVE_APP_VIEW'))||'home';
      var url=clean(from&&from.url)||clean(sessionStorage.getItem('HAPPYAD_LAST_APP_URL'))||'index.html';
      if(view==='boutique'||url.indexOf('boutique.html')>=0){view='home';url='index.html';}
      if((from&&from.view==='profile') || /modules\/user\.html/.test(url)){view='profile'; if(!url||url==='index.html')url='modules/user.html';}
      var target={view:view,url:url,t:Date.now?Date.now():new Date().getTime(),source:MASTER_VERSION};
      window.__HAPPYAD_BOUTIQUE_RETURN_V503=target;
      sessionStorage.setItem('HAPPYAD_BOUTIQUE_RETURN_VIEW_V503',view);
      sessionStorage.setItem('HAPPYAD_BOUTIQUE_RETURN_URL_V503',url);
      return target;
    }catch(_e){return {view:'home',url:'index.html',source:MASTER_VERSION};}
  }
  function writeCartRequest(post,opts){
    opts=opts||{};post=post||{};
    var productId=clean(opts.productId)||productIdOf(post);
    var postId=clean(opts.postId)||postIdOf(post);
    var req={productId:productId,postId:postId,qty:Number(opts.qty||1)||1,title:post.title||post.name||'',price:post.price||'',t:Date.now?Date.now():new Date().getTime(),from:opts.from||'home_post_buy',source:MASTER_VERSION};
    try{localStorage.setItem(CART_KEY,JSON.stringify(req));}catch(_e){}
    return req;
  }
  function open(opts){
    opts=opts||{}; rememberReturn(opts.fromTarget||{});
    var params={v:'532'};
    try{if(opts.fromTarget&&opts.fromTarget.view==='profile'){params.return='profile';params.entry=opts.from||'profile';}}catch(_rf){}
    if(opts.cart)params.cart=1;
    if(opts.productId)params.product=opts.productId;
    if(opts.postId)params.post=opts.postId;
    if(opts.from)params.from=opts.from;
    var url='boutique.html'+qs(params);
    var opened=false;
    try{if(window.HappyNavigation&&typeof window.HappyNavigation.open==='function')opened=!!window.HappyNavigation.open(url,{source:MASTER_VERSION,boutique:opts,fromTarget:opts.fromTarget||null});}catch(_e){opened=false;}
    if(opened){
      /* V10: vérification douce. Si une ancienne couche bloque l'affichage de Boutique,
         on relance une seule fois par le maître navigation, sans changer de design. */
      try{setTimeout(function(){try{
        var f=window.HappyNavigation&&window.HappyNavigation.activeFrame&&window.HappyNavigation.activeFrame();
        var ok=f&&String(f.getAttribute('data-happyad-page')||'')==='boutique'&&f.classList&&f.classList.contains('on');
        if(!ok&&window.HappyNavigation&&typeof window.HappyNavigation.open==='function'){
          window.HappyNavigation.open(url,{source:MASTER_VERSION+'-verify-reopen',boutique:opts,fromTarget:opts.fromTarget||null,replace:true});
        }
      }catch(_v){}},180);}catch(_t){}
      return true;
    }
    try{location.href=url+(url.indexOf('?')>=0?'&':'?')+'standaloneBoutique=1';return true;}catch(_e4){return false;}
  }
  function openCartFromPost(post,opts){
    opts=opts||{};post=post||{};
    var req=writeCartRequest(post,opts);
    return open({cart:true,productId:req.productId,postId:req.postId,from:opts.from||'home',fromTarget:opts.fromTarget});
  }
  function returnToSource(opts){
    opts=opts||{};
    var target=null;
    try{target=window.__HAPPYAD_BOUTIQUE_RETURN_V503||null;}catch(_e){}
    try{
      if(!target){target={view:sessionStorage.getItem('HAPPYAD_BOUTIQUE_RETURN_VIEW_V503')||'home',url:sessionStorage.getItem('HAPPYAD_BOUTIQUE_RETURN_URL_V503')||'index.html'};}
    }catch(_s){target=null;}
    clearReturnKeys('return-to-source');
    var url=clean(target&&target.url)||'index.html';
    if(url.indexOf('boutique.html')>=0)url='index.html';
    try{
      if(window.HappyNavigation){
        var view=clean(target&&target.view)||'';
        if(view==='profile' && (!url || url==='index.html' || url==='/'))url='modules/user.html?fromBoutique=1';
        if(url==='index.html'||url==='/'||url==='#')return window.HappyNavigation.close('boutique-return');
        return window.HappyNavigation.open(url,{source:MASTER_VERSION,replace:!!opts.replace});
      }
    }catch(_e){}
    try{location.href=url;return true;}catch(_x){return false;}
  }
  function destroy(){clearReturnKeys('boutique-master-destroy');try{if(window.HappyNavigation)HappyNavigation.close('boutique-master-destroy');}catch(_e){}return true;}

  window.HappyBoutique={version:MASTER_VERSION,open:open,openCartFromPost:openCartFromPost,returnToSource:returnToSource,clearReturnKeys:clearReturnKeys,rememberReturn:rememberReturn,writeCartRequest:writeCartRequest,destroy:destroy,legacyCart:legacyCart,legacyReturn:legacyReturn};
  window.happyadOpenBoutiqueCartRequest=function(p){return openCartFromPost(p,{source:'legacy-happyadOpenBoutiqueCartRequest'});};
  window.happyadReturnFromBoutiqueToMainProfileV503=function(opts){return returnToSource(opts||{});};
  window.happyadOpenBoutiqueMasterV10=open;
  window.happyadOpenBoutiqueMasterV9=open;
  window.happyadOpenBoutiqueMasterV8=open;

  try{window.addEventListener('message',function(ev){try{var d=ev&&ev.data;if(d&&d.type==='HAPPYAD_RETURN_FROM_BOUTIQUE_TO_MAIN_PROFILE_V503'){ev.stopImmediatePropagation&&ev.stopImmediatePropagation();returnToSource({source:'boutique-message'});return false;}}catch(_e){}},true);}catch(_e){}
  try{if(window.HappyMasterRegistry)HappyMasterRegistry.register('boutique',{file:'core/boutique-master.js',responsibility:'boutique, panier, produit, retour boutique, nettoyage frame/keys boutique',legacy:['happyadOpenBoutiqueCartRequest','happyadReturnFromBoutiqueToMainProfileV503'],active:true,version:MASTER_VERSION});}catch(_e){}
})();
