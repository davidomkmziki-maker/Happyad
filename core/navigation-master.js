(function(){
  'use strict';
  if(window.__HAPPYAD_NAVIGATION_MASTER_V29__)return;
  window.__HAPPYAD_NAVIGATION_MASTER_V29__=true;

  var MASTER_VERSION='NAV_MASTER_V30_RELOAD_NO_HOME_FLASH_V16ZJ';
  var NAV_FLAG='__happyadCoreNavV10';
  var SHELL_ID='happyadAppShell';
  var LOADER_ID='happyadAppMiniLoader';
  var SKELETON_ID='happyadAppSkeleton';
  var VIDEO_DIRECT_ID='happyadAppVideoDirect';
  var SKELETON_STYLE_ID='happyadAppSkeletonStyleV28';
  var PREFETCH_FLAG='__happyadSoftPrefetchV27';
  var RESTORE_KEY_V16ZH='HAPPYAD_LAST_OPEN_ROUTE_V16ZH';
  var BOOT_RESTORE_CLASS_V16ZJ='happyadBootRestoringPageV16ZJ';
  var activePage='home';
  var activeUrl='index.html';
  var restoring=false;
  var pendingNav=null;
  var pendingNavTimer=null;
  var TAP_SHIELD_ID='happyadAppTapShield';

  var pages={
    home:'index.html',
    profile:'modules/user.html',
    profile_public:'modules/user.html?public=1',
    video:'modules/video.html',
    photo:'modules/photo.html',
    publish:'modules/publish.html',
    map:'modules/map.html',
    boutique:'boutique.html',
    messages:'messages.html'
  };

  function clean(v){return String(v==null?'':v).trim().replace(/^\.\//,'');}
  function shell(){return document.getElementById(SHELL_ID);}
  function loader(){return document.getElementById(LOADER_ID);}
  function skeleton(){return document.getElementById(SKELETON_ID);}
  function injectSkeletonStyle(){
    try{
      if(document.getElementById(SKELETON_STYLE_ID))return;
      var st=document.createElement('style');st.id=SKELETON_STYLE_ID;
      st.textContent='\n'+
      '#happyadAppShell.happyadSkeletonOpen{display:block!important;background:#050507!important;}\n'+
      '#happyadAppTapShield{position:fixed!important;inset:0!important;z-index:999979!important;display:none!important;pointer-events:auto!important;touch-action:none!important;background:rgba(0,0,0,0)!important;}\n'+
      '#happyadAppTapShield.on{display:block!important;}\n'+
      '.happyadTapAcceptedV16U{filter:brightness(1.08)!important;transition:filter .12s ease,transform .12s ease!important;}\n'+
      '#happyadAppSkeleton{position:absolute!important;inset:0!important;z-index:7!important;display:none!important;background:linear-gradient(180deg,#050609 0%,#020306 100%)!important;color:#fff!important;overflow:hidden!important;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif!important;pointer-events:auto!important;}\n'+
      '#happyadAppSkeleton.on{display:block!important;}\n'+
      '#happyadAppSkeleton .haSkPage{position:absolute!important;inset:0!important;padding:18px 13px 92px!important;box-sizing:border-box!important;overflow:hidden!important;}\n'+
      '#happyadAppSkeleton .haSkTop{height:42px!important;display:flex!important;align-items:center!important;gap:10px!important;margin-bottom:10px!important;}\n'+
      '#happyadAppSkeleton .haSkBack{width:34px!important;height:34px!important;border-radius:50%!important;background:rgba(255,255,255,.055)!important;box-shadow:0 0 0 1px rgba(255,255,255,.04) inset!important;position:relative!important;overflow:hidden!important;}\n'+
      '#happyadAppSkeleton .haSkTitle{height:15px!important;width:132px!important;border-radius:999px!important;background:rgba(255,255,255,.075)!important;position:relative!important;overflow:hidden!important;}\n'+
      '#happyadAppSkeleton .haSkLogo{display:none!important;}\n'+
      '#happyadAppSkeleton .haSkProfilePage{padding-top:28px!important;}\n'+
      '#happyadAppSkeleton .haSkProfileIdentity{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;margin:0 auto 18px!important;text-align:center!important;}\n'+
      '#happyadAppSkeleton .haSkAvatar{width:86px!important;height:86px!important;border-radius:50%!important;background:rgba(255,255,255,.075)!important;box-shadow:0 0 0 1px rgba(255,255,255,.055) inset,0 16px 44px rgba(0,0,0,.20)!important;position:relative!important;overflow:hidden!important;flex:0 0 auto!important;}\n'+
      '#happyadAppSkeleton .haSkAvatarCenter{width:96px!important;height:96px!important;margin:0 auto!important;}\n'+
      '#happyadAppSkeleton .haSkAvatar i{position:absolute!important;inset:0!important;display:block!important;z-index:1!important;}\n'+
      '#happyadAppSkeleton .haSkAvatar i:before{content:""!important;position:absolute!important;left:50%!important;top:24%!important;width:29%!important;height:29%!important;border-radius:50%!important;transform:translateX(-50%)!important;background:rgba(255,255,255,.16)!important;box-shadow:0 0 0 1px rgba(255,255,255,.035) inset!important;}\n'+
      '#happyadAppSkeleton .haSkAvatar i:after{content:""!important;position:absolute!important;left:50%!important;bottom:20%!important;width:58%!important;height:31%!important;border-radius:999px 999px 30px 30px!important;transform:translateX(-50%)!important;background:rgba(255,255,255,.13)!important;box-shadow:0 0 0 1px rgba(255,255,255,.03) inset!important;}\n'+
      '#happyadAppSkeleton .haSkNameLine{width:170px!important;height:18px!important;border-radius:999px!important;background:rgba(255,255,255,.085)!important;margin:13px auto 8px!important;position:relative!important;overflow:hidden!important;}\n'+
      '#happyadAppSkeleton .haSkHandleLine{width:122px!important;height:11px!important;border-radius:999px!important;background:rgba(255,255,255,.06)!important;margin:0 auto!important;position:relative!important;overflow:hidden!important;}\n'+
      '#happyadAppSkeleton .haSkHero{display:grid!important;grid-template-columns:78px minmax(0,1fr)!important;gap:13px!important;align-items:center!important;margin:8px 0 14px!important;}\n'+
      '#happyadAppSkeleton .haSkLine{height:12px!important;border-radius:999px!important;background:rgba(255,255,255,.075)!important;margin:8px 0!important;position:relative!important;overflow:hidden!important;}\n'+
      '#happyadAppSkeleton .haSkLine.sm{width:44%!important;height:9px!important;opacity:.72!important;}\n'+
      '#happyadAppSkeleton .haSkLine.md{width:68%!important;}\n'+
      '#happyadAppSkeleton .haSkLine.lg{width:86%!important;}\n'+
      '#happyadAppSkeleton .haSkStats{display:grid!important;grid-template-columns:repeat(3,1fr)!important;gap:8px!important;margin:12px 0!important;}\n'+
      '#happyadAppSkeleton .haSkStat{height:48px!important;border-radius:18px!important;background:rgba(255,255,255,.055)!important;border:1px solid rgba(255,255,255,.035)!important;position:relative!important;overflow:hidden!important;}\n'+
      '#happyadAppSkeleton .haSkBio{height:58px!important;border-radius:18px!important;background:rgba(255,255,255,.045)!important;margin:12px 0 14px!important;padding:13px!important;box-sizing:border-box!important;position:relative!important;overflow:hidden!important;}\n'+
      '#happyadAppSkeleton .haSkActions{display:grid!important;grid-template-columns:1fr 1fr!important;gap:10px!important;margin:0 0 15px!important;}\n'+
      '#happyadAppSkeleton .haSkBtn{height:42px!important;border-radius:999px!important;background:rgba(255,138,0,.085)!important;border:1px solid rgba(255,138,0,.105)!important;position:relative!important;overflow:hidden!important;}\n'+
      '#happyadAppSkeleton .haSkGrid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important;}\n'+
      '#happyadAppSkeleton .haSkCard{aspect-ratio:1/1!important;border-radius:18px!important;background:rgba(255,255,255,.06)!important;overflow:hidden!important;position:relative!important;}\n'+
      '#happyadAppSkeleton .haSkChips{display:flex!important;gap:8px!important;overflow:hidden!important;margin:4px 0 14px!important;}\n'+
      '#happyadAppSkeleton .haSkChip{height:34px!important;min-width:84px!important;border-radius:999px!important;background:rgba(255,255,255,.06)!important;flex:0 0 auto!important;position:relative!important;overflow:hidden!important;}\n'+
      '#happyadAppSkeleton .haSkProducts{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important;}\n'+
      '#happyadAppSkeleton .haSkProduct{height:178px!important;border-radius:18px!important;background:rgba(255,255,255,.055)!important;position:relative!important;overflow:hidden!important;}\n'+
      '#happyadAppSkeleton .haSkProduct:before{content:""!important;display:block!important;height:112px!important;background:rgba(255,255,255,.065)!important;border-radius:18px 18px 12px 12px!important;}\n'+
      '#happyadAppSkeleton .haSkBack:after,#happyadAppSkeleton .haSkTitle:after,#happyadAppSkeleton .haSkCard:after,#happyadAppSkeleton .haSkAvatar:after,#happyadAppSkeleton .haSkLine:after,#happyadAppSkeleton .haSkStat:after,#happyadAppSkeleton .haSkBio:after,#happyadAppSkeleton .haSkBtn:after,#happyadAppSkeleton .haSkChip:after,#happyadAppSkeleton .haSkProduct:after,#happyadAppSkeleton .haSkNameLine:after,#happyadAppSkeleton .haSkHandleLine:after{content:""!important;position:absolute!important;top:0!important;bottom:0!important;left:-95%;width:86%!important;z-index:2!important;background:linear-gradient(105deg,rgba(255,255,255,0) 0%,rgba(255,255,255,.08) 28%,rgba(255,255,255,.46) 50%,rgba(255,255,255,.08) 72%,rgba(255,255,255,0) 100%)!important;transform:skewX(-14deg)!important;animation:happyadSkShimmerV20 2.25s ease-in-out infinite!important;will-change:left!important;opacity:.72!important;pointer-events:none!important;}\n'+
      '#happyadAppVideoDirect{position:absolute!important;inset:0!important;z-index:8!important;display:none!important;background:#000!important;color:#fff!important;overflow:hidden!important;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif!important;pointer-events:none!important;}\n'+      '#happyadAppVideoDirect.on{display:block!important;}\n'+      '#happyadAppVideoDirect .haVidFrame{position:absolute!important;inset:0!important;background:#000!important;display:flex!important;align-items:center!important;justify-content:center!important;overflow:hidden!important;}\n'+      '#happyadAppVideoDirect .haVidFrame img{display:block!important;max-width:100%!important;max-height:100%!important;width:auto!important;height:auto!important;object-fit:contain!important;background:#000!important;filter:brightness(.90)!important;transform:none!important;}\n'+      '#happyadAppVideoDirect .haVidFrame.noPoster{background:radial-gradient(circle at 50% 42%,rgba(255,138,0,.14),transparent 30%),linear-gradient(180deg,#1a1d24,#11141a 58%,#0c0e13)!important;}\n'+      '#happyadAppVideoDirect.generalVideo{background:#12141a!important;}\n'+      '#happyadAppVideoDirect .haVidFade{position:absolute!important;inset:0!important;background:linear-gradient(180deg,rgba(0,0,0,.20),rgba(0,0,0,.02) 44%,rgba(0,0,0,.58))!important;pointer-events:none!important;}\n'+      '#happyadAppVideoDirect .haVidCenter{position:absolute!important;left:50%!important;top:50%!important;transform:translate(-50%,-50%)!important;width:74px!important;height:74px!important;border-radius:50%!important;background:rgba(0,0,0,.48)!important;border:1px solid rgba(255,255,255,.20)!important;box-shadow:0 14px 44px rgba(0,0,0,.55),0 0 34px rgba(255,138,0,.22)!important;display:flex!important;align-items:center!important;justify-content:center!important;}\n'+      '#happyadAppVideoDirect .haVidCenter:before{content:""!important;margin-left:5px!important;border-left:20px solid rgba(255,255,255,.94)!important;border-top:13px solid transparent!important;border-bottom:13px solid transparent!important;z-index:2!important;}\n'+      '#happyadAppVideoDirect .haVidCenter:after{content:""!important;position:absolute!important;inset:-6px!important;border-radius:50%!important;border:3px solid rgba(255,255,255,.18)!important;border-top-color:rgba(255,138,0,.98)!important;border-right-color:rgba(255,189,102,.72)!important;animation:happyadVidPlaySpinV24 .92s linear infinite!important;box-shadow:0 0 18px rgba(255,138,0,.20)!important;}\n'+      '#happyadAppVideoDirect .haVidBottom{position:absolute!important;left:18px!important;right:18px!important;bottom:28px!important;display:grid!important;gap:8px!important;}\n'+      '#happyadAppVideoDirect .haVidTitle{height:16px!important;max-width:72%!important;border-radius:999px!important;background:rgba(255,255,255,.16)!important;overflow:hidden!important;position:relative!important;}\n'+      '#happyadAppVideoDirect .haVidMeta{height:11px!important;max-width:42%!important;border-radius:999px!important;background:rgba(255,255,255,.10)!important;overflow:hidden!important;position:relative!important;}\n'+      '#happyadAppVideoDirect .haVidTitle:after,#happyadAppVideoDirect .haVidMeta:after{content:""!important;position:absolute!important;top:0!important;bottom:0!important;left:-80%!important;width:70%!important;background:linear-gradient(105deg,rgba(255,255,255,0),rgba(255,255,255,.28),rgba(255,255,255,0))!important;animation:happyadSkShimmerV20 1.85s ease-in-out infinite!important;}\n'+      '#happyadAppSkeleton .haSkSpin,#happyadAppMiniLoader,#happyadAppMiniLoader.on{display:none!important;opacity:0!important;visibility:hidden!important;}\n'+      '@keyframes happyadSkShimmerV20{0%{left:-95%}55%,100%{left:120%}}\n'+      '@keyframes happyadVidPlaySpinV24{to{transform:rotate(360deg)}}\n';
      (document.head||document.documentElement).appendChild(st);
    }catch(_e){}
  }
  function skeletonMarkup(page,url){
    page=String(page||'');
    var title='Chargement';
    if(page==='profile')title='Mon profil';
    else if(page==='profile_public')title='Profil';
    else if(page==='boutique')title='Boutique';
    else if(page==='video')title='Vidéos';
    else if(page==='photo')title='Photos';
    else if(page==='publish')title='Publication';
    else if(page==='map')title='Carte';
    else if(page==='messages')title='Messages';
    var top='<div class="haSkTop"><div class="haSkBack"></div><div class="haSkTitle"></div></div>';
    var profileTop='<div class="haSkProfileIdentity"><div class="haSkAvatar haSkAvatarCenter"><i></i></div><div class="haSkNameLine"></div><div class="haSkHandleLine"></div></div>';
    if(page==='boutique'){
      return '<div class="haSkPage" data-page="'+page+'">'+top+'<div class="haSkLine lg"></div><div class="haSkChips"><div class="haSkChip"></div><div class="haSkChip"></div><div class="haSkChip"></div><div class="haSkChip"></div></div><div class="haSkProducts"><div class="haSkProduct"></div><div class="haSkProduct"></div><div class="haSkProduct"></div><div class="haSkProduct"></div></div></div>';
    }
    if(page==='profile'||page==='profile_public'){
      return '<div class="haSkPage haSkProfilePage" data-page="'+page+'">'+profileTop+'<div class="haSkStats"><div class="haSkStat"></div><div class="haSkStat"></div><div class="haSkStat"></div></div><div class="haSkBio"><div class="haSkLine lg"></div><div class="haSkLine md"></div></div><div class="haSkActions"><div class="haSkBtn"></div><div class="haSkBtn"></div></div><div class="haSkGrid"><div class="haSkCard"></div><div class="haSkCard"></div><div class="haSkCard"></div><div class="haSkCard"></div></div></div>';
    }
    return '<div class="haSkPage" data-page="'+page+'">'+top+'<div class="haSkLine lg"></div><div class="haSkLine md"></div><div class="haSkGrid"><div class="haSkCard"></div><div class="haSkCard"></div><div class="haSkCard"></div><div class="haSkCard"></div></div></div>';
  }
  function showSkeleton(page,url,on){
    try{
      if(on&&isNoSkeletonPage(page,url))on=false;
      injectSkeletonStyle();
      var root=ensureShell(); if(!root)return;
      var sk=skeleton();
      if(!sk){sk=document.createElement('div');sk.id=SKELETON_ID;sk.setAttribute('aria-hidden','true');root.appendChild(sk);}
      if(on){
        sk.innerHTML=skeletonMarkup(page,url);
        sk.setAttribute('data-happyad-page',String(page||''));
        sk.classList.add('on');
        root.classList.add('on');root.classList.add('happyadSkeletonOpen');root.setAttribute('aria-hidden','false');
        document.body.classList.add('happyadAppOpen');
      }else{
        sk.classList.remove('on');sk.removeAttribute('data-happyad-page');
        root.classList.remove('happyadSkeletonOpen');
      }
    }catch(_e){}
  }
  function clearBootRestoreMaskV16ZJ(reason){
    try{
      if(document.documentElement&&document.documentElement.classList){
        document.documentElement.classList.remove(BOOT_RESTORE_CLASS_V16ZJ);
      }
      window.__HAPPYAD_BOOT_RESTORE_MASK_CLEARED_V16ZJ={reason:String(reason||''),t:Date.now()};
    }catch(_e){}
  }
  function prepareBootRestoreShellV16ZJ(page,url){
    try{
      page=String(page||'home');url=rootUrl(url||pages[page]||'index.html');
      injectSkeletonStyle();
      var root=ensureShell();
      if(root){
        root.classList.add('on');
        root.setAttribute('aria-hidden','false');
      }
      try{document.body&&document.body.classList&&document.body.classList.add('happyadAppOpen');}catch(_b){}
      if(isNoSkeletonPage(page,url)){
        try{showSkeleton(page,url,false);}catch(_sk){}
      }else{
        try{showSkeleton(page,url,true);}catch(_sk2){}
      }
      try{showVideoDirect(url,false);}catch(_v){}
      try{releaseNavGate('boot-restore-prepare-v16zj');}catch(_g){}
      window.__HAPPYAD_BOOT_RESTORE_PREPARED_V16ZJ={page:page,url:url,t:Date.now()};
    }catch(_e){}
  }
  function ensureShell(){
    injectSkeletonStyle();
    var root=shell();
    if(!root){
      root=document.createElement('div');root.id=SHELL_ID;root.setAttribute('aria-hidden','true');
      try{document.body.appendChild(root);}catch(_e){}
    }
    try{if(root&&!skeleton()){var sk=document.createElement('div');sk.id=SKELETON_ID;sk.setAttribute('aria-hidden','true');root.appendChild(sk);}}catch(_sk){}
    var l=loader();
    if(!l){l=document.createElement('div');l.id=LOADER_ID;l.setAttribute('aria-hidden','true');try{document.body.appendChild(l);}catch(_e){}}
    return root;
  }
  function rootUrl(url){
    url=clean(url);
    if(!url||url==='#'||url==='/'||url==='./')return 'index.html';
    try{
      var u=new URL(url,location.href);
      var file=(u.pathname||'').replace(/\\/g,'/').split('/').pop()||'index.html';
      var prefix=url;
      if(file==='user.html')prefix='modules/user.html';
      else if(file==='video.html')prefix='modules/video.html';
      else if(file==='photo.html')prefix='modules/photo.html';
      else if(file==='publish.html')prefix='modules/publish.html';
      else if(file==='map.html')prefix='modules/map.html';
      else if(file==='boutique.html')prefix='boutique.html';
      else if(file==='messages.html')prefix='messages.html';
      else if(file==='index.html'||file==='')prefix='index.html';
      return prefix+(u.search||'')+(u.hash||'');
    }catch(_e){return url;}
  }
  function pathOf(url){return rootUrl(url).split('#')[0].split('?')[0];}
  function pageOf(url,forced){
    if(forced){
      forced=String(forced||'');
      if(forced==='myProfile')return 'profile';
      if(forced==='visitorProfile')return 'profile_public';
      if(pages[forced])return forced;
    }
    var r=rootUrl(url), p=pathOf(r);
    if(p==='modules/user.html')return (/[?&](public=1|uid=|profile_uid=)/.test(r))?'profile_public':'profile';
    if(p==='modules/video.html')return 'video';
    if(p==='modules/photo.html')return 'photo';
    if(p==='modules/publish.html')return 'publish';
    if(p==='modules/map.html')return 'map';
    if(p==='boutique.html')return 'boutique';
    if(p==='messages.html')return 'messages';
    return 'home';
  }
  function hasPost(url){try{var u=new URL(rootUrl(url),location.href);return !!(u.searchParams.get('post')||u.searchParams.get('id'));}catch(_e){return /[?&](post|id)=/.test(rootUrl(url));}}
  function readProfileJson(k){try{return JSON.parse(localStorage.getItem(k)||'null')||null;}catch(_e){return null;}}
  function validProfileUser(u){
    if(!u||typeof u!=='object')return false;
    var id=String(u.id||u.user_id||u.uid||u.uuid||u.auth_id||u.profile_id||u.owner_id||'').trim().toLowerCase();
    var nm=String(u.name||u.full_name||u.display_name||'').trim().toLowerCase();
    if(id.indexOf('guest')===0||id.indexOf('logged_out')===0)return false;
    if(nm==='utilisateur'||nm==='utilisateur happyad'||nm.indexOf('aucun compte')>=0)return false;
    return !!(id||String(u.email||'').trim()||String(u.handle||u.username||'').trim());
  }
  function currentProfileIds(){
    var out=[],seen={};
    function add(v){v=String(v||'').trim();if(!v)return;var k=v.toLowerCase();if(!seen[k]){seen[k]=1;out.push(v);}}
    function addUser(u){if(!validProfileUser(u))return;add(u.id);add(u.user_id);add(u.uid);add(u.uuid);add(u.auth_id);add(u.profile_id);add(u.owner_id);add(u.email);}
    try{if(typeof window.currentUser==='function')addUser(window.currentUser()||{});}catch(_e){}
    try{if(window.UserStore) addUser(window.UserStore.data||{});}catch(_e){}
    ['HAPPYAD_LOGGED_USER','HAPPYAD_CURRENT_USER','HAPPYAD_USER','HAPPYAD_USER_V1','HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL'].forEach(function(k){addUser(readProfileJson(k)||{});});
    try{add(localStorage.getItem('HAPPYAD_AUTH_UID'));}catch(_e){}
    return out;
  }
  function isOwnProfileUid(uid){
    uid=String(uid||'').trim().toLowerCase();if(!uid)return false;
    var ids=currentProfileIds();
    for(var i=0;i<ids.length;i++){if(String(ids[i]||'').trim().toLowerCase()===uid)return true;}
    return false;
  }
  function profileUidFromUrl(url){
    try{var u=new URL(rootUrl(url),location.href);return String(u.searchParams.get('uid')||u.searchParams.get('user_id')||u.searchParams.get('profile_uid')||u.searchParams.get('owner')||u.searchParams.get('owner_id')||'').trim();}catch(_e){return '';}
  }
  function isHome(url){return pageOf(url)==='home';}
  function frameId(page){return 'happyadAppFrame_'+String(page||'page').replace(/[^a-zA-Z0-9_-]/g,'_');}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c;});}
  function showLoader(on){try{var l=loader();if(l)l.classList.remove('on');}catch(_e){}}
  function tapShield(){
    try{
      var sh=document.getElementById(TAP_SHIELD_ID);
      if(!sh){sh=document.createElement('div');sh.id=TAP_SHIELD_ID;sh.setAttribute('aria-hidden','true');try{document.body.appendChild(sh);}catch(_a){}}
      return sh;
    }catch(_e){return null;}
  }
  function showTapShield(on){
    try{
      injectSkeletonStyle();
      var sh=tapShield();if(!sh)return;
      if(on){sh.classList.add('on');sh.setAttribute('aria-hidden','false');}
      else{sh.classList.remove('on');sh.setAttribute('aria-hidden','true');}
    }catch(_e){}
  }
  function beginNavGate(page,url){
    try{
      if(pendingNavTimer){clearTimeout(pendingNavTimer);pendingNavTimer=null;}
      pendingNav={page:String(page||''),url:rootUrl(url||''),t:Date.now()};
      window.__HAPPYAD_NAV_PENDING_UNTIL=Date.now()+2600;
      window.__HAPPYAD_NAV_PENDING_TARGET=pendingNav.page+'|'+pendingNav.url;
      showTapShield(true);
      pendingNavTimer=setTimeout(function(){releaseNavGate('safe-timeout');},2600);
    }catch(_e){}
  }
  function releaseNavGate(reason){
    try{if(pendingNavTimer){clearTimeout(pendingNavTimer);pendingNavTimer=null;}}catch(_t){}
    try{pendingNav=null;}catch(_p){}
    try{window.__HAPPYAD_NAV_PENDING_UNTIL=0;window.__HAPPYAD_NAV_PENDING_TARGET='';window.__HAPPYAD_NAV_PENDING_RELEASE_REASON=String(reason||'release');}catch(_w){}
    try{showTapShield(false);}catch(_e){}
  }
  function navBusy(){
    try{
      if(!pendingNav)return false;
      if((Date.now()-Number(pendingNav.t||0))>2600){releaseNavGate('stale');return false;}
      return true;
    }catch(_e){return false;}
  }
  function samePendingTarget(page,url){
    try{return !!(pendingNav&&String(pendingNav.page||'')===String(page||'')&&rootUrl(pendingNav.url||'')===rootUrl(url||''));}catch(_e){return false;}
  }
  function videoDirect(){return document.getElementById(VIDEO_DIRECT_ID);}
  function readJsonStore(store,k){try{return JSON.parse(store.getItem(k)||'null');}catch(_e){return null;}}
  function videoPostIdFromUrl(url){try{var u=new URL(rootUrl(url),location.href);return String(u.searchParams.get('post')||u.searchParams.get('id')||'').trim();}catch(_e){var m=String(url||'').match(/[?&](?:post|id)=([^&#]+)/);return m?decodeURIComponent(m[1]):'';}}
  function listFromAny(v){try{if(!v)return [];if(Array.isArray(v))return v;if(Array.isArray(v.list))return v.list;if(Array.isArray(v.posts))return v.posts;if(Array.isArray(v.items))return v.items;}catch(_e){}return [];}
  function readVideoDirectList(){
    var out=[];
    try{out=out.concat(listFromAny(readJsonStore(sessionStorage,'HAPPYAD_FAST_OPEN_VIDEO_V1')));}catch(_e){}
    try{out=out.concat(listFromAny(readJsonStore(localStorage,'HAPPYAD_FAST_OPEN_VIDEO_V1')));}catch(_e){}
    try{out=out.concat(listFromAny(readJsonStore(localStorage,'HAPPYAD_VIDEO_CACHE_STABLE_V1')));}catch(_e){}
    try{out=out.concat(listFromAny(readJsonStore(localStorage,'HAPPYAD_GLOBAL_POSTS_CACHE_V1')));}catch(_e){}
    try{out=out.concat(listFromAny(readJsonStore(localStorage,'HAPPYAD_HOME_POSTS_CACHE_V1')));}catch(_e){}
    return out;
  }
  function videoPosterFromPost(p){
    p=p||{};
    return String(p.posterUrl||p.poster_url||p.thumbnailUrl||p.thumbnail_url||p.coverUrl||p.cover_url||p.imageUrl||p.image_url||p.photoUrl||p.photo_url||p.homePosterUrl||p.home_poster_url||p.homeThumbUrl||p.home_thumb_url||p.cachedThumb||p.cached_thumb||p.thumb||p.thumb_url||'').trim();
  }
  function videoPublicUrlFromPath(path){
    path=String(path||'').trim();
    if(!path)return '';
    if(/^https?:\/\//i.test(path)||/^blob:/i.test(path)||/^data:/i.test(path))return path;
    path=path.replace(/^\/+/, '').replace(/^happyad-media\//,'');
    var base=String(window.HAPPYAD_SUPABASE_URL||'https://txjjyhupbejgjcianrmr.supabase.co').replace(/\/+$/,'');
    return base+'/storage/v1/object/public/happyad-media/'+encodeURI(path);
  }
  function videoMediaFromPost(p){
    p=p||{};
    var src=String(p.videoUrl||p.video_url||p.mediaUrl||p.media_url||p.homeMediaUrl||p.home_media_url||p.url||p.src||'').trim();
    if(src)return videoPublicUrlFromPath(src);
    return videoPublicUrlFromPath(p.mediaPath||p.media_path||p.path||'');
  }
  function videoDirectPostForUrl(url){
    var pid=videoPostIdFromUrl(url);
    if(!pid)return null;
    var list=readVideoDirectList(), found=null;
    for(var i=0;i<list.length;i++){
      var p=list[i]||{};
      var id=String(p.id||p.post_id||p.happyadPostId||'').trim();
      var kind=String(p.kind||p.type||p.mediaType||p.media_type||'').toLowerCase();
      var media=String(p.videoUrl||p.video_url||p.mediaUrl||p.media_url||p.homeMediaUrl||p.home_media_url||p.mediaPath||p.media_path||'').toLowerCase();
      var isVid=kind.indexOf('video')>=0||/\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(media)||String(p.__from_video||'')==='1';
      if(!isVid)continue;
      if(id&&id===pid){found=p;break;}
    }
    return found||null;
  }
  function ensureVideoDirect(){
    try{
      injectSkeletonStyle();
      var root=ensureShell(); if(!root)return null;
      var d=videoDirect();
      if(!d){d=document.createElement('div');d.id=VIDEO_DIRECT_ID;d.setAttribute('aria-hidden','true');root.appendChild(d);}
      return d;
    }catch(_e){return null;}
  }
  function showVideoDirect(url,on){
    try{
      var d=ensureVideoDirect(); if(!d)return false;
      if(!on){d.classList.remove('on');d.innerHTML='';d.setAttribute('aria-hidden','true');return false;}
      var p=videoDirectPostForUrl(url)||null;
      var hasSpecific=hasPost(url);
      try{var root=ensureShell();if(root){root.classList.add('on');root.setAttribute('aria-hidden','false');}document.body.classList.add('happyadAppOpen');}catch(_r){}
      var poster=p?videoPosterFromPost(p):'';
      var title=String((p&&(p.title||p.desc||p.description))||(hasSpecific?'Vidéo HAPPYAD':'Vidéos HAPPYAD')).trim();
      var author=String(p&&(p.creatorName||p.display_name||p.creator_name||p.author||p.name)||'').trim();
      d.className='on hasFrame'+(poster?'':' noPoster')+(hasSpecific?' hasSpecific':' generalVideo');
      d.setAttribute('aria-hidden','false');
      d.innerHTML='<div class="haVidFrame '+(poster?'':'noPoster')+'">'+(poster?'<img src="'+esc(poster)+'" alt="">':'')+'</div><div class="haVidFade"></div><div class="haVidCenter" aria-label="Ouverture vidéo"></div><div class="haVidBottom"><div class="haVidTitle"'+(title?' title="'+esc(title)+'"':'')+'></div><div class="haVidMeta"'+(author?' title="'+esc(author)+'"':'')+'></div></div>';
      return true;
    }catch(_e){return false;}
  }
  function state(page,url){var s={};s[NAV_FLAG]=true;s.view=page||'home';s.url=rootUrl(url||pages[page]||'index.html');s.ts=Date.now();return s;}
  function ensureBaseState(){try{var s=history.state;if(!s||!s[NAV_FLAG])history.replaceState(state('home','index.html'),'',location.href);}catch(_e){}}
  function currentNavState(){try{var s=history.state;return s&&s[NAV_FLAG]?s:null;}catch(_e){return null;}}
  function rememberReloadRouteV16ZH(page,url){
    try{
      page=String(page||'home');url=rootUrl(url||pages[page]||'index.html');
      var data={view:page,url:url,t:Date.now(),version:MASTER_VERSION};
      sessionStorage.setItem(RESTORE_KEY_V16ZH,JSON.stringify(data));
      sessionStorage.setItem('HAPPYAD_ACTIVE_APP_VIEW',page);
      sessionStorage.setItem('HAPPYAD_LAST_APP_URL',url);
    }catch(_e){}
  }
  function readReloadRouteV16ZH(){
    try{
      var s=currentNavState();
      if(s&&s.view&&String(s.view)!=='home'){return {view:String(s.view),url:rootUrl(s.url||pages[s.view]||'index.html'),source:'history-state'};}
    }catch(_hs){}
    try{
      var raw=sessionStorage.getItem(RESTORE_KEY_V16ZH);
      var r=raw?JSON.parse(raw):null;
      if(r&&r.view&&String(r.view)!=='home'){
        var u=rootUrl(r.url||pages[r.view]||'index.html');
        if(pageOf(u,String(r.view))===String(r.view)||pages[String(r.view)])return {view:String(r.view),url:u,source:'session-route'};
      }
    }catch(_r){}
    try{
      var p=String(sessionStorage.getItem('HAPPYAD_ACTIVE_APP_VIEW')||'home');
      var u=rootUrl(sessionStorage.getItem('HAPPYAD_LAST_APP_URL')||pages[p]||'index.html');
      if(p&&p!=='home'&&(pageOf(u,p)===p||pages[p]))return {view:p,url:u,source:'session-active'};
    }catch(_a){}
    return null;
  }
  function routeFromLocationV16ZH(){
    try{
      var u=new URL(location.href);
      var app=String(u.searchParams.get('app')||'').trim().toLowerCase();
      var hash=String(u.hash||'').replace(/^#/,'').trim().toLowerCase();
      var key=app||hash;
      if(!key)return null;
      if(key==='video'||key==='videos'||key==='vidéos')return {view:'video',url:'modules/video.html',source:'url'};
      if(key==='photo'||key==='photos')return {view:'photo',url:'modules/photo.html',source:'url'};
      if(key==='profile'||key==='profil'||key==='myprofile')return {view:'profile',url:'modules/user.html',source:'url'};
      if(key==='publish'||key==='publier')return {view:'publish',url:'modules/publish.html',source:'url'};
      if(key==='map'||key==='carte')return {view:'map',url:'modules/map.html',source:'url'};
      if(key==='boutique')return {view:'boutique',url:'boutique.html',source:'url'};
      if(key==='messages'||key==='message'||key==='msg')return {view:'messages',url:'messages.html?mode=list&origin=home',source:'url'};
    }catch(_e){}
    return null;
  }
  function updateState(page,url){
    activePage=page||'home';activeUrl=rootUrl(url||pages[activePage]||'index.html');
    rememberReloadRouteV16ZH(activePage,activeUrl);
    try{if(window.HappyState)HappyState.route(activePage,{url:activeUrl},MASTER_VERSION);}catch(_e){}
  }
  function clearBottomVideoPressed(){
    try{document.querySelectorAll('.bottom .nav').forEach(function(n){n.classList.remove('active','happyadTapOrange','happyadBottomPressedV504','happyadVideoOpeningV16R');});}catch(_e){}
  }
  function setNavActive(page,url){
    try{
      document.querySelectorAll('.bottom .nav').forEach(function(n){n.classList.remove('active');});
      var sel='a[href="index.html"]';
      if(page==='video'){
        if(hasPost(url)){clearBottomVideoPressed();return;}
        sel='a[href^="modules/video.html"],[data-happyad-bottom-video="1"],[data-happyad-app-route^="modules/video.html"]';
      }
      else if(page==='photo')sel='a[href^="modules/photo.html"]';
      else if(page==='profile')sel='a[href^="modules/user.html"]';
      else if(page==='publish')sel='a[href^="modules/publish.html"]';
      else if(page==='boutique')sel='a[href^="boutique.html"],[data-happyad-app-route^="boutique.html"]';
      else if(page==='messages')sel='[data-happyad-bottom-message="1"],[data-happyad-app-route^="messages.html"]';
      var a=document.querySelector('.bottom '+sel);if(a)a.classList.add('active');
    }catch(_e){}
  }
  function pauseFrame(fr,reason){
    try{if(!fr)return;try{fr.contentWindow.postMessage({type:'HAPPYAD_PAUSE_ALL_MEDIA',reason:reason||MASTER_VERSION},'*');}catch(_m){}try{fr.contentWindow.postMessage({type:'HAPPYAD_STOP_MEDIA',reason:reason||MASTER_VERSION},'*');}catch(_s){}}catch(_e){}
  }
  function isProfilePage(page){return page==='profile'||page==='profile_public';}
  function isNoSkeletonPage(page,url){
    page=String(page||'').trim();
    url=rootUrl(url||pages[page]||'');
    if(page==='publish'||page==='story'||page==='stories')return true;
    if(pathOf(url)==='modules/publish.html')return true;
    if(/[?&]mode=story(?:&|$)/i.test(url))return true;
    return false;
  }
  function isSoftOpenPage(page,url){return page&&page!=='home'&&!isNoSkeletonPage(page,url);}
  function isHeavySoftPage(page){return page==='profile'||page==='profile_public'||page==='boutique'||page==='publish'||page==='map'||page==='video'||page==='photo';}
  function isDirectMediaPage(page){return page==='video';}
  function prefetchUrl(url){
    try{
      url=rootUrl(url); if(!url||url==='index.html')return;
      var id='happyadPrefetch_'+url.replace(/[^a-zA-Z0-9_-]/g,'_');
      if(document.getElementById(id))return;
      var l=document.createElement('link');l.id=id;l.rel='prefetch';l.href=url;l.as='document';
      (document.head||document.documentElement).appendChild(l);
    }catch(_e){}
  }
  function scheduleSoftPreload(){
    try{
      if(window[PREFETCH_FLAG])return;window[PREFETCH_FLAG]=true;
      var c=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
      if(c&&c.saveData)return;
      var run=function(){
        try{prefetchUrl('modules/user.html');}catch(_p1){}
        try{setTimeout(function(){prefetchUrl('modules/video.html');},260);}catch(_pv){}
        try{setTimeout(function(){prefetchUrl('boutique.html');},520);}catch(_p2){}
      };
      if('requestIdleCallback' in window)requestIdleCallback(run,{timeout:2200});
      else setTimeout(run,1600);
    }catch(_e){}
  }
  function hideOtherFrames(root,fr,page){
    try{
      if(!root)return;
      root.querySelectorAll('.happyadAppFrame').forEach(function(x){
        if(x!==fr){pauseFrame(x,'switch-to-'+page);x.classList.remove('on');}
      });
    }catch(_e){}
  }
  function minSkeletonMs(page){
    page=String(page||'');
    if(page==='video')return hasPost(activeUrl)?120:180;
    if(page==='profile'||page==='profile_public')return 1250;
    if(page==='boutique')return 1100;
    return 620;
  }
  function maxSkeletonMs(page){
    page=String(page||'');
    if(page==='video')return hasPost(activeUrl)?1150:900;
    if(page==='profile'||page==='profile_public')return 7200;
    if(page==='boutique')return 6500;
    return 4300;
  }
  function frameLooksReady(fr,page){
    try{
      var d=fr&&fr.contentDocument;
      if(!d||!d.body)return false;
      if(d.readyState==='loading')return false;
      var txt=String(d.body.innerText||'').replace(/\s+/g,' ').trim().toLowerCase();
      if(!txt&&!(d.images&&d.images.length)&&!d.querySelector('video,.reel,#videoFeed,.videoFeed,.centralVideo,.happyadVideo'))return false;
      if(page==='profile'||page==='profile_public'){
        var hasProfileNode=!!(d.querySelector('.profileHeader,.profileTop,.profileCard,#profilePostsList,#publicCreatorPosts,.profilePosts,.publicProfile,.profilePost'));
        var hasRealWords=/(publications|posts|abonnés|abonnements|j’aime|j\'aime|abonné|s’abonner|s\'abonner|modifier)/.test(txt);
        var onlyLoading=/(chargement profil|chargement du profil|profil en chargement|aucun compte connecté|préparation|loading)/.test(txt)&&!hasRealWords;
        return (hasProfileNode||hasRealWords)&&!onlyLoading;
      }
      if(page==='boutique'){
        var hasShopNode=!!(d.querySelector('.product-card,.shop-card,.boutique-card,#products,#boutiqueProducts,.boutique,.productGrid,.haShop'));
        var hasShopWords=/(boutique|panier|produit|produits|catégorie|acheter|support|commande)/.test(txt);
        var shopLoading=/(chargement|préparation|loading)/.test(txt)&&!hasShopWords;
        return (hasShopNode||hasShopWords)&&!shopLoading;
      }
      if(page==='video'){
        /* V16R: la centrale vidéo doit apparaître vite. On attend seulement que le document ne soit plus vide,
           pas que toute la liste Supabase soit prête. La frame/play reste au-dessus pendant ce court délai. */
        var hasVideoNode=!!(d.querySelector('video,.reel,#videoFeed,.videoFeed,.centralVideo,.happyadVideo,#videoList,#videoRoot,.video-list'));
        var hasBody=txt.length>12 || hasVideoNode || !!(d.body&&d.body.children&&d.body.children.length>1);
        return hasBody;
      }
      return true;
    }catch(_e){return true;}
  }
  function shouldHoldSkeleton(fr,page,source){
    try{
      if(!fr||fr.getAttribute('data-happyad-defer-visible')!=='1')return false;
      var started=Number(fr.getAttribute('data-happyad-skeleton-start')||0)||Date.now();
      var elapsed=Date.now()-started;
      if(elapsed<minSkeletonMs(page))return true;
      if(elapsed<maxSkeletonMs(page)&&!frameLooksReady(fr,page))return true;
    }catch(_e){}
    return false;
  }
  function centralVideoHasStarted(fr){
    try{
      var d=fr&&fr.contentDocument;if(!d)return false;
      var vids=d.querySelectorAll('video');
      for(var i=0;i<vids.length;i++){
        var v=vids[i];
        if(!v)continue;
        if((v.readyState>=2||v.currentTime>0.06)&&(!v.paused||v.currentTime>0.15))return true;
      }
      if(d.querySelector('.happyadVideoPlaying,.video-playing,.is-playing,.playing video'))return true;
    }catch(_e){}
    return false;
  }
  function holdVideoFrameSafe(fr,url,source){
    try{
      var d=videoDirect();
      if(!d||!d.classList||!d.classList.contains('on')){showVideoDirect(url,false);return;}
      if(fr&&fr.__happyadVideoFrameHoldTimer){clearTimeout(fr.__happyadVideoFrameHoldTimer);fr.__happyadVideoFrameHoldTimer=null;}
      var started=Date.now();
      function hide(reason){
        try{if(fr&&fr.__happyadVideoFrameHoldTimer){clearTimeout(fr.__happyadVideoFrameHoldTimer);fr.__happyadVideoFrameHoldTimer=null;}}catch(_t){}
        try{showVideoDirect(url,false);}catch(_h){}
        try{window.__HAPPYAD_VIDEO_FRAME_HIDDEN__={reason:reason||'hide',t:Date.now(),source:source||''};}catch(_m){}
      }
      function watch(){
        try{
          var cur=videoDirect();
          if(!cur||!cur.classList||!cur.classList.contains('on'))return;
          if(activePage!=='video'){hide('not-video');return;}
          if(centralVideoHasStarted(fr)){hide('central-video-playing');return;}
          /* V16T sécurité: la frame protège du noir, mais ne peut plus bloquer toute l'app indéfiniment. */
          if(Date.now()-started>12000){hide('safe-timeout');return;}
          fr.__happyadVideoFrameHoldTimer=setTimeout(watch,260);
        }catch(_e){try{fr.__happyadVideoFrameHoldTimer=setTimeout(watch,420);}catch(_x){}}
      }
      watch();
    }catch(_e){try{showVideoDirect(url,false);}catch(_x){}}
  }
  function revealFrame(fr,page,url,source){
    try{if(fr&&fr.__happyadLoadWatch){clearTimeout(fr.__happyadLoadWatch);fr.__happyadLoadWatch=null;}}catch(_t){}
    try{if(fr&&fr.__happyadRevealWatch){clearTimeout(fr.__happyadRevealWatch);fr.__happyadRevealWatch=null;}}catch(_rt){}
    if(shouldHoldSkeleton(fr,page,source)){
      try{fr.__happyadRevealWatch=setTimeout(function(){revealFrame(fr,page,url,(source||'frame')+'-hold');},160);}catch(_h){}
      return;
    }
    var root=ensureShell();
    hideOtherFrames(root,fr,page);
    try{
      fr.removeAttribute('data-happyad-loading');
      fr.removeAttribute('data-happyad-defer-visible');
      fr.removeAttribute('data-happyad-skeleton-start');
      fr.style.opacity='';
      fr.style.visibility='';
      fr.classList.add('on');
    }catch(_e){}
    try{root.classList.add('on');root.setAttribute('aria-hidden','false');}catch(_r){}
    try{document.body.classList.add('happyadAppOpen');}catch(_b){}
    clearBootRestoreMaskV16ZJ('frame-visible-'+String(page||''));
    showSkeleton(page,url,false);
    if(page==='video'&&videoDirect()&&videoDirect().classList.contains('on')){holdVideoFrameSafe(fr,url,source||'frame-visible');}
    else {showVideoDirect(url,false);}
    showLoader(false);
    releaseNavGate('reveal-'+String(source||page||''));
    try{setTimeout(function(){fr.contentWindow.postMessage({type:'HAPPYAD_APP_FRAME_VISIBLE',page:page,url:rootUrl(url),source:source||MASTER_VERSION},'*');},45);}catch(_m){}
  }
  function clearVideoRouteMemory(reason){
    try{sessionStorage.removeItem('HAPPYAD_VIDEO_POST_OPEN_V532');}catch(_e){}
    try{sessionStorage.removeItem('HAPPYAD_PENDING_APP_URL_V493');}catch(_e){}
    try{delete window.__happyadVideoPostOpenV532;}catch(_e){window.__happyadVideoPostOpenV532=null;}
    try{window.__HAPPYAD_LAST_VIDEO_NAV_CLEAR__={reason:String(reason||''),t:Date.now()};}catch(_e){}
  }
  function blankVideoFrame(reason){
    /* V6: ne jamais naviguer un iframe vers about:blank pendant le retour.
       Sur Android/Chrome, cette navigation peut créer une entrée d'historique
       dans l'iframe: premier bouton retour = page blanche, deuxième retour = accueil.
       On pause puis on retire le frame vidéo; le prochain open recréera un frame neuf. */
    try{
      var fr=document.getElementById(frameId('video'));
      if(!fr)return;
      pauseFrame(fr,reason||'remove-video-frame');
      fr.classList.remove('on');
      fr.removeAttribute('data-happyad-src');
      fr.removeAttribute('data-happyad-loading');
      fr.style.opacity='';fr.style.visibility='';
      try{fr.remove();}catch(_r){try{fr.parentNode&&fr.parentNode.removeChild(fr);}catch(_x){}}
    }catch(_e){}
  }
  function ensureFrame(page,url){
    var root=ensureShell();if(!root)return null;
    var id=frameId(page);
    var fr=document.getElementById(id);
    if(!fr){
      fr=document.createElement('iframe');
      fr.id=id;fr.className='happyadAppFrame';fr.setAttribute('data-happyad-page',page);
      fr.setAttribute('title','HAPPYAD '+page);
      fr.setAttribute('loading','eager');
      fr.setAttribute('allow','autoplay; camera; microphone; clipboard-write; fullscreen');
      fr.addEventListener('load',function(){
        var pg=fr.getAttribute('data-happyad-page')||page;
        var u=fr.getAttribute('data-happyad-src')||url||pages[pg]||'';
        installBridge(fr,pg);
        if(fr.getAttribute('data-happyad-defer-visible')==='1')revealFrame(fr,pg,u,'frame-load-ready');
        else {showLoader(false);try{fr.removeAttribute('data-happyad-loading');fr.style.opacity='';fr.style.visibility='';}catch(_e){}}
      });
      root.appendChild(fr);
    }
    fr.setAttribute('data-happyad-page',page);
    return fr;
  }
  function sameFrameUrl(fr,url){
    try{return rootUrl(fr.getAttribute('data-happyad-src')||'')===rootUrl(url||'');}catch(_e){return false;}
  }
  function loadFrame(page,url){
    var root=ensureShell(), fr=ensureFrame(page,url);if(!root||!fr)return false;
    var mustReload=!sameFrameUrl(fr,url);
    if(page==='video'&&hasPost(url))mustReload=true;
    var directMedia=isDirectMediaPage(page);
    var deferVisible=mustReload&&isSoftOpenPage(page,url);

    /* V23: vidéo = ouverture centrale seulement.
       Pendant le chargement, on garde juste une frame/poster avec bouton play tournant;
       aucun lecteur vidéo direct n'est lancé hors centrale. */
    if(deferVisible){
      if(directMedia){showSkeleton(page,url,false);showVideoDirect(url,true);}
      else {showVideoDirect(url,false);showSkeleton(page,url,true);}
      try{
        root.querySelectorAll('.happyadAppFrame').forEach(function(x){if(x!==fr)pauseFrame(x,'prepare-module-'+page);});
        fr.classList.remove('on');
        fr.style.opacity='0';
        fr.style.visibility='hidden';
        fr.setAttribute('data-happyad-defer-visible','1');
        fr.setAttribute('data-happyad-skeleton-start',String(Date.now()));
      }catch(_d){}
    }else{
      showVideoDirect(url,false);
      hideOtherFrames(root,fr,page);
    }

    if(mustReload){
      fr.setAttribute('data-happyad-src',rootUrl(url));
      fr.setAttribute('data-happyad-loading','1');
      showLoader(true);
      try{fr.src=rootUrl(url);}catch(_e){try{fr.setAttribute('src',rootUrl(url));}catch(_x){}}
      try{
        if(fr.__happyadLoadWatch)clearTimeout(fr.__happyadLoadWatch);
        fr.__happyadLoadWatch=setTimeout(function(){
          if(fr.getAttribute('data-happyad-defer-visible')==='1')revealFrame(fr,page,url,'frame-load-timeout');
          else{showLoader(false);try{fr.removeAttribute('data-happyad-loading');fr.style.opacity='';fr.style.visibility='';}catch(_w){}}
        },(page==='video'?1200:4200));
      }catch(_w){}
    }

    setNavActive(page,url);updateState(page,url);
    if(deferVisible){
      return true;
    }
    revealFrame(fr,page,url,'frame-show-immediate');
    return true;
  }
  function installBridge(fr,page){
    try{
      var w=fr.contentWindow,d=fr.contentDocument;if(!w||!d||d.__HAPPYAD_CORE_NAV_V8_BRIDGED__)return;d.__HAPPYAD_CORE_NAV_V8_BRIDGED__=true;
      w.happyadOpenInternalUrlV492=function(url,extra){return open(url,extra||{});};
      w.happyadOpenAppPage=function(p,url){return openAppPage(p,url);};
      w.happyadCloseAppPage=function(){return close('frame-close-'+page);};
      d.addEventListener('click',function(e){
        try{
          var a=e.target&&e.target.closest&&e.target.closest('a[href]');if(!a)return;
          var href=a.getAttribute('href')||'';var rt=rootUrl(href);var pp=pageOf(rt);
          if(page==='profile' && pp==='boutique' && a.classList && a.classList.contains('profileBoutiqueBtn')){
            e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
            try{if(window.HappyBoutique&&typeof window.HappyBoutique.open==='function'){return window.HappyBoutique.open({from:'profile-cart',fromTarget:{view:'profile',url:'modules/user.html'+((fr&&fr.contentWindow&&fr.contentWindow.location&&fr.contentWindow.location.search)||'')},source:'frame-profile-boutique-v8'}), false;}}catch(_hb){}
            return open(rt,{source:'frame-profile-boutique-v8'}), false;
          }
          if(pp==='home'||pages[pp]){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();open(rt,{source:'frame-link-'+page});return false;}
        }catch(_e){}
      },true);
    }catch(_e){}
  }
  function pushNav(page,url,replace){
    try{
      var cur=currentNavState();
      var next=state(page,url);
      if(replace||restoring){history.replaceState(next,'',location.href);return;}
      if(cur&&cur.view===next.view&&cur.url===next.url){history.replaceState(next,'',location.href);return;}
      history.pushState(next,'',location.href);
    }catch(_e){}
  }
  function open(url,extra){
    extra=extra||{};url=rootUrl(url||'index.html');var page=pageOf(url,extra.page);
    if(page==='profile_public'){
      var __profileUid=profileUidFromUrl(url);
      if(__profileUid&&isOwnProfileUid(__profileUid)){
        try{localStorage.removeItem('HAPPYAD_ACTIVE_PROFILE');}catch(_ap){}
        try{sessionStorage.removeItem('HAPPYAD_PROFILE_MASTER_ACTIVE_UID');sessionStorage.setItem('HAPPYAD_PROFILE_MASTER_MODE','my');}catch(_ss){}
        url='modules/user.html';
        page='profile';
      }
    }
    if(page==='home')return close('open-home',extra.fromPop||extra.replace);
    if(navBusy()&&!extra.fromPop&&!extra.replace&&!extra.force){
      if(samePendingTarget(page,url))return true;
      try{window.__HAPPYAD_NAV_IGNORED_DURING_PENDING__={page:page,url:url,t:Date.now(),pending:pendingNav};}catch(_ig){}
      return true;
    }
    beginNavGate(page,url);
    if(page!=='video'||!hasPost(url))clearVideoRouteMemory('open-'+page);
    if(page==='video'&&!hasPost(url))blankVideoFrame('open-video-central');
    try{if(page==='boutique'&&window.HappyBoutique&&typeof window.HappyBoutique.rememberReturn==='function'){window.HappyBoutique.rememberReturn(extra&&extra.fromTarget?extra.fromTarget:{view:activePage,url:activeUrl});}}catch(_br){}
    try{if(window.HappyMedia)HappyMedia.pauseAll('before-open-'+page);}catch(_e){}
    var ok=loadFrame(page,url);
    if(ok)pushNav(page,url,!!extra.replace);
    return ok;
  }
  function openAppPage(page,url){
    page=String(page||'').trim();
    if(!url)url=pages[page]||pages[page==='myProfile'?'profile':page==='visitorProfile'?'profile_public':'']||'index.html';
    return open(url,{page:page});
  }
  function close(reason,replace){
    reason=String(reason||'close');
    clearVideoRouteMemory(reason);
    blankVideoFrame(reason);
    try{if(window.HappyMedia)HappyMedia.pauseAll(reason);}catch(_e){}
    var root=shell();
    try{if(root){root.querySelectorAll('.happyadAppFrame').forEach(function(fr){pauseFrame(fr,reason);fr.classList.remove('on');});root.classList.remove('on');root.setAttribute('aria-hidden','true');}}catch(_e){}
    try{showSkeleton('home','index.html',false);showVideoDirect('',false);showLoader(false);releaseNavGate(reason);document.body.classList.remove('happyadAppOpen');clearBootRestoreMaskV16ZJ('close-'+reason);}catch(_e){}
    setNavActive('home','index.html');updateState('home','index.html');
    try{if(replace!==false)history.replaceState(state('home','index.html'),'',location.href);}catch(_e){}
    return true;
  }
  function back(){
    if(activePage&&activePage!=='home'){
      try{history.back();return true;}catch(_e){return close('back-fallback');}
    }
    return false;
  }

  /* V16X: quand l'accueil est déjà visible, le bouton retour téléphone doit quitter
     le site/PWA directement. On ne doit pas rouvrir les anciens états internes
     (profil, boutique, vidéo...) gardés dans l'historique après un retour accueil. */
  var homeBackSkipCountV16X=0;
  function isHomeVisiblyReadyToExitV16X(){
    try{
      if(String(activePage||'home')!=='home')return false;
      if(document.body&&document.body.classList&&document.body.classList.contains('happyadAppOpen'))return false;
      var r=shell();
      if(r){
        if(r.classList&&r.classList.contains('on'))return false;
        if(r.querySelector&&r.querySelector('.happyadAppFrame.on'))return false;
      }
      return true;
    }catch(_e){return String(activePage||'home')==='home';}
  }
  function skipInternalBackFromHomeV16X(s){
    try{
      if(!s||!s[NAV_FLAG])return false;
      if(!isHomeVisiblyReadyToExitV16X())return false;
      homeBackSkipCountV16X++;
      if(homeBackSkipCountV16X>30)return false;
      try{if(window.HappyMedia)HappyMedia.pauseAll('home-phone-back-exit-v16x');}catch(_m){}
      try{showSkeleton('home','index.html',false);showVideoDirect('',false);showLoader(false);releaseNavGate('home-phone-back-exit-v16x');}catch(_ui){}
      setTimeout(function(){try{history.back();}catch(_b){}},0);
      setTimeout(function(){homeBackSkipCountV16X=0;},1800);
      return true;
    }catch(_e){return false;}
  }
  function restore(page,url){
    restoring=true;
    try{
      if(!page||page==='home')close('pop-home',false);
      else open(url||pages[page],{page:page,replace:true,fromPop:true});
    }finally{setTimeout(function(){restoring=false;},0);}
  }
  function activeFrame(){try{var r=shell();return r&&r.querySelector&&r.querySelector('.happyadAppFrame.on[data-happyad-page]');}catch(_e){return null;}}

  window.HappyNavigation={
    version:MASTER_VERSION,rootUrl:rootUrl,pathOf:pathOf,pageOf:pageOf,profileUidFromUrl:profileUidFromUrl,isOwnProfileUid:isOwnProfileUid,open:open,openAppPage:openAppPage,close:close,back:back,restore:restore,
    activeFrame:activeFrame,isBusy:navBusy,releaseNavGate:releaseNavGate,clearVideoRouteMemory:clearVideoRouteMemory,blankVideoFrame:blankVideoFrame,prefetchUrl:prefetchUrl,scheduleSoftPreload:scheduleSoftPreload
  };
  window.happyadOpenInternalUrlV492=function(url,extra){return window.HappyNavigation.open(url,extra||{});};
  window.happyadOpenAppPage=function(page,url){return window.HappyNavigation.openAppPage(page,url);};
  window.happyadCloseAppPage=function(){return window.HappyNavigation.close('legacy-close');};

  try{document.addEventListener('click',function(e){
    try{
      var a=e.target&&e.target.closest&&e.target.closest('a[href]');if(!a)return;
      var href=a.getAttribute('href')||'';var rt=rootUrl(href);var pg=pageOf(rt);
      if(pg&&pg!=='home'&&pages[pg]){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();open(rt,{source:'doc-link'});return false;}
      if(pg==='home'&&(document.body.classList.contains('happyadAppOpen')||activePage!=='home')){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();close('home-link');return false;}
    }catch(_e){}
  },true);}catch(_e){}


  function openBoutiqueFromProfileRequest(fromTarget,source){
    try{
      fromTarget=fromTarget||{view:'profile',url:'modules/user.html'};
      if(window.HappyBoutique&&typeof window.HappyBoutique.open==='function'){
        var ok=window.HappyBoutique.open({from:'profile-cart',fromTarget:fromTarget,source:source||'profile-boutique-message-v10'});
        if(ok)return true;
      }
    }catch(_hb){}
    try{return open('boutique.html?v=532&return=profile&entry=profile-cart&from=profile-cart',{source:source||'profile-boutique-message-v10-fallback',fromTarget:fromTarget||{view:'profile',url:'modules/user.html'}});}catch(_n){}
    return false;
  }

  try{window.addEventListener('message',function(ev){
    try{
      var d=ev&&ev.data;if(!d)return;
      if(d==='HAPPYAD_CLOSE_APP_PAGE'||d.type==='HAPPYAD_CLOSE_APP_PAGE'||d.type==='HAPPYAD_CLOSE_NATIVE_CHAT'){
        ev.stopImmediatePropagation&&ev.stopImmediatePropagation();
        return close('module-internal-back-v11b');
      }
      if(d.type==='HAPPYAD_OPEN_INTERNAL_URL' && d.url){
        ev.stopImmediatePropagation&&ev.stopImmediatePropagation();
        return open(d.url,d.extra||{source:'message-open'});
      }
      if(d.type==='HAPPYAD_PROFILE_BOUTIQUE_OPEN_REQUEST_V10'||d.type==='HAPPYAD_OPEN_BOUTIQUE_DIRECT_V10'||d.type==='HAPPYAD_OPEN_BOUTIQUE_PROFILE_CART'){
        ev.stopImmediatePropagation&&ev.stopImmediatePropagation();
        return openBoutiqueFromProfileRequest(d.fromTarget||{view:'profile',url:'modules/user.html'},d.source||d.type);
      }
      if(false && d.type==='HAPPYAD_OPEN_BOUTIQUE_PROFILE_CART'){
        ev.stopImmediatePropagation&&ev.stopImmediatePropagation();
        if(window.HappyBoutique&&typeof window.HappyBoutique.open==='function'){
          return window.HappyBoutique.open({from:'profile-cart',fromTarget:d.fromTarget||{view:'profile',url:'modules/user.html'},source:'message-profile-cart'});
        }
        return open('boutique.html?v=532&return=profile&entry=profile-cart',{source:'message-profile-cart',fromTarget:d.fromTarget||{view:'profile',url:'modules/user.html'}});
      }
    }catch(_e){}
  },true);}catch(_e){}

  try{window.addEventListener('popstate',function(ev){
    try{
      var s=ev&&ev.state;
      if(skipInternalBackFromHomeV16X(s))return;
      if(s&&s[NAV_FLAG]){restore(String(s.view||'home'),String(s.url||''));return;}
      if(activePage&&activePage!=='home'){close('pop-unknown',false);}
    }catch(_e){}
  },true);}catch(_e){}

  function bootHomeSafety(){
    try{
      var st=currentNavState();
      if(!st||!st.view||st.view==='home'){
        showSkeleton('home','index.html',false);
        showVideoDirect('',false);
        showLoader(false);
        releaseNavGate('boot-home');
        clearBootRestoreMaskV16ZJ('boot-home');
        var root=shell();
        if(root&&!root.querySelector('.happyadAppFrame.on')){root.classList.remove('on');root.setAttribute('aria-hidden','true');}
        document.body.classList.remove('happyadAppOpen');
      }
    }catch(_e){}
  }
  function bootRestoreOpenPageV16ZJ(){
    try{
      var r=routeFromLocationV16ZH()||readReloadRouteV16ZH();
      if(!r||!r.view||String(r.view)==='home')return false;
      var page=String(r.view);
      var url=rootUrl(r.url||pages[page]||'index.html');
      if(!pages[page]&&page!=='profile_public')return false;
      prepareBootRestoreShellV16ZJ(page,url);
      try{history.replaceState(state(page,url),'',location.href);}catch(_st){}
      try{open(url,{page:page,replace:true,force:true,source:'reload-restore-no-home-v16zj'});}catch(_o){}
      return true;
    }catch(_e){clearBootRestoreMaskV16ZJ('restore-error');return false;}
  }
  function bootV16ZJ(){
    ensureBaseState();
    var restored=bootRestoreOpenPageV16ZJ();
    if(!restored)bootHomeSafety();
    scheduleSoftPreload();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootV16ZJ,{once:true});else bootV16ZJ();
  try{if(window.HappyMasterRegistry)HappyMasterRegistry.register('navigation',{file:'core/navigation-master.js',responsibility:'navigation unique, iframe, retour interne, bouton téléphone, ouverture modules',legacy:['happyadOpenInternalUrlV492','happyadOpenAppPage','happyadCloseAppPage','V492 router','V520 history'],active:true,version:MASTER_VERSION});}catch(_e){}
})();
