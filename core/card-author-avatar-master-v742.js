(function(){
  'use strict';
  if(window.__HAPPYAD_CARD_AUTHOR_AVATAR_MASTER_V742__)return;
  window.__HAPPYAD_CARD_AUTHOR_AVATAR_MASTER_V742__=true;
  var VERSION='CARD_AUTHOR_AVATAR_MASTER_V742';
  var AUTHOR_KEY='HAPPYAD_AUTHOR_PROFILE_CACHE_V1';
  var USER_KEY='HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL';
  var CACHE_KEYS=[
    'HAPPYAD_HOME_BOOT_SNAPSHOT_V1','HAPPYAD_HOME_CONFIRMED_ORDER_V643','HAPPYAD_GLOBAL_POSTS_CACHE_V1','HAPPYAD_HOME_POSTS_CACHE_V1',
    'HAPPYAD_POSTS_CACHE_V1','HAPPYAD_CACHED_POSTS_V1','HAPPYAD_FEED_CACHE_V1','HAPPYAD_SEARCH_POSTS_FAST_CACHE_V1',
    'HAPPYAD_PUBLISH_POSTS_V2','HAPPYAD_PROFILE_POSTS_CACHE_V1','HAPPYAD_PROFILE_OWN_POSTS_STABLE_CACHE_V1','HAPPYAD_USER_POSTS_CACHE_V1'
  ];
  var busy=false,pending=false,lastFetch=0,observer=null;
  function clean(v){v=String(v==null?'':v).trim();return (!v||v==='null'||v==='undefined'||v==='[object Object]')?'':v;}
  function json(k,f){try{var v=JSON.parse(localStorage.getItem(k)||'null');return v==null?f:v;}catch(_e){return f;}}
  function write(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(_e){}}
  function uidOf(p){p=p||{};return clean(p.creatorId||p.creator_id||p.user_id||p.userId||p.ownerId||p.owner_id||p.author_id||p.authorId||p.profile_id||p.profileId||p.auth_user_id||p.authUserId||p.account_uid||p.accountUid||p.uid||p.uuid);}
  function avatarOf(p){p=p||{};return clean(p.avatar_url||p.avatarUrl||p.avatar||p.user_avatar||p.userAvatar||p.creator_avatar||p.creatorAvatar||p.author_avatar||p.authorAvatar||p.profile_photo_url||p.profilePhotoUrl||p.profile_photo||p.profilePhoto||p.profile_picture_url||p.profilePictureUrl||p.profile_picture||p.profilePicture||p.photo_url||p.photoUrl||p.photo||p.image_url||p.imageUrl||p.picture||p.profile_image_url||p.profileImageUrl||p.profile_avatar_url||p.profileAvatarUrl);}
  function nameOf(p){p=p||{};return clean(p.full_name||p.display_name||p.name||p.creatorName||p.creator_name||p.user_name||p.author_name||p.username||p.handle);}
  function handleOf(p){p=p||{};return clean(p.username||p.handle||p.user_name).replace(/^@+/,'');}
  function normBadge(v){v=clean(v).toLowerCase();return (!v||v==='aucun'||v==='none'||v==='null'||v==='undefined')?'':v;}
  function badgeOf(p){p=p||{};return normBadge(p.badge||p.user_badge||p.userBadge||p.profile_badge||p.badge_type||p.certification||p.verified_badge);}
  function currentUid(){return clean(localStorage.getItem('HAPPYAD_AUTH_UID')||uidOf(json(USER_KEY,{})));}
  function publicAvatar(v){
    v=clean(v).replace(/^url\(["']?(.*?)["']?\)$/i,'$1');var l=v.toLowerCase();if(!v||/^blob:/i.test(v)||v==='👤'||v==='🧑'||l==='none'||l==='null'||l==='undefined'||l.indexOf('placeholder')>-1)return '';
    if(/^https?:\/\//i.test(v)||/^data:image\/(?:png|jpe?g|webp|gif|avif);/i.test(v))return v;
    if(v.indexOf('/')<0&&!/\.(png|jpe?g|webp|gif|avif)(?:[?#]|$)/i.test(v))return '';
    var path=v.replace(/^\/+/, '').replace(/^happyad-media\//,'');
    try{var c=client();if(c&&c.storage&&c.storage.from){var r=c.storage.from('happyad-media').getPublicUrl(path);if(r&&r.data&&r.data.publicUrl)return r.data.publicUrl;}}catch(_e){}
    var base=clean(window.HAPPYAD_SUPABASE_URL||'https://txjjyhupbejgjcianrmr.supabase.co').replace(/\/+$/,'');
    return base+'/storage/v1/object/public/happyad-media/'+encodeURI(path);
  }
  function client(){try{return window.happyadSupabase||(typeof window.happyadSb==='function'&&window.happyadSb())||null;}catch(_e){return null;}}
  function stable(uid){return uid?json('HAPPYAD_PROFILE_IDENTITY_STABLE_V741:'+uid,{}):{};}
  function publicStable(uid){return uid?json('HAPPYAD_PUBLIC_PROFILE_STABLE_'+uid,{}):{};}
  function authorMap(){var m=json(AUTHOR_KEY,{});return m&&typeof m==='object'&&!Array.isArray(m)?m:{};}
  function localIdentity(uid){
    var cache=authorMap(),me=json(USER_KEY,{}),s=stable(uid),ps=publicStable(uid),a=cache[uid]||{};
    var own=uid&&uid===currentUid()?me:{};
    return normalize(Object.assign({},a,ps,s,own,{id:uid,user_id:uid}));
  }
  function normalize(p){p=p||{};var id=clean(p.id||p.user_id||p.uid||p.uuid||p.auth_user_id||p.account_uid||uidOf(p));if(!id)return null;var av=publicAvatar(avatarOf(p));return {id:id,user_id:id,name:nameOf(p)||'Utilisateur HAPPYAD',full_name:nameOf(p)||'Utilisateur HAPPYAD',handle:handleOf(p),username:handleOf(p),avatar:av,avatar_url:av,badge:badgeOf(p),role:clean(p.role)};}
  function better(old,next){old=old||{};next=next||{};return {id:next.id||old.id,user_id:next.user_id||old.user_id,name:(nameOf(next)&&!/^(utilisateur happyad|happyad)$/i.test(nameOf(next)))?nameOf(next):(nameOf(old)||'Utilisateur HAPPYAD'),full_name:(nameOf(next)&&!/^(utilisateur happyad|happyad)$/i.test(nameOf(next)))?nameOf(next):(nameOf(old)||'Utilisateur HAPPYAD'),handle:handleOf(next)||handleOf(old),username:handleOf(next)||handleOf(old),avatar:publicAvatar(avatarOf(next))||publicAvatar(avatarOf(old)),avatar_url:publicAvatar(avatarOf(next))||publicAvatar(avatarOf(old)),badge:badgeOf(next)||badgeOf(old),role:clean(next.role)||clean(old.role)};}
  function remember(rows){
    var map=authorMap();(rows||[]).forEach(function(raw){var n=normalize(raw);if(!n)return;map[n.id]=better(map[n.id],n);});
    write(AUTHOR_KEY,map);return map;
  }
  function arrays(){
    var out=[];try{if(Array.isArray(window.ALL_POSTS))out.push(window.ALL_POSTS);}catch(_e){}
    CACHE_KEYS.forEach(function(k){var v=json(k,null);if(Array.isArray(v))out.push(v);else if(v&&Array.isArray(v.posts))out.push(v.posts);else if(v&&Array.isArray(v.data))out.push(v.data);});return out;
  }
  function allPosts(){var out=[],seen={};arrays().forEach(function(arr){arr.forEach(function(p){var id=clean(p&&p.id);if(!id||seen[id])return;seen[id]=1;out.push(p);});});return out;}
  function postById(id){id=clean(id);if(!id)return null;var all=allPosts();for(var i=0;i<all.length;i++)if(clean(all[i]&&all[i].id)===id)return all[i];return null;}
  function patchPost(p,profile){
    if(!p||!profile)return p;var uid=uidOf(p)||profile.id;if(!uid||uid!==profile.id)return p;var n=better(normalize(p)||{id:uid,user_id:uid},profile),q=Object.assign({},p);
    q.creatorId=uid;q.creator_id=uid;q.user_id=uid;
    if(n.name){q.creatorName=n.name;q.creator_name=n.name;q.display_name=n.name;q.full_name=n.name;q.user_name=n.name;}
    if(n.handle){q.handle='@'+n.handle;q.username=n.handle;}
    if(n.avatar){q.avatar=n.avatar;q.avatar_url=n.avatar;q.creator_avatar=n.avatar;q.author_avatar=n.avatar;q.user_avatar=n.avatar;}
    if(n.badge){q.badge=n.badge;q.user_badge=n.badge;q.userBadge=n.badge;}
    return q;
  }
  function repairCaches(map){
    try{if(Array.isArray(window.ALL_POSTS))window.ALL_POSTS=window.ALL_POSTS.map(function(p){var u=uidOf(p),pr=map[u];return pr?patchPost(p,pr):p;});}catch(_e){}
    CACHE_KEYS.forEach(function(k){try{var v=json(k,null),shape='array',arr=v;if(v&&Array.isArray(v.posts)){arr=v.posts;shape='posts';}else if(v&&Array.isArray(v.data)){arr=v.data;shape='data';}if(!Array.isArray(arr))return;var changed=false,next=arr.map(function(p){var pr=map[uidOf(p)];if(!pr)return p;var n=patchPost(p,pr);if(JSON.stringify(n)!==JSON.stringify(p))changed=true;return n;});if(changed){if(shape==='posts'){v.posts=next;write(k,v);}else if(shape==='data'){v.data=next;write(k,v);}else write(k,next);}}catch(_e){}});
  }
  function initials(v){v=nameOf(v)||clean(v)||'H';return (v.charAt(0)||'H').toUpperCase();}
  function esc(v){return clean(v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function badgeHtml(v){try{return typeof window.badgeMarkHtml==='function'?window.badgeMarkHtml(v):'';}catch(_e){return '';}}
  function paintCard(card,p,profile){
    if(!card||!profile)return;var top=card.querySelector('.miniTop'),box=top&&top.querySelector('.avatar'),title=top&&top.querySelector('.creator b');if(!top)return;
    card.dataset.happyadOwnerUid=profile.id||uidOf(p)||'';
    if(box){var av=publicAvatar(profile.avatar);if(av){box.innerHTML='<img src="'+esc(av)+'" alt="">';var img=box.querySelector('img');if(img)img.onerror=function(){try{this.remove();box.textContent=initials(profile.name);box.dataset.avatarFailed='1';}catch(_e){}setTimeout(function(){hydrate(true);},400);};}else if(!box.querySelector('img'))box.textContent=initials(profile.name);}
    if(title&&profile.name){title.innerHTML=esc(profile.name)+badgeHtml(profile.badge);}
  }
  function paintAll(map){
    try{document.querySelectorAll('.miniCard[data-post-id]').forEach(function(card){var p=postById(card.dataset.postId),uid=uidOf(p)||clean(card.dataset.happyadOwnerUid),pr=map[uid]||localIdentity(uid);if(pr)paintCard(card,p||{},pr);});}catch(_e){}
  }
  function collectProfilesFromPosts(){var rows=[];allPosts().forEach(function(p){var uid=uidOf(p);if(!uid)return;rows.push(Object.assign({},p,{id:uid,user_id:uid}));});return rows;}
  function idsNeeding(map){var ids={};allPosts().forEach(function(p){var uid=uidOf(p);if(!uid)return;var pr=map[uid]||localIdentity(uid);if(!pr||!publicAvatar(pr.avatar)||!nameOf(pr)||/^(utilisateur happyad|happyad)$/i.test(nameOf(pr)))ids[uid]=1;});return Object.keys(ids).slice(0,120);}
  async function fetchProfiles(ids){
    var c=client();if(!c||!c.from||!ids.length)return [];
    var rows=[];
    for(var i=0;i<ids.length;i+=40){var part=ids.slice(i,i+40);try{var r=await c.from('profiles').select('*').in('id',part);if(r&&!r.error&&Array.isArray(r.data))rows=rows.concat(r.data);}catch(_e){}
      var missing=part.filter(function(id){return !rows.some(function(x){return clean(x&&x.id)===id||clean(x&&x.user_id)===id;});});
      if(missing.length){try{var r2=await c.from('profiles').select('*').in('user_id',missing);if(r2&&!r2.error&&Array.isArray(r2.data))rows=rows.concat(r2.data);}catch(_e2){}}
    }
    return rows;
  }
  async function hydrate(force){
    if(busy){pending=true;return;}var now=Date.now();if(!force&&now-lastFetch<1400){paintAll(authorMap());return;}busy=true;lastFetch=now;
    try{
      var localRows=collectProfilesFromPosts();var me=json(USER_KEY,{});if(uidOf(me)||clean(me.id))localRows.push(me);var map=remember(localRows);
      Object.keys(map).forEach(function(id){map[id]=better(localIdentity(id),map[id]);});
      repairCaches(map);paintAll(map);
      var ids=idsNeeding(map),remote=await fetchProfiles(ids);if(remote.length){map=remember(remote);Object.keys(map).forEach(function(id){map[id]=better(localIdentity(id),map[id]);});repairCaches(map);paintAll(map);}
    }catch(e){try{console.warn('HAPPYAD V742 card author hydrate',e);}catch(_e){}}finally{busy=false;if(pending){pending=false;setTimeout(function(){hydrate(true);},80);}}
  }
  var oldOwner=window.postOwnerData;
  if(typeof oldOwner==='function'&&!oldOwner.__v742){window.postOwnerData=function(p){var base={};try{base=oldOwner.apply(this,arguments)||{};}catch(_e){}var uid=uidOf(p)||clean(base.id||base.user_id),pr=uid?localIdentity(uid):null;return pr?better(base,pr):base;};window.postOwnerData.__v742=true;}
  var oldMap=window.mapHappyPost;
  if(typeof oldMap==='function'&&!oldMap.__v742){window.mapHappyPost=function(r){var p=oldMap.apply(this,arguments);var uid=uidOf(r)||uidOf(p);if(uid){p.creatorId=uid;p.creator_id=uid;p.user_id=uid;}var pr=uid?localIdentity(uid):null;return pr?patchPost(p,pr):p;};window.mapHappyPost.__v742=true;}
  var oldSlim=window.happyadSlimHomePostV407;
  if(typeof oldSlim==='function'&&!oldSlim.__v742){window.happyadSlimHomePostV407=function(p){var q=oldSlim.apply(this,arguments);var uid=uidOf(p)||uidOf(q);if(uid){q.creatorId=uid;q.creator_id=uid;q.user_id=uid;}var pr=uid?localIdentity(uid):null;return pr?patchPost(q,pr):q;};window.happyadSlimHomePostV407.__v742=true;}
  var oldCard=window.createCard;
  if(typeof oldCard==='function'&&!oldCard.__v742){window.createCard=function(p){var uid=uidOf(p),pr=uid?localIdentity(uid):null;if(pr)p=patchPost(p,pr);var card=oldCard.call(this,p);setTimeout(function(){paintCard(card,p,pr||localIdentity(uid));hydrate(false);},0);return card;};window.createCard.__v742=true;}
  function boot(){hydrate(true);setTimeout(function(){hydrate(true);},700);setTimeout(function(){hydrate(true);},2600);try{observer=new MutationObserver(function(ms){var hit=ms.some(function(m){return Array.prototype.some.call(m.addedNodes||[],function(n){return n&&n.nodeType===1&&(n.matches&&n.matches('.miniCard')||n.querySelector&&n.querySelector('.miniCard'));});});if(hit)setTimeout(function(){hydrate(false);},20);});observer.observe(document.documentElement,{subtree:true,childList:true});}catch(_e){}}
  window.HappyadCardAuthorAvatarV742={version:VERSION,hydrate:hydrate};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.addEventListener('HAPPYAD_PROFILE_IDENTITY_READY_V741',function(){setTimeout(function(){hydrate(true);},20);});
  window.addEventListener('focus',function(){hydrate(false);});window.addEventListener('online',function(){hydrate(true);});window.addEventListener('pageshow',function(){hydrate(false);});
})();
