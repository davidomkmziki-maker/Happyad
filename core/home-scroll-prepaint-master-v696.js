(function(){
  'use strict';
  if(window.__HAPPYAD_HOME_SCROLL_PREPAINT_V696__)return;
  window.__HAPPYAD_HOME_SCROLL_PREPAINT_V696__=true;

  var VERSION='V767_HOME_SINGLE_MEDIA_HYDRATOR';
  var list=null,io=null,raf=0,fastTimer=0,lastY=window.scrollY||0,lastAt=performance.now?performance.now():Date.now();
  function cssUrl(value){return 'url("'+String(value||'').replace(/\\/g,'\\\\').replace(/"/g,'\\"')+'")'}
  function installCss(){
    if(document.getElementById('happyad-home-scroll-prepaint-v696-css'))return;
    var st=document.createElement('style');st.id='happyad-home-scroll-prepaint-v696-css';st.textContent=`
#list.homeTimeline .miniCard{content-visibility:visible!important;contain:none!important;contain-intrinsic-size:none!important;will-change:auto!important;transform:none!important;backface-visibility:visible!important;}
#list.homeTimeline .miniCardFrame{contain:none!important;will-change:auto!important;transform:none!important;backface-visibility:visible!important;background:#0a0d13!important;}
#list.homeTimeline .miniMedia,#list.homeTimeline .happyadAlbumSlide{background-color:#111722!important;background-image:linear-gradient(145deg,#171d28,#0a0e15)!important;background-size:cover!important;background-position:center!important;}
#list.homeTimeline .miniMedia.haHomePaintReadyV696,#list.homeTimeline .happyadAlbumSlide.haHomePaintReadyV696{background-image:var(--ha-home-paint-v696),linear-gradient(145deg,#171d28,#0a0e15)!important;background-size:cover!important;background-position:center!important;}
#list.homeTimeline .miniMedia>img,#list.homeTimeline .happyadAlbumSlide img{visibility:visible!important;opacity:1!important;backface-visibility:visible!important;}
body.haHomeFastScrollV696 #list.homeTimeline .miniCard,body.haHomeFastScrollV696 #list.homeTimeline .miniCardFrame{box-shadow:none!important;transition:none!important;animation:none!important;}
body.haHomeFastScrollV696 #list.homeTimeline .miniMedia::before,body.haHomeFastScrollV696 #list.homeTimeline .happyadAlbumSlide::before{filter:none!important;opacity:.16!important;transform:none!important;}
body.haHomeFastScrollV696 #list.homeTimeline *{scroll-behavior:auto!important;}
`;
    document.head.appendChild(st);
  }
  function mediaBoxes(card){return card?[].slice.call(card.querySelectorAll('.miniMedia,.happyadAlbumSlide')):[]}
  function rememberImage(img,priority){
    if(!img)return;
    var box=img.closest&&img.closest('.miniMedia,.happyadAlbumSlide');
    var src=String(img.currentSrc||img.getAttribute('src')||'').trim();
    try{img.loading='eager';img.decoding='async';if(priority)img.fetchPriority='high';else if(!img.fetchPriority)img.fetchPriority='auto'}catch(_e){}
    function ready(){
      var actual=String(img.currentSrc||img.getAttribute('src')||src||'').trim();
      if(box&&actual){box.style.setProperty('--ha-home-paint-v696',cssUrl(actual));box.classList.add('haHomePaintReadyV696')}
      try{if(img.decode)img.decode().catch(function(){})}catch(_e){}
    }
    if(img.complete&&img.naturalWidth>0)ready();
    else if(!img.__happyadPaintBoundV696){img.__happyadPaintBoundV696=true;img.addEventListener('load',ready,{once:true});}
  }
  function prime(card,priority){
    if(!card)return;
    /* V767 : ce module ne lance plus jamais hydrateMedia().
       L'unique propriétaire du chargement média reste observeHomeCard() dans
       index.html. Le prépeint se limite aux images déjà créées par ce maître. */
    [].slice.call(card.querySelectorAll('img')).forEach(function(img){rememberImage(img,priority)});
    mediaBoxes(card).forEach(function(box){
      var img=box.querySelector('img');if(img)rememberImage(img,priority);
      else if(!box.classList.contains('haHomePaintReadyV696'))box.style.backgroundColor='#111722';
    });
  }
  function scan(){
    raf=0;list=document.getElementById('list');if(!list||!list.classList.contains('homeTimeline'))return;
    var vh=Math.max(window.innerHeight||0,document.documentElement.clientHeight||0,600);
    [].slice.call(list.querySelectorAll('.miniCard:not(.happyadSkeletonCard)')).forEach(function(card){
      var r=card.getBoundingClientRect();
      if(r.bottom>-vh*3.2&&r.top<vh*3.2)prime(card,r.bottom>-vh*.6&&r.top<vh*1.6);
    });
  }
  function queueScan(){if(raf)return;raf=requestAnimationFrame(scan)}
  function markFast(){
    var now=performance.now?performance.now():Date.now(),y=window.scrollY||document.documentElement.scrollTop||0,dt=Math.max(1,now-lastAt),speed=Math.abs(y-lastY)/dt;
    lastY=y;lastAt=now;
    if(speed>.75){document.body.classList.add('haHomeFastScrollV696');clearTimeout(fastTimer);fastTimer=setTimeout(function(){document.body.classList.remove('haHomeFastScrollV696');queueScan()},150)}
    queueScan();
  }
  function observe(){
    list=document.getElementById('list');if(!list)return;
    if('IntersectionObserver' in window){
      io=new IntersectionObserver(function(entries){entries.forEach(function(en){if(en.isIntersecting)prime(en.target,en.intersectionRatio>.01)})},{root:null,rootMargin:'2200px 0px',threshold:[0,.01]});
      [].slice.call(list.querySelectorAll('.miniCard:not(.happyadSkeletonCard)')).forEach(function(card){io.observe(card)});
    }
    try{new MutationObserver(function(records){records.forEach(function(rec){[].slice.call(rec.addedNodes||[]).forEach(function(node){if(!node||node.nodeType!==1)return;var cards=[];if(node.matches&&node.matches('.miniCard'))cards.push(node);if(node.querySelectorAll)cards=cards.concat([].slice.call(node.querySelectorAll('.miniCard')));cards.forEach(function(card){prime(card,false);if(io)io.observe(card)})})});queueScan()}).observe(list,{childList:true,subtree:true})}catch(_e){}
    queueScan();setTimeout(queueScan,250);setTimeout(queueScan,900);
  }
  installCss();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observe,{once:true});else observe();
  window.addEventListener('scroll',markFast,{passive:true,capture:true});
  window.addEventListener('pageshow',queueScan,true);window.addEventListener('focus',queueScan,true);window.addEventListener('resize',queueScan,{passive:true});
  try{if(window.HappyMasterRegistry)HappyMasterRegistry.register('home-scroll-prepaint',{file:'core/home-scroll-prepaint-master-v696.js',responsibility:'prépeinture visuelle Accueil uniquement; aucune hydratation ni requête média',active:true,version:VERSION})}catch(_e){}
})();
