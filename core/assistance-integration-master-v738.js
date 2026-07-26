(function(){
  'use strict';
  if(window.__HAPPYAD_ASSISTANCE_INTEGRATION_MASTER_V751__)return;
  window.__HAPPYAD_ASSISTANCE_INTEGRATION_MASTER_V751__=true;

  var VERSION='HAPPYAD_ASSISTANCE_INTEGRATION_V751_X_SHIELD_OPEN_ATOMIC_AGENT_NEUTRAL';
  var HOST_ID='happyadAssistanceHostV738';
  var FRAME_ID='happyadAssistanceFrameV738';
  var PARENT_CLOSE_ID='happyadAssistanceParentCloseV751';
  var FRAME_URL='modules/assistance.html?v=751-x-shield-open-atomic-agent-neutral';
  var CONTEXT_KEY='happyad_support_user_context_v27';
  var host=null,frame=null,parentClose=null;
  var openState=false,ready=false,documentLoaded=false;
  var lastContext=null,lastFocus=null,prewarmStarted=false,prewarmTimer=0;
  var closeLock=false,readyPollTimer=0,readyPollStartedAt=0,lastClosePointerAt=0;
  var closeTimer=0,openRevealTimer=0,hostRevealed=false;

  function clean(v){return String(v==null?'':v).trim()}
  function localUser(){try{return Object.assign({},JSON.parse(localStorage.getItem('HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL')||'{}')||{})}catch(_e){return {}}}
  function currentContext(detail){
    detail=detail&&typeof detail==='object'?detail:{};
    var user=localUser();
    var id=clean(detail.uid||user.id||user.user_id||localStorage.getItem('HAPPYAD_AUTH_UID'));
    var settings={};
    try{settings=JSON.parse(localStorage.getItem('HAPPYAD_PROFILE_SETTINGS_V712_'+(id||'local'))||'{}')||{}}catch(_e){}
    return {
      source:clean(detail.source)||'happyad',
      uid:id,
      language:clean(detail.language||settings.language||user.language||navigator.language||'fr'),
      country:clean(detail.country||user.country||user.location),
      user:{
        id:id,
        name:clean(user.name||user.full_name||user.display_name),
        username:clean(user.username||user.handle).replace(/^@+/,''),
        avatar:clean(user.avatar||user.avatar_url)
      },
      returnTarget:clean(detail.returnTarget),
      openedAt:Date.now()
    };
  }
  function saveContext(context){
    lastContext=context;
    try{localStorage.setItem(CONTEXT_KEY,JSON.stringify(context))}catch(_e){}
  }
  function sendContext(){
    if(!frame||!frame.contentWindow||!lastContext)return false;
    try{frame.contentWindow.postMessage({type:'HAPPYAD_ASSISTANCE_CONTEXT',detail:lastContext},location.origin);return true}catch(_e){return false}
  }
  function consumeCloseEvent(event){
    try{event&&event.preventDefault&&event.preventDefault()}catch(_e){}
    try{event&&event.stopPropagation&&event.stopPropagation()}catch(_e){}
    try{event&&event.stopImmediatePropagation&&event.stopImmediatePropagation()}catch(_e){}
  }
  function queueClose(reason,event){
    consumeCloseEvent(event);
    if(!openState||closeLock||closeTimer)return false;
    var now=Date.now();
    if(now-lastClosePointerAt<180)return true;
    lastClosePointerAt=now;
    if(host)host.classList.add('closing');
    /* Le maître reste au-dessus de la page précédente jusqu’à la fin complète
       du geste Android. Cela absorbe le click synthétique et interdit tout
       transfert vers Paramètres, Messages ou Profil derrière la frame. */
    closeTimer=setTimeout(function(){closeTimer=0;finalizeClose(reason||'x-shield')},96);
    return true;
  }
  function bindParentClose(){
    if(!parentClose||parentClose.__happyadCloseV751Bound)return;
    parentClose.__happyadCloseV751Bound=true;
    parentClose.style.touchAction='none';
    var arm=function(event){
      consumeCloseEvent(event);
      try{event&&event.pointerId!=null&&parentClose.setPointerCapture&&parentClose.setPointerCapture(event.pointerId)}catch(_e){}
    };
    parentClose.addEventListener('pointerdown',arm,{capture:true,passive:false});
    parentClose.addEventListener('pointerup',function(event){queueClose('parent-x',event)},{capture:true,passive:false});
    parentClose.addEventListener('pointercancel',consumeCloseEvent,{capture:true,passive:false});
    parentClose.addEventListener('touchstart',arm,{capture:true,passive:false});
    parentClose.addEventListener('touchend',function(event){queueClose('parent-x-touch',event)},{capture:true,passive:false});
    parentClose.addEventListener('click',function(event){queueClose('parent-x-click',event)},{capture:true,passive:false});
  }
  function frameIsActuallyReady(){
    if(!frame||!documentLoaded)return false;
    try{
      var win=frame.contentWindow;
      var doc=frame.contentDocument;
      return !!(
        win&&win.HappyadAssistance&&
        doc&&doc.documentElement&&doc.documentElement.classList.contains('happyad-ready')&&
        doc.getElementById('chat')&&
        doc.getElementById('composer')
      );
    }catch(_e){return false}
  }
  function stopReadyPoll(){
    if(readyPollTimer){clearTimeout(readyPollTimer);readyPollTimer=0}
  }
  function pollFrameReady(){
    stopReadyPoll();
    if(ready)return;
    if(frameIsActuallyReady()){markReady('verified-module-ready');return}
    if(!readyPollStartedAt)readyPollStartedAt=Date.now();
    if(Date.now()-readyPollStartedAt>5000)return;
    readyPollTimer=setTimeout(pollFrameReady,60);
  }
  function ensureHost(){
    if(host&&frame)return host;
    host=document.getElementById(HOST_ID);
    if(!host){
      host=document.createElement('section');
      host.id=HOST_ID;
      host.className='happyadAssistanceHostV738';
      host.setAttribute('aria-hidden','true');
      host.setAttribute('inert','');
      host.innerHTML='<div class="happyadAssistanceLoadingV738" aria-live="polite"><i></i><span>Ouverture de l’assistance…</span></div><iframe id="'+FRAME_ID+'" class="happyadAssistanceFrameV738" title="Assistance HAPPYAD" loading="eager" referrerpolicy="same-origin" allow="clipboard-read; clipboard-write" aria-label="Assistance HAPPYAD"></iframe><button id="'+PARENT_CLOSE_ID+'" class="happyadAssistanceParentCloseV751" type="button" tabindex="-1" aria-label="Fermer l’assistance"></button>';
      document.body.appendChild(host);
    }
    frame=document.getElementById(FRAME_ID);
    parentClose=document.getElementById(PARENT_CLOSE_ID);
    bindParentClose();
    if(frame&&!frame.__happyadAssistanceV751Bound){
      frame.__happyadAssistanceV751Bound=true;
      frame.addEventListener('load',function(){
        documentLoaded=true;
        readyPollStartedAt=Date.now();
        sendContext();
        pollFrameReady();
      });
    }
    return host;
  }
  function clearOpenRevealTimer(){
    if(openRevealTimer){clearTimeout(openRevealTimer);openRevealTimer=0}
  }
  function revealHost(){
    if(!host||!openState)return false;
    hostRevealed=true;
    host.classList.add('show');
    host.setAttribute('aria-hidden','false');
    host.removeAttribute('inert');
    document.documentElement.classList.add('happyadAssistanceOpenV738');
    document.body.classList.add('happyadAssistanceOpenV738');
    if(ready)host.classList.add('ready');
    return true;
  }
  function markReady(){
    if(ready)return;
    ready=true;
    stopReadyPoll();
    clearOpenRevealTimer();
    if(host)host.classList.add('ready');
    sendContext();
    if(openState){
      revealHost();
      requestAnimationFrame(function(){try{frame&&frame.focus()}catch(_e){}});
    }
  }
  function prepareFrame(reason){
    ensureHost();
    if(prewarmStarted||!frame)return false;
    prewarmStarted=true;
    readyPollStartedAt=0;
    frame.setAttribute('src',FRAME_URL);
    try{window.dispatchEvent(new CustomEvent('HAPPYAD_ASSISTANCE_PREPARED_V751',{detail:{reason:reason||'prepare',at:Date.now()}}))}catch(_e){}
    return true;
  }
  function slowConnection(){
    try{
      var c=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
      return !!(c&&(c.saveData||/^(slow-2g|2g)$/i.test(clean(c.effectiveType))));
    }catch(_e){return false}
  }
  function schedulePrewarm(reason,delay){
    if(prewarmStarted||prewarmTimer)return;
    var run=function(){prewarmTimer=0;if(!prewarmStarted)prepareFrame(reason||'safe-prewarm')};
    delay=Math.max(0,Number(delay||0));
    if('requestIdleCallback'in window&&delay>=500){
      prewarmTimer=window.requestIdleCallback(run,{timeout:Math.max(1600,delay+700)});
    }else{
      prewarmTimer=setTimeout(run,delay);
    }
  }
  function registerInternal(){
    try{
      var master=window.HappyInternalReturnV694||window.HappyInternalReturnV591;
      if(master&&typeof master.open==='function')master.open('assistance',{onBack:function(){requestClose('internal-back')}});
    }catch(_e){}
  }
  function unregisterInternal(){
    try{
      var master=window.HappyInternalReturnV694||window.HappyInternalReturnV591;
      if(master&&typeof master.close==='function')master.close('assistance');
    }catch(_e){}
  }
  function show(detail){
    var context=currentContext(detail);
    saveContext(context);
    ensureHost();
    if(openState){sendContext();return true}
    lastFocus=document.activeElement;
    openState=true;
    hostRevealed=false;
    host.classList.remove('closing');
    registerInternal();

    if(!prewarmStarted)prepareFrame('first-open');
    sendContext();
    if(ready){
      revealHost();
      requestAnimationFrame(function(){try{frame&&frame.focus()}catch(_e){}});
    }else{
      readyPollStartedAt=Date.now();
      pollFrameReady();
      /* Garder la page précédente nette pendant la très courte préparation.
         Le voile de chargement n’apparaît qu’en secours si le moteur dépasse
         190 ms, ce qui supprime le flash noir des ouvertures normales. */
      clearOpenRevealTimer();
      openRevealTimer=setTimeout(function(){
        openRevealTimer=0;
        if(openState&&!ready)revealHost();
      },190);
    }
    return true;
  }
  function finalizeClose(reason){
    if(!openState||closeLock)return false;
    closeLock=true;
    openState=false;
    clearOpenRevealTimer();
    try{
      var active=frame&&frame.contentDocument&&frame.contentDocument.activeElement;
      if(active&&typeof active.blur==='function')active.blur();
    }catch(_e){}
    if(host){
      host.classList.remove('show','closing');
      host.setAttribute('aria-hidden','true');
      host.setAttribute('inert','');
    }
    hostRevealed=false;
    document.documentElement.classList.remove('happyadAssistanceOpenV738');
    document.body.classList.remove('happyadAssistanceOpenV738');
    unregisterInternal();
    /* La restauration du focus est retardée après la fin du geste afin que
       l’ancien bouton derrière ne reçoive jamais le même toucher. */
    var focusTarget=lastFocus;
    setTimeout(function(){
      try{if(focusTarget&&typeof focusTarget.focus==='function')focusTarget.focus({preventScroll:true})}catch(_e){}
    },160);
    try{window.dispatchEvent(new CustomEvent('HAPPYAD_ASSISTANCE_CLOSED',{detail:{reason:reason||'close',context:lastContext,at:Date.now()}}))}catch(_e){}
    setTimeout(function(){closeLock=false},220);
    return true;
  }
  function requestClose(reason,event){
    reason=reason||'close';
    if(/(?:^|-)x(?:-|$)|assistance-x|parent-x/.test(reason))return queueClose(reason,event);
    return finalizeClose(reason);
  }

  window.addEventListener('message',function(event){
    var data=event&&event.data||{};
    if(data.type==='HAPPYAD_ASSISTANCE_OPEN_REQUEST'){show(data.detail||{});return}
    if(data.type==='HAPPYAD_ASSISTANCE_PREPARE_REQUEST'){schedulePrewarm('prepare-request',0);return}
    if(event.origin&&event.origin!==location.origin)return;
    if(frame&&event.source&&event.source!==frame.contentWindow)return;
    if(data.type==='HAPPYAD_ASSISTANCE_CLOSE_REQUEST')requestClose('assistance-x');
    else if(data.type==='HAPPYAD_ASSISTANCE_READY')markReady('module-ready');
  },true);
  window.addEventListener('HAPPYAD_ASSISTANCE_OPEN_REQUEST',function(event){show(event&&event.detail||{})},true);
  window.addEventListener('HAPPYAD_ASSISTANCE_PREPARE_REQUEST',function(){schedulePrewarm('custom-prepare',0)},true);
  window.addEventListener('HAPPYAD_NAV_CHANGED_V586',function(event){
    var page=clean(event&&event.detail&&event.detail.page).toLowerCase();
    if(page==='message'||page==='profile')schedulePrewarm('near-assistance-route',0);
  },true);
  window.addEventListener('keydown',function(event){if(openState&&event.key==='Escape'){event.preventDefault();requestClose('escape')}},true);

  function start(){
    ensureHost();
    schedulePrewarm('safe-idle-prewarm',slowConnection()?720:140);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

  var api=Object.freeze({
    version:VERSION,
    open:show,
    close:requestClose,
    prepare:function(reason){return prepareFrame(reason||'api-prepare')},
    isOpen:function(){return openState},
    isReady:function(){return ready},
    context:function(){return lastContext?JSON.parse(JSON.stringify(lastContext)):null}
  });
  window.HappyadAssistanceMasterV751=window.HappyadAssistanceMasterV750=window.HappyadAssistanceMasterV749=window.HappyadAssistanceMasterV748=window.HappyadAssistanceMasterV747=window.HappyadAssistanceMasterV740=window.HappyadAssistanceMasterV738=api;
  window.HappyadAssistanceMasterV737=api;
})();
