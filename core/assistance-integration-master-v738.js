(function(){
  'use strict';
  if(window.__HAPPYAD_ASSISTANCE_INTEGRATION_MASTER_V738__)return;
  window.__HAPPYAD_ASSISTANCE_INTEGRATION_MASTER_V738__=true;

  var VERSION='HAPPYAD_ASSISTANCE_INTEGRATION_V740_SUPABASE_REALTIME_SINGLE_FRAME';
  var HOST_ID='happyadAssistanceHostV738';
  var FRAME_ID='happyadAssistanceFrameV738';
  var FRAME_URL='modules/assistance.html?v=743-realtime-silent';
  var CONTEXT_KEY='happyad_support_user_context_v27';
  var host=null,frame=null,openState=false,ready=false,documentLoaded=false;
  var lastContext=null,lastFocus=null,prewarmStarted=false,openedOnce=false,prewarmTimer=0;

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
    if(frame&&!frame.__happyadAssistanceV738Bound){
      frame.__happyadAssistanceV738Bound=true;
      frame.addEventListener('load',function(){
        documentLoaded=true;
        sendContext();
        /* Le premier rendu appartient au module. Ne pas appeler reopen ici :
           cela causait le second rendu visible de la V737. */
        setTimeout(function(){
          if(!ready&&documentLoaded){
            try{
              var doc=frame.contentDocument;
              if(doc&&doc.documentElement&&doc.documentElement.classList.contains('happyad-ready'))markReady('document-ready-fallback');
            }catch(_e){}
          }
        },180);
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
    try{window.dispatchEvent(new CustomEvent('HAPPYAD_ASSISTANCE_PREPARED_V738',{detail:{reason:reason||'prepare',at:Date.now()}}))}catch(_e){}
    return true;
  }
  function connectionAllowsPrewarm(){
    try{
      var c=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
      if(!c)return true;
      if(c.saveData)return false;
      return !/^(slow-2g|2g)$/i.test(clean(c.effectiveType));
    }catch(_e){return true}
  }
  function schedulePrewarm(reason,delay){
    if(prewarmStarted||prewarmTimer||!connectionAllowsPrewarm())return;
    var run=function(){prewarmTimer=0;if(!prewarmStarted)prepareFrame(reason||'idle-prewarm')};
    delay=Math.max(0,Number(delay||0));
    if('requestIdleCallback'in window){
      prewarmTimer=window.requestIdleCallback(run,{timeout:Math.max(900,delay||1800)});
    }else{
      prewarmTimer=setTimeout(run,delay||1400);
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
    lastFocus=document.activeElement;
    openState=true;
    host.classList.add('show');
    host.setAttribute('aria-hidden','false');
    host.removeAttribute('inert');
    document.documentElement.classList.add('happyadAssistanceOpenV738');
    document.body.classList.add('happyadAssistanceOpenV738');
    registerInternal();

    var wasOpened=openedOnce;
    openedOnce=true;
    if(!prewarmStarted)prepareFrame('first-open');
    else if(ready){
      /* À la première ouverture d’une frame préchauffée, le chat est déjà rendu.
         reopen est réservé aux ouvertures suivantes. */
      if(wasOpened){
        try{frame.contentWindow&&frame.contentWindow.HappyadAssistance&&frame.contentWindow.HappyadAssistance.reopen()}catch(_e){}
      }
      sendContext();
    }
    if(ready){host.classList.add('ready');try{frame.focus()}catch(_e){}}
    return true;
  }
  function finalizeClose(reason){
    if(!openState)return false;
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
    return true;
  }
  function requestClose(reason){
    /* V738 : fermeture directe. Aucun history.back(), donc aucun rechargement,
       aucune attente de popstate et aucun second passage par Paramètres. */
    return finalizeClose(reason||'close');
  }

  window.addEventListener('message',function(event){
    var data=event&&event.data||{};
    if(data.type==='HAPPYAD_ASSISTANCE_OPEN_REQUEST'){
      show(data.detail||{});return;
    }
    if(data.type==='HAPPYAD_ASSISTANCE_PREPARE_REQUEST'){
      schedulePrewarm('prepare-request',0);return;
    }
    if(event.origin&&event.origin!==location.origin)return;
    if(frame&&event.source&&event.source!==frame.contentWindow)return;
    if(data.type==='HAPPYAD_ASSISTANCE_CLOSE_REQUEST')requestClose('assistance-x');
    else if(data.type==='HAPPYAD_ASSISTANCE_READY')markReady('module-ready');
  },true);
  window.addEventListener('HAPPYAD_ASSISTANCE_OPEN_REQUEST',function(event){show(event&&event.detail||{})},true);
  window.addEventListener('HAPPYAD_ASSISTANCE_PREPARE_REQUEST',function(){schedulePrewarm('custom-prepare',0)},true);
  window.addEventListener('HAPPYAD_NAV_CHANGED_V586',function(event){
    var page=clean(event&&event.detail&&event.detail.page).toLowerCase();
    if(page==='message'||page==='profile')schedulePrewarm('near-assistance-route',350);
  },true);
  window.addEventListener('keydown',function(event){if(openState&&event.key==='Escape'){event.preventDefault();requestClose('escape')}},true);

  function start(){schedulePrewarm('idle-after-start',1800)}
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
  window.HappyadAssistanceMasterV740=window.HappyadAssistanceMasterV738=api;
  window.HappyadAssistanceMasterV737=api;
})();
