/* HAPPYAD HOME CARD RENDERER V1
   Responsabilité unique : construire une carte Accueil à partir d'une publication
   déjà ordonnée/normalisée par Home Feed Master. Ce module ne trie, ne pagine et
   ne modifie jamais la chronologie du fil. */
(function(){
  'use strict';
  if(window.HappyHomeCardRendererV1)return;

  var VERSION='V2_DYNAMIC_CARD_PAYLOAD';
  var bridge=null;

  function connect(adapter){bridge=adapter||null;return api;}
  function b(name){return bridge&&typeof bridge[name]==='function'?bridge[name]:null;}
  function call(name){var fn=b(name);if(!fn)return undefined;return fn.apply(bridge,[].slice.call(arguments,1));}
  function safeText(v){return String(v==null?'':v);}
  function esc(v){var fn=b('esc');if(fn)return fn(v);return safeText(v).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];});}

  function bindDoubleTapLike(card,p){
    try{
      var media=card&&card.querySelector&&card.querySelector('.miniMedia');
      if(!media||media.__happyadDoubleTap)return;
      media.__happyadDoubleTap=1;
      var last=0;
      media.addEventListener('click',function(e){
        if(e.target&&e.target.closest&&e.target.closest('[data-card-act],button,a'))return;
        var now=Date.now();
        if(now-last<330){
          e.preventDefault();e.stopPropagation();
          var btn=card.querySelector('[data-card-act="like"]');
          var cp=card.__happyadPost||p;
          var a=call('getAction',cp&&cp.id)||{};
          if(btn&&!(a&&a.like))btn.click();
          var h=document.createElement('div');
          h.className='happyadDoubleTapHeart';h.textContent='♥';media.appendChild(h);
          setTimeout(function(){try{h.remove();}catch(_e){}},760);
          last=0;return false;
        }
        last=now;
      },true);
    }catch(_e){}
  }

  function createCard(p){
    if(!p)throw new Error('HappyHomeCardRendererV1.createCard: post manquant');
    call('primeAction',p);
    var video=!!call('isVideo',p);
    var owner=call('ownerData',p)||{};
    var name=owner.name||'Utilisateur HAPPYAD';
    var title=p.title||'Publication HAPPYAD';
    var rawDesc=safeText(p.desc||p.description||p.caption||'').trim();
    var desc=(rawDesc&&rawDesc!==safeText(title).trim())?rawDesc:'';
    var meta=p.location?('📍 '+p.location):(p.category||'Publication');
    var showMore=desc.length>74;
    var card=document.createElement('div');
    card.__happyadPost=p;
    card.className='miniCard'+(video?' videoCard':'')+(call('isLive',p)?' isLive':'');
    card.dataset.postId=safeText(p.id||'');
    card.dataset.feedKey=safeText(p.__feedCardKey||('post:'+safeText(p.id||'')));

    var av=owner.avatar?'<img src="'+esc(owner.avatar)+'" alt="">':esc(call('initials',name)||'H');
    var ago=call('timeAgo',call('postTimestamp',p))||'';
    var album=!video&&Number(p&&p.__albumCount||0)>1;

    if(album){
      call('prepareAlbumShell',card,p);
      call('refreshAction',card,p.id);
      call('observeCard',card,p,false);
      return card;
    }

    var badge=call('badgeHtml',owner.badge)||'';
    card.innerHTML='<div class="miniCardFrame"><div class="miniTop"><div class="avatar">'+av+'</div><div class="creator"><b>'+esc(name)+badge+'</b><span>'+esc(p.location||'HAPPYAD')+'</span></div><div class="miniPostDate">'+esc(ago)+'</div></div><div class="miniMedia"><div class="play">▶</div></div><div class="miniBody"><div class="miniTitleRow"><div class="miniTitle">'+esc(title||'Publication HAPPYAD')+'</div></div>'+(desc?'<div class="miniDesc">'+esc(desc)+'</div>':'')+(showMore?'<button class="miniSeeMore" type="button">Voir plus</button>':'')+'<div class="miniMeta">'+esc(meta)+'</div></div></div><div class="miniActions"><button class="actionBtn" data-card-act="like"><span class="haLineIcon haLikeIcon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M20.8 4.6c-1.9-1.7-4.9-1.5-6.6.5L12 7.6 9.8 5.1C8.1 3.1 5.1 2.9 3.2 4.6 1.1 6.5 1 9.7 3 11.7l9 8.6 9-8.6c2-2 1.9-5.2-.2-7.1z"/></svg></span><small>0</small></button><button class="actionBtn" data-card-act="comment"><span class="haLineIcon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M21 11.5a8.5 8.5 0 0 1-9 8.5 9.6 9.6 0 0 1-4-.9L3 20l1.1-4.2A8.3 8.3 0 0 1 3 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5z"/></svg></span><small>0</small></button><button class="actionBtn" data-card-act="share"><span class="haLineIcon" aria-hidden="true"><svg class="haSharePlaneSvg" viewBox="0 0 24 24"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg></span><small>0</small></button><button class="actionBtn" data-card-act="repost"><span class="haLineIcon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg></span><small>0</small></button><button class="actionBtn fav" data-card-act="fav"><span class="haLineIcon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/></svg></span><small>0</small></button></div>';

    try{
      var top=card.querySelector('.miniTop');
      if(top)top.onclick=function(e){e.preventDefault();e.stopPropagation();return call('openProfile',card.__happyadPost||p);};
    }catch(_e){}

    var seeBtn=card.querySelector('.miniSeeMore');
    if(seeBtn)seeBtn.onclick=function(e){
      e.preventDefault();e.stopPropagation();
      var cp=card.__happyadPost||p;
      if(video)call('openVideo',cp&&cp.id,cp);else call('openPhoto',cp&&cp.id,cp);
      return false;
    };

    bindDoubleTapLike(card,p);
    if(!video){try{call('preparePhotoRatio',card.querySelector('.miniMedia'),p);}catch(_e){}}

    if(video){
      var media=card.querySelector('.miniMedia');
      var a=call('getAction',p.id)||{};
      var views=call('formatViews',(a&&a.views)||p.views_count||p.video_views_count||0)||'0';
      if(media)media.insertAdjacentHTML('beforeend','<div class="videoHint">Ouvrir vidéo longue</div><div class="happyadVideoViewsBadge">'+esc(views)+'</div>');
      else card.insertAdjacentHTML('beforeend','<div class="happyadVideoViewsBadge">0</div>');
      card.onclick=function(e){if(e.target&&e.target.closest&&e.target.closest('[data-card-act]'))return;var cp=card.__happyadPost||p;call('openVideo',cp&&cp.id,cp);};
    }else{
      card.onclick=function(e){if(e.target&&e.target.closest&&e.target.closest('[data-card-act]'))return;var cp=card.__happyadPost||p;call('openPhoto',cp&&cp.id,cp);};
    }

    call('refreshAction',card,p.id);
    call('observeCard',card,p,video);
    return card;
  }

  var api={version:VERSION,connect:connect,createCard:createCard};
  window.HappyHomeCardRendererV1=api;
})();
