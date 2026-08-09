/* HAPPYAD HOME FEED MASTER V3 NORMALIZED CARDS
   Source unique du fil Accueil : normalisation Supabase, ordre stable, albums,
   pagination append-only, identité de carte et orchestration rendu/pagination. */
(function(){
  'use strict';
  if(window.HappyHomeFeedV1&&window.HappyHomeFeedV1.version==='V4_ATOMIC_IDLE_FEED')return;

  var VERSION='V4_ATOMIC_IDLE_FEED';
  var MAX_ROWS=120;
  var bridge=null;
  var renderPending=null;
  var renderTimer=0;
  var pagination={
    cursor:null,
    seeded:false,
    done:false,
    loading:false,
    cycle:false,
    pending:false,
    timer:0,
    nextOffset:0
  };

  function clean(v){return String(v==null?'':v).trim();}
  function idOf(p){return clean(p&&(p.id||p.post_id));}
  function createdMs(p){
    try{
      var v=p&&(p.createdAt!=null?p.createdAt:(p.created_at||p.timestamp||p.time||p.date||0));
      if(typeof v==='number'){var n=v>100000000000?v:v*1000;return Number.isFinite(n)?n:0;}
      var t=Date.parse(String(v||''));return Number.isFinite(t)?t:0;
    }catch(_e){return 0;}
  }
  function isMarketplace(p){p=p||{};return p.happyadMarketplace===true||p.happyad_marketplace===true||p.is_marketplace===true||clean(p.mode).toLowerCase()==='marketplace';}
  function showMarketplaceOnHome(p){p=p||{};return p.marketplaceShowOnHome===true||p.marketplace_show_on_home===true||p.showOnHome===true;}
  function renderable(p){
    if(!p||!idOf(p))return false;
    if(clean(p.deleted_at||p.deletedAt))return false;
    if(clean(p.boutique_product_id||p.boutiqueProductId))return false;
    if(isMarketplace(p)&&!showMarketplaceOnHome(p))return false;
    return true;
  }
  function compareDesc(a,b){
    var ta=createdMs(a),tb=createdMs(b);
    if(ta!==tb)return tb-ta;
    var ia=idOf(a),ib=idOf(b);
    if(ia===ib)return 0;
    return ib.localeCompare(ia);
  }
  function dedupeKeepOrder(rows){
    var seen=new Set(),out=[];
    (rows||[]).forEach(function(row){
      var id=idOf(row);if(!id||seen.has(id)||!renderable(row))return;
      seen.add(id);out.push(row);
    });
    return out;
  }
  function remoteOrder(rows){return dedupeKeepOrder(rows).slice().sort(compareDesc);}
  function seedCache(rows,limit){return remoteOrder(rows).slice(0,Math.max(1,Number(limit)||20));}

  function replaceHead(current,remoteHead,keepTail){
    var head=remoteOrder(remoteHead);
    if(!head.length)return dedupeKeepOrder(current).slice(0,MAX_ROWS);
    /* Au premier head distant, un cache ancien n'est jamais traité comme une page
       déjà chargée : on repart d'une tête contiguë. Les refresh suivants peuvent
       conserver uniquement les pages réellement chargées pendant cette session. */
    if(keepTail===false)return head.slice(0,MAX_ROWS);
    var currentRows=dedupeKeepOrder(current),headIds=new Set(head.map(idOf));
    var boundary=head[head.length-1],tail=[];
    currentRows.forEach(function(row){
      if(headIds.has(idOf(row)))return;
      if(compareDesc(row,boundary)>=0)tail.push(row);
    });
    return dedupeKeepOrder(head.concat(tail)).slice(0,MAX_ROWS);
  }

  /* Page distante strictement append-only : une ligne nouvelle plus récente que la
     dernière ligne déjà connue n'a jamais le droit d'être injectée au milieu. */
  function appendPage(current,page){
    var out=dedupeKeepOrder(current).slice(),byId=new Map();
    out.forEach(function(row,i){byId.set(idOf(row),i);});
    var ordered=remoteOrder(page),last=out.length?out[out.length-1]:null;
    ordered.forEach(function(row){
      var id=idOf(row),idx=byId.get(id);
      if(idx!=null){out[idx]=Object.assign({},out[idx],row);return;}
      if(last&&compareDesc(row,last)<0)return;
      byId.set(id,out.length);out.push(row);last=row;
    });
    return out.slice(0,MAX_ROWS);
  }

  function patchExisting(current,patches){
    var patchMap=new Map();
    (patches||[]).forEach(function(p){var id=idOf(p);if(id)patchMap.set(id,p);});
    return dedupeKeepOrder(current).map(function(row){var p=patchMap.get(idOf(row));return p?Object.assign({},row,p):row;});
  }
  function remove(current,id){id=clean(id);return dedupeKeepOrder(current).filter(function(row){return idOf(row)!==id;});}
  function cleanRows(rows){return dedupeKeepOrder(rows).slice(0,MAX_ROWS);}

  function explicitAlbumKey(p){
    if(!p)return '';
    var fs=['albumId','album_id','groupId','group_id','batchId','batch_id','galleryId','gallery_id','collectionId','collection_id','multiId','multi_id','postGroupId','post_group_id','publicationGroupId','publication_group_id'];
    for(var i=0;i<fs.length;i++){var v=p[fs[i]];if(v!=null&&clean(v))return 'album:'+clean(v);}
    return '';
  }
  function cardKey(p){return explicitAlbumKey(p)||('post:'+idOf(p));}

  /* V3 — normalisation unique des lignes Supabase avant leur entrée dans le fil. */
  function publicMediaUrl(src){
    src=clean(src);if(!src)return '';
    if(/^https?:\/\//i.test(src)||/^blob:/i.test(src)||/^data:/i.test(src))return src;
    src=src.replace(/^\/+/, '').replace(/^happyad-media\//,'');
    var base=clean(window.HAPPYAD_SUPABASE_URL||'https://txjjyhupbejgjcianrmr.supabase.co').replace(/\/+$/,'');
    return base+'/storage/v1/object/public/happyad-media/'+encodeURI(src);
  }
  function normalizeHandle(v){v=clean(v).replace(/^@+/,'');return v?('@'+v):'';}
  function bool(v){return v===true||v===1||String(v).toLowerCase()==='true';}
  function normalizePost(r){
    r=r||{};
    var mode=clean(r.mode||'publish')||'publish';
    var marketplace=bool(r.happyad_marketplace)||bool(r.is_marketplace)||mode.toLowerCase()==='marketplace';
    var details=(r.marketplace_details&&typeof r.marketplace_details==='object')?r.marketplace_details:{};
    var showMarketplace=bool(r.marketplace_show_on_home)||bool(r.showOnHome)||bool(details.show_on_home);
    var mediaType=clean(r.marketplace_cover_type||r.media_type||r.home_media_type||r.kind||r.mediaType||'photo').toLowerCase()||'photo';
    var rawMedia=r.marketplace_cover_url||r.media_url||r.mediaUrl||r.home_media_url||r.homeMediaUrl||r.video_url||r.videoUrl||r.url||r.src||r.thumbnail_url||r.cover_url||r.media_path||r.mediaPath||'';
    var media=publicMediaUrl(rawMedia);
    var rawPoster=r.thumbnail_url||r.thumbnailUrl||r.poster_url||r.posterUrl||r.cover_url||r.coverUrl||r.image_url||r.imageUrl||'';
    var poster=publicMediaUrl(rawPoster);
    var owner=clean(r.user_id||r.creator_id||r.owner_id||r.author_id||r.profile_id||r.creatorId||r.userId||r.ownerId||r.authorId||r.profileId||'');
    var avatar=clean(r.avatar_url||r.avatar||r.user_avatar||r.creator_avatar||r.author_avatar||r.profile_photo_url||r.profile_photo||r.profile_picture_url||r.profile_picture||r.photo_url||r.image_url||r.picture||'');
    var createdRaw=r.created_at||r.createdAt||'';
    var created=createdRaw?createdMs({created_at:createdRaw}):0;
    var coverType=clean(r.marketplace_cover_type||r.media_type||mediaType||'image');
    var coverUrl=publicMediaUrl(r.marketplace_cover_url||media||'');
    var coverPath=clean(r.marketplace_cover_path||r.media_path||r.mediaPath||'');
    if(marketplace&&coverUrl){media=coverUrl;mediaType=coverType.toLowerCase().indexOf('video')>=0?'video':'photo';}
    var mapped={
      id:r.id,mode:mode,title:r.title||'Publication HAPPYAD',desc:r.description||r.desc||'',description:r.description||r.desc||'',category:r.category||'',location:r.location||'',
      kind:mediaType,mediaType:mediaType,media_type:mediaType,mediaUrl:media,media_url:media,homeMediaUrl:media,home_media_url:media,mediaPath:coverPath||clean(r.media_path||r.mediaPath||''),media_path:coverPath||clean(r.media_path||r.mediaPath||''),
      creatorId:owner,creator_id:owner,user_id:owner,userId:owner,owner_id:owner,ownerId:owner,author_id:owner,authorId:owner,profile_id:owner,profileId:owner,
      creatorName:r.display_name||r.creator_name||r.full_name||r.user_name||r.creatorName||'Utilisateur HAPPYAD',handle:normalizeHandle(r.username||r.handle||''),username:clean(r.username||r.handle||'').replace(/^@+/,''),
      avatar:avatar,avatar_url:avatar,badge:r.badge||r.user_badge||'aucun',user_badge:r.user_badge||r.badge||'aucun',createdAt:created,created_at:r.created_at||r.createdAt||'',supabase:r.supabase!==false,
      likes_count:Number(r.likes_count||0),comments_count:Number(r.comments_count||0),shares_count:Number(r.shares_count||0),saves_count:Number(r.saves_count||0),views_count:Number(r.views_count||r.view_count||r.video_views_count||0),
      happyadMarketplace:marketplace,happyad_marketplace:marketplace,is_marketplace:marketplace,marketplaceShowOnHome:showMarketplace,marketplace_show_on_home:showMarketplace,showOnHome:showMarketplace,
      marketplaceCategory:r.marketplace_category||r.category||'',marketplace_category:r.marketplace_category||r.category||'',marketplaceCoverIndex:Number(r.marketplace_cover_index||r.coverIndex||0)||0,marketplace_cover_index:Number(r.marketplace_cover_index||r.coverIndex||0)||0,
      marketplaceMedia:r.marketplace_media||r.media||[],marketplace_media:r.marketplace_media||r.media||[],marketplaceCoverUrl:coverUrl||media,marketplace_cover_url:coverUrl||media,marketplaceCoverPath:coverPath,marketplace_cover_path:coverPath,
      marketplaceCoverType:coverType,marketplace_cover_type:coverType,listingViewsCount:Number(r.listing_views_count||r.viewsCount||0)||0,listing_views_count:Number(r.listing_views_count||r.viewsCount||0)||0,sellerBadge:r.seller_badge||r.badge||r.user_badge||'',seller_badge:r.seller_badge||r.badge||r.user_badge||'',
      imageCrop:r.image_crop||r.imageCrop||null,thumbnailUrl:poster,thumbnail_url:poster,posterUrl:poster,poster_url:poster,
      batchId:r.batch_id||r.batchId||'',batch_id:r.batch_id||r.batchId||'',groupIndex:Number(r.group_index||r.groupIndex||0)||0,group_index:Number(r.group_index||r.groupIndex||0)||0,photoIndex:Number(r.photo_index||r.photoIndex||r.group_index||r.groupIndex||0)||0,photo_index:Number(r.photo_index||r.photoIndex||r.group_index||r.groupIndex||0)||0,
      postType:r.postType||r.post_type||'',post_type:r.post_type||r.postType||'',boutique_product_id:r.boutique_product_id||r.boutiqueProductId||'',boutiqueProductId:r.boutiqueProductId||r.boutique_product_id||'',button_label:r.button_label||r.buttonLabel||'',action:r.action||'',
      visibility:r.visibility||r.privacy||r.audience||r.status||'',privacy:r.privacy||'',audience:r.audience||'',status:r.status||'',is_private:bool(r.is_private)||bool(r.private)||clean(r.visibility||r.privacy||r.audience||r.status).toLowerCase()==='private',private:bool(r.private),private_at:r.private_at||r.privated_at||'',
      comments_disabled:bool(r.comments_disabled),hide_like_count:bool(r.hide_like_count),mentioned_user_ids:Array.isArray(r.mentioned_user_ids)?r.mentioned_user_ids:[],mention_handles:Array.isArray(r.mention_handles)?r.mention_handles:[],deleted_at:r.deleted_at||r.deletedAt||''
    };
    if(mediaType.indexOf('video')>=0){mapped.videoUrl=media;mapped.video_url=media;}
    ['video_url_compressed','video_url_original','compressed_video_url','original_video_url'].forEach(function(k){if(r[k])mapped[k]=publicMediaUrl(r[k]);});
    ['media_width','media_height','image_width','image_height','natural_width','natural_height','width','height','photo_width','photo_height','original_width','original_height','aspect_ratio','media_aspect_ratio','image_aspect_ratio','ratio'].forEach(function(k){if(r[k]!=null&&r[k]!==''&&mapped[k]==null)mapped[k]=r[k];});
    return mapped;
  }
  function normalizeRows(rows){return (rows||[]).map(normalizePost).filter(function(p){return !!idOf(p);});}

  /* V3 — groupage album unique et pur. L'ordre de la première occurrence du groupe
     reste celui du Feed Master; aucun tri global n'est effectué après rendu. */
  function isLivePost(p){p=p||{};return bool(p.isLive)||clean(p.mode).toLowerCase()==='live'||clean(p.type).toLowerCase()==='live'||clean(p.category).toLowerCase()==='live';}
  function isStoryPost(p){p=p||{};if(isLivePost(p))return false;var m=clean(p.mode).toLowerCase(),t=clean(p.type).toLowerCase(),c=clean(p.category).toLowerCase();return m==='story'||t==='story'||c==='story';}
  function isVideoPost(p){p=p||{};if(isStoryPost(p)||isLivePost(p))return false;var t=clean(p.kind||p.type||p.mediaType||p.media_type).toLowerCase();return t==='video'||t.indexOf('video')>=0;}
  function marketplaceHomeVisible(p){if(!isMarketplace(p))return true;return showMarketplaceOnHome(p);}
  function albumCreatorKey(p){p=p||{};return clean(p.creatorId||p.user_id||p.userId||p.ownerId||p.owner_id||p.handle||p.creatorName).toLowerCase();}
  function fallbackAlbumKey(p){var t=createdMs(p);if(!t)return '';var bucket=Math.floor(t/90000);return ['auto',albumCreatorKey(p),clean(p&&p.title).toLowerCase(),clean(p&&(p.desc||p.description)).toLowerCase(),clean(p&&p.category).toLowerCase(),bucket].join('|');}
  function groupPosts(items){
    var groups=Object.create(null),slots=[];
    (items||[]).forEach(function(p){
      if(!p||!marketplaceHomeVisible(p))return;
      if(isVideoPost(p)||isStoryPost(p)||isLivePost(p)){
        p.__feedCardKey=cardKey(p);slots.push({type:'single',post:p});return;
      }
      var explicit=explicitAlbumKey(p);
      /* Les publications Supabase modernes ne sont groupées que par un identifiant
         explicite (batch/group/album). Le fallback temporel reste réservé aux
         anciens objets locaux afin d'éviter de fusionner deux vraies publications. */
      var key=explicit||((p.supabase===false||p.__fromPublishSuccess===true)?fallbackAlbumKey(p):'')||('single:'+idOf(p));
      if(!groups[key]){groups[key]=[];slots.push({type:'album',key:key});}
      groups[key].push(p);
    });
    return slots.map(function(slot){
      if(slot.type==='single')return slot.post;
      var key=slot.key,arr=(groups[key]||[]).slice();
      arr.sort(function(a,b){var ai=Number(a.groupIndex||a.group_index||a.photoIndex||a.photo_index||0),bi=Number(b.groupIndex||b.group_index||b.photoIndex||b.photo_index||0);if(ai!==bi)return ai-bi;return createdMs(a)-createdMs(b);});
      if(arr.length>18)arr=arr.slice(0,18);
      var rep=Object.assign({},arr[0]||{});
      rep.__albumItems=arr;rep.__albumCount=arr.length;rep.__albumKey=key;rep.__actionId=arr[0]&&arr[0].id;
      rep.__feedCardKey=key.indexOf('single:')===0?('post:'+idOf(rep)):key;
      rep.__feedCreatedAt=arr.reduce(function(max,row){return Math.max(max,createdMs(row)||0);},0);
      return rep;
    });
  }

  function cursorDate(row){
    try{
      var raw=row&&(row.created_at||row.createdAt||row.timestamp||row.time||row.date)||'';
      if(typeof raw==='number'||/^\d+$/.test(String(raw))){var n=Number(raw);if(n>0)return new Date(n>100000000000?n:n*1000).toISOString();}
      var d=new Date(raw);return isNaN(d.getTime())?'':d.toISOString();
    }catch(_e){return '';}
  }
  function cursorFromRows(rows){
    try{var r=(rows||[])[(rows||[]).length-1]||null;if(!r)return null;var at=cursorDate(r),id=clean(r.id);return at&&id?{created_at:at,id:id}:null;}catch(_e){return null;}
  }
  function cursorCompare(a,b){
    try{
      if(!a&&!b)return 0;if(!a)return 1;if(!b)return -1;
      var ta=Date.parse(String(a.created_at||'')),tb=Date.parse(String(b.created_at||''));
      if(Number.isFinite(ta)&&Number.isFinite(tb)&&ta!==tb)return ta<tb?-1:1;
      var ia=String(a.id||''),ib=String(b.id||'');if(ia===ib)return 0;return ia<ib?-1:1;
    }catch(_e){return 0;}
  }
  function applyCursor(q,cursor){
    try{
      if(!q||!cursor||!cursor.created_at||!cursor.id)return q;
      return q.or('created_at.lt.'+cursor.created_at+',and(created_at.eq.'+cursor.created_at+',id.lt.'+cursor.id+')');
    }catch(_e){return q;}
  }

  function connectRuntime(adapter){bridge=adapter||null;return api;}
  function bcall(name){
    if(!bridge||typeof bridge[name]!=='function')return undefined;
    var args=[].slice.call(arguments,1);
    return bridge[name].apply(bridge,args);
  }
  function whenIdle(){
    return new Promise(function(resolve){
      function check(){
        if(!bcall('isScrollActive')){resolve(true);return;}
        setTimeout(check,90);
      }
      check();
    });
  }
  function hasPendingRender(){return !!renderPending;}
  function scheduleRenderFlush(delay){
    clearTimeout(renderTimer);
    renderTimer=setTimeout(flushRender,Math.max(90,Number(delay)||140));
  }
  function queueRender(options){
    options=options||{};
    var next={feedOnly:options.feedOnly===true,reason:options.reason||'home-feed-v2-idle'};
    if(renderPending){
      next.feedOnly=renderPending.feedOnly===true&&next.feedOnly===true;
      next.reason=options.reason||renderPending.reason||next.reason;
    }
    renderPending=next;
    scheduleRenderFlush(140);
    return false;
  }
  function flushRender(){
    renderTimer=0;
    if(!renderPending)return false;
    if(bcall('isScrollActive')){scheduleRenderFlush(120);return false;}
    var pending=renderPending;renderPending=null;
    bcall('invalidateRender');
    return bcall('commitRender',{feedOnly:pending.feedOnly===true,reason:pending.reason||'home-feed-v2-idle',__idleCommitV795:true});
  }
  function requestRender(options){
    options=options||{};
    var hasCards=!!bcall('hasCards');
    if(hasCards&&bcall('isScrollActive')&&options.__idleCommitV795!==true)return queueRender(options);
    return bcall('commitRender',options);
  }
  function renderWhenIdle(reason){return queueRender({feedOnly:true,reason:reason||'home-feed-v2-idle'});}

  function resetRuntime(){
    clearTimeout(renderTimer);renderTimer=0;renderPending=null;
    clearTimeout(pagination.timer);
    pagination.cursor=null;pagination.seeded=false;pagination.done=false;pagination.loading=false;
    pagination.cycle=false;pagination.pending=false;pagination.timer=0;pagination.nextOffset=0;
    updatePaginationState();
  }
  function seedPagination(cursor,done){
    if(cursor&&!pagination.seeded){pagination.cursor={created_at:String(cursor.created_at||''),id:String(cursor.id||'')};pagination.seeded=true;}
    if(done===true)pagination.done=true;
    else if(done===false)pagination.done=false;
    updatePaginationState();
    return paginationState();
  }
  function paginationState(){return {cursor:pagination.cursor&&Object.assign({},pagination.cursor),seeded:pagination.seeded,done:pagination.done,loading:pagination.loading,cycle:pagination.cycle,pending:pagination.pending,nextOffset:pagination.nextOffset};}

  function updatePaginationState(){
    try{
      var sentinel=document.getElementById('happyadHomePaginationSentinelV694');if(!sentinel)return;
      var total=Number(bcall('visibleTotal')||0);
      var limit=Number(bcall('getRenderLimit')||0);
      var localPending=limit<total;
      var done=!!(pagination.done&&!localPending&&!pagination.loading);
      sentinel.hidden=done;
      sentinel.classList.toggle('is-loading',!!pagination.loading);
      sentinel.classList.toggle('is-done',done);
      sentinel.setAttribute('aria-busy',pagination.loading?'true':'false');
      if(window.__happyadHomePaginationObserverV694){
        try{if(done)window.__happyadHomePaginationObserverV694.unobserve(sentinel);else window.__happyadHomePaginationObserverV694.observe(sentinel);}catch(_e){}
      }
    }catch(_e){}
  }
  function schedulePagination(delay){
    clearTimeout(pagination.timer);
    pagination.timer=setTimeout(function(){pagination.timer=0;maybeLoadMore();},Math.max(120,Number(delay)||180));
  }
  function releasePagination(recheck,delay){
    pagination.cycle=false;
    var mustRecheck=!!recheck||pagination.pending;
    pagination.pending=false;
    if(mustRecheck)schedulePagination(delay||180);
  }
  function releasePaginationAfterPaint(recheck){
    var done=function(){releasePagination(recheck,190);};
    try{requestAnimationFrame(function(){requestAnimationFrame(done);});}catch(_e){setTimeout(done,80);}
  }

  async function loadMoreRemote(){
    if(pagination.loading||pagination.done)return false;
    if(!bridge)return false;
    pagination.loading=true;updatePaginationState();
    var visibleAdded=false,rawAdded=0,loops=0,lastError=null;
    try{
      if(!pagination.seeded){
        try{await bcall('ensureRemoteSeed');}catch(_seedErr){}
        if(!pagination.seeded)return false;
      }
      while(!pagination.done&&!visibleAdded&&loops<5){
        loops++;
        var beforeCursor=pagination.cursor&&Object.assign({},pagination.cursor);
        var beforeVisible=Number(bcall('visibleTotal')||0);
        var beforeRows=bcall('getRows')||[];
        var beforeIds=new Set(beforeRows.map(function(x){return idOf(x);}));
        var result=await bcall('fetchPage',pagination.cursor,Number(bcall('getRemoteProbe')||21));
        if(result&&result.error)throw result.error;
        var probeRows=(result&&result.rows)||[];
        var remotePage=Math.max(1,Number(bcall('getRemotePage')||20));
        var rows=(result&&Array.isArray(result.page)&&result.page.length)?result.page:probeRows.slice(0,remotePage);
        if(!rows.length){pagination.done=true;break;}
        var nextCursor=(result&&result.cursor)||cursorFromRows(rows);
        /* Une réponse réseau peut arriver pendant que le doigt a repris le scroll.
           Aucune fusion, sérialisation locale ni enrichissement ne commence avant
           le retour au repos : le réseau n'a jamais priorité sur le geste. */
        await whenIdle();
        if(nextCursor){pagination.cursor=nextCursor;pagination.seeded=true;}
        pagination.nextOffset+=rows.length;
        if(result&&result.done===true)pagination.done=true;
        else if(!(result&&result.done===false)&&probeRows.length<=remotePage)pagination.done=true;
        if(beforeCursor&&nextCursor&&cursorCompare(beforeCursor,nextCursor)===0){pagination.done=true;break;}

        var fresh=bcall('mapRows',rows)||rows;
        var merged=appendPage(beforeRows,fresh);
        bcall('setRows',merged);
        var saved=bcall('saveRows',bcall('getRows')||merged);
        if(Array.isArray(saved))bcall('setRows',cleanRows(saved));
        bcall('writeConfirmed',bcall('getRows')||merged);
        var current=bcall('getRows')||[];
        rawAdded+=current.filter(function(x){return !beforeIds.has(idOf(x));}).length;
        var afterVisible=Number(bcall('visibleTotal')||0);
        visibleAdded=afterVisible>beforeVisible;

        if(visibleAdded){
          var step=Math.max(1,Number(bcall('getProgressiveStep')||5));
          var currentLimit=Number(bcall('getRenderLimit')||0);
          bcall('setRenderLimit',Math.min(afterVisible,Math.max(currentLimit+step,beforeVisible+1)));
          bcall('invalidateRender');
          requestRender({feedOnly:true,reason:'pagination-remote-feed-v2'});
        }
        try{bcall('primeActions',fresh);}catch(_e){}
        try{bcall('enrichFresh',fresh);}catch(_e){}
      }
    }catch(e){lastError=e;try{console.warn('home feed master load more',e);}catch(_e){}}
    finally{
      pagination.loading=false;ensureScrollLoader();updatePaginationState();
      if(!lastError&&!visibleAdded&&!pagination.done&&rawAdded===0)pagination.pending=true;
    }
    return visibleAdded;
  }

  function maybeLoadMore(){
    try{
      if(bcall('allowPagination')===false)return;
      if(pagination.cycle){pagination.pending=true;return;}
      /* Tant qu'une tête distante autoritaire attend le retour en haut, aucune
         ancienne page du cache ne doit être ajoutée sous les cartes visibles. */
      if(bcall('hasPendingHead')){
        pagination.pending=true;
        if((window.scrollY||0)<=100&&!bcall('isScrollActive')){
          Promise.resolve(bcall('applyPendingHead')).finally(function(){schedulePagination(260);});
        }else schedulePagination(260);
        return;
      }
      bcall('maintainWindow');
      var list=bcall('getListNode');if(!list)return;
      var vh=Math.max(window.innerHeight||0,document.documentElement.clientHeight||0,600);
      var bottom=list.getBoundingClientRect().bottom;
      var preloadDistance=Math.max(420,Math.min(620,Math.round(vh*.6)));
      if(bottom>vh+preloadDistance)return;
      if(bcall('isScrollActive')||hasPendingRender()){
        pagination.pending=true;schedulePagination(180);return;
      }

      pagination.cycle=true;
      var total=Number(bcall('visibleTotal')||0);
      var limit=Number(bcall('getRenderLimit')||0);
      if(limit<total){
        var step=Math.max(1,Number(bcall('getProgressiveStep')||5));
        bcall('setRenderLimit',Math.min(total,limit+step));
        bcall('invalidateRender');requestRender({feedOnly:true,reason:'pagination-local-feed-v2'});
        updatePaginationState();releasePaginationAfterPaint(true);return;
      }
      Promise.resolve(loadMoreRemote()).then(function(){releasePagination(true,220);}).catch(function(){releasePagination(false,220);});
    }catch(e){releasePagination(false,180);}
  }

  function ensurePaginationSentinel(){
    try{
      var list=bcall('getListNode');if(!list)return null;
      var sentinel=document.getElementById('happyadHomePaginationSentinelV694');
      if(!sentinel){
        sentinel=document.createElement('div');sentinel.id='happyadHomePaginationSentinelV694';sentinel.setAttribute('aria-hidden','true');
        sentinel.className='happyadHomeProgressiveSentinelV764';sentinel.innerHTML='<i aria-hidden="true"></i>';
      }
      if(sentinel.parentNode!==list||sentinel!==list.lastElementChild)list.appendChild(sentinel);
      if(!window.__happyadHomePaginationObserverV694&&'IntersectionObserver' in window){
        window.__happyadHomePaginationObserverV694=new IntersectionObserver(function(entries){
          if(entries.some(function(entry){return entry.isIntersecting;}))maybeLoadMore();
        },{root:null,rootMargin:'0px 0px 360px 0px',threshold:0});
      }
      if(window.__happyadHomePaginationObserverV694){
        if(window.__happyadHomePaginationSentinelNodeV764&&window.__happyadHomePaginationSentinelNodeV764!==sentinel){try{window.__happyadHomePaginationObserverV694.unobserve(window.__happyadHomePaginationSentinelNodeV764);}catch(_e){}}
        window.__happyadHomePaginationSentinelNodeV764=sentinel;
        try{window.__happyadHomePaginationObserverV694.observe(sentinel);}catch(_e){}
      }
      updatePaginationState();return sentinel;
    }catch(_e){return null;}
  }
  function ensureScrollLoader(){
    ensurePaginationSentinel();
    if(window.__happyadHomeScrollLoaderBoundV2)return;
    window.__happyadHomeScrollLoaderBoundV2=true;
    window.addEventListener('resize',function(){schedulePagination(140);});
    window.addEventListener('pageshow',function(e){if(!e||!e.persisted)return;setTimeout(function(){ensurePaginationSentinel();schedulePagination(140);},120);},{passive:true});
  }

  var api={
    version:VERSION,
    idOf:idOf,
    createdMs:createdMs,
    compareDesc:compareDesc,
    renderable:renderable,
    clean:cleanRows,
    seedCache:seedCache,
    replaceHead:replaceHead,
    appendPage:appendPage,
    patchExisting:patchExisting,
    remove:remove,
    cardKey:cardKey,
    publicMediaUrl:publicMediaUrl,
    normalizePost:normalizePost,
    normalizeRows:normalizeRows,
    explicitAlbumKey:explicitAlbumKey,
    fallbackAlbumKey:fallbackAlbumKey,
    marketplaceHomeVisible:marketplaceHomeVisible,
    groupPosts:groupPosts,
    cursorDate:cursorDate,
    cursorFromRows:cursorFromRows,
    cursorCompare:cursorCompare,
    applyCursor:applyCursor,
    connectRuntime:connectRuntime,
    whenIdle:whenIdle,
    resetRuntime:resetRuntime,
    seedPagination:seedPagination,
    paginationState:paginationState,
    requestRender:requestRender,
    queueRender:queueRender,
    flushRender:flushRender,
    renderWhenIdle:renderWhenIdle,
    hasPendingRender:hasPendingRender,
    updatePaginationState:updatePaginationState,
    schedulePagination:schedulePagination,
    releasePagination:releasePagination,
    releasePaginationAfterPaint:releasePaginationAfterPaint,
    loadMoreRemote:loadMoreRemote,
    maybeLoadMore:maybeLoadMore,
    ensurePaginationSentinel:ensurePaginationSentinel,
    ensureScrollLoader:ensureScrollLoader
  };

  window.HappyHomeFeedV1=api;
  try{if(window.HappyMasterRegistry)window.HappyMasterRegistry.register('home-feed-v1',{file:'core/home-feed-master-v1.js',responsibility:'source unique, normalisation, albums, ordre, rendu et pagination du fil Accueil',active:true,version:VERSION});}catch(_e){}
})();
