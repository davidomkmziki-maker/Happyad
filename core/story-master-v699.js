(function(){
  'use strict';
  if(window.__HAPPYAD_STORY_MASTER_V699__)return;
  window.__HAPPYAD_STORY_MASTER_V699__=true;
  window.__HAPPYAD_STORY_MASTER_V698__=true;
  window.__HAPPYAD_STORY_MASTER_V697__=true;
  window.__HAPPYAD_STORY_MASTER_V629__=true;

  var VERSION='STORY_MASTER_V783_SERVER_AGE_LIVE';
  var state={
    box:null,owner:'',rows:[],profile:{},index:0,closed:true,paused:false,
    raf:0,timer:0,startedAt:0,elapsed:0,duration:10000,activeFill:null,
    holdTimer:0,hold:false,startX:0,startY:0,moved:false,lastTapAt:0,
    pointers:new Map(),pinch:false,pinchDistance:0,pinchScale:1,
    zoom:{scale:1,x:0,y:0},openToken:0,
    composerDismissGuard:false,composerDismissGuardUntil:0,composerDismissPointerId:null,
    composerDismissTimer:0,composerViewportBase:0,
    shareOverlayOpen:false,shareResumePending:false,ageTimer:0
  };

  var exactNotificationOpenTokenV735=0;

  var STORY_REPLY_MARKER='\u2063HAPPYAD_STORY_REPLY_V1\u2063';
  var STORY_SHARE_TYPE='story';
  var STORY_LIKE_KEY='HAPPYAD_STORY_LIKES_BY_STORY_V696';
  function mutedKey(){return 'HAPPYAD_MUTED_STORY_OWNERS_V1_'+(currentUid()||'guest')}
  function mutedOwners(){return readJson(mutedKey(),{})||{}}
  function isMutedOwner(uid){uid=clean(uid);return !!(uid&&uid!==currentUid()&&mutedOwners()[uid])}
  function $(id){return document.getElementById(id)}
  function clean(v){return String(v==null?'':v).trim()}
  function esc(v){return String(v==null?'':v).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]||c})}
  function isUuid(v){return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(clean(v))}
  function sb(){try{return typeof window.happyadSb==='function'?window.happyadSb():(window.happyadSupabase||null)}catch(_e){return null}}
  function readJson(k,d){try{var x=JSON.parse(localStorage.getItem(k)||'');return x==null?d:x}catch(_e){return d}}
  function readUser(){try{return (window.UserStore&&window.UserStore.data)||readJson('HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL',{})||{}}catch(_e){return {}}}
  function currentUid(){var u=readUser();return clean(u.id||u.user_id||u.uid||localStorage.getItem('HAPPYAD_AUTH_UID'))}
  function isMineItem(p){var me=currentUid(),o=ownerOf(p);if(me&&o===me)return true;try{if(typeof window.happyadIsMine==='function'&&window.happyadIsMine(p))return true}catch(_e){}var u=readUser(),h=clean(u.handle||u.username).replace(/^@+/,'').toLowerCase(),ph=clean(p&&(p.handle||p.username)).replace(/^@+/,'').toLowerCase();return !!(me&&h&&ph&&h===ph)}
  function ownerOf(p){p=p||{};return clean(p.creatorId||p.user_id||p.userId||p.auth_user_id||p.authUserId||p.account_uid||p.accountUid||p.ownerId||p.owner_id||p.creator_id||p.uid)}
  function storyId(p){p=p||{};return clean(p.sourceId||p.source_id||p.story_id||p.storyId||p.id)}
  function isStory(p){var k=clean(p&&(p.mode||p.type||p.category||p.source_type||p.sourceType)).toLowerCase();return k==='story'||!!(p&&p.__storyTable==='happyad_stories')||!!(p&&p.isRadar===true&&p.isLive!==true)}
  function mediaOf(p){p=p||{};return clean(p.media_url||p.mediaUrl||p.story||p.url||p.media)}
  function typeOf(p){var t=clean(p&&(p.media_type||p.mediaType||p.kind||p.storyKind)).toLowerCase();return t.indexOf('video')>=0?'video':'photo'}
  function descOf(p){p=p||{};return clean(p.description||p.caption||p.story_description||p.story_caption||p.desc||p.storyDesc)}
  function timestampMsV783(v){
    if(v==null||v==='')return 0;
    if(typeof v==='number'&&Number.isFinite(v))return v>0&&v<100000000000?v*1000:(v>0?v:0);
    var text=clean(v);if(!text)return 0;
    if(/^\d+(?:\.\d+)?$/.test(text)){var n=Number(text);return Number.isFinite(n)?(n<100000000000?n*1000:n):0}
    var d=Date.parse(text);return Number.isFinite(d)?d:0;
  }
  function createdOf(p){
    p=p||{};var values=[p.created_at,p.createdAt,p.story_created_at,p.published_at,p.inserted_at];
    for(var i=0;i<values.length;i++){var ms=timestampMsV783(values[i]);if(ms>0)return ms}
    return 0;
  }
  function createdIsoV783(p){var ms=createdOf(p);return ms>0?new Date(ms).toISOString():''}
  function active(p){if(!p)return false;if(p.is_active===false||p.active===false||p.deleted===true)return false;var ex=p.expires_at||p.expiresAt||p.expire_at||p.expired_at;if(ex&&Date.parse(ex)<Date.now())return false;return !!mediaOf(p)}
  function badgeHtml(b){try{return typeof window.badgeMarkHtml==='function'?window.badgeMarkHtml(b):''}catch(_e){return ''}}
  function initials(n){n=clean(n)||'H';return (n[0]||'H').toUpperCase()}
  function ageOf(v){var d=createdOf(v);if(!d)return 'À l’instant';var s=Math.max(0,Math.floor((Date.now()-d)/1000));if(s<60)return s+' s';if(s<3600)return Math.floor(s/60)+' min';if(s<86400)return Math.floor(s/3600)+' h';return Math.floor(s/86400)+' j'}
  function stopAgeTickerV783(){if(state.ageTimer){clearInterval(state.ageTimer);state.ageTimer=0}}
  function refreshViewerAgeV783(){if(state.closed)return;var sub=$('ha629Sub'),row=currentRow();if(sub&&row)sub.textContent=ageOf(row)}
  function startAgeTickerV783(){stopAgeTickerV783();refreshViewerAgeV783();state.ageTimer=setInterval(refreshViewerAgeV783,1000)}
  function refreshRadarAgesV783(){
    if(document.hidden)return;
    document.querySelectorAll('[data-story-age-v783]').forEach(function(el){
      var ms=timestampMsV783(el.getAttribute('data-story-created-at'));
      if(ms>0)el.textContent=ageOf({createdAt:ms});
    });
  }
  function toast(msg){try{if(typeof window.toast==='function')return window.toast(msg)}catch(_e){}var old=$('haStoryToastV629');if(old)old.remove();var n=document.createElement('div');n.id='haStoryToastV629';n.textContent=msg;n.style.cssText='position:fixed;left:50%;bottom:calc(118px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:2147483647;background:rgba(20,23,30,.94);color:#fff;border:1px solid rgba(255,255,255,.16);border-radius:999px;padding:10px 15px;font:800 13px system-ui;max-width:82vw;text-align:center';document.body.appendChild(n);setTimeout(function(){try{n.remove()}catch(_e){}},2200)}

  function itemFromRow(r,p){p=p||{};return {
    id:storyId(r),sourceId:storyId(r),story_id:storyId(r),mode:'story',type:'story',category:'story',
    creatorId:ownerOf(r)||ownerOf(p),user_id:ownerOf(r)||ownerOf(p),
    creatorName:clean(p.full_name||p.display_name||p.name||r.user_name||r.display_name||r.creatorName)||'Utilisateur HAPPYAD',
    handle:clean(p.username||p.handle||r.username||r.handle),avatar:clean(p.avatar_url||p.avatar||r.user_avatar||r.avatar_url||r.avatar),
    badge:clean(p.badge||p.user_badge||r.badge||r.user_badge),mediaUrl:mediaOf(r),media_url:mediaOf(r),mediaType:typeOf(r),kind:typeOf(r),
    description:descOf(r),desc:descOf(r),createdAt:createdOf(r),created_at:r.created_at||createdIsoV783(r),expiresAt:r.expires_at||r.expiresAt||'',
    isRadar:true,isLive:false,isSeen:!!(r.isSeen||r.seen||r.viewed),__storyTable:'happyad_stories'
  }}
  function rowFromItem(p){return {
    id:storyId(p),user_id:ownerOf(p),media_url:mediaOf(p),media_type:typeOf(p),description:descOf(p),created_at:p.created_at||createdIsoV783(p),
    expires_at:p.expires_at||p.expiresAt||'',user_name:p.creatorName||p.user_name||p.title||'',user_avatar:p.avatar||p.user_avatar||p.avatar_url||'',
    badge:p.badge||p.userBadge||p.user_badge||'',username:clean(p.username||p.handle).replace(/^@+/,'')
  }}
  function profileFromItem(p){p=p||{};return {id:ownerOf(p),full_name:clean(p.creatorName||p.user_name||p.display_name||p.title),username:clean(p.username||p.handle).replace(/^@+/,''),avatar_url:clean(p.avatar||p.user_avatar||p.avatar_url),badge:clean(p.badge||p.userBadge||p.user_badge)}}

  function cacheStories(){
    var arr=[];
    try{if(Array.isArray(window.HAPPYAD_STORIES_ITEMS))arr=arr.concat(window.HAPPYAD_STORIES_ITEMS)}catch(_e){}
    try{var x=readJson('HAPPYAD_STORIES_CACHE_V1',[]);if(Array.isArray(x))arr=arr.concat(x)}catch(_e){}
    var seen={},out=[];
    arr.forEach(function(p){var id=storyId(p),key=id||ownerOf(p)+'|'+mediaOf(p);if(!key||seen[key]||!isStory(p)||!active(p)||isMutedOwner(ownerOf(p)))return;seen[key]=1;out.push(p)});
    var me=readUser(),uid=currentUid();
    /* V783 : le secours local n'invente plus Date.now() à chaque rendu.
       Il n'est accepté que s'il possède l'identifiant et l'heure réels de la
       ligne happyad_stories. Sinon le prochain fetch serveur reste la vérité. */
    var localCreated=timestampMsV783(me.storyCreatedAt||me.story_created_at||me.storyCreated||'');
    var localExpires=timestampMsV783(me.storyExpiresAt||me.story_expires_at||me.storyExpires||'');
    if(uid&&me.storyActive&&clean(me.story)&&isUuid(me.storyId||me.story_id)&&localCreated>0&&(!localExpires||localExpires>Date.now())){
      var has=out.some(function(p){return ownerOf(p)===uid&&mediaOf(p)===clean(me.story)});
      if(!has)out.push({id:clean(me.storyId||me.story_id),sourceId:clean(me.storyId||me.story_id),mode:'story',type:'story',category:'story',creatorId:uid,user_id:uid,creatorName:clean(me.name||me.full_name)||'Ta story',handle:clean(me.handle||me.username),avatar:clean(me.avatar||me.avatar_url),badge:clean(me.badge||me.user_badge),mediaUrl:clean(me.story),mediaType:clean(me.storyKind)||'photo',description:clean(me.storyDesc),createdAt:localCreated,created_at:new Date(localCreated).toISOString(),expiresAt:localExpires?new Date(localExpires).toISOString():'',isRadar:true,isLive:false,__storyTable:'happyad_stories'});
    }
    return out;
  }
  function cachedRowsForOwner(owner,seed){
    var me=currentUid();
    var arr=cacheStories().filter(function(p){return ownerOf(p)===owner||(owner===me&&isMineItem(p))}).map(function(p){var r=rowFromItem(p);if(owner===me&&isMineItem(p))r.user_id=owner;return r}).filter(active);
    if(seed&&(ownerOf(seed)===owner||(owner===me&&isMineItem(seed)))&&active(seed)&&!arr.some(function(r){return storyId(r)===storyId(seed)})){var sr=rowFromItem(seed);if(owner===me)sr.user_id=owner;arr.push(sr)}
    arr.sort(function(a,b){return createdOf(a)-createdOf(b)});
    return arr;
  }
  function mergeStoryCache(owner,rows,profile){
    try{
      var all=cacheStories().filter(function(p){return ownerOf(p)!==owner});
      rows.forEach(function(r){all.push(itemFromRow(r,profile))});
      all.sort(function(a,b){return createdOf(b)-createdOf(a)});
      all=all.slice(0,100);
      window.HAPPYAD_STORIES_ITEMS=all;
      localStorage.setItem('HAPPYAD_STORIES_CACHE_V1',JSON.stringify(all));
    }catch(_e){}
  }

  async function fetchRows(owner){
    var c=sb();if(!c||!owner)return [];
    try{var q=await c.from('happyad_stories').select('*').eq('user_id',owner).eq('is_active',true).order('created_at',{ascending:true}).limit(30);if(q&&q.error)throw q.error;return (q.data||[]).filter(active)}catch(_e){return []}
  }
  async function fetchProfile(owner,seedProfile){
    var me=readUser();if(owner&&owner===currentUid())return {id:owner,full_name:clean(me.name||me.full_name),username:clean(me.handle||me.username).replace(/^@+/,''),avatar_url:clean(me.avatar||me.avatar_url),badge:clean(me.badge||me.user_badge)};
    var c=sb();if(c&&owner){try{var q=await c.from('profiles').select('*').eq('id',owner).maybeSingle();if(q&&!q.error&&q.data)return q.data}catch(_e){}}
    return seedProfile||{};
  }
  function exactStoryExpiredV735(row){
    if(!row)return true;
    if(row.is_active===false||row.active===false||row.deleted===true)return true;
    var expires=clean(row.expires_at||row.expiresAt||row.expire_at||row.expired_at);
    if(expires){var expiresAt=Date.parse(expires);if(Number.isFinite(expiresAt)&&expiresAt<=Date.now())return true}
    else{
      var created=Date.parse(clean(row.created_at||row.createdAt));
      if(Number.isFinite(created)&&Date.now()-created>=86400000)return true;
    }
    return !mediaOf(row);
  }
  async function fetchExactStoryV735(id){
    id=clean(id);var c=sb();
    if(!id)return {status:'missing',row:null};
    if(!c||typeof c.from!=='function')return {status:'unavailable',row:null};
    try{
      var q=await c.from('happyad_stories').select('*').eq('id',id).maybeSingle();
      if(q&&q.error)throw q.error;
      if(!q||!q.data||exactStoryExpiredV735(q.data))return {status:'expired',row:q&&q.data||null};
      return {status:'active',row:q.data};
    }catch(_e){return {status:'error',row:null}}
  }
  async function openExactNotificationV735(detail){
    detail=detail||{};var id=clean(detail.story_id||detail.id),token=++exactNotificationOpenTokenV735;
    if(!id){toast('Story introuvable.');return false}

    var exact=await fetchExactStoryV735(id);
    if(token!==exactNotificationOpenTokenV735)return false;

    if(exact.status==='expired'||exact.status==='missing'){
      toast('Cette story a expiré.');
      return false;
    }
    if(exact.status!=='active'||!exact.row){
      toast('Story indisponible. Réessayez.');
      return false;
    }

    var row=exact.row,owner=ownerOf(row)||clean(detail.owner_id||detail.user_id);
    if(!owner||storyId(row)!==id||exactStoryExpiredV735(row)){
      toast('Cette story a expiré.');
      return false;
    }

    var seed={
      id:id,story_id:id,sourceId:id,mode:'story',type:'story',category:'story',
      creatorId:owner,user_id:owner,creatorName:clean(detail.author_name||row.user_name||row.display_name)||'Utilisateur HAPPYAD',
      mediaUrl:mediaOf(row),media_url:mediaOf(row),mediaType:typeOf(row),description:descOf(row),
      created_at:row.created_at||'',expires_at:row.expires_at||'',isRadar:true,isLive:false,__storyTable:'happyad_stories'
    };
    var profile=await fetchProfile(owner,profileFromItem(seed));
    if(token!==exactNotificationOpenTokenV735)return false;
    if(exactStoryExpiredV735(row)){
      toast('Cette story a expiré.');
      return false;
    }

    mergeStoryCache(owner,[row],profile||{});
    show(owner,[row],profile||profileFromItem(seed),id);
    return true;
  }
  async function authUid(){try{if(typeof window.happyadAuthUser==='function'){var u=await window.happyadAuthUser();if(u&&u.id)return clean(u.id)}}catch(_e){}return currentUid()}
  function analyticsTrackV728(type,row,extra){try{var api=window.HappyAnalyticsV728;if(!api||typeof api.track!=='function'||!row)return false;var owner=ownerOf(row),viewer=currentUid();if(!owner||owner===viewer)return false;extra=extra||{};return api.track(type,{ownerId:owner,contentId:storyId(row),contentType:'story',source:'story',completed:!!extra.completed,duration:Number(extra.duration||0)||0,dedupeKey:extra.dedupeKey||'',metadata:extra.metadata||{}})}catch(_e){return false}}
  async function markSeen(row){
    var id=storyId(row),viewer=await authUid(),owner=ownerOf(row);if(!id||!viewer)return;
    try{var seen=readJson('HAPPYAD_HOME_RADAR_SEEN_V1',{});seen[id]=Date.now();localStorage.setItem('HAPPYAD_HOME_RADAR_SEEN_V1',JSON.stringify(seen));localStorage.setItem('HAPPYAD_RADAR_REFRESH_NEEDED','1')}catch(_e){}
    try{var arr=cacheStories();arr.forEach(function(p){if(storyId(p)===id){p.isSeen=true;p.seen=true;p.viewed=true}});window.HAPPYAD_STORIES_ITEMS=arr;localStorage.setItem('HAPPYAD_STORIES_CACHE_V1',JSON.stringify(arr))}catch(_e){}
    if(owner===viewer)return;
    var c=sb();if(!c)return;
    try{var now=new Date().toISOString();var q=await c.from('happyad_story_views').select('story_id').eq('story_id',id).eq('viewer_id',viewer).limit(1);if(q&&q.data&&q.data.length)await c.from('happyad_story_views').update({viewed_at:now}).eq('story_id',id).eq('viewer_id',viewer);else await c.from('happyad_story_views').insert({story_id:id,viewer_id:viewer,viewed_at:now})}catch(_e){}
  }
  function storyLikeStorageKey(){return STORY_LIKE_KEY+'_'+(currentUid()||'guest')}
  function storyLikeMap(){return readJson(storyLikeStorageKey(),{})||{}}
  function localStoryLike(id){id=clean(id);if(!id)return false;var map=storyLikeMap();return !!map[id]}
  function setLocalStoryLike(id,on){id=clean(id);if(!id)return;try{var map=storyLikeMap();if(on)map[id]=Date.now();else delete map[id];localStorage.setItem(storyLikeStorageKey(),JSON.stringify(map))}catch(_e){}}
  function storyLikeBool(data,fallback){
    if(typeof data==='boolean')return data;
    if(Array.isArray(data))data=data[0];
    if(data&&typeof data==='object'){
      if(typeof data.liked==='boolean')return data.liked;
      if(typeof data.is_liked==='boolean')return data.is_liked;
      if(typeof data.value==='boolean')return data.value;
    }
    return !!fallback;
  }
  function isMissingRpcError(err){
    var code=clean(err&&err.code).toUpperCase(),msg=clean(err&&(err.message||err.details||err.hint)).toLowerCase();
    return code==='PGRST202'||code==='42883'||msg.indexOf('function')>=0||msg.indexOf('schema cache')>=0;
  }
  async function loadLike(row){
    var id=storyId(row),viewer=await authUid(),c=sb();if(!id||!viewer||!c)return localStoryLike(id);
    try{
      var rpcState=await c.rpc('happyad_story_like_state_v697',{p_story_id:id});
      if(rpcState&&rpcState.error)throw rpcState.error;
      var rpcOn=storyLikeBool(rpcState&&rpcState.data,localStoryLike(id));setLocalStoryLike(id,rpcOn);return rpcOn;
    }catch(_rpcError){
      try{
        var q=await c.from('happyad_story_likes').select('liked,updated_at').eq('story_id',id).eq('user_id',viewer).maybeSingle();
        if(q&&q.error)throw q.error;
        var on=!!(q&&q.data&&q.data.liked);setLocalStoryLike(id,on);return on;
      }catch(_tableError){
        try{
          var old=await c.from('happyad_content_actions').select('liked,created_at').eq('post_id',id).eq('action_type','like').eq('user_id',viewer).in('content_type',['story','photo']).order('created_at',{ascending:false}).limit(1);
          if(old&&!old.error){var oldOn=!!(old.data&&old.data[0]&&old.data[0].liked);setLocalStoryLike(id,oldOn);return oldOn}
        }catch(_oldError){}
        return localStoryLike(id);
      }
    }
  }
  async function saveLike(row,on){
    var id=storyId(row),viewer=await authUid(),c=sb();if(!id||!viewer||!c)return false;
    setLocalStoryLike(id,on);
    try{
      var result=await c.rpc('happyad_story_like_set_v697',{p_story_id:id,p_liked:!!on});
      if(result&&result.error&&isMissingRpcError(result.error)){
        await new Promise(function(resolve){setTimeout(resolve,320)});
        result=await c.rpc('happyad_story_like_set_v697',{p_story_id:id,p_liked:!!on});
      }
      if(result&&result.error)throw result.error;
      var confirmed=storyLikeBool(result&&result.data,on);
      setLocalStoryLike(id,confirmed);
      return confirmed===!!on;
    }catch(_rpcError){
      try{
        var now=new Date().toISOString();
        var direct=await c.from('happyad_story_likes').upsert({story_id:id,user_id:viewer,liked:!!on,updated_at:now},{onConflict:'story_id,user_id'});
        if(direct&&direct.error)throw direct.error;
        return true;
      }catch(_tableError){
        setLocalStoryLike(id,!on);
        try{console.warn('[HAPPYAD V697] story like sync',_rpcError||_tableError)}catch(_e){}
        return false;
      }
    }
  }
  function uuid(){try{return crypto.randomUUID()}catch(_e){return '00000000-0000-4000-8000-'+String(Date.now()).padStart(12,'0').slice(-12)}}
  async function rpc(name,variants){
    var c=sb();if(!c||typeof c.rpc!=='function')throw new Error('Connexion Messages indisponible.');var last=null;
    for(var i=0;i<variants.length;i++){var r=await c.rpc(name,variants[i]);if(!r.error)return r.data;last=r.error;var code=clean(last&&last.code).toUpperCase(),txt=clean(last&&(last.message||last.details||last.hint)).toLowerCase();if(!(code==='PGRST202'||code==='42883'||txt.indexOf('function')>=0))break}
    throw new Error(clean(last&&(last.message||last.details))||'Envoi impossible.');
  }
  function firstRow(data){if(Array.isArray(data))return data[0]||{};if(data&&Array.isArray(data.data))return data.data[0]||{};return data||{}}
  async function sendStoryReply(row,text){
    var target=ownerOf(row),me=await authUid();if(!isUuid(target)||!isUuid(me)||target===me)throw new Error('Destinataire indisponible.');
    var opened=await rpc('happyad_msg_open_direct',[{p_target_user_id:target},{target_user_id:target}]);
    var o=firstRow(opened),conversation=clean(o.conversation_id||o.id||(typeof opened==='string'?opened:''));if(!isUuid(conversation))throw new Error('Conversation indisponible.');
    var profile=state.profile||{},author=clean(profile.full_name||profile.display_name||profile.name||row.user_name)||'HAPPYAD';
    var meProfile=readUser(),replyActor=clean(meProfile.name||meProfile.full_name||meProfile.display_name||meProfile.username||meProfile.handle)||'Un utilisateur';
    var meta={story_id:storyId(row),owner_id:target,user_id:target,media_url:mediaOf(row),preview_url:mediaOf(row),thumbnail_url:clean(row.thumbnail_url||row.poster_url),media_type:typeOf(row),title:'Story de '+author,author_name:author,reply_actor_id:me,reply_actor_name:replyActor,description:descOf(row),created_at:row.created_at||new Date(createdOf(row)).toISOString(),expires_at:row.expires_at||row.expiresAt||''};
    var body=STORY_REPLY_MARKER+JSON.stringify(meta)+'\n'+clean(text),clientId=uuid();
    await rpc('happyad_msg_send_text',[{p_conversation_id:conversation,p_client_message_id:clientId,p_body:body,p_reply_to_id:null},{conversation_id:conversation,client_message_id:clientId,body:body,reply_to_id:null}]);
    analyticsTrackV728('story_reply',row,{dedupeKey:'v728:story-reply:'+clientId,metadata:{conversation_id:conversation}});
    try{localStorage.setItem('HAPPYAD_MESSAGES_REFRESH_NEEDED','1');localStorage.setItem('HAPPYAD_MSG_LAST_STORY_REPLY_V629',JSON.stringify({conversation_id:conversation,story_id:storyId(row),target_user_id:target,at:Date.now()}))}catch(_e){}
    return true;
  }

  function installCss(){
    if($('happyad-story-master-v699-css'))return;
    try{var previous=$('happyad-story-master-v629-css');if(previous)previous.remove()}catch(_e){}
    var st=document.createElement('style');st.id='happyad-story-master-v699-css';st.textContent=`
#happyStoryViewerMasterV629.haStoryV629{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;height:100dvh!important;margin:0!important;padding:0!important;display:none!important;background:#000!important;color:#fff!important;z-index:2147483647!important;overflow:hidden!important;font-family:system-ui,-apple-system,Segoe UI,sans-serif!important;align-items:stretch!important;justify-content:stretch!important}
#happyStoryViewerMasterV629.haStoryV629.on{display:block!important}
#happyStoryViewerMasterV629.haStoryV629.haStoryShareUnderlayV705{z-index:2147483600!important;pointer-events:none!important}
#happyStoryViewerMasterV629.haStoryV629 .ha629Card{position:absolute!important;inset:0!important;width:100vw!important;height:100vh!important;height:100dvh!important;max-width:none!important;max-height:none!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;box-shadow:none!important;background:#000!important;overflow:hidden!important}
#happyStoryViewerMasterV629.haStoryV629 .ha629Backdrop{position:absolute!important;inset:-28px!important;z-index:0!important;background-position:center!important;background-size:cover!important;filter:blur(26px) brightness(.42)!important;transform:scale(1.10)!important;opacity:.72!important;pointer-events:none!important}
#happyStoryViewerMasterV629.haStoryV629 .ha629Media{position:absolute!important;inset:0!important;z-index:1!important;display:grid!important;place-items:center!important;width:100%!important;height:100%!important;background:transparent!important;overflow:hidden!important;touch-action:none!important}
#happyStoryViewerMasterV629.haStoryV629 .ha629Media img,#happyStoryViewerMasterV629.haStoryV629 .ha629Media video{display:block!important;width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;object-fit:contain!important;object-position:center!important;background:transparent!important;transform-origin:center center!important;will-change:transform!important;-webkit-user-drag:none!important;user-select:none!important}
#happyStoryViewerMasterV629.haStoryV629 .ha629ShadeTop{position:absolute!important;left:0!important;right:0!important;top:0!important;height:180px!important;z-index:3!important;background:linear-gradient(rgba(0,0,0,.78),rgba(0,0,0,.22),transparent)!important;pointer-events:none!important}
#happyStoryViewerMasterV629.haStoryV629 .ha629ShadeBottom{position:absolute!important;left:0!important;right:0!important;bottom:0!important;height:230px!important;z-index:3!important;background:linear-gradient(transparent,rgba(0,0,0,.45),rgba(0,0,0,.88))!important;pointer-events:none!important}
#happyStoryViewerMasterV629.haStoryV629 .ha629Progress{position:absolute!important;top:calc(env(safe-area-inset-top) + 8px)!important;left:10px!important;right:10px!important;height:3px!important;z-index:10!important;display:flex!important;gap:4px!important;background:transparent!important;overflow:visible!important}
#happyStoryViewerMasterV629.haStoryV629 .ha629Seg{flex:1 1 0!important;height:3px!important;border-radius:99px!important;background:rgba(255,255,255,.32)!important;overflow:hidden!important}
#happyStoryViewerMasterV629.haStoryV629 .ha629Seg>i{display:block!important;width:0;height:100%!important;border-radius:99px!important;background:#fff!important;animation:none!important;transform:none!important}
#happyStoryViewerMasterV629.haStoryV629 .ha629Top{position:absolute!important;left:10px!important;right:10px!important;top:calc(env(safe-area-inset-top) + 18px)!important;z-index:11!important;display:flex!important;align-items:center!important;gap:10px!important;padding:8px 0!important;background:transparent!important}
#happyStoryViewerMasterV629.haStoryV629 .ha629Back,#happyStoryViewerMasterV629.haStoryV629 .ha629More{width:38px!important;height:38px!important;min-width:38px!important;border:0!important;border-radius:999px!important;background:rgba(0,0,0,.28)!important;color:#fff!important;display:grid!important;place-items:center!important;font-size:26px!important;font-weight:700!important;padding:0!important;backdrop-filter:blur(8px)!important}
#happyStoryViewerMasterV629.haStoryV629 .ha629More{margin-left:auto!important;font-size:27px!important;line-height:1!important}
#happyStoryViewerMasterV629.haStoryV629 .ha629Avatar{width:40px!important;height:40px!important;min-width:40px!important;border-radius:999px!important;overflow:hidden!important;background:#1c2029!important;border:2px solid rgba(255,255,255,.82)!important;display:grid!important;place-items:center!important;font-weight:950!important}
#happyStoryViewerMasterV629.haStoryV629 .ha629Avatar img{width:100%!important;height:100%!important;object-fit:cover!important;transform:none!important;background:#151922!important}
#happyStoryViewerMasterV629.haStoryV629 .ha629Identity{min-width:0!important;flex:1 1 auto!important}
#happyStoryViewerMasterV629.haStoryV629 .ha629Name{display:flex!important;align-items:center!important;gap:5px!important;min-width:0!important;font-size:16px!important;font-weight:900!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;text-shadow:0 1px 4px #000!important}
#happyStoryViewerMasterV629.haStoryV629 .ha629Sub{font-size:12px!important;color:#e0e3e9!important;margin-top:2px!important;white-space:nowrap!important;text-shadow:0 1px 4px #000!important}
#happyStoryViewerMasterV629.haStoryV629 .ha629Caption{position:absolute!important;left:18px!important;right:18px!important;bottom:calc(var(--ha-story-composer-h,62px) + 38px + env(safe-area-inset-bottom))!important;z-index:7!important;padding:0!important;background:transparent!important;color:#fff!important;font-size:16px!important;font-weight:750!important;line-height:1.35!important;text-shadow:0 1px 5px #000!important;max-height:25vh!important;overflow:auto!important}
#happyStoryViewerMasterV629.haStoryV629 .ha629VisitorActions{position:absolute!important;left:12px!important;right:12px!important;bottom:calc(10px + env(safe-area-inset-bottom))!important;z-index:12!important;display:grid!important;grid-template-columns:minmax(0,1fr) 48px 48px!important;align-items:end!important;gap:8px!important;padding:7px!important;border:1px solid rgba(255,255,255,.13)!important;border-radius:30px!important;background:linear-gradient(180deg,rgba(9,13,22,.72),rgba(3,6,11,.9))!important;box-shadow:0 12px 34px rgba(0,0,0,.38)!important;backdrop-filter:blur(18px)!important;-webkit-backdrop-filter:blur(18px)!important;transition:padding .16s ease,border-radius .16s ease,background .16s ease!important}
#happyStoryViewerMasterV629.haStoryV629 .ha629VisitorActions.is-composing{grid-template-columns:minmax(0,1fr)!important;gap:0!important;padding:0!important;border-color:rgba(255,255,255,.18)!important;border-radius:27px!important;background:rgba(19,22,29,.96)!important;box-shadow:0 18px 48px rgba(0,0,0,.52)!important}
#happyStoryViewerMasterV629.haStoryV629 .ha629ReplyForm{position:relative!important;display:flex!important;align-items:flex-end!important;min-width:0!important;min-height:48px!important;height:48px!important;max-height:48px!important;border:1px solid rgba(255,255,255,.22)!important;border-radius:24px!important;background:rgba(255,255,255,.075)!important;overflow:hidden!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.05)!important;transition:min-height .16s ease,height .16s ease,max-height .16s ease,border-color .14s ease,background .14s ease,border-radius .16s ease!important}
#happyStoryViewerMasterV629.haStoryV629 .ha629ReplyForm:focus-within{border-color:rgba(255,255,255,.5)!important;background:rgba(255,255,255,.105)!important}
#happyStoryViewerMasterV629.haStoryV629 .ha629VisitorActions.is-composing .ha629ReplyForm{width:100%!important;min-height:116px!important;height:116px!important;max-height:116px!important;border-color:transparent!important;border-radius:26px!important;background:transparent!important;box-shadow:none!important}
#happyStoryViewerMasterV629.haStoryV629 .ha629ReplyInput{flex:1!important;min-width:0!important;width:100%!important;min-height:48px!important;height:48px!important;max-height:48px!important;border:0!important;outline:0!important;background:transparent!important;color:#fff!important;padding:13px 50px 12px 15px!important;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif!important;font-size:16px!important;font-style:normal!important;font-variant:normal!important;font-weight:400!important;letter-spacing:normal!important;line-height:22px!important;text-transform:none!important;box-sizing:border-box!important;resize:none!important;overflow-y:hidden!important;overflow-x:hidden!important;white-space:pre-wrap!important;overflow-wrap:anywhere!important;word-break:break-word!important;overscroll-behavior:contain!important;scrollbar-width:none!important;-ms-overflow-style:none!important}
#happyStoryViewerMasterV629.haStoryV629 .ha629VisitorActions.is-composing .ha629ReplyInput{min-height:116px!important;height:116px!important;max-height:116px!important;padding:13px 54px 13px 16px!important;overflow-y:auto!important}
#happyStoryViewerMasterV629.haStoryV629 .ha629ReplyInput::placeholder{color:rgba(255,255,255,.68)!important;font-family:inherit!important;font-size:16px!important;font-style:normal!important;font-weight:400!important;letter-spacing:normal!important}
#happyStoryViewerMasterV629.haStoryV629 .ha629ReplyInput::-webkit-scrollbar{width:0!important;height:0!important;display:none!important}
#happyStoryViewerMasterV629.haStoryV629 .ha629ReplyForm.is-scrollable .ha629ReplyInput{overflow-y:auto!important}
#happyStoryViewerMasterV629.haStoryV629 .ha629VisitorActions.is-composing>.ha629IconAct{display:none!important}
#happyStoryViewerMasterV629.haStoryV629 .ha629Send{position:absolute!important;right:4px!important;bottom:4px!important;display:grid!important;place-items:center!important;width:40px!important;height:40px!important;min-width:40px!important;margin:0!important;align-self:auto!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:50%!important;background:rgba(255,255,255,.10)!important;color:rgba(255,255,255,.65)!important;padding:0!important;transition:transform .14s ease,background .14s ease,color .14s ease!important}
#happyStoryViewerMasterV629.haStoryV629 .ha629VisitorActions.is-composing .ha629Send{right:8px!important;bottom:8px!important}
#happyStoryViewerMasterV629.haStoryV629 .ha629Send svg{width:22px!important;height:22px!important;display:block!important;fill:none!important;stroke:currentColor!important;stroke-width:2.15!important;stroke-linecap:round!important;stroke-linejoin:round!important}
#happyStoryViewerMasterV629.haStoryV629 .ha629Send.ready{background:#fff!important;color:#0a0e16!important;border-color:#fff!important;box-shadow:0 6px 18px rgba(255,255,255,.18)!important}
#happyStoryViewerMasterV629.haStoryV629 .ha629Send.ready:active{transform:scale(.93)!important}
#happyStoryViewerMasterV629.haStoryV629 .ha629Send.sending{opacity:.62!important;pointer-events:none!important}
#happyStoryViewerMasterV629.haStoryV629 .ha629IconAct{width:48px!important;height:48px!important;min-width:48px!important;border:1px solid rgba(255,255,255,.16)!important;border-radius:50%!important;background:rgba(255,255,255,.075)!important;color:#fff!important;display:grid!important;place-items:center!important;padding:0!important;text-shadow:0 1px 5px #000!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.05)!important}
#happyStoryViewerMasterV629.haStoryV629 .ha629IconAct:active{transform:scale(.93)!important}
#happyStoryViewerMasterV629.haStoryV629 .ha629IconAct.on{color:#ff4f78!important;background:rgba(255,79,120,.12)!important;border-color:rgba(255,79,120,.35)!important}
#happyStoryViewerMasterV629.haStoryV629 .ha629OwnerActions{position:absolute!important;left:0!important;right:0!important;bottom:calc(6px + env(safe-area-inset-bottom))!important;z-index:12!important;display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:2px!important;padding:10px 8px 4px!important;background:rgba(6,9,14,.86)!important}
#happyStoryViewerMasterV629.haStoryV629 .ha629OwnerAct{border:0!important;background:transparent!important;color:#fff!important;min-width:0!important;padding:4px 1px 8px!important;font-weight:800!important;font-size:13px!important;display:flex!important;flex-direction:column!important;align-items:center!important;gap:6px!important}
#happyStoryViewerMasterV629.haStoryV629 .ha629OwnerAct span:first-child{font-size:29px!important;line-height:1!important}#happyStoryViewerMasterV629.haStoryV629 .ha629OwnerAct svg{width:31px!important;height:31px!important;display:block!important;fill:none!important;stroke:currentColor!important;stroke-width:2.15!important;stroke-linecap:round!important;stroke-linejoin:round!important}
#happyStoryViewerMasterV629.haStoryV629 .ha629Loading{position:absolute!important;inset:0!important;z-index:2!important;display:grid!important;place-items:center!important;color:#d9dde5!important;font-weight:800!important;background:#000!important}
#happyStoryViewerMasterV629.haStoryV629 .ha629Views{display:none!important}
body.haStoryOpenV629,html.haStoryOpenV629{overflow:hidden!important;overscroll-behavior:none!important}
.radarRow .haStoryRadarUnitV629{position:relative!important;flex:0 0 92px!important;width:92px!important;display:flex!important;justify-content:center!important;background:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important;overflow:visible!important}
.radarRow .haStoryRadarUnitV629>.radarItem{width:92px!important;min-width:92px!important;max-width:92px!important;background:transparent!important;background-color:transparent!important;background-image:none!important;border:0!important;border-color:transparent!important;border-radius:0!important;box-shadow:none!important;outline:0!important;padding:0!important;color:inherit!important;cursor:pointer!important;-webkit-appearance:none!important;appearance:none!important;-webkit-tap-highlight-color:transparent!important;touch-action:manipulation!important;filter:none!important;translate:0 0!important;scale:1!important}
.radarRow .haStoryRadarUnitV629>.radarItem:hover,.radarRow .haStoryRadarUnitV629>.radarItem:focus,.radarRow .haStoryRadarUnitV629>.radarItem:focus-visible,.radarRow .haStoryRadarUnitV629>.radarItem:active,.radarRow .haStoryRadarUnitV629>.radarItem.happyadButtonPressedV604{background:transparent!important;background-color:transparent!important;background-image:none!important;border:0!important;border-color:transparent!important;box-shadow:none!important;outline:0!important;filter:none!important;translate:0 0!important;scale:1!important}
.radarRow .haStoryRadarUnitV629>.radarItem:active .radarAvatar,.radarRow .haStoryRadarUnitV629>.radarItem.happyadButtonPressedV604 .radarAvatar{transform:scale(.965)!important;transition:transform .07s ease!important}
.radarRow .haStoryRadarUnitV629 .radarAvatar{width:74px!important;height:74px!important;min-width:74px!important;max-width:74px!important;border-width:3px!important;margin:0 auto!important;box-sizing:border-box!important}
.radarRow .haStoryRadarUnitV629 .radarAvatar img{width:100%!important;height:100%!important;object-fit:cover!important}
.radarRow .haStoryRadarUnitV629 .radarName{max-width:92px!important;margin-top:7px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;font-size:13px!important}
.radarRow .haStoryRadarUnitV629 .radarMeta{max-width:92px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;font-size:11px!important}
.radarRow .haStoryAddMiniV629{position:absolute!important;right:7px!important;top:51px!important;width:25px!important;height:25px!important;border-radius:50%!important;border:3px solid #07080d!important;background:#ff8500!important;color:#fff!important;display:grid!important;place-items:center!important;font-size:20px!important;font-weight:950!important;line-height:1!important;text-decoration:none!important;z-index:8!important;box-sizing:border-box!important}
.radarRow .haStoryAddMiniV629:visited{background:#ff8500!important;color:#fff!important;text-decoration:none!important}.radarRow .haStoryAddMiniV629:active,.radarRow .haStoryAddMiniV629.happyadButtonPressedV604{background:#ff8500!important;color:#fff!important;filter:brightness(1.08)!important;translate:0 0!important;scale:.94!important;box-shadow:none!important}
.radarRow .haStoryAddOnlyV629 .radarAvatar{background:linear-gradient(145deg,#7b2c00,#ff8a00)!important;border-color:#ff9c24!important;color:#fff!important;font-size:40px!important}
#haStoryActivityModalV629{position:fixed!important;inset:0!important;z-index:2147483647!important;background:rgba(0,0,0,.58)!important;display:flex!important;align-items:flex-end!important;justify-content:center!important;color:#fff!important;font-family:system-ui!important}
#haStoryActivityModalV629 .haSamCard{width:min(100vw,520px)!important;max-height:72vh!important;overflow:auto!important;background:#0b0f16!important;border-radius:24px 24px 0 0!important;padding:14px 16px calc(18px + env(safe-area-inset-bottom))!important;box-shadow:0 -20px 70px rgba(0,0,0,.5)!important}
#haStoryMoreModalV629{position:fixed!important;inset:0!important;z-index:2147483647!important;background:rgba(0,0,0,.58)!important;display:flex!important;align-items:flex-end!important;justify-content:center!important;color:#fff!important;font-family:system-ui!important}#haStoryMoreModalV629 .haSmmCard{width:min(100vw,520px)!important;background:#0b0f16!important;border-radius:24px 24px 0 0!important;padding:12px 14px calc(18px + env(safe-area-inset-bottom))!important;box-shadow:0 -20px 70px rgba(0,0,0,.5)!important}.haSmmBtn{width:100%!important;min-height:50px!important;border:0!important;border-bottom:1px solid rgba(255,255,255,.08)!important;background:transparent!important;color:#fff!important;text-align:left!important;padding:12px 8px!important;font-size:15px!important;font-weight:850!important}.haSmmBtn.danger{color:#ff6f78!important}.haSmmCancel{text-align:center!important;color:#cbd2de!important}
#haStoryActivityModalV629 .haSamHead{display:flex!important;align-items:center!important;justify-content:space-between!important;font-size:18px!important;font-weight:950!important;margin-bottom:10px!important}.haSamClose{width:38px!important;height:38px!important;border:0!important;border-radius:50%!important;background:rgba(255,255,255,.12)!important;color:#fff!important;font-size:23px!important}.haSamRow{display:flex!important;align-items:center!important;gap:10px!important;padding:10px 0!important;border-bottom:1px solid rgba(255,255,255,.08)!important}.haSamCopy{min-width:0!important;flex:1!important}.haSamNameLine{display:flex!important;align-items:center!important;gap:5px!important;min-width:0!important}.haSamActions{display:flex!important;flex-wrap:wrap!important;gap:5px!important;margin-top:5px!important}.haSamAction{display:inline-flex!important;align-items:center!important;gap:4px!important;border:1px solid rgba(255,255,255,.10)!important;border-radius:999px!important;padding:3px 7px!important;background:rgba(255,255,255,.06)!important;color:#cfd7e4!important;font-size:11px!important;font-weight:850!important}.haSamAction.like{color:#ff7897!important}.haSamAction.reply{color:#76caff!important}.haSamAv{width:46px!important;height:46px!important;border-radius:50%!important;overflow:hidden!important;background:#181d27!important;display:grid!important;place-items:center!important;font-weight:900!important}.haSamAv img{width:100%!important;height:100%!important;object-fit:cover!important}.haSamEmpty{padding:22px 0!important;color:#cbd2de!important;font-weight:750!important}
@media(max-width:390px){.radarRow .haStoryRadarUnitV629{flex-basis:86px!important;width:86px!important}.radarRow .haStoryRadarUnitV629>.radarItem{width:86px!important;min-width:86px!important;max-width:86px!important}.radarRow .haStoryRadarUnitV629 .radarAvatar{width:68px!important;height:68px!important;min-width:68px!important;max-width:68px!important}.radarRow .haStoryRadarUnitV629 .radarName,.radarRow .haStoryRadarUnitV629 .radarMeta{max-width:86px!important}.radarRow .haStoryAddMiniV629{right:6px!important;top:46px!important}}
`;
    st.textContent+=`
#happyStoryViewerMasterV629 .ha629VisitorActions .ha629IconAct{display:grid!important;place-items:center!important;padding:0!important}
#happyStoryViewerMasterV629 .ha629VisitorActions .ha629IconAct svg{width:30px!important;height:30px!important;display:block!important;fill:none!important;stroke:currentColor!important;stroke-width:2.15!important;stroke-linecap:round!important;stroke-linejoin:round!important;pointer-events:none!important}
#happyStoryViewerMasterV629 .ha629VisitorActions .ha629IconAct.on{color:#ff4773!important}
#happyStoryViewerMasterV629 .ha629VisitorActions .ha629IconAct[data-happyad-story-share-v699]{color:#fff!important}
#happyStoryViewerMasterV629 .ha629VisitorActions .ha629IconAct[data-happyad-story-share-v699]:active{transform:scale(.94)!important}
`;
    document.head.appendChild(st);
  }

  function ensureViewer(){
    installCss();
    var box=$('happyStoryViewerMasterV629');
    if(box&&!box.classList.contains('haStoryV629')){try{box.remove()}catch(_e){}box=null}
    if(!box){
      box=document.createElement('div');box.id='happyStoryViewerMasterV629';box.className='haStoryV629';box.setAttribute('data-happyad-story-master','v629');box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');
      box.innerHTML='<div class="ha629Card"><div class="ha629Backdrop" id="ha629Backdrop"></div><div class="ha629Media" id="ha629Media"></div><div class="ha629ShadeTop"></div><div class="ha629ShadeBottom"></div><div class="ha629Progress" id="ha629Progress"></div><div class="ha629Top"><button class="ha629Back" id="ha629Back" type="button" aria-label="Fermer la story" data-happyad-story-control="close">‹</button><div class="ha629Avatar" id="ha629Avatar"></div><div class="ha629Identity"><div class="ha629Name" id="ha629Name">Story</div><div class="ha629Sub" id="ha629Sub">HAPPYAD</div></div><button class="ha629More" id="ha629More" type="button" aria-label="Plus" data-happyad-story-control="more">⋮</button></div><div class="ha629Caption" id="ha629Caption"></div><div id="ha629Bottom"></div></div>';
      document.body.appendChild(box);
    }
    /* V633 : le lecteur reste monté après fermeture et ses commandes sont
       rebâties localement si un ancien nettoyeur les a retirées. */
    var card=box.querySelector('.ha629Card');
    if(card&&!box.querySelector('#ha629Back')){
      var top=card.querySelector('.ha629Top');
      if(top){var closeBtn=document.createElement('button');closeBtn.className='ha629Back';closeBtn.id='ha629Back';closeBtn.type='button';closeBtn.setAttribute('aria-label','Fermer la story');closeBtn.setAttribute('data-happyad-story-control','close');closeBtn.textContent='‹';top.insertBefore(closeBtn,top.firstChild)}
    }
    if(card&&!box.querySelector('#ha629More')){
      var top2=card.querySelector('.ha629Top');
      if(top2){var moreBtn=document.createElement('button');moreBtn.className='ha629More';moreBtn.id='ha629More';moreBtn.type='button';moreBtn.setAttribute('aria-label','Plus');moreBtn.setAttribute('data-happyad-story-control','more');moreBtn.textContent='⋮';top2.appendChild(moreBtn)}
    }
    state.box=box;
    var closeControl=box.querySelector('#ha629Back');
    var moreControl=box.querySelector('#ha629More');
    if(closeControl)closeControl.onclick=function(e){e.preventDefault();e.stopPropagation();close('button')};
    if(moreControl)moreControl.onclick=function(e){e.preventDefault();e.stopPropagation();openMore()};
    bindMediaGestures();
    return box;
  }

  function lock(){document.body.classList.add('haStoryOpenV629','happyad-story-fullscreen-lock');document.documentElement.classList.add('haStoryOpenV629');try{document.body.style.overflow='hidden';document.documentElement.style.overflow='hidden'}catch(_e){}}
  function unlock(){document.body.classList.remove('haStoryOpenV629','happyad-story-fullscreen-lock','story-open','modal-open','no-scroll');document.documentElement.classList.remove('haStoryOpenV629','happyad-story-fullscreen-lock','story-open','modal-open','no-scroll');try{document.body.style.removeProperty('overflow');document.documentElement.style.removeProperty('overflow');document.body.style.removeProperty('pointer-events');document.body.style.removeProperty('touch-action')}catch(_e){}}
  function stopTimer(){if(state.timer){clearTimeout(state.timer);state.timer=0}if(state.raf){cancelAnimationFrame(state.raf);state.raf=0}}
  function stopMedia(){try{if(!state.box)return;state.box.querySelectorAll('video,audio').forEach(function(m){try{m.pause()}catch(_e){}try{m.removeAttribute('src');m.load()}catch(_e){}})}catch(_e){}}
  function activateViewerSurface(box){
    if(!box)return;
    box.classList.add('on');
    box.removeAttribute('aria-hidden');
    try{box.inert=false}catch(_e){}
    box.style.setProperty('display','block','important');
    box.style.setProperty('pointer-events','auto','important');
    box.style.setProperty('visibility','visible','important');
    box.style.setProperty('opacity','1','important');
  }
  function close(reason){
    try{var closingRow=currentRow();if(closingRow&&reason!=='complete'&&reason!=='deleted'&&reason!=='empty'&&reason!=='error')analyticsTrackV728('story_exit',closingRow,{dedupeKey:'v728:story-exit:'+sessionStorage.getItem('HAPPYAD_ANALYTICS_SESSION_V728')+':'+storyId(closingRow)+':'+Math.floor(Date.now()/3000),metadata:{reason:clean(reason)||'close'}})}catch(_ae){}
    state.closed=true;state.openToken++;stopTimer();stopAgeTickerV783();stopMedia();clearTimeout(state.holdTimer);state.holdTimer=0;clearTimeout(state.composerDismissTimer);state.composerDismissTimer=0;state.composerDismissGuard=false;state.composerDismissGuardUntil=0;state.composerDismissPointerId=null;state.composerViewportBase=0;state.shareOverlayOpen=false;state.shareResumePending=false;state.pointers.clear();resetZoom(false);
    if(state.box){
      state.box.classList.remove('on','full','haStoryShareUnderlayV705');
      state.box.setAttribute('aria-hidden','true');
      try{state.box.inert=true}catch(_e){}
      state.box.style.setProperty('display','none','important');
      state.box.style.setProperty('pointer-events','none','important');
      state.box.style.setProperty('visibility','hidden','important');
      state.box.style.setProperty('opacity','0','important');
    }
    state.paused=false;state.hold=false;state.pinch=false;state.moved=false;state.lastTapAt=0;
    unlock();
    /* V705 : la fermeture définitive de la Story restaure explicitement le dock principal.
       Le dock reste masqué tant que la Story ou son popup de partage est encore ouvert. */
    try{var dockApi=window.HappyDockAutoHideV653||window.HappyDockAutoHideV618||window.HappyDockAutoHideV608;if(dockApi&&typeof dockApi.show==='function')dockApi.show('story-final-close-v705')}catch(_e){}
    /* V633 : le lecteur reste monté et caché. Seul le Radar est actualisé;
       la prochaine ouverture réactive exactement le même chemin. */
    requestAnimationFrame(function(){
      installCss();
      restorePublicRoutes();
      renderRadarHomeV629();
    });
    try{document.dispatchEvent(new CustomEvent('happyad:story-master-closed-v629'))}catch(_e){}
  }

  function buildSegments(){var p=$('ha629Progress');if(!p)return;var html='';state.rows.forEach(function(){html+='<span class="ha629Seg"><i></i></span>'});p.innerHTML=html}
  function resetSegments(n){state.activeFill=null;var segs=state.box.querySelectorAll('.ha629Seg');segs.forEach(function(seg,i){var f=seg.querySelector('i');if(i<n)f.style.width='100%';else if(i===n){f.style.width='1%';state.activeFill=f}else f.style.width='0%'})}
  function setProgress(p){if(state.activeFill)state.activeFill.style.width=Math.max(1,Math.min(100,p))+'%'}
  function animate(){
    if(state.closed||state.paused||!state.box.classList.contains('on'))return;
    var v=state.box.querySelector('#ha629Media video'),pct=0;
    if(v&&isFinite(v.duration)&&v.duration>0){state.duration=Math.max(1000,v.duration*1000);state.elapsed=Math.max(0,(v.currentTime||0)*1000);pct=state.elapsed/state.duration*100}
    else{var n=state.elapsed+(Date.now()-state.startedAt);pct=n/state.duration*100;if(n>=state.duration){next();return}}
    setProgress(pct);state.raf=requestAnimationFrame(animate);
  }
  function runTimer(){stopTimer();state.startedAt=Date.now();var v=state.box.querySelector('#ha629Media video');if(!v)state.timer=setTimeout(function(){state.elapsed+=Date.now()-state.startedAt;if(state.elapsed>=state.duration)next();else runTimer()},90);animate()}
  function pause(){if(state.paused||state.closed)return;state.paused=true;var v=state.box.querySelector('#ha629Media video');if(v&&isFinite(v.duration)&&v.duration>0){state.duration=Math.max(1000,v.duration*1000);state.elapsed=(v.currentTime||0)*1000;try{v.pause()}catch(_e){}}else state.elapsed+=Date.now()-state.startedAt;stopTimer();setProgress(state.elapsed/state.duration*100)}
  function resume(){if(!state.paused||state.closed||state.zoom.scale>1.01)return;state.paused=false;var v=state.box.querySelector('#ha629Media video');if(v)try{v.play().catch(function(){})}catch(_e){}runTimer()}
  function startDuration(row){stopTimer();state.paused=false;state.elapsed=0;state.duration=10000;var v=state.box.querySelector('#ha629Media video');if(typeOf(row)==='video'&&v){var start=function(){if(!(isFinite(v.duration)&&v.duration>0))return;state.duration=Math.max(1000,v.duration*1000);state.elapsed=(v.currentTime||0)*1000;runTimer()};v.onloadedmetadata=start;v.oncanplay=start;v.ondurationchange=start;v.ontimeupdate=function(){if(!state.paused&&isFinite(v.duration)&&v.duration>0){state.duration=v.duration*1000;state.elapsed=(v.currentTime||0)*1000;setProgress(state.elapsed/state.duration*100)}};v.onended=next;try{v.play().catch(function(){})}catch(_e){}if(v.readyState>=1)start()}else runTimer()}
  function next(){if(state.closed)return;if(state.index>=state.rows.length-1){close('complete');return}paint(state.index+1)}
  function prev(){if(state.closed)return;if(state.index<=0){paint(0);return}paint(state.index-1)}

  function applyZoom(){var m=state.box&&state.box.querySelector('#ha629Media img,#ha629Media video');if(!m)return;var z=state.zoom;m.style.transform='translate3d('+z.x+'px,'+z.y+'px,0) scale('+z.scale+')'}
  function clampZoom(){var media=$('ha629Media');if(!media)return;var r=media.getBoundingClientRect(),s=state.zoom.scale;var mx=Math.max(0,r.width*(s-1)/2),my=Math.max(0,r.height*(s-1)/2);state.zoom.x=Math.max(-mx,Math.min(mx,state.zoom.x));state.zoom.y=Math.max(-my,Math.min(my,state.zoom.y))}
  function resetZoom(shouldResume){state.zoom={scale:1,x:0,y:0};applyZoom();if(shouldResume)resume()}
  function setZoom(scale,x,y){state.zoom.scale=Math.max(1,Math.min(4,scale));if(Number.isFinite(x))state.zoom.x=x;if(Number.isFinite(y))state.zoom.y=y;clampZoom();applyZoom();if(state.zoom.scale>1.01)pause();else resetZoom(true)}
  function storyViewportHeight(){try{return Math.round((window.visualViewport&&window.visualViewport.height)||window.innerHeight||document.documentElement.clientHeight||0)}catch(_e){return 0}}
  function rememberComposerViewport(){var h=storyViewportHeight(),inner=Math.round(window.innerHeight||0);state.composerViewportBase=Math.max(state.composerViewportBase||0,h,inner)}
  function clearComposerDismissGuard(shouldResume){clearTimeout(state.composerDismissTimer);state.composerDismissTimer=0;state.composerDismissGuard=false;state.composerDismissGuardUntil=0;state.composerDismissPointerId=null;if(shouldResume&&!state.closed)resume()}
  function watchComposerDismiss(){
    clearTimeout(state.composerDismissTimer);
    if(!state.composerDismissGuard||state.closed)return;
    var h=storyViewportHeight(),base=state.composerViewportBase||Math.round(window.innerHeight||0),keyboardClosed=!!(base&&h>=base-72);
    if(keyboardClosed||Date.now()>=state.composerDismissGuardUntil){clearComposerDismissGuard(true);return}
    state.composerDismissTimer=setTimeout(watchComposerDismiss,90);
  }
  function armComposerDismissGuard(input){
    rememberComposerViewport();pause();state.lastTapAt=0;state.composerDismissGuard=true;state.composerDismissGuardUntil=Date.now()+2300;state.composerDismissPointerId=null;
    try{if(input){input.setAttribute('readonly','readonly');input.blur();setTimeout(function(){try{input.removeAttribute('readonly')}catch(_e){}},180)}}catch(_e){}
    try{var a=document.activeElement;if(a&&a!==document.body&&typeof a.blur==='function')a.blur()}catch(_e){}
    state.composerDismissTimer=setTimeout(watchComposerDismiss,90);
  }
  function consumeComposerDismissPointer(e){
    if(!state.composerDismissGuard)return false;
    state.composerDismissPointerId=e.pointerId;state.lastTapAt=0;
    try{var a=document.activeElement;if(a&&typeof a.blur==='function')a.blur()}catch(_e){}
    try{e.preventDefault();e.stopPropagation()}catch(_e){}
    return true;
  }
  function finishComposerDismissPointer(e){
    if(state.composerDismissPointerId!==e.pointerId)return false;
    try{e.preventDefault();e.stopPropagation()}catch(_e){}
    state.composerDismissPointerId=null;clearTimeout(state.composerDismissTimer);state.composerDismissTimer=setTimeout(function(){clearComposerDismissGuard(true)},140);return true;
  }
  function distance(a,b){var x=a.x-b.x,y=a.y-b.y;return Math.sqrt(x*x+y*y)}

  function bindMediaGestures(){
    var media=$('ha629Media');if(!media||media.__haStoryGestureV629)return;media.__haStoryGestureV629=true;
    function pt(e){return {x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,baseX:state.zoom.x,baseY:state.zoom.y}}
    media.addEventListener('pointerdown',function(e){
      if(state.closed||state.shareOverlayOpen)return;if(consumeComposerDismissPointer(e))return;try{media.setPointerCapture(e.pointerId)}catch(_e){}state.pointers.set(e.pointerId,pt(e));
      if(state.pointers.size===2){clearTimeout(state.holdTimer);state.holdTimer=0;state.pinch=true;var a=Array.from(state.pointers.values());state.pinchDistance=distance(a[0],a[1]);state.pinchScale=state.zoom.scale;pause();e.preventDefault();return}
      state.startX=e.clientX;state.startY=e.clientY;state.moved=false;state.hold=false;
      if(state.zoom.scale<=1.01){state.holdTimer=setTimeout(function(){state.hold=true;pause()},190)}else pause();
    },{passive:false});
    media.addEventListener('pointermove',function(e){
      var p=state.pointers.get(e.pointerId);if(!p)return;p.x=e.clientX;p.y=e.clientY;
      if(state.pointers.size>=2){var a=Array.from(state.pointers.values());var d=distance(a[0],a[1]);if(state.pinchDistance>0)setZoom(state.pinchScale*(d/state.pinchDistance),state.zoom.x,state.zoom.y);state.moved=true;e.preventDefault();return}
      if(Math.abs(e.clientX-state.startX)>8||Math.abs(e.clientY-state.startY)>8)state.moved=true;
      if(state.zoom.scale>1.01){state.zoom.x=p.baseX+(e.clientX-p.startX);state.zoom.y=p.baseY+(e.clientY-p.startY);clampZoom();applyZoom();e.preventDefault()}
    },{passive:false});
    function up(e){
      if(state.shareOverlayOpen)return;if(finishComposerDismissPointer(e))return;
      var p=state.pointers.get(e.pointerId);state.pointers.delete(e.pointerId);clearTimeout(state.holdTimer);state.holdTimer=0;
      if(state.pinch){if(state.pointers.size<2){state.pinch=false;if(state.zoom.scale<=1.06)resetZoom(true)}return}
      if(state.hold){state.hold=false;resume();return}
      if(state.moved||state.zoom.scale>1.01)return;
      var now=Date.now();if(now-state.lastTapAt<280){state.lastTapAt=0;setZoom(2,0,0);return}state.lastTapAt=now;
      setTimeout(function(){if(state.lastTapAt!==now||state.closed||state.shareOverlayOpen)return;state.lastTapAt=0;var r=media.getBoundingClientRect();if(e.clientX>r.left+r.width*.56)next();else if(e.clientX<r.left+r.width*.44)prev()},285);
    }
    media.addEventListener('pointerup',up,{passive:false});media.addEventListener('pointercancel',up,{passive:false});
    media.addEventListener('dblclick',function(e){e.preventDefault();if(state.zoom.scale>1.01)resetZoom(true);else setZoom(2,0,0)},false);
    media.addEventListener('contextmenu',function(e){e.preventDefault()},true);
  }

  function currentRow(){return state.rows[state.index]||null}
  function setStoryLikeButton(btn,on){
    if(!btn)return;btn.classList.toggle('on',!!on);btn.setAttribute('aria-pressed',on?'true':'false');btn.innerHTML=on?'<svg viewBox="0 0 24 24" aria-hidden="true" style="fill:currentColor!important"><path d="M20.8 4.6c-1.9-1.7-4.9-1.5-6.6.5L12 7.6 9.8 5.1C8.1 3.1 5.1 2.9 3.2 4.6 1.1 6.5 1 9.7 3 11.7l9 8.6 9-8.6c2-2 1.9-5.2-.2-7.1z"/></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6c-1.9-1.7-4.9-1.5-6.6.5L12 7.6 9.8 5.1C8.1 3.1 5.1 2.9 3.2 4.6 1.1 6.5 1 9.7 3 11.7l9 8.6 9-8.6c2-2 1.9-5.2-.2-7.1z"/></svg>';
  }
  function renderBottom(row){
    var bottom=$('ha629Bottom'),mine=ownerOf(row)===currentUid();if(!bottom)return;bottom.innerHTML='';try{if(state.box)state.box.style.setProperty('--ha-story-composer-h','62px')}catch(_e){}
    if(mine){
      bottom.innerHTML='<div class="ha629OwnerActions"><button class="ha629OwnerAct" id="ha629Activity" type="button"><span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V10M10 19V5M16 19v-7M22 19V8"/><path d="M2 19h22"/></svg></span><span>Vues</span></button><button class="ha629OwnerAct" id="ha629Share" type="button"><span><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.7 10.7 6.6-4.1M8.7 13.3l6.6 4.1"/></svg></span><span>Partager</span></button></div>';
      $('ha629Activity').onclick=function(e){e.stopPropagation();openActivity(row)};
      $('ha629Share').onclick=function(e){e.stopPropagation();shareStory(row)};
    }else{
      bottom.innerHTML='<div class="ha629VisitorActions"><form class="ha629ReplyForm" id="ha629ReplyForm"><textarea class="ha629ReplyInput" id="ha629ReplyInput" rows="1" maxlength="1500" autocomplete="off" inputmode="text" enterkeyhint="enter" placeholder="Répondre à la story…"></textarea><button class="ha629Send" id="ha629Send" type="submit" aria-label="Envoyer la réponse"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12 20 4l-5.4 16-3.2-6.2L4 12Z"/><path d="m11.4 13.8 3.7-3.7"/></svg></button></form><button class="ha629IconAct" id="ha629Like" type="button" aria-label="J’aime" aria-pressed="false"></button><button class="ha629IconAct" id="ha629Share" data-happyad-story-share-v699="1" type="button" aria-label="Partager"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.7 10.7 6.6-4.1M8.7 13.3l6.6 4.1"/></svg></button></div>';
      var replyInput=$('ha629ReplyInput'),sendBtn=$('ha629Send'),replyForm=$('ha629ReplyForm'),visitorActions=replyInput&&replyInput.closest('.ha629VisitorActions');rememberComposerViewport();
      function composerActive(){return !!(replyInput&&(document.activeElement===replyInput||clean(replyInput.value)))}
      function sizeReplyInput(){
        if(!replyInput)return;
        var expanded=composerActive(),min=48,max=116;
        if(visitorActions)visitorActions.classList.toggle('is-composing',expanded);
        replyInput.style.height=(expanded?max:min)+'px';
        replyInput.style.minHeight=(expanded?max:min)+'px';
        replyInput.style.maxHeight=(expanded?max:min)+'px';
        var scrollable=expanded&&(replyInput.scrollHeight||0)>max+1;
        replyInput.style.overflowY=expanded?'auto':'hidden';
        if(replyForm)replyForm.classList.toggle('is-scrollable',scrollable);
        requestAnimationFrame(function(){
          try{var h=visitorActions?Math.ceil(visitorActions.getBoundingClientRect().height):62;if(state.box)state.box.style.setProperty('--ha-story-composer-h',Math.max(62,h)+'px')}catch(_e){}
        });
      }
      function syncReplySend(){if(!sendBtn)return;var ready=!!clean(replyInput&&replyInput.value);sendBtn.classList.toggle('ready',ready);sendBtn.setAttribute('aria-disabled',ready?'false':'true');sizeReplyInput()}
      if(visitorActions){['pointerdown','click','touchstart'].forEach(function(type){visitorActions.addEventListener(type,function(e){e.stopPropagation()},{passive:type==='touchstart'})})}
      if(replyInput){replyInput.onfocus=function(){rememberComposerViewport();pause();sizeReplyInput();setTimeout(sizeReplyInput,80)};replyInput.onblur=function(){setTimeout(function(){sizeReplyInput();if(!composerActive()&&!state.composerDismissGuard)resume()},90)};replyInput.addEventListener('input',syncReplySend,{passive:true});replyInput.addEventListener('change',sizeReplyInput,{passive:true});syncReplySend();setTimeout(sizeReplyInput,0)}
      var likeBtn=$('ha629Like'),likeId=storyId(row),localOn=localStoryLike(likeId);setStoryLikeButton(likeBtn,localOn);var likeTouched=false;
      loadLike(row).then(function(remoteOn){if(!state.closed&&storyId(currentRow())===likeId&&!likeTouched)setStoryLikeButton(likeBtn,remoteOn)});
      $('ha629ReplyForm').onsubmit=function(e){e.preventDefault();e.stopPropagation();var form=e.currentTarget,input=$('ha629ReplyInput'),button=$('ha629Send'),txt=clean(input&&input.value);if(!txt||form.dataset.sending==='1')return;form.dataset.sending='1';if(button)button.classList.add('sending');input.value='';syncReplySend();try{input.scrollTop=0}catch(_e){}sendStoryReply(row,txt).then(function(){armComposerDismissGuard(input);syncReplySend()}).catch(function(err){if(input&&!input.value)input.value=txt;syncReplySend();try{input.focus({preventScroll:true});input.scrollTop=input.scrollHeight}catch(_e){}toast(err&&err.message||'Réponse impossible')}).finally(function(){setTimeout(function(){try{delete form.dataset.sending}catch(_e){}if(button)button.classList.remove('sending');syncReplySend()},260)})};
      likeBtn.onclick=function(e){e.stopPropagation();if(likeBtn.dataset.saving==='1')return;likeTouched=true;var on=!likeBtn.classList.contains('on');setStoryLikeButton(likeBtn,on);setLocalStoryLike(likeId,on);likeBtn.dataset.saving='1';saveLike(row,on).then(function(ok){if(!ok){setStoryLikeButton(likeBtn,!on);toast('J’aime non synchronisé')}}).finally(function(){delete likeBtn.dataset.saving})};
      $('ha629Share').onclick=function(e){e.stopPropagation();shareStory(row)};
    }
  }
  function storySharePayload(row){var p=state.profile||{};return {id:storyId(row),story_id:storyId(row),content_type:STORY_SHARE_TYPE,source_type:STORY_SHARE_TYPE,mode:'story',media_type:typeOf(row),kind:typeOf(row),media_url:mediaOf(row),preview_url:mediaOf(row),thumbnail_url:clean(row.thumbnail_url||row.poster_url),title:'Story de '+(clean(p.full_name||p.display_name||p.name||row.user_name)||'HAPPYAD'),description:descOf(row),author_name:clean(p.full_name||p.display_name||p.name||row.user_name)||'HAPPYAD',owner_id:ownerOf(row),user_id:ownerOf(row),created_at:row.created_at||new Date(createdOf(row)).toISOString(),expires_at:row.expires_at||row.expiresAt||''}}
  function restoreStoryAfterShare(reason){
    if(!state.shareOverlayOpen&&!state.shareResumePending)return false;
    state.shareOverlayOpen=false;state.shareResumePending=false;state.lastTapAt=0;state.pointers.clear();
    try{if(state.box)state.box.classList.remove('haStoryShareUnderlayV705')}catch(_e){}
    if(!state.closed&&state.box&&state.box.classList.contains('on'))resume();
    return true;
  }
  function shareStory(row){
    if(state.closed||state.shareOverlayOpen)return false;
    var payload=storySharePayload(row);payload.share_origin='story_viewer_v705';payload.keep_story_open=true;
    state.shareOverlayOpen=true;state.shareResumePending=true;state.lastTapAt=0;state.pointers.clear();pause();
    try{if(state.box)state.box.classList.add('haStoryShareUnderlayV705')}catch(_e){}
    try{
      var api=window.HappyadShareMaster;
      if(!api||typeof api.open!=='function')throw new Error('share-master-unavailable');
      Promise.resolve(api.open(payload,window)).then(function(ok){if(ok===false){restoreStoryAfterShare('open-refused');toast('Partage indisponible')}}).catch(function(){restoreStoryAfterShare('open-error');toast('Partage indisponible')});
      return true;
    }catch(_e){restoreStoryAfterShare('open-exception');toast('Partage indisponible');return false}
  }
  function refreshCurrentCacheRow(row){
    try{var arr=cacheStories(),id=storyId(row);arr.forEach(function(p){if(storyId(p)===id){p.description=descOf(row);p.desc=descOf(row);p.is_active=row.is_active!==false}});arr=arr.filter(active);window.HAPPYAD_STORIES_ITEMS=arr;localStorage.setItem('HAPPYAD_STORIES_CACHE_V1',JSON.stringify(arr))}catch(_e){}
  }
  async function reportStory(row){
    var c=sb(),reporter=await authUid(),id=storyId(row),owner=ownerOf(row);if(!id||!reporter||reporter===owner)return false;
    var record={post_id:id,reporter_id:reporter,owner_id:owner||null,reason:'story_signalee',details:'Signalement depuis le lecteur Story HAPPYAD',source:'story',status:'pending',created_at:new Date().toISOString()};
    try{if(c){var r=await c.from('happyad_post_reports').insert(record);if(r&&r.error&&String(r.error.code||'')!=='23505')throw r.error}return true}catch(_e){try{var q=readJson('HAPPYAD_STORY_REPORT_OUTBOX_V634',[]);q.push(record);localStorage.setItem('HAPPYAD_STORY_REPORT_OUTBOX_V634',JSON.stringify(q.slice(-80)))}catch(_x){}return false}
  }
  function muteStoryOwner(row){var owner=ownerOf(row);if(!owner||owner===currentUid())return false;try{var h=mutedOwners();h[owner]=Date.now();localStorage.setItem(mutedKey(),JSON.stringify(h));var arr=cacheStories().filter(function(p){return ownerOf(p)!==owner});window.HAPPYAD_STORIES_ITEMS=arr;localStorage.setItem('HAPPYAD_STORIES_CACHE_V1',JSON.stringify(arr));return true}catch(_e){return false}}
  function openMore(){
    var row=currentRow();if(!row)return;var old=$('haStoryMoreModalV629');if(old)old.remove();var mine=ownerOf(row)===currentUid();var m=document.createElement('div');m.id='haStoryMoreModalV629';
    m.innerHTML='<div class="haSmmCard">'+(mine?'<button class="haSmmBtn danger" data-act="delete" type="button">Supprimer la story</button>':'<button class="haSmmBtn" data-act="mute" type="button">Désactiver les stories de ce compte</button><button class="haSmmBtn danger" data-act="report" type="button">Signaler cette story</button>')+'<button class="haSmmBtn haSmmCancel" data-act="cancel" type="button">Annuler</button></div>';
    document.body.appendChild(m);m.onclick=async function(e){if(e.target===m){m.remove();return}var b=e.target&&e.target.closest&&e.target.closest('[data-act]');if(!b)return;var act=b.getAttribute('data-act');if(act==='cancel'){m.remove();return}if(act==='delete'){if(!confirm('Supprimer cette story ?'))return;var c2=sb();try{if(c2&&isUuid(storyId(row))){var d=await c2.from('happyad_stories').update({is_active:false}).eq('id',storyId(row)).eq('user_id',currentUid());if(d&&d.error)throw d.error}row.is_active=false;refreshCurrentCacheRow(row);m.remove();state.rows=state.rows.filter(active);if(state.rows.length)paint(Math.min(state.index,state.rows.length-1));else close('deleted');renderRadarHomeV629();toast('Story supprimée')}catch(_e){toast('Suppression impossible')}return}if(act==='mute'){muteStoryOwner(row);m.remove();close('muted-owner');renderRadarHomeV629();toast('Stories de ce compte désactivées');return}if(act==='report'){b.disabled=true;var ok=await reportStory(row);m.remove();toast(ok?'Story signalée':'Signalement conservé et envoyé dès que possible')}};
  }

  async function openActivity(row){
    var old=$('haStoryActivityModalV629');if(old)old.remove();var m=document.createElement('div');m.id='haStoryActivityModalV629';m.innerHTML='<div class="haSamCard"><div class="haSamHead"><span>Vues</span><button class="haSamClose" type="button">×</button></div><div id="haSamList"><div class="haSamEmpty">Chargement…</div></div></div>';document.body.appendChild(m);m.querySelector('.haSamClose').onclick=function(){m.remove()};m.onclick=function(e){if(e.target===m)m.remove()};
    var list=m.querySelector('#haSamList'),c=sb(),id=storyId(row);if(!c||!id){list.innerHTML='<div class="haSamEmpty">Vues indisponibles.</div>';return}
    try{
      var viewQ=c.from('happyad_story_views').select('*').eq('story_id',id).order('viewed_at',{ascending:false}).limit(300);
      var likeQ=c.from('happyad_story_likes').select('story_id,user_id,liked,created_at,updated_at').eq('story_id',id).eq('liked',true).limit(300);
      var replyPattern=STORY_REPLY_MARKER+'{\"story_id\":\"'+id+'\"%';
      var replyQ=c.from('happyad_msg_messages').select('sender_id,created_at,body').like('body',replyPattern).limit(300);
      var settled=await Promise.allSettled([viewQ,likeQ,replyQ]);
      var views=settled[0].status==='fulfilled'&&!settled[0].value.error?(settled[0].value.data||[]):[];
      var likes=settled[1].status==='fulfilled'&&!settled[1].value.error?(settled[1].value.data||[]):[];
      if(!likes.length){try{var alt=await c.from('happyad_content_actions').select('*').eq('post_id',id).eq('content_type','story').eq('action_type','like').eq('liked',true).limit(300);if(!alt.error)likes=alt.data||[]}catch(_e){}}
      var replies=settled[2].status==='fulfilled'&&!settled[2].value.error?(settled[2].value.data||[]):[];
      var actions={},touch=function(uid,kind,at){uid=clean(uid);if(!uid||uid===currentUid())return;if(!actions[uid])actions[uid]={uid:uid,view:false,like:false,reply:false,last:0};actions[uid][kind]=true;var t=Date.parse(at||'')||0;if(t>actions[uid].last)actions[uid].last=t};
      views.forEach(function(v){touch(v.viewer_id||v.user_id||v.uid,'view',v.viewed_at||v.created_at)});
      likes.forEach(function(v){touch(v.user_id||v.actor_id||v.viewer_id,'like',v.updated_at||v.created_at)});
      replies.forEach(function(v){touch(v.sender_id||v.user_id,'reply',v.created_at)});
      var ids=Object.keys(actions);if(!ids.length){list.innerHTML='<div class="haSamEmpty">Aucune vue pour le moment.</div>';return}
      var pr=await c.from('profiles').select('*').in('id',ids),profiles=pr.data||[],map={};profiles.forEach(function(p){map[clean(p.id||p.user_id||p.uid)]=p});ids.sort(function(a,b){return actions[b].last-actions[a].last});
      list.innerHTML=ids.map(function(uid){var p=map[uid]||{},a=actions[uid],name=clean(p.full_name||p.display_name||p.name||p.username)||'Utilisateur HAPPYAD',av=clean(p.avatar_url||p.avatar),tags='<span class="haSamAction">Vue</span>'+(a.like?'<span class="haSamAction like">♥ Aimé</span>':'')+(a.reply?'<span class="haSamAction reply">↩ Répondu</span>':'');return '<div class="haSamRow"><div class="haSamAv">'+(av?'<img src="'+esc(av)+'" alt="">':esc(initials(name)))+'</div><div class="haSamCopy"><div class="haSamNameLine"><b>'+esc(name)+'</b>'+badgeHtml(p.badge||p.user_badge)+'</div><div class="haSamActions">'+tags+'</div></div></div>'}).join('');
    }catch(_e){list.innerHTML='<div class="haSamEmpty">Impossible de charger les vues.</div>'}
  }

  function paint(n){
    if(state.closed||!state.rows.length)return;stopTimer();resetZoom(false);state.index=Math.max(0,Math.min(state.rows.length-1,n));var row=currentRow(),p=state.profile||{},name=clean(p.full_name||p.display_name||p.name||row.user_name)||'Utilisateur HAPPYAD',av=clean(p.avatar_url||p.avatar||row.user_avatar),badge=clean(p.badge||p.user_badge||row.badge),media=mediaOf(row),typ=typeOf(row);
    $('ha629Avatar').innerHTML=av?'<img src="'+esc(av)+'" alt="">':esc(initials(name));$('ha629Name').innerHTML=esc(name)+badgeHtml(badge);$('ha629Sub').textContent=ageOf(row);$('ha629Caption').textContent=descOf(row);
    var backdrop=$('ha629Backdrop');if(typ==='photo')backdrop.style.backgroundImage='url("'+media.replace(/["\\]/g,'\\$&')+'")';else backdrop.style.backgroundImage='none';
    $('ha629Media').innerHTML=typ==='video'?'<video src="'+esc(media)+'" autoplay playsinline webkit-playsinline preload="auto" controlslist="nodownload noplaybackrate" disablepictureinpicture></video>':'<img src="'+esc(media)+'" alt="Story" draggable="false">';
    resetSegments(state.index);renderBottom(row);window.__HAPPYAD_CURRENT_STORY_CTX={id:storyId(row),row:row,p:itemFromRow(row,p),profile:p,isMine:ownerOf(row)===currentUid()};
    startAgeTickerV783();markSeen(row).then(function(){setTimeout(renderRadarHomeV629,50)});try{document.dispatchEvent(new CustomEvent('happyad:story-master-opened-v629'))}catch(_e){}startDuration(row)
  }

  function show(owner,rows,profile,startId){
    var box=ensureViewer();state.owner=owner;state.rows=(rows||[]).filter(active).sort(function(a,b){return createdOf(a)-createdOf(b)});state.profile=profile||{};state.closed=false;state.paused=false;state.openToken++;var ix=0;if(startId){var f=state.rows.findIndex(function(r){return storyId(r)===clean(startId)});if(f>=0)ix=f}else{var cache=cacheStories(),unseen=state.rows.findIndex(function(r){var id=storyId(r),p=cache.find(function(x){return storyId(x)===id});return p&&!p.isSeen&&!p.seen&&!p.viewed});if(unseen>=0)ix=unseen}
    buildSegments();activateViewerSurface(box);lock();paint(ix);return false
  }

  function openOwner(owner,startId,seed){
    owner=clean(owner)||ownerOf(seed);if(!owner){toast('Story indisponible');return false}
    if(isMutedOwner(owner)){toast('Les stories de ce compte sont désactivées');return false}
    var seedProfile=profileFromItem(seed),cached=cachedRowsForOwner(owner,seed);
    if(cached.length)show(owner,cached,seedProfile,startId||storyId(seed));
    else{var box=ensureViewer();state.owner=owner;state.rows=[];state.profile=seedProfile;state.closed=false;state.openToken++;activateViewerSurface(box);lock();$('ha629Progress').innerHTML='';$('ha629Avatar').innerHTML=seedProfile.avatar_url?'<img src="'+esc(seedProfile.avatar_url)+'" alt="">':esc(initials(seedProfile.full_name));$('ha629Name').innerHTML=esc(seedProfile.full_name||'Story')+badgeHtml(seedProfile.badge);$('ha629Sub').textContent='HAPPYAD';$('ha629Media').innerHTML='<div class="ha629Loading">Ouverture de la story…</div>';$('ha629Caption').textContent='';$('ha629Bottom').innerHTML=''}
    var token=state.openToken;
    Promise.all([fetchRows(owner),fetchProfile(owner,seedProfile)]).then(function(res){if(state.closed||token!==state.openToken||state.owner!==owner)return;var rows=res[0],profile=res[1]||seedProfile;if(!rows.length){if(cached.length)return;toast('Aucune story active');close('empty');return}mergeStoryCache(owner,rows,profile);var keep=storyId(currentRow())||startId;show(owner,rows,profile,keep);setTimeout(renderRadarHomeV629,30)}).catch(function(){if(!cached.length){toast('Story indisponible');close('error')}});
    return false
  }
  function openItem(p){if(!p||!isStory(p))return false;return openOwner(ownerOf(p),storyId(p),p)}

  function renderRadarHomeV629(){
    var chips=document.querySelector('.chips');if(!chips)return false;try{if(typeof window.currentFilter!=='undefined'&&window.currentFilter!=='all')return false}catch(_e){}
    var old=$('homeRadarStoryMasterV629');if(old)old.remove();var all=cacheStories().filter(active),groups={},me=currentUid();
    all.forEach(function(p){var o=isMineItem(p)&&me?me:ownerOf(p);if(!o)return;if(!groups[o])groups[o]=[];groups[o].push(p)});Object.keys(groups).forEach(function(o){groups[o].sort(function(a,b){return createdOf(a)-createdOf(b)})});
    var owners=Object.keys(groups).sort(function(a,b){if(a===me&&b!==me)return -1;if(b===me&&a!==me)return 1;var aa=groups[a][groups[a].length-1],bb=groups[b][groups[b].length-1];return createdOf(bb)-createdOf(aa)}).slice(0,14);
    var block=document.createElement('section');block.id='homeRadarStoryMasterV629';block.className='radarBlock';block.setAttribute('data-happyad-story-master','v629');block.innerHTML='<div class="radarHead"><div class="radarTitle">◎ RADAR <b>pour toi</b></div><a class="mapLite" href="modules/map.html">⌖ Voir sur la carte</a></div><div class="radarRow"></div>';var row=block.querySelector('.radarRow');
    function avatarHtml(p,name){var av=clean(p&&(p.avatar||p.user_avatar||p.avatar_url));return av?'<img src="'+esc(av)+'" alt="">':'<span class="radarInitial">'+esc(initials(name))+'</span>'}
    function addOnly(){var w=document.createElement('div');w.className='haStoryRadarUnitV629 haStoryAddOnlyV629';w.innerHTML='<a class="radarItem" href="modules/publish.html?mode=story"><div class="radarAvatar add"><span>+</span></div><div class="radarName">Ta story</div><div class="radarMeta">Ajouter</div></a>';row.appendChild(w)}
    var mine=me&&groups[me];if(!mine||!mine.length)addOnly();
    owners.forEach(function(owner){var items=groups[owner],first=items[items.length-1],name=owner===me?'Ta story':clean(first.creatorName||first.user_name||first.display_name||first.title)||'Utilisateur HAPPYAD',badge=clean(first.badge||first.userBadge||first.user_badge),seen=items.every(function(p){return !!(p.isSeen||p.seen||p.viewed)}),start=items.find(function(p){return !(p.isSeen||p.seen||p.viewed)})||items[0];var w=document.createElement('div');w.className='haStoryRadarUnitV629';var btn=document.createElement('button');btn.type='button';btn.className='radarItem';btn.dataset.storyOwner=owner;btn.dataset.storyId=storyId(start);btn.innerHTML='<div class="radarAvatar '+(seen?'seen ':'')+'">'+avatarHtml(first,name)+'<i class="typeDot story"></i>'+(items.length>1?'<span class="radarStoryCount">'+items.length+'</span>':'')+'</div><div class="radarName">'+esc(name)+(owner===me?'':badgeHtml(badge))+'</div><div class="radarMeta" data-story-age-v783="1" data-story-created-at="'+esc(String(createdOf(first)||''))+'">'+esc(ageOf(first))+'</div>';w.appendChild(btn);if(owner===me){var plus=document.createElement('a');plus.className='haStoryAddMiniV629';plus.href='modules/publish.html?mode=story';plus.setAttribute('aria-label','Ajouter une story');plus.textContent='+';plus.onclick=function(e){e.stopPropagation()};w.appendChild(plus)}row.appendChild(w)});
    /* V631 : délégation locale robuste. Chaque nouveau rendu garde un clic actif,
       y compris après que la story a été marquée comme vue. */
    block.addEventListener('click',function(e){
      var btn=e.target&&e.target.closest&&e.target.closest('button.radarItem[data-story-owner]');
      if(!btn||!block.contains(btn))return;
      e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
      var owner=clean(btn.dataset.storyOwner),sid=clean(btn.dataset.storyId);
      var seed=cacheStories().find(function(p){return ownerOf(p)===owner&&(!sid||storyId(p)===sid)})||cacheStories().find(function(p){return ownerOf(p)===owner})||null;
      openOwner(owner,sid,seed);
    },true);
    chips.insertAdjacentElement('afterend',block);return true
  }

  function seedForRadar(owner,sid){
    var arr=cacheStories();
    return arr.find(function(p){return (ownerOf(p)===owner||(owner===currentUid()&&isMineItem(p)))&&(!sid||storyId(p)===sid)})
      ||arr.find(function(p){return ownerOf(p)===owner||(owner===currentUid()&&isMineItem(p))})||null;
  }
  function openFromRadarEvent(e){
    var btn=e&&e.target&&e.target.closest&&e.target.closest('#homeRadarStoryMasterV629 button.radarItem[data-story-owner]');
    if(!btn)return;
    var owner=clean(btn.dataset.storyOwner),sid=clean(btn.dataset.storyId);
    if(!owner)return;
    if(e){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation()}
    restorePublicRoutes();
    openOwner(owner,sid,seedForRadar(owner,sid));
  }
  /* V633 : point d'entrée unique et permanent du Radar vers le lecteur persistant. */
  document.addEventListener('click',openFromRadarEvent,true);

  var oldRadar=window.openRadarPost;
  function routeRadar(p){if(p&&isStory(p))return openItem(p);return typeof oldRadar==='function'?oldRadar.apply(this,arguments):false}
  function routeProfile(ownerId){return openOwner(clean(ownerId)||currentUid(),'')}
  function restorePublicRoutes(){
    window.openRadarPost=routeRadar;
    window.openHappyadStoryViewer=openItem;
    window.openCentralStory=openItem;
    window.openProfileStoryPremium=routeProfile;
    window.openStoryViewer=routeProfile;
    window.renderRadarHome=renderRadarHomeV629;
  }
  restorePublicRoutes();
  window.HappyStoryV629={version:VERSION,openItem:openItem,openOwner:openOwner,openExactNotification:openExactNotificationV735,close:close,pause:pause,resume:resume,restoreAfterShare:restoreStoryAfterShare,isShareOpen:function(){return !!state.shareOverlayOpen},renderRadar:renderRadarHomeV629,routeRadar:routeRadar,openProfile:routeProfile,sendReply:sendStoryReply};
  window.HappyStoryV699=window.HappyStoryV629;
  window.HappyStoryV698=window.HappyStoryV629;
  window.HappyStoryV697=window.HappyStoryV629;
  window.HappyStoryV696=window.HappyStoryV629;
  window.HappyStoryV634=window.HappyStoryV629;
  window.HappyStoryV633=window.HappyStoryV629;
  window.HappyStoryV632=window.HappyStoryV629;
  window.HappyStoryV628=window.HappyStoryV629;
  window.happyadHardCloseStoryViewer=close;

  document.addEventListener('happyad:share-closed-v705',function(e){
    var d=e&&e.detail||{};if(d.fromStory)restoreStoryAfterShare(d.reason||'share-close');
  },true);
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!state.closed&&!state.shareOverlayOpen)close('escape')},true);
  window.addEventListener('message',function(ev){var d=ev&&ev.data;if(!d)return;if(d.type==='HAPPYAD_OPEN_EXACT_STORY_NOTIFICATION_V735'){openExactNotificationV735(d.detail||{});return;}if(d.type==='HAPPYAD_OPEN_SHARED_STORY'){var x=d.detail||{};var seed={id:clean(x.story_id||x.id),story_id:clean(x.story_id||x.id),sourceId:clean(x.story_id||x.id),mode:'story',type:'story',category:'story',creatorId:clean(x.owner_id||x.user_id),user_id:clean(x.owner_id||x.user_id),creatorName:clean(x.author_name||x.creator_name)||'Utilisateur HAPPYAD',mediaUrl:clean(x.media_url||x.preview_url),media_url:clean(x.media_url||x.preview_url),mediaType:clean(x.media_type)||'photo',description:clean(x.description),created_at:x.created_at||'',expires_at:x.expires_at||'',isRadar:true,isLive:false,__storyTable:'happyad_stories'};openOwner(ownerOf(seed),storyId(seed),seed);return;}if(d.type==='HAPPYAD_OPEN_STORY_V629'||d.type==='HAPPYAD_OPEN_STORY_V628'){var x=d.detail||{};openOwner(clean(x.owner_id||x.user_id),clean(x.story_id),x.item||null)}if(d.type==='HAPPYAD_CLOSE_STORY_V629'||d.type==='HAPPYAD_CLOSE_STORY_V628')close('message')},true);
  window.addEventListener('pageshow',function(){if(state.closed)unlock();installCss();restorePublicRoutes();setTimeout(renderRadarHomeV629,90)},true);
  /* V631 : le CSS du cercle est présent avant le premier rendu, pas seulement après
     la première ouverture du fullscreen. */
  installCss();restorePublicRoutes();
  setInterval(refreshRadarAgesV783,1000);
  document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')refreshRadarAgesV783()},true);
  setTimeout(renderRadarHomeV629,80);setTimeout(renderRadarHomeV629,500);
})();
