/* HAPPYAD V534 — PWA UPDATE FORCE / CLIENT RELOAD
   - Met à jour automatiquement index, modules, boutique, messages, CSS, JS, manifest.
   - Ne met jamais Supabase/API en cache.
   - Force les anciennes PWA déjà installées à charger la dernière version.
*/
const HAPPYAD_PWA_VERSION='v546boutiquereturn1';
const APP_CACHE='HAPPYAD-PWA-APP-SHELL-'+HAPPYAD_PWA_VERSION;
const RUNTIME_CACHE='HAPPYAD-PWA-RUNTIME-'+HAPPYAD_PWA_VERSION;

const APP_SHELL=[
  './',
  './index.html',
  './messages.html',
  './boutique.html',
  './manifest.webmanifest',
  './icons/happyad-icon-v535center1-48.png',
  './icons/happyad-icon-v535center1-72.png',
  './icons/happyad-icon-v535center1-96.png',
  './icons/happyad-icon-v535center1-128.png',
  './icons/happyad-icon-v535center1-144.png',
  './icons/happyad-icon-v535center1-152.png',
  './icons/happyad-icon-v535center1-180.png',
  './icons/happyad-icon-v535center1-192.png',
  './icons/happyad-icon-v535center1-384.png',
  './icons/happyad-icon-v535center1-512.png',
  './icons/happyad-icon-v535center1-maskable-192.png',
  './icons/happyad-icon-v535center1-maskable-512.png',
  './icons/happyad-icon-v535center1-source.png',

  './modules/user.html',
  './modules/photo.html',
  './modules/video.html',
  './modules/publish.html',
  './modules/map.html',
  './modules/notifications.html'];

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(APP_CACHE);
    for(const item of APP_SHELL){
      try{await cache.add(new Request(item,{cache:'reload'}));}catch(e){}
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();

    await Promise.all(keys.map(k=>{
      if(k.startsWith('HAPPYAD-PWA-APP-SHELL-')||k.startsWith('HAPPYAD-PWA-RUNTIME-')){
        if(k!==APP_CACHE&&k!==RUNTIME_CACHE)return caches.delete(k);
      }
      return Promise.resolve(false);
    }));

    await self.clients.claim();

    /* HAPPYAD V534 STEP1:
   Ne pas forcer une navigation automatique ici.
   Sinon la PWA recharge une deuxième fois après ouverture.
   index.html gère déjà l'activation du service worker. */
  })());
});

self.addEventListener('message',event=>{
  try{
    const d=event&&event.data;
    if(d&&d.type==='HAPPYAD_SKIP_WAITING')self.skipWaiting();
    if(d&&d.type==='HAPPYAD_CLEAR_OLD_CACHES'){
      event.waitUntil((async()=>{
        const keys=await caches.keys();
        await Promise.all(keys.map(k=>{
          if(k.startsWith('HAPPYAD-PWA-APP-SHELL-')||k.startsWith('HAPPYAD-PWA-RUNTIME-')){
            if(k!==APP_CACHE&&k!==RUNTIME_CACHE)return caches.delete(k);
          }
          return Promise.resolve(false);
        }));
      })());
    }
  }catch(e){}
});

function isApiRequest(url){
  const h=(url.hostname||'').toLowerCase();
  const p=(url.pathname||'').toLowerCase();
  return h.includes('supabase.co') || h.includes('supabase.in') || p.includes('/rest/v1/') || p.includes('/auth/v1/') || p.includes('/storage/v1/') || p.includes('/realtime/v1/');
}

function shouldNetworkFirst(url,request){
  const p=(url.pathname||'').toLowerCase();
  return request.mode==='navigate'
    || request.destination==='script'
    || request.destination==='style'
    || request.destination==='document'
    || p.endsWith('.html')
    || p.endsWith('.js')
    || p.endsWith('.css')
    || p.endsWith('.webmanifest');
}

async function networkFirst(request){
  const cache=await caches.open(RUNTIME_CACHE);

  try{
    const res=await fetch(request,{cache:'reload'});
    if(res && res.ok){
      cache.put(request,res.clone()).catch(()=>{});
    }
    return res;
  }catch(_e){
    const cached=(await cache.match(request)) || (await caches.match(request));
    if(cached)return cached;
    return request.mode==='navigate'
      ? ((await caches.match('./index.html')) || Response.error())
      : Response.error();
  }
}

async function cacheFirstUpdate(request){
  const cached=await caches.match(request);
  const fetchPromise=fetch(request).then(res=>{
    if(res && res.ok){
      caches.open(RUNTIME_CACHE).then(cache=>cache.put(request,res.clone())).catch(()=>{});
    }
    return res;
  }).catch(()=>null);
  return cached || fetchPromise || Response.error();
}

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(!request || request.method!=='GET')return;

  const url=new URL(request.url);
  if(isApiRequest(url))return;
  if(url.origin!==self.location.origin)return;

  if((url.pathname||'').toLowerCase().endsWith('/reset-password.html')){
    event.respondWith(fetch(request,{cache:'reload'}).catch(async()=>{
      return (await caches.match('./reset-password.html')) || Response.error();
    }));
    return;
  }

  if(shouldNetworkFirst(url,request)){
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(cacheFirstUpdate(request));
});
