
(function(){
  try{
    var qs=String(location.search||'');
    var forced=(qs.indexOf('logout=1')>-1)||localStorage.getItem('HAPPYAD_FORCE_LOGOUT')==='1';
    if(!forced)return;

    var oldUid='';
    var now=Date.now();

    try{
      oldUid=String(localStorage.getItem('HAPPYAD_AUTH_UID')||'').trim();
    }catch(e){}

    try{sessionStorage.clear();}catch(e){}

    try{
      localStorage.clear();
    }catch(e){
      try{
        var rm=[];
        for(var i=0;i<localStorage.length;i++){
          var k=localStorage.key(i);
          if(!k)continue;
          var low=String(k).toLowerCase();
          if(
            k.indexOf('HAPPYAD')===0 ||
            low.indexOf('supabase')>-1 ||
            low.indexOf('sb-')===0 ||
            low.indexOf('auth-token')>-1 ||
            low.indexOf('gotrue')>-1
          ){
            rm.push(k);
          }
        }
        rm.forEach(function(k){
          try{localStorage.removeItem(k);}catch(_e){}
        });
      }catch(_e){}
    }

    try{
      localStorage.setItem('HAPPYAD_SESSION_ACTIVE','0');
      localStorage.setItem('HAPPYAD_FORCE_LOGOUT','1');
      localStorage.setItem('HAPPYAD_FORCE_LOGOUT_UNTIL',String(Date.now()+120000));
      localStorage.setItem('HAPPYAD_LOGOUT_LOCK_V1','1');
      localStorage.setItem('HAPPYAD_LOGOUT_AT_V1',String(now));
      if(oldUid)localStorage.setItem('HAPPYAD_LOGOUT_PREVIOUS_UID_V1',oldUid);
    }catch(e){}

    try{
      if(window.caches&&caches.keys){
        caches.keys().then(function(names){
          names.forEach(function(n){
            try{
              if(/happyad|supabase|workbox|precache|offline/i.test(String(n||''))){
                caches.delete(n);
              }
            }catch(_e){}
          });
        }).catch(function(){});
      }
    }catch(e){}

    if(qs.indexOf('logout=1')>-1 && history && history.replaceState){
      history.replaceState(null,'',location.pathname);
    }
  }catch(e){}
})();


(function(){
  try{
    var view='',url='';
    try{
      var raw=sessionStorage.getItem('HAPPYAD_LAST_OPEN_ROUTE_V16ZH');
      var r=raw?JSON.parse(raw):null;
      if(r&&r.view){view=String(r.view||'');url=String(r.url||'');}
    }catch(_r){}
    try{
      if(!view)view=String(sessionStorage.getItem('HAPPYAD_ACTIVE_APP_VIEW')||'');
      if(!url)url=String(sessionStorage.getItem('HAPPYAD_LAST_APP_URL')||'');
    }catch(_s){}
    try{
      var u=new URL(location.href);
      var app=String(u.searchParams.get('app')||'').trim();
      var hash=String(u.hash||'').replace(/^#/,'').trim();
      if(app||hash)view=app||hash;
    }catch(_u){}
    view=String(view||'').toLowerCase();
    if(view&&view!=='home'&&view!=='index'&&view!=='index.html'){
      document.documentElement.classList.add('happyadBootRestoringPageV16ZJ');
    }
  }catch(_e){}
})();


(function(){
  var POST_KEY='HAPPYAD_PUBLISH_POSTS_V2';
  var ACTION_KEY='HAPPYAD_VIDEO_ACTIONS_V1';
  function lower(v){return String(v==null?'':v).toLowerCase();}
  function isDemoPost(p){
    if(!p || typeof p!=='object') return true;
    var title=lower(p.title||p.name||p.caption);
    var creator=lower(p.creatorName||p.userName||p.author);
    var id=lower(p.id);
    var cid=lower(p.creatorId);
    var handle=lower(p.handle||p.username);
    return id.indexOf('demo')>=0 || cid==='u_demo' || title.indexOf('renos pro')>=0 || title==='broks' || creator.indexOf('renos')>=0 || creator.indexOf('broks')>=0 || handle.indexOf('broks')>=0 || handle.indexOf('renos')>=0;
  }
  try{
    var arr=JSON.parse(localStorage.getItem(POST_KEY)||'[]');
    if(Array.isArray(arr)){
      var before=arr.length;
      var clean=arr.filter(function(p){return !isDemoPost(p)});
      if(clean.length!==before){
        localStorage.setItem(POST_KEY,JSON.stringify(clean));
        try{
          var actions=JSON.parse(localStorage.getItem(ACTION_KEY)||'{}');
          Object.keys(actions||{}).forEach(function(k){
            var found=clean.some(function(p){return String(p.id)===String(k)});
            if(!found) delete actions[k];
          });
          localStorage.setItem(ACTION_KEY,JSON.stringify(actions));
        }catch(e){}
      }
    }
  }catch(e){localStorage.setItem(POST_KEY,'[]');}
  try{
    var ap=JSON.parse(localStorage.getItem('HAPPYAD_ACTIVE_PROFILE')||'null');
    var n=lower(ap&&ap.name), h=lower(ap&&ap.handle);
    if(n.indexOf('broks')>=0||n.indexOf('renos')>=0||h.indexOf('broks')>=0||h.indexOf('renos')>=0){
      localStorage.removeItem('HAPPYAD_ACTIVE_PROFILE');
    }
  }catch(e){}
})();

window.HAPPYAD_SUPABASE_URL="https://txjjyhupbejgjcianrmr.supabase.co";window.HAPPYAD_SUPABASE_KEY="sb_publishable_35EsjCOhZtaPtoZwdyAYOw_KaqlSKHD";

(function(){
  if(window.__HAPPYAD_V493_EARLY_VIDEO_PROFILE_APP_GUARD__)return;
  window.__HAPPYAD_V493_EARLY_VIDEO_PROFILE_APP_GUARD__=true;
  var PENDING_KEY='HAPPYAD_PENDING_APP_URL_V493';
  function clean(v){return String(v||'').trim().replace(/^\.\//,'').replace(/^\.\.\//,'');}
  function normalize(raw){
    raw=clean(raw);if(!raw||raw==='javascript:void(0)'||raw==='javascript:;'||raw==='#')return '';
    try{
      var u=new URL(raw,location.href);
      var file=(u.pathname||'').split('/').pop();
      if(file==='video.html')return 'modules/video.html'+(u.search||'')+(u.hash||'');
      if(file==='user.html')return 'modules/user.html'+(u.search||'')+(u.hash||'');
      if(file==='boutique.html')return 'boutique.html'+(u.search||'')+(u.hash||'');
      return '';
    }catch(e){
      var p=raw.split('#')[0].split('?')[0];
      if(p==='video.html'||p==='modules/video.html')return 'modules/video.html'+(raw.indexOf('?')>=0?'?'+raw.split('?').slice(1).join('?'):'');
      if(p==='user.html'||p==='modules/user.html')return 'modules/user.html'+(raw.indexOf('?')>=0?'?'+raw.split('?').slice(1).join('?'):'');
      if(p==='boutique.html')return 'boutique.html'+(raw.indexOf('?')>=0?'?'+raw.split('?').slice(1).join('?'):'');
      return '';
    }
  }
  function pageOf(url){var u=String(url||'');var p=u.split('?')[0].split('#')[0];if(p==='modules/video.html')return 'video';if(p==='modules/user.html')return (u.indexOf('public=1')>=0||u.indexOf('uid=')>=0||u.indexOf('profile_uid=')>=0)?'profile_public':'profile';if(p==='boutique.html')return 'boutique';return '';}
  function flush(){
    try{
      var url=sessionStorage.getItem(PENDING_KEY)||'';if(!url)return false;
      if(window.happyadOpenInternalUrlV492){sessionStorage.removeItem(PENDING_KEY);window.happyadOpenInternalUrlV492(url);return true;}
      if(window.happyadOpenAppPage){sessionStorage.removeItem(PENDING_KEY);window.happyadOpenAppPage(pageOf(url),url);return true;}
    }catch(e){}
    return false;
  }
  function open(url){
    url=normalize(url)||clean(url);if(!url)return false;
    try{
      if(window.happyadOpenInternalUrlV492)return window.happyadOpenInternalUrlV492(url);
      if(window.happyadOpenAppPage)return window.happyadOpenAppPage(pageOf(url),url);
      sessionStorage.setItem(PENDING_KEY,url);
      setTimeout(flush,50);setTimeout(flush,250);setTimeout(flush,800);
      return true;
    }catch(e){return false;}
  }
  document.addEventListener('click',function(e){
    try{
      var t=e.target;if(!t||!t.closest)return;
      var routeEl=t.closest('[data-happyad-app-route]');
      var a=t.closest('a[href]');
      var raw=(routeEl&&routeEl.getAttribute('data-happyad-app-route'))||(a&&a.getAttribute('href'))||'';
      var route=normalize(raw);
      if(!route)return;
      e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
      open(route);return false;
    }catch(_e){}
  },true);
  window.happyadOpenVideoProfileRouteV493=open;
  if(document.readyState==='complete')setTimeout(flush,80);else window.addEventListener('DOMContentLoaded',function(){setTimeout(flush,80)},{once:true});
})();



let ALL_POSTS=[],HAPPYAD_STORIES_ITEMS=[],currentFilter='all',happyadPostsLoading=true;
/* HAPPYAD V493 — Accueil complet: affichage rapide, puis synchronisation de toutes les publications en arrière-plan. */
let HAPPYAD_HOME_RENDER_LIMIT=80;
const HAPPYAD_HOME_PAGE_SIZE=80;
const HAPPYAD_HOME_REMOTE_PAGE=200;
const HAPPYAD_HOME_MAX_POSTS=3000;
let HAPPYAD_HOME_REMOTE_NEXT_OFFSET=0;
let HAPPYAD_HOME_MORE_LOADING=false;
let HAPPYAD_HOME_REMOTE_DONE=false;
let HAPPYAD_HOME_FULL_SYNC_RUNNING=false;
let HAPPYAD_HOME_FULL_SYNC_DONE=false;

const HAPPYAD_HOME_BOOT_CACHE='HAPPYAD_HOME_BOOT_SNAPSHOT_V1';
/* HAPPYAD V408: chargement visuel ralenti + squelette non recréé pour réduire le clignotement. */
function happyadPostSortMsV407(p){var v=p&&(p.createdAt||p.created_at||p.timestamp||p.time||p.date);var n=Number(v);if(isFinite(n)&&n>0)return n>100000000000?n:n*1000;var t=Date.parse(String(v||''));return isNaN(t)?0:t;}
function happyadSlimHomePostV407(p){p=p||{};return {id:p.id,mode:p.mode||'publish',title:p.title||'Publication HAPPYAD',desc:p.desc||p.description||'',description:p.description||p.desc||'',price:p.price||'',category:p.category||'',location:p.location||'',kind:p.kind||p.media_type||p.mediaType||'photo',mediaType:p.mediaType||p.media_type||p.kind||'photo',mediaUrl:p.mediaUrl||p.media_url||'',media_url:p.media_url||p.mediaUrl||'',mediaPath:p.mediaPath||p.media_path||'',creatorId:p.creatorId||p.user_id||p.userId||'',user_id:p.user_id||p.creatorId||'',creatorName:p.creatorName||p.display_name||p.creator_name||p.full_name||'Utilisateur HAPPYAD',handle:p.handle||p.username||'',avatar:p.avatar||p.avatar_url||p.author_avatar||'',avatar_url:p.avatar_url||p.avatar||'',badge:p.badge||p.user_badge||'aucun',createdAt:happyadPostSortMsV407(p)||Date.now(),created_at:p.created_at||'',supabase:!!p.supabase,likes_count:Number(p.likes_count||0),comments_count:Number(p.comments_count||0),shares_count:Number(p.shares_count||0),saves_count:Number(p.saves_count||0),views_count:Number(p.views_count||p.view_count||p.video_views_count||0),thumbnailUrl:p.thumbnailUrl||p.thumbnail_url||p.posterUrl||p.poster_url||p.coverUrl||p.cover_url||'',thumbnail_url:p.thumbnail_url||p.thumbnailUrl||'',posterUrl:p.posterUrl||p.poster_url||p.thumbnailUrl||p.thumbnail_url||'',poster_url:p.poster_url||p.posterUrl||'',batchId:p.batchId||p.batch_id||'',batch_id:p.batch_id||p.batchId||'',groupIndex:p.groupIndex||p.group_index||0,group_index:p.group_index||p.groupIndex||0,photoIndex:p.photoIndex||p.photo_index||p.groupIndex||p.group_index||0,photo_index:p.photo_index||p.photoIndex||p.group_index||p.groupIndex||0,imageCrop:p.imageCrop||p.image_crop||null,deleted_at:p.deleted_at||'',postType:p.postType||p.post_type||'',post_type:p.post_type||p.postType||'',boutique_product_id:p.boutique_product_id||p.boutiqueProductId||'',boutiqueProductId:p.boutiqueProductId||p.boutique_product_id||'',product_id:p.product_id||'',button_label:p.button_label||p.buttonLabel||'',action:p.action||''};}
function happyadUniqHomeBootV407(arr){var seen={},del=[];try{del=JSON.parse(localStorage.getItem('HAPPYAD_DELETED_POST_IDS_V1')||'[]').map(String)}catch(e){}return (arr||[]).filter(function(p){var id=String(p&&p.id||'');if(!id||seen[id]||del.indexOf(id)>=0||String(p&&p.deleted_at||'')!=='')return false;seen[id]=1;return true;}).sort(function(a,b){return happyadPostSortMsV407(b)-happyadPostSortMsV407(a)});}
function happyadReadHomeBootCachesV407(){function read(store,k){try{var raw=(store==='session'?sessionStorage:localStorage).getItem(k)||'[]';var v=JSON.parse(raw);return Array.isArray(v)?v:[]}catch(e){return []}}return happyadUniqHomeBootV407([].concat(read('session','HAPPYAD_SESSION_ALL_POSTS_V104'),read('local',HAPPYAD_HOME_BOOT_CACHE),read('local','HAPPYAD_GLOBAL_POSTS_CACHE_V1'),read('local','HAPPYAD_PUBLISH_POSTS_V2'),read('local','HAPPYAD_ALL_POSTS_V1'),read('local','HAPPYAD_SEARCH_POSTS_FAST_CACHE_V1'))).map(happyadSlimHomePostV407);}
function happyadWriteHomeBootSnapshotV407(arr){try{arr=happyadUniqHomeBootV407(arr).slice(0,500).map(happyadSlimHomePostV407);if(arr.length)localStorage.setItem(HAPPYAD_HOME_BOOT_CACHE,JSON.stringify(arr));}catch(e){}return arr;}
function happyadRenderHomeSkeletonV407(){try{var list=document.getElementById('list');if(!list)return;if(list.querySelector('.miniCard:not(.happyadSkeletonCard)'))return;if(list.querySelector('.happyadSkeletonCard')){list.className='homeTimeline happyadHomeBootSkeleton';return;}list.className='homeTimeline happyadHomeBootSkeleton';var one='<div class="miniCard happyadSkeletonCard" aria-hidden="true"><div class="happyadSkeletonTop"><div class="happyadSkeletonAvatar"></div><div class="happyadSkeletonLines"><div class="happyadSkeletonLine long"></div><div class="happyadSkeletonLine short"></div></div></div><div class="happyadSkeletonMedia"></div><div class="happyadSkeletonBody"><div class="happyadSkeletonLine long"></div><div class="happyadSkeletonLine short"></div></div><div class="happyadSkeletonActions"></div></div>';list.innerHTML=one+one;try{renderSponsor()}catch(_s){}try{renderRadarHome()}catch(_r){}try{bindHomeSearchAndQuickPost()}catch(_b){}}catch(e){}}
function happyadPreloadFirstHomeMediaV407(items){try{var done={};(items||[]).slice(0,8).forEach(function(p){var url=(p&&((String(p.kind||p.mediaType||'').toLowerCase().indexOf('video')>=0)?(p.posterUrl||p.poster_url||p.thumbnailUrl||p.thumbnail_url||p.coverUrl||p.cover_url||p.mediaUrl||p.media_url):(p.mediaUrl||p.media_url||p.thumbnailUrl||p.thumbnail_url)))||'';if(!url||done[url])return;done[url]=1;var img=new Image();try{img.decoding='async';img.loading='eager';img.fetchPriority='high';}catch(_e){}img.src=url;});}catch(e){}}

function happyadSb(){if(window.happyadSupabase)return window.happyadSupabase;if(window.supabase&&window.supabase.createClient){window.happyadSupabase=window.supabase.createClient(window.HAPPYAD_SUPABASE_URL,window.HAPPYAD_SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true}});return window.happyadSupabase;}return null}
function mapHappyPost(r){const mapped={id:r.id,mode:r.mode||'publish',title:r.title||'Publication HAPPYAD',desc:r.description||'',price:r.price||'',category:r.category||'',location:r.location||'',kind:r.media_type||r.home_media_type||r.kind||'photo',mediaUrl:r.media_url||r.mediaUrl||r.home_media_url||r.thumbnail_url||r.cover_url||'',mediaPath:r.media_path||'',creatorId:r.user_id||'',creatorName:r.display_name||r.creator_name||r.full_name||'Utilisateur HAPPYAD',handle:(r.username?('@'+String(r.username).replace(/^@+/,'')):(r.handle?('@'+String(r.handle).replace(/^@+/,'')):'')),avatar:r.avatar_url||r.author_avatar||'',badge:r.badge||'aucun',createdAt:r.created_at?new Date(r.created_at).getTime():Date.now(),supabase:true,likes_count:Number(r.likes_count||0),comments_count:Number(r.comments_count||0),shares_count:Number(r.shares_count||0),saves_count:Number(r.saves_count||0),views_count:Number(r.views_count||r.view_count||r.video_views_count||0),imageCrop:r.image_crop||r.imageCrop||null,thumbnailUrl:r.thumbnail_url||r.thumbnailUrl||r.poster_url||r.posterUrl||r.cover_url||r.coverUrl||'',posterUrl:r.poster_url||r.posterUrl||r.thumbnail_url||r.thumbnailUrl||'',batchId:r.batch_id||r.batchId||'',batch_id:r.batch_id||r.batchId||'',groupIndex:r.group_index||r.groupIndex||0,group_index:r.group_index||r.groupIndex||0,photoIndex:r.photo_index||r.photoIndex||r.group_index||r.groupIndex||0,photo_index:r.photo_index||r.photoIndex||r.group_index||r.groupIndex||0,postType:r.postType||r.post_type||'',post_type:r.post_type||r.postType||'',boutique_product_id:r.boutique_product_id||r.boutiqueProductId||'',boutiqueProductId:r.boutiqueProductId||r.boutique_product_id||'',product_id:r.product_id||'',button_label:r.button_label||r.buttonLabel||'',action:r.action||'',visibility:r.visibility||r.privacy||r.audience||r.status||'',privacy:r.privacy||'',audience:r.audience||'',status:r.status||'',is_private:(r.is_private===true||r.private===true||String(r.visibility||r.privacy||r.audience||r.status||'').toLowerCase()==='private'),private:(r.private===true),private_at:r.private_at||r.privated_at||''};/* Pré-remplir le cache local avec les compteurs Supabase */const cached=getA(mapped.id);cached.likes=Math.max(Number(cached.likes||0),Number(mapped.likes_count||0));cached.comments=Math.max(Number(cached.comments||0),Number(mapped.comments_count||0));cached.shares=Math.max(Number(cached.shares||0),Number(mapped.shares_count||0));cached.favs=Math.max(Number(cached.favs||0),Number(mapped.saves_count||0));cached.views=Math.max(Number(cached.views||0),Number(mapped.views_count||0));setA(mapped.id,cached);return mapped;}
function mapRadarItem(r){return {id:String(r.source_id||r.id),radarId:r.id,mode:String(r.source_type||'story').toLowerCase(),type:String(r.source_type||'story').toLowerCase(),title:r.title||((r.source_type==='live')?'Live en direct':'Story'),desc:r.description||'',category:String(r.source_type||'story'),location:r.location_name||'',kind:r.media_type==='live'?'video':(r.media_type||'photo'),mediaType:r.media_type==='live'?'video':(r.media_type||'photo'),mediaUrl:r.media_url||'',creatorId:r.user_id||'',creatorName:r.user_name||'Utilisateur HAPPYAD',handle:'',avatar:r.user_avatar||'',badge:r.badge||r.user_badge||'aucun',createdAt:r.created_at?new Date(r.created_at).getTime():Date.now(),expiresAt:r.expires_at||'',isRadar:true,isLive:r.is_live===true||String(r.source_type).toLowerCase()==='live',isSeen:!!r.__seen,supabase:true};}
async function fetchRadarItems(c){if(!c)return [];try{const user=await happyadAuthUser();let views=[];if(user){try{const vr=await c.from('happyad_story_views').select('story_id').eq('viewer_id',user.id).limit(1000);views=(vr.data||[]).map(v=>String(v.story_id));}catch(_){}}const {data,error}=await c.from('happyad_stories').select('*').eq('is_active',true).order('created_at',{ascending:false}).limit(80);if(error)throw error;const seenSet=new Set(views);return (data||[]).filter(r=>{if(r.expires_at && new Date(r.expires_at).getTime()<Date.now())return false;try{var hid=JSON.parse(localStorage.getItem('HAPPYAD_HIDDEN_STORIES_V1')||'{}');if(hid[String(r.id)])return false;}catch(_){ }return !!(r.media_url||r.mediaUrl||r.story||r.url);}).map(r=>{return {id:String(r.id),sourceId:String(r.id),story_id:String(r.id),mode:'story',type:'story',category:'story',title:r.title||r.user_name||'Story',desc:r.description||r.caption||'',description:r.description||r.caption||'',location:r.location_name||r.location||'',kind:String(r.media_type||'photo').toLowerCase().indexOf('video')>=0?'video':'photo',mediaType:r.media_type||'photo',mediaUrl:r.media_url||r.mediaUrl||r.story||r.url||'',media_url:r.media_url||r.mediaUrl||r.story||r.url||'',creatorId:r.user_id||'',user_id:r.user_id||'',creatorName:r.user_name||r.display_name||r.creator_name||'Utilisateur HAPPYAD',handle:r.username?('@'+String(r.username).replace(/^@+/,'')):(r.handle||''),avatar:r.user_avatar||r.avatar_url||'',badge:r.badge||r.user_badge||'aucun',createdAt:r.created_at?new Date(r.created_at).getTime():Date.now(),expiresAt:r.expires_at||'',isRadar:true,isLive:false,isSeen:seenSet.has(String(r.id)),supabase:true,__storyTable:'happyad_stories'};});}catch(e){console.warn('happyad stories',e);return []}}
async function enrichAuthorProfiles(c,arr){
  try{
    const ids=[...new Set((arr||[]).map(p=>p.creatorId||p.user_id||'').filter(Boolean).map(String))];
    if(!c||!ids.length)return arr;
    const {data,error}=await c.from('profiles').select('id,full_name,username,avatar_url,badge').in('id',ids);
    if(error||!data)return arr;
    const byId={};(data||[]).forEach(pr=>{byId[String(pr.id)]=pr});
    return (arr||[]).map(p=>{
      const pr=byId[String(p.creatorId||p.user_id||'')];
      if(!pr)return p;
      return Object.assign({},p,{creatorName:pr.full_name||p.creatorName,handle:pr.username?('@'+String(pr.username).replace(/^@+/,'')):(p.handle||''),avatar:pr.avatar_url||p.avatar||p.avatar_url||'',badge:pr.badge||p.badge||'aucun'});
    });
  }catch(e){console.warn('home author profiles sync',e);return arr;}
}

function happyadEnrichRadarStoryProfilesV1(c,arr){
  return new Promise(function(resolve){
    try{
      arr=Array.isArray(arr)?arr:[];
      var ids=[].slice.call(new Set(arr.map(function(p){return String((p&&(p.creatorId||p.user_id||p.userId||p.ownerId))||'').trim()}).filter(Boolean)));
      if(!c||!ids.length){resolve(arr);return;}
      c.from('profiles').select('id,full_name,username,avatar_url,badge').in('id',ids).then(function(r){
        try{
          if(r&&r.error){resolve(arr);return;}
          var by={};(r&&r.data||[]).forEach(function(pr){by[String(pr.id)]=pr});
          var next=arr.map(function(p){
            var pr=by[String((p&&(p.creatorId||p.user_id||p.userId||p.ownerId))||'')];
            if(!pr)return p;
            var oldName=String(p.creatorName||p.user_name||p.display_name||p.full_name||p.title||'').trim().toLowerCase();
            var goodName=pr.full_name||p.creatorName||p.user_name||p.display_name||p.full_name||p.title||'Utilisateur HAPPYAD';
            if(oldName==='utilisateur happyad'||oldName==='happyad'||!oldName)goodName=pr.full_name||'Utilisateur HAPPYAD';
            var handle=pr.username?('@'+String(pr.username).replace(/^@+/,'')):(p.handle||p.username||'');
            var avatar=pr.avatar_url||p.avatar||p.user_avatar||p.avatar_url||'';
            var badge=pr.badge||p.badge||p.user_badge||'aucun';
            return Object.assign({},p,{creatorName:goodName,user_name:goodName,display_name:goodName,full_name:goodName,title:goodName,handle:handle,username:String(handle||'').replace(/^@+/,''),avatar:avatar,user_avatar:avatar,avatar_url:avatar,badge:badge,user_badge:badge});
          });
          try{localStorage.setItem('HAPPYAD_STORIES_CACHE_V1',JSON.stringify(next.slice(0,80)));window.HAPPYAD_STORIES_ITEMS=next;window.__HAPPYAD_STORIES_ITEMS_CACHE=next;}catch(_e){}
          resolve(next);
        }catch(e){resolve(arr)}
      }).catch(function(){resolve(arr)});
    }catch(e){resolve(arr)}
  });
}
try{
  if(typeof fetchRadarItems==='function'&&!fetchRadarItems.__happyadStoryIdentityV1){
    var __happyadFetchRadarItemsRawV1=fetchRadarItems;
    fetchRadarItems=function(c){return Promise.resolve(__happyadFetchRadarItemsRawV1(c)).then(function(arr){return happyadEnrichRadarStoryProfilesV1(c||happyadSb&&happyadSb(),arr)});};
    fetchRadarItems.__happyadStoryIdentityV1=true;
  }
}catch(e){}

function happyadClearHeavyPostCaches(){
  /* HAPPYAD V403 — Accueil rapide: ne plus effacer les publications en cache au démarrage.
     Avant, cette fonction supprimait HAPPYAD_GLOBAL_POSTS_CACHE_V1 / HAPPYAD_PUBLISH_POSTS_V2
     à chaque ouverture, donc l'accueil attendait Supabase et affichait un écran lent.
     Les suppressions réelles restent gérées par HAPPYAD_DELETED_POST_IDS_V1 + refresh Supabase. */
  return false;
}
async function happyadSyncAllHomePostsV493(c,seedPosts){
  if(!c||HAPPYAD_HOME_FULL_SYNC_RUNNING)return;
  HAPPYAD_HOME_FULL_SYNC_RUNNING=true;
  try{
    var page=Math.max(50,Number(HAPPYAD_HOME_REMOTE_PAGE||80));
    var all=[];
    var from=0;
    var finished=false;
    for(var guard=0;guard<30;guard++){
      var to=from+page-1;
      var res=await c.from('happyad_posts').select('*').is('deleted_at',null).order('created_at',{ascending:false}).range(from,to);
      if(res&&res.error)throw res.error;
      var fresh=((res&&res.data)||[]).map(mapHappyPost);
      if(fresh.length){
        all=happyadMergePostsFast([].concat(all,fresh));
        var mergedLive=happyadSaveHomeFastCache([].concat(ALL_POSTS||[],seedPosts||[],all));
        if(mergedLive&&mergedLive.length){
          HAPPYAD_HOME_RENDER_LIMIT=Math.min(HAPPYAD_HOME_MAX_POSTS,Math.max(HAPPYAD_HOME_RENDER_LIMIT,mergedLive.length));
          HAPPYAD_HOME_REMOTE_NEXT_OFFSET=Math.max(HAPPYAD_HOME_REMOTE_NEXT_OFFSET,all.length);
        }
        if(postsKey(mergedLive)!==postsKey(ALL_POSTS||[])){
          ALL_POSTS=mergedLive;
          happyadPostsLoading=false;
          try{render();}catch(_r){}
        }
      }
      if(fresh.length<page){finished=true;break;}
      from+=page;
      if(all.length>=HAPPYAD_HOME_MAX_POSTS)break;
      await new Promise(function(resolve){setTimeout(resolve,60);});
    }
    if(finished)HAPPYAD_HOME_REMOTE_DONE=true;
    HAPPYAD_HOME_FULL_SYNC_DONE=finished;
    var finalMerged=happyadSaveHomeFastCache([].concat(ALL_POSTS||[],seedPosts||[],all));
    if(finalMerged&&finalMerged.length){
      HAPPYAD_HOME_RENDER_LIMIT=Math.min(HAPPYAD_HOME_MAX_POSTS,Math.max(HAPPYAD_HOME_RENDER_LIMIT,finalMerged.length));
      HAPPYAD_HOME_REMOTE_NEXT_OFFSET=Math.max(HAPPYAD_HOME_REMOTE_NEXT_OFFSET,all.length,finalMerged.length);
    }
    if(postsKey(finalMerged)!==postsKey(ALL_POSTS||[])){
      ALL_POSTS=finalMerged;
      happyadPostsLoading=false;
      try{render();}catch(_rr){}
    }else{try{render();}catch(_r2){}}
    try{happyadPrimeHomeActionsBatch((finalMerged||[]).slice(0,120)).then(function(){refreshHomeVisibleActionsNow();}).catch(function(e){console.warn('home all actions background',e);});}catch(_a){}
  }catch(e){console.warn('home all posts sync',e);}
  HAPPYAD_HOME_FULL_SYNC_RUNNING=false;
}
async function fetchRemotePosts(userOnly, force){
  const c=happyadSb();
  const allKey='HAPPYAD_PUBLISH_POSTS_V2';
  const globalKey='HAPPYAD_GLOBAL_POSTS_CACHE_V1';
  const userKey='HAPPYAD_PROFILE_POSTS_CACHE_V1';
  const sessionKey=userOnly?'HAPPYAD_SESSION_PROFILE_POSTS_V104':'HAPPYAD_SESSION_ALL_POSTS_V104';
  const syncKey=userOnly?'HAPPYAD_PROFILE_POSTS_LAST_SYNC':'HAPPYAD_ALL_POSTS_LAST_SYNC';
  const ttl=userOnly?300000:300000; // V104: 5 minutes, éviter appel Supabase à chaque retour
  function safeArr(k){try{const v=JSON.parse(sessionStorage.getItem(k)||'[]');return Array.isArray(v)?v:[]}catch(e){return []}}
  function saveSessionPosts(arr){
    arr=uniq(arr).slice(0,HAPPYAD_HOME_MAX_POSTS);
    try{sessionStorage.setItem(sessionKey,JSON.stringify(arr));}catch(e){try{sessionStorage.removeItem(sessionKey);}catch(_e){}}
    return arr;
  }
  function happyadDeletedPostIds(){try{return JSON.parse(localStorage.getItem('HAPPYAD_DELETED_POST_IDS_V1')||'[]').map(String)}catch(e){return []}}
  function markHappyadRemoteDeletedIds(ids){try{let old=happyadDeletedPostIds();(ids||[]).map(String).forEach(id=>{if(id&&old.indexOf(id)<0)old.push(id)});localStorage.setItem('HAPPYAD_DELETED_POST_IDS_V1',JSON.stringify(old.slice(-1000)));}catch(e){}}
  async function syncRemoteDeletedPostIds(c){try{if(!c)return;const r=await c.from('happyad_posts').select('id,deleted_at').not('deleted_at','is',null).order('deleted_at',{ascending:false}).limit(300);if(r&&r.error)throw r.error;markHappyadRemoteDeletedIds((r.data||[]).map(x=>x.id).filter(Boolean));}catch(e){console.warn('home deleted posts sync',e);}}
  function uniq(arr){const seen=new Set();const deleted=happyadDeletedPostIds();return (arr||[]).filter(p=>{const id=String(p&&p.id||'');if(!id||seen.has(id)||deleted.indexOf(id)>=0||String(p&&p.deleted_at||'')!=='')return false;if(window.happyadHomePostHiddenForPrivacyV438&&window.happyadHomePostHiddenForPrivacyV438(p))return false;seen.add(id);return true;}).sort((a,b)=>(Number(b.createdAt||b.created_at)||0)-(Number(a.createdAt||a.created_at)||0));}
  function saveAll(arr){return uniq(arr);}
  function currentLocalUser(){try{return JSON.parse(localStorage.getItem('HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL')||'{}')||{}}catch(e){return {}}}
  function filterOwn(arr, uid){const u=currentLocalUser();const h=String(u.handle||'').replace(/^@+/,'').toLowerCase();const n=String(u.name||'').toLowerCase();uid=uid||u.id||localStorage.getItem('HAPPYAD_AUTH_UID')||'';return uniq(arr).filter(p=>{const ph=String(p.handle||p.username||'').replace(/^@+/,'').toLowerCase();const pn=String(p.creatorName||p.display_name||p.creator_name||'').toLowerCase();return (uid&&String(p.creatorId||p.user_id||'')===String(uid))||(h&&ph===h)||(n&&pn===n);});}
  function readStablePosts(k){try{const v=JSON.parse(localStorage.getItem(k)||'[]');return Array.isArray(v)?v:[]}catch(e){return []}}
  function saveStablePosts(arr){
    arr=uniq(arr).slice(0,HAPPYAD_HOME_MAX_POSTS);
    try{localStorage.setItem(allKey,JSON.stringify(arr));}catch(e){}
    try{localStorage.setItem(globalKey,JSON.stringify(arr));}catch(e){}
    if(userOnly){try{localStorage.setItem(userKey,JSON.stringify(arr));}catch(e){}}
    try{if(!userOnly)happyadWriteHomeBootSnapshotV407(arr);}catch(e){}
    return arr;
  }
  const memory=uniq([].concat(
    safeArr(sessionKey),
    readStablePosts(allKey),
    readStablePosts(globalKey),
    readStablePosts('HAPPYAD_ALL_POSTS_V1'),
    readStablePosts('HAPPYAD_SEARCH_POSTS_FAST_CACHE_V1'),
    userOnly?readStablePosts(userKey):[]
  ));
  let uid='';
  try{const u=currentLocalUser();uid=u.id||localStorage.getItem('HAPPYAD_AUTH_UID')||'';}catch(e){}
  const immediate=userOnly?filterOwn([].concat(safeArr(userKey),memory),uid):memory;
  try{
    if(!force){
      const last=Number(sessionStorage.getItem(syncKey)||'0');
      if(Date.now()-last<ttl && immediate.length){
        if(!userOnly&&c){try{setTimeout(function(){happyadSyncAllHomePostsV493(c,immediate);},120);}catch(_bg){}}
        return immediate;
      }
    }
  }catch(_){ }
  if(!c)return immediate.length?immediate:null;
  try{
    let authUser=null;
    /* HAPPYAD V406: l'accueil public ne doit pas attendre auth.getUser().
       On vérifie l'utilisateur seulement pour Mon profil/userOnly. */
    if(userOnly){try{const r=await c.auth.getUser();authUser=r&&r.data&&r.data.user; if(authUser){uid=authUser.id;localStorage.setItem('HAPPYAD_AUTH_UID',uid);}}catch(_){ }}
    const firstLimit=userOnly?120:(force?HAPPYAD_HOME_MAX_POSTS:HAPPYAD_HOME_REMOTE_PAGE);
    let q=c.from('happyad_posts').select('*').is('deleted_at',null).order('created_at',{ascending:false}).limit(firstLimit);
    if(userOnly){ if(!uid)return immediate; q=q.eq('user_id',uid); }
    const {data,error}=await q;
    if(error)throw error;
    let arr=uniq((data||[]).map(mapHappyPost));
    if(!userOnly){HAPPYAD_HOME_REMOTE_NEXT_OFFSET=Math.max(HAPPYAD_HOME_REMOTE_NEXT_OFFSET,arr.length);}
    if(!userOnly && arr.length<firstLimit)HAPPYAD_HOME_REMOTE_DONE=true;
    /* HAPPYAD V403: le premier rendu ne doit pas attendre les appels secondaires Supabase.
       Les suppressions distantes, profils auteurs et actions sont synchronisés après l'affichage. */
    try{syncRemoteDeletedPostIds(c).then(function(){
      try{
        const deleted=happyadDeletedPostIds();
        const cleaned=uniq((ALL_POSTS||[]).filter(function(p){return deleted.indexOf(String(p&&p.id||''))<0;}));
        if(!userOnly && postsKey(cleaned)!==postsKey(ALL_POSTS||[])){ALL_POSTS=cleaned;saveStablePosts(cleaned);render();}
      }catch(_e){}
    }).catch(function(e){console.warn('home deleted posts background sync',e);});}catch(_e){}
    try{happyadPrimeHomeActionsBatch(arr).then(function(){try{refreshHomeVisibleActionsNow();}catch(_e){}}).catch(function(e){console.warn('home action preload background',e);});}catch(_e){}
    if(!userOnly){try{setTimeout(function(){happyadSyncAllHomePostsV493(c,arr);},180);}catch(_all){} }
    try{enrichAuthorProfiles(c,arr).then(function(enriched){
      try{
        enriched=uniq(enriched||arr);
        const merged=force?enriched:(userOnly?filterOwn(uniq([].concat(enriched,memory)),uid):uniq([].concat(enriched,memory)));
        saveSessionPosts(merged);
        saveStablePosts(merged);
        if(!userOnly){
          const before=postsKey(ALL_POSTS||[]), after=postsKey(merged||[]);
          if(after && before!==after){ALL_POSTS=merged;happyadPostsLoading=false;render();}
          else{renderRadarHome();refreshHomeVisibleActionsNow();}
        }
      }catch(_e){}
    }).catch(function(e){console.warn('home author profiles background sync',e);});}catch(_e){}
    /* HAPPYAD V211 DELETE EVERYWHERE FAST
       Si ce chargement est forcé, Supabase devient la source de vérité.
       Avant on fusionnait toujours remote + memory : une publication supprimée pouvait rester
       8 à 10 minutes sur les autres téléphones parce que l'ancien cache local la remettait.
       En refresh forcé/polling, on garde seulement les lignes actives renvoyées par happyad_posts
       avec deleted_at IS NULL. */
    if(force){
      sessionStorage.setItem(syncKey,String(Date.now()));
      saveSessionPosts(arr);
      saveStablePosts(arr);
      if(!userOnly&&arr&&arr.length){HAPPYAD_HOME_RENDER_LIMIT=Math.min(HAPPYAD_HOME_MAX_POSTS,Math.max(HAPPYAD_HOME_RENDER_LIMIT,arr.length));}
      return arr;
    }
    /* HAPPYAD V207: Supabase peut renvoyer une page partielle au retour accueil.
       On fusionne seulement pendant le chargement non forcé pour ne pas perdre une carte déjà connue. */
    arr=uniq([].concat(arr,memory));
    sessionStorage.setItem(syncKey,String(Date.now()));
    if(userOnly){
      if(arr.length){saveSessionPosts(arr);return arr;}
      return immediate;
    }
    if(arr.length){
      saveSessionPosts(arr);
      saveStablePosts(arr);
      return arr;
    }
    return immediate;
  }catch(e){console.warn('happyad remote posts',e);return immediate.length?immediate:null;}
}

function esc(s){return String(s||"").replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function openDB(){return new Promise((resolve,reject)=>{const req=indexedDB.open("HAPPYAD_MEDIA_DB",1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains("media"))req.result.createObjectStore("media",{keyPath:"id"});};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
async function getMedia(id){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction("media","readonly");const req=tx.objectStore("media").get(id);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
function isVideo(p){return !happyadIsStory(p)&&!happyadIsLive(p)&&(p.kind==='video'||p.type==='video'||p.mediaType==='video')}
function isPhoto(p){return !happyadIsStory(p)&&!isVideo(p)}
function profileName(p){return p.creatorName||p.userName||p.author||'HAPPYAD'}
function initials(name){return String(name||'H').trim().slice(0,1).toUpperCase()}
function catOf(p){if(isVideo(p))return 'video'; if((p.category||'').toLowerCase().includes('produit')||p.type==='product'||p.kind==='product')return 'Produit'; if((p.category||'').toLowerCase().includes('service'))return 'Service'; if((p.category||'').toLowerCase().includes('lieu')||(p.category||'').toLowerCase().includes('événement'))return 'Événement'; return 'photo'}
function visiblePosts(){return ALL_POSTS.filter(p=>{if(currentFilter==='all')return true;if(currentFilter==='video')return isVideo(p);if(currentFilter==='photo')return isPhoto(p);return catOf(p)===currentFilter || (p.category||'')===currentFilter;});}
const ACT_KEY='HAPPYAD_VIDEO_ACTIONS_V1';
function readActions(){try{return JSON.parse(localStorage.getItem(ACT_KEY)||'{}')}catch(e){return {}}}
function saveActions(x){localStorage.setItem(ACT_KEY,JSON.stringify(x))}
function happyadNormalizeActionStateV16ZF(a){
  try{
    if(!a||typeof a!=='object'||Array.isArray(a))a={};
    if(!Array.isArray(a.commentsList))a.commentsList=[];
    a.like=!!a.like;
    a.fav=!!a.fav;
    a.likes=Math.max(0,Number(a.likes||0)||0);
    a.comments=Math.max(0,Number(a.comments||0)||0);
    a.shares=Math.max(0,Number(a.shares||0)||0);
    a.favs=Math.max(0,Number(a.favs||0)||0);
    a.views=Math.max(0,Number(a.views||0)||0);
    if(a.__commentsLoading!==true)a.__commentsLoading=false;
    return a;
  }catch(_e){return {like:false,fav:false,likes:0,comments:0,shares:0,favs:0,views:0,commentsList:[],__commentsLoading:false};}
}
function getA(id){const all=readActions();return happyadNormalizeActionStateV16ZF(all[id]||{like:false,fav:false,likes:0,comments:0,shares:0,favs:0,views:0,commentsList:[]})}
function setA(id,a){const all=readActions();all[id]=happyadNormalizeActionStateV16ZF(a);saveActions(all)}
function happyadPostNum(){for(var i=0;i<arguments.length;i++){var v=Number(arguments[i]);if(isFinite(v)&&v>0)return v;}return 0}
function primeCardActionFromPost(p){try{if(!p||!p.id)return;const a=getA(p.id);a.likes=Math.max(Number(a.likes||0),happyadPostNum(p.likes_count,p.like_count,p.likes));a.comments=Math.max(Number(a.comments||0),happyadPostNum(p.comments_count,p.comment_count,p.comments));a.shares=Math.max(Number(a.shares||0),happyadPostNum(p.shares_count,p.share_count,p.shares));a.favs=Math.max(Number(a.favs||0),happyadPostNum(p.saves_count,p.favs_count,p.favorite_count,p.favorites_count,p.favs));a.views=Math.max(Number(a.views||0),happyadPostNum(p.views_count,p.view_count,p.video_views_count,p.views));setA(p.id,a);}catch(e){console.warn('prime card action',e)}}
async function happyadAuthUser(){
  const c=happyadSb();
  let local={};
  try{local=JSON.parse(localStorage.getItem('HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL')||'{}')||{};}catch(_e){local={}}
  function goodId(v){v=String(v||'').trim();return !!(v&&v.indexOf('guest')!==0&&v.indexOf('logged_out')!==0&&v!=='null'&&v!=='undefined');}
  function mark(u){try{if(u&&u.id){localStorage.setItem('HAPPYAD_AUTH_UID',String(u.id));localStorage.setItem('HAPPYAD_SESSION_ACTIVE','1');localStorage.removeItem('HAPPYAD_FORCE_LOGOUT');localStorage.removeItem('HAPPYAD_FORCE_LOGOUT_UNTIL');}}catch(_e){}return u||null;}
  if(c&&c.auth){
    try{
      if(c.auth.getSession){
        const gs=await c.auth.getSession();
        const su=gs&&gs.data&&gs.data.session&&gs.data.session.user;
        if(su&&su.id)return mark(su);
      }
    }catch(_e){}
    try{
      if(c.auth.getUser){
        const r=await c.auth.getUser();
        const gu=r&&r.data&&r.data.user;
        if(gu&&gu.id)return mark(gu);
      }
    }catch(_e){}
  }
  try{
    const uid=String(localStorage.getItem('HAPPYAD_AUTH_UID')||local.id||local.user_id||'').trim();
    const active=localStorage.getItem('HAPPYAD_SESSION_ACTIVE')==='1';
    if(active&&goodId(uid))return {id:uid,email:local.email||local.contact||'',user_metadata:{full_name:local.name||'',username:local.handle||local.username||''}};
  }catch(_e){}
  return null;
}

/* === HAPPYAD V281: NOTIFICATIONS CENTRAL SAFE HELPER === */
async function happyadCurrentActorProfile(){
  var user=null, local={};
  try{user=await happyadAuthUser();}catch(_e){}
  try{local=JSON.parse(localStorage.getItem('HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL')||localStorage.getItem('HAPPYAD_USER')||'{}')||{};}catch(_e){}
  return {
    id:String((user&&user.id)||local.id||local.user_id||local.uid||'').trim(),
    name:String(local.name||local.full_name||local.display_name||(user&&user.email)||'Utilisateur HAPPYAD').trim(),
    avatar:String(local.avatar||local.avatar_url||local.photo_url||'').trim(),
    badge:String(local.badge||local.userBadge||local.verifiedBadge||'').trim()
  };
}
async function happyadCreateNotificationSafe(){return false;}
function happyadPostOwnerId(p){return String((p&&(p.creatorId||p.user_id||p.ownerId||p.userId||p.author_id||p.creator_id||p.authorId))||'').trim();}
async function happyadResolvePostOwnerId(p){
  var oid=happyadPostOwnerId(p); if(oid)return oid;
  try{var c=happyadSb&&happyadSb(); if(c&&p&&p.id){var r=await c.from('happyad_posts').select('user_id,creator_id,owner_id,author_id').eq('id',String(p.id)).maybeSingle();var d=r&&r.data||{};return String(d.user_id||d.creator_id||d.owner_id||d.author_id||'').trim();}}catch(_e){}
  return '';
}
function happyadNotifThrottleKey(postId,type){return 'HAPPYAD_NOTIF_SENT_'+String(postId||'')+'_'+String(type||'')+'_'+Math.floor(Date.now()/2500)}
async function happyadNotifyPostAction(p,type){
  try{
    if(!p||!p.id)return;
    var nt=type==='fav'||type==='favorite'?'favoris':String(type||'like');
    var th=happyadNotifThrottleKey(p.id,nt); if(sessionStorage.getItem(th))return; sessionStorage.setItem(th,'1');
    var label=nt==='like'?'a aimé votre publication':nt==='favoris'?'a ajouté votre publication aux favoris':nt==='commentaire'?'a commenté votre publication':'a réagi à votre publication';
    var rid=await happyadResolvePostOwnerId(p);
    await happyadCreateNotificationSafe({user_id:rid,type:nt,category:nt,title:'Nouvelle interaction',body:label,text:label,target_type:'post',target_id:p.id,post_id:p.id});
  }catch(e){console.warn('notify post action',e)}
}

const HAPPYAD_LIKE_CARD_REGISTRY={};
function registerLikeCard(card,p){if(!card||!p||!p.id)return;const id=String(p.id);if(!HAPPYAD_LIKE_CARD_REGISTRY[id])HAPPYAD_LIKE_CARD_REGISTRY[id]=[];if(HAPPYAD_LIKE_CARD_REGISTRY[id].indexOf(card)<0)HAPPYAD_LIKE_CARD_REGISTRY[id].push(card)}
function refreshLikeEverywhere(id){const key=String(id);const arr=(HAPPYAD_LIKE_CARD_REGISTRY[key]||[]).filter(c=>c&&c.isConnected);HAPPYAD_LIKE_CARD_REGISTRY[key]=arr;arr.forEach(c=>refreshCardAction(c,id));}
/* V338 : likes/favoris optimistes sans clignotement. Une ancienne synchro Supabase ne peut plus écraser le clic local pendant l'enregistrement. */
const HAPPYAD_ACTION_PENDING_LOCKS={};
function happyadPendingKey(postId,actionType){return String(postId||'')+'::'+String(actionType||'like');}
function happyadSetPendingAction(postId,actionType,on,count,ttl){try{HAPPYAD_ACTION_PENDING_LOCKS[happyadPendingKey(postId,actionType)]={on:!!on,count:Number(count||0),until:Date.now()+Number(ttl||6500)};}catch(e){}}
function happyadClearPendingAction(postId,actionType){try{delete HAPPYAD_ACTION_PENDING_LOCKS[happyadPendingKey(postId,actionType)];}catch(e){}}
function happyadGetPendingAction(postId,actionType){try{const x=HAPPYAD_ACTION_PENDING_LOCKS[happyadPendingKey(postId,actionType)];if(x&&Date.now()<Number(x.until||0))return x;if(x)delete HAPPYAD_ACTION_PENDING_LOCKS[happyadPendingKey(postId,actionType)];}catch(e){}return null;}
const HAPPYAD_COMMENT_PENDING_LOCKS={};
function happyadCommentPendingKey(postId){return String(postId||'');}
function happyadSetPendingComment(postId,cmt,ttl){try{var k=happyadCommentPendingKey(postId),arr=HAPPYAD_COMMENT_PENDING_LOCKS[k]||[];var keepMs=(ttl==null?120000:Number(ttl||120000));cmt=Object.assign({},cmt||{},{__pending:true,__until:Date.now()+keepMs});arr=arr.filter(function(x){return x&&Date.now()<Number(x.__until||0)&&String(x.id)!==String(cmt.id);});arr.push(cmt);HAPPYAD_COMMENT_PENDING_LOCKS[k]=arr;}catch(e){}}
function happyadSamePendingComment(a,b){try{var tx=String(a&&a.text||a&&a.comment_text||a&&a.body||'').trim();var ty=String(b&&b.text||b&&b.comment_text||b&&b.body||'').trim();if(!tx||tx!==ty)return false;var ax=String(a&&a.user_id||a&&a.authorId||'');var ay=String(b&&b.user_id||b&&b.authorId||'');if(ax&&ay&&ax!==ay)return false;var px=String(a&&a.parent_id||a&&a.parentId||'');var py=String(b&&b.parent_id||b&&b.parentId||'');return px===py;}catch(e){return false;}}
function happyadMergePendingComments(postId,remoteList){try{
  var k=happyadCommentPendingKey(postId),now=Date.now();
  var list=Array.isArray(remoteList)?remoteList.slice():[];
  var pending=(HAPPYAD_COMMENT_PENDING_LOCKS[k]||[]).filter(function(x){return x&&now<Number(x.__until||0);});
  /* V16ZI: on protège aussi les commentaires locaux déjà affichés dans le popup.
     Une lecture Supabase trop rapide ne doit jamais faire disparaître le commentaire optimiste. */
  try{
    var localA=getA(postId)||{};
    var localList=Array.isArray(localA.commentsList)?localA.commentsList:[];
    localList.forEach(function(x){
      if(!x)return;
      var xid=String(happyadCommentIdV469(x)||'');
      if(x.__pending||x.__sending||xid.indexOf('local_')===0){
        var exists=pending.some(function(p){return String(happyadCommentIdV469(p))===xid;});
        if(!exists)pending.push(Object.assign({},x,{__pending:true,__until:now+120000}));
      }
    });
  }catch(_localMerge){}
  var keep=[];
  pending.forEach(function(p){
    var pid=String(happyadCommentIdV469(p)||'');
    var found=list.some(function(r){return String(happyadCommentIdV469(r)||'')===pid||happyadSamePendingComment(p,r);});
    if(!found){keep.push(Object.assign({},p,{__pending:true,__until:Number(p.__until||now+120000)}));list.push(p);}
  });
  if(keep.length)HAPPYAD_COMMENT_PENDING_LOCKS[k]=keep;else delete HAPPYAD_COMMENT_PENDING_LOCKS[k];
  return list;
}catch(e){return Array.isArray(remoteList)?remoteList:[];}}

async function loadContentActionsFromSupabase(postId,contentType){
  const c=happyadSb();if(!c||!postId)return null;
  try{
    const user=await happyadAuthUser();const id=String(postId);
    const keepLike=happyadGetPendingAction(id,'like');const keepFav=happyadGetPendingAction(id,'fav')||happyadGetPendingAction(id,'favorite');
    const {data:actions,error}=await c.from('happyad_content_actions').select('action_type,user_id,liked').eq('post_id',id);if(error)throw error;
    const {data:commentRows,count:commentCount,error:commentErr}=await c.from('happyad_content_comments').select('*',{count:'exact'}).eq('post_id',id).order('created_at',{ascending:false}).limit(180);if(commentErr)console.warn('comments count',commentErr);
    const profMap=await happyadLoadCommentProfilesV490(c,commentRows||[]);
    const commentList=(commentRows||[]).map(r=>{const pr=profMap[String(r.user_id||r.author_id||r.uid||'')]||{};const nm=pr.name||r.author_name||r.name||'Utilisateur';const av=pr.avatar||r.author_avatar||r.avatar||'';const bd=pr.badge||r.author_badge||r.user_badge||r.userBadge||r.verified_badge||r.verifiedBadge||r.verifyLevel||r.badge||'';return {id:r.id,post_id:r.post_id||id,user_id:r.user_id||'',authorId:r.user_id||'',parent_id:r.parent_id||null,parentId:r.parent_id||null,name:nm,author:nm,avatar:av,text:r.text||r.comment_text||r.body||'',badge:bd,likes:Number(r.likes||0),liked:false,replies:[],created_at:r.created_at||'',updated_at:r.updated_at||'',at:new Date(r.created_at||Date.now()).getTime()};});
    await happyadApplyCommentLikesV469(c,commentList,user);
    let counts={like:0,fav:0,share:0,view:0}, mine={like:false,fav:false};
    (actions||[]).forEach(r=>{const t=r.action_type;if(t==='like'&&r.liked===true)counts.like++;if((t==='fav'||t==='favorite')&&r.liked===true)counts.fav++;if(t==='share')counts.share++;if(user&&String(r.user_id)===String(user.id)){if(t==='like')mine.like=!!r.liked;if(t==='fav'||t==='favorite')mine.fav=!!r.liked;}});
    try{const vc=await c.from('happyad_video_views').select('id',{count:'exact',head:true}).eq('post_id',id);if(!vc.error)counts.view=Number(vc.count||0);}catch(_v){}
    const a=getA(id);if(keepLike){a.likes=Number(keepLike.count||0);a.like=!!keepLike.on;}else{a.likes=counts.like;a.like=mine.like;}if(keepFav){a.favs=Number(keepFav.count||0);a.fav=!!keepFav.on;}else{a.favs=counts.fav;a.fav=mine.fav;}var mergedComments=happyadMergePendingComments(id,commentList);a.shares=counts.share;a.views=counts.view;a.comments=Math.max(Number(commentCount||commentList.length||0),mergedComments.length);a.commentsList=mergedComments;a.__commentsLoading=false;a.__commentsExact=true;a.__commentsLoadedAt=Date.now();setA(id,a);refreshLikeEverywhere(id);return a;
  }catch(e){console.warn('happyad actions load',e);return null}
}
async function loadContentLikeFromSupabase(postId,contentType){return loadContentActionsFromSupabase(postId,contentType)}
async function happyadPrimeHomeActionsBatch(posts){
  const c=happyadSb();
  if(!c||!Array.isArray(posts)||!posts.length)return;
  try{
    const ids=[...new Set(posts.map(p=>String(p&&p.id||'')).filter(Boolean))].slice(0,80);
    if(!ids.length)return;
    let user=null;
    try{user=await happyadAuthUser();}catch(_e){}
    const byPost={};
    ids.forEach(function(id){
      const p=(posts||[]).find(x=>String(x&&x.id)===String(id))||{};
      const a=getA(id);
      byPost[id]={
        like:!!a.like,
        fav:!!a.fav,
        likes:Math.max(Number(a.likes||0),happyadPostNum(p.likes_count,p.like_count,p.likes)),
        comments:Math.max(Number(a.comments||0),happyadPostNum(p.comments_count,p.comment_count,p.comments)),
        shares:Math.max(Number(a.shares||0),happyadPostNum(p.shares_count,p.share_count,p.shares)),
        favs:Math.max(Number(a.favs||0),happyadPostNum(p.saves_count,p.favs_count,p.favorite_count,p.favorites_count,p.favs)),
        views:Math.max(Number(a.views||0),happyadPostNum(p.views_count,p.view_count,p.video_views_count,p.views)),
        commentsList:a.commentsList||[]
      };
    });
    try{
      const ar=await c.from('happyad_content_actions').select('post_id,action_type,user_id,liked').in('post_id',ids).limit(5000);
      if(ar&&!ar.error){
        const tmp={};
        (ar.data||[]).forEach(function(r){
          const id=String(r.post_id||''); if(!id||!byPost[id])return;
          tmp[id]=tmp[id]||{likes:0,favs:0,shares:0};
          const t=String(r.action_type||'');
          if(t==='like'&&r.liked===true)tmp[id].likes++;
          if((t==='fav'||t==='favorite')&&r.liked===true)tmp[id].favs++;
          if(t==='share')tmp[id].shares++;
          if(user&&String(r.user_id)===String(user.id)){
            if(t==='like')byPost[id].like=!!r.liked;
            if(t==='fav'||t==='favorite')byPost[id].fav=!!r.liked;
          }
        });
        Object.keys(tmp).forEach(function(id){
          byPost[id].likes=tmp[id].likes;
          byPost[id].favs=tmp[id].favs;
          byPost[id].shares=tmp[id].shares;
        });
      }
    }catch(_a){}
    try{
      const vr=await c.from('happyad_video_views').select('post_id').in('post_id',ids).limit(10000);
      if(vr&&!vr.error){
        const vc={};
        (vr.data||[]).forEach(function(r){const id=String(r.post_id||''); if(id)vc[id]=(vc[id]||0)+1;});
        Object.keys(vc).forEach(function(id){if(byPost[id])byPost[id].views=vc[id];});
      }
    }catch(_v){}
    try{
      const cr=await c.from('happyad_content_comments').select('*').in('post_id',ids).order('created_at',{ascending:false}).limit(5000);
      if(cr&&!cr.error){
        const lists={};
        (cr.data||[]).forEach(function(r){
          const id=String(r.post_id||''); if(!id||!byPost[id])return;
          (lists[id]=lists[id]||[]).push({id:r.id,post_id:r.post_id||id,user_id:r.user_id||'',authorId:r.user_id||'',parent_id:r.parent_id||null,parentId:r.parent_id||null,name:r.author_name||r.name||'Utilisateur',author:r.author_name||r.name||'Utilisateur',avatar:r.author_avatar||r.avatar||'',text:r.text||r.comment_text||r.body||'',badge:r.author_badge||r.user_badge||r.badge||'',likes:Number(r.likes||0),liked:false,replies:[],created_at:r.created_at||'',updated_at:r.updated_at||'',at:new Date(r.created_at||Date.now()).getTime()});
        });
        var allComments=[];Object.keys(lists).forEach(function(id){allComments=allComments.concat(lists[id]||[]);});
        await happyadApplyCommentLikesV469(c,allComments,user);
        ids.forEach(function(id){
          if(byPost[id]){
            var merged=happyadMergePendingComments(id,lists[id]||[]);
            byPost[id].commentsList=merged;
            byPost[id].comments=merged.length;
            byPost[id].__commentsLoading=false;
            byPost[id].__commentsExact=true;
            byPost[id].__commentsLoadedAt=Date.now();
          }
        });
      }else if(cr&&cr.error){console.warn('home comments preload',cr.error);}
    }catch(_c){}
    ids.forEach(function(id){
      /* V431 : pendant un clic J'aime/Favori, le batch Supabase ne doit pas remettre l'ancien etat visuel. */
      var pendingLike=happyadGetPendingAction(id,'like');
      var pendingFav=happyadGetPendingAction(id,'fav')||happyadGetPendingAction(id,'favorite');
      if(pendingLike){byPost[id].like=!!pendingLike.on;byPost[id].likes=Number(pendingLike.count||0);}
      if(pendingFav){byPost[id].fav=!!pendingFav.on;byPost[id].favs=Number(pendingFav.count||0);}
      setA(id,byPost[id]);
    });
    ids.forEach(refreshLikeEverywhere);
  }catch(e){console.warn('happyad batch prime actions',e)}
}

async function syncPostCountsSupabase(postId,contentType){const c=happyadSb();if(!c||!postId)return;try{const fresh=await loadContentActionsFromSupabase(postId,contentType);if(!fresh)return;var patch={likes_count:Number(fresh.likes||0),comments_count:Number(fresh.comments||0),shares_count:Number(fresh.shares||0),saves_count:Number(fresh.favs||0)};if(String(contentType||'').toLowerCase()==='video')patch.views_count=Number(fresh.views||0);await c.from('happyad_posts').update(patch).eq('id',String(postId));}catch(e){console.warn('sync post counts',e)}}
function happyadBroadcastActionLocal(postId){try{localStorage.setItem('HAPPYAD_ACTION_FAST_SYNC_V1',JSON.stringify({id:String(postId),t:Date.now()}));}catch(e){}}
window.addEventListener('storage',function(e){try{if(e.key==='HAPPYAD_ACTION_FAST_SYNC_V1'&&e.newValue){var r=JSON.parse(e.newValue||'{}');if(r&&r.id)loadContentActionsFromSupabase(r.id,'photo');}}catch(_e){}});
async function loadAllContentLikesFromSupabase(posts){const c=happyadSb();if(!c||!Array.isArray(posts)||!posts.length)return;const ids=[...new Set(posts.map(p=>String(p&&p.id||'')).filter(Boolean))].slice(0,12);await Promise.allSettled(ids.map(id=>loadContentActionsFromSupabase(id,'photo')))}
async function refreshHomeVisibleActionsNow(){try{const cards=[...document.querySelectorAll('#list .miniCard[data-post-id]')];if(!cards.length)return;const ids=[...new Set(cards.map(c=>String(c.dataset.postId||'')).filter(Boolean))];await Promise.allSettled(ids.map(function(id){const p=(ALL_POSTS||[]).find(x=>String(x&&x.id)===String(id));return loadContentActionsFromSupabase(id,(p&&isVideo(p))?'video':'photo');}));ids.forEach(refreshLikeEverywhere);}catch(e){console.warn('home visible actions refresh',e)}}
async function toggleContentActionSupabase(postId,contentType,actionType,nextValue){const c=happyadSb();if(!c||!postId)throw new Error('Supabase non chargé');const user=await happyadAuthUser();if(!user)throw new Error('Connecte-toi pour enregistrer cette action');const id=String(postId);if(actionType==='share'){const row={post_id:id,content_id:id,content_type:contentType,action_type:'share',user_id:user.id,liked:true};const ins=await c.from('happyad_content_actions').upsert(row,{onConflict:'post_id,content_type,action_type,user_id'});if(ins.error)throw ins.error;}else{const safeActionType=(actionType==='fav'?'favorite':actionType);const row={post_id:id,content_id:id,content_type:contentType,action_type:safeActionType,user_id:user.id,liked:!!nextValue};const up=await c.from('happyad_content_actions').upsert(row,{onConflict:'post_id,content_type,action_type,user_id'});if(up.error)throw up.error;}happyadBroadcastActionLocal(id);setTimeout(function(){syncPostCountsSupabase(id,contentType)},0);return getA(id)}
async function toggleContentLikeSupabase(postId,contentType,nextLiked){return toggleContentActionSupabase(postId,contentType,'like',nextLiked)}
function refreshContentLikeFromSupabase(card,p){if(!card||!p)return;registerLikeCard(card,p);refreshCardAction(card,p.id);loadContentActionsFromSupabase(p.id,isVideo(p)?'video':'photo')}
function countComments(list){return (list||[]).reduce((n,c)=>n+1+countComments(c.replies||[]),0)}
function happyadCompactCount(n){n=Number(n||0);if(!isFinite(n))n=0;var sign=n<0?'-':'';n=Math.abs(n);function fmt(v,s){var out=(v>=100?Math.floor(v):Math.floor(v*10)/10).toString();return sign+out.replace(/\.0$/,'')+s;}if(n<1000)return sign+String(Math.floor(n));if(n<1000000)return fmt(n/1000,'K');if(n<1000000000)return fmt(n/1000000,'M');if(n<1000000000000)return fmt(n/1000000000,'MD');return fmt(n/1000000000000,'T');}
function happyadFmtViews(n){return happyadCompactCount(n);}
function refreshCardAction(card,id){const a=getA(id);card.querySelectorAll('[data-card-act]').forEach(el=>{const type=el.dataset.cardAct;let val=type==='like'?a.likes:type==='comment'?(a.comments!==undefined?a.comments:countComments(a.commentsList||[])):type==='share'?a.shares:a.favs;const small=el.querySelector('small');if(small)small.textContent=happyadCompactCount(val||0);el.classList.toggle('on',(type==='like'&&a.like)||(type==='fav'&&a.fav));});const vb=card.querySelector('.happyadVideoViewsBadge');if(vb)vb.textContent=happyadCompactCount(a.views||0);}
function happyadEnsureHomeCommentPopupV468(){
  var box=document.getElementById('happyadHomeCommentPopup');
  if(box)return box;
  box=document.createElement('div');
  box.id='happyadHomeCommentPopup';
  box.innerHTML='<div class="haCommentBackdrop"></div><div class="haCommentPanel"><div class="haCommentPuller" aria-hidden="true"></div><div class="haCommentList"></div><form class="haCommentComposer"><div class="haReplyBar" style="display:none"><span></span><button type="button">×</button></div><input type="text" placeholder="Écrire un commentaire..." autocomplete="off"><button type="submit">Envoyer</button></form></div>';
  document.body.appendChild(box);
  box.querySelector('.haCommentBackdrop').onclick=function(){happyadCloseHomeCommentPopupV468()};
  var rb=box.querySelector('.haReplyBar');
  if(rb){var rbc=rb.querySelector('button'); if(rbc)rbc.onclick=function(e){e.preventDefault();happyadSetReplyTargetV469(null);return false;};}
  try{happyadBindCommentKeyboardV16ZI(box);}catch(_kb){}
  return box;
}
function happyadCloseHomeCommentPopupV468(){
  var box=document.getElementById('happyadHomeCommentPopup');
  if(box){
    try{
      var panel=box.querySelector('.haCommentPanel');
      if(panel){
        panel.style.removeProperty('transform');
        panel.style.removeProperty('transition');
        panel.style.removeProperty('opacity');
      }
    }catch(_e){}
    box.classList.remove('on');
  }
  document.body.classList.remove('haHomeCommentLock');
  try{window.__HAPPYAD_COMMENT_POST_ID_V469='';window.__HAPPYAD_COMMENT_REPLY_TARGET_V469=null;}catch(_e){}
}
function happyadCommentIdV469(c){return String((c&&(c.id||c.comment_id||c._id))||('c_'+Math.random())).trim();}
function happyadCurrentUserIdV469(){
  try{var u=currentUser&&currentUser();var id=u&&(u.id||u.user_id||u.uid||u.auth_id);if(id)return String(id);}catch(_e){}
  try{var raw=localStorage.getItem('HAPPYAD_AUTH_UID')||localStorage.getItem('supabase.auth.token')||'';if(raw&&raw.indexOf('{')!==0)return String(raw);}catch(_e){}
  return '';
}

function happyadFastCommentAuthorV16ZI(){
  var local={},u=null;
  try{local=JSON.parse(localStorage.getItem('HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL')||localStorage.getItem('HAPPYAD_USER')||'{}')||{};}catch(_e){local={};}
  try{u=currentUser&&currentUser();}catch(_u){u=null;}
  var id=String((u&&(u.id||u.user_id||u.uid||u.auth_id))||local.id||local.user_id||local.uid||local.auth_id||localStorage.getItem('HAPPYAD_AUTH_UID')||'').trim();
  var name=String(local.name||local.full_name||local.display_name||local.username||local.handle||(u&&(u.name||u.email))||'Utilisateur HAPPYAD').trim();
  var avatar=String(local.avatar||local.avatar_url||local.photo_url||local.userAvatar||'').trim();
  var badge=String(local.badge||local.userBadge||local.verifiedBadge||local.verifyLevel||'').trim();
  return {id:id,name:name,avatar:avatar,badge:badge};
}
function happyadBindCommentKeyboardV16ZI(box){
  try{
    if(!box||box.__haKeyboardV16ZI)return;box.__haKeyboardV16ZI=true;
    var input=box.querySelector('.haCommentComposer input'),list=box.querySelector('.haCommentList');
    function update(){
      try{
        var vv=window.visualViewport,offset=0;
        if(vv){offset=Math.max(0,Math.round(window.innerHeight-(vv.height+vv.offsetTop)));}
        if(offset<30)offset=0;
        document.documentElement.style.setProperty('--ha-comment-keyboard-offset',offset+'px');
        box.classList.toggle('haKeyboardOpen',offset>0||document.activeElement===input);
        if(list&&document.activeElement===input)setTimeout(function(){try{list.scrollTop=list.scrollHeight;}catch(_s){}},35);
      }catch(_e){}
    }
    if(window.visualViewport){visualViewport.addEventListener('resize',update);visualViewport.addEventListener('scroll',update);}
    window.addEventListener('resize',update);
    if(input){input.addEventListener('focus',function(){setTimeout(update,40);setTimeout(update,260);});input.addEventListener('blur',function(){setTimeout(update,80);});}
    update();
  }catch(e){}
}

function happyadCommentUserIdV469(c){return String((c&&(c.user_id||c.authorId||c.author_id||c.uid))||'').trim();}
function happyadCommentIsMineV469(c){var me=happyadCurrentUserIdV469(),cu=happyadCommentUserIdV469(c);return !!(me&&cu&&String(me)===String(cu));}
function happyadCommentAgeV469(c){
  try{
    var raw=(c&&(c.created_at||c.updated_at||c.at))||Date.now();
    var t=(typeof raw==='number')?raw:new Date(raw).getTime();
    if(!isFinite(t)||t<=0)t=Date.now();
    var diff=Math.max(0,Date.now()-t),min=60000,h=60*min,d=24*h,w=7*d,mo=30*d,y=365*d;
    if(diff<min)return 'À l’instant';
    if(diff<h){var n=Math.floor(diff/min);return 'Il y a '+n+' min';}
    if(diff<d){var n=Math.floor(diff/h);return 'Il y a '+n+' h';}
    if(diff<w){var n=Math.floor(diff/d);return 'Il y a '+n+' jour'+(n>1?'s':'');}
    if(diff<mo){var n=Math.floor(diff/w);return 'Il y a '+n+' semaine'+(n>1?'s':'');}
    if(diff<y){var n=Math.floor(diff/mo);return 'Il y a '+n+' mois';}
    var n=Math.floor(diff/y);return 'Il y a '+n+' an'+(n>1?'s':'');
  }catch(_e){return '';}
}
async function happyadLoadCommentProfilesV490(c,rows){
  var map={};
  try{
    rows=Array.isArray(rows)?rows:[];
    var ids=[];
    rows.forEach(function(r){var id=String((r&&(r.user_id||r.author_id||r.uid||r.profile_id))||'').trim();if(id&&ids.indexOf(id)<0)ids.push(id);});
    ids=ids.slice(0,120);
    if(!c||!ids.length)return map;
    var r=await c.from('profiles').select('*').in('id',ids);
    if(r&&r.error)return map;
    (r.data||[]).forEach(function(p){
      var id=String((p&&(p.id||p.user_id||p.uid))||'').trim();
      if(!id)return;
      map[id]={
        name:String((p.full_name||p.display_name||p.name||p.username)||'').trim(),
        avatar:String((p.avatar_url||p.avatar||p.photo_url||p.picture)||'').trim(),
        badge:String((p.badge||p.user_badge||p.verified_badge||p.verifiedBadge||p.verifyLevel)||'').trim()
      };
    });
  }catch(_e){}
  return map;
}
function happyadGetCommentLikeStateV469(commentId){
  try{var m=JSON.parse(localStorage.getItem('HAPPYAD_COMMENT_LIKES_V1')||'{}')||{};return !!m[String(commentId||'')];}catch(_e){return false;}
}
function happyadSetCommentLikeStateV469(commentId,on){
  try{var m=JSON.parse(localStorage.getItem('HAPPYAD_COMMENT_LIKES_V1')||'{}')||{};if(on)m[String(commentId||'')]=1;else delete m[String(commentId||'')];localStorage.setItem('HAPPYAD_COMMENT_LIKES_V1',JSON.stringify(m));}catch(_e){}
}

function happyadCommentLocalUserV469(){
  var out={};
  try{out=(typeof currentUser==='function'?currentUser():{})||{};}catch(_e){out={};}
  var keys=['HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL','HAPPYAD_USER','HAPPYAD_CURRENT_USER','HAPPYAD_LOGGED_USER'];
  for(var i=0;i<keys.length;i++){
    try{var v=JSON.parse(localStorage.getItem(keys[i])||'{}')||{};out=Object.assign({},v,out);}catch(_x){}
  }
  try{if(window.UserStore&&UserStore.data)out=Object.assign({},out,UserStore.data||{});}catch(_s){}
  return out||{};
}
function happyadCleanAuthorNameV469(v){
  v=String(v||'').trim();
  if(!v||v.toLowerCase()==='moi'||v.toLowerCase()==='utilisateur')return '';
  if(v.indexOf('@')>0)return v.split('@')[0];
  return v;
}
async function happyadResolveCommentAuthorV469(){
  var user=null;try{user=await happyadAuthUser();}catch(_e){}
  var local=happyadCommentLocalUserV469();
  var prof={};
  try{
    var c=happyadSb();
    var uid=user&&user.id?String(user.id):(String(local.id||local.user_id||local.uid||local.auth_id||localStorage.getItem('HAPPYAD_AUTH_UID')||'').trim());
    if(c&&uid){
      var pr=await c.from('profiles').select('*').eq('id',uid).maybeSingle();
      if(pr&&!pr.error&&pr.data)prof=pr.data||{};
    }
  }catch(_p){}
  var meta=(user&&user.user_metadata)||{};
  var name=happyadCleanAuthorNameV469(prof.full_name||prof.display_name||prof.name||prof.username||local.name||local.full_name||local.display_name||local.fullname||local.username||meta.full_name||meta.name||meta.user_name||meta.username||(user&&user.email)||'');
  var avatar=String(prof.avatar_url||prof.avatar||prof.photo_url||prof.picture||local.avatar||local.avatar_url||local.photo_url||local.picture||meta.avatar_url||meta.picture||'').trim();
  var badge=String(prof.badge||prof.user_badge||prof.verified_badge||prof.verifiedBadge||prof.verifyLevel||local.badge||local.user_badge||local.userBadge||local.verified_badge||local.verifiedBadge||local.verifyLevel||'').trim();
  var uid2=(user&&user.id)||prof.id||local.id||local.user_id||local.uid||localStorage.getItem('HAPPYAD_AUTH_UID')||'';
  if(!name)name='Utilisateur HAPPYAD';
  try{
    var old=JSON.parse(localStorage.getItem('HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL')||'{}')||{};
    var next=Object.assign({},old,{id:old.id||uid2,user_id:old.user_id||uid2,name:name,full_name:name,display_name:name,avatar:avatar||old.avatar,avatar_url:avatar||old.avatar_url,badge:badge||old.badge,user_badge:badge||old.user_badge});
    localStorage.setItem('HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL',JSON.stringify(next));
  }catch(_save){}
  return {id:String(uid2||''),name:name,avatar:avatar,badge:badge,email:(user&&user.email)||''};
}
async function happyadApplyCommentLikesV469(c,list,user){
  list=Array.isArray(list)?list:[];if(!c||!list.length)return list;
  try{
    var ids=list.map(function(x){return String(x&&x.id||'');}).filter(Boolean);
    if(!ids.length)return list;
    var r=await c.from('happyad_content_comment_likes').select('comment_id,user_id,liked').in('comment_id',ids).eq('liked',true).limit(10000);
    if(r&&r.error)return list;
    var counts={}, mine={};
    (r.data||[]).forEach(function(x){var cid=String(x.comment_id||'');if(!cid)return;counts[cid]=(counts[cid]||0)+1;if(user&&String(x.user_id||'')===String(user.id))mine[cid]=true;});
    list.forEach(function(x){var cid=String(x&&x.id||'');if(!cid)return;x.likes=Number(counts[cid]||x.likes||0);x.liked=!!mine[cid];if(x.liked)happyadSetCommentLikeStateV469(cid,true);});
  }catch(_e){}
  return list;
}
function happyadNormalizeCommentListV469(list){
  list=Array.isArray(list)?list.slice():[];
  list.forEach(function(c){
    if(!c)return;
    if(c.parent_id==null&&c.parentId!=null)c.parent_id=c.parentId;
    if(c.parentId==null&&c.parent_id!=null)c.parentId=c.parent_id;
    if(!c.at)c.at=new Date(c.created_at||c.updated_at||Date.now()).getTime();
  });
  list.sort(function(a,b){return Number(a.at||new Date(a.created_at||0).getTime()||0)-Number(b.at||new Date(b.created_at||0).getTime()||0);});
  return list;
}
function happyadCommentTreeV469(list){
  list=happyadNormalizeCommentListV469(list);
  var by={}, roots=[];
  list.forEach(function(c){by[happyadCommentIdV469(c)]=Object.assign({},c,{__children:[]});});
  Object.keys(by).forEach(function(id){
    var c=by[id],pid=String(c.parent_id||c.parentId||'').trim();
    if(pid&&by[pid])by[pid].__children.push(c);else roots.push(c);
  });
  return roots;
}
function happyadSetReplyTargetV469(c){
  var box=happyadEnsureHomeCommentPopupV468();
  window.__HAPPYAD_COMMENT_REPLY_TARGET_V469=c||null;
  var bar=box.querySelector('.haReplyBar'),input=box.querySelector('.haCommentComposer input');
  if(!bar)return;
  if(c){
    var nm=String((c.name||c.author||c.author_name)||'Utilisateur').trim();
    bar.style.display='flex';
    var sp=bar.querySelector('span');if(sp)sp.textContent='Réponse à '+nm;
    if(input){input.placeholder='Répondre à '+nm+'...'}
  }else{
    bar.style.display='none';
    if(input)input.placeholder='Écrire un commentaire...';
  }
}
function happyadCommentTextHtmlV469(c){
  var text=String((c&&(c.text||c.comment_text||c.body))||'').trim();
  var long=text.length>155;
  var id=happyadCommentIdV469(c);
  var cut=long?(text.slice(0,155).trim()+'...'):text;
  return '<p data-full="'+esc(text)+'" data-short="'+esc(cut)+'" data-expanded="0">'+esc(cut)+'</p>'+(long?'<button class="haCommentSeeMore" type="button" data-comment-more="'+esc(id)+'">Voir plus</button>':'');
}
function happyadCommentAuthorHtmlV468(c,level){
  c=c||{};level=Number(level||0);
  var id=happyadCommentIdV469(c);
  var name=String((c.name||c.author||c.author_name)||'Utilisateur').trim();
  var avatar=String((c.avatar||c.author_avatar)||'').trim();
  var badge=String((c.badge||c.author_badge||c.user_badge)||'').trim();
  var likes=Number(c.likes||c.like_count||0)||0;
  var liked=happyadGetCommentLikeStateV469(id)||!!c.liked;
  var mine=happyadCommentIsMineV469(c);
  return '<div class="haCommentItem" data-comment-id="'+esc(id)+'" data-level="'+Math.min(level,6)+'">'
    +'<div class="haCommentAvatar">'+(avatar?'<img src="'+esc(avatar)+'" alt="">':esc(initials(name||'H')))+'</div>'
    +'<div class="haCommentMain">'
      +'<div class="haCommentLine">'
        +'<div class="haCommentTextBlock">'
          +'<div class="haCommentMeta"><b>'+esc(name)+badgeMarkHtml(badge)+'</b><span>'+esc(happyadCommentAgeV469(c))+'</span></div>'
          +happyadCommentTextHtmlV469(c)
          +'<div class="haCommentTools"><button type="button" data-comment-reply="'+esc(id)+'">Répondre</button><button type="button" data-comment-menu="'+esc(id)+'">•••</button></div>'
          +'<div class="haCommentMenu" hidden>'+(mine?'<button type="button" data-comment-edit="'+esc(id)+'">Modifier</button><button type="button" data-comment-delete="'+esc(id)+'">Supprimer</button>':'<button type="button" data-comment-report="'+esc(id)+'">Signaler</button>')+'</div>'
        +'</div>'
        +'<button type="button" class="haCommentLike '+(liked?'on':'')+'" data-comment-like="'+esc(id)+'" aria-label="J’aime"><svg viewBox="0 0 24 24"><path d="M20.8 4.6c-1.9-1.7-4.9-1.5-6.6.5L12 7.6 9.8 5.1C8.1 3.1 5.1 2.9 3.2 4.6 1.1 6.5 1 9.7 3 11.7l9 8.6 9-8.6c2-2 1.9-5.2-.2-7.1z"/></svg><small>'+happyadCompactCount(likes)+'</small></button>'
      +'</div>'
      +'<div class="haCommentChildren"></div>'
    +'</div>'
  +'</div>';
}
function happyadRenderCommentNodeV469(c,level){
  level=Number(level||0);
  var html=happyadCommentAuthorHtmlV468(c,level);
  var kids=(c&&c.__children)||[];
  if(kids.length){
    var visible=kids,hidden=[];
    if(level===0&&kids.length>2){visible=kids.slice(0,1);hidden=kids.slice(1);}
    var inner=visible.map(function(x){return happyadRenderCommentNodeV469(x,level+1)}).join('');
    if(hidden.length){
      var cid=happyadCommentIdV469(c);
      inner+='<button class="haCommentMoreReplies" type="button" data-comment-replies="'+esc(cid)+'">Voir plus de réponses ('+hidden.length+')</button><div class="haCommentRepliesHidden" hidden>'+hidden.map(function(x){return happyadRenderCommentNodeV469(x,level+1)}).join('')+'</div>';
    }
    html=html.replace('<div class="haCommentChildren"></div>','<div class="haCommentChildren">'+inner+'</div>');
  }
  return html;
}
function happyadFindCommentByIdV469(postId,id){
  var a=getA(postId)||{},list=a.commentsList||[];
  id=String(id||'');
  for(var i=0;i<list.length;i++){if(String(happyadCommentIdV469(list[i]))===id)return list[i];}
  return null;
}
function happyadRenderHomeCommentsV468(postId){
  var box=happyadEnsureHomeCommentPopupV468();
  var list=box.querySelector('.haCommentList');
  var a=getA(postId)||{};
  var comments=happyadNormalizeCommentListV469(a.commentsList||[]);
  window.__HAPPYAD_COMMENT_POST_ID_V469=String(postId||'');
  if(!comments.length){
    var knownCount=Number(a.comments||0)||0;
    var exact=!!a.__commentsExact||Number(a.__commentsLoadedAt||0)>0;
    if(a.__commentsLoading===true||(!exact&&knownCount>0))list.innerHTML='<div class="haCommentEmpty">Chargement des commentaires...</div>';
    else list.innerHTML='<div class="haCommentEmpty">Aucun commentaire pour le moment.</div>';
    return;
  }
  var tree=happyadCommentTreeV469(comments);
  list.innerHTML='<div class="haCommentTopSpace"></div>'+tree.map(function(c){return happyadRenderCommentNodeV469(c,0)}).join('')+'<div class="haCommentEndHint">Glisse encore vers le bas pour fermer</div>';
}
async function happyadPersistCommentLikeV469(postId,comment,liked,likes){
  var c=happyadSb();if(!c||!comment||!comment.id||String(comment.id).indexOf('local_')===0)return null;
  var user=await happyadAuthUser();if(!user)throw new Error('Connecte-toi pour aimer ce commentaire');
  var cid=String(comment.id), uid=String(user.id), count=Number(likes||0);
  try{
    if(liked){
      var up=await c.from('happyad_content_comment_likes').upsert({comment_id:cid,post_id:String(postId||comment.post_id||''),user_id:uid,liked:true,updated_at:new Date().toISOString()},{onConflict:'comment_id,user_id'});
      if(up.error)throw up.error;
    }else{
      var del=await c.from('happyad_content_comment_likes').delete().eq('comment_id',cid).eq('user_id',uid);
      if(del.error)throw del.error;
    }
    var ct=await c.from('happyad_content_comment_likes').select('id',{count:'exact',head:true}).eq('comment_id',cid).eq('liked',true);
    if(ct&&!ct.error)count=Number(ct.count||0);
    var cu=await c.from('happyad_content_comments').update({likes:count}).eq('id',cid);
    if(cu&&cu.error)console.warn('comment likes column update',cu.error);
    return {likes:count,liked:!!liked};
  }catch(e){
    var fallback=await c.from('happyad_content_comments').update({likes:Number(likes||0)}).eq('id',cid);
    if(fallback&&fallback.error)throw e;
    return {likes:Number(likes||0),liked:!!liked};
  }
}

async function happyadInsertContentCommentSafeV16V(c,row){
  if(!c)throw new Error('Supabase non chargé');
  row=Object.assign({},row||{});
  var txt=String(row.text||row.comment_text||row.comment||row.body||'').trim();
  if(!txt)throw new Error('Commentaire vide');
  var now=row.created_at||new Date().toISOString();
  var postId=String(row.post_id||row.content_id||'').trim();
  if(!postId)throw new Error('Publication introuvable');
  var parentId=(row.parent_id||row.parentId)?String(row.parent_id||row.parentId):null;
  var contentType=String(row.content_type||row.type||'photo').trim()||'photo';
  async function strictAuthUser(){
    try{if(c&&c.auth&&c.auth.getSession){var gs=await c.auth.getSession();var su=gs&&gs.data&&gs.data.session&&gs.data.session.user;if(su&&su.id)return su;}}catch(_e){}
    try{if(c&&c.auth&&c.auth.getUser){var gu=await c.auth.getUser();var u=gu&&gu.data&&gu.data.user;if(u&&u.id)return u;}}catch(_e){}
    return null;
  }
  var authUser=await strictAuthUser();
  if(!authUser||!authUser.id){
    var ae=new Error('Session Supabase expirée : reconnecte-toi pour enregistrer le commentaire.');
    ae.happyadAuthRequired=true;
    throw ae;
  }
  var userId=String(authUser.id).trim();
  function clean(o){var r={};Object.keys(o||{}).forEach(function(k){var v=o[k];if(v!==undefined&&v!==null&&v!=='')r[k]=v;});return r;}
  function isSchemaColumnError(err){try{return /Could not find the ['\"][^'\"]+['\"] column|schema cache|PGRST204/i.test(String((err&&err.message)||err||''));}catch(_e){return false;}}
  function isRlsError(err){try{return /row-level security|violates row-level|RLS|42501/i.test(String((err&&err.message)||err||''));}catch(_e){return false;}}
  var base={post_id:postId,content_id:postId,content_type:contentType,user_id:userId,text:txt,created_at:now,parent_id:parentId,author_name:row.author_name||row.name||'Utilisateur HAPPYAD',author_avatar:row.author_avatar||row.avatar||'',author_badge:row.author_badge||row.badge||''};
  var tries=[
    clean(base),
    clean({post_id:postId,content_id:postId,content_type:contentType,user_id:userId,text:txt,created_at:now,parent_id:parentId}),
    clean({post_id:postId,content_type:contentType,user_id:userId,text:txt,created_at:now,parent_id:parentId}),
    clean({post_id:postId,user_id:userId,text:txt,created_at:now,parent_id:parentId}),
    clean({post_id:postId,user_id:userId,text:txt,created_at:now}),
    clean({post_id:postId,user_id:userId,body:txt,created_at:now,parent_id:parentId}),
    clean({post_id:postId,user_id:userId,comment:txt,created_at:now,parent_id:parentId})
  ];
  var last=null,firstReal=null,seen={};
  for(var i=0;i<tries.length;i++){
    var payload=tries[i]||{};
    if(!payload.post_id||!payload.user_id)continue;
    var sig=JSON.stringify(Object.keys(payload).sort().map(function(k){return k+':'+payload[k]}));
    if(seen[sig])continue;seen[sig]=1;
    var ins=await c.from('happyad_content_comments').insert(payload);
    if(!ins.error)return ins;
    last=ins.error;
    if(isRlsError(ins.error)){
      var re=new Error('Supabase bloque l’enregistrement du commentaire par RLS. Il faut appliquer SUPABASE_COMMENTS_RLS_FIX_V16ZI.sql dans Supabase.');
      re.original=ins.error; re.happyadRlsBlocked=true; throw re;
    }
    if(!isSchemaColumnError(ins.error)&&!firstReal)firstReal=ins.error;
  }
  throw firstReal||last||new Error('Commentaire non enregistré');
}

async function happyadAddHomeCommentSupabaseV468(p,contentType,text,parentId,author){
  var c=happyadSb();if(!c||!p||!p.id)throw new Error('Supabase non chargé');
  var user=await happyadAuthUser();if(!user)throw new Error('Connecte-toi pour commenter');
  author=author||await happyadResolveCommentAuthorV469();
  var row={post_id:String(p.id),content_id:String(p.id),content_type:contentType,user_id:user.id,author_name:author.name||user.email||'Utilisateur HAPPYAD',author_avatar:author.avatar||'',author_badge:author.badge||'',text:String(text||'').trim(),parent_id:parentId||null,created_at:new Date().toISOString()};
  await happyadInsertContentCommentSafeV16V(c,row);
  try{await happyadNotifyPostAction(p,'commentaire')}catch(_n){}
  try{await syncPostCountsSupabase(p.id,contentType)}catch(_s){}
  try{happyadBroadcastActionLocal(p.id)}catch(_b){}
  return await loadContentActionsFromSupabase(p.id,contentType);
}
async function happyadEditCommentSupabaseV469(postId,commentId,text){
  var c=happyadSb();if(!c||!commentId)throw new Error('Supabase non chargé');
  var up=await c.from('happyad_content_comments').update({text:String(text||'').trim(),updated_at:new Date().toISOString()}).eq('id',commentId);
  if(up.error)throw up.error;
  return await loadContentActionsFromSupabase(postId,'photo');
}
async function happyadDeleteCommentSupabaseV469(postId,commentId){
  var c=happyadSb();if(!c||!commentId)throw new Error('Supabase non chargé');
  if(String(commentId).indexOf('local_')===0)return await loadContentActionsFromSupabase(postId,'photo');
  var user=await happyadAuthUser();
  var q=c.from('happyad_content_comments').delete().eq('id',String(commentId));
  if(user&&user.id)q=q.eq('user_id',String(user.id));
  var del=await q.select('id');
  if(del.error)throw del.error;
  if(!del.data||!del.data.length)throw new Error('Commentaire non supprimé dans Supabase');
  try{await c.from('happyad_content_comment_likes').delete().eq('comment_id',String(commentId));}catch(_l){}
  try{await syncPostCountsSupabase(postId,'photo')}catch(_s){}
  return await loadContentActionsFromSupabase(postId,'photo');
}

function happyadIsCommentRlsOrAuthErrorV16ZI(err){
  try{return /row-level security|violates row-level|Supabase bloque|RLS|Session Supabase expirée|42501/i.test(String((err&&err.message)||err||''));}catch(_e){return false;}
}
function happyadHandleCommentSaveErrorV16ZI(err){
  var msg=String((err&&err.message)||err||'Erreur inconnue');
  if(happyadIsCommentRlsOrAuthErrorV16ZI(err)){
    var m=msg.indexOf('SUPABASE_COMMENTS_RLS_FIX_V16ZI')>=0?msg:'Commentaire visible localement, mais Supabase bloque l’enregistrement. Applique SUPABASE_COMMENTS_RLS_FIX_V16ZI.sql.';
    try{if(typeof toast==='function')toast(m);else console.warn(m);}catch(_e){console.warn(m)}
    return;
  }
  alert('Commentaire non envoyé : '+msg);
}

async function happyadOpenHomeCommentPopupV468(p,contentType){
  var box=happyadEnsureHomeCommentPopupV468();
  var form=box.querySelector('.haCommentComposer');
  var input=form.querySelector('input');
  var btn=form.querySelector('button[type="submit"]');
  document.body.classList.add('haHomeCommentLock');
  box.classList.add('on');
  happyadSetReplyTargetV469(null);
  try{var aOpen=getA(p.id);aOpen.__commentsLoading=true;aOpen.__commentsExact=false;setA(p.id,aOpen);}catch(_openState){}
  happyadRenderHomeCommentsV468(p.id);
  var list=box.querySelector('.haCommentList');
  try{input.blur();document.activeElement&&document.activeElement.blur&&document.activeElement.blur();}catch(_b){}
  setTimeout(function(){try{input.blur();list.scrollTop=list.scrollHeight}catch(_e){}},80);
  loadContentActionsFromSupabase(p.id,contentType).then(function(fresh){try{var ax=getA(p.id);ax.__commentsLoading=false;if(fresh){ax.__commentsExact=true;ax.__commentsLoadedAt=Date.now();}setA(p.id,ax);}catch(_st){}happyadRenderHomeCommentsV468(p.id);setTimeout(function(){try{list.scrollTop=list.scrollHeight}catch(_e){}},30)}).catch(function(e){try{var ax=getA(p.id);ax.__commentsLoading=false;setA(p.id,ax);}catch(_st){}console.warn('comment load',e);happyadRenderHomeCommentsV468(p.id)});
  form.onsubmit=async function(e){
    e.preventDefault();e.stopPropagation();
    var text=String(input.value||'').trim();
    if(!text)return false;
    var oldText=text,temp=null,parentId=null,author=happyadFastCommentAuthorV16ZI();
    btn.disabled=true;
    try{
      input.value='';
      var reply=window.__HAPPYAD_COMMENT_REPLY_TARGET_V469||null;
      parentId=reply?happyadCommentIdV469(reply):null;
      var a=getA(p.id);
      var safeList=Array.isArray(a.commentsList)?a.commentsList.slice():[];
      temp={id:'local_'+Date.now()+'_'+Math.floor(Math.random()*9999),post_id:p.id,parent_id:parentId,parentId:parentId,user_id:author.id||happyadCurrentUserIdV469(),authorId:author.id||happyadCurrentUserIdV469(),name:author.name||'Utilisateur HAPPYAD',author:author.name||'Utilisateur HAPPYAD',avatar:author.avatar||'',badge:author.badge||'',text:text,likes:0,liked:false,at:Date.now(),created_at:new Date().toISOString(),replies:[],__pending:true,__sending:true};
      happyadSetPendingComment(p.id,temp,120000);
      safeList.push(temp);
      a.commentsList=safeList;
      a.comments=safeList.length;
      a.__commentsLoading=false;
      a.__commentsExact=false;
      setA(p.id,a);
      refreshLikeEverywhere(p.id);
      happyadRenderHomeCommentsV468(p.id);
      happyadSetReplyTargetV469(null);
      setTimeout(function(){try{list.scrollTop=list.scrollHeight;input.focus();}catch(_e){}},20);
      try{
        var realAuthor=await happyadResolveCommentAuthorV469();
        if(realAuthor&&(realAuthor.id||realAuthor.name||realAuthor.avatar||realAuthor.badge)){
          author=realAuthor;
          var au=getA(p.id);(au.commentsList||[]).forEach(function(x){if(String(happyadCommentIdV469(x))===String(temp.id)){x.user_id=author.id||x.user_id;x.authorId=author.id||x.authorId;x.name=author.name||x.name;x.author=author.name||x.author;x.avatar=author.avatar||x.avatar;x.badge=author.badge||x.badge;}});setA(p.id,au);happyadSetPendingComment(p.id,Object.assign({},temp,{user_id:author.id||temp.user_id,authorId:author.id||temp.authorId,name:author.name||temp.name,author:author.name||temp.author,avatar:author.avatar||temp.avatar,badge:author.badge||temp.badge}),120000);happyadRenderHomeCommentsV468(p.id);
        }
      }catch(_authorErr){}
      var fresh=await happyadAddHomeCommentSupabaseV468(p,contentType,text,parentId,author);
      try{var ax=getA(p.id);ax.__commentsLoading=false;if(fresh){ax.__commentsExact=true;ax.__commentsLoadedAt=Date.now();}setA(p.id,ax);}catch(_state){}
      happyadRenderHomeCommentsV468(p.id);
      refreshLikeEverywhere(p.id);
      setTimeout(function(){try{list.scrollTop=list.scrollHeight}catch(_e){}},20);
    }catch(err){
      try{
        var rb=getA(p.id),rl=Array.isArray(rb.commentsList)?rb.commentsList.slice():[];
        if(temp){
          var exists=rl.some(function(x){return String(happyadCommentIdV469(x))===String(temp.id);});
          if(!exists)rl.push(temp);
          rl.forEach(function(x){if(String(happyadCommentIdV469(x))===String(temp.id)){x.__pending=true;x.__sending=false;x.__pendingError=true;x.__until=Date.now()+120000;}});
          rb.commentsList=rl;rb.comments=rl.length;rb.__commentsLoading=false;rb.__commentsExact=false;setA(p.id,rb);happyadSetPendingComment(p.id,Object.assign({},temp,{__pendingError:true}),120000);refreshLikeEverywhere(p.id);happyadRenderHomeCommentsV468(p.id);
        }else{input.value=oldText;}
      }catch(_keepErr){input.value=oldText;}
      happyadHandleCommentSaveErrorV16ZI(err);
    }finally{btn.disabled=false;try{happyadBindCommentKeyboardV16ZI(box);}catch(_kb){}}
    return false;
  };
  if(!box.__haCommentDelegationV469){
    box.__haCommentDelegationV469=true;
    box.addEventListener('click',async function(e){
      var idBtn=e.target&&e.target.closest?e.target.closest('[data-comment-like],[data-comment-reply],[data-comment-more],[data-comment-replies],[data-comment-menu],[data-comment-edit],[data-comment-delete],[data-comment-report]'):null;
      if(!idBtn)return;
      e.preventDefault();e.stopPropagation();
      var postId=window.__HAPPYAD_COMMENT_POST_ID_V469||'';
      var id=idBtn.getAttribute('data-comment-like')||idBtn.getAttribute('data-comment-reply')||idBtn.getAttribute('data-comment-more')||idBtn.getAttribute('data-comment-replies')||idBtn.getAttribute('data-comment-menu')||idBtn.getAttribute('data-comment-edit')||idBtn.getAttribute('data-comment-delete')||idBtn.getAttribute('data-comment-report')||'';
      var item=idBtn.closest('.haCommentItem');
      var cmt=happyadFindCommentByIdV469(postId,id);
      if(idBtn.hasAttribute('data-comment-more')){
        var ptag=item&&item.querySelector('p[data-full]');if(ptag){var on=ptag.dataset.expanded==='1';ptag.dataset.expanded=on?'0':'1';ptag.textContent=on?ptag.dataset.short:ptag.dataset.full;idBtn.textContent=on?'Voir plus':'Réduire';}return false;
      }
      if(idBtn.hasAttribute('data-comment-replies')){
        var hid=item&&item.querySelector('.haCommentRepliesHidden');if(hid){var opened=!hid.hidden;hid.hidden=opened;var n=hid.children?hid.children.length:0;idBtn.textContent=opened?('Voir plus de réponses ('+n+')'):'Masquer les réponses';}return false;
      }
      if(idBtn.hasAttribute('data-comment-reply')){if(cmt)happyadSetReplyTargetV469(cmt);return false;}
      if(idBtn.hasAttribute('data-comment-menu')){var menu=item&&item.querySelector('.haCommentMenu');if(menu)menu.hidden=!menu.hidden;return false;}
      if(idBtn.hasAttribute('data-comment-like')){
        if(!cmt||idBtn.dataset.busy==='1')return false;idBtn.dataset.busy='1';var cid=happyadCommentIdV469(cmt),oldOn=happyadGetCommentLikeStateV469(cid)||!!cmt.liked,oldLikes=Number(cmt.likes||0),on=!oldOn;happyadSetCommentLikeStateV469(cid,on);cmt.liked=on;cmt.likes=Math.max(0,oldLikes+(on?1:-1));var a=getA(postId),list=a.commentsList||[];list.forEach(function(x){if(happyadCommentIdV469(x)===cid){x.likes=cmt.likes;x.liked=on;}});a.commentsList=list;setA(postId,a);happyadRenderHomeCommentsV468(postId);try{var saved=await happyadPersistCommentLikeV469(postId,cmt,on,cmt.likes);if(saved){var ax=getA(postId);(ax.commentsList||[]).forEach(function(x){if(happyadCommentIdV469(x)===cid){x.likes=Number(saved.likes||0);x.liked=!!saved.liked;}});setA(postId,ax);happyadRenderHomeCommentsV468(postId);}}catch(err){happyadSetCommentLikeStateV469(cid,oldOn);var rb=getA(postId);(rb.commentsList||[]).forEach(function(x){if(happyadCommentIdV469(x)===cid){x.likes=oldLikes;x.liked=oldOn;}});setA(postId,rb);happyadRenderHomeCommentsV468(postId);alert('J’aime commentaire non enregistré : '+((err&&err.message)||err));}finally{try{idBtn.dataset.busy='0';}catch(_e){}}return false;
      }
      if(idBtn.hasAttribute('data-comment-edit')){
        if(!cmt)return false;var old=String(cmt.text||cmt.comment_text||cmt.body||'');var txt=prompt('Modifier le commentaire',old);if(txt==null)return false;txt=String(txt).trim();if(!txt)return false;var a1=getA(postId);(a1.commentsList||[]).forEach(function(x){if(happyadCommentIdV469(x)===id){x.text=txt;x.updated_at=new Date().toISOString();}});setA(postId,a1);happyadRenderHomeCommentsV468(postId);try{await happyadEditCommentSupabaseV469(postId,id,txt);}catch(err){alert('Modification non enregistrée : '+(err.message||err));}return false;
      }
      if(idBtn.hasAttribute('data-comment-delete')){
        if(!confirm('Supprimer ce commentaire ?'))return false;
        if(String(id).indexOf('local_')===0){var al=getA(postId);al.commentsList=(al.commentsList||[]).filter(function(x){return happyadCommentIdV469(x)!==id && String(x.parent_id||x.parentId||'')!==String(id)});al.comments=Math.max(0,Number(al.comments||0)-1);setA(postId,al);refreshLikeEverywhere(postId);happyadRenderHomeCommentsV468(postId);return false;}
        try{await happyadDeleteCommentSupabaseV469(postId,id);refreshLikeEverywhere(postId);happyadRenderHomeCommentsV468(postId);}catch(err){alert('Suppression non enregistrée : '+((err&&err.message)||err));await loadContentActionsFromSupabase(postId,'photo');happyadRenderHomeCommentsV468(postId);}return false;
      }
      if(idBtn.hasAttribute('data-comment-report')){alert('Signalement enregistré.');return false;}
      return false;
    },true);
    var panel=box.querySelector('.haCommentPanel'),listEl=box.querySelector('.haCommentList');var sy=0,sx=0,active=false,dragDy=0,started=false,dragMode='';
    function haCommentAtBottom(){try{return listEl.scrollTop+listEl.clientHeight>=listEl.scrollHeight-8}catch(_e){return false}}
    function haCommentSetPanel(y){try{panel.style.setProperty('transform','translate3d(0,'+Math.max(0,Math.round(y||0))+'px,0)','important');panel.style.setProperty('opacity',String(Math.max(.70,1-(Math.max(0,y||0)/760))),'important');}catch(_e){}}
    function haCommentResetDrag(){try{panel.style.setProperty('transition','transform .22s cubic-bezier(.2,.85,.2,1),opacity .18s ease','important');panel.style.removeProperty('transform');panel.style.removeProperty('opacity');setTimeout(function(){try{panel.style.removeProperty('transition')}catch(_e){}},230);}catch(_e){} active=false;dragDy=0;started=false;dragMode='';}
    function haCommentStartDrag(e){var t=e.touches&&e.touches[0];if(!t)return;sy=t.clientY;sx=t.clientX;dragDy=0;started=false;active=false;dragMode='';if(e.target&&e.target.closest&&e.target.closest('.haCommentComposer,input,textarea,button'))return;active=haCommentAtBottom()||!!(e.target&&e.target.closest&&e.target.closest('.haCommentPuller,.haCommentEndHint'));if(active){try{panel.style.setProperty('transition','none','important');panel.style.removeProperty('opacity')}catch(_e){}}}
    function haCommentMoveDrag(e){if(!active)return;var t=e.touches&&e.touches[0];if(!t)return;var dy=t.clientY-sy,dx=t.clientX-sx;if(!dragMode&&(Math.abs(dy)>5||Math.abs(dx)>5)){dragMode=Math.abs(dy)>=Math.abs(dx)?'y':'x';}
      if(dragMode!=='y')return;
      if(dy<=0){haCommentResetDrag();return;}
      started=true;dragDy=dy;if(e.cancelable)e.preventDefault();haCommentSetPanel(Math.min(window.innerHeight*.82,dy));}
    function haCommentEndDrag(){if(!active)return;try{panel.style.setProperty('transition','transform .22s cubic-bezier(.2,.85,.2,1),opacity .18s ease','important')}catch(_e){};if(started&&dragDy>Math.min(260,window.innerHeight*.30)){happyadCloseHomeCommentPopupV468();}else{haCommentResetDrag();}active=false;dragDy=0;started=false;dragMode='';}
    listEl.addEventListener('touchstart',haCommentStartDrag,{passive:true});
    listEl.addEventListener('touchmove',haCommentMoveDrag,{passive:false});
    listEl.addEventListener('touchend',haCommentEndDrag,{passive:true});
    listEl.addEventListener('touchcancel',haCommentResetDrag,{passive:true});
    var puller=box.querySelector('.haCommentPuller');
    if(puller){puller.addEventListener('touchstart',haCommentStartDrag,{passive:true});puller.addEventListener('touchmove',haCommentMoveDrag,{passive:false});puller.addEventListener('touchend',haCommentEndDrag,{passive:true});puller.addEventListener('touchcancel',haCommentResetDrag,{passive:true});}
  }
}
function bindAction(card,p,title){card.querySelectorAll('[data-card-act]').forEach(el=>{el.onclick=async(e)=>{e.stopPropagation();const type=el.dataset.cardAct;const contentType=isVideo(p)?'video':'photo';const a=getA(p.id);if(type==='comment'){happyadOpenHomeCommentPopupV468(p,contentType);return;}if(type==='like'||type==='fav'){if(el.dataset.busy==='1')return;el.dataset.busy='1';const key=type==='like'?'like':'fav', countKey=type==='like'?'likes':'favs', action=type==='like'?'like':'fav';const before={on:!!a[key],count:Number(a[countKey]||0)};const next=!before.on;a[key]=next;a[countKey]=Math.max(0,before.count+(next?1:-1));happyadSetPendingAction(p.id,action,next,a[countKey],7500);setA(p.id,a);refreshLikeEverywhere(p.id);toggleContentActionSupabase(p.id,contentType,action,next).then(function(){happyadSetPendingAction(p.id,action,next,getA(p.id)[countKey],1800);setTimeout(function(){happyadClearPendingAction(p.id,action);loadContentActionsFromSupabase(p.id,contentType);},1850);if(next){happyadNotifyPostAction(p,action);}}).catch(function(err){happyadClearPendingAction(p.id,action);const rb=getA(p.id);rb[key]=before.on;rb[countKey]=before.count;setA(p.id,rb);refreshLikeEverywhere(p.id);alert((type==='like'?'J’aime':'Favori')+' non enregistré : '+(err.message||err));}).finally(function(){setTimeout(function(){try{el.dataset.busy='0';}catch(_e){}},900);});return;}if(type==='share'){const before=Number(a.shares||0);a.shares=before+1;setA(p.id,a);refreshLikeEverywhere(p.id);try{await toggleContentActionSupabase(p.id,contentType,'share',true)}catch(err){const rb=getA(p.id);rb.shares=before;setA(p.id,rb);refreshLikeEverywhere(p.id);alert('Partage non enregistré : '+(err.message||err));}if(navigator.share)navigator.share({title:'HAPPYAD',text:title||'Publication HAPPYAD'}).catch(()=>{});return;}};});}
let HAPPYAD_RT_STARTED=false;
async function startHappyadRealtimeActions(){const c=happyadSb();if(!c||HAPPYAD_RT_STARTED)return;HAPPYAD_RT_STARTED=true;try{c.channel('happyad-content-actions-global').on('postgres_changes',{event:'*',schema:'public',table:'happyad_content_actions'},async(payload)=>{const row=(payload&&payload.new)||payload.old;if(row&&row.post_id)await loadContentActionsFromSupabase(row.post_id,row.content_type||'photo');}).on('postgres_changes',{event:'*',schema:'public',table:'happyad_content_comments'},async(payload)=>{const row=(payload&&payload.new)||payload.old;if(row&&row.post_id)await loadContentActionsFromSupabase(row.post_id,row.content_type||'photo');}).on('postgres_changes',{event:'*',schema:'public',table:'happyad_video_views'},async(payload)=>{const row=(payload&&payload.new)||payload.old;if(row&&row.post_id)await loadContentActionsFromSupabase(row.post_id,'video');}).on('postgres_changes',{event:'*',schema:'public',table:'happyad_posts'},async(payload)=>{try{var r=(payload&&payload.new)||payload.old||{}; if(r&&r.id&&r.deleted_at){try{var ids=JSON.parse(localStorage.getItem('HAPPYAD_DELETED_POST_IDS_V1')||'[]').map(String); if(ids.indexOf(String(r.id))<0)ids.push(String(r.id)); localStorage.setItem('HAPPYAD_DELETED_POST_IDS_V1',JSON.stringify(ids.slice(-1000)));}catch(_e){} if(Array.isArray(ALL_POSTS)){ALL_POSTS=ALL_POSTS.filter(function(p){return String(p&&p.id)!==String(r.id)}); render();}} if(typeof window.happyadRefreshHomePostsNow==='function')await window.happyadRefreshHomePostsNow('realtime-posts');}catch(e){console.warn('realtime posts refresh',e);}}).subscribe();}catch(e){console.warn('realtime actions',e);}}
setTimeout(startHappyadRealtimeActions,900);


function happyadPhotoFastOpenPayload(postId){
  try{
    function readArr(k){try{var v=JSON.parse(localStorage.getItem(k)||'[]');return Array.isArray(v)?v:(v&&Array.isArray(v.posts)?v.posts:(v&&Array.isArray(v.list)?v.list:[]));}catch(_e){return []}}
    var raw=[].concat(Array.isArray(ALL_POSTS)?ALL_POSTS:[],readArr('HAPPYAD_GLOBAL_POSTS_CACHE_V1'),readArr('HAPPYAD_PUBLISH_POSTS_V2'),readArr('HAPPYAD_HOME_POSTS_CACHE_V1'),readArr('HAPPYAD_ALL_POSTS_V1'));
    var seen={};
    var source=raw.filter(function(p){var id=String(p&&p.id||'');if(!p||!id||seen[id]||(typeof isVideo==='function'&&isVideo(p))||p.deleted_at||p.deletedAt)return false;seen[id]=1;return true;});
    var target=source.find(function(p){return String(p&&p.id)===String(postId);})||null;
    function slim(p){return {
        id:p.id, title:p.title||'', desc:p.desc||p.description||'', description:p.description||p.desc||'',
        kind:p.kind||p.type||p.mediaType||p.media_type||'photo', type:p.type||p.kind||p.media_type||'photo', mediaType:p.mediaType||p.media_type||p.kind||p.type||'photo',
        mediaUrl:p.mediaUrl||p.media_url||p.imageUrl||p.image_url||p.photoUrl||p.photo_url||p.home_media_url||p.thumbnail_url||p.cover_url||'', media_url:p.media_url||p.mediaUrl||p.image_url||p.imageUrl||p.photo_url||p.photoUrl||p.home_media_url||p.thumbnail_url||p.cover_url||'', mediaPath:p.mediaPath||p.media_path||'', media_path:p.media_path||p.mediaPath||'',
        creatorId:p.creatorId||p.user_id||p.userId||'', user_id:p.user_id||p.creatorId||'', creatorName:p.creatorName||p.display_name||p.userName||p.author||p.name||'',
        display_name:p.display_name||p.creatorName||'', avatar:p.avatar||p.avatar_url||'', avatar_url:p.avatar_url||p.avatar||'',
        handle:p.handle||p.username||'', username:p.username||p.handle||'', badge:p.badge||'aucun',
        createdAt:p.createdAt||p.created_at||Date.now(), created_at:p.created_at||p.createdAt||Date.now(),
        batchId:p.batchId||p.batch_id||p.albumId||p.album_id||p.groupId||p.group_id||'', batch_id:p.batch_id||p.batchId||'',
        groupIndex:Number(p.groupIndex||p.group_index||p.photoIndex||p.photo_index||0), group_index:Number(p.group_index||p.groupIndex||p.photo_index||p.photoIndex||0),
        photoIndex:Number(p.photoIndex||p.photo_index||p.groupIndex||p.group_index||0), photo_index:Number(p.photo_index||p.photoIndex||p.group_index||p.groupIndex||0)
      };}
    var minimal=source.slice(0,120).map(slim);
    if(target && !minimal.some(function(p){return String(p.id)===String(target.id)})) minimal.unshift(slim(target));
    var fastPayload=JSON.stringify({ts:Date.now(), postId:String(postId||''), list:minimal, target:target?slim(target):null});
    sessionStorage.setItem('HAPPYAD_FAST_OPEN_PHOTO_V1', fastPayload);
    localStorage.setItem('HAPPYAD_FAST_OPEN_PHOTO_V1', fastPayload);
    try{ localStorage.setItem('HAPPYAD_PHOTO_STABLE_CACHE_V1', JSON.stringify({ts:Date.now(), list:minimal})); }catch(_stablePhotoCache){}
  }catch(_e){}
}


function happyadVideoFastOpenPayload(postId){
  try{
    function readArr(k){try{var v=JSON.parse(localStorage.getItem(k)||'[]');return Array.isArray(v)?v:(v&&Array.isArray(v.posts)?v.posts:(v&&Array.isArray(v.list)?v.list:(v&&Array.isArray(v.items)?v.items:[])));}catch(_e){return []}}
    var raw=[].concat(Array.isArray(ALL_POSTS)?ALL_POSTS:[],readArr('HAPPYAD_GLOBAL_POSTS_CACHE_V1'),readArr('HAPPYAD_PUBLISH_POSTS_V2'),readArr('HAPPYAD_HOME_POSTS_CACHE_V1'),readArr('HAPPYAD_ALL_POSTS_V1'),readArr('HAPPYAD_VIDEO_CACHE_STABLE_V1'));
    var seen={};
    function looksVideo(p){try{return typeof isVideo==='function'?isVideo(p):String(p&&((p.kind||p.type||p.mediaType||p.media_type||''))).toLowerCase().indexOf('video')>=0}catch(_e){return false}}
    var source=raw.filter(function(p){var id=String(p&&p.id||p&&p.post_id||'');if(!p||!id||seen[id]||!looksVideo(p)||p.deleted_at||p.deletedAt)return false;seen[id]=1;return true;});
    var target=source.find(function(p){return String(p&&p.id||p&&p.post_id||'')===String(postId);})||null;
    function slim(p){
      var media=p.mediaUrl||p.media_url||p.homeMediaUrl||p.home_media_url||p.videoUrl||p.video_url||p.url||p.src||'';
      var poster=p.posterUrl||p.poster_url||p.thumbnailUrl||p.thumbnail_url||p.coverUrl||p.cover_url||p.imageUrl||p.image_url||p.photoUrl||p.photo_url||'';
      try{if(!poster&&typeof happyadGetCachedVideoThumb==='function')poster=happyadGetCachedVideoThumb(p,media)||'';}catch(_thumb){}
      return {
      id:p.id||p.post_id, post_id:p.post_id||p.id, title:p.title||'Vidéo HAPPYAD', desc:p.desc||p.description||'', description:p.description||p.desc||'',
      kind:p.kind||p.type||p.mediaType||p.media_type||'video', type:p.type||p.kind||p.media_type||'video', mediaType:p.mediaType||p.media_type||p.kind||p.type||'video', media_type:p.media_type||p.mediaType||'video',
      mediaUrl:media, media_url:p.media_url||p.mediaUrl||p.home_media_url||p.homeMediaUrl||p.video_url||p.videoUrl||p.url||p.src||'',
      mediaPath:p.mediaPath||p.media_path||'', media_path:p.media_path||p.mediaPath||'',
      homeMediaUrl:p.homeMediaUrl||p.home_media_url||p.mediaUrl||p.media_url||'', home_media_url:p.home_media_url||p.homeMediaUrl||p.media_url||p.mediaUrl||'',
      videoUrl:p.videoUrl||p.video_url||p.mediaUrl||p.media_url||'', video_url:p.video_url||p.videoUrl||p.media_url||p.mediaUrl||'',
      posterUrl:poster, poster_url:poster||p.poster_url||p.posterUrl||'', thumbnailUrl:poster||p.thumbnailUrl||p.thumbnail_url||p.posterUrl||p.poster_url||'', thumbnail_url:poster||p.thumbnail_url||p.thumbnailUrl||p.poster_url||p.posterUrl||'', cachedThumb:poster, cached_thumb:poster,
      creatorId:p.creatorId||p.user_id||p.userId||'', user_id:p.user_id||p.creatorId||'', creatorName:p.creatorName||p.display_name||p.userName||p.author||p.name||'', display_name:p.display_name||p.creatorName||'',
      avatar:p.avatar||p.avatar_url||'', avatar_url:p.avatar_url||p.avatar||'', handle:p.handle||p.username||'', username:p.username||p.handle||'', badge:p.badge||p.userBadge||p.user_badge||'aucun',
      createdAt:p.createdAt||p.created_at||Date.now(), created_at:p.created_at||p.createdAt||Date.now(), views_count:p.views_count||p.video_views_count||0, video_views_count:p.video_views_count||p.views_count||0,
      __from_video:'1'
    };}
    var minimal=source.slice(0,120).map(slim);
    if(target && !minimal.some(function(p){return String(p.id)===String(target.id||target.post_id)})) minimal.unshift(slim(target));
    else if(target){minimal=minimal.filter(function(p){return String(p.id)!==String(target.id||target.post_id)});minimal.unshift(slim(target));}
    var fastPayload=JSON.stringify({ts:Date.now(), postId:String(postId||''), list:minimal, target:target?slim(target):null});
    sessionStorage.setItem('HAPPYAD_FAST_OPEN_VIDEO_V1', fastPayload);
    localStorage.setItem('HAPPYAD_FAST_OPEN_VIDEO_V1', fastPayload);
    try{localStorage.setItem('HAPPYAD_VIDEO_CACHE_STABLE_V1',JSON.stringify(minimal));}catch(_stableVideoCache){}
  }catch(_e){}
}

async function happyadMarkVideoViewFromHome(id){try{const c=happyadSb();const u=await happyadAuthUser();if(!c||!u||!id)return;const r=await c.from('happyad_video_views').upsert({post_id:String(id),viewer_id:u.id,viewed_at:new Date().toISOString()},{onConflict:'post_id,viewer_id'}).select('id').maybeSingle();if(r&&r.error)throw r.error;const vc=await c.from('happyad_video_views').select('id',{count:'exact',head:true}).eq('post_id',String(id));const a=getA(id);a.views=Number((vc&&!vc.error&&vc.count)||a.views||0);setA(id,a);refreshLikeEverywhere(id);try{await c.from('happyad_posts').update({views_count:Number(a.views||0)}).eq('id',String(id));localStorage.setItem('HAPPYAD_ACTION_FAST_SYNC_V1',JSON.stringify({id:String(id),t:Date.now(),type:'view'}));}catch(_e){}}catch(e){console.warn('home video view mark',e)}}
function happyadVideoCardClickFeedback(id){
  try{document.querySelectorAll('.bottom .nav').forEach(function(n){n.classList.remove('active','happyadTapOrange','happyadBottomPressedV504','happyadVideoOpeningV16R');});}catch(_b){}
  try{var safe=(window.CSS&&CSS.escape)?CSS.escape(String(id)):String(id).replace(/[^a-zA-Z0-9_-]/g,'\\$&');var card=document.querySelector('[data-post-id="'+safe+'"]');if(card){card.classList.add('happyadVideoCardOpeningV16R');clearTimeout(card.__happyadVideoOpenT);card.__happyadVideoOpenT=setTimeout(function(){try{card.classList.remove('happyadVideoCardOpeningV16R');}catch(_e){}},520);}}catch(_c){}
}
function openLongVideo(id){
  try{
    var t=Date.now?Date.now():(new Date()).getTime();
    if(window.HappyNavigation&&typeof window.HappyNavigation.isBusy==='function'&&window.HappyNavigation.isBusy())return false;
    if(openLongVideo.__happyadLastOpenV16U && (t-openLongVideo.__happyadLastOpenV16U.t)<1200)return false;
    openLongVideo.__happyadLastOpenV16U={id:String(id||''),t:t};
  }catch(_lock){}
  try{happyadVideoCardClickFeedback(id)}catch(_fb){}
  try{happyadVideoFastOpenPayload(id)}catch(_fast){}
  try{setTimeout(function(){try{happyadMarkVideoViewFromHome(id)}catch(e){}},240)}catch(e){}
  if(window.happyadOpenInternalUrlV492){window.happyadOpenInternalUrlV492('modules/video.html?post='+encodeURIComponent(id),{source:'home-video-card-v16u'});}else{location.href='modules/video.html?post='+encodeURIComponent(id)}
  return false;
}
function openLongPhoto(id){
  /* V466 — Accueil photo: centrale photo en pause.
     Un clic sur une photo ouvre maintenant un plein écran léger dans l'accueil. */
  try{happyadPhotoFastOpenPayload(id)}catch(_e){}
  try{
    if(typeof happyadOpenHomePhotoFullscreen==='function'){
      happyadOpenHomePhotoFullscreen(id);
      return;
    }
  }catch(_fs){}
  location.href='modules/photo.html?post='+encodeURIComponent(id)
}
function happyadCropStyle(p){
  var c=p&&(p.imageCrop||p.image_crop);
  if(typeof c==='string'){try{c=JSON.parse(c)}catch(e){c=null}}
  if(!c||String(p&&p.kind||'').toLowerCase().indexOf('video')>=0)return '';
  var scale=Math.max(1,Math.min(2.8,Number(c.scale||1)));
  var x=Math.max(-45,Math.min(45,Number(c.x||0)));
  var y=Math.max(-45,Math.min(45,Number(c.y||0)));
  return ' class="happyadCropImg" style="transform:translate('+x+'%, '+y+'%) scale('+scale+')"';
}
function happyadVideoThumbCacheKey(p,url){return 'HAPPYAD_VIDEO_THUMB_V1_'+String((p&&p.id)||url||'').replace(/[^a-zA-Z0-9_-]/g,'_').slice(0,120)}
function happyadGetCachedVideoThumb(p,url){try{return localStorage.getItem(happyadVideoThumbCacheKey(p,url))||''}catch(_e){return ''}}
function happyadSaveCachedVideoThumb(p,url,data){try{if(data&&String(data).indexOf('data:image/')===0)localStorage.setItem(happyadVideoThumbCacheKey(p,url),data)}catch(_e){}}
function happyadCaptureVideoThumb(v,p,url){
  try{
    if(!v||!v.videoWidth||!v.videoHeight)return;
    if(happyadGetCachedVideoThumb(p,url))return;
    const c=document.createElement('canvas');
    const size=520;
    c.width=size; c.height=size;
    const ctx=c.getContext('2d'); if(!ctx)return;
    const sw=v.videoWidth, sh=v.videoHeight;
    const side=Math.min(sw,sh);
    const sx=Math.max(0,(sw-side)/2), sy=Math.max(0,(sh-side)/2);
    ctx.drawImage(v,sx,sy,side,side,0,0,size,size);
    happyadSaveCachedVideoThumb(p,url,c.toDataURL('image/jpeg',0.76));
  }catch(_e){}
}
function happyadVideoPosterUrl(p,url){
  p=p||{};
  return p.posterUrl||p.poster_url||p.thumbnailUrl||p.thumbnail_url||p.thumbUrl||p.thumb_url||p.coverUrl||p.cover_url||p.previewUrl||p.preview_url||p.imageUrl||p.image_url||happyadGetCachedVideoThumb(p,url)||'';
}
function renderHomeVideoPreview(box,p,url){
  const poster=happyadVideoPosterUrl(p,url);
  /* HAPPYAD V465: accueil fluide = image/poster seulement.
     Ne jamais créer <video> dans les cartes d'accueil: Chrome/Supabase commence
     à charger les MP4 avant ouverture centrale et cela ralentit tout le scroll. */
  if(poster){
    box.innerHTML='<img loading="eager" fetchpriority="high" decoding="async" src="'+esc(poster)+'" alt="" class="happyadVideoPoster"><div class="play">▶</div>';
  }else{
    box.innerHTML='<div class="happyadVideoFallback">▶</div><div class="play">▶</div>';
  }
  /* HAPPYAD V217: le rendu média remplace innerHTML, donc il supprimait le compteur vues ajouté par createCard().
     On recrée le badge APRÈS le poster pour qu'il soit visible aussi dans l'accueil. */
  try{
    var vb=document.createElement('div');
    vb.className='happyadVideoViewsBadge';
    var a=(typeof getA==='function')?getA(p&&p.id):{};
    vb.textContent=(typeof happyadFmtViews==='function')?happyadFmtViews((a&&a.views)||p.views_count||p.video_views_count||0):String((a&&a.views)||p.views_count||p.video_views_count||0);
    box.appendChild(vb);
  }catch(_viewsBadge){}
}

async function happyadMediaUrlForPost(p){
  try{
    if(p&&p.mediaUrl)return p.mediaUrl;
    if(p&&p.media_url)return p.media_url;
    if(p&&p.imageUrl)return p.imageUrl;
    if(p&&p.image_url)return p.image_url;
    var m=await getMedia(p.id);
    if(m&&m.blob)return URL.createObjectURL(m.blob);
  }catch(e){}
  return '';
}

function happyadCssUrlV466(url){
  try{return 'url("'+String(url||'').replace(/\\/g,'\\\\').replace(/"/g,'\\"')+'")';}catch(e){return 'none'}
}
function happyadSetPhotoBgV466(el,url){
  try{if(el&&url)el.style.setProperty('--ha-photo-bg',happyadCssUrlV466(url));}catch(e){}
}
function happyadApplyHomePhotoRatioV467(box,img){
  try{
    if(!box||!img)return;
    function apply(){
      var w=Number(img.naturalWidth||0),h=Number(img.naturalHeight||0);
      box.classList.remove('haPhotoTall','haPhotoSquare','haPhotoWide','haPhotoPanorama');
      if(!w||!h){box.classList.add('haPhotoTall');return;}
      var r=w/h;
      if(r<.72)box.classList.add('haPhotoTall');
      else if(r<1.15)box.classList.add('haPhotoSquare');
      else if(r<1.55)box.classList.add('haPhotoWide');
      else box.classList.add('haPhotoPanorama');
    }
    if(img.complete&&img.naturalWidth)apply();
    else img.addEventListener('load',apply,{once:true});
  }catch(e){}
}
function happyadAlbumGridClassV467(total){
  total=Number(total||0)||0;
  if(total<=2)return 'happyadAlbumCount2';
  if(total===3)return 'happyadAlbumCount3';
  return 'happyadAlbumCount4';
}
function happyadPhotoRatioClassFromImgV468(img){
  try{
    var w=Number(img&&img.naturalWidth||0),h=Number(img&&img.naturalHeight||0);
    if(!w||!h)return 'haPhotoTall';
    var r=w/h;
    if(r<.72)return 'haPhotoTall';
    if(r<1.15)return 'haPhotoSquare';
    if(r<1.55)return 'haPhotoWide';
    return 'haPhotoPanorama';
  }catch(e){return 'haPhotoTall'}
}
function happyadApplyAlbumSlideRatioV468(slide,img){
  try{
    var cls=happyadPhotoRatioClassFromImgV468(img);
    slide.classList.remove('haPhotoTall','haPhotoSquare','haPhotoWide','haPhotoPanorama');
    slide.classList.add(cls);
  }catch(e){}
}
function happyadFindHomePhotoPostV466(id){
  id=String(id||'').trim();
  var found=null;
  function scan(list){
    (list||[]).some(function(p){
      if(!p)return false;
      if(String(p.id||'')===id){found=p;return true;}
      var a=p.__albumItems||[];
      for(var i=0;i<a.length;i++){
        if(String(a[i]&&a[i].id||'')===id){found=Object.assign({},p,{__albumItems:a,__startAlbumIndex:i});return true;}
      }
      return false;
    });
  }
  try{scan(happyadGroupFeedPosts([...(ALL_POSTS||[])]));}catch(_g){}
  if(!found){try{scan(ALL_POSTS||[]);}catch(_a){}}
  if(!found){
    try{
      var caches=['HAPPYAD_GLOBAL_POSTS_CACHE_V1','HAPPYAD_PUBLISH_POSTS_V2'];
      for(var c=0;c<caches.length&&!found;c++)scan(JSON.parse(localStorage.getItem(caches[c])||'[]')||[]);
    }catch(_c){}
  }
  return found;
}
function happyadEnsureHomePhotoFullscreenV466(){
  var box=document.getElementById('happyadHomePhotoFullscreen');
  if(box)return box;
  box=document.createElement('div');
  box.id='happyadHomePhotoFullscreen';
  box.innerHTML='<div class="haHomeFsCard"><button class="haHomeFsClose" type="button">‹</button><div class="haHomeFsTop"><div class="haHomeFsAvatar"></div><div class="haHomeFsInfo"><b></b><span></span></div><div class="haHomeFsCount"></div></div><div class="haHomeFsMedia"><div class="haHomeFsBg"></div><div class="haHomeFsLoading">Chargement...</div><img alt=""></div><button class="haHomeFsNav haHomeFsPrev" type="button">‹</button><button class="haHomeFsNav haHomeFsNext" type="button">›</button><div class="haHomeFsCaption"></div></div>';
  document.body.appendChild(box);
  return box;
}
function happyadRenderHomeFsCaptionV468(cap,it){
  try{
    var title=String((it&&(it.title||it.name))||'Publication HAPPYAD').trim();
    var raw=String((it&&(it.desc||it.description||it.caption))||'').trim();
    if(raw===title)raw='';
    var expanded=cap.dataset.expanded==='1';
    var long=raw.length>128;
    var shown=(!long||expanded)?raw:(raw.slice(0,128).trim()+'...');
    cap.innerHTML='<div class="haHomeFsTitle">'+esc(title||'Publication HAPPYAD')+'</div>'+(shown?'<div class="haHomeFsDesc">'+esc(shown)+'</div>':'')+(long?'<button class="haHomeFsSeeMore" type="button">'+(expanded?'Réduire':'Voir plus')+'</button>':'');
    var btn=cap.querySelector('.haHomeFsSeeMore');
    if(btn)btn.onclick=function(e){e.preventDefault();e.stopPropagation();cap.dataset.expanded=expanded?'0':'1';happyadRenderHomeFsCaptionV468(cap,it);return false;};
  }catch(e){cap.textContent=String((it&&(it.desc||it.description||it.caption||it.title))||'').trim()}
}
async function happyadOpenHomePhotoFullscreen(id){
  var p=happyadFindHomePhotoPostV466(id)||{id:id,title:'Publication HAPPYAD'};
  var items=(p&&p.__albumItems&&p.__albumItems.length)?p.__albumItems:[p];
  var idx=Number(p.__startAlbumIndex||0)||0;
  var box=happyadEnsureHomePhotoFullscreenV466();
  var card=box.querySelector('.haHomeFsCard');
  var img=box.querySelector('.haHomeFsMedia img');
  var bg=box.querySelector('.haHomeFsBg');
  var loading=box.querySelector('.haHomeFsLoading');
  var count=box.querySelector('.haHomeFsCount');
  var cap=box.querySelector('.haHomeFsCaption');
  var prev=box.querySelector('.haHomeFsPrev');
  var next=box.querySelector('.haHomeFsNext');
  var close=box.querySelector('.haHomeFsClose');
  var av=box.querySelector('.haHomeFsAvatar');
  var nm=box.querySelector('.haHomeFsInfo b');
  var sub=box.querySelector('.haHomeFsInfo span');
  function closeFs(){
    box.classList.remove('on');
    document.body.classList.remove('haHomePhotoFsLock');
    try{img.removeAttribute('src');bg.style.backgroundImage='none';}catch(_e){}
  }
  async function show(i){
    idx=Math.max(0,Math.min(items.length-1,Number(i)||0));
    var it=items[idx]||p;
    var owner=postOwnerData(it||p)||{};
    nm.innerHTML='<span class="haHomeFsNameText">'+esc(owner.name||'Utilisateur HAPPYAD')+'</span>'+badgeMarkHtml(owner.badge||'');
    sub.textContent=happyadTimeAgo(happyadPostTimestamp(it||p));
    av.innerHTML=owner.avatar?'<img src="'+esc(owner.avatar)+'" alt="">':esc(initials(owner.name||'H'));
    count.textContent=items.length>1?(idx+1)+'/'+items.length:'';
    prev.style.display=items.length>1?'grid':'none';
    next.style.display=items.length>1?'grid':'none';
    cap.dataset.expanded='0';
    happyadRenderHomeFsCaptionV468(cap,it);
    loading.textContent='Chargement...';
    loading.style.display='block';
    img.style.opacity='0';
    var url=await happyadMediaUrlForPost(it);
    if(url){
      bg.style.backgroundImage=happyadCssUrlV466(url);
      img.onload=function(){img.style.opacity='1';loading.style.display='none';};
      img.onerror=function(){loading.textContent='Média introuvable';};
      img.src=url;
    }else{
      img.removeAttribute('src');
      bg.style.backgroundImage='none';
      loading.textContent='Média introuvable';
    }
  }
  close.onclick=function(e){e.preventDefault();e.stopPropagation();closeFs();return false;};
  box.onclick=function(e){if(e.target===box)closeFs();};
  prev.onclick=function(e){e.preventDefault();e.stopPropagation();show(idx-1);return false;};
  next.onclick=function(e){e.preventDefault();e.stopPropagation();show(idx+1);return false;};
  var sx=0,sy=0;
  card.ontouchstart=function(e){var t=e.touches&&e.touches[0];if(t){sx=t.clientX;sy=t.clientY;}};
  card.ontouchend=function(e){var t=e.changedTouches&&e.changedTouches[0];if(!t)return;var dx=t.clientX-sx,dy=t.clientY-sy;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)+12){show(idx+(dx<0?1:-1));}};
  document.body.classList.add('haHomePhotoFsLock');
  box.classList.add('on');
  show(idx);
}

function happyadInstallAlbumOneByOneScrollV472(track,dots){
  try{
    if(!track)return;
    if(track.__haNativeAlbumScrollV474)return;
    track.__haNativeAlbumScrollV474=true;
    function slides(){return [].slice.call(track.querySelectorAll('.haAlbumFullSlide'));}
    function nearestIndex(){
      var a=slides();if(!a.length)return 0;
      var center=track.scrollLeft+(track.clientWidth/2),best=0,bd=1e9;
      a.forEach(function(sl,i){
        var c=sl.offsetLeft+(sl.offsetWidth/2),d=Math.abs(c-center);
        if(d<bd){bd=d;best=i;}
      });
      return best;
    }
    function updateDots(i){
      try{
        if(!dots)return;
        [].slice.call(dots.children).forEach(function(d,k){d.classList.toggle('on',k===i);});
      }catch(_e){}
    }
    var raf=0;
    track.addEventListener('scroll',function(){
      if(raf)return;
      raf=requestAnimationFrame(function(){
        raf=0;
        var i=nearestIndex();
        track.__haAlbumCurrentIndexV472=i;
        updateDots(i);
      });
    },{passive:true});
  }catch(e){console.warn('album native scroll',e)}
}
async function hydrateAlbumMedia(card,p){
  try{
    if(!card||!p)return;
    var items=(p&&p.__albumItems)||[];
    if(!items.length)items=[p];
    if(items.length<=1)return;
    card.classList.add('haAlbumFullPagerCard');
    card.dataset.mediaReady='1';
    var owner=postOwnerData(p)||{};
    var name=owner.name||'Utilisateur HAPPYAD';
    var av=owner.avatar?'<img src="'+esc(owner.avatar)+'" alt="">':esc(initials(name));
    var ago=happyadTimeAgo(happyadPostTimestamp(p));
    function actionHtml(){return '<div class="miniActions"><button class="actionBtn" data-card-act="like"><span class="haLineIcon haLikeIcon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M20.8 4.6c-1.9-1.7-4.9-1.5-6.6.5L12 7.6 9.8 5.1C8.1 3.1 5.1 2.9 3.2 4.6 1.1 6.5 1 9.7 3 11.7l9 8.6 9-8.6c2-2 1.9-5.2-.2-7.1z"/></svg></span><small>0</small></button><button class="actionBtn" data-card-act="comment"><span class="haLineIcon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M21 11.5a8.5 8.5 0 0 1-9 8.5 9.6 9.6 0 0 1-4-.9L3 20l1.1-4.2A8.3 8.3 0 0 1 3 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5z"/></svg></span><small>0</small></button><button class="actionBtn" data-card-act="share"><span class="haLineIcon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v14"/></svg></span><small>0</small></button><button class="actionBtn" data-card-act="repost"><span class="haLineIcon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg></span><small>0</small></button><button class="actionBtn fav" data-card-act="fav"><span class="haLineIcon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/></svg></span><small>0</small></button></div>';}
    function bodyHtml(it){
      it=it||p;
      var title=String(it.title||p.title||'Publication HAPPYAD').trim();
      var raw=String(it.desc||it.description||it.caption||p.desc||p.description||'').trim();
      var desc=(raw&&raw!==title)?raw:'';
      var meta=String(it.location||p.location||it.category||p.category||'Publication').trim();
      var price=String(it.price||p.price||'').trim();
      var long=desc.length>96;
      return '<div class="miniBody"><div class="miniTitleRow"><div class="miniTitle">'+esc(title||'Publication HAPPYAD')+'</div></div>'+(desc?'<div class="miniDesc" data-album-desc-full="'+esc(desc)+'" data-album-desc-short="'+esc(long?(desc.slice(0,96).trim()+'...'):desc)+'">'+esc(long?(desc.slice(0,96).trim()+'...'):desc)+'</div>':'')+(long?'<button class="miniSeeMore" data-album-more type="button">Voir plus</button>':'')+'<div class="miniMeta">'+esc(meta||'Publication')+'</div>'+(price?'<div class="miniPrice">'+esc(price)+'</div>':'')+'</div>';
    }
    card.innerHTML='<div class="haAlbumFullScroller"><div class="haAlbumFullTrack"></div></div><div class="haAlbumFixedBar">'+actionHtml()+'</div><div class="haAlbumFullDots"></div>';
    var track=card.querySelector('.haAlbumFullTrack');
    var dots=card.querySelector('.haAlbumFullDots');
    items.forEach(function(it,i){
      it=it||p;
      var slide=document.createElement('div');
      slide.className='haAlbumFullSlide';
      slide.dataset.albumIndex=String(i);
      slide.dataset.albumPostId=String((it&&it.id)||p.id);
      slide.innerHTML='<div class="miniCardFrame"><div class="miniTop"><div class="avatar">'+av+'</div><div class="creator"><b>'+esc(name)+badgeMarkHtml(owner.badge)+'</b><span>'+esc(p.location||'HAPPYAD')+'</span></div><div class="miniPostDate">'+esc(ago)+'</div></div><div class="miniMedia haAlbumSingleMedia"><div class="happyadAlbumLoading">Chargement...</div><div class="happyadAlbumBadge">▧ '+(i+1)+'</div></div>'+bodyHtml(it)+'</div>';
      track.appendChild(slide);
      if(dots){var d=document.createElement('span');if(i===0)d.className='on';dots.appendChild(d);}
      (async function(slide,it){
        var media=slide.querySelector('.haAlbumSingleMedia');
        try{
          var url=await happyadMediaUrlForPost(it);
          if(!url){media.innerHTML='<div class="happyadAlbumLoading">Média introuvable</div>';return;}
          var im=document.createElement('img');
          im.loading='eager';im.fetchPriority='high';im.decoding='async';im.alt='';
          im.onload=function(){
            try{
              var cls=happyadPhotoRatioClassFromImgV468(im);
              media.classList.remove('haPhotoTall','haPhotoSquare','haPhotoWide','haPhotoPanorama');
              media.classList.add(cls);
            }catch(_r){}
          };
          im.src=url;
          media.innerHTML='<div class="happyadAlbumBadge">▧ '+(i+1)+'</div>';
          media.insertBefore(im,media.firstChild);
        }catch(e){media.innerHTML='<div class="happyadAlbumLoading">Erreur média</div>';}
      })(slide,it);
    });
    try{
      track.addEventListener('scroll',function(){
        if(!dots)return;
        var slides=[].slice.call(track.querySelectorAll('.haAlbumFullSlide'));
        if(!slides.length)return;
        var center=track.scrollLeft+(track.clientWidth/2),best=0,bd=1e9;
        slides.forEach(function(sl,i){var c=sl.offsetLeft+(sl.offsetWidth/2);var d=Math.abs(c-center);if(d<bd){bd=d;best=i;}});
        [].slice.call(dots.children).forEach(function(d,i){d.classList.toggle('on',i===best)});
      },{passive:true});
    }catch(_s){}
    try{happyadInstallAlbumOneByOneScrollV472(track,dots);}catch(_oneByOne){}
    card.addEventListener('click',function(e){
      if(track&&track.__haAlbumSwipeUntilV472&&Date.now()<track.__haAlbumSwipeUntilV472){e.preventDefault();e.stopPropagation();return false;}
      var t=e.target;
      /* V16: sur les cartes groupées, le header/avatar/nom doit ouvrir le profil.
         On laisse donc .miniTop remonter vers son onclick profil, au lieu de l'intercepter comme clic photo. */
      if(t&&t.closest&&t.closest('.miniTop'))return;
      if(t&&t.closest&&t.closest('[data-card-act],[data-home-buy],.miniSeeMore,button,a'))return;
      var slide=t&&t.closest?t.closest('.haAlbumFullSlide'):null;
      if(!slide)return;
      e.preventDefault();e.stopPropagation();
      var idx=Number(slide.dataset.albumIndex||0)||0;
      var pid=slide.dataset.albumPostId||((items[idx]||{}).id)||p.id;
      if(typeof happyadOpenHomePhotoFullscreen==='function')happyadOpenHomePhotoFullscreen(pid);
      return false;
    },true);
    card.querySelectorAll('[data-album-more]').forEach(function(btn){
      btn.onclick=function(e){
        e.preventDefault();e.stopPropagation();
        var body=btn.closest('.miniBody'),d=body&&body.querySelector('.miniDesc[data-album-desc-full]');
        if(!d)return false;
        var on=d.dataset.expanded==='1';
        d.dataset.expanded=on?'0':'1';
        d.textContent=on?d.dataset.albumDescShort:d.dataset.albumDescFull;
        btn.textContent=on?'Voir plus':'Réduire';
        return false;
      };
    });
    try{card.querySelectorAll('.miniTop').forEach(function(tp){tp.onclick=function(e){e.preventDefault();e.stopPropagation();return happyadOpenPublicProfileFromPostV417(p);};});}catch(_hp){}
    bindAction(card,p,p.title||'Publication HAPPYAD');
    refreshCardAction(card,p.id);
  }catch(e){console.warn('album full pager',e)}
}

async function hydrateMedia(card,p,video){
  try{
    const box=card.querySelector('.miniMedia');
    if(!box||card.dataset.mediaReady==='1')return;
    card.dataset.mediaReady='1';
    if(!video && p && p.__albumCount && Number(p.__albumCount)>1){await hydrateAlbumMedia(card,p);return;}
    if(p.mediaUrl){
      if(video){renderHomeVideoPreview(box,p,p.mediaUrl);}else{
        happyadSetPhotoBgV466(box,p.mediaUrl);
        box.innerHTML='<img loading="eager" fetchpriority="high" decoding="async" src="'+esc(p.mediaUrl)+'" alt=""'+happyadCropStyle(p)+'>';
        happyadApplyHomePhotoRatioV467(box,box.querySelector('img'));
      }
      return;
    }
    const media=await getMedia(p.id);
    if(media&&media.blob){
      const url=URL.createObjectURL(media.blob);
      if(video){renderHomeVideoPreview(box,p,url);}else{
        happyadSetPhotoBgV466(box,url);
        box.innerHTML='<img loading="eager" fetchpriority="high" decoding="async" src="'+url+'" alt=""'+happyadCropStyle(p)+'>';
        happyadApplyHomePhotoRatioV467(box,box.querySelector('img'));
      }
    }else box.innerHTML=video?'<div class="happyadVideoFallback">▶</div>':'<div style="color:#aeb3c0;font-size:12px">Média introuvable</div>';
  }catch(e){
    const box=card&&card.querySelector?card.querySelector('.miniMedia'):null;
    if(box)box.innerHTML=video?'<div class="happyadVideoFallback">▶</div>':'<div style="color:#aeb3c0;font-size:12px">Erreur média</div>';
  }
}

function stopHomeCardVideo(card){try{const v=card&&card.querySelector&&card.querySelector('video');if(v){if(v.__tuHandler)v.removeEventListener('timeupdate',v.__tuHandler);v.pause();/* HAPPYAD FIX: garder le src + mediaReady pour éviter écran noir/clignotement au retour accueil */}}catch(e){}}
let HAPPYAD_HOME_CARD_IO=null;
function observeHomeCard(card,p,video){
  refreshCardAction(card,p.id);
  bindAction(card,p,p.title||'Publication HAPPYAD');
  registerLikeCard(card,p);
  /* V204: pré-hydratation immédiate des premières cartes visibles.
     L'utilisateur voit directement le média/preview sans attendre le callback IntersectionObserver. */
  const already=document.querySelectorAll('#list .miniCard').length;
  if(already<8){setTimeout(function(){hydrateMedia(card,p,video);},0);}
  if(!('IntersectionObserver' in window)){hydrateMedia(card,p,video);refreshContentLikeFromSupabase(card,p);return;}
  if(!HAPPYAD_HOME_CARD_IO){
    HAPPYAD_HOME_CARD_IO=new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        const c=en.target;const pp=c.__happyadPost;const vv=!!c.__happyadVideo;
        if(en.isIntersecting&&en.intersectionRatio>0.05){
          hydrateMedia(c,pp,vv);
          if(!c.dataset.actionsReady){c.dataset.actionsReady='1';refreshContentLikeFromSupabase(c,pp);}
        }else if(vv){stopHomeCardVideo(c);/* ne pas vider mediaReady: la carte reste hydratée et stable */}
      });
    },{root:null,rootMargin:'900px 0px',threshold:[0,0.05,0.18,0.65]});
  }
  card.__happyadPost=p;card.__happyadVideo=video;HAPPYAD_HOME_CARD_IO.observe(card);
}


const HAPPYAD_SPONSOR_CACHE='HAPPYAD_SPONSOR_MEDIA_CACHE_V1';
async function happyadSponsorCachedUrl(rawUrl){
  if(!rawUrl)return '';
  if(!('caches' in window)||!window.fetch)return rawUrl;
  try{
    const cache=await caches.open(HAPPYAD_SPONSOR_CACHE);
    let res=await cache.match(rawUrl);
    if(!res){
      res=await fetch(rawUrl,{mode:'cors',cache:'force-cache'});
      if(res&&res.ok){
        await cache.put(rawUrl,res.clone());
      }else{
        return rawUrl;
      }
    }
    const blob=await res.blob();
    return URL.createObjectURL(blob);
  }catch(e){
    return rawUrl;
  }
}
function happyadSponsorLoop5s(v){
  const _tu3=()=>{if(v.currentTime>=10)v.currentTime=0;};
  v.__tuHandler=_tu3;
  v.addEventListener('timeupdate',_tu3);
  v.play().catch(()=>{});
}
async function hydrateSponsorItem(el,p){
  try{
    const box=el.querySelector('.sponsorThumb');
    if(p.mediaUrl){
      const cachedUrl=await happyadSponsorCachedUrl(p.mediaUrl);
      if(isVideo(p)){
        box.innerHTML='<video src="'+esc(cachedUrl)+'" muted autoplay loop playsinline preload="metadata"></video>';
        happyadSponsorLoop5s(box.querySelector('video'));
      }else{
        box.innerHTML='<img src="'+esc(cachedUrl)+'" alt="">';
      }
      return;
    }
    const media=await getMedia(p.id);
    if(media&&media.blob){
      const url=URL.createObjectURL(media.blob);
      if(isVideo(p)){
        box.innerHTML='<video src="'+url+'" muted autoplay loop playsinline preload="metadata"></video>';
        happyadSponsorLoop5s(box.querySelector('video'));
      }else{
        box.innerHTML='<img src="'+url+'" alt="">';
      }
    }else{
      box.textContent=isVideo(p)?'🎥':'🖼️';
    }
  }catch(e){
    el.querySelector('.sponsorThumb').textContent='★';
  }
}
function sponsorKind(p){if(isVideo(p))return 'Vidéo'; const c=catOf(p); if(c==='Produit')return 'Produit'; if(c==='Service')return 'Service'; if(c==='Événement')return 'Lieu'; return 'Photo';}
let sponsorTimer=null,sponsorIndex=0;
const HAPPYAD_SPONSOR_STATE_KEY='HAPPYAD_SPONSOR_ROTATION_STATE_V1';
const HAPPYAD_SPONSOR_SELECTED_KEY='HAPPYAD_SPONSOR_SELECTED_POST_IDS_V1';
const HAPPYAD_SPONSOR_ADMIN_LIMIT_KEY='HAPPYAD_ADMIN_SPONSOR_LIMIT_V1';
let happyadSponsorDisplayToken=0;
function happyadSponsorReadJson(key,fallback){try{var v=JSON.parse(localStorage.getItem(key)||'');return v==null?fallback:v}catch(e){return fallback}}
function happyadSponsorPostId(p){return String((p&&p.id)||(p&&p.post_id)||(p&&p.source_id)||'').trim()}
function happyadSponsorIsDeleted(p){try{var id=happyadSponsorPostId(p);var del=JSON.parse(localStorage.getItem('HAPPYAD_DELETED_POST_IDS_V1')||'[]').map(String);return !id||del.indexOf(id)>=0||String(p&&p.deleted_at||'')!==''}catch(e){return !happyadSponsorPostId(p)}}
function happyadSponsorPrivate(p){p=p||{};var v=String(p.visibility||p.privacy||p.audience||p.status||'').toLowerCase();return p.is_private===true||p.private===true||v==='private'}
function happyadSponsorSourceItems(){
  var raw=[];
  function addArr(a){try{if(Array.isArray(a))raw=raw.concat(a);else if(a&&Array.isArray(a.posts))raw=raw.concat(a.posts);else if(a&&Array.isArray(a.data))raw=raw.concat(a.data)}catch(e){}}
  try{addArr(ALL_POSTS||[])}catch(e){}
  ['HAPPYAD_HOME_POSTS_CACHE_V1','HAPPYAD_ALL_POSTS_V1','HAPPYAD_GLOBAL_POSTS_CACHE_V1','HAPPYAD_PUBLISH_POSTS_V2','HAPPYAD_SEARCH_POSTS_FAST_CACHE_V1','HAPPYAD_HOME_BOOT_SNAPSHOT_V1'].forEach(function(k){addArr(happyadSponsorReadJson(k,[]));});
  var byId={},arr=[];
  raw.forEach(function(x){try{var p=(typeof mapHappyPost==='function'&&x&&x.created_at&&!x.createdAt)?mapHappyPost(x):x;var id=happyadSponsorPostId(p);if(!id||byId[id]||happyadSponsorIsDeleted(p)||happyadSponsorPrivate(p)||happyadIsStory(p))return;byId[id]=p;arr.push(p)}catch(e){}});
  try{arr=arr.sort(function(a,b){return happyadPostTimestamp(b)-happyadPostTimestamp(a)})}catch(e){}
  var selected=happyadSponsorReadJson(HAPPYAD_SPONSOR_SELECTED_KEY,[]);
  if(typeof selected==='string')selected=selected.split(/[ ,;|]+/).filter(Boolean);
  selected=(selected||[]).map(String).filter(Boolean);
  if(selected.length){var sel=[];selected.forEach(function(id){var p=byId[String(id)];if(p)sel.push(p)});if(sel.length)arr=sel;}
  var limit=Number(localStorage.getItem(HAPPYAD_SPONSOR_ADMIN_LIMIT_KEY)||0);
  if(isFinite(limit)&&limit>0)arr=arr.slice(0,Math.max(1,Math.floor(limit)));
  return arr;
}
function happyadSponsorLoadState(){var s=happyadSponsorReadJson(HAPPYAD_SPONSOR_STATE_KEY,{});return (s&&typeof s==='object')?s:{}}
function happyadSponsorSaveState(st){try{localStorage.setItem(HAPPYAD_SPONSOR_STATE_KEY,JSON.stringify(st||{}))}catch(e){}}
function happyadSponsorIndex(items){var len=(items||[]).length;if(!len)return 0;var st=happyadSponsorLoadState();var n=Number(st.cursor);if(!isFinite(n))n=Number(st.index||0);if(!isFinite(n))n=0;return ((Math.floor(n)%len)+len)%len}
function happyadSponsorStoreCurrent(index,p,items){
  try{
    var id=happyadSponsorPostId(p);if(!id)return;
    var len=(items||[]).length||1;
    index=((Number(index)||0)%len+len)%len;
    sponsorIndex=index;window.sponsorIndex=index;
    var token=++happyadSponsorDisplayToken;
    var old=happyadSponsorLoadState();
    happyadSponsorSaveState({cursor:((Number(old.cursor)||index)%len+len)%len,currentIndex:index,currentId:id,total:len,updatedAt:Date.now(),completedCycles:Number(old.completedCycles||0),adminLimit:Number(localStorage.getItem(HAPPYAD_SPONSOR_ADMIN_LIMIT_KEY)||0)||0,selectedCount:(happyadSponsorReadJson(HAPPYAD_SPONSOR_SELECTED_KEY,[])||[]).length||0});
    setTimeout(function(){
      try{
        if(token!==happyadSponsorDisplayToken)return;
        var ad=document.querySelector('#sponsorTrack .sponsorAd');
        if(ad&&String(ad.dataset.postId||'')!==id)return;
        var latest=happyadSponsorSourceItems();var l=latest.length||len;if(!l)return;
        var st=happyadSponsorLoadState();
        if(String(st.currentId||'')!==id||Number(st.currentIndex)!==index)return;
        var next=(index+1)%l;
        happyadSponsorSaveState({cursor:next,currentIndex:-1,currentId:'',total:l,updatedAt:Date.now(),completedCycles:Number(st.completedCycles||0)+(next===0?1:0),adminLimit:Number(localStorage.getItem(HAPPYAD_SPONSOR_ADMIN_LIMIT_KEY)||0)||0,selectedCount:(happyadSponsorReadJson(HAPPYAD_SPONSOR_SELECTED_KEY,[])||[]).length||0});
      }catch(e){}
    },2600);
  }catch(e){}
}
/* === HAPPYAD Radar fixe admin — V537 ===
   Si Admin publie une image fixe, on l'affiche ici et on évite la rotation vidéo/photo lourde.
   Si aucune image fixe n'est active, l'ancien renderSponsor continue normalement.
*/
const HAPPYAD_FIXED_RADAR_BUCKET='happyad-media';
const HAPPYAD_FIXED_RADAR_CONFIG_PATH='happyad-admin/radar-fixed-config.json';
const HAPPYAD_FIXED_RADAR_CACHE_KEY='HAPPYAD_FIXED_RADAR_PUBLIC_CONFIG_V1';
let happyadFixedRadarLoading=false;
let happyadFixedRadarLastCheck=0;
function happyadFixedRadarPublicUrl(path){
  try{
    const c=(typeof happyadSb==='function')?happyadSb():null;
    if(c&&c.storage&&c.storage.from){
      const r=c.storage.from(HAPPYAD_FIXED_RADAR_BUCKET).getPublicUrl(path);
      if(r&&r.data&&r.data.publicUrl)return r.data.publicUrl;
    }
  }catch(e){}
  const base=String(window.HAPPYAD_SUPABASE_URL||'https://txjjyhupbejgjcianrmr.supabase.co').replace(/\/+$/,'');
  return base+'/storage/v1/object/public/'+HAPPYAD_FIXED_RADAR_BUCKET+'/'+String(path).split('/').map(encodeURIComponent).join('/');
}
function happyadFixedRadarReadCache(){try{return JSON.parse(localStorage.getItem(HAPPYAD_FIXED_RADAR_CACHE_KEY)||'null')||null}catch(e){return null}}
function happyadFixedRadarSaveCache(cfg){try{localStorage.setItem(HAPPYAD_FIXED_RADAR_CACHE_KEY,JSON.stringify(cfg||{}))}catch(e){}}
function happyadFixedRadarActive(cfg){return !!(cfg&&cfg.active&&cfg.imageUrl&&String(cfg.imageUrl).trim())}
function happyadFixedRadarFallbackToSponsor(track){
  try{
    happyadFixedRadarSaveCache({active:false,type:'fixed_image',imageUrl:'',imagePath:'',version:Date.now(),fallback:true});
  }catch(_cache){}
  try{if(track){delete track.dataset.fixedRadar;try{track.removeAttribute('data-fixed-radar')}catch(_r){}}}catch(_d){}
  try{if(typeof happyadRenderDynamicSponsorOriginal==='function')setTimeout(function(){happyadRenderDynamicSponsorOriginal();},30);}catch(_render){}
}
function happyadApplyFixedRadar(track,cfg){
  try{
    if(!track||!happyadFixedRadarActive(cfg))return false;
    if(sponsorTimer){clearInterval(sponsorTimer);sponsorTimer=null;}
    try{track.querySelectorAll('video').forEach(function(v){try{v.pause();v.removeAttribute('src');v.load&&v.load();}catch(_v){}});}catch(_oldVideo){}
    const img=String(cfg.imageUrl||'');
    try{track.dataset.fixedRadar='1';}catch(_d){}
    track.innerHTML='<button class="sponsorAd happyadFixedRadarAd" type="button" data-fixed-radar="1" data-no-sponsor-post="1" aria-label="HAPPYAD Radar image fixe"><span class="sponsorThumb"><img loading="eager" fetchpriority="high" decoding="async" src="'+esc(img)+'" alt=""></span></button>';
    try{
      var im=track.querySelector('.happyadFixedRadarAd img');
      if(im){im.onerror=function(){happyadFixedRadarFallbackToSponsor(track)};}
    }catch(_errImg){}
    return true;
  }catch(e){return false}
}
function happyadFetchFixedRadar(track,afterInactive){
  try{
    const now=Date.now();
    if(happyadFixedRadarLoading||now-happyadFixedRadarLastCheck<45000)return;
    happyadFixedRadarLoading=true;happyadFixedRadarLastCheck=now;
    const url=happyadFixedRadarPublicUrl(HAPPYAD_FIXED_RADAR_CONFIG_PATH)+'?t='+Math.floor(now/60000);
    fetch(url,{cache:'no-store'}).then(function(res){if(!res.ok)throw new Error('no-config');return res.json();}).then(function(cfg){
      happyadFixedRadarSaveCache(cfg);
      if(happyadFixedRadarActive(cfg)){happyadApplyFixedRadar(track,cfg);}else{try{if(track){delete track.dataset.fixedRadar;try{track.removeAttribute('data-fixed-radar')}catch(_r){}}}catch(_d){}; if(typeof afterInactive==='function'){afterInactive();}else if(typeof happyadRenderDynamicSponsorOriginal==='function'){happyadRenderDynamicSponsorOriginal();}}
    }).catch(function(){try{if(track){delete track.dataset.fixedRadar;try{track.removeAttribute('data-fixed-radar')}catch(_r){}}}catch(_d){}; if(typeof afterInactive==='function')afterInactive(); else if(typeof happyadRenderDynamicSponsorOriginal==='function')happyadRenderDynamicSponsorOriginal();}).finally(function(){happyadFixedRadarLoading=false;});
  }catch(e){happyadFixedRadarLoading=false;if(typeof afterInactive==='function')afterInactive();}
}
function happyadTryFixedRadar(track,afterInactive){
  const cached=happyadFixedRadarReadCache();
  if(happyadFixedRadarActive(cached)){
    happyadApplyFixedRadar(track,cached);
    happyadFetchFixedRadar(track,afterInactive||function(){happyadRenderDynamicSponsorOriginal();});
    return true;
  }
  const now=Date.now();
  if(!cached || now-happyadFixedRadarLastCheck>45000){
    if(track){try{track.dataset.fixedRadar='1';}catch(_d){} track.innerHTML='<button class="sponsorAd happyadFixedRadarAd" type="button" data-fixed-radar="1" data-no-sponsor-post="1"><span class="sponsorThumb">★</span></button>';}
    happyadFetchFixedRadar(track,afterInactive);
    return true;
  }
  return false;
}
function happyadRenderDynamicSponsorOriginal(){
 const track=document.getElementById('sponsorTrack'); if(!track)return;
 try{delete track.dataset.fixedRadar;}catch(_d){try{track.removeAttribute('data-fixed-radar');}catch(_r){}}
 let items=happyadSponsorSourceItems();
 if(!items.length){
   track.innerHTML='<button class="sponsorAd" type="button"><span class="sponsorThumb">★</span></button>';
   return;
 }
 function show(i){
   items=happyadSponsorSourceItems();
   if(!items.length)return;
   i=((Number(i)||0)%items.length+items.length)%items.length;
   sponsorIndex=i;window.sponsorIndex=i;
   const p=items[i];
   track.innerHTML='';
   const el=document.createElement('button');
   el.type='button';
   el.className='sponsorAd';
   try{el.__happyadSponsorPost=p;if(p&&p.id)el.dataset.postId=String(p.id);}catch(_haSponsorStore){}
   const title=esc(p.title||p.caption||sponsorKind(p));
   const rawDesc = (
      p.description || p.desc || p.caption || p.text || p.content || p.body ||
      p.details || p.title || p.name || p.productName || p.serviceName || ''
   );
   const detail = esc(rawDesc);
   el.innerHTML='<span class="sponsorThumb"></span>';
   el.onclick=()=>{isVideo(p)?openLongVideo(p.id):openLongPhoto(p.id)};
   track.appendChild(el);
   happyadSponsorStoreCurrent(i,p,items);
   hydrateSponsorItem(el,p);
 }
 show(happyadSponsorIndex(items));
 if(sponsorTimer)clearInterval(sponsorTimer);
 sponsorTimer=setInterval(()=>{show(happyadSponsorIndex(happyadSponsorSourceItems()));},10000);
}
function renderSponsor(){
 const track=document.getElementById('sponsorTrack'); if(!track)return;
 if(happyadTryFixedRadar(track,function(){happyadRenderDynamicSponsorOriginal();}))return;
 happyadRenderDynamicSponsorOriginal();
}



function happyadCurrentUser(){try{return JSON.parse(localStorage.getItem('HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL')||'{}')}catch(e){return {}}}
function normHappyBadge(v){v=String(v||'aucun').toLowerCase();if(v==='bleu'||v==='blue')return 'bleu';if(v==='violet'||v==='jaune'||v==='yellow')return 'violet';return ''}
function badgeMarkHtml(v){v=normHappyBadge(v);return v?'<span class="happyBadgeMark '+v+'"></span>':''}
function postOwnerData(p){
  p = p || {};
  const u = happyadCurrentUser();

  const clean = function(v){
    return String(v == null ? '' : v).trim();
  };

  const pickUid = function(o){
    o = o || {};
    return clean(
      o.creatorId ||
      o.creator_id ||
      o.user_id ||
      o.userId ||
      o.ownerId ||
      o.owner_id ||
      o.author_id ||
      o.authorId ||
      o.profile_id ||
      o.profileId ||
      o.uid ||
      o.uuid ||
      ''
    );
  };

  const ownerId = pickUid(p);
  const meId = clean((u && (u.id || u.user_id || u.uid || u.uuid)) || localStorage.getItem('HAPPYAD_AUTH_UID') || '');

  let authorCache = {};
  try{
    authorCache = JSON.parse(localStorage.getItem('HAPPYAD_AUTHOR_PROFILE_CACHE_V1') || '{}') || {};
  }catch(e){
    authorCache = {};
  }

  const cached = ownerId ? (authorCache[ownerId] || {}) : {};

  const cleanBadge = function(v){
    v = clean(v);
    return (!v || v === 'aucun' || v === 'none' || v === 'null' || v === 'undefined') ? '' : v;
  };

  const ownerName = clean(
    p.creatorName ||
    p.display_name ||
    p.creator_name ||
    p.full_name ||
    p.userName ||
    p.user_name ||
    p.username ||
    p.author ||
    cached.name ||
    cached.full_name ||
    cached.display_name ||
    ''
  ) || 'Utilisateur HAPPYAD';

  const ownerAvatar = clean(
    p.avatar ||
    p.avatar_url ||
    p.avatarUrl ||
    p.userAvatar ||
    p.user_avatar ||
    p.creatorAvatar ||
    p.creator_avatar ||
    p.authorAvatar ||
    p.author_avatar ||
    p.profile_photo ||
    p.profile_picture ||
    cached.avatar ||
    cached.avatar_url ||
    ''
  );

  const same = !!(ownerId && meId && ownerId === meId);

  return {
    id: ownerId,
    user_id: ownerId,
    name: same ? (u.name || u.full_name || ownerName) : ownerName,
    full_name: same ? (u.full_name || u.name || ownerName) : ownerName,
    handle: clean(p.handle || p.username || cached.handle || cached.username || ''),
    username: clean(p.username || p.handle || cached.username || cached.handle || ''),
    avatar: same ? (u.avatar || u.avatar_url || ownerAvatar) : ownerAvatar,
    avatar_url: same ? (u.avatar_url || u.avatar || ownerAvatar) : ownerAvatar,
    badge: same ? (cleanBadge(u.badge) || cleanBadge(p.badge) || cleanBadge(p.userBadge) || cleanBadge(cached.badge)) : (cleanBadge(p.badge) || cleanBadge(p.userBadge) || cleanBadge(cached.badge)),
    __happyadUidLocked: true
  };
}


/* HAPPYAD V463 — profil visiteur: préchauffage cache profil/publications sans recréer au clic */
function happyadPublicProfileKeyV463(uid){return 'HAPPYAD_PUBLIC_PROFILE_STABLE_'+String(uid||'').trim();}
function happyadPublicProfilePostsKeyV463(uid){return 'HAPPYAD_PUBLIC_PROFILE_POSTS_'+String(uid||'').trim();}
function happyadReadJsonV463(k,d){try{var v=JSON.parse(localStorage.getItem(k)||'null');return v==null?d:v;}catch(e){return d;}}
function happyadWriteJsonV463(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function happyadCleanV463(v){return String(v==null?'':v).trim();}
function happyadUidOfV463(o){o=o||{};return happyadCleanV463(o.id||o.user_id||o.uid||o.uuid||o.creatorId||o.creator_id||o.ownerId||o.owner_id||o.userId||o.profile_id||o.profileId);}
function happyadNameOfV463(o){o=o||{};return happyadCleanV463(o.name||o.full_name||o.display_name||o.creatorName||o.creator_name||o.user_name||o.username)||'Utilisateur HAPPYAD';}
function happyadHandleOfV463(o){o=o||{};return happyadCleanV463(o.handle||o.username||o.user_name).replace(/^@+/,'');}
function happyadAvatarOfV463(o){
  o=o||{};
  return happyadCleanV463(o.avatar||o.avatar_url||o.avatarUrl||o.user_avatar||o.userAvatar||o.author_avatar||o.authorAvatar||o.actor_avatar||o.actorAvatar||o.creator_avatar||o.creatorAvatar||o.seller_avatar||o.sellerAvatar||o.photo_url||o.photoUrl||o.photoURL||o.photo||o.profile_photo||o.profilePhoto||o.profile_photo_url||o.profilePhotoUrl||o.profile_picture||o.profilePicture||o.profile_picture_url||o.profilePictureUrl||o.profile_pic||o.profilePic||o.profile_pic_url||o.profilePicUrl||o.picture||o.picture_url||o.pictureUrl||o.image||o.image_url||o.imageUrl||o.user_photo||o.userPhoto||o.user_photo_url||o.userPhotoUrl||o.avatar_image||o.avatarImage||o.avatar_image_url||o.avatarImageUrl||o.photo_profil||o.photoProfil||o.profil_photo||o.profilPhoto||o.profil_image||o.profilImage||o.photo_de_profil||o.photoDeProfil||o.photo_de_profil_url||o.photoDeProfilUrl||o.profile_image_url||o.profileImageUrl||o.profile_image||o.profileImage||o.profil_photo_url||o.profilPhotoUrl||o.profil_image_url||o.profilImageUrl||o.photo_profil_url||o.photoProfilUrl||o.profile_avatar_url||o.profileAvatarUrl||o.profile_avatar||o.profileAvatar||o.avatar_path||o.avatarPath||o.photo_path||o.photoPath||o.profile_photo_path||o.profilePhotoPath||o.profile_picture_path||o.profilePicturePath||o.profile_image_path||o.profileImagePath||'');
}
function happyadOwnerOfPostV463(p){p=p||{};return happyadCleanV463(p.creatorId||p.user_id||p.userId||p.ownerId||p.owner_id||p.author_id||p.authorId||p.creator_id||p.profile_id||p.profileId);}
function happyadAllLocalPostsForPublicV463(){
  var out=[],seen={};
  function add(arr){(Array.isArray(arr)?arr:[]).forEach(function(p){var id=happyadCleanV463(p&&p.id);if(!id||seen[id])return;seen[id]=1;out.push(p);});}
  try{add(window.ALL_POSTS||[]);}catch(e){}
  ['HAPPYAD_PUBLISH_POSTS_V2','HAPPYAD_GLOBAL_POSTS_CACHE_V1','HAPPYAD_HOME_POSTS_CACHE_V1','HAPPYAD_POSTS_CACHE_V1','HAPPYAD_CACHED_POSTS_V1','HAPPYAD_FEED_CACHE_V1','HAPPYAD_SEARCH_POSTS_FAST_CACHE_V1','HAPPYAD_PROFILE_POSTS_CACHE_V1','HAPPYAD_USER_POSTS_CACHE_V1'].forEach(function(k){var v=happyadReadJsonV463(k,null);if(Array.isArray(v))add(v);else if(v&&Array.isArray(v.posts))add(v.posts);else if(v&&Array.isArray(v.data))add(v.data);});
  return out;
}
function happyadNormalizePublicProfileV463(p){
  p=p||{};var id=happyadUidOfV463(p), av=happyadAvatarOfV463(p), nm=happyadNameOfV463(p), hd=happyadHandleOfV463(p), bg=happyadCleanV463(p.badge||p.user_badge||p.badge_type||p.certification||'');
  return {id:id,user_id:id,name:nm,full_name:nm,display_name:nm,handle:hd,username:hd,avatar:av,avatar_url:av,badge:bg,user_badge:bg,source:p.source||'home_public_preload_v463',__happyadUidLocked:true,at:Date.now()};
}
function happyadWarmPublicProfileCacheV463(profile, posts, makeActive){
  try{
    var ap=happyadNormalizePublicProfileV463(profile||{}), id=happyadUidOfV463(ap); if(!id)return null;
    var old=happyadReadJsonV463(happyadPublicProfileKeyV463(id),{})||{};
    var merged=Object.assign({},old,ap,{id:id,user_id:id,__happyadUidLocked:true,at:Date.now()});
    if(!happyadAvatarOfV463(merged)&&happyadAvatarOfV463(old)){merged.avatar=happyadAvatarOfV463(old);merged.avatar_url=happyadAvatarOfV463(old);}
    var oldName=happyadCleanV463(old.name||old.full_name||old.display_name||old.username||'');
    if((!merged.name||String(merged.name).toLowerCase().indexOf('chargement profil')>-1||merged.name==='Utilisateur HAPPYAD')&&oldName){merged.name=oldName;merged.full_name=oldName;merged.display_name=oldName;}
    happyadWriteJsonV463(happyadPublicProfileKeyV463(id),merged);
    if(makeActive)happyadWriteJsonV463('HAPPYAD_ACTIVE_PROFILE',merged);
    var all=Array.isArray(posts)?posts:[];
    if(!all.length)all=happyadAllLocalPostsForPublicV463().filter(function(p){return String(happyadOwnerOfPostV463(p))===String(id);});
    if(all.length){
      var seen={},list=[]; all.forEach(function(p){var pid=happyadCleanV463(p&&p.id);if(!pid||seen[pid])return;seen[pid]=1;list.push(p);});
      happyadWriteJsonV463(happyadPublicProfilePostsKeyV463(id),list.slice(0,120));
    }
    try{var av=happyadAvatarOfV463(merged); if(av&&/^https?:/i.test(av)){var img=new Image();img.decoding='async';img.loading='eager';img.src=av;}}catch(_img){}
    return merged;
  }catch(e){return null;}
}
function happyadWarmPublicProfilesBackgroundV463(){
  try{
    var posts=happyadAllLocalPostsForPublicV463(), map={};
    posts.forEach(function(p){var id=happyadOwnerOfPostV463(p); if(!id)return; if(!map[id])map[id]=[]; map[id].push(p);});
    Object.keys(map).slice(0,32).forEach(function(id){var p=map[id][0]||{}; happyadWarmPublicProfileCacheV463({id:id,user_id:id,name:p.creatorName||p.display_name||p.creator_name||p.full_name||p.username,handle:p.username||p.handle,avatar:happyadAvatarOfV463(p),avatar_url:happyadAvatarOfV463(p),badge:p.badge||p.user_badge,source:'home_bg_posts_v463'},map[id],false);});
    var ids=Object.keys(map).slice(0,24); if(!ids.length)return;
    var c=(typeof happyadSb==='function')?happyadSb():null; if(!c)return;
    try{c.from('profiles').select('*').in('id',ids).then(function(r){try{(r&&r.data||[]).forEach(function(row){happyadWarmPublicProfileCacheV463(row,map[happyadUidOfV463(row)]||[],false);});}catch(e){}});}catch(_p){}
    try{c.from('happyad_presence').select('*').in('user_id',ids).then(function(r){try{(r&&r.data||[]).forEach(function(row){happyadWarmPublicProfileCacheV463(Object.assign({id:row.user_id,user_id:row.user_id,full_name:row.name,name:row.name,display_name:row.name},row),map[String(row.user_id)]||[],false);});}catch(e){}});}catch(_pr){}
  }catch(e){}
}
(function happyadStartPublicProfilePreloadV463(){try{function run(){happyadWarmPublicProfilesBackgroundV463();}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(run,250);},{once:true});else setTimeout(run,120);window.addEventListener('focus',function(){setTimeout(run,180);});}catch(e){}})();
/* /HAPPYAD V463 */


function happyadOpenPublicProfileFromPostV417(p){
  try{
    p = p || {};
const owner = postOwnerData(p);
const uid = String(owner.id || owner.user_id || '').trim();

if(!uid){
  alert('Profil introuvable: UID propriétaire absent');
  return false;
}

const ap = {
  id: uid,
  user_id: uid,
  name: owner.name || owner.full_name || p.creatorName || p.display_name || 'Utilisateur HAPPYAD',
  full_name: owner.full_name || owner.name || p.creatorName || p.display_name || 'Utilisateur HAPPYAD',
  handle: owner.handle || p.handle || p.username || '',
  username: owner.username || p.username || p.handle || '',
  avatar: owner.avatar || owner.avatar_url || p.avatar || p.avatar_url || '',
  avatar_url: owner.avatar_url || owner.avatar || p.avatar_url || p.avatar || '',
  badge: owner.badge || p.badge || p.userBadge || '',
  source: 'home_post',
  postId: p.id || '',
  __happyadUidLocked: true
};
    try{if(typeof happyadWarmPublicProfileCacheV463==='function'){happyadWarmPublicProfileCacheV463(ap,[p].concat((typeof happyadAllLocalPostsForPublicV463==='function'?happyadAllLocalPostsForPublicV463():[]).filter(function(x){return String(happyadOwnerOfPostV463(x))===String(uid);})),true);}else{localStorage.setItem('HAPPYAD_ACTIVE_PROFILE',JSON.stringify(ap));}}catch(_warm){localStorage.setItem('HAPPYAD_ACTIVE_PROFILE',JSON.stringify(ap));}
    if(window.happyadOpenInternalUrlV492){window.happyadOpenInternalUrlV492('modules/user.html?public=1&uid='+encodeURIComponent(uid)+(p.id?'&post='+encodeURIComponent(p.id):''));}else{location.href='modules/user.html?public=1&uid='+encodeURIComponent(uid)+(p.id?'&post='+encodeURIComponent(p.id):'');}
    return false;
  }catch(e){console.warn('open public profile v417',e);return false;}
}

function happyadDistanceLabel(p){
  const raw=p.distance||p.distance_km||p.km||''; if(raw)return String(raw).replace('km','')+' km';
  const seed=String(p.id||p.title||'1').split('').reduce((a,c)=>a+c.charCodeAt(0),0);
  const v=((seed%22)+3)/10; return v.toFixed(v>=1?1:1)+' km';
}
function happyadIsMine(p){
 const u=happyadCurrentUser(); const me=String((u&&u.id)||localStorage.getItem('HAPPYAD_AUTH_UID')||'').trim();
 const owner=String(p.creatorId||p.user_id||p.ownerId||p.userId||'').trim(); return !!(me&&owner&&me===owner);
}
function happyadIsLive(p){
 if(p&&p.isLive===true)return true;
 const t=String((p.status||p.live_status||p.mode||p.category||p.kind||p.type||'')+' '+(p.title||'')).toLowerCase();
 return t.includes('live')||t.includes('direct');
}
function happyadIsStory(p){const t=String((p&&p.mode)||'').toLowerCase();const c=String((p&&p.category)||'').toLowerCase();const y=String((p&&p.type)||'').toLowerCase();return !happyadIsLive(p)&&(t==='story'||c==='story'||y==='story');}
function happyadTypeClass(p){const c=catOf(p); if(happyadIsStory(p))return 'story'; if(isVideo(p))return 'video'; if(c==='Produit')return 'product'; if(c==='Service')return 'service'; if(c==='Événement')return 'event'; return 'story';}
function happyadScorePost(p){
 const a=getA(p.id); let score=0; if(happyadIsMine(p))score+=9999; if(happyadIsLive(p))score+=900; score+=(a.like?260:0)+(a.fav?180:0); score+=Number(a.likes||p.likes_count||0)*3; score+=Number(a.comments||p.comments_count||0)*5; score+=Math.max(0,3000000000-(Date.now()-Number(p.createdAt||Date.now())))/10000000; return score;
}
function radarSeen(){try{return JSON.parse(localStorage.getItem('HAPPYAD_HOME_RADAR_SEEN_V1')||'{}')}catch(e){return {}}}
async function markRadarSeen(id){try{const x=radarSeen();x[String(id)]=Date.now();localStorage.setItem('HAPPYAD_HOME_RADAR_SEEN_V1',JSON.stringify(x));}catch(e){}try{var sid=String(id||'');if(sid){try{(window.HAPPYAD_STORIES_ITEMS||[]).forEach(function(it){if(String(it.id||it.story_id||it.sourceId||'')===sid)it.isSeen=true;});localStorage.setItem('HAPPYAD_STORIES_CACHE_V1',JSON.stringify(window.HAPPYAD_STORIES_ITEMS||[]));}catch(_){}}}catch(_e){}try{const c=happyadSb();const u=await happyadAuthUser();if(c&&u&&id){var owner='';try{var cc=window.__HAPPYAD_CURRENT_STORY_CTX||{};owner=String((cc.row&&(cc.row.user_id||cc.row.owner_id||cc.row.creator_id))||(cc.p&&(cc.p.user_id||cc.p.creatorId||cc.p.owner_id||cc.p.creator_id))||'')}catch(_o){}try{if(!owner&&Array.isArray(window.HAPPYAD_STORIES_ITEMS)){var it=(window.HAPPYAD_STORIES_ITEMS||[]).find(function(x){return String(x.id||x.story_id||x.sourceId||'')===String(id)});owner=String(it&&(it.user_id||it.creatorId||it.owner_id||it.creator_id)||'')}}catch(_i){}if(!owner||String(owner)!==String(u.id)){await c.from('happyad_story_views').upsert({story_id:String(id),viewer_id:u.id,viewed_at:new Date().toISOString()},{onConflict:'story_id,viewer_id'});}}}catch(e){console.warn('happyad story view',e)}try{localStorage.setItem('HAPPYAD_RADAR_REFRESH_NEEDED','1');}catch(_e){}try{if(typeof renderRadarHome==='function')setTimeout(renderRadarHome,120);}catch(_e){}}
function openRadarPost(p){ markRadarSeen(p.id); if(happyadIsLive(p)){openLongVideo(p.id);}else if(happyadIsStory(p)){openLongPhoto(p.id);}else{isVideo(p)?openLongVideo(p.id):openLongPhoto(p.id);} setTimeout(function(){try{if(typeof renderRadarHome==='function')renderRadarHome();}catch(_e){}},180); }
function mapHappyRadarRow(r){
 const typ=String(r.source_type||'story').toLowerCase();
 return {id:r.source_id||r.id,radarId:r.id,mode:typ==='live'?'live':'story',type:typ,category:typ,
   title:r.title||r.user_name||'Story',desc:r.description||'',location:r.location_name||'',kind:(r.media_type==='video'||typ==='live')?'video':'photo',
   mediaUrl:r.media_url||'',media_url:r.media_url||'',creatorId:r.user_id||'',user_id:r.user_id||'',creatorName:r.user_name||'Utilisateur HAPPYAD',
   avatar:r.user_avatar||'',badge:r.badge||'aucun',createdAt:r.created_at?new Date(r.created_at).getTime():Date.now(),
   isLive:typ==='live'||r.is_live===true,distance_km:r.distance_km||'',isRadar:true};
}
async function fetchRadarItems(){
 try{
   const c=happyadSb(); if(!c)return [];
   const u=await happyadAuthUser().catch(()=>null);
   const r=await c.from('happyad_stories').select('*').eq('is_active',true).order('created_at',{ascending:false}).limit(30);
   if(r.error)throw r.error;
   let rows=(r.data||[]).filter(x=>!x.expires_at || new Date(x.expires_at).getTime()>Date.now());
   // Filtre vues: garder toujours ma story, cacher les stories vues des autres.
   let seenIds={};
   if(u&&u.id){
     const storyIds=rows.filter(x=>String(x.source_type).toLowerCase()==='story').map(x=>x.source_id).filter(Boolean);
     if(storyIds.length){
       const v=await c.from('happyad_story_views').select('story_id').eq('viewer_id',u.id).in('story_id',storyIds);
       (v.data||[]).forEach(x=>{seenIds[String(x.story_id)]=1;});
     }
     rows=rows.filter(x=>String(x.user_id)===String(u.id) || true);
   }
   HAPPYAD_STORIES_ITEMS=rows.map(mapHappyRadarRow);
   try{HAPPYAD_STORIES_ITEMS=await enrichAuthorProfiles(c,HAPPYAD_STORIES_ITEMS);}catch(_e){}
   try{localStorage.setItem('HAPPYAD_STORIES_CACHE_V1',JSON.stringify(HAPPYAD_STORIES_ITEMS));}catch(e){}
   return HAPPYAD_STORIES_ITEMS;
 }catch(e){
   console.warn('happyad radar fetch',e);
   try{HAPPYAD_STORIES_ITEMS=JSON.parse(localStorage.getItem('HAPPYAD_STORIES_CACHE_V1')||'[]')||[]}catch(_e){HAPPYAD_STORIES_ITEMS=[]}
   return HAPPYAD_STORIES_ITEMS;
 }
}
function renderRadarHome(){
 const old=document.getElementById('homeRadarBlock'); if(old)old.remove();
 const chips=document.querySelector('.chips'); if(!chips||currentFilter!=='all')return;
 const seen=radarSeen();
 const postSource=[]; /* V145: Radar Story officiel = happyad_stories uniquement; pas de story locale/ancienne */
 const radarSource=(HAPPYAD_STORIES_ITEMS||[]);
 const source=[...radarSource].filter((p,i,arr)=>arr.findIndex(x=>String(x.id)===String(p.id))===i);
 let mine=source.filter(p=>happyadIsMine(p)&&(happyadIsStory(p)||String(p.sourceType||p.source_type||'').toLowerCase()==='story')).sort((a,b)=>Number(b.createdAt||0)-Number(a.createdAt||0));
 let liveItems=source.filter(p=>happyadIsLive(p)).sort((a,b)=>happyadScorePost(b)-happyadScorePost(a));
 let others=source.filter(p=>!happyadIsMine(p)&&!happyadIsLive(p)).sort((a,b)=>happyadScorePost(b)-happyadScorePost(a));
 let items=[...mine.slice(0,1),...liveItems,...others].filter((p,i,arr)=>arr.findIndex(x=>String(x.id)===String(p.id))===i).slice(0,14);
 const block=document.createElement('section'); block.id='homeRadarBlock'; block.className='radarBlock';
 block.innerHTML='<div class="radarHead"><div class="radarTitle">◎ RADAR <b>pour toi</b></div><a class="mapLite" href="modules/map.html">⌖ Voir sur la carte</a></div><div class="radarRow"></div>';
 const row=block.querySelector('.radarRow');
 const add=document.createElement('a'); add.href='modules/publish.html?mode=story'; add.className='radarItem'; add.innerHTML='<div class="radarAvatar add"><span>+</span></div><div class="radarName">Ta story</div><div class="radarMeta">Poster Story</div>'; row.appendChild(add);
 items.forEach(p=>{const owner=postOwnerData(p);const live=happyadIsLive(p);const isStory=(happyadIsStory(p)||String(p.sourceType||p.source_type||p.type||p.mode||'').toLowerCase()==='story');const a=document.createElement('button');a.type='button';a.className='radarItem';a.style.background='transparent';a.style.border='0';a.style.padding='0';a.style.cursor='pointer'; const av=owner.avatar?'<img src="'+esc(owner.avatar)+'" alt="">':'<span class="radarInitial">'+esc(initials(owner.name))+'</span>'; const meta=live?'👁 '+(Number(getA(p.id).likes||p.likes_count||24)+24):(isStory?(typeof happyadTimeAgo==='function'?happyadTimeAgo(p.createdAt||p.created_at||Date.now()):'Story'):''); a.innerHTML='<div class="radarAvatar '+(live?'live':'')+'">'+av+(live?'<span class="liveBadge">LIVE</span>':'')+'<i class="typeDot '+happyadTypeClass(p)+'"></i></div><div class="radarName">'+esc(owner.name)+badgeMarkHtml(owner.badge)+'</div><div class="radarMeta">'+esc(meta)+'</div>'; a.onclick=()=>{ try{ if(String(p.sourceType||p.source_type||'').toLowerCase()==='story'){ openRadarPost(p); return;} openRadarPost(p);}catch(e){openRadarPost(p);} }; row.appendChild(a);});
 chips.insertAdjacentElement('afterend',block);
}
function bindHomeSearchAndQuickPost(){
 const btn=document.getElementById('homeSearchBtn'), panel=document.getElementById('homeSearchPanel'), input=document.getElementById('homeSearchInput');
 if(btn&&!btn.__ok){btn.__ok=1;btn.onclick=()=>{panel&&panel.classList.toggle('on'); if(panel&&panel.classList.contains('on')&&input)input.focus();};}
 if(input&&!input.__ok){input.__ok=1;input.oninput=()=>{const q=input.value.trim().toLowerCase();document.querySelectorAll('#list .miniCard').forEach(card=>{card.style.display=!q||card.textContent.toLowerCase().includes(q)?'':'none';});};}
 const plus=document.querySelector('.bottom .plus');
 if(plus&&!plus.__ok){
   plus.__ok=1;
   const nav=plus.closest('a');
   if(nav){
     nav.setAttribute('href','modules/publish.html');
     nav.onclick=null;
   }
 }
 const oldSheet=document.getElementById('quickPostSheet');
 if(oldSheet) oldSheet.remove();
}

function happyadPostTimestamp(p){
  if(!p)return 0;
  var v=p.createdAt||p.created_at||p.created||p.date||p.time||p.timestamp||p.updatedAt||p.updated_at||0;
  if(typeof v==='number')return v>100000000000?v:v*1000;
  if(v instanceof Date)return v.getTime();
  var t=Date.parse(String(v||''));
  return isNaN(t)?Date.now():t;
}
function happyadTimeAgo(v){
  var t=happyadPostTimestamp({createdAt:v});
  var diff=Math.max(0,Date.now()-t);
  var min=60000,h=60*min,d=24*h,w=7*d,mo=30*d,y=365*d;
  if(diff<min)return "À l\'instant";
  if(diff<h){var n=Math.floor(diff/min);return 'Il y a '+n+' min';}
  if(diff<d){var n=Math.floor(diff/h);return 'Il y a '+n+' h';}
  if(diff<w){var n=Math.floor(diff/d);return 'Il y a '+n+' jour'+(n>1?'s':'');}
  if(diff<mo){var n=Math.floor(diff/w);return 'Il y a '+n+' semaine'+(n>1?'s':'');}
  if(diff<y){var n=Math.floor(diff/mo);return 'Il y a '+n+' mois';}
  var n=Math.floor(diff/y);return 'Il y a '+n+' an'+(n>1?'s':'');
}
function happyadPostDateLabel(p){
  var t=happyadPostTimestamp(p);
  var d=new Date(t);
  if(isNaN(d.getTime()))return '';
  var now=new Date();
  var same=d.toDateString()===now.toDateString();
  var pad=function(n){return String(n).padStart(2,'0')};
  var hm=pad(d.getHours())+':'+pad(d.getMinutes());
  if(same)return "Aujourd\'hui • "+hm;
  return pad(d.getDate())+'/'+pad(d.getMonth()+1)+'/'+d.getFullYear()+' • '+hm;
}

/* V315 — Publications photo groupées: une seule carte accueil, actions communes au groupe */
function happyadAlbumCreatedMs(p){var v=p&&(p.createdAt||p.created_at||p.timestamp||p.date||p.inserted_at||p.time);var t=typeof v==='number'?v:new Date(v||0).getTime();return isFinite(t)&&t>0?t:0}
function happyadExplicitAlbumKey(p){if(!p)return '';var fs=['albumId','album_id','groupId','group_id','batchId','batch_id','galleryId','gallery_id','collectionId','collection_id','multiId','multi_id','postGroupId','post_group_id','publicationGroupId','publication_group_id'];for(var i=0;i<fs.length;i++){var v=p[fs[i]];if(v!=null&&String(v).trim())return 'album:'+String(v).trim();}return ''}
function happyadAlbumCreatorKey(p){return String((p&&(p.creatorId||p.user_id||p.userId||p.ownerId||p.owner_id||p.handle||p.creatorName))||'').toLowerCase()}
function happyadFallbackAlbumKey(p){var t=happyadAlbumCreatedMs(p);if(!t)return '';var bucket=Math.floor(t/90000);return ['auto',happyadAlbumCreatorKey(p),String(p&&p.title||'').trim().toLowerCase(),String(p&&(p.desc||p.description)||'').trim().toLowerCase(),String(p&&p.price||'').trim().toLowerCase(),String(p&&p.category||'').trim().toLowerCase(),bucket].join('|')}
function happyadGroupFeedPosts(items){
  var out=[], raw={}, order=[];
  (items||[]).forEach(function(p){
    if(!p){return}
    if(isVideo(p)||happyadIsStory(p)||happyadIsLive(p)){out.push(p);return}
    var key=happyadExplicitAlbumKey(p)||happyadFallbackAlbumKey(p)||('single:'+p.id);
    if(!raw[key]){raw[key]=[];order.push(key)} raw[key].push(p);
  });
  order.forEach(function(k){
    var arr=raw[k]||[];
    arr.sort(function(a,b){var ai=Number(a.groupIndex||a.group_index||a.photoIndex||a.photo_index||0),bi=Number(b.groupIndex||b.group_index||b.photoIndex||b.photo_index||0);if(ai!==bi)return ai-bi;return happyadAlbumCreatedMs(a)-happyadAlbumCreatedMs(b)});
    if(arr.length>18)arr=arr.slice(0,18);
    var rep=Object.assign({},arr[0]);
    rep.__albumItems=arr; rep.__albumCount=arr.length; rep.__albumKey=k; rep.__actionId=arr[0]&&arr[0].id;
    out.push(rep);
  });
  out.sort(function(a,b){return happyadAlbumCreatedMs(b)-happyadAlbumCreatedMs(a)});
  return out;
}

function happyadBindHomeDoubleTapLike(card,p){
  try{
    var media=card&&card.querySelector&&card.querySelector('.miniMedia'); if(!media||media.__happyadDoubleTap)return; media.__happyadDoubleTap=1;
    var last=0;
    media.addEventListener('click',function(e){
      if(e.target&&e.target.closest&&e.target.closest('[data-card-act],button,a'))return;
      var now=Date.now();
      if(now-last<330){
        e.preventDefault(); e.stopPropagation();
        var btn=card.querySelector('[data-card-act="like"]');
        var a=(typeof getA==='function')?getA(p.id):{};
        if(btn && !(a&&a.like)){ btn.click(); }
        var h=document.createElement('div'); h.className='happyadDoubleTapHeart'; h.textContent='♥'; media.appendChild(h); setTimeout(function(){try{h.remove()}catch(_e){}},760);
        last=0; return false;
      }
      last=now;
    },true);
  }catch(e){}
}

/* HAPPYAD V409 — Bouton Acheter uniquement pour les publications créées en mode Boutique. */
const HAPPYAD_BOUTIQUE_CART_REQUEST_V409='HAPPYAD_BOUTIQUE_CART_REQUEST_V409';
function happyadBoutiquePostProductMapV411(){try{return JSON.parse(localStorage.getItem('HAPPYAD_BOUTIQUE_POST_PRODUCT_MAP_V1')||'{}')||{}}catch(_e){return {}}}
function happyadBoutiquePostIdLooksRealV411(p){return /^pbpost_/i.test(String((p&&p.id)||p||'').trim());}
function happyadBoutiqueProductId(p){
  p=p||{};
  var direct=String(p.boutique_product_id||p.boutiqueProductId||p.linked_product_id||p.linkedProductId||'').trim();
  if(direct)return direct;
  var map=happyadBoutiquePostProductMapV411();
  return String(map[String(p.id||p.post_id||'')]||'').trim();
}
function happyadIsBoutiquePost(p){
  p=p||{};
  const pid=happyadBoutiqueProductId(p);
  const postType=String(p.post_type||p.postType||p.type||'').toLowerCase().trim();
  const publishTarget=String(p.publishTarget||p.publish_target||p.target||'').toLowerCase().trim();
  const mode=String(p.mode||'').toLowerCase().trim();
  return !!pid;
}
function happyadOpenBoutiqueCartRequest(p){
  try{
    p=p||{};
    const productId=happyadBoutiqueProductId(p);
    const postId=String(p.id||p.post_id||p.happyadPostId||'').trim();
    const req={productId:productId,postId:postId,qty:1,title:p.title||p.name||'',price:p.price||'',t:Date.now(),from:'home_post_buy'};
    try{localStorage.setItem(HAPPYAD_BOUTIQUE_CART_REQUEST_V409,JSON.stringify(req));}catch(_s){}
    let url='boutique.html?v=532&cart=1&from=home';
    if(productId)url+='&product='+encodeURIComponent(productId);
    if(postId)url+='&post='+encodeURIComponent(postId);
    /* V496: Boutique reste dans l'application, sans ouvrir un lien Chrome séparé. */
    try{if(window.happyadOpenInternalUrlV492&&window.happyadOpenInternalUrlV492(url)){return;}}catch(_r){}
    try{if(window.happyadOpenAppPage&&window.happyadOpenAppPage('boutique',url)){return;}}catch(_a){}
    location.href=url;
  }catch(e){console.warn('open boutique cart request',e);try{if(window.happyadOpenInternalUrlV492&&window.happyadOpenInternalUrlV492('boutique.html?v=532&cart=1'))return;}catch(_x){}location.href='boutique.html?v=532&cart=1';}
}
function createCard(p){
primeCardActionFromPost(p);
const video=isVideo(p);const owner=postOwnerData(p);const name=owner.name;const title=p.title||'Publication HAPPYAD';const rawDesc=String(p.desc||p.description||p.caption||'').trim();const desc=(rawDesc&&rawDesc!==String(title).trim())?rawDesc:'';const price=String(p.price||'').trim();const meta=(p.location?'📍 '+p.location:(p.category||'Publication'));const showMore=desc.length>74;const card=document.createElement('div');card.className='miniCard'+(video?' videoCard':'')+(happyadIsLive(p)?' isLive':'');card.dataset.postId=String(p.id||'');
const av=owner.avatar?'<img src="'+esc(owner.avatar)+'" alt="">':esc(initials(name));
const ago=happyadTimeAgo(happyadPostTimestamp(p));const dateLabel=happyadPostDateLabel(p);
card.innerHTML='<div class="miniCardFrame"><div class="miniTop"><div class="avatar">'+av+'</div><div class="creator"><b>'+esc(name)+badgeMarkHtml(owner.badge)+'</b><span>'+esc(p.location||'HAPPYAD')+'</span></div><div class="miniPostDate">'+esc(ago)+'</div></div><div class="miniMedia"><div class="play">▶</div></div><div class="miniBody"><div class="miniTitleRow"><div class="miniTitle">'+esc(title||'Publication HAPPYAD')+'</div></div>'+(desc?'<div class="miniDesc">'+esc(desc)+'</div>':'')+(showMore?'<button class="miniSeeMore" type="button">Voir plus</button>':'')+'<div class="miniMeta">'+esc(meta)+'</div>'+(price?'<div class="miniPrice">'+esc(price)+'</div>':'')+'</div></div><div class="miniActions"><button class="actionBtn" data-card-act="like"><span class="haLineIcon haLikeIcon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M20.8 4.6c-1.9-1.7-4.9-1.5-6.6.5L12 7.6 9.8 5.1C8.1 3.1 5.1 2.9 3.2 4.6 1.1 6.5 1 9.7 3 11.7l9 8.6 9-8.6c2-2 1.9-5.2-.2-7.1z"/></svg></span><small>0</small></button><button class="actionBtn" data-card-act="comment"><span class="haLineIcon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M21 11.5a8.5 8.5 0 0 1-9 8.5 9.6 9.6 0 0 1-4-.9L3 20l1.1-4.2A8.3 8.3 0 0 1 3 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5z"/></svg></span><small>0</small></button><button class="actionBtn" data-card-act="share"><span class="haLineIcon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v14"/></svg></span><small>0</small></button><button class="actionBtn" data-card-act="repost"><span class="haLineIcon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg></span><small>0</small></button><button class="actionBtn fav" data-card-act="fav"><span class="haLineIcon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/></svg></span><small>0</small></button></div>';
try{var hpTop=card.querySelector('.miniTop');if(hpTop){hpTop.onclick=function(e){e.preventDefault();e.stopPropagation();return happyadOpenPublicProfileFromPostV417(p);};}}catch(_hp){}
var seeBtn=card.querySelector('.miniSeeMore');if(seeBtn){seeBtn.onclick=function(e){e.preventDefault();e.stopPropagation();/* HAPPYAD V330: Voir plus ouvre directement le centre/detail de la publication au lieu de déplier le texte dans l'accueil. */if(video){openLongVideo(p.id);}else{openLongPhoto(p.id);}return false;};}
var buyBtn=card.querySelector('[data-home-buy]');if(buyBtn){buyBtn.onclick=function(e){e.preventDefault();e.stopPropagation();happyadOpenBoutiqueCartRequest(p);return false;};}
try{happyadBindHomeDoubleTapLike(card,p);}catch(_dt){}
if(video){var media=card.querySelector('.miniMedia');if(media){media.insertAdjacentHTML('beforeend','<div class="videoHint">Ouvrir vidéo longue</div><div class="happyadVideoViewsBadge">'+happyadFmtViews((getA(p.id)||{}).views||p.views_count||p.video_views_count||0)+'</div>');}else{card.insertAdjacentHTML('beforeend','<div class="happyadVideoViewsBadge">0</div>');}card.onclick=(e)=>{if(e.target.closest('[data-card-act],[data-home-buy]'))return;openLongVideo(p.id)};}else{card.onclick=(e)=>{if(e.target.closest('[data-card-act],[data-home-buy]'))return;openLongPhoto(p.id)};}refreshCardAction(card,p.id);observeHomeCard(card,p,video);return card;}
function section(title,items,filter){const sec=document.createElement('section');sec.className='section';sec.innerHTML='<div class="sectionHead"><div class="sectionTitle">'+esc(title)+'</div><button class="seeMore" data-see="'+esc(filter)+'">voir plus</button></div><div class="hScroller"></div>';const row=sec.querySelector('.hScroller');items.slice(0,10).forEach(p=>row.appendChild(createCard(p)));if(!items.length)row.innerHTML='<div class="sectionEmpty">Aucune publication pour cette catégorie</div>';sec.querySelector('.seeMore').onclick=()=>setFilter(filter);return sec;}
let HAPPYAD_LAST_RENDER_SIG='';
async function render(){
  if(window.postCount){postCount.textContent='';postCount.style.display='none';}
  const sig=currentFilter+'::'+postsKey(ALL_POSTS||[]);
  const hasCards=!!document.querySelector('#list .miniCard:not(.happyadSkeletonCard)');

  /* HAPPYAD V202 HOME STABILITY
     Ne pas reconstruire l'accueil quand les mêmes publications sont déjà affichées.
     Cela garde les balises <video>, leur src, leur buffer et évite noir/disparition/recharge. */
  if(sig===HAPPYAD_LAST_RENDER_SIG && hasCards){
    renderSponsor();renderRadarHome();bindHomeSearchAndQuickPost();
    refreshHomeVisibleActionsNow();
    return;
  }

  renderSponsor();renderRadarHome();bindHomeSearchAndQuickPost();

  if(happyadPostsLoading&&!ALL_POSTS.length){
    list.className='';
    /* V340: ne plus vider/afficher un écran de chargement à chaque retour.
       Si aucune carte n'est encore là, on garde l'espace stable et Supabase travaille en arrière-plan. */
    if(hasCards){return;}
    var cached=[];
    try{cached=JSON.parse(localStorage.getItem('HAPPYAD_GLOBAL_POSTS_CACHE_V1')||'[]')||[]}catch(_e){cached=[]}
    if(cached.length){ALL_POSTS=cached;happyadPostsLoading=false;render();return;}
    happyadRenderHomeSkeletonV407();
    return;
  }
  if(!ALL_POSTS.length){
    list.className='';
    /* V203: si des cartes sont déjà affichées, ne pas vider l'accueil à cause d'une réponse distante temporairement vide. */
    if(hasCards){renderRadarHome();bindHomeSearchAndQuickPost();return;}
    list.innerHTML='<div class="empty"><div><b>Aucune publication</b><div>Publie une photo, vidéo, produit ou service : ça apparaîtra ici.</div><a class="btn" href="modules/publish.html">Publier</a></div></div>';
    HAPPYAD_LAST_RENDER_SIG=sig;
    return;
  }

  HAPPYAD_LAST_RENDER_SIG=sig;

  if(currentFilter==='all'){
    /* HAPPYAD V332: accueil en timeline verticale infinie.
       On mélange photos, vidéos, produits et services dans une seule colonne.
       Les albums photos restent une seule publication avec actions communes. */
    list.className='homeTimeline';
    const timeline=happyadGroupFeedPosts([...ALL_POSTS].filter(p=>!happyadIsStory(p))).sort(function(a,b){return happyadAlbumCreatedMs(b)-happyadAlbumCreatedMs(a);});
happyadPreloadFirstHomeMediaV407(timeline);

const nextTimelinePosts=timeline.slice(0,HAPPYAD_HOME_RENDER_LIMIT);
const oldHomeCards=[].slice.call(list.querySelectorAll('.miniCard:not(.happyadSkeletonCard)'));
const oldHomeIds=oldHomeCards.map(function(c){return String(c.dataset.postId||'');});
const nextHomeIds=nextTimelinePosts.map(function(p){return String(p&&p.id||'');});

if(oldHomeCards.length && oldHomeIds.join('|') && nextHomeIds.slice(0,oldHomeIds.length).join('|')===oldHomeIds.join('|')){
  for(let i=oldHomeCards.length;i<nextTimelinePosts.length;i++){
    list.appendChild(createCard(nextTimelinePosts[i]));
  }
}else{
  const frag=document.createDocumentFragment();
  nextTimelinePosts.forEach(function(p){frag.appendChild(createCard(p));});
  list.replaceChildren(frag);
}
    happyadEnsureHomeScrollLoader();
    return;
  }
  const posts=happyadGroupFeedPosts(visiblePosts());
happyadPreloadFirstHomeMediaV407(posts);
if(!posts.length){
  list.className='';
  list.innerHTML='<div class="empty"><div><b>Aucune publication</b><div>Rien dans cette catégorie pour le moment.</div><a class="btn" href="modules/publish.html">Publier</a></div></div>';
  return;
}
list.className='feedGrid';

const nextFilterPosts=posts.slice(0,HAPPYAD_HOME_RENDER_LIMIT);
const oldFilterCards=[].slice.call(list.querySelectorAll('.miniCard:not(.happyadSkeletonCard)'));
const oldFilterIds=oldFilterCards.map(function(c){return String(c.dataset.postId||'');});
const nextFilterIds=nextFilterPosts.map(function(p){return String(p&&p.id||'');});

if(oldFilterCards.length && oldFilterIds.join('|') && nextFilterIds.slice(0,oldFilterIds.length).join('|')===oldFilterIds.join('|')){
  for(let i=oldFilterCards.length;i<nextFilterPosts.length;i++){
    list.appendChild(createCard(nextFilterPosts[i]));
  }
}else{
  const frag=document.createDocumentFragment();
  nextFilterPosts.forEach(function(p){frag.appendChild(createCard(p));});
  list.replaceChildren(frag);
}

happyadEnsureHomeScrollLoader();
}
function postsKey(arr){return (arr||[]).map(p=>String(p.id||'')).join('|')}
function happyadHomeDeletedPostIds(){try{return JSON.parse(localStorage.getItem('HAPPYAD_DELETED_POST_IDS_V1')||'[]').map(String)}catch(e){return []}}
function happyadMergePostsFast(arr){
  const seen=new Set();
  const deleted=happyadHomeDeletedPostIds();
  return (arr||[]).filter(function(p){
    const id=String(p&&p.id||'');
    if(!id||seen.has(id)||deleted.indexOf(id)>=0||String(p&&p.deleted_at||'')!=='')return false;
    seen.add(id);
    return true;
  }).sort(function(a,b){return (Number(b.createdAt||b.created_at)||0)-(Number(a.createdAt||a.created_at)||0);});
}
function happyadSaveHomeFastCache(arr){
  arr=happyadMergePostsFast(arr).slice(0,HAPPYAD_HOME_MAX_POSTS);
  try{sessionStorage.setItem('HAPPYAD_SESSION_ALL_POSTS_V104',JSON.stringify(arr));}catch(_e){}
  try{localStorage.setItem('HAPPYAD_GLOBAL_POSTS_CACHE_V1',JSON.stringify(arr));}catch(_e){}
  try{localStorage.setItem('HAPPYAD_PUBLISH_POSTS_V2',JSON.stringify(arr));}catch(_e){}
  try{happyadWriteHomeBootSnapshotV407(arr);}catch(_e){}
  return arr;
}
function happyadHomeVisibleTotal(){
  try{
    if(currentFilter==='all')return happyadGroupFeedPosts([...(ALL_POSTS||[])].filter(function(p){return !happyadIsStory(p)})).length;
    return happyadGroupFeedPosts(visiblePosts()).length;
  }catch(_e){return (ALL_POSTS||[]).length;}
}
async function happyadLoadMoreRemotePosts(){
  if(HAPPYAD_HOME_MORE_LOADING||HAPPYAD_HOME_REMOTE_DONE)return;
  const c=happyadSb();
  if(!c)return;
  HAPPYAD_HOME_MORE_LOADING=true;
  try{
    const start=Math.max(0,Number(HAPPYAD_HOME_REMOTE_NEXT_OFFSET||0));
    const end=start+HAPPYAD_HOME_REMOTE_PAGE-1;
    const {data,error}=await c.from('happyad_posts').select('*').is('deleted_at',null).order('created_at',{ascending:false}).range(start,end);
    if(error)throw error;
    const fresh=(data||[]).map(mapHappyPost);
    HAPPYAD_HOME_REMOTE_NEXT_OFFSET=end+1;
    if(fresh.length<HAPPYAD_HOME_REMOTE_PAGE)HAPPYAD_HOME_REMOTE_DONE=true;
    if(fresh.length){
      const before=postsKey(ALL_POSTS||[]);
      const merged=happyadSaveHomeFastCache([].concat(ALL_POSTS||[],fresh));
      if(postsKey(merged)!==before){ALL_POSTS=merged;render();}
      try{happyadPrimeHomeActionsBatch(fresh).then(function(){refreshHomeVisibleActionsNow();}).catch(function(e){console.warn('home more actions background',e);});}catch(_e){}
      try{enrichAuthorProfiles(c,fresh).then(function(enriched){
        try{
          const merged2=happyadSaveHomeFastCache([].concat(ALL_POSTS||[],enriched||fresh));
          if(postsKey(merged2)!==postsKey(ALL_POSTS||[])){ALL_POSTS=merged2;render();}
        }catch(_e){}
      }).catch(function(e){console.warn('home more authors background',e);});}catch(_e){}
    }
  }catch(e){console.warn('home load more posts',e)}
  HAPPYAD_HOME_MORE_LOADING=false;
}
function happyadMaybeLoadMoreHome(){
  try{
    const doc=document.documentElement;
    if(!doc)return;
    const near=(window.innerHeight+window.scrollY)>(doc.scrollHeight-900);
    if(!near)return;
    const total=happyadHomeVisibleTotal();
    if(HAPPYAD_HOME_RENDER_LIMIT<total){
      HAPPYAD_HOME_RENDER_LIMIT+=HAPPYAD_HOME_PAGE_SIZE;
      render();
      return;
    }
    happyadLoadMoreRemotePosts();
  }catch(e){}
}
function happyadEnsureHomeScrollLoader(){
  if(window.__happyadHomeScrollLoaderBound)return;
  window.__happyadHomeScrollLoaderBound=true;
  let t=null;
  window.addEventListener('scroll',function(){clearTimeout(t);t=setTimeout(happyadMaybeLoadMoreHome,80);},{passive:true});
  window.addEventListener('resize',function(){clearTimeout(t);t=setTimeout(happyadMaybeLoadMoreHome,120);});
}
async function loadPosts(){
  happyadPostsLoading=true;
  try{
    ALL_POSTS=happyadReadHomeBootCachesV407();
  }catch(e){ALL_POSTS=[];}
  try{HAPPYAD_STORIES_ITEMS=JSON.parse(localStorage.getItem('HAPPYAD_STORIES_CACHE_V1')||'[]')||[]}catch(e){HAPPYAD_STORIES_ITEMS=[];}
  HAPPYAD_HOME_RENDER_LIMIT=HAPPYAD_HOME_PAGE_SIZE;
  HAPPYAD_HOME_REMOTE_NEXT_OFFSET=0;
  HAPPYAD_HOME_REMOTE_DONE=false;
  /* HAPPYAD V226 START FAST
     Ne jamais attendre le préchargement Supabase avant d'afficher les cartes.
     Avant: await happyadPrimeHomeActionsBatch(...) gardait l'accueil vide ~1s.
     Maintenant: on affiche immédiatement le cache/local, puis on met likes/vues à jour en arrière-plan. */
  const beforeKey=postsKey(ALL_POSTS);
  if(ALL_POSTS.length){
    happyadPostsLoading=false;
    render();
    happyadPrimeHomeActionsBatch(ALL_POSTS).then(function(){refreshHomeVisibleActionsNow();}).catch(function(e){console.warn('home action preload background',e)});
  }
  else{happyadRenderHomeSkeletonV407();}
  fetchRadarItems().then(()=>{renderRadarHome();}).catch(()=>{});
  const needForce=localStorage.getItem('HAPPYAD_HOME_REFRESH_NEEDED')==='1';
  if(needForce){try{sessionStorage.removeItem('HAPPYAD_ALL_POSTS_LAST_SYNC');sessionStorage.removeItem('HAPPYAD_SESSION_ALL_POSTS_V104');localStorage.removeItem('HAPPYAD_HOME_REFRESH_NEEDED');}catch(_e){}}
  const applyHomeRemoteFast=function(remote){
    if(Array.isArray(remote) && (remote.length || !ALL_POSTS.length)){
      const nextKey=postsKey(remote);
      if(remote&&remote.length){HAPPYAD_HOME_RENDER_LIMIT=Math.min(HAPPYAD_HOME_MAX_POSTS,Math.max(HAPPYAD_HOME_RENDER_LIMIT,remote.length));}
      happyadPostsLoading=false;
      const hasHomeCards=!!document.querySelector('#list .miniCard:not(.happyadSkeletonCard)');
      if(hasHomeCards && ALL_POSTS.length && remote.length < ALL_POSTS.length){
        /* V203: ne pas remplacer les cartes visibles par une réponse initiale partielle. */
        renderRadarHome();
      }else if(nextKey!==beforeKey || !hasHomeCards){ALL_POSTS=remote;render();}
      else{renderRadarHome();}
      return true;
    }
    return false;
  };
    const remotePromise=fetchRemotePosts(false,needForce);
  let happyadHomeRemoteAppliedOnceV1=false;
  function happyadApplyHomeRemoteOnceV1(remote){
    if(happyadHomeRemoteAppliedOnceV1)return false;
    const did=applyHomeRemoteFast(remote);
    if(did)happyadHomeRemoteAppliedOnceV1=true;
    return did;
  }
  remotePromise.then(function(late){
    try{
      if(happyadApplyHomeRemoteOnceV1(late))refreshHomeVisibleActionsNow();
    }catch(_e){}
  }).catch(function(e){console.warn('home remote late sync',e)});
  const remote=await Promise.race([remotePromise,new Promise(function(resolve){setTimeout(function(){resolve(null)},900);})]);
  if(happyadApplyHomeRemoteOnceV1(remote))return;
  happyadPostsLoading=false;
  if(!ALL_POSTS.length){
    var hasBootSkeleton=!!document.querySelector('#list .happyadSkeletonCard');
    if(hasBootSkeleton){setTimeout(function(){try{if(!ALL_POSTS.length&&!happyadPostsLoading)render();}catch(e){}},9000);}
    else render();
  } else{renderRadarHome();refreshHomeVisibleActionsNow();}
}

let HAPPYAD_HOME_LAST_FORCED_REFRESH=0;
async function happyadRefreshHomePostsNow(reason){
  const now=Date.now();
  const hasCards=!!document.querySelector('#list .miniCard:not(.happyadSkeletonCard)');
  const softReason=/pageshow|visible|focus/.test(String(reason||''));
  if(softReason && hasCards && now-HAPPYAD_HOME_LAST_FORCED_REFRESH<300000){try{renderRadarHome();bindHomeSearchAndQuickPost();refreshHomeVisibleActionsNow();}catch(e){}return ALL_POSTS;}
  HAPPYAD_HOME_LAST_FORCED_REFRESH=now;
  if(!softReason && /post-deleted|storage|manual|publish/.test(String(reason||''))){try{sessionStorage.removeItem('HAPPYAD_ALL_POSTS_LAST_SYNC');localStorage.removeItem('HAPPYAD_HOME_REFRESH_NEEDED');}catch(e){}}
  try{
    const remote=await fetchRemotePosts(false,!softReason);
    if(Array.isArray(remote)){
      const oldList=Array.isArray(ALL_POSTS)?ALL_POSTS:[];
      const oldKey=postsKey(oldList), newKey=postsKey(remote||[]);

      /* HAPPYAD V203 HOME VIDEO STABILITY
         Supabase / realtime peut renvoyer temporairement une liste vide ou partielle.
         Avant, cette réponse remplaçait ALL_POSTS puis render() vidait #list :
         vidéo visible -> noir -> disparition définitive.
         Ici on refuse les réponses vides/faibles quand des cartes existent déjà.
         Les vraies suppressions locales restent gérées par l'événement happyad:post-deleted. */
      if(hasCards && oldList.length && (!remote.length || remote.length < oldList.length)){
        const byId={};
        oldList.forEach(function(x){if(x&&x.id)byId[String(x.id)]=x;});
        (remote||[]).forEach(function(x){if(x&&x.id)byId[String(x.id)]=Object.assign({},byId[String(x.id)]||{},x);});
        const deleted=JSON.parse(localStorage.getItem('HAPPYAD_DELETED_POST_IDS_V1')||'[]').map(String);
        ALL_POSTS=Object.keys(byId).map(function(k){return byId[k];}).filter(function(x){return x&&deleted.indexOf(String(x.id))<0&&String(x.deleted_at||'')==='';}).sort(function(a,b){return (Number(b.createdAt)||0)-(Number(a.createdAt)||0);});
        happyadPostsLoading=false;
        renderRadarHome();
        refreshHomeVisibleActionsNow();
        return ALL_POSTS;
      }

      ALL_POSTS=remote;
      if(remote&&remote.length){HAPPYAD_HOME_RENDER_LIMIT=Math.min(HAPPYAD_HOME_MAX_POSTS,Math.max(HAPPYAD_HOME_RENDER_LIMIT,remote.length));}
      happyadPostsLoading=false;
      if(oldKey!==newKey || !hasCards)render(); else{renderRadarHome();refreshHomeVisibleActionsNow();}
      return remote;
    }
  }catch(e){console.warn('home forced posts refresh',reason,e)}
  try{renderRadarHome();}catch(e){}
  return ALL_POSTS;
}
window.happyadRefreshHomePostsNow=happyadRefreshHomePostsNow;
let happyadHomeRefreshTimerV1=0;
let happyadHomeRefreshLastAtV1=0;
let happyadHomeRefreshLastReasonV1='';

function happyadScheduleHomeRefreshV1(reason,delay){
  try{
    const now=Date.now();
    const softReason=/pageshow|visible|focus/.test(String(reason||''));
    const hasCards=!!document.querySelector('#list .miniCard:not(.happyadSkeletonCard)');

    if(softReason && hasCards && now-happyadHomeRefreshLastAtV1<1200)return;

    clearTimeout(happyadHomeRefreshTimerV1);
    happyadHomeRefreshLastReasonV1=reason;
    happyadHomeRefreshTimerV1=setTimeout(function(){
      happyadHomeRefreshLastAtV1=Date.now();
      happyadRefreshHomePostsNow(happyadHomeRefreshLastReasonV1);
    },delay||300);
  }catch(e){}
}

window.addEventListener('pageshow',function(){happyadScheduleHomeRefreshV1('pageshow',300);});
document.addEventListener('visibilitychange',function(){if(!document.hidden)happyadScheduleHomeRefreshV1('visible',300);});
window.addEventListener('focus',function(){happyadScheduleHomeRefreshV1('focus',500);});
try{window.addEventListener('storage',function(e){if(e&&/HAPPYAD_HOME_REFRESH_NEEDED|HAPPYAD_DELETED_POST_IDS_V1/.test(e.key||''))happyadScheduleHomeRefreshV1('storage',80);});}catch(e){}
try{window.addEventListener('happyad:post-deleted',function(e){var id=e&&e.detail&&e.detail.id;if(id){ALL_POSTS=(ALL_POSTS||[]).filter(function(p){return String(p&&p.id)!==String(id)});render();}setTimeout(function(){happyadRefreshHomePostsNow('post-deleted');},80);});}catch(e){}
/* HAPPYAD V211: autres téléphones ne reçoivent pas toujours Realtime Supabase.
   Polling léger: toutes les 6 secondes, l'accueil force Supabase comme source de vérité.
   Cela retire les posts supprimés en quelques secondes au lieu d'attendre le vieux cache. */
try{setInterval(function(){try{if(!document.hidden && typeof window.happyadRefreshHomePostsNow==='function')window.happyadRefreshHomePostsNow('delete-fast-poll');}catch(_e){}},180000);}catch(e){}

function setFilter(f){currentFilter=f;HAPPYAD_HOME_RENDER_LIMIT=HAPPYAD_HOME_PAGE_SIZE;document.querySelectorAll('.chip').forEach(x=>x.classList.toggle('on',x.dataset.filter===f));render();}
/* HAPPYAD V322 — Les boutons Vidéos et Photos de l'accueil ouvrent directement leur centrale.
   On ne filtre plus l'accueil pour ces deux boutons: on va vers modules/video.html et modules/photo.html. */
async function openHomeCentralFilter(f){
  if(f==='video'){
    if(window.happyadOpenInternalUrlV492){window.happyadOpenInternalUrlV492('modules/video.html');}else{window.location.href='modules/video.html';}
    return;
  }

  if(f==='photo'){
    /* V466 — centrale photo en pause: le bouton Photos filtre seulement l'accueil.
       Les photos s'ouvrent en plein écran léger au clic, sans quitter index.html. */
    setFilter('photo');
    return;
  }

  setFilter(f);
}
document.querySelectorAll('.chip').forEach(btn=>{btn.onclick=()=>openHomeCentralFilter(btn.dataset.filter);});bindHomeSearchAndQuickPost();loadPosts();

/* V6 — avatar accueil autres appareils: recharge les profils auteurs sans attendre un nouveau post */
(function(){
  let happyadAuthorsRefreshBusyV1=false;
  let happyadAuthorsRefreshTimerV1=0;

  function scheduleAuthorsRefreshV1(delay){
    try{
      clearTimeout(happyadAuthorsRefreshTimerV1);
      happyadAuthorsRefreshTimerV1=setTimeout(function(){
        refreshAuthorsNow();
      },delay||350);
    }catch(e){}
  }

  async function refreshAuthorsNow(){
    if(happyadAuthorsRefreshBusyV1)return;
    happyadAuthorsRefreshBusyV1=true;
    try{
      const c=happyadSb(); if(!c||!ALL_POSTS||!ALL_POSTS.length)return;
      const enriched=await enrichAuthorProfiles(c,ALL_POSTS);
      const before=JSON.stringify(ALL_POSTS.map(p=>[p.id,p.creatorName,p.handle,p.avatar,p.badge]));
      const after=JSON.stringify(enriched.map(p=>[p.id,p.creatorName,p.handle,p.avatar,p.badge]));
      if(before!==after){
        var oldIds=postsKey(ALL_POSTS||[]), newIds=postsKey(enriched||[]);
        ALL_POSTS=enriched;
        try{
          localStorage.setItem('HAPPYAD_PUBLISH_POSTS_V2',JSON.stringify(enriched));
          localStorage.setItem('HAPPYAD_GLOBAL_POSTS_CACHE_V1',JSON.stringify(enriched));
        }catch(_e){}
        if(oldIds!==newIds)render();
        else {renderRadarHome();bindHomeSearchAndQuickPost();}
      }
    }catch(e){console.warn('home profile realtime refresh',e)}
    finally{happyadAuthorsRefreshBusyV1=false;}
  }

  scheduleAuthorsRefreshV1(900);

  try{
    const c=happyadSb(); if(c&&c.channel){
      c.channel('happyad_home_profiles_v6')
        .on('postgres_changes',{event:'*',schema:'public',table:'profiles'},function(){scheduleAuthorsRefreshV1(500);})
        .subscribe();
    }
  }catch(e){}
})();


document.addEventListener('click',function(e){
  if(e.target && e.target.id==='closeEditProfile'){
    try{
      if(typeof closeProfileEditModal==='function'){ closeProfileEditModal(); }
      const b=document.getElementById('profileEditBackdrop');
      const p=document.getElementById('editPanel');
      if(b) b.classList.remove('show');
      if(p){ p.style.display='none'; p.classList.remove('show'); }
    }catch(err){}
  }
});


(function(){
  var USER_KEY='HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL';
  function today(){return new Date().toISOString().slice(0,10)}
  function clean(v){return String(v==null?'':v).trim()}
  function loadUser(){try{return JSON.parse(localStorage.getItem(USER_KEY)||'{}')}catch(e){return {}}}
  function needReminder(){var u=loadUser();return !!(clean(u.id)&&clean(u.name)&&clean(u.handle)&&!u.contactVerified);}
  function show(){
    if(!needReminder())return;
    var key='HAPPYAD_VERIFY_REMINDER_DAY';
    var day=today();
    // Pour test: affiche chaque jour. Si supprimé aujourd'hui, il reviendra demain.
    if(localStorage.getItem(key)===day && sessionStorage.getItem('HAPPYAD_VERIFY_REMINDER_SHOWN')==='1') return;
    localStorage.setItem(key,day); sessionStorage.setItem('HAPPYAD_VERIFY_REMINDER_SHOWN','1');
    var app=document.querySelector('.app'); if(!app || document.getElementById('happyVerifyReminder'))return;
    var box=document.createElement('div');
    box.id='happyVerifyReminder'; box.className='happyVerifyReminder';
    box.innerHTML='<b>Vérification requise</b>Valide ton Gmail ou ton numéro pour sécuriser ton compte HAPPYAD. Ce rappel reviendra chaque jour jusqu’à validation.<br><a href="modules/user.html">Valider maintenant</a>';
    var top=document.querySelector('.top');
    if(top && top.nextSibling) app.insertBefore(box, top.nextSibling); else app.prepend(box);
  }
  document.addEventListener('DOMContentLoaded',show);
  setTimeout(show,300);
})();


(function(){
 const USER_KEY='HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL';
 const URL=window.HAPPYAD_SUPABASE_URL||'https://txjjyhupbejgjcianrmr.supabase.co';
 const KEY=window.HAPPYAD_SUPABASE_KEY||'sb_publishable_35EsjCOhZtaPtoZwdyAYOw_KaqlSKHD';
 let sb=null;
 function client(){if(sb)return sb;if(window.supabase&&window.supabase.createClient){sb=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true}});return sb;}return null;}
 function normBadge(v){v=String(v||'aucun').toLowerCase();if(v==='bleu'||v==='blue')return 'bleu';if(v==='violet'||v==='jaune'||v==='yellow')return 'violet';return 'aucun'}
 async function sync(){removeFloatingAdmin();try{if(localStorage.getItem('HAPPYAD_FORCE_LOGOUT')==='1'||Number(localStorage.getItem('HAPPYAD_FORCE_LOGOUT_UNTIL')||0)>Date.now())return;}catch(_e){}const c=client();if(!c)return;try{const {data:{user}}=await c.auth.getUser();if(!user)return;try{localStorage.setItem('HAPPYAD_AUTH_UID',user.id)}catch(_e){}const {data:p}=await c.from('profiles').select('*').eq('id',user.id).maybeSingle();if(!p)return;let u={};try{u=JSON.parse(localStorage.getItem(USER_KEY)||'{}')}catch(e){}const next=Object.assign({},u,{id:user.id,name:p.full_name||u.name||'Utilisateur HAPPYAD',handle:String(p.username||u.handle||'happyad').replace(/^@+/,''),avatar:p.avatar_url||u.avatar||'',badge:normBadge(p.badge),role:String(p.role||u.role||'user').toLowerCase()});const before=JSON.stringify({name:u.name,handle:u.handle,avatar:u.avatar,badge:u.badge,role:u.role});const after=JSON.stringify({name:next.name,handle:next.handle,avatar:next.avatar,badge:next.badge,role:next.role});localStorage.setItem(USER_KEY,JSON.stringify(next));if(before!==after){try{renderRadarHome();bindHomeSearchAndQuickPost();}catch(_e){}}removeFloatingAdmin();}catch(e){console.warn('home sync',e)}}
 function removeFloatingAdmin(){document.querySelectorAll('#adminAccessBtn,#ownerAdminAccessBtn,.floatingAdminBtn,.adminFloating').forEach(x=>x.remove());}
 document.addEventListener('DOMContentLoaded',function(){removeFloatingAdmin();sync();setTimeout(removeFloatingAdmin,400);setTimeout(removeFloatingAdmin,900);});setTimeout(sync,900);
})();


(function(){function rm(){document.querySelectorAll('#adminAccessBtn,#ownerAdminAccessBtn,.floatingAdminBtn,.adminFloating').forEach(x=>x.remove())}document.addEventListener('DOMContentLoaded',rm);setTimeout(rm,300);setTimeout(rm,700);setTimeout(rm,900);})();


(function(){
  if(window.__HAPPYAD_V116G_AUTH_REPAIR__) return;
  window.__HAPPYAD_V116G_AUTH_REPAIR__=true;
  var USER_KEY='HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL';
  function readUser(){try{return JSON.parse(localStorage.getItem(USER_KEY)||'{}')||{}}catch(e){return {}}}
  function isRealLocalUser(){
    var u=readUser();
    var id=String(u.id||'').trim();
    var name=String(u.name||u.full_name||'').trim().toLowerCase();
    var handle=String(u.handle||u.username||'').replace(/^@+/,'').trim().toLowerCase();
    if(!id||!name||!handle) return false;
    if(name==='utilisateur'||name==='utilisateur happyad'||name.indexOf('aucun compte')>-1) return false;
    if(id.indexOf('guest')===0||id.indexOf('logged_out')===0) return false;
    return true;
  }
  function repair(){
    try{ if(localStorage.getItem('HAPPYAD_FORCE_LOGOUT')==='1'||Number(localStorage.getItem('HAPPYAD_FORCE_LOGOUT_UNTIL')||0)>Date.now()) return; }catch(e){}
    try{ if(isRealLocalUser()) localStorage.setItem('HAPPYAD_SESSION_ACTIVE','1'); }catch(e){}
  }
  repair();
  document.addEventListener('DOMContentLoaded',repair);
  window.addEventListener('focus',repair);
  setTimeout(repair,100);
  setTimeout(repair,800);
})();


(function(){
  if(window.__HAPPYAD_V116F_GUEST_GUARD__) return;
  window.__HAPPYAD_V116F_GUEST_GUARD__=true;
  var USER_KEY='HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL';
  function readUser(){try{return JSON.parse(localStorage.getItem(USER_KEY)||'{}')||{}}catch(e){return {}}}
  function hasRealAccount(){
    try{ if(localStorage.getItem('HAPPYAD_SESSION_ACTIVE')==='0') return false; }catch(e){}
    var u=readUser();
    var id=String(u.id||'').trim();
    var name=String(u.name||u.full_name||'').trim().toLowerCase();
    var handle=String(u.handle||u.username||'').replace(/^@+/,'').trim().toLowerCase();
    if(!id || !name || !handle) return false;
    if(name==='utilisateur' || name==='utilisateur happyad' || name.indexOf('aucun compte')>-1) return false;
    if(id.indexOf('guest')===0 || id.indexOf('logged_out')===0) return false;
    return true;
  }
  function goAuth(){ location.href='modules/user.html?auth=1'; }
  function protectHomeClick(e){
    var t=e.target;
    if(!t || hasRealAccount()) return;
    var nav=t.closest && t.closest('a.nav');
    if(nav){
      var href=nav.getAttribute('href')||'';
      if(href.indexOf('modules/video.html')>-1 || href.indexOf('index.html')>-1) return;
      e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation)e.stopImmediatePropagation(); goAuth(); return false;
    }
    var act=t.closest && t.closest('[data-card-act]');
    if(act){
      e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation)e.stopImmediatePropagation(); goAuth(); return false;
    }
  }
  document.addEventListener('click',protectHomeClick,true);
  window.happyadHasRealAccountV116F=hasRealAccount;
})();


(function(){
  function esc2(v){return String(v==null?'':v).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]});}
  function isRadarStoryItem(p){
    var t=String((p&&(p.source_type||p.type||p.mode||p.category))||'').toLowerCase();
    return t==='story' || (p&&p.isRadar===true && !p.isLive && t!=='live');
  }
  function mediaTypeOf(row,p){
    return String((row&&(row.media_type||row.mediaType))||(p&&(p.media_type||p.mediaType||p.kind))||'image').toLowerCase();
  }
  function mediaUrlOf(row,p){
    return (row&&(row.media_url||row.mediaUrl||row.live_url)) || (p&&(p.media_url||p.mediaUrl||p.live_url)) || '';
  }
  async function fetchStoryRow(id){
    try{
      var c=typeof happyadSb==='function'?happyadSb():null;
      if(!c||!id)return null;
      var r=await c.from('happyad_stories').select('*').eq('id',String(id)).maybeSingle();
      if(r && !r.error && r.data)return r.data;
    }catch(e){console.warn('story fetch failed',e)}
    return null;
  }
  async function fetchLiveRow(id){
    try{
      var c=typeof happyadSb==='function'?happyadSb():null;
      if(!c||!id)return null;
      var r=await c.from('happyad_lives').select('*').eq('id',String(id)).maybeSingle();
      if(r && !r.error && r.data)return r.data;
    }catch(e){console.warn('live fetch failed',e)}
    return null;
  }
  function ensureStoryViewer(){
    var box=document.getElementById('happyStoryViewer');
    if(box)return box;
    var st=document.createElement('style');
    st.id='happyStoryViewerStyle';
    st.textContent='\n#happyStoryViewer{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.96);display:none;align-items:center;justify-content:center;color:#fff;font-family:system-ui,-apple-system,Segoe UI,sans-serif}\n#happyStoryViewer.on{display:flex}\n#happyStoryViewer .hsvCard{position:relative;width:min(100vw,520px);height:100vh;background:#050507;overflow:hidden}\n#happyStoryViewer .hsvTop{position:absolute;left:0;right:0;top:0;z-index:4;padding:18px 16px 12px;background:linear-gradient(rgba(0,0,0,.72),rgba(0,0,0,0));display:flex;align-items:center;gap:10px}\n#happyStoryViewer .hsvAvatar{width:40px;height:40px;border-radius:50%;overflow:hidden;background:#191c23;border:2px solid #ff7a00;display:grid;place-items:center;font-weight:900}\n#happyStoryViewer .hsvAvatar img{width:100%;height:100%;object-fit:cover}\n#happyStoryViewer .hsvName{font-weight:950;font-size:15px;line-height:1.1}.hsvSub{font-size:12px;color:#cfd3dd;margin-top:2px}\n#happyStoryViewer .hsvClose{margin-left:auto;width:40px;height:40px;border:0;border-radius:50%;background:rgba(255,255,255,.14);color:#fff;font-size:24px;font-weight:900}\n#happyStoryViewer .hsvMedia{width:100%;height:100%;display:grid;place-items:center;background:#000}\n#happyStoryViewer .hsvMedia img,#happyStoryViewer .hsvMedia video{width:100%;height:100%;object-fit:contain;background:#000}\n#happyStoryViewer .hsvCaption{position:absolute;left:0;right:0;bottom:0;z-index:4;padding:60px 18px 26px;background:linear-gradient(rgba(0,0,0,0),rgba(0,0,0,.82));font-weight:800;font-size:17px}\n#happyStoryViewer .hsvEmpty{padding:24px;text-align:center;color:#d5d8df}\n';
    document.head.appendChild(st);
    box=document.createElement('div');
    box.id='happyStoryViewer';
    box.innerHTML='<div class="hsvCard"><div class="hsvTop"><div class="hsvAvatar" id="hsvAvatar"></div><div><div class="hsvName" id="hsvName">Story</div><div class="hsvSub" id="hsvSub">HAPPYAD</div></div><button class="hsvClose" type="button" id="hsvClose">×</button></div><div class="hsvMedia" id="hsvMedia"></div><div class="hsvCaption" id="hsvCaption"></div></div>';
    document.body.appendChild(box);
    box.querySelector('#hsvClose').onclick=function(){box.classList.remove('on'); var v=box.querySelector('video'); if(v)try{v.pause()}catch(e){}};
    box.addEventListener('click',function(e){if(e.target===box)box.querySelector('#hsvClose').click();});
    return box;
  }
  async function openHappyadStoryViewer(p){
    var id=String((p&&(p.source_id||p.sourceId||p.id))||'');
    var row=await fetchStoryRow(id);
    var box=ensureStoryViewer();
    var name=(row&&(row.user_name||row.title)) || (p&&(p.creatorName||p.user_name||p.title)) || 'Story';
    var avatar=(row&&row.user_avatar) || (p&&(p.avatar||p.user_avatar)) || '';
    var media=mediaUrlOf(row,p);
    var typ=mediaTypeOf(row,p);
    box.querySelector('#hsvAvatar').innerHTML=avatar?'<img src="'+esc2(avatar)+'" alt="">':esc2((name||'S').trim().slice(0,1).toUpperCase());
    box.querySelector('#hsvName').innerHTML=esc2(name)+(typeof badgeMarkHtml==='function'?badgeMarkHtml((row&&(row.badge||row.user_badge))||(p&&(p.badge||p.userBadge||p.user_badge))):'');
    box.querySelector('#hsvSub').textContent='Story HAPPYAD';
    box.querySelector('#hsvCaption').textContent=(row&&(row.caption||row.description||row.story_description||row.story_caption)) || (p&&(p.story_description||p.story_caption||p.storyDesc)) || '';
    var mediaBox=box.querySelector('#hsvMedia');
    if(media){
      if(typ.indexOf('video')>=0){mediaBox.innerHTML='<video src="'+esc2(media)+'" controls autoplay playsinline></video>';}
      else{mediaBox.innerHTML='<img src="'+esc2(media)+'" alt="Story">';}
    }else{
      mediaBox.innerHTML='<div class="hsvEmpty">Story chargée, mais le média est vide.</div>';
    }
    box.classList.add('on');
    try{ if(typeof markRadarSeen==='function' && id && !(typeof happyadIsMine==='function'&&happyadIsMine(p))) await markRadarSeen(id); }catch(e){}
  }
  async function openHappyadLiveViewer(p){
    var id=String((p&&(p.source_id||p.sourceId||p.id))||'');
    var row=await fetchLiveRow(id);
    var box=ensureStoryViewer();
    var name=(row&&(row.user_name||row.title)) || (p&&(p.creatorName||p.user_name||p.title)) || 'Live';
    var avatar=(row&&row.user_avatar) || (p&&(p.avatar||p.user_avatar)) || '';
    var media=mediaUrlOf(row,p);
    box.querySelector('#hsvAvatar').innerHTML=avatar?'<img src="'+esc2(avatar)+'" alt="">':esc2((name||'L').trim().slice(0,1).toUpperCase());
    box.querySelector('#hsvName').innerHTML=esc2(name)+(typeof badgeMarkHtml==='function'?badgeMarkHtml((row&&(row.badge||row.user_badge))||(p&&(p.badge||p.userBadge||p.user_badge))):'');
    box.querySelector('#hsvSub').textContent='🔴 En direct';
    box.querySelector('#hsvCaption').textContent=(row&&(row.description||row.caption||row.story_description||row.story_caption)) || (p&&(p.story_description||p.story_caption||p.storyDesc)) || 'Live en direct';
    box.querySelector('#hsvMedia').innerHTML=media?'<video src="'+esc2(media)+'" controls autoplay playsinline></video>':'<div class="hsvEmpty">Live ouvert, flux vidéo non disponible.</div>';
    box.classList.add('on');
  }
  window.openHappyadStoryViewer=openHappyadStoryViewer;
  window.openHappyadLiveViewer=openHappyadLiveViewer;
  window.openRadarPost=function(p){
    if(!p)return;
    if(p.isRadar===true || p.radarId || isRadarStoryItem(p) || p.source_id){
      if((p.isLive===true)||String(p.type||p.mode||p.category||'').toLowerCase()==='live'){
        openHappyadLiveViewer(p); return;
      }
      if(isRadarStoryItem(p)){
        openHappyadStoryViewer(p); return;
      }
    }
    if(typeof openLongVideo==='function' && typeof happyadIsLive==='function' && happyadIsLive(p)){openLongVideo(p.id);return;}
    if(typeof openLongPhoto==='function')openLongPhoto(p.id);
  };
  async function refreshRadarFast(){
    try{
      if(typeof fetchRadarItems==='function')await fetchRadarItems();
      if(typeof renderRadarHome==='function')renderRadarHome();
    }catch(e){console.warn('radar refresh fast',e)}
  }
  setTimeout(refreshRadarFast,80);
  setTimeout(refreshRadarFast,900);
  try{
    var c=typeof happyadSb==='function'?happyadSb():null;
    if(c&&c.channel){
      c.channel('happyad_radar_v121_live_refresh')
       .on('postgres_changes',{event:'*',schema:'public',table:'happyad_stories'},refreshRadarFast)
       .subscribe();
    }
  }catch(e){}
})();


(function(){
 if(window.__HAPPYAD_V144_STORIES_ONLY__)return; window.__HAPPYAD_V144_STORIES_ONLY__=true;
 function sb(){try{return (typeof happyadSb==='function')?happyadSb():((window.happyadSupabase)||(window.supabase&&window.supabase.createClient?window.supabase.createClient(window.HAPPYAD_SUPABASE_URL,window.HAPPYAD_SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true}}):null));}catch(e){return null}}
 async function authUser(){try{if(typeof happyadAuthUser==='function')return await happyadAuthUser();var c=sb();if(c&&c.auth){var r=await c.auth.getUser();return r&&r.data&&r.data.user?r.data.user:null}}catch(e){}return null}
 function isActive(r){if(!r)return false;if(r.is_active===false||r.active===false||r.deleted===true)return false;var ex=r.expires_at||r.expire_at||r.expired_at;if(ex&&new Date(ex).getTime()<Date.now())return false;return true}
 function media(r){return (r&&(r.media_url||r.mediaUrl||r.story||r.url))||''}
 function mtype(r){var t=String((r&&(r.media_type||r.mediaType||r.kind))||'photo').toLowerCase();return t.indexOf('video')>=0?'video':'photo'}
 function desc(r){var title=String((r&&(r.title||r.user_name))||'Story').trim().toLowerCase();var vals=[r&&r.description,r&&r.caption,r&&r.desc,r&&r.story_description];for(var i=0;i<vals.length;i++){var v=String(vals[i]||'').trim();if(v&&v.toLowerCase()!==title)return v}return ''}
 function toPost(r,seen){return {id:String(r.id),sourceId:String(r.id),mode:'story',type:'story',category:'story',title:r.title||r.user_name||'Story',desc:desc(r),description:desc(r),location:'',kind:mtype(r),mediaType:mtype(r),mediaUrl:media(r),media_url:media(r),creatorId:r.user_id||'',user_id:r.user_id||'',creatorName:r.user_name||r.display_name||r.creator_name||'Utilisateur HAPPYAD',handle:r.username?('@'+String(r.username).replace(/^@+/,'')):(r.handle||''),avatar:r.user_avatar||r.avatar_url||'',badge:r.badge||r.user_badge||'aucun',createdAt:r.created_at?new Date(r.created_at).getTime():Date.now(),expiresAt:r.expires_at||'',isRadar:true,isLive:false,isSeen:!!seen,supabase:true,__storyTable:'happyad_stories'};}
 async function enrich(list){var c=sb();if(!c||!list||!list.length)return list;var ids=[...new Set(list.map(x=>x.creatorId).filter(Boolean).map(String))];if(!ids.length)return list;try{var q=await c.from('profiles').select('id,full_name,username,avatar_url,badge').in('id',ids);if(q.error||!q.data)return list;var by={};q.data.forEach(p=>by[String(p.id)]=p);list.forEach(x=>{var p=by[String(x.creatorId)];if(p){x.creatorName=p.full_name||x.creatorName;x.handle=p.username?('@'+String(p.username).replace(/^@+/,'')):x.handle;x.avatar=p.avatar_url||x.avatar;x.badge=p.badge||x.badge;}})}catch(e){}return list;}
 async function fetchStories(){var c=sb();if(!c)return [];try{var user=await authUser();var q=await c.from('happyad_stories').select('*').eq('is_active',true).order('created_at',{ascending:false}).limit(80);if(q.error)throw q.error;var rows=(q.data||[]).filter(isActive).filter(r=>!!media(r));var views=[];if(user&&user.id&&rows.length){try{var ids=rows.map(r=>String(r.id));var vr=await c.from('happyad_story_views').select('story_id').eq('viewer_id',user.id).in('story_id',ids);views=(vr.data||[]).map(v=>String(v.story_id));}catch(e){}}var seen=new Set(views);var out=rows.filter(function(r){try{var hid=JSON.parse(localStorage.getItem('HAPPYAD_HIDDEN_STORIES_V1')||'{}');if(hid[String(r.id)])return false;}catch(e){}return true;}).map(r=>toPost(r,seen.has(String(r.id))));out=await enrich(out);window.HAPPYAD_STORIES_ITEMS=out;try{localStorage.setItem('HAPPYAD_STORIES_CACHE_V1',JSON.stringify(out));}catch(_e){} if(!out.length){try{localStorage.removeItem('HAPPYAD_STORIES_CACHE_V1');window.__HAPPYAD_STORIES_ITEMS_CACHE=[];}catch(_e){}} return out;}catch(e){console.warn('happyad_stories fetch',e);window.HAPPYAD_STORIES_ITEMS=[];try{localStorage.removeItem('HAPPYAD_STORIES_CACHE_V1');window.__HAPPYAD_STORIES_ITEMS_CACHE=[];}catch(_e){}return []}}
 window.fetchRadarItems=fetchStories;
 async function myStory(){var u=await authUser();var c=sb();if(!c||!u||!u.id)return null;try{var q=await c.from('happyad_stories').select('*').eq('user_id',u.id).eq('is_active',true).order('created_at',{ascending:false}).limit(20);if(q.error)throw q.error;var arr=(q.data||[]).filter(isActive).filter(r=>!!media(r));return arr[0]||null}catch(e){return null}}
 window.happyadFetchMyCentralStory=myStory;
 var oldOpen=window.openHappyadStoryViewer||window.openCentralStory||null;
 window.openStoryViewer=window.openProfileStoryPremium=async function(){var r=await myStory();if(!r){alert('Aucune story active');return false;}var p=(await enrich([toPost(r,false)]))[0];if(oldOpen)return oldOpen(p);if(window.openRadarPost)return window.openRadarPost(p);return false;};
 var oldRadar=window.openRadarPost;
 window.openRadarPost=function(p){if(p&&(String(p.mode||p.type||p.category||'').toLowerCase()==='story'||p.__storyTable==='happyad_stories')){if(oldOpen)return oldOpen(p);}return oldRadar?oldRadar(p):false;};
})();


(function(){
 if(window.__HAPPYAD_V145_SINGLE_SOURCE__)return; window.__HAPPYAD_V145_SINGLE_SOURCE__=true;
 function sb(){try{return typeof happyadSb==='function'?happyadSb():null}catch(e){return null}}
 function currentUser(){try{return JSON.parse(localStorage.getItem('HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL')||'{}')||{}}catch(e){return {}}}
 function storyId(p){return String((p&&(p.source_id||p.sourceId||p.story_id||p.storyId||p.id))||'').trim()}
 function ownerId(row,p){return String((row&&(row.user_id||row.creator_id||row.owner_id))||(p&&(p.user_id||p.creatorId||p.owner_id||p.userId))||'').trim()}
 async function profileFor(row,p){var uid=ownerId(row,p), c=sb();var me=currentUser();if(uid && String(me.id||'')===String(uid))return {id:me.id,full_name:me.name,username:me.handle,avatar_url:me.avatar,badge:me.badge}; if(!c||!uid)return null;try{var r=await c.from('profiles').select('id,full_name,username,avatar_url,badge').eq('id',uid).maybeSingle();if(r&&!r.error&&r.data)return r.data;}catch(e){} return null}
 function clearOldStoryCaches(){
  try{
    var keep=JSON.parse(localStorage.getItem('HAPPYAD_STORIES_CACHE_V1')||'[]')||[];
    window.__HAPPYAD_STORIES_ITEMS_CACHE=keep;
    if(!window.HAPPYAD_STORIES_ITEMS || !window.HAPPYAD_STORIES_ITEMS.length){
      window.HAPPYAD_STORIES_ITEMS=keep;
    }
  }catch(e){}
}
function stableStoryCache(){
  try{
    var now=Date.now();
    var arr=JSON.parse(localStorage.getItem('HAPPYAD_STORIES_CACHE_V1')||'[]')||[];
    arr=arr.filter(function(x){
      var exp=x.expiresAt||x.expires_at||'';
      return !exp || new Date(exp).getTime()>now;
    });
    localStorage.setItem('HAPPYAD_STORIES_CACHE_V1',JSON.stringify(arr));
    return arr;
  }catch(e){return []}
}
 var oldFetch=window.fetchRadarItems;
 window.fetchRadarItems=async function(){var c=sb();if(!c)return [];try{var q=await c.from('happyad_stories').select('*').eq('is_active',true).order('created_at',{ascending:false}).limit(80);if(q.error)throw q.error;var rows=(q.data||[]).filter(function(r){if(!r)return false;if(r.is_active===false||r.deleted===true)return false;if(r.expires_at&&new Date(r.expires_at).getTime()<Date.now())return false;return !!(r.media_url||r.mediaUrl||r.story||r.url)}); if(!rows.length){
  var keep=stableStoryCache();
  window.HAPPYAD_STORIES_ITEMS=keep;
  return keep;
} var views=[];try{var u=await happyadAuthUser(); if(u&&u.id){var ids=rows.map(function(r){return String(r.id)});var vr=await c.from('happyad_story_views').select('story_id').eq('viewer_id',u.id).in('story_id',ids);views=(vr.data||[]).map(function(v){return String(v.story_id)})}}catch(e){} var seen=new Set(views); var items=rows.map(function(r){return {id:String(r.id),sourceId:String(r.id),story_id:String(r.id),mode:'story',type:'story',category:'story',title:r.title||r.user_name||'Story',desc:r.description||r.caption||'',description:r.description||r.caption||'',kind:String(r.media_type||'photo').toLowerCase().indexOf('video')>=0?'video':'photo',mediaType:String(r.media_type||'photo'),mediaUrl:r.media_url||r.mediaUrl||r.story||r.url||'',media_url:r.media_url||r.mediaUrl||r.story||r.url||'',creatorId:r.user_id||'',user_id:r.user_id||'',creatorName:r.user_name||r.display_name||r.creator_name||'Utilisateur HAPPYAD',handle:r.username?('@'+String(r.username).replace(/^@+/,'')):(r.handle||''),avatar:r.user_avatar||r.avatar_url||'',badge:r.badge||r.user_badge||'',createdAt:r.created_at?new Date(r.created_at).getTime():Date.now(),expiresAt:r.expires_at||'',isRadar:true,isLive:false,isSeen:seen.has(String(r.id)),supabase:true,__storyTable:'happyad_stories'};}); try{var ids=[...new Set(items.map(function(x){return String(x.creatorId||'')}).filter(Boolean))]; if(ids.length){var pr=await c.from('profiles').select('id,full_name,username,avatar_url,badge').in('id',ids); var by={};(pr.data||[]).forEach(function(p){by[String(p.id)]=p}); items.forEach(function(x){var p=by[String(x.creatorId)]; if(p){x.creatorName=p.full_name||x.creatorName;x.handle=p.username?('@'+String(p.username).replace(/^@+/,'')):x.handle;x.avatar=p.avatar_url||x.avatar;x.badge=p.badge||'';}})}}catch(e){} window.HAPPYAD_STORIES_ITEMS=items;try{localStorage.setItem('HAPPYAD_STORIES_CACHE_V1',JSON.stringify(items));}catch(e){}return items;}catch(e){
  console.warn('V145 fetch happyad_stories only',e);
  var keep=stableStoryCache();
  window.HAPPYAD_STORIES_ITEMS=keep;
  return keep;
}};
 var oldOpen=window.openHappyadStoryViewer;
 window.openHappyadStoryViewer=window.openCentralStory=window.openProfileStoryPremium=async function(p){ if(!p){try{var arr=await window.fetchRadarItems();p=(arr||[]).find(function(x){var me=currentUser();return String(x.creatorId||x.user_id||'')===String(me.id||'')})||null;}catch(e){} if(!p){alert('Aucune story active');return false;}} var id=storyId(p); if(oldOpen) oldOpen(p); try{var c=sb(),row=null,prof=null;if(c&&id){var q=await c.from('happyad_stories').select('*').eq('id',id).maybeSingle();row=q&&q.data?q.data:null;}prof=await profileFor(row,p); if(prof&&typeof badgeMarkHtml==='function'){var nameEl=document.getElementById('hsvName'); if(nameEl){var nm=(prof.full_name||p.creatorName||p.user_name||'Utilisateur HAPPYAD'); nameEl.innerHTML=String(nm).replace(/[&<>\"]/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[ch]||ch})+badgeMarkHtml(prof.badge);}} }catch(e){} return false;};
 window.openRadarPost=function(p){ if(p&&(String(p.mode||p.type||p.category||'').toLowerCase()==='story'||p.__storyTable==='happyad_stories'||p.isRadar===true))return window.openHappyadStoryViewer(p); try{if(typeof openLongVideo==='function'&&String(p&&p.kind||p&&p.mediaType||'').indexOf('video')>=0)return openLongVideo(p.id); if(typeof openLongPhoto==='function')return openLongPhoto(p.id);}catch(e){} };
 setTimeout(async function(){try{await window.fetchRadarItems(); if(typeof renderRadarHome==='function')renderRadarHome();}catch(e){}},150);
})();


(function(){
  if(window.__HAPPYAD_V154_POINT7_RADAR_BADGE_STABLE__)return; window.__HAPPYAD_V154_POINT7_RADAR_BADGE_STABLE__=true;
  var AUTHOR_CACHE_KEY='HAPPYAD_AUTHOR_PROFILE_CACHE_V1';
  var radarBadgeReady=false;
  var radarBadgeBooting=false;
  function esc(v){return String(v==null?'':v).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]||c});}
  function readCache(){try{return JSON.parse(localStorage.getItem(AUTHOR_CACHE_KEY)||'{}')||{}}catch(e){return {}}}
  function writeCache(c){try{localStorage.setItem(AUTHOR_CACHE_KEY,JSON.stringify(c||{}))}catch(e){}}
  function uidOf(p){return String((p&&(p.creatorId||p.user_id||p.userId||p.ownerId||p.owner_id))||'').trim()}
  function mergeAuthor(p){
    if(!p)return p;
    var c=readCache(), uid=uidOf(p), a=uid?c[uid]:null;
    if(a){
      if(!p.creatorName||p.creatorName==='Utilisateur HAPPYAD'||p.creatorName==='Utilisateur')p.creatorName=a.name||p.creatorName;
      if(!p.user_name)p.user_name=a.name||p.user_name;
      if(!p.handle)p.handle=a.handle||'';
      if(!p.avatar&&!p.avatar_url&&!p.user_avatar)p.avatar=a.avatar||'';
      if(!p.badge||p.badge==='aucun')p.badge=a.badge||p.badge||'';
    }
    return p;
  }
  function rememberAuthors(items){
    var c=readCache();
    (items||[]).forEach(function(p){
      var uid=uidOf(p); if(!uid)return;
      var name=p.creatorName||p.user_name||p.display_name||p.full_name||'';
      var avatar=p.avatar||p.avatar_url||p.user_avatar||'';
      var badge=p.badge||p.userBadge||p.user_badge||'';
      var handle=p.handle||p.username||'';
      if(name||avatar||badge||handle)c[uid]={name:name||((c[uid]||{}).name||''),avatar:avatar||((c[uid]||{}).avatar||''),badge:badge||((c[uid]||{}).badge||''),handle:handle||((c[uid]||{}).handle||'')};
    });
    writeCache(c);
  }
  var oldFetch=window.fetchRadarItems;
  if(typeof oldFetch==='function'){
    window.fetchRadarItems=async function(){
      var items=[];
      try{items=await oldFetch.apply(this,arguments)||[]}catch(e){items=[]}
      items=(items||[]).map(function(x){return mergeAuthor(x)});
      rememberAuthors(items);
      radarBadgeReady=true;
      try{window.HAPPYAD_STORIES_ITEMS=items;localStorage.setItem('HAPPYAD_STORIES_CACHE_V1',JSON.stringify(items));}catch(e){}
      return items;
    };
  }
  var oldPostOwner=window.postOwnerData;
  if(typeof oldPostOwner==='function'){
    window.postOwnerData=function(p){p=mergeAuthor(p);var r=oldPostOwner(p);var a=readCache()[uidOf(p)]||{};if(r){if((!r.badge||r.badge==='aucun')&&a.badge)r.badge=a.badge;if(!r.avatar&&a.avatar)r.avatar=a.avatar;if((!r.name||r.name==='Utilisateur HAPPYAD'||r.name==='Utilisateur')&&a.name)r.name=a.name;}return r;};
  }
  function arr(){try{return (window.HAPPYAD_STORIES_ITEMS||JSON.parse(localStorage.getItem('HAPPYAD_STORIES_CACHE_V1')||'[]')||[]).map(mergeAuthor)}catch(e){return []}}
  function k(p){return String((p&&(p.source_type||p.type||p.mode||p.category))||'').toLowerCase()}
  function isLive(p){return !!(p&&p.isLive===true)||k(p)==='live'}
  function isStory(p){var x=k(p);return x==='story'||(p&&p.isRadar===true&&!isLive(p))}
  function isMine(p){try{return typeof happyadIsMine==='function'&&happyadIsMine(p)}catch(e){return false}}
  function name(p){var a=readCache()[uidOf(p)]||{};return (p&&(p.creatorName||p.user_name||p.title))||a.name||'Utilisateur'}
  function avatar(p){var a=readCache()[uidOf(p)]||{};return String((p&&(p.avatar||p.user_avatar||p.avatar_url||p.userAvatar))||a.avatar||'')}
  function badge(p){var a=readCache()[uidOf(p)]||{};var b=(p&&(p.badge||p.userBadge||p.user_badge))||'';b=String(b||'').trim();if(!b||b==='aucun'||b==='none'||b==='null'||b==='undefined')b=a.badge||'';return b}
  function dist(p){try{return typeof happyadDistanceLabel==='function'?happyadDistanceLabel(p):'1.2 km'}catch(e){return '1.2 km'}}
  function badgeHtml(p){try{return typeof badgeMarkHtml==='function'?badgeMarkHtml(badge(p)):''}catch(e){return ''}}
  function preview(p){var av=avatar(p);if(av)return '<img src="'+esc(av)+'" alt="">';return '<span class="radarInitial">'+esc(String(name(p)).trim().slice(0,1).toUpperCase()||'H')+'</span>';}
  window.renderRadarHome=function(){
    var old=document.getElementById('homeRadarBlock'); if(old)old.remove();
    var chips=document.querySelector('.chips'); if(!chips)return;
    try{if(typeof currentFilter!=='undefined'&&currentFilter!=='all')return;}catch(e){}
    var source=arr().filter(function(p){return p&&isStory(p)&&(!p.expiresAt||new Date(p.expiresAt).getTime()>Date.now())});
    var my=source.filter(function(p){return isMine(p)}).sort(function(a,b){return Number(b.createdAt||0)-Number(a.createdAt||0)});
    var others=source.filter(function(p){return !isMine(p)&&!isLive(p)}).sort(function(a,b){return Number(b.createdAt||0)-Number(a.createdAt||0)});
    var items=[].concat(my.slice(0,1),others).filter(function(p,i,aa){var id=String(p.id||p.source_id||p.sourceId||p.story_id||i);return aa.findIndex(function(x,j){return String(x.id||x.source_id||x.sourceId||x.story_id||j)===id})===i}).slice(0,14);
    var block=document.createElement('section'); block.id='homeRadarBlock'; block.className='radarBlock';
    block.innerHTML='<div class="radarHead"><div class="radarTitle">◎ RADAR <b>pour toi</b></div><a class="mapLite" href="modules/map.html">⌖ Voir sur la carte</a></div><div class="radarRow"></div>';
    var row=block.querySelector('.radarRow');
    var add=document.createElement('a'); add.href='modules/publish.html?mode=story'; add.className='radarItem'; add.innerHTML='<div class="radarAvatar add"><span>+</span></div><div class="radarName">Ta story</div><div class="radarMeta">Poster Story</div>'; row.appendChild(add);
    items.forEach(function(p){
      var b=document.createElement('button'); b.type='button'; b.className='radarItem'; b.style.background='transparent'; b.style.border='0'; b.style.padding='0'; b.style.cursor='pointer';
      var meta=(typeof happyadTimeAgo==='function')?happyadTimeAgo(p.createdAt||p.created_at||p.created_at_ms||p.timestamp||Date.now()):'Story';
b.innerHTML='<div class="radarAvatar '+(p.isSeen?'seen ':'')+'">'+preview(p)+'<i class="typeDot story"></i></div><div class="radarName">'+esc(name(p))+badgeHtml(p)+'</div><div class="radarMeta">'+esc(meta)+'</div>';
      b.onclick=function(e){e.preventDefault();e.stopPropagation();try{window.openRadarPost(p)}catch(_e){}return false};
      row.appendChild(b);
    });
    chips.insertAdjacentElement('afterend',block);
  };
  var st=document.createElement('style'); st.id='happyad-v154-point7-radar-badge-css';
  st.textContent='.radarAvatar.seen{opacity:.82;filter:grayscale(.25)}.radarName{display:flex!important;align-items:center!important;justify-content:center!important;gap:2px!important;width:82px!important;max-width:82px!important;margin:0 auto!important;font-size:9px!important;line-height:1.05!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}.radarName .happyBadgeMark{width:12px!important;height:12px!important;flex:0 0 12px!important;margin-left:1px!important}';
  document.head.appendChild(st);
  async function bootRadarStable(){
    if(radarBadgeBooting)return;
    radarBadgeBooting=true;
    try{if(typeof window.fetchRadarItems==='function')await window.fetchRadarItems();}catch(e){}
    radarBadgeReady=true;
    try{if(typeof window.renderRadarHome==='function')window.renderRadarHome();}catch(e){}
    radarBadgeBooting=false;
  }
  setTimeout(function(){bootRadarStable();},20);
})();


(function(){
  if(window.__HAPPYAD_V154_POINT8_FINAL_BADGE_GUARD__)return; window.__HAPPYAD_V154_POINT8_FINAL_BADGE_GUARD__=true;
  var KEY='HAPPYAD_AUTHOR_PROFILE_CACHE_V1';
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return {}}}
  function write(c){try{localStorage.setItem(KEY,JSON.stringify(c||{}))}catch(e){}}
  function uid(p){return String((p&&(p.creatorId||p.user_id||p.userId||p.ownerId||p.owner_id))||'').trim()}
  function clean(v){v=String(v||'').trim();return (!v||v==='aucun'||v==='none'||v==='null'||v==='undefined')?'':v}
  function merge(p){if(!p)return p;var c=read(), id=uid(p), a=id?(c[id]||{}):{};var b=clean(p.badge)||clean(p.userBadge)||clean(p.user_badge)||clean(a.badge);if(b){p.badge=b;p.userBadge=b;p.user_badge=b;} if(a.avatar&&!p.avatar&&!p.avatar_url&&!p.user_avatar)p.avatar=a.avatar; if(a.name&&(!p.creatorName||p.creatorName==='Utilisateur HAPPYAD'||p.creatorName==='Utilisateur'))p.creatorName=a.name; return p;}
  function remember(list){var c=read();(list||[]).forEach(function(p){var id=uid(p);if(!id)return;var a=c[id]||{};var b=clean(p.badge)||clean(p.userBadge)||clean(p.user_badge)||clean(a.badge);c[id]={name:p.creatorName||p.user_name||a.name||'',avatar:p.avatar||p.avatar_url||p.user_avatar||a.avatar||'',badge:b||a.badge||'',handle:p.handle||p.username||a.handle||''};});write(c)}
  var oldFetch=window.fetchRadarItems;
  if(typeof oldFetch==='function')window.fetchRadarItems=async function(){var r=await oldFetch.apply(this,arguments).catch(function(){return []});r=(r||[]).map(merge);remember(r);try{window.HAPPYAD_STORIES_ITEMS=r;localStorage.setItem('HAPPYAD_STORIES_CACHE_V1',JSON.stringify(r));}catch(e){}return r};
  var oldRender=window.renderRadarHome;
  if(typeof oldRender==='function')window.renderRadarHome=function(){try{window.HAPPYAD_STORIES_ITEMS=(window.HAPPYAD_STORIES_ITEMS||[]).map(merge);remember(window.HAPPYAD_STORIES_ITEMS);}catch(e){}return oldRender.apply(this,arguments)};
})();


(function(){
  if(window.__HAPPYAD_V181_STORY_RING_FINAL__)return; window.__HAPPYAD_V181_STORY_RING_FINAL__=true;
  function sb(){try{return typeof happyadSb==='function'?happyadSb():null}catch(e){return null}}
  async function me(){try{if(typeof happyadAuthUser==='function')return await happyadAuthUser()}catch(e){}return null}
  function sid(p){return String((p&&(p.id||p.story_id||p.sourceId||p.source_id))||'')}
  function owner(p){return String((p&&(p.creatorId||p.user_id||p.owner_id||p.userId))||'')}
  function localSeen(){try{return JSON.parse(localStorage.getItem('HAPPYAD_HOME_RADAR_SEEN_V1')||'{}')||{}}catch(e){return {}}}
  function saveSeen(x){try{localStorage.setItem('HAPPYAD_HOME_RADAR_SEEN_V1',JSON.stringify(x||{}));localStorage.setItem('HAPPYAD_RADAR_REFRESH_NEEDED','1');}catch(e){}}
  function touchCache(ids){ids=(ids||[]).map(String);try{var arr=window.HAPPYAD_STORIES_ITEMS||JSON.parse(localStorage.getItem('HAPPYAD_STORIES_CACHE_V1')||'[]')||[];arr.forEach(function(it){if(ids.indexOf(sid(it))>=0)it.isSeen=true;});window.HAPPYAD_STORIES_ITEMS=arr;localStorage.setItem('HAPPYAD_STORIES_CACHE_V1',JSON.stringify(arr));}catch(e){}}
  async function activeIdsForOwner(ownerId,fallbackId){var out=[];var c=sb();if(c&&ownerId){try{var q=await c.from('happyad_stories').select('id,expires_at,is_active,media_url').eq('user_id',ownerId).eq('is_active',true).order('created_at',{ascending:false}).limit(20);out=(q.data||[]).filter(function(r){return r&&r.media_url&&(!r.expires_at||new Date(r.expires_at).getTime()>Date.now())}).map(function(r){return String(r.id)});}catch(e){}}
    if(!out.length&&fallbackId)out=[String(fallbackId)];return out;}
  async function markStoryRead(p){try{var id=sid(p), oid=owner(p);var ids=await activeIdsForOwner(oid,id);if(!ids.length)return;var ls=localSeen();ids.forEach(function(x){ls[String(x)]=Date.now()});saveSeen(ls);touchCache(ids);var c=sb(), u=await me();if(c&&u&&u.id&&String(oid||'')!==String(u.id)){for(var i=0;i<ids.length;i++){try{await c.from('happyad_story_views').upsert({story_id:String(ids[i]),viewer_id:u.id,viewed_at:new Date().toISOString()},{onConflict:'story_id,viewer_id'});}catch(e){}}}try{if(typeof window.happyadRefreshProfileStoryRing==='function')window.happyadRefreshProfileStoryRing();}catch(e){}try{if(typeof window.renderRadarHome==='function')window.renderRadarHome();}catch(e){}}catch(e){console.warn('v181 mark story read',e)}}
  async function refreshHome(){try{if(typeof window.renderRadarHome==='function')window.renderRadarHome();}catch(e){}try{if(typeof window.fetchRadarItems==='function')await window.fetchRadarItems();}catch(e){}try{if(typeof window.renderRadarHome==='function')window.renderRadarHome();}catch(e){}}
  var oldFetch=window.fetchRadarItems;
  if(typeof oldFetch==='function'&&!oldFetch.__v181){window.fetchRadarItems=async function(){var arr=[];try{arr=await oldFetch.apply(this,arguments)||[]}catch(e){arr=[]}var ls=localSeen();arr.forEach(function(p){if(ls[sid(p)])p.isSeen=true;});window.HAPPYAD_STORIES_ITEMS=arr;try{localStorage.setItem('HAPPYAD_STORIES_CACHE_V1',JSON.stringify(arr));}catch(e){}return arr;};window.fetchRadarItems.__v181=true;}
  var oldOpenStory=window.openHappyadStoryViewer;
  if(typeof oldOpenStory==='function'&&!oldOpenStory.__v181){window.openHappyadStoryViewer=function(p){markStoryRead(p);return oldOpenStory.apply(this,arguments);};window.openHappyadStoryViewer.__v181=true;}
  var oldOpenRadar=window.openRadarPost;
  if(typeof oldOpenRadar==='function'&&!oldOpenRadar.__v181){window.openRadarPost=function(p){var isStory=p&&(p.__storyTable==='happyad_stories'||p.isRadar===true||String(p.mode||p.type||p.category||'').toLowerCase()==='story');if(isStory)markStoryRead(p);return oldOpenRadar.apply(this,arguments);};window.openRadarPost.__v181=true;}
  window.addEventListener('pageshow',function(){setTimeout(refreshHome,220);});
  document.addEventListener('visibilitychange',function(){if(!document.hidden){setTimeout(refreshHome,220);}});
  window.addEventListener('focus',function(){setTimeout(refreshHome,220);});
  setTimeout(refreshHome,220);
})();


(function(){
  if(window.__HAPPYAD_V182_FAST_STORY_NO_FLICKER__)return; window.__HAPPYAD_V182_FAST_STORY_NO_FLICKER__=true;
  function sid(p){return String((p&&(p.id||p.story_id||p.sourceId||p.source_id))||'')}
  function localSeen(){try{return JSON.parse(localStorage.getItem('HAPPYAD_HOME_RADAR_SEEN_V1')||'{}')||{}}catch(e){return {}}}
  function mergeSeen(arr){var ls=localSeen();(arr||[]).forEach(function(p){if(ls[sid(p)])p.isSeen=true;});return arr||[];}
  function renderSeenFirst(){try{window.HAPPYAD_STORIES_ITEMS=mergeSeen(window.HAPPYAD_STORIES_ITEMS||JSON.parse(localStorage.getItem('HAPPYAD_STORIES_CACHE_V1')||'[]')||[]);localStorage.setItem('HAPPYAD_STORIES_CACHE_V1',JSON.stringify(window.HAPPYAD_STORIES_ITEMS));}catch(e){} }
  var oldRender=window.renderRadarHome;
  if(typeof oldRender==='function'&&!oldRender.__v182){window.renderRadarHome=function(){renderSeenFirst();return oldRender.apply(this,arguments);};window.renderRadarHome.__v182=true;}
  var oldFetch=window.fetchRadarItems;
  if(typeof oldFetch==='function'&&!oldFetch.__v182){window.fetchRadarItems=async function(){var arr=await oldFetch.apply(this,arguments).catch(function(){return window.HAPPYAD_STORIES_ITEMS||[]});arr=mergeSeen(arr||[]);window.HAPPYAD_STORIES_ITEMS=arr;try{localStorage.setItem('HAPPYAD_STORIES_CACHE_V1',JSON.stringify(arr));}catch(e){}return arr;};window.fetchRadarItems.__v182=true;}
})();


(function(){
  if(window.__HAPPYAD_V187_STORY_FULLSCREEN_SCROLL_UNLOCK__)return;
  window.__HAPPYAD_V187_STORY_FULLSCREEN_SCROLL_UNLOCK__=true;
  function unlock(){
    try{
      document.documentElement.style.overflow='';
      document.body.style.overflow='';
      document.body.style.position='';
      document.body.style.touchAction='';
      document.body.style.height='';
      document.body.classList.remove('no-scroll','modal-open','story-open','fullscreen-open');
    }catch(e){}
  }
  window.happyadStoryUnlockScroll=unlock;
  window.happyadExitStoryFullscreen=function(){
    try{
      var p=(document.fullscreenElement&&document.exitFullscreen)?document.exitFullscreen():null;
      if(p&&p.catch)p.catch(function(){});
    }catch(e){}
    unlock();
    setTimeout(unlock,60);
    setTimeout(unlock,220);
  };
  document.addEventListener('fullscreenchange',function(){
    try{
      if(!document.fullscreenElement){
        var a=document.getElementById('happyStoryViewer'), b=document.getElementById('happyProfileStoryViewer');
        if(a)a.classList.remove('full');
        if(b)b.classList.remove('full');
        unlock();
      }
    }catch(e){}
  },true);
})();


(function(){
  if(window.__HAPPYAD_V188_STORY_OPTIONS_DESC_SYNC__)return; window.__HAPPYAD_V188_STORY_OPTIONS_DESC_SYNC__=true;
  function $(id){return document.getElementById(id)}
  function sb(){try{return typeof happyadSb==='function'?happyadSb():null}catch(e){return null}}
  function toast(msg){try{if(typeof toastMsg==='function')return toastMsg(msg);if(typeof window.toast==='function')return window.toast(msg)}catch(e){} alert(msg)}
  function ctx(){return window.__HAPPYAD_CURRENT_STORY_CTX||window.__HAPPYAD_STORY_VIEWER_CTX||{}}
  function storyId(c){c=c||ctx();var r=c.row||{},p=c.p||{};return String(c.id||r.id||r.source_id||p.storyId||p.story_id||p.source_id||p.id||'').trim()}
  function uidOf(o){o=o||{};return String(o.user_id||o.owner_id||o.creator_id||o.uid||o.id||'').trim()}
  async function myUid(){try{if(typeof happyadAuthUser==='function'){var u=await happyadAuthUser();if(u&&u.id)return String(u.id)}}catch(e){}try{var u=(window.UserStore&&UserStore.data)||JSON.parse(localStorage.getItem('HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL')||'{}');return String(u.id||u.user_id||localStorage.getItem('HAPPYAD_AUTH_UID')||'')}catch(e){return ''}}
  async function isMine(c){c=c||ctx();if(c.isMine===true)return true;if(c.isMine===false)return false;var mine=await myUid();var owner=uidOf(c.row)||uidOf(c.p);return !!(mine&&owner&&String(mine)===String(owner))}
  function currentDesc(c){c=c||ctx();var r=c.row||{},p=c.p||{};var vals=[r.description,r.caption,r.story_description,r.story_caption,r.desc,p.story_description,p.story_caption,p.storyDesc,p.description,p.caption,p.desc];for(var i=0;i<vals.length;i++){var v=String(vals[i]||'').trim();if(v)return v}return ''}
  function updateLocal(c,txt){try{if(c.row){c.row.description=txt;c.row.caption=txt;c.row.story_description=txt;c.row.story_caption=txt}if(c.p){c.p.description=txt;c.p.caption=txt;c.p.storyDesc=txt;c.p.story_description=txt;c.p.story_caption=txt}}catch(e){}try{var cap=$('hsvCaption');if(cap){cap.textContent=txt;setTimeout(applyCaptionSeeMore,30)}}catch(e){}try{if(window.__HAPPYAD_PROFILE_STORY_ROW)window.__HAPPYAD_PROFILE_STORY_ROW.description=txt}catch(e){}try{var u=JSON.parse(localStorage.getItem('HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL')||'{}');var id=storyId(c);if(String(u.storyId||u.story_id||'')===String(id)||c.isMine===true){u.storyDesc=txt;localStorage.setItem('HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL',JSON.stringify(u));}}catch(e){}}
  window.happyadUpdateStoryDescription=async function(id,txt,c){c=c||ctx();id=String(id||storyId(c)||'').trim();txt=String(txt||'').trim();if(!id){toast('Story introuvable');return false}try{var client=sb();if(client){await client.from('happyad_stories').update({description:txt,caption:txt}).eq('id',id)}}catch(e){console.warn('happyad v188 update desc',e)}updateLocal(c,txt);try{localStorage.setItem('HAPPYAD_STORY_DESC_EDITED_ONCE_'+id,'1');localStorage.setItem('HAPPYAD_STORY_DESC_EDITED_'+id,'1')}catch(e){}return true}
  async function deleteStory(c){c=c||ctx();var id=storyId(c);if(!id)return toast('Story introuvable');if(!(await isMine(c)))return toast('Action refusée : cette story ne vous appartient pas');if(!confirm('Supprimer cette story ?'))return;try{var client=sb();if(client){var q=client.from('happyad_stories').update({is_active:false}).eq('id',id);var mine=await myUid();if(mine)q=q.eq('user_id',mine);await q}}catch(e){console.warn('happyad v188 delete story',e)}try{var u=JSON.parse(localStorage.getItem('HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL')||'{}');if(String(u.storyId||u.story_id||'')===String(id)||c.isMine===true){u.story='';u.storyKind='';u.storyActive=false;u.storyDesc='';delete u.storyId;delete u.story_id;localStorage.setItem('HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL',JSON.stringify(u));}}catch(e){}var box=$('happyStoryViewer');if(box)box.classList.remove('on','full');toast('Story supprimée');try{if(typeof loadPosts==='function')loadPosts();if(typeof window.happyadRefreshProfileStoryRing==='function')window.happyadRefreshProfileStoryRing()}catch(e){} }
  async function editStory(c){c=c||ctx();var id=storyId(c);if(!id)return toast('Story introuvable');if(!(await isMine(c)))return toast('Action refusée : cette story ne vous appartient pas');if(localStorage.getItem('HAPPYAD_STORY_DESC_EDITED_ONCE_'+id)==='1'||localStorage.getItem('HAPPYAD_STORY_DESC_EDITED_'+id)==='1')return toast('Description déjà modifiée une fois');var txt=prompt('Modifier la description de la story',currentDesc(c));if(txt===null)return;await window.happyadUpdateStoryDescription(id,txt,c);toast('Description modifiée')}
  function closeMenu(){var m=$('hsvMoreMenu');if(m)m.remove()}
  window.happyadOpenStoryOptionsMenu=function(e){try{if(e){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation()}}catch(_e){}closeMenu();var c=ctx();isMine(c).then(function(mine){var id=storyId(c);var menu=document.createElement('div');menu.id='hsvMoreMenu';menu.innerHTML='<div class="hsvMenuCard">'+(mine?'<button data-act="edit">Modifier description</button><button class="danger" data-act="delete">Supprimer</button>':'<button data-act="report">Signaler</button><button data-act="hide">Masquer cette story</button>')+'</div>';document.body.appendChild(menu);if(!$('hsvMenuStyleV188')){var st=document.createElement('style');st.id='hsvMenuStyleV188';st.textContent='#hsvMoreMenu{position:fixed;inset:0;z-index:1000001;background:rgba(0,0,0,.28);display:flex;align-items:flex-start;justify-content:flex-end;padding:82px 18px 0 18px;font-family:system-ui,-apple-system,Segoe UI,sans-serif}.hsvMenuCard{min-width:220px;background:#0d1119;border:1px solid rgba(255,255,255,.10);border-radius:18px;overflow:hidden;box-shadow:0 22px 70px rgba(0,0,0,.58)}.hsvMenuCard button{display:block;width:100%;padding:15px 17px;text-align:left;border:0;border-bottom:1px solid rgba(255,255,255,.08);background:transparent;color:#fff;font-size:15px;font-weight:850}.hsvMenuCard button:last-child{border-bottom:0}.hsvMenuCard button.danger{color:#ff6868}';document.head.appendChild(st)}menu.onclick=function(ev){if(ev.target===menu){closeMenu();return}var act=ev.target&&ev.target.getAttribute('data-act');if(!act)return;closeMenu();if(act==='edit')editStory(c);else if(act==='delete')deleteStory(c);else if(act==='report')toast('Story signalée');else if(act==='hide'){try{var h=JSON.parse(localStorage.getItem('HAPPYAD_HIDDEN_STORIES_V1')||'{}');h[id]=Date.now();localStorage.setItem('HAPPYAD_HIDDEN_STORIES_V1',JSON.stringify(h))}catch(e){}var box=$('happyStoryViewer');if(box)box.classList.remove('on');toast('Story masquée')}}});return false};
  document.addEventListener('click',function(e){var b=e.target&&e.target.closest?e.target.closest('#hsvClose,#hsvMore'):null;if(!b)return;window.happyadOpenStoryOptionsMenu(e);},true);
  function applyCaptionSeeMore(){var cap=$('hsvCaption');if(!cap)return;var box=$('happyStoryViewer');if(!box)return;var old=box.querySelector('.hsvSeeMore');if(old)old.remove();cap.classList.remove('expanded');var txt=(cap.textContent||'').trim();if(txt.length>85||cap.scrollHeight>cap.clientHeight+4){var btn=document.createElement('button');btn.type='button';btn.className='hsvSeeMore';btn.textContent='Voir plus';btn.onclick=function(e){e.preventDefault();e.stopPropagation();var on=!cap.classList.contains('expanded');cap.classList.toggle('expanded',on);btn.textContent=on?'Voir moins':'Voir plus'};var card=box.querySelector('.hsvCard')||box;card.appendChild(btn)}}
  var mo=new MutationObserver(function(){setTimeout(applyCaptionSeeMore,30)});function start(){try{mo.observe(document.body,{childList:true,subtree:true,characterData:true});applyCaptionSeeMore()}catch(e){}} if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();


(function(){
  if(window.__HAPPYAD_V189_OWNER_VIEWS_REPLY__)return;window.__HAPPYAD_V189_OWNER_VIEWS_REPLY__=true;
  function $(id){return document.getElementById(id)}
  function sb(){try{return typeof happyadSb==='function'?happyadSb():null}catch(e){return null}}
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function ctx(){return window.__HAPPYAD_CURRENT_STORY_CTX||window.__HAPPYAD_STORY_VIEWER_CTX||{} }
  function storyId(c){c=c||ctx();var r=c.row||{},p=c.p||{};return String(c.id||r.id||r.source_id||p.storyId||p.story_id||p.source_id||p.id||'').trim()}
  function uidOf(o){o=o||{};return String(o.user_id||o.owner_id||o.creator_id||o.uid||o.id||'').trim()}
  async function myUid(){try{if(typeof happyadAuthUser==='function'){var u=await happyadAuthUser();if(u&&u.id)return String(u.id)}}catch(e){}try{var u=(window.UserStore&&UserStore.data)||JSON.parse(localStorage.getItem('HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL')||'{}');return String(u.id||u.user_id||localStorage.getItem('HAPPYAD_AUTH_UID')||'')}catch(e){return ''}}
  async function isMine(c){c=c||ctx();if(c.isMine===true)return true;if(c.isMine===false)return false;var mine=await myUid();var owner=uidOf(c.row)||uidOf(c.p);return !!(mine&&owner&&String(mine)===String(owner))}
  function ensureViewsNode(){var box=$('happyStoryViewer');if(!box)return null;var card=box.querySelector('.hsvCard')||box;var n=$('hsvViews');if(!n){n=document.createElement('button');n.type='button';n.id='hsvViews';n.className='hsvViews';n.innerHTML='<span class="eye"></span><span id="hsvViewsCount">0</span>';var cap=$('hsvCaption');if(cap&&cap.parentNode)cap.parentNode.insertBefore(n,cap);else card.appendChild(n)}return n}
  function ownerIdFromCtx(c){c=c||ctx();return String(uidOf(c.row)||uidOf(c.p)||'').trim()}
  function viewerIdOf(v){return String((v&&(v.viewer_id||v.user_id||v.viewer_uid||v.profile_id||v.uid||v.viewer))||'').trim()}
  function cleanViewerBadge(v){if(v===true||v===1)return 'bleu';var s=String(v==null?'':v).toLowerCase().trim();if(!s||s==='aucun'||s==='none'||s==='false'||s==='0'||s==='null'||s==='undefined')return '';return s}function viewerBadgeFromProfile(p){p=p||{};var vals=[p.badge,p.user_badge,p.badge_type,p.certification,p.certified,p.is_verified,p.verified,p.blue_badge,p.verifyBadge,p.verified_badge,p.role_badge,p.profile_badge];for(var i=0;i<vals.length;i++){var v=cleanViewerBadge(vals[i]);if(v)return v}return ''}
  async function countViews(id){try{var c=sb();if(!c||!id)return 0;var owner=ownerIdFromCtx(ctx());var q=await c.from('happyad_story_views').select('*').eq('story_id',String(id)).limit(1000);var rows=(q&&q.data)||[];var seen={};rows.forEach(function(v){var x=viewerIdOf(v);if(x&&(!owner||String(x)!==String(owner)))seen[x]=1});return Object.keys(seen).length}catch(e){return 0}}
  async function fetchViewers(id){var c=sb();if(!c||!id)return [];var owner=ownerIdFromCtx(ctx());var vr=await c.from('happyad_story_views').select('*').eq('story_id',String(id)).order('viewed_at',{ascending:false}).limit(300);var rows=((vr&&vr.data)||[]).filter(function(v){var x=viewerIdOf(v);return x&&(!owner||String(x)!==String(owner))});var ids=[];rows.forEach(function(v){var x=viewerIdOf(v);if(x&&ids.indexOf(x)<0)ids.push(x)});var liked={};async function addLikedBy(col){try{var lr=await c.from('happyad_content_actions').select('user_id').eq(col,String(id)).in('content_type',['story','photo']).eq('action_type','like').eq('liked',true).limit(1000);((lr&&lr.data)||[]).forEach(function(r){if(r&&r.user_id)liked[String(r.user_id)]=1})}catch(_lk){}}await addLikedBy('post_id');await addLikedBy('content_id');var profiles=[];if(ids.length){try{var pr=await c.from('profiles').select('*').in('id',ids);profiles=(pr&&pr.data)||[]}catch(e){}try{var pr2=await c.from('profiles').select('*').in('user_id',ids);profiles=profiles.concat((pr2&&pr2.data)||[])}catch(e2){}try{var pr3=await c.from('happyad_profiles').select('*').in('user_id',ids);profiles=profiles.concat((pr3&&pr3.data)||[])}catch(e3){}}var map={};profiles.forEach(function(p){function merge(k){if(!k)return;var key=String(k),old=map[key]||{},nb=viewerBadgeFromProfile(p),ob=viewerBadgeFromProfile(old);map[key]=Object.assign({},p,old);if(ob&&!nb){map[key].badge=ob;map[key].user_badge=ob}else if(nb){map[key].badge=nb;map[key].user_badge=nb}}merge(p.id);merge(p.user_id);merge(p.uid)});return rows.map(function(v){var x=viewerIdOf(v);return {view:v,viewer_id:x,liked:!!(liked[String(x)]||liked[String((map[x]||{}).id||'')]||liked[String((map[x]||{}).user_id||'')]||liked[String((map[x]||{}).uid||'')]),profile:map[x]||{id:x,user_id:x}}})}
  function openViewerProfile(p,uid){try{uid=String(uid||p.id||p.user_id||p.uid||'').trim();if(!uid){alert('Profil introuvable: UID absent');return;}var ap={id:uid,user_id:uid,name:p.display_name||p.full_name||p.name||'Utilisateur HAPPYAD',full_name:p.display_name||p.full_name||p.name||'',handle:p.username||p.handle||'',username:p.username||p.handle||'',avatar:p.avatar_url||p.avatar||'',avatar_url:p.avatar_url||p.avatar||'',badge:p.badge||p.user_badge||'',__happyadUidLocked:true};localStorage.setItem('HAPPYAD_ACTIVE_PROFILE',JSON.stringify(ap));var __haUrl='modules/user.html?public=1&uid='+encodeURIComponent(uid);if(window.happyadOpenInternalUrlV492){window.happyadOpenInternalUrlV492(__haUrl,{source:'index-viewer-profile-route-v527'});}else{location.href=__haUrl;}}catch(e){}}
  function renderViewerBadge(b){b=String(b||'').toLowerCase();if(!b||b==='aucun'||b==='none'||b==='false'||b==='0'||b==='null'||b==='undefined')return '';try{if(window.badgeMarkHtml)return window.badgeMarkHtml(b)}catch(e){}if(b.indexOf('bleu')>=0||b.indexOf('blue')>=0||b.indexOf('verify')>=0||b.indexOf('cert')>=0||b==='true'||b==='1')return '<span class="happyBadgeMark blue" title="Badge vérifié"></span>';if(b.indexOf('violet')>=0||b.indexOf('jaune')>=0||b.indexOf('yellow')>=0||b.indexOf('business')>=0)return '<span class="happyBadgeMark yellow" title="Badge vérifié"></span>';return '<span class="happyBadgeMark blue" title="Badge vérifié"></span>'}
  function showViewersModal(items,loading){var old=$('happyStoryViewersModal');if(old)old.remove();var m=document.createElement('div');m.id='happyStoryViewersModal';var html='<div class="hsvmCard"><div class="hsvmHead"><span>Vues story</span><button class="hsvmClose" type="button">×</button></div>';if(loading)html+='<div style="padding:18px 4px;color:#cbd2df;font-weight:800">Chargement...</div>';else if(!items.length)html+='<div style="padding:18px 4px;color:#cbd2df;font-weight:800">Aucune vue pour le moment</div>';(items||[]).forEach(function(it){var p=it.profile||{},uid=it.viewer_id||p.id||p.user_id||'',name=p.display_name||p.full_name||p.name||p.username||'Utilisateur HAPPYAD',av=p.avatar_url||p.avatar||'',badge=p.badge||p.user_badge||p.badge_type||p.certification||p.certified||p.is_verified||p.verified||p.blue_badge||p.verifyBadge||p.verified_badge||p.role_badge||p.profile_badge||'';html+='<div class="hsvmRow" data-happyad-viewer="'+esc(uid)+'"><button type="button" class="hsvmAv" data-happyad-viewer="'+esc(uid)+'">'+(av?'<img src="'+esc(av)+'" alt="">':esc(String(name).slice(0,1).toUpperCase()))+'</button><div class="hsvmName"><b>'+esc(name)+renderViewerBadge(badge)+(it.liked?' <span class="hsvmLikeHeart" title="A aimé la story">♥</span>':'')+'</b></div></div>'});html+='</div>';m.innerHTML=html;document.body.appendChild(m);var close=m.querySelector('.hsvmClose');if(close)close.onclick=function(){m.remove()};m.addEventListener('click',function(e){if(e.target===m)m.remove();var row=e.target&&e.target.closest&&e.target.closest('[data-happyad-viewer]');if(row){var uid=row.getAttribute('data-happyad-viewer');var it=(items||[]).find(function(x){return String(x.viewer_id||x.profile&&x.profile.id||x.profile&&x.profile.user_id||'')===String(uid)});if(it){m.remove();openViewerProfile(it.profile||{},uid)}}})}
  async function apply(){var box=$('happyStoryViewer');if(!box||!box.classList.contains('on'))return;var c=ctx(), id=storyId(c), mine=await isMine(c);var rep=$('hsvReply');if(rep)rep.style.display=mine?'none':'';var v=ensureViewsNode();if(!v)return;if(!mine||!id){v.classList.remove('on');return}v.classList.add('on');var n=await countViews(id);var span=$('hsvViewsCount');if(span)span.textContent=String(n);v.onclick=function(e){e.preventDefault();e.stopPropagation();showViewersModal([],true);fetchViewers(id).then(function(items){showViewersModal(items,false)}).catch(function(){showViewersModal([],false)})}}
  window.happyadApplyStoryOwnerViewsReply=apply;
  document.addEventListener('click',function(e){if(e.target&&e.target.closest&&e.target.closest('#hsvReply')){isMine(ctx()).then(function(mine){if(mine){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();}})}},true);
  function start(){try{apply()}catch(e){}}
  document.addEventListener('happyad:story-opened',function(){setTimeout(apply,60)});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();


(function(){
  if(window.__HAPPYAD_V262_MULTI_STORY_SAFE__)return; window.__HAPPYAD_V262_MULTI_STORY_SAFE__=true;
  function $(id){return document.getElementById(id)}
  function esc(v){return String(v==null?'':v).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]||c})}
  function sb(){try{return typeof happyadSb==='function'?happyadSb():null}catch(e){return null}}
  function readUser(){try{return (window.UserStore&&UserStore.data)||JSON.parse(localStorage.getItem('HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL')||'{}')||{}}catch(e){return {}}}
  async function authUid(){try{if(typeof happyadAuthUser==='function'){var u=await happyadAuthUser();if(u&&u.id)return String(u.id)}}catch(e){}return ''}
  function ownerOf(p){p=p||{};return String(p.creatorId||p.user_id||p.userId||p.ownerId||p.owner_id||p.creator_id||'').trim()}
  function storyId(p){p=p||{};return String(p.sourceId||p.source_id||p.story_id||p.storyId||p.id||'').trim()}
  function isStory(p){var k=String((p&&(p.mode||p.type||p.category||p.source_type||p.sourceType))||'').toLowerCase();return k==='story'||!!(p&&p.__storyTable==='happyad_stories')||!!(p&&p.isRadar===true)}
  function isActiveRow(r){if(!r)return false;if(r.is_active===false||r.active===false||r.deleted===true)return false;var ex=r.expires_at||r.expire_at||r.expired_at;if(ex&&new Date(ex).getTime()<Date.now())return false;return !!(r.media_url||r.mediaUrl||r.story||r.url)}
  function mediaOf(r){return String((r&&(r.media_url||r.mediaUrl||r.story||r.url||r.mediaUrl||r.media))||'')}
  function mtypeOf(r){var t=String((r&&(r.media_type||r.mediaType||r.kind||r.storyKind))||'photo').toLowerCase();return t.indexOf('video')>=0?'video':'photo'}
  function descOf(r){var vals=[r&&r.description,r&&r.caption,r&&r.story_description,r&&r.story_caption,r&&r.desc,r&&r.storyDesc];for(var i=0;i<vals.length;i++){var v=String(vals[i]||'').trim();if(v)return v}return ''}
  function cleanHandle(h){h=String(h||'').trim();return h?h.replace(/^@+/,''):''}
  function badgeHtml(b){try{return typeof badgeMarkHtml==='function'?badgeMarkHtml(b):''}catch(e){return ''}}
  function initials(n){n=String(n||'H').trim();return (n[0]||'H').toUpperCase()}
  function itemToRow(p){p=p||{};return {id:storyId(p),user_id:ownerOf(p),media_url:p.media_url||p.mediaUrl||p.story||p.url||'',media_type:p.media_type||p.mediaType||p.kind||p.storyKind||'photo',description:p.description||p.desc||p.storyDesc||'',caption:p.caption||'',created_at:p.created_at||p.createdAt||'',expires_at:p.expires_at||p.expiresAt||'',user_name:p.creatorName||p.user_name||p.title||'',user_avatar:p.avatar||p.user_avatar||p.avatar_url||'',badge:p.badge||p.userBadge||p.user_badge||'',username:cleanHandle(p.handle||p.username||'')}}
  function rowToItem(r,prof,seen){prof=prof||{};return {id:String(r.id||''),sourceId:String(r.id||''),story_id:String(r.id||''),mode:'story',type:'story',category:'story',title:prof.full_name||prof.name||r.user_name||'Story',desc:descOf(r),description:descOf(r),kind:mtypeOf(r),mediaType:mtypeOf(r),mediaUrl:mediaOf(r),media_url:mediaOf(r),creatorId:String(r.user_id||r.owner_id||''),user_id:String(r.user_id||r.owner_id||''),creatorName:prof.full_name||prof.name||r.user_name||r.display_name||'Utilisateur HAPPYAD',handle:prof.username?('@'+cleanHandle(prof.username)):(r.username?('@'+cleanHandle(r.username)):(r.handle||'')),avatar:prof.avatar_url||prof.avatar||r.user_avatar||r.avatar_url||'',badge:prof.badge||prof.user_badge||r.badge||r.user_badge||'',createdAt:r.created_at?new Date(r.created_at).getTime():Date.now(),expiresAt:r.expires_at||'',isRadar:true,isLive:false,isSeen:!!seen,supabase:true,__storyTable:'happyad_stories'} }
  async function profileFor(owner){var me=readUser();if(owner&&String(owner)===String(me.id||me.user_id||''))return {id:owner,full_name:me.name||me.full_name,username:cleanHandle(me.handle||me.username),avatar_url:me.avatar||me.avatar_url,badge:me.badge||me.userBadge||me.user_badge};var c=sb();if(!c||!owner)return {};try{var q=await c.from('profiles').select('id,full_name,username,avatar_url,badge,user_badge').eq('id',owner).maybeSingle();if(q&&!q.error&&q.data)return q.data}catch(e){}return {}}
  async function fetchRowsForOwner(owner){var c=sb(), rows=[];if(c&&owner){try{var q=await c.from('happyad_stories').select('*').eq('user_id',owner).eq('is_active',true).order('created_at',{ascending:true}).limit(30);rows=(q.data||[]).filter(isActiveRow)}catch(e){}}
    if(!rows.length){try{var all=(window.HAPPYAD_STORIES_ITEMS||JSON.parse(localStorage.getItem('HAPPYAD_STORIES_CACHE_V1')||'[]')||[]).filter(function(p){return isStory(p)&&String(ownerOf(p))===String(owner)});rows=all.map(itemToRow).filter(isActiveRow)}catch(e){}}
    if(!rows.length){var u=readUser();if(owner&&String(owner)===String(u.id||u.user_id||'')&&u.story){rows=[{id:u.storyId||'local-story',user_id:owner,media_url:u.story,media_type:u.storyKind||'photo',description:u.storyDesc||'',created_at:new Date().toISOString()}]}}
    rows.sort(function(a,b){return new Date(a.created_at||0)-new Date(b.created_at||0)});return rows}
  async function markSeen(row){
  row=row||{};

  var id=String(row.id||row.story_id||row.source_id||row.sourceId||'').trim();
  if(!id)return false;

  var viewer=await authUid();
  if(!viewer)return false;

  var owner=String(row.user_id||row.owner_id||row.creator_id||row.creatorId||'').trim();

  try{
    var local=JSON.parse(localStorage.getItem('HAPPYAD_HOME_RADAR_SEEN_V1')||'{}')||{};
    local[id]=Date.now();
    localStorage.setItem('HAPPYAD_HOME_RADAR_SEEN_V1',JSON.stringify(local));
    localStorage.setItem('HAPPYAD_RADAR_REFRESH_NEEDED','1');
    localStorage.setItem('HAPPYAD_HOME_REFRESH_NEEDED','1');
  }catch(e){}

  try{
    var arr=window.HAPPYAD_STORIES_ITEMS||JSON.parse(localStorage.getItem('HAPPYAD_STORIES_CACHE_V1')||'[]')||[];
    arr.forEach(function(it){
      var sid=String(it.id||it.story_id||it.sourceId||it.source_id||'');
      if(sid===id){
        it.isSeen=true;
        it.seen=true;
        it.viewed=true;
      }
    });
    window.HAPPYAD_STORIES_ITEMS=arr;
    localStorage.setItem('HAPPYAD_STORIES_CACHE_V1',JSON.stringify(arr));
  }catch(e){}

  if(owner&&String(viewer)===String(owner))return true;

  try{
    var c=sb();
    if(!c)return false;

    var now=new Date().toISOString();

    var q=await c.from('happyad_story_views')
      .select('story_id,viewer_id')
      .eq('story_id',id)
      .eq('viewer_id',String(viewer))
      .limit(1);

    if(q&&q.error)throw q.error;

    if(q&&q.data&&q.data.length){
      var up=await c.from('happyad_story_views')
        .update({viewed_at:now})
        .eq('story_id',id)
        .eq('viewer_id',String(viewer));

      if(up&&up.error)throw up.error;
    }else{
      var ins=await c.from('happyad_story_views').insert({
        story_id:id,
        viewer_id:String(viewer),
        viewed_at:now
      });

      if(ins&&ins.error)throw ins.error;
    }

    try{
      if(typeof window.renderRadarHome==='function')setTimeout(window.renderRadarHome,40);
      if(typeof window.happyadRefreshProfileStoryRing==='function')setTimeout(window.happyadRefreshProfileStoryRing,70);
    }catch(e){}

    return true;
  }catch(e){
    console.warn('happyad story view non enregistré',e);
    return false;
  }
}
async function saveStoryLike(id,on){
  id=String(id||'').trim();
  if(!id)return false;

  var viewer=await authUid();
  if(!viewer)return false;

  try{
    var c=sb();
    if(!c)return false;

    var now=new Date().toISOString();

    async function saveOneType(type){
      var q=await c.from('happyad_content_actions')
        .select('post_id,content_type,action_type,user_id')
        .eq('post_id',id)
        .eq('content_type',type)
        .eq('action_type','like')
        .eq('user_id',String(viewer))
        .limit(1);

      if(q&&q.error)throw q.error;

      if(q&&q.data&&q.data.length){
        var up=await c.from('happyad_content_actions')
          .update({
            liked:!!on,
            content_id:id,
            created_at:now
          })
          .eq('post_id',id)
          .eq('content_type',type)
          .eq('action_type','like')
          .eq('user_id',String(viewer));

        if(up&&up.error)throw up.error;
      }else{
        var ins=await c.from('happyad_content_actions').insert({
          post_id:id,
          content_id:id,
          content_type:type,
          action_type:'like',
          user_id:String(viewer),
          liked:!!on,
          created_at:now
        });

        if(ins&&ins.error)throw ins.error;
      }
    }

    await saveOneType('story');

    try{
      await saveOneType('photo');
    }catch(e){}

    return true;
  }catch(e){
    console.warn('happyad story like non enregistré',e);
    return false;
  }
}
  function ensureCss(){if($('happyad-v262-multi-story-css'))return;var st=document.createElement('style');st.id='happyad-v262-multi-story-css';st.textContent='#happyStoryViewer{position:fixed!important;inset:0!important;z-index:999999!important;background:rgba(0,0,0,.92)!important;display:none!important;align-items:center!important;justify-content:center!important;color:#fff!important;font-family:system-ui,-apple-system,Segoe UI,sans-serif!important;padding:18px 10px 28px!important;box-sizing:border-box!important}#happyStoryViewer.on{display:flex!important}#happyStoryViewer .hsvCard{position:relative!important;width:min(94vw,540px)!important;height:min(86vh,860px)!important;background:#050507!important;border:1px solid rgba(255,255,255,.12)!important;border-radius:30px!important;overflow:hidden!important;box-shadow:0 25px 90px rgba(0,0,0,.75)!important}#happyStoryViewer .hsvProgress{position:absolute;top:10px;left:14px;right:14px;height:4px;background:transparent;border-radius:0;z-index:9;overflow:visible;display:flex;gap:4px}#happyStoryViewer .hsvProgress .hsvSeg{flex:1 1 0;height:4px;border-radius:99px;background:rgba(255,255,255,.28);overflow:hidden;display:block}#happyStoryViewer .hsvProgress .hsvSeg i{display:block;height:100%;width:0%;background:#fff;border-radius:99px;transform:none;animation:none}#happyStoryViewer .hsvTop{position:absolute;left:0;right:0;top:0;z-index:10;padding:26px 16px 42px;background:linear-gradient(rgba(0,0,0,.74),rgba(0,0,0,.20),rgba(0,0,0,0));display:flex;align-items:center;gap:11px}#happyStoryViewer .hsvBack,#happyStoryViewer .hsvFull,#happyStoryViewer .hsvMore{width:42px;height:42px;border:0!important;border-radius:50%!important;background:rgba(255,255,255,.16)!important;color:#fff!important;font-weight:950;font-size:22px;display:grid;place-items:center;backdrop-filter:blur(10px)}#happyStoryViewer .hsvFull{margin-left:auto;font-size:18px}#happyStoryViewer .hsvAvatar{width:44px;height:44px;border-radius:50%;overflow:hidden;background:#191c23;border:2px solid #ff7a00;display:grid;place-items:center;font-weight:950;flex:0 0 44px}#happyStoryViewer .hsvAvatar img{width:100%;height:100%;object-fit:cover}#happyStoryViewer .hsvName{font-weight:950;font-size:17px;display:flex;align-items:center;gap:5px;white-space:nowrap;max-width:180px;overflow:hidden;text-overflow:ellipsis}#happyStoryViewer .hsvSub{font-size:13px;color:#d7dbe4;margin-top:4px;white-space:nowrap;max-width:190px;overflow:hidden;text-overflow:ellipsis}#happyStoryViewer .hsvMedia{width:100%;height:100%;display:grid;place-items:center;background:#000}#happyStoryViewer,#happyStoryViewer *{-webkit-user-select:none!important;user-select:none!important;-webkit-touch-callout:none!important}#happyStoryViewer .hsvMedia img,#happyStoryViewer .hsvMedia video{width:100%;height:100%;object-fit:cover;background:#000;-webkit-user-drag:none!important;user-drag:none!important;touch-action:manipulation!important}#happyStoryViewer .hsvCaption{position:absolute;left:0;right:0;bottom:70px;z-index:8;padding:80px 26px 10px;background:linear-gradient(rgba(0,0,0,0),rgba(0,0,0,.62));font-weight:850;font-size:16px}#happyStoryViewer .hsvActions{position:absolute;left:14px;right:14px;bottom:14px;z-index:11;display:flex;align-items:center;gap:9px}#happyStoryViewer .hsvAct{border:0;border-radius:999px;background:rgba(15,18,25,.72);color:#fff;font-weight:900;padding:12px 14px}#happyStoryViewer .hsvReply{flex:1;text-align:left;background:rgba(255,255,255,.13);color:#d9dde7}.radarStoryCount{position:absolute!important;right:-2px!important;top:-2px!important;width:18px!important;min-width:18px!important;height:18px!important;padding:0!important;border-radius:999px!important;background:#ff8a00!important;color:#fff!important;border:2px solid #07080d!important;display:flex!important;align-items:center!important;justify-content:center!important;font-size:10px!important;line-height:1!important;font-weight:1000!important;box-shadow:0 2px 8px rgba(0,0,0,.45)!important;z-index:6!important;pointer-events:none!important;margin:0!important;transform:none!important}';document.head.appendChild(st)}
  function ensureViewer(){ensureCss();var box=$('happyStoryViewer');if(!box){box=document.createElement('div');box.id='happyStoryViewer';document.body.appendChild(box)}box.innerHTML='<div class="hsvCard"><div class="hsvProgress" id="hsvProgress"></div><div class="hsvTop"><button class="hsvBack" type="button" id="hsvBack">‹</button><div class="hsvAvatar" id="hsvAvatar"></div><div><div class="hsvName" id="hsvName">Story</div><div class="hsvSub" id="hsvSub">Story HAPPYAD</div></div><button class="hsvFull" type="button" id="hsvFull">⛶</button><button class="hsvMore" type="button" id="hsvMore">⋯</button></div><div class="hsvMedia" id="hsvMedia"></div><div class="hsvCaption" id="hsvCaption"></div><div class="hsvActions"><button class="hsvAct" type="button" id="hsvLike">♡ J’aime</button><button class="hsvAct hsvReply" type="button" id="hsvReply">Répondre...</button><button class="hsvAct" type="button" id="hsvShare">↗ Partage</button></div></div>';function close(){box.classList.remove('on','full');var v=box.querySelector('video');if(v)try{v.pause();v.removeAttribute('src');v.load()}catch(e){}}$('hsvBack').onclick=close;$('hsvFull').onclick=function(e){e.stopPropagation();box.classList.toggle('full')};$('hsvMore').onclick=function(e){e.stopPropagation();if(typeof window.happyadOpenStoryOptionsMenu==='function')return window.happyadOpenStoryOptionsMenu(e)};return box}
  async function openOwnerStories(owner,startId){
    owner=String(owner||'').trim();
    if(!owner)return false;
    var rows=await fetchRowsForOwner(owner);
    if(!rows.length){
      try{if(typeof toast==='function')toast('Aucune story active');else alert('Aucune story active')}catch(e){}
      return false;
    }
    var prof=await profileFor(owner);
    var box=ensureViewer(), ix=0;
    var storyTimer=null, storyRaf=null, storyStartedAt=0, storyDuration=10000, storyElapsed=0, activeFill=null, storyClosed=false, paused=false, pressTimer=null, pressStartX=0, pressStartY=0, longPressed=false;

    if(startId){
      for(var s=0;s<rows.length;s++){
        if(String(rows[s].id||'')===String(startId)){ix=s;break}
      }
    }

    function stopStoryTimer(){
      if(storyTimer){clearTimeout(storyTimer);storyTimer=null}
      if(storyRaf){cancelAnimationFrame(storyRaf);storyRaf=null}
    }

    function closeStoryLocal(){
      storyClosed=true;
      stopStoryTimer();
      hardStopStoryMedia();
      box.classList.remove('on','full','active','show','open');
      box.style.pointerEvents='none';
      box.style.display='none';
      box.style.visibility='hidden';
      box.style.opacity='0';
      unlockAfterStoryClose();
    }

    function hardStopStoryMedia(){
      try{
        box.querySelectorAll('video,audio').forEach(function(m){
          try{m.pause()}catch(e){}
          try{m.muted=true}catch(e){}
          try{m.removeAttribute('autoplay')}catch(e){}
          try{m.removeAttribute('src')}catch(e){}
          try{m.querySelectorAll('source').forEach(function(s){s.removeAttribute('src')})}catch(e){}
          try{m.load()}catch(e){}
        });
      }catch(e){}
      try{
        if(navigator.mediaSession){
          navigator.mediaSession.metadata=null;
          ['play','pause','seekbackward','seekforward','previoustrack','nexttrack','stop'].forEach(function(a){
            try{navigator.mediaSession.setActionHandler(a,null)}catch(_e){}
          });
          try{navigator.mediaSession.playbackState='none'}catch(_e){}
        }
      }catch(e){}
    }

    function unlockAfterStoryClose(){
      try{
        document.body.classList.remove('storyOpen','story-open','modal-open','no-scroll','hsvOpen','fullscreen','storyFullscreen');
        document.documentElement.classList.remove('storyOpen','story-open','modal-open','no-scroll','hsvOpen','fullscreen','storyFullscreen');
        document.body.style.overflow='';
        document.body.style.pointerEvents='';
        document.body.style.touchAction='';
        document.documentElement.style.overflow='';
      }catch(e){}
      try{
        var b=document.getElementById('happyStoryViewer');
        if(b){
          b.classList.remove('on','full','active','show','open');
          b.style.pointerEvents='none';
          b.style.display='none';
          b.style.visibility='hidden';
          b.style.opacity='0';
        }
      }catch(e){}
      try{
        if(document.fullscreenElement && document.exitFullscreen)document.exitFullscreen().catch(function(){});
      }catch(e){}
      setTimeout(function(){
        try{
          var b=document.getElementById('happyStoryViewer');
          if(b && !b.classList.contains('on')){
            b.style.pointerEvents='none';
            b.style.display='none';
            b.style.visibility='hidden';
            b.style.opacity='0';
          }
          document.body.style.pointerEvents='';
        }catch(e){}
      },120);
    }


    var backBtn=$('hsvBack');
    if(backBtn)backBtn.onclick=closeStoryLocal;

    function buildSegments(){
      var p=$('hsvProgress') || box.querySelector('.hsvProgress');
      if(!p)return;
      p.id='hsvProgress';
      p.style.cssText='position:absolute;top:10px;left:14px;right:14px;height:4px;background:transparent;border-radius:0;z-index:30;overflow:visible;display:flex;gap:4px;';
      var html='';
      for(var i=0;i<rows.length;i++){
        html+='<span class="hsvSeg" style="flex:1 1 0;min-width:0;height:4px;border-radius:999px;background:rgba(255,255,255,.28);overflow:hidden;display:block"><i style="display:block;width:0%;height:100%;background:#fff;border-radius:999px;transform:none!important;animation:none!important"></i></span>';
      }
      p.innerHTML=html;
    }

    function resetSegments(n){
      var segs=box.querySelectorAll('#hsvProgress .hsvSeg');
      activeFill=null;
      segs.forEach(function(seg,i){
        var fill=seg.querySelector('i');
        seg.classList.remove('done','active','future');
        if(i<n){
          seg.classList.add('done');
          if(fill){fill.style.transform='none';fill.style.animation='none';fill.style.width='100%';}
        }else if(i===n){
          seg.classList.add('active');
          if(fill){fill.style.transform='none';fill.style.animation='none';fill.style.width='1%';activeFill=fill;}
        }else{
          seg.classList.add('future');
          if(fill){fill.style.transform='none';fill.style.animation='none';fill.style.width='0%';}
        }
      });
    }

    function setProgressPct(pct){
      if(!activeFill)return;
      pct=Math.max(1,Math.min(100,pct));
      activeFill.style.transform='none';
      activeFill.style.animation='none';
      activeFill.style.width=pct+'%';
    }

    function animateSegment(){
      if(storyClosed || paused || !box.classList.contains('on') || !activeFill)return;
      var v=box.querySelector('#hsvMedia video');
      var pct=0;
      if(v && isFinite(v.duration) && v.duration>0){
        storyDuration=Math.max(1000,Math.ceil(v.duration*1000));
        storyElapsed=Math.min(storyDuration,Math.max(0,Math.floor((v.currentTime||0)*1000)));
        pct=Math.min(100,(storyElapsed/storyDuration)*100);
      }else{
        var nowElapsed=storyElapsed + (Date.now()-storyStartedAt);
        pct=Math.min(100,(nowElapsed/storyDuration)*100);
        if(nowElapsed>=storyDuration){
          goNext();
          return;
        }
      }
      setProgressPct(pct);
      storyRaf=requestAnimationFrame(animateSegment);
    }

    function goNext(){
      if(storyClosed || !box.classList.contains('on'))return;
      if(ix >= rows.length-1){
        closeStoryLocal();
        return;
      }
      paint(ix+1);
    }

    function goPrev(){
      if(storyClosed || !box.classList.contains('on'))return;
      paint(ix-1);
    }

    function tickStart(){
      stopStoryTimer();
      storyStartedAt=Date.now();
      var v=box.querySelector('#hsvMedia video');
      if(v){
        animateSegment();
        return;
      }
      storyTimer=setTimeout(function(){
        storyElapsed += Date.now()-storyStartedAt;
        if(storyElapsed>=storyDuration){goNext();return;}
        tickStart();
      },80);
      animateSegment();
    }

    function pauseStory(){
      if(paused || storyClosed)return;
      paused=true;
      var v=box.querySelector('#hsvMedia video');
      if(v && isFinite(v.duration) && v.duration>0){
        storyDuration=Math.max(1000,Math.ceil(v.duration*1000));
        storyElapsed=Math.min(storyDuration,Math.max(0,Math.floor((v.currentTime||0)*1000)));
        try{v.pause()}catch(e){}
      }else{
        storyElapsed += Date.now()-storyStartedAt;
      }
      stopStoryTimer();
      setProgressPct((storyElapsed/storyDuration)*100);
    }

    function resumeStory(){
      if(!paused || storyClosed)return;
      paused=false;
      var v=box.querySelector('#hsvMedia video');
      if(v)try{v.play&&v.play().catch(function(){})}catch(e){}
      tickStart();
    }

    function startAutoNext(r){
      stopStoryTimer();
      paused=false;
      storyElapsed=0;
      storyDuration=10000;
      var mt=mtypeOf(r);
      var v=box.querySelector('#hsvMedia video');

      if(mt==='video' && v){
        var started=false;
        var begin=function(){
          if(started)return;
          if(!(isFinite(v.duration) && v.duration>0))return;
          started=true;
          storyDuration=Math.max(1000,Math.ceil(v.duration*1000));
          storyElapsed=Math.min(storyDuration,Math.max(0,Math.floor((v.currentTime||0)*1000)));
          setProgressPct(Math.max(1,(storyElapsed/storyDuration)*100));
          try{if(v.play)v.play().catch(function(){})}catch(e){}
          tickStart();
        };
        v.onloadedmetadata=begin;
        v.ondurationchange=begin;
        v.oncanplay=begin;
        v.onplaying=function(){ if(!started)begin(); };
        v.ontimeupdate=function(){
          if(paused || !activeFill || !(isFinite(v.duration) && v.duration>0))return;
          storyDuration=Math.max(1000,Math.ceil(v.duration*1000));
          storyElapsed=Math.min(storyDuration,Math.max(0,Math.floor((v.currentTime||0)*1000)));
          setProgressPct((storyElapsed/storyDuration)*100);
        };
        v.onended=function(){goNext();};
        try{if(v.play)v.play().catch(function(){})}catch(e){}
        if(v.readyState>=1)begin();
        setTimeout(function(){if(!started && isFinite(v.duration) && v.duration>0)begin();},900);
      }else{
        storyDuration=10000; /* règle stricte photo = 10 secondes */
        storyElapsed=0;
        setProgressPct(1);
        tickStart();
      }
    }

    buildSegments();

    function paint(n){
      stopStoryTimer();
      paused=false;
      ix=(n+rows.length)%rows.length;
      var r=rows[ix];
      var item=rowToItem(r,prof,false);
      var name=item.creatorName||'Utilisateur HAPPYAD', av=item.avatar||'', media=mediaOf(r), mt=mtypeOf(r);
      $('hsvAvatar').innerHTML=av?'<img src="'+esc(av)+'" alt="">':esc(initials(name));
      $('hsvName').innerHTML=esc(name)+badgeHtml(item.badge);
      $('hsvSub').textContent=(ix+1)+'/'+rows.length+' · Story HAPPYAD';
      $('hsvCaption').textContent=descOf(r);
      $('hsvMedia').innerHTML=mt==='video'?'<video src="'+esc(media)+'" autoplay playsinline webkit-playsinline draggable="false" controlslist="nodownload noplaybackrate" disablepictureinpicture></video>':'<img src="'+esc(media)+'" alt="Story" draggable="false">';
      resetSegments(ix);
      window.__HAPPYAD_CURRENT_STORY_CTX={id:String(r.id||''),row:r,p:item,profile:prof,isMine:String(owner)===String((readUser().id||readUser().user_id||''))};
      var like=$('hsvLike');
if(like)like.onclick=function(e){
  e.stopPropagation();

  var id=String(r.id||r.story_id||r.source_id||'').trim();
  if(!id)return;

  var on=!like.classList.contains('on');
  like.classList.toggle('on',on);
  like.textContent=on?'♥ Aimé':'♡ J’aime';

  saveStoryLike(id,on).then(function(ok){
    if(!ok){
      console.warn('Like story non enregistré');
    }
  });
};
      var rep=$('hsvReply');
      if(rep)rep.onclick=function(e){
        e.stopPropagation();
        var txt=prompt('Répondre à la story de '+name);
        if(txt&&txt.trim())alert('Réponse envoyée');
      };
      var sh=$('hsvShare');
      if(sh)sh.onclick=function(e){
        e.stopPropagation();
        if(navigator.share)navigator.share({title:'HAPPYAD Story',text:name+' sur HAPPYAD'}).catch(function(){});
        else alert('Partage enregistré');
      };
      markSeen(r);
      try{document.dispatchEvent(new CustomEvent('happyad:story-opened'))}catch(e){}
      try{if(window.happyadApplyStoryOwnerViewsReply)setTimeout(window.happyadApplyStoryOwnerViewsReply,80)}catch(e){}
      startAutoNext(r);
    }

    box.style.display='flex';
    box.style.visibility='visible';
    box.style.opacity='1';
    box.style.pointerEvents='auto';
    box.classList.add('on');
    paint(ix);

    var card=box.querySelector('.hsvCard');
    if(card && !card.__haStrictStoryTouch){
      card.__haStrictStoryTouch=true;
      card.addEventListener('contextmenu',function(e){e.preventDefault();e.stopPropagation();return false;},true);
      card.addEventListener('dragstart',function(e){e.preventDefault();e.stopPropagation();return false;},true);

      function point(e){
        var t=e.touches&&e.touches[0]?e.touches[0]:e;
        return {x:t.clientX,y:t.clientY};
      }

      card.addEventListener('pointerdown',function(e){
        if(e.target.closest('button,#hsvLike,#hsvReply,#hsvShare,#hsvMore,#hsvFull,#hsvBack'))return;
        e.preventDefault();
        e.stopPropagation();
        var p=point(e);
        pressStartX=p.x; pressStartY=p.y; longPressed=false;
        if(pressTimer)clearTimeout(pressTimer);
        pressTimer=setTimeout(function(){
          longPressed=true;
          pauseStory();
        },180);
      },true);

      card.addEventListener('pointerup',function(e){
        if(e.target.closest('button,#hsvLike,#hsvReply,#hsvShare,#hsvMore,#hsvFull,#hsvBack'))return;
        e.preventDefault();
        e.stopPropagation();
        if(pressTimer){clearTimeout(pressTimer);pressTimer=null;}
        if(longPressed){
          resumeStory();
          return;
        }
        var rect=card.getBoundingClientRect();
        if(e.clientX>rect.left+rect.width*0.55)goNext();
        else if(e.clientX<rect.left+rect.width*0.45)goPrev();
      },true);

      card.addEventListener('pointercancel',function(){
        if(pressTimer){clearTimeout(pressTimer);pressTimer=null;}
        if(longPressed)resumeStory();
      },true);

      card.addEventListener('pointerleave',function(){
        if(pressTimer){clearTimeout(pressTimer);pressTimer=null;}
        if(longPressed)resumeStory();
      },true);
    }

    return false;
  }
  var oldRadar=window.openRadarPost;
  window.openRadarPost=function(p){if(p&&isStory(p))return openOwnerStories(ownerOf(p),storyId(p));return typeof oldRadar==='function'?oldRadar.apply(this,arguments):false};
  window.openHappyadStoryViewer=function(p){if(p&&isStory(p))return openOwnerStories(ownerOf(p),storyId(p));return false};
  window.openProfileStoryPremium=window.openStoryViewer=function(ownerId){var owner=String(ownerId||'').trim();if(!owner){var u=readUser();owner=String(u.id||u.user_id||'')}return openOwnerStories(owner,'')};
  function sourceItems(){try{return (window.HAPPYAD_STORIES_ITEMS||JSON.parse(localStorage.getItem('HAPPYAD_STORIES_CACHE_V1')||'[]')||[]).filter(isStory)}catch(e){return []}}
  function isMineItem(p){try{return typeof happyadIsMine==='function'&&happyadIsMine(p)}catch(e){var u=readUser();return String(ownerOf(p))===String(u.id||u.user_id||'')}}
  function renderName(p){return (p.creatorName||p.user_name||p.display_name||p.title||'Utilisateur HAPPYAD')}
  function renderAvatar(p){return p.avatar||p.user_avatar||p.avatar_url||p.userAvatar||''}
  function renderBadge(p){return p.badge||p.userBadge||p.user_badge||''}
  var oldRender=window.renderRadarHome;
  window.renderRadarHome=function(){var chips=document.querySelector('.chips');if(!chips){if(typeof oldRender==='function')return oldRender.apply(this,arguments);return}try{if(typeof currentFilter!=='undefined'&&currentFilter!=='all')return}catch(e){}var old=$('homeRadarBlock');if(old)old.remove();var arr=sourceItems().filter(function(p){return !p.expiresAt||new Date(p.expiresAt).getTime()>Date.now()});if(!arr.length){if(typeof oldRender==='function')return oldRender.apply(this,arguments);return}var groups={};arr.forEach(function(p){var o=ownerOf(p)||storyId(p);if(!groups[o])groups[o]=[];groups[o].push(p)});var list=Object.keys(groups).map(function(o){groups[o].sort(function(a,b){return Number(a.createdAt||0)-Number(b.createdAt||0)});return {owner:o,items:groups[o],first:groups[o][groups[o].length-1]}});list.sort(function(a,b){var am=isMineItem(a.first)?1:0,bm=isMineItem(b.first)?1:0;if(am!==bm)return bm-am;return Number(b.first.createdAt||0)-Number(a.first.createdAt||0)});list=list.slice(0,14);var block=document.createElement('section');block.id='homeRadarBlock';block.className='radarBlock';block.innerHTML='<div class="radarHead"><div class="radarTitle">◎ RADAR <b>pour toi</b></div><a class="mapLite" href="modules/map.html">⌖ Voir sur la carte</a></div><div class="radarRow"></div>';var row=block.querySelector('.radarRow');var add=document.createElement('a');add.href='modules/publish.html?mode=story';add.className='radarItem';add.innerHTML='<div class="radarAvatar add"><span>+</span></div><div class="radarName">Ta story</div><div class="radarMeta">Poster Story</div>';row.appendChild(add);list.forEach(function(g){var p=g.first,av=renderAvatar(p),name=renderName(p);var btn=document.createElement('button');btn.type='button';btn.className='radarItem';btn.style.background='transparent';btn.style.border='0';btn.style.padding='0';btn.style.cursor='pointer';btn.innerHTML='<div class="radarAvatar '+(p.isSeen?'seen ':'')+'">'+(av?'<img src="'+esc(av)+'" alt="">':'<span class="radarInitial">'+esc(initials(name))+'</span>')+'<i class="typeDot story"></i>'+(g.items.length>1?'<span class="radarStoryCount">'+g.items.length+'</span>':'')+'</div><div class="radarName">'+esc(name)+badgeHtml(renderBadge(p))+'</div><div class="radarMeta">Story '+g.items.length+'</div>';btn.onclick=function(e){e.preventDefault();e.stopPropagation();openOwnerStories(g.owner,storyId(g.items[0]));return false};row.appendChild(btn)});chips.insertAdjacentElement('afterend',block)};
  setTimeout(function(){try{if(typeof window.fetchRadarItems==='function'){Promise.resolve(window.fetchRadarItems()).then(function(){try{window.renderRadarHome()}catch(e){}})}else window.renderRadarHome()}catch(e){}},250);
})();


(function(){
  if(window.__HAPPYAD_V268_STORY_LIKE_PER_STORY__)return;window.__HAPPYAD_V268_STORY_LIKE_PER_STORY__=true;
  var KEY='HAPPYAD_STORY_LIKES_BY_STORY_V1';
  function $(id){return document.getElementById(id)}
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return {}}}
  function write(o){try{localStorage.setItem(KEY,JSON.stringify(o||{}))}catch(e){}}
  function storyId(){try{var c=window.__HAPPYAD_CURRENT_STORY_CTX||{},r=c.row||{},p=c.p||{};return String(c.id||r.id||r.story_id||r.source_id||p.storyId||p.story_id||p.source_id||p.id||'').trim()}catch(e){return ''}}
  function setBtn(btn,on){if(!btn)return;btn.classList.toggle('on',!!on);btn.textContent=on?'♥ Aimé':'♡ J’aime';}
  async function authUser(){try{var c=(window.happyadSb&&window.happyadSb())||(window.supabaseClient)||(window.sb&&window.sb()); if(!c||!c.auth)return null;var r=await c.auth.getUser();return r&&r.data&&r.data.user?r.data.user:null}catch(e){return null}}
  async function loadRemote(id){
  try{
    var c=(window.happyadSb&&window.happyadSb())||(window.supabaseClient)||(window.sb&&window.sb());
    var u=await authUser();
    if(!c||!u||!id)return null;

    var q=await c.from('happyad_content_actions')
      .select('liked,content_type,created_at')
      .eq('post_id',String(id))
      .eq('action_type','like')
      .eq('user_id',u.id)
      .in('content_type',['story','photo'])
      .order('created_at',{ascending:false})
      .limit(1);

    if(q&&!q.error&&q.data&&q.data.length){
      return !!q.data[0].liked;
    }
  }catch(e){}

  return null;
}

async function saveRemote(id,on){
  try{
    id=String(id||'').trim();
    if(!id)return false;

    var c=(window.happyadSb&&window.happyadSb())||(window.supabaseClient)||(window.sb&&window.sb());
    var u=await authUser();
    if(!c||!u)return false;

    var now=new Date().toISOString();

    async function saveOneType(type){
      var q=await c.from('happyad_content_actions')
        .select('post_id,content_type,action_type,user_id')
        .eq('post_id',id)
        .eq('content_type',type)
        .eq('action_type','like')
        .eq('user_id',u.id)
        .limit(1);

      if(q&&q.error)throw q.error;

      if(q&&q.data&&q.data.length){
        var up=await c.from('happyad_content_actions')
          .update({
            liked:!!on,
            content_id:id,
            created_at:now
          })
          .eq('post_id',id)
          .eq('content_type',type)
          .eq('action_type','like')
          .eq('user_id',u.id);

        if(up&&up.error)throw up.error;
      }else{
        var ins=await c.from('happyad_content_actions').insert({
          post_id:id,
          content_id:id,
          content_type:type,
          action_type:'like',
          user_id:u.id,
          liked:!!on,
          created_at:now
        });

        if(ins&&ins.error)throw ins.error;
      }
    }

    await saveOneType('story');

    try{
      await saveOneType('photo');
    }catch(e){}

    return true;
  }catch(e){
    console.warn('story like save',e);
    return false;
  }
}
  function install(){var btn=$('hsvLike')||$('hpsLike');var id=storyId();if(!btn||!id)return;var map=read();var localKnown=Object.prototype.hasOwnProperty.call(map,id);setBtn(btn,!!map[id]);btn.onclick=function(e){if(e)e.stopPropagation();var now=!btn.classList.contains('on');map=read();map[id]=now;write(map);setBtn(btn,now);saveRemote(id,now).then(function(ok){if(!ok){/* keep local UI stable; no flicker/rollback */}});};if(!localKnown){loadRemote(id).then(function(remote){if(remote===null)return;var m=read();if(!Object.prototype.hasOwnProperty.call(m,id)){m[id]=!!remote;write(m);setBtn(btn,!!remote);}})}
  }
  document.addEventListener('happyad:story-opened',function(){setTimeout(install,30);setTimeout(install,180);});
  window.happyadStoryLikePerStoryNoFlicker=install;
})();


(function(){
  if(window.__HAPPYAD_V272_STORY_AGE_LOADER__)return; window.__HAPPYAD_V272_STORY_AGE_LOADER__=true;
  function $(id){return document.getElementById(id)}
  function esc(v){return String(v==null?'':v).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]||c})}
  function now(){return Date.now()}
  function tsOf(p){
    var v=p&&(p.createdAt||p.created_at||p.created||p.timestamp||p.inserted_at||p.date||p.time);
    if(!v&&p&&p.row)v=p.row.created_at||p.row.createdAt;
    var t=typeof v==='number'?v:new Date(v||0).getTime();
    return isFinite(t)&&t>0?t:0;
  }
  function expired(p){
    try{var e=p&&(p.expiresAt||p.expires_at); if(e&&new Date(e).getTime()<=now())return true;}catch(_e){}
    var t=tsOf(p); return !!(t && now()-t>=24*60*60*1000);
  }
  function ageOf(p){
    var t=tsOf(p); if(!t)return 'à l\'instant';
    var m=Math.max(0,Math.floor((now()-t)/60000));
    if(m<1)return 'à l\'instant';
    if(m<60)return m+' min';
    var h=Math.floor(m/60); if(h<24)return h+'h';
    return '24h';
  }
  function storyId(p){return String((p&&(p.id||p.story_id||p.sourceId||p.source_id))||'')}
  function ownerOf(p){return String((p&&(p.creatorId||p.user_id||p.userId||p.owner_id||p.ownerId))||'')}
  function isStory(p){var k=String((p&&(p.source_type||p.type||p.mode||p.category))||'').toLowerCase();return k==='story'||(p&&p.isRadar===true&&p.isLive!==true)}
  function sourceItems(){try{return (window.HAPPYAD_STORIES_ITEMS||JSON.parse(localStorage.getItem('HAPPYAD_STORIES_CACHE_V1')||'[]')||[]).filter(isStory).filter(function(p){return !expired(p)})}catch(e){return []}}
  function initials(n){n=String(n||'H').trim();return n?n[0].toUpperCase():'H'}
  function badgeHtml(b){try{return typeof badgeMarkHtml==='function'?badgeMarkHtml(b||''):''}catch(e){return ''}}
  function renderName(p){return (p&&(p.creatorName||p.user_name||p.display_name||p.full_name||p.title))||'Utilisateur HAPPYAD'}
  function renderAvatar(p){return (p&&(p.avatar||p.user_avatar||p.avatar_url||p.userAvatar))||''}
  function renderBadge(p){return (p&&(p.badge||p.userBadge||p.user_badge))||''}
  function isMineItem(p){try{return typeof happyadIsMine==='function'&&happyadIsMine(p)}catch(e){try{var u=JSON.parse(localStorage.getItem('happyad_user')||localStorage.getItem('HAPPYAD_USER')||'{}');return String(ownerOf(p))===String(u.id||u.user_id||'')}catch(_e){return false}}}
  function previewHtml(p){var av=renderAvatar(p), nm=renderName(p);return av?'<img src="'+esc(av)+'" alt="">':'<span class="radarInitial">'+esc(initials(nm))+'</span>'}
  function stopAll(){document.querySelectorAll('.radarAvatar.happyadStoryPreparing').forEach(function(el){el.classList.remove('happyadStoryPreparing')})}
  function startOn(btn){stopAll();var av=btn&&btn.querySelector&&btn.querySelector('.radarAvatar');if(av)av.classList.add('happyadStoryPreparing');setTimeout(stopAll,9000)}
  document.addEventListener('happyad:story-opened',function(){setTimeout(stopAll,20);setTimeout(updateViewerAge,40);setTimeout(updateViewerAge,220)});
  function patchOpenWrappers(){
    if(window.__HAPPYAD_V272_OPEN_WRAPPED__)return; window.__HAPPYAD_V272_OPEN_WRAPPED__=true;
    ['openRadarPost','openHappyadStoryViewer','openCentralStory','openProfileStoryPremium','openStoryViewer'].forEach(function(fn){
      var old=window[fn]; if(typeof old!=='function'||old.__v272)return;
      window[fn]=function(){var r=old.apply(this,arguments);setTimeout(updateViewerAge,80);setTimeout(updateViewerAge,320);return r}; window[fn].__v272=true;
    });
  }
  function updateViewerAge(){
    try{
      var sub=$('hsvSub'); if(!sub)return;
      var ctx=window.__HAPPYAD_CURRENT_STORY_CTX||{}, r=ctx.row||{}, p=ctx.p||{};
      var base=String(sub.textContent||'');
      var num=(base.match(/\d+\s*\/\s*\d+/)||['1/1'])[0].replace(/\s+/g,'');
      var a=ageOf(r.created_at||r.createdAt?p:r && Object.keys(r).length?r:p);
      if(r.created_at||r.createdAt)a=ageOf(r); else if(p.createdAt||p.created_at)a=ageOf(p);
      sub.textContent=num+' · '+a;
    }catch(e){}
  }
  var mo=new MutationObserver(function(){updateViewerAge()});
  setTimeout(function(){var sub=$('hsvSub');if(sub)try{mo.observe(sub,{childList:true,characterData:true,subtree:true})}catch(e){}},500);
  var oldRender=window.renderRadarHome;
  window.renderRadarHome=function(){
    patchOpenWrappers();
    var chips=document.querySelector('.chips');
    if(!chips){if(typeof oldRender==='function')return oldRender.apply(this,arguments);return}
    try{if(typeof currentFilter!=='undefined'&&currentFilter!=='all')return}catch(e){}
    var old=$('homeRadarBlock'); if(old)old.remove();
    var arr=sourceItems();
    if(!arr.length){if(typeof oldRender==='function')return oldRender.apply(this,arguments);return}
    var groups={};arr.forEach(function(p){var o=ownerOf(p)||storyId(p);if(!groups[o])groups[o]=[];groups[o].push(p)});
    var list=Object.keys(groups).map(function(o){groups[o].sort(function(a,b){return Number(tsOf(a))-Number(tsOf(b))});return {owner:o,items:groups[o],first:groups[o][groups[o].length-1]}});
    list.sort(function(a,b){var am=isMineItem(a.first)?1:0,bm=isMineItem(b.first)?1:0;if(am!==bm)return bm-am;return Number(tsOf(b.first))-Number(tsOf(a.first))});
    list=list.slice(0,14);
    var block=document.createElement('section');block.id='homeRadarBlock';block.className='radarBlock';
    block.innerHTML='<div class="radarHead"><div class="radarTitle">◎ RADAR <b>pour toi</b></div><a class="mapLite" href="modules/map.html">⌖ Voir sur la carte</a></div><div class="radarRow"></div>';
    var row=block.querySelector('.radarRow');
    var add=document.createElement('a');add.href='modules/publish.html?mode=story';add.className='radarItem';add.innerHTML='<div class="radarAvatar add"><span>+</span></div><div class="radarName">Ta story</div><div class="radarMeta">Poster Story</div>';row.appendChild(add);
    list.forEach(function(g){var p=g.first,av=previewHtml(p),name=renderName(p);var btn=document.createElement('button');btn.type='button';btn.className='radarItem';btn.style.background='transparent';btn.style.border='0';btn.style.padding='0';btn.style.cursor='pointer';btn.innerHTML='<div class="radarAvatar '+(p.isSeen?'seen ':'')+'">'+av+'<i class="typeDot story"></i>'+(g.items.length>1?'<span class="radarStoryCount">'+g.items.length+'</span>':'')+'</div><div class="radarName">'+esc(name)+badgeHtml(renderBadge(p))+'</div><div class="radarMeta">'+esc(ageOf(p))+'</div>';btn.onclick=function(e){e.preventDefault();e.stopPropagation();startOn(btn);try{var start=g.items[0]||p;if(typeof window.openRadarPost==='function')window.openRadarPost(start);else if(typeof window.openHappyadStoryViewer==='function')window.openHappyadStoryViewer(start)}catch(_e){stopAll()}return false};row.appendChild(btn)});
    chips.insertAdjacentElement('afterend',block);
  };
  patchOpenWrappers();
  setTimeout(function(){try{if(typeof window.fetchRadarItems==='function'){Promise.resolve(window.fetchRadarItems()).then(function(){try{window.renderRadarHome()}catch(e){}})}else window.renderRadarHome()}catch(e){}},180);
  setInterval(function(){try{window.renderRadarHome();updateViewerAge()}catch(e){}},180000);
})();


(function(){
  if(window.__HAPPYAD_V225_STORY_FULLSCREEN_PHOTO_FIT__) return;
  window.__HAPPYAD_V225_STORY_FULLSCREEN_PHOTO_FIT__ = true;

  function installCss(){
    if(document.getElementById('happyad-v225-story-fullscreen-photo-fit-css')) return;
    var st=document.createElement('style');
    st.id='happyad-v225-story-fullscreen-photo-fit-css';
    st.textContent = `
      /* V225: bouton plein écran réel + fallback mobile */
      #happyStoryViewer.full,
      #happyProfileStoryViewer.full{
        position:fixed!important;inset:0!important;width:100vw!important;height:100dvh!important;
        padding:0!important;margin:0!important;background:#000!important;z-index:2147483647!important;
        display:flex!important;align-items:center!important;justify-content:center!important;
      }
      #happyStoryViewer.full .hsvCard,
      #happyProfileStoryViewer.full .hpsCard{
        width:100vw!important;height:100dvh!important;max-width:none!important;max-height:none!important;
        border-radius:0!important;border:0!important;box-shadow:none!important;background:#000!important;
      }
      /* Photos story/radar: afficher comme dans le téléphone, sans zoom forcé */
      #happyStoryViewer .hsvMedia img,
      #happyProfileStoryViewer .hpsMedia img{
        width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;
        object-fit:contain!important;object-position:center center!important;background:#000!important;transform:none!important;
      }
      /* Vidéos: conserver un cadrage stable, sans couper inutilement */
      #happyStoryViewer .hsvMedia video,
      #happyProfileStoryViewer .hpsMedia video{
        width:100%!important;height:100%!important;object-fit:contain!important;object-position:center center!important;background:#000!important;
      }
      #happyStoryViewer .hsvFull,
      #happyProfileStoryViewer .hpsFull{
        pointer-events:auto!important;cursor:pointer!important;touch-action:manipulation!important;z-index:999999!important;
      }
      body.happyad-story-fullscreen-lock{overflow:hidden!important;overscroll-behavior:none!important;}
    `;
    document.head.appendChild(st);
  }

  function fsElement(){return document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement || null;}
  function requestFs(el){
    if(!el) return Promise.reject(new Error('no element'));
    var fn = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
    if(!fn) return Promise.reject(new Error('fullscreen api unavailable'));
    try{
      var r = fn.call(el);
      return (r && typeof r.then==='function') ? r : Promise.resolve();
    }catch(e){return Promise.reject(e);}
  }
  function exitFs(){
    var fn = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
    if(!fn) return Promise.resolve();
    try{
      var r = fn.call(document);
      return (r && typeof r.then==='function') ? r : Promise.resolve();
    }catch(e){return Promise.reject(e);}
  }
  function currentViewer(){
    var a=document.getElementById('happyStoryViewer');
    if(a && a.classList.contains('on')) return a;
    var b=document.getElementById('happyProfileStoryViewer');
    if(b && b.classList.contains('on')) return b;
    return a || b || null;
  }
  function setFull(box,on){
    if(!box) return;
    box.classList.toggle('full',!!on);
    document.body.classList.toggle('happyad-story-fullscreen-lock',!!on);
  }
  async function toggleStoryFullscreen(btn){
    installCss();
    var box = btn ? btn.closest('#happyStoryViewer,#happyProfileStoryViewer') : currentViewer();
    if(!box) return;
    var card = box.querySelector('.hsvCard,.hpsCard') || box;
    if(fsElement() || box.classList.contains('full')){
      setFull(box,false);
      if(fsElement()) try{await exitFs();}catch(_e){}
      return;
    }
    setFull(box,true); // fallback immédiat pour Android/Chrome intégré
    try{ await requestFs(card); }catch(_e){ /* fallback CSS déjà actif */ }
  }

  window.happyadToggleStoryFullscreenFinal = toggleStoryFullscreen;
  window.happyadExitStoryFullscreen = function(){
    var a=document.getElementById('happyStoryViewer'), b=document.getElementById('happyProfileStoryViewer');
    setFull(a,false); setFull(b,false);
    if(fsElement()) exitFs().catch(function(){});
  };

  document.addEventListener('click',function(e){
    var btn=e.target && e.target.closest && e.target.closest('#hsvFull,#hpsFull,.hsvFull,.hpsFull');
    if(!btn) return;
    e.preventDefault(); e.stopPropagation();
    toggleStoryFullscreen(btn);
  },true);

  ['fullscreenchange','webkitfullscreenchange','MSFullscreenChange'].forEach(function(ev){
    document.addEventListener(ev,function(){
      if(!fsElement()){
        var a=document.getElementById('happyStoryViewer'), b=document.getElementById('happyProfileStoryViewer');
        if(a) a.classList.remove('full');
        if(b) b.classList.remove('full');
        document.body.classList.remove('happyad-story-fullscreen-lock');
      }
    });
  });

  installCss();
})();


(function(){
  if(window.__HAPPYAD_V228_STORY_FULLSCREEN_BACK_HARD_UNLOCK__) return;
  window.__HAPPYAD_V228_STORY_FULLSCREEN_BACK_HARD_UNLOCK__ = true;

  function fsEl(){return document.fullscreenElement||document.webkitFullscreenElement||document.msFullscreenElement||null;}
  function exitFs(){
    try{
      var fn=document.exitFullscreen||document.webkitExitFullscreen||document.msExitFullscreen;
      if(fn && fsEl()){var r=fn.call(document); if(r&&r.catch) r.catch(function(){});}
    }catch(e){}
  }
  function unlock(){
    try{
      document.documentElement.style.overflow='';
      document.documentElement.style.position='';
      document.documentElement.style.height='';
      document.body.style.overflow='';
      document.body.style.position='';
      document.body.style.height='';
      document.body.style.touchAction='';
      document.body.style.pointerEvents='';
      document.body.classList.remove('happyad-story-fullscreen-lock','no-scroll','modal-open','story-open','fullscreen-open');
    }catch(e){}
  }
  function cleanupViewer(box){
    if(!box) return;
    try{box.classList.remove('on','full','zoom','zoomed','active','open');}catch(e){}
    try{box.removeAttribute('data-fullscreen'); box.removeAttribute('aria-modal');}catch(e){}
    try{
      var vids=box.querySelectorAll('video');
      vids.forEach(function(v){try{v.pause();}catch(_){}});
    }catch(e){}
  }
  function hardClose(){
    var a=document.getElementById('happyStoryViewer');
    var b=document.getElementById('happyProfileStoryViewer');
    cleanupViewer(a); cleanupViewer(b);
    try{var m=document.getElementById('hsvMoreMenu'); if(m) m.remove();}catch(e){}
    try{var m2=document.getElementById('hpsMoreMenu'); if(m2) m2.remove();}catch(e){}
    exitFs();
    unlock();
    setTimeout(unlock,60);
    setTimeout(function(){cleanupViewer(a);cleanupViewer(b);unlock();},180);
    setTimeout(function(){cleanupViewer(a);cleanupViewer(b);unlock();},420);
  }
  window.happyadHardCloseStoryViewer = hardClose;

  var oldExit=window.happyadExitStoryFullscreen;
  window.happyadExitStoryFullscreen=function(){
    try{ if(typeof oldExit==='function') oldExit(); }catch(e){}
    exitFs(); unlock();
    setTimeout(unlock,80);
    setTimeout(unlock,260);
  };

  document.addEventListener('click',function(e){
    var back=e.target && e.target.closest && e.target.closest('#hsvBack,#hpsBack,.hsvBack,.hpsBack');
    if(!back) return;
    e.preventDefault();
    e.stopPropagation();
    if(e.stopImmediatePropagation) e.stopImmediatePropagation();
    hardClose();
    return false;
  },true);

  ['fullscreenchange','webkitfullscreenchange','MSFullscreenChange','visibilitychange'].forEach(function(ev){
    document.addEventListener(ev,function(){
      if(!fsEl()) unlock();
    },true);
  });

  window.addEventListener('pageshow',unlock,true);
  window.addEventListener('popstate',function(){setTimeout(hardClose,0);},true);
})();


(function(){
  function clean(v){return (v==null?'':String(v)).trim();}
  function safeJson(v,d){try{return JSON.parse(v||'');}catch(e){return d;}}
  function firstProfile(){
    var keys=['HAPPYAD_LOGGED_USER','HAPPYAD_CURRENT_USER','HAPPYAD_USER','HAPPYAD_USER_V1','HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL'];
    for(var i=0;i<keys.length;i++){var o=safeJson(localStorage.getItem(keys[i]),null); if(o&&typeof o==='object'&&Object.keys(o).length) return o;}
    return {};
  }
  function idOf(u){return clean(u&&(u.id||u.user_id||u.uid||u.uuid||u.auth_id||u.email||u.handle||u.username||u.name));}
  function nameOf(u){return clean(u&&(u.name||u.full_name||u.display_name||u.username||u.handle));}
  function avatarOf(u){return clean(u&&(u.avatar_url||u.avatar||u.photo_url||u.photo||u.image||u.profile_photo||u.picture));}
  function badgeOf(u){return clean(u&&(u.badge||u.verifiedBadge||u.verifyLevel||u.userBadge||u.user_badge));}
  function sb(){try{return window.happyadSupabase||(window.supabase&&window.supabase.createClient&&(window.happyadSupabase=window.supabase.createClient(window.HAPPYAD_SUPABASE_URL,window.HAPPYAD_SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})));}catch(e){return null;}}
  async function pulse(){
    var c=sb(); if(!c) return;
    var me=firstProfile(), uid=idOf(me); if(!uid) return;
    var row={user_id:uid,name:nameOf(me)||uid,avatar_url:avatarOf(me),badge:badgeOf(me),last_seen:new Date().toISOString()};
    try{await c.from('happyad_presence').upsert(row,{onConflict:'user_id'});return;}catch(e){}
    try{await c.from('happyad_presence').insert(row);}catch(e){}
  }
  pulse(); setInterval(pulse,20000);
  document.addEventListener('visibilitychange',function(){if(!document.hidden) pulse();},true);
  window.addEventListener('focus',pulse,true);
})();


(function(){
  if(window.__HAPPYAD_V426_GUEST_VIEW_ONLY_NO_WRITE__)return;
  window.__HAPPYAD_V426_GUEST_VIEW_ONLY_NO_WRITE__=true;
  var authReady=false, authUid='';
  var USER_KEY='HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL';
  function sb(){try{return (typeof happyadSb==='function'&&happyadSb())||window.happyadSupabase||window.supabaseClient||null}catch(e){return null}}
  function goodId(v){v=String(v||'').trim();return !!(v&&v.indexOf('guest')!==0&&v.indexOf('logged_out')!==0&&v!=='null'&&v!=='undefined');}
  function readLocal(){try{return JSON.parse(localStorage.getItem(USER_KEY)||'{}')||{}}catch(e){return {}}}
  function localUid(){
    try{
      if(localStorage.getItem('HAPPYAD_SESSION_ACTIVE')!=='1')return '';
      var u=readLocal();
      var id=String(localStorage.getItem('HAPPYAD_AUTH_UID')||u.id||u.user_id||'').trim();
      return goodId(id)?id:'';
    }catch(e){return ''}
  }
  function acceptUid(id){
    id=String(id||'').trim();
    if(goodId(id)){
      authUid=id;
      try{localStorage.setItem('HAPPYAD_AUTH_UID',id);localStorage.setItem('HAPPYAD_SESSION_ACTIVE','1');localStorage.removeItem('HAPPYAD_FORCE_LOGOUT');localStorage.removeItem('HAPPYAD_FORCE_LOGOUT_UNTIL');}catch(_e){}
      return id;
    }
    return '';
  }
  async function refreshAuth(){
    var local=localUid();
    if(local){authReady=true;authUid=local;}
    try{
      var c=sb(), user=null;
      if(c&&c.auth&&c.auth.getSession){var gs=await c.auth.getSession();user=gs&&gs.data&&gs.data.session&&gs.data.session.user;}
      if(!user&&c&&c.auth&&c.auth.getUser){var r=await c.auth.getUser();user=r&&r.data&&r.data.user;}
      if(user&&user.id)acceptUid(user.id);
      else if(!authUid)authUid=localUid();
    }catch(e){if(!authUid)authUid=localUid();}
    authReady=true;
    return authUid;
  }
  refreshAuth();
  setTimeout(refreshAuth,120);
  setTimeout(refreshAuth,700);
  window.addEventListener('focus',function(){setTimeout(refreshAuth,60)});
  document.addEventListener('visibilitychange',function(){if(!document.hidden)setTimeout(refreshAuth,60)});
  async function canWrite(){var id=authUid||localUid(); if(id){authUid=id;return true;} id=await refreshAuth(); return !!id;}
  window.happyadGuestViewOnlyCanWrite=canWrite;
  function toast(msg){
    msg=msg||'Connecte-toi pour utiliser cette action.';
    try{if(typeof window.toast==='function'){window.toast(msg);return}}catch(e){}
    try{
      var old=document.getElementById('happyadGuestActionToast'); if(old)old.remove();
      var d=document.createElement('div'); d.id='happyadGuestActionToast'; d.textContent=msg;
      d.style.cssText='position:fixed;left:50%;bottom:88px;transform:translateX(-50%);z-index:999999;background:rgba(15,18,25,.96);color:#fff;border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:10px 14px;font:800 12px system-ui,-apple-system,Segoe UI,sans-serif;box-shadow:0 10px 28px rgba(0,0,0,.45);max-width:92vw;text-align:center;';
      document.body.appendChild(d); setTimeout(function(){try{d.remove()}catch(e){}},6000);
    }catch(e){}
  }
  window.happyadGuestViewOnlyToast=toast;
  function blockedNode(target){
    if(!target||!target.closest)return null;
    return target.closest('[data-card-act="like"],[data-card-act="fav"],[data-card-act="share"],[data-profile-act="like"],[data-profile-act="fav"],[data-profile-act="share"],#publicFollowBtn,#hsvLike,#hsvReply,#hsvShare,#sendComment,.cLike,.cReply,.slideTopRepost,.act[data-act="like"],.act[data-act="fav"],.act[data-act="share"],.act[data-act="repost"],[data-act="repost"]');
  }
  document.addEventListener('click',function(e){
    var n=blockedNode(e.target); if(!n)return;
    if(authUid||localUid())return;
    e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation)e.stopImmediatePropagation();
    toast(authReady?'Connecte-toi pour utiliser cette action.':'Compte en vérification...');
    refreshAuth();
    return false;
  },true);
  document.addEventListener('keydown',function(e){
    try{
      if(authUid||localUid())return;
      var k=e.key||''; var t=e.target;
      if(k==='Enter' && t && t.closest && t.closest('#commentInput,.commentComposer input,.commentInputBar input')){
        e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation)e.stopImmediatePropagation(); toast(authReady?'Connecte-toi pour commenter.':'Compte en vérification...'); refreshAuth(); return false;
      }
    }catch(_e){}
  },true);
  document.addEventListener('submit',function(e){
    if(authUid||localUid())return;
    var f=e.target; if(f&&f.closest&&f.closest('#commentPanel,.commentPanel')){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();toast();return false;}
  },true);
  function blockError(){return new Error('Connecte-toi pour utiliser cette action')}
  function wrapWrite(name){
    try{
      var fn=window[name]; if(typeof fn!=='function'||fn.__happyadGuestWrapped)return;
      var wrapped=async function(){ if(!(await canWrite())) throw blockError(); return fn.apply(this,arguments); };
      wrapped.__happyadGuestWrapped=true; wrapped.__happyadOriginal=fn; window[name]=wrapped;
    }catch(e){}
  }
  function wrapSilent(name){
    try{
      var fn=window[name]; if(typeof fn!=='function'||fn.__happyadGuestWrapped)return;
      var wrapped=async function(){ if(!(await canWrite())) return null; return fn.apply(this,arguments); };
      wrapped.__happyadGuestWrapped=true; wrapped.__happyadOriginal=fn; window[name]=wrapped;
    }catch(e){}
  }
  function applyWraps(){
    ['toggleContentActionSupabase','toggleProfileActionSupabase','togglePhotoActionSupabase','toggleVideoActionSupabase','toggleVideoLikeSupabase','addPhotoCommentSupabase','addVideoCommentSupabase','updateVideoCommentSupabase','deleteVideoCommentSupabase'].forEach(wrapWrite);
    ['happyadMarkVideoViewSupabase','happyadMarkVideoViewFromHome','happyadMarkProfileStorySeen'].forEach(wrapSilent);
  }
  applyWraps(); setTimeout(applyWraps,0); setTimeout(applyWraps,600);
})();


/* V435 — Override final recherche: posts depuis cache direct + haut plein largeur. */
(function(){
  var ROOT_ID='happyadSmartSearchV427';
  var remoteTimer=null;
  var cachedRemotePosts=[];
  var cachedRemoteProfiles=[];

  function qs(id){return document.getElementById(id);}
  function esc(v){return String(v==null?'':v).replace(/[&<>"]/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]||ch;});}
  function clean(v){return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/^@+/,'').replace(/\s+/g,' ').trim();}
  function readJson(k,d){try{var v=JSON.parse(localStorage.getItem(k)||'null');return v==null?d:v;}catch(e){return d;}}
  function writeJson(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
  function initial(v){v=String(v||'H').trim();return (v[0]||'H').toUpperCase();}
  function normBadge(v){v=String(v||'').trim();return (!v||v==='aucun'||v==='none'||v==='null'||v==='undefined')?'':v;}
  function isUuid(v){return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(v||'').trim());}
  function badgeHtml(v){try{if(typeof badgeMarkHtml==='function')return badgeMarkHtml(v);}catch(e){}return normBadge(v)?'<span class="happyBadgeMark '+esc(normBadge(v))+'"></span>':'';}
  function currentQuery(){var input=qs('haSearchInputV427');return input?String(input.value||''):'';}
  function searchOpen(){var root=qs(ROOT_ID);return !!(root&&root.classList&&root.classList.contains('on'));}
  function isCurrentQuery(q){return searchOpen() && clean(currentQuery())===clean(q||'');}

  function rawAvatarValue(p){
    p=p||{};
    return String(p.avatar_url||p.avatarUrl||p.avatar||p.user_avatar||p.userAvatar||p.author_avatar||p.authorAvatar||p.actor_avatar||p.actorAvatar||p.creator_avatar||p.creatorAvatar||p.seller_avatar||p.sellerAvatar||p.photo_url||p.photoUrl||p.photoURL||p.photo||p.profile_photo||p.profilePhoto||p.profile_photo_url||p.profilePhotoUrl||p.profile_picture||p.profilePicture||p.profile_picture_url||p.profilePictureUrl||p.profile_pic||p.profilePic||p.profile_pic_url||p.profilePicUrl||p.picture||p.picture_url||p.pictureUrl||p.image||p.image_url||p.imageUrl||p.user_photo||p.userPhoto||p.user_photo_url||p.userPhotoUrl||p.avatar_image||p.avatarImage||p.avatar_image_url||p.avatarImageUrl||p.photo_profil||p.photoProfil||p.profil_photo||p.profilPhoto||p.profil_image||p.profilImage||p.photo_de_profil||p.photoDeProfil||p.photo_de_profil_url||p.photoDeProfilUrl||p.profile_image_url||p.profileImageUrl||p.profile_image||p.profileImage||p.profil_photo_url||p.profilPhotoUrl||p.profil_image_url||p.profilImageUrl||p.photo_profil_url||p.photoProfilUrl||p.profile_avatar_url||p.profileAvatarUrl||p.profile_avatar||p.profileAvatar||p.avatar_path||p.avatarPath||p.photo_path||p.photoPath||p.profile_photo_path||p.profilePhotoPath||p.profile_picture_path||p.profilePicturePath||p.profile_image_path||p.profileImagePath||'').trim();
  }
  function publicAvatarUrl(v){
    v=String(v||'').trim();
    if(!v||/^blob:/i.test(v))return '';
    if(/^https?:\/\//i.test(v)||/^data:image\//i.test(v))return v;
    if(v.indexOf('/')>-1||/\.(jpg|jpeg|png|webp|gif)(\?|#|$)/i.test(v)){
      var path=v.replace(/^\/+/, '').replace(/^happyad-media\//,'');
      try{var c=(typeof happyadSb==='function')?happyadSb():null;if(c&&c.storage&&c.storage.from){var r=c.storage.from('happyad-media').getPublicUrl(path);if(r&&r.data&&r.data.publicUrl)return r.data.publicUrl;}}catch(e){}
      var base=String(window.HAPPYAD_SUPABASE_URL||'https://txjjyhupbejgjcianrmr.supabase.co').replace(/\/+$/,'');
      return base+'/storage/v1/object/public/happyad-media/'+encodeURI(path);
    }
    return v;
  }
  function normalizeProfile(p){
    p=p||{};
    var id=String(p.id||p.user_id||p.uid||p.uuid||p.auth_id||p.creatorId||p.userId||p.ownerId||'').trim();
    if(!id)return null;
    var handle=String(p.username||p.handle||p.user_name||p.slug||'').replace(/^@+/,'').trim();
    var name=String(p.full_name||p.name||p.display_name||p.creator_name||p.creatorName||p.author_name||p.user_name||handle||'Utilisateur HAPPYAD').trim();
    var avatar=publicAvatarUrl(rawAvatarValue(p));
    return {id:id,name:name,handle:handle,avatar:avatar,avatar_url:avatar,badge:normBadge(p.badge||p.user_badge||p.badge_type||p.role_badge||p.userBadge||p.verified_badge||p.verifiedBadge)};
  }

  function addProfile(map,p){
    p=normalizeProfile(p); if(!p)return;
    var old=map[p.id]||{};
    map[p.id]=Object.assign({},old,p,{name:p.name||old.name,handle:p.handle||old.handle,avatar:p.avatar||old.avatar,badge:p.badge||old.badge});
  }

  function normalizePost(p){
    if(!p)return null;
    var id=String(p.id||p.post_id||p.uuid||p.createdAt||p.created_at||'').trim();
    if(!id)return null;
    return Object.assign({},p,{id:id});
  }

  function addPosts(out,seen,arr){
    if(!Array.isArray(arr))return;
    arr.forEach(function(raw){
      var p=normalizePost(raw); if(!p)return;
      if(String(p.mode||p.type||'').toLowerCase().includes('story'))return;
      if(seen[p.id])return;
      seen[p.id]=1; out.push(p);
    });
  }

  function allLocalPosts(){
    var out=[], seen={};
    try{if(Array.isArray(ALL_POSTS))addPosts(out,seen,ALL_POSTS);}catch(e){}
    try{addPosts(out,seen,window.ALL_POSTS||[]);}catch(e){}
    [
      'HAPPYAD_PUBLISH_POSTS_V2',
      'HAPPYAD_GLOBAL_POSTS_CACHE_V1',
      'HAPPYAD_HOME_POSTS_CACHE_V1',
      'HAPPYAD_POSTS_CACHE_V1',
      'HAPPYAD_CACHED_POSTS_V1',
      'HAPPYAD_FEED_CACHE_V1',
      'HAPPYAD_SEARCH_POSTS_FAST_CACHE_V1'
    ].forEach(function(k){
      var v=readJson(k,null);
      if(Array.isArray(v))addPosts(out,seen,v);
      else if(v&&Array.isArray(v.posts))addPosts(out,seen,v.posts);
      else if(v&&Array.isArray(v.data))addPosts(out,seen,v.data);
    });
    addPosts(out,seen,cachedRemotePosts);
    return out;
  }

  function allProfiles(){
    var map={};
    try{var me=readJson('HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL',{});if(me&&me.id)addProfile(map,me);}catch(e){}
    try{var uid=localStorage.getItem('HAPPYAD_AUTH_UID')||'';var u=readJson('HAPPYAD_USER',{})||{};if(uid)addProfile(map,Object.assign({},u,{id:uid}));}catch(e){}
    try{
      var ac=readJson('HAPPYAD_AUTHOR_PROFILE_CACHE_V1',{})||{};
      Object.keys(ac).forEach(function(id){
        var a=ac[id]||{};
        addProfile(map,{id:id,full_name:a.full_name||a.name||a.display_name,username:a.username||a.handle,avatar_url:a.avatar_url||a.avatar,badge:a.badge});
      });
    }catch(e){}
    allLocalPosts().forEach(function(p){
      addProfile(map,{id:p.creatorId||p.user_id||p.userId||p.ownerId,full_name:p.creatorName||p.display_name||p.creator_name||p.full_name,username:p.username||p.handle,avatar_url:rawAvatarValue(p),badge:p.badge||p.userBadge});
    });
    cachedRemoteProfiles.forEach(function(p){addProfile(map,p);});
    return Object.keys(map).map(function(k){return map[k];}).sort(function(a,b){return String(a.name).localeCompare(String(b.name));});
  }

  function firstMediaFromValue(v){
    if(!v)return '';
    if(typeof v==='string'){
      var s=v.trim();
      if(!s)return '';
      if((s[0]==='['||s[0]==='{')){try{return firstMediaFromValue(JSON.parse(s));}catch(e){}}
      return s;
    }
    if(Array.isArray(v)){
      for(var i=0;i<v.length;i++){var m=firstMediaFromValue(v[i]);if(m)return m;}
      return '';
    }
    if(typeof v==='object'){
      return firstMediaFromValue(v.url||v.src||v.media_url||v.mediaUrl||v.image_url||v.imageUrl||v.photo_url||v.photoUrl||v.video_url||v.videoUrl||v.thumbnail_url||v.thumbnailUrl||v.poster_url||v.posterUrl);
    }
    return '';
  }

  function mediaUrl(p){
    p=p||{};
    return firstMediaFromValue(p.thumbnailUrl||p.thumbnail_url||p.posterUrl||p.poster_url||p.cover_url||p.coverUrl||p.image_url||p.imageUrl||p.photo_url||p.photoUrl||p.mediaUrl||p.media_url||p.video_url||p.videoUrl||p.url||p.media||p.medias||p.images||p.photos||p.files||p.attachments);
  }

  function isVideoPost(p){
    try{if(typeof isVideo==='function')return isVideo(p);}catch(e){}
    var s=String(((p&&p.kind)||'')+' '+((p&&p.mediaType)||'')+' '+((p&&p.media_type)||'')+' '+((p&&p.type)||'')).toLowerCase();
    var u=String(mediaUrl(p)||'');
    return s.indexOf('video')>=0||/\.mp4|\.webm|\.mov/i.test(u);
  }

  function postTitle(p){
    p=p||{};
    return String(p.title||p.name||p.caption||p.description||p.desc||'Publication HAPPYAD').trim().slice(0,80)||'Publication HAPPYAD';
  }

  function postOwner(p){
    p=p||{};
    return String(p.creatorName||p.creator_name||p.display_name||p.full_name||p.user_name||p.owner_name||'Utilisateur HAPPYAD').trim()||'Utilisateur HAPPYAD';
  }

  function postMatches(p,q){
    if(!q)return true;
    var s=clean([postTitle(p),p&&p.desc,p&&p.description,postOwner(p),p&&p.handle,p&&p.username,p&&p.category,p&&p.location,isVideoPost(p)?'video vidéo':'photo publication'].join(' '));
    return s.indexOf(clean(q))>=0;
  }

  function profileMatches(p,q){
    if(!q)return true;
    var s=clean([p.name,p.handle,p.id].join(' '));
    return s.indexOf(clean(q))>=0;
  }

  function pickPosts(q){
    return allLocalPosts().filter(function(p){return postMatches(p,q);}).sort(function(a,b){
      return Number(b.createdAt||b.created_at||b.updated_at||0)-Number(a.createdAt||a.created_at||a.updated_at||0);
    }).slice(0,q?12:5);
  }

  function pickProfiles(q){
    return allProfiles().filter(function(p){return profileMatches(p,q);}).slice(0,q?14:4);
  }

  function ensure(){
    var root=qs(ROOT_ID);
    if(!root){
      root=document.createElement('div');
      root.id=ROOT_ID;
      root.className='haSearchOverlay';
      document.body.appendChild(root);
    }
    root.innerHTML='<div class="haSearchBox"><div class="haSearchHead"><div><b>Recherche HAPPYAD</b></div><button type="button" class="haSearchClose" aria-label="Fermer">×</button></div><div class="haSearchInputWrap"><input id="haSearchInputV427" class="haSearchInput" placeholder="Tape une lettre, un nom, @username ou vidéo" autocomplete="off"></div><div id="haSearchResultsV427" class="haSearchResults"></div></div>';
    root.querySelector('.haSearchClose').onclick=function(){clearTimeout(remoteTimer);root.classList.remove('on');};
    var input=root.querySelector('#haSearchInputV427');
    input.addEventListener('input',function(){
      var q=input.value||'';
      render(q);
      clearTimeout(remoteTimer);
      remoteTimer=setTimeout(function(){fetchRemote(q);},380);
    });
    if(!root.__haSearchClickBound){
      root.__haSearchClickBound=true;
      root.addEventListener('click',function(e){
        var pc=e.target.closest('[data-ha-profile-uid]');
        if(pc){openProfile({id:pc.dataset.haProfileUid,name:pc.dataset.haProfileName,handle:pc.dataset.haProfileHandle,avatar:pc.dataset.haProfileAvatar,badge:pc.dataset.haProfileBadge});return;}
        var post=e.target.closest('[data-ha-post-id]');
        if(post){openPost(post.dataset.haPostId,post.dataset.haPostVideo==='1');return;}
      });
    }
    return root;
  }

  function render(q){
    q=String(q||'');
    var box=qs('haSearchResultsV427'); if(!box)return;
    var profiles=pickProfiles(q);
    var posts=pickPosts(q);
    var html='';

    if(profiles.length){
      html+='<div class="haSearchSection"><div class="haSearchSectionTitle">Profils disponibles</div><div class="haSearchUsersGrid">'+profiles.map(function(p){
        var av=p.avatar?'<img src="'+esc(p.avatar)+'" alt="">':'<span>'+esc(initial(p.name))+'</span>';
        return '<button type="button" class="haSearchUser" data-ha-profile-uid="'+esc(p.id)+'" data-ha-profile-name="'+esc(p.name)+'" data-ha-profile-handle="'+esc(p.handle)+'" data-ha-profile-avatar="'+esc(p.avatar)+'" data-ha-profile-badge="'+esc(p.badge)+'"><div class="haSearchUserTop"><div class="haSearchAvatar">'+av+'</div><div class="haSearchUserText"><b>'+esc(p.name)+badgeHtml(p.badge)+'</b><span>'+(p.handle?'@'+esc(p.handle):'')+'</span></div></div><div class="haSearchUserBottom"><em>Voir</em></div></button>';
      }).join('')+'</div></div>';
    }

    if(posts.length){
      html+='<div class="haSearchSection"><div class="haSearchSectionTitle">Vidéos / publications</div><div class="haSearchPostsList">'+posts.map(function(p){
        var video=isVideoPost(p);
        var thumb=mediaUrl(p);
        var media=thumb?(video?'<div class="haSearchThumbVideo">▶</div><img src="'+esc(thumb)+'" alt="">':'<img src="'+esc(thumb)+'" alt="">'):'<span>'+(video?'▶':'▧')+'</span>';
        return '<button type="button" class="haSearchPost" data-ha-post-id="'+esc(p.id)+'" data-ha-post-video="'+(video?'1':'0')+'"><div class="haSearchThumb">'+media+'</div><div class="haSearchPostText"><b>'+esc(postTitle(p))+'</b><span>'+(video?'Vidéo':'Publication')+' · '+esc(postOwner(p))+'</span></div></button>';
      }).join('')+'</div></div>';
    }
    box.innerHTML=html;
  }

  async function fetchRemote(q){
    try{
      var c=(typeof happyadSb==='function')?happyadSb():null;
      if(!c)return;
      var term=String(q||'').replace(/[%,()]/g,' ').replace(/\s+/g,' ').trim().slice(0,48);
      var postsReq=c.from('happyad_posts').select('*').is('deleted_at',null);
      if(term)postsReq=postsReq.or('title.ilike.%'+term+'%,description.ilike.%'+term+'%,display_name.ilike.%'+term+'%,creator_name.ilike.%'+term+'%');
      postsReq=postsReq.order('created_at',{ascending:false}).limit(term?12:8);
      var pr=await postsReq;
      if(pr&&pr.data&&pr.data.length){
        cachedRemotePosts=pr.data;
        writeJson('HAPPYAD_SEARCH_POSTS_FAST_CACHE_V1',pr.data);
        try{
          if(Array.isArray(pr.data)&&typeof mapHappyPost==='function'&&typeof happyadSaveHomeFastCache==='function'){
            var mappedHome=pr.data.map(mapHappyPost);
            var mergedHome=happyadSaveHomeFastCache([].concat(ALL_POSTS||[],mappedHome));
            if(mergedHome&&mergedHome.length){
              ALL_POSTS=mergedHome;
              HAPPYAD_HOME_RENDER_LIMIT=Math.min(HAPPYAD_HOME_MAX_POSTS,Math.max(HAPPYAD_HOME_RENDER_LIMIT,mergedHome.length));
              if(typeof render==='function')setTimeout(function(){try{render();}catch(_hr){}},80);
            }
          }
        }catch(_homeMerge){}
      }
      try{
        var remoteProfiles=[];
        for(var ti=0;ti<2;ti++){
          var table=ti===0?'profiles':'happyad_profiles';
          try{
            var rr=null;
            if(term){
              try{
                var profReq=c.from(table).select('*').limit(80);
                var filter=table==='profiles'?'full_name.ilike.%'+term+'%,username.ilike.%'+term+'%':'name.ilike.%'+term+'%,full_name.ilike.%'+term+'%,display_name.ilike.%'+term+'%,username.ilike.%'+term+'%,handle.ilike.%'+term+'%';
                rr=await profReq.or(filter);
              }catch(_filtered){rr=null;}
            }
            if(!rr || rr.error){rr=await c.from(table).select('*').limit(term?80:12);}
            var rows=(rr&&rr.data)||[];
            if(term)rows=rows.filter(function(x){var np=normalizeProfile(x);return np&&profileMatches(np,term);});
            if(rows.length)remoteProfiles=remoteProfiles.concat(rows);
          }catch(_p){}
        }
        try{
          var presRows=[];
          if(term){
            try{
              var presReq=c.from('happyad_presence').select('user_id,name,avatar_url,badge,last_seen').limit(60);
              if(isUuid(term)) presReq=presReq.eq('user_id',term);
              else presReq=presReq.ilike('name','%'+String(term).replace(/[%_]/g,' ')+'%').order('last_seen',{ascending:false});
              var ps=await presReq;
              presRows=(ps&&ps.data)||[];
            }catch(_presenceTerm){}
          }else{
            try{var ps0=await c.from('happyad_presence').select('user_id,name,avatar_url,badge,last_seen').order('last_seen',{ascending:false}).limit(20);presRows=(ps0&&ps0.data)||[];}catch(_presenceAll){}
          }
          if(presRows.length){
            remoteProfiles=remoteProfiles.concat(presRows.map(function(x){return Object.assign({id:x.user_id,user_id:x.user_id,full_name:x.name,name:x.name,display_name:x.name,avatar_url:x.avatar_url,badge:x.badge},x);}));
          }
        }catch(_presence){}
        cachedRemoteProfiles=remoteProfiles.length?remoteProfiles:cachedRemoteProfiles;
      }catch(e){}
      if(clean(q) && isCurrentQuery(q))render(q);
    }catch(e){}
  }

  function open(){
    var root=ensure();
    root.classList.add('on');
    clearTimeout(remoteTimer);
    render('');
    fetchRemote('');
    setTimeout(function(){var input=qs('haSearchInputV427');if(input)input.focus();},40);
  }

  function openProfile(p){
    p=normalizeProfile(p);
    if(!p||!p.id){alert('Profil introuvable');return;}
    try{var ap={id:p.id,user_id:p.id,name:p.name,full_name:p.name,handle:p.handle,username:p.handle,avatar:p.avatar,avatar_url:p.avatar,badge:p.badge,source:'home_search_v435',__happyadUidLocked:true}; if(typeof happyadWarmPublicProfileCacheV463==='function'){happyadWarmPublicProfileCacheV463(ap,(typeof allLocalPosts==='function'?allLocalPosts():[]).filter(function(x){return String(happyadOwnerOfPostV463(x))===String(p.id);}),true);}else{localStorage.setItem('HAPPYAD_ACTIVE_PROFILE',JSON.stringify(ap));}}catch(e){}
    if(window.happyadOpenInternalUrlV492){window.happyadOpenInternalUrlV492('modules/user.html?public=1&uid='+encodeURIComponent(p.id));}else{location.href='modules/user.html?public=1&uid='+encodeURIComponent(p.id);}
  }

  function openPost(id,video){
    id=String(id||'').trim(); if(!id)return;
    try{if(video&&typeof openLongVideo==='function'){openLongVideo(id);return;} if(!video&&typeof openLongPhoto==='function'){openLongPhoto(id);return;}}catch(e){}
    if(window.happyadOpenInternalUrlV492){window.happyadOpenInternalUrlV492((video?'modules/video.html':'modules/photo.html')+'?post='+encodeURIComponent(id));}else{location.href=(video?'modules/video.html':'modules/photo.html')+'?post='+encodeURIComponent(id);}
  }

  function install(){
    var btn=qs('homeSearchBtn');
    if(btn){
      btn.onclick=function(e){e.preventDefault();e.stopPropagation();open();return false;};
      btn.setAttribute('aria-label','Recherche profils et publications');
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  setTimeout(install,0);
  setTimeout(install,300);
  setTimeout(install,350);
  window.happyadOpenSmartSearchV435=open;
})();


(function(){
  if(window.__HAPPYAD_V456_GLOBAL_MEDIA_STOP__)return;
  window.__HAPPYAD_V456_GLOBAL_MEDIA_STOP__=true;

  function clearMediaSession(){
    try{
      if(navigator.mediaSession){
        navigator.mediaSession.metadata=null;
        try{navigator.mediaSession.playbackState='none'}catch(e){}
        ['play','pause','seekbackward','seekforward','previoustrack','nexttrack','stop'].forEach(function(a){
          try{navigator.mediaSession.setActionHandler(a,null)}catch(_e){}
        });
      }
    }catch(e){}
  }

  function stopHiddenMedia(forceRemove){
    try{
      document.querySelectorAll('video,audio').forEach(function(m){
        var inStory=m.closest && m.closest('#happyStoryViewer');
        var viewer=document.getElementById('happyStoryViewer');
        var storyOpen=viewer && viewer.classList.contains('on');
        var shouldStop=forceRemove || document.hidden || (inStory && !storyOpen);
        if(!shouldStop)return;
        try{m.pause()}catch(e){}
        try{m.muted=true}catch(e){}
        if(forceRemove || inStory){
          try{m.removeAttribute('autoplay')}catch(e){}
          try{m.removeAttribute('src')}catch(e){}
          try{m.querySelectorAll('source').forEach(function(s){s.removeAttribute('src')})}catch(e){}
          try{m.load()}catch(e){}
        }
      });
    }catch(e){}
    clearMediaSession();
  }

  function unlockStoryOverlay(){
    try{
      var v=document.getElementById('happyStoryViewer');
      if(v && !v.classList.contains('on')){
        v.classList.remove('full','active','show','open');
        v.style.pointerEvents='none';
        v.style.display='none';
        v.style.visibility='hidden';
        v.style.opacity='0';
      }
      document.body.style.pointerEvents='';
      document.body.style.overflow='';
      document.documentElement.style.overflow='';
    }catch(e){}
  }

  document.addEventListener('visibilitychange',function(){
    if(document.hidden)stopHiddenMedia(false);
  },true);

  window.addEventListener('pagehide',function(){stopHiddenMedia(true);unlockStoryOverlay();},true);
  window.addEventListener('popstate',function(){setTimeout(function(){stopHiddenMedia(true);unlockStoryOverlay();},50);},true);

  document.addEventListener('click',function(e){
    if(e.target && e.target.closest && e.target.closest('#hsvBack,.hsvBack,.back,.close,[data-close]')){
      setTimeout(function(){stopHiddenMedia(true);unlockStoryOverlay();},120);
    }
  },true);
})();


(function(){
  if(window.__HAPPYAD_V438_HOME_PRIVATE_FILTER__)return;window.__HAPPYAD_V438_HOME_PRIVATE_FILTER__=true;
  function ids(){try{var a=JSON.parse(localStorage.getItem('HAPPYAD_PRIVATE_POST_IDS_V1')||'[]');return Array.isArray(a)?a.map(String):[]}catch(e){return []}}
  function uid(){try{var u=JSON.parse(localStorage.getItem('HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL')||'{}')||{};return String(u.id||u.user_id||localStorage.getItem('HAPPYAD_AUTH_UID')||'').trim()}catch(e){return ''}}
  function owner(p){p=p||{};return String(p.creatorId||p.user_id||p.creator_id||p.owner_id||p.ownerId||p.userId||'').trim()}
  function rawPrivate(p){p=p||{};var s=String(p.visibility||p.privacy||p.audience||p.status||'').toLowerCase();return ids().indexOf(String(p.id||p.post_id||''))>=0||p.is_private===true||p.private===true||s==='private'||s==='privé'||s==='prive'||!!p.private_at||!!p.privated_at}
  window.happyadHomePostHiddenForPrivacyV438=function(p){var me=uid(),own=owner(p);return !!(rawPrivate(p)&&(!me||!own||String(me)!==String(own)))};
})();


(function(){
  if(window.__HAPPYAD_V475_HOME_FULLSCREEN_ALBUM_NATIVE__)return;
  window.__HAPPYAD_V475_HOME_FULLSCREEN_ALBUM_NATIVE__=true;
  function safeText(v){return String(v==null?'':v);}
  function safeEsc(v){try{return esc(v)}catch(e){return safeText(v).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]||c;});}}
  function ensureBox(){
    var box=document.getElementById('happyadHomePhotoFullscreen');
    if(!box){box=document.createElement('div');box.id='happyadHomePhotoFullscreen';document.body.appendChild(box);}
    box.innerHTML='<div class="haHomeFsCard"><button class="haHomeFsClose" type="button">‹</button><div class="haHomeFsTop"><div class="haHomeFsAvatar"></div><div class="haHomeFsInfo"><b></b><span></span></div><div class="haHomeFsCount"></div></div><div class="haHomeFsMedia"><div class="haHomeFsAlbumTrack"></div></div><div class="haHomeFsActions"></div><div class="haHomeFsCaption"></div></div>';
    return box;
  }
  window.happyadOpenHomePhotoFullscreen=async function(id){
    var p=null;
    try{p=happyadFindHomePhotoPostV466(id);}catch(_find){}
    p=p||{id:id,title:'Publication HAPPYAD'};
    var items=(p&&p.__albumItems&&p.__albumItems.length)?p.__albumItems:[p];
    var idx=Number(p.__startAlbumIndex||0)||0;
    if(idx<0)idx=0;if(idx>=items.length)idx=items.length-1;
    var box=ensureBox();
    var card=box.querySelector('.haHomeFsCard');
    var track=box.querySelector('.haHomeFsAlbumTrack');
    var count=box.querySelector('.haHomeFsCount');
    var cap=box.querySelector('.haHomeFsCaption');
    var acts=box.querySelector('.haHomeFsActions');
    var close=box.querySelector('.haHomeFsClose');
    var av=box.querySelector('.haHomeFsAvatar');
    var nm=box.querySelector('.haHomeFsInfo b');
    var sub=box.querySelector('.haHomeFsInfo span');
    function ownerFor(it){
      var o={};
      try{o=postOwnerData(it||p)||{};}catch(_o){}
      if(!o.name&&!o.avatar){try{o=postOwnerData(p)||{};}catch(_p){}}
      return o||{};
    }
    function renderFsActions(it){
      try{
        if(!acts)return;
        it=it||p;
        acts.innerHTML='<button class="haHomeFsAct" data-card-act="like" type="button" aria-label="J’aime"><span class="haFsSvg"><svg viewBox="0 0 24 24"><path d="M20.8 4.6c-1.9-1.7-4.9-1.5-6.6.5L12 7.6 9.8 5.1C8.1 3.1 5.1 2.9 3.2 4.6 1.1 6.5 1 9.7 3 11.7l9 8.6 9-8.6c2-2 1.9-5.2-.2-7.1z"/></svg></span><small>0</small></button><button class="haHomeFsAct" data-card-act="comment" type="button" aria-label="Commentaires"><span class="haFsSvg"><svg viewBox="0 0 24 24"><path d="M21 11.5a8.5 8.5 0 0 1-9 8.5 9.6 9.6 0 0 1-4-.9L3 20l1.1-4.2A8.3 8.3 0 0 1 3 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5z"/></svg></span><small>0</small></button><button class="haHomeFsAct" data-card-act="share" type="button" aria-label="Partager"><span class="haFsSvg"><svg viewBox="0 0 24 24"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v14"/></svg></span><small>0</small></button>';
        acts.onclick=function(e){e.stopPropagation();};
        if(typeof registerLikeCard==='function')registerLikeCard(acts,{id:(it.id||p.id)});
        if(typeof bindAction==='function')bindAction(acts,it,it.title||p.title||'Publication HAPPYAD');
        if(typeof refreshCardAction==='function')refreshCardAction(acts,it.id||p.id);
        try{if(typeof loadContentActionsFromSupabase==='function')loadContentActionsFromSupabase(it.id||p.id,'photo');}catch(_load){}
      }catch(_a){}
    }
    function renderMeta(i){
      idx=Math.max(0,Math.min(items.length-1,Number(i)||0));
      var it=items[idx]||p;
      var owner=ownerFor(it);
      try{nm.innerHTML='<span class="haHomeFsNameText">'+safeEsc(owner.name||'Utilisateur HAPPYAD')+'</span>'+badgeMarkHtml(owner.badge||'');}
      catch(_n){nm.textContent=owner.name||'Utilisateur HAPPYAD';}
      try{sub.textContent=happyadTimeAgo(happyadPostTimestamp(it||p));}catch(_t){sub.textContent='';}
      av.innerHTML=owner.avatar?'<img src="'+safeEsc(owner.avatar)+'" alt="">':safeEsc((typeof initials==='function'?initials(owner.name||'H'):'H'));
      count.textContent=items.length>1?(idx+1)+'/'+items.length:'';
      try{cap.dataset.expanded='0';happyadRenderHomeFsCaptionV468(cap,it);}catch(_c){cap.textContent=safeText((it&&it.title)||p.title||'');}
      renderFsActions(it);
    }
    function closeFs(){
      box.classList.remove('on');
      document.body.classList.remove('haHomePhotoFsLock');
      try{track.innerHTML='';}catch(_e){}
    }
    close.onclick=function(e){e.preventDefault();e.stopPropagation();closeFs();return false;};
    card.onclick=function(e){e.stopPropagation();};
    box.onclick=function(e){if(e.target===box)closeFs();};
    items.forEach(function(it,i){
      it=it||p;
      var slide=document.createElement('div');
      slide.className='haHomeFsAlbumSlide';
      slide.dataset.index=String(i);
      slide.innerHTML='<div class="haHomeFsSlideLoading">Chargement...</div>';
      track.appendChild(slide);
      (async function(slide,it){
        try{
          var url='';
          try{url=await happyadMediaUrlForPost(it);}catch(_u){}
          if(!url){slide.innerHTML='<div class="haHomeFsSlideLoading">Média introuvable</div>';return;}
          var im=document.createElement('img');
          im.loading='eager';im.decoding='async';im.alt='';
          im.onload=function(){try{var l=slide.querySelector('.haHomeFsSlideLoading');if(l)l.remove();}catch(_l){}};
          im.onerror=function(){slide.innerHTML='<div class="haHomeFsSlideLoading">Média introuvable</div>';};
          im.src=url;
          slide.appendChild(im);
        }catch(e){slide.innerHTML='<div class="haHomeFsSlideLoading">Erreur média</div>';}
      })(slide,it);
    });
    var raf=0,last=-1;
    function nearest(){
      var slides=[].slice.call(track.querySelectorAll('.haHomeFsAlbumSlide'));
      if(!slides.length)return 0;
      var center=track.scrollLeft+(track.clientWidth/2),best=0,bd=1e9;
      slides.forEach(function(sl,i){var c=sl.offsetLeft+(sl.offsetWidth/2),d=Math.abs(c-center);if(d<bd){bd=d;best=i;}});
      return best;
    }
    track.addEventListener('scroll',function(){
      if(raf)return;
      raf=requestAnimationFrame(function(){
        raf=0;
        var n=nearest();
        if(n!==last){last=n;renderMeta(n);}
      });
    },{passive:true});
    document.body.classList.add('haHomePhotoFsLock');
    box.classList.add('on');
    renderMeta(idx);last=idx;
    requestAnimationFrame(function(){
      var sl=track.querySelectorAll('.haHomeFsAlbumSlide')[idx];
      if(sl)track.scrollLeft=sl.offsetLeft;
    });
  };
})();


(function(){
  if(window.__HAPPYAD_V480_PUBLICITE_CLICK_FULL__)return;
  window.__HAPPYAD_V480_PUBLICITE_CLICK_FULL__=true;
  function clean(v){return String(v==null?'':v).trim()}
  function allPosts(){try{if(typeof ALL_POSTS!=='undefined'&&Array.isArray(ALL_POSTS))return ALL_POSTS}catch(e){}try{return Array.isArray(window.ALL_POSTS)?window.ALL_POSTS:[]}catch(e){return []}}
  function sIdx(){try{return Number(typeof sponsorIndex!=='undefined'?sponsorIndex:(window.sponsorIndex||0))||0}catch(e){return 0}}
  function findSponsorPost(ad){
    try{if(ad&&ad.__happyadSponsorPost)return ad.__happyadSponsorPost}catch(e){}
    try{var pid=clean(ad&&ad.dataset&&ad.dataset.postId);if(pid){var by=allPosts().find(function(p){return String(p&&p.id)===String(pid)});if(by)return by;}}catch(e){}
    try{var a=(typeof happyadSponsorSourceItems==='function'?happyadSponsorSourceItems():allPosts());if(a.length)return a[sIdx()%a.length]}catch(e){}
    return null;
  }
  function ownerId(p){p=p||{};return clean(p.creatorId||p.creator_id||p.user_id||p.userId||p.ownerId||p.owner_id||p.uid||p.profile_id)}
  function profileFromPost(p){
    try{
      p=p||{};var uid=ownerId(p);if(!uid)return false;
      if(typeof happyadOpenPublicProfileFromPostV417==='function')return happyadOpenPublicProfileFromPostV417(p);
      var ap={id:uid,user_id:uid,name:p.creatorName||p.creator_name||p.display_name||p.full_name||p.name||'Utilisateur HAPPYAD',full_name:p.creatorName||p.creator_name||p.display_name||p.full_name||p.name||'Utilisateur HAPPYAD',handle:p.handle||p.username||'',username:p.username||p.handle||'',avatar:p.avatar||p.avatar_url||p.creator_avatar||p.author_avatar||'',avatar_url:p.avatar_url||p.avatar||p.creator_avatar||p.author_avatar||'',badge:p.badge||p.user_badge||'',source:'sponsor_float_v480',postId:p.id||'',__happyadUidLocked:true};
      try{localStorage.setItem('HAPPYAD_ACTIVE_PROFILE',JSON.stringify(ap))}catch(e){}
      if(window.happyadOpenInternalUrlV492){window.happyadOpenInternalUrlV492('modules/user.html?public=1&uid='+encodeURIComponent(uid)+(p.id?'&post='+encodeURIComponent(p.id):''));}else{location.href='modules/user.html?public=1&uid='+encodeURIComponent(uid)+(p.id?'&post='+encodeURIComponent(p.id):'');}
      return false;
    }catch(e){return false;}
  }
  function openPost(p,ad){
    try{
      p=p||{};if(!p.id)return false;
      try{if(typeof happyadPhotoFastOpenPayload==='function')happyadPhotoFastOpenPayload(p.id)}catch(e){}
      try{window.__happyadPhotoReturnSourceV478={id:String(p.id),scrollY:window.scrollY||document.documentElement.scrollTop||0,at:Date.now(),el:ad||null}}catch(e){}
      if(typeof isVideo==='function'&&isVideo(p)){if(typeof openLongVideo==='function')openLongVideo(p.id);else location.href='modules/video.html?post='+encodeURIComponent(p.id);}
      else{if(typeof openLongPhoto==='function')openLongPhoto(p.id);else location.href='modules/photo.html?post='+encodeURIComponent(p.id);}
      return false;
    }catch(e){return false;}
  }
  function cleanOldSponsor(ad){
    try{
      if(!ad)return;
      var p=findSponsorPost(ad);if(p){ad.__happyadSponsorPost=p;if(p.id)ad.dataset.postId=String(p.id)}
      ad.querySelectorAll('.sponsorText,.sponsorDescWrap,.sponsorDesc,.sponsorMeta,.sponsorLiveDot').forEach(function(x){try{x.remove()}catch(e){x.style.display='none'}});
    }catch(e){}
  }
  function install(){
    var track=document.getElementById('sponsorTrack');if(!track)return;
    track.querySelectorAll('.sponsorAd').forEach(cleanOldSponsor);
    if(!track.__happyadV480Click){
      track.__happyadV480Click=true;
      track.addEventListener('click',function(e){
        var ad=e.target&&e.target.closest&&e.target.closest('.sponsorAd');if(!ad)return;
        var p=findSponsorPost(ad)||{};
        e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
        if(e.target.closest('.sponsorCreatorFloat'))return profileFromPost(p);
        return openPost(p,ad);
      },true);
    }
    if(!track.__happyadV480Mo){try{track.__happyadV480Mo=new MutationObserver(function(){setTimeout(install,20)});track.__happyadV480Mo.observe(track,{childList:true,subtree:true});}catch(e){}}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  setTimeout(install,200);setTimeout(install,800);setTimeout(install,1800);
})();


(function(){
  if(window.__HAPPYAD_V491_PWA_APP_LAUNCHER__)return;
  window.__HAPPYAD_V491_PWA_APP_LAUNCHER__=true;

  function registerServiceWorker(){
    try{
      if(window.__HAPPYAD_PWA_DISABLED__)return;
      if(!('serviceWorker' in navigator))return;
      if(location.protocol!=='https:' && location.hostname!=='localhost' && location.hostname!=='127.0.0.1')return;
      navigator.serviceWorker.register('./service-worker.js',{scope:'./',updateViaCache:'none'}).then(function(reg){
        try{if(reg.waiting)reg.waiting.postMessage({type:'HAPPYAD_SKIP_WAITING'});}catch(_w){}
        try{
          if(navigator.serviceWorker.controller){
            navigator.serviceWorker.controller.postMessage({type:'HAPPYAD_CLEAR_OLD_CACHES'});
          }
        }catch(_m){}
      }).catch(function(e){try{console.warn('HAPPYAD PWA SW',e)}catch(_w){}});
    }catch(e){}
  }
  function tryOpenLaunchView(){ return; }

  registerServiceWorker();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(function(){tryOpenLaunchView(0)},250)},{once:true});
  else setTimeout(function(){tryOpenLaunchView(0)},250);
})();


(function(){
  if(window.__HAPPYAD_V493_MODULE_DEEPLINK_STARTER__)return;
  window.__HAPPYAD_V493_MODULE_DEEPLINK_STARTER__=true;
  function getParam(name){try{return new URLSearchParams(location.search||'').get(name)||''}catch(e){return ''}}
  function norm(v){try{return decodeURIComponent(String(v||''));}catch(e){return String(v||'')}}
  function appUrl(){
    var direct=norm(getParam('module_url'));
    if(direct)return direct;
    var app=String(getParam('app')||getParam('open')||'').toLowerCase();
    if(app==='video'||app==='videos')return 'modules/video.html';
    if(app==='profile'||app==='profil'||app==='user'||app==='compte')return 'modules/user.html';
    if(app==='boutique'||app==='shop'||app==='market'||app==='panier'||app==='cart'){
      try{
        var q=new URLSearchParams(location.search||'');
        q.delete('app');q.delete('open');q.delete('source');q.delete('v');
        q.set('v','532');
        var s=q.toString();
        return 'boutique.html'+(s?('?'+s):'');
      }catch(_q){return 'boutique.html';}
    }
    return '';
  }
  function start(){
    var url=appUrl();if(!url)return;
    try{history.replaceState(null,'','index.html');}catch(e){}
    function openNow(){
      try{
        if(window.happyadOpenInternalUrlV492){window.happyadOpenInternalUrlV492(url);return true;}
        if(window.happyadOpenVideoProfileRouteV493){window.happyadOpenVideoProfileRouteV493(url);return true;}
        if(window.happyadOpenAppPage){window.happyadOpenAppPage(url.indexOf('video.html')>=0?'video':(url.indexOf('boutique.html')>=0?'boutique':'profile'),url);return true;}
      }catch(e){}
      return false;
    }
    if(!openNow()){setTimeout(openNow,120);setTimeout(openNow,500);setTimeout(openNow,1200);}
  }
  if(document.readyState==='complete')setTimeout(start,80);else window.addEventListener('load',function(){setTimeout(start,80)},{once:true});
})();


(function(){
  if(window.__HAPPYAD_V495_STATUS_MEDIA_CLEANER__)return;window.__HAPPYAD_V495_STATUS_MEDIA_CLEANER__=true;
  var BLANK_IMG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=';
  function setBlackTheme(){
    try{
      var m=document.querySelector('meta[name="theme-color"]');
      if(!m){m=document.createElement('meta');m.name='theme-color';document.head.appendChild(m);}
      m.setAttribute('content','#000000');
      var cs=document.querySelector('meta[name="color-scheme"]');
      if(!cs){cs=document.createElement('meta');cs.name='color-scheme';document.head.appendChild(cs);}
      cs.setAttribute('content','dark');
      document.documentElement.style.backgroundColor='#000';
      document.body&& (document.body.style.backgroundColor=document.body.style.backgroundColor||'#000');
    }catch(_e){}
  }
  function cleanMediaSession(){
    try{
      if(!('mediaSession' in navigator))return;
      try{
        if(window.MediaMetadata){
          navigator.mediaSession.metadata=new MediaMetadata({
            title:' ',artist:' ',album:' ',
            artwork:[{src:BLANK_IMG,sizes:'1x1',type:'image/png'}]
          });
        }else navigator.mediaSession.metadata=null;
      }catch(_m){try{navigator.mediaSession.metadata=null}catch(_n){}}
      ['play','pause','seekbackward','seekforward','previoustrack','nexttrack','stop'].forEach(function(a){try{navigator.mediaSession.setActionHandler(a,null)}catch(_e){}});
      try{navigator.mediaSession.playbackState='none'}catch(_e){}
    }catch(_e){}
  }
  function prepareMedia(m){
    try{
      if(!m||m.__happyadV495Prepared)return;m.__happyadV495Prepared=true;
      try{m.controls=false}catch(_e){}
      try{m.disableRemotePlayback=true}catch(_e){}
      try{m.disablePictureInPicture=true}catch(_e){}
      try{m.setAttribute('playsinline','')}catch(_e){}
      try{m.setAttribute('webkit-playsinline','')}catch(_e){}
      try{m.setAttribute('controlsList','nodownload noplaybackrate noremoteplayback nofullscreen')}catch(_e){}
      ['play','playing','loadedmetadata','volumechange'].forEach(function(ev){
        try{m.addEventListener(ev,function(){setBlackTheme();cleanMediaSession();},true)}catch(_e){}
      });
    }catch(_e){}
  }
  function scan(){try{setBlackTheme();cleanMediaSession();Array.prototype.slice.call(document.querySelectorAll('video,audio')).forEach(prepareMedia);}catch(_e){}}
  scan();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scan,{once:true});
  document.addEventListener('play',function(){setBlackTheme();cleanMediaSession();setTimeout(cleanMediaSession,200);setTimeout(cleanMediaSession,900);},true);
  document.addEventListener('visibilitychange',function(){setBlackTheme();cleanMediaSession();},true);
  ['pageshow','focus','resize'].forEach(function(ev){try{window.addEventListener(ev,scan,true)}catch(_e){}});
  try{new MutationObserver(function(){scan();}).observe(document.documentElement,{childList:true,subtree:true});}catch(_e){setInterval(scan,2500);}
})();


(function(){
  if(window.__HAPPYAD_V342_RADAR_SEEN_LOCK__) return;
  window.__HAPPYAD_V342_RADAR_SEEN_LOCK__ = true;

  var SEEN_KEY='HAPPYAD_HOME_RADAR_SEEN_V1';
  function $(id){return document.getElementById(id)}
  function esc(v){return String(v==null?'':v).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]||c})}
  function readSeen(){try{return JSON.parse(localStorage.getItem(SEEN_KEY)||'{}')||{}}catch(e){return {}}}
  function writeSeen(v){try{localStorage.setItem(SEEN_KEY,JSON.stringify(v||{}))}catch(e){}}
  function truthySeen(v){if(v===true||v===1)return true;var x=String(v==null?'':v).toLowerCase();return x==='true'||x==='1'||x==='yes'||x==='oui'||x==='seen'||x==='viewed'}
  function storyId(p){p=p||{};return String(p.id||p.story_id||p.storyId||p.sourceId||p.source_id||'').trim()}
  function ownerOf(p){p=p||{};return String(p.creatorId||p.user_id||p.userId||p.owner_id||p.ownerId||p.creator_id||'').trim()}
  function expired(p){try{var x=p&&p.expiresAt||p&&p.expires_at;if(!x)return false;return new Date(x).getTime()<Date.now()}catch(e){return false}}
  function isStory(p){var k=String((p&&(p.source_type||p.sourceType||p.type||p.mode||p.category))||'').toLowerCase();return k==='story'||(p&&p.isRadar===true&&p.isLive!==true)||!!(p&&p.__storyTable==='happyad_stories')}
  function tsOf(p){var t=p&&(p.createdAt||p.created_at||p.time||p.timestamp);var n=Number(t);if(n)return n;var d=Date.parse(t||'');return isNaN(d)?0:d}
  function ageOf(p){var t=tsOf(p);if(!t)return 'Story';var m=Math.max(0,Math.floor((Date.now()-t)/60000));if(m<1)return 'à l’instant';if(m<60)return m+' min';var h=Math.floor(m/60);if(h<24)return h+' h';return '24 h'}
  function initials(n){n=String(n||'H').trim();return (n[0]||'H').toUpperCase()}
  function badgeHtml(b){try{return typeof badgeMarkHtml==='function'?badgeMarkHtml(b||''):''}catch(e){return ''}}
  function renderName(p){return (p&&(p.creatorName||p.user_name||p.display_name||p.full_name||p.title||p.name))||'Utilisateur HAPPYAD'}
  function renderAvatar(p){return (p&&(p.avatar||p.user_avatar||p.avatar_url||p.userAvatar))||''}
  function renderBadge(p){return (p&&(p.badge||p.userBadge||p.user_badge))||''}
  function isMineItem(p){try{return typeof happyadIsMine==='function'&&happyadIsMine(p)}catch(e){try{var u=JSON.parse(localStorage.getItem('happyad_user')||localStorage.getItem('HAPPYAD_USER')||localStorage.getItem('HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL')||'{}');return String(ownerOf(p))===String(u.id||u.user_id||'')}catch(_e){return false}}}
  function sourceItems(){
  try{
    var arr=(window.HAPPYAD_STORIES_ITEMS||JSON.parse(localStorage.getItem('HAPPYAD_STORIES_CACHE_V1')||'[]')||[]);
    var changed=false;

    var next=(arr||[]).filter(isStory).filter(function(p){
      var id=storyId(p);
      if(!id)return false;

      if(/^local_story_|^profile_story_|^logged_out_/i.test(id)){
        changed=true;
        return false;
      }

      if(expired(p)){
        changed=true;
        return false;
      }

      if(p.location||p.location_name||p.latitude||p.longitude){
        delete p.location;
        delete p.location_name;
        delete p.latitude;
        delete p.longitude;
        changed=true;
      }

      return true;
    });

    if(changed){
      try{
        localStorage.setItem('HAPPYAD_STORIES_CACHE_V1',JSON.stringify(next.slice(0,80)));
        window.HAPPYAD_STORIES_ITEMS=next;
        window.__HAPPYAD_STORIES_ITEMS_CACHE=next;
      }catch(e){}
    }

    return next;
  }catch(e){
    return [];
  }
}
  function itemSeen(p,seen){var id=storyId(p);return !!(id&&seen&&seen[id])||truthySeen(p&&p.isSeen)||truthySeen(p&&p.seen)||truthySeen(p&&p.viewed)}
  function sanitizeCache(){
    var seen=readSeen(), seenChanged=false;
    try{
      var arr=JSON.parse(localStorage.getItem('HAPPYAD_STORIES_CACHE_V1')||'[]')||[];
      var changed=false;
      arr.forEach(function(p){
        if(!isStory(p))return;
        var id=storyId(p), s=itemSeen(p,seen);
        if(s&&id&&!seen[id]){seen[id]=Date.now();seenChanged=true}
        if(p.isSeen!==s){p.isSeen=s;changed=true}
        if(p.seen!==undefined&&p.seen!==s){p.seen=s;changed=true}
        if(p.viewed!==undefined&&p.viewed!==s){p.viewed=s;changed=true}
      });
      if(changed)localStorage.setItem('HAPPYAD_STORIES_CACHE_V1',JSON.stringify(arr));
    }catch(e){}
    try{
      if(Array.isArray(window.HAPPYAD_STORIES_ITEMS)){
        window.HAPPYAD_STORIES_ITEMS.forEach(function(p){if(isStory(p)){var id=storyId(p), s=itemSeen(p,seen);if(s&&id&&!seen[id]){seen[id]=Date.now();seenChanged=true}p.isSeen=s;p.seen=s;p.viewed=s;}});
      }
    }catch(e){}
    if(seenChanged)writeSeen(seen);
  }
  function groupSeen(items){var seen=readSeen();return (items||[]).length>0 && (items||[]).every(function(p){return itemSeen(p,seen)})}
  function previewHtml(p){var av=renderAvatar(p), nm=renderName(p);return av?'<img src="'+esc(av)+'" alt="">':'<span class="radarInitial">'+esc(initials(nm))+'</span>'}
  function stopAll(){document.querySelectorAll('.radarAvatar.happyadStoryPreparing').forEach(function(el){el.classList.remove('happyadStoryPreparing')})}
  function startOn(btn){stopAll();var av=btn&&btn.querySelector&&btn.querySelector('.radarAvatar');if(av)av.classList.add('happyadStoryPreparing');setTimeout(stopAll,9000)}

  var oldRender = window.renderRadarHome;
  window.renderRadarHome=function(){
    sanitizeCache();
    var chips=document.querySelector('.chips');
    if(!chips){if(typeof oldRender==='function')return oldRender.apply(this,arguments);return}
    try{if(typeof currentFilter!=='undefined'&&currentFilter!=='all')return}catch(e){}
    var old=$('homeRadarBlock'); if(old)old.remove();
    var arr=sourceItems();
    if(!arr.length){if(typeof oldRender==='function')return oldRender.apply(this,arguments);return}
    var groups={};
    arr.forEach(function(p){var o=ownerOf(p)||storyId(p);if(!groups[o])groups[o]=[];groups[o].push(p)});
    var list=Object.keys(groups).map(function(o){groups[o].sort(function(a,b){return Number(tsOf(a))-Number(tsOf(b))});return {owner:o,items:groups[o],first:groups[o][groups[o].length-1]}});
    list.sort(function(a,b){var am=isMineItem(a.first)?1:0,bm=isMineItem(b.first)?1:0;if(am!==bm)return bm-am;return Number(tsOf(b.first))-Number(tsOf(a.first))});
    list=list.slice(0,14);
    var block=document.createElement('section');block.id='homeRadarBlock';block.className='radarBlock';
    block.innerHTML='<div class="radarHead"><div class="radarTitle">◎ RADAR <b>pour toi</b></div><a class="mapLite" href="modules/map.html">⌖ Voir sur la carte</a></div><div class="radarRow"></div>';
    var row=block.querySelector('.radarRow');
    var add=document.createElement('a');add.href='modules/publish.html?mode=story';add.className='radarItem';add.innerHTML='<div class="radarAvatar add"><span>+</span></div><div class="radarName">Ta story</div><div class="radarMeta">Poster Story</div>';row.appendChild(add);
    list.forEach(function(g){
      var p=g.first, name=renderName(p), seen=groupSeen(g.items);
      var btn=document.createElement('button');btn.type='button';btn.className='radarItem';btn.style.background='transparent';btn.style.border='0';btn.style.padding='0';btn.style.cursor='pointer';
      btn.innerHTML='<div class="radarAvatar '+(seen?'seen ':'')+'">'+previewHtml(p)+'<i class="typeDot story"></i>'+(g.items.length>1?'<span class="radarStoryCount">'+g.items.length+'</span>':'')+'</div><div class="radarName">'+esc(name)+badgeHtml(renderBadge(p))+'</div><div class="radarMeta">'+esc(ageOf(p))+'</div>';
      btn.onclick=function(e){
        e.preventDefault();e.stopPropagation();startOn(btn);
        try{var start=g.items[0]||p;if(typeof window.openRadarPost==='function')window.openRadarPost(start);else if(typeof window.openHappyadStoryViewer==='function')window.openHappyadStoryViewer(start);}
        catch(_e){stopAll()}
        return false;
      };
      row.appendChild(btn);
    });
    chips.insertAdjacentElement('afterend',block);
  };

  document.addEventListener('visibilitychange',function(){if(!document.hidden){setTimeout(function(){try{window.renderRadarHome()}catch(e){}},80)}});
  window.addEventListener('pageshow',function(){setTimeout(function(){try{window.renderRadarHome()}catch(e){}},120)});
  setTimeout(function(){try{window.renderRadarHome()}catch(e){}},260);
})();


(function(){
  if(window.__HAPPYAD_V406_STORY_RADAR_OWNER_IDENTITY_LOCK__)return;
  window.__HAPPYAD_V406_STORY_RADAR_OWNER_IDENTITY_LOCK__=true;
  var STORY_KEY='HAPPYAD_STORIES_CACHE_V1';
  var AUTHOR_KEY='HAPPYAD_AUTHOR_PROFILE_CACHE_V1';
  var USER_KEY='HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL';
  function clean(v){v=String(v==null?'':v).trim();return (v&&v!=='null'&&v!=='undefined'&&v!=='[object Object]')?v:''}
  function badName(v){v=clean(v).toLowerCase();return !v||v==='utilisateur happyad'||v==='utilisateur'||v==='happyad'||v==='story'||v==='chargement profil...'}
  function readJson(k,d){try{return JSON.parse(localStorage.getItem(k)||'')||d}catch(e){return d}}
  function ownerOf(p){return clean(p&&(p.creatorId||p.user_id||p.userId||p.ownerId||p.owner_id||p.creator_id))}
  function readMe(){var u=readJson(USER_KEY,{});var au=clean(localStorage.getItem('HAPPYAD_AUTH_UID')||'');if(au&&!clean(u.id||u.user_id))u.id=au;return u||{}}
  function identityForOwner(uid){
    var authors=readJson(AUTHOR_KEY,{}), me=readMe(), a=uid?(authors[uid]||{}):{};
    if(uid&&String(uid)===String(clean(me.id||me.user_id||''))){
      return {name:clean(me.name||me.full_name||me.display_name||a.name),avatar:clean(me.avatar||me.avatar_url||a.avatar),badge:clean(me.badge||me.userBadge||me.user_badge||a.badge),handle:clean(me.handle||me.username||a.handle).replace(/^@+/,'')};
    }
    return {name:clean(a.name||a.full_name||a.display_name),avatar:clean(a.avatar||a.avatar_url),badge:clean(a.badge||a.user_badge),handle:clean(a.handle||a.username).replace(/^@+/,'')};
  }
  function fixOne(p){
    if(!p)return p;
    var uid=ownerOf(p), id=identityForOwner(uid);
    var name=clean(p.creatorName||p.user_name||p.display_name||p.full_name||p.name||p.title);
    if(badName(name)&&!badName(id.name))name=id.name;
    if(badName(name))name='Utilisateur HAPPYAD';
    var avatar=clean(p.avatar||p.user_avatar||p.avatar_url||p.userAvatar)||id.avatar;
    var badge=clean(p.badge||p.userBadge||p.user_badge)||id.badge||'aucun';
    var handle=clean(p.handle||p.username).replace(/^@+/,'')||id.handle;
    p.creatorName=name;p.user_name=name;p.display_name=name;p.full_name=name;p.name=name;p.title=name;
    if(avatar){p.avatar=avatar;p.user_avatar=avatar;p.avatar_url=avatar;}
    if(badge){p.badge=badge;p.userBadge=badge;p.user_badge=badge;}
    if(handle){p.handle='@'+handle;p.username=handle;}
    return p;
  }
  function fixList(arr){arr=Array.isArray(arr)?arr:[];var next=arr.map(fixOne);try{localStorage.setItem(STORY_KEY,JSON.stringify(next.slice(0,80)));window.HAPPYAD_STORIES_ITEMS=next;window.__HAPPYAD_STORIES_ITEMS_CACHE=next}catch(e){}return next}
  function fixCache(){try{return fixList(window.HAPPYAD_STORIES_ITEMS||readJson(STORY_KEY,[]))}catch(e){return []}}
  try{
    var oldFetch=window.fetchRadarItems;
    if(typeof oldFetch==='function'&&!oldFetch.__v406StoryIdentityLock){
      window.fetchRadarItems=async function(){var arr=[];try{arr=await oldFetch.apply(this,arguments)||[]}catch(e){arr=fixCache()}return fixList(arr)};
      window.fetchRadarItems.__v406StoryIdentityLock=true;
    }
  }catch(e){}
  try{
    var oldRender=window.renderRadarHome;
    if(typeof oldRender==='function'&&!oldRender.__v406StoryIdentityLock){
      window.renderRadarHome=function(){fixCache();return oldRender.apply(this,arguments)};
      window.renderRadarHome.__v406StoryIdentityLock=true;
    }
  }catch(e){}
  window.addEventListener('storage',function(e){if(e&&/HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL|HAPPYAD_AUTHOR_PROFILE_CACHE_V1|HAPPYAD_STORIES_CACHE_V1/.test(e.key||'')){setTimeout(function(){try{fixCache();if(typeof window.renderRadarHome==='function')window.renderRadarHome()}catch(_e){}},60)}});
  setTimeout(function(){try{fixCache();if(typeof window.renderRadarHome==='function')window.renderRadarHome()}catch(e){}},350);
})();


(function(){
  try{
    if(typeof currentFilter!=='undefined') currentFilter='all';
    var all=document.querySelector('.chip[data-filter="all"]');
    if(all){
      document.querySelectorAll('.chip').forEach(function(x){x.classList.toggle('on',x===all);});
    }
  }catch(e){}
})();


(function(){
  function clean(v){return String(v==null?'':v).trim();}
  function esc(v){return String(v==null?'':v).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]||c;});}
  function ownerFromPost(p){
    p=p||{};
    try{ if(typeof postOwnerData==='function') return postOwnerData(p)||{}; }catch(e){}
    try{ if(typeof happyadNormalizePublicProfileV463==='function') return happyadNormalizePublicProfileV463(p)||{}; }catch(e){}
    return {
      name:clean(p.creatorName||p.creator_name||p.display_name||p.full_name||p.userName||p.user_name||p.username||p.author)||'HAPPYAD',
      avatar:clean(p.avatar||p.avatar_url||p.avatarUrl||p.userAvatar||p.user_avatar||p.creatorAvatar||p.creator_avatar||p.authorAvatar||p.author_avatar||p.profile_photo||p.profile_picture)
    };
  }
  function injectAvatar(el,p){
    try{
      if(!el)return;
      var old=el.querySelector('.sponsorCreatorFloat');
      if(el.classList&&el.classList.contains('happyadFixedRadarAd') || (el.dataset&&el.dataset.fixedRadar==='1') || (el.closest&&el.closest('#sponsorTrack')&&el.closest('#sponsorTrack').dataset.fixedRadar==='1')){if(old)old.remove();return;}
      if(el.__happyadSponsorFloatReady)return;
      el.__happyadSponsorFloatReady=true;
      if(old)old.remove();
      var owner=ownerFromPost(p);
      var av=clean(owner.avatar||owner.avatar_url||owner.photo||owner.picture||'');
      var nm=clean(owner.name||owner.full_name||owner.display_name||owner.username||'HAPPYAD');
      var f=document.createElement('span');
      f.className='sponsorCreatorFloat';
      f.setAttribute('aria-label','Voir les informations de '+nm);
      if(av){
        f.innerHTML='<img src="'+esc(av)+'" alt=""><i>›</i>';
      }else{
        f.innerHTML='<span class="sponsorCreatorInitial">'+esc((nm||'H').charAt(0).toUpperCase())+'</span><i>›</i>';
      }
      el.appendChild(f);
    }catch(e){}
  }
  function patchHydrate(){
    try{
      if(typeof hydrateSponsorItem==='function' && !hydrateSponsorItem.__v477Float){
        var old=hydrateSponsorItem;
        hydrateSponsorItem=function(el,p){
          injectAvatar(el,p);
          return old.apply(this,arguments);
        };
        hydrateSponsorItem.__v477Float=true;
      }
    }catch(e){}
  }
  function initial(){
    try{
      patchHydrate();
      var track=document.getElementById('sponsorTrack');
      if(!track)return;
      var ad=track.querySelector('.sponsorAd');
      if(track.dataset.fixedRadar==='1' || (ad&&ad.classList&&ad.classList.contains('happyadFixedRadarAd'))){try{if(ad){var oldFloat=ad.querySelector('.sponsorCreatorFloat');if(oldFloat)oldFloat.remove();}}catch(_f){}return;}
      if(ad && !ad.querySelector('.sponsorCreatorFloat')){
        var posts=[];
        try{posts=(typeof happyadSponsorSourceItems==='function'?happyadSponsorSourceItems():(Array.isArray(ALL_POSTS)?ALL_POSTS:[]));}catch(e){posts=[];}
        injectAvatar(ad,posts[(typeof sponsorIndex!=='undefined'?sponsorIndex:0)%Math.max(1,posts.length)]||{});
      }
      if(!track.__v477SponsorObserver){
        var mo=new MutationObserver(function(){setTimeout(initial,40);});
        mo.observe(track,{childList:true,subtree:false});
        track.__v477SponsorObserver=mo;
      }
    }catch(e){}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initial);else initial();
  setTimeout(initial,300);
  setTimeout(initial,1200);
})();


(function(){
  if(window.__HAPPYAD_V478_AD_PROFILE_PHOTO_RETURN__)return;
  window.__HAPPYAD_V478_AD_PROFILE_PHOTO_RETURN__=true;
  function q(s,r){return (r||document).querySelector(s)}
  function clean(v){return String(v==null?'':v).trim()}
  function cssId(v){try{return (window.CSS&&CSS.escape)?CSS.escape(String(v)):String(v).replace(/[^a-zA-Z0-9_-]/g,'\\$&')}catch(e){return String(v||'')}}
  function allPosts(){
    try{if(typeof ALL_POSTS!=='undefined'&&Array.isArray(ALL_POSTS))return ALL_POSTS;}catch(e){}
    try{return Array.isArray(window.ALL_POSTS)?window.ALL_POSTS:[]}catch(e){return []}
  }
  function sponsorIdx(){try{return Number(typeof sponsorIndex!=='undefined'?sponsorIndex:(window.sponsorIndex||0))||0}catch(e){return 0}}
  function currentSponsorPost(el){
    try{if(el&&el.__happyadSponsorPost)return el.__happyadSponsorPost;}catch(e){}
    try{
      var items=(typeof happyadSponsorSourceItems==='function'?happyadSponsorSourceItems():allPosts()), pid=clean(el&&el.dataset&&el.dataset.postId);
      if(pid&&items.length){var byId=items.find(function(x){return String(x&&x.id)===String(pid)});if(byId)return byId;}
      if(items.length)return items[sponsorIdx()%items.length];
    }catch(e){}
    return null;
  }
  function ownerFor(p){
    p=p||{};
    try{if(typeof postOwnerData==='function')return postOwnerData(p)||{};}catch(e){}
    return {id:clean(p.creatorId||p.user_id||p.userId||p.ownerId||p.owner_id||p.creator_id),user_id:clean(p.user_id||p.creatorId||p.userId||p.ownerId||p.owner_id||p.creator_id),name:clean(p.creatorName||p.display_name||p.creator_name||p.full_name||p.user_name||p.username)||'Utilisateur HAPPYAD',handle:clean(p.handle||p.username),avatar:clean(p.avatar||p.avatar_url||p.creator_avatar||p.author_avatar),badge:clean(p.badge||p.user_badge)};
  }
  function openProfileFromPost(p){
    try{
      var o=ownerFor(p||{}), uid=clean(o.id||o.user_id||p.user_id||p.creatorId||p.userId||p.ownerId||p.owner_id||p.creator_id);
      if(!uid)return false;
      var ap={id:uid,user_id:uid,name:o.name||p.creatorName||p.display_name||'Utilisateur HAPPYAD',full_name:o.full_name||o.name||p.creatorName||p.display_name||'Utilisateur HAPPYAD',handle:o.handle||p.handle||p.username||'',username:o.username||p.username||p.handle||'',avatar:o.avatar||o.avatar_url||p.avatar||p.avatar_url||'',avatar_url:o.avatar_url||o.avatar||p.avatar_url||p.avatar||'',badge:o.badge||p.badge||p.user_badge||'',source:'sponsor_float',postId:p.id||'',__happyadUidLocked:true};
      try{if(typeof happyadWarmPublicProfileCacheV463==='function'){happyadWarmPublicProfileCacheV463(ap,(typeof happyadAllLocalPostsForPublicV463==='function'?happyadAllLocalPostsForPublicV463():allPosts()).filter(function(x){try{return String(happyadOwnerOfPostV463(x))===String(uid)}catch(e){return String((x&&x.user_id)||x&&x.creatorId||'')===String(uid)}}),true);}else{localStorage.setItem('HAPPYAD_ACTIVE_PROFILE',JSON.stringify(ap));}}catch(_e){try{localStorage.setItem('HAPPYAD_ACTIVE_PROFILE',JSON.stringify(ap));}catch(__e){}}
      if(window.happyadOpenInternalUrlV492){window.happyadOpenInternalUrlV492('modules/user.html?public=1&uid='+encodeURIComponent(uid)+(p.id?'&post='+encodeURIComponent(p.id):''));}else{location.href='modules/user.html?public=1&uid='+encodeURIComponent(uid)+(p.id?'&post='+encodeURIComponent(p.id):'');}
      return false;
    }catch(e){return false;}
  }
  function rememberPhotoSource(id,el){
    try{
      id=clean(id); if(!el&&id)el=q('[data-post-id="'+cssId(id)+'"]');
      window.__happyadPhotoReturnSourceV478={id:id,scrollY:window.scrollY||document.documentElement.scrollTop||0,at:Date.now(),el:el||null};
    }catch(e){}
  }
  function restorePhotoSource(){
    try{
      var s=window.__happyadPhotoReturnSourceV478||{};
      var el=s.el&&document.body.contains(s.el)?s.el:null;
      if(!el&&s.id)el=q('[data-post-id="'+cssId(s.id)+'"]');
      if(el&&el.scrollIntoView){el.scrollIntoView({block:'center',inline:'nearest',behavior:'auto'});}else if(typeof s.scrollY==='number'){window.scrollTo({top:s.scrollY,behavior:'auto'});} 
    }catch(e){}
  }
  function closeHomeFsAndRestore(){
    try{
      var box=document.getElementById('happyadHomePhotoFullscreen');
      if(!box)return;
      box.classList.remove('on');
      document.body.classList.remove('haHomePhotoFsLock');
      var tr=box.querySelector('.haHomeFsAlbumTrack');if(tr)tr.innerHTML='';
    }catch(e){}
    setTimeout(restorePhotoSource,20);
  }
  function bindHomeFsCloseReturn(){
    try{
      var box=document.getElementById('happyadHomePhotoFullscreen');if(!box||box.__v478ReturnBound)return;
      box.__v478ReturnBound=true;
      box.addEventListener('click',function(e){
        var img=e.target&&e.target.closest&&e.target.closest('.haHomeFsAlbumSlide img');
        var close=e.target&&e.target.closest&&e.target.closest('.haHomeFsClose');
        if(img){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();closeHomeFsAndRestore();return false;}
        if(close||e.target===box){setTimeout(restorePhotoSource,35);}
      },true);
    }catch(e){}
  }
  function patchOpenPhoto(){
    try{
      if(typeof window.openLongPhoto==='function'&&!window.openLongPhoto.__v478Return){
        var old=window.openLongPhoto;
        window.openLongPhoto=function(id){rememberPhotoSource(id);var r=old.apply(this,arguments);setTimeout(bindHomeFsCloseReturn,30);return r;};
        window.openLongPhoto.__v478Return=true;
      }
      if(typeof window.happyadOpenHomePhotoFullscreen==='function'&&!window.happyadOpenHomePhotoFullscreen.__v478Return){
        var oldFs=window.happyadOpenHomePhotoFullscreen;
        window.happyadOpenHomePhotoFullscreen=async function(id){rememberPhotoSource(id);var r=await oldFs.apply(this,arguments);setTimeout(bindHomeFsCloseReturn,20);return r;};
        window.happyadOpenHomePhotoFullscreen.__v478Return=true;
      }
    }catch(e){}
  }
  function patchSponsorHydrate(){
    try{
      if(typeof window.hydrateSponsorItem==='function'&&!window.hydrateSponsorItem.__v478PostStore){
        var old=window.hydrateSponsorItem;
        window.hydrateSponsorItem=function(el,p){try{if(el){el.__happyadSponsorPost=p;if(p&&p.id)el.dataset.postId=String(p.id);}}catch(_e){}return old.apply(this,arguments);};
        window.hydrateSponsorItem.__v478PostStore=true;
      }
    }catch(e){}
  }
  function bindSponsorClick(){
    try{
      var track=document.getElementById('sponsorTrack');if(!track||track.__v478SponsorClick)return;
      track.__v478SponsorClick=true;
      track.addEventListener('click',function(e){
        var ad=e.target&&e.target.closest&&e.target.closest('.sponsorAd');if(!ad)return;
        if(ad.classList&&ad.classList.contains('happyadFixedRadarAd') || (ad.dataset&&ad.dataset.fixedRadar==='1')){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();return false;}
        var p=currentSponsorPost(ad)||{};
        if(e.target.closest('.sponsorCreatorFloat')){
          e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();openProfileFromPost(p);return false;
        }
        /* Le reste de la publicité garde son clic original déjà attaché par renderSponsor().
           Important : ne pas bloquer le premier sponsor affiché. */
        try{if(p&&p.id)rememberPhotoSource(p.id,ad);}catch(_e){}
        return true;
      },true);
    }catch(e){}
  }
  function markExistingSponsor(){
    try{var ad=q('#sponsorTrack .sponsorAd');if(ad&&!ad.__happyadSponsorPost){var p=currentSponsorPost(ad);if(p){ad.__happyadSponsorPost=p;if(p.id)ad.dataset.postId=String(p.id);}}}catch(e){}
  }
  function init(){patchSponsorHydrate();patchOpenPhoto();bindSponsorClick();bindHomeFsCloseReturn();markExistingSponsor();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  setTimeout(init,200);setTimeout(init,900);setTimeout(init,1800);
})();


(function(){
  if(window.__HAPPYAD_V481_PUBLICITE_FINAL__)return;window.__HAPPYAD_V481_PUBLICITE_FINAL__=true;
  function clean(v){return String(v==null?'':v).trim()}
  function allPosts(){try{if(typeof ALL_POSTS!=='undefined'&&Array.isArray(ALL_POSTS))return ALL_POSTS}catch(e){}try{return Array.isArray(window.ALL_POSTS)?window.ALL_POSTS:[]}catch(e){return []}}
  function idx(){try{return Number(typeof sponsorIndex!=='undefined'?sponsorIndex:(window.sponsorIndex||0))||0}catch(e){return 0}}
  function post(ad){try{if(ad&&(ad.classList&&ad.classList.contains('happyadFixedRadarAd') || ad.dataset&&ad.dataset.fixedRadar==='1'))return null;}catch(_fixed){}try{if(ad&&ad.__happyadSponsorPost)return ad.__happyadSponsorPost}catch(e){}try{var pid=clean(ad&&ad.dataset&&ad.dataset.postId);if(pid){var p=allPosts().find(function(x){return String(x&&x.id)===String(pid)});if(p)return p}}catch(e){}var a=(typeof happyadSponsorSourceItems==='function'?happyadSponsorSourceItems():allPosts());return a.length?a[idx()%a.length]:null;}
  function cleanDom(){try{document.querySelectorAll('#sponsorTrack .sponsorAd').forEach(function(ad){if(ad.classList&&ad.classList.contains('happyadFixedRadarAd') || (ad.dataset&&ad.dataset.fixedRadar==='1')){ad.querySelectorAll('.sponsorCreatorFloat,video,.sponsorText,.sponsorDescWrap,.sponsorDesc,.sponsorMeta,.sponsorLiveDot').forEach(function(x){try{x.remove()}catch(e){x.style.display='none'}});return;}var p=post(ad);if(p){ad.__happyadSponsorPost=p;if(p.id)ad.dataset.postId=String(p.id)}ad.querySelectorAll('.sponsorText,.sponsorDescWrap,.sponsorDesc,.sponsorMeta,.sponsorLiveDot').forEach(function(x){try{x.remove()}catch(e){x.style.display='none'}});});}catch(e){}}
  function profile(p){try{if(!p)return false;if(typeof happyadOpenPublicProfileFromPostV417==='function')return happyadOpenPublicProfileFromPostV417(p);var uid=clean(p.creatorId||p.creator_id||p.user_id||p.userId||p.ownerId||p.owner_id);if(!uid)return false;localStorage.setItem('HAPPYAD_ACTIVE_PROFILE',JSON.stringify({id:uid,user_id:uid,name:p.creatorName||p.creator_name||p.display_name||p.full_name||p.name||'Utilisateur HAPPYAD',avatar:p.avatar||p.avatar_url||p.creator_avatar||p.author_avatar||'',avatar_url:p.avatar_url||p.avatar||'',badge:p.badge||p.user_badge||'',source:'sponsor_v481',__happyadUidLocked:true}));if(window.happyadOpenInternalUrlV492){window.happyadOpenInternalUrlV492('modules/user.html?public=1&uid='+encodeURIComponent(uid)+(p.id?'&post='+encodeURIComponent(p.id):''));}else{location.href='modules/user.html?public=1&uid='+encodeURIComponent(uid)+(p.id?'&post='+encodeURIComponent(p.id):'');}}catch(e){}return false;}
  function open(p,ad){try{if(!p||!p.id)return false;try{window.__happyadPhotoReturnSourceV478={id:String(p.id),scrollY:window.scrollY||document.documentElement.scrollTop||0,at:Date.now(),el:ad||null}}catch(e){}if(typeof isVideo==='function'&&isVideo(p)){if(typeof openLongVideo==='function')openLongVideo(p.id);else location.href='modules/video.html?post='+encodeURIComponent(p.id);}else{if(typeof openLongPhoto==='function')openLongPhoto(p.id);else location.href='modules/photo.html?post='+encodeURIComponent(p.id);}return false;}catch(e){return false;}}
  function install(){var t=document.getElementById('sponsorTrack');if(!t)return;cleanDom();if(!t.__v481Click){t.__v481Click=true;t.addEventListener('click',function(e){var ad=e.target&&e.target.closest&&e.target.closest('.sponsorAd');if(!ad)return;if((ad.classList&&ad.classList.contains('happyadFixedRadarAd')) || (ad.dataset&&ad.dataset.fixedRadar==='1') || t.dataset.fixedRadar==='1'){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();return false;}var p=post(ad);e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();if(e.target.closest('.sponsorCreatorFloat'))return profile(p);return open(p,ad);},true);}if(!t.__v481Mo){try{t.__v481Mo=new MutationObserver(function(){setTimeout(install,10)});t.__v481Mo.observe(t,{childList:true,subtree:true})}catch(e){}}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();setTimeout(install,120);setTimeout(install,700);setTimeout(install,1800);
})();


(function(){
  if(window.__HAPPYAD_V483_SPONSOR_10S_FINAL__)return;window.__HAPPYAD_V483_SPONSOR_10S_FINAL__=true;
  window.happyadSponsorLoop5s=function(v){
    try{
      if(!v)return;
      if(v.__happyadSponsor10sHandler)try{v.removeEventListener('timeupdate',v.__happyadSponsor10sHandler)}catch(_r){}
      var h=function(){try{if(v.currentTime>=10)v.currentTime=0;}catch(_e){}};
      v.__happyadSponsor10sHandler=h;
      v.addEventListener('timeupdate',h,{passive:true});
      v.play&&v.play().catch(function(){});
    }catch(e){}
  };
  function fixVideos(){try{document.querySelectorAll('#sponsorTrack video,.sponsorThumb video').forEach(function(v){window.happyadSponsorLoop5s(v);});}catch(e){}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fixVideos,{once:true});else fixVideos();
  setInterval(fixVideos,1200);
})();


/* V494 — Accueil sans limite cachée: si un post existe en recherche/cache/Supabase, il remonte aussi dans l'accueil. */
(function(){
  if(window.__HAPPYAD_V494_HOME_NO_LIMITED_POSTS__)return;window.__HAPPYAD_V494_HOME_NO_LIMITED_POSTS__=true;
  function run(){
    try{
      var c=(typeof happyadSb==='function')?happyadSb():null;
      var seed=[];
      try{seed=JSON.parse(localStorage.getItem('HAPPYAD_SEARCH_POSTS_FAST_CACHE_V1')||'[]')||[]}catch(_s){seed=[]}
      if(seed.length&&typeof mapHappyPost==='function'&&typeof happyadSaveHomeFastCache==='function'){
        var mapped=seed.map(mapHappyPost);
        var merged=happyadSaveHomeFastCache([].concat(ALL_POSTS||[],mapped));
        if(merged&&merged.length){ALL_POSTS=merged;HAPPYAD_HOME_RENDER_LIMIT=Math.min(HAPPYAD_HOME_MAX_POSTS,Math.max(HAPPYAD_HOME_RENDER_LIMIT,merged.length));try{render();}catch(_r){}}
      }
      if(c&&typeof happyadSyncAllHomePostsV493==='function')setTimeout(function(){happyadSyncAllHomePostsV493(c,ALL_POSTS||[]);},300);
    }catch(e){console.warn('home v494 no limited posts',e)}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(run,700);},{once:true});else setTimeout(run,700);
  window.addEventListener('focus',function(){setTimeout(run,350);});
})();


(function(){
  'use strict';
  if(window.__HAPPYAD_V16ZF_PWA_INSTALL_10S_SESSION__)return;
  window.__HAPPYAD_V16ZF_PWA_INSTALL_10S_SESSION__=true;
  window.__HAPPYAD_PWA_DISABLED__=false;

  var deferredPrompt=null;
  var readyForNativePrompt=false;
  var INSTALLED_KEY='HAPPYAD_PWA_INSTALLED_V16ZA';
  var INSTALL_NOTICE_DURATION_MS=10000;
  var noticeClosedThisVisit=false;
  var noticeAutoTimer=null;

  function isStandalone(){
    try{return (window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches)||window.navigator.standalone===true;}catch(_e){return false;}
  }
  function markInstalled(){try{localStorage.setItem(INSTALLED_KEY,'1');}catch(_e){}}
  function clearInstalledMark(){try{localStorage.removeItem(INSTALLED_KEY);}catch(_e){}}
  function isInstalledKnown(){
    try{if(isStandalone()){markInstalled();return true;}}catch(_e){}
    try{return localStorage.getItem(INSTALLED_KEY)==='1';}catch(_e2){return false;}
  }
  function ua(){try{return String(navigator.userAgent||'');}catch(_e){return '';}}
  function isAndroid(){return /Android/i.test(ua());}
  function isIOS(){return /iPhone|iPad|iPod/i.test(ua()) || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1);}
  function browserName(){
    var u=ua();
    if(/FBAN|FBAV|Instagram|Line\/|MicroMessenger|TikTok|Twitter|LinkedIn|; wv\)|\bwv\b/i.test(u))return 'webview';
    if(/SamsungBrowser/i.test(u))return 'samsung';
    if(/EdgA|EdgiOS|Edge/i.test(u))return 'edge';
    if(/Firefox|FxiOS/i.test(u))return 'firefox';
    if(/OPR|Opera/i.test(u))return 'opera';
    if(/CriOS|Chrome/i.test(u) && !/EdgA|SamsungBrowser|OPR/i.test(u))return 'chrome';
    if(/Safari/i.test(u) && !/Chrome|CriOS|Android/i.test(u))return 'safari';
    return 'other';
  }
  function btn(){return document.getElementById('happyadInstallAppBtn');}
  function guide(){return document.getElementById('happyadPwaGuide');}
  function clearNoticeTimer(){try{if(noticeAutoTimer){clearTimeout(noticeAutoTimer);noticeAutoTimer=null;}}catch(_e){}}
  function hide(){try{clearNoticeTimer();var b=btn();if(b)b.classList.remove('on');}catch(_e){}}
  function hideForThisVisit(){try{noticeClosedThisVisit=true;hide();}catch(_e){hide();}}
  function scheduleNoticeAutoHide(){
    try{
      clearNoticeTimer();
      noticeAutoTimer=setTimeout(function(){hideForThisVisit();},INSTALL_NOTICE_DURATION_MS);
    }catch(_e){}
  }
  function show(){
    try{
      if(isInstalledKnown())return hide();
      if(noticeClosedThisVisit)return hide();
      var b=btn();if(!b)return;
      setButtonText();
      b.classList.add('on');
      scheduleNoticeAutoHide();
    }catch(_e){}
  }
  function setButtonText(){
    try{
      var b=btn();if(!b)return;
      var s=b.querySelector('.haInstallText small');
      var a=b.querySelector('.haInstallAction');
      if(readyForNativePrompt){
        if(s)s.textContent='Touchez ici puis confirmez Installer.';
        if(a)a.textContent='Installer';
        return;
      }
      var name=browserName();
      if(name==='webview'){
        if(s)s.textContent='Ouvre dans le navigateur externe puis installe.';
        if(a)a.textContent='Guide';
      }else if(name==='samsung'){
        if(s)s.textContent='Samsung Internet : menu ≡ puis Ajouter à écran accueil.';
        if(a)a.textContent='Guide';
      }else if(name==='firefox'){
        if(s)s.textContent='Firefox : menu ⋮ puis Installer ou Ajouter à l’écran.';
        if(a)a.textContent='Guide';
      }else if(name==='edge'){
        if(s)s.textContent='Edge : menu ⋯ puis Ajouter au téléphone / Installer.';
        if(a)a.textContent='Guide';
      }else if(isIOS()){
        if(s)s.textContent='iPhone : Partager puis Ajouter à l’écran d’accueil.';
        if(a)a.textContent='Guide';
      }else{
        if(s)s.textContent='Appuie pour installer. Si Chrome ne propose pas, le guide s’ouvre.';
        if(a)a.textContent='Installer';
      }
    }catch(_e){}
  }
  function stepsForBrowser(){
    var name=browserName();
    if(name==='webview')return ['<b>1.</b> Appuie sur le menu du navigateur intégré.', '<b>2.</b> Choisis “Ouvrir dans le navigateur” ou “Ouvrir avec Samsung/Chrome/Firefox”.', '<b>3.</b> Dans le navigateur externe, choisis “Installer” ou “Ajouter à l’écran d’accueil”.'];
    if(isIOS())return ['<b>1.</b> Ouvre HAPPYAD dans Safari si possible.','<b>2.</b> Appuie sur le bouton Partager.','<b>3.</b> Choisis “Ajouter à l’écran d’accueil”, puis “Ajouter”.'];
    if(name==='samsung')return ['<b>1.</b> Appuie sur le menu Samsung Internet en bas ou en haut.','<b>2.</b> Choisis “Ajouter page à” ou “Ajouter à l’écran d’accueil”.','<b>3.</b> Confirme “Écran d’accueil” puis “Ajouter”.'];
    if(name==='firefox')return ['<b>1.</b> Appuie sur le menu ⋮ de Firefox.','<b>2.</b> Choisis “Installer” ou “Ajouter à l’écran d’accueil”.','<b>3.</b> Confirme pour créer l’icône HAPPYAD.'];
    if(name==='edge')return ['<b>1.</b> Appuie sur le menu ⋯ de Edge.','<b>2.</b> Choisis “Ajouter au téléphone” ou “Installer cette application”.','<b>3.</b> Confirme l’installation.'];
    if(name==='chrome')return ['<b>1.</b> Si le popup automatique apparaît, appuie sur “Installer”.','<b>2.</b> Sinon ouvre le menu ⋮ de Chrome.','<b>3.</b> Choisis “Installer l’application” ou “Ajouter à l’écran d’accueil”.'];
    return ['<b>1.</b> Ouvre le menu de ton navigateur.','<b>2.</b> Cherche “Installer l’application” ou “Ajouter à l’écran d’accueil”.','<b>3.</b> Confirme pour créer l’icône HAPPYAD.'];
  }
  function openGuide(){
    try{
      if(isInstalledKnown())return hide();
      var g=guide();if(!g)return;
      var sub=document.getElementById('happyadPwaGuideSub');
      if(sub){
        var name=browserName();
        sub.textContent=(readyForNativePrompt?'Installation automatique disponible.':'Installation manuelle pour '+(name==='other'?'ce navigateur':name)+'.');
      }
      var ul=document.getElementById('happyadPwaGuideSteps');
      if(ul)ul.innerHTML=stepsForBrowser().map(function(x){return '<li>'+x+'</li>';}).join('');
      g.classList.add('on');
      g.setAttribute('aria-hidden','false');
    }catch(_e){}
  }
  function closeGuide(){try{var g=guide();if(g){g.classList.remove('on');g.setAttribute('aria-hidden','true');}}catch(_e){}}
  function copyLink(){
    try{
      var link=location.origin+location.pathname;
      if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(link).catch(function(){});}
      var b=document.getElementById('happyadPwaCopyLink');
      if(b){var old=b.textContent;b.textContent='Lien copié';setTimeout(function(){b.textContent=old||'Copier le lien';},1400);}
    }catch(_e){}
  }

  function alreadyInstalled(){
    try{markInstalled();deferredPrompt=null;readyForNativePrompt=false;hide();closeGuide();}
    catch(_e){hide();closeGuide();}
  }

  window.addEventListener('beforeinstallprompt',function(e){
    try{e.preventDefault();deferredPrompt=e;readyForNativePrompt=true;show();}catch(_e){}
  });
  window.addEventListener('appinstalled',function(){markInstalled();deferredPrompt=null;readyForNativePrompt=false;hide();closeGuide();});

  function clickInstall(e){
    try{if(e){e.preventDefault();e.stopPropagation();}}catch(_e){}
    try{
      if(isInstalledKnown())return hide();
      if(deferredPrompt){
        var p=deferredPrompt;deferredPrompt=null;readyForNativePrompt=false;
        p.prompt();
        if(p.userChoice&&p.userChoice.then){p.userChoice.then(function(choice){if(choice&&choice.outcome==='accepted')hide();else{setButtonText();hideForThisVisit();openGuide();}}).catch(function(){setButtonText();hideForThisVisit();openGuide();});}
        return false;
      }
      hideForThisVisit();
      openGuide();
      return false;
    }catch(_e){hideForThisVisit();openGuide();return false;}
  }

  function bind(){
    try{
      var b=btn();if(b&&!b.__happyadPwaInstallV16ZA){
        b.__happyadPwaInstallV16ZA=true;
        b.addEventListener('click',clickInstall,true);
      }
      var c=document.getElementById('happyadPwaGuideClose');if(c&&!c.__happyadPwaCloseV16Z){c.__happyadPwaCloseV16Z=true;c.addEventListener('click',closeGuide,true);}
      var cp=document.getElementById('happyadPwaCopyLink');if(cp&&!cp.__happyadPwaCopyV16Z){cp.__happyadPwaCopyV16Z=true;cp.addEventListener('click',copyLink,true);}
      var ai=document.getElementById('happyadPwaAlreadyInstalled');if(ai&&!ai.__happyadPwaInstalledV16ZF){ai.__happyadPwaInstalledV16ZF=true;ai.addEventListener('click',alreadyInstalled,true);}
      var g=guide();if(g&&!g.__happyadPwaBackV16Z){g.__happyadPwaBackV16Z=true;g.addEventListener('click',function(e){if(e.target===g)closeGuide();},true);}
      if(isStandalone())hide();else setTimeout(show,700);
    }catch(_e){}
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
  setTimeout(bind,250);setTimeout(bind,1200);setTimeout(show,1800);
})();


/* V521 — Une photo ouverte en plein écran devient une vraie étape retour :
   carte photo -> page d'origine -> accueil -> sortie normale. */
(function(){
  if(window.__HAPPYAD_V521_PHOTO_FULLSCREEN_NORMAL_BACK_FIX__)return;
  window.__HAPPYAD_V521_PHOTO_FULLSCREEN_NORMAL_BACK_FIX__=true;
  var FS_FLAG='__happyadPhotoFullscreenV521';
  var NAV_FLAG='__happyadNavV520';
  var pushing=false;
  function now(){try{return Date.now()}catch(e){return new Date().getTime();}}
  function clean(v){return String(v==null?'':v).trim();}
  function cssId(v){try{return (window.CSS&&CSS.escape)?CSS.escape(String(v)):String(v).replace(/[^a-zA-Z0-9_-]/g,'\\$&')}catch(e){return String(v||'');}}
  function currentState(){try{return history.state||{};}catch(e){return {};}}
  function isFsState(){try{return !!(history.state&&history.state[FS_FLAG]);}catch(e){return false;}}
  function homeFsBox(){try{return document.getElementById('happyadHomePhotoFullscreen');}catch(e){return null;}}
  function isHomeFsOpen(){var b=homeFsBox();return !!(b&&b.classList&&b.classList.contains('on'));}
  function activeFrame(){try{var r=document.getElementById('happyadAppShell');return r&&r.querySelector&&r.querySelector('.happyadAppFrame.on[data-happyad-page]');}catch(e){return null;}}
  function activeView(){
    try{var f=activeFrame();if(f)return clean(f.getAttribute('data-happyad-page')||'')||'home';}catch(e){}
    return 'home';
  }
  function urlFor(view){
    try{var f=activeFrame();if(f&&clean(f.getAttribute('data-happyad-page'))===view)return clean(f.getAttribute('data-happyad-src'))||clean(sessionStorage.getItem('HAPPYAD_LAST_APP_URL'));}catch(e){}
    try{var u=clean(sessionStorage.getItem('HAPPYAD_LAST_APP_URL'));if(u&&view!=='home')return u;}catch(e){}
    if(view==='profile')return 'modules/user.html';
    if(view==='profile_public')return 'modules/user.html?public=1';
    if(view==='boutique')return 'boutique.html?v=532';
    
    if(view==='video')return 'modules/video.html';
    if(view==='photo')return 'modules/photo.html';
    if(view==='publish')return 'modules/publish.html';
    if(view==='map')return 'modules/map.html';
    return 'index.html';
  }
  function restorePhotoSource(){
    try{
      var s=window.__happyadPhotoReturnSourceV478||{};
      var el=s.el&&document.body.contains(s.el)?s.el:null;
      if(!el&&s.id)el=document.querySelector('[data-post-id="'+cssId(s.id)+'"]');
      if(el&&el.scrollIntoView)el.scrollIntoView({block:'center',inline:'nearest',behavior:'auto'});
      else if(typeof s.scrollY==='number')window.scrollTo({top:s.scrollY,behavior:'auto'});
    }catch(e){}
  }
  function closeHomeFsOnly(){
    var box=homeFsBox();if(!box)return false;
    var was=box.classList&&box.classList.contains('on');
    try{box.classList.remove('on');}catch(e){}
    try{document.body.classList.remove('haHomePhotoFsLock');}catch(e){}
    try{var tr=box.querySelector('.haHomeFsAlbumTrack');if(tr)tr.innerHTML='';}catch(e){}
    try{var img=box.querySelector('.haHomeFsMedia img');if(img)img.removeAttribute('src');}catch(e){}
    if(was)setTimeout(restorePhotoSource,20);
    return was;
  }
  function closeActiveFrameFs(){
    try{var f=activeFrame();if(f&&f.contentWindow)f.contentWindow.postMessage({type:'HAPPYAD_CLOSE_PHOTO_FULLSCREEN_V521',source:'index-v521'},'*');}catch(e){}
  }
  function makeFsState(view,url){
    var old=currentState(), s={};
    try{Object.keys(old||{}).forEach(function(k){s[k]=old[k];});}catch(e){}
    view=view||activeView()||'home';
    s[NAV_FLAG]=true;
    s[FS_FLAG]=true;
    s.view=view;
    s.url=url||urlFor(view);
    s.ts=now();
    return s;
  }
  function pushFsState(view,url){
    if(pushing||isFsState())return;
    try{pushing=true;history.pushState(makeFsState(view,url),'',location.href);}catch(e){}
    setTimeout(function(){pushing=false;},60);
  }
  function notifyHomeFsOpened(){if(isHomeFsOpen())pushFsState(activeView(),urlFor(activeView()));}
  function requestBackForFs(ev){
    try{if(ev){ev.preventDefault&&ev.preventDefault();ev.stopPropagation&&ev.stopPropagation();ev.stopImmediatePropagation&&ev.stopImmediatePropagation();}}catch(e){}
    if(isFsState()){try{history.back();return true;}catch(e){}}
    closeHomeFsOnly();closeActiveFrameFs();return true;
  }
  function wrapHomeOpen(){
    try{
      if(typeof window.happyadOpenHomePhotoFullscreen==='function'&&!window.happyadOpenHomePhotoFullscreen.__v521BackHistory){
        var old=window.happyadOpenHomePhotoFullscreen;
        var wrapped=function(){
          var r=old.apply(this,arguments);
          try{Promise.resolve(r).then(function(){setTimeout(notifyHomeFsOpened,20);}).catch(function(){setTimeout(notifyHomeFsOpened,20);});}catch(e){setTimeout(notifyHomeFsOpened,30);}
          return r;
        };
        wrapped.__v521BackHistory=true;
        window.happyadOpenHomePhotoFullscreen=wrapped;
      }
    }catch(e){}
  }
  document.addEventListener('click',function(e){
    try{
      var box=homeFsBox();if(!box||!box.classList.contains('on'))return;
      var t=e.target;if(!t)return;
      var close=t.closest&&t.closest('.haHomeFsClose');
      var img=t.closest&&t.closest('.haHomeFsAlbumSlide img');
      if(close||img||t===box){return requestBackForFs(e);}
    }catch(_e){}
  },true);
  window.addEventListener('popstate',function(){
    setTimeout(function(){closeHomeFsOnly();closeActiveFrameFs();},0);
  },true);
  window.addEventListener('message',function(ev){
    try{
      var d=ev&&ev.data;if(!d)return;
      if(d.type==='HAPPYAD_PHOTO_FULLSCREEN_OPENED'){
        pushFsState(clean(d.view)||activeView(),clean(d.url)||urlFor(clean(d.view)||activeView()));
      }else if(d.type==='HAPPYAD_PHOTO_FULLSCREEN_BACK'){
        requestBackForFs(null);
      }else if(d.type==='HAPPYAD_PHOTO_FULLSCREEN_CLOSED'){
        if(isFsState())requestBackForFs(null);
      }
    }catch(e){}
  },true);
  window.happyadClosePhotoFullscreenV521=function(){closeHomeFsOnly();closeActiveFrameFs();return true;};
  window.happyadPhotoFullscreenBackV521=requestBackForFs;
  wrapHomeOpen();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wrapHomeOpen,{once:true});
  setTimeout(wrapHomeOpen,200);setTimeout(wrapHomeOpen,900);setTimeout(wrapHomeOpen,1800);
})();


(function(){
  'use strict';
  var timer=null, realtime=null, busy=false, lastCount=-1, sessionPromise=null;
  function clean(v){return String(v==null?'':v).trim();}
  function sb(){try{return (typeof happyadSb==='function'&&happyadSb())||window.happyadSupabase||(window.supabase&&window.supabase.createClient&&(window.happyadSupabase=window.supabase.createClient(window.HAPPYAD_SUPABASE_URL,window.HAPPYAD_SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:'sb-txjjyhupbejgjcianrmr-auth-token'}})));}catch(e){return null;}}
  function nav(){return document.querySelector('.bottom .nav[data-happyad-bottom-message]');}
  function badge(){var n=nav(); if(!n)return null; var b=n.querySelector('.happyad-home-msg-count'); if(!b){b=document.createElement('span');b.className='happyad-home-msg-count';n.appendChild(b);} return b;}
  function setCount(n,force){n=Math.max(0,Math.min(99,Number(n)||0)); if(!force && n===lastCount)return; lastCount=n; var b=badge(); if(!b)return; b.textContent=n>99?'99+':String(n); b.classList.toggle('on',n>0);}
  function readJsonRaw(raw){try{return JSON.parse(raw||'')}catch(e){return null}}
  function sessionFromRaw(raw){var p=readJsonRaw(raw); if(!p)return null; var roots=[p,p.currentSession,p.session,p.data&&p.data.session,p.data,p.auth].filter(Boolean); for(var i=0;i<roots.length;i++){var r=roots[i]||{}; var access=clean(r.access_token||r.accessToken||r.access); var refresh=clean(r.refresh_token||r.refreshToken||r.refresh); var u=r.user||p.user||{}; var exp=Number(r.expires_at||r.expiresAt||0); if(access&&refresh){if(exp && exp<Math.floor(Date.now()/1000)-120)continue; return {access_token:access,refresh_token:refresh,user:u,id:clean(u&&u.id)};}} return null;}
  function storedSession(){var areas=[localStorage,sessionStorage]; for(var a=0;a<areas.length;a++){try{var st=areas[a]; for(var i=0;i<st.length;i++){var k=st.key(i)||''; if(!/sb-|supabase|auth-token|auth\.token/i.test(k))continue; var cand=sessionFromRaw(st.getItem(k)); if(cand)return cand;}}catch(e){}} return null;}
  async function ensureSession(force){
    if(sessionPromise && !force)return sessionPromise;
    sessionPromise=(async function(){
      var c=sb(), id='', token='', ready=false;
      try{if(c&&c.auth&&c.auth.getSession){var s=await c.auth.getSession(); var sess=s&&s.data&&s.data.session; id=clean(sess&&sess.user&&sess.user.id); token=clean(sess&&sess.access_token); ready=!!(id&&token);}}catch(e){}
      if(!ready){try{var stored=storedSession(); if(stored&&c&&c.auth&&c.auth.setSession){var ss=await c.auth.setSession({access_token:stored.access_token,refresh_token:stored.refresh_token}); var sess2=ss&&ss.data&&ss.data.session; id=clean(sess2&&sess2.user&&sess2.user.id)||stored.id; token=clean(sess2&&sess2.access_token)||stored.access_token; ready=!!(id&&token);}}catch(e){}}
      if(id){try{localStorage.setItem('HAPPYAD_AUTH_UID',id);}catch(e){}}
      if(token&&c&&c.realtime&&typeof c.realtime.setAuth==='function'){try{c.realtime.setAuth(token);}catch(e){}}
      setTimeout(function(){sessionPromise=null;},1200);
      return {id:id,token:token,ready:ready};
    })();
    return sessionPromise;
  }
  function readStateFor(uid){try{return JSON.parse(localStorage.getItem('HAPPYAD_MSG_READ_STATE_STABLE_V1_'+clean(uid))||sessionStorage.getItem('HAPPYAD_MSG_READ_STATE_STABLE_V1_'+clean(uid))||'{}')||{}}catch(e){return {}}}
  function unique(arr){var out={},n=[];(arr||[]).forEach(function(x){x=clean(x);if(x&&!out[x]){out[x]=1;n.push(x)}});return n;}
  function isLocallyRead(m,state){try{var cid=clean(m&&m.conversation_id), mid=clean(m&&m.id), at=Date.parse(clean(m&&m.created_at)||'')||0; var st=cid&&(state||{})[cid]; if(!st)return false; if(mid&&clean(st.last_message_id)===mid)return true; var stAt=Date.parse(clean(st.last_message_at)||'')||0; if(stAt&&at&&at<=stAt+1000)return true;}catch(e){} return false;}
  async function calculateUnreadFallback(c,id){
    var rr=await c.from('happyad_msg_message_receipts').select('message_id,conversation_id,read_at').eq('user_id',id).is('read_at',null).limit(160);
    if(!rr || rr.error || !Array.isArray(rr.data))return null;
    var ids=unique(rr.data.map(function(x){return x&&x.message_id;})); if(!ids.length)return 0;
    var state=readStateFor(id), total=0;
    for(var i=0;i<ids.length;i+=80){var part=ids.slice(i,i+80); var mr=await c.from('happyad_msg_messages').select('id,conversation_id,receiver_id,deleted_for_all,created_at').in('id',part).eq('receiver_id',id).eq('deleted_for_all',false); if(mr&&!mr.error&&Array.isArray(mr.data)){mr.data.forEach(function(m){if(!isLocallyRead(m,state))total++;});}}
    return total;
  }
  async function refresh(force){
    if(busy)return; busy=true;
    try{
      var c=sb(); if(!c){busy=false;return;}
      var sess=await ensureSession(!!force); if(!sess||!sess.ready||!sess.id){busy=false;setTimeout(function(){refresh(true);},1800);return;}
      try{var rpc=await c.rpc('happyad_msg_unread_count'); if(rpc&&!rpc.error&&rpc.data!=null){setCount(Number(rpc.data)||0,force);busy=false;return;}}catch(e){}
      var real=await calculateUnreadFallback(c,sess.id); if(typeof real==='number'){setCount(real,force);}
    }catch(e){}finally{busy=false;}
  }
  async function setupRealtime(){
    try{
      var c=sb(); if(!c||!c.channel)return;
      var sess=await ensureSession(true); if(!sess||!sess.ready||!sess.id)return;
      if(realtime){try{await c.removeChannel(realtime);}catch(e){} realtime=null;}
      var fast=function(){setTimeout(function(){refresh(true);},120);setTimeout(function(){refresh(true);},1200);};
      realtime=c.channel('happyad-home-message-counter-v637-'+sess.id)
        .on('postgres_changes',{event:'*',schema:'public',table:'happyad_msg_message_receipts',filter:'user_id=eq.'+sess.id},fast)
        .on('postgres_changes',{event:'INSERT',schema:'public',table:'happyad_msg_messages',filter:'receiver_id=eq.'+sess.id},fast)
        .subscribe(function(status){if(status==='CHANNEL_ERROR'||status==='TIMED_OUT'||status==='CLOSED')setTimeout(setupRealtime,3000);});
    }catch(e){setTimeout(setupRealtime,3500);}
  }
  function start(){badge(); refresh(true); setupRealtime(); if(timer)clearInterval(timer); timer=setInterval(function(){refresh(false);},8000);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true}); else start();
  document.addEventListener('visibilitychange',function(){if(!document.hidden){refresh(true);setupRealtime();}},false);
  window.addEventListener('focus',function(){refresh(true);},false);
  window.addEventListener('storage',function(e){if(e && /HAPPYAD_MSG_READ_STATE_STABLE_V1_|HAPPYAD_MSG_HOME_COUNTER_REFRESH/.test(e.key||''))refresh(true);},false);
  window.addEventListener('message',function(ev){try{var d=ev&&ev.data||{};if(d&&d.type==='HAPPYAD_MSG_COUNTER_REFRESH')refresh(true);}catch(e){}},false);
})();
