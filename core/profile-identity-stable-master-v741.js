(function(){
  'use strict';
  if(window.__HAPPYAD_PROFILE_IDENTITY_STABLE_MASTER_V741__)return;
  window.__HAPPYAD_PROFILE_IDENTITY_STABLE_MASTER_V741__=true;
  var VERSION='PROFILE_IDENTITY_STABLE_MASTER_V741';
  var USER_KEY='HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL';
  var USER_KEYS=[USER_KEY,'HAPPYAD_USER','HAPPYAD_CURRENT_USER','happyad_current_user'];
  var STABLE_PREFIX='HAPPYAD_PROFILE_IDENTITY_STABLE_V741:';
  var busy=false,lastRun=0,channel=null;
  function clean(v){return String(v==null?'':v).trim();}
  function uuid(v){return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(clean(v));}
  function json(k,f){try{var x=JSON.parse(localStorage.getItem(k)||'null');return x&&typeof x==='object'?x:(f||{});}catch(_e){return f||{};}}
  function first(){for(var i=0;i<arguments.length;i++){var v=clean(arguments[i]);if(v)return v;}return '';}
  function poorName(v){v=clean(v).toLowerCase();return !v||v==='utilisateur'||v==='utilisateur happyad'||v==='happyad'||v==='compte happyad'||v.indexOf('aucun compte')>-1||v.indexOf('chargement profil')>-1;}
  function avatarOf(p){p=p||{};return publicAvatar(first(p.avatar_url,p.avatarUrl,p.avatar,p.profile_photo_url,p.profilePhotoUrl,p.profile_photo,p.profilePhoto,p.profile_picture_url,p.profilePictureUrl,p.profile_picture,p.profilePicture,p.photo_url,p.photoUrl,p.image_url,p.imageUrl,p.picture,p.creator_avatar,p.creatorAvatar,p.author_avatar,p.authorAvatar,p.user_avatar,p.userAvatar,p.profile_image_url,p.profileImageUrl,p.profile_avatar_url,p.profileAvatarUrl));}
  function publicAvatar(v){v=clean(v).replace(/^url\(["']?(.*?)["']?\)$/i,'$1');var l=v.toLowerCase();if(!v||/^blob:/i.test(v)||v==='👤'||v==='🧑'||l==='none'||l==='null'||l==='undefined'||l.indexOf('placeholder')>-1)return '';if(/^https?:\/\//i.test(v)||/^data:image\/(?:png|jpe?g|webp|gif|avif);/i.test(v))return v;if(v.indexOf('/')<0&&!/\.(png|jpe?g|webp|gif|avif)(?:[?#]|$)/i.test(v))return '';var path=v.replace(/^\/+/, '').replace(/^happyad-media\//,'');try{var c=client();if(c&&c.storage&&c.storage.from){var r=c.storage.from('happyad-media').getPublicUrl(path);if(r&&r.data&&r.data.publicUrl)return r.data.publicUrl;}}catch(_e){}var base=clean(window.HAPPYAD_SUPABASE_URL||'https://txjjyhupbejgjcianrmr.supabase.co').replace(/\/+$/,'');return base+'/storage/v1/object/public/happyad-media/'+encodeURI(path);}
  function nameOf(p){p=p||{};return first(p.full_name,p.display_name,p.name,p.creatorName,p.creator_name,p.author_name,p.user_name);}
  function handleOf(p){p=p||{};return first(p.username,p.handle).replace(/^@+/,'');}
  function badgeOf(p){p=p||{};return first(p.badge,p.user_badge,p.profile_badge,p.badge_type,p.certification,p.verified_badge);}
  function uidOf(p){p=p||{};return first(p.user_id,p.creatorId,p.creator_id,p.userId,p.owner_id,p.ownerId,p.author_id,p.authorId,p.profile_id,p.profileId,p.auth_user_id,p.authUserId,p.account_uid,p.accountUid,p.uid,p.uuid,p.id);}
  function currentUid(){
    try{var id=clean(localStorage.getItem('HAPPYAD_AUTH_UID'));if(uuid(id))return id;}catch(_e){}
    for(var i=0;i<USER_KEYS.length;i++){var id2=uidOf(json(USER_KEYS[i],{}));if(uuid(id2))return id2;}
    return '';
  }
  function stable(uid){return uid?json(STABLE_PREFIX+uid,{}):{};}
  function local(uid){
    var out={};USER_KEYS.forEach(function(k){var x=json(k,{}),id=uidOf(x);if(!uid||!id||id===uid)Object.keys(x).forEach(function(n){if(out[n]==null||out[n]===''||out[n]===false)out[n]=x[n];});});return out;
  }
  function ownPostIdentity(uid){
    var arrays=[];
    try{if(Array.isArray(window.ALL_POSTS))arrays.push(window.ALL_POSTS);}catch(_e){}
    ['HAPPYAD_HOME_BOOT_SNAPSHOT_V1','HAPPYAD_HOME_CONFIRMED_ORDER_V643','HAPPYAD_GLOBAL_POSTS_CACHE_V1','HAPPYAD_HOME_POSTS_CACHE_V1','HAPPYAD_POSTS_CACHE_V1','HAPPYAD_CACHED_POSTS_V1','HAPPYAD_FEED_CACHE_V1','HAPPYAD_SEARCH_POSTS_FAST_CACHE_V1','HAPPYAD_PUBLISH_POSTS_V2','HAPPYAD_PROFILE_POSTS_CACHE_V1','HAPPYAD_PROFILE_OWN_POSTS_STABLE_CACHE_V1','HAPPYAD_USER_POSTS_CACHE_V1','HAPPYAD_STORIES_CACHE_V1'].forEach(function(k){var a=json(k,null);if(Array.isArray(a))arrays.push(a);else if(a&&Array.isArray(a.posts))arrays.push(a.posts);else if(a&&Array.isArray(a.data))arrays.push(a.data);});
    var best={};
    arrays.forEach(function(a){a.forEach(function(p){if(uidOf(p)!==uid)return;var n=nameOf(p),av=avatarOf(p),b=badgeOf(p),h=handleOf(p);if(!poorName(n)&&poorName(nameOf(best)))best.name=n;if(av&&!avatarOf(best))best.avatar=av;if(b&&!badgeOf(best))best.badge=b;if(h&&!handleOf(best))best.handle=h;});});
    return best;
  }
  function merge(uid,remote){
    var cur=local(uid),st=stable(uid),post=ownPostIdentity(uid),r=remote||{};
    var rn=nameOf(r), cn=nameOf(cur), sn=nameOf(st), pn=nameOf(post);
    var name=!poorName(rn)?rn:(!poorName(cn)?cn:(!poorName(sn)?sn:(!poorName(pn)?pn:'Utilisateur HAPPYAD')));
    var avatar=first(avatarOf(r),avatarOf(cur),avatarOf(st),avatarOf(post));
    var handle=first(handleOf(r),handleOf(cur),handleOf(st),handleOf(post));
    var remoteBadge=clean(badgeOf(r)).toLowerCase(),oldBadge=clean(first(badgeOf(cur),badgeOf(st),badgeOf(post))).toLowerCase();
    var badge=(remoteBadge&&remoteBadge!=='aucun'&&remoteBadge!=='none'&&remoteBadge!=='null'&&remoteBadge!=='undefined')?remoteBadge:(oldBadge||'aucun');
    var remoteRole=clean(r&&r.role).toLowerCase(),oldRole=clean(first(cur.role,st.role)).toLowerCase();
    var role=(remoteRole&&!(remoteRole==='user'&&oldRole&&oldRole!=='user'))?remoteRole:(oldRole||remoteRole||'user');
    var next=Object.assign({},st,cur,r,{id:uid,user_id:uid,name:name,full_name:name,display_name:name,handle:handle,username:handle,avatar:avatar,avatar_url:avatar,badge:badge,role:role});
    return next;
  }
  function identitySig(p){p=p||{};return [uidOf(p),nameOf(p),handleOf(p),avatarOf(p),badgeOf(p),clean(p.role),clean(p.type),clean(p.bio),clean(p.country)].join('|');}
  function persist(next,source){
    var uid=uidOf(next);if(!uuid(uid))return next;
    var before=local(uid), changed=identitySig(before)!==identitySig(next);
    USER_KEYS.forEach(function(k){try{localStorage.setItem(k,JSON.stringify(Object.assign({},json(k,{}),next)));}catch(_e){}});
    try{localStorage.setItem(STABLE_PREFIX+uid,JSON.stringify(Object.assign({},stable(uid),next,{identity_source_v741:source||'',identity_saved_at_v741:new Date().toISOString()})));}catch(_e){}
    try{localStorage.setItem('HAPPYAD_AUTH_UID',uid);localStorage.setItem('HAPPYAD_SESSION_ACTIVE','1');}catch(_e){}
    try{if(window.UserStore){window.UserStore.data=Object.assign({},window.UserStore.data||{},next);if(window.UserStore.save)window.UserStore.save();}}catch(_e){}
    if(changed)repairPosts(next);
    paint(next,changed);
    if(changed){
      try{window.dispatchEvent(new CustomEvent('HAPPYAD_PROFILE_IDENTITY_READY_V741',{detail:{profile:next,source:source||VERSION}}));}catch(_e){}
      try{if(window.parent&&window.parent!==window)window.parent.postMessage({type:'HAPPYAD_PROFILE_IDENTITY_V741',profile:next,source:source||VERSION},location.origin);}catch(_e){}
    }
    return next;
  }
  function repairPosts(next){
    var uid=uidOf(next);if(!uid)return;
    function patch(p){if(!p||uidOf(p)!==uid)return p;return Object.assign({},p,{creatorName:next.name,creator_name:next.name,display_name:next.name,full_name:next.name,handle:next.handle?('@'+next.handle):p.handle,username:next.handle||p.username,avatar:next.avatar||p.avatar,avatar_url:next.avatar||p.avatar_url,creator_avatar:next.avatar||p.creator_avatar,author_avatar:next.avatar||p.author_avatar,badge:next.badge||p.badge,user_badge:next.badge||p.user_badge});}
    try{if(Array.isArray(window.ALL_POSTS))window.ALL_POSTS=window.ALL_POSTS.map(patch);}catch(_e){}
    ['HAPPYAD_HOME_BOOT_SNAPSHOT_V1','HAPPYAD_HOME_CONFIRMED_ORDER_V643','HAPPYAD_GLOBAL_POSTS_CACHE_V1','HAPPYAD_HOME_POSTS_CACHE_V1','HAPPYAD_POSTS_CACHE_V1','HAPPYAD_CACHED_POSTS_V1','HAPPYAD_FEED_CACHE_V1','HAPPYAD_SEARCH_POSTS_FAST_CACHE_V1','HAPPYAD_PUBLISH_POSTS_V2','HAPPYAD_PROFILE_POSTS_CACHE_V1','HAPPYAD_PROFILE_OWN_POSTS_STABLE_CACHE_V1','HAPPYAD_USER_POSTS_CACHE_V1','HAPPYAD_STORIES_CACHE_V1'].forEach(function(k){try{var raw=json(k,null),shape='array',a=raw;if(raw&&Array.isArray(raw.posts)){a=raw.posts;shape='posts';}else if(raw&&Array.isArray(raw.data)){a=raw.data;shape='data';}if(!Array.isArray(a))return;var changed=false;var b=a.map(function(p){var n=patch(p);if(n!==p)changed=true;return n;});if(changed){if(shape==='posts'){raw.posts=b;localStorage.setItem(k,JSON.stringify(raw));}else if(shape==='data'){raw.data=b;localStorage.setItem(k,JSON.stringify(raw));}else localStorage.setItem(k,JSON.stringify(b));}}catch(_e){}});
  }
  function paint(next,allowRender){
    try{
      var n=document.getElementById('profileName');if(n&&!poorName(next.name))n.textContent=next.name;
      var h=document.getElementById('profileHandle');if(h&&next.handle)h.textContent='@'+next.handle.replace(/^@+/,'');
      var av=document.getElementById('avatarPreview');if(av&&next.avatar){av.style.backgroundImage="url('"+String(next.avatar).replace(/'/g,'%27')+"')";av.dataset.stableAvatar=next.avatar;av.dataset.stableAvatarUid=next.id;av.classList.remove('happyadAvatarPending');var f=av.firstChild;if(f&&f.nodeType===3)f.textContent='';}
      if(allowRender&&typeof window.render==='function'&&document.getElementById('profileName'))setTimeout(function(){try{window.render();}catch(_e){}},0);
    }catch(_e){}
  }
  function client(){try{return window.happyadSupabase||(typeof window.happyadSb==='function'&&window.happyadSb())||null;}catch(_e){return null;}}
  async function refresh(force){
    var now=Date.now();if(busy||(!force&&now-lastRun<1200))return;busy=true;lastRun=now;
    try{
      var uid=currentUid();if(!uid)return;
      var provisional=merge(uid,{});persist(provisional,'local-repair-v741');
      var c=client();if(!c||!c.from)return;
      var q=await c.from('profiles').select('*').eq('id',uid).maybeSingle();
      if(q&&q.error){console.warn('HAPPYAD V741 profile refresh kept local identity',q.error);return;}
      if(q&&q.data){var next=merge(uid,q.data);persist(next,'supabase-profile-v741');}
    }catch(e){console.warn('HAPPYAD V741 profile identity refresh',e);}finally{busy=false;}
  }
  function subscribe(){
    try{var uid=currentUid(),c=client();if(!uid||!c||!c.channel||channel)return;channel=c.channel('happyad_profile_identity_v741_'+uid).on('postgres_changes',{event:'*',schema:'public',table:'profiles',filter:'id=eq.'+uid},function(){refresh(true);}).subscribe();}catch(_e){}
  }
  window.HappyadProfileIdentityV741={version:VERSION,refresh:refresh,current:function(){var uid=currentUid();return uid?merge(uid,{}):{};},persist:persist};
  function boot(){refresh(true);setTimeout(function(){refresh(true);subscribe();},500);setTimeout(function(){refresh(false);},2200);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.addEventListener('HAPPYAD_AUTH_STATE_V595',function(){setTimeout(function(){refresh(true);subscribe();},40);});
  window.addEventListener('HAPPYAD_PROFILE_IDENTITY_V741',function(e){try{var p=e&&e.detail&&e.detail.profile;if(p&&uuid(uidOf(p)))persist(merge(uidOf(p),p),'auth-event-v741');}catch(_e){}});
  window.addEventListener('message',function(e){try{if(e.origin!==location.origin)return;var d=e.data||{};if(d.type==='HAPPYAD_PROFILE_IDENTITY_V741'&&d.profile&&uuid(uidOf(d.profile)))persist(merge(uidOf(d.profile),d.profile),'frame-message-v741');}catch(_e){}},true);
  window.addEventListener('focus',function(){refresh(false);});
  window.addEventListener('online',function(){refresh(true);});
  window.addEventListener('pageshow',function(){refresh(false);});
  document.addEventListener('visibilitychange',function(){if(!document.hidden)refresh(false);});
})();
