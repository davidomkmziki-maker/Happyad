(function(){
  'use strict';
  if(window.__HAPPYAD_MESSAGE_RETURN_CENTER_V1__)return;
  window.__HAPPYAD_MESSAGE_RETURN_CENTER_V1__=true;

  var CENTER_ID='happyadMessageReturnCenter';
  var BODY_LOCK='happyadMessageCenterOpen';
  var STATE_FLAG='__happyadMessageCenter';
  var STORE_KEY='HAPPYAD_MESSAGE_RETURN_CENTER_SOURCE_V1';
  var openState=null;
  var pushing=false;
  var contextSeq=0;

  function clean(v){return String(v==null?'':v).trim();}
  function cleanAlias(v){
    var out=clean(v).replace(/^@+/,'').toLowerCase();
    if(!out||out==='undefined'||out==='null'||out==='false'||out==='0'||out==='guest')return '';
    try{out=out.normalize('NFD').replace(/[\u0300-\u036f]/g,'');}catch(_e){}
    out=out.replace(/[^a-zA-Z0-9_-]+/g,'_').replace(/^_+|_+$/g,'').slice(0,96);
    return out==='guest'?'':out;
  }
  function safeJson(v,d){try{return JSON.parse(v||'null')||d}catch(_e){return d}}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c;});}
  function enc(v){return encodeURIComponent(clean(v));}
  function now(){return Date.now?Date.now():(new Date()).getTime();}
  function activeFrame(){
    try{
      var root=document.getElementById('happyadAppShell');
      return root&&root.querySelector&&root.querySelector('.happyadAppFrame.on[data-happyad-page]');
    }catch(_e){return null;}
  }
  function activeSource(){
    var f=activeFrame();
    var view='home', url='index.html';
    try{
      if(f){
        view=clean(f.getAttribute('data-happyad-page'))||'home';
        url=clean(f.getAttribute('data-happyad-src'))||url;
      }else{
        url=clean(location.pathname.split('/').pop())||'index.html';
      }
    }catch(_e){}
    return {view:view,url:url,at:now()};
  }
  function readSource(){
    try{return safeJson(sessionStorage.getItem(STORE_KEY),null)}catch(_e){return null;}
  }
  function writeSource(src){
    try{sessionStorage.setItem(STORE_KEY,JSON.stringify(src||activeSource()))}catch(_e){}
  }
  function style(){
    if(document.getElementById('happyadMessageReturnCenterStyle'))return;
    var s=document.createElement('style');
    s.id='happyadMessageReturnCenterStyle';
    s.textContent=[
      '#'+CENTER_ID+'{position:fixed!important;inset:0!important;z-index:1000020!important;background:#050608!important;color:#fff!important;display:none!important;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif!important;}',
      '#'+CENTER_ID+'.on{display:flex!important;flex-direction:column!important;}',
      'body.'+BODY_LOCK+'{overflow:hidden!important;touch-action:none!important;}',
      '#'+CENTER_ID+' .haMsgBody{flex:1!important;min-height:0!important;padding:0!important;background:#050608!important;}',
      '#'+CENTER_ID+' .haMsgFrame{display:block!important;width:100%!important;height:100%!important;border:0!important;background:#050608!important;opacity:1!important;transition:opacity .08s ease!important;}',
      '#'+CENTER_ID+'.loading .haMsgFrame{opacity:0!important;}'
    ].join('\n');
    (document.head||document.documentElement).appendChild(s);
  }
  function shell(){
    style();
    var el=document.getElementById(CENTER_ID);
    if(el)return el;
    el=document.createElement('div');
    el.id=CENTER_ID;
    el.setAttribute('aria-hidden','true');
    el.innerHTML='<div class="haMsgBody" id="happyadMessageCenterMount"><iframe class="haMsgFrame" id="happyadMessageCenterFrame" title="Messages HAPPYAD" loading="eager" referrerpolicy="no-referrer"></iframe></div>';
    document.body.appendChild(el);
    var f=el.querySelector('#happyadMessageCenterFrame');
    if(f)f.onload=function(){if(openState){sendFrameContext(openState.context||{});}};
    return el;
  }
  function revealSoon(){
    setTimeout(function(){
      try{
        var el=document.getElementById(CENTER_ID);
        if(el)el.classList.remove('loading');
      }catch(_e){}
    },120);
  }
  function normalizeTarget(raw){
    raw=raw&&typeof raw==='object'?raw:{};
    var id=clean(raw.id||raw.user_id||raw.uid||raw.uuid||raw.auth_id||raw.auth_user_id||raw.authUserId||raw.account_uid||raw.accountUid||raw.target_id||raw.profile_id||raw.profileId||raw.profile_uid||raw.profileUid||raw.account_id||raw.accountId||raw.author_id||raw.authorId||raw.owner_id||raw.ownerId||raw.creator_id||raw.creatorId||raw.seller_id||raw.sellerId||raw.vendor_id||raw.vendorId||raw.userId||raw.created_by||raw.createdBy);
    if(id==='undefined'||id==='null'||id==='false'||id==='0')id='';
    var name=clean(raw.name||raw.full_name||raw.display_name||raw.username||raw.handle);
    var avatar=clean(raw.avatar||raw.avatar_url||raw.photo||raw.photo_url||raw.profile_photo||raw.picture);
    var handle=clean(raw.handle||raw.username||raw.user_name).replace(/^@+/,'');
    var badge=clean(raw.badge||raw.user_badge||raw.badge_type||raw.certification);
    if(!id&&handle){
      var handleAlias=cleanAlias(handle);
      if(handleAlias)id='handle_'+handleAlias;
    }
    if(!id&&name){
      var nameAlias=cleanAlias(name);
      if(nameAlias)id='name_'+nameAlias;
    }
    if(!id&&!name&&!avatar&&!handle&&!badge)return null;
    return {id:id,name:name||handle||'Utilisateur HAPPYAD',avatar:avatar,handle:handle,badge:badge,status:clean(raw.status||raw.presence||'Profil visiteur')};
  }
  function activeVisitorProfile(){
    var out=null;
    try{out=safeJson(localStorage.getItem('HAPPYAD_ACTIVE_PROFILE'),null)||null;}catch(_e){}
    if(!out||typeof out!=='object')out={};
    try{
      var f=activeFrame();
      var src=clean((f&&f.getAttribute('data-happyad-src'))||'');
      var m=src.match(/[?&](?:uid|user_id|profile_uid|auth_user_id|account_uid|profile_id|id)=([^&#]+)/);
      if(m){
        var uid=decodeURIComponent(m[1]);
        out.id=uid;
        out.user_id=uid;
        out.uid=uid;
        out.__happyadUidLocked=true;
      }
    }catch(_u){}
    return out;
  }
  function directVisitorTarget(raw){
    raw=raw&&typeof raw==='object'?raw:{};
    var target=normalizeTarget(raw)||{};
    try{
      var f=activeFrame();
      var src=clean((f&&f.getAttribute('data-happyad-src'))||'');
      var m=src.match(/[?&](?:uid|user_id|profile_uid|auth_user_id|account_uid|profile_id|id)=([^&#]+)/);
      if(m){
        var uid=decodeURIComponent(m[1]);
        if(uid&&uid!=='undefined'&&uid!=='null'&&!target.id){
          target.id=uid;
          target.user_id=uid;
          target.uid=uid;
        }
      }
    }catch(_e){}
    if(!target.id)return null;
    target.name=clean(raw.name||raw.full_name||raw.display_name||raw.username||raw.handle||target.name)||'Utilisateur HAPPYAD';
    target.avatar=clean(raw.avatar||raw.avatar_url||raw.photo||raw.photo_url||raw.profile_photo||target.avatar);
    target.handle=clean(raw.handle||raw.username||target.handle);
    target.badge=clean(raw.badge||raw.user_badge||raw.badge_type||raw.certification||target.badge);
    target.status=clean(raw.status||raw.presence||target.status)||'Profil visiteur';
    return target;
  }
  function mergeTarget(a,b){
    a=a&&typeof a==='object'?a:{};
    b=b&&typeof b==='object'?b:{};
    return {
      id:clean(a.id||a.user_id||a.uid||a.uuid||a.auth_id||a.auth_user_id||a.authUserId||a.account_uid||a.accountUid||a.target_id||a.profile_id||a.profileId||a.profile_uid||a.profileUid||a.account_id||a.accountId||a.author_id||a.authorId||a.owner_id||a.ownerId||a.creator_id||a.creatorId||a.seller_id||a.sellerId||a.vendor_id||a.vendorId||a.userId||a.created_by||a.createdBy||b.id||b.user_id||b.uid||b.uuid||b.auth_id||b.auth_user_id||b.authUserId||b.account_uid||b.accountUid||b.target_id||b.profile_id||b.profileId||b.profile_uid||b.profileUid||b.account_id||b.accountId||b.author_id||b.authorId||b.owner_id||b.ownerId||b.creator_id||b.creatorId||b.seller_id||b.sellerId||b.vendor_id||b.vendorId||b.userId||b.created_by||b.createdBy),
      user_id:clean(a.user_id||a.id||a.uid||a.auth_user_id||a.authUserId||a.account_uid||a.accountUid||a.profile_uid||a.profile_id||a.owner_id||a.creator_id||a.seller_id||a.userId||b.user_id||b.id||b.uid||b.auth_user_id||b.authUserId||b.account_uid||b.accountUid||b.profile_uid||b.profile_id||b.owner_id||b.creator_id||b.seller_id||b.userId),
      name:clean(a.name||a.full_name||a.display_name||a.username||a.handle||b.name||b.full_name||b.display_name||b.username||b.handle),
      full_name:clean(a.full_name||a.name||b.full_name||b.name),
      handle:clean(a.handle||a.username||b.handle||b.username),
      username:clean(a.username||a.handle||b.username||b.handle),
      avatar:clean(a.avatar||a.avatar_url||a.photo||a.photo_url||a.profile_photo||b.avatar||b.avatar_url||b.photo||b.photo_url||b.profile_photo),
      avatar_url:clean(a.avatar_url||a.avatar||b.avatar_url||b.avatar),
      badge:clean(a.badge||a.user_badge||a.badge_type||a.certification||b.badge||b.user_badge||b.badge_type||b.certification),
      status:clean(a.status||b.status||'Profil visiteur')
    };
  }
  function textFrom(obj,keys){
    if(!obj||typeof obj!=='object')return '';
    for(var i=0;i<keys.length;i++){
      var v=obj[keys[i]];
      if(v!==null&&v!==undefined&&clean(v))return clean(v);
    }
    return '';
  }
  function userFromObject(obj){
    if(!obj||typeof obj!=='object')return null;
    var roots=[obj,obj.user,obj.profile,obj.currentUser,obj.session&&obj.session.user,obj.data&&obj.data.user].filter(Boolean);
    for(var i=0;i<roots.length;i++){
      var root=roots[i]||{};
      var meta=root.user_metadata||root.raw_user_meta_data||{};
      var name=textFrom(root,['name','full_name','display_name','username','user_name'])||textFrom(meta,['name','full_name','display_name','username','user_name']);
      var avatar=textFrom(root,['avatar','avatar_url','photo','photo_url','profile_photo','picture'])||textFrom(meta,['avatar','avatar_url','photo','photo_url','profile_photo','picture']);
      var badge=textFrom(root,['badge','badge_type','user_badge','account_badge','certification'])||textFrom(meta,['badge','badge_type','user_badge','account_badge','certification']);
      var id=textFrom(root,['id','user_id','uid','uuid','auth_id','auth_user_id','authUserId','account_uid','accountUid'])||textFrom(meta,['id','user_id','uid','uuid','auth_id','auth_user_id','authUserId','account_uid','accountUid']);
      if(name||avatar||badge||id)return {id:id,user_id:id,name:name||'HAPPYAD',avatar:avatar,badge:badge,status:'Profil connecté'};
    }
    return null;
  }
  function readCurrentUser(){
    var keys=['HAPPYAD_LOGGED_USER','HAPPYAD_CURRENT_USER','HAPPYAD_USER','HAPPYAD_USER_V1','HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL','happyad_current_user','happyad_user','currentUser','user','happyad_profile','HAPPYAD_PROFILE','happyad_auth_user','supabase.auth.token'];
    for(var i=0;i<keys.length;i++){
      try{
        var raw=localStorage.getItem(keys[i])||sessionStorage.getItem(keys[i]);
        var parsed=safeJson(raw,null);
        var user=userFromObject(parsed);
        if(user)return user;
      }catch(_e){}
    }
    try{
      var id=localStorage.getItem('HAPPYAD_AUTH_UID')||localStorage.getItem('happyad_auth_uid')||localStorage.getItem('supabase.auth.uid')||'';
      var email=localStorage.getItem('happyad_my_email')||localStorage.getItem('happyadUserEmail')||localStorage.getItem('myEmail')||localStorage.getItem('account_email')||'';
      var name=localStorage.getItem('happyad_my_name')||localStorage.getItem('happyadUserName')||localStorage.getItem('myName')||'';
      var avatar=localStorage.getItem('happyad_my_avatar')||localStorage.getItem('happyadUserAvatar')||localStorage.getItem('myAvatar')||'';
      var badge=localStorage.getItem('happyad_my_badge')||localStorage.getItem('happyadUserBadge')||localStorage.getItem('myBadge')||'';
      if(id||email||name||avatar||badge)return {id:id,user_id:id,email:email,account_email:email,name:name||'HAPPYAD',avatar:avatar,badge:badge,status:'Profil connecté'};
    }catch(_s){}
    return null;
  }
  function contextFromDetail(detail,src){
    detail=detail&&typeof detail==='object'?detail:{};
    var rawTarget=detail.target||detail.profile||detail.user;
    var target=clean(detail.source)==='visitor-profile-message'?directVisitorTarget(rawTarget):normalizeTarget(rawTarget);
    var mode=clean(detail.mode)||(target&&target.id?'direct':'inbox');
    var owner=normalizeTarget(detail.owner||detail.me||detail.currentUser)||normalizeTarget(readCurrentUser());
    return {mode:mode,source:clean(detail.source)||'message-center',returnTo:src,target:target,owner:owner};
  }
  function moduleUrl(ctx){
    var q=['mode='+enc(ctx.mode||'inbox'),'source='+enc(ctx.source||'message-center')];
    var t=ctx.target||{};
    if(t.id)q.push('target_id='+enc(t.id));
    if(t.name)q.push('target_name='+enc(t.name));
    if(t.avatar)q.push('target_avatar='+enc(t.avatar));
    if(t.badge)q.push('target_badge='+enc(t.badge));
    if(t.handle)q.push('target_handle='+enc(t.handle));
    if(t.status)q.push('target_status='+enc(t.status));
    var o=ctx.owner||{};
    if(o.name)q.push('owner_name='+enc(o.name));
    if(o.avatar)q.push('owner_avatar='+enc(o.avatar));
    if(o.badge)q.push('owner_badge='+enc(o.badge));
    if(o.id)q.push('owner_id='+enc(o.id));
    return 'modules/message-center.html?'+q.join('&');
  }
  function stableModuleUrl(ctx){
    return 'modules/message-center.html?mode='+enc((ctx&&ctx.mode)||'inbox')+'&source='+enc((ctx&&ctx.source)||'message-center');
  }
  function sendFrameContext(ctx){
    try{
      var f=document.getElementById('happyadMessageCenterFrame');
      if(f&&f.contentWindow)f.contentWindow.postMessage({type:'HAPPYAD_MESSAGE_CONTEXT',detail:ctx||{}},'*');
    }catch(_e){}
  }
  function revealFallback(contextId){
    setTimeout(function(){
      try{
        if(!openState)return;
        var current=openState.context||{};
        if(contextId&&current.context_id&&String(current.context_id)!==String(contextId))return;
        revealSoon();
      }catch(_e){}
    },900);
  }
  function notifyActiveFrame(type,detail){
    try{
      var f=activeFrame();
      if(f&&f.contentWindow)f.contentWindow.postMessage({type:type,detail:detail||{}},'*');
    }catch(_e){}
  }
  function state(){
    return {view:'message_center',url:'message-center',ts:now(),source:(openState&&openState.source)||activeSource(),target:(openState&&openState.context&&openState.context.target)||null,mode:(openState&&openState.context&&openState.context.mode)||'inbox'};
  }
  function push(){
    if(pushing)return;
    try{
      pushing=true;
      var s=state();s[STATE_FLAG]=true;
      history.pushState(s,'',location.href);
    }catch(_e){}
    setTimeout(function(){pushing=false;},80);
  }
  function open(detail){
    detail=detail&&detail.detail?detail.detail:detail||{};
    var src=detail.returnTo||readSource()||activeSource();
    var ctx=contextFromDetail(detail,src);
    ctx.context_id='happyad_msg_'+now()+'_'+(++contextSeq);
    openState={source:src,context:ctx,request:detail,at:now()};
    writeSource(src);
    var el=shell();
    el.classList.add('loading');
    var frame=document.getElementById('happyadMessageCenterFrame');
    if(frame){
      var srcUrl=stableModuleUrl(ctx);
      if(frame.getAttribute('src')!==srcUrl){
        frame.setAttribute('src',srcUrl);
      }else{
        setTimeout(function(){sendFrameContext(ctx);},40);
      }
      setTimeout(function(){sendFrameContext(ctx);},120);
      revealFallback(ctx.context_id);
    }
    el.classList.add('on');
    el.setAttribute('aria-hidden','false');
    try{document.body.classList.add(BODY_LOCK);}catch(_e){}
    if(!detail.fromPop)push();
    try{window.dispatchEvent(new CustomEvent('HAPPYAD_MESSAGE_CENTER_OPENED',{detail:state()}));}catch(_e){}
    return true;
  }
  function close(reason,fromPop){
    var el=document.getElementById(CENTER_ID);
    if(el){el.classList.remove('on');el.setAttribute('aria-hidden','true');}
    try{document.body.classList.remove(BODY_LOCK);}catch(_e){}
    var src=(openState&&openState.source)||readSource()||activeSource();
    var closed={reason:reason||'close',source:src,at:now()};
    openState=null;
    try{window.dispatchEvent(new CustomEvent('HAPPYAD_MESSAGE_CENTER_CLOSED',{detail:closed}));}catch(_e){}
    if(!fromPop){
      try{
        if(history.state&&history.state[STATE_FLAG]){history.back();return true;}
      }catch(_h){}
    }
    return true;
  }
  window.addEventListener('HAPPYAD_NEW_MESSAGE_SYSTEM_REQUEST',function(ev){open(ev&&ev.detail||{});},true);
  window.addEventListener('message',function(ev){
    try{
      var d=ev&&ev.data;if(!d)return;
      if(d.type==='HAPPYAD_NEW_MESSAGE_SYSTEM_REQUEST')open(d.detail||d.extra||{});
      if(d.type==='HAPPYAD_CLOSE_MESSAGE_CENTER')close('post-message');
      if(d.type==='HAPPYAD_MESSAGE_CENTER_READY'&&openState){sendFrameContext(openState.context||{});}
      if(d.type==='HAPPYAD_MESSAGE_CONTEXT_APPLIED'&&openState){
        var ctx=openState.context||{}, ack=d.detail||{};
        if(!ack.context_id||!ctx.context_id||String(ack.context_id)===String(ctx.context_id))revealSoon();
      }
    }catch(_e){}
  },true);
  window.addEventListener('popstate',function(ev){
    try{
      var el=document.getElementById(CENTER_ID);
      if(el&&el.classList.contains('on')&&!(ev.state&&ev.state[STATE_FLAG]))close('popstate',true);
    }catch(_e){}
  },true);
  window.HappyMessageReturnCenter={open:open,close:close,current:function(){return openState||null;},source:function(){return readSource()||activeSource();}};
})();
