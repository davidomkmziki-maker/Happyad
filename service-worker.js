/* HAPPYAD V647 - Correction installation PWA bloquée : install immédiate, cache runtime seulement. */
'use strict';

var HAPPYAD_SW_VERSION='v647-pwa-install-finish-fix';
var HAPPYAD_RUNTIME_CACHE=HAPPYAD_SW_VERSION+'-runtime';

function isHappyCache(name){return String(name||'').toLowerCase().indexOf('happyad')>-1;}
function isCurrentCache(name){return name===HAPPYAD_RUNTIME_CACHE;}
function safeUrl(url){try{return new URL(url);}catch(e){return null;}}
function sameOrigin(url){var u=safeUrl(url);return !!u && u.origin===self.location.origin;}
function externalOrSupabase(url){
  var u=safeUrl(url);if(!u)return true;
  return u.origin!==self.location.origin || /supabase\.co|storage\.googleapis\.com|cloudinary|res\.cloudinary/i.test(u.hostname);
}
function heavyMedia(request){
  try{
    var u=new URL(request.url), d=request.destination||'';
    return d==='video'||d==='audio'||/\.(mp4|mov|webm|m4v|mp3|wav|ogg)(\?|$)/i.test(u.pathname);
  }catch(e){return false;}
}
function cleanOldHappyCaches(){
  return caches.keys().then(function(keys){
    return Promise.all(keys.map(function(key){
      if(isHappyCache(key)&&!isCurrentCache(key))return caches.delete(key);
      return Promise.resolve(false);
    }));
  }).catch(function(){return true;});
}
function networkFirst(request){
  return caches.open(HAPPYAD_RUNTIME_CACHE).then(function(cache){
    return fetch(request,{cache:'no-store'}).then(function(response){
      try{if(response&&response.ok&&sameOrigin(request.url))cache.put(request,response.clone());}catch(e){}
      return response;
    }).catch(function(){
      return caches.match(request).then(function(cached){
        if(cached)return cached;
        if(request.mode==='navigate'||request.destination==='document')return caches.match('./index.html');
        return cached;
      });
    });
  });
}
function cacheFirst(request){
  return caches.match(request).then(function(cached){
    if(cached)return cached;
    return fetch(request).then(function(response){
      try{if(response&&response.ok&&sameOrigin(request.url))caches.open(HAPPYAD_RUNTIME_CACHE).then(function(cache){cache.put(request,response.clone());});}catch(e){}
      return response;
    });
  });
}

self.addEventListener('install',function(event){
  /* Ne jamais bloquer l'installation avec addAll : Android/Chrome peut rester sur "Installation..." si un seul fichier répond lentement. */
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate',function(event){
  event.waitUntil(cleanOldHappyCaches().then(function(){return self.clients.claim();}));
});

self.addEventListener('message',function(event){
  try{
    var type=event&&event.data&&event.data.type;
    if(type==='HAPPYAD_SKIP_WAITING')event.waitUntil(self.skipWaiting());
    if(type==='HAPPYAD_CLEAR_OLD_CACHES')event.waitUntil(cleanOldHappyCaches());
  }catch(e){}
});

self.addEventListener('fetch',function(event){
  var request=event.request;
  if(!request||request.method!=='GET')return;
  if(externalOrSupabase(request.url)||heavyMedia(request))return;
  if(!sameOrigin(request.url))return;
  var u=safeUrl(request.url); if(!u)return;
  var dest=request.destination||'';
  if(request.mode==='navigate'||dest==='document'||/\.html(\?|$)/i.test(u.pathname)){
    event.respondWith(networkFirst(request));return;
  }
  if(dest==='script'||dest==='style'||dest==='worker'||/\.(js|css|webmanifest)(\?|$)/i.test(u.pathname)){
    event.respondWith(networkFirst(request));return;
  }
  if(dest==='image'||/\.(png|jpg|jpeg|webp|svg|ico)(\?|$)/i.test(u.pathname)){
    event.respondWith(cacheFirst(request));return;
  }
});
