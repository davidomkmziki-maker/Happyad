(function(){
  'use strict';
  if(window.__HAPPYAD_PROFILE_CONTENT_TABS_V687__)return;
  window.__HAPPYAD_PROFILE_CONTENT_TABS_V687__=true;
  window.__HAPPYAD_PROFILE_CONTENT_TABS_V686__=true;

  var VERSION='V687_PROFILE_CONTENT_TABS_EXACT_RETURN_CONTEXT';
  var PAGE_SIZE=9;
  var TAB_PREFIX='HAPPYAD_PROFILE_ACTIVE_TAB_V684:';
  var state={
    tab:'posts',uid:'',visitor:false,identity:'',items:[],offset:0,done:false,
    loading:false,seq:0,channel:null,observer:null,lastError:'',bound:false,
    openUntil:0,openPostId:'',openSeq:0,visibilityMode:'',
    restoreTimer:0,renderSig:'',lastReturnAt:0,tap:null,tapTimer:0,lastOpenedAt:0,lastOpenedId:'',profileSignalUntil:0,profileSignalTab:'posts',
    returnTab:'',returnUid:'',returnVisitor:false,returnUntil:0,returnScrollY:null,returnAt:0,returnFinalizeTimer:0
  };

  function clean(v){return String(v==null?'':v).trim();}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function client(){try{if(typeof window.happyadSb==='function')return window.happyadSb();if(window.happyadSupabase)return window.happyadSupabase;if(window.supabaseClient)return window.supabaseClient;}catch(_e){}return null;}
  function objectId(v){v=v&&typeof v==='object'?v:{};return clean(v.id||v.user_id||v.uid||v.profile_id||v.owner_id||v.creator_id||v.auth_user_id||v.account_uid);}
  function isVisitor(){
    try{var q=new URLSearchParams(location.search||'');if(q.get('public')==='1')return true;}catch(_e){}
    try{var b=document.body;if(b&&(b.classList.contains('happyadPublicCreatorProfile')||b.classList.contains('happyadVisitorProfilePersistentV601')||b.classList.contains('haProfileVisitor')))return true;}catch(_e){}
    try{var mode=clean(sessionStorage.getItem('HAPPYAD_PROFILE_MASTER_MODE')).toLowerCase();if(mode==='visitor'&&clean(sessionStorage.getItem('HAPPYAD_PROFILE_MASTER_ACTIVE_UID')))return true;}catch(_e){}
    return false;
  }
  function visitorUid(){
    try{if(window.HappyVisitorProfileV601&&typeof window.HappyVisitorProfileV601.current==='function'){var x=clean(window.HappyVisitorProfileV601.current());if(x)return x;}}catch(_e){}
    try{var p=new URLSearchParams(location.search||'');var keys=['uid','user_id','profile_id','owner_id','creator_id','user'];for(var i=0;i<keys.length;i++){var v=clean(p.get(keys[i]));if(v)return v;}}catch(_e){}
    try{var s=clean(sessionStorage.getItem('HAPPYAD_PROFILE_MASTER_ACTIVE_UID'));if(s)return s;}catch(_e){}
    try{var l=clean(localStorage.getItem('HAPPYAD_PUBLIC_PROFILE_ACTIVE_UID')||localStorage.getItem('HAPPYAD_ACTIVE_PROFILE_UID'));if(l)return l;}catch(_e){}
    try{var a=JSON.parse(localStorage.getItem('HAPPYAD_ACTIVE_PROFILE')||'null');var id=objectId(a);if(id)return id;}catch(_e){}
    try{return objectId(window.__HAPPYAD_ACTIVE_PROFILE_RAM);}catch(_e){return '';}
  }
  function ownerUidSync(){
    try{var u=window.UserStore&&window.UserStore.data||{};var id=objectId(u);if(id)return id;}catch(_e){}
    try{return clean(localStorage.getItem('HAPPYAD_AUTH_UID')||localStorage.getItem('HAPPYAD_CURRENT_USER_ID'));}catch(_e){return '';}
  }
  async function identity(){
    var visitor=isVisitor(),uid=visitor?visitorUid():ownerUidSync();
    if(!uid&&!visitor){try{var c=client(),r=c&&c.auth&&await c.auth.getSession();uid=clean(r&&r.data&&r.data.session&&r.data.session.user&&r.data.session.user.id);}catch(_e){}}
    return {visitor:visitor,uid:uid,key:(visitor?'visitor:':'owner:')+uid};
  }

  function allowed(tab,visitor){
    tab=clean(tab)||'posts';
    if(visitor&&tab!=='posts'&&tab!=='reposts')return 'posts';
    return ['posts','reposts','saved','private'].indexOf(tab)>=0?tab:'posts';
  }
  function tabKey(uid,visitor){return TAB_PREFIX+(visitor?'visitor:':'owner:')+clean(uid);}
  function readStoredTab(uid,visitor){
    var raw='';try{raw=sessionStorage.getItem(tabKey(uid,visitor))||'';}catch(_e){}
    if(!raw){try{raw=localStorage.getItem(tabKey(uid,visitor))||'';}catch(_e){}}
    try{var x=JSON.parse(raw||'null');return allowed(x&&x.tab,visitor);}catch(_e){return allowed(raw,visitor);}
  }
  function writeStoredTab(tab,uid,visitor){
    tab=allowed(tab,visitor);var raw=JSON.stringify({version:VERSION,tab:tab,uid:uid,visitor:visitor,at:Date.now()});
    try{sessionStorage.setItem(tabKey(uid,visitor),raw);}catch(_e){}
    try{localStorage.setItem(tabKey(uid,visitor),raw);}catch(_e){}
    try{sessionStorage.setItem('HAPPYAD_PROFILE_RETURN_TAB_V684',raw);}catch(_e){}
  }
  function clearReturnFinalizeTimer(){
    try{if(state.returnFinalizeTimer)clearTimeout(state.returnFinalizeTimer);}catch(_e){}
    state.returnFinalizeTimer=0;
  }
  function clearReturnContext(reason,removePending){
    clearReturnFinalizeTimer();
    state.returnTab='';state.returnUid='';state.returnVisitor=false;state.returnUntil=0;state.returnScrollY=null;state.returnAt=0;
    if(removePending!==false){try{sessionStorage.removeItem('HAPPYAD_PROFILE_AUX_RETURN_PENDING_V686');}catch(_e){}}
  }
  function activateReturnContext(ctx,reason){
    if(!ctx)return null;
    var tab=allowed(ctx.tab,!!ctx.visitor),uid=clean(ctx.uid),at=Number(ctx.at||Date.now()),scrollY=Number(ctx.scrollY);
    state.returnTab=tab;state.returnUid=uid;state.returnVisitor=!!ctx.visitor;state.returnUntil=Date.now()+4200;state.returnAt=at;
    state.returnScrollY=Number.isFinite(scrollY)?Math.max(0,scrollY):null;
    state.profileSignalTab=tab;state.profileSignalUntil=Date.now()+2600;
    if(uid)writeStoredTab(tab,uid,!!ctx.visitor);
    return {tab:tab,uid:uid,visitor:!!ctx.visitor,scrollY:state.returnScrollY,at:at,postId:clean(ctx.postId),media:clean(ctx.media),reason:reason||''};
  }
  function activeReturnContext(uid,visitor){
    if(Date.now()>Number(state.returnUntil||0))return null;
    if(clean(uid)!==clean(state.returnUid)||!!visitor!==!!state.returnVisitor)return null;
    return {tab:allowed(state.returnTab,visitor),uid:uid,visitor:!!visitor,scrollY:state.returnScrollY,at:state.returnAt};
  }
  function restoreReturnScroll(ctx){
    if(!ctx||!Number.isFinite(Number(ctx.scrollY)))return;
    var y=Math.max(0,Number(ctx.scrollY));
    function apply(){try{window.scrollTo({top:y,left:0,behavior:'auto'});}catch(_e){try{window.scrollTo(0,y);}catch(_x){}}}
    requestAnimationFrame(function(){apply();requestAnimationFrame(apply);});
    setTimeout(apply,90);setTimeout(apply,260);
  }
  function finalizeReturnContextLater(ctx){
    if(!ctx)return;
    clearReturnFinalizeTimer();var at=Number(ctx.at||0);
    state.returnFinalizeTimer=setTimeout(function(){
      state.returnFinalizeTimer=0;
      try{
        var raw=sessionStorage.getItem('HAPPYAD_PROFILE_AUX_RETURN_PENDING_V686')||'';
        var current=raw?JSON.parse(raw):null;
        if(!current||Number(current.at||0)===at)sessionStorage.removeItem('HAPPYAD_PROFILE_AUX_RETURN_PENDING_V686');
      }catch(_e){}
      if(Number(state.returnAt||0)===at&&Date.now()>Number(state.returnUntil||0))clearReturnContext('return-finalized',false);
    },3000);
  }

  function tabs(){return document.getElementById('happyadProfileTabsMaster');}
  function publicationsBox(){return document.getElementById('publicationsBox');}
  function panel(){return document.getElementById('happyadProfileContentPanelV684');}
  function grid(){return document.getElementById('happyadProfileContentGridV684');}
  function sentinel(){return document.getElementById('happyadProfileContentSentinelV684');}

  function ensurePanel(){
    var box=publicationsBox();if(!box)return null;
    var p=panel();
    if(!p){
      p=document.createElement('section');p.id='happyadProfileContentPanelV684';p.className='haProfileContentPanelV684';p.setAttribute('aria-live','polite');
      p.innerHTML='<div id="happyadProfileContentGridV684" class="profilePosts haProfileContentGridV684"></div><div id="happyadProfileContentSentinelV684" class="haProfileContentSentinelV684" aria-hidden="true"></div>';
      if(box.parentNode)box.parentNode.insertBefore(p,box.nextSibling);
    }
    return p;
  }
  function setActive(tab,persist){
    tab=allowed(tab,state.visitor);state.tab=tab;
    var t=tabs();if(t){t.dataset.activeTab=tab;Array.prototype.forEach.call(t.querySelectorAll('.haProfileMasterTab'),function(b){b.classList.toggle('is-active',clean(b.dataset.profileTab)===tab);});}
    if(persist!==false&&state.uid)writeStoredTab(tab,state.uid,state.visitor);
  }
  function profileScrollController(){
    return window.HappyProfileScrollControllerV654||window.HappyProfileScrollControllerV648||window.HappyProfileScrollControllerV647||window.HappyProfileScrollControllerV645||null;
  }
  function refreshPostsPagination(runNear){
    function once(run){
      try{
        var c=profileScrollController();
        if(c&&typeof c.refresh==='function')c.refresh();
        if(run&&c&&typeof c.runPagination==='function')c.runPagination();
      }catch(_e){}
    }
    requestAnimationFrame(function(){once(false);});
    setTimeout(function(){once(false);},90);
    setTimeout(function(){once(!!runNear);},280);
    setTimeout(function(){once(!!runNear);},620);
  }
  function disconnectAuxObserver(){if(state.observer){try{state.observer.disconnect();}catch(_e){}state.observer=null;}}
  function showPosts(){
    var b=publicationsBox(),p=panel(),changed=state.visibilityMode!=='posts';
    state.visibilityMode='posts';
    if(document.body)document.body.classList.remove('haProfileAuxTabV684');
    if(b){b.removeAttribute('aria-hidden');b.removeAttribute('data-happyad-content-tab-v684');}
    if(p){p.hidden=true;p.setAttribute('aria-hidden','true');}
    disconnectAuxObserver();
    if(changed)refreshPostsPagination(true);
  }
  function showAux(tab){
    var b=publicationsBox(),p=ensurePanel(),mode='aux:'+clean(tab),changed=state.visibilityMode!==mode;
    state.visibilityMode=mode;
    if(document.body)document.body.classList.add('haProfileAuxTabV684');
    if(b){b.setAttribute('aria-hidden','true');b.setAttribute('data-happyad-content-tab-v684',tab);}
    if(p){p.hidden=false;p.removeAttribute('aria-hidden');p.dataset.tab=tab;}
    if(changed)refreshPostsPagination(false);
  }
  function applyVisibility(){if(state.tab==='posts')showPosts();else showAux(state.tab);}

  function normalizeActionType(v){return clean(v).toLowerCase().replace(/\s+/g,'_');}
  function actionAliases(tab){return tab==='saved'?['favorite','fav','save']:['repost','republish','republication'];}
  function actionMatches(row,tab,uid){
    if(!row||clean(row.user_id)!==clean(uid)||row.liked!==true)return false;
    return actionAliases(tab).indexOf(normalizeActionType(row.action_type))>=0&&!!clean(row.post_id||row.content_id);
  }
  function strictPrivate(row){
    row=row||{};
    if(row.is_private===true||row.private===true||row.private_only===true||row.only_me===true)return true;
    if(clean(row.private_at)||clean(row.privated_at))return true;
    var vals=[row.visibility,row.privacy,row.audience,row.status];
    for(var i=0;i<vals.length;i++){
      var v=clean(vals[i]).toLowerCase().replace(/[-\s]+/g,'_');
      if(v==='private'||v==='privé'||v==='prive'||v==='only_me'||v==='moi')return true;
    }
    return false;
  }
  function isVideo(p){return /video|reel|clip|mp4|webm|mov|m4v/.test(clean(p&&(p.kind||p.media_type||p.mediaType||p.type||p.post_type)).toLowerCase());}
  function mediaOf(p){
    p=p||{};var video=isVideo(p),arr=video?
      [p.thumbnail_url,p.thumbnailUrl,p.poster_url,p.posterUrl,p.cover_url,p.coverUrl,p.preview_url,p.previewUrl,p.image_url,p.imageUrl,p.media_url,p.mediaUrl]:
      [p.media_url,p.mediaUrl,p.image_url,p.imageUrl,p.home_media_url,p.homeMediaUrl,p.thumbnail_url,p.thumbnailUrl,p.poster_url,p.posterUrl,p.cover_url,p.coverUrl];
    for(var i=0;i<arr.length;i++){var v=clean(arr[i]);if(v)return v;}return '';
  }
  function mapPost(row){
    row=row||{};var mapped=null;
    try{if(typeof window.mapHappyPost==='function')mapped=window.mapHappyPost(row);}catch(_e){}
    var p=Object.assign({},row,mapped||{});
    p.id=p.id||row.id;p.creatorId=p.creatorId||p.user_id||row.user_id||row.creator_id||'';p.user_id=p.user_id||row.user_id||row.creator_id||'';
    p.title=p.title||row.title||'Publication HAPPYAD';p.desc=p.desc||p.description||row.description||row.desc||'';p.description=p.description||p.desc||row.description||row.desc||'';
    p.kind=p.kind||p.media_type||row.media_type||row.kind||'photo';p.media_type=p.media_type||p.kind||row.media_type||row.kind||'photo';
    p.mediaUrl=p.mediaUrl||p.media_url||row.media_url||'';p.media_url=p.media_url||p.mediaUrl||row.media_url||'';
    p.thumbnailUrl=p.thumbnailUrl||p.thumbnail_url||p.posterUrl||p.poster_url||row.thumbnail_url||row.poster_url||row.cover_url||'';
    p.thumbnail_url=p.thumbnail_url||p.thumbnailUrl||row.thumbnail_url||row.poster_url||row.cover_url||'';
    p.posterUrl=p.posterUrl||p.poster_url||p.thumbnailUrl||row.poster_url||row.thumbnail_url||'';p.poster_url=p.poster_url||p.posterUrl||row.poster_url||row.thumbnail_url||'';
    p.createdAt=p.createdAt||p.created_at||(row.created_at?new Date(row.created_at).getTime():0);p.created_at=p.created_at||row.created_at||'';p.supabase=true;
    return p;
  }

  async function fetchActionRows(c,uid,tab,from,to){
    var aliases=actionAliases(tab),r;
    r=await c.from('happyad_content_actions').select('post_id,content_id,user_id,action_type,liked,created_at,updated_at').eq('user_id',uid).eq('liked',true).in('action_type',aliases).order('created_at',{ascending:false}).range(from,to);
    if(r&&r.error)r=await c.from('happyad_content_actions').select('post_id,content_id,user_id,action_type,liked').eq('user_id',uid).eq('liked',true).in('action_type',aliases).range(from,to);
    if(r&&r.error)throw r.error;
    return (Array.isArray(r&&r.data)?r.data:[]).filter(function(row){return actionMatches(row,tab,uid);});
  }
  async function fetchPosts(c,ids){
    ids=(ids||[]).map(clean).filter(Boolean);if(!ids.length)return [];
    var r=await c.from('happyad_posts').select('*').in('id',ids);if(r&&r.error)throw r.error;
    var by={};(r.data||[]).forEach(function(row){if(row&&row.deleted_at==null&&row.deleted!==true)by[clean(row.id)]=mapPost(row);});
    return ids.map(function(id){return by[id];}).filter(Boolean);
  }
  async function fetchPrivate(c,uid,from){
    var found=[],cursor=from,done=false,loops=0,seen={};
    while(found.length<PAGE_SIZE&&!done&&loops<6){
      var to=cursor+29;var r=await c.from('happyad_posts').select('*').eq('user_id',uid).order('created_at',{ascending:false}).range(cursor,to);if(r&&r.error)throw r.error;
      var rows=Array.isArray(r&&r.data)?r.data:[];cursor+=rows.length;done=rows.length<30;loops++;
      rows.forEach(function(row){var id=clean(row&&row.id);if(!id||seen[id]||row.deleted_at!=null||row.deleted===true||clean(row.user_id)!==clean(uid)||!strictPrivate(row))return;seen[id]=1;found.push(mapPost(row));});
    }
    return {posts:found.slice(0,PAGE_SIZE),offset:cursor,done:done};
  }

  function primeAction(p){
    try{var id=clean(p&&p.id);if(!id)return;var a=typeof window.getHappyAction==='function'?window.getHappyAction(id):null;if(a){if(state.tab==='saved')a.fav=true;if(state.tab==='reposts')a.repost=true;if(typeof window.setHappyAction==='function')window.setHappyAction(id,a);}}catch(_e){}
  }
  function primeOpen(p){
    try{
      var id=clean(p&&p.id);if(!id)return;var seen={},list=[p].concat(state.items||[]).filter(function(x){var k=clean(x&&x.id);if(!k||seen[k])return false;seen[k]=1;return true;}).slice(0,120);
      var payload=JSON.stringify({ts:Date.now(),postId:id,target:p,list:list,posts:list,source:'profile-content-v687',tab:state.tab,uid:state.uid,visitor:state.visitor});
      var key=isVideo(p)?'HAPPYAD_FAST_OPEN_VIDEO_V1':'HAPPYAD_FAST_OPEN_PHOTO_V1';sessionStorage.setItem(key,payload);localStorage.setItem(key,payload);
      var returnContext={version:VERSION,tab:state.tab,uid:state.uid,visitor:state.visitor,postId:id,media:isVideo(p)?'video':'photo',at:Date.now()};
      sessionStorage.setItem('HAPPYAD_PROFILE_RETURN_CONTEXT_V684',JSON.stringify(returnContext));
      writeStoredTab(state.tab,state.uid,state.visitor);
    }catch(_e){}
  }
  function markPendingReturn(p,id){
    try{
      var x={version:VERSION,tab:state.tab,uid:state.uid,visitor:state.visitor,postId:clean(id||(p&&p.id)),media:isVideo(p)?'video':'photo',scrollY:window.scrollY||document.documentElement.scrollTop||0,at:Date.now()};
      sessionStorage.setItem('HAPPYAD_PROFILE_AUX_RETURN_PENDING_V686',JSON.stringify(x));
    }catch(_e){}
  }
  function actualPhotoFullscreenOpen(){
    try{
      var box=document.getElementById('happyadHomePhotoFullscreen');
      return !!(box&&box.classList.contains('on')&&box.getAttribute('aria-hidden')!=='true');
    }catch(_e){return false;}
  }
  function clearStaleFullscreenFlag(){
    try{
      if(window.__HAPPYAD_PROFILE_FULLSCREEN_ACTIVE_V660__&&!actualPhotoFullscreenOpen()){
        window.__HAPPYAD_PROFILE_FULLSCREEN_ACTIVE_V660__=false;
        document.documentElement.classList.remove('haProfileFullscreenActiveV660','haProfileHomeFullscreenActiveV662','haProfileHomeFullscreenActiveV668');
        if(document.body)document.body.classList.remove('haProfileFullscreenActiveV660','haProfileHomeFullscreenActiveV662','haProfileHomeFullscreenActiveV668');
      }
    }catch(_e){}
  }
  function clearPressedTiles(){
    try{
      var g=grid();if(!g)return;
      Array.prototype.forEach.call(g.querySelectorAll('.happyadButtonPressedV604,.happyadButtonPressedV603,.happyadButtonPressedV602'),function(el){
        el.classList.remove('happyadButtonPressedV604','happyadButtonPressedV603','happyadButtonPressedV602','happyadTapOrange');
      });
    }catch(_e){}
  }
  function releaseOpenGate(reason){
    state.openUntil=0;state.openPostId='';state.openSeq++;
    clearStaleFullscreenFlag();clearPressedTiles();
    try{delete window.__HAPPYAD_PROFILE_AUX_OPEN_LOCK_V684;}catch(_e){window.__HAPPYAD_PROFILE_AUX_OPEN_LOCK_V684=null;}
    try{delete window.__HAPPYAD_PROFILE_AUX_OPEN_LOCK_V685;}catch(_e){window.__HAPPYAD_PROFILE_AUX_OPEN_LOCK_V685=null;}
    try{delete window.__HAPPYAD_PROFILE_AUX_OPEN_LOCK_V686;}catch(_e){window.__HAPPYAD_PROFILE_AUX_OPEN_LOCK_V686=null;}
    try{delete window.__HAPPYAD_PROFILE_AUX_OPEN_LOCK_V687;}catch(_e){window.__HAPPYAD_PROFILE_AUX_OPEN_LOCK_V687=null;}
  }
  function beginOpenGate(id){
    id=clean(id);var now=Date.now();clearStaleFullscreenFlag();
    if(!id||now<state.openUntil||actualPhotoFullscreenOpen())return false;
    state.openUntil=now+720;state.openPostId=id;state.openSeq++;
    try{
      var lock={id:id,until:state.openUntil,tab:state.tab,uid:state.uid,seq:state.openSeq};
      window.__HAPPYAD_PROFILE_AUX_OPEN_LOCK_V684=lock;
      window.__HAPPYAD_PROFILE_AUX_OPEN_LOCK_V685=lock;
      window.__HAPPYAD_PROFILE_AUX_OPEN_LOCK_V686=lock;
      window.__HAPPYAD_PROFILE_AUX_OPEN_LOCK_V687=lock;
    }catch(_e){}
    return true;
  }
  function directInternalOpen(url,extra){
    try{if(typeof window.happyadProfileOpenInternalV656==='function')return window.happyadProfileOpenInternalV656(url,extra||{});}catch(_e){}
    try{if(window.parent&&window.parent!==window&&window.parent.postMessage){window.parent.postMessage({type:'HAPPYAD_OPEN_INTERNAL_URL',url:url,extra:extra||{}},'*');return true;}}catch(_p){}
    try{if(window.parent===window){location.href=String(url||'').replace(/^modules\//,'');return true;}}catch(_l){}
    return false;
  }
  function openAuxPost(p,card){
    var id=clean(p&&p.id),video=isVideo(p);if(!beginOpenGate(id))return false;
    primeAction(p);primeOpen(p);
    var now=Date.now(),opened=false;
    try{var trustedOpen={id:id,at:now,type:'delegated-open',tab:state.tab,uid:state.uid};window.__HAPPYAD_PROFILE_AUX_TRUSTED_OPEN_V687=trustedOpen;window.__HAPPYAD_PROFILE_AUX_TRUSTED_OPEN_V686=trustedOpen;}catch(_token){}
    try{
      if(video){
        if(typeof window.openLongPublishedVideo==='function')opened=window.openLongPublishedVideo(p)!==false;
        if(!opened)opened=!!directInternalOpen('modules/video.html?post='+encodeURIComponent(id),{page:'video',postId:id,source:'profile-content-v687',tab:state.tab,uid:state.uid,force:true});
      }else if(typeof window.happyadProfileOpenPhotoFullscreenV478==='function'){
        opened=window.happyadProfileOpenPhotoFullscreenV478(p,card)!==false;
      }else if(typeof window.openLongPublishedPhoto==='function'){
        opened=window.openLongPublishedPhoto(p)!==false;
      }
    }catch(_e){opened=false;}
    if(opened){state.lastOpenedAt=Date.now();state.lastOpenedId=id;markPendingReturn(p,id);}
    if(!opened)setTimeout(function(){releaseOpenGate('open-failed');},80);
    else setTimeout(function(){if(video||!actualPhotoFullscreenOpen())releaseOpenGate('open-confirmed');},900);
    return opened;
  }
  function cardFor(p){
    var card=document.createElement('article'),video=isVideo(p),media=mediaOf(p),mediaHtml='';
    card.className='haProfileContentTileV684 haProfileContentTileV686 haProfileContentTileV687'+(video?' is-video':'');
    card.dataset.postId=clean(p.id);card.dataset.kind=video?'video':'photo';card.dataset.happyadAuxTab='1';card.__happyadPost=p;
    if(media){
      if(video&&/\.(mp4|webm|mov|m4v)(?:[?#]|$)/i.test(media))mediaHtml='<video src="'+esc(media)+'" muted playsinline preload="metadata"></video>';
      else mediaHtml='<img src="'+esc(media)+'" alt="" loading="lazy" decoding="async">';
    }else mediaHtml='<div class="haProfileContentMediaFallbackV684" aria-hidden="true"></div>';
    card.innerHTML='<div class="profileMedia">'+mediaHtml+'</div>'+(video?'<span class="profilePlay" aria-hidden="true">▶</span>':'');
    card.setAttribute('role','button');card.setAttribute('tabindex','0');card.setAttribute('aria-label',(video?'Ouvrir la vidéo ':'Ouvrir la photo ')+clean(p.title||'HAPPYAD'));
    return card;
  }
  function postById(id){
    id=clean(id);if(!id)return null;
    for(var i=0;i<state.items.length;i++)if(clean(state.items[i]&&state.items[i].id)===id)return state.items[i];
    return null;
  }
  function interactiveTarget(target){
    return !!(target&&target.closest&&target.closest('button,a,input,textarea,select,label,[data-profile-act],[data-card-act]'));
  }
  function tileFromTarget(target){
    return target&&target.closest?target.closest('#happyadProfileContentGridV684>.haProfileContentTileV687[data-post-id]'):null;
  }
  function stopEvent(e){
    if(!e)return;try{e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();}catch(_e){}
  }
  function clearTapTimer(){try{if(state.tapTimer)clearTimeout(state.tapTimer);}catch(_e){}state.tapTimer=0;}
  function openTile(tile,e,reason){
    if(!tile||state.tab==='posts')return false;
    var id=clean(tile.dataset.postId),p=postById(id);if(!id||!p)return false;
    var now=Date.now();
    if(state.lastOpenedId===id&&now-state.lastOpenedAt<560){stopEvent(e);return false;}
    clearTapTimer();state.tap=null;stopEvent(e);
    try{var trustedTile={id:id,at:now,type:reason||'tile-open',tab:state.tab,uid:state.uid};window.__HAPPYAD_PROFILE_AUX_TRUSTED_OPEN_V687=trustedTile;window.__HAPPYAD_PROFILE_AUX_TRUSTED_OPEN_V686=trustedTile;}catch(_e){}
    return openAuxPost(p,tile);
  }
  function bindDelegatedOpen(){
    var p=ensurePanel();if(!p||p.__haV686OpenBound)return;p.__haV686OpenBound=true;
    p.addEventListener('pointerdown',function(e){
      var tile=tileFromTarget(e.target);if(!tile||interactiveTarget(e.target)||(e.button!==undefined&&e.button!==0))return;
      clearTapTimer();state.tap={pointerId:e.pointerId,id:clean(tile.dataset.postId),tile:tile,x:e.clientX,y:e.clientY,at:Date.now()};
      try{var trustedPointer={id:state.tap.id,at:state.tap.at,type:'pointerdown',tab:state.tab,uid:state.uid};window.__HAPPYAD_PROFILE_AUX_TRUSTED_OPEN_V687=trustedPointer;window.__HAPPYAD_PROFILE_AUX_TRUSTED_OPEN_V686=trustedPointer;}catch(_e){}
    },true);
    p.addEventListener('pointerup',function(e){
      var t=state.tap;state.tap=null;if(!t||t.pointerId!==e.pointerId||interactiveTarget(e.target))return;
      var tile=tileFromTarget(e.target);if(!tile||tile!==t.tile||clean(tile.dataset.postId)!==t.id)return;
      if(Math.abs(e.clientX-t.x)>16||Math.abs(e.clientY-t.y)>16||Date.now()-t.at>900)return;
      clearTapTimer();state.tapTimer=setTimeout(function(){state.tapTimer=0;openTile(tile,null,'pointerup-fallback');},150);
    },true);
    p.addEventListener('pointercancel',function(){state.tap=null;clearTapTimer();},true);
    p.addEventListener('click',function(e){
      var tile=tileFromTarget(e.target);if(!tile||interactiveTarget(e.target))return;
      return openTile(tile,e,'click');
    },true);
    p.addEventListener('keydown',function(e){
      if(e.key!=='Enter'&&e.key!==' ')return;var tile=tileFromTarget(e.target);if(!tile)return;openTile(tile,e,'keyboard');
    },true);
  }
  function readPendingReturn(uid,visitor){
    try{
      var raw=sessionStorage.getItem('HAPPYAD_PROFILE_AUX_RETURN_PENDING_V686')||'';if(!raw)return null;
      var x=JSON.parse(raw);if(!x||Date.now()-Number(x.at||0)>1800000){sessionStorage.removeItem('HAPPYAD_PROFILE_AUX_RETURN_PENDING_V686');return null;}
      if(clean(x.uid)!==clean(uid)||!!x.visitor!==!!visitor)return null;
      return x;
    }catch(_e){return null;}
  }
  async function openDefaultForProfileSignal(reason){
    var idt=await identity(),now=Date.now();
    var pending=readPendingReturn(idt.uid,idt.visitor),ctx=pending?activateReturnContext(pending,reason||'return-pending'):activeReturnContext(idt.uid,idt.visitor);
    if(ctx){
      var returned=await open(ctx.tab,{restore:true,returnContext:true,reason:reason||'return-context'});
      restoreReturnScroll(ctx);finalizeReturnContextLater(ctx);return returned;
    }
    if(now<Number(state.profileSignalUntil||0))return open(allowed(state.profileSignalTab,idt.visitor),{restore:true,reason:reason||'profile-signal-burst'});
    state.profileSignalTab='posts';state.profileSignalUntil=now+1800;
    return open('posts',{restore:false,freshProfileOpen:true,reason:reason||'fresh-profile-open'});
  }
  function emptyMarkup(){
    var label=state.tab==='saved'?'Aucun favori':state.tab==='reposts'?'Aucune republication':'Aucune publication privée';
    var sub=state.tab==='saved'?'Ajoute une publication aux Favoris pour la retrouver ici.':state.tab==='reposts'?'Republie une publication pour la retrouver ici.':'Seules les publications réellement mises en privé apparaissent ici.';
    var icon=state.tab==='saved'?'♡':state.tab==='reposts'?'↻':'🔒';
    return '<div class="profileEmpty haProfileContentEmptyV684"><div class="profileEmptyIcon">'+icon+'</div><div class="big">'+label+'</div><div class="muted">'+sub+'</div></div>';
  }
  function loadingMarkup(){return '<div class="happyadPublicProfileLoadingCard"><div class="happyadPublicProfileLoadingMedia"></div></div><div class="happyadPublicProfileLoadingCard"><div class="happyadPublicProfileLoadingMedia"></div></div><div class="happyadPublicProfileLoadingCard"><div class="happyadPublicProfileLoadingMedia"></div></div>';}
  function renderSignature(){
    var ids=(state.items||[]).map(function(p){return clean(p&&p.id);}).filter(Boolean).join('|');
    if(ids)return 'items:'+state.tab+':'+state.uid+':'+ids;
    return (state.loading?'loading:':'empty:')+state.tab+':'+state.uid;
  }
  function gridMatches(sig){
    try{
      var g=grid();if(!g||g.dataset.haV687RenderSig!==sig)return false;
      if(!state.items.length)return true;
      var cards=Array.prototype.slice.call(g.querySelectorAll(':scope > .haProfileContentTileV687[data-post-id]'));
      if(cards.length!==state.items.length)return false;
      for(var i=0;i<cards.length;i++)if(clean(cards[i].dataset.postId)!==clean(state.items[i]&&state.items[i].id))return false;
      return true;
    }catch(_e){return false;}
  }
  function render(force){
    if(state.tab==='posts')return;applyVisibility();var g=grid();if(!g)return;
    var sig=renderSignature();
    if(!force&&gridMatches(sig)){state.renderSig=sig;ensureObserver();return;}
    g.innerHTML='';
    if(!state.items.length)g.innerHTML=state.loading?loadingMarkup():emptyMarkup();
    else state.items.forEach(function(p){g.appendChild(cardFor(p));});
    g.dataset.haV687RenderSig=sig;state.renderSig=sig;ensureObserver();
    try{document.dispatchEvent(new CustomEvent('happyad:profile-aux-posts-rendered-v686',{detail:{source:'profile-content-v687',tab:state.tab,uid:state.uid,count:state.items.length}}));}catch(_e){}
  }

  async function load(reset,keepVisible){
    if(state.tab==='posts'||state.loading||!state.uid)return false;
    var my=++state.seq,tab=state.tab,uid=state.uid;state.loading=true;state.lastError='';
    if(reset){state.offset=0;state.done=false;if(!keepVisible)state.items=[];}render();
    try{
      var c=client();if(!c)throw new Error('Supabase indisponible');var posts=[],nextOffset=state.offset,done=false;
      if(tab==='private'){
        var pr=await fetchPrivate(c,uid,state.offset);posts=pr.posts;nextOffset=pr.offset;done=pr.done;
      }else{
        var from=state.offset,to=from+PAGE_SIZE-1,rows=await fetchActionRows(c,uid,tab,from,to),ids=[],seen={};
        rows.forEach(function(row){var id=clean(row.post_id||row.content_id);if(id&&!seen[id]){seen[id]=1;ids.push(id);}});
        posts=await fetchPosts(c,ids);nextOffset=to+1;done=rows.length<PAGE_SIZE;
      }
      if(my!==state.seq||state.tab!==tab||state.uid!==uid)return false;
      if(reset)state.items=posts.slice();else{
        var existing={};state.items.forEach(function(p){existing[clean(p&&p.id)]=1;});posts.forEach(function(p){var id=clean(p&&p.id);if(id&&!existing[id]){existing[id]=1;state.items.push(p);}});
      }
      state.offset=nextOffset;state.done=done;return true;
    }catch(err){
      state.lastError=clean(err&&err.message||err);try{console.warn('[HAPPYAD V687 profile tabs]',state.lastError);}catch(_e){}
      if(reset&&!keepVisible)state.items=[];state.done=true;return false;
    }finally{
      if(my===state.seq){state.loading=false;render();}
    }
  }
  function ensureObserver(){
    var s=sentinel();if(!s||state.done||state.loading)return;if(state.observer){try{state.observer.disconnect();}catch(_e){}}
    if(!('IntersectionObserver' in window))return;
    state.observer=new IntersectionObserver(function(entries){if(entries.some(function(x){return x.isIntersecting;})&&!state.loading&&!state.done)load(false,true);},{root:null,rootMargin:'420px 0px',threshold:0.01});state.observer.observe(s);
  }
  async function stopRealtime(){var c=client(),ch=state.channel;state.channel=null;if(ch&&c&&typeof c.removeChannel==='function'){try{await c.removeChannel(ch);}catch(_e){}}}
  async function startRealtime(){
    await stopRealtime();var c=client();if(!c||!c.channel||!state.uid||state.tab==='posts')return;
    var uid=state.uid,tab=state.tab,ch=c.channel('happyad-profile-content-v687-'+uid+'-'+tab+'-'+Date.now());state.channel=ch;
    if(tab==='private')ch.on('postgres_changes',{event:'*',schema:'public',table:'happyad_posts',filter:'user_id=eq.'+uid},function(){setTimeout(function(){if(state.uid===uid&&state.tab===tab)load(true,true);},120);});
    else ch.on('postgres_changes',{event:'*',schema:'public',table:'happyad_content_actions',filter:'user_id=eq.'+uid},function(payload){var row=(payload&&payload.new)||payload.old||{};if(actionAliases(tab).indexOf(normalizeActionType(row.action_type))<0)return;setTimeout(function(){if(state.uid===uid&&state.tab===tab)load(true,true);},120);});
    try{ch.subscribe();}catch(_e){}
  }

  async function open(tab,detail){
    detail=detail||{};var idt=await identity();tab=allowed(tab,idt.visitor);
    if(tab!=='posts'&&!idt.uid){try{if(typeof window.toast==='function')window.toast('Profil introuvable.');}catch(_e){}return false;}
    var same=state.identity===idt.key&&state.tab===tab;
    state.visitor=idt.visitor;state.uid=idt.uid;state.identity=idt.key;setActive(tab,true);applyVisibility();
    state.profileSignalTab=tab;state.profileSignalUntil=Date.now()+(detail.returnContext?2600:1800);
    if(tab==='posts'){
      ++state.seq;state.items=[];state.offset=0;state.done=false;state.loading=false;state.lastError='';state.renderSig='';
      await stopRealtime();
      var box=publicationsBox();if(box&&!box.querySelector('.profilePost,.happyadPublicProfileLoadingCard'))setTimeout(function(){try{if(idt.visitor&&typeof window.render==='function')window.render();else if(!idt.visitor&&typeof window.renderProfilePublications==='function')window.renderProfilePublications();}catch(_e){}},0);
      return true;
    }
    if(same){
      if(!gridMatches(renderSignature()))render(true);else ensureObserver();
      return true;
    }
    state.items=[];state.offset=0;state.done=false;state.loading=false;state.renderSig='';render(true);
    startRealtime();load(true,false);return true;
  }
  async function restore(reason){
    var idt=await identity();if(!idt.uid&&idt.visitor)return false;
    var pending=readPendingReturn(idt.uid,idt.visitor),ctx=pending?activateReturnContext(pending,reason||'restore-pending'):activeReturnContext(idt.uid,idt.visitor);
    var tab=ctx?ctx.tab:readStoredTab(idt.uid,idt.visitor);
    if(state.identity===idt.key&&state.tab===tab){
      state.visitor=idt.visitor;state.uid=idt.uid;setActive(tab,false);applyVisibility();
      state.profileSignalTab=tab;state.profileSignalUntil=Date.now()+(ctx?2600:1200);
      if(tab!=='posts'){
        if(!gridMatches(renderSignature()))render(true);else ensureObserver();
      }else refreshPostsPagination(false);
      if(ctx){restoreReturnScroll(ctx);finalizeReturnContextLater(ctx);}
      return true;
    }
    var result=await open(tab,{restore:true,returnContext:!!ctx,reason:reason||'restore'});
    if(ctx){restoreReturnScroll(ctx);finalizeReturnContextLater(ctx);}return result;
  }
  function scheduleRestore(reason,delay){
    releaseOpenGate(reason);state.lastReturnAt=Date.now();
    try{if(state.restoreTimer)clearTimeout(state.restoreTimer);}catch(_e){}
    state.restoreTimer=setTimeout(function(){
      state.restoreTimer=0;restore(reason||'restore').catch(function(){});
    },Math.max(45,Number(delay||80)));
  }
  function prepareFreshOpen(reason){
    clearReturnContext(reason||'fresh-profile-open',true);
    releaseOpenGate(reason||'fresh-profile-open');
    state.profileSignalTab='posts';state.profileSignalUntil=Date.now()+1800;
    state.tab='posts';
    try{setActive('posts',true);applyVisibility();}catch(_e){}
    return true;
  }
  function current(){return state.tab;}
  function items(){return state.items.slice();}
  function currentState(){return {version:VERSION,tab:state.tab,uid:state.uid,visitor:state.visitor,count:state.items.length,done:state.done,loading:state.loading,error:state.lastError,identity:state.identity,returnTab:state.returnTab,returnUntil:state.returnUntil};}

  function clearLegacyCaches(){
    try{for(var i=localStorage.length-1;i>=0;i--){var k=localStorage.key(i)||'';if(k.indexOf('HAPPYAD_PROFILE_CONTENT_TAB_V682:')===0||k.indexOf('HAPPYAD_PROFILE_SOCIAL_TAB_V679:')===0||k.indexOf('HAPPYAD_PROFILE_ACTIVE_TAB_V683:')===0)localStorage.removeItem(k);}}catch(_e){}
  }
  function tabFromTarget(target){var b=target&&target.closest&&target.closest('#happyadProfileTabsMaster .haProfileMasterTab');return b?clean(b.dataset.profileTab):'';}
  function bind(){
    if(state.bound)return;state.bound=true;clearLegacyCaches();ensurePanel();bindDelegatedOpen();
    document.addEventListener('click',function(e){
      var tab=tabFromTarget(e.target);if(!tab)return;
      var visitor=isVisitor();tab=allowed(tab,visitor);
      e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
      clearReturnContext('explicit-tab-change',true);
      state.profileSignalTab=tab;state.profileSignalUntil=Date.now()+1800;
      open(tab,{source:'document-capture-v687',explicitTab:true}).catch(function(){});return false;
    },true);
    document.addEventListener('click',function(e){
      var a=e.target&&e.target.closest&&e.target.closest('[data-profile-act="fav"],[data-profile-act="repost"],[data-card-act="fav"],[data-card-act="repost"],[data-profile-fs-act="fav"],[data-profile-fs-act="repost"],[data-ha-act="private"]');
      if(a&&state.tab!=='posts')setTimeout(function(){if(state.tab!=='posts')load(true,true);},700);
    },true);
    window.addEventListener('storage',function(e){if((e.key==='HAPPYAD_ACTION_FAST_SYNC_V1'||e.key==='HAPPYAD_PRIVATE_POST_IDS_V1')&&state.tab!=='posts')setTimeout(function(){load(true,true);},120);});
    window.addEventListener('message',function(e){
      var d=e&&e.data||{};
      if(d.type==='HAPPYAD_PROFILE_SHOW_V601'||d.type==='HAPPYAD_PROFILE_SHOW_OWNER_V649'||(d.type==='HAPPYAD_APP_FRAME_VISIBLE'&&String(d.page||'')==='profile')){
        releaseOpenGate(d.type);openDefaultForProfileSignal(d.type).catch(function(){});return;
      }
      if(d.type==='HAPPYAD_MODULE_RESUME')scheduleRestore(d.type,95);
    },true);
    document.addEventListener('happyad:profile-owner-restored',function(){scheduleRestore('owner-restored',70);});
    document.addEventListener('happyad:profile-fullscreen-close-v660',function(){scheduleRestore('photo-close',45);});
    window.addEventListener('pageshow',function(){scheduleRestore('pageshow',110);});
    document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')scheduleRestore('visible',110);});
    window.addEventListener('focus',function(){scheduleRestore('focus',110);});
    openDefaultForProfileSignal('initial').catch(function(){});
  }

  var api={version:VERSION,open:open,restore:restore,current:current,items:items,refresh:function(){return state.tab==='posts'?Promise.resolve(refreshPostsPagination(true)):load(true,true);},state:currentState,releaseOpen:releaseOpenGate,prepareFreshOpen:prepareFreshOpen};
  window.HappyProfileContentTabsV687=api;
  window.HappyProfileContentTabsV686=api;
  window.HappyProfileContentTabsV685=api;
  window.HappyProfileContentTabsV684=api;
  window.HappyProfileContentTabsV683=api;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();
