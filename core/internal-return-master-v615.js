(function(){
  'use strict';
  if(window.__HAPPYAD_INTERNAL_RETURN_MASTER_V615__)return;
  window.__HAPPYAD_INTERNAL_RETURN_MASTER_V615__=true;

  var VERSION='V615_INTERNAL_RETURN_OVERLAY_SAFE';
  var NOTIF_CENTER_ID='happyadNotificationReturnCenter';
  var NOTIF_FRAME_ID='happyadNotificationCenterFrame';
  var NOTIF_URL='modules/notification-center.html?v=591-internal-return';
  var NOTIF_CLASS='happyadNotificationInternalV591';
  var layers=[];
  var handlers=Object.create(null);
  var notificationOpen=false;
  var notificationReady=false;
  var notificationPrewarmed=false;
  var lastStableRoute=null;
  var photoReturnRoute=null;

  function clean(v){return String(v==null?'':v).trim();}
  function now(){return Date.now?Date.now():(new Date()).getTime();}
  function activeFrame(){
    try{var shell=document.getElementById('happyadAppShell');return shell&&shell.querySelector('.happyadAppFrame.on[data-happyad-page]');}catch(_e){return null;}
  }
  function currentRoute(){
    var frame=activeFrame();
    var page=clean(frame&&frame.getAttribute('data-happyad-page'));
    var url=clean(frame&&frame.getAttribute('data-happyad-src'));
    if(page)return {page:page,url:url||('modules/'+page+'.html')};
    try{var st=history.state||{};page=clean(st.view);url=clean(st.url);}catch(_e){}
    return {page:page||'home',url:url||'index.html'};
  }
  function dockAllowed(page){return page==='home'||page==='profile'||page==='profile_public'||page==='video'||page==='message';}
  function dockElement(){return document.getElementById('happyadMainDockV585')||document.querySelector('.bottom.happyadMainDockV585');}
  function notifyMessageLayout(reason){
    try{var fr=document.getElementById('happyadAppFrame_message');if(fr&&fr.contentWindow)fr.contentWindow.postMessage({type:'HAPPYAD_MESSAGE_LAYOUT_REPAIR',detail:{reason:reason||VERSION,at:now()}},'*');}catch(_e){}
  }
  function layerIndex(id){id=clean(id);for(var i=layers.length-1;i>=0;i--)if(layers[i]===id)return i;return -1;}
  function topLayer(){return layers.length?layers[layers.length-1]:'';}
  function hasLayers(){return layers.length>0;}
  function forceDockHidden(on){
    var dock=dockElement();
    if(!dock)return;
    try{
      if(on){
        dock.setAttribute('aria-hidden','true');
        dock.style.setProperty('display','none','important');
        dock.style.setProperty('visibility','hidden','important');
        dock.style.setProperty('pointer-events','none','important');
      }else{
        dock.removeAttribute('aria-hidden');
        dock.style.removeProperty('display');
        dock.style.removeProperty('visibility');
        dock.style.removeProperty('pointer-events');
      }
    }catch(_e){}
  }
  function applyDock(){
    if(!document.body)return;
    var hidden=hasLayers();
    var route=currentRoute();
    var visible=!hidden&&dockAllowed(route.page);
    document.body.classList.toggle('happyadMainDockVisible',visible);
    document.body.classList.toggle('happyadInternalScreenOpenV591',hidden);
    forceDockHidden(hidden);
    setTimeout(function(){notifyMessageLayout(hidden?'internal-open-v591':'internal-closed-v591');},20);
  }
  function openLayer(id,options){
    id=clean(id)||'internal';
    var idx=layerIndex(id);if(idx>=0)layers.splice(idx,1);
    layers.push(id);
    if(options&&typeof options.onBack==='function')handlers[id]=options.onBack;
    applyDock();
    try{if(window.HappyOverlayMasterV615)window.HappyOverlayMasterV615.lock('internal-'+id);}catch(_o){}
    return id;
  }
  function closeLayer(id){
    id=clean(id);
    if(!id)id=topLayer();
    var idx=layerIndex(id);if(idx>=0)layers.splice(idx,1);
    delete handlers[id];
    applyDock();
    try{if(window.HappyOverlayMasterV615)window.HappyOverlayMasterV615.unlock('internal-'+id);}catch(_o){}
    return true;
  }
  function register(id,onBack){id=clean(id);if(id&&typeof onBack==='function')handlers[id]=onBack;return function(){delete handlers[id];};}
  function postToFrame(page,type,detail){
    try{
      var fr=document.getElementById('happyadAppFrame_'+String(page||'').replace(/[^a-zA-Z0-9_-]/g,'_'));
      if(fr&&fr.contentWindow){fr.contentWindow.postMessage({type:type,detail:detail||{}},'*');return true;}
    }catch(_e){}
    return false;
  }
  function postToActive(type,detail){
    try{var fr=activeFrame();if(fr&&fr.contentWindow){fr.contentWindow.postMessage({type:type,detail:detail||{}},'*');return true;}}catch(_e){}
    return false;
  }

  function installNotificationStyle(){
    if(document.getElementById('happyadNotificationInternalV591Style'))return;
    var style=document.createElement('style');
    style.id='happyadNotificationInternalV591Style';
    style.textContent=[
      '#'+NOTIF_CENTER_ID+'{position:fixed!important;inset:0!important;z-index:1000100!important;width:100vw!important;height:100dvh!important;background:#03070d!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;overflow:hidden!important;contain:strict!important}',
      '#'+NOTIF_CENTER_ID+'.on{visibility:visible!important;opacity:1!important;pointer-events:auto!important}',
      '#'+NOTIF_CENTER_ID+' .haNotifBody{position:absolute!important;inset:0!important;overflow:hidden!important;background:#03070d!important;contain:strict!important}',
      '#'+NOTIF_CENTER_ID+' iframe{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;border:0!important;background:#03070d!important;display:block!important}',
      'html.'+NOTIF_CLASS+',body.'+NOTIF_CLASS+'{overflow:hidden!important;overscroll-behavior:none!important}',
      'body.'+NOTIF_CLASS+' .bottom.happyadMainDockV585,body.'+NOTIF_CLASS+' #happyadMainDockV585{display:none!important;visibility:hidden!important;pointer-events:none!important}',
      'body.'+NOTIF_CLASS+' #happyadAppShell{pointer-events:none!important}'
    ].join('\n');
    (document.head||document.documentElement).appendChild(style);
  }
  function notificationShell(){
    installNotificationStyle();
    var el=document.getElementById(NOTIF_CENTER_ID);
    if(el)return el;
    el=document.createElement('section');
    el.id=NOTIF_CENTER_ID;
    el.setAttribute('aria-hidden','true');
    el.innerHTML='<div class="haNotifBody"><iframe id="'+NOTIF_FRAME_ID+'" title="Notifications HAPPYAD" loading="eager" referrerpolicy="same-origin"></iframe></div>';
    document.body.appendChild(el);
    return el;
  }
  function notificationFrame(){return document.getElementById(NOTIF_FRAME_ID);}
  function sendNotification(type,detail){
    try{var fr=notificationFrame();if(fr&&fr.contentWindow){fr.contentWindow.postMessage({type:type,detail:detail||{}},'*');return true;}}catch(_e){}
    return false;
  }
  function prepareNotification(){
    var el=notificationShell(),fr=notificationFrame();
    if(!fr)return el;
    if(!fr.__happyadV591Bound){
      fr.__happyadV591Bound=true;
      fr.addEventListener('load',function(){notificationReady=true;});
    }
    var src=clean(fr.getAttribute('src'));
    if(!src||src.indexOf('modules/notification-center.html')<0){notificationReady=false;fr.setAttribute('src',NOTIF_URL);}
    return el;
  }
  function prewarmNotification(){if(notificationPrewarmed||!document.body)return;notificationPrewarmed=true;prepareNotification();}
  function openNotification(detail){
    detail=detail&&detail.detail?detail.detail:(detail||{});
    var el=prepareNotification();
    notificationOpen=true;
    openLayer('notification');
    document.documentElement.classList.add(NOTIF_CLASS);
    document.body.classList.add(NOTIF_CLASS);
    el.classList.add('on');el.setAttribute('aria-hidden','false');el.removeAttribute('inert');
    if(notificationReady)sendNotification('HAPPYAD_NOTIFICATIONS_REFRESH',{source:clean(detail.source)||VERSION,at:now()});
    try{window.dispatchEvent(new CustomEvent('HAPPYAD_NOTIFICATION_CENTER_OPENED',{detail:{source:clean(detail.source)||VERSION,at:now()}}));}catch(_e){}
    return true;
  }
  function hideNotification(reason){
    var el=document.getElementById(NOTIF_CENTER_ID);
    if(el){el.classList.remove('on');el.setAttribute('aria-hidden','true');el.setAttribute('inert','');}
    notificationOpen=false;
    document.documentElement.classList.remove(NOTIF_CLASS);
    document.body.classList.remove(NOTIF_CLASS);
    closeLayer('notification');
    try{if(window.HappyOverlayMasterV615)window.HappyOverlayMasterV615.reconcile('notification-close-'+String(reason||''));}catch(_ov){}
    try{window.dispatchEvent(new CustomEvent('HAPPYAD_NOTIFICATION_CENTER_CLOSED',{detail:{reason:reason||'internal-back-v591',at:now()}}));}catch(_e){}
    return true;
  }
  function handoffNotification(reason){if(!notificationOpen)return false;return hideNotification(reason||'notification-handoff-v591');}
  function openInternalUrl(data){
    var url=clean(data&&data.url);if(!url)return false;
    handoffNotification('notification-content-v591');
    try{if(window.HappyNavigation&&typeof window.HappyNavigation.open==='function')return window.HappyNavigation.open(url,Object.assign({force:true,source:VERSION},data.extra||{}));}catch(_e){}
    return false;
  }
  function openHomeComment(data){handoffNotification('notification-comment-v591');setTimeout(function(){try{if(typeof window.happyadOpenHomeCommentFromNotificationV545==='function')window.happyadOpenHomeCommentFromNotificationV545(data||{});}catch(_e){}},20);}
  function openHomePost(data){handoffNotification('notification-post-v591');setTimeout(function(){try{if(typeof window.happyadOpenHomePostFromNotificationV548==='function')window.happyadOpenHomePostFromNotificationV548(data||{});}catch(_e){}},20);}
  function returnFromCentralPhoto(){
    closeLayer('photo-central');
    var target=photoReturnRoute||lastStableRoute||{page:'home',url:'index.html'};
    photoReturnRoute=null;
    try{
      if(target.page==='home'&&window.HappyNavigation&&typeof window.HappyNavigation.close==='function')return window.HappyNavigation.close('photo-internal-return-v591');
      if(window.HappyNavigation&&typeof window.HappyNavigation.open==='function')return window.HappyNavigation.open(target.url,{page:target.page,replace:true,force:true,source:'photo-internal-return-v591'});
    }catch(_e){}
    return false;
  }
  function back(id){
    id=clean(id)||topLayer();
    if(!id)return false;
    try{if(typeof handlers[id]==='function')return handlers[id]();}catch(_e){}
    if(id==='notification')return hideNotification('notification-button-v591');
    if(id==='photo-central')return returnFromCentralPhoto();
    if(id==='message-chat')return postToFrame('message','HAPPYAD_INTERNAL_BACK_EXECUTE_V591',{id:id});
    if(id==='profile-photo')return postToActive('HAPPYAD_INTERNAL_BACK_EXECUTE_V591',{id:id});
    return false;
  }

  window.addEventListener('HAPPYAD_NOTIFICATION_CENTER_REQUEST',function(ev){openNotification(ev&&ev.detail||{});},true);
  window.addEventListener('HAPPYAD_NAV_CHANGED_V586',function(ev){
    var d=ev&&ev.detail||{},page=clean(d.page)||'home',url=clean(d.url)||'index.html';
    if(page==='photo'){
      if(!photoReturnRoute)photoReturnRoute=lastStableRoute||{page:'home',url:'index.html'};
      openLayer('photo-central');
    }else{
      closeLayer('photo-central');
      if(page!=='publish')lastStableRoute={page:page,url:url};
    }
  },true);
  window.addEventListener('message',function(ev){
    try{
      var d=ev&&ev.data;if(!d||typeof d!=='object')return;
      var type=clean(d.type),detail=d.detail&&typeof d.detail==='object'?d.detail:d;
      if(type==='HAPPYAD_INTERNAL_SCREEN_OPEN_V591')openLayer(clean(detail.id)||'internal');
      else if(type==='HAPPYAD_INTERNAL_SCREEN_CLOSE_V591')closeLayer(clean(detail.id)||'internal');
      else if(type==='HAPPYAD_INTERNAL_BACK_REQUEST_V591')back(clean(detail.id));
      else if(type==='HAPPYAD_PROFILE_VIEWER_OPEN_V581'||type==='HAPPYAD_PROFILE_VIEWER_OPEN_V588')openLayer('profile-photo');
      else if(type==='HAPPYAD_PROFILE_VIEWER_CLOSE_V581'||type==='HAPPYAD_PROFILE_VIEWER_CLOSE_V588')closeLayer('profile-photo');
      else if(type==='HAPPYAD_MESSAGE_CHAT_OPEN_V587')openLayer('message-chat');
      else if(type==='HAPPYAD_MESSAGE_CHAT_CLOSE_V587')closeLayer('message-chat');
      else if(type==='HAPPYAD_PHOTO_INTERNAL_BACK_V587'||type==='HAPPYAD_PHOTO_INTERNAL_BACK_V590')returnFromCentralPhoto();
      else if(type==='HAPPYAD_NOTIFICATION_INTERNAL_BACK_V587'||type==='HAPPYAD_NOTIFICATION_INTERNAL_BACK_V588')hideNotification('legacy-notification-back-v591');
      else if(type==='HAPPYAD_NOTIFICATION_CENTER_REQUEST')openNotification(detail);
      else if(type==='HAPPYAD_OPEN_INTERNAL_URL'&&d.url)openInternalUrl(d);
      else if(type==='HAPPYAD_NOTIFICATION_OPEN_HOME_COMMENT')openHomeComment(d);
      else if(type==='HAPPYAD_NOTIFICATION_OPEN_HOME_POST')openHomePost(d);
      else if(type==='HAPPYAD_NOTIFICATION_OPEN_PROFILE'||type==='HAPPYAD_NOTIFICATION_OPEN_PUBLICATION'||type==='HAPPYAD_NOTIFICATION_OPEN_ORDER'||type==='HAPPYAD_NOTIFICATION_OPEN_DETAILS'||type==='HAPPYAD_NOTIFICATIONS_NAVIGATE')handoffNotification(type);
      else if(type==='HAPPYAD_NOTIFICATION_CENTER_READY')notificationReady=true;
    }catch(_e){}
  },true);
  ['resize','orientationchange','pageshow'].forEach(function(type){window.addEventListener(type,function(){if(notificationOpen){var el=notificationShell();el.style.height='100dvh';}applyDock();},true);});

  function start(){
    lastStableRoute=currentRoute();
    applyDock();
    try{window.__HAPPYAD_NOTIFICATION_LAZY_V615__=true;}catch(_e){}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

  window.HappyInternalReturnV591={version:VERSION,open:openLayer,close:closeLayer,back:back,register:register,top:topLayer,openNotification:openNotification,closeNotification:hideNotification,returnFromCentralPhoto:returnFromCentralPhoto,applyDock:applyDock};
  window.HappyInternalReturnV588=window.HappyInternalReturnV591;
  window.HappyInternalReturnV587=window.HappyInternalReturnV591;
  window.HappyNotificationReturnCenter={version:VERSION,open:openNotification,close:hideNotification,handoff:handoffNotification,frame:notificationFrame};
})();
