(function(){
  'use strict';
  if(window.__HAPPYAD_MAIN_TABS_MASTER_V598__)return;
  window.__HAPPYAD_MAIN_TABS_MASTER_V598__=true;

  var VERSION='MAIN_TABS_LAZY_ON_DEMAND_V614';
  var lastAction='';
  var lastAt=0;
  var pendingMessageContext=null;
  var pendingMessageTimer=0;

  function clean(v){return String(v==null?'':v).trim();}
  function stop(ev){try{if(ev){ev.preventDefault();ev.stopPropagation();if(ev.stopImmediatePropagation)ev.stopImmediatePropagation();}}catch(_e){}}
  function isUuid(v){return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(clean(v));}
  function nav(){return window.HappyNavigation||null;}
  function button(name){try{return document.querySelector('.bottom [data-happyad-main-nav="'+name+'"]');}catch(_e){return null;}}
  function setPressed(name){
    try{
      document.querySelectorAll('.bottom .nav').forEach(function(el){el.classList.remove('happyadButtonPressedV602','happyadButtonPressedV603');});
      var el=button(name);if(!el)return;
      el.classList.add('happyadButtonPressedV603');
      clearTimeout(el.__happyadDockPressT);
      el.__happyadDockPressT=setTimeout(function(){try{el.classList.remove('happyadButtonPressedV602','happyadButtonPressedV603');}catch(_e){}},130);
    }catch(_e){}
  }
  function dedupe(name){var now=Date.now();if(lastAction===name&&now-lastAt<260)return true;lastAction=name;lastAt=now;return false;}
  function loggedIn(){
    try{return localStorage.getItem('HAPPYAD_SESSION_ACTIVE')==='1'&&!!clean(localStorage.getItem('HAPPYAD_AUTH_UID'));}catch(_e){return false;}
  }
  function unlockReconnect(){
    try{
      ['HAPPYAD_FORCE_LOGOUT','HAPPYAD_FORCE_LOGOUT_UNTIL','HAPPYAD_LOGOUT_LOCK_V1','HAPPYAD_LOGOUT_AT_V1'].forEach(function(k){localStorage.removeItem(k);});
      if(!clean(localStorage.getItem('HAPPYAD_AUTH_UID')))localStorage.setItem('HAPPYAD_SESSION_ACTIVE','0');
    }catch(_e){}
  }
  function normalizeTarget(raw){
    raw=raw&&typeof raw==='object'?raw:{};
    var id=clean(raw.id||raw.user_id||raw.uid||raw.uuid||raw.auth_user_id||raw.account_uid||raw.owner_id);
    if(!isUuid(id))return null;
    return {id:id,user_id:id,name:clean(raw.name||raw.full_name||raw.display_name||raw.username)||'Utilisateur HAPPYAD',avatar:clean(raw.avatar||raw.avatar_url||raw.profile_photo||raw.photo_url),badge:clean(raw.badge||raw.user_badge||raw.profile_badge),status:clean(raw.status||raw.handle||raw.username)};
  }
  function normalizeMessageContext(detail){
    detail=detail&&typeof detail==='object'?detail:{};
    var target=normalizeTarget(detail.target||detail.profile||detail.user);
    return {
      context_id:clean(detail.context_id)||('tabs-v594-'+Date.now()+'-'+Math.random().toString(36).slice(2,8)),
      source:clean(detail.source)||'main-tabs-v594',
      mode:target?'direct':'inbox',
      conversation_id:isUuid(detail.conversation_id||detail.conversationId)?clean(detail.conversation_id||detail.conversationId):'',
      message_id:clean(detail.message_id||detail.messageId),
      target:target
    };
  }
  function messageFrame(){return document.getElementById('happyadAppFrame_message');}
  function deliverMessageContext(){
    clearTimeout(pendingMessageTimer);
    var context=pendingMessageContext;
    if(!context)return false;
    try{
      var frame=messageFrame();
      if(frame&&frame.contentWindow){
        frame.contentWindow.postMessage({type:'HAPPYAD_MESSAGE_CONTEXT',detail:context},'*');
        return true;
      }
    }catch(_e){}
    pendingMessageTimer=setTimeout(deliverMessageContext,110);
    return false;
  }
  function activate(page,extra){
    var n=nav();extra=extra||{};
    try{
      if(n&&typeof n.activateMainTab==='function')return n.activateMainTab(page,extra);
      if(n&&typeof n.open==='function'){
        var urls={video:'modules/video.html',message:'modules/message-center.html?mode=inbox&source=main-tabs-v594',profile:'modules/user.html',publish:'modules/publish.html'};
        return n.open(urls[page]||'index.html',{page:page,source:extra.source||VERSION,force:true});
      }
    }catch(_e){}
    return false;
  }
  function openMessage(detail){
    detail=detail&&typeof detail==='object'?detail:{};
    var auth=window.HappyAuthSessionV596||window.HappyAuthSessionV595||null;
    if(auth&&typeof auth.isAuthenticated==='function'&&!auth.isAuthenticated()&&!detail.authResume){
      auth.require({action:'messages',resume:function(){openMessage(Object.assign({},detail,{authResume:true}));}});
      return false;
    }
    var context=normalizeMessageContext(detail);
    pendingMessageContext=context;
    activate('message',{source:context.source||'main-tabs-message-v595'});
    [0,60,160,360,720].forEach(function(delay){setTimeout(deliverMessageContext,delay);});
    return false;
  }
  function rememberHomeScroll(){
    try{sessionStorage.setItem('HAPPYAD_HOME_SCROLL_Y_V586',String(Math.max(0,Number(window.scrollY||document.documentElement.scrollTop||document.body.scrollTop||0))));}catch(_e){}
  }
  function restoreHomeSurface(){
    try{
      var root=document.getElementById('happyadAppShell');
      if(root){
        root.querySelectorAll('.happyadAppFrame').forEach(function(fr){
          try{fr.contentWindow&&fr.contentWindow.postMessage({type:'HAPPYAD_PAUSE_ALL_MEDIA',reason:'main-tabs-home-v594'},'*');}catch(_m){}
          fr.classList.remove('on');
        });
        root.classList.remove('on','happyadSkeletonOpen');root.setAttribute('aria-hidden','true');
      }
      var shield=document.getElementById('happyadAppTapShield');if(shield){shield.classList.remove('on');shield.setAttribute('aria-hidden','true');}
      document.body.classList.remove('happyadAppOpen','happyadPublishFullscreenV586','no-scroll','modal-open','story-open','fullscreen-open','happyad-story-fullscreen-lock','happyadShareOpen');
      document.documentElement.classList.remove('no-scroll','modal-open','story-open','fullscreen-open','happyad-story-fullscreen-lock','happyadShareOpen');
      document.body.classList.add('happyadMainDockVisible');
      ['overflow','overflow-y','touch-action','position','top','width'].forEach(function(prop){document.body.style.removeProperty(prop);document.documentElement.style.removeProperty(prop);});
      document.querySelectorAll('.bottom .nav').forEach(function(el){el.classList.remove('active');});
      var home=button('home');if(home)home.classList.add('active');
      var y=Number(sessionStorage.getItem('HAPPYAD_HOME_SCROLL_Y_V586')||0)||0;
      requestAnimationFrame(function(){requestAnimationFrame(function(){try{window.scrollTo(0,y);}catch(_s){}});});
    }catch(_e){}
  }
  function goHome(){
    var n=nav();
    try{if(n&&typeof n.releaseNavGate==='function')n.releaseNavGate('main-tabs-home-v594');}catch(_g){}
    try{if(n&&typeof n.close==='function')n.close('main-tabs-home-v594');}catch(_c){}
    restoreHomeSurface();
    return false;
  }
  function setPublishFullscreen(on){
    try{document.body.classList.toggle('happyadPublishFullscreenV586',!!on);if(on)document.body.classList.remove('happyadMainDockVisible');}catch(_e){}
  }
  function openMain(name,detail){
    name=clean(name).toLowerCase();
    var resumeDetail=detail&&typeof detail==='object'?detail:{};
    if(!name||(!resumeDetail.authResume&&dedupe(name)))return false;
    setPressed(name);
    var auth=window.HappyAuthSessionV596||window.HappyAuthSessionV595||null;
    if(name!=='video'&&auth&&typeof auth.isAuthenticated==='function'&&!auth.isAuthenticated()&&!resumeDetail.authResume){
      auth.require({
        action:'menu-'+name,
        mainNav:name,
        resume:function(){openMain(name,Object.assign({},resumeDetail,{authResume:true}));}
      });
      return false;
    }
    if(name==='home')return goHome();
    rememberHomeScroll();
    if(name==='video'){setPublishFullscreen(false);activate('video',{source:'main-tabs-video-v595'});return false;}
    if(name==='message'){setPublishFullscreen(false);return openMessage(Object.assign({mode:'inbox',source:'main-tabs-message-v595'},resumeDetail));}
    if(name==='profile'){
      setPublishFullscreen(false);
      activate('profile',{source:'main-tabs-profile-v595',url:'modules/user.html'});return false;
    }
    if(name==='publish'){setPublishFullscreen(true);activate('publish',{source:'main-tabs-publish-v595'});return false;}
    return false;
  }
  function onDockEvent(ev){
    var el=ev&&ev.target&&ev.target.closest&&ev.target.closest('.bottom [data-happyad-main-nav]');if(!el)return;
    stop(ev);return openMain(el.getAttribute('data-happyad-main-nav')||'');
  }
  document.addEventListener('pointerdown',onDockEvent,true);
  document.addEventListener('click',function(ev){if(ev&&ev.detail===0)onDockEvent(ev);},true);

  window.addEventListener('HAPPYAD_NEW_MESSAGE_SYSTEM_REQUEST',function(ev){try{openMessage(ev&&ev.detail||{});}catch(_e){}},true);
  window.addEventListener('message',function(ev){
    try{
      var data=ev&&ev.data;if(!data)return;
      if(data.type==='HAPPYAD_NEW_MESSAGE_SYSTEM_REQUEST')return openMessage(data.detail||{});
      if(data.type==='HAPPYAD_MESSAGE_CENTER_READY')return deliverMessageContext();
      if(data.type==='HAPPYAD_MESSAGE_CONTEXT_APPLIED'){
        var id=clean(data.detail&&data.detail.context_id);
        if(pendingMessageContext&&(!id||id===pendingMessageContext.context_id))pendingMessageContext=null;
      }
    }catch(_e){}
  },true);

  window.addEventListener('HAPPYAD_NAV_CHANGED_V586',function(ev){
    try{var page=clean(ev&&ev.detail&&ev.detail.page)||'home';setPublishFullscreen(page==='publish');}catch(_e){}
  },true);

  function preload(){
    try{window.__HAPPYAD_MAIN_TABS_PRELOAD_DISABLED_V614__=true;}catch(_e){}
    return false;
  }
  function initialDockState(){
    try{
      var st=history.state;var page=clean(st&&st.view)||'home';
      var visible=(page==='home'||page==='profile'||page==='profile_public'||page==='video'||page==='message');
      if(document.body)document.body.classList.toggle('happyadMainDockVisible',visible);
      preload();
    }catch(_e){if(document.body)document.body.classList.add('happyadMainDockVisible');preload();}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialDockState,{once:true});else initialDockState();

  window.HappyMainTabsV598={version:VERSION,open:openMain,openMessage:openMessage,deliverMessageContext:deliverMessageContext,preload:preload};
  window.HappyMainTabsV596=window.HappyMainTabsV598;
  window.HappyMainTabsV595=window.HappyMainTabsV598;
  window.HappyMainTabsV594=window.HappyMainTabsV598;
  window.HappyMainDockV586=window.HappyMainTabsV598;
  window.HappyMainDockV585=window.HappyMainTabsV598;
  try{if(window.HappyMasterRegistry)window.HappyMasterRegistry.register('main-bottom-nav',{file:'core/main-tabs-master-v598.js',responsibility:'onglets persistants, vidéo publique et notification invité au premier contact',active:true,version:VERSION});}catch(_e){}
})();
