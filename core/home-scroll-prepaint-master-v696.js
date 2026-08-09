(function(){
  'use strict';
  if(window.__HAPPYAD_HOME_SCROLL_PREPAINT_V696__)return;
  window.__HAPPYAD_HOME_SCROLL_PREPAINT_V696__=true;

  var VERSION='V855R97_HOME_VERTICAL_SCROLL_BUDGET';
  var list=null,io=null,nearCards=new Set(),nearRaf=0;
  function cssUrl(value){return 'url("'+String(value||'').replace(/\\/g,'\\\\').replace(/"/g,'\\"')+'")'}
  function installCss(){
    if(document.getElementById('happyad-home-scroll-prepaint-v696-css'))return;
    var st=document.createElement('style');st.id='happyad-home-scroll-prepaint-v696-css';st.textContent=`
#list.homeTimeline .miniCard{content-visibility:auto!important;contain-intrinsic-size:auto 680px!important;will-change:auto!important;transform:none!important;backface-visibility:visible!important;}
#list.homeTimeline .miniCard.videoCard{contain-intrinsic-size:auto 620px!important;}
#list.homeTimeline .miniCard.haAlbumFullPagerCard{contain-intrinsic-size:auto 760px!important;}
#list.homeTimeline .miniCardFrame{will-change:auto!important;transform:none!important;backface-visibility:visible!important;background:#0a0d13!important;}
#list.homeTimeline .miniMedia,#list.homeTimeline .happyadAlbumSlide{background-color:#111722!important;background-image:linear-gradient(145deg,#171d28,#0a0e15)!important;background-size:cover!important;background-position:center!important;}
#list.homeTimeline .miniMedia.haHomePaintReadyV696,#list.homeTimeline .happyadAlbumSlide.haHomePaintReadyV696{background-image:var(--ha-home-paint-v696),linear-gradient(145deg,#171d28,#0a0e15)!important;background-size:cover!important;background-position:center!important;}
#list.homeTimeline .miniMedia>img,#list.homeTimeline .happyadAlbumSlide img{visibility:visible!important;opacity:1!important;backface-visibility:visible!important;}
`;
    document.head.appendChild(st);
  }
  function mediaBoxes(card){return card?[].slice.call(card.querySelectorAll('.miniMedia,.happyadAlbumSlide')):[]}
  function rememberImage(img,priority){
    if(!img)return;
    var box=img.closest&&img.closest('.miniMedia,.happyadAlbumSlide');
    var src=String(img.currentSrc||img.getAttribute('src')||'').trim();
    try{img.loading=priority?'eager':'lazy';img.decoding='async';img.fetchPriority=priority?'high':'auto'}catch(_e){}
    function ready(){
      var actual=String(img.currentSrc||img.getAttribute('src')||src||'').trim();
      if(box&&actual){box.style.setProperty('--ha-home-paint-v696',cssUrl(actual));box.classList.add('haHomePaintReadyV696')}
      /* R97 : ne pas déclencher un décodage explicite des images hors écran. */
      if(priority){try{if(img.decode)img.decode().catch(function(){})}catch(_e){}}
    }
    if(img.complete&&img.naturalWidth>0)ready();
    else if(!img.__happyadPaintBoundV696){img.__happyadPaintBoundV696=true;img.addEventListener('load',ready,{once:true});}
  }
  function prime(card,priority){
    if(!card||!card.isConnected)return;
    /* V767 : ce module ne lance plus jamais hydrateMedia().
       L'unique propriétaire du chargement média reste observeHomeCard() dans
       index.html. Le prépeint se limite aux images déjà créées par ce maître. */
    [].slice.call(card.querySelectorAll('img')).forEach(function(img){rememberImage(img,priority)});
    mediaBoxes(card).forEach(function(box){
      var img=box.querySelector('img');if(img)rememberImage(img,priority);
      else if(!box.classList.contains('haHomePaintReadyV696'))box.style.backgroundColor='#111722';
    });
  }
  function primeNearCards(){
    nearRaf=0;
    nearCards.forEach(function(card){
      if(!card||!card.isConnected){nearCards.delete(card);return;}
      prime(card,true);
    });
  }
  function queueNearPrime(){if(nearRaf)return;nearRaf=requestAnimationFrame(primeNearCards)}
  function observeCard(card){
    if(!card||!card.matches||!card.matches('.miniCard:not(.happyadSkeletonCard)'))return;
    if(io)io.observe(card);else{nearCards.add(card);prime(card,false);}
  }
  function unobserveTree(node){
    if(!node||node.nodeType!==1)return;
    var cards=[];
    if(node.matches&&node.matches('.miniCard'))cards.push(node);
    if(node.querySelectorAll)cards=cards.concat([].slice.call(node.querySelectorAll('.miniCard')));
    cards.forEach(function(card){nearCards.delete(card);try{if(io)io.unobserve(card)}catch(_e){}});
  }
  function observeAddedTree(node){
    if(!node||node.nodeType!==1)return;
    var cards=[];
    if(node.matches&&node.matches('.miniCard'))cards.push(node);
    if(node.querySelectorAll)cards=cards.concat([].slice.call(node.querySelectorAll('.miniCard')));
    cards.forEach(observeCard);

    /* Une image peut être insérée après l'entrée de la carte dans la zone proche.
       Dans ce cas, ne retraiter que sa carte propriétaire, jamais toute la liste. */
    var owner=node.closest&&node.closest('.miniCard:not(.happyadSkeletonCard)');
    if(owner&&nearCards.has(owner))prime(owner,true);
  }
  /* R93 : aucune classe de carte n'est ajoutée/retirée pendant le scroll.
     L'IntersectionObserver sert uniquement à précharger les médias proches.
     content-visibility:auto reste le seul arbitre de peinture du navigateur. */
  function observe(){
    list=document.getElementById('list');if(!list)return;
    if('IntersectionObserver' in window){
      io=new IntersectionObserver(function(entries){
        entries.forEach(function(en){
          if(en.isIntersecting){
            nearCards.add(en.target);
            /* R72 : priorité élevée uniquement pour la carte réellement visible ou
               immédiatement voisine, pas pour toute la grande zone de prépeinture. */
            var r=null,vh=window.innerHeight||700,priority=false;
            try{r=en.target.getBoundingClientRect();priority=!!(r&&r.bottom>-260&&r.top<vh+420)}catch(_r){}
            prime(en.target,priority)
          }else{
            nearCards.delete(en.target);
          }
        });
      },{root:null,rootMargin:'700px 0px 900px 0px',threshold:[0,.01]});
    }
    [].slice.call(list.querySelectorAll('.miniCard:not(.happyadSkeletonCard)')).forEach(observeCard);
    try{
      new MutationObserver(function(records){
        records.forEach(function(rec){
          [].slice.call(rec.removedNodes||[]).forEach(unobserveTree);
          [].slice.call(rec.addedNodes||[]).forEach(observeAddedTree);
        });
      }).observe(list,{childList:true,subtree:true});
    }catch(_e){}
    queueNearPrime();
  }
  installCss();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observe,{once:true});else observe();
  window.addEventListener('pageshow',queueNearPrime,true);
  window.addEventListener('focus',queueNearPrime,true);
  /* R72 : resize Android peut accompagner la disparition de la barre navigateur pendant le scroll. */
  window.addEventListener('orientationchange',queueNearPrime,{passive:true});
  try{if(window.HappyMasterRegistry)HappyMasterRegistry.register('home-scroll-prepaint',{file:'core/home-scroll-prepaint-master-v696.js',responsibility:'géométrie visible préparée avant écran; prépeinture des seules cartes proches; aucun scan global ni hydratation média',active:true,version:VERSION})}catch(_e){}
})();
