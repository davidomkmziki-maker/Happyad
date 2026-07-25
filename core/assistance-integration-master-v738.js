(function(){
  'use strict';
  if(window.__HAPPYAD_ASSISTANCE_INTEGRATION_MASTER_V747__)return;
  window.__HAPPYAD_ASSISTANCE_INTEGRATION_MASTER_V747__=true;

  var VERSION='HAPPYAD_ASSISTANCE_INTEGRATION_V747_FAST_OPEN_REPLY_CLOSE';
  var HOST_ID='happyadAssistanceHostV738';
  var FRAME_ID='happyadAssistanceFrameV738';
  var PARENT_CLOSE_ID='happyadAssistanceParentCloseV747';
  var FRAME_URL='modules/assistance.html?v=747-fast-open-reply-close';
  var CONTEXT_KEY='happyad_support_user_context_v27';
  var host=null,frame=null,parentClose=null,openState=false,ready=false,documentLoaded=false;
  var lastContext=null,lastFocus=null,prewarmStarted=false,prewarmTimer=0,closeLock=false;

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
  function fastCloseEvent(event){
    try{event&&event.preventDefault&&event.preventDefault()}catch(_e){}
    try{event&&event.stopPropagation&&event.stopPropagation()}catch(_e){}
    try{event&&event.stopImmediatePropagation&&event.stopImmediatePropagation()}catch(_e){}
    requestClose('parent-fast-x');
  }
  function bindParentClose(){
    if(!parentClose||parentClose.__happyadFastCloseBound)return;
    parentClose.__happyadFastCloseBound=true;
    parentClose.addEventListener('pointerdown',fastCloseEvent,{capture:true,passive:false});
    parentClose.addEventListener('touchstart',fastCloseEvent,{capture:true,passive:false});
    parentClose.addEventListener('click',fastCloseEvent,{capture:true,passive:false});
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
      host.innerHTML='<div class="happyadAssistanceLoadingV738" aria-live="polite"><i></i><span>Ouverture de l’assistance…</span></div><iframe id="'+FRAME_ID+'" class="happyadAssistanceFrameV738" title="Assistance HAPPYAD" loading="eager" referrerpolicy="same-origin" allow="clipboard-read; clipboard-write" aria-label="Assistance HAPPYAD"></iframe><button id="'+PARENT_CLOSE_ID+'" class="happyadAssistanceParentCloseV747" type="button" tabindex="-1" aria-hidden="true"></button>';
      document.body.appendChild(host);
    }
    frame=document.getElementById(FRAME_ID);
    parentClose=document.getElementById(PARENT_CLOSE_ID);
    bindParentClose();
    if(frame&&!frame.__happyadAssistanceV747Bound){
      frame.__happyadAssistanceV747Bound=true;
      frame.addEventListener('load',function(){
        documentLoaded=true;
        markReady('frame-load');
        sendContext();
      });
    }
    return host;
  }
  function markReady(){
    ready=true;
    if(host)host.classList.add('ready');
    sendContext();
    if(openState){try{frame&&frame.focus()}catch(_e){}}
  }
  function prepareFrame(reason){
    ensureHost();
    if(prewarmStarted||!frame)return false;
    prewarmStarted=true;
    frame.setAttribute('src',FRAME_URL);
    try{window.dispatchEvent(new CustomEvent('HAPPYAD_ASSISTANCE_PREPARED_V747',{detail:{reason:reason||'prepare',at:Date.now()}}))}catch(_e){}
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
    var run=function(){prewarmTimer=0;if(!prewarmStarted)prepareFrame(reason||'startup-prewarm')};
    prewarmTimer=setTimeout(run,Math.max(0,Number(delay||0)));
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
    lastFocus=document.activeElement;
    openState=true;
    host.classList.add('show');
    host.setAttribute('aria-hidden','false');
    host.removeAttribute('inert');
    document.documentElement.classList.add('happyadAssistanceOpenV738');
    document.body.classList.add('happyadAssistanceOpenV738');
    registerInternal();

    if(!prewarmStarted)prepareFrame('first-open');
    if(documentLoaded&&!ready)markReady('already-loaded');
    if(ready){
      host.classList.add('ready');
      sendContext();
      try{frame.focus()}catch(_e){}
    }
    return true;
  }
  function finalizeClose(reason){
    if(!openState||closeLock)return false;
    closeLock=true;
    openState=false;
    try{
      var active=frame&&frame.contentDocument&&frame.contentDocument.activeElement;
      if(active&&typeof active.blur==='function')active.blur();
    }catch(_e){}
    if(host){
      host.classList.remove('show');
      host.setAttribute('aria-hidden','true');
      host.setAttribute('inert','');
    }
    document.documentElement.classList.remove('happyadAssistanceOpenV738');
    document.body.classList.remove('happyadAssistanceOpenV738');
    unregisterInternal();
    try{if(lastFocus&&typeof lastFocus.focus==='function')lastFocus.focus({preventScroll:true})}catch(_e){}
    try{window.dispatchEvent(new CustomEvent('HAPPYAD_ASSISTANCE_CLOSED',{detail:{reason:reason||'close',context:lastContext,at:Date.now()}}))}catch(_e){}
    setTimeout(function(){closeLock=false},220);
    return true;
  }
  function requestClose(reason){return finalizeClose(reason||'close')}

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
    if(page==='message'||page==='profile')schedulePrewarm('near-assistance-route',40);
  },true);
  window.addEventListener('keydown',function(event){if(openState&&event.key==='Escape'){event.preventDefault();requestClose('escape')}},true);

  function start(){
    ensureHost();
    schedulePrewarm('startup-prewarm',slowConnection()?650:80);
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
  window.HappyadAssistanceMasterV747=window.HappyadAssistanceMasterV740=window.HappyadAssistanceMasterV738=api;
  window.HappyadAssistanceMasterV737=api;
})();
