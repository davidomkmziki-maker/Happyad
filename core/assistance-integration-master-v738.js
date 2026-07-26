(function(){
  'use strict';
  if(window.__HAPPYAD_ASSISTANCE_OPEN_CLOSE_V755__)return;
  window.__HAPPYAD_ASSISTANCE_OPEN_CLOSE_V755__=true;

  var VERSION='HAPPYAD_ASSISTANCE_OPEN_CLOSE_V755_MINIMAL';
  var HOST_ID='happyadAssistanceHostV738';
  var FRAME_ID='happyadAssistanceFrameV738';
  var FRAME_URL='modules/assistance.html?v=755-open-close-minimal';
  var CONTEXT_KEY='happyad_support_user_context_v27';
  var host=null,frame=null;
  var isOpen=false,isReady=false,frameStarted=false,closeTimer=0,openLockUntil=0;
  var lastContext=null,prewarmTimer=0,readyPoll=0;

  function clean(v){return String(v==null?'':v).trim()}
  function localUser(){try{return Object.assign({},JSON.parse(localStorage.getItem('HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL')||'{}')||{})}catch(_e){return {}}}
  function buildContext(detail){
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
  function ensureHost(){
    if(host&&frame)return host;
    host=document.getElementById(HOST_ID);
    if(!host){
      host=document.createElement('section');
      host.id=HOST_ID;
      host.className='happyadAssistanceHostV738';
      host.setAttribute('aria-hidden','true');
      host.setAttribute('inert','');
      host.innerHTML='<div class="happyadAssistanceLoadingV738" aria-live="polite"><i></i><span>Ouverture de l’assistance…</span></div><iframe id="'+FRAME_ID+'" class="happyadAssistanceFrameV738" title="Assistance HAPPYAD" loading="eager" referrerpolicy="same-origin" allow="clipboard-read; clipboard-write" aria-label="Assistance HAPPYAD"></iframe>';
      document.body.appendChild(host);
    }
    frame=document.getElementById(FRAME_ID);
    if(frame&&!frame.__happyadV755Bound){
      frame.__happyadV755Bound=true;
      frame.addEventListener('load',function(){sendContext();pollReady()});
    }
    return host;
  }
  function frameReady(){
    if(!frame)return false;
    try{
      var d=frame.contentDocument,w=frame.contentWindow;
      return !!(w&&w.HappyadAssistance&&d&&d.documentElement.classList.contains('happyad-ready')&&d.getElementById('chat'));
    }catch(_e){return false}
  }
  function stopPoll(){if(readyPoll){clearTimeout(readyPoll);readyPoll=0}}
  function pollReady(){
    stopPoll();
    if(isReady)return;
    if(frameReady()){markReady();return}
    readyPoll=setTimeout(pollReady,80);
  }
  function markReady(){
    if(isReady)return;
    isReady=true;
    stopPoll();
    if(host)host.classList.add('ready');
    sendContext();
  }
  function prepare(){
    ensureHost();
    if(frameStarted||!frame)return false;
    frameStarted=true;
    frame.src=FRAME_URL;
    return true;
  }
  function registerReturn(){
    try{
      var master=window.HappyInternalReturnV694||window.HappyInternalReturnV591;
      if(master&&typeof master.open==='function')master.open('assistance',{onBack:function(){close('physical-back')}});
    }catch(_e){}
  }
  function unregisterReturn(){
    try{
      var master=window.HappyInternalReturnV694||window.HappyInternalReturnV591;
      if(master&&typeof master.close==='function')master.close('assistance');
    }catch(_e){}
  }
  function open(detail){
    var now=Date.now();
    if(now<openLockUntil)return true;
    openLockUntil=now+350;
    saveContext(buildContext(detail));
    ensureHost();
    if(closeTimer){clearTimeout(closeTimer);closeTimer=0}
    if(isOpen){sendContext();return true}
    isOpen=true;
    host.classList.remove('closing');
    host.classList.add('show');
    host.setAttribute('aria-hidden','false');
    host.removeAttribute('inert');
    document.documentElement.classList.add('happyadAssistanceOpenV738');
    document.body.classList.add('happyadAssistanceOpenV738');
    registerReturn();
    if(!frameStarted)prepare();
    sendContext();
    if(isReady)host.classList.add('ready');
    else pollReady();
    return true;
  }
  function finishClose(reason){
    if(!host)return false;
    host.classList.remove('show','closing');
    host.setAttribute('aria-hidden','true');
    host.setAttribute('inert','');
    document.documentElement.classList.remove('happyadAssistanceOpenV738');
    document.body.classList.remove('happyadAssistanceOpenV738');
    unregisterReturn();
    try{window.dispatchEvent(new CustomEvent('HAPPYAD_ASSISTANCE_CLOSED',{detail:{reason:reason||'close',context:lastContext,at:Date.now()}}))}catch(_e){}
    return true;
  }
  function close(reason){
    if(!isOpen||closeTimer)return false;
    isOpen=false;
    if(host)host.classList.add('closing');
    /* Le clic du X se termine dans l’iframe. Le host reste au-dessus quelques
       millisecondes, sans focus ni bouton transparent, puis la page précédente
       redevient interactive. */
    closeTimer=setTimeout(function(){closeTimer=0;finishClose(reason||'close')},110);
    return true;
  }
  function sameOrigin(event){return !event.origin||event.origin===location.origin}
  window.addEventListener('message',function(event){
    if(!sameOrigin(event))return;
    var data=event&&event.data||{};
    if(data.type==='HAPPYAD_ASSISTANCE_V755_OPEN'){open(data.detail||{});return}
    if(data.type==='HAPPYAD_ASSISTANCE_V755_PREPARE'){prepare();return}
    if(frame&&event.source&&event.source!==frame.contentWindow)return;
    if(data.type==='HAPPYAD_ASSISTANCE_V755_CLOSE')close('assistance-x');
    else if(data.type==='HAPPYAD_ASSISTANCE_V755_READY')markReady();
  },true);
  window.addEventListener('keydown',function(event){if(isOpen&&event.key==='Escape'){event.preventDefault();close('escape')}},true);

  function start(){
    ensureHost();
    var run=function(){prewarmTimer=0;prepare()};
    if('requestIdleCallback'in window)prewarmTimer=requestIdleCallback(run,{timeout:1400});
    else prewarmTimer=setTimeout(run,650);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

  var api=Object.freeze({version:VERSION,open:open,close:close,prepare:prepare,isOpen:function(){return isOpen},isReady:function(){return isReady},context:function(){return lastContext?JSON.parse(JSON.stringify(lastContext)):null}});
  window.HappyadAssistanceMasterV755=api;
  /* Alias de compatibilité : aucun autre moteur n’est créé. */
  window.HappyadAssistanceMasterV751=window.HappyadAssistanceMasterV750=window.HappyadAssistanceMasterV749=window.HappyadAssistanceMasterV748=window.HappyadAssistanceMasterV747=window.HappyadAssistanceMasterV740=window.HappyadAssistanceMasterV738=window.HappyadAssistanceMasterV737=api;
})();
