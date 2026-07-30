/* HAPPYAD V821 — couvertures Marketplace réellement injectées dans Accueil,
   ouverture exacte de l'annonce, vues uniques et compatibilité photo/vidéo. */
(function(){
  'use strict';
  if(window.__HAPPYAD_MARKETPLACE_HOME_MASTER_V821__)return;
  window.__HAPPYAD_MARKETPLACE_HOME_MASTER_V821__=true;

  var VERSION='V821_HOME_MEDIA_ROUTING';
  var observed=new WeakSet();
  var pending=new Map();
  var refreshTimer=0;
  var realtimeChannel=null;
  var lastFullscreenId='';

  function clean(value){return String(value==null?'':value).replace(/\s+/g,' ').trim();}
  function truth(value){return value===true||value===1||/^(true|1|yes|oui|on)$/i.test(clean(value));}
  function isMarketplace(post){post=post||{};return post.happyadMarketplace===true||post.happyad_marketplace===true||post.is_marketplace===true||clean(post.mode).toLowerCase()==='marketplace';}
  function showOnHome(post){post=post||{};return truth(post.marketplaceShowOnHome)||truth(post.marketplace_show_on_home)||truth(post.showOnHome)||truth(post.marketplace_details&&post.marketplace_details.show_on_home);}
  function idOf(post){return clean(post&&(post.id||post.post_id||post.listing_id));}
  function client(){
    try{if(typeof window.happyadSb==='function'){var c=window.happyadSb();if(c&&typeof c.from==='function')return c;}}catch(_e){}
    try{if(window.happyadSupabase&&typeof window.happyadSupabase.from==='function')return window.happyadSupabase;}catch(_e){}
    try{if(window.supabaseClient&&typeof window.supabaseClient.from==='function')return window.supabaseClient;}catch(_e){}
    return null;
  }
  function mediaType(row){
    var raw=clean(row&&(
      row.marketplace_cover_type||row.media_type||row.mediaType||row.kind||row.type
    )).toLowerCase();
    var url=clean(row&&(row.marketplace_cover_url||row.media_url||row.mediaUrl));
    return raw.indexOf('video')>=0||/\.(mp4|webm|mov|m4v|3gp)(?:[?#]|$)/i.test(url)?'video':'photo';
  }
  function mapRow(row){
    row=row||{};
    var mapped=null;
    try{if(typeof window.mapHappyPost==='function')mapped=window.mapHappyPost(row);}catch(_e){}
    mapped=mapped&&typeof mapped==='object'?mapped:{};
    var cover=clean(row.marketplace_cover_url||row.media_url||mapped.mediaUrl||mapped.media_url);
    var coverPath=clean(row.marketplace_cover_path||row.media_path||mapped.mediaPath||mapped.media_path);
    var kind=mediaType(row);
    return Object.assign({},mapped,row,{
      id:idOf(row)||idOf(mapped),post_id:idOf(row)||idOf(mapped),
      mode:'marketplace',happyadMarketplace:true,happyad_marketplace:true,is_marketplace:true,
      marketplaceShowOnHome:true,marketplace_show_on_home:true,showOnHome:true,
      marketplaceCategory:row.marketplace_category||row.category||mapped.category||'',marketplace_category:row.marketplace_category||row.category||mapped.category||'',
      marketplaceCoverIndex:Number(row.marketplace_cover_index||0)||0,marketplace_cover_index:Number(row.marketplace_cover_index||0)||0,
      marketplaceCoverUrl:cover,marketplace_cover_url:cover,
      marketplaceCoverPath:coverPath,marketplace_cover_path:coverPath,
      marketplaceCoverType:kind==='video'?'video':'image',marketplace_cover_type:kind==='video'?'video':'image',
      mediaUrl:cover,media_url:cover,mediaPath:coverPath,media_path:coverPath,
      kind:kind,mediaType:kind,media_type:kind,
      listingViewsCount:Number(row.listing_views_count||0)||0,listing_views_count:Number(row.listing_views_count||0)||0,
      sellerBadge:clean(row.seller_badge||row.badge||row.user_badge),seller_badge:clean(row.seller_badge||row.badge||row.user_badge),
      createdAt:row.created_at?new Date(row.created_at).getTime():(Number(mapped.createdAt)||Date.now()),
      supabase:true
    });
  }
  function allPosts(){
    try{if(typeof ALL_POSTS!=='undefined'&&Array.isArray(ALL_POSTS))return ALL_POSTS;}catch(_e){}
    try{return Array.isArray(window.ALL_POSTS)?window.ALL_POSTS:[];}catch(_e){return [];}
  }
  function postById(id){id=clean(id);if(!id)return null;return allPosts().find(function(post){return idOf(post)===id;})||null;}
  function writeCache(key,list){
    try{
      var raw=JSON.parse(localStorage.getItem(key)||'null'),shape='array';
      if(raw&&Array.isArray(raw.posts))shape='posts';else if(raw&&Array.isArray(raw.data))shape='data';
      var next=list.slice(0,100);
      if(shape==='posts'){raw=raw||{};raw.posts=next;localStorage.setItem(key,JSON.stringify(raw));}
      else if(shape==='data'){raw=raw||{};raw.data=next;localStorage.setItem(key,JSON.stringify(raw));}
      else localStorage.setItem(key,JSON.stringify(next));
    }catch(_e){}
  }
  function mergeRows(rows){
    rows=(rows||[]).map(mapRow).filter(function(x){return idOf(x)&&showOnHome(x);});
    var selected={};rows.forEach(function(x){selected[idOf(x)]=x;});
    var next=[],seen={};
    allPosts().forEach(function(post){
      var id=idOf(post);if(!id||seen[id])return;
      if(isMarketplace(post)){
        if(selected[id]){next.push(selected[id]);seen[id]=1;delete selected[id];}
        return; // Les annonces non choisies ne doivent jamais entrer dans l'Accueil.
      }
      next.push(post);seen[id]=1;
    });
    Object.keys(selected).forEach(function(id){if(!seen[id]){next.push(selected[id]);seen[id]=1;}});
    next.sort(function(a,b){return Number(b.createdAt||Date.parse(b.created_at||0)||0)-Number(a.createdAt||Date.parse(a.created_at||0)||0);});
    try{if(typeof ALL_POSTS!=='undefined')ALL_POSTS=next;else window.ALL_POSTS=next;}catch(_e){try{window.ALL_POSTS=next;}catch(_x){}}
    ['HAPPYAD_GLOBAL_POSTS_CACHE_V1','HAPPYAD_PUBLISH_POSTS_V2','HAPPYAD_HOME_POSTS_CACHE_V1','HAPPYAD_ALL_POSTS_V1'].forEach(function(key){writeCache(key,next);});
    try{if(typeof HAPPYAD_LAST_RENDER_SIG!=='undefined')HAPPYAD_LAST_RENDER_SIG='';else window.HAPPYAD_LAST_RENDER_SIG='';}catch(_e){}
    try{if(typeof render==='function')render();else if(typeof window.render==='function')window.render();}catch(_e){}
    setTimeout(scanCards,80);
    return next;
  }
  async function fetchSelected(){
    var c=client();if(!c)return [];
    var q=c.from('happyad_posts').select('*')
      .eq('happyad_marketplace',true)
      .eq('marketplace_show_on_home',true)
      .eq('listing_status','active')
      .eq('is_active',true)
      .is('deleted_at',null)
      .order('created_at',{ascending:false})
      .limit(60);
    var result=await q;if(result&&result.error)throw result.error;return (result&&result.data)||[];
  }
  function refresh(reason){
    clearTimeout(refreshTimer);
    refreshTimer=setTimeout(function(){fetchSelected().then(mergeRows).catch(function(error){console.warn('HAPPYAD marketplace home '+reason,error);});},120);
  }

  function currentUid(){
    try{var uid=clean(localStorage.getItem('HAPPYAD_AUTH_UID'));if(uid)return uid;}catch(_e){}
    try{var u=JSON.parse(localStorage.getItem('HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL')||'{}');return clean(u&&(u.id||u.user_id||u.uid));}catch(_e){return '';}
  }
  function viewerKey(){
    var uid=currentUid();if(uid)return 'user:'+uid;
    var key='HAPPYAD_LISTING_VIEWER_KEY_V820',value='';try{value=clean(localStorage.getItem(key));}catch(_e){}
    if(value.length<8){value='device:'+Date.now().toString(36)+':'+Math.random().toString(36).slice(2,12);try{localStorage.setItem(key,value);}catch(_e){}}
    return value;
  }
  function viewMark(id,key){return 'HAPPYAD_LISTING_VIEWED_V820_'+String(id).replace(/[^a-zA-Z0-9_-]/g,'_')+'_'+String(key).replace(/[^a-zA-Z0-9_-]/g,'_').slice(-48);}
  async function recordView(post,source){
    var id=idOf(post);if(!id||!isMarketplace(post))return 0;
    var key=viewerKey(),mark=viewMark(id,key);
    try{if(sessionStorage.getItem(mark)==='1'||localStorage.getItem(mark)==='1')return Number(post.listing_views_count||0);}catch(_e){}
    if(pending.has(id))return pending.get(id);
    var task=(async function(){
      var c=client();if(!c||typeof c.rpc!=='function')return Number(post.listing_views_count||0);
      var result=await c.rpc('happyad_record_listing_view_v1',{p_listing_id:id,p_source:source||'home',p_viewer_key:key});
      if(result&&result.error)throw result.error;
      var count=Number(result&&result.data&&(result.data.count||result.data.views_count)||0)||0;
      post.listing_views_count=count;post.listingViewsCount=count;
      try{sessionStorage.setItem(mark,'1');localStorage.setItem(mark,'1');}catch(_e){}
      return count;
    })().catch(function(){return Number(post.listing_views_count||0);}).finally(function(){setTimeout(function(){pending.delete(id);},800);});
    pending.set(id,task);return task;
  }
  function closeHomeFullscreen(){try{var box=document.getElementById('happyadHomePhotoFullscreen');if(box){box.classList.remove('on');document.body.classList.remove('haHomePhotoFsLock');}}catch(_e){}}
  function openListing(id,source){
    id=clean(id);if(!id)return false;closeHomeFullscreen();
    try{if(window.HappyadChatIntegrationV795&&typeof window.HappyadChatIntegrationV795.open==='function'){window.HappyadChatIntegrationV795.open({mode:'market',context:{source:source||'home-listing',listingId:id}});return true;}}catch(_e){}
    try{document.dispatchEvent(new CustomEvent('happyad:annonces-requested',{detail:{source:source||'home-listing',listingId:id}}));return true;}catch(_e){}
    return false;
  }
  window.HappyadOpenMarketplaceListingV821=openListing;
  window.HappyadOpenMarketplaceListingV820=openListing; // compatibilité centrale Vidéo V820.

  var observer=typeof IntersectionObserver==='function'?new IntersectionObserver(function(entries){
    entries.forEach(function(entry){var card=entry.target;clearTimeout(card.__happyadListingViewV821);if(entry.isIntersecting&&entry.intersectionRatio>=.55){card.__happyadListingViewV821=setTimeout(function(){var post=postById(card.dataset.postId);if(post)recordView(post,'home');},900);}});
  },{threshold:[0,.55,.8]}):null;
  function decorateCard(card){
    if(!card||observed.has(card))return;
    var post=postById(card.dataset.postId);if(!post||!isMarketplace(post)||!showOnHome(post))return;
    observed.add(card);card.classList.add('happyadMarketplaceHomeCardV821');card.dataset.happyadMarketplace='1';
    var top=card.querySelector('.miniTop');if(top&&!top.querySelector('.happyadMarketplaceHomeTagV821')){var tag=document.createElement('span');tag.className='happyadMarketplaceHomeTagV821';tag.textContent='ANNONCE';top.appendChild(tag);}
    if(observer)observer.observe(card);
  }
  function scanCards(){document.querySelectorAll('#list .miniCard[data-post-id],.homeTimeline .miniCard[data-post-id]').forEach(decorateCard);}
  function fullscreenPost(box){return box&&box.__happyadCurrentPostV613E||window.__HAPPYAD_ACTIVE_FULLSCREEN_POST_V613E||null;}
  function syncFullscreen(){
    var box=document.getElementById('happyadHomePhotoFullscreen');if(!box)return;
    var card=box.querySelector('.haHomeFsCard');if(!card)return;
    var post=fullscreenPost(box),id=idOf(post),existing=card.querySelector('.happyadOpenListingFromHomeV821');
    var visible=box.classList.contains('on')&&post&&isMarketplace(post)&&showOnHome(post)&&id&&mediaType(post)!=='video';
    if(!visible){if(existing)existing.remove();lastFullscreenId='';return;}
    if(!existing){existing=document.createElement('button');existing.type='button';existing.className='happyadOpenListingFromHomeV821';existing.innerHTML='<span>Voir l’annonce</span><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';card.appendChild(existing);}
    existing.dataset.listingId=id;existing.onclick=function(event){event.preventDefault();event.stopPropagation();openListing(id,'home-photo-fullscreen');};
    if(lastFullscreenId!==id){lastFullscreenId=id;recordView(post,'detail');}
  }
  function bindRealtime(){
    var c=client();if(!c||typeof c.channel!=='function'||realtimeChannel)return;
    try{realtimeChannel=c.channel('happyad-marketplace-home-v821').on('postgres_changes',{event:'*',schema:'public',table:'happyad_posts'},function(payload){var row=(payload&&payload.new)||payload.old||{};if(isMarketplace(row)||truth(row.marketplace_show_on_home))refresh('realtime');}).subscribe();}catch(_e){}
  }
  function install(){
    scanCards();syncFullscreen();refresh('boot');bindRealtime();
    try{new MutationObserver(function(){scanCards();syncFullscreen();}).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','data-post-id']});}catch(_e){}
    setInterval(syncFullscreen,500);
    document.addEventListener('happyad:marketplace-listing-published',function(){refresh('published');});
    window.addEventListener('focus',function(){refresh('focus');});
    document.addEventListener('visibilitychange',function(){if(!document.hidden)refresh('visible');});
  }
  var style=document.createElement('style');style.id='happyad-marketplace-home-master-v821-css';style.textContent='\
    .happyadMarketplaceHomeCardV821 .miniTop{position:relative!important}.happyadMarketplaceHomeTagV821{margin-left:auto;margin-right:6px;padding:5px 8px;border-radius:999px;background:rgba(255,119,26,.14);border:1px solid rgba(255,119,26,.38);color:#ff9b50;font-size:9px;font-weight:1000;letter-spacing:.08em}\
    #happyadHomePhotoFullscreen .happyadOpenListingFromHomeV821{position:absolute;left:18px;right:18px;bottom:22px;z-index:60;min-height:52px;border:0;border-radius:17px;background:linear-gradient(135deg,#ff731c,#ff9d31);color:#111;display:flex;align-items:center;justify-content:center;gap:9px;font-size:16px;font-weight:1000;box-shadow:0 15px 34px rgba(255,112,20,.28);touch-action:manipulation}\
    #happyadHomePhotoFullscreen .happyadOpenListingFromHomeV821 svg{width:21px;height:21px}\
    #happyadHomePhotoFullscreen .haHomeFsCaption{padding-bottom:96px!important}\
  ';document.head.appendChild(style);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  try{if(window.HappyMasterRegistry)window.HappyMasterRegistry.register('marketplace-home-v821',{file:'core/marketplace-home-master-v821.js',responsibility:'couvertures Marketplace Accueil, photo/vidéo et ouverture exacte',active:true,version:VERSION});}catch(_e){}
})();
