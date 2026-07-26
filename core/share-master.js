(function(){
  'use strict';
  if(window.__HAPPYAD_SHARE_MASTER_V561__)return;
  window.__HAPPYAD_SHARE_MASTER_V561__=true;
  var VERSION='V634_STORY_CONVERSATION_SHARE';
  var CENTER_ID='happyadShareCenter';
  var FRAME_ID='happyadShareCenterFrame';
  var SHEET_ID='happyadShareSheet';
  var DRAG_ID='happyadShareDragHandle';
  var HEADER_DRAG_ID='happyadShareHeaderDragZone';
  var HEIGHT_KEY='HAPPYAD_SHARE_SHEET_HEIGHT_V560';
  var HISTORY_FLAG='__happyadShareCenter';
  var SHARED_POST_FLAG='__happyadSharedPost';
  var current=null;
  var sourceWindow=null;
  var frameReady=false;
  var returnMessageContext=null;
  var shareDragController=null;
  var sourceMediaSnapshot=null;
  function clean(v){return String(v==null?'':v).trim();}

  function captureSourceMedia(src){
    sourceMediaSnapshot=null;
    try{
      if(!src||!src.document)return null;
      var videos=Array.prototype.slice.call(src.document.querySelectorAll('video'));
      if(!videos.length)return null;
      var chosen=videos.find(function(v){return !v.paused&&!v.ended&&v.readyState>1;});
      if(!chosen){
        chosen=videos.find(function(v){
          try{
            var r=v.closest('.reel[data-id],.videoCard,[data-post-id]');
            if(!r)return false;
            var b=r.getBoundingClientRect();
            return b.bottom>0&&b.top<(src.innerHeight||720);
          }catch(_e){return false;}
        });
      }
      if(!chosen)chosen=videos[0];
      var host=null;
      try{host=chosen.closest('.reel[data-id],[data-post-id]');}catch(_e){}
      sourceMediaSnapshot={
        win:src,
        video:chosen,
        postId:clean(host&&((host.dataset&&host.dataset.id)||(host.dataset&&host.dataset.postId))),
        currentTime:Number(chosen.currentTime)||0,
        wasPlaying:!chosen.paused&&!chosen.ended,
        muted:!!chosen.muted,
        volume:Number.isFinite(Number(chosen.volume))?Number(chosen.volume):1,
        playbackRate:Number.isFinite(Number(chosen.playbackRate))?Number(chosen.playbackRate):1,
        capturedAt:Date.now()
      };
      try{chosen.dataset.happyadShareKeepAlive='1';}catch(_e){}
      return sourceMediaSnapshot;
    }catch(_e){sourceMediaSnapshot=null;return null;}
  }
  function restoreSourceMedia(snapshot){
    snapshot=snapshot||sourceMediaSnapshot;
    if(!snapshot)return false;
    function restore(){
      try{
        var w=snapshot.win;
        if(!w||w.closed||!w.document)return false;
        var v=snapshot.video;
        if(!v||!v.isConnected){
          if(snapshot.postId){
            var sel='.reel[data-id="'+css(snapshot.postId)+'"] video,[data-post-id="'+css(snapshot.postId)+'"] video';
            v=w.document.querySelector(sel);
          }
          if(!v)v=w.document.querySelector('video');
        }
        if(!v)return false;
        try{v.muted=snapshot.muted;}catch(_e){}
        try{v.volume=snapshot.volume;}catch(_e){}
        try{v.playbackRate=snapshot.playbackRate;}catch(_e){}
        try{
          if(Number.isFinite(snapshot.currentTime)&&Math.abs((Number(v.currentTime)||0)-snapshot.currentTime)>.75){
            v.currentTime=snapshot.currentTime;
          }
        }catch(_e){}
        try{delete v.dataset.happyadShareKeepAlive;}catch(_e){}
        if(snapshot.wasPlaying){
          try{var pr=v.play();if(pr&&pr.catch)pr.catch(function(){});}catch(_e){}
        }
        return true;
      }catch(_e){return false;}
    }
    restore();
    setTimeout(restore,60);
    setTimeout(restore,220);
    return true;
  }
  function shareIsOpen(){
    try{var el=document.getElementById(CENTER_ID);return !!(el&&el.classList.contains('on'));}catch(_e){return false;}
  }
  function clone(v){try{return JSON.parse(JSON.stringify(v));}catch(_e){return v;}}
  function css(v){try{return window.CSS&&CSS.escape?CSS.escape(String(v)):String(v).replace(/[^a-zA-Z0-9_-]/g,'\\$&');}catch(_e){return String(v||'');}}
  function client(){try{if(typeof window.happyadSb==='function')return window.happyadSb();if(window.happyadSupabase)return window.happyadSupabase;if(window.supabaseClient)return window.supabaseClient;}catch(_e){}return null;}
  function isVideo(p){return /video|reel|clip|mp4|webm|mov/.test(clean(p&&(
    p.media_type||p.mediaType||p.kind||p.type||p.post_type
  )).toLowerCase());}
  function publicMediaUrl(value){
    var src=clean(value);if(!src)return '';
    if(/^https?:\/\//i.test(src)||/^data:/i.test(src)||/^blob:/i.test(src))return src;
    src=src.replace(/^\/+/, '').replace(/^happyad-media\//i,'');
    var base=clean(window.HAPPYAD_SUPABASE_URL||'https://txjjyhupbejgjcianrmr.supabase.co').replace(/\/+$/,'');
    return base+'/storage/v1/object/public/happyad-media/'+encodeURI(src);
  }
  function mediaCandidate(raw){
    raw=raw&&typeof raw==='object'?raw:{};
    var video=isVideo(raw);
    var poster=clean(raw.thumbnail_url||raw.thumbnailUrl||raw.poster_url||raw.posterUrl||raw.cover_url||raw.coverUrl||raw.home_thumbnail_url||raw.homeThumbnailUrl||raw.image_url||raw.imageUrl||raw.photo_url||raw.photoUrl);
    var media=clean(raw.home_media_url||raw.homeMediaUrl||raw.media_url||raw.mediaUrl||raw.media_path||raw.mediaPath||raw.image_url||raw.imageUrl||raw.photo_url||raw.photoUrl||raw.video_url_compressed||raw.videoUrlCompressed||raw.video_url_original||raw.videoUrlOriginal||raw.video_url||raw.videoUrl||raw.url||raw.src);
    /* Pour une photo, le vrai média de la publication est prioritaire. Pour une vidéo, on garde le poster/thumbnail. */
    var chosen=video?(poster||media):(media||poster);
    if(video&&!poster&&/\.(mp4|webm|mov|m4v)(?:$|[?#])/i.test(media))chosen='';
    return publicMediaUrl(chosen);
  }
  function isStoryShare(raw){
    raw=raw&&typeof raw==='object'?raw:{};
    var kind=clean(raw.content_type||raw.source_type||raw.mode||raw.category||raw.type).toLowerCase();
    return kind==='story'||!!raw.story_id||raw.__storyTable==='happyad_stories';
  }
  function normalize(raw){
    raw=raw&&typeof raw==='object'?raw:{};
    var story=isStoryShare(raw);
    var id=clean(story?(raw.story_id||raw.id||raw.sourceId):(raw.id||raw.post_id||raw.postId||raw.publicationId||raw.publication_id));
    var type=isVideo(raw)?'video':'photo';
    var media=story?publicMediaUrl(raw.media_url||raw.mediaUrl||raw.preview_url||raw.thumbnail_url||raw.poster_url):mediaCandidate(raw);
    return {
      id:id,post_id:story?'':id,story_id:story?id:'',content_type:story?'story':'post',source_type:story?'story':'post',mode:story?'story':clean(raw.mode),
      media_type:type,kind:type,media_url:media,
      title:clean(raw.title)||(story?'Story HAPPYAD':'Publication HAPPYAD'),
      description:clean(raw.description||raw.desc||raw.caption),
      preview_url:media,
      thumbnail_url:story?publicMediaUrl(raw.thumbnail_url||raw.poster_url||media):media,
      poster_url:story?publicMediaUrl(raw.poster_url||raw.thumbnail_url||media):media,
      author_name:clean(raw.author_name||raw.creatorName||raw.creator_name||raw.display_name||raw.full_name||raw.username),
      owner_id:clean(raw.owner_id||raw.user_id||raw.creatorId||raw.creator_id),
      user_id:clean(raw.user_id||raw.owner_id||raw.creatorId||raw.creator_id),
      created_at:clean(raw.created_at||raw.createdAt),
      expires_at:clean(raw.expires_at||raw.expiresAt),
      updated_at:clean(raw.updated_at||raw.updatedAt||raw.created_at||raw.createdAt),
      share_version:clean(raw.share_version||raw.shareVersion),
      raw:raw
    };
  }
  function localPost(id){
    var lists=[];
    try{if(Array.isArray(window.ALL_POSTS))lists.push(window.ALL_POSTS);}catch(_e){}
    ['HAPPYAD_GLOBAL_POSTS_CACHE_V1','HAPPYAD_HOME_POSTS_CACHE_V1','HAPPYAD_FAST_OPEN_VIDEO_V1','HAPPYAD_VIDEO_CACHE_STABLE_V1'].forEach(function(k){try{var v=JSON.parse(localStorage.getItem(k)||'null');if(Array.isArray(v))lists.push(v);else if(v&&Array.isArray(v.posts))lists.push(v.posts);else if(v&&Array.isArray(v.items))lists.push(v.items);}catch(_e){}});
    for(var i=0;i<lists.length;i++){var p=lists[i].find(function(x){return clean(x&&(x.id||x.post_id))===id;});if(p)return p;}
    return null;
  }
  async function resolve(raw){
    raw=raw&&typeof raw==='object'?raw:{};
    var base=normalize(raw),id=base.id;if(!id||base.content_type==='story')return base;
    var local=localPost(id);
    if(local){
      var localMedia=mediaCandidate(local)||mediaCandidate(raw);
      if(localMedia)return normalize(Object.assign({},raw,local,{id:id,post_id:id,preview_url:localMedia,thumbnail_url:localMedia,poster_url:localMedia}));
    }
    try{
      var c=client();
      if(c&&c.from){
        var r=await c.from('happyad_posts').select('*').eq('id',id).maybeSingle();
        if(r&&!r.error&&r.data){
          var mapped=typeof window.mapHappyPost==='function'?window.mapHappyPost(r.data):r.data;
          try{if(Array.isArray(window.ALL_POSTS)&&!window.ALL_POSTS.some(function(x){return clean(x&&x.id)===id;}))window.ALL_POSTS.unshift(mapped);}catch(_e){}
          var dbMedia=mediaCandidate(mapped)||mediaCandidate(r.data)||mediaCandidate(raw);
          return normalize(Object.assign({},raw,r.data,mapped,{id:id,post_id:id,preview_url:dbMedia,thumbnail_url:dbMedia,poster_url:dbMedia}));
        }
      }
    }catch(_e){}
    return base;
  }
  function shareLink(post){
    post=post||{};
    if(post.content_type==='story')return '';
    var type=post.media_type||'photo';
    /* URL courte : la fonction Netlify récupère la vraie publication par post_id. */
    var version=clean(post.share_version)||Date.now().toString(36);
    try{
      var u=new URL('/s/'+encodeURIComponent(post.id)+'/'+encodeURIComponent(version),location.origin);
      u.searchParams.set('type',type);
      return u.href;
    }catch(_e){
      return location.origin+'/s/'+encodeURIComponent(post.id)+'/'+encodeURIComponent(version)+'?type='+encodeURIComponent(type);
    }
  }
  function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
  function viewportHeight(){
    try{if(window.visualViewport&&Number(window.visualViewport.height)>0)return Math.max(320,Number(window.visualViewport.height));}catch(_e){}
    return Math.max(320,window.innerHeight||document.documentElement.clientHeight||720);
  }
  function preferredHeight(){
    try{var stored=Number(localStorage.getItem(HEIGHT_KEY));if(stored>=46&&stored<=96)return stored;}catch(_e){}
    return 74;
  }
  function heightPxFromPercent(percent){return viewportHeight()*clamp(Number(percent)||74,46,96)/100;}
  function setSheetHeightPx(px,animate,persist){
    var sheet=document.getElementById(SHEET_ID);if(!sheet)return 0;
    var vh=viewportHeight(),min=vh*.46,max=vh*.96;px=clamp(Number(px)||vh*.74,min,max);
    sheet.classList.toggle('is-snapping',animate!==false);
    sheet.style.setProperty('height',Math.round(px)+'px','important');
    var percent=px/vh*100;sheet.dataset.height=String(percent);
    if(persist){try{localStorage.setItem(HEIGHT_KEY,String(Math.round(percent)));}catch(_e){}}
    return px;
  }
  function setSheetHeight(percent,animate,persist){return setSheetHeightPx(heightPxFromPercent(percent),animate,persist!==false);}
  function nearestSnap(percent,velocity){
    var snaps=[48,74,94],i,best=snaps[0];
    if(velocity<-0.38){for(i=0;i<snaps.length;i++)if(snaps[i]>percent+2)return snaps[i];return 94;}
    if(velocity>0.38){for(i=snaps.length-1;i>=0;i--)if(snaps[i]<percent-2)return snaps[i];return 48;}
    for(i=1;i<snaps.length;i++)if(Math.abs(snaps[i]-percent)<Math.abs(best-percent))best=snaps[i];
    return best;
  }
  function installStyle(){
    if(document.getElementById('happyadShareCenterStyle'))return;
    var s=document.createElement('style');s.id='happyadShareCenterStyle';
    s.textContent='#'+CENTER_ID+'{position:fixed!important;inset:0!important;z-index:1000040!important;display:flex!important;align-items:flex-end!important;justify-content:center!important;background:rgba(0,3,8,.62)!important;backdrop-filter:blur(3px)!important;-webkit-backdrop-filter:blur(3px)!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;transition:opacity .18s ease!important}#'+CENTER_ID+'.on{visibility:visible!important;opacity:1!important;pointer-events:auto!important}#'+SHEET_ID+'{position:relative!important;width:min(100%,760px)!important;height:74dvh!important;min-height:46dvh!important;max-height:96dvh!important;overflow:hidden!important;background:linear-gradient(180deg,#242930 0%,#11161d 35%,#030507 100%)!important;border:1px solid rgba(111,145,201,.28)!important;border-bottom:0!important;border-radius:28px 28px 0 0!important;box-shadow:0 -18px 60px rgba(0,0,0,.62)!important;transform:translate3d(0,104%,0)!important;transition:height .24s cubic-bezier(.2,.82,.2,1),transform .22s cubic-bezier(.2,.8,.2,1)!important;will-change:height,transform!important;contain:layout paint!important}#'+CENTER_ID+'.on #'+SHEET_ID+'{transform:translate3d(0,0,0)!important}#'+SHEET_ID+'.is-dragging{transition:none!important;user-select:none!important;-webkit-user-select:none!important}#'+SHEET_ID+'.is-dragging #'+FRAME_ID+'{pointer-events:none!important}#'+DRAG_ID+'{display:flex!important;align-items:center!important;justify-content:center!important;width:100%!important;height:36px!important;padding:0!important;border:0!important;background:#1b2028!important;touch-action:none!important;overscroll-behavior:none!important;cursor:ns-resize!important;-webkit-user-select:none!important;user-select:none!important}#'+DRAG_ID+' span{display:block!important;width:84px!important;height:5px!important;border-radius:99px!important;background:rgba(222,230,244,.44)!important;pointer-events:none!important}#'+HEADER_DRAG_ID+'{position:absolute!important;left:74px!important;right:0!important;top:36px!important;height:61px!important;z-index:12!important;background:transparent!important;border:0!important;padding:0!important;margin:0!important;touch-action:none!important;overscroll-behavior:none!important;cursor:ns-resize!important;-webkit-user-select:none!important;user-select:none!important}#'+FRAME_ID+'{display:block!important;width:100%!important;height:calc(100% - 36px)!important;border:0!important;background:#0b0f15!important}html.happyadShareOpen,body.happyadShareOpen{overflow:hidden!important;overscroll-behavior:none!important;touch-action:none!important}@media(min-width:761px){#'+SHEET_ID+'{border-radius:28px 28px 0 0!important}}';
    document.head.appendChild(s);
  }
  function installDrag(sheet,handle,headerZone){
    if(!sheet||!handle)return shareDragController;
    var active=false,startY=0,startPx=0,lastY=0,lastAt=0,velocity=0,pendingPx=0,raf=0,pointerId=null,captureEl=null;
    function applyFrame(){
      raf=0;
      if(!active)return;
      setSheetHeightPx(pendingPx,false,false);
    }
    function beginAt(y,id,el){
      if(active)return;
      active=true;
      pointerId=id==null?null:id;
      captureEl=el||null;
      startY=Number(y)||0;
      lastY=startY;
      lastAt=performance.now();
      velocity=0;
      startPx=sheet.getBoundingClientRect().height;
      pendingPx=startPx;
      sheet.classList.add('is-dragging');
      sheet.classList.remove('is-snapping');
    }
    function moveAt(y){
      if(!active)return;
      var now=performance.now();
      var nextY=Number(y);
      if(!Number.isFinite(nextY))nextY=lastY;
      var dt=Math.max(8,now-lastAt);
      velocity=(nextY-lastY)/dt;
      lastY=nextY;
      lastAt=now;
      pendingPx=startPx+(startY-nextY);
      if(!raf)raf=requestAnimationFrame(applyFrame);
    }
    function endAt(y){
      if(!active)return;
      if(Number.isFinite(Number(y)))moveAt(Number(y));
      if(raf){
        cancelAnimationFrame(raf);
        raf=0;
      }
      setSheetHeightPx(pendingPx,false,false);
      active=false;
      sheet.classList.remove('is-dragging');
      var percent=sheet.getBoundingClientRect().height/viewportHeight()*100;
      setSheetHeight(nearestSnap(percent,velocity),true,true);
      pointerId=null;
      captureEl=null;
    }
    function bindDragZone(zone){
      if(!zone||zone.__happyadDragReady)return;
      zone.__happyadDragReady=true;
      zone.addEventListener('pointerdown',function(e){
        if(e.button!=null&&e.button!==0)return;
        beginAt(e.clientY,e.pointerId,zone);
        try{zone.setPointerCapture(e.pointerId);}catch(_e){}
        e.preventDefault();
        e.stopPropagation();
      },{passive:false});
      zone.addEventListener('pointermove',function(e){
        if(!active||captureEl!==zone)return;
        moveAt(e.clientY);
        e.preventDefault();
        e.stopPropagation();
      },{passive:false});
      function finish(e){
        if(!active||captureEl!==zone)return;
        endAt(e.clientY);
        try{zone.releasePointerCapture(e.pointerId);}catch(_e){}
        e.preventDefault();
        e.stopPropagation();
      }
      zone.addEventListener('pointerup',finish,{passive:false});
      zone.addEventListener('pointercancel',finish,{passive:false});
    }
    bindDragZone(handle);
    bindDragZone(headerZone);
    handle.addEventListener('dblclick',function(e){
      var p=sheet.getBoundingClientRect().height/viewportHeight()*100;
      setSheetHeight(p<84?94:74,true,true);
      e.preventDefault();
    });
    shareDragController={
      start:function(y){beginAt(y,null,null);},
      move:moveAt,
      end:endAt,
      cancel:function(){if(active)endAt(lastY);},
      active:function(){return active;}
    };
    setSheetHeight(preferredHeight(),false,false);
    return shareDragController;
  }
  function shell(){
    installStyle();var el=document.getElementById(CENTER_ID);if(el)return el;
    el=document.createElement('section');el.id=CENTER_ID;el.setAttribute('aria-hidden','true');
    el.innerHTML='<div id="'+SHEET_ID+'" role="dialog" aria-modal="true" aria-label="Partager"><button id="'+DRAG_ID+'" type="button" aria-label="Modifier la hauteur du partage"><span></span></button><iframe id="'+FRAME_ID+'" title="Partager" src="modules/share-center.html?v=634" allow="clipboard-write;web-share"></iframe><div id="'+HEADER_DRAG_ID+'" role="slider" aria-label="Agrandir ou réduire le partage" aria-valuemin="46" aria-valuemax="96" tabindex="0"></div></div>';
    document.body.appendChild(el);
    var sheet=document.getElementById(SHEET_ID),handle=document.getElementById(DRAG_ID),headerZone=document.getElementById(HEADER_DRAG_ID),fr=document.getElementById(FRAME_ID);
    installDrag(sheet,handle,headerZone);
    el.addEventListener('click',function(e){if(e.target===el)close('backdrop');});
    fr.onload=function(){frameReady=true;sendContext();};return el;
  }
  function sendContext(){if(!current)return;try{var fr=document.getElementById(FRAME_ID);if(fr&&fr.contentWindow)fr.contentWindow.postMessage({type:'HAPPYAD_SHARE_CONTEXT',detail:{post:clone(current),link:shareLink(current),version:VERSION}},'*');}catch(_e){}}
  function pushState(){try{var st=Object.assign({},history.state||{});st[HISTORY_FLAG]=true;st.view='share_center';st.ts=Date.now();history.pushState(st,'',location.href);}catch(_e){}}
  async function open(raw,src){
    var post=await resolve(raw&&raw.detail?raw.detail:raw||{});if(!post.id)return false;
    post.share_version=Date.now().toString(36);
    current=post;sourceWindow=src||sourceWindow||window;captureSourceMedia(sourceWindow);var el=shell();setSheetHeight(preferredHeight(),true,false);el.classList.add('on');el.setAttribute('aria-hidden','false');document.documentElement.classList.add('happyadShareOpen');document.body.classList.add('happyadShareOpen');if(!(raw&&raw.fromPop))pushState();sendContext();return true;
  }
  function close(reason,fromPop){var snapshot=sourceMediaSnapshot;var el=document.getElementById(CENTER_ID);if(el){el.classList.remove('on');el.setAttribute('aria-hidden','true');}document.documentElement.classList.remove('happyadShareOpen');document.body.classList.remove('happyadShareOpen');current=null;restoreSourceMedia(snapshot);sourceWindow=null;sourceMediaSnapshot=null;return true;}
  function recordAction(detail){try{var target=sourceWindow&&sourceWindow.postMessage?sourceWindow:window;target.postMessage({type:'HAPPYAD_SHARE_RECORD_ACTION',detail:detail||{}},'*');}catch(_e){}}
  async function openPhotoHome(postId){
    var post=await resolve({id:postId,media_type:'photo'});try{if(typeof window.render==='function')window.render();}catch(_e){}
    setTimeout(function(){try{var card=document.querySelector('[data-post-id="'+css(postId)+'"]');if(card){card.scrollIntoView({block:'center',inline:'nearest',behavior:'auto'});card.classList.add('happyadSharedPostTargetV555');setTimeout(function(){card.classList.remove('happyadSharedPostTargetV555');},2600);}}catch(_e){}},80);
    try{var st=Object.assign({},history.state||{});st[SHARED_POST_FLAG]=true;st.view='home_shared_post';st.postId=postId;st.ts=Date.now();history.pushState(st,'',location.href);}catch(_e){}
    return !!post;
  }
  async function openSharedPost(detail){
    detail=detail&&detail.detail?detail.detail:detail||{};var id=clean(detail.post_id||detail.postId||detail.id);if(!id)return false;var type=/video|reel|clip/.test(clean(detail.media_type||detail.type).toLowerCase())?'video':'photo';
    try{var s=window.HappyMessageReturnCenter&&window.HappyMessageReturnCenter.current&&window.HappyMessageReturnCenter.current();returnMessageContext=s&&s.context?clone(s.context):null;}catch(_e){returnMessageContext=null;}
    try{if(window.HappyMessageReturnCenter)window.HappyMessageReturnCenter.close('open-shared-post',true);}catch(_e){}
    if(type==='video'){
      var url='modules/video.html?post='+encodeURIComponent(id)+'&from=message_share';
      try{if(window.happyadOpenInternalUrlV492)return window.happyadOpenInternalUrlV492(url,{source:'shared-message-post',postId:id});}catch(_e){}
      location.href=url;return true;
    }
    return openPhotoHome(id);
  }
  function maybeDeepLink(){try{var q=new URLSearchParams(location.search);var id=clean(q.get('happyad_post'));if(!id)return;var type=clean(q.get('happyad_type'))||'photo';setTimeout(function(){openSharedPost({post_id:id,media_type:type,source:'external-link'});},1100);}catch(_e){}}
  window.addEventListener('message',function(event){var d=event&&event.data;if(!d||typeof d!=='object')return;if(d.type==='HAPPYAD_SHARE_OPEN')open(d.detail||{},event.source);else if(d.type==='HAPPYAD_SHARE_CENTER_READY'){frameReady=true;sendContext();}else if(d.type==='HAPPYAD_SHARE_CLOSE')close(clean(d.detail&&d.detail.reason)||'close');else if(d.type==='HAPPYAD_SHARE_COMMITTED')recordAction(d.detail||{});else if(d.type==='HAPPYAD_OPEN_SHARED_POST')openSharedPost(d.detail||{});else if(d.type==='HAPPYAD_SHARE_DRAG_START'&&shareDragController)shareDragController.start(Number(d.detail&&d.detail.screenY));else if(d.type==='HAPPYAD_SHARE_DRAG_MOVE'&&shareDragController)shareDragController.move(Number(d.detail&&d.detail.screenY));else if(d.type==='HAPPYAD_SHARE_DRAG_END'&&shareDragController)shareDragController.end(Number(d.detail&&d.detail.screenY));},true);
  /* V584: ancien popstate partage supprimé. */
  window.HappyadShareMaster={version:VERSION,open:open,close:close,openSharedPost:openSharedPost,current:function(){return current;},isOpen:shareIsOpen};
  installStyle();if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',maybeDeepLink,{once:true});else maybeDeepLink();
})();
