/* HAPPYAD V29 - Service worker PWA actif, diagnostic Storage owner-safe. */
'use strict';

var HAPPYAD_SW_VERSION = 'happyad-pwa-v29-storage-owner-safe-20260709';
var HAPPYAD_STATIC_CACHE = HAPPYAD_SW_VERSION + '-static';
var HAPPYAD_RUNTIME_CACHE = HAPPYAD_SW_VERSION + '-runtime';
var HAPPYAD_APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/happyad-icon-v535center1-192.png',
  './icons/happyad-icon-v535center1-512.png',
  './icons/happyad-icon-v535center1-maskable-192.png',
  './icons/happyad-icon-v535center1-maskable-512.png'
];

function isHappyCache(name){
  return String(name||'').toLowerCase().indexOf('happyad') > -1;
}
function isCurrentCache(name){
  return name === HAPPYAD_STATIC_CACHE || name === HAPPYAD_RUNTIME_CACHE;
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
function networkFirst(request){
  return caches.open(HAPPYAD_RUNTIME_CACHE).then(function(cache){
    return fetch(request).then(function(response){
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

self.addEventListener('install', function(event){
  event.waitUntil(caches.open(HAPPYAD_STATIC_CACHE).then(function(cache){
    return cache.addAll(HAPPYAD_APP_SHELL).catch(function(){return true;});
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

self.addEventListener('fetch', function(event){
  var request=event.request;
  if(!request || request.method !== 'GET')return;
  if(isSupabaseOrExternal(request.url) || isHeavyMedia(request))return;
  if(!sameOrigin(request.url))return;

  var dest=request.destination||'';
  if(request.mode==='navigate' || dest==='document' || /\.html(\?|$)/i.test(new URL(request.url).pathname)){
    event.respondWith(networkFirst(request));
    return;
  }
  if(dest==='script' || dest==='style' || dest==='worker' || /\.(js|css|webmanifest)(\?|$)/i.test(new URL(request.url).pathname)){
    event.respondWith(networkFirst(request));
    return;
  }
  if(dest==='image' || /\.(png|jpg|jpeg|webp|svg|ico)(\?|$)/i.test(new URL(request.url).pathname)){
    event.respondWith(cacheFirst(request));
  }
});
