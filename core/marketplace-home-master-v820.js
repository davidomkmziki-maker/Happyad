/* HAPPYAD V820 — annonces choisies dans l’Accueil, ouverture directe et vues uniques. */
(function(){
  'use strict';
  if(window.__HAPPYAD_MARKETPLACE_HOME_MASTER_V820__)return;
  window.__HAPPYAD_MARKETPLACE_HOME_MASTER_V820__=true;

  var VERSION='V820_HOME_COVER_BADGES_VIEWS';
  var observed=new WeakSet();
  var pending=new Map();
  var lastFullscreenId='';

  function clean(value){return String(value==null?'':value).replace(/\s+/g,' ').trim();}
  function truth(value){return value===true||value===1||/^(true|1|yes|oui|on)$/i.test(clean(value));}
  function css(value){try{return window.CSS&&typeof CSS.escape==='function'?CSS.escape(String(value)):String(value).replace(/[^a-zA-Z0-9_-]/g,'\\$&');}catch(_e){return String(value||'');}}
  function client(){
    try{if(typeof window.happyadSb==='function'){var c=window.happyadSb();if(c&&typeof c.rpc==='function')return c;}}catch(_e){}
    try{if(window.happyadSupabase&&typeof window.happyadSupabase.rpc==='function')return window.happyadSupabase;}catch(_e){}
    try{if(window.supabaseClient&&typeof window.supabaseClient.rpc==='function')return window.supabaseClient;}catch(_e){}
    return null;
  }
  function isMarketplace(post){
    post=post||{};
    return post.happyadMarketplace===true||post.happyad_marketplace===true||post.is_marketplace===true||clean(post.mode).toLowerCase()==='marketplace';
  }
  function showOnHome(post){
    post=post||{};
    return truth(post.marketplaceShowOnHome)||truth(post.marketplace_show_on_home)||truth(post.showOnHome)||truth(post.marketplace_details&&post.marketplace_details.show_on_home);
  }
  function allPosts(){
    var rows=[],seen={};
    function add(item){
      if(!item||typeof item!=='object')return;
      var id=clean(item.id||item.post_id||item.listing_id);if(!id||seen[id])return;
      seen[id]=1;rows.push(item);
    }
    try{if(typeof ALL_POSTS!=='undefined'&&Array.isArray(ALL_POSTS))ALL_POSTS.forEach(add);}catch(_e){}
    try{if(Array.isArray(window.ALL_POSTS))window.ALL_POSTS.forEach(add);}catch(_e){}
    ['HAPPYAD_GLOBAL_POSTS_CACHE_V1','HAPPYAD_PUBLISH_POSTS_V2','HAPPYAD_HOME_POSTS_CACHE_V1','HAPPYAD_ALL_POSTS_V1'].forEach(function(key){
      try{
        var raw=JSON.parse(localStorage.getItem(key)||'null');
        var list=Array.isArray(raw)?raw:(raw&&Array.isArray(raw.posts)?raw.posts:(raw&&Array.isArray(raw.data)?raw.data:[]));
        list.forEach(add);
      }catch(_e){}
    });
    return rows;
  }
  function postById(id){id=clean(id);if(!id)return null;return allPosts().find(function(post){return clean(post&&post.id||post&&post.post_id||post&&post.listing_id)===id;})||null;}
  function currentUid(){
    try{var uid=clean(localStorage.getItem('HAPPYAD_AUTH_UID'));if(uid)return uid;}catch(_e){}
    var keys=['HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL','HAPPYAD_LOGGED_USER','HAPPYAD_CURRENT_USER'];
    for(var i=0;i<keys.length;i++)try{var user=JSON.parse(localStorage.getItem(keys[i])||'null');var id=clean(user&&(user.id||user.user_id||user.uid));if(id)return id;}catch(_e){}
    return '';
  }
  function viewerKey(){
    var uid=currentUid();if(uid)return 'user:'+uid;
    var key='HAPPYAD_LISTING_VIEWER_KEY_V820',value='';
    try{value=clean(localStorage.getItem(key));}catch(_e){}
    if(value.length<8){value='device:'+Date.now().toString(36)+':'+Math.random().toString(36).slice(2,12);try{localStorage.setItem(key,value);}catch(_e){}}
    return value;
  }
  function localViewMark(id,key){return 'HAPPYAD_LISTING_VIEWED_V820_'+String(id).replace(/[^a-zA-Z0-9_-]/g,'_')+'_'+String(key).replace(/[^a-zA-Z0-9_-]/g,'_').slice(-48);}
  async function recordView(post,source){
    var id=clean(post&&post.id||post&&post.post_id||post&&post.listing_id);if(!id||!isMarketplace(post))return 0;
    var key=viewerKey(),mark=localViewMark(id,key);
    try{if(sessionStorage.getItem(mark)==='1'||localStorage.getItem(mark)==='1')return Number(post.listing_views_count||post.listingViewsCount||0);}catch(_e){}
    if(pending.has(id))return pending.get(id);
    var task=(async function(){
      var c=client();if(!c)return Number(post.listing_views_count||post.listingViewsCount||0);
      var result=await c.rpc('happyad_record_listing_view_v1',{p_listing_id:id,p_source:source||'home',p_viewer_key:key});
      if(result&&result.error)throw result.error;
      var count=Number(result&&result.data&&(result.data.count||result.data.views_count)||0)||0;
      post.listing_views_count=count;post.listingViewsCount=count;
      try{sessionStorage.setItem(mark,'1');localStorage.setItem(mark,'1');}catch(_e){}
      return count;
    })().catch(function(){return Number(post.listing_views_count||post.listingViewsCount||0);}).finally(function(){setTimeout(function(){pending.delete(id);},800);});
    pending.set(id,task);return task;
  }
  function openListing(id,source){
    id=clean(id);if(!id)return false;
    closeHomeFullscreen();
    try{
      if(window.HappyadChatIntegrationV795&&typeof window.HappyadChatIntegrationV795.open==='function'){
        window.HappyadChatIntegrationV795.open({mode:'market',context:{source:source||'home-listing',listingId:id}});
        return true;
      }
    }catch(_e){}
    try{document.dispatchEvent(new CustomEvent('happyad:annonces-requested',{detail:{source:source||'home-listing',listingId:id}}));return true;}catch(_e){}
    return false;
  }
  function closeHomeFullscreen(){
    try{var box=document.getElementById('happyadHomePhotoFullscreen');if(box){box.classList.remove('on');document.body.classList.remove('haHomePhotoFsLock');}}catch(_e){}
  }
  window.HappyadOpenMarketplaceListingV820=openListing;

  var observer=typeof IntersectionObserver==='function'?new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      var card=entry.target;clearTimeout(card.__happyadListingViewV820);
      if(entry.isIntersecting&&entry.intersectionRatio>=.55){
        card.__happyadListingViewV820=setTimeout(function(){var post=postById(card.dataset.postId);if(post)recordView(post,'home');},900);
      }
    });
  },{threshold:[0,.55,.8]}):null;

  function decorateCard(card){
    if(!card||observed.has(card))return;
    var post=postById(card.dataset.postId);if(!post||!isMarketplace(post)||!showOnHome(post))return;
    observed.add(card);card.classList.add('happyadMarketplaceHomeCardV820');card.dataset.happyadMarketplace='1';
    var top=card.querySelector('.miniTop');
    if(top&&!top.querySelector('.happyadMarketplaceHomeTagV820')){
      var tag=document.createElement('span');tag.className='happyadMarketplaceHomeTagV820';tag.textContent='ANNONCE';top.appendChild(tag);
    }
    if(observer)observer.observe(card);
  }
  function scanCards(){document.querySelectorAll('#list .miniCard[data-post-id],.homeTimeline .miniCard[data-post-id]').forEach(decorateCard);}

  function fullscreenPost(box){
    return box&&box.__happyadCurrentPostV613E||window.__HAPPYAD_ACTIVE_FULLSCREEN_POST_V613E||postById(window.__happyadPhotoReturnSourceV478&&window.__happyadPhotoReturnSourceV478.id)||null;
  }
  function syncFullscreen(){
    var box=document.getElementById('happyadHomePhotoFullscreen');if(!box)return;
    var card=box.querySelector('.haHomeFsCard');if(!card)return;
    var post=fullscreenPost(box),id=clean(post&&post.id||post&&post.post_id||post&&post.listing_id);
    var existing=card.querySelector('.happyadOpenListingFromHomeV820');
    var visible=box.classList.contains('on')&&post&&isMarketplace(post)&&showOnHome(post)&&id;
    if(!visible){if(existing)existing.remove();lastFullscreenId='';return;}
    if(!existing){
      existing=document.createElement('button');existing.type='button';existing.className='happyadOpenListingFromHomeV820';
      existing.innerHTML='<span>Voir l’annonce</span><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      card.appendChild(existing);
    }
    existing.dataset.listingId=id;
    existing.onclick=function(event){event.preventDefault();event.stopPropagation();openListing(id,'home-photo-fullscreen');};
    if(lastFullscreenId!==id){lastFullscreenId=id;recordView(post,'detail');}
  }

  function install(){
    scanCards();syncFullscreen();
    try{new MutationObserver(function(){scanCards();syncFullscreen();}).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','data-post-id']});}catch(_e){}
    setInterval(syncFullscreen,500);
  }
  var style=document.createElement('style');style.id='happyad-marketplace-home-master-v820-css';style.textContent='\
    .happyadMarketplaceHomeCardV820 .miniTop{position:relative!important}.happyadMarketplaceHomeTagV820{margin-left:auto;margin-right:6px;padding:5px 8px;border-radius:999px;background:rgba(255,119,26,.14);border:1px solid rgba(255,119,26,.38);color:#ff9b50;font-size:9px;font-weight:1000;letter-spacing:.08em}\
    #happyadHomePhotoFullscreen .happyadOpenListingFromHomeV820{position:absolute;left:18px;right:18px;bottom:22px;z-index:60;min-height:52px;border:0;border-radius:17px;background:linear-gradient(135deg,#ff731c,#ff9d31);color:#111;display:flex;align-items:center;justify-content:center;gap:9px;font-size:16px;font-weight:1000;box-shadow:0 15px 34px rgba(255,112,20,.28);touch-action:manipulation}\
    #happyadHomePhotoFullscreen .happyadOpenListingFromHomeV820 svg{width:21px;height:21px}\
    #happyadHomePhotoFullscreen .haHomeFsCaption{padding-bottom:96px!important}\
  ';document.head.appendChild(style);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  try{if(window.HappyMasterRegistry)window.HappyMasterRegistry.register('marketplace-home-v820',{file:'core/marketplace-home-master-v820.js',responsibility:'annonces choisies dans Accueil, ouverture directe et vues uniques',active:true,version:VERSION});}catch(_e){}
})();
