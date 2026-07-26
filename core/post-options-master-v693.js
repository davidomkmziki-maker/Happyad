(function(){
  'use strict';
  if(window.__HAPPYAD_POST_OPTIONS_MASTER_V693__)return;
  window.__HAPPYAD_POST_OPTIONS_MASTER_V693__=true;

  var VERSION='V693_POST_OPTIONS_VIDEO_COVER';
  var SHEET_ID='happyadPostOptionsSheetV613F';
  var TOAST_ID='happyadPostOptionsToastV613F';
  var OUTBOX_KEY='HAPPYAD_POST_MUTATION_OUTBOX_V613E';
  var PRIVATE_IDS_KEY='HAPPYAD_PRIVATE_POST_IDS_V1';
  var DELETED_IDS_KEY='HAPPYAD_DELETED_POST_IDS_V1';
  var REPORTS_LOCAL_KEY='HAPPYAD_POST_REPORTS_LOCAL_V613E';
  var CACHE_KEYS=[
    'HAPPYAD_GLOBAL_POSTS_CACHE_V1','HAPPYAD_PUBLISH_POSTS_V2','HAPPYAD_ALL_POSTS_V1',
    'HAPPYAD_HOME_BOOT_SNAPSHOT_V1','HAPPYAD_VIDEO_CACHE_STABLE_V1','HAPPYAD_SESSION_ALL_POSTS_V104',
    'HAPPYAD_PROFILE_POSTS_CACHE_V1','HAPPYAD_PROFILE_PUBLISHED_POSTS_V1','HAPPYAD_PROFILE_POSTS_V1'
  ];

  function clean(v){return String(v==null?'':v).trim();}
  function nowIso(){return new Date().toISOString();}
  function readJson(store,key,fallback){try{var raw=store.getItem(key);if(!raw)return fallback;var v=JSON.parse(raw);return v==null?fallback:v;}catch(_e){return fallback;}}
  function writeJson(store,key,value){try{store.setItem(key,JSON.stringify(value));return true;}catch(_e){return false;}}
  function uniqStrings(arr){var seen={};return (arr||[]).map(clean).filter(function(v){if(!v||seen[v])return false;seen[v]=1;return true;});}
  function postId(p){p=p||{};return clean(p.id||p.post_id||p.postId||p.source_id);}
  function postIds(p){
    p=p||{};var ids=[postId(p)];
    var lists=[p.__albumItems,p.items,p.posts,p.photos,p.mediaItems,p.media_items,p.__happyadPublicationItemsV613E];
    lists.forEach(function(list){if(Array.isArray(list))list.forEach(function(x){ids.push(postId(x));});});
    return uniqStrings(ids);
  }
  function ownerId(p){p=p||{};return clean(p.user_id||p.creatorId||p.creator_id||p.userId||p.owner_id||p.ownerId||p.author_id||p.authorId||p.uid||p.profile_id);}
  function isPrivate(p){p=p||{};var s=clean(p.visibility||p.privacy||p.audience||p.status).toLowerCase();return p.is_private===true||p.private===true||!!p.private_at||!!p.privated_at||['private','privé','prive','only_me','only-me','moi'].indexOf(s)>=0;}

  function localUid(){
    var direct=clean(localStorage.getItem('HAPPYAD_AUTH_UID')||localStorage.getItem('HAPPYAD_USER_ID')||'');
    if(direct)return direct;
    var keys=['HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL','HAPPYAD_CURRENT_USER','HAPPYAD_AUTH_USER','HAPPYAD_USER'];
    for(var i=0;i<keys.length;i++){
      var u=readJson(localStorage,keys[i],{});
      var id=clean(u&&(u.id||u.user_id||u.uid||u.auth_id||u.profile_id));
      if(id)return id;
    }
    try{
      for(var j=0;j<localStorage.length;j++){
        var k=localStorage.key(j)||'';
        if(k.indexOf('sb-')!==0||k.indexOf('-auth-token')<0)continue;
        var token=readJson(localStorage,k,{});
        var tid=clean(token&&token.user&&(token.user.id||token.user.user_id));
        if(tid)return tid;
      }
    }catch(_scan){}
    return '';
  }

  function client(){
    try{
      if(window.happyadSupabase)return window.happyadSupabase;
      if(typeof window.happyadSb==='function'){
        var existing=window.happyadSb();
        if(existing)return existing;
      }
      if(window.supabase&&window.supabase.createClient&&window.HAPPYAD_SUPABASE_URL&&window.HAPPYAD_SUPABASE_KEY){
        window.happyadSupabase=window.supabase.createClient(window.HAPPYAD_SUPABASE_URL,window.HAPPYAD_SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
        return window.happyadSupabase;
      }
    }catch(_e){}
    return null;
  }

  async function resolveUid(){
    var fallback=localUid();
    var c=client();
    if(c&&c.auth&&c.auth.getUser){
      try{
        var r=await Promise.race([c.auth.getUser(),new Promise(function(_,reject){setTimeout(function(){reject(new Error('auth timeout'));},1200);})]);
        var id=clean(r&&r.data&&r.data.user&&r.data.user.id);
        if(id){try{localStorage.setItem('HAPPYAD_AUTH_UID',id);}catch(_s){}return id;}
      }catch(_e){}
    }
    return fallback;
  }

  function ensureStyle(){
    if(document.getElementById('happyadPostOptionsStyleV613G'))return;
    var s=document.createElement('style');
    s.id='happyadPostOptionsStyleV613G';
    s.textContent='\
.haPostMoreV613E{appearance:none!important;-webkit-appearance:none!important;width:42px!important;height:38px!important;min-width:42px!important;min-height:38px!important;border:0!important;border-radius:0!important;background:transparent!important;color:#fff!important;display:grid!important;place-items:center!important;font:1000 29px/1 system-ui,-apple-system,Segoe UI,sans-serif!important;letter-spacing:1px!important;padding:0 0 8px!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;text-shadow:0 2px 8px rgba(0,0,0,.92)!important;touch-action:manipulation!important;z-index:50!important}.haPostMoreV613E:active{background:transparent!important;border-color:transparent!important;transform:scale(.92) translateY(1px)!important;opacity:.72!important;filter:none!important}\
.reel>.haPostMoreV613E{display:none!important}.reel .side .haPostMoreActV613F{display:grid!important;place-items:center!important;margin-top:-2px!important;min-height:38px!important;text-shadow:0 2px 10px #000!important}.reel .side .haPostMoreActV613F .haPostMoreV613E{position:static!important;width:50px!important;height:38px!important;min-width:50px!important;min-height:38px!important;margin:0!important;padding:0 0 9px!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;color:#fff!important;display:grid!important;place-items:center!important;font:1000 29px/1 system-ui,-apple-system,Segoe UI,sans-serif!important;font-size:29px!important;letter-spacing:1px!important;text-shadow:0 2px 8px rgba(0,0,0,.92)!important}.reel .side .haPostMoreActV613F .haPostMoreV613E:active{background:transparent!important}\
.photoSlide .slideTop>.haPostMoreV613E{position:relative!important;justify-self:end!important;background:transparent!important;border:0!important} .photoSlide.clean .haPostMoreV613E{opacity:0!important;pointer-events:none!important}#happyadHomePhotoFullscreen .haPostMoreV613E{position:absolute!important;right:14px!important;top:76px!important;z-index:60!important;background:transparent!important;border:0!important}#happyadHomePhotoFullscreen .haHomeFsCount{margin-right:0!important}\
#'+SHEET_ID+'{position:fixed;inset:0;z-index:2147483000;background:rgba(0,0,0,.58);display:flex;align-items:flex-end;justify-content:center;padding:0 14px calc(14px + env(safe-area-inset-bottom,0px));font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;touch-action:pan-y}#'+SHEET_ID+' .haPostSheetV613E{width:min(480px,100%);background:#11151d;border:1px solid rgba(255,255,255,.14);border-radius:24px;padding:13px;box-shadow:0 24px 70px rgba(0,0,0,.62)}#'+SHEET_ID+' .haPostSheetTitleV613E{font-size:17px;font-weight:1000;padding:6px 7px 12px;color:#fff}#'+SHEET_ID+' button{appearance:none;-webkit-appearance:none;width:100%;min-height:52px;border:0;border-radius:15px;margin:5px 0;padding:12px 14px;background:#202631;color:#fff;display:flex;align-items:center;gap:12px;text-align:left;font:900 15px/1.15 system-ui,-apple-system,Segoe UI,sans-serif;touch-action:manipulation}#'+SHEET_ID+' button:active{background:#303744;transform:translateY(1px)}#'+SHEET_ID+' button.haDangerV613E{color:#ff8f8f;background:#2a1b20}#'+SHEET_ID+' button.haCancelV613E{justify-content:center;background:transparent;border:1px solid rgba(255,255,255,.12)}#'+SHEET_ID+' .haPostReasonV613E{font-size:14px}#'+TOAST_ID+'{position:fixed;left:50%;bottom:calc(82px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:2147483001;max-width:min(92vw,460px);background:rgba(18,22,30,.97);color:#fff;border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:11px 16px;font:850 13px/1.25 system-ui,-apple-system,Segoe UI,sans-serif;text-align:center;box-shadow:0 14px 40px rgba(0,0,0,.45)}' 
    document.head.appendChild(s);
  }

  function toast(message){
    ensureStyle();
    var old=document.getElementById(TOAST_ID);if(old)old.remove();
    var d=document.createElement('div');d.id=TOAST_ID;d.textContent=message;document.body.appendChild(d);
    setTimeout(function(){try{d.remove();}catch(_e){}},3200);
  }

  function closeSheet(){var s=document.getElementById(SHEET_ID);if(s)s.remove();}
  function makeSheet(title){
    ensureStyle();closeSheet();
    var layer=document.createElement('div');layer.id=SHEET_ID;layer.setAttribute('role','dialog');layer.setAttribute('aria-modal','true');
    var box=document.createElement('div');box.className='haPostSheetV613E';
    var head=document.createElement('div');head.className='haPostSheetTitleV613E';head.textContent=title||'Options de publication';box.appendChild(head);layer.appendChild(box);
    layer.addEventListener('click',function(e){if(e.target===layer)closeSheet();});
    document.body.appendChild(layer);return {layer:layer,box:box,head:head};
  }
  function addButton(box,label,klass,fn){
    var b=document.createElement('button');b.type='button';b.textContent=label;if(klass)b.className=klass;
    b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();fn&&fn();});box.appendChild(b);return b;
  }

  function patchPostObject(p,patch){
    if(!p||typeof p!=='object')return p;
    Object.keys(patch||{}).forEach(function(k){p[k]=patch[k];});return p;
  }
  function mutateArray(arr,id,patch,remove){
    if(!Array.isArray(arr))return arr;
    var changed=false;
    var out=[];
    arr.forEach(function(p){
      if(!p||typeof p!=='object'){out.push(p);return;}
      var pid=postId(p);
      if(pid===id){changed=true;if(remove)return;out.push(Object.assign({},p,patch||{}));return;}
      if(Array.isArray(p.__albumItems)){
        var album=mutateArray(p.__albumItems,id,patch,remove);
        if(album!==p.__albumItems){changed=true;p=Object.assign({},p,{__albumItems:album});}
      }
      out.push(p);
    });
    return changed?out:arr;
  }
  function mutateStorage(store,id,patch,remove){
    CACHE_KEYS.forEach(function(k){
      var val=readJson(store,k,null);if(!val)return;
      if(Array.isArray(val)){var next=mutateArray(val,id,patch,remove);if(next!==val)writeJson(store,k,next);return;}
      if(val&&Array.isArray(val.posts)){var np=mutateArray(val.posts,id,patch,remove);if(np!==val.posts){val.posts=np;writeJson(store,k,val);}}
      if(val&&Array.isArray(val.items)){var ni=mutateArray(val.items,id,patch,remove);if(ni!==val.items){val.items=ni;writeJson(store,k,val);}}
    });
  }
  function notifyMutation(detail){
    try{window.dispatchEvent(new CustomEvent('HAPPYAD_POST_MUTATED_V613E',{detail:detail}));}catch(_e){}
    try{if(window.parent&&window.parent!==window)window.parent.postMessage({type:'HAPPYAD_POST_MUTATED_V613E',detail:detail},'*');}catch(_p){}
  }
  function markDeletedLocal(p){
    var ids=postIds(p);if(!ids.length)return;
    var deleted=uniqStrings(readJson(localStorage,DELETED_IDS_KEY,[]).concat(ids));writeJson(localStorage,DELETED_IDS_KEY,deleted);
    ids.forEach(function(id){mutateStorage(localStorage,id,{},true);mutateStorage(sessionStorage,id,{},true);});
    try{localStorage.setItem('HAPPYAD_HOME_REFRESH_NEEDED',String(Date.now()));sessionStorage.removeItem('HAPPYAD_ALL_POSTS_LAST_SYNC');sessionStorage.removeItem('HAPPYAD_PROFILE_POSTS_LAST_SYNC');}catch(_e){}
    notifyMutation({action:'delete',postId:ids[0],postIds:ids,post:p,at:Date.now()});
  }
  function markPrivacyLocal(p,makePrivate){
    var postIdList=postIds(p);if(!postIdList.length)return;
    var saved=uniqStrings(readJson(localStorage,PRIVATE_IDS_KEY,[]));
    saved=makePrivate?uniqStrings(saved.concat(postIdList)):saved.filter(function(x){return postIdList.indexOf(x)<0;});writeJson(localStorage,PRIVATE_IDS_KEY,saved);
    var patch=makePrivate?{visibility:'private',privacy:'private',audience:'private',status:'private',is_private:true,private:true,private_at:nowIso()}:{visibility:'public',privacy:'public',audience:'public',status:'public',is_private:false,private:false,private_at:null,privated_at:null};
    patchPostObject(p,patch);postIdList.forEach(function(id){mutateStorage(localStorage,id,patch,false);mutateStorage(sessionStorage,id,patch,false);});
    try{localStorage.setItem('HAPPYAD_HOME_REFRESH_NEEDED',String(Date.now()));}catch(_e){}
    notifyMutation({action:makePrivate?'private':'public',postId:postIdList[0],postIds:postIdList,post:p,patch:patch,at:Date.now()});
  }

  function outbox(){var a=readJson(localStorage,OUTBOX_KEY,[]);return Array.isArray(a)?a:[];}
  function saveOutbox(a){writeJson(localStorage,OUTBOX_KEY,(a||[]).slice(-100));}
  function queue(item){
    var a=outbox();var key=clean(item.action)+'::'+clean(item.postId)+'::'+clean(item.reason);
    a=a.filter(function(x){return clean(x.action)+'::'+clean(x.postId)+'::'+clean(x.reason)!==key;});a.push(item);saveOutbox(a);
  }

  async function remoteDelete(item){
    var c=client();if(!c)throw new Error('Supabase indisponible');
    var uid=clean(item.uid)||await resolveUid();if(!uid)throw new Error('Connexion requise');
    var stamp=item.deleted_at||nowIso(),ids=uniqStrings(item.postIds||[item.postId]);
    var q=c.from('happyad_posts').update({deleted_at:stamp});q=ids.length>1?q.in('id',ids):q.eq('id',ids[0]);
    var r=await q.eq('user_id',uid).select('id');
    if(r&&r.error){
      var dq=c.from('happyad_posts').delete();dq=ids.length>1?dq.in('id',ids):dq.eq('id',ids[0]);
      var d=await dq.eq('user_id',uid).select('id');if(d&&d.error)throw d.error;
    }
    return true;
  }
  async function remotePrivacy(item){
    var c=client();if(!c)throw new Error('Supabase indisponible');
    var uid=clean(item.uid)||await resolveUid();if(!uid)throw new Error('Connexion requise');
    var patch=item.makePrivate?{visibility:'private',is_private:true,private_at:item.private_at||nowIso()}:{visibility:'public',is_private:false,private_at:null};
    var ids=uniqStrings(item.postIds||[item.postId]);var q=c.from('happyad_posts').update(patch);q=ids.length>1?q.in('id',ids):q.eq('id',ids[0]);
    var r=await q.eq('user_id',uid).select('id');if(r&&r.error)throw r.error;return true;
  }
  async function remoteReport(item){
    var c=client();if(!c)throw new Error('Supabase indisponible');
    var uid=clean(item.uid)||await resolveUid();if(!uid)throw new Error('Connexion requise');
    var row={post_id:item.postId,reporter_id:uid,owner_id:clean(item.ownerId)||null,reason:item.reason||'Autre',details:item.details||'',source:item.source||'publication'};
    var r=await c.from('happyad_post_reports').insert(row).select('id').maybeSingle();if(r&&r.error){if(String(r.error.code||'')==='23505')return true;throw r.error;}return true;
  }
  async function runRemote(item){if(item.action==='delete')return remoteDelete(item);if(item.action==='private'||item.action==='public')return remotePrivacy(item);if(item.action==='report')return remoteReport(item);return true;}
  async function retryOutbox(){
    if(window.__HAPPYAD_POST_OUTBOX_RUNNING_V613E__)return;
    window.__HAPPYAD_POST_OUTBOX_RUNNING_V613E__=true;
    try{
      var a=outbox(),left=[];
      for(var i=0;i<a.length;i++){
        try{await runRemote(a[i]);}catch(_e){a[i].attempts=Number(a[i].attempts||0)+1;a[i].last_try=Date.now();left.push(a[i]);}
      }
      saveOutbox(left);
    }finally{window.__HAPPYAD_POST_OUTBOX_RUNNING_V613E__=false;}
  }

  function invoke(opts,name,payload){try{if(opts&&typeof opts[name]==='function')opts[name](payload);}catch(_e){}}
  async function performOwnerAction(action,p,opts){
    var ids=postIds(p),id=ids[0],uid=await resolveUid();if(!id)return;
    if(!uid||uid!==ownerId(p)){toast('Cette action est réservée au propriétaire.');return;}
    if(action==='delete'){
      if(!confirm('Supprimer définitivement cette publication ?'))return;
      closeSheet();markDeletedLocal(p);invoke(opts,'onDeleted',{post:p,postId:id});
      var item={action:'delete',postId:id,postIds:ids,uid:uid,deleted_at:nowIso(),created_at:Date.now()};
      try{await runRemote(item);toast('Publication supprimée.');}catch(e){queue(item);toast('Suppression enregistrée. Synchronisation dès que Supabase est disponible.');}
      return;
    }
    var makePrivate=action==='private';
    closeSheet();markPrivacyLocal(p,makePrivate);invoke(opts,makePrivate?'onPrivate':'onPublic',{post:p,postId:id});
    var item2={action:makePrivate?'private':'public',postId:id,postIds:ids,uid:uid,makePrivate:makePrivate,private_at:makePrivate?nowIso():null,created_at:Date.now()};
    try{await runRemote(item2);toast(makePrivate?'Publication mise en privé.':'Publication rendue publique.');}catch(e2){queue(item2);toast((makePrivate?'Privé':'Public')+' enregistré localement. Synchronisation dès que Supabase est disponible.');}
  }

  async function saveReport(p,reason,opts){
    var uid=await resolveUid();if(!uid){closeSheet();toast('Connecte-toi pour signaler cette publication.');return;}
    var id=postId(p);if(!id)return;
    var record={action:'report',postId:id,uid:uid,ownerId:ownerId(p),reason:reason||'Autre',details:'',source:opts&&opts.context||'publication',created_at:Date.now()};
    var local=readJson(localStorage,REPORTS_LOCAL_KEY,[]);if(!Array.isArray(local))local=[];local.push(record);writeJson(localStorage,REPORTS_LOCAL_KEY,local.slice(-200));
    closeSheet();invoke(opts,'onReported',{post:p,postId:id,reason:reason});
    try{await runRemote(record);toast('Signalement envoyé.');}catch(e){queue(record);toast('Signalement enregistré. Il sera envoyé dès que Supabase sera disponible.');}
  }
  function showReasons(p,opts){
    var ui=makeSheet('Pourquoi signales-tu cette publication ?');
    ['Contenu inapproprié','Spam ou tromperie','Harcèlement','Droits d’auteur','Autre'].forEach(function(reason){addButton(ui.box,reason,'haPostReasonV613E',function(){saveReport(p,reason,opts);});});
    addButton(ui.box,'Annuler','haCancelV613E',closeSheet);
  }

  async function open(options){
    options=options||{};var p=options.post||{};var id=postId(p);if(!id){toast('Publication introuvable.');return false;}
    var uid=localUid();if(!uid)uid=await resolveUid();
    var mine=!!uid&&!!ownerId(p)&&uid===ownerId(p);
    var ui=makeSheet('Options de publication');
    if(mine){
      if(window.HappyVideoCoverEditorV693&&window.HappyVideoCoverEditorV693.canEdit(p)){
        addButton(ui.box,'Modifier la miniature vidéo','',function(){closeSheet();window.HappyVideoCoverEditorV693.open({post:p,context:options.context||'publication'});});
      }
      if(isPrivate(p))addButton(ui.box,'Rendre la publication publique','',function(){performOwnerAction('public',p,options);});
      else addButton(ui.box,'Mettre la publication en privé','',function(){performOwnerAction('private',p,options);});
      addButton(ui.box,'Supprimer la publication','haDangerV613E',function(){performOwnerAction('delete',p,options);});
    }else{
      addButton(ui.box,'Signaler la publication','haDangerV613E',function(){showReasons(p,options);});
    }
    addButton(ui.box,'Annuler','haCancelV613E',closeSheet);
    return false;
  }

  function genericMutationHandler(detail){
    detail=detail||{};var ids=uniqStrings(detail.postIds||[detail.postId]);if(!ids.length)return;
    if(detail.action==='delete'||detail.action==='private'){
      ids.forEach(function(id){var sels=['.miniCard[data-post-id="'+id.replace(/"/g,'\\"')+'"]','.profilePost[data-post-id="'+id.replace(/"/g,'\\"')+'"]','.reel[data-id="'+id.replace(/"/g,'\\"')+'"]','.photoSlide[data-photo-id="'+id.replace(/"/g,'\\"')+'"]'];sels.forEach(function(sel){try{document.querySelectorAll(sel).forEach(function(el){if(detail.action==='private'&&el.classList.contains('profilePost')){el.classList.add('haPrivatePost');el.dataset.visibility='private';}else el.remove();});}catch(_e){}});});
    }
    try{if(typeof window.happyadRefreshHomePostsNow==='function')window.happyadRefreshHomePostsNow('post-options-'+detail.action);}catch(_r){}
  }

  ensureStyle();
  window.addEventListener('HAPPYAD_POST_MUTATED_V613E',function(e){genericMutationHandler(e&&e.detail);});
  window.addEventListener('message',function(e){var d=e&&e.data;if(d&&d.type==='HAPPYAD_POST_MUTATED_V613E')genericMutationHandler(d.detail);});
  window.addEventListener('online',retryOutbox);
  setTimeout(retryOutbox,1800);

  window.HappyPostOptionsV613E={version:VERSION,open:open,close:closeSheet,retry:retryOutbox,postId:postId,postIds:postIds,ownerId:ownerId,isPrivate:isPrivate};
  window.HappyPostOptionsV613F=window.HappyPostOptionsV613E;
  window.HappyPostOptionsV613G=window.HappyPostOptionsV613E;
  try{if(window.HappyMasterRegistry)window.HappyMasterRegistry.register('post-options',{file:'core/post-options-master-v693.js',responsibility:'menu unique publication avec miniature vidéo créateur, privé, supprimer et signaler',active:true,version:VERSION});}catch(_reg){}
})();
