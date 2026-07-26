(function(){
  'use strict';
  if(window.__HAPPYAD_PROFILE_AVATAR_RECOVERY_MASTER_V743__)return;
  window.__HAPPYAD_PROFILE_AVATAR_RECOVERY_MASTER_V743__=true;

  var BUILD='PROFILE_AVATAR_RECOVERY_MASTER_V743';
  var USER_KEY='HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL';
  var USER_KEYS=[USER_KEY,'HAPPYAD_USER','HAPPYAD_CURRENT_USER','happyad_current_user'];
  var AVATAR_KEY='HAPPYAD_PROFILE_AVATAR_STABLE_CACHE_V1';
  var AUTHOR_KEY='HAPPYAD_AUTHOR_PROFILE_CACHE_V1';
  var STABLE_PREFIX='HAPPYAD_PROFILE_IDENTITY_STABLE_V741:';
  var CACHE_KEYS=[
    'HAPPYAD_HOME_BOOT_SNAPSHOT_V1','HAPPYAD_HOME_CONFIRMED_ORDER_V643','HAPPYAD_GLOBAL_POSTS_CACHE_V1',
    'HAPPYAD_HOME_POSTS_CACHE_V1','HAPPYAD_POSTS_CACHE_V1','HAPPYAD_CACHED_POSTS_V1','HAPPYAD_FEED_CACHE_V1',
    'HAPPYAD_SEARCH_POSTS_FAST_CACHE_V1','HAPPYAD_PUBLISH_POSTS_V2','HAPPYAD_PROFILE_POSTS_CACHE_V1',
    'HAPPYAD_PROFILE_OWN_POSTS_STABLE_CACHE_V1','HAPPYAD_USER_POSTS_CACHE_V1','HAPPYAD_STORIES_CACHE_V1'
  ];
  var busy=false,lastRun=0,channel=null,lastPersistSig='';

  /* V758 — l'avatar du compte connecté ne doit jamais être injecté dans un
     Profil visiteur. La récupération V743 reste active dans le parent et dans
     Mon profil, mais devient strictement non mutante dans une route public=1. */
  function visitorSurfaceV758(){
    try{
      var qs=new URLSearchParams(location.search||'');
      var uid=clean(qs.get('uid')||qs.get('user_id')||qs.get('profile_uid')||qs.get('auth_user_id')||qs.get('account_uid')||qs.get('owner')||qs.get('owner_id')||qs.get('creator_id')||qs.get('profile_id'));
      if(String(qs.get('public')||'')==='1'&&uid)return true;
      var html=document.documentElement,body=document.body;
      if(html&&(html.dataset.happyadPublicRouteV669==='1'||html.classList.contains('haPublicProfileSurfaceGateV669')))return true;
      if(body&&(body.classList.contains('happyadPublicCreatorProfile')||body.classList.contains('haProfileVisitor')||body.classList.contains('happyadVisitorProfilePersistentV601')))return true;
    }catch(_e){}
    return false;
  }

  function clean(v){return String(v==null?'':v).trim();}
  function uuid(v){return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(clean(v));}
  function read(k,f){try{var v=JSON.parse(localStorage.getItem(k)||'null');return v==null?f:v;}catch(_e){return f;}}
  function write(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(_e){}}
  function first(){for(var i=0;i<arguments.length;i++){var v=clean(arguments[i]);if(v)return v;}return '';}
  function unwrapCss(v){v=clean(v);var m=v.match(/^url\(["']?(.*?)["']?\)$/i);return m?clean(m[1]):v;}
  function invalid(v){
    v=unwrapCss(v);var l=v.toLowerCase();
    return !v||v==='👤'||v==='🧑'||v==='user'||v==='avatar'||v==='none'||v==='null'||v==='undefined'||
      l==='aucun'||l==='default'||l.indexOf('placeholder')>-1||l.indexOf('default-avatar')>-1||
      l.indexOf('profile-placeholder')>-1||l.indexOf('data:image/svg+xml')===0&&v.length<500;
  }
  function rawAvatar(p){
    p=p||{};
    var nested=p.profile||p.user||p.author||p.creator||p.owner||{};
    var meta=p.metadata&&typeof p.metadata==='object'?p.metadata:{};
    var localUser=meta.user&&typeof meta.user==='object'?meta.user:{};
    return first(
      p.avatar_url,p.avatarUrl,p.avatar,p.user_avatar,p.userAvatar,p.creator_avatar,p.creatorAvatar,
      p.author_avatar,p.authorAvatar,p.profile_photo_url,p.profilePhotoUrl,p.profile_photo,p.profilePhoto,
      p.profile_picture_url,p.profilePictureUrl,p.profile_picture,p.profilePicture,p.photo_url,p.photoUrl,p.photo,
      p.image_url,p.imageUrl,p.picture,p.profile_image_url,p.profileImageUrl,p.profile_avatar_url,p.profileAvatarUrl,
      nested.avatar_url,nested.avatar,nested.photo_url,nested.profile_photo_url,nested.picture,
      localUser.avatar_url,localUser.avatar,meta.avatar_url,meta.avatar
    );
  }
  function uidOf(p){p=p||{};return first(p.user_id,p.creatorId,p.creator_id,p.userId,p.owner_id,p.ownerId,p.author_id,p.authorId,p.profile_id,p.profileId,p.auth_user_id,p.authUserId,p.account_uid,p.accountUid,p.uid,p.uuid,p.id);}
  function currentUid(){
    var id=clean(localStorage.getItem('HAPPYAD_AUTH_UID'));if(uuid(id))return id;
    for(var i=0;i<USER_KEYS.length;i++){var x=read(USER_KEYS[i],{}),u=uidOf(x);if(uuid(u))return u;}
    return '';
  }
  function client(){
    try{
      if(window.happyadSupabase&&window.happyadSupabase.from)return window.happyadSupabase;
      if(typeof window.happyadSb==='function'){var c=window.happyadSb();if(c&&c.from)return c;}
      if(window.parent&&window.parent!==window){
        if(typeof window.parent.happyadSb==='function'){var p=window.parent.happyadSb();if(p&&p.from)return p;}
        if(window.parent.happyadSupabase&&window.parent.happyadSupabase.from)return window.parent.happyadSupabase;
      }
    }catch(_e){}
    return null;
  }
  function normalize(v){
    v=unwrapCss(v);if(invalid(v)||/^blob:/i.test(v))return '';
    if(/^https?:\/\//i.test(v)||/^data:image\/(?:png|jpe?g|webp|gif|avif);/i.test(v))return v;
    if(/^\/storage\/v1\/object\//i.test(v))return clean(window.HAPPYAD_SUPABASE_URL||'https://txjjyhupbejgjcianrmr.supabase.co').replace(/\/+$/,'')+v;
    if(v.length<8)return '';
    var path=v.replace(/^\/+/,''),bucket='happyad-media';
    var bm=path.match(/^(happyad-media|avatars|profile-photos|profile-images)\/(.+)$/i);
    if(bm){bucket=bm[1];path=bm[2];}
    if(path.indexOf('/')<0&&!/\.(png|jpe?g|webp|gif|avif)(?:[?#]|$)/i.test(path))return '';
    try{var c=client();if(c&&c.storage&&c.storage.from){var r=c.storage.from(bucket).getPublicUrl(path);if(r&&r.data&&r.data.publicUrl)return r.data.publicUrl;}}catch(_e){}
    return clean(window.HAPPYAD_SUPABASE_URL||'https://txjjyhupbejgjcianrmr.supabase.co').replace(/\/+$/,'')+'/storage/v1/object/public/'+encodeURIComponent(bucket)+'/'+encodeURI(path);
  }
  function add(list,value,score,source){var v=normalize(value);if(!v)return;var old=list.find(function(x){return x.url===v;});if(old){if(score>old.score){old.score=score;old.source=source;}return;}list.push({url:v,score:score,source:source});}
  function arraysFromCache(){
    var out=[];
    try{if(Array.isArray(window.ALL_POSTS))out.push(window.ALL_POSTS);}catch(_e){}
    CACHE_KEYS.forEach(function(k){var v=read(k,null);if(Array.isArray(v))out.push(v);else if(v&&Array.isArray(v.posts))out.push(v.posts);else if(v&&Array.isArray(v.data))out.push(v.data);});
    return out;
  }
  function collectLocal(uid){
    var list=[];
    USER_KEYS.forEach(function(k){var x=read(k,{}),id=uidOf(x);if(id===uid)add(list,rawAvatar(x),92,'local:'+k);else if(!id&&k===USER_KEY)add(list,rawAvatar(x),68,'local-unbound:'+k);});
    add(list,localStorage.getItem('HAPPYAD_PROFILE_AVATAR_STABLE_CACHE_V743:'+uid),97,'stable-avatar-uid');
    add(list,localStorage.getItem(AVATAR_KEY),74,'legacy-global-avatar-key');
    add(list,rawAvatar(read(STABLE_PREFIX+uid,{})),95,'stable-identity');
    var authors=read(AUTHOR_KEY,{});add(list,authors&&rawAvatar(authors[uid]),91,'author-cache');
    var active=read('HAPPYAD_ACTIVE_PROFILE',{});if(uidOf(active)===uid)add(list,rawAvatar(active),86,'active-profile');
    arraysFromCache().forEach(function(arr){arr.forEach(function(row){if(uidOf(row)===uid)add(list,rawAvatar(row),84,'post-or-story-cache');});});
    try{
      var av=document.getElementById('avatarPreview');
      if(av){add(list,av.dataset&&av.dataset.stableAvatar,90,'profile-dom-stable');add(list,av.style&&av.style.backgroundImage,82,'profile-dom-background');}
      document.querySelectorAll('[data-happyad-owner-uid="'+uid+'"] .avatar img,.miniCard[data-happyad-owner-uid="'+uid+'"] .avatar img').forEach(function(img){add(list,img.currentSrc||img.src,80,'card-dom');});
    }catch(_e){}
    return list;
  }
  function candidatesFromRows(list,rows,score,source,uid){(rows||[]).forEach(function(r){if(!uid||!uidOf(r)||uidOf(r)===uid)add(list,rawAvatar(r),score,source);});}
  async function queryRows(c,table,uid){
    var fields=['user_id','creator_id','owner_id','author_id','profile_id','id'];
    for(var i=0;i<fields.length;i++){
      try{
        var q=c.from(table).select('*').eq(fields[i],uid).limit(100);
        if(table!=='profiles')q=q.order('created_at',{ascending:false});
        var r=await q;if(r&&!r.error&&Array.isArray(r.data)&&r.data.length)return r.data;
      }catch(_e){}
    }
    return [];
  }
  async function collectRemote(uid,list){
    var c=client();if(!c)return {client:null,profile:null};
    var profile=null;
    try{var au=await c.auth.getUser(),user=au&&au.data&&au.data.user;if(user){add(list,user.user_metadata&&user.user_metadata.avatar_url,88,'auth-metadata');add(list,user.user_metadata&&user.user_metadata.picture,87,'auth-picture');}}
    catch(_e){}
    try{var pr=await c.from('profiles').select('*').eq('id',uid).maybeSingle();if(pr&&!pr.error&&pr.data){profile=pr.data;add(list,rawAvatar(pr.data),100,'profiles');}}
    catch(_e){}
    var posts=await queryRows(c,'happyad_posts',uid);candidatesFromRows(list,posts,89,'happyad-posts',uid);
    var stories=await queryRows(c,'happyad_stories',uid);candidatesFromRows(list,stories,85,'happyad-stories',uid);
    return {client:c,profile:profile};
  }
  function loadable(url){
    return new Promise(function(resolve){
      if(/^data:image\//i.test(url)){resolve(url.length>120?url:'');return;}
      var done=false,img=new Image(),timer=setTimeout(function(){if(!done){done=true;resolve('');}},2600);
      img.onload=function(){if(done)return;done=true;clearTimeout(timer);resolve((img.naturalWidth||0)>8&&(img.naturalHeight||0)>8?url:'');};
      img.onerror=function(){if(done)return;done=true;clearTimeout(timer);resolve('');};
      img.referrerPolicy='no-referrer';img.src=url+(url.indexOf('data:')===0?'':(url.indexOf('?')>-1?'&':'?')+'ha_v743='+Date.now());
    });
  }
  async function choose(list){
    list.sort(function(a,b){return b.score-a.score;});
    var top=list.slice(0,14),results=await Promise.all(top.map(function(x){return loadable(x.url).then(function(ok){return ok?x:null;});}));
    for(var i=0;i<results.length;i++)if(results[i])return results[i];
    return null;
  }
  function patchCaches(uid,url){
    function patch(p){if(!p||uidOf(p)!==uid)return p;return Object.assign({},p,{avatar:url,avatar_url:url,user_avatar:url,creator_avatar:url,author_avatar:url,profile_photo_url:url});}
    try{if(Array.isArray(window.ALL_POSTS))window.ALL_POSTS=window.ALL_POSTS.map(patch);}catch(_e){}
    CACHE_KEYS.forEach(function(k){try{var raw=read(k,null),shape='array',arr=raw;if(raw&&Array.isArray(raw.posts)){arr=raw.posts;shape='posts';}else if(raw&&Array.isArray(raw.data)){arr=raw.data;shape='data';}if(!Array.isArray(arr))return;var changed=false,next=arr.map(function(p){var n=patch(p);if(n!==p)changed=true;return n;});if(!changed)return;if(shape==='posts'){raw.posts=next;write(k,raw);}else if(shape==='data'){raw.data=next;write(k,raw);}else write(k,next);}catch(_e){}});
  }
  function cachedAvatar(uid){
    return normalize(localStorage.getItem('HAPPYAD_PROFILE_AVATAR_STABLE_CACHE_V743:'+uid)||rawAvatar(read(STABLE_PREFIX+uid,{}))||rawAvatar(read(USER_KEY,{}))||localStorage.getItem(AVATAR_KEY));
  }
  function persist(uid,url,source){
    if(visitorSurfaceV758())return;
    url=normalize(url);if(!uid||!url)return;
    var before=cachedAvatar(uid),changed=before!==url,sig=uid+'|'+url;
    if(changed||lastPersistSig!==sig){
      USER_KEYS.forEach(function(k){
        var x=read(k,{}),id=uidOf(x);if(id&&id!==uid)return;
        if(normalize(rawAvatar(x))===url&&uidOf(x)===uid)return;
        x=Object.assign({},x,{id:uid,user_id:uid,avatar:url,avatar_url:url});write(k,x);
      });
      var stable=read(STABLE_PREFIX+uid,{});
      if(normalize(rawAvatar(stable))!==url)write(STABLE_PREFIX+uid,Object.assign({},stable,{id:uid,user_id:uid,avatar:url,avatar_url:url,avatar_recovered_source_v743:source,avatar_recovered_at_v743:new Date().toISOString()}));
      try{localStorage.setItem(AVATAR_KEY,url);localStorage.setItem('HAPPYAD_PROFILE_AVATAR_STABLE_CACHE_V743:'+uid,url);localStorage.setItem('HAPPYAD_AUTH_UID',uid);localStorage.setItem('HAPPYAD_SESSION_ACTIVE','1');}catch(_e){}
      var authors=read(AUTHOR_KEY,{}),old=authors&&authors[uid]||{};
      if(normalize(rawAvatar(old))!==url){authors[uid]=Object.assign({},old,{id:uid,user_id:uid,avatar:url,avatar_url:url});write(AUTHOR_KEY,authors);}
      try{if(window.UserStore&&normalize(rawAvatar(window.UserStore.data||{}))!==url){window.UserStore.data=Object.assign({},window.UserStore.data||{},{id:uid,user_id:uid,avatar:url,avatar_url:url});if(window.UserStore.save)window.UserStore.save();}}catch(_e){}
      if(changed){
        patchCaches(uid,url);
        try{window.dispatchEvent(new CustomEvent('HAPPYAD_PROFILE_AVATAR_RECOVERED_V743',{detail:{uid:uid,avatar:url,source:source}}));}catch(_e){}
        try{window.dispatchEvent(new CustomEvent('HAPPYAD_PROFILE_IDENTITY_V741',{detail:{profile:{id:uid,user_id:uid,avatar:url,avatar_url:url}}}));}catch(_e){}
      }
      lastPersistSig=sig;
    }
    paint(uid,url);
  }
  function paint(uid,url){
    if(visitorSurfaceV758())return;
    try{
      var av=document.getElementById('avatarPreview');if(!av)return;
      av.style.backgroundImage="url('"+String(url).replace(/'/g,'%27')+"')";
      av.dataset.stableAvatar=url;av.dataset.stableAvatarUid=uid;av.dataset.publicAvatarStable=url;
      av.classList.remove('happyadAvatarPending');
      var firstChild=av.firstChild;if(firstChild&&firstChild.nodeType===3)firstChild.textContent='';
    }catch(_e){}
  }
  async function repair(force){
    if(visitorSurfaceV758())return;
    var now=Date.now();if(busy||(!force&&now-lastRun<6000))return;busy=true;lastRun=now;
    try{
      var uid=currentUid();if(!uid)return;
      var list=collectLocal(uid),remote=await collectRemote(uid,list),picked=await choose(list);
      if(!picked)return;
      persist(uid,picked.url,picked.source);
      var existing=normalize(remote.profile&&rawAvatar(remote.profile));
      if(remote.client&&picked.url&&picked.url!==existing&&(/^https?:\/\//i.test(picked.url)||/^data:image\//i.test(picked.url))){
        try{await remote.client.from('profiles').update({avatar_url:picked.url}).eq('id',uid);}catch(_e){}
      }
    }catch(e){console.warn('HAPPYAD V743 avatar recovery',e);}finally{busy=false;}
  }
  function subscribe(){
    if(visitorSurfaceV758())return;
    try{var uid=currentUid(),c=client();if(!uid||!c||!c.channel||channel)return;channel=c.channel('happyad_profile_avatar_v743_'+uid).on('postgres_changes',{event:'*',schema:'public',table:'profiles',filter:'id=eq.'+uid},function(){setTimeout(function(){repair(true);},80);}).subscribe();}catch(_e){}
  }
  function previewNeedsRepair(){
    if(visitorSurfaceV758())return false;
    try{
      var av=document.getElementById('avatarPreview');
      if(!av)return false;
      var uid=currentUid(),cached=uid?cachedAvatar(uid):'';
      var shown=normalize((av.dataset&&av.dataset.stableAvatar)||(av.style&&av.style.backgroundImage)||'');
      return !cached||!shown||shown!==cached;
    }catch(_e){return false;}
  }
  function paintCached(){var uid=currentUid(),url=uid?cachedAvatar(uid):'';if(uid&&url)paint(uid,url);return !!url;}
  window.HappyadProfileAvatarRecoveryV743=Object.freeze({build:BUILD+'+V758_VISITOR_ISOLATION+V763_HOME_STABLE',repair:repair,current:function(){var uid=currentUid();return uid?cachedAvatar(uid):'';},isVisitorSurface:visitorSurfaceV758});
  function boot(){
    paintCached();
    setTimeout(function(){repair(true);subscribe();},520);
    setTimeout(function(){if(!paintCached())repair(true);},4600);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.addEventListener('online',function(){repair(true);});
  window.addEventListener('focus',function(){if(previewNeedsRepair())repair(false);});
  window.addEventListener('pageshow',function(e){paintCached();if(e&&e.persisted&&previewNeedsRepair())repair(false);});
  window.addEventListener('HAPPYAD_PROFILE_IDENTITY_READY_V741',function(){paintCached();});
  document.addEventListener('visibilitychange',function(){if(!document.hidden){paintCached();if(previewNeedsRepair())repair(false);}});
  try{
    var mutationTimer=0;
    new MutationObserver(function(records){
      var relevant=records.some(function(record){return Array.prototype.some.call(record.addedNodes||[],function(node){return node&&node.nodeType===1&&(node.id==='avatarPreview'||node.querySelector&&node.querySelector('#avatarPreview'));});});
      if(relevant){clearTimeout(mutationTimer);mutationTimer=setTimeout(function(){if(!paintCached()||previewNeedsRepair())repair(false);},220);}
    }).observe(document.documentElement,{childList:true,subtree:true});
  }catch(_e){}
})();
