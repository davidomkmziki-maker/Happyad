(function(){
  'use strict';
  if(window.__HAPPYAD_SHARE_MASTER_V711__)return;
  window.__HAPPYAD_SHARE_MASTER_V711__=true;
  window.__HAPPYAD_SHARE_MASTER_V710__=true;
  window.__HAPPYAD_SHARE_MASTER_V709__=true;
  window.__HAPPYAD_SHARE_MASTER_V708__=true;
  window.__HAPPYAD_SHARE_MASTER_V707__=true;
  window.__HAPPYAD_SHARE_MASTER_V705__=true;
  window.__HAPPYAD_SHARE_MASTER_V702__=true;
  window.__HAPPYAD_SHARE_MASTER_V561__=true;
  var VERSION='V711_SHARED_VIDEO_RETURN_SCROLL_IDENTICAL_TO_PHOTO';
  var CENTER_ID='happyadShareCenter';
  var FRAME_ID='happyadShareCenterFrame';
  var FRAME_URL='modules/share-center.html?v=705-share-over-story';
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
  var sharedPhotoMessageContext=null;
  var sharedPhotoReturnObserver=null;
  var sharedVideoMessageContext=null;
  var sharedVideoReturnFallbackTimer=0;
  var sharedVideoHistoryArmed=false;
  var sharedVideoRestoring=false;
  var sharedVideoPopInstalled=false;
  var shareDragController=null;
  var sourceMediaSnapshot=null;
  var frameHealthSeq=0;
  var frameHealthTimer=0;
  var frameResumeTimer=0;
  var recoveryInFlight=false;
  var recoveryAttempts=0;
  var lastFramePongAt=0;
  var hiddenAt=0;
  var openedFromStory=false;
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
    s.textContent='#'+CENTER_ID+'{position:fixed!important;inset:0!important;z-index:2147483647!important;display:flex!important;align-items:flex-end!important;justify-content:center!important;background:rgba(0,3,8,.62)!important;backdrop-filter:blur(3px)!important;-webkit-backdrop-filter:blur(3px)!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;transition:opacity .18s ease!important}#'+CENTER_ID+'.on{visibility:visible!important;opacity:1!important;pointer-events:auto!important}#'+SHEET_ID+'{position:relative!important;width:min(100%,760px)!important;height:74dvh!important;min-height:46dvh!important;max-height:96dvh!important;overflow:hidden!important;background:linear-gradient(180deg,#242930 0%,#11161d 35%,#030507 100%)!important;border:1px solid rgba(111,145,201,.28)!important;border-bottom:0!important;border-radius:28px 28px 0 0!important;box-shadow:0 -18px 60px rgba(0,0,0,.62)!important;transform:translate3d(0,104%,0)!important;transition:height .24s cubic-bezier(.2,.82,.2,1),transform .22s cubic-bezier(.2,.8,.2,1)!important;will-change:height,transform!important;contain:layout paint!important}#'+CENTER_ID+'.on #'+SHEET_ID+'{transform:translate3d(0,0,0)!important}#'+SHEET_ID+'.is-dragging{transition:none!important;user-select:none!important;-webkit-user-select:none!important}#'+SHEET_ID+'.is-dragging #'+FRAME_ID+'{pointer-events:none!important}#'+SHEET_ID+'.is-recovering #'+FRAME_ID+'{opacity:.12!important}#'+FRAME_ID+'{transition:opacity .16s ease!important}#'+DRAG_ID+'{display:flex!important;align-items:center!important;justify-content:center!important;width:100%!important;height:36px!important;padding:0!important;border:0!important;background:#1b2028!important;touch-action:none!important;overscroll-behavior:none!important;cursor:ns-resize!important;-webkit-user-select:none!important;user-select:none!important}#'+DRAG_ID+' span{display:block!important;width:84px!important;height:5px!important;border-radius:99px!important;background:rgba(222,230,244,.44)!important;pointer-events:none!important}#'+HEADER_DRAG_ID+'{position:absolute!important;left:74px!important;right:0!important;top:36px!important;height:61px!important;z-index:12!important;background:transparent!important;border:0!important;padding:0!important;margin:0!important;touch-action:none!important;overscroll-behavior:none!important;cursor:ns-resize!important;-webkit-user-select:none!important;user-select:none!important}#'+FRAME_ID+'{display:block!important;width:100%!important;height:calc(100% - 36px)!important;border:0!important;background:#0b0f15!important}html.happyadShareOpen,body.happyadShareOpen{overflow:hidden!important;overscroll-behavior:none!important;touch-action:none!important}html.happyadShareFromStoryV705,body.happyadShareFromStoryV705{overflow:hidden!important;overscroll-behavior:none!important;touch-action:none!important}#'+CENTER_ID+'.happyadShareFromStoryV705{z-index:2147483647!important}@media(min-width:761px){#'+SHEET_ID+'{border-radius:28px 28px 0 0!important}}';
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
  function frameNode(){return document.getElementById(FRAME_ID);}
  function postFrame(type,detail){
    try{var fr=frameNode();if(fr&&fr.contentWindow){fr.contentWindow.postMessage({type:type,detail:detail||{}},'*');return true;}}catch(_e){}
    return false;
  }
  function clearFrameHealthTimer(){if(frameHealthTimer){clearTimeout(frameHealthTimer);frameHealthTimer=0;}}
  function markFrameAlive(source){
    frameReady=true;recoveryInFlight=false;recoveryAttempts=0;lastFramePongAt=Date.now();clearFrameHealthTimer();
    try{var sheet=document.getElementById(SHEET_ID);if(sheet)sheet.classList.remove('is-recovering');}catch(_e){}
    postFrame('HAPPYAD_MODULE_RESUME',{source:source||'share-frame-alive',at:Date.now()});
    postFrame('HAPPYAD_SHARE_RESUME',{source:source||'share-frame-alive',at:Date.now()});
  }
  function bindFrame(fr){
    if(!fr)return;
    fr.onload=function(){
      frameReady=false;
      recoveryInFlight=false;
      setTimeout(function(){if(shareIsOpen())probeFrame('load');},140);
    };
  }
  function rebuildFrame(reason){
    if(!shareIsOpen()||!current||recoveryInFlight||recoveryAttempts>=2)return false;
    var old=frameNode(),sheet=document.getElementById(SHEET_ID);if(!old||!old.parentNode)return false;
    recoveryInFlight=true;recoveryAttempts++;frameReady=false;clearFrameHealthTimer();
    try{if(sheet)sheet.classList.add('is-recovering');}catch(_e){}
    var fr=document.createElement('iframe');fr.id=FRAME_ID;fr.title='Partager';fr.setAttribute('allow','clipboard-write;web-share');
    fr.src=FRAME_URL+'&resume='+Date.now()+'&reason='+encodeURIComponent(clean(reason)||'resume');
    bindFrame(fr);old.parentNode.replaceChild(fr,old);
    return true;
  }
  function probeFrame(reason){
    if(!shareIsOpen()||!current||document.hidden)return false;
    clearFrameHealthTimer();
    var nonce=String(++frameHealthSeq)+'-'+Date.now();
    postFrame('HAPPYAD_MODULE_RESUME',{source:'share-parent-'+clean(reason),at:Date.now()});
    postFrame('HAPPYAD_SHARE_PING',{nonce:nonce,source:clean(reason),at:Date.now()});
    var wait=/^(open|initial)/.test(clean(reason))?1600:900;
    frameHealthTimer=setTimeout(function(){
      frameHealthTimer=0;
      if(!shareIsOpen()||!current)return;
      rebuildFrame('no-pong-'+clean(reason));
    },wait);
    return true;
  }
  function scheduleFrameResume(reason){
    if(!shareIsOpen()||!current)return;
    if(frameResumeTimer)clearTimeout(frameResumeTimer);
    frameResumeTimer=setTimeout(function(){frameResumeTimer=0;probeFrame(reason||'resume');},160);
  }
  function shell(){
    installStyle();var el=document.getElementById(CENTER_ID);if(el)return el;
    el=document.createElement('section');el.id=CENTER_ID;el.setAttribute('aria-hidden','true');
    el.innerHTML='<div id="'+SHEET_ID+'" role="dialog" aria-modal="true" aria-label="Partager"><button id="'+DRAG_ID+'" type="button" aria-label="Modifier la hauteur du partage"><span></span></button><iframe id="'+FRAME_ID+'" title="Partager" src="'+FRAME_URL+'" allow="clipboard-write;web-share"></iframe><div id="'+HEADER_DRAG_ID+'" role="slider" aria-label="Agrandir ou réduire le partage" aria-valuemin="46" aria-valuemax="96" tabindex="0"></div></div>';
    document.body.appendChild(el);
    var sheet=document.getElementById(SHEET_ID),handle=document.getElementById(DRAG_ID),headerZone=document.getElementById(HEADER_DRAG_ID),fr=frameNode();
    installDrag(sheet,handle,headerZone);
    el.addEventListener('click',function(e){if(e.target===el)close('backdrop');});
    bindFrame(fr);return el;
  }
  function sendContext(){if(!current)return;postFrame('HAPPYAD_SHARE_CONTEXT',{post:clone(current),link:shareLink(current),version:VERSION});}
  function pushState(){try{var st=Object.assign({},history.state||{});st[HISTORY_FLAG]=true;st.view='share_center';st.ts=Date.now();history.pushState(st,'',location.href);}catch(_e){}}
  async function open(raw,src){
    var post=await resolve(raw&&raw.detail?raw.detail:raw||{});if(!post.id)return false;
    post.share_version=Date.now().toString(36);
    current=post;openedFromStory=post.content_type==='story'&&clean(post.raw&&post.raw.share_origin)==='story_viewer_v705';sourceWindow=src||sourceWindow||window;if(openedFromStory)sourceMediaSnapshot=null;else captureSourceMedia(sourceWindow);recoveryAttempts=0;recoveryInFlight=false;var el=shell();setSheetHeight(preferredHeight(),true,false);el.classList.add('on');el.classList.toggle('happyadShareFromStoryV705',openedFromStory);el.setAttribute('aria-hidden','false');document.documentElement.classList.add('happyadShareOpen');document.body.classList.add('happyadShareOpen');if(openedFromStory){document.documentElement.classList.add('happyadShareFromStoryV705');document.body.classList.add('happyadShareFromStoryV705')}if(!(raw&&raw.fromPop))pushState();if(frameReady)sendContext();else scheduleFrameResume('open');return true;
  }
  function close(reason,fromPop){var snapshot=sourceMediaSnapshot,closing=clone(current),fromStory=openedFromStory;clearFrameHealthTimer();if(frameResumeTimer){clearTimeout(frameResumeTimer);frameResumeTimer=0;}recoveryInFlight=false;recoveryAttempts=0;var el=document.getElementById(CENTER_ID);if(el){el.classList.remove('on','happyadShareFromStoryV705');el.setAttribute('aria-hidden','true');}document.documentElement.classList.remove('happyadShareOpen','happyadShareFromStoryV705');document.body.classList.remove('happyadShareOpen','happyadShareFromStoryV705');current=null;openedFromStory=false;restoreSourceMedia(snapshot);sourceWindow=null;sourceMediaSnapshot=null;try{document.dispatchEvent(new CustomEvent('happyad:share-closed-v705',{detail:{reason:clean(reason)||'close',fromStory:!!fromStory,context:closing}}))}catch(_e){}return true;}
  function recordAction(detail){try{var target=sourceWindow&&sourceWindow.postMessage?sourceWindow:window;target.postMessage({type:'HAPPYAD_SHARE_RECORD_ACTION',detail:detail||{}},'*');}catch(_e){}}
  function captureSharedPhotoMessageContextV708(sourceWin){
    var fr=null;
    try{
      if(sourceWin){
        var frames=document.querySelectorAll('.happyadAppFrame[data-happyad-page]');
        for(var i=0;i<frames.length;i++){try{if(frames[i].contentWindow===sourceWin){fr=frames[i];break;}}catch(_e){}}
      }
    }catch(_e){}
    try{if(!fr&&window.HappyNavigation&&typeof window.HappyNavigation.activeFrame==='function')fr=window.HappyNavigation.activeFrame();}catch(_e){}
    try{if(!fr)fr=document.querySelector('#happyadAppFrame_message.on[data-happyad-page="message"]');}catch(_e){}
    if(!fr||clean(fr.getAttribute&&fr.getAttribute('data-happyad-page')).toLowerCase()!=='message')return null;
    var ctx={frame:fr,url:clean(fr.getAttribute('data-happyad-src')||fr.getAttribute('src'))||'modules/message-center.html?mode=inbox&v=761-message-badge-strict',scrollX:0,scrollY:0,at:Date.now()};
    try{ctx.scrollX=Number(fr.contentWindow&&fr.contentWindow.scrollX)||0;ctx.scrollY=Number(fr.contentWindow&&fr.contentWindow.scrollY)||0;}catch(_e){}
    try{if(fr.contentWindow)fr.contentWindow.postMessage({type:'HAPPYAD_MESSAGE_CONTEXT_HOLD_V708',detail:{source:'shared-photo',at:ctx.at}},'*');}catch(_e){}
    return ctx;
  }
  function restoreSharedPhotoMessageContextV708(reason){
    var ctx=sharedPhotoMessageContext;
    if(!ctx)return false;
    sharedPhotoMessageContext=null;
    try{if(sharedPhotoReturnObserver)sharedPhotoReturnObserver.disconnect();}catch(_e){}
    sharedPhotoReturnObserver=null;
    document.body.classList.remove('happyadSharedPhotoFromMessageV708');
    function run(){
      try{
        var fr=ctx.frame;
        if(!fr||!fr.isConnected)return false;
        var active=null;
        try{active=window.HappyNavigation&&typeof window.HappyNavigation.activeFrame==='function'?window.HappyNavigation.activeFrame():null;}catch(_e){}
        if(active!==fr&&window.HappyNavigation&&typeof window.HappyNavigation.activateMainTab==='function'){
          window.HappyNavigation.activateMainTab('message',{url:ctx.url,replace:true,force:true,source:'shared-photo-return-v708'});
          return true;
        }
        var root=document.getElementById('happyadAppShell');
        if(root){root.classList.add('on');root.classList.remove('happyadSkeletonOpen');root.setAttribute('aria-hidden','false');root.removeAttribute('inert');}
        fr.classList.add('on');fr.setAttribute('aria-hidden','false');fr.removeAttribute('inert');fr.style.removeProperty('opacity');fr.style.removeProperty('visibility');fr.style.removeProperty('pointer-events');
        try{if(fr.contentWindow&&Math.abs((Number(fr.contentWindow.scrollY)||0)-ctx.scrollY)>1)fr.contentWindow.scrollTo(ctx.scrollX,ctx.scrollY);}catch(_e){}
        try{if(fr.contentWindow)fr.contentWindow.postMessage({type:'HAPPYAD_MESSAGE_LAYOUT_REPAIR',detail:{reason:clean(reason)||'shared-photo-return-v708',restoreConversation:true,at:Date.now()}},'*');}catch(_e){}
        try{if(window.HappyOverlayMasterV615)window.HappyOverlayMasterV615.reconcile('shared-photo-return-v708');}catch(_e){}
        return true;
      }catch(_e){return false;}
    }
    run();setTimeout(run,70);setTimeout(run,220);
    return true;
  }
  function watchSharedPhotoReturnV708(){
    try{if(sharedPhotoReturnObserver)sharedPhotoReturnObserver.disconnect();}catch(_e){}
    sharedPhotoReturnObserver=null;
    var box=document.getElementById('happyadHomePhotoFullscreen');
    if(!box){restoreSharedPhotoMessageContextV708('photo-fullscreen-missing-v708');return false;}
    function check(){
      if(!box.classList.contains('on'))restoreSharedPhotoMessageContextV708('photo-fullscreen-closed-v708');
    }
    sharedPhotoReturnObserver=new MutationObserver(check);
    sharedPhotoReturnObserver.observe(box,{attributes:true,attributeFilter:['class']});
    setTimeout(check,900);
    return true;
  }

  function captureSharedVideoMessageContextV709(sourceWin){
    var base=captureSharedPhotoMessageContextV708(sourceWin);
    if(!base)return null;
    base.source='shared-video-v709';
    base.wasChat=false;
    base.conversationId='';
    base.messageContext=null;
    base.chatScrollTop=0;
    base.messageLayerWasOpen=false;
    try{
      var internalReturn=window.HappyInternalReturnV694||window.HappyInternalReturnV591;
      base.messageLayerWasOpen=!!(internalReturn&&typeof internalReturn.top==='function'&&clean(internalReturn.top())==='message-chat');
    }catch(_layer){}
    try{
      var w=base.frame&&base.frame.contentWindow;
      var master=w&&w.HappyadMessageMaster;
      if(master){
        if(typeof master.getConversationId==='function')base.conversationId=clean(master.getConversationId());
        if(typeof master.getContext==='function')base.messageContext=clone(master.getContext());
      }
      base.wasChat=!!base.conversationId;
    }catch(_e){}
    try{
      var d=base.frame&&base.frame.contentDocument;
      var chat=d&&d.getElementById('chatBody');
      if(chat)base.chatScrollTop=Number(chat.scrollTop)||0;
    }catch(_e){}
    try{if(base.frame&&base.frame.contentWindow)base.frame.contentWindow.postMessage({type:'HAPPYAD_MESSAGE_CONTEXT_HOLD_V709',detail:{source:'shared-video',conversation_id:base.conversationId,at:base.at}},'*');}catch(_e){}
    return base;
  }
  function sharedVideoFrameV709(){
    try{return document.getElementById('happyadAppFrame_video')||document.querySelector('.happyadAppFrame[data-happyad-page="video"]');}catch(_e){return null;}
  }
  function holdSharedVideoMessageScrollV711(ctx,duration){
    try{
      var fr=ctx&&ctx.frame,w=fr&&fr.contentWindow,d=fr&&fr.contentDocument;
      if(!fr||!w)return false;
      var top=Number(ctx&&ctx.chatScrollTop);if(!Number.isFinite(top))top=0;
      var hold=Math.max(420,Number(duration)||900);
      try{
        var master=w.HappyadMessageMaster;
        if(master&&typeof master.holdReturnScroll==='function')master.holdReturnScroll(top,hold);
      }catch(_master){}
      try{w.postMessage({type:'HAPPYAD_MESSAGE_SCROLL_HOLD_V711',detail:{scrollTop:top,duration:hold,conversation_id:clean(ctx&&ctx.conversationId),source:'shared-video-return-v711',at:Date.now()}},'*');}catch(_post){}
      try{var chat=d&&d.getElementById('chatBody');if(chat)chat.scrollTop=top;}catch(_chat){}
      return true;
    }catch(_e){return false;}
  }
  function forceSharedVideoDockVisibleV709(reason){
    try{
      if(window.HappyInternalReturnV694&&typeof window.HappyInternalReturnV694.close==='function')window.HappyInternalReturnV694.close('message-chat');
      else if(window.HappyInternalReturnV591&&typeof window.HappyInternalReturnV591.close==='function')window.HappyInternalReturnV591.close('message-chat');
    }catch(_e){}
    try{
      document.body.classList.remove('happyadInternalScreenOpenV591','happyadDockAutoHiddenV618','happyadPublishFullscreenV586');
      document.body.classList.add('happyadMainDockVisible','happyadSharedVideoFromMessageV709');
      document.body.setAttribute('data-happyad-main-page','video');
      var dock=document.getElementById('happyadMainDockV585')||document.querySelector('.bottom.happyadMainDockV585');
      if(dock){dock.removeAttribute('aria-hidden');dock.style.removeProperty('display');dock.style.removeProperty('visibility');dock.style.removeProperty('pointer-events');}
      try{if(window.HappyDockAutoHideV653&&typeof window.HappyDockAutoHideV653.show==='function')window.HappyDockAutoHideV653.show(clean(reason)||'shared-video-message-v709');}catch(_show){}
      try{if(window.HappyOverlayMasterV615)window.HappyOverlayMasterV615.reconcile('shared-video-dock-v709');}catch(_ov){}
    }catch(_e){}
  }
  function cleanupSharedVideoBackButtonV709(){
    var fr=sharedVideoFrameV709();
    try{
      var d=fr&&fr.contentDocument;if(!d)return false;
      var btn=d.getElementById('happyadSharedVideoMessageBackV709');
      if(btn&&btn.parentNode){
        var spacer=d.createElement('span');spacer.className='topBarSpacer';spacer.setAttribute('aria-hidden','true');
        btn.parentNode.replaceChild(spacer,btn);
      }
      var style=d.getElementById('happyadSharedVideoMessageBackStyleV709');if(style&&style.parentNode)style.parentNode.removeChild(style);
      d.documentElement.classList.remove('happyadSharedVideoFromMessageV709');
      return true;
    }catch(_e){return false;}
  }
  function requestSharedVideoReturnV709(reason){
    if(!sharedVideoMessageContext||sharedVideoRestoring)return false;
    clearTimeout(sharedVideoReturnFallbackTimer);sharedVideoReturnFallbackTimer=0;
    /* V710 : l'historique revient vers l'état Messages, mais la conversation est
       restaurée immédiatement. On ne laisse plus le rendu attendre le popstate. */
    if(sharedVideoHistoryArmed){
      try{History.prototype.go.call(history,-1);}catch(_e){}
    }
    return restoreSharedVideoMessageContextV709(reason||'video-back-direct-v711');
  }
  function installSharedVideoBackButtonV709(){
    var fr=sharedVideoFrameV709();
    try{
      var d=fr&&fr.contentDocument;if(!d||!d.documentElement)return false;
      d.documentElement.classList.add('happyadSharedVideoFromMessageV709');
      if(!d.getElementById('happyadSharedVideoMessageBackStyleV709')){
        var style=d.createElement('style');style.id='happyadSharedVideoMessageBackStyleV709';
        style.textContent='.happyadSharedVideoMessageBackV709{pointer-events:auto!important;width:46px!important;height:46px!important;border-radius:50%!important;display:grid!important;place-items:center!important;padding:0!important;color:#fff!important;background:rgba(15,17,22,.56)!important;border:1px solid rgba(255,255,255,.34)!important;backdrop-filter:blur(10px)!important;-webkit-backdrop-filter:blur(10px)!important;touch-action:manipulation!important}.happyadSharedVideoMessageBackV709 svg{width:27px!important;height:27px!important;display:block!important;fill:none!important;stroke:currentColor!important;stroke-width:2.6!important;stroke-linecap:round!important;stroke-linejoin:round!important}.happyadSharedVideoMessageBackV709:active{background:rgba(255,255,255,.13)!important;border-color:#fff!important;transform:scale(.96)!important}';
        (d.head||d.documentElement).appendChild(style);
      }
      var top=d.getElementById('topBar')||d.querySelector('.topBar');if(!top)return false;
      var btn=d.getElementById('happyadSharedVideoMessageBackV709');
      if(!btn){
        btn=d.createElement('button');btn.id='happyadSharedVideoMessageBackV709';btn.className='round happyadSharedVideoMessageBackV709';btn.type='button';btn.setAttribute('data-happyad-internal-return-v591','1');btn.setAttribute('aria-label','Revenir dans la conversation');btn.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"></path></svg>';
        var spacer=top.querySelector('.topBarSpacer');if(spacer)top.replaceChild(btn,spacer);else top.insertBefore(btn,top.firstChild||null);
      }
      if(!btn.__happyadSharedVideoReturnBoundV709){
        btn.__happyadSharedVideoReturnBoundV709=true;
        btn.addEventListener('click',function(ev){try{ev.preventDefault();ev.stopPropagation();if(ev.stopImmediatePropagation)ev.stopImmediatePropagation();}catch(_e){}try{requestSharedVideoReturnV709('video-button-v709');}catch(_e){}},true);
      }
      return true;
    }catch(_e){return false;}
  }
  function armSharedVideoPhoneBackV709(){
    sharedVideoHistoryArmed=false;
    try{
      var base=Object.assign({},history.state||{});base.__happyadSharedVideoMessageBaseV709=true;base.__happyadSharedVideoMessageAtV709=Date.now();
      history.replaceState(base,'',location.href);
      var active=Object.assign({},base,{__happyadSharedVideoActiveV709:true});
      History.prototype.pushState.call(history,active,'',location.href);
      sharedVideoHistoryArmed=true;
    }catch(_e){sharedVideoHistoryArmed=false;}
    if(!sharedVideoPopInstalled){
      sharedVideoPopInstalled=true;
      try{EventTarget.prototype.addEventListener.call(window,'popstate',function(){if(sharedVideoMessageContext&&!sharedVideoRestoring)restoreSharedVideoMessageContextV709('phone-back-v709');},true);}catch(_e){}
    }
    return sharedVideoHistoryArmed;
  }
  function restoreSharedVideoMessageContextV709(reason){
    var ctx=sharedVideoMessageContext;if(!ctx||sharedVideoRestoring)return false;
    sharedVideoRestoring=true;sharedVideoMessageContext=null;sharedVideoHistoryArmed=false;
    clearTimeout(sharedVideoReturnFallbackTimer);sharedVideoReturnFallbackTimer=0;
    cleanupSharedVideoBackButtonV709();
    document.body.classList.remove('happyadSharedVideoFromMessageV709');
    holdSharedVideoMessageScrollV711(ctx,620);

    /* V711 : remettre d'abord la couche message-chat exactement comme elle était.
       Ainsi le dock ne clignote pas entre Vidéos et la conversation. */
    if(ctx.messageLayerWasOpen){
      try{
        var internalReturn=window.HappyInternalReturnV694||window.HappyInternalReturnV591;
        if(internalReturn&&typeof internalReturn.open==='function'&&(!internalReturn.top||clean(internalReturn.top())!=='message-chat'))internalReturn.open('message-chat');
      }catch(_layer){}
    }

    function prepareFrameInstant(fr){
      try{
        var d=fr&&fr.contentDocument;if(!d||!d.documentElement)return;
        d.documentElement.classList.add('happyadSharedMessageReturnInstantV710');
        var list=d.getElementById('listView'),chatView=d.getElementById('chatView');
        if(ctx.wasChat&&chatView){
          if(list){list.classList.add('hidden');list.setAttribute('aria-hidden','true');}
          chatView.classList.remove('hidden');chatView.setAttribute('aria-hidden','false');
          var chat=d.getElementById('chatBody');if(chat&&Number.isFinite(ctx.chatScrollTop))chat.scrollTop=ctx.chatScrollTop;
        }
      }catch(_e){}
    }
    function run(){
      try{
        var fr=ctx.frame;if(!fr||!fr.isConnected)return false;
        prepareFrameInstant(fr);
        try{if(fr.contentWindow)fr.contentWindow.scrollTo(ctx.scrollX,ctx.scrollY);}catch(_preWindow){}
        try{var preDoc=fr.contentDocument,preChat=preDoc&&preDoc.getElementById('chatBody');if(preChat&&Number.isFinite(ctx.chatScrollTop))preChat.scrollTop=ctx.chatScrollTop;}catch(_preChat){}
        var active=null;try{active=window.HappyNavigation&&typeof window.HappyNavigation.activeFrame==='function'?window.HappyNavigation.activeFrame():null;}catch(_active){}
        if(active!==fr&&window.HappyNavigation&&typeof window.HappyNavigation.activateMainTab==='function')window.HappyNavigation.activateMainTab('message',{url:ctx.url,replace:true,force:true,source:'shared-video-return-v711'});
        var root=document.getElementById('happyadAppShell');if(root){root.classList.add('on');root.classList.remove('happyadSkeletonOpen');root.setAttribute('aria-hidden','false');root.removeAttribute('inert');}
        fr.classList.add('on');fr.setAttribute('aria-hidden','false');fr.removeAttribute('inert');fr.style.removeProperty('opacity');fr.style.removeProperty('visibility');fr.style.removeProperty('pointer-events');
        try{if(fr.contentWindow)fr.contentWindow.scrollTo(ctx.scrollX,ctx.scrollY);}catch(_e){}
        try{var d=fr.contentDocument,chat=d&&d.getElementById('chatBody');if(chat&&Number.isFinite(ctx.chatScrollTop))chat.scrollTop=ctx.chatScrollTop;}catch(_e){}
        try{if(fr.contentWindow)fr.contentWindow.postMessage({type:'HAPPYAD_MESSAGE_LAYOUT_REPAIR',detail:{reason:clean(reason)||'shared-video-return-v711',restoreConversation:true,conversation_id:ctx.conversationId||'',at:Date.now()}},'*');}catch(_e){}
        try{if(window.HappyOverlayMasterV615)window.HappyOverlayMasterV615.reconcile('shared-video-return-v711');}catch(_e){}
        return true;
      }catch(_e){return false;}
    }
    run();[45,120,260,480].forEach(function(delay){setTimeout(run,delay);});setTimeout(function(){
      run();
      try{var d=ctx.frame&&ctx.frame.contentDocument;if(d&&d.documentElement)d.documentElement.classList.remove('happyadSharedMessageReturnInstantV710');}catch(_e){}
      sharedVideoRestoring=false;
    },620);
    return true;
  }
  function prepareSharedVideoFromMessageV709(postId,sourceWin){
    sharedVideoMessageContext=captureSharedVideoMessageContextV709(sourceWin);
    if(!sharedVideoMessageContext)return false;
    holdSharedVideoMessageScrollV711(sharedVideoMessageContext,480);
    armSharedVideoPhoneBackV709();
    forceSharedVideoDockVisibleV709('before-video-open-v709');
    [0,70,180,420,900,1500].forEach(function(delay){setTimeout(function(){if(!sharedVideoMessageContext)return;forceSharedVideoDockVisibleV709('video-open-'+delay+'-v709');installSharedVideoBackButtonV709();},delay);});
    return true;
  }

  function seedSharedPhotoForHome(postId,post){
    post=post&&typeof post==='object'?post:{};
    var raw=post.raw&&typeof post.raw==='object'?post.raw:{};
    var media=publicMediaUrl(post.media_url||post.mediaUrl||post.preview_url||post.thumbnail_url||post.poster_url||raw.media_url||raw.mediaUrl||raw.home_media_url||raw.image_url||raw.photo_url||raw.media_path);
    var source=Object.assign({},raw,post,{
      id:postId,post_id:postId,media_type:'photo',mediaType:'photo',kind:'photo',type:'photo',
      media_url:media,mediaUrl:media,home_media_url:media,image_url:media,photo_url:media,
      title:clean(post.title||raw.title)||'Publication HAPPYAD',
      description:clean(post.description||raw.description||raw.desc||raw.caption),
      desc:clean(post.description||raw.description||raw.desc||raw.caption),
      user_id:clean(post.user_id||post.owner_id||raw.user_id||raw.owner_id||raw.creator_id),
      creatorId:clean(post.user_id||post.owner_id||raw.user_id||raw.owner_id||raw.creator_id),
      creatorName:clean(post.author_name||raw.display_name||raw.creator_name||raw.full_name||raw.username)||'Utilisateur HAPPYAD',
      created_at:clean(post.created_at||raw.created_at),createdAt:post.created_at||raw.created_at||Date.now()
    });
    var mapped=source;
    try{if(typeof window.mapHappyPost==='function')mapped=Object.assign({},window.mapHappyPost(source),source,{id:postId,mediaUrl:media,media_url:media,kind:'photo',media_type:'photo'});}catch(_e){}
    try{
      if(!Array.isArray(window.ALL_POSTS))window.ALL_POSTS=[];
      var at=window.ALL_POSTS.findIndex(function(x){return clean(x&&(x.id||x.post_id))===postId;});
      if(at>=0)window.ALL_POSTS[at]=Object.assign({},window.ALL_POSTS[at]||{},mapped);
      else window.ALL_POSTS.unshift(mapped);
    }catch(_e){}
    return mapped;
  }
  async function openPhotoHome(postId,detail,sourceWin){
    sharedPhotoMessageContext=captureSharedPhotoMessageContextV708(sourceWin);
    var fromMessage=!!sharedPhotoMessageContext;
    var post=await resolve(Object.assign({},detail||{},{id:postId,post_id:postId,media_type:'photo'}));
    var seeded=seedSharedPhotoForHome(postId,post);
    if(fromMessage){
      try{window.__happyadPhotoReturnSourceV478={id:String(postId),scrollY:window.scrollY||document.documentElement.scrollTop||0,at:Date.now(),el:null,source:'message-v708'};}catch(_e){}
      document.body.classList.add('happyadSharedPhotoFromMessageV708');
    }else{
      /* Les liens externes et les autres origines conservent le comportement V707. */
      try{if(window.HappyNavigation&&typeof window.HappyNavigation.close==='function')window.HappyNavigation.close('open-shared-photo-v708-non-message',true);}catch(_e){}
      try{if(typeof window.render==='function')window.render();}catch(_e){}
      var card=null;
      try{card=document.querySelector('[data-post-id="'+css(postId)+'"]');if(card){window.__happyadPhotoReturnSourceV478={id:String(postId),scrollY:window.scrollY||document.documentElement.scrollTop||0,at:Date.now(),el:card};}}catch(_e){}
      try{var st=Object.assign({},history.state||{});st[SHARED_POST_FLAG]=true;st.view='home_shared_post';st.postId=postId;st.ts=Date.now();history.pushState(st,'',location.href);}catch(_e){}
    }
    setTimeout(function(){
      var opened=false;
      try{
        /* V708 : depuis Messages, la frame reste montée et active sous le fullscreen. */
        if(typeof window.openLongPhoto==='function'){window.openLongPhoto(postId);opened=true;}
        else if(typeof window.happyadOpenHomePhotoFullscreen==='function'){window.happyadOpenHomePhotoFullscreen(postId);opened=true;}
        else if(!fromMessage&&window.HappyNavigation&&typeof window.HappyNavigation.open==='function'){window.HappyNavigation.open('modules/photo.html?post='+encodeURIComponent(postId),{source:'shared-message-photo-v708',postId:postId,force:true});opened=true;}
        else if(!fromMessage){location.href='modules/photo.html?post='+encodeURIComponent(postId);opened=true;}
      }catch(_e){opened=false;}
      if(fromMessage){
        if(opened)setTimeout(watchSharedPhotoReturnV708,0);
        else restoreSharedPhotoMessageContextV708('photo-open-failed-v708');
      }
    },36);
    return !!seeded;
  }
  async function openSharedPost(detail,sourceWin){
    detail=detail&&detail.detail?detail.detail:detail||{};var id=clean(detail.post_id||detail.postId||detail.id);if(!id)return false;var type=/video|reel|clip/.test(clean(detail.media_type||detail.type).toLowerCase())?'video':'photo';
    if(type==='video'){
      var fromMessage=prepareSharedVideoFromMessageV709(id,sourceWin);
      var url='modules/video.html?post='+encodeURIComponent(id)+'&from=message_share';
      var opened=false;
      try{
        if(window.HappyNavigation&&typeof window.HappyNavigation.openVideoPost==='function')opened=window.HappyNavigation.openVideoPost(url,{source:fromMessage?'shared-message-video-v709':'shared-video-v709',postId:id,force:true});
        else if(window.happyadOpenInternalUrlV492)opened=window.happyadOpenInternalUrlV492(url,{source:fromMessage?'shared-message-video-v709':'shared-video-v709',postId:id,force:true});
      }catch(_e){opened=false;}
      if(opened!==false)return opened;
      if(fromMessage){restoreSharedVideoMessageContextV709('video-open-failed-v709');return false;}
      location.href=url;return true;
    }
    return openPhotoHome(id,detail,sourceWin);
  }
  function maybeDeepLink(){try{var q=new URLSearchParams(location.search);var id=clean(q.get('happyad_post'));if(!id)return;var type=clean(q.get('happyad_type'))||'photo';setTimeout(function(){openSharedPost({post_id:id,media_type:type,source:'external-link'});},1100);}catch(_e){}}
  function isCurrentFrameMessage(event){try{var fr=frameNode();return !!(fr&&fr.contentWindow&&event&&event.source===fr.contentWindow);}catch(_e){return false;}}
  window.addEventListener('message',function(event){
    var d=event&&event.data;if(!d||typeof d!=='object')return;
    if(d.type==='HAPPYAD_SHARE_OPEN')open(d.detail||{},event.source);
    else if(d.type==='HAPPYAD_SHARE_CENTER_READY'&&isCurrentFrameMessage(event)){markFrameAlive('center-ready');sendContext();}
    else if((d.type==='HAPPYAD_SHARE_PONG'||d.type==='HAPPYAD_SHARE_CENTER_RESUMED')&&isCurrentFrameMessage(event))markFrameAlive(clean(d.detail&&d.detail.source)||d.type);
    else if(d.type==='HAPPYAD_SHARE_CLOSE')close(clean(d.detail&&d.detail.reason)||'close');
    else if(d.type==='HAPPYAD_SHARE_COMMITTED')recordAction(d.detail||{});
    else if(d.type==='HAPPYAD_OPEN_SHARED_POST')openSharedPost(d.detail||{},event.source);
    else if(d.type==='HAPPYAD_SHARED_VIDEO_RETURN_MESSAGE_V709')requestSharedVideoReturnV709(clean(d.detail&&d.detail.reason)||'video-message-v709');
    else if(d.type==='HAPPYAD_SHARE_DRAG_START'&&shareDragController)shareDragController.start(Number(d.detail&&d.detail.screenY));
    else if(d.type==='HAPPYAD_SHARE_DRAG_MOVE'&&shareDragController)shareDragController.move(Number(d.detail&&d.detail.screenY));
    else if(d.type==='HAPPYAD_SHARE_DRAG_END'&&shareDragController)shareDragController.end(Number(d.detail&&d.detail.screenY));
    else if(d.type==='HAPPYAD_APP_FRAME_VISIBLE')scheduleFrameResume('app-frame-visible');
  },true);
  document.addEventListener('visibilitychange',function(){
    if(document.hidden){hiddenAt=Date.now();frameReady=false;clearFrameHealthTimer();return;}
    if(shareIsOpen())scheduleFrameResume('visibility-visible-'+Math.max(0,Date.now()-hiddenAt));
  },true);
  window.addEventListener('HAPPYAD_NAV_CHANGED_V586',function(ev){
    try{
      var page=clean(ev&&ev.detail&&ev.detail.page).toLowerCase();
      if(sharedVideoMessageContext&&!sharedVideoRestoring&&page==='message')requestSharedVideoReturnV709('dock-message-v709');
    }catch(_e){}
  },true);
  window.addEventListener('pageshow',function(){if(shareIsOpen())scheduleFrameResume('pageshow');},true);
  window.addEventListener('focus',function(){if(shareIsOpen())scheduleFrameResume('focus');},true);
  /* V584: ancien popstate partage supprimé. */
  window.HappyadShareMaster={version:VERSION,open:open,close:close,openSharedPost:openSharedPost,returnSharedVideoToMessage:requestSharedVideoReturnV709,current:function(){return current;},isOpen:shareIsOpen,resume:function(){scheduleFrameResume('api');},probe:function(){return probeFrame('api');}};
  installStyle();if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',maybeDeepLink,{once:true});else maybeDeepLink();
})();
