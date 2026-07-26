/* HAPPYAD V665 — cartes persistantes au retour + isolation légère; fullscreen V662 conservé. */
/* HAPPYAD V620 — profil en mode scroll léger + cartes portrait. */
(function(){
  'use strict';
  if(window.__HAPPYAD_PROFILE_MASTER_V619__)return;
  window.__HAPPYAD_PROFILE_MASTER_V619__=true;
  var scheduled=0, io=null;
  function cardRevisionV665(card){
    try{
      var media=card.querySelector('.profileMedia');
      var node=media&&media.querySelector('img,video');
      return [
        String(card.dataset.postId||''),
        String(card.dataset.kind||card.dataset.profileMediaType||''),
        String(card.dataset.profileContentSig||card.dataset.happyadPublicContentSigV646||''),
        String(media&&(
          media.dataset.profileMediaSig||
          media.dataset.happyadPublicMediaSigV646||
          media.dataset.happyadPublicMediaStateV652||''
        )||''),
        String(node&&node.tagName||''),
        String(node&&(node.currentSrc||node.src||node.getAttribute&&node.getAttribute('src'))||''),
        String(media&&media.childElementCount||0)
      ].join('|');
    }catch(_e){return String(Date.now());}
  }
  function optimize(){
    scheduled=0;
    try{
      var cards=document.querySelectorAll('#publicationsBox .profilePost');
      cards.forEach(function(card,index){
        var revision=cardRevisionV665(card);
        if(card.dataset.haProfileOptimizedV665===revision)return;
        card.classList.add('haProfileRenderOptimizedV619');
        card.querySelectorAll('img').forEach(function(img){
          img.decoding='async';
          /* Une image déjà décodée n'est jamais reconfigurée au retour du module. */
          if(!(img.complete&&img.naturalWidth>0))img.loading=index<4?'eager':'lazy';
          if(index<2&&!(img.complete&&img.naturalWidth>0))img.fetchPriority='high';
          else img.removeAttribute('fetchpriority');
          img.draggable=false;
        });
        card.querySelectorAll('video').forEach(function(v){
          try{v.pause();}catch(_e){}
          v.muted=true;v.playsInline=true;v.removeAttribute('autoplay');
          /* Ne pas redémarrer une miniature vidéo déjà prête lors d'un retour. */
          if(v.readyState<2&&!v.classList.contains('hpvReady'))v.preload=index<2?'metadata':'none';
          else if(!v.getAttribute('preload'))v.preload='metadata';
        });
        card.dataset.haProfileOptimizedV665=revision;
      });
    }catch(_e){}
  }
  function queue(){if(scheduled)return;scheduled=requestAnimationFrame(optimize);}
  function boot(){
    queue();
    var box=document.getElementById('publicationsBox');
    if(box){
      var mo=new MutationObserver(queue);
      mo.observe(box,{childList:true,subtree:true});
      window.__HAPPYAD_PROFILE_MASTER_V619_OBSERVER__=mo;
    }
    document.addEventListener('happyad:profile-posts-rendered',queue);
    window.addEventListener('message',function(ev){var d=ev&&ev.data;if(d&&(d.type==='HAPPYAD_PROFILE_SHOW_V601'||d.type==='HAPPYAD_MODULE_RESUME'))queue();},true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();


/* ===== profile-post-feed-master-v581.js ===== */
(function(){
  'use strict';
  if(window.__HAPPYAD_PROFILE_POST_FEED_MASTER_V581__)return;
  window.__HAPPYAD_PROFILE_POST_FEED_MASTER_V581__=true;

  var doc=document;
  var root=null,scroller=null,posts=[],sourceCard=null,sourceScope=null;
  var savedScrollY=0,bodyStyle=null,closing=false;
  var pointerStart=null,suppressClickUntil=0,lastBackAt=0;
  var albumScrollHandlers=[];
  var currentPostIndex=0,scrollSettleTimer=0,windowRenderToken=0;
  var albumPositions={};
  var fullscreenPauseReasonV660='profile-photo-fullscreen-v660';

  function setProfileFullscreenActiveV660(on){
    on=!!on;
    window.__HAPPYAD_PROFILE_FULLSCREEN_ACTIVE_V660__=on;
    try{doc.documentElement.classList.toggle('haProfileFullscreenActiveV660',on);}catch(_e){}
    try{doc.body&&doc.body.classList.toggle('haProfileFullscreenActiveV660',on);}catch(_e){}
    if(on){
      try{
        doc.querySelectorAll('#publicationsBox video').forEach(function(v){
          try{v.pause();v.preload='none';}catch(_e){}
        });
      }catch(_e){}
      try{if(window.HappyModuleLifecycleV620&&typeof window.HappyModuleLifecycleV620.softPause==='function')window.HappyModuleLifecycleV620.softPause(fullscreenPauseReasonV660);}catch(_e){}
      try{doc.dispatchEvent(new CustomEvent('happyad:profile-fullscreen-open-v660'));}catch(_e){}
      return;
    }
    try{doc.dispatchEvent(new CustomEvent('happyad:profile-fullscreen-close-v660'));}catch(_e){}
    setTimeout(function(){
      try{if(window.HappyModuleLifecycleV620&&typeof window.HappyModuleLifecycleV620.softResume==='function')window.HappyModuleLifecycleV620.softResume(fullscreenPauseReasonV660);}catch(_e){}
      try{if(typeof window.happyadReprimeProfilePreviewVideos==='function')window.happyadReprimeProfilePreviewVideos();}catch(_e){}
    },140);
  }

  function q(s,r){try{return (r||doc).querySelector(s);}catch(_e){return null;}}
  function qa(s,r){try{return Array.prototype.slice.call((r||doc).querySelectorAll(s));}catch(_e){return [];}}
  function clean(v){return String(v==null?'':v).trim();}
  function esc(v){return clean(v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function compact(n){
    try{if(typeof window.happyadCompactCount==='function')return window.happyadCompactCount(n);}catch(_e){}
    n=Math.max(0,Number(n||0)||0);
    function f(x,s){var y=x>=100?Math.floor(x):Math.floor(x*10)/10;return String(y).replace(/\.0$/,'')+s;}
    if(n<1000)return String(Math.floor(n));
    if(n<1e6)return f(n/1e3,'K');
    if(n<1e9)return f(n/1e6,'M');
    return f(n/1e9,'B');
  }
  function icon(name){
    var m={
      back:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>',
      play:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7Z"/></svg>',
      like:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6c-1.9-1.7-4.9-1.5-6.6.5L12 7.6 9.8 5.1C8.1 3.1 5.1 2.9 3.2 4.6 1.1 6.5 1 9.7 3 11.7l9 8.6 9-8.6c2-2 1.9-5.2-.2-7.1Z"/></svg>',
      comment:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-9 8.5 9.6 9.6 0 0 1-4-.9L3 20l1.1-4.2A8.3 8.3 0 0 1 3 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5Z"/></svg>',
      share:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
      repost:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m17 2 4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="m7 22-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/></svg>',
      fav:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z"/></svg>'
    };
    return m[name]||'';
  }
  function toast(msg){
    try{if(typeof window.toast==='function'){window.toast(msg);return;}}catch(_e){}
    var t=q('#toast');if(!t)return;t.textContent=msg;t.classList.add('show');clearTimeout(t.__ha581);t.__ha581=setTimeout(function(){t.classList.remove('show');},1700);
  }
  function isActionTarget(el){return !!(el&&el.closest&&el.closest('button,a,input,textarea,select,label,[role="button"],[data-profile-act],.profileDelete,[data-delete-post],.haPostSheet'));}
  function cardFrom(el){
    var c=el&&el.closest&&el.closest('.profilePost[data-post-id]');
    if(!c)return null;
    if(!c.closest('#profilePostsList,#publicCreatorPosts,#publicationsBox'))return null;
    return c;
  }
  function first(o,names){o=o||{};for(var i=0;i<names.length;i++){var v=o[names[i]];if(v!=null&&clean(v))return clean(v);}return '';}
  function isVideo(p,card){
    var k=clean((p&&p.kind)||(p&&p.type)||(p&&p.media_type)||(p&&p.mediaType)||(card&&card.dataset&&card.dataset.kind)).toLowerCase();
    var u=clean((p&&p.video_url)||(p&&p.videoUrl)||(p&&p.media_url)||(p&&p.mediaUrl)||(card&&card.dataset&&card.dataset.mediaUrl)).toLowerCase();
    return k.indexOf('video')>=0||/\.(mp4|webm|mov|m4v)(?:[?#]|$)/i.test(u)||!!(card&&card.classList&&card.classList.contains('videoPost'))||!!q('video',card);
  }
  function scopeFor(card){
    if(!card||!card.closest)return null;
    return card.closest('#publicCreatorPosts')||card.closest('#profilePostsList')||card.closest('.haProfilePublicationsGridV570')||card.closest('#publicationsBox');
  }
  function isPublicScope(card){
    try{return !!(card&&card.closest&&card.closest('#publicCreatorPosts'))||/(?:^|[?&])public=1(?:&|$)/.test(String(location.search||''));}catch(_e){return false;}
  }
  function imageFromCard(card){var im=q('.profileMedia img[src],img[src]',card);return clean(im&&(im.currentSrc||im.src||im.getAttribute('src')));}
  function videoFromCard(card){var v=q('.profileMedia video[src],video[src]',card);return clean(v&&(v.currentSrc||v.src||v.getAttribute('src')));}
  function posterFromCard(card){var v=q('.profileMedia video',card);return clean(v&&v.poster)||imageFromCard(card);}
  function photoUrl(o){return first(o,['home_media_url','homeMediaUrl','media_url','mediaUrl','image_url','imageUrl','photo_url','photoUrl','url','src','thumbnail_url','thumbnailUrl','poster_url','posterUrl','cover_url','coverUrl','media_path','mediaPath']);}
  function videoUrl(o){return first(o,['video_url_compressed','videoUrlCompressed','video_url_original','videoUrlOriginal','video_url','videoUrl','media_url','mediaUrl','home_media_url','homeMediaUrl','url','src','media_path','mediaPath']);}
  function posterUrl(o){return first(o,['thumbnail_url','thumbnailUrl','poster_url','posterUrl','cover_url','coverUrl','home_media_url','homeMediaUrl','image_url','imageUrl']);}
  function readJson(key){try{return JSON.parse(localStorage.getItem(key)||'null')||{};}catch(_e){return {};}}
  function activeProfile(){return readJson('HAPPYAD_ACTIVE_PROFILE');}
  function ownProfile(){
    try{if(window.UserStore&&window.UserStore.data)return window.UserStore.data||{};}catch(_e){}
    var keys=['HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL','HAPPYAD_USER_V10','HAPPYAD_USER'];
    for(var i=0;i<keys.length;i++){var x=readJson(keys[i]);if(x&&Object.keys(x).length)return x;}
    return {};
  }
  function backgroundUrl(el){
    try{var bg=(el&&getComputedStyle(el).backgroundImage)||'';var m=bg.match(/url\(["']?(.*?)["']?\)/);return clean(m&&m[1]);}catch(_e){return '';}
  }
  function profileIdentity(card){
    var ap=isPublicScope(card)?activeProfile():ownProfile();
    var name=clean((q('#profileName')&&q('#profileName').textContent)||ap.name||ap.full_name||ap.display_name)||'Utilisateur HAPPYAD';
    var av=q('#avatarPreview img,#avatarPreview,#profileAvatar img,#profileAvatar,.avatar img');
    var avatar=clean((av&&(av.currentSrc||av.src||av.getAttribute&&av.getAttribute('src')))||backgroundUrl(av)||ap.avatar||ap.avatar_url);
    var badge='';var bs=q('#badgeSlot');if(bs)badge=bs.innerHTML||'';
    return {name:name,avatar:avatar,badge:badge};
  }
  function normalize(card){
    var p={};try{if(card.__happyadPost)p=Object.assign({},card.__happyadPost);}catch(_e){}
    p.id=clean(p.id||card.dataset.postId);
    p.__card=card;p.__video=isVideo(p,card);
    var ident=profileIdentity(card);
    p.__name=clean(p.creatorName||p.creator_name||p.display_name||p.full_name||p.author_name||p.name)||ident.name;
    p.__avatar=clean(p.avatar||p.avatar_url||p.creator_avatar||p.author_avatar)||ident.avatar;
    p.__badgeHtml=ident.badge;
    var titleEl=q('.profilePostTitle',card),descEl=q('.profilePostDesc',card);
    p.__title=clean(p.title||p.name||(titleEl&&titleEl.textContent))||'Publication HAPPYAD';
    p.__desc=clean(p.description||p.desc||p.caption||(descEl&&descEl.textContent));
    var arrays=[p.__albumItems,p.albumItems,p.items,p.media_items,p.mediaItems,p.photos,p.gallery];
    var arr=null;for(var i=0;i<arrays.length;i++){if(Array.isArray(arrays[i])&&arrays[i].length){arr=arrays[i];break;}}
    if(!arr)arr=[p];
    p.__items=arr.map(function(raw){
      var x=Object.assign({},p,raw||{});x.__video=isVideo(x,card);
      x.__media=x.__video?'':(photoUrl(x)||imageFromCard(card));
      x.__poster=posterUrl(x)||posterFromCard(card);
      return x;
    }).filter(function(x){return !x.__video&&!!x.__media;});
    if(!p.__items.length&&!p.__video){var fallback=imageFromCard(card);if(fallback)p.__items=[{__video:false,__media:fallback,__poster:''}];}
    return p;
  }
  function collect(card){
    var scope=scopeFor(card),cards=[];
    if(scope)cards=qa('.profilePost[data-post-id]',scope);
    if(!cards.length){
      var selector=isPublicScope(card)?'#publicCreatorPosts .profilePost[data-post-id]':'#profilePostsList .profilePost[data-post-id],#publicationsBox .haProfilePublicationsGridV570 .profilePost[data-post-id]';
      cards=qa(selector);
    }
    var seen={};return cards.filter(function(c){
      var id=clean(c.dataset.postId);if(!id||seen[id]||isVideo(c.__happyadPost||{},c))return false;seen[id]=1;return true;
    }).map(normalize).filter(function(p){return !p.__video&&p.__items&&p.__items.length;});
  }
  function counts(p){
    var a={};try{if(typeof window.getHappyAction==='function')a=window.getHappyAction(p.id)||{};}catch(_e){}
    return {like:Number(a.likes||p.likes_count||p.likes||0),comment:Number(a.comments||p.comments_count||p.comments||0),share:Number(a.shares||p.shares_count||p.shares||0),repost:Number(a.reposts||p.reposts_count||0),fav:Number(a.favs||p.saves_count||p.favorites_count||0),likeOn:!!a.like,favOn:!!a.fav};
  }
  function actionHtml(p){var a=counts(p);return [['like',a.like,a.likeOn],['comment',a.comment,false],['share',a.share,false],['repost',a.repost,false],['fav',a.fav,a.favOn]].map(function(x){return '<button class="ha581Action'+(x[2]?' on':'')+'" type="button" data-action="'+x[0]+'">'+icon(x[0])+'<small>'+compact(x[1])+'</small></button>';}).join('');}
  function mediaHtml(p){
    var items=p.__items||[];
    return '<div class="ha581Album" data-count="'+items.length+'">'+items.map(function(it,i){
      if(it.__video){return '<div class="ha581Slide" data-index="'+i+'"><video playsinline preload="none"'+(it.__poster?' poster="'+esc(it.__poster)+'"':'')+(it.__media?' data-src="'+esc(it.__media)+'"':'')+'></video><button class="ha581Play" type="button" aria-label="Lire la vidéo">'+icon('play')+'</button></div>';}
      return '<div class="ha581Slide" data-index="'+i+'">'+(it.__media?'<span class="ha581Loading">Chargement...</span><img data-src="'+esc(it.__media)+'" alt="" loading="lazy" decoding="async">':'<div class="ha581Missing">Média indisponible</div>')+'</div>';
    }).join('')+'</div>'+(items.length>1?'<span class="ha581AlbumCount">1/'+items.length+'</span>':'');
  }
  function postHtml(p,i){return '<article class="ha581Post" data-index="'+i+'" data-post-id="'+esc(p.id)+'"><div class="ha581Media">'+mediaHtml(p)+'</div><div class="ha581Caption"><h2>'+esc(p.__title)+'</h2>'+(p.__desc?'<p>'+esc(p.__desc)+'</p>':'')+'</div><div class="ha581Actions">'+actionHtml(p)+'</div></article>';}
  function emptyPostHtml(slot){return '<article class="ha581Post ha581WindowEmptyV661" data-window-slot="'+slot+'" aria-hidden="true"></article>';}
  function windowHtml(center){
    var out=[];
    [center-1,center,center+1].forEach(function(index,slot){
      var p=posts[index];
      out.push(p?postHtml(p,index):emptyPostHtml(slot));
    });
    return out.join('');
  }
  function hydrateImage(img,priority){
    if(!img||img.dataset.ha581Loaded==='1'||img.dataset.ha581Loading==='1')return;
    var src=clean(img.getAttribute('data-src'));if(!src)return;
    img.dataset.ha581Loading='1';
    if(priority){img.loading='eager';try{img.fetchPriority='high';}catch(_fp){}}
    function ready(){img.dataset.ha581Loaded='1';img.dataset.ha581Loading='0';var sl=img.closest('.ha581Slide');if(sl)sl.classList.add('ready');var l=sl&&q('.ha581Loading',sl);if(l)l.remove();}
    function fail(){img.dataset.ha581Loading='0';var sl=img.closest('.ha581Slide');if(sl)sl.innerHTML='<div class="ha581Missing">Média indisponible</div>';}
    img.addEventListener('load',ready,{once:true});img.addEventListener('error',fail,{once:true});
    img.src=src;
    if(img.complete&&img.naturalWidth)requestAnimationFrame(ready);
    try{var d=img.decode&&img.decode();if(d&&d.then)d.then(ready).catch(function(){if(img.complete&&img.naturalWidth)ready();});}catch(_d){}
  }
  function hydrateVideo(v){if(!v||v.src)return;var src=clean(v.getAttribute('data-src'));if(src)v.src=src;}
  function hydrateAlbum(track,albumIndex,priority){
    if(!track)return;var slides=qa('.ha581Slide',track),i=clamp(Number(albumIndex)||0,0,Math.max(0,slides.length-1));
    [i,i-1,i+1].forEach(function(n){var sl=slides[n];if(!sl)return;var im=q('img[data-src]',sl);if(im)hydrateImage(im,priority&&n===i);var v=q('video[data-src]',sl);if(v&&n===i)hydrateVideo(v);});
  }
  function hydrateAround(postIndex){
    [postIndex,postIndex-1,postIndex+1].forEach(function(n){
      var article=q('.ha581Post[data-index="'+n+'"]',scroller);if(!article)return;
      var track=q('.ha581Album',article);if(!track)return;
      var ai=clamp(Math.round(track.scrollLeft/Math.max(1,track.clientWidth)),0,Math.max(0,Number(track.dataset.count||1)-1));
      hydrateAlbum(track,ai,n===postIndex);
    });
  }
  function ensureRoot(){
    if(root&&doc.body.contains(root))return root;
    root=doc.createElement('section');root.id='happyadProfilePostFeedV581';root.setAttribute('aria-hidden','true');root.innerHTML='<header class="ha581Top"><button class="ha581Back" type="button" data-happyad-internal-return-v591="1" aria-label="Revenir à la page précédente">'+icon('back')+'</button><span class="ha581Avatar"></span><div class="ha581Identity"><strong></strong><small></small></div><b class="ha581Counter">1/1</b></header><div class="ha581Scroller"></div>';
    doc.body.appendChild(root);scroller=q('.ha581Scroller',root);
    root.addEventListener('click',function(e){
      var back=e.target&&e.target.closest&&e.target.closest('.ha581Back');if(back){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();var t=Date.now();if(t-lastBackAt<320)return false;lastBackAt=t;close('profile-back-v592');return false;}
      var play=e.target&&e.target.closest&&e.target.closest('.ha581Play');if(play){e.preventDefault();e.stopPropagation();var v=q('video',play.parentNode);if(v){if(v.paused){qa('video',root).forEach(function(x){if(x!==v)try{x.pause();}catch(_e){}});v.play().catch(function(){});play.classList.add('playing');}else{v.pause();play.classList.remove('playing');}}return;}
      var b=e.target&&e.target.closest&&e.target.closest('.ha581Action[data-action]');if(!b)return;e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();handleAction(b);
    },true);
    return root;
  }
  function lock(){
    savedScrollY=Math.max(0,window.scrollY||doc.documentElement.scrollTop||0);
    var b=doc.body;bodyStyle={position:b.style.position,top:b.style.top,left:b.style.left,right:b.style.right,width:b.style.width,overflow:b.style.overflow};
    b.style.position='fixed';b.style.top=(-savedScrollY)+'px';b.style.left='0';b.style.right='0';b.style.width='100%';b.style.overflow='hidden';b.classList.add('ha581Locked');doc.documentElement.classList.add('ha581Locked');
    var app=q('.app');if(app){try{app.inert=true;}catch(_e){}app.setAttribute('aria-hidden','true');}
    try{window.parent&&window.parent!==window&&window.parent.postMessage({type:'HAPPYAD_INTERNAL_SCREEN_OPEN_V591',detail:{id:'profile-photo',source:'profile-post-feed-v591'}},'*');}catch(_e){}
  }
  function unlock(){
    var b=doc.body,s=bodyStyle||{};b.classList.remove('ha581Locked');doc.documentElement.classList.remove('ha581Locked');b.style.position=s.position||'';b.style.top=s.top||'';b.style.left=s.left||'';b.style.right=s.right||'';b.style.width=s.width||'';b.style.overflow=s.overflow||'';
    var app=q('.app');if(app){try{app.inert=false;}catch(_e){}app.removeAttribute('aria-hidden');}
    requestAnimationFrame(function(){window.scrollTo(0,savedScrollY);});
    try{window.parent&&window.parent!==window&&window.parent.postMessage({type:'HAPPYAD_INTERNAL_SCREEN_CLOSE_V591',detail:{id:'profile-photo',source:'profile-post-feed-v591'}},'*');}catch(_e){}
    bodyStyle=null;
  }
  function updateHeader(i){
    i=clamp(Number(i)||0,0,Math.max(0,posts.length-1));var p=posts[i]||{},av=q('.ha581Avatar',root),name=q('.ha581Identity strong',root),sub=q('.ha581Identity small',root),counter=q('.ha581Counter',root);
    av.innerHTML=p.__avatar?'<img src="'+esc(p.__avatar)+'" alt="">':esc((p.__name||'H').slice(0,1).toUpperCase());name.innerHTML='<span>'+esc(p.__name||'Utilisateur HAPPYAD')+'</span>'+(p.__badgeHtml||'');sub.textContent=p.__title||'Publication HAPPYAD';counter.textContent=(i+1)+'/'+Math.max(1,posts.length);
  }
  function bindAlbumCounters(){
    albumScrollHandlers.forEach(function(x){try{x.el.removeEventListener('scroll',x.fn);}catch(_e){}});albumScrollHandlers=[];
    qa('.ha581Album',root).forEach(function(track){
      var article=track.closest('.ha581Post'),postId=clean(article&&article.dataset.postId);
      var fn=function(){
        var count=Number(track.dataset.count||1),idx=clamp(Math.round(track.scrollLeft/Math.max(1,track.clientWidth)),0,count-1),badge=q('.ha581AlbumCount',track.parentNode);
        if(postId)albumPositions[postId]=idx;
        if(badge)badge.textContent=(idx+1)+'/'+count;
        hydrateAlbum(track,idx,true);
      };
      track.addEventListener('scroll',fn,{passive:true});albumScrollHandlers.push({el:track,fn:fn});
      var saved=clamp(Number(albumPositions[postId]||0),0,Math.max(0,Number(track.dataset.count||1)-1));
      if(saved){requestAnimationFrame(function(){try{track.scrollLeft=saved*Math.max(1,track.clientWidth);}catch(_e){}});}
    });
  }
  function renderPostWindow(center,reason){
    if(!scroller||!posts.length)return;
    currentPostIndex=clamp(Number(center)||0,0,posts.length-1);
    var token=++windowRenderToken;
    scroller.innerHTML=windowHtml(currentPostIndex);
    bindAlbumCounters();
    requestAnimationFrame(function(){
      if(token!==windowRenderToken||!scroller)return;
      var h=Math.max(1,scroller.clientHeight);
      scroller.scrollTop=h;
      updateHeader(currentPostIndex);
      hydrateAround(currentPostIndex);
      setTimeout(function(){if(token===windowRenderToken)hydrateAround(currentPostIndex);},70);
    });
  }
  function settlePostWindow(){
    scrollSettleTimer=0;
    if(!root||!root.classList.contains('on')||!scroller||!posts.length)return;
    var h=Math.max(1,scroller.clientHeight),pos=scroller.scrollTop/h,next=currentPostIndex;
    if(pos<0.62&&currentPostIndex>0)next=currentPostIndex-1;
    else if(pos>1.38&&currentPostIndex<posts.length-1)next=currentPostIndex+1;
    if(next!==currentPostIndex){renderPostWindow(next,'vertical-recycle');return;}
    if(Math.abs(scroller.scrollTop-h)>2)scroller.scrollTo({top:h,behavior:'smooth'});
    updateHeader(currentPostIndex);
    hydrateAround(currentPostIndex);
  }
  function open(id,card){
    if(card&&isVideo(card.__happyadPost||{},card))return false;
    ensureRoot();posts=collect(card);if(!posts.length)return false;
    var idx=posts.findIndex(function(p){return clean(p.id)===clean(id);});if(idx<0)idx=0;
    sourceCard=card||null;sourceScope=scopeFor(card);albumPositions={};
    setProfileFullscreenActiveV660(true);lock();root.classList.add('on');root.setAttribute('aria-hidden','false');
    renderPostWindow(idx,'open');
    suppressClickUntil=Date.now()+520;return true;
  }
  function close(reason){
    if(!root||!root.classList.contains('on')||closing)return false;
    closing=true;
    var returnCard=sourceCard;
    clearTimeout(scrollSettleTimer);scrollSettleTimer=0;windowRenderToken++;
    qa('video',root).forEach(function(v){try{v.pause();}catch(_e){}});
    root.classList.remove('on');
    root.setAttribute('aria-hidden','true');
    scroller.innerHTML='';
    posts=[];currentPostIndex=0;albumPositions={};
    setProfileFullscreenActiveV660(false);
    unlock();
    sourceCard=null;
    sourceScope=null;
    closing=false;
    suppressClickUntil=Date.now()+360;
    requestAnimationFrame(function(){try{if(returnCard&&doc.body.contains(returnCard))returnCard.focus({preventScroll:true});}catch(_e){}});
    return true;
  }
  function sourceButton(p,action){var c=p&&p.__card;if(!c)return null;var map={like:'[data-profile-act="like"]',fav:'[data-profile-act="fav"]',comment:'[data-profile-act="comment"]',share:'[data-profile-act="share"]'};return map[action]?q(map[action],c):null;}
  function refreshArticle(p){var a=q('.ha581Post[data-post-id="'+clean(p.id).replace(/"/g,'\\"')+'"] .ha581Actions',root);if(a)a.innerHTML=actionHtml(p);}
  function handleAction(btn){
    var article=btn.closest('.ha581Post'),id=clean(article&&article.dataset.postId),p=posts.find(function(x){return clean(x.id)===id;});if(!p)return;var action=btn.dataset.action;
    if(action==='like'||action==='fav'){
      var sb=sourceButton(p,action);if(sb){sb.click();setTimeout(function(){refreshArticle(p);},120);return;}
      toast(action==='like'?'J’aime indisponible':'Favoris indisponible');return;
    }
    if(action==='comment'){
      try{if(typeof window.happyadOpenHomeCommentPopupV468==='function'){window.happyadOpenHomeCommentPopupV468(Object.assign({},p,{id:p.id}),p.__video?'video':'photo');return;}}catch(_e){}
      var cb=sourceButton(p,'comment');if(cb){cb.click();return;}toast('Commentaires indisponibles');return;
    }
    if(action==='share'){
      try{if(window.parent&&window.parent!==window){window.parent.postMessage({type:'HAPPYAD_SHARE_OPEN',detail:p},'*');return;}if(window.HappyadShareMaster&&typeof window.HappyadShareMaster.open==='function'){window.HappyadShareMaster.open(p,window);return;}}catch(_e){}
      var sh=sourceButton(p,'share');if(sh){sh.click();return;}toast('Partage indisponible');return;
    }
    if(action==='repost'){
      try{var ev=new CustomEvent('happyad:profile-repost-request',{detail:{post:p}});doc.dispatchEvent(ev);toast('Republication préparée');}catch(_e){toast('Republication indisponible');}
    }
  }
  function onScroll(){
    if(!root||!root.classList.contains('on')||!scroller||!posts.length)return;
    var h=Math.max(1,scroller.clientHeight),pos=scroller.scrollTop/h,preview=currentPostIndex;
    if(pos<0.72&&currentPostIndex>0)preview=currentPostIndex-1;
    else if(pos>1.28&&currentPostIndex<posts.length-1)preview=currentPostIndex+1;
    updateHeader(preview);hydrateAround(preview);
    qa('.ha581Post',root).forEach(function(article){if(Number(article.dataset.index)!==preview)qa('video',article).forEach(function(v){try{v.pause();}catch(_e){}});});
    clearTimeout(scrollSettleTimer);scrollSettleTimer=setTimeout(settlePostWindow,95);
  }
  function pointerDown(e){
    if(root&&root.classList.contains('on'))return;var c=cardFrom(e.target);
    if(!c||isActionTarget(e.target)||isVideo(c.__happyadPost||{},c))return;
    pointerStart={id:e.pointerId,x:e.clientX,y:e.clientY,t:Date.now(),card:c};
  }
  function pointerUp(e){
    if(!pointerStart||pointerStart.id!==e.pointerId)return;var s=pointerStart;pointerStart=null;
    if(root&&root.classList.contains('on')||isVideo(s.card.__happyadPost||{},s.card))return;
    if(Math.abs(e.clientX-s.x)>14||Math.abs(e.clientY-s.y)>14||Date.now()-s.t>800)return;if(isActionTarget(e.target))return;
    e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();open(s.card.dataset.postId,s.card);
  }
  function clickCapture(e){
    if(Date.now()<suppressClickUntil){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();return false;}
    if(root&&root.classList.contains('on'))return;
    var c=cardFrom(e.target);if(!c||isActionTarget(e.target)||isVideo(c.__happyadPost||{},c))return;
    e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();open(c.dataset.postId,c);return false;
  }
  function init(){
    /* V662 : le fullscreen réellement affiché dans Mon profil / Profil visiteur est
       #happyadHomePhotoFullscreen (V483/V637). V581 reste neutralisé afin d'éviter
       deux ouvreurs, deux historiques et les clics fantômes de réouverture. */
    window.HappyProfilePostFeedV581={
      open:function(){return false;},
      close:function(){return false;},
      isOpen:function(){return false;},
      version:'V662-DISABLED-SINGLE-PROFILE-FULLSCREEN'
    };
    return;
    ensureRoot();
    window.addEventListener('pointerdown',pointerDown,true);
    window.addEventListener('pointerup',pointerUp,true);
    window.addEventListener('pointercancel',function(){pointerStart=null;},true);
    window.addEventListener('click',clickCapture,true);
    scroller.addEventListener('scroll',function(){if(scroller.__raf)return;scroller.__raf=requestAnimationFrame(function(){scroller.__raf=0;onScroll();});},{passive:true});
    if(!window.__HAPPYAD_PROFILE_INTERNAL_RETURN_V591_BOUND__){window.__HAPPYAD_PROFILE_INTERNAL_RETURN_V591_BOUND__=true;window.addEventListener('message',function(ev){var d=ev&&ev.data;if(d&&d.type==='HAPPYAD_INTERNAL_BACK_EXECUTE_V591'&&d.detail&&d.detail.id==='profile-photo')close();});}
  window.HappyProfilePostFeedV581={open:open,close:close,isOpen:function(){return !!(root&&root.classList.contains('on'));},version:'V662-DISABLED-SINGLE-PROFILE-FULLSCREEN'};
  }
  if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();


/* ===== profile-visitor-persistent-v601.js ===== */
(function(){
  'use strict';
  if(window.__HAPPYAD_PROFILE_VISITOR_PERSISTENT_V601__)return;
  window.__HAPPYAD_PROFILE_VISITOR_PERSISTENT_V601__=true;
  var currentUid='';
  var switchSeq=0;
  var visitorEnabledV649=true;
  function clean(v){return String(v==null?'':v).trim();}
  function read(k){try{return JSON.parse(localStorage.getItem(k)||'null')||null;}catch(_e){return null;}}
  function write(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(_e){}}
  function idOf(p){p=p||{};return clean(p.id||p.user_id||p.uid||p.auth_user_id||p.authUserId||p.account_uid||p.accountUid||p.profile_uid||p.owner_id||p.creator_id);}
  function routeUid(){try{var q=new URLSearchParams(location.search||'');return clean(q.get('uid')||q.get('user_id')||q.get('profile_uid')||q.get('auth_user_id')||q.get('account_uid')||q.get('owner')||q.get('owner_id'));}catch(_e){return '';}}
  function scrollKey(uid){return 'HAPPYAD_VISITOR_PROFILE_SCROLL_V601_'+clean(uid);}
  function saveScroll(uid){uid=clean(uid);if(!uid)return;try{sessionStorage.setItem(scrollKey(uid),String(Math.max(0,window.scrollY||document.documentElement.scrollTop||0)));}catch(_e){}}
  function restoreScroll(uid,allow){
    if(!allow){try{window.scrollTo(0,0);}catch(_e){}return;}
    var y=0;try{y=Number(sessionStorage.getItem(scrollKey(uid))||0)||0;}catch(_e){}
    try{requestAnimationFrame(function(){window.scrollTo(0,y);});}catch(_e){try{window.scrollTo(0,y);}catch(_x){}}
  }
  function seed(uid,incoming){
    var list=[];if(incoming)list.push(incoming);
    var ap=read('HAPPYAD_ACTIVE_PROFILE');if(ap)list.push(ap);
    var stable=read('HAPPYAD_PUBLIC_PROFILE_STABLE_'+uid);if(stable)list.push(stable);
    try{var ram=window.__HAPPYAD_PUBLIC_PROFILE_RAM_CACHE__||{};if(ram[uid])list.push(ram[uid]);}catch(_e){}
    for(var i=0;i<list.length;i++){
      var p=list[i]||{};if(idOf(p)===uid)return Object.assign({},p,{id:uid,user_id:uid,uid:uid,__happyadUidLocked:true,__happyadRouteUid:uid,at:Date.now()});
    }
    return {id:uid,user_id:uid,uid:uid,name:'Chargement profil...',__happyadUidLocked:true,__happyadRouteUid:uid,at:Date.now()};
  }
  function setRoute(uid,url){
    var target='user.html?public=1&uid='+encodeURIComponent(uid)+'&persistent=1&v=601';
    try{
      var u=new URL(url||target,location.href);
      u.searchParams.set('public','1');u.searchParams.set('uid',uid);u.searchParams.set('persistent','1');u.searchParams.set('v','601');
      target=u.pathname.split('/').pop()+(u.search||'')+(u.hash||'');
    }catch(_e){}
    try{history.replaceState(history.state||null,'',target);}catch(_h){}
    try{sessionStorage.setItem('HAPPYAD_PROFILE_MASTER_MODE','visitor');sessionStorage.setItem('HAPPYAD_PROFILE_MASTER_ACTIVE_UID',uid);sessionStorage.setItem('HAPPYAD_PROFILE_MASTER_ACTIVE_URL','modules/'+target);}catch(_s){}
    try{localStorage.setItem('HAPPYAD_ACTIVE_PROFILE_UID',uid);localStorage.setItem('HAPPYAD_PUBLIC_PROFILE_ACTIVE_UID',uid);}catch(_l){}
  }
  function announce(type,uid,requestId){try{window.parent&&window.parent!==window&&window.parent.postMessage({type:type,uid:uid,requestId:requestId||'',source:'profile-visitor-persistent-v601'},'*');}catch(_e){}}
  function applyTarget(detail){
    if(!visitorEnabledV649)return false;
    detail=detail||{};var uid=clean(detail.uid);if(!uid)return false;
    var seq=++switchSeq;var previous=currentUid||routeUid();
    if(previous&&previous!==uid)saveScroll(previous);
    currentUid=uid;
    setRoute(uid,detail.url||'');
    var p=seed(uid,detail.profile||null);
    write('HAPPYAD_ACTIVE_PROFILE',p);write('HAPPYAD_PUBLIC_PROFILE_STABLE_'+uid,p);
    try{window.__HAPPYAD_ACTIVE_PROFILE_RAM=p;window.__HAPPYAD_PUBLIC_PROFILE_RAM_CACHE__=window.__HAPPYAD_PUBLIC_PROFILE_RAM_CACHE__||{};window.__HAPPYAD_PUBLIC_PROFILE_RAM_CACHE__[uid]=p;}catch(_r){}
    try{document.body.classList.add('happyadPublicCreatorProfile','happyadVisitorProfilePersistentV601');document.body.classList.remove('happyadGuestProfileLocked');}catch(_b){}
    try{window.__HAPPYAD_V425_PUBLIC_KICK__=0;}catch(_k){}
    var task=null;
    try{
      var lock=window.HAPPYAD_PUBLIC_PROFILE_UID_LOCK;
      if(lock&&typeof lock.switchUid==='function')task=lock.switchUid(true);
      else if(lock&&typeof lock.apply==='function')task=lock.apply(true);
      else if(lock&&typeof lock.schedule==='function')task=lock.schedule(true);
      else if(typeof window.render==='function')task=window.render();
    }catch(_a){}
    announce('HAPPYAD_PROFILE_SWITCH_PAINTED_V601',uid,detail.requestId);
    restoreScroll(uid,!!detail.restoreScroll);
    Promise.resolve(task).then(function(){if(seq!==switchSeq)return;announce('HAPPYAD_PROFILE_SWITCH_READY_V601',uid,detail.requestId);}).catch(function(){if(seq!==switchSeq)return;announce('HAPPYAD_PROFILE_SWITCH_READY_V601',uid,detail.requestId);});
    return true;
  }
  window.addEventListener('message',function(ev){
    var d=ev&&ev.data;if(!d)return;
    if(d.type==='HAPPYAD_PROFILE_HIDE_VISITOR_V649'){visitorEnabledV649=false;++switchSeq;saveScroll(currentUid||routeUid());return;}
    if(d.type!=='HAPPYAD_PROFILE_SHOW_V601')return;
    visitorEnabledV649=true;
    try{ev.stopImmediatePropagation&&ev.stopImmediatePropagation();}catch(_e){}
    applyTarget(d);
  },true);
  currentUid=routeUid();
  window.HappyVisitorProfileV601={show:applyTarget,current:function(){return currentUid||routeUid();},saveScroll:function(){saveScroll(currentUid||routeUid());}};
  try{window.addEventListener('pagehide',function(){saveScroll(currentUid||routeUid());});}catch(_e){}
})();


/* ===== profile-layout-master-v568.js ===== */
(function(){
  'use strict';
  if(window.__HAPPYAD_PROFILE_LAYOUT_MASTER_V568__)return;
  window.__HAPPYAD_PROFILE_LAYOUT_MASTER_V568__=true;

  var VERSION='PROFILE_VISITOR_PRIVACY_LOCK_V612';
  var doc=document;

  function qs(s,r){try{return (r||doc).querySelector(s);}catch(_e){return null;}}
  function qsa(s,r){try{return Array.prototype.slice.call((r||doc).querySelectorAll(s));}catch(_e){return [];}}
  function clean(v){return String(v==null?'':v).trim();}
  function routePublic(){
    try{var p=new URLSearchParams(location.search||'');return p.get('public')==='1';}
    catch(_e){return /(?:^|[?&])public=1(?:&|$)/.test(String(location.search||''));}
  }
  function isVisitor(){
    if(routePublic())return true;
    try{
      var b=doc.body;
      if(b&&(b.classList.contains('happyadPublicCreatorProfile')||b.classList.contains('happyadVisitorProfilePersistentV601')))return true;
    }catch(_e){}
    try{if(qs('#publicFollowBtn,#publicMessageBtn,.publicCreatorActions:not(.selfProfileActions)'))return true;}catch(_e){}
    try{
      var mode=clean(sessionStorage.getItem('HAPPYAD_PROFILE_MASTER_MODE')).toLowerCase();
      var uid=clean(sessionStorage.getItem('HAPPYAD_PROFILE_MASTER_ACTIVE_UID'));
      if(mode==='visitor'&&uid)return true;
    }catch(_e){}
    return false;
  }
  function svg(name){
    var icons={
      settings:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.12 2.12-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V20.3h-3v-.08a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-2.12-2.12.06-.06A1.7 1.7 0 0 0 7 15a1.7 1.7 0 0 0-1.56-1.03H5.3v-3h.14A1.7 1.7 0 0 0 7 9.94a1.7 1.7 0 0 0-.34-1.88L6.6 8l2.12-2.12.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 11.7 4.7v-.08h3v.08a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06L19.8 8l-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.03h.14v3h-.14A1.7 1.7 0 0 0 19.4 15Z"/></svg>',
      stats:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/></svg>',
      edit:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4l11-11a2.8 2.8 0 0 0-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/></svg>',
      grid:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
      repost:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m17 2 4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="m7 22-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/></svg>',
      saved:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z"/></svg>',
      lock:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
      video:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 7 8 5-8 5V7Z"/></svg>'
    };
    return icons[name]||icons.grid;
  }
  function toast(msg){
    try{if(typeof window.toast==='function')return window.toast(msg);}catch(_e){}
    var el=qs('#toast');if(!el)return;el.textContent=msg;el.classList.add('show');clearTimeout(el.__haTimer);el.__haTimer=setTimeout(function(){el.classList.remove('show');},1800);
  }

  function prepareOwnerActions(){
    var map=[['#openSettings','settings','Paramètres'],['#openStats','stats','Stats'],['#openEdit','edit','Modifier']];
    map.forEach(function(row){var b=qs(row[0]);if(!b)return;b.innerHTML=svg(row[1])+'<span>'+row[2]+'</span>';b.setAttribute('data-ha-profile-master-action',row[1]);});
  }

  function ensureVisitorActionsHost(){
    var host=qs('#happyadVisitorActionsMaster');
    if(host)return host;
    host=doc.createElement('div');host.id='happyadVisitorActionsMaster';
    var action=qs('#actionFree');var bio=qs('#bioFree');
    if(action&&action.parentNode)action.parentNode.insertBefore(host,action);
    else if(bio&&bio.parentNode)bio.parentNode.insertBefore(host,bio.nextSibling);
    else{var box=qs('#publicationsBox');if(box&&box.parentNode)box.parentNode.insertBefore(host,box);}
    return host;
  }

  function tabsData(visitor){
    return visitor?
      [['posts','grid','Publications'],['reposts','repost','Republier']]:
      [['posts','grid','Publications'],['reposts','repost','Republier'],['saved','saved','Favoris'],['private','lock','Privé']];
  }
  function createTab(item){
    var b=doc.createElement('button');b.type='button';b.className='haProfileMasterTab'+(item[0]==='posts'?' is-active':'');b.dataset.profileTab=item[0];b.innerHTML=svg(item[1])+'<span>'+item[2]+'</span>';return b;
  }
  function syncTabs(tabs){
    if(!tabs)return null;
    var visitor=isVisitor();
    var desired=tabsData(visitor);
    var wanted=desired.map(function(x){return x[0];}).join('|');
    var actual=qsa(':scope > .haProfileMasterTab',tabs).map(function(x){return clean(x.dataset.profileTab);}).join('|');
    var active=clean(tabs.dataset.activeTab);
    try{if(window.HappyProfileContentTabsV683&&typeof window.HappyProfileContentTabsV683.current==='function')active=clean(window.HappyProfileContentTabsV683.current())||active;}catch(_e){}
    if(!active)active='posts';
    if(visitor&&(active==='saved'||active==='private'))active='posts';
    if(wanted!==actual){
      tabs.innerHTML='';
      desired.forEach(function(item){tabs.appendChild(createTab(item));});
    }
    tabs.dataset.profileMode=visitor?'visitor':'owner';
    tabs.dataset.activeTab=active;
    if(visitor)qsa('[data-profile-tab="saved"],[data-profile-tab="private"]',tabs).forEach(function(el){el.remove();});
    var activeButton=qs('[data-profile-tab="'+active+'"]',tabs)||qs('[data-profile-tab="posts"]',tabs);
    if(activeButton)qsa('.haProfileMasterTab',tabs).forEach(function(x){x.classList.toggle('is-active',x===activeButton);});
    return tabs;
  }
  function ensureTabs(){
    var tabs=qs('#happyadProfileTabsMaster');
    if(!tabs){
      tabs=doc.createElement('nav');tabs.id='happyadProfileTabsMaster';tabs.setAttribute('aria-label','Contenus du profil');
      var box=qs('#publicationsBox');if(box&&box.parentNode)box.parentNode.insertBefore(tabs,box);
    }
    if(!tabs.__haV612Bound){
      tabs.__haV612Bound=true;
      tabs.addEventListener('click',function(e){
        var b=e.target.closest('.haProfileMasterTab');if(!b)return;
        var tab=clean(b.dataset.profileTab);
        if(isVisitor()&&(tab==='saved'||tab==='private')){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();syncTabs(tabs);return false;}
        if((tab==='posts'||tab==='reposts'||tab==='saved'||tab==='private')&&window.HappyProfileContentTabsV683&&typeof window.HappyProfileContentTabsV683.open==='function'){
          e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
          tabs.dataset.activeTab=tab;
          window.HappyProfileContentTabsV683.open(tab,{visitor:isVisitor(),source:'profile-master-v665'});
          return false;
        }
        if(tab!=='posts'){toast('Cet onglet sera connecté dans une prochaine étape.');return;}
        tabs.dataset.activeTab='posts';
        qsa('.haProfileMasterTab',tabs).forEach(function(x){x.classList.toggle('is-active',x===b);});
      },true);
    }
    return syncTabs(tabs);
  }

  function readPrivateIds(){try{var a=JSON.parse(localStorage.getItem('HAPPYAD_PRIVATE_POST_IDS_V1')||'[]');return Array.isArray(a)?a.map(String):[];}catch(_e){return [];}}
  function cardPost(card){try{return card.__happyadPost||{};}catch(_e){return {};}}
  function privatePost(card,p){
    p=p||{};
    try{if(typeof window.happyadIsPrivatePostV438==='function'&&window.happyadIsPrivatePostV438(p))return true;}catch(_e){}
    var id=clean(p.id||p.post_id||(card&&card.dataset&&card.dataset.postId));
    if(id&&readPrivateIds().indexOf(id)>=0)return true;
    var vals=[p.visibility,p.mode,p.status,p.privacy,p.audience,p.is_private,p.private,p.private_only,p.only_me];
    for(var i=0;i<vals.length;i++){var v=String(vals[i] == null?'':vals[i]).toLowerCase();if(v==='private'||v==='privé'||v==='prive'||v==='only_me'||v==='only-me'||v==='moi'||v==='true'||v==='1')return true;}
    return !!(card&&(card.classList.contains('haPrivatePost')||card.dataset.private==='1'||card.dataset.visibility==='private'));
  }
  function stripOwnerControls(card){
    if(!card)return;
    qsa('.profileDelete,[data-delete-post],[data-owner-only],.haProfileTileMarker',card).forEach(function(el){el.remove();});
  }
  function normalizeCard(card){
    if(!card||card.nodeType!==1)return;
    var p=cardPost(card);
    if(isVisitor()&&privatePost(card,p)){card.remove();return;}
    card.classList.add('haProfileMasterTile');
    if(isVisitor())stripOwnerControls(card);
    var title=clean((qs('.profilePostTitle',card)||{}).textContent)||clean(p.title)||'Publication HAPPYAD';
    card.setAttribute('aria-label',title);card.setAttribute('title',title);
    var media=qs('.profileMedia',card);
    if(media){qsa('video',media).forEach(function(v){v.muted=true;v.playsInline=true;v.preload='metadata';try{v.pause();}catch(_e){}});}
    var marker=qs('.haProfileTileMarker',card);
    if(!isVisitor()&&privatePost(card,p)){
      if(!marker){marker=doc.createElement('span');marker.className='haProfileTileMarker';marker.innerHTML=svg('lock');card.appendChild(marker);}
    }else if(marker){marker.remove();}
  }

  function normalizeGrid(list){
    if(!list)return;list.classList.add('haProfileMasterGrid');qsa(':scope > .profilePost',list).forEach(normalizeCard);
  }

  function applyMode(){
    var visitor=isVisitor();
    if(doc.body){doc.body.classList.toggle('haProfileVisitor',visitor);doc.body.classList.toggle('haProfileOwner',!visitor);}
    var action=qs('#actionFree');if(action)action.style.display=visitor?'none':'';
    if(!visitor)prepareOwnerActions();else ensureVisitorActionsHost();
    return visitor;
  }

  function cleanOldVisuals(){
    var visitor=applyMode();ensureTabs();
    var box=qs('#publicationsBox');if(!box)return;
    qsa(':scope > .big,.profileFilterBar',box).forEach(function(el){el.remove();});
    if(visitor){
      qsa('#haPostMenuOverlayV438,#haPostModalOverlayV438').forEach(function(el){el.classList.remove('on');el.style.display='none';});
      qsa('[data-profile-tab="saved"],[data-profile-tab="private"]',doc).forEach(function(el){el.remove();});
    }
    var visitorActions=qs(':scope > .publicCreatorActions',box);
    if(visitorActions){var host=ensureVisitorActionsHost();host.innerHTML='';host.appendChild(visitorActions);}
    normalizeGrid(qs('#profilePostsList',box));normalizeGrid(qs('#publicCreatorPosts',box));qsa('.profilePosts',box).forEach(normalizeGrid);
  }

  function enforceOwnerModeV649(detail){
    if(routePublic())return false;
    try{
      sessionStorage.setItem('HAPPYAD_PROFILE_MASTER_MODE','my');
      sessionStorage.removeItem('HAPPYAD_PROFILE_MASTER_ACTIVE_UID');
      sessionStorage.removeItem('HAPPYAD_PROFILE_MASTER_ACTIVE_URL');
    }catch(_s){}
    try{
      localStorage.removeItem('HAPPYAD_ACTIVE_PROFILE');
      localStorage.removeItem('HAPPYAD_ACTIVE_PROFILE_UID');
      localStorage.removeItem('HAPPYAD_PUBLIC_PROFILE_ACTIVE_UID');
    }catch(_l){}
    try{delete window.__HAPPYAD_ACTIVE_PROFILE_RAM;}catch(_r){window.__HAPPYAD_ACTIVE_PROFILE_RAM=null;}
    try{
      if(doc.body){
        doc.body.classList.remove('happyadPublicCreatorProfile','happyadVisitorProfilePersistentV601','happyadGuestProfileLocked','haProfileVisitor');
        doc.body.classList.add('haProfileOwner');
      }
      var host=qs('#happyadVisitorActionsMaster');if(host)host.innerHTML='';
      var action=qs('#actionFree');if(action)action.style.display='';
      cleanOldVisuals();
      window.HappyProfileOwnerV649={version:'V649',show:enforceOwnerModeV649,last:detail||null};
      try{doc.dispatchEvent(new CustomEvent('happyad:profile-owner-restored',{detail:{source:clean(detail&&detail.source)||'v649'}}));}catch(_ev){}
    }catch(_e){}
    return true;
  }

  function install(){
    cleanOldVisuals();
    var box=qs('#publicationsBox');var scheduled=false;
    function queue(){if(scheduled)return;scheduled=true;requestAnimationFrame(function(){scheduled=false;cleanOldVisuals();});}
    if(box)new MutationObserver(queue).observe(box,{childList:true,subtree:true,attributes:true,attributeFilter:['class','data-private','data-visibility']});
    if(doc.body)new MutationObserver(queue).observe(doc.body,{attributes:true,attributeFilter:['class']});
    doc.addEventListener('happyad:profile-posts-rendered',queue);
    window.addEventListener('message',function(ev){
      var d=ev&&ev.data;if(!d)return;
      if(d.type==='HAPPYAD_PROFILE_SHOW_OWNER_V649'){enforceOwnerModeV649(d);setTimeout(queue,0);return;}
      if(d.type==='HAPPYAD_APP_FRAME_VISIBLE'&&String(d.page||'')==='profile'){enforceOwnerModeV649(d);setTimeout(queue,0);return;}
      if(d.type==='HAPPYAD_PROFILE_SHOW_V601')setTimeout(queue,0);
    },true);
    window.addEventListener('pageshow',function(){setTimeout(queue,0);});
    setTimeout(queue,40);setTimeout(queue,260);setTimeout(queue,900);
    window.HappyProfileLayoutV568={version:VERSION,refresh:cleanOldVisuals,mode:isVisitor()?'visitor':'owner'};
    window.HappyProfileOwnerV649={version:'V649',show:enforceOwnerModeV649,last:null};
  }

  if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();


/* ===== profile-scroll-controller-master-v654.js ===== */
(function(){
  'use strict';
  if(window.__HAPPYAD_PROFILE_SCROLL_CONTROLLER_V654__)return;
  window.__HAPPYAD_PROFILE_SCROLL_CONTROLLER_V654__=true;
  window.__HAPPYAD_PROFILE_SCROLL_CONTROLLER_V647__=true;
  window.__HAPPYAD_PROFILE_SCROLL_CONTROLLER_V645__=true;

  /* Les anciens contrôleurs restent neutralisés. V654 ne parcourt plus les
     cartes pendant le scroll : IntersectionObserver pilote la pagination et
     la flèche, tandis que l'événement scroll ne mémorise qu'un compteur. */
  window.__HAPPYAD_PROFILE_SCROLL_TOP_MASTER_V644__=true;
  window.__HAPPYAD_OWN_PROFILE_SCROLL_V627__=true;
  window.__HAPPYAD_PUBLIC_PROFILE_SCROLL_V627__=true;
  window.__HAPPYAD_PROFILE_SCROLL_MASTER_V620__=true;
  window.__HAPPYAD_PROFILE_SCROLL_MASTER_V619__=true;

  var VERSION='V660_PROFILE_NATIVE_SCROLL_FULLSCREEN_PAUSE';
  var doc=document,button=null,activeListNode=null,markerCard=null,sentinel=null;
  var markerObserver=null,paginationObserver=null,refreshRaf=0,fallbackTimer=0,fallbackScrollBound=false;
  var userHasScrolled=false,scrollVersion=0,lastPaginationScrollVersion=-1;
  var paginationNear=false,paginationRunning=false,paginationUnlockTimer=0,modeKey='';
  var ROWS_BEFORE_BUTTON=7,COLUMNS=3,CARD_INDEX=(ROWS_BEFORE_BUTTON*COLUMNS)-1;
  var PAGINATION_MARGIN=1100;

  function qs(s,r){try{return (r||doc).querySelector(s);}catch(_e){return null;}}
  function qsa(s,r){try{return Array.prototype.slice.call((r||doc).querySelectorAll(s));}catch(_e){return [];}}
  function y(){try{return Math.max(0,window.pageYOffset||doc.documentElement.scrollTop||doc.body.scrollTop||0);}catch(_e){return 0;}}
  function isDisplayed(el){
    if(!el||!el.isConnected)return false;
    try{var s=getComputedStyle(el);return s.display!=='none'&&s.visibility!=='hidden';}catch(_e){return true;}
  }
  function isPublicMode(){
    try{
      if(doc.body&&(doc.body.classList.contains('haProfileVisitor')||doc.body.classList.contains('happyadPublicProfileMode')))return true;
      var p=new URLSearchParams(String(location.search||''));
      return p.get('public')==='1'&&!!String(p.get('uid')||p.get('user_id')||p.get('profile_uid')||'').trim();
    }catch(_e){return /(?:^|[?&])public=1(?:&|$)/.test(String(location.search||''));}
  }
  function currentMode(){return isPublicMode()?'public':'owner';}
  function activeList(){
    var preferred=isPublicMode()?qs('#publicCreatorPosts'):qs('#profilePostsList');
    if(isDisplayed(preferred))return preferred;
    var other=isPublicMode()?qs('#profilePostsList'):qs('#publicCreatorPosts');
    if(isDisplayed(other))return other;
    var all=qsa('#publicationsBox .profilePosts');
    for(var i=0;i<all.length;i++)if(isDisplayed(all[i]))return all[i];
    return null;
  }
  function directCards(list){
    if(!list)return [];
    try{return Array.prototype.slice.call(list.children||[]).filter(function(el){return el&&el.classList&&el.classList.contains('profilePost');});}catch(_e){return [];}
  }
  function removeEveryLegacyCompactProfile(){
    ['happyadProfileCompactMasterV569','happyadProfileTabsSentinelV619','happyadProfileTabsPlaceholderV569'].forEach(function(id){
      var el=doc.getElementById(id);if(el&&el.parentNode)el.parentNode.removeChild(el);
    });
    if(!doc.body)return;
    [
      'haProfileScrollMasterV569','haProfileScrollMasterV619','haProfileScrollMasterV620',
      'haProfileCompactActive','haProfileCompactFull','haProfileTabsPinnedV569',
      'haProfileScrollingV620','haProfileNaturalHeaderV643','haProfileHeaderCompactFallbackV643'
    ].forEach(function(name){doc.body.classList.remove(name);});
    var hero=qs('.app > .card:first-of-type');
    if(hero){
      hero.removeAttribute('data-happyad-real-profile-header-v643');
      hero.removeAttribute('data-happyad-real-profile-header-v644');
      hero.removeAttribute('data-happyad-real-profile-header-v645');
    }
  }
  function ensureButton(){
    if(button&&button.isConnected)return button;
    var old=doc.getElementById('happyadProfileScrollTopV644');if(old&&old.parentNode)old.parentNode.removeChild(old);
    button=doc.getElementById('happyadProfileScrollTopV645');
    if(!button){
      button=doc.createElement('button');
      button.id='happyadProfileScrollTopV645';
      button.type='button';
      button.setAttribute('aria-label','Revenir en haut du profil');
      button.setAttribute('title','Revenir en haut');
      button.setAttribute('aria-hidden','true');
      button.tabIndex=-1;
      button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 14 6-6 6 6"/></svg>';
      button.addEventListener('click',function(ev){
        ev.preventDefault();ev.stopPropagation();
        var reduce=false;try{reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(_e){}
        try{window.scrollTo({top:0,left:0,behavior:reduce?'auto':'smooth'});}catch(_e){window.scrollTo(0,0);}
      });
      doc.body.appendChild(button);
    }
    return button;
  }
  function setVisible(on){
    on=!!on;
    if(!button)ensureButton();
    if(!button)return;
    button.classList.toggle('is-visible',on);
    button.setAttribute('aria-hidden',on?'false':'true');
    button.tabIndex=on?0:-1;
  }
  function ensureSentinel(list){
    if(!list||!list.parentNode)return null;
    var node=doc.getElementById('happyadProfilePaginationSentinelV654');
    if(!node){
      node=doc.createElement('div');
      node.id='happyadProfilePaginationSentinelV654';
      node.className='happyadProfilePaginationSentinelV654';
      node.setAttribute('aria-hidden','true');
    }
    if(node.previousSibling!==list)list.parentNode.insertBefore(node,list.nextSibling);
    return node;
  }
  function pageAllowsPagination(){
    if(window.__HAPPYAD_PROFILE_FULLSCREEN_ACTIVE_V660__)return false;
    var b=doc.body;if(!b||doc.visibilityState==='hidden')return false;
    if(b.classList.contains('haProfileOverlayOpenV572')||b.classList.contains('haProfilePanelLockedV573'))return false;
    return !!(activeListNode&&activeListNode.isConnected&&directCards(activeListNode).length);
  }
  function triggerPagination(){
    if(paginationRunning||!paginationNear||!userHasScrolled||!pageAllowsPagination())return;
    if(lastPaginationScrollVersion===scrollVersion)return;
    var fn=isPublicMode()?window.__happyadMaybeLoadMorePublicV627:window.__happyadMaybeLoadMoreOwnProfileV627;
    if(typeof fn!=='function')return;
    lastPaginationScrollVersion=scrollVersion;
    paginationRunning=true;
    clearTimeout(paginationUnlockTimer);
    paginationUnlockTimer=setTimeout(function(){paginationRunning=false;},900);
    try{fn();}catch(_e){clearTimeout(paginationUnlockTimer);paginationRunning=false;}
  }
  function schedulePagination(){
    clearTimeout(fallbackTimer);
    fallbackTimer=setTimeout(triggerPagination,70);
  }
  function onScrollSignal(){
    userHasScrolled=true;
    scrollVersion++;
    if(paginationNear)schedulePagination();
  }
  function observeMarker(cards){
    if(markerObserver){try{markerObserver.disconnect();}catch(_e){}markerObserver=null;}
    markerCard=cards.length>CARD_INDEX?cards[CARD_INDEX]:null;
    if(!markerCard){setVisible(false);return;}
    try{
      var r=markerCard.getBoundingClientRect();
      setVisible(r.bottom<=0);
    }catch(_e){setVisible(false);}
    if(!('IntersectionObserver' in window))return;
    markerObserver=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.target!==markerCard)return;
        if(entry.isIntersecting){setVisible(false);return;}
        setVisible(!!(entry.boundingClientRect&&entry.boundingClientRect.bottom<=0));
      });
    },{root:null,threshold:0});
    markerObserver.observe(markerCard);
  }
  function observePagination(node){
    if(paginationObserver){try{paginationObserver.disconnect();}catch(_e){}paginationObserver=null;}
    paginationNear=false;
    if(!node)return;
    if('IntersectionObserver' in window){
      paginationObserver=new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.target!==sentinel)return;
          paginationNear=!!entry.isIntersecting;
          if(paginationNear&&userHasScrolled)schedulePagination();
        });
      },{root:null,rootMargin:'0px 0px '+PAGINATION_MARGIN+'px 0px',threshold:0});
      paginationObserver.observe(node);
      return;
    }
    /* Repli ancien navigateur : une mesure différée, jamais à chaque frame. */
    if(!fallbackScrollBound){
      fallbackScrollBound=true;
      window.addEventListener('scroll',function(){
        clearTimeout(fallbackTimer);
        fallbackTimer=setTimeout(function(){
          try{paginationNear=!!(sentinel&&sentinel.isConnected&&sentinel.getBoundingClientRect().top<=(window.innerHeight+PAGINATION_MARGIN));}catch(_e){paginationNear=false;}
          if(paginationNear&&userHasScrolled)triggerPagination();
        },140);
      },{passive:true});
    }
  }
  function refresh(){
    removeEveryLegacyCompactProfile();
    ensureButton();
    if(refreshRaf)cancelAnimationFrame(refreshRaf);
    refreshRaf=requestAnimationFrame(function(){
      refreshRaf=0;
      var list=activeList();
      var nextMode=currentMode();
      if(nextMode!==modeKey){modeKey=nextMode;paginationNear=false;lastPaginationScrollVersion=scrollVersion;}
      activeListNode=list;
      var cards=directCards(list);
      observeMarker(cards);
      sentinel=ensureSentinel(list);
      observePagination(sentinel);
    });
  }
  function install(){
    if(!doc.body)return;
    removeEveryLegacyCompactProfile();
    ensureButton();
    userHasScrolled=y()>0;
    window.addEventListener('scroll',onScrollSignal,{passive:true});
    window.addEventListener('resize',refresh,{passive:true});
    window.addEventListener('pageshow',refresh,{passive:true});
    doc.addEventListener('happyad:profile-posts-rendered',refresh);
    window.addEventListener('message',function(ev){
      var d=ev&&ev.data,t=d&&d.type;
      if(t==='HAPPYAD_PROFILE_SHOW_V601'||t==='HAPPYAD_PROFILE_SHOW_OWNER_V649'||t==='HAPPYAD_APP_FRAME_VISIBLE'||t==='HAPPYAD_MODULE_RESUME')refresh();
    },true);
    setTimeout(refresh,60);setTimeout(refresh,420);setTimeout(refresh,1200);
    window.HappyProfileScrollV569={version:VERSION,refresh:refresh,getProgress:function(){return 0;}};
    window.HappyProfileScrollTopV644={version:VERSION,refresh:refresh,recalculate:refresh};
    window.HappyProfileScrollControllerV645={version:VERSION,refresh:refresh,runPagination:triggerPagination,recalculate:refresh};
    window.HappyProfileScrollControllerV647=window.HappyProfileScrollControllerV645;
    window.HappyProfileScrollControllerV648=window.HappyProfileScrollControllerV645;
    window.HappyProfileScrollControllerV654=window.HappyProfileScrollControllerV645;
    try{if(window.HappyMasterRegistry)window.HappyMasterRegistry.register('profile-scroll',{file:'core/profile-master-v660.js',responsibility:'scroll natif; sentinelle IntersectionObserver pour pagination et flèche sans calcul par frame',active:true,version:VERSION});}catch(_e){}
  }
  if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();

/* ===== profile-publications-master-v570.js ===== */
(function(){
  'use strict';
  if(window.__HAPPYAD_PROFILE_PUBLICATIONS_MASTER_V570__)return;
  window.__HAPPYAD_PROFILE_PUBLICATIONS_MASTER_V570__=true;

  var VERSION='PROFILE_PUBLICATIONS_MASTER_V570_STEP3';
  var doc=document;
  var restoreTimer=0;
  var observer=null;

  function qs(s,r){try{return (r||doc).querySelector(s);}catch(_e){return null;}}
  function qsa(s,r){try{return Array.prototype.slice.call((r||doc).querySelectorAll(s));}catch(_e){return [];}}
  function clean(v){return String(v==null?'':v).trim();}
  function esc(v){return clean(v).replace(/[^a-zA-Z0-9_-]/g,function(ch){return '\\'+ch;});}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function now(){return Date.now();}
  function isVisitor(){
    if(doc.body&&doc.body.classList.contains('haProfileVisitor'))return true;
    try{var p=new URLSearchParams(location.search||'');return p.get('public')==='1'&&!!clean(p.get('uid'));}catch(_e){return false;}
  }
  function profileId(){
    try{var p=new URLSearchParams(location.search||'');var uid=clean(p.get('uid'));if(uid)return uid;}catch(_e){}
    var vals=[];
    try{vals.push(localStorage.getItem('HAPPYAD_AUTH_UID'));}catch(_e){}
    try{vals.push(localStorage.getItem('HAPPYAD_CURRENT_USER_ID'));}catch(_e){}
    try{if(window.UserStore&&window.UserStore.data)vals.push(window.UserStore.data.id,window.UserStore.data.user_id,window.UserStore.data.uid);}catch(_e){}
    for(var i=0;i<vals.length;i++){var v=clean(vals[i]);if(v)return v;}
    return isVisitor()?'visitor':'owner';
  }
  function stateKey(){return 'HAPPYAD_PROFILE_VIEW_STATE_V570:'+profileId();}
  function readState(){try{return JSON.parse(sessionStorage.getItem(stateKey())||'null')||null;}catch(_e){return null;}}
  function writeState(state){try{sessionStorage.setItem(stateKey(),JSON.stringify(state||{}));}catch(_e){}}
  function activeTab(){var b=qs('#happyadProfileTabsMaster .haProfileMasterTab.is-active');return clean(b&&b.dataset&&b.dataset.profileTab)||'posts';}
  function currentY(){return Math.max(0,window.scrollY||doc.documentElement.scrollTop||doc.body.scrollTop||0);}
  function saveView(postId,pending){
    var old=readState()||{};
    writeState({
      profileId:profileId(),
      visitor:isVisitor(),
      tab:activeTab(),
      scrollY:currentY(),
      postId:clean(postId)||clean(old.postId),
      pending:!!pending,
      savedAt:now(),
      restoreUntil:pending?now()+30*60*1000:clean(old.restoreUntil)||0
    });
  }
  function setPending(postId){saveView(postId,true);}
  function clearPending(){var s=readState();if(!s)return;s.pending=false;s.savedAt=now();writeState(s);}

  function svg(name){
    var map={
      play:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 7 8 5-8 5V7Z"/></svg>',
      album:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="14" height="14" rx="2"/><path d="M4 16V5a1 1 0 0 1 1-1h11"/></svg>',
      lock:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>'
    };
    return map[name]||map.play;
  }
  function postOf(card){
    var p={};
    try{p=card.__happyadPost||{};}catch(_e){}
    var id=clean((p&&p.id)||(card&&card.dataset&&card.dataset.postId));
    if(!id)return p||{};
    if(p&&Object.keys(p).length)return p;
    var arrays=[];
    try{if(typeof window.ALL_POSTS!=='undefined')arrays.push(window.ALL_POSTS);}catch(_e){}
    try{if(window.UserStore&&window.UserStore.data)arrays.push(window.UserStore.data.postsList,window.UserStore.data.posts);}catch(_e){}
    for(var a=0;a<arrays.length;a++){
      var arr=Array.isArray(arrays[a])?arrays[a]:[];
      for(var i=0;i<arr.length;i++)if(String(arr[i]&&arr[i].id||'')===id)return arr[i];
    }
    return {id:id};
  }
  function mediaType(p,card){
    var t=clean(p.kind||p.media_type||p.mediaType||p.type||p.post_type||p.postType).toLowerCase();
    if(t.indexOf('video')>=0)return 'video';
    if(card&&card.classList.contains('videoPost'))return 'video';
    if(card&&qs('video',card))return 'video';
    return 'photo';
  }
  function itemCount(p){
    var arrays=[p.__albumItems,p.albumItems,p.items,p.media_items,p.mediaItems,p.photos,p.gallery];
    for(var i=0;i<arrays.length;i++)if(Array.isArray(arrays[i])&&arrays[i].length>1)return arrays[i].length;
    var n=Number(p.media_count||p.mediaCount||p.album_count||p.albumCount||0);
    return isFinite(n)&&n>1?n:0;
  }
  function isPrivate(p,card){
    var vals=[p.visibility,p.mode,p.status,p.privacy,p.audience,p.is_private,p.private_only];
    for(var i=0;i<vals.length;i++){
      var v=clean(vals[i]).toLowerCase();
      if(v==='private'||v==='only_me'||v==='moi'||v==='true'||v==='1')return true;
    }
    return !!(card&&card.classList.contains('haPrivatePost'));
  }
  function ensureMarker(card,cls,html,label){
    var el=qs('.'+cls,card);
    if(!el){el=doc.createElement('span');el.className=cls;card.appendChild(el);}
    el.innerHTML=html;el.setAttribute('aria-label',label||'');el.setAttribute('role','img');return el;
  }
  function removeMarker(card,cls){var el=qs('.'+cls,card);if(el)el.remove();}
  function normalizeCard(card){
    if(!card||card.nodeType!==1)return;
    var p=postOf(card)||{};
    var id=clean(p.id||card.dataset.postId);
    if(id)card.dataset.postId=id;
    var type=mediaType(p,card);
    var mediaBefore=qs('.profileMedia',card);
    var mediaNodeBefore=mediaBefore&&qs('img,video',mediaBefore);
    var normalizeSigV665=[
      id,type,clean(p.title),String(itemCount(p)),String(isPrivate(p,card)),
      clean(mediaBefore&&(mediaBefore.dataset.profileMediaSig||mediaBefore.dataset.happyadPublicMediaSigV646||mediaBefore.dataset.happyadPublicMediaStateV652)||''),
      clean(mediaNodeBefore&&(mediaNodeBefore.currentSrc||mediaNodeBefore.src||mediaNodeBefore.getAttribute&&mediaNodeBefore.getAttribute('src'))||'')
    ].join('|');
    if(card.dataset.haProfileNormalizedV665===normalizeSigV665)return;
    card.dataset.profileMediaType=type;
    card.classList.add('haProfilePublicationTileV570');
    card.classList.toggle('is-video',type==='video');
    card.setAttribute('tabindex','0');
    card.setAttribute('role','button');
    card.setAttribute('aria-label',(type==='video'?'Ouvrir la vidéo ':'Ouvrir la photo ')+(clean(p.title)||'HAPPYAD'));
    try{card.__happyadPost=Object.assign({},p,{id:id||p.id,kind:type,media_type:type});}catch(_e){}

    var media=qs('.profileMedia',card);
    if(media){
      media.classList.add('haProfilePublicationMediaV570');
      qsa('img',media).forEach(function(img){if(!(img.complete&&img.naturalWidth>0))img.loading='lazy';img.decoding='async';img.draggable=false;});
      qsa('video',media).forEach(function(v){try{v.pause();}catch(_e){}v.muted=true;v.playsInline=true;if(v.readyState<2&&!v.classList.contains('hpvReady'))v.preload='metadata';v.removeAttribute('autoplay');});
    }

    var play=qs('.profilePlay',card);
    if(type==='video'){
      if(!play){play=doc.createElement('span');play.className='profilePlay';card.appendChild(play);}
      play.innerHTML=svg('play');play.setAttribute('aria-hidden','true');
    }else if(play){play.remove();}

    var count=itemCount(p);
    if(count>1){var album=ensureMarker(card,'haProfileAlbumMarkerV570',svg('album'),'Album de '+count+' médias');album.dataset.count=String(count);}else removeMarker(card,'haProfileAlbumMarkerV570');
    if(isPrivate(p,card)){ensureMarker(card,'haProfilePrivateMarkerV570',svg('lock'),'Publication privée');}else removeMarker(card,'haProfilePrivateMarkerV570');
    card.dataset.haProfileNormalizedV665=normalizeSigV665;
  }
  function normalizeGrid(){
    var lists=qsa('#profilePostsList,#publicCreatorPosts,#publicationsBox .profilePosts');
    lists.forEach(function(list){
      list.classList.add('haProfilePublicationsGridV570');
      qsa(':scope > .profilePost',list).forEach(normalizeCard);
    });
    try{doc.dispatchEvent(new CustomEvent('happyad:profile-grid-ready',{detail:{version:VERSION,count:qsa('#publicationsBox .profilePost[data-post-id]').length}}));}catch(_e){}
  }

  function selectTab(name){
    name=clean(name)||'posts';
    var visitor=isVisitor();
    if(visitor&&(name==='saved'||name==='private'))name='posts';
    if(['posts','reposts','saved','private'].indexOf(name)<0)name='posts';
    try{
      if(window.HappyProfileContentTabsV683&&typeof window.HappyProfileContentTabsV683.open==='function'){
        window.HappyProfileContentTabsV683.open(name,{restore:true,source:'profile-publications-v570'});
        return;
      }
    }catch(_e){}
    var tabs=qs('#happyadProfileTabsMaster');if(!tabs)return;
    var btn=qs('.haProfileMasterTab[data-profile-tab="'+esc(name)+'"]',tabs)||qs('.haProfileMasterTab[data-profile-tab="posts"]',tabs);
    if(btn){tabs.dataset.activeTab=clean(btn.dataset.profileTab)||'posts';qsa('.haProfileMasterTab',tabs).forEach(function(b){b.classList.toggle('is-active',b===btn);});}
  }
  function restoreView(force){
    clearTimeout(restoreTimer);
    restoreTimer=setTimeout(function(){
      var s=readState();if(!s)return;
      if(!force&&!s.pending)return;
      if(Number(s.restoreUntil||0)&&Number(s.restoreUntil)<now()){clearPending();return;}
      selectTab(s.tab);
      normalizeGrid();
      var y=clamp(Number(s.scrollY||0),0,Math.max(0,doc.documentElement.scrollHeight-window.innerHeight));
      requestAnimationFrame(function(){window.scrollTo({top:y,left:0,behavior:'auto'});});
      clearPending();
    },80);
  }
  function cardFromEvent(e){return e&&e.target&&e.target.closest?e.target.closest('#publicationsBox .profilePost[data-post-id]'):null;}
  function isActionTarget(e){return !!(e&&e.target&&e.target.closest&&e.target.closest('button,a,input,textarea,select,[data-profile-act],.profileAct,.profileDelete,[data-delete-post],.haPostSheet'));
  }
  function prepareOpen(e){
    var card=cardFromEvent(e);if(!card||isActionTarget(e))return;
    var id=clean(card.dataset.postId);if(id)saveView(id,false);
  }
  function keyboardOpen(e){
    if(e.key!=='Enter'&&e.key!==' ')return;
    var card=cardFromEvent(e);if(!card||isActionTarget(e))return;
    e.preventDefault();
    var p=postOf(card);var type=mediaType(p,card);
    if(type==='video')setPending(card.dataset.postId);else saveView(card.dataset.postId,false);
    try{if(type==='video'&&typeof window.openLongPublishedVideo==='function')return window.openLongPublishedVideo(p);}catch(_e){}
    try{if(type!=='video'&&typeof window.openLongPublishedPhoto==='function')return window.openLongPublishedPhoto(p);}catch(_e){}
  }
  function wrapOpeners(){
    if(typeof window.openLongPublishedVideo==='function'&&!window.openLongPublishedVideo.__haV570){
      var ov=window.openLongPublishedVideo;
      var wv=function(x){setPending(clean((x&&x.id)||x));return ov.apply(this,arguments);};wv.__haV570=true;window.openLongPublishedVideo=wv;try{openLongPublishedVideo=wv;}catch(_e){}
    }
    if(typeof window.openLongPublishedPhoto==='function'&&!window.openLongPublishedPhoto.__haV570){
      var op=window.openLongPublishedPhoto;
      var wp=function(x){saveView(clean((x&&x.id)||x),false);return op.apply(this,arguments);};wp.__haV570=true;window.openLongPublishedPhoto=wp;try{openLongPublishedPhoto=wp;}catch(_e){}
    }
  }
  function bindObserver(){
    var box=qs('#publicationsBox');if(!box)return;
    if(observer)observer.disconnect();
    var queued=false;
    observer=new MutationObserver(function(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;normalizeGrid();wrapOpeners();});});
    observer.observe(box,{subtree:true,childList:true,attributes:true,attributeFilter:['class','data-post-id']});
  }
  function install(){
    doc.body.classList.add('haProfilePublicationsMasterV570');
    normalizeGrid();wrapOpeners();bindObserver();
    doc.addEventListener('pointerdown',prepareOpen,true);
    doc.addEventListener('keydown',keyboardOpen,true);
    doc.addEventListener('happyad:profile-posts-rendered',function(){normalizeGrid();setTimeout(function(){restoreView(false);},30);});
    window.addEventListener('pagehide',function(){var s=readState();saveView('',!!(s&&s.pending));});
    window.addEventListener('pageshow',function(){normalizeGrid();wrapOpeners();restoreView(false);});
    doc.addEventListener('visibilitychange',function(){if(doc.visibilityState==='visible'){normalizeGrid();wrapOpeners();restoreView(false);}});
    window.addEventListener('focus',function(){restoreView(false);});
    setTimeout(normalizeGrid,120);setTimeout(function(){normalizeGrid();wrapOpeners();restoreView(false);},700);setTimeout(normalizeGrid,1800);
    window.HappyProfilePublicationsV570={version:VERSION,refresh:normalizeGrid,save:function(id){setPending(id);},restore:function(){restoreView(true);},state:readState};
  }
  if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();


/* ===== profile-ui-fixes-master-v572.js ===== */
(function(){
  'use strict';
  if(window.__HAPPYAD_PROFILE_UI_FIXES_MASTER_V572__)return;
  window.__HAPPYAD_PROFILE_UI_FIXES_MASTER_V572__=true;

  var VERSION='PROFILE_UI_FIXES_MASTER_V572';
  var doc=document;
  var fsObserver=null;
  var fsObservedBox=null;
  var overlayObserver=null;
  var fsRefreshTimer=0;

  function qs(s,r){try{return (r||doc).querySelector(s);}catch(_e){return null;}}
  function qsa(s,r){try{return Array.prototype.slice.call((r||doc).querySelectorAll(s));}catch(_e){return [];}}
  function clean(v){return String(v==null?'':v).trim();}
  function esc(v){return clean(v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function compact(n){
    try{if(typeof window.happyadCompactCount==='function')return window.happyadCompactCount(n);}catch(_e){}
    n=Math.max(0,Number(n||0)||0);
    function f(v,s){var x=v>=100?Math.floor(v):Math.floor(v*10)/10;return String(x).replace(/\.0$/,'')+s;}
    if(n<1000)return String(Math.floor(n));
    if(n<1000000)return f(n/1000,'K');
    if(n<1000000000)return f(n/1000000,'M');
    return f(n/1000000000,'B');
  }
  function toast(msg){
    try{if(typeof window.toast==='function')return window.toast(msg);}catch(_e){}
    var t=qs('#toast');if(t){t.textContent=msg;t.classList.add('show');clearTimeout(t.__v572);t.__v572=setTimeout(function(){t.classList.remove('show');},1800);}
  }
  function svg(name){
    var icons={
      edit:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/></svg>',
      like:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6c-1.9-1.7-4.9-1.5-6.6.5L12 7.6 9.8 5.1C8.1 3.1 5.1 2.9 3.2 4.6 1.1 6.5 1 9.7 3 11.7l9 8.6 9-8.6c2-2 1.9-5.2-.2-7.1Z"/></svg>',
      comment:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-9 8.5 9.6 9.6 0 0 1-4-.9L3 20l1.1-4.2A8.3 8.3 0 0 1 3 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5Z"/></svg>',
      share:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
      repost:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m17 2 4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="m7 22-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/></svg>',
      fav:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z"/></svg>'
    };
    return icons[name]||icons.edit;
  }

  /* ---------------------------------------------------------
     1. Modifier : one visible SVG button, no legacy click path
     --------------------------------------------------------- */
  function hasAccount(){
    try{if(typeof window.hasHappyAccount==='function')return !!window.hasHappyAccount();}catch(_e){}
    try{return localStorage.getItem('HAPPYAD_SESSION_ACTIVE')==='1'&&!!clean(localStorage.getItem('HAPPYAD_AUTH_UID'));}catch(_e){return false;}
  }
  function openCleanEdit(e){
    try{if(e){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();}}catch(_e){}
    try{
      var settings=qs('#settingsPanel'),stats=qs('#statsPanel');
      if(settings)settings.classList.remove('show');
      if(stats)stats.classList.remove('show');
      if(hasAccount()&&typeof window.cleanEdit==='function'){window.cleanEdit();syncOverlay();return false;}
      if(typeof window.happyadOpenAuthChoice==='function'){window.happyadOpenAuthChoice();syncOverlay();return false;}
    }catch(err){console.warn('HAPPYAD V572 edit open',err);}
    toast('Modification du profil indisponible.');
    return false;
  }
  function installEditButton(){
    var host=qs('#actionFree');if(!host)return;
    var legacy=qs('#openEdit',host)||qs('#openEditLegacyV572',host);
    if(legacy&&legacy.id==='openEdit'){
      legacy.id='openEditLegacyV572';
      legacy.setAttribute('aria-hidden','true');
      legacy.tabIndex=-1;
    }
    if(legacy)legacy.style.setProperty('display','none','important');
    var btn=qs('#openEditMasterV572',host);
    if(!btn){
      btn=doc.createElement('button');
      btn.type='button';btn.id='openEditMasterV572';btn.className='primary haProfileEditMasterV572';
      btn.innerHTML=svg('edit')+'<span>Modifier</span>';
      host.appendChild(btn);
    }
    btn.onclick=openCleanEdit;
    qsa('[data-open-edit]').forEach(function(x){if(x.__haV572Edit)return;x.__haV572Edit=true;x.addEventListener('click',openCleanEdit,true);});
  }

  /* ---------------------------------------------------------
     2. Profile overlays must cover compact header and tabs
     --------------------------------------------------------- */
  function visiblePanel(el){
    if(!el)return false;
    if(el.classList.contains('show')||el.classList.contains('on'))return true;
    try{var st=getComputedStyle(el);return st.display!=='none'&&st.visibility!=='hidden'&&Number(st.opacity||1)>0&&(el.id==='editPanel'||el.id==='settingsPanel'||el.id==='statsPanel');}catch(_e){return false;}
  }
  function syncOverlay(){
    var open=visiblePanel(qs('#settingsPanel'))||visiblePanel(qs('#statsPanel'))||visiblePanel(qs('#editPanel'))||visiblePanel(qs('#profileEditBackdrop'));
    if(doc.body)doc.body.classList.toggle('haProfileOverlayOpenV572',!!open);
  }
  function installOverlayWatch(){
    syncOverlay();
    if(overlayObserver)overlayObserver.disconnect();
    overlayObserver=new MutationObserver(function(){syncOverlay();installEditButton();});
    try{overlayObserver.observe(doc.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style','hidden']});}catch(_e){}
    doc.addEventListener('click',function(){setTimeout(syncOverlay,0);setTimeout(syncOverlay,100);},true);
  }

  /* ---------------------------------------------------------
     3. Fullscreen photo: complete HOME-sized action row
     --------------------------------------------------------- */
  function currentBox(){return qs('#happyadHomePhotoFullscreen');}
  function currentId(box){
    box=box||currentBox();
    return clean((box&&box.dataset&&box.dataset.haProfileFsRootId)||window.__happyadProfileFsActionRootId||(window.__happyadPhotoReturnSourceV478&&window.__happyadPhotoReturnSourceV478.id));
  }
  function sourceCard(id){
    var src=window.__happyadPhotoReturnSourceV478||{};
    if(src.el&&doc.body.contains(src.el))return src.el;
    try{return qs('.profilePost[data-post-id="'+(window.CSS&&CSS.escape?CSS.escape(id):id.replace(/[^a-zA-Z0-9_-]/g,'\\$&'))+'"]');}catch(_e){return null;}
  }
  function findPost(id){
    id=clean(id);var card=sourceCard(id);try{if(card&&card.__happyadPost)return card.__happyadPost;}catch(_e){}
    try{var b=window.__HAPPYAD_PROFILE_HOME_PHOTO_BRIDGE_V482||{};if(b[id])return b[id];}catch(_e){}
    try{var arr=JSON.parse(localStorage.getItem('HAPPYAD_PROFILE_HOME_PHOTO_BRIDGE_V482')||'[]')||[];for(var i=0;i<arr.length;i++)if(clean(arr[i]&&arr[i].id)===id)return arr[i];}catch(_e){}
    var pools=[];
    try{if(typeof window.profileVisiblePosts==='function')pools.push(window.profileVisiblePosts());}catch(_e){}
    try{if(Array.isArray(window.ALL_POSTS))pools.push(window.ALL_POSTS);}catch(_e){}
    try{if(window.UserStore&&window.UserStore.data)pools.push(window.UserStore.data.postsList,window.UserStore.data.posts);}catch(_e){}
    for(var p=0;p<pools.length;p++){var list=Array.isArray(pools[p])?pools[p]:[];for(var j=0;j<list.length;j++)if(clean(list[j]&&list[j].id)===id)return list[j];}
    return {id:id,kind:'photo',media_type:'photo',title:'Publication HAPPYAD'};
  }
  function actionState(id){
    var a={};try{if(typeof window.getHappyAction==='function')a=window.getHappyAction(id)||{};}catch(_e){}
    if(!a||!Object.keys(a).length){try{var all=JSON.parse(localStorage.getItem('HAPPYAD_VIDEO_ACTIONS_V1')||'{}')||{};a=all[id]||{};}catch(_e){a={};}}
    a.like=!!a.like;a.fav=!!a.fav;a.repost=!!a.repost;a.likes=Math.max(0,Number(a.likes||0));a.comments=Math.max(0,Number(a.comments||0));a.shares=Math.max(0,Number(a.shares||0));a.reposts=Math.max(0,Number(a.reposts||0));a.favs=Math.max(0,Number(a.favs||0));return a;
  }
  function saveAction(id,a){
    try{if(typeof window.setHappyAction==='function'){window.setHappyAction(id,a);return;}}catch(_e){}
    try{var all=JSON.parse(localStorage.getItem('HAPPYAD_VIDEO_ACTIONS_V1')||'{}')||{};all[id]=a;localStorage.setItem('HAPPYAD_VIDEO_ACTIONS_V1',JSON.stringify(all));}catch(_e){}
  }
  /* V678 : la republication utilise le même état que J’aime/Favoris. Aucun second cache concurrent. */
  function fsHtml(){
    return [
      ['like','J’aime'],['comment','Commentaires'],['share','Partager'],['repost','Republier'],['fav','Favoris']
    ].map(function(x){return '<button class="haHomeFsAct haProfileFsActV572" data-profile-fs-act="'+x[0]+'" type="button" aria-label="'+x[1]+'"><span class="haFsSvg">'+svg(x[0])+'</span><small>0</small></button>';}).join('');
  }
  function rebuildFsActions(box){
    if(!box)return null;
    var old=qs('.haHomeFsActions',box),card=qs('.haHomeFsCard',box)||box;
    if(!old){
      old=doc.createElement('div');old.className='haHomeFsActions haProfileFsActionsV572';
      var cap=qs('.haHomeFsCaption',box);if(cap&&cap.parentNode)cap.parentNode.insertBefore(old,cap);else card.appendChild(old);
    }
    var actionButtons=qsa('[data-profile-fs-act]',old);
    var complete=old.classList.contains('haProfileFsActionsV572')&&actionButtons.length===5&&!!qs('[data-profile-fs-act="repost"]',old)&&!!qs('[data-profile-fs-act="fav"]',old);
    if(!complete){
      var replacement=doc.createElement('div');replacement.className='haHomeFsActions haProfileFsActionsV572';replacement.innerHTML=fsHtml();
      old.replaceWith(replacement);old=replacement;
    }
    old.__v485Ready=true;old.__v485Bound=true;
    old.classList.add('haProfileFsActionsV572');
    if(!old.__haV572Bound){old.__haV572Bound=true;old.addEventListener('click',onFsAction,true);}
    box.classList.add('happyadProfileFsActions','happyadProfileFsActionsV572');
    return old;
  }
  function updateFs(box){
    box=box||currentBox();if(!box||!box.classList.contains('on'))return;
    var id=currentId(box);if(!id)return;
    var acts=rebuildFsActions(box),a=actionState(id);
    var post=findPost(id);
    var values={
      like:Number(a.likes||post.likes_count||post.likes||0),
      comment:Number(a.comments||post.comments_count||post.comments||0),
      share:Number(a.shares||post.shares_count||post.shares||0),
      repost:Number(a.reposts||post.reposts_count||post.repost_count||0),
      fav:Number(a.favs||post.saves_count||post.favorites_count||0)
    };
    qsa('[data-profile-fs-act]',acts).forEach(function(btn){
      var t=btn.dataset.profileFsAct,sm=qs('small',btn);if(sm)sm.textContent=compact(values[t]||0);
      btn.classList.toggle('on',t==='like'?!!a.like:t==='fav'?!!a.fav:t==='repost'?!!a.repost:false);
    });
  }
  function clickSource(type){
    var id=currentId(),card=sourceCard(id);if(!card)return false;
    var b=qs('[data-profile-act="'+type+'"]',card);if(!b)return false;
    try{b.click();setTimeout(function(){updateFs(currentBox());},40);setTimeout(function(){updateFs(currentBox());},700);return true;}catch(_e){return false;}
  }
  function openShare(){
    var id=currentId(),post=findPost(id);
    try{
      if(window.parent&&window.parent!==window&&window.parent.postMessage){window.parent.postMessage({type:'HAPPYAD_SHARE_OPEN',detail:post},'*');return true;}
      if(window.HappyadShareMaster&&typeof window.HappyadShareMaster.open==='function'){window.HappyadShareMaster.open(post,window);return true;}
    }catch(_e){}
    return false;
  }
  async function toggleRepost(){
    if(clickSource('repost'))return true;
    var id=currentId(),post=findPost(id),a=actionState(id),before={on:!!a.repost,count:Number(a.reposts||post.reposts_count||0)},next=!before.on;
    a.repost=next;a.reposts=Math.max(0,before.count+(next?1:-1));saveAction(id,a);updateFs(currentBox());
    try{
      var c=window.happyadSupabase||null;if(!c&&window.supabase&&window.supabase.createClient)c=window.happyadSupabase=window.supabase.createClient(window.HAPPYAD_SUPABASE_URL,window.HAPPYAD_SUPABASE_KEY,{auth:{persistSession:true}});
      if(!c)throw new Error('Supabase non chargé');
      var uid='';try{uid=localStorage.getItem('HAPPYAD_AUTH_UID')||'';}catch(_e){}
      if(!uid&&c.auth){var au=await c.auth.getUser();uid=clean(au&&au.data&&au.data.user&&au.data.user.id);}
      if(!uid)throw new Error('Connecte-toi pour republier');
      var row={post_id:id,content_id:id,content_type:'photo',action_type:'repost',user_id:uid,liked:next};
      var r=await c.from('happyad_content_actions').upsert(row,{onConflict:'post_id,content_type,action_type,user_id'});if(r.error)throw r.error;
      try{localStorage.setItem('HAPPYAD_ACTION_FAST_SYNC_V1',JSON.stringify({id:id,t:Date.now()}));}catch(_e){}
      toast(next?'Publication republiée':'Republication retirée');return true;
    }catch(err){a=actionState(id);a.repost=before.on;a.reposts=before.count;saveAction(id,a);updateFs(currentBox());toast((err&&err.message)||'Republication impossible');return false;}
  }
  function onFsAction(e){
    var b=e.target&&e.target.closest&&e.target.closest('[data-profile-fs-act]');if(!b)return;
    e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
    var t=b.dataset.profileFsAct;
    if(t==='like'||t==='comment'||t==='fav'||t==='repost'){if(!clickSource(t))toast('Action indisponible.');}
    else if(t==='share'){if(!openShare())toast('Partage indisponible.');}
    return false;
  }
  function enhanceFullscreen(){
    clearTimeout(fsRefreshTimer);
    var box=currentBox();if(!box||!box.classList.contains('on'))return;
    rebuildFsActions(box);updateFs(box);
    fsRefreshTimer=setTimeout(function(){updateFs(box);},480);
  }
  function installFullscreenWatch(){
    var watch=function(){
      var box=currentBox();if(!box)return;
      if(fsObservedBox!==box){
        try{if(fsObserver)fsObserver.disconnect();}catch(_disconnect){}
        fsObservedBox=box;
        fsObserver=new MutationObserver(function(mutations){
          if(!box.classList.contains('on'))return;
          var needsRepair=(mutations||[]).some(function(m){
            if(m.type==='attributes')return m.target===box;
            if(m.type!=='childList')return false;
            var target=m.target;
            return target===box||!!(target&&target.classList&&(target.classList.contains('haHomeFsCard')||target.classList.contains('haHomeFsActions')));
          });
          if(needsRepair){setTimeout(enhanceFullscreen,0);setTimeout(enhanceFullscreen,80);setTimeout(enhanceFullscreen,260);}
        });
        fsObserver.observe(box,{attributes:true,childList:true,subtree:true,attributeFilter:['class','data-ha-profile-fs-root-id']});
      }
      if(box.classList.contains('on'))enhanceFullscreen();
    };
    watch();
    var bodyMo=new MutationObserver(function(){watch();});try{bodyMo.observe(doc.body,{childList:true,subtree:false});}catch(_e){}
    doc.addEventListener('happyad:profile-fullscreen-open-v660',function(){watch();setTimeout(enhanceFullscreen,0);setTimeout(enhanceFullscreen,90);},true);
    doc.addEventListener('click',function(e){if(e.target&&e.target.closest&&e.target.closest('.profilePost[data-post-id]')){setTimeout(enhanceFullscreen,0);setTimeout(enhanceFullscreen,120);setTimeout(enhanceFullscreen,360);}},true);
    window.addEventListener('storage',function(e){if(/HAPPYAD_VIDEO_ACTIONS/.test(e.key||''))updateFs(currentBox());});
  }

  function install(){
    if(doc.body)doc.body.classList.add('haProfileUiFixesV572');
    installEditButton();installOverlayWatch();installFullscreenWatch();
    setTimeout(installEditButton,300);setTimeout(installEditButton,1000);
    window.HappyProfileUiFixesV572={version:VERSION,refreshFullscreen:enhanceFullscreen,syncOverlay:syncOverlay,openEdit:openCleanEdit};
  }
  if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();


/* ===== profile-performance-master-v573.js ===== */
(function(){
  'use strict';
  if(window.__HAPPYAD_PROFILE_PERFORMANCE_MASTER_V573__)return;
  window.__HAPPYAD_PROFILE_PERFORMANCE_MASTER_V573__=true;

  var doc=document,body=doc.body,root=doc.documentElement;
  var current=null,lockY=0,observer=null,backdrop=null,raf=0;
  function qs(s,r){try{return (r||doc).querySelector(s);}catch(_e){return null;}}
  function panels(){return [qs('#settingsPanel'),qs('#statsPanel'),qs('#editPanel')].filter(Boolean);}
  function open(el){if(!el)return false;if(el.id==='editPanel'){try{var st=getComputedStyle(el);return el.classList.contains('show')&&st.display!=='none';}catch(_e){return el.classList.contains('show');}}return el.classList.contains('show');}
  function svgClose(){return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';}
  function titleOf(el){return el&&el.id==='settingsPanel'?'Paramètres':el&&el.id==='statsPanel'?'Statistiques':'Modifier';}
  function closePanel(el){
    if(!el)return;
    if(el.id==='editPanel'){
      try{if(typeof window.closeProfileEditModal==='function'){window.closeProfileEditModal();return;}}catch(_e){}
      var b=qs('#profileEditBackdrop');el.classList.remove('show');el.style.display='none';if(b)b.classList.remove('show');
    }else el.classList.remove('show');
    scheduleSync();
  }
  function ensureHeader(el){
    if(!el||el.id==='editPanel')return;
    var h=qs(':scope > .haProfilePanelHeaderV573',el);
    if(!h){
      h=doc.createElement('div');h.className='haProfilePanelHeaderV573';
      h.innerHTML='<strong>'+titleOf(el)+'</strong><button type="button" class="haProfilePanelCloseV573" aria-label="Fermer '+titleOf(el)+'">'+svgClose()+'</button>';
      el.insertBefore(h,el.firstChild);
      var b=qs('.haProfilePanelCloseV573',h);if(b)b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();closePanel(el);},{passive:false});
    }
  }
  function ensureBackdrop(){
    if(backdrop&&doc.body.contains(backdrop))return backdrop;
    backdrop=doc.createElement('div');backdrop.id='happyadProfilePanelBackdropV573';backdrop.setAttribute('aria-hidden','true');
    backdrop.addEventListener('pointerup',function(e){if(e.target===backdrop&&current)closePanel(current);});
    doc.body.appendChild(backdrop);return backdrop;
  }
  function lock(el){
    if(current===el&&body.classList.contains('haProfilePanelLockedV573'))return;
    if(current&&current!==el)current.__haV573ScrollTop=current.scrollTop||0;
    current=el;ensureHeader(el);ensureBackdrop();
    lockY=Math.max(0,window.pageYOffset||root.scrollTop||body.scrollTop||0);
    body.style.top=(-lockY)+'px';root.classList.add('haProfilePanelLockedV573');body.classList.add('haProfilePanelLockedV573');backdrop.classList.add('show');
    requestAnimationFrame(function(){try{el.scrollTop=Number(el.__haV573ScrollTop||0);}catch(_e){}});
  }
  function unlock(){
    if(current)current.__haV573ScrollTop=current.scrollTop||0;
    current=null;if(backdrop)backdrop.classList.remove('show');
    root.classList.remove('haProfilePanelLockedV573');body.classList.remove('haProfilePanelLockedV573');body.style.removeProperty('top');
    try{window.scrollTo(0,lockY);}catch(_e){}
  }
  function sync(){
    raf=0;var list=panels(),active=null;
    for(var i=0;i<list.length;i++){if(open(list[i])){active=list[i];break;}}
    if(active)lock(active);else if(current)unlock();
  }
  function scheduleSync(){if(raf)return;raf=requestAnimationFrame(sync);}
  function bindPanel(el){
    if(!el||el.__haProfilePerformanceV573)return;el.__haProfilePerformanceV573=true;
    el.addEventListener('touchstart',function(e){e.stopPropagation();},{passive:true});
    el.addEventListener('touchmove',function(e){e.stopPropagation();},{passive:true});
    el.addEventListener('wheel',function(e){e.stopPropagation();},{passive:true});
  }
  function install(){
    body=doc.body;root=doc.documentElement;ensureBackdrop();panels().forEach(function(el){bindPanel(el);ensureHeader(el);});
    observer=new MutationObserver(function(muts){
      for(var i=0;i<muts.length;i++){var t=muts[i].target;if(t&&t.id==='editPanel')bindPanel(t);}
      scheduleSync();
    });
    panels().forEach(function(el){observer.observe(el,{attributes:true,attributeFilter:['class','style'],childList:true});});
    var pb=qs('#profileEditBackdrop');if(pb)observer.observe(pb,{attributes:true,attributeFilter:['class','style']});
    doc.addEventListener('click',function(){scheduleSync();},true);
    window.addEventListener('pageshow',scheduleSync);
    window.addEventListener('pagehide',function(){if(current)unlock();});
    scheduleSync();
    window.HappyProfilePerformanceV573={version:'PROFILE_PERFORMANCE_V573',sync:scheduleSync,close:function(){if(current)closePanel(current);}};
  }
  if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();


/* HAPPYAD V621C — aucun ancien design ne doit être peint avant le maître final. */
;(function(){
  if(window.__HAPPYAD_PROFILE_BOOT_READY_V621C__)return;
  window.__HAPPYAD_PROFILE_BOOT_READY_V621C__=true;
  var done=false;
  function reveal(){
    if(done)return;done=true;
    try{clearTimeout(window.__HAPPYAD_PROFILE_BOOT_GATE_FALLBACK_V621C);}catch(_e){}
    try{document.documentElement.classList.remove('haProfileBootGateV621C');document.documentElement.classList.add('haProfileReadyV621C');}catch(_e){}
    try{window.parent&&window.parent!==window&&window.parent.postMessage({type:'HAPPYAD_PROFILE_VISUAL_READY_V621C'},'*');}catch(_e){}
  }
  function afterPaint(){
    requestAnimationFrame(function(){requestAnimationFrame(reveal);});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',afterPaint,{once:true});
  else afterPaint();
  document.addEventListener('happyad:profile-grid-ready',reveal,{once:true});
  setTimeout(reveal,1500);
})();


/* ===== profile-card-state-master-v646.js ===== */
(function(){
  'use strict';
  if(window.__HAPPYAD_PROFILE_CARD_STATE_MASTER_V646__)return;
  window.__HAPPYAD_PROFILE_CARD_STATE_MASTER_V646__=true;
  try{
    if(window.HappyMasterRegistry)window.HappyMasterRegistry.register('profile-card-state',{file:'core/profile-master-v660.js',responsibility:'conserver les cartes et médias déjà rendus pendant le scroll et la pagination',active:true,version:'V646'});
  }catch(_e){}
})();
