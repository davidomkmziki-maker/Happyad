/* HAPPYAD V724 — compteurs du Profil uniquement, séparés de la centrale Statistiques. */
(function(){
  'use strict';
  if(window.__HAPPYAD_PROFILE_COUNTS_MASTER_V724__)return;
  window.__HAPPYAD_PROFILE_COUNTS_MASTER_V724__=true;

  var VERSION='V724-profile-counts';
  var IDS={posts:['sPosts'],followers:['sFollowers'],following:['sFollowing'],likes:['sRating']};
  var currentUid='',stable=null,painting=false,observer=null,timer=0,channel=null,lastFetchAt=0,retries=0;

  function clean(v){return String(v==null?'':v).trim();}
  function readJson(key){try{return JSON.parse(localStorage.getItem(key)||'null');}catch(_e){return null;}}
  function cacheKey(uid){return 'HAPPYAD_PROFILE_STATS_SUPABASE_V678_'+clean(uid);}
  function isPublic(){try{return new URLSearchParams(location.search||'').get('public')==='1';}catch(_e){return false;}}
  function urlUid(){
    try{
      var q=new URLSearchParams(location.search||'');
      return clean(q.get('uid')||q.get('user_id')||q.get('profile_uid')||q.get('auth_user_id')||q.get('account_uid')||q.get('owner')||q.get('owner_id')||q.get('creator_id'));
    }catch(_e){return '';}
  }
  function objectUid(o){
    o=o||{};
    return clean(o.id||o.uid||o.user_id||o.userId||o.auth_user_id||o.account_uid||o.creator_id||o.creatorId||o.owner_id||o.ownerId||o.profile_uid);
  }
  function publicUid(){
    var u=urlUid();if(u)return u;
    try{
      var lock=window.HAPPYAD_PUBLIC_PROFILE_UID_LOCK;
      u=clean(lock&&(lock.uid||lock.currentUid||lock.value||lock.lockedUid));if(u)return u;
    }catch(_e){}
    try{u=clean(localStorage.getItem('HAPPYAD_PUBLIC_PROFILE_ACTIVE_UID')||localStorage.getItem('HAPPYAD_ACTIVE_PROFILE_UID'));if(u)return u;}catch(_e){}
    u=objectUid(readJson('HAPPYAD_ACTIVE_PROFILE'));if(u)return u;
    try{u=objectUid(window.__HAPPYAD_ACTIVE_PROFILE_RAM);if(u)return u;}catch(_e){}
    return '';
  }
  function ownUid(){
    var u='';
    try{u=objectUid(window.UserStore&&window.UserStore.data);if(u)return u;}catch(_e){}
    u=objectUid(readJson('HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL'));if(u)return u;
    u=objectUid(readJson('HAPPYAD_AUTH_USER'));if(u)return u;
    try{u=clean(localStorage.getItem('HAPPYAD_AUTH_UID')||localStorage.getItem('HAPPYAD_USER_ID'));if(u)return u;}catch(_e){}
    return '';
  }
  function resolveUid(){return isPublic()?publicUid():ownUid();}
  function client(){
    try{
      if(typeof window.happyadSb==='function'){var c=window.happyadSb();if(c)return c;}
      if(window.happyadSupabase)return window.happyadSupabase;
      if(window.supabase&&window.supabase.createClient&&window.HAPPYAD_SUPABASE_URL&&window.HAPPYAD_SUPABASE_KEY){
        window.happyadSupabase=window.supabase.createClient(window.HAPPYAD_SUPABASE_URL,window.HAPPYAD_SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
        return window.happyadSupabase;
      }
    }catch(_e){}
    return null;
  }
  function compact(n){
    n=Math.max(0,Number(n||0));
    try{if(typeof window.happyadCompactCount==='function')return window.happyadCompactCount(n);}catch(_e){}
    if(n>=1000000000)return (n/1000000000).toFixed(n>=10000000000?0:1).replace('.0','')+' B';
    if(n>=1000000)return (n/1000000).toFixed(n>=10000000?0:1).replace('.0','')+' M';
    if(n>=1000)return (n/1000).toFixed(n>=10000?0:1).replace('.0','')+' K';
    return String(Math.round(n));
  }
  function validStats(s,uid){
    if(!s||clean(s.uid)!==clean(uid))return false;
    return ['posts','followers','following','likes'].some(function(k){return Number.isFinite(Number(s[k]));});
  }
  function loadCache(uid){var s=readJson(cacheKey(uid));return validStats(s,uid)?s:null;}
  function saveCache(s){try{localStorage.setItem(cacheKey(s.uid),JSON.stringify(s));}catch(_e){}}
  function nodes(){
    var out=[];Object.keys(IDS).forEach(function(k){IDS[k].forEach(function(id){var el=document.getElementById(id);if(el)out.push({key:k,el:el});});});return out;
  }
  function paint(s,source){
    if(!validStats(s,currentUid))return;
    painting=true;
    try{
      nodes().forEach(function(x){
        if(!Number.isFinite(Number(s[x.key])))return;
        var text=compact(Number(s[x.key]));
        if(x.el.textContent!==text)x.el.textContent=text;
        x.el.dataset.happyadStatsUidV678=currentUid;
        x.el.dataset.happyadStatsSourceV678=source||'supabase';
        x.el.dataset.happyadStatsExactV678=String(Math.max(0,Number(s[x.key]||0)));
      });
    }finally{painting=false;}
  }
  function switchUid(uid){
    uid=clean(uid);if(!uid||uid===currentUid)return false;
    currentUid=uid;stable=loadCache(uid);lastFetchAt=0;retries=0;
    if(stable)paint(stable,'cache-supabase');
    reconnectRealtime();
    return true;
  }
  function guardUid(){
    var uid=resolveUid();
    if(uid&&uid!==currentUid)switchUid(uid);
    return currentUid;
  }
  function mergeField(base,key,value){if(Number.isFinite(Number(value)))base[key]=Math.max(0,Number(value));}
  async function exactCount(query){
    try{var r=await query;if(r&&r.error)throw r.error;return Number.isFinite(Number(r&&r.count))?Number(r.count):null;}catch(_e){return null;}
  }
  async function postCount(c,uid){
    var n=await exactCount(c.from('happyad_posts').select('id',{count:'exact',head:true}).eq('user_id',uid).is('deleted_at',null));
    if(n===null)n=await exactCount(c.from('happyad_posts').select('id',{count:'exact',head:true}).eq('user_id',uid));
    return n;
  }
  async function followCount(c,column,uid){return exactCount(c.from('happyad_follows').select('*',{count:'exact',head:true}).eq(column,uid));}
  async function postIds(c,uid){
    var all=[],from=0,size=500;
    for(var page=0;page<20;page++){
      var r;
      try{r=await c.from('happyad_posts').select('id').eq('user_id',uid).is('deleted_at',null).range(from,from+size-1);}catch(_e){r=null;}
      if(!r||r.error){try{r=await c.from('happyad_posts').select('id').eq('user_id',uid).range(from,from+size-1);}catch(_e2){r=null;}}
      if(!r||r.error)return all.length?all:null;
      var rows=Array.isArray(r.data)?r.data:[];rows.forEach(function(x){var id=clean(x&&x.id);if(id)all.push(id);});
      if(rows.length<size)break;from+=size;
    }
    return all;
  }
  async function actionLikeCount(c,ids,column){
    var total=0;
    for(var i=0;i<ids.length;i+=150){
      var chunk=ids.slice(i,i+150);
      var n=await exactCount(c.from('happyad_content_actions').select('*',{count:'exact',head:true}).in(column,chunk).eq('action_type','like').eq('liked',true));
      if(n===null)return null;total+=n;
    }
    return total;
  }
  async function likesCount(c,uid){
    try{
      var rpc=await c.rpc('happyad_profile_total_likes_v640',{target_uid:uid});
      if(rpc&&!rpc.error){
        var d=rpc.data,n=Array.isArray(d)?Number((d[0]||{}).total_likes!=null?(d[0]||{}).total_likes:d[0]):Number(d&&d.total_likes!=null?d.total_likes:d);
        if(Number.isFinite(n))return Math.max(0,n);
      }
    }catch(_e){}
    var ids=await postIds(c,uid);if(ids===null)return null;if(!ids.length)return 0;
    var n=await actionLikeCount(c,ids,'post_id');
    if(n===null)n=await actionLikeCount(c,ids,'content_id');
    return n;
  }
  async function fetchStats(force){
    var uid=guardUid(),c=client();
    if(!uid&&c&&c.auth){
      try{
        var au=null;
        if(c.auth.getSession){var gs=await c.auth.getSession();au=gs&&gs.data&&gs.data.session&&gs.data.session.user;}
        if(!au&&c.auth.getUser){var gu=await c.auth.getUser();au=gu&&gu.data&&gu.data.user;}
        if(au&&au.id){uid=clean(au.id);try{localStorage.setItem('HAPPYAD_AUTH_UID',uid);}catch(_e){}switchUid(uid);}
      }catch(_auth){}
    }
    if(!uid||!c){scheduleRetry();return null;}
    if(!force&&Date.now()-lastFetchAt<12000)return stable;
    lastFetchAt=Date.now();
    var requestedUid=uid;
    var results=await Promise.all([postCount(c,uid),followCount(c,'creator_id',uid),followCount(c,'follower_id',uid),likesCount(c,uid)]);
    if(resolveUid()&&resolveUid()!==requestedUid){switchUid(resolveUid());return null;}
    var next=stable&&clean(stable.uid)===uid?Object.assign({},stable):{uid:uid};
    mergeField(next,'posts',results[0]);mergeField(next,'followers',results[1]);mergeField(next,'following',results[2]);mergeField(next,'likes',results[3]);
    next.uid=uid;next.at=Date.now();next.source='supabase';
    if(validStats(next,uid)){stable=next;saveCache(next);paint(next,'supabase');}
    return stable;
  }
  function schedule(force,delay){
    clearTimeout(timer);timer=setTimeout(function(){fetchStats(!!force).catch(function(){scheduleRetry();});},Number(delay||350));
  }
  function scheduleRetry(){if(retries>=8)return;retries++;schedule(true,Math.min(4000,250*retries));}
  function reconnectRealtime(){
    var c=client();if(!c||!currentUid||typeof c.channel!=='function')return;
    try{if(channel&&typeof c.removeChannel==='function')c.removeChannel(channel);}catch(_e){}
    try{
      channel=c.channel('happyad_profile_stats_v678_'+currentUid+'_'+Date.now())
        .on('postgres_changes',{event:'*',schema:'public',table:'happyad_posts',filter:'user_id=eq.'+currentUid},function(){schedule(true,450);})
        .on('postgres_changes',{event:'*',schema:'public',table:'happyad_follows'},function(){schedule(true,550);})
        .on('postgres_changes',{event:'*',schema:'public',table:'happyad_content_actions'},function(){schedule(true,650);})
        .subscribe();
    }catch(_e){channel=null;}
  }
  function installObserver(){
    if(observer)return;
    var list=nodes();if(!list.length)return;
    observer=new MutationObserver(function(){
      if(painting)return;
      var before=currentUid;guardUid();
      if(before!==currentUid){schedule(true,80);return;}
      if(stable)requestAnimationFrame(function(){if(stable)paint(stable,'supabase-held');});
    });
    list.forEach(function(x){try{observer.observe(x.el,{childList:true,characterData:true,subtree:true});}catch(_e){}});
  }
  function boot(){
    guardUid();installObserver();
    if(currentUid){if(stable)paint(stable,'cache-supabase');schedule(true,80);}else scheduleRetry();
    document.addEventListener('happyad:profile-posts-rendered',function(){guardUid();installObserver();schedule(true,500);});
    document.addEventListener('happyad:profile-grid-ready',function(){guardUid();installObserver();schedule(true,350);});
    document.addEventListener('click',function(e){
      try{var b=e.target&&e.target.closest&&e.target.closest('[data-profile-act="like"],[data-card-act="like"],[data-act="like"],[data-delete-post],.profileDelete');if(b)schedule(true,2300);}catch(_e){}
    },true);
    window.addEventListener('pageshow',function(){guardUid();installObserver();schedule(true,250);});
    window.addEventListener('focus',function(){schedule(false,350);});
    window.addEventListener('storage',function(e){
      if(!e||/HAPPYAD_ACTIVE_PROFILE|HAPPYAD_PUBLIC_PROFILE_ACTIVE_UID|HAPPYAD_AUTH_UID|HAPPYAD_CENTRAL_USER/.test(e.key||'')){guardUid();schedule(true,120);}
    });
    setInterval(function(){if(document.visibilityState==='visible')schedule(false,100);},90000);
  }

  window.HappyProfileCountsV724={version:VERSION,refresh:function(){return fetchStats(true);},getUid:resolveUid,paint:function(){if(stable)paint(stable,'manual');},get:function(){return stable?Object.assign({},stable):null;}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
