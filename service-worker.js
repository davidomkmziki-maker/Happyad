/* HAPPYAD V751 — X protégé, ouverture atomique, annonce agent neutre */
'use strict';

var HAPPYAD_SW_VERSION = 'happyad-pwa-V751-assistance-x-shield-open-atomic-agent-neutral-20260726-1';
var HAPPYAD_STATIC_CACHE = HAPPYAD_SW_VERSION + '-static';
var HAPPYAD_RUNTIME_CACHE = HAPPYAD_SW_VERSION + '-runtime';
var HAPPYAD_MEDIA_CACHE = 'happyad-message-media-v1';
var HAPPYAD_PUSH_STATE_CACHE = 'happyad-push-state-v1';
var HAPPYAD_VAPID_PUBLIC_KEY = 'BA3UgDp8-6VYN6nZgSNX14LeZVLK6FesJgLXVytEKkKgplK_3KVssohN_SAKPDdkhoAmpQzIo3Ev9VGIXNZP-bE';
var HAPPYAD_APP_SHELL = [
  './',
  './index.html?v=750-assistance-admin-only-terminal-realtime',
  './manifest.webmanifest',
  './icons/happyad-icon-v535center1-192.png',
  './icons/happyad-icon-v535center1-512.png',
  './icons/happyad-notification-badge-96.png',
  './icons/happyad-home-wordmark-v1.svg',
  './core/startup-master-v727.js?v=727-startup-unique',
  './core/analytics-master-v731.js?v=731-local-time-watch-checkpoints',
  './core/navigation-master-v668.js?v=746-message-profile-avatar',
  './core/auth-session-master-v598.js?v=742-profile-identity-nondestructive',
  './core/profile-identity-stable-master-v741.js?v=743-avatar-safe',
  './core/profile-avatar-recovery-master-v743.js?v=743-avatar-legacy-recovery',
  './core/card-author-avatar-master-v742.js?v=743-card-avatar-safe',
  './core/profile-edit-clear-master-v742.css?v=742-profile-edit-clear',
  './core/profile-edit-clear-master-v742.js?v=742-profile-edit-clear',
  './core/main-tabs-master-v615.js?v=746-message-profile-avatar',
  './core/internal-return-master-v694.js?v=714-profile-settings-return',
  './core/assistance-integration-master-v738.css?v=751-x-shield-open-atomic-agent-neutral',
  './core/assistance-integration-master-v738.js?v=751-x-shield-open-atomic-agent-neutral',
  './core/message-assistance-shortcut-v738.css?v=738-visible',
  './core/message-assistance-shortcut-v738.js?v=751-x-shield-open-atomic-agent-neutral',
  './core/assistance-supabase-realtime-v750.js?v=751-x-shield-open-atomic-agent-neutral'
];

function isHappyCache(name){
  return String(name||'').toLowerCase().indexOf('happyad') > -1;
}
function isCurrentCache(name){
  return name === HAPPYAD_STATIC_CACHE || name === HAPPYAD_RUNTIME_CACHE || name === HAPPYAD_MEDIA_CACHE || name === HAPPYAD_PUSH_STATE_CACHE;
}
function sameOrigin(url){
  try{return new URL(url).origin === self.location.origin;}catch(e){return false;}
}
function isSupabaseOrExternal(url){
  try{var u=new URL(url);return u.origin !== self.location.origin || /supabase\.co|storage\.googleapis\.com|cloudinary|res\.cloudinary/i.test(u.hostname);}catch(e){return true;}
}
function isHeavyMedia(request){
  try{
    var u=new URL(request.url);
    var dest=request.destination||'';
    return dest==='video' || dest==='audio' || /\.(mp4|mov|webm|m4v|mp3|wav|ogg)(\?|$)/i.test(u.pathname);
  }catch(e){return false;}
}
function happyadFreshRequest(request){
  try{return new Request(request,{cache:'no-store'});}catch(_e){return request;}
}
function networkFirst(request){
  return caches.open(HAPPYAD_RUNTIME_CACHE).then(function(cache){
    return fetch(happyadFreshRequest(request)).then(function(response){
      try{if(response && response.ok)cache.put(request,response.clone());}catch(e){}
      return response;
    }).catch(function(){
      return caches.match(request).then(function(cached){return cached || caches.match('./index.html');});
    });
  });
}
function cacheFirst(request){
  return caches.match(request).then(function(cached){
    if(cached)return cached;
    return fetch(request).then(function(response){
      try{if(response && response.ok)caches.open(HAPPYAD_RUNTIME_CACHE).then(function(cache){cache.put(request,response.clone());});}catch(e){}
      return response;
    });
  });
}

function networkFirstFast(request){
  return caches.open(HAPPYAD_RUNTIME_CACHE).then(function(cache){
    return new Promise(function(resolve,reject){
      var settled=false;
      var network=fetch(happyadFreshRequest(request)).then(function(response){
        try{if(response&&response.ok)cache.put(request,response.clone());}catch(_e){}
        if(!settled){settled=true;resolve(response);}
        return response;
      }).catch(function(error){
        return cache.match(request).then(function(cached){
          if(!settled){settled=true;if(cached)resolve(cached);else reject(error);}
        });
      });
      setTimeout(function(){
        if(settled)return;
        cache.match(request).then(function(cached){if(cached&&!settled){settled=true;resolve(cached);}}).catch(function(){});
      },900);
      return network;
    });
  }).catch(function(){return fetch(request);});
}
function staleWhileRevalidate(request){
  return caches.open(HAPPYAD_RUNTIME_CACHE).then(function(cache){
    return cache.match(request).then(function(cached){
      var update=fetch(request).then(function(response){
        try{if(response&&response.ok)cache.put(request,response.clone());}catch(_e){}
        return response;
      }).catch(function(){return cached;});
      return cached||update;
    });
  });
}

self.addEventListener('install', function(event){
  event.waitUntil(caches.open(HAPPYAD_STATIC_CACHE).then(function(cache){
    /* Un fichier momentanément indisponible ne doit plus annuler tout le pré-cache. */
    return Promise.all(HAPPYAD_APP_SHELL.map(function(url){
      return cache.add(url).catch(function(){return false;});
    }));
  }).then(function(){return self.skipWaiting();}));
});

self.addEventListener('activate', function(event){
  event.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.map(function(key){
      if(isHappyCache(key) && !isCurrentCache(key))return caches.delete(key);
      return Promise.resolve(false);
    }));
  }).then(function(){return self.clients.claim();}));
});

self.addEventListener('message', function(event){
  try{
    var type=event && event.data && event.data.type;
    if(type==='HAPPYAD_SKIP_WAITING')self.skipWaiting();
    if(type==='HAPPYAD_CLEAR_OLD_CACHES'){
      event.waitUntil(caches.keys().then(function(keys){
        return Promise.all(keys.map(function(key){
          if(isHappyCache(key) && !isCurrentCache(key))return caches.delete(key);
          return Promise.resolve(false);
        }));
      }));
    }
  }catch(e){}
});


/* HAPPYAD V39A — Push réel Messages : réveil robuste, affichage de secours et renouvellement. */
function happyadPushPayload(event){
  var fallback={
    type:'happyad_generic',
    title:'HAPPYAD',
    body:'Vous avez une nouvelle notification.',
    icon:'./icons/happyad-icon-v535center1-192.png',
    badge:'./icons/happyad-notification-badge-96.png',
    tag:'happyad-notification',
    url:'./index.html?source=push',
    sent_at:'',
    push_id:''
  };
  try{
    if(!event || !event.data)return fallback;
    var parsed=event.data.json();
    if(parsed && typeof parsed==='object'){
      Object.keys(parsed).forEach(function(k){if(parsed[k]!=null)fallback[k]=parsed[k];});
      return fallback;
    }
  }catch(_json){
    try{var txt=String(event.data.text()||'').trim();if(txt)fallback.body=txt;}catch(_text){}
  }
  return fallback;
}

function happyadPushData(data){
  return {
    type:String(data.type||'happyad_generic'),
    url:String(data.url||'./index.html?source=push'),
    conversation_id:String(data.conversation_id||''),
    message_id:String(data.message_id||''),
    sender_id:String(data.sender_id||''),
    sender_name:String(data.sender_name||''),
    sender_avatar:String(data.sender_avatar||''),
    sender_badge:String(data.sender_badge||''),
    sender_handle:String(data.sender_handle||''),
    message_kind:String(data.message_kind||''),
    view_once:!!data.view_once,
    unread_count:Number(data.unread_count||1),
    push_id:String(data.push_id||''),
    sent_at:String(data.sent_at||''),
    received_at:Date.now(),
    delivery_delay_ms:0
  };
}

function happyadParseTime(value){
  if(value==null||value==='')return 0;
  var numeric=Number(value);
  if(Number.isFinite(numeric)&&numeric>0)return numeric;
  var parsed=Date.parse(String(value));
  return Number.isFinite(parsed)?parsed:0;
}

function happyadVisibleClients(){
  return self.clients.matchAll({type:'window',includeUncontrolled:true}).then(function(list){
    return (list||[]).filter(function(client){
      try{return new URL(client.url).origin===self.location.origin && client.visibilityState==='visible';}
      catch(_e){return false;}
    });
  }).catch(function(){return [];});
}

function happyadVisibleClientsFast(){
  return Promise.race([
    happyadVisibleClients(),
    new Promise(function(resolve){setTimeout(function(){resolve([]);},450);})
  ]);
}

function happyadPostToClients(type,data){
  return self.clients.matchAll({type:'window',includeUncontrolled:true}).then(function(list){
    (list||[]).forEach(function(client){
      try{client.postMessage({type:type,data:data||{}});}catch(_e){}
    });
  }).catch(function(){return undefined;});
}

function happyadStateRequest(name){
  return new Request(new URL('./__happyad_push_state__/'+encodeURIComponent(String(name||'state')),self.location.href).href,{method:'GET'});
}

function happyadStoreState(name,data){
  try{
    return caches.open(HAPPYAD_PUSH_STATE_CACHE).then(function(cache){
      return cache.put(happyadStateRequest(name),new Response(JSON.stringify(data||{}),{
        headers:{'Content-Type':'application/json','Cache-Control':'no-store'}
      }));
    }).catch(function(){return undefined;});
  }catch(_e){return Promise.resolve();}
}

function happyadNotificationOptions(data,detail){
  var options={
    body:String(data.body||'Vous avez une nouvelle notification.'),
    icon:String(data.icon||detail.sender_avatar||'./icons/happyad-icon-v535center1-192.png'),
    badge:String(data.badge||'./icons/happyad-notification-badge-96.png'),
    tag:String(data.tag||('happyad-'+String(data.type||'notification'))),
    renotify:data.renotify!==false,
    requireInteraction:!!data.requireInteraction,
    silent:false,
    vibrate:Array.isArray(data.vibrate)?data.vibrate:[180,80,180],
    timestamp:happyadParseTime(data.sent_at)||Number(data.timestamp||Date.now()),
    data:detail
  };
  if(detail.type==='happyad_message')options.actions=[{action:'reply',title:'Répondre'}];
  return options;
}

function happyadShowNotification(data,detail){
  var title=String(data.title||'HAPPYAD');
  var options=happyadNotificationOptions(data,detail);
  return self.registration.showNotification(title,options).catch(function(firstError){
    /* Un avatar distant ou une action non prise en charge ne doit jamais bloquer la notification. */
    var fallback={
      body:String(data.body||'Vous avez une nouvelle notification.'),
      icon:'./icons/happyad-icon-v535center1-192.png',
      badge:'./icons/happyad-notification-badge-96.png',
      tag:String(data.tag||('happyad-'+String(data.type||'notification'))),
      renotify:true,
      silent:false,
      vibrate:[180,80,180],
      timestamp:happyadParseTime(data.sent_at)||Date.now(),
      data:detail
    };
    return self.registration.showNotification('HAPPYAD',fallback).catch(function(secondError){
      try{console.warn('HAPPYAD notification failed',firstError,secondError);}catch(_e){}
      throw secondError;
    });
  });
}

self.addEventListener('push', function(event){
  var data=happyadPushPayload(event);
  var detail=happyadPushData(data);
  var sentAt=happyadParseTime(data.sent_at)||Number(data.timestamp||0);
  detail.delivery_delay_ms=sentAt>0?Math.max(0,Date.now()-sentAt):0;

  event.waitUntil(
    happyadStoreState('last-received',detail).then(function(){
      return happyadVisibleClientsFast();
    }).then(function(visible){
      (visible||[]).forEach(function(client){
        try{client.postMessage({type:'HAPPYAD_PUSH_FOREGROUND',data:detail});}catch(_e){}
      });

      /* Push immédiat + application déjà visible : pas de doublon système.
         Push retardé par Android/Chrome : afficher quand même, même si l'utilisateur vient d'ouvrir l'app. */
      if(visible.length && detail.delivery_delay_ms>=0 && detail.delivery_delay_ms<5000)return;

      return happyadShowNotification(data,detail).then(function(){
        var shown={
          push_id:detail.push_id,
          message_id:detail.message_id,
          conversation_id:detail.conversation_id,
          sent_at:detail.sent_at,
          received_at:detail.received_at,
          shown_at:Date.now(),
          delivery_delay_ms:detail.delivery_delay_ms
        };
        return happyadStoreState('last-shown',shown).then(function(){
          return happyadPostToClients('HAPPYAD_PUSH_SHOWN',shown);
        });
      });
    })
  );
});

function happyadBase64UrlToUint8Array(base64String){
  var padding='='.repeat((4-base64String.length%4)%4);
  var base64=(base64String+padding).replace(/-/g,'+').replace(/_/g,'/');
  var raw=atob(base64);var out=new Uint8Array(raw.length);
  for(var i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);
  return out;
}

function happyadSubscriptionJson(sub){
  try{return sub&&sub.toJSON?sub.toJSON():null;}catch(_e){return null;}
}

self.addEventListener('pushsubscriptionchange',function(event){
  var oldSub=event.oldSubscription||null;
  var options=null;
  try{options=oldSub&&oldSub.options?oldSub.options:null;}catch(_e){}
  if(!options||!options.applicationServerKey){
    options={userVisibleOnly:true,applicationServerKey:happyadBase64UrlToUint8Array(HAPPYAD_VAPID_PUBLIC_KEY)};
  }
  event.waitUntil(
    self.registration.pushManager.subscribe(options).then(function(newSub){
      var state={
        changed_at:Date.now(),
        old_subscription:happyadSubscriptionJson(oldSub),
        new_subscription:happyadSubscriptionJson(newSub),
        needs_server_sync:true
      };
      return happyadStoreState('pending-subscription',state).then(function(){
        return happyadPostToClients('HAPPYAD_PUSH_SUBSCRIPTION_REFRESHED',state);
      });
    }).catch(function(error){
      return happyadStoreState('subscription-refresh-error',{at:Date.now(),message:String(error&&error.message||error||'unknown')});
    })
  );
});

self.addEventListener('notificationclick', function(event){
  try{event.notification.close();}catch(_close){}
  var sourceData=(event.notification&&event.notification.data)||{};
  var data={};
  Object.keys(sourceData||{}).forEach(function(key){data[key]=sourceData[key];});
  var replyRequested=String(event.action||'')==='reply';
  if(replyRequested)data.focus_composer=true;

  var targetUrl;
  try{targetUrl=new URL(String(data.url||'./index.html?source=push'),self.location.origin);}
  catch(_url){targetUrl=new URL('./index.html?source=push',self.location.origin);}
  if(replyRequested)targetUrl.searchParams.set('happyad_reply','1');
  var target=targetUrl.href;

  event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(function(list){
    var sameOriginClient=null;
    for(var i=0;i<list.length;i++){
      try{
        var c=list[i];
        if(new URL(c.url).origin===self.location.origin){sameOriginClient=c;break;}
      }catch(_e){}
    }
    if(sameOriginClient){
      try{sameOriginClient.postMessage({type:'HAPPYAD_PUSH_OPEN',data:data,url:target});}catch(_msg){}
      return sameOriginClient.focus();
    }
    return self.clients.openWindow(target);
  }));
});

self.addEventListener('fetch', function(event){
  var request=event.request;
  if(!request || request.method !== 'GET')return;
  if(isSupabaseOrExternal(request.url) || isHeavyMedia(request))return;
  if(!sameOrigin(request.url))return;

  var dest=request.destination||'';
  var path='';try{path=new URL(request.url).pathname;}catch(_e){}
  /* La version est portée par la query. Une fois préchauffée, l’Assistance
     doit s’ouvrir depuis le cache immédiatement, sans second passage réseau. */
  if(/\/modules\/assistance\.html$/i.test(path)){
    event.respondWith(cacheFirst(request));
    return;
  }
  if(/\/modules\/user\.html$/i.test(path) || /profile-(layout|scroll|publications|polish|ui-fixes|performance)/i.test(path)){
    event.respondWith(networkFirstFast(request));
    return;
  }
  if(request.mode==='navigate' || dest==='document' || /\.html(\?|$)/i.test(new URL(request.url).pathname)){
    event.respondWith(networkFirstFast(request));
    return;
  }
  if(dest==='script' || dest==='style' || dest==='worker' || /\.(js|css|webmanifest)(\?|$)/i.test(new URL(request.url).pathname)){
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
  if(dest==='image' || /\.(png|jpg|jpeg|webp|svg|ico)(\?|$)/i.test(new URL(request.url).pathname)){
    event.respondWith(cacheFirst(request));
  }
});
