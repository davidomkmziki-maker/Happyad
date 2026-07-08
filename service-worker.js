/* HAPPYAD V649 - PWA installation stable: manifest fixe + service worker minimal non bloquant. */
'use strict';

var HAPPYAD_SW_VERSION='v649-pwa-stable-install';

function sameOrigin(url){
  try{return new URL(url).origin===self.location.origin;}catch(e){return false;}
}
function clearOldHappyCachesLater(){
  try{
    caches.keys().then(function(keys){
      keys.forEach(function(k){
        try{if(/happyad|workbox|precache|v64/i.test(String(k||'')))caches.delete(k).catch(function(){});}catch(e){}
      });
    }).catch(function(){});
  }catch(e){}
}

self.addEventListener('install',function(event){
  self.skipWaiting();
});

self.addEventListener('activate',function(event){
  event.waitUntil(self.clients.claim());
  setTimeout(clearOldHappyCachesLater,1200);
});

self.addEventListener('message',function(event){
  try{
    var t=event&&event.data&&event.data.type;
    if(t==='HAPPYAD_SKIP_WAITING')self.skipWaiting();
    if(t==='HAPPYAD_CLEAR_OLD_CACHES')clearOldHappyCachesLater();
  }catch(e){}
});

self.addEventListener('fetch',function(event){
  var req=event.request;
  if(!req||req.method!=='GET')return;
  if(!sameOrigin(req.url))return;
  var isNav=req.mode==='navigate'||req.destination==='document';
  event.respondWith(fetch(req).catch(function(){
    if(isNav){
      return caches.match('/index.html').then(function(r){
        return r||new Response('<!doctype html><meta charset="utf-8"><title>HAPPYAD</title><body style="margin:0;background:#000;color:#fff;font-family:system-ui;display:grid;place-items:center;min-height:100vh">HAPPYAD hors ligne</body>',{headers:{'Content-Type':'text/html; charset=utf-8'}});
      });
    }
    return caches.match(req).then(function(r){return r||Response.error();});
  }));
});
