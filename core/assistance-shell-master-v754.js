(function(){
  'use strict';
  if(window.__HAPPYAD_ASSISTANCE_SHELL_MASTER_V754__)return;
  window.__HAPPYAD_ASSISTANCE_SHELL_MASTER_V754__=true;

  var VERSION='HAPPYAD_ASSISTANCE_SHELL_V754_SINGLE_OPEN_CLOSE_MASTER';
  var HOST_ID='happyadAssistanceShellV754';
  var FRAME_ID='happyadAssistanceFrameV754';
  var FRAME_URL='modules/assistance.html?v=754-single-shell';
  var CONTEXT_KEY='happyad_support_user_context_v27';
  var host=null,frame=null;
  var loaded=false,ready=false,visible=false,opening=false,closing=false;
  var frameStarted=false,prewarmTimer=0,closeTimer=0,readyTimer=0;
  var lastContext=null,lastOpenAt=0;

  function clean(value){return String(value==null?'':value).trim()}
  function readJson(key){try{return JSON.parse(localStorage.getItem(key)||'{}')||{}}catch(_e){return {}}}
  function localUser(){return Object.assign({},readJson('HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL'))}
  function buildContext(detail){
    detail=detail&&typeof detail==='object'?detail:{};
    var user=localUser();
    var uid=clean(detail.uid||user.id||user.user_id||localStorage.getItem('HAPPYAD_AUTH_UID'));
    var settings=readJson('HAPPYAD_PROFILE_SETTINGS_V712_'+(uid||'local'));
    var supplied=detail.user&&typeof detail.user==='object'?detail.user:{};
    return {
      source:clean(detail.source)||'happyad',
      uid:uid,
      language:clean(detail.language||settings.language||user.language||navigator.language||'fr'),
      country:clean(detail.country||user.country||user.location),
      user:{
        id:uid,
        name:clean(supplied.name||user.name||user.full_name||user.display_name),
        username:clean(supplied.username||user.username||user.handle).replace(/^@+/,''),
        avatar:clean(supplied.avatar||user.avatar||user.avatar_url)
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
    try{
      frame.contentWindow.postMessage({type:'HAPPYAD_ASSISTANCE_CONTEXT',detail:lastContext},location.origin);
      return true;
    }catch(_e){return false}
  }
  function ensureHost(){
    if(host&&frame)return host;
    host=document.getElementById(HOST_ID);
    if(!host){
      host=document.createElement('section');
      host.id=HOST_ID;
      host.className='happyadAssistanceShellV754';
      host.setAttribute('aria-hidden','true');
      host.setAttribute('inert','');
      host.innerHTML='<div class="happyadAssistanceLoaderV754" aria-live="polite"><i></i><span>Ouverture de l’assistance…</span></div><iframe id="'+FRAME_ID+'" class="happyadAssistanceFrameV754" title="Assistance HAPPYAD" loading="eager" referrerpolicy="same-origin" allow="clipboard-read; clipboard-write" aria-label="Assistance HAPPYAD"></iframe>';
      document.body.appendChild(host);
    }
    frame=document.getElementById(FRAME_ID);
    if(frame&&!frame.__happyadV754Bound){
      frame.__happyadV754Bound=true;
      frame.addEventListener('load',function(){
        loaded=true;
        sendContext();
        verifyReady(0);
      });
    }
    return host;
  }
  function verifyReady(attempt){
    if(ready||!frame)return;
    try{
      var doc=frame.contentDocument;
      var win=frame.contentWindow;
      if(win&&win.HappyadAssistance&&doc&&doc.documentElement.classList.contains('happyad-ready')){
        setReady();
        return;
      }
    }catch(_e){}
    if(attempt>=50)return;
    clearTimeout(readyTimer);
    readyTimer=setTimeout(function(){verifyReady(attempt+1)},60);
  }
  function startFrame(reason){
    ensureHost();
    if(frameStarted||!frame)return false;
    frameStarted=true;
    frame.src=FRAME_URL;
    try{window.dispatchEvent(new CustomEvent('HAPPYAD_ASSISTANCE_V754_PREPARED',{detail:{reason:reason||'prepare',at:Date.now()}}))}catch(_e){}
    return true;
  }
  function setReady(){
    if(ready)return;
    ready=true;
    clearTimeout(readyTimer);
    if(host)host.classList.add('is-ready');
    sendContext();
    if(visible){
      requestAnimationFrame(function(){
        if(host)host.classList.add('is-visible');
        try{frame&&frame.contentWindow&&frame.contentWindow.HappyadAssistance&&frame.contentWindow.HappyadAssistance.reopen&&frame.contentWindow.HappyadAssistance.reopen()}catch(_e){}
      });
    }
  }
  function registerBack(){
    try{
      var master=window.HappyInternalReturnV694||window.HappyInternalReturnV591;
      if(master&&typeof master.open==='function')master.open('assistance',{onBack:function(){close('physical-back')}});
    }catch(_e){}
  }
  function unregisterBack(){
    try{
      var master=window.HappyInternalReturnV694||window.HappyInternalReturnV591;
      if(master&&typeof master.close==='function')master.close('assistance');
    }catch(_e){}
  }
  function open(detail){
    var now=Date.now();
    if(now-lastOpenAt<180&&visible)return true;
    lastOpenAt=now;
    saveContext(buildContext(detail));
    ensureHost();
    if(!frameStarted)startFrame('first-open');
    sendContext();
    if(visible||opening)return true;
    opening=true;visible=true;closing=false;
    clearTimeout(closeTimer);
    host.classList.remove('is-closing');
    host.classList.add('is-open');
    host.setAttribute('aria-hidden','false');
    host.removeAttribute('inert');
    document.documentElement.classList.add('happyadAssistanceOpenV754');
    document.body.classList.add('happyadAssistanceOpenV754');
    registerBack();
    requestAnimationFrame(function(){
      if(!visible)return;
      host.classList.add('is-visible');
      if(ready)host.classList.add('is-ready');
      opening=false;
      if(ready){
        try{frame.contentWindow.HappyadAssistance.reopen()}catch(_e){}
      }else{
        verifyReady(0);
      }
    });
    return true;
  }
  function close(reason){
    if(!visible||closing)return false;
    closing=true;opening=false;
    host.classList.add('is-closing');
    host.classList.remove('is-visible');
    /* Le shell reste au-dessus de la page pendant toute la fin du clic. Le
       geste qui ferme l’iframe ne peut donc jamais atteindre Paramètres ou
       Messages derrière. */
    clearTimeout(closeTimer);
    closeTimer=setTimeout(function(){
      visible=false;closing=false;
      host.classList.remove('is-open','is-closing');
      host.setAttribute('aria-hidden','true');
      host.setAttribute('inert','');
      document.documentElement.classList.remove('happyadAssistanceOpenV754');
      document.body.classList.remove('happyadAssistanceOpenV754');
      unregisterBack();
      try{window.dispatchEvent(new CustomEvent('HAPPYAD_ASSISTANCE_V754_CLOSED',{detail:{reason:reason||'close',context:lastContext,at:Date.now()}}))}catch(_e){}
    },120);
    return true;
  }
  function prepare(reason){return startFrame(reason||'api-prepare')}
  function isSameOrigin(event){return !event.origin||event.origin===location.origin}
  function onMessage(event){
    if(!isSameOrigin(event))return;
    var data=event&&event.data||{};
    if(data.type==='HAPPYAD_ASSISTANCE_V754_OPEN'){
      open(data.detail||{});
      return;
    }
    if(data.type==='HAPPYAD_ASSISTANCE_V754_PREPARE'){
      prepare('message-prepare');
      return;
    }
    if(!frame||event.source!==frame.contentWindow)return;
    if(data.type==='HAPPYAD_ASSISTANCE_V754_READY'||data.type==='HAPPYAD_ASSISTANCE_READY')setReady();
    if(data.type==='HAPPYAD_ASSISTANCE_V754_CLOSE')close('assistance-x');
  }
  function schedulePrewarm(){
    if(frameStarted||prewarmTimer)return;
    var delay=320;
    try{
      var c=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
      if(c&&(c.saveData||/^(slow-2g|2g)$/i.test(clean(c.effectiveType))))delay=1100;
    }catch(_e){}
    prewarmTimer=setTimeout(function(){prewarmTimer=0;startFrame('safe-prewarm')},delay);
  }
  function start(){ensureHost();schedulePrewarm()}

  window.addEventListener('message',onMessage,true);
  window.addEventListener('HAPPYAD_ASSISTANCE_V754_OPEN',function(event){open(event&&event.detail||{})},true);
  window.addEventListener('keydown',function(event){if(visible&&event.key==='Escape'){event.preventDefault();close('escape')}},true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

  var api=Object.freeze({
    version:VERSION,
    open:open,
    close:close,
    prepare:prepare,
    isOpen:function(){return visible},
    isReady:function(){return ready},
    context:function(){return lastContext?JSON.parse(JSON.stringify(lastContext)):null}
  });
  window.HappyadAssistanceMasterV754=api;
})();
