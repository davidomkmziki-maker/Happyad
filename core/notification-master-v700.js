(function(){
  'use strict';
  if(window.__HAPPYAD_NOTIFICATION_MASTER_V1__) return;
  window.__HAPPYAD_NOTIFICATION_MASTER_V1__ = true;

  var VERSION='V700_NOTIFICATION_INFINITE_SCROLL_DATA';
  var TABLE='happyad_notifications';
  var CACHE_PREFIX='happyad-notifications-cache-v1:';
  var INITIAL_LIMIT=100;
  var PAGE_LIMIT=60;
  var MAX_ROWS=500;
  var rows=[];
  var unreadTotal=0;
  var currentUserId='';
  var channel=null;
  var refreshPromise=null;
  var loadMorePromise=null;
  var hasMore=true;
  var retryTimer=0;
  var authBound=false;
  var minuteTimer=0;
  var generation=0;

  function clean(value){return String(value==null?'':value).trim();}
  function normalizeProfileBadge(value){
    var raw=clean(value);
    var low=raw.toLowerCase();
    if(!raw||['aucun','none','false','0','1','true','null','undefined','no','non'].indexOf(low)>=0)return '';
    return raw;
  }
  function isUuid(value){return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(clean(value));}
  function finite(value){var n=Number(value);return Number.isFinite(n)?n:0;}
  function clone(value){try{return JSON.parse(JSON.stringify(value));}catch(_e){return value;}}
  function escapeHtml(value){
    return String(value==null?'':value)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;');
  }
  function client(){
    try{
      if(typeof window.happyadSb==='function')return window.happyadSb();
      if(window.happyadSupabase)return window.happyadSupabase;
      if(window.supabaseClient)return window.supabaseClient;
      if(window.supabase&&typeof window.supabase.createClient==='function'){
        window.happyadSupabase=window.supabase.createClient(
          window.HAPPYAD_SUPABASE_URL,
          window.HAPPYAD_SUPABASE_KEY,
          {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}
        );
        return window.happyadSupabase;
      }
    }catch(_e){}
    return null;
  }
  function frame(){return document.getElementById('happyadNotificationCenterFrame');}
  function cacheKey(uid){return CACHE_PREFIX+clean(uid).toLowerCase();}
  function readCache(uid){
    if(!isUuid(uid))return null;
    try{
      var parsed=JSON.parse(localStorage.getItem(cacheKey(uid))||'null');
      if(!parsed||parsed.user_id!==uid||!Array.isArray(parsed.rows))return null;
      return parsed;
    }catch(_e){return null;}
  }
  function writeCache(){
    if(!isUuid(currentUserId))return;
    try{
      localStorage.setItem(cacheKey(currentUserId),JSON.stringify({
        version:VERSION,
        user_id:currentUserId,
        rows:rows.slice(0,MAX_ROWS),
        unread_total:unreadTotal,
        has_more:hasMore===true,
        saved_at:Date.now()
      }));
    }catch(_e){}
  }
  function clearLocalState(){
    rows=[];
    unreadTotal=0;
    hasMore=true;
    renderBadge(0);
    publish();
  }
  function actorSnapshot(row){
    var value=row&&row.actor_snapshot;
    if(value&&typeof value==='object'&&!Array.isArray(value))return value;
    if(typeof value==='string'){
      try{var parsed=JSON.parse(value);if(parsed&&typeof parsed==='object')return parsed;}catch(_e){}
    }
    return {};
  }
  function metadata(row){
    var value=row&&row.metadata;
    if(value&&typeof value==='object'&&!Array.isArray(value))return value;
    if(typeof value==='string'){
      try{var parsed=JSON.parse(value);if(parsed&&typeof parsed==='object')return parsed;}catch(_e){}
    }
    return {};
  }
  function normalizeSystemMessage(value){
    var text=clean(value);
    if(!text)return '';
    return text
      .replace(/\s+par\s+l[’']équipe\s+HAPPYAD(?=[.!,;:?]|$)/gi,'')
      .replace(/\s+par\s+les\s+équipes?\s+HAPPYAD(?=[.!,;:?]|$)/gi,'')
      .replace(/\s+par\s+HAPPYAD(?=[.!,;:?]|$)/gi,'')
      .replace(/\s+([.!,;:?])/g,'$1')
      .replace(/\s{2,}/g,' ')
      .trim();
  }
  function relativeTime(value){
    var stamp=Date.parse(value||'');
    if(!Number.isFinite(stamp))return '';
    var diff=Math.max(0,Date.now()-stamp);
    var sec=Math.floor(diff/1000);
    if(sec<45)return 'À l’instant';
    var min=Math.floor(sec/60);
    if(min<60)return 'Il y a '+min+' min';
    var hour=Math.floor(min/60);
    if(hour<24)return 'Il y a '+hour+' h';
    var day=Math.floor(hour/24);
    if(day===1)return 'Hier';
    if(day<7)return 'Il y a '+day+' jours';
    try{return new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short',year:day>330?'numeric':undefined}).format(new Date(stamp));}
    catch(_e){return new Date(stamp).toLocaleDateString('fr-FR');}
  }
  function mapRow(row){
    row=row&&typeof row==='object'?row:{};
    var snap=actorSnapshot(row);
    var meta=metadata(row);
    var actorId=clean(row.actor_id||snap.id);
    var name=clean(snap.full_name||snap.display_name||snap.name||snap.username)||'Un utilisateur';
    var username=clean(snap.username||snap.handle).replace(/^@+/, '');
    var avatar=clean(snap.avatar_url||snap.avatar||snap.photo_url);
    var badge=normalizeProfileBadge(snap.badge||snap.badge_url||snap.verified_badge);
    var type=clean(row.notification_type).toLowerCase()||'activity';
    var entityType=clean(row.entity_type).toLowerCase();
    var contentType=clean(meta.content_type||meta.media_type||meta.post_type||(entityType==='story'?'story':'')).toLowerCase()||'post';
    var isStoryLike=type==='story_like'||type==='like_story'||(type==='like'&&(entityType==='story'||contentType==='story'));
    var category=isStoryLike?'like':(type==='reply'?'comment':((type==='share'||type==='repost')?'activity':type));
    var isPublicationType=!isStoryLike&&(type==='like'||type==='comment'||type==='reply'||type==='favorite'||type==='share'||type==='repost');
    var postId=isPublicationType?clean(row.post_id||(entityType==='post'?row.entity_id:'')):'';
    var storyId=clean(meta.story_id||meta.storyId||(entityType==='story'?row.entity_id:'')||(contentType==='story'?row.post_id:''));
    var commentId=clean(row.comment_id||meta.comment_id||(entityType==='comment'?row.entity_id:''));
    var parentCommentId=clean(meta.parent_id||meta.parent_comment_id);
    var bodyHtml='';
    if(isStoryLike)bodyHtml='<strong>'+escapeHtml(name)+'</strong> a aimé votre story.';
    else if(type==='like')bodyHtml='<strong>'+escapeHtml(name)+'</strong> a aimé votre publication.';
    else if(type==='comment')bodyHtml='<strong>'+escapeHtml(name)+'</strong> a commenté votre publication.';
    else if(type==='reply')bodyHtml='<strong>'+escapeHtml(name)+'</strong> a répondu à votre commentaire.';
    else if(type==='follow')bodyHtml='<strong>'+escapeHtml(name)+'</strong> s’est abonné à votre profil.';
    else if(type==='favorite')bodyHtml='<strong>'+escapeHtml(name)+'</strong> a ajouté votre publication aux favoris.';
    else if(type==='repost')bodyHtml='<strong>'+escapeHtml(name)+'</strong> a republié votre publication.';
    else if(type==='share'){var shareUnits=Math.max(1,finite(meta.share_units||1));bodyHtml='<strong>'+escapeHtml(name)+'</strong> a partagé votre publication'+(shareUnits>1?' '+shareUnits+' fois.':'.');}
    else {
      var fallbackBody=row.body||row.title||'Nouvelle activité HAPPYAD';
      bodyHtml=escapeHtml(type==='system'?normalizeSystemMessage(fallbackBody):fallbackBody);
    }

    return {
      id:clean(row.id),
      notification_id:clean(row.id),
      category:category,
      notification_type:type,
      action:isStoryLike?'story_like':type,
      profileId:actorId,
      actor_id:actorId,
      profileName:name,
      actor_name:name,
      username:username,
      handle:username?('@'+username):'',
      avatar:avatar,
      avatar_url:avatar,
      profileBadge:badge,
      profile_badge:badge,
      user_badge:badge,
      profileBadgeValue:badge,
      verified:!!badge,
      publicationId:postId,
      post_id:postId,
      publicationType:contentType,
      media_type:contentType,
      publicationAction:isStoryLike?'story_like':type,
      storyId:storyId,
      story_id:storyId,
      storyOwnerId:clean(meta.owner_id||meta.user_id||meta.creator_id),
      story_owner_id:clean(meta.owner_id||meta.user_id||meta.creator_id),
      commentId:commentId,
      comment_id:commentId,
      parentCommentId:parentCommentId,
      parent_comment_id:parentCommentId,
      thumb:clean(row.preview_url),
      preview_url:clean(row.preview_url),
      html:bodyHtml,
      title:clean(row.title),
      body:type==='system'?normalizeSystemMessage(row.body):clean(row.body),
      time:relativeTime(row.created_at),
      created_at:row.created_at,
      unread:row.is_read!==true,
      is_read:row.is_read===true,
      badge:(type==='like'||isStoryLike)?'heart':undefined,
      badgeColor:(type==='like'||isStoryLike)?'pink':undefined,
      metadata:meta
    };
  }
  function mappedRows(){
    return rows.slice().sort(function(a,b){
      var at=Date.parse(a&&a.created_at||'')||0;
      var bt=Date.parse(b&&b.created_at||'')||0;
      return bt-at;
    }).map(mapRow);
  }
  function renderBadge(total){
    total=Math.max(0,finite(total));
    unreadTotal=total;
    var badge=document.getElementById('homeNotificationBadge');
    var button=document.getElementById('homeNotificationBtn');
    if(badge){
      if(total>0){
        badge.textContent=total>99?'99+':String(total);
        badge.hidden=false;
        badge.style.display='grid';
      }else{
        badge.textContent='';
        badge.hidden=true;
        badge.style.display='none';
      }
    }
    if(button){
      button.setAttribute('aria-label',total>0?('Notifications, '+total+' non lue'+(total>1?'s':'')):'Notifications');
      button.setAttribute('data-happyad-unread-total',String(total));
    }
    return total;
  }
  function send(type,payload){
    try{
      var fr=frame();
      if(fr&&fr.contentWindow)fr.contentWindow.postMessage({type:type,payload:payload||{}},'*');
    }catch(_e){}
  }
  function publish(){
    var payload={
      notifications:mappedRows(),
      suggestions:[],
      unreadTotal:unreadTotal,
      userId:currentUserId,
      source:'happyad-notification-master',
      version:VERSION,
      updatedAt:Date.now(),
      hasMore:hasMore===true,
      loadedCount:rows.length
    };
    send('HAPPYAD_NOTIFICATIONS_SET_DATA',payload);
    try{window.dispatchEvent(new CustomEvent('HAPPYAD_NOTIFICATIONS_DATA',{detail:clone(payload)}));}catch(_e){}
    return payload;
  }
  function normalizeRows(nextRows){
    var seen=Object.create(null);
    return (Array.isArray(nextRows)?nextRows:[]).filter(function(row){
      var id=clean(row&&row.id);
      if(!id||seen[id])return false;
      if(currentUserId&&clean(row.recipient_id)&&clean(row.recipient_id)!==currentUserId)return false;
      seen[id]=true;
      return true;
    }).sort(function(a,b){
      return (Date.parse(b&&b.created_at||'')||0)-(Date.parse(a&&a.created_at||'')||0);
    }).slice(0,MAX_ROWS);
  }
  function applyRows(nextRows,nextUnread,options){
    options=options||{};
    var incoming=Array.isArray(nextRows)?nextRows:[];
    rows=normalizeRows(options.append===true?rows.concat(incoming):incoming);
    if(typeof options.hasMore==='boolean')hasMore=options.hasMore;
    var computed=unreadFromRows(rows);
    var resolved=nextUnread==null?computed:Math.max(computed,Math.max(0,finite(nextUnread)));
    renderBadge(resolved);
    writeCache();
    publish();
  }
  async function sessionUser(c){
    if(!c||!c.auth)return null;
    try{
      var result=await c.auth.getSession();
      return result&&result.data&&result.data.session&&result.data.session.user||null;
    }catch(_e){return null;}
  }
  async function fetchRows(c,before,limit){
    var result=null;
    limit=Math.max(1,Math.min(MAX_ROWS,finite(limit)||INITIAL_LIMIT));
    before=clean(before)||null;
    if(c&&typeof c.rpc==='function'){
      result=await c.rpc('happyad_notifications_list',{
        p_limit:limit,
        p_before:before,
        p_type:null,
        p_unread_only:false
      });
      if(result&&!result.error&&Array.isArray(result.data))return result.data;
    }
    if(!c||typeof c.from!=='function')throw (result&&result.error)||new Error('Client Supabase indisponible');
    var query=c.from(TABLE)
      .select('*')
      .eq('recipient_id',currentUserId)
      .order('created_at',{ascending:false})
      .limit(limit);
    if(before)query=query.lt('created_at',before);
    result=await query;
    if(result&&result.error)throw result.error;
    return Array.isArray(result&&result.data)?result.data:[];
  }
  function oldestCursor(){
    var oldest='';
    var oldestStamp=Infinity;
    rows.forEach(function(row){
      var value=clean(row&&row.created_at);
      var stamp=Date.parse(value||'');
      if(value&&Number.isFinite(stamp)&&stamp<oldestStamp){oldest=value;oldestStamp=stamp;}
    });
    return oldest;
  }
  function unreadFromRows(list){
    return (list||[]).reduce(function(total,row){return total+(row&&row.is_read===true?0:1);},0);
  }
  function rpcCountValue(data){
    if(typeof data==='number'||typeof data==='string')return Math.max(0,finite(data));
    if(Array.isArray(data)&&data.length){
      var first=data[0];
      if(typeof first==='number'||typeof first==='string')return Math.max(0,finite(first));
      if(first&&typeof first==='object'){
        var keys=Object.keys(first);
        if(keys.length)return Math.max(0,finite(first[keys[0]]));
      }
    }
    return null;
  }
  async function fetchUnread(c,fallbackRows){
    var localCount=unreadFromRows(fallbackRows);

    /*
     * V680 : la table est la source finale du badge. Certaines anciennes
     * versions du RPC happyad_notifications_unread_count peuvent encore
     * compter une ancienne colonne et retourner 0 alors que les lignes
     * non lues existent réellement. Le count direct évite ce conflit.
     */
    try{
      var direct=await c.from(TABLE)
        .select('id',{count:'exact',head:true})
        .eq('recipient_id',currentUserId)
        .eq('is_read',false);
      if(direct&&direct.error)throw direct.error;
      if(direct&&Number.isFinite(Number(direct.count))){
        return Math.max(localCount,Math.max(0,Number(direct.count)));
      }
    }catch(_directError){}

    /* RPC conservé seulement comme secours pour les anciennes bases. */
    try{
      var result=await c.rpc('happyad_notifications_unread_count',{});
      if(result&&result.error)throw result.error;
      var rpcCount=rpcCountValue(result&&result.data);
      if(rpcCount!=null)return Math.max(localCount,rpcCount);
    }catch(_rpcError){}
    return localCount;
  }
  function scheduleRefresh(delay){
    clearTimeout(retryTimer);
    retryTimer=setTimeout(function(){refresh({reason:'scheduled'}).catch(function(){});},Math.max(0,finite(delay)));
  }
  async function refresh(options){
    options=options||{};
    if(refreshPromise&&!options.force)return refreshPromise;
    var myGeneration=++generation;
    refreshPromise=(async function(){
      var c=client();
      if(!c)throw new Error('Supabase non disponible');
      var user=await sessionUser(c);
      var uid=clean(user&&user.id);
      if(!isUuid(uid)){
        currentUserId='';
        await stopRealtime();
        clearLocalState();
        return [];
      }
      if(uid!==currentUserId){
        currentUserId=uid;
        var cached=readCache(uid);
        if(cached){hasMore=cached.has_more!==false;applyRows(cached.rows,cached.unread_total,{hasMore:hasMore});}
        else clearLocalState();
        await startRealtime(uid);
      }
      var next=await fetchRows(c,null,INITIAL_LIMIT);
      var preserveOlder=rows.length>INITIAL_LIMIT;
      var firstPageHasMore=next.length>=INITIAL_LIMIT;
      if(!preserveOlder)hasMore=firstPageHasMore;
      var count=await fetchUnread(c,next);
      if(myGeneration!==generation&&options.force!==true)return rows;
      applyRows(next,count,{append:preserveOlder,hasMore:hasMore});
      return next;
    })().catch(function(error){
      scheduleRefresh(1800);
      try{console.warn('[HAPPYAD Notifications] refresh',error&&error.message||error);}catch(_e){}
      return rows;
    }).finally(function(){refreshPromise=null;});
    return refreshPromise;
  }
  async function loadMore(){
    if(loadMorePromise)return loadMorePromise;
    if(!hasMore||!currentUserId||rows.length>=MAX_ROWS){hasMore=false;publish();return rows;}
    loadMorePromise=(async function(){
      var c=client();
      if(!c)throw new Error('Supabase non disponible');
      var before=oldestCursor();
      if(!before){hasMore=false;publish();return rows;}
      var next=await fetchRows(c,before,PAGE_LIMIT);
      hasMore=next.length>=PAGE_LIMIT&&rows.length+next.length<MAX_ROWS;
      applyRows(next,unreadTotal,{append:true,hasMore:hasMore});
      return rows;
    })().catch(function(error){
      try{console.warn('[HAPPYAD Notifications] pagination',error&&error.message||error);}catch(_e){}
      publish();
      return rows;
    }).finally(function(){loadMorePromise=null;});
    return loadMorePromise;
  }
  async function stopRealtime(){
    var c=client();
    var old=channel;
    channel=null;
    if(old&&c&&typeof c.removeChannel==='function'){
      try{await c.removeChannel(old);}catch(_e){}
    }
  }
  async function startRealtime(uid){
    uid=clean(uid);
    if(!isUuid(uid))return stopRealtime();
    if(channel&&channel.__happyadUid===uid)return channel;
    await stopRealtime();
    var c=client();
    if(!c||typeof c.channel!=='function')return null;
    var name='happyad-notifications-'+uid+'-'+Date.now();
    var ch=c.channel(name);
    ch.__happyadUid=uid;
    ch.on('postgres_changes',{
      event:'*',
      schema:'public',
      table:TABLE,
      filter:'recipient_id=eq.'+uid
    },function(payload){
      if(uid!==currentUserId)return;
      try{
        var eventType=clean(payload&&payload.eventType).toUpperCase();
        var next=payload&&payload.new;
        var old=payload&&payload.old;
        if(eventType==='INSERT'&&next&&clean(next.id)){
          rows=[next].concat(rows.filter(function(row){return clean(row.id)!==clean(next.id);})).slice(0,MAX_ROWS);
          if(next.is_read!==true)renderBadge(unreadTotal+1);
          writeCache();publish();
        }else if(eventType==='UPDATE'&&next&&clean(next.id)){
          var found=false;
          rows=rows.map(function(row){if(clean(row.id)===clean(next.id)){found=true;return next;}return row;});
          if(!found)rows.unshift(next);
          var localCount=rows.reduce(function(total,row){return total+(row.is_read===true?0:1);},0);
          renderBadge(localCount);writeCache();publish();
        }else if(eventType==='DELETE'&&old&&clean(old.id)){
          rows=rows.filter(function(row){return clean(row.id)!==clean(old.id);});
          var remaining=rows.reduce(function(total,row){return total+(row.is_read===true?0:1);},0);
          renderBadge(remaining);writeCache();publish();
        }
      }catch(_e){}
      scheduleRefresh(120);
    });
    channel=ch;
    try{
      ch.subscribe(function(status){
        status=clean(status).toUpperCase();
        if(status==='CHANNEL_ERROR'||status==='TIMED_OUT'||status==='CLOSED')scheduleRefresh(1800);
      });
    }catch(_e){scheduleRefresh(1800);}
    return ch;
  }
  function optimisticRead(id){
    id=clean(id);
    if(!id)return false;
    var changed=false;
    rows=rows.map(function(row){
      if(clean(row.id)!==id||row.is_read===true)return row;
      changed=true;
      var copy=Object.assign({},row,{is_read:true,read_at:row.read_at||new Date().toISOString(),updated_at:new Date().toISOString()});
      return copy;
    });
    if(changed){renderBadge(Math.max(0,unreadTotal-1));writeCache();publish();}
    return changed;
  }
  async function markRead(id){
    id=clean(id);
    if(!isUuid(id))return false;
    optimisticRead(id);
    var c=client();
    if(!c||typeof c.rpc!=='function'){scheduleRefresh(1200);return false;}
    try{
      var result=await c.rpc('happyad_notification_mark_read',{p_notification_id:id});
      if(result&&result.error)throw result.error;
      scheduleRefresh(60);
      return result&&result.data!==false;
    }catch(_e){scheduleRefresh(600);return false;}
  }
  async function markAllRead(){
    if(!currentUserId)return 0;
    var changed=0;
    rows=rows.map(function(row){
      if(row.is_read===true)return row;
      changed++;
      return Object.assign({},row,{is_read:true,read_at:row.read_at||new Date().toISOString(),updated_at:new Date().toISOString()});
    });
    renderBadge(0);writeCache();publish();
    var c=client();
    if(!c||typeof c.rpc!=='function'){scheduleRefresh(1200);return changed;}
    try{
      var result=await c.rpc('happyad_notifications_mark_all_read',{});
      if(result&&result.error)throw result.error;
      scheduleRefresh(60);
      return finite(result&&result.data);
    }catch(_e){scheduleRefresh(600);return changed;}
  }
  function bindAuth(){
    if(authBound)return;
    var c=client();
    if(!c||!c.auth||typeof c.auth.onAuthStateChange!=='function')return;
    authBound=true;
    try{
      c.auth.onAuthStateChange(function(event,session){
        var uid=clean(session&&session.user&&session.user.id);
        if(!uid){currentUserId='';stopRealtime();clearLocalState();}
        scheduleRefresh(30);
      });
    }catch(_e){authBound=false;}
  }
  function onMessage(event){
    var data=event&&event.data;
    if(!data||typeof data!=='object')return;
    if(data.type==='HAPPYAD_NOTIFICATION_CENTER_READY'){
      publish();
      scheduleRefresh(20);
    }else if(data.type==='HAPPYAD_NOTIFICATION_MARK_READ'){
      markRead(data.notificationId||data.notification_id||(data.detail&&data.detail.notificationId));
    }else if(data.type==='HAPPYAD_NOTIFICATIONS_MARK_ALL_READ'){
      markAllRead();
    }else if(data.type==='HAPPYAD_NOTIFICATIONS_REQUEST_DATA'){
      publish();
      scheduleRefresh(20);
    }else if(data.type==='HAPPYAD_NOTIFICATIONS_LOAD_MORE'){
      loadMore();
    }
  }
  function restoreWarmBadge(){
    var uid='';
    try{uid=clean(localStorage.getItem('HAPPYAD_AUTH_UID'));}catch(_e){}
    if(!isUuid(uid))return false;
    var cached=readCache(uid);
    if(!cached)return false;
    var cachedRows=Array.isArray(cached.rows)?cached.rows:[];
    var cachedCount=Math.max(unreadFromRows(cachedRows),Math.max(0,finite(cached.unread_total)));
    renderBadge(cachedCount);
    return true;
  }
  function boot(){
    /* Ne jamais effacer visuellement le dernier compteur confirmé pendant
       que Supabase restaure silencieusement la session. */
    if(!restoreWarmBadge())renderBadge(0);
    bindAuth();
    refresh({reason:'boot'}).catch(function(){});
    setTimeout(bindAuth,900);
    clearInterval(minuteTimer);
    /* Realtime reste prioritaire. Ce contrôle léger couvre les téléphones
       où Android ou le réseau suspend momentanément le canal Realtime. */
    minuteTimer=setInterval(function(){
      if(document.hidden){publish();return;}
      refresh({reason:'silent-poll'}).catch(function(){});
    },30000);
  }

  window.addEventListener('message',onMessage,true);
  window.addEventListener('HAPPYAD_NOTIFICATION_CENTER_OPENED',function(){publish();scheduleRefresh(20);},true);
  window.addEventListener('focus',function(){scheduleRefresh(30);},true);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)scheduleRefresh(30);},true);
  window.addEventListener('online',function(){scheduleRefresh(30);},true);

  window.HappyNotificationMaster={
    version:VERSION,
    refresh:function(){return refresh({force:true,reason:'api'});},
    loadMore:loadMore,
    markRead:markRead,
    markAllRead:markAllRead,
    rows:function(){return clone(rows);},
    unread:function(){return unreadTotal;},
    userId:function(){return currentUserId;},
    hasMore:function(){return hasMore===true;}
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
