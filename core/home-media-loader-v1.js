/* HAPPYAD HOME MEDIA LOADER V1
   Responsabilité unique : hydrater les médias des cartes Accueil sans toucher à
   l'ordre, à la pagination ni à la géométrie structurelle du fil.
   - un seul IntersectionObserver pour les médias du feed
   - album : diapositive active + une voisine de chaque côté uniquement
   - photo : miniature -> original en secours, sans reconstruire la carte
   - vidéo : poster seulement dans le feed ; la lecture reste dans Centrale vidéo
   - nettoyage centralisé des ObjectURL et des vidéos lors du retrait d'une carte */
(function(){
  'use strict';
  if(window.HappyHomeMediaLoaderV1)return;

  var VERSION='V1';
  var bridge=null;
  var io=null;
  var ROOT_MARGIN='320px 0px 460px 0px';

  function connect(adapter){bridge=adapter||null;return api;}
  function fn(name){return bridge&&typeof bridge[name]==='function'?bridge[name]:null;}
  function call(name){var f=fn(name);if(!f)return undefined;return f.apply(bridge,[].slice.call(arguments,1));}
  function text(v){return String(v==null?'':v);}

  function isNear(card){
    try{
      var idx=Number(card&&card.dataset&&card.dataset.virtualIndex);
      return !!(card&&card.dataset&&card.dataset.happyadNearViewportV763==='1') ||
        (Number.isFinite(idx)&&idx>=0&&idx<3&&Number(window.__happyadHomeWindowStartV616||0)===0);
    }catch(_e){return false;}
  }

  function mediaAttrs(card){
    return isNear(card)?' loading="eager" fetchpriority="high" decoding="async"':' loading="lazy" fetchpriority="auto" decoding="async"';
  }

  function applyImagePriority(img,card,force){
    if(!img)return;
    var hot=!!force||isNear(card);
    try{img.loading=hot?'eager':'lazy';}catch(_e){}
    try{img.fetchPriority=hot?'high':'auto';}catch(_e){}
    try{img.decoding='async';}catch(_e){}
  }

  function rememberObjectUrl(card,url){
    if(!card||!url||text(url).indexOf('blob:')!==0)return;
    var arr=card.__happyadObjectUrlsV1||(card.__happyadObjectUrlsV1=[]);
    if(arr.indexOf(url)<0)arr.push(url);
    if(!card.dataset.happyadObjectUrl)card.dataset.happyadObjectUrl=url;
  }

  async function urlForPost(p,card){
    try{
      p=p||{};
      var direct=p.mediaUrl||p.media_url||p.homeMediaUrl||p.home_media_url||p.imageUrl||p.image_url||p.photoUrl||p.photo_url||p.videoUrl||p.video_url||p.url||p.src||'';
      if(direct)return text(direct).trim();
      var getter=fn('getMedia');
      if(!getter||!p.id)return '';
      var m=await getter(p.id);
      if(m&&m.blob){var u=URL.createObjectURL(m.blob);rememberObjectUrl(card,u);return u;}
    }catch(_e){}
    return '';
  }

  function applyCrop(img,p){
    try{
      var c=call('resolveCrop',p);
      if(!c)return false;
      img.classList.add('happyadCropImg');
      img.style.setProperty('--ha-crop-focus-x',Number(c.x||50)+'%');
      img.style.setProperty('--ha-crop-focus-y',Number(c.y||50)+'%');
      img.style.setProperty('--ha-crop-scale',Number(c.scale||1));
      return true;
    }catch(_e){return false;}
  }

  function markPhotoReady(card,p,img){
    if(!card)return;
    card.dataset.mediaReady='1';
    card.dataset.mediaRetryV764='0';
    try{card.classList.remove('happyadMediaLoadingV764');}catch(_e){}
    try{call('learnPhotoRatio',p,img);}catch(_e){}
  }

  function bindProgressive(card,box,img,primary,fallback,p){
    if(!card||!box||!img)return;
    var triedFallback=false;
    function ready(){markPhotoReady(card,p,img);}
    function fail(){
      var current=text(img.currentSrc||img.getAttribute('src')||'');
      if(!triedFallback&&fallback&&fallback!==primary&&current!==fallback){
        triedFallback=true;try{img.src=fallback;return;}catch(_e){}
      }
      var retry=Number(card.dataset.mediaRetryV764||0);
      if(retry<2&&card.isConnected){
        card.dataset.mediaRetryV764=String(retry+1);
        card.dataset.mediaReady='';
        card.classList.add('happyadMediaLoadingV764');
        box.innerHTML='<div class="happyadHomeMediaProgressV764"><i></i><span>Chargement...</span></div>';
        setTimeout(function(){if(card.isConnected)hydrate(card,card.__happyadPost,!!card.__happyadVideo);},700*(retry+1));
        return;
      }
      card.dataset.mediaReady='error';
      card.classList.remove('happyadMediaLoadingV764');
      box.innerHTML='<div class="happyadMediaUnavailableV643">Média indisponible</div>';
    }
    img.addEventListener('load',ready,{once:true});
    img.addEventListener('error',fail);
    if(img.complete&&img.naturalWidth>0)ready();
  }

  function renderPhoto(card,box,p,primary,fallback){
    try{call('setPhotoBg',box,fallback||primary);}catch(_e){}
    var crop=null;try{crop=call('resolveCrop',p);}catch(_e){}
    try{box.classList.toggle('haPhotoUserCropV613D',!!crop);}catch(_e){}
    try{call('preparePhotoRatio',box,p);}catch(_e){}
    var img=document.createElement('img');
    img.alt='';applyImagePriority(img,card,false);applyCrop(img,p);
    box.replaceChildren(img);
    bindProgressive(card,box,img,primary,fallback,p);
    img.src=primary||fallback||'';
  }

  async function hydrateAlbum(card,p){
    try{
      if(!card||!p)return;
      var shell=call('prepareAlbumShell',card,p);
      if(!shell||!shell.track)return;
      var items=shell.items||[];
      var track=shell.track;
      var slides=[].slice.call(track.querySelectorAll('.haAlbumFullSlide'));
      card.dataset.mediaReady='1';
      card.classList.remove('happyadMediaLoadingV764');

      function loadOne(i,priority){
        i=Number(i);
        if(!Number.isFinite(i)||i<0||i>=slides.length)return;
        var slide=slides[i],it=items[i]||p;
        var media=slide&&slide.querySelector('.haAlbumSingleMedia');
        if(!media||media.dataset.albumMediaReadyV772==='1'||media.dataset.albumMediaReadyV772==='loading')return;
        media.dataset.albumMediaReadyV772='loading';
        (async function(){
          try{
            var url=await urlForPost(it,card);
            if(!url){media.dataset.albumMediaReadyV772='error';media.innerHTML='<div class="happyadAlbumLoading">Média introuvable</div>';return;}
            var im=document.createElement('img');
            im.alt='';im.loading='eager';im.decoding='async';
            try{im.fetchPriority=priority?'high':'auto';}catch(_fp){}
            im.onload=function(){media.dataset.albumMediaReadyV772='1';try{call('learnPhotoRatio',it,im);}catch(_r){}};
            im.onerror=function(){media.dataset.albumMediaReadyV772='error';media.innerHTML='<div class="happyadAlbumLoading">Média introuvable</div>';};
            var badge=document.createElement('div');badge.className='happyadAlbumBadge';badge.textContent='▧ '+(i+1);
            media.replaceChildren(im,badge);im.src=url;
          }catch(_e){media.dataset.albumMediaReadyV772='error';media.innerHTML='<div class="happyadAlbumLoading">Erreur média</div>';}
        })();
      }

      function primeAround(i){
        i=Math.max(0,Math.min(slides.length-1,Number(i)||0));
        loadOne(i,true);loadOne(i-1,false);loadOne(i+1,false);
      }
      track.__haAlbumPrimeAroundV794=primeAround;
      primeAround(Number(track.__haAlbumCurrentIndexV472||0)||0);
    }catch(_e){try{console.warn('home media album hydrate',_e);}catch(_w){}}
  }

  async function hydrate(card,p,video){
    try{
      if(!card||!p)return;
      var box=card.querySelector('.miniMedia');
      if(!box||card.dataset.mediaReady==='1'||card.dataset.mediaReady==='loading'||card.dataset.mediaReady==='error')return;
      card.dataset.mediaReady='loading';card.classList.add('happyadMediaLoadingV764');

      if(!video&&Number(p.__albumCount||0)>1){await hydrateAlbum(card,p);return;}

      var direct=p.mediaUrl||p.media_url||p.homeMediaUrl||p.home_media_url||p.videoUrl||p.video_url||'';
      if(direct){
        if(video){call('renderVideoPreview',box,p,direct);card.dataset.mediaReady='1';card.classList.remove('happyadMediaLoadingV764');}
        else{
          var primary=p.thumbnailUrl||p.thumbnail_url||direct;
          renderPhoto(card,box,p,primary,direct||primary);
        }
        return;
      }

      var url=await urlForPost(p,card);
      if(url){
        if(video){call('renderVideoPreview',box,p,url);card.dataset.mediaReady='1';card.classList.remove('happyadMediaLoadingV764');}
        else renderPhoto(card,box,p,url,'');
      }else{
        card.dataset.mediaReady='error';card.classList.remove('happyadMediaLoadingV764');
        box.innerHTML=video?'<div class="happyadVideoFallback">▶</div>':'<div style="color:#aeb3c0;font-size:12px">Média introuvable</div>';
      }
    }catch(_e){
      var b=card&&card.querySelector?card.querySelector('.miniMedia'):null;
      if(card){card.dataset.mediaReady='';card.classList.remove('happyadMediaLoadingV764');}
      if(b)b.innerHTML=video?'<div class="happyadVideoFallback">▶</div>':'<div style="color:#aeb3c0;font-size:12px">Erreur média</div>';
    }
  }

  function stopVideo(card){
    try{var v=card&&card.querySelector&&card.querySelector('video');if(v){if(v.__tuHandler)v.removeEventListener('timeupdate',v.__tuHandler);v.pause();}}catch(_e){}
  }

  function ensureObserver(){
    if(io||!('IntersectionObserver' in window))return io;
    io=new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        var c=en.target,pp=c&&c.__happyadPost,vv=!!(c&&c.__happyadVideo);
        if(!c||!pp)return;
        if(en.isIntersecting){c.dataset.happyadNearViewportV763='1';hydrate(c,pp,vv);}
        else{delete c.dataset.happyadNearViewportV763;if(vv)stopVideo(c);}
      });
    },{root:null,rootMargin:ROOT_MARGIN,threshold:0});
    return io;
  }

  function observe(card,p,video){
    if(!card||!p)return;
    card.__happyadPost=p;card.__happyadVideo=!!video;
    if(!('IntersectionObserver' in window)){hydrate(card,p,!!video);return;}
    var ob=ensureObserver();if(ob)ob.observe(card);
  }

  function unobserve(card){try{if(io&&card)io.unobserve(card);}catch(_e){}}

  function dispose(card){
    if(!card)return;
    unobserve(card);stopVideo(card);
    try{
      var arr=card.__happyadObjectUrlsV1||[];
      var old=card.dataset&&card.dataset.happyadObjectUrl;
      if(old&&arr.indexOf(old)<0)arr.push(old);
      arr.forEach(function(u){try{URL.revokeObjectURL(u);}catch(_e){}});
      card.__happyadObjectUrlsV1=[];
      if(card.dataset)delete card.dataset.happyadObjectUrl;
    }catch(_e){}
    try{var tr=card.querySelector&&card.querySelector('.haAlbumFullTrack');if(tr)tr.__haAlbumPrimeAroundV794=null;}catch(_e){}
    try{card.__happyadPost=null;card.__happyadVideo=false;}catch(_e){}
  }

  function state(){return {version:VERSION,observer:!!io,rootMargin:ROOT_MARGIN};}
  var api={version:VERSION,connect:connect,observe:observe,hydrate:hydrate,hydrateAlbum:hydrateAlbum,stopVideo:stopVideo,unobserve:unobserve,dispose:dispose,urlForPost:urlForPost,mediaAttrs:mediaAttrs,state:state};
  window.HappyHomeMediaLoaderV1=api;
  try{if(window.HappyMasterRegistry)window.HappyMasterRegistry.register('home-media-loader-v1',{file:'core/home-media-loader-v1.js',responsibility:'hydratation média unique Accueil, observer, voisins albums et nettoyage ObjectURL',active:true,version:VERSION});}catch(_e){}
})();
