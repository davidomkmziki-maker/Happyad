(function(){
  'use strict';
  if(window.__HAPPYAD_AUTH_SESSION_MASTER_V598__)return;
  window.__HAPPYAD_AUTH_SESSION_MASTER_V598__=true;

  var VERSION='AUTH_SESSION_MASTER_V752_AUTH_STORAGE_QUOTA_RECOVERY';
  var USER_KEY='HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL';
  var session=null;
  var ready=false;
  var refreshPromise=null;
  var pendingIntent=null;
  var overlay=null;
  var panelRoot=null;
  var busy=false;
  var lastGateTarget=null;
  var lastGateAt=0;
  var lastNoticeText='';
  var lastNoticeAt=0;
  var lastDirectMode='';
  var lastDirectAt=0;
  var authOpeningTimerV710=0;
  var authUnlockAtV710=0;

  function clean(v){return String(v==null?'':v).trim();}
  function happyadHttpOriginV701(value){
    try{
      var u=new URL(String(value||''),location.href);
      if(u.protocol!=='https:'&&u.protocol!=='http:')return '';
      if(!u.hostname||/\.supabase\.co$/i.test(u.hostname))return '';
      return u.origin.replace(/\/+$/,'');
    }catch(_e){return '';}
  }
  function happyadRecoveryAppOriginV701(){
    var candidates=[];
    try{if(window.top&&window.top!==window)candidates.push(window.top.location.origin);}catch(_e){}
    try{if(location.ancestorOrigins&&location.ancestorOrigins.length)candidates.push(location.ancestorOrigins[0]);}catch(_e){}
    try{if(document.referrer)candidates.push(new URL(document.referrer).origin);}catch(_e){}
    try{candidates.push(location.origin);}catch(_e){}
    try{candidates.push(localStorage.getItem('HAPPYAD_APP_ORIGIN_V701'));}catch(_e){}
    for(var i=0;i<candidates.length;i++){
      var origin=happyadHttpOriginV701(candidates[i]);
      if(!origin)continue;
      try{localStorage.setItem('HAPPYAD_APP_ORIGIN_V701',origin);}catch(_e){}
      return origin;
    }
    return '';
  }
  function happyadPasswordRecoveryRedirectV701(){
    var origin=happyadRecoveryAppOriginV701();
    return origin?origin+'/auth/reset/':'';
  }
  window.happyadPasswordRecoveryRedirectV701=happyadPasswordRecoveryRedirectV701;
  try{happyadRecoveryAppOriginV701();}catch(_e){}
  function isUuid(v){return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(clean(v));}
  function esc(v){return clean(v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function client(){
    try{
      if(window.happyadSupabase)return window.happyadSupabase;
      if(typeof window.happyadSb==='function')return window.happyadSb();
      if(window.supabase&&window.supabase.createClient){
        window.happyadSupabase=window.supabase.createClient(window.HAPPYAD_SUPABASE_URL,window.HAPPYAD_SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
        return window.happyadSupabase;
      }
    }catch(_e){}
    return null;
  }
  function actualUser(){return session&&session.user&&isUuid(session.user.id)?session.user:null;}
  function localHintId(){
    try{
      if(localStorage.getItem('HAPPYAD_FORCE_LOGOUT')==='1')return '';
      if(Number(localStorage.getItem('HAPPYAD_FORCE_LOGOUT_UNTIL')||0)>Date.now())return '';
      if(localStorage.getItem('HAPPYAD_SESSION_ACTIVE')!=='1')return '';
      var id=clean(localStorage.getItem('HAPPYAD_AUTH_UID'));
      return isUuid(id)?id:'';
    }catch(_e){return '';}
  }
  function isAuthenticated(){var u=actualUser();if(u&&u.id)return true;return !ready&&!!localHintId();}
  function sessionDetail(eventName){
    var u=actualUser();
    return {event:eventName||'',authenticated:!!u,user:u||null,user_id:u&&u.id||'',version:VERSION};
  }
  function forEachFrame(fn){
    try{document.querySelectorAll('#happyadAppShell iframe.happyadAppFrame').forEach(function(fr){try{if(fr.contentWindow)fn(fr.contentWindow,fr);}catch(_e){}});}catch(_e){}
  }
  function broadcast(eventName){
    var detail=sessionDetail(eventName);
    try{window.dispatchEvent(new CustomEvent('HAPPYAD_AUTH_STATE_V595',{detail:detail}));}catch(_e){}
    var type=detail.authenticated?'HAPPYAD_AUTH_SIGNED_IN_V595':'HAPPYAD_AUTH_SIGNED_OUT_V595';
    forEachFrame(function(w){try{w.postMessage({type:type,detail:detail},'*');}catch(_e){}});
    try{window.postMessage({type:type,detail:detail},'*');}catch(_e){}
  }
  function removeLogoutLocks(){
    try{
      ['HAPPYAD_FORCE_LOGOUT','HAPPYAD_FORCE_LOGOUT_UNTIL','HAPPYAD_LOGOUT_LOCK_V1','HAPPYAD_LOGOUT_AT_V1'].forEach(function(k){localStorage.removeItem(k);});
    }catch(_e){}
  }
  var PROFILE_STABLE_PREFIX_V741='HAPPYAD_PROFILE_IDENTITY_STABLE_V741:';
  function hasOwnV741(o,k){return !!(o&&Object.prototype.hasOwnProperty.call(o,k));}
  function firstV741(){for(var i=0;i<arguments.length;i++){var v=clean(arguments[i]);if(v)return v;}return '';}
  function readJsonV741(k){try{return JSON.parse(localStorage.getItem(k)||'null')||{};}catch(_e){return {};}}
  function poorNameV741(v){v=clean(v).toLowerCase();return !v||v==='utilisateur'||v==='utilisateur happyad'||v==='happyad'||v==='compte happyad'||v.indexOf('aucun compte')>-1||v.indexOf('chargement profil')>-1;}
  function poorHandleV741(v){v=clean(v).replace(/^@+/,'').toLowerCase();return !v||v==='happyad'||v==='utilisateur';}
  function readStableV741(uid){return uid?readJsonV741(PROFILE_STABLE_PREFIX_V741+uid):{};}
  function readCurrentV741(uid){
    var keys=['HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL','HAPPYAD_USER','HAPPYAD_CURRENT_USER','happyad_current_user'];
    var out={};
    keys.forEach(function(k){var x=readJsonV741(k);var xid=clean(x.id||x.user_id||x.uid);if(!uid||!xid||xid===uid)Object.keys(x||{}).forEach(function(n){if(out[n]==null||out[n]===''||out[n]===false)out[n]=x[n];});});
    return out;
  }
  function profileAvatarV741(p){p=p||{};return firstV741(p.avatar_url,p.avatarUrl,p.avatar,p.user_avatar,p.creator_avatar,p.author_avatar,p.profile_photo_url,p.profilePhotoUrl,p.profile_photo,p.profilePhoto,p.profile_picture_url,p.profilePictureUrl,p.profile_picture,p.profilePicture,p.photo_url,p.photoUrl,p.image_url,p.imageUrl,p.picture,p.profile_image_url,p.profileImageUrl,p.profile_avatar_url,p.profileAvatarUrl);}
  function profileBadgeV741(p){p=p||{};return firstV741(p.badge,p.user_badge,p.profile_badge,p.badge_type,p.certification,p.verified_badge);}
  function saveStableV741(u){
    try{
      var uid=clean(u&&u.id||u&&u.user_id);if(!uid)return;
      var old=readStableV741(uid), next=Object.assign({},old,u||{}, {id:uid,user_id:uid,updated_at_local:new Date().toISOString()});
      if(poorNameV741(next.name||next.full_name||next.display_name))delete next.name;
      if(!firstV741(next.avatar,next.avatar_url))delete next.avatar;
      localStorage.setItem(PROFILE_STABLE_PREFIX_V741+uid,JSON.stringify(next));
    }catch(_e){}
  }
  function saveWarmUser(user,profile){
    user=user||{};profile=profile||{};
    var meta=user.user_metadata||{};
    var uid=clean(user.id||profile.id);
    var current=readCurrentV741(uid), stable=readStableV741(uid);
    var email=firstV741(user.email,current.email,current.contact,stable.email,stable.contact);
    var base=(email?email.split('@')[0]:'happyad')||'happyad';
    var remoteName=firstV741(profile.full_name,profile.display_name,profile.name);
    var metaName=firstV741(meta.full_name,meta.name,meta.display_name);
    var keptName=firstV741(current.name,current.full_name,current.display_name,stable.name,stable.full_name,stable.display_name);
    var name=!poorNameV741(remoteName)?remoteName:(!poorNameV741(keptName)?keptName:(!poorNameV741(metaName)?metaName:base));
    if(poorNameV741(name))name='Utilisateur HAPPYAD';
    var remoteHandle=firstV741(profile.username,profile.handle).replace(/^@+/,'');
    var keptHandle=firstV741(current.handle,current.username,stable.handle,stable.username,meta.username,meta.handle,base).replace(/^@+/,'');
    var handle=(!poorHandleV741(remoteHandle)?remoteHandle:keptHandle).replace(/\s+/g,'').toLowerCase()||base;
    var remoteAvatar=profileAvatarV741(profile);
    var avatar=firstV741(remoteAvatar,meta.avatar_url,meta.picture,meta.avatar,profileAvatarV741(current),profileAvatarV741(stable));
    var remoteRole=clean(profile.role).toLowerCase(),keptRole=clean(firstV741(current.role,stable.role,meta.role)).toLowerCase();
    var role=(remoteRole&&!(remoteRole==='user'&&keptRole&&keptRole!=='user'))?remoteRole:(keptRole||remoteRole||'user');
    var remoteBadge=clean(profileBadgeV741(profile)).toLowerCase(),keptBadge=clean(firstV741(current.badge,stable.badge)).toLowerCase();
    var remoteBadgeUseful=remoteBadge&&remoteBadge!=='aucun'&&remoteBadge!=='none'&&remoteBadge!=='null'&&remoteBadge!=='undefined';
    var keptBadgeUseful=keptBadge&&keptBadge!=='aucun'&&keptBadge!=='none'&&keptBadge!=='null'&&keptBadge!=='undefined';
    var badge=remoteBadgeUseful?remoteBadge:(keptBadgeUseful?keptBadge:'aucun');
    var next=Object.assign({},stable,current,{
      id:uid,user_id:uid,name:name,full_name:name,display_name:name,handle:handle,username:handle,
      email:email,contact:email,avatar:avatar,avatar_url:avatar,
      bio:firstV741(profile.bio,current.bio,stable.bio),country:firstV741(profile.country,current.country,stable.country),
      type:firstV741(profile.type,current.type,stable.type,'personal'),role:role,badge:badge,
      posts:Number(profile.posts!=null?profile.posts:current.posts||stable.posts||0)||0,
      followers:Number(profile.followers!=null?profile.followers:current.followers||stable.followers||0)||0,
      following:Number(profile.following!=null?profile.following:current.following||stable.following||0)||0,
      likes:Number(profile.likes!=null?profile.likes:current.likes||stable.likes||0)||0,
      passwordSet:true,contactVerified:!!user.email_confirmed_at
    });
    try{
      ['HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL','HAPPYAD_USER','happyad_current_user','HAPPYAD_CURRENT_USER'].forEach(function(k){localStorage.setItem(k,JSON.stringify(next));});
      localStorage.setItem('HAPPYAD_AUTH_UID',next.id);
      localStorage.setItem('HAPPYAD_SESSION_ACTIVE','1');
      removeLogoutLocks();
      saveStableV741(next);
      window.dispatchEvent(new CustomEvent('HAPPYAD_PROFILE_IDENTITY_V741',{detail:{profile:next,source:'auth-session-v741'}}));
    }catch(_e){}
    return next;
  }
  async function fetchOrCreateProfile(user,seed){
    var c=client();if(!c||!c.from||!user||!isUuid(user.id))return null;
    var profile=null, confirmedMissing=false;
    try{
      var q=await c.from('profiles').select('*').eq('id',user.id).maybeSingle();
      if(q&&q.error){console.warn('HAPPYAD V741 profile read refused; local identity kept',q.error);return null;}
      if(q&&q.data)profile=q.data;else confirmedMissing=true;
    }catch(_e){console.warn('HAPPYAD V741 profile read failed; no automatic overwrite',_e);return null;}
    if(profile)return profile;
    if(!confirmedMissing)return null;
    seed=Object.assign({},readStableV741(user.id),readCurrentV741(user.id),seed||{});
    var meta=user.user_metadata||{};
    var email=clean(user.email||seed.email);
    var base=(email?email.split('@')[0]:'happyad')||'happyad';
    var payload={
      id:user.id,
      full_name:firstV741(seed.full_name,seed.name,meta.full_name,meta.name,base)||'Utilisateur HAPPYAD',
      username:firstV741(seed.username,seed.handle,meta.username,meta.handle,base).replace(/^@+/,'').replace(/\s+/g,'').toLowerCase()||('user_'+Date.now()),
      avatar_url:firstV741(seed.avatar_url,seed.avatar,meta.avatar_url,meta.picture),
      bio:firstV741(seed.bio,meta.bio),type:firstV741(seed.type,meta.type,'personal'),role:firstV741(seed.role,'user'),badge:firstV741(seed.badge,'aucun')
    };
    try{
      var ins=await c.from('profiles').insert(payload).select('*').maybeSingle();
      if(ins&&!ins.error&&ins.data)return ins.data;
      if(ins&&ins.error && /duplicate|unique|already exists|23505/i.test(String(ins.error.message||ins.error.code||''))){
        var again=await c.from('profiles').select('*').eq('id',user.id).maybeSingle();
        if(again&&!again.error&&again.data)return again.data;
      }
      if(ins&&ins.error)console.warn('HAPPYAD V741 profile create skipped',ins.error);
    }catch(_e){console.warn('HAPPYAD V741 profile create failed safely',_e);}
    return null;
  }
  function applySession(next,eventName,options){
    options=options||{};
    var oldId=actualUser()&&actualUser().id||'';
    session=next&&next.user&&isUuid(next.user.id)?next:null;
    ready=true;
    var user=actualUser();
    if(user){
      removeLogoutLocks();
      try{localStorage.setItem('HAPPYAD_SESSION_ACTIVE','1');localStorage.setItem('HAPPYAD_AUTH_UID',user.id);}catch(_e){}
      saveWarmUser(user,{});
      fetchOrCreateProfile(user,{}).then(function(p){saveWarmUser(user,p||{});broadcast('PROFILE_READY');}).catch(function(){});
    }else{
      try{localStorage.setItem('HAPPYAD_SESSION_ACTIVE','0');localStorage.removeItem('HAPPYAD_AUTH_UID');}catch(_e){}
    }
    var newId=user&&user.id||'';
    if(options.forceBroadcast||oldId!==newId||eventName)broadcast(eventName||'SESSION');
    return user;
  }
  async function refresh(force){
    if(refreshPromise&&!force)return refreshPromise;
    refreshPromise=(async function(){
      var c=client();
      if(!c||!c.auth){ready=true;applySession(null,'NO_CLIENT',{forceBroadcast:false});return null;}
      try{
        var result=await c.auth.getSession();
        var s=result&&result.data&&result.data.session||null;
        applySession(s,'SESSION_REFRESH',{forceBroadcast:!!force});
        return actualUser();
      }catch(_e){
        ready=true;
        applySession(null,'SESSION_ERROR',{forceBroadcast:false});
        return null;
      }finally{refreshPromise=null;}
    })();
    return refreshPromise;
  }
  function stop(ev){try{if(ev){ev.preventDefault();ev.stopPropagation();if(ev.stopImmediatePropagation)ev.stopImmediatePropagation();}}catch(_e){}
  }
  function toast(text){
    text=clean(text)||'Connecte-toi ou crée un compte';
    var now=Date.now();
    if(text===lastNoticeText&&now-lastNoticeAt<900)return;
    lastNoticeText=text;lastNoticeAt=now;
    try{if(typeof window.toast==='function'){window.toast(text);return;}}catch(_e){}
    try{
      var old=document.getElementById('happyadAuthToastV595');if(old)old.remove();
      var d=document.createElement('div');d.id='happyadAuthToastV595';d.textContent=text;
      d.style.cssText='position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:4000005;max-width:90vw;padding:11px 15px;border:1px solid rgba(255,255,255,.30);border-radius:999px;background:rgba(19,22,28,.96);color:#fff;font:850 13px system-ui,-apple-system,Segoe UI,sans-serif;text-align:center;box-shadow:0 16px 44px rgba(0,0,0,.55)';
      document.body.appendChild(d);setTimeout(function(){try{d.remove();}catch(_e){}},3500);
    }catch(_e){}
  }
  function authOpeningActiveV710(){return !!(overlay&&Date.now()<authUnlockAtV710);}
  function armAuthOpeningV710(delay){
    if(!overlay)return;
    clearTimeout(authOpeningTimerV710);
    authUnlockAtV710=Date.now()+Math.max(180,Number(delay)||280);
    overlay.classList.add('happyadAuthOpeningV710');
    authOpeningTimerV710=setTimeout(function(){
      authOpeningTimerV710=0;authUnlockAtV710=0;
      try{overlay&&overlay.classList.remove('happyadAuthOpeningV710');}catch(_e){}
    },Math.max(180,Number(delay)||280));
  }
  function blockAuthOpeningEventV710(ev){
    if(!authOpeningActiveV710())return;
    stop(ev);return false;
  }

  function ensureOverlay(){
    if(overlay&&overlay.isConnected)return overlay;
    var css=document.getElementById('happyadAuthGateCssV595');
    if(!css){
      css=document.createElement('style');css.id='happyadAuthGateCssV595';css.textContent='\
#happyadAuthGateV595{position:fixed;inset:0;z-index:4000000;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(0,0,0,.78);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#fff}\
#happyadAuthGateV595.on{display:flex}\
#happyadAuthGateV595.happyadAuthOpeningV710 .haAuthGatePanel,#happyadAuthGateV595.happyadAuthOpeningV710 .haAuthGatePanel *{pointer-events:none!important}\
#happyadAuthGateV595.on .haAuthGatePanel{animation:happyadAuthPanelInV710 .2s cubic-bezier(.2,.8,.2,1) both}\
@keyframes happyadAuthPanelInV710{from{opacity:0;transform:translateY(14px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}\
#happyadAuthGateV595 .haAuthGatePanel{position:relative;width:min(440px,100%);max-height:min(88dvh,760px);overflow:auto;border:1px solid rgba(255,255,255,.28);border-radius:26px;background:linear-gradient(180deg,#12151b,#080a0e);box-shadow:0 30px 90px rgba(0,0,0,.72);padding:22px}\
#happyadAuthGateV595 .haAuthGateClose{position:absolute;right:14px;top:14px;width:40px;height:40px;border:1px solid rgba(255,255,255,.55);border-radius:50%;background:rgba(255,255,255,.04);color:#fff;font-size:25px;display:grid;place-items:center}\
#happyadAuthGateV595 .haAuthGateClose:active,#happyadAuthGateV595 button:active{background:rgba(190,196,205,.16)!important;border-color:#fff!important;color:#fff!important;transform:scale(.97) translateY(1px)}\
#happyadAuthGateV595 .haAuthTitle{font-size:27px;font-weight:1000;letter-spacing:-.6px;padding-right:50px}\
#happyadAuthGateV595 .haAuthHint{color:#bbc1cc;font-size:14px;font-weight:700;line-height:1.35;margin:8px 0 18px}\
#happyadAuthGateV595 .haAuthChoices{display:grid;gap:10px}\
#happyadAuthGateV595 button{min-height:50px;border:1px solid rgba(255,255,255,.62);border-radius:16px;background:rgba(255,255,255,.035);color:#fff;font-size:16px;font-weight:950;padding:12px 15px;transition:transform .12s ease,background .12s ease,border-color .12s ease}\
#happyadAuthGateV595 button:disabled{opacity:1!important;color:#fff!important;border-color:#fff!important;background:rgba(190,196,205,.14)!important;cursor:wait!important}\
#happyadAuthGateV595 .haAuthBack{min-height:40px;width:auto;padding:8px 12px;margin-bottom:12px;font-size:13px}\
#happyadAuthGateV595 .haAuthField{width:100%;height:52px;margin:0 0 10px;border:1px solid rgba(255,255,255,.24);border-radius:15px;background:#080b10;color:#fff;padding:0 14px;font-size:16px;outline:none}\
#happyadAuthGateV595 .haAuthField:focus{border-color:#fff;box-shadow:0 0 0 2px rgba(255,255,255,.10)}\
#happyadAuthGateV595 .haAuthFoot{margin-top:12px;color:#aeb5c1;font-size:12px;line-height:1.4}\
#happyadAuthGateV595 .haAuthStatus{min-height:20px;margin:10px 0 0;color:#fff;font-size:13px;font-weight:800}\
body.happyadAuthGateOpenV595{overflow:hidden!important}\
body.happyadAuthGateOpenV595 #happyadMainDockV585{pointer-events:none!important}\
';document.head.appendChild(css);
    }
    overlay=document.createElement('div');overlay.id='happyadAuthGateV595';overlay.setAttribute('aria-hidden','true');
    overlay.innerHTML='<div class="haAuthGatePanel" role="dialog" aria-modal="true" aria-label="Connexion HAPPYAD"><button type="button" class="haAuthGateClose" aria-label="Fermer">×</button><div id="happyadAuthGateRootV595"></div></div>';
    document.body.appendChild(overlay);panelRoot=overlay.querySelector('#happyadAuthGateRootV595');
    overlay.querySelector('.haAuthGateClose').addEventListener('click',function(e){stop(e);closeOverlay(false);},true);
    overlay.addEventListener('click',function(e){if(e.target===overlay){stop(e);closeOverlay(false);}},true);
    ['pointerdown','pointerup','click','touchstart','touchend','contextmenu'].forEach(function(type){overlay.addEventListener(type,blockAuthOpeningEventV710,true);});
    return overlay;
  }
  function setStatus(text){try{var s=document.getElementById('happyadAuthStatusV595');if(s)s.textContent=text||'';}catch(_e){}}
  function value(id){var el=document.getElementById(id);return clean(el&&el.value);}
  function setSubmitBusy(id,on,busyText,idleText){
    try{
      var el=document.getElementById(id);if(!el)return;
      if(on){
        if(!el.dataset.happyadIdleLabel)el.dataset.happyadIdleLabel=idleText||clean(el.textContent)||'Se connecter';
        el.textContent=busyText||'Connexion…';
        el.disabled=true;
        el.setAttribute('aria-busy','true');
      }else{
        el.textContent=el.dataset.happyadIdleLabel||idleText||'Se connecter';
        el.disabled=false;
        el.removeAttribute('aria-busy');
      }
    }catch(_e){}
  }
  function renderChoice(){
    ensureOverlay();
    panelRoot.innerHTML='<div class="haAuthTitle">Compte HAPPYAD</div><div class="haAuthHint">Connecte-toi ou crée un compte pour utiliser cette action.</div><div class="haAuthChoices"><button type="button" id="happyadAuthLoginChoiceV595">Se connecter</button><button type="button" id="happyadAuthCreateChoiceV595">Créer un compte</button></div><div class="haAuthFoot">Les vidéos et les photos de l’accueil restent consultables sans compte.</div>';
    document.getElementById('happyadAuthLoginChoiceV595').onclick=renderLogin;
    document.getElementById('happyadAuthCreateChoiceV595').onclick=renderSignup;
  }
  function renderLogin(prefill){
    ensureOverlay();
    prefill=clean(prefill||'');
    panelRoot.innerHTML='<button type="button" class="haAuthBack" id="happyadAuthBackV595">Retour</button><div class="haAuthTitle">Se connecter</div><div class="haAuthHint">Entre ton Gmail et ton mot de passe.</div><input class="haAuthField" id="happyadAuthEmailV595" type="email" autocomplete="email" placeholder="Gmail" value="'+esc(prefill)+'"><input class="haAuthField" id="happyadAuthPassV595" type="password" autocomplete="current-password" placeholder="Mot de passe"><div class="haAuthChoices"><button type="button" id="happyadAuthLoginSubmitV595">Se connecter</button><button type="button" id="happyadAuthForgotV595">Mot de passe oublié</button></div><div class="haAuthStatus" id="happyadAuthStatusV595"></div>';
    document.getElementById('happyadAuthBackV595').onclick=renderChoice;
    document.getElementById('happyadAuthLoginSubmitV595').onclick=doLogin;
    document.getElementById('happyadAuthForgotV595').onclick=function(e){stop(e);renderForgot(value('happyadAuthEmailV595'));};
    var pass=document.getElementById('happyadAuthPassV595');
    if(pass)pass.addEventListener('keydown',function(e){if(e.key==='Enter')doLogin(e);});
  }
  function renderForgot(prefill){
    ensureOverlay();
    prefill=clean(prefill||'');
    panelRoot.innerHTML='<button type="button" class="haAuthBack" id="happyadAuthForgotBackV597">Retour</button><div class="haAuthTitle">Récupérer le compte</div><div class="haAuthHint">Entre ton Gmail. HAPPYAD t’enverra un lien sécurisé pour créer un nouveau mot de passe.</div><input class="haAuthField" id="happyadAuthForgotEmailV597" type="email" autocomplete="email" inputmode="email" placeholder="Gmail" value="'+esc(prefill)+'"><div class="haAuthChoices"><button type="button" id="happyadAuthForgotSubmitV597">Envoyer le lien</button></div><div class="haAuthStatus" id="happyadAuthStatusV595"></div><div class="haAuthFoot">Après réception, ouvre le lien puis choisis ton nouveau mot de passe.</div>';
    document.getElementById('happyadAuthForgotBackV597').onclick=function(e){stop(e);renderLogin(value('happyadAuthForgotEmailV597'));};
    document.getElementById('happyadAuthForgotSubmitV597').onclick=doForgot;
    var email=document.getElementById('happyadAuthForgotEmailV597');
    if(email){email.focus();email.addEventListener('keydown',function(e){if(e.key==='Enter')doForgot(e);});}
  }
  function renderSignup(){
    ensureOverlay();
    var d=new Date();d.setFullYear(d.getFullYear()-18);var max=d.toISOString().slice(0,10);
    panelRoot.innerHTML='<button type="button" class="haAuthBack" id="happyadAuthBackV595">Retour</button><div class="haAuthTitle">Créer un compte</div><div class="haAuthHint">Remplis les informations demandées.</div><input class="haAuthField" id="happyadAuthNameV595" placeholder="Nom"><input class="haAuthField" id="happyadAuthHandleV595" placeholder="Nom d’utilisateur"><input class="haAuthField" id="happyadAuthBirthV595" type="date" max="'+esc(max)+'" aria-label="Date de naissance"><input class="haAuthField" id="happyadAuthSignupEmailV595" type="email" autocomplete="email" placeholder="Gmail"><input class="haAuthField" id="happyadAuthSignupPassV595" type="password" autocomplete="new-password" placeholder="Mot de passe"><input class="haAuthField" id="happyadAuthSignupPass2V595" type="password" autocomplete="new-password" placeholder="Confirmer le mot de passe"><div class="haAuthChoices"><button type="button" id="happyadAuthSignupSubmitV595">Créer mon compte</button></div><div class="haAuthStatus" id="happyadAuthStatusV595"></div>';
    document.getElementById('happyadAuthBackV595').onclick=renderChoice;
    document.getElementById('happyadAuthSignupSubmitV595').onclick=doSignup;
  }
  async function finishSignedIn(user,seed){
    var c=client();var s=null;
    try{var gs=await c.auth.getSession();s=gs&&gs.data&&gs.data.session||null;}catch(_e){}
    if(!s&&user)s={user:user};
    applySession(s,'SIGNED_IN',{forceBroadcast:true});
    var p=await fetchOrCreateProfile(user,seed||{}).catch(function(){return null;});
    saveWarmUser(user,p||seed||{});
    broadcast('SIGNED_IN_READY');
    closeOverlay(true);
  }
  async function signInWithQuotaRecoveryV752(c,email,pass){
    try{return await c.auth.signInWithPassword({email:email,password:pass});}
    catch(err){
      var q=window.HappyadAuthStorageV752;
      if(!q||!q.isQuota||!q.isQuota(err))throw err;
      try{await q.recover('login-retry');}catch(_e){}
      return await c.auth.signInWithPassword({email:email,password:pass});
    }
  }
  async function doLogin(e){
    stop(e);if(busy)return;var email=value('happyadAuthEmailV595'),pass=value('happyadAuthPassV595');
    if(!email||!pass){setStatus('Entre Gmail et mot de passe.');return;}
    var c=client();if(!c||!c.auth){setStatus('Connexion non prête.');return;}
    busy=true;setStatus('');setSubmitBusy('happyadAuthLoginSubmitV595',true,'Connexion…','Se connecter');
    try{
      var r=await signInWithQuotaRecoveryV752(c,email,pass);if(r&&r.error)throw r.error;
      var user=r&&r.data&&r.data.user;if(!user)throw new Error('Session introuvable.');
      await finishSignedIn(user,{email:email});toast('Connecté ✅');
    }catch(err){var q=window.HappyadAuthStorageV752;if(q&&q.isQuota&&q.isQuota(err))setStatus('Espace temporaire saturé. HAPPYAD a libéré le cache de chargement. Appuie encore une fois sur Se connecter.');else setStatus('Connexion impossible : '+clean(err&&err.message||err));}
    finally{busy=false;setSubmitBusy('happyadAuthLoginSubmitV595',false,'Connexion…','Se connecter');}
  }
  async function doForgot(e){
    stop(e);if(busy)return;
    var email=value('happyadAuthForgotEmailV597');
    if(!email){setStatus('Entre ton Gmail.');return;}
    var c=client();if(!c||!c.auth){setStatus('Connexion non prête.');return;}
    busy=true;setStatus('');setSubmitBusy('happyadAuthForgotSubmitV597',true,'Envoi…','Envoyer le lien');
    try{
      var redirect=happyadPasswordRecoveryRedirectV701();
      if(!redirect)throw new Error('Adresse actuelle de HAPPYAD introuvable. Ouvre le site en ligne puis réessaie.');
      var r=await c.auth.resetPasswordForEmail(email,{redirectTo:redirect});if(r&&r.error)throw r.error;
      setStatus('Lien envoyé. Vérifie ton Gmail.');
    }catch(err){setStatus('Envoi impossible : '+clean(err&&err.message||err));}
    finally{busy=false;setSubmitBusy('happyadAuthForgotSubmitV597',false,'Envoi…','Envoyer le lien');}
  }
  function ageFromBirth(value){var b=new Date(value+'T00:00:00');if(isNaN(b.getTime()))return -1;var n=new Date();var a=n.getFullYear()-b.getFullYear();var m=n.getMonth()-b.getMonth();if(m<0||(m===0&&n.getDate()<b.getDate()))a--;return a;}
  async function doSignup(e){
    stop(e);if(busy)return;
    var name=value('happyadAuthNameV595'),handle=value('happyadAuthHandleV595').replace(/^@+/,'').replace(/\s+/g,'').toLowerCase();
    var birth=value('happyadAuthBirthV595'),email=value('happyadAuthSignupEmailV595'),pass=value('happyadAuthSignupPassV595'),pass2=value('happyadAuthSignupPass2V595');
    if(!name||!handle||!birth||!email||!pass){setStatus('Remplis tous les champs.');return;}
    if(ageFromBirth(birth)<18){setStatus('Inscription autorisée à partir de 18 ans.');return;}
    if(pass.length<6){setStatus('Utilise au moins 6 caractères pour le mot de passe.');return;}
    if(pass!==pass2){setStatus('Les mots de passe ne sont pas identiques.');return;}
    var c=client();if(!c||!c.auth){setStatus('Connexion non prête.');return;}
    busy=true;setStatus('Création du compte…');
    try{
      var r=await c.auth.signUp({email:email,password:pass,options:{data:{full_name:name,username:handle,birth_date:birth}}});if(r&&r.error)throw r.error;
      var user=r&&r.data&&r.data.user;if(!user)throw new Error('Compte non créé.');
      if(r.data&&r.data.session){await finishSignedIn(user,{name:name,full_name:name,username:handle,handle:handle,email:email});toast('Compte créé ✅');}
      else{setStatus('Compte créé. Confirme ton Gmail puis connecte-toi.');}
    }catch(err){setStatus('Création impossible : '+clean(err&&err.message||err));}
    finally{busy=false;}
  }
  function resumePending(){
    var intent=pendingIntent;pendingIntent=null;if(!intent)return;
    setTimeout(function(){
      try{
        if(typeof intent.resume==='function'){intent.resume();return;}
        if(intent.sourceWindow&&intent.sourceWindow.postMessage){intent.sourceWindow.postMessage({type:'HAPPYAD_AUTH_RESUME_LAST_ACTION_V595',detail:{action:intent.action||''}},'*');return;}
        if(intent.mainNav&&window.HappyMainTabsV595){window.HappyMainTabsV595.open(intent.mainNav,{authResume:true});}
      }catch(_e){}
    },90);
  }
  function closeOverlay(authSuccess){
    if(!overlay)return;
    clearTimeout(authOpeningTimerV710);authOpeningTimerV710=0;authUnlockAtV710=0;
    overlay.classList.remove('on','happyadAuthOpeningV710');overlay.setAttribute('aria-hidden','true');
    document.body.classList.remove('happyadAuthGateOpenV595');
    if(authSuccess)resumePending();
  }
  function showOverlay(intent,mode){
    pendingIntent=intent||null;ensureOverlay();
    mode=clean(mode).toLowerCase();
    if(mode==='login')renderLogin();
    else if(mode==='signup'||mode==='register'||mode==='inscription')renderSignup();
    else renderChoice();
    armAuthOpeningV710(300);
    overlay.classList.add('on');overlay.setAttribute('aria-hidden','false');document.body.classList.add('happyadAuthGateOpenV595');
  }
  function guestNotice(){toast('Connecte-toi ou crée un compte');return false;}
  async function requireAuth(intent){
    if(isAuthenticated())return true;
    /* V598 : toutes les actions invité affichent seulement une notification. */
    guestNotice();
    return false;
  }
  function open(intent){return requireAuth(intent||{});}
  function openLogin(intent){
    if(isAuthenticated())return true;
    showOverlay(intent||{},'login');return false;
  }
  function openSignup(intent){
    if(isAuthenticated())return true;
    showOverlay(intent||{},'signup');return false;
  }
  function openChoice(intent){
    if(isAuthenticated())return true;
    showOverlay(intent||{},'choice');return false;
  }
  function clearPrivateAuthStorage(){
    try{
      var remove=[];
      for(var i=0;i<localStorage.length;i++){
        var k=localStorage.key(i);if(!k)continue;var low=k.toLowerCase();
        if(low.indexOf('supabase')>-1||low.indexOf('sb-')===0||low.indexOf('auth-token')>-1||low.indexOf('gotrue')>-1||k.indexOf('HAPPYAD_AUTH')===0||k==='HAPPYAD_SESSION_ACTIVE'||k===USER_KEY||k==='HAPPYAD_USER'||k==='HAPPYAD_CURRENT_USER'||k==='happyad_current_user'||k==='HAPPYAD_ACTIVE_PROFILE'||k==='HAPPYAD_PUBLIC_PROFILE_ACTIVE_UID'||k==='HAPPYAD_ACTIVE_PROFILE_UID')remove.push(k);
      }
      remove.forEach(function(k){try{localStorage.removeItem(k);}catch(_e){}});
      localStorage.setItem('HAPPYAD_SESSION_ACTIVE','0');
      localStorage.setItem('HAPPYAD_FORCE_LOGOUT','1');
      localStorage.setItem('HAPPYAD_FORCE_LOGOUT_UNTIL',String(Date.now()+1500));
    }catch(_e){}
    try{
      ['HAPPYAD_RECONNECT_OPEN_AUTH_V35','HAPPYAD_PROFILE_MASTER_ACTIVE_UID','HAPPYAD_PROFILE_MASTER_ACTIVE_URL'].forEach(function(k){sessionStorage.removeItem(k);});
    }catch(_e){}
  }
  async function logout(options){
    options=options||{};if(busy)return false;busy=true;
    try{
      var pushMaster=window.HappyPushMaster;
      if(pushMaster&&typeof pushMaster.deactivateCurrent==='function'){
        await Promise.race([
          Promise.resolve(pushMaster.deactivateCurrent()),
          new Promise(function(resolve){setTimeout(function(){resolve(false);},2500);})
        ]);
      }
    }catch(_pushError){}
    try{
      var c=client();if(c&&c.auth&&c.auth.signOut)await c.auth.signOut({scope:'local'});
    }catch(_e){}
    clearPrivateAuthStorage();session=null;ready=true;broadcast('SIGNED_OUT');
    closeOverlay(false);
    try{
      var nav=window.HappyNavigation;
      if(nav&&typeof nav.postToFrame==='function')nav.postToFrame('profile',{type:'HAPPYAD_AUTH_SIGNED_OUT_V595',detail:sessionDetail('SIGNED_OUT')});
      if(nav&&typeof nav.close==='function')nav.close('auth-logout-v595');
    }catch(_e){}
    toast('Déconnecté ✅');busy=false;return true;
  }
  function isAuthOverlayTarget(target){return !!(target&&target.closest&&target.closest('#happyadAuthGateV595'));}
  function isPwaInstallTarget(target){return !!(target&&target.closest&&target.closest('#happyadInstallAppBtn,#happyadPwaGuide'));}
  function isHomePhotoViewerControl(target){
    if(!target||!target.closest)return false;
    return !!target.closest('#happyadHomePhotoFullscreen .haHomeFsBackV591,#happyadHomePhotoFullscreen .haHomeFsClose,#happyadHomePhotoFullscreen .haHomeFsSeeMore,#happyadHomePhotoFullscreen .haHomeFsPrev,#happyadHomePhotoFullscreen .haHomeFsNext');
  }
  function isAllowedVideoOpen(target){
    if(!target||!target.closest)return false;
    if(target.closest('[data-happyad-main-nav="video"]'))return true;
    var card=target.closest('.miniCard.videoCard,[data-happyad-open-video],[data-open-video]');
    if(!card)return false;
    if(target.closest('[data-card-act],.miniActions,.miniTop,.creator,.avatar,.miniSeeMore,a,button:not(.play)'))return false;
    return !!target.closest('.miniMedia,.play,.miniCardFrame')||target===card;
  }
  function isAllowedHomePhotoOpen(target){
    if(!target||!target.closest)return false;
    var card=target.closest('#list .miniCard:not(.videoCard),.hScroller .miniCard:not(.videoCard)');
    if(!card)return false;
    if(target.closest('[data-card-act],.miniActions,.miniTop,.creator,.avatar,.miniSeeMore,a,button'))return false;
    return !!target.closest('.miniMedia,.happyadAlbumSlide,.haAlbumFullSlide,img');
  }
  function actionable(target){
    if(!target||!target.closest)return null;
    return target.closest('button,a[href],[role="button"],input[type="button"],input[type="submit"],select,textarea,[data-card-act],[data-act],[data-profile-act],.creatorPill,.miniTop,.radarItem,.mapLite,.seeMore');
  }
  function gateParentClick(e){
    var target=e&&e.target;if(!target||isAuthOverlayTarget(target)||isPwaInstallTarget(target)||isAuthenticated())return;
    var direct=target.closest&&target.closest('[data-happyad-auth-direct-v598]');
    if(direct){
      stop(e);
      var mode=clean(direct.getAttribute('data-happyad-auth-direct-v598')).toLowerCase();
      var nowDirect=Date.now();
      if(mode===lastDirectMode&&nowDirect-lastDirectAt<420)return false;
      lastDirectMode=mode;lastDirectAt=nowDirect;
      if(mode==='signup'||mode==='inscription'||mode==='register')openSignup({action:'inscription-radar'});
      else openLogin({action:'connexion-radar'});
      return false;
    }
    if(isHomePhotoViewerControl(target)||isAllowedVideoOpen(target)||isAllowedHomePhotoOpen(target))return;
    var act=actionable(target);if(!act)return;
    var now=Date.now();if(lastGateTarget===act&&now-lastGateAt<420){stop(e);return false;}lastGateTarget=act;lastGateAt=now;
    stop(e);
    guestNotice();
    return false;
  }
  function holdParentPointerDownV710(e){
    var target=e&&e.target;if(!target||isAuthOverlayTarget(target)||isPwaInstallTarget(target)||isAuthenticated())return;
    var direct=target.closest&&target.closest('[data-happyad-auth-direct-v598]');
    if(!direct&&isHomePhotoViewerControl(target))return;
    if(!direct&&isAllowedVideoOpen(target))return;
    if(!direct&&isAllowedHomePhotoOpen(target))return;
    var act=direct||actionable(target);if(!act)return;
    /* Ne pas ouvrir le popup au pointerdown : le clic final pourrait tomber sur
       un bouton qui vient juste d'apparaître. On bloque seulement la propagation. */
    try{e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();}catch(_e){}
  }
  document.addEventListener('pointerdown',holdParentPointerDownV710,true);
  document.addEventListener('click',gateParentClick,true);

  window.addEventListener('message',function(ev){
    try{
      var d=ev&&ev.data;if(!d)return;
      if(d.type==='HAPPYAD_AUTH_OPEN_REQUEST_V597'||d.type==='HAPPYAD_AUTH_OPEN_REQUEST_V596'||d.type==='HAPPYAD_AUTH_OPEN_REQUEST_V595'){
        requireAuth({action:clean(d.detail&&d.detail.action)||'action',sourceWindow:ev.source||null});
      }else if(d.type==='HAPPYAD_AUTH_LOGOUT_REQUEST_V597'||d.type==='HAPPYAD_AUTH_LOGOUT_REQUEST_V596'||d.type==='HAPPYAD_AUTH_LOGOUT_REQUEST_V595'){
        logout({source:'frame'});
      }else if(d.type==='HAPPYAD_AUTH_FRAME_READY_V597'||d.type==='HAPPYAD_AUTH_FRAME_READY_V596'||d.type==='HAPPYAD_AUTH_FRAME_READY_V595'){
        var detail=sessionDetail('FRAME_READY');
        try{ev.source&&ev.source.postMessage({type:detail.authenticated?'HAPPYAD_AUTH_SIGNED_IN_V595':'HAPPYAD_AUTH_SIGNED_OUT_V595',detail:detail},'*');}catch(_e){}
      }
    }catch(_e){}
  },true);

  function bindAuthState(){
    var c=client();if(!c||!c.auth||typeof c.auth.onAuthStateChange!=='function')return;
    try{c.auth.onAuthStateChange(function(event,nextSession){applySession(nextSession,event||'AUTH_CHANGE',{forceBroadcast:true});});}catch(_e){}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){ensureOverlay();refresh(false);bindAuthState();},{once:true});
  else{ensureOverlay();refresh(false);bindAuthState();}

  window.HappyAuthSessionV598={version:VERSION,isReady:function(){return ready;},isAuthenticated:isAuthenticated,user:actualUser,refresh:refresh,require:requireAuth,open:open,openLogin:openLogin,openSignup:openSignup,openChoice:openChoice,notice:guestNotice,close:closeOverlay,logout:logout,broadcast:broadcast};
  window.HappyAuthSessionV597=window.HappyAuthSessionV598;
  window.HappyAuthSessionV596=window.HappyAuthSessionV598;
  window.HappyAuthSessionV595=window.HappyAuthSessionV598;
  try{if(window.HappyMasterRegistry)window.HappyMasterRegistry.register('auth-session',{file:'core/auth-session-master-v598.js',responsibility:'session centrale, notification invité simple et popup réservé au Radar',active:true,version:VERSION});}catch(_e){}
})();
