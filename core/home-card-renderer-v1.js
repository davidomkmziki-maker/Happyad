/* HAPPYAD HOME CARD RENDERER V1
   Responsabilité unique : construire une carte Accueil à partir d'une publication
   déjà ordonnée/normalisée par Home Feed Master. Ce module ne trie, ne pagine et
   ne modifie jamais la chronologie du fil. */
(function(){
  'use strict';
  if(window.HappyHomeCardRendererV1)return;

  var VERSION='V937R2_MULTI_MENTION_BLUE_RENDER';
  var bridge=null;

  function connect(adapter){bridge=adapter||null;return api;}
  function b(name){return bridge&&typeof bridge[name]==='function'?bridge[name]:null;}
  function call(name){var fn=b(name);if(!fn)return undefined;return fn.apply(bridge,[].slice.call(arguments,1));}
  function safeText(v){return String(v==null?'':v);}
  function esc(v){var fn=b('esc');if(fn)return fn(v);return safeText(v).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];});}
  function mentionHtml(v,p){try{var m=window.HappyMentionRenderV937R1;if(m&&typeof m.html==='function')return m.html(v,p);}catch(_e){}return esc(v);}
  function videoViewsBadge(v){
    var value=esc(v==null?'0':v);
    return '<div class="happyadVideoViewsBadge" aria-label="'+value+' vues"><svg class="happyadVideoViewsPlaySvg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7.5 5.2v13.6L18.5 12 7.5 5.2Z"></path></svg><span class="happyadVideoViewsCount">'+value+'</span></div>';
  }


  function truth(v){return v===true||v===1||/^(true|1|yes|oui|on)$/i.test(safeText(v).trim());}
  function isMarketplace(p){p=p||{};return truth(p.happyadMarketplace)||truth(p.happyad_marketplace)||truth(p.is_marketplace)||safeText(p.mode).trim().toLowerCase()==='marketplace';}

  function createMarketplaceCard(p){
    var video=!!call('isVideo',p);
    var owner=call('ownerData',p)||{};
    var name=owner.name||'Utilisateur HAPPYAD';
    var ownerUid=safeText(owner.id||owner.user_id||p.creatorId||p.creator_id||p.user_id||p.owner_id||p.author_id||'').trim();
    var title=p.title||'Annonce HAPPYAD';
    var rawDesc=safeText(p.desc||p.description||p.caption||'').trim();
    var desc=(rawDesc&&rawDesc!==safeText(title).trim())?rawDesc:'';
    var meta=p.location?('📍 '+p.location):(p.marketplaceCategory||p.marketplace_category||p.category||'Annonce');
    var card=document.createElement('div');
    card.__happyadPost=p;
    card.__happyadVideo=video;
    card.className='miniCard happyadMarketplaceDedicatedCardV856'+(video?' videoCard':'');
    card.dataset.postId=safeText(p.id||p.post_id||'');
    card.dataset.feedKey=safeText(p.__feedCardKey||('post:'+safeText(p.id||p.post_id||'')));
    card.dataset.happyadMarketplace='1';
    if(ownerUid)card.dataset.happyadOwnerUid=ownerUid;
    var av=owner.avatar?'<img src="'+esc(owner.avatar)+'" alt="">':esc(call('initials',name)||'H');
    var avatarAttrs=(ownerUid?' data-happyad-avatar-uid="'+esc(ownerUid)+'"':'')+' data-happyad-avatar-name="'+esc(name)+'"';
    var ago=call('timeAgo',call('postTimestamp',p))||'';
    var badge=call('badgeHtml',owner.badge)||'';
    card.innerHTML='<div class="miniCardFrame"><div class="miniTop"><div class="avatar"'+avatarAttrs+'>'+av+'</div><div class="creator"><b>'+esc(name)+badge+'</b><span>'+esc(p.location||'HAPPYAD')+'</span></div><div class="miniPostDate">'+esc(ago)+'</div><span class="happyadMarketplaceHomeTagV856">ANNONCE</span></div><div class="miniMedia">'+(video?'<div class="play">▶</div>':'')+'</div><div class="miniBody"><div class="miniTitleRow"><div class="miniTitle">'+esc(title||'Annonce HAPPYAD')+'</div></div>'+(desc?'<div class="miniDesc happyadMarketplaceDescV856">'+esc(desc)+'</div>':'')+'<div class="miniMeta">'+esc(meta)+'</div></div></div><div class="happyadMarketplaceCtaRowV856"><button class="happyadMarketplaceShareOnlyV857" type="button" data-card-act="share" aria-label="Partager l’annonce"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg></button><button class="happyadMarketplaceCardCtaV856" type="button"><span>Voir l’annonce</span><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></div>';
    try{var top=card.querySelector('.miniTop');if(top)top.onclick=function(e){e.preventDefault();e.stopPropagation();return call('openProfile',card.__happyadPost||p);};}catch(_e){}
    var cta=card.querySelector('.happyadMarketplaceCardCtaV856');
    if(cta)cta.onclick=function(e){e.preventDefault();e.stopPropagation();var cp=card.__happyadPost||p;return call('openListing',cp&& (cp.id||cp.post_id),cp);};
    var media=card.querySelector('.miniMedia');
    if(media)media.onclick=function(e){e.preventDefault();e.stopPropagation();var cp=card.__happyadPost||p;if(video)return call('openVideo',cp&&(cp.id||cp.post_id),cp);return call('openPhoto',cp&&(cp.id||cp.post_id),cp);};
    card.onclick=function(e){if(e.target&&e.target.closest&&e.target.closest('button,a,.miniTop,.miniMedia'))return;var cp=card.__happyadPost||p;if(video)return call('openVideo',cp&&(cp.id||cp.post_id),cp);return call('openPhoto',cp&&(cp.id||cp.post_id),cp);};
    if(!video){try{call('preparePhotoRatio',card.querySelector('.miniMedia'),p);}catch(_e){}}
    call('observeMedia',card,p,video);
    return card;
  }

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
    if(isMarketplace(p))return createMarketplaceCard(p);
    call('primeAction',p);
    var video=!!call('isVideo',p);
    var owner=call('ownerData',p)||{};
    var name=owner.name||'Utilisateur HAPPYAD';
    var ownerUid=safeText(owner.id||owner.user_id||p.creatorId||p.creator_id||p.user_id||p.owner_id||p.author_id||'').trim();
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
    if(ownerUid)card.dataset.happyadOwnerUid=ownerUid;

    var av=owner.avatar?'<img src="'+esc(owner.avatar)+'" alt="">':esc(call('initials',name)||'H');
    var avatarAttrs=(ownerUid?' data-happyad-avatar-uid="'+esc(ownerUid)+'"':'')+' data-happyad-avatar-name="'+esc(name)+'"';
    var ago=call('timeAgo',call('postTimestamp',p))||'';
    var album=!video&&Number(p&&p.__albumCount||0)>1;

    if(album){
      call('prepareAlbumShell',card,p);
      call('refreshAction',card,p.id);
      call('observeCard',card,p,false);
      return card;
    }

    var badge=call('badgeHtml',owner.badge)||'';
    card.innerHTML='<div class="miniCardFrame"><div class="miniTop"><div class="avatar"'+avatarAttrs+'>'+av+'</div><div class="creator"><b>'+esc(name)+badge+'</b><span>'+esc(p.location||'HAPPYAD')+'</span></div><div class="miniPostDate">'+esc(ago)+'</div></div><div class="miniMedia"><div class="play">▶</div></div><div class="miniBody"><div class="miniTitleRow"><div class="miniTitle">'+esc(title||'Publication HAPPYAD')+'</div></div>'+(desc?'<div class="miniDesc">'+mentionHtml(desc,p)+'</div>':'')+(showMore?'<button class="miniSeeMore" type="button">Voir plus</button>':'')+'<div class="miniMeta">'+esc(meta)+'</div></div></div><div class="miniActions"><button class="actionBtn" data-card-act="like"><span class="haLineIcon haLikeIcon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M20.8 4.6c-1.9-1.7-4.9-1.5-6.6.5L12 7.6 9.8 5.1C8.1 3.1 5.1 2.9 3.2 4.6 1.1 6.5 1 9.7 3 11.7l9 8.6 9-8.6c2-2 1.9-5.2-.2-7.1z"/></svg></span><small>0</small></button><button class="actionBtn" data-card-act="comment"><span class="haLineIcon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M21 11.5a8.5 8.5 0 0 1-9 8.5 9.6 9.6 0 0 1-4-.9L3 20l1.1-4.2A8.3 8.3 0 0 1 3 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5z"/></svg></span><small>0</small></button><button class="actionBtn" data-card-act="share"><span class="haLineIcon" aria-hidden="true"><svg class="haSharePlaneSvg" viewBox="0 0 24 24"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg></span><small>0</small></button><button class="actionBtn" data-card-act="repost"><span class="haLineIcon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg></span><small>0</small></button><button class="actionBtn fav" data-card-act="fav"><span class="haLineIcon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/></svg></span></button></div>';

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
      if(media)media.insertAdjacentHTML('beforeend','<div class="videoHint">Ouvrir vidéo longue</div>'+videoViewsBadge(views));
      else card.insertAdjacentHTML('beforeend',videoViewsBadge('0'));
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
