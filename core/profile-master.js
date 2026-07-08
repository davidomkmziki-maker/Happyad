(function(){
  'use strict';
  if(window.__HAPPYAD_PROFILE_MASTER_V15__)return;
  window.__HAPPYAD_PROFILE_MASTER_V15__=true;

  var MASTER_VERSION='PROFILE_MASTER_V15';
  var legacyOpenFromPost=typeof window.happyadOpenPublicProfileFromPostV417==='function'?window.happyadOpenPublicProfileFromPostV417:null;
  var legacyOpenViewer=typeof window.openViewerProfile==='function'?window.openViewerProfile:null;
  var legacyOpenProfile=typeof window.openProfile==='function'?window.openProfile:null;

  function clean(v){return String(v==null?'':v).trim();}
  function lower(v){return clean(v).toLowerCase();}
  function esc(v){return encodeURIComponent(clean(v));}
  function uniq(arr){var out=[],seen={};(arr||[]).forEach(function(v){v=clean(v);if(!v)return;var k=lower(v);if(!seen[k]){seen[k]=1;out.push(v);}});return out;}
  function readJson(k){try{return JSON.parse(localStorage.getItem(k)||'null')||null;}catch(_e){return null;}}
  function validUser(u){
    if(!u||typeof u!=='object')return false;
    var id=clean(u.id||u.user_id||u.uid||u.uuid||u.auth_id||u.profile_id||u.owner_id);
    var nm=lower(u.name||u.full_name||u.display_name||'');
    if(id.indexOf('guest')===0||id.indexOf('logged_out')===0)return false;
    if(nm==='utilisateur'||nm==='utilisateur happyad'||nm.indexOf('aucun compte')>=0)return false;
    return !!(id||clean(u.email)||clean(u.handle||u.username));
  }
  function currentUser(){
    var u=null;
    try{if(typeof window.currentUser==='function'){u=window.currentUser();if(validUser(u))return u;}}catch(_e){}
    try{if(window.UserStore&&validUser(window.UserStore.data))return window.UserStore.data;}catch(_s){}
    var keys=['HAPPYAD_LOGGED_USER','HAPPYAD_CURRENT_USER','HAPPYAD_USER','HAPPYAD_USER_V1','HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL'];
    for(var i=0;i<keys.length;i++){u=readJson(keys[i]);if(validUser(u))return u;}
    return {};
  }
  function currentIds(){
    var u=currentUser()||{};
    var ids=[u.id,u.user_id,u.uid,u.uuid,u.auth_id,u.profile_id,u.owner_id,u.email];
    try{ids.push(localStorage.getItem('HAPPYAD_AUTH_UID'));}catch(_e){}
    return uniq(ids);
  }
  function isOwnUid(uid){
    uid=lower(uid);if(!uid)return false;
    var ids=currentIds();
    for(var i=0;i<ids.length;i++){if(lower(ids[i])===uid)return true;}
    return false;
  }
  function uidOf(x){
    x=x||{};
    try{
      if(typeof window.postOwnerData==='function'){
        var o=window.postOwnerData(x)||{};
        var oid=clean(o.id||o.user_id||o.uid||o.uuid||o.auth_id);
        if(oid)return oid;
      }
    }catch(_e){}
    return clean(x.uid||x.user_id||x.userId||x.creatorId||x.creator_id||x.ownerId||x.owner_id||x.author_id||x.profile_id||x.requestedUid||x.id);
  }
  function avatarOf(p){p=p||{};return clean(p.avatar||p.avatar_url||p.author_avatar||p.creator_avatar||p.photo||p.profile_photo||p.image_url||p.picture);}
  function nameOf(p){p=p||{};return clean(p.name||p.full_name||p.display_name||p.creatorName||p.creator_name||p.username||p.handle)||'Utilisateur HAPPYAD';}
  function normalizeProfile(p){
    p=p||{};var id=uidOf(p), nm=nameOf(p), av=avatarOf(p), hd=clean(p.handle||p.username), bg=clean(p.badge||p.user_badge||p.verified_badge||p.badge_type||p.certification||p.certified||p.is_verified);
    return {id:id,user_id:id,uid:id,name:nm,full_name:clean(p.full_name)||nm,display_name:clean(p.display_name)||nm,username:clean(p.username)||hd,handle:hd,avatar:av,avatar_url:av,badge:bg,user_badge:bg,__happyadUidLocked:true,source:MASTER_VERSION,at:Date.now?Date.now():new Date().getTime()};
  }
  function allPostsFor(uid){
    try{
      var arr=[];
      if(typeof window.happyadAllLocalPostsForPublicV463==='function')arr=window.happyadAllLocalPostsForPublicV463()||[];
      else if(Array.isArray(window.ALL_POSTS))arr=window.ALL_POSTS;
      if(uid&&Array.isArray(arr)){
        return arr.filter(function(x){
          try{if(typeof window.happyadOwnerOfPostV463==='function')return String(window.happyadOwnerOfPostV463(x))===String(uid);}catch(_e){}
          return String(x&& (x.creatorId||x.creator_id||x.user_id||x.userId||x.ownerId||x.owner_id||x.uid)||'')===String(uid);
        });
      }
    }catch(_e){}
    return [];
  }
  function warm(p,posts,makeActive){
    var n=normalizeProfile(p); if(!n.id)return n;
    try{
      if(typeof window.happyadWarmPublicProfileCacheV463==='function'){
        window.happyadWarmPublicProfileCacheV463(n,Array.isArray(posts)?posts:allPostsFor(n.id),makeActive!==false);
      }else{
        localStorage.setItem('HAPPYAD_ACTIVE_PROFILE',JSON.stringify(n));
      }
    }catch(_e){try{localStorage.setItem('HAPPYAD_ACTIVE_PROFILE',JSON.stringify(n));}catch(_x){}}
    try{sessionStorage.setItem('HAPPYAD_PROFILE_MASTER_ACTIVE_UID',n.id);}catch(_s){}
    return n;
  }
  function clearPublicProfileState(){
    try{sessionStorage.removeItem('HAPPYAD_PROFILE_MASTER_ACTIVE_UID');}catch(_e){}
    try{localStorage.removeItem('HAPPYAD_ACTIVE_PROFILE');}catch(_e){}
    try{delete window.__HAPPYAD_ACTIVE_PROFILE_RAM;}catch(_e){window.__HAPPYAD_ACTIVE_PROFILE_RAM=null;}
  }
  function openMy(opts){
    opts=opts||{};
    clearPublicProfileState();
    try{sessionStorage.setItem('HAPPYAD_PROFILE_MASTER_MODE','my');}catch(_e){}
    try{if(window.HappyNavigation)return window.HappyNavigation.open('modules/user.html',{source:MASTER_VERSION,profileType:'my',replace:!!opts.replace,fromTarget:opts.fromTarget});}catch(_e){}
    try{location.href='modules/user.html';return true;}catch(_e3){return false;}
  }
  function openVisitor(uid,profile,opts){
    opts=opts||{}; uid=clean(uid||uidOf(profile)); if(!uid)return false;
    if(isOwnUid(uid))return openMy(Object.assign({},opts,{source:'own-profile-from-visitor'}));
    var prof=warm(Object.assign({},profile||{},{id:uid,user_id:uid}),opts.posts||[],true);
    try{sessionStorage.setItem('HAPPYAD_PROFILE_MASTER_MODE','visitor');}catch(_e){}
    var url='modules/user.html?public=1&uid='+esc(uid);
    if(opts.postId)url+='&post='+esc(opts.postId);
    try{if(window.HappyNavigation)return window.HappyNavigation.open(url,{source:MASTER_VERSION,uid:uid,profile:prof,replace:!!opts.replace,fromTarget:opts.fromTarget});}catch(_e){}
    try{location.href=url;return true;}catch(_e3){return false;}
  }
  function openFromPost(post,opts){
    opts=opts||{};post=post||{};
    var uid=uidOf(post); if(!uid){try{alert('Profil introuvable: UID propriétaire absent');}catch(_a){} return false;}
    if(isOwnUid(uid))return openMy(Object.assign({},opts,{postId:post.id||post.post_id||opts.postId,source:'own-profile-from-post'}));
    var p=normalizeProfile(Object.assign({},post,{id:uid,user_id:uid,name:post.creatorName||post.creator_name||post.display_name||post.full_name||post.name,avatar:post.avatar||post.avatar_url||post.creator_avatar||post.author_avatar,badge:post.badge||post.user_badge}));
    return openVisitor(uid,p,Object.assign({},opts,{postId:post.id||post.post_id||opts.postId}));
  }
  function openViewer(p,uid){return openVisitor(uid||uidOf(p),p||{},{});}
  function openFromUrl(url,opts){
    opts=opts||{};
    try{var u=new URL(String(url||''),location.href);var uid=u.searchParams.get('uid')||u.searchParams.get('user_id')||u.searchParams.get('profile_uid')||u.searchParams.get('owner')||'';if(uid&&isOwnUid(uid))return openMy(opts);if(uid)return openVisitor(uid,{},opts);}catch(_e){}
    return openMy(opts);
  }

  /* V15 actif: toute ouverture profil décide d'abord:
     - cible = compte connecté => mon profil
     - cible != compte connecté => profil visiteur public
     L'ancien design reste intact; seule la décision de route est centralisée. */
  window.HappyProfile={version:MASTER_VERSION,openMy:openMy,openVisitor:openVisitor,openFromPost:openFromPost,openViewer:openViewer,openFromUrl:openFromUrl,warm:warm,normalize:normalizeProfile,isOwnUid:isOwnUid,currentUser:currentUser,currentIds:currentIds,legacyOpenFromPost:legacyOpenFromPost,legacyOpenViewer:legacyOpenViewer,legacyOpenProfile:legacyOpenProfile};
  window.happyadOpenPublicProfileFromPostV417=function(p){return openFromPost(p,{source:'legacy-happyadOpenPublicProfileFromPostV417'});};
  window.openViewerProfile=function(p,uid){return openViewer(p,uid);};
  window.happyadOpenProfileMasterV15=openVisitor;
  window.happyadOpenMyProfileMasterV15=openMy;
  window.happyadOpenProfileFromUrlMasterV15=openFromUrl;

  try{if(window.HappyMasterRegistry)HappyMasterRegistry.register('profile',{file:'core/profile-master.js',responsibility:'mon profil vs profil visiteur, uid/public=1, cache profil actif, carte accueil -> bon profil',legacy:['happyadOpenPublicProfileFromPostV417','openProfile','openViewerProfile'],active:true,version:MASTER_VERSION});}catch(_e){}
})();
