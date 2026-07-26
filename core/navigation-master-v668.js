(function(){
  'use strict';
  if(window.__HAPPYAD_NAVIGATION_MASTER_V668__)return;
  window.__HAPPYAD_NAVIGATION_MASTER_V668__=true;
  window.__HAPPYAD_NAVIGATION_MASTER_V656__=true;

  var MASTER_VERSION='NAV_MASTER_V668_VISITOR_ON_DEMAND_UID_ISOLATED';
  var VISITOR_PROFILE_PRELOAD_URL_V601='modules/user.html?public=1&deferred=1&v=601';
  var VISITOR_PROFILE_MESSAGE_V601='HAPPYAD_PROFILE_SHOW_V601';
  var NAV_FLAG='__happyadCoreNavV10';
  var SHELL_ID='happyadAppShell';
  var LOADER_ID='happyadAppMiniLoader';
  var SKELETON_ID='happyadAppSkeleton';
  var VIDEO_DIRECT_ID='happyadAppVideoDirect';
  var SKELETON_STYLE_ID='happyadAppSkeletonStyleV625';
  var PREFETCH_FLAG='__happyadSoftPrefetchV27';
  var MAIN_TABS_PRELOAD_FLAG='__happyadMainTabsPreloadV594';
  var VIDEO_TARGET_KEY_V594='HAPPYAD_VIDEO_TARGET_POST_V594';
  var RESTORE_KEY_V16ZH='HAPPYAD_LAST_OPEN_ROUTE_V16ZH';
  var BOOT_RESTORE_CLASS_V16ZJ='happyadBootRestoringPageV16ZJ';
  var activePage='home';
  var activeUrl='index.html';
  var restoring=false;
  var pendingNav=null;
  var pendingNavTimer=null;
  var NAV_GATE_MS=850;

  var pages={
    home:'index.html',
    profile:'modules/user.html',
    profile_public:'modules/user.html?public=1',
    video:'modules/video.html',
    photo:'modules/photo.html',
    message:'modules/message-center.html',
    publish:'modules/publish.html',
    map:'modules/map.html'
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
      '#happyadAppSkeleton .haSkBack:after,#happyadAppSkeleton .haSkTitle:after,#happyadAppSkeleton .haSkCard:after,#happyadAppSkeleton .haSkAvatar:after,#happyadAppSkeleton .haSkLine:after,#happyadAppSkeleton .haSkStat:after,#happyadAppSkeleton .haSkBio:after,#happyadAppSkeleton .haSkBtn:after,#happyadAppSkeleton .haSkChip:after,#happyadAppSkeleton .haSkNameLine:after,#happyadAppSkeleton .haSkHandleLine:after{content:""!important;position:absolute!important;top:0!important;bottom:0!important;left:-95%;width:86%!important;z-index:2!important;background:linear-gradient(105deg,rgba(255,255,255,0) 0%,rgba(255,255,255,.08) 28%,rgba(255,255,255,.46) 50%,rgba(255,255,255,.08) 72%,rgba(255,255,255,0) 100%)!important;transform:skewX(-14deg)!important;animation:happyadSkShimmerV20 2.25s ease-in-out infinite!important;will-change:left!important;opacity:.72!important;pointer-events:none!important;}\n'+
      '#happyadAppVideoDirect{position:absolute!important;inset:0!important;z-index:8!important;display:none!important;background:#000!important;color:#fff!important;overflow:hidden!important;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif!important;pointer-events:none!important;}\n'+      '#happyadAppVideoDirect.on{display:block!important;}\n'+      '#happyadAppVideoDirect .haVidFrame{position:absolute!important;inset:0!important;background:#000!important;display:flex!important;align-items:center!important;justify-content:center!important;overflow:hidden!important;}\n'+      '#happyadAppVideoDirect .haVidFrame img{display:block!important;max-width:100%!important;max-height:100%!important;width:auto!important;height:auto!important;object-fit:contain!important;background:#000!important;filter:brightness(.90)!important;transform:none!important;}\n'+      '#happyadAppVideoDirect .haVidFrame.noPoster{background:radial-gradient(circle at 50% 42%,rgba(255,138,0,.14),transparent 30%),linear-gradient(180deg,#1a1d24,#11141a 58%,#0c0e13)!important;}\n'+      '#happyadAppVideoDirect.generalVideo{background:#12141a!important;}\n'+      '#happyadAppVideoDirect .haVidFade{position:absolute!important;inset:0!important;background:linear-gradient(180deg,rgba(0,0,0,.20),rgba(0,0,0,.02) 44%,rgba(0,0,0,.58))!important;pointer-events:none!important;}\n'+      '#happyadAppVideoDirect .haVidCenter{position:absolute!important;left:50%!important;top:50%!important;transform:translate(-50%,-50%)!important;width:74px!important;height:74px!important;border-radius:50%!important;background:rgba(0,0,0,.48)!important;border:1px solid rgba(255,255,255,.20)!important;box-shadow:0 14px 44px rgba(0,0,0,.55),0 0 34px rgba(255,138,0,.22)!important;display:flex!important;align-items:center!important;justify-content:center!important;}\n'+      '#happyadAppVideoDirect .haVidCenter:before{content:""!important;margin-left:5px!important;border-left:20px solid rgba(255,255,255,.94)!important;border-top:13px solid transparent!important;border-bottom:13px solid transparent!important;z-index:2!important;}\n'+      '#happyadAppVideoDirect .haVidCenter:after{content:""!important;position:absolute!important;inset:-6px!important;border-radius:50%!important;border:3px solid rgba(255,255,255,.18)!important;border-top-color:rgba(255,138,0,.98)!important;border-right-color:rgba(255,189,102,.72)!important;animation:happyadVidPlaySpinV24 .92s linear infinite!important;box-shadow:0 0 18px rgba(255,138,0,.20)!important;}\n'+      '#happyadAppVideoDirect .haVidBottom{position:absolute!important;left:18px!important;right:18px!important;bottom:28px!important;display:grid!important;gap:8px!important;}\n'+      '#happyadAppVideoDirect .haVidTitle{height:16px!important;max-width:72%!important;border-radius:999px!important;background:rgba(255,255,255,.16)!important;overflow:hidden!important;position:relative!important;}\n'+      '#happyadAppVideoDirect .haVidMeta{height:11px!important;max-width:42%!important;border-radius:999px!important;background:rgba(255,255,255,.10)!important;overflow:hidden!important;position:relative!important;}\n'+      '#happyadAppVideoDirect .haVidTitle:after,#happyadAppVideoDirect .haVidMeta:after{content:""!important;position:absolute!important;top:0!important;bottom:0!important;left:-80%!important;width:70%!important;background:linear-gradient(105deg,rgba(255,255,255,0),rgba(255,255,255,.28),rgba(255,255,255,0))!important;animation:happyadSkShimmerV20 1.85s ease-in-out infinite!important;}\n'+      '#happyadAppSkeleton .haSkSpin,#happyadAppMiniLoader,#happyadAppMiniLoader.on{display:none!important;opacity:0!important;visibility:hidden!important;}\n'+      '@keyframes happyadSkShimmerV20{0%{left:-95%}55%,100%{left:120%}}\n'+      '@keyframes happyadVidPlaySpinV24{to{transform:rotate(360deg)}}\n';
      st.textContent += '\n'+
      '#happyadAppSkeleton .haSkTop{height:48px!important;margin-bottom:14px!important;padding:0 2px!important;}\n'+
      '#happyadAppSkeleton .haSkBack{display:grid!important;place-items:center!important;border:1px solid rgba(255,255,255,.18)!important;background:rgba(255,255,255,.045)!important;}\n'+
      '#happyadAppSkeleton .haSkBack:before{content:"‹"!important;color:#fff!important;font-size:32px!important;font-weight:500!important;line-height:1!important;transform:translateY(-1px)!important;}\n'+
      '#happyadAppSkeleton .haSkTitle{width:auto!important;height:auto!important;border-radius:0!important;background:transparent!important;color:#fff!important;font-size:21px!important;font-weight:900!important;line-height:1!important;overflow:visible!important;}\n'+
      '#happyadAppSkeleton .haSkTitle:after,#happyadAppSkeleton .haSkBack:after{display:none!important;}\n'+
      '#happyadAppSkeleton .haSkSubtle{font-size:12px!important;color:rgba(255,255,255,.56)!important;font-weight:700!important;margin:-6px 0 13px 46px!important;}\n'+
      '#happyadAppSkeleton .haSkList{display:grid!important;gap:8px!important;margin-top:4px!important;}\n'+
      '#happyadAppSkeleton .haSkRow{height:68px!important;border-radius:17px!important;background:rgba(255,255,255,.035)!important;border:1px solid rgba(255,255,255,.045)!important;display:grid!important;grid-template-columns:48px minmax(0,1fr) 42px!important;gap:10px!important;align-items:center!important;padding:9px 10px!important;}\n'+
      '#happyadAppSkeleton .haSkRowAvatar{width:48px!important;height:48px!important;border-radius:50%!important;background:rgba(255,255,255,.085)!important;position:relative!important;overflow:hidden!important;}\n'+
      '#happyadAppSkeleton .haSkRowBody{min-width:0!important;}\n'+
      '#happyadAppSkeleton .haSkRowBody .haSkLine{margin:5px 0!important;}\n'+
      '#happyadAppSkeleton .haSkRowTime{width:28px!important;height:8px!important;border-radius:999px!important;background:rgba(255,255,255,.07)!important;justify-self:end!important;}\n'+
      '#happyadAppSkeleton .haSkProfileGrid{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:6px!important;}\n'+
      '#happyadAppSkeleton .haSkProfileGrid .haSkCard{border-radius:10px!important;}\n'+
      '#happyadAppSkeleton .haSkVideoPage{padding:0!important;background:linear-gradient(180deg,#181b22 0%,#08090d 56%,#020203 100%)!important;}\n'+
      '#happyadAppSkeleton .haSkVideoTop{position:absolute!important;left:13px!important;right:13px!important;top:13px!important;z-index:3!important;}\n'+
      '#happyadAppSkeleton .haSkVideoPoster{position:absolute!important;inset:0!important;background:radial-gradient(circle at 50% 40%,rgba(255,255,255,.10),transparent 24%),linear-gradient(160deg,#242833,#0e1016 60%,#050506)!important;}\n'+
      '#happyadAppSkeleton .haSkVideoPlay{position:absolute!important;left:50%!important;top:50%!important;transform:translate(-50%,-50%)!important;width:68px!important;height:68px!important;border-radius:50%!important;background:rgba(255,255,255,.88)!important;box-shadow:0 14px 40px rgba(0,0,0,.42)!important;}\n'+
      '#happyadAppSkeleton .haSkVideoPlay:before{content:""!important;position:absolute!important;left:28px!important;top:21px!important;border-left:19px solid #08090c!important;border-top:13px solid transparent!important;border-bottom:13px solid transparent!important;}\n'+
      '#happyadAppSkeleton .haSkVideoInfo{position:absolute!important;left:18px!important;right:78px!important;bottom:34px!important;}\n'+
      '#happyadAppSkeleton .haSkPublishBox{height:52px!important;border-radius:16px!important;background:rgba(255,255,255,.045)!important;border:1px solid rgba(255,255,255,.06)!important;margin-bottom:10px!important;}\n'+
      '#happyadAppSkeleton .haSkPublishBox.tall{height:132px!important;}\n'+
      '#happyadAppSkeleton .haSkMap{height:calc(100dvh - 92px)!important;border-radius:20px!important;background:linear-gradient(30deg,rgba(255,255,255,.04) 12%,transparent 12.5%,transparent 87%,rgba(255,255,255,.04) 87.5%),linear-gradient(150deg,rgba(255,255,255,.04) 12%,transparent 12.5%,transparent 87%,rgba(255,255,255,.04) 87.5%),linear-gradient(30deg,rgba(255,255,255,.04) 12%,transparent 12.5%,transparent 87%,rgba(255,255,255,.04) 87.5%),#11161b!important;background-size:54px 94px!important;background-position:0 0,0 0,27px 47px!important;border:1px solid rgba(255,255,255,.06)!important;}\n'+
      '#happyadAppSkeleton .haSkRowAvatar:after,#happyadAppSkeleton .haSkRowTime:after,#happyadAppSkeleton .haSkPublishBox:after{content:""!important;position:absolute!important;inset:0!important;background:linear-gradient(105deg,transparent 20%,rgba(255,255,255,.08) 48%,transparent 76%)!important;transform:translateX(-110%)!important;animation:happyadSkSlideV623 1.8s ease-in-out infinite!important;}\n'+
      '@keyframes happyadSkSlideV623{55%,100%{transform:translateX(110%)}}\n';
      (document.head||document.documentElement).appendChild(st);
    }catch(_e){}
  }
  function skeletonMarkup(page,url){
    page=String(page||'');
    var title='HAPPYAD';
    if(page==='profile')title='Mon profil';
    else if(page==='profile_public')title='Profil';
    else if(page==='video')title='Vidéos';
    else if(page==='message')title='Messages';
    else if(page==='photo')title='Photos';
    else if(page==='publish')title='Publication';
    else if(page==='map')title='Carte';
    var top='<div class="haSkTop"><div class="haSkBack"></div><div class="haSkTitle">'+title+'</div></div>';
    var line='<div class="haSkLine lg"></div><div class="haSkLine md"></div>';
    var profileTop='<div class="haSkProfileIdentity"><div class="haSkAvatar haSkAvatarCenter"><i></i></div><div class="haSkNameLine"></div><div class="haSkHandleLine"></div></div>';
    var cards='';for(var i=0;i<9;i++)cards+='<div class="haSkCard"></div>';
    if(page==='video'){
      return '<div class="haSkPage haSkVideoPage" data-page="video"><div class="haSkVideoPoster"></div><div class="haSkVideoTop">'+top+'</div><div class="haSkVideoPlay"></div><div class="haSkVideoInfo">'+line+'</div></div>';
    }
    if(page==='profile'||page==='profile_public'){
      return '<div class="haSkPage haSkProfilePage" data-page="'+page+'">'+profileTop+'<div class="haSkStats"><div class="haSkStat"></div><div class="haSkStat"></div><div class="haSkStat"></div></div><div class="haSkBio">'+line+'</div><div class="haSkActions"><div class="haSkBtn"></div><div class="haSkBtn"></div></div><div class="haSkGrid haSkProfileGrid">'+cards+'</div></div>';
    }
    if(page==='message'){
      var rows='';for(var r=0;r<7;r++)rows+='<div class="haSkRow"><div class="haSkRowAvatar"></div><div class="haSkRowBody"><div class="haSkLine md"></div><div class="haSkLine lg"></div></div><div class="haSkRowTime"></div></div>';
      return '<div class="haSkPage" data-page="message">'+top+'<div class="haSkSubtle">Conversations</div><div class="haSkList">'+rows+'</div></div>';
    }
    if(page==='publish'){
      return '<div class="haSkPage" data-page="publish">'+top+'<div class="haSkPublishBox"></div><div class="haSkPublishBox tall"></div><div class="haSkPublishBox"></div><div class="haSkPublishBox"></div></div>';
    }
    if(page==='map')return '<div class="haSkPage" data-page="map">'+top+'<div class="haSkMap"></div></div>';
    return '<div class="haSkPage" data-page="'+page+'">'+top+line+'<div class="haSkGrid"><div class="haSkCard"></div><div class="haSkCard"></div><div class="haSkCard"></div><div class="haSkCard"></div></div></div>';
  }
  function showSkeleton(page,url,on){
    try{
      if(on&&String(page||'')==='story')on=false;
      injectSkeletonStyle();
      var root=ensureShell(); if(!root)return;
      var sk=skeleton();
      if(!sk){sk=document.createElement('div');sk.id=SKELETON_ID;sk.setAttribute('aria-hidden','true');sk.addEventListener('click',function(ev){try{var back=ev&&ev.target&&ev.target.closest&&ev.target.closest('.haSkBack');if(back){ev.preventDefault();ev.stopPropagation();close('instant-surface-back-v623');}}catch(_e){}},true);root.appendChild(sk);}
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
      else if(file==='message-center.html')prefix='modules/message-center.html';
      else if(file==='publish.html')prefix='modules/publish.html';
      else if(file==='map.html')prefix='modules/map.html';
      else if(file==='index.html'||file==='')prefix='index.html';
      return prefix+(u.search||'')+(u.hash||'');
    }catch(_e){return url;}
  }
  function pathOf(url){return rootUrl(url).split('#')[0].split('?')[0];}
  function publicUidFromUrl(url){
    try{
      var u=new URL(rootUrl(url),location.href);
      return String(u.searchParams.get('uid')||u.searchParams.get('user_id')||u.searchParams.get('profile_uid')||u.searchParams.get('auth_user_id')||u.searchParams.get('account_uid')||u.searchParams.get('owner')||u.searchParams.get('owner_id')||'').trim();
    }catch(_e){return '';}
  }
  function isValidPublicProfileUrl(url){
    try{
      var r=rootUrl(url), p=pathOf(r);
      if(p!=='modules/user.html')return false;
      return !!publicUidFromUrl(r);
    }catch(_e){return false;}
  }
  function normalizeRouteForOpen(page,url){
    page=String(page||'home');url=rootUrl(url||pages[page]||'index.html');
    if(page==='visitorProfile')page='profile_public';
    if(page==='myProfile')page='profile';
    if(page==='profile_public'&&!isValidPublicProfileUrl(url))return {view:'profile',url:'modules/user.html',invalidPublic:true};
    if(pathOf(url)==='modules/user.html'&&/[?&]public=1(?:&|$)/.test(rootUrl(url))&&!isValidPublicProfileUrl(url))return {view:'profile',url:'modules/user.html',invalidPublic:true};
    return {view:page,url:url,invalidPublic:false};
  }
  function pageOf(url,forced){
    if(forced){
      forced=String(forced||'');
      if(forced==='myProfile')return 'profile';
      if(forced==='visitorProfile')return 'profile_public';
      if(pages[forced])return forced;
    }
    var r=rootUrl(url), p=pathOf(r);
    if(p==='modules/user.html')return isValidPublicProfileUrl(r)?'profile_public':'profile';
    if(p==='modules/video.html')return 'video';
    if(p==='modules/photo.html')return 'photo';
    if(p==='modules/message-center.html')return 'message';
    if(p==='modules/publish.html')return 'publish';
    if(p==='modules/map.html')return 'map';
    return 'home';
  }
  function hasPost(url){try{var u=new URL(rootUrl(url),location.href);return !!(u.searchParams.get('post')||u.searchParams.get('id'));}catch(_e){return /[?&](post|id)=/.test(rootUrl(url));}}
  function readProfileJson(k){try{return JSON.parse(localStorage.getItem(k)||'null')||null;}catch(_e){return null;}}
  function validProfileUser(u){
    if(!u||typeof u!=='object')return false;
    var id=String(u.id||u.user_id||u.uid||u.uuid||u.auth_id||u.auth_user_id||u.authUserId||u.account_uid||u.accountUid||u.profile_id||u.owner_id||'').trim().toLowerCase();
    var nm=String(u.name||u.full_name||u.display_name||'').trim().toLowerCase();
    if(id.indexOf('guest')===0||id.indexOf('logged_out')===0)return false;
    if(nm==='utilisateur'||nm==='utilisateur happyad'||nm.indexOf('aucun compte')>=0)return false;
    return !!(id||String(u.email||'').trim()||String(u.handle||u.username||'').trim());
  }
  function currentProfileIds(){
    var out=[],seen={};
    function add(v){v=String(v||'').trim();if(!v)return;var k=v.toLowerCase();if(!seen[k]){seen[k]=1;out.push(v);}}
    function addUser(u){if(!validProfileUser(u))return;add(u.id);add(u.user_id);add(u.uid);add(u.uuid);add(u.auth_id);add(u.auth_user_id);add(u.authUserId);add(u.account_uid);add(u.accountUid);add(u.profile_id);add(u.owner_id);add(u.email);}
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
    return publicUidFromUrl(url);
  }
  function activePublicProfileUid(){
    try{var u=String(sessionStorage.getItem('HAPPYAD_PROFILE_MASTER_ACTIVE_UID')||'').trim();if(u)return u;}catch(_e){}
    try{var u2=String(localStorage.getItem('HAPPYAD_PUBLIC_PROFILE_ACTIVE_UID')||localStorage.getItem('HAPPYAD_ACTIVE_PROFILE_UID')||'').trim();if(u2)return u2;}catch(_e2){}
    try{var ap=readProfileJson('HAPPYAD_ACTIVE_PROFILE')||{};var id=String(ap.id||ap.user_id||ap.uid||ap.auth_user_id||ap.authUserId||ap.account_uid||ap.accountUid||ap.profile_uid||ap.owner_id||ap.creator_id||'').trim();if(id&&ap.__happyadUidLocked)return id;}catch(_e3){}
    return '';
  }
  function ensurePublicProfileUrl(url,extra){
    url=rootUrl(url||'modules/user.html?public=1');
    var uid=profileUidFromUrl(url)||String((extra&&extra.uid)||(extra&&extra.profile&&profileUidFromUrl('modules/user.html?uid='+encodeURIComponent(extra.profile.id||extra.profile.user_id||extra.profile.uid||'')))||'').trim()||activePublicProfileUid();
    if(!uid)return '';
    try{
      var u=new URL(url,location.href);
      u.searchParams.set('public','1');
      u.searchParams.set('uid',uid);
      return 'modules/user.html'+(u.search||'')+(u.hash||'');
    }catch(_e){
      return 'modules/user.html?public=1&uid='+encodeURIComponent(uid);
    }
  }
  function isHome(url){return pageOf(url)==='home';}
  function frameId(page){return 'happyadAppFrame_'+String(page||'page').replace(/[^a-zA-Z0-9_-]/g,'_');}
  function clearVisitorStateForOwnerV649(){
    try{
      sessionStorage.setItem('HAPPYAD_PROFILE_MASTER_MODE','my');
      sessionStorage.removeItem('HAPPYAD_PROFILE_MASTER_ACTIVE_UID');
      sessionStorage.removeItem('HAPPYAD_PROFILE_MASTER_ACTIVE_URL');
    }catch(_s){}
    try{
      localStorage.removeItem('HAPPYAD_ACTIVE_PROFILE');
      localStorage.removeItem('HAPPYAD_ACTIVE_PROFILE_UID');
      localStorage.removeItem('HAPPYAD_PUBLIC_PROFILE_ACTIVE_UID');
    }catch(_l){}
    try{delete window.__HAPPYAD_ACTIVE_PROFILE_RAM;}catch(_r){window.__HAPPYAD_ACTIVE_PROFILE_RAM=null;}
  }
  function cancelVisitorFrameForOwnerV649(reason){
    try{
      var fr=document.getElementById(frameId('profile_public'));if(!fr)return;
      ['__happyadLoadWatch','__happyadRevealWatch','__happyadVisitorRevealFallbackV601'].forEach(function(k){
        try{if(fr[k])clearTimeout(fr[k]);fr[k]=null;}catch(_t){}
      });
      fr.__happyadVisitorOpenRequestedV601=false;
      fr.__happyadVisitorTargetV601=null;
      try{fr.contentWindow&&fr.contentWindow.postMessage({type:'HAPPYAD_PROFILE_HIDE_VISITOR_V649',reason:reason||'owner-profile-open-v649'},'*');}catch(_hide){}
      fr.removeAttribute('data-happyad-defer-visible');
      fr.removeAttribute('data-happyad-skeleton-start');
      fr.classList.remove('on');
      fr.setAttribute('aria-hidden','true');
      fr.setAttribute('inert','');
      fr.style.opacity='';fr.style.visibility='';
      pauseFrame(fr,reason||'owner-profile-open-v649');
    }catch(_e){}
  }
  function prepareOwnerProfileOpenV649(reason){
    clearVisitorStateForOwnerV649();
    cancelVisitorFrameForOwnerV649(reason||'owner-profile-open-v649');
    try{showSkeleton('profile_public','',false);}catch(_sk){}
  }
  function deliverOwnerTargetV649(fr,url,extra){
    try{
      if(!fr||!fr.contentWindow)return false;
      var detail={type:'HAPPYAD_PROFILE_SHOW_OWNER_V649',url:rootUrl(url||'modules/user.html'),source:String(extra&&extra.source||MASTER_VERSION),requestId:'own649-'+Date.now()};
      fr.__happyadOwnerOpenRequestedV649=true;
      try{
        var api=fr.contentWindow.HappyProfileOwnerV649;
        if(api&&typeof api.show==='function')api.show(detail);
        else fr.contentWindow.postMessage(detail,'*');
      }catch(_direct){try{fr.contentWindow.postMessage(detail,'*');}catch(_m){}}
      return true;
    }catch(_e){return false;}
  }
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c;});}
  function showLoader(on){try{var l=loader();if(l)l.classList.remove('on');}catch(_e){}}
  function removeLegacyTapShield(){
    try{var sh=document.getElementById('happyadAppTapShield');if(sh&&sh.parentNode)sh.parentNode.removeChild(sh);}catch(_e){}
  }
  function beginNavGate(page,url){
    try{
      if(pendingNavTimer){clearTimeout(pendingNavTimer);pendingNavTimer=null;}
      pendingNav={page:String(page||''),url:rootUrl(url||''),t:Date.now()};
      window.__HAPPYAD_NAV_PENDING_UNTIL=Date.now()+NAV_GATE_MS;
      window.__HAPPYAD_NAV_PENDING_TARGET=pendingNav.page+'|'+pendingNav.url;
      removeLegacyTapShield();
      pendingNavTimer=setTimeout(function(){releaseNavGate('safe-timeout');},NAV_GATE_MS);
    }catch(_e){}
  }
  function releaseNavGate(reason){
    try{if(pendingNavTimer){clearTimeout(pendingNavTimer);pendingNavTimer=null;}}catch(_t){}
    try{pendingNav=null;}catch(_p){}
    try{window.__HAPPYAD_NAV_PENDING_UNTIL=0;window.__HAPPYAD_NAV_PENDING_TARGET='';window.__HAPPYAD_NAV_PENDING_RELEASE_REASON=String(reason||'release');}catch(_w){}
    removeLegacyTapShield();
    try{if(window.HappyOverlayMasterV615)window.HappyOverlayMasterV615.schedule('nav-release-'+String(reason||''));}catch(_o){}
  }
  function navBusy(){
    try{
      if(!pendingNav)return false;
      if((Date.now()-Number(pendingNav.t||0))>NAV_GATE_MS){releaseNavGate('stale');return false;}
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
      var nr=normalizeRouteForOpen(page,url);
      page=nr.view;url=nr.url;
      var data={view:page,url:url,t:Date.now(),version:MASTER_VERSION};
      sessionStorage.setItem(RESTORE_KEY_V16ZH,JSON.stringify(data));
      sessionStorage.setItem('HAPPYAD_ACTIVE_APP_VIEW',page);
      sessionStorage.setItem('HAPPYAD_LAST_APP_URL',url);
    }catch(_e){}
  }
  function readReloadRouteV16ZH(){
    try{
      var s=currentNavState();
      if(s&&s.view&&String(s.view)!=='home'){var hs=normalizeRouteForOpen(String(s.view),s.url||pages[s.view]||'index.html');if(!hs.invalidPublic)return {view:hs.view,url:hs.url,source:'history-state'};}
    }catch(_hs){}
    try{
      var raw=sessionStorage.getItem(RESTORE_KEY_V16ZH);
      var r=raw?JSON.parse(raw):null;
      if(r&&r.view&&String(r.view)!=='home'){
        var rr=normalizeRouteForOpen(String(r.view),r.url||pages[r.view]||'index.html');
        if(!rr.invalidPublic&&(pageOf(rr.url,rr.view)===rr.view||pages[rr.view]))return {view:rr.view,url:rr.url,source:'session-route'};
      }
    }catch(_r){}
    try{
      var p=String(sessionStorage.getItem('HAPPYAD_ACTIVE_APP_VIEW')||'home');
      var sr=normalizeRouteForOpen(p,sessionStorage.getItem('HAPPYAD_LAST_APP_URL')||pages[p]||'index.html');
      if(sr.view&&sr.view!=='home'&&!sr.invalidPublic&&(pageOf(sr.url,sr.view)===sr.view||pages[sr.view]))return {view:sr.view,url:sr.url,source:'session-active'};
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
      if(key==='message'||key==='messages')return {view:'message',url:'modules/message-center.html',source:'url'};
      if(key==='profile'||key==='profil'||key==='myprofile')return {view:'profile',url:'modules/user.html',source:'url'};
      if(key==='publish'||key==='publier')return {view:'publish',url:'modules/publish.html',source:'url'};
      if(key==='map'||key==='carte')return {view:'map',url:'modules/map.html',source:'url'};
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
      page=String(page||'home');
      document.querySelectorAll('.bottom .nav').forEach(function(n){n.classList.remove('active');});
      var visible=(page==='home'||page==='profile'||page==='profile_public'||page==='video'||page==='message');
      if(document.body){document.body.classList.toggle('happyadMainDockVisible',visible);document.body.classList.toggle('happyadPublishFullscreenV586',page==='publish');document.body.classList.toggle('happyadParentAppLockedV604',visible&&page!=='home');document.body.setAttribute('data-happyad-main-page',page);}try{document.documentElement.classList.toggle('happyadParentAppLockedV604',visible&&page!=='home');}catch(_lock){}
      var key='';
      if(page==='home')key='home';
      else if(page==='video')key='video';
      else if(page==='message')key='message';
      else if(page==='profile'||page==='profile_public')key='profile';
      else if(page==='publish')key='publish';
      var button=key?document.querySelector('.bottom [data-happyad-main-nav="'+key+'"]'):null;
      if(button)button.classList.add('active');
      try{window.dispatchEvent(new CustomEvent('HAPPYAD_NAV_CHANGED_V586',{detail:{page:page,url:rootUrl(url||pages[page]||'index.html'),dockVisible:visible}}));}catch(_ev){}
    }catch(_e){}
  }
  function pauseFrame(fr,reason){
    try{
      if(!fr)return;
      var why=reason||MASTER_VERSION;
      try{fr.contentWindow.postMessage({type:'HAPPYAD_APP_FRAME_HIDDEN',reason:why,source:MASTER_VERSION},'*');}catch(_h){}
      try{fr.contentWindow.postMessage({type:'HAPPYAD_PAUSE_ALL_MEDIA',reason:why},'*');}catch(_m){}
      try{fr.contentWindow.postMessage({type:'HAPPYAD_STOP_MEDIA',reason:why},'*');}catch(_s){}
      try{fr.setAttribute('aria-hidden','true');fr.setAttribute('inert','');}catch(_a){}
    }catch(_e){}
  }
  function resumeFrame(fr,page,url,source){
    try{
      if(!fr)return;
      try{fr.removeAttribute('inert');fr.setAttribute('aria-hidden','false');}catch(_a){}
      var msg={type:'HAPPYAD_APP_FRAME_VISIBLE',page:page,url:rootUrl(url),source:source||MASTER_VERSION};
      try{fr.contentWindow.postMessage({type:'HAPPYAD_MODULE_RESUME',page:page,url:rootUrl(url),source:source||MASTER_VERSION},'*');}catch(_r){}
      try{fr.contentWindow.postMessage(msg,'*');}catch(_v){}
    }catch(_e){}
  }
  function isProfilePage(page){return page==='profile'||page==='profile_public';}
  function isNoSkeletonPage(page,url){
    page=String(page||'').trim();
    url=rootUrl(url||pages[page]||'');
    /* V625 : toutes les surfaces réelles s'ouvrent directement.
       Le seul squelette conservé est celui du Profil visiteur, car l'UID doit
       être verrouillé avant d'afficher la frame afin d'éviter un mauvais profil. */
    if(page==='profile_public')return false;
    if(pathOf(url)==='modules/user.html'&&isValidPublicProfileUrl(url))return false;
    return true;
  }
  function isSoftOpenPage(page,url){return page&&page!=='home'&&!isNoSkeletonPage(page,url);}
  function isHeavySoftPage(page){return page==='profile'||page==='profile_public'||page==='publish'||page==='map'||page==='video'||page==='photo'||page==='message';}
  function isDirectMediaPage(page){return page==='video';}
  /* Les pages contextuelles restent à la demande; les quatre onglets principaux sont préparés une seule fois par V625. */
  function prefetchUrl(url){
    try{window.__HAPPYAD_LAZY_PREFETCH_SKIPPED_V614__=rootUrl(url||'');}catch(_e){}
    return false;
  }
  function isPersistentMainPage(page){
    page=String(page||'');
    return page==='video'||page==='message'||page==='profile'||page==='profile_public'||page==='publish';
  }
  function persistentMainUrl(page){
    page=String(page||'');
    if(page==='video')return 'modules/video.html';
    if(page==='message')return 'modules/message-center.html?mode=inbox&source=main-tabs-v614';
    if(page==='profile')return 'modules/user.html';
    if(page==='profile_public')return VISITOR_PROFILE_PRELOAD_URL_V601;
    if(page==='publish')return 'modules/publish.html';
    return pages[page]||'index.html';
  }
  function preloadFrame(page,url){
    try{
      page=String(page||'').trim();
      if(!isPersistentMainPage(page)||page==='profile_public')return false;
      url=rootUrl(url||persistentMainUrl(page));
      var root=ensureShell();if(!root)return false;
      var fr=ensureFrame(page,url);if(!fr)return false;
      if(String(fr.getAttribute('data-happyad-src')||'').trim())return true;
      fr.setAttribute('data-happyad-preloading-v594','1');
      fr.setAttribute('data-happyad-src',url);
      fr.setAttribute('data-happyad-loading','1');
      fr.setAttribute('loading','eager');
      fr.classList.remove('on');
      fr.style.opacity='';fr.style.visibility='';
      fr.setAttribute('aria-hidden','true');fr.setAttribute('inert','');
      fr.src=url;
      try{window.__HAPPYAD_MAIN_PAGE_PRELOAD_V625__=window.__HAPPYAD_MAIN_PAGE_PRELOAD_V625__||{};window.__HAPPYAD_MAIN_PAGE_PRELOAD_V625__[page]={started:true,at:Date.now(),url:url};}catch(_w){}
      return true;
    }catch(_e){return false;}
  }
  function preloadVideoFrameV624(){
    try{
      var page='video',url=persistentMainUrl(page),root=ensureShell();
      if(!root)return false;
      var fr=ensureFrame(page,url);if(!fr)return false;
      if(String(fr.getAttribute('data-happyad-src')||'').trim())return true;
      fr.setAttribute('data-happyad-preloading-v594','1');
      fr.setAttribute('data-happyad-src',rootUrl(url));
      fr.setAttribute('data-happyad-loading','1');
      fr.setAttribute('loading','eager');
      fr.classList.remove('on');
      fr.style.opacity='';fr.style.visibility='';
      fr.setAttribute('aria-hidden','true');fr.setAttribute('inert','');
      fr.src=rootUrl(url);
      try{window.__HAPPYAD_VIDEO_WARMUP_V624__={started:true,at:Date.now(),url:url};}catch(_w){}
      return true;
    }catch(_e){return false;}
  }
  function scheduleVideoWarmupV624(){
    try{
      if(window.__HAPPYAD_VIDEO_WARMUP_SCHEDULED_V624__)return false;
      window.__HAPPYAD_VIDEO_WARMUP_SCHEDULED_V624__=true;
      var run=function(){
        try{
          if(activePage!=='home'){window.__HAPPYAD_VIDEO_WARMUP_SCHEDULED_V624__=false;return;}
          preloadVideoFrameV624();
        }catch(_e){}
      };
      if('requestIdleCallback' in window)requestIdleCallback(run,{timeout:450});
      else setTimeout(run,160);
      return true;
    }catch(_e){return false;}
  }
  function scheduleMainTabsPreloadV594(){
    try{
      if(window[MAIN_TABS_PRELOAD_FLAG])return true;
      window[MAIN_TABS_PRELOAD_FLAG]=true;
      window.__HAPPYAD_MAIN_TABS_DIRECT_V625__=true;
      var queue=[
        {page:'video',delay:80},
        {page:'profile',delay:380},
        {page:'message',delay:820},
        {page:'publish',delay:1320}
      ];
      queue.forEach(function(item){
        setTimeout(function(){
          try{
            if(item.page==='video')preloadVideoFrameV624();
            else preloadFrame(item.page,persistentMainUrl(item.page));
          }catch(_e){}
        },item.delay);
      });
      return true;
    }catch(_e){return false;}
  }
  function scheduleSoftPreload(){
    try{window[PREFETCH_FLAG]=true;window.__HAPPYAD_SOFT_PRELOAD_DISABLED_V614__=true;}catch(_e){}
    return false;
  }
  function hideOtherFrames(root,fr,page){
    try{
      if(!root)return;
      root.querySelectorAll('.happyadAppFrame').forEach(function(x){
        if(x!==fr){pauseFrame(x,'switch-to-'+page);x.classList.remove('on');x.style.opacity='';x.style.visibility='';}
      });
    }catch(_e){}
  }
  function minSkeletonMs(page){
    page=String(page||'');
    if(page==='profile_public')return 0;
    return 0;
  }
  function maxSkeletonMs(page){
    page=String(page||'');
    /* V625 : le Profil visiteur conserve sa garde interne et ne doit jamais être
       révélé au milieu du changement d'UID. Le squelette reste jusqu'au vrai rendu. */
    if(page==='profile_public')return 12000;
    if(page==='profile')return 12000;
    if(page==='message')return 12000;
    if(page==='video')return 0;
    return 4200;
  }
  function frameLooksReady(fr,page){
    try{
      if(fr&&fr.getAttribute('data-happyad-first-render-ready-v623')==='1')return true;
      var d=fr&&fr.contentDocument;
      if(!d||!d.body)return false;
      if(d.readyState==='loading')return false;
      var txt=String(d.body.innerText||'').replace(/\s+/g,' ').trim().toLowerCase();
      if(!txt&&!(d.images&&d.images.length)&&!d.querySelector('video,.reel,#videoFeed,.videoFeed,.centralVideo,.happyadVideo'))return false;
      if(page==='profile'||page==='profile_public'){
        var html=d.documentElement;
        var gate=!!(html&&html.classList&&html.classList.contains('haProfileBootGateV621C'));
        var masterReady=!!(html&&html.classList&&html.classList.contains('haProfileReadyV621C'));
        var signaled=fr.getAttribute('data-happyad-first-render-ready-v623')==='1';
        return !gate&&(masterReady||signaled);
      }
      if(page==='message'){
        var messageMaster=false;
        try{messageMaster=!!(fr.contentWindow&&fr.contentWindow.HappyadMessageMaster);}catch(_m){}
        return messageMaster||fr.getAttribute('data-happyad-first-render-ready-v623')==='1';
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
          /* HAPPYAD V34: ne pas laisser la couche noire directe bloquer la centrale vidéo.
             Dès que la frame vidéo est prête, on l'affiche; le module vidéo gère son propre chargement. */
          if(Date.now()-started>900&&frameLooksReady(fr,'video')){hide('central-frame-ready-v34');return;}
          if(Date.now()-started>2400){hide('video-direct-short-timeout-v34');return;}
          /* V16T sécurité: la frame protège du noir, mais ne peut plus bloquer toute l'app indéfiniment. */
          if(Date.now()-started>12000){hide('safe-timeout');return;}
          fr.__happyadVideoFrameHoldTimer=setTimeout(watch,260);
        }catch(_e){try{fr.__happyadVideoFrameHoldTimer=setTimeout(watch,420);}catch(_x){}}
      }
      watch();
    }catch(_e){try{showVideoDirect(url,false);}catch(_x){}}
  }
  function revealFrame(fr,page,url,source){
    /* V656 : aucun rappel différé d'une ancienne page ne peut reprendre l'écran.
       Ce verrou bloque notamment une frame Vidéo qui termine son chargement après
       le retour du fullscreen photo dans un Profil visiteur. */
    if(page&&activePage&&page!==activePage){
      try{
        if(fr){fr.classList.remove('on');fr.setAttribute('aria-hidden','true');fr.setAttribute('inert','');fr.style.opacity='';fr.style.visibility='';pauseFrame(fr,'stale-frame-reveal-blocked-v656-'+page);}
        if(page==='video'){showVideoDirect('',false);blankVideoFrame('stale-video-reveal-v656');}
        if(page==='profile_public')showSkeleton('profile_public',url,false);
      }catch(_stale){}
      return false;
    }
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
      fr.removeAttribute('inert');
      fr.setAttribute('aria-hidden','false');
    }catch(_e){}
    resumeFrame(fr,page,url,source||'frame-visible-v615');
    try{root.classList.add('on');root.setAttribute('aria-hidden','false');}catch(_r){}
    try{document.body.classList.add('happyadAppOpen');}catch(_b){}
    clearBootRestoreMaskV16ZJ('frame-visible-'+String(page||''));
    showSkeleton(page,url,false);
    if(page==='video'&&videoDirect()&&videoDirect().classList.contains('on')){holdVideoFrameSafe(fr,url,source||'frame-visible');}
    else {showVideoDirect(url,false);}
    showLoader(false);
    releaseNavGate('reveal-'+String(source||page||''));
    try{setTimeout(function(){resumeFrame(fr,page,url,source||MASTER_VERSION);},45);}catch(_m){}
  }
  function clearVideoRouteMemory(reason){
    try{sessionStorage.removeItem('HAPPYAD_VIDEO_POST_OPEN_V532');}catch(_e){}
    try{sessionStorage.removeItem('HAPPYAD_PENDING_APP_URL_V493');}catch(_e){}
    try{delete window.__happyadVideoPostOpenV532;}catch(_e){window.__happyadVideoPostOpenV532=null;}
    try{window.__HAPPYAD_LAST_VIDEO_NAV_CLEAR__={reason:String(reason||''),t:Date.now()};}catch(_e){}
  }
  function blankVideoFrame(reason){
    /* V594: la centrale Vidéos est un onglet permanent.
       On la met en pause et on la cache, sans supprimer ni recharger son iframe. */
    try{
      var fr=document.getElementById(frameId('video'));
      if(!fr)return;
      pauseFrame(fr,reason||'pause-persistent-video-frame-v594');
      fr.classList.remove('on');
      fr.style.opacity='';fr.style.visibility='';
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
      fr.setAttribute('aria-hidden','true');
      fr.setAttribute('inert','');
      fr.setAttribute('allow','autoplay; camera; microphone; clipboard-write; fullscreen');
      fr.addEventListener('load',function(){
        var pg=fr.getAttribute('data-happyad-page')||page;
        var declared=String(fr.getAttribute('data-happyad-src')||'').trim();
        if(!declared){return;}
        var u=declared||url||pages[pg]||'';
        installBridge(fr,pg);
        if(pg==='profile'&&fr.__happyadOwnerOpenRequestedV649){try{deliverOwnerTargetV649(fr,declared||u||'modules/user.html',{source:'owner-frame-load-v649'});}catch(_ownerLoad){}}
        if(pg==='profile_public'&&fr.__happyadVisitorTargetV601){
          if(activePage!=='profile_public'){
            try{fr.__happyadVisitorOpenRequestedV601=false;fr.removeAttribute('data-happyad-loading');fr.removeAttribute('data-happyad-defer-visible');fr.style.opacity='';fr.style.visibility='';fr.classList.remove('on');fr.setAttribute('aria-hidden','true');fr.setAttribute('inert','');pauseFrame(fr,'visitor-load-hidden-owner-active-v649');}catch(_visitorHidden){}
            return;
          }
          try{
            fr.removeAttribute('data-happyad-preloading-v594');
            fr.removeAttribute('data-happyad-loading');
            fr.setAttribute('data-happyad-ready-v594','1');
            deliverVisitorTargetV601(fr,fr.__happyadVisitorTargetV601.url,fr.__happyadVisitorTargetV601.extra||{});
            if(fr.getAttribute('data-happyad-defer-visible')==='1'||fr.__happyadVisitorOpenRequestedV601){
              setTimeout(function(){revealFrame(fr,'profile_public',fr.getAttribute('data-happyad-route-url-v601')||u,'visitor-load-target-v601');},24);
            }else{
              fr.style.opacity='';fr.style.visibility='';pauseFrame(fr,'visitor-preload-ready-v601');
            }
          }catch(_visitorLoad){}
          return;
        }
        if(fr.getAttribute('data-happyad-preloading-v594')==='1'){
          try{
            var currentHref=String(fr.contentWindow&&fr.contentWindow.location&&fr.contentWindow.location.href||'');
            if(currentHref==='about:blank'&&String(u||'')&&String(u||'')!=='about:blank')return;
          }catch(_href){}
          try{
            fr.removeAttribute('data-happyad-preloading-v594');
            fr.removeAttribute('data-happyad-loading');
            fr.setAttribute('data-happyad-ready-v594','1');
            fr.style.opacity='';fr.style.visibility='';
            pauseFrame(fr,'persistent-preload-ready-v594');
            fr.contentWindow&&fr.contentWindow.postMessage({type:'HAPPYAD_MAIN_TAB_PRELOADED_V594',page:pg},'*');
          }catch(_pre){}
          return;
        }
        if(isPersistentMainPage(pg)&&!fr.classList.contains('on')){
          try{fr.removeAttribute('data-happyad-loading');fr.setAttribute('data-happyad-ready-v594','1');fr.style.opacity='';fr.style.visibility='';pauseFrame(fr,'persistent-hidden-load-ready-v594');}catch(_hidden){}
          return;
        }
        if(fr.getAttribute('data-happyad-defer-visible')==='1')revealFrame(fr,pg,u,'frame-load-ready');
        else {
          showLoader(false);
          try{fr.removeAttribute('data-happyad-loading');fr.setAttribute('data-happyad-ready-v594','1');fr.style.opacity='';fr.style.visibility='';}catch(_e){}
          if(fr.classList.contains('on')){
            try{resumeFrame(fr,pg,u,'frame-load-visible-v625');}catch(_resume){}
          }
        }
      });
      root.appendChild(fr);
    }
    fr.setAttribute('data-happyad-page',page);
    return fr;
  }
  function visitorProfileSeedV601(uid,extra){
    uid=String(uid||'').trim();extra=extra||{};
    var candidates=[];
    try{if(extra.profile)candidates.push(extra.profile);}catch(_e){}
    try{if(extra.detail&&extra.detail.profile)candidates.push(extra.detail.profile);}catch(_e2){}
    try{var ap=readProfileJson('HAPPYAD_ACTIVE_PROFILE');if(ap)candidates.push(ap);}catch(_e3){}
    try{var stable=readProfileJson('HAPPYAD_PUBLIC_PROFILE_STABLE_'+uid);if(stable)candidates.push(stable);}catch(_e4){}
    try{var ram=window.__HAPPYAD_PUBLIC_PROFILE_RAM_CACHE__||{};if(ram[uid])candidates.push(ram[uid]);}catch(_e5){}
    for(var i=0;i<candidates.length;i++){
      var p=candidates[i]||{};
      var id=String(p.id||p.user_id||p.uid||p.auth_user_id||p.account_uid||p.profile_uid||p.owner_id||p.creator_id||'').trim();
      if(id&&id===uid)return Object.assign({},p,{id:uid,user_id:uid,uid:uid,__happyadUidLocked:true,__happyadRouteUid:uid});
    }
    return {id:uid,user_id:uid,uid:uid,name:'Chargement profil...',__happyadUidLocked:true,__happyadRouteUid:uid};
  }
  function visitorFrameReusableV601(fr){
    try{
      if(!fr||!String(fr.getAttribute('data-happyad-src')||'').trim())return false;
      var href=String(fr.contentWindow&&fr.contentWindow.location&&fr.contentWindow.location.href||'');
      var d=fr.contentDocument;
      if(!href||href==='about:blank'||!d||d.readyState==='loading')return false;
      /* V656 : une frame Profil visiteur qui a été naviguée par erreur vers une
         page Vidéo n'est jamais réutilisée comme profil. */
      var path='';try{path=new URL(href,location.href).pathname.replace(/\/+/g,'/');}catch(_u){}
      if(!/(?:^|\/)modules\/user\.html$/i.test(path)&&!/(?:^|\/)user\.html$/i.test(path))return false;
      return true;
    }catch(_e){return false;}
  }
  function visitorMessageV601(url,extra){
    url=ensurePublicProfileUrl(url,extra||{});
    var uid=profileUidFromUrl(url);
    return {type:VISITOR_PROFILE_MESSAGE_V601,uid:uid,url:url,profile:visitorProfileSeedV601(uid,extra||{}),source:String(extra&&extra.source||MASTER_VERSION),requestId:'vp601-'+Date.now()+'-'+Math.random().toString(36).slice(2,7)};
  }
  function deliverVisitorTargetV601(fr,url,extra){
    try{
      if(!fr||!fr.contentWindow)return false;
      var msg=visitorMessageV601(url,extra||{});if(!msg.uid)return false;
      fr.__happyadVisitorTargetV601={url:msg.url,extra:extra||{},message:msg};
      fr.setAttribute('data-happyad-route-url-v601',msg.url);
      fr.setAttribute('data-happyad-target-uid-v601',msg.uid);
      try{fr.contentWindow.postMessage(msg,'*');}catch(_m){}
      return true;
    }catch(_e){return false;}
  }
  function destroyVisitorFrameV668(reason){
    try{
      var fr=document.getElementById(frameId('profile_public'));if(!fr)return false;
      try{pauseFrame(fr,reason||'visitor-destroy-v668');}catch(_p){}
      try{if(fr.__happyadLoadWatch)clearTimeout(fr.__happyadLoadWatch);if(fr.__happyadRevealWatch)clearTimeout(fr.__happyadRevealWatch);if(fr.__happyadVisitorRevealFallbackV601)clearTimeout(fr.__happyadVisitorRevealFallbackV601);}catch(_t){}
      fr.src='about:blank';fr.remove();return true;
    }catch(_e){return false;}
  }
  function resetVisitorFrameForUrl(url){
    try{
      var target=rootUrl(url||''),targetUid=profileUidFromUrl(target),fr=document.getElementById(frameId('profile_public'));
      if(!fr)return;
      var currentUid=String(fr.getAttribute('data-happyad-target-uid-v601')||profileUidFromUrl(fr.getAttribute('data-happyad-route-url-v601')||fr.getAttribute('data-happyad-src')||'')).trim();
      if(!targetUid||!currentUid||currentUid!==targetUid){destroyVisitorFrameV668('visitor-uid-change-v668');return;}
      fr.setAttribute('data-happyad-route-url-v601',target);
    }catch(_e){destroyVisitorFrameV668('visitor-reset-error-v668');}
  }
  function sameFrameUrl(fr,url){
    try{return rootUrl(fr.getAttribute('data-happyad-src')||'')===rootUrl(url||'');}catch(_e){return false;}
  }
  function loadFrame(page,url,extra){
    extra=extra||{};
    var root=ensureShell();if(!root)return false;
    if(page==='profile_public')resetVisitorFrameForUrl(url);
    var fr=ensureFrame(page,url);if(!fr)return false;
    if(page==='profile'){
      /* V687 : un clic explicite sur le bouton Mon profil prépare Publications
         avant que la frame déjà chaude soit rendue visible. Un retour depuis une
         photo/vidéo ne passe pas par cette source et conserve donc son onglet. */
      try{
        var freshSource=String(extra&&extra.source||'');
        if(/main-tabs-profile-v595/i.test(freshSource)){
          var tabsApi=fr.contentWindow&&(fr.contentWindow.HappyProfileContentTabsV687||fr.contentWindow.HappyProfileContentTabsV686||fr.contentWindow.HappyProfileContentTabsV685);
          if(tabsApi&&typeof tabsApi.prepareFreshOpen==='function')tabsApi.prepareFreshOpen('main-tabs-profile-v687');
        }
      }catch(_tabsPrepare){}
      prepareOwnerProfileOpenV649('load-owner-profile-v649');deliverOwnerTargetV649(fr,url,extra);
    }
    /* V649 : un clic sur Mon profil verrouille d'abord le mode propriétaire.
       Le profil visiteur persistant reste en cache, mais ne peut plus reprendre l'écran. */
    /* V625 : un clic sur n'importe quel onglet principal pendant son préchargement
       transforme immédiatement la frame cachée en frame active. Le gestionnaire
       load ne doit donc plus la remettre en pause après le clic. */
    if(page!=='profile_public'){
      try{fr.removeAttribute('data-happyad-preloading-v594');}catch(_pre){}
    }
    var visitorPersistent=(page==='profile_public');
    var visitorHasSource=visitorPersistent&&!!String(fr.getAttribute('data-happyad-src')||'').trim();
    var visitorReady=visitorPersistent&&visitorFrameReusableV601(fr);
    var mustReload=visitorPersistent?(!visitorHasSource||!visitorReady):!sameFrameUrl(fr,url);
    var directMedia=isDirectMediaPage(page);
    /* V625 : toutes les pages utilisent directement leur frame réelle, même lors
       de la première ouverture. Seul le Profil visiteur reste masqué derrière son
       squelette jusqu'au verrouillage et au rendu du bon UID. */
    var deferVisible=visitorPersistent?(mustReload||!visitorReady):false;
    if(visitorPersistent){
      fr.__happyadVisitorOpenRequestedV601=true;
      fr.__happyadVisitorTargetV601={url:rootUrl(url),extra:extra||{}};
    }

    /* V23: vidéo = ouverture centrale seulement.
       Pendant le chargement, on garde juste une frame/poster avec bouton play tournant;
       aucun lecteur vidéo direct n'est lancé hors centrale. */
    if(deferVisible){
      showVideoDirect(url,false);
      showSkeleton(page,url,true);
      try{
        /* On suspend le média de la surface précédente, mais on ne la masque pas avant le rendu suivant. */
        root.querySelectorAll('.happyadAppFrame').forEach(function(x){if(x!==fr)pauseFrame(x,'prepare-module-'+page);});
        fr.classList.remove('on');
        fr.style.opacity='0';
        fr.style.visibility='hidden';
        fr.setAttribute('data-happyad-defer-visible','1');
        fr.setAttribute('data-happyad-skeleton-start',String(Date.now()));
        fr.removeAttribute('data-happyad-first-render-ready-v623');
      }catch(_d){}
    }else{
      showVideoDirect(url,false);
      showSkeleton(page,url,false);
      hideOtherFrames(root,fr,page);
    }

    if(mustReload){
      fr.setAttribute('data-happyad-src',rootUrl(url));
      fr.setAttribute('data-happyad-loading','1');
      fr.removeAttribute('data-happyad-first-render-ready-v623');
      try{fr.setAttribute('loading','eager');}catch(_loading){}
      showLoader(false);
      try{fr.src=rootUrl(url);}catch(_e){try{fr.setAttribute('src',rootUrl(url));}catch(_x){}}
      try{
        if(fr.__happyadLoadWatch)clearTimeout(fr.__happyadLoadWatch);
        fr.__happyadLoadWatch=setTimeout(function(){
          if(fr.getAttribute('data-happyad-defer-visible')==='1')revealFrame(fr,page,url,'frame-load-timeout');
          else{showLoader(false);try{fr.removeAttribute('data-happyad-loading');fr.style.opacity='';fr.style.visibility='';}catch(_w){}}
        },(page==='video'?1200:(page==='profile'||page==='profile_public'?1800:4200)));
      }catch(_w){}
    }

    setNavActive(page,url);updateState(page,url);
    if(visitorPersistent){
      fr.setAttribute('data-happyad-route-url-v601',rootUrl(url));
      if(!mustReload&&visitorReady){
        try{
          hideOtherFrames(root,fr,page);
          root.classList.add('on');root.setAttribute('aria-hidden','false');
          document.body.classList.add('happyadAppOpen');
          fr.style.opacity='0';fr.style.visibility='hidden';fr.classList.add('on');
          showSkeleton(page,url,true);
          deliverVisitorTargetV601(fr,url,extra);
          if(fr.__happyadVisitorRevealFallbackV601)clearTimeout(fr.__happyadVisitorRevealFallbackV601);
          fr.__happyadVisitorRevealFallbackV601=setTimeout(function(){revealFrame(fr,page,url,'visitor-switch-fallback-v601');},24);
        }catch(_visitorReuse){}
        return true;
      }
    }
    if(deferVisible){
      return true;
    }
    revealFrame(fr,page,url,'frame-show-immediate');
    return true;
  }
  function restoreProfileSurfaceAfterPhotoV656(source,detail){
    try{
      var fr=frameFromMessageSourceV623(source);
      if(!fr)return false;
      var page=String(fr.getAttribute('data-happyad-page')||'');
      if(page!=='profile'&&page!=='profile_public')return false;
      if(activePage!==page)return false;
      var url=String(fr.getAttribute('data-happyad-route-url-v601')||fr.getAttribute('data-happyad-src')||activeUrl||pages[page]||'');
      clearVideoRouteMemory('profile-photo-close-v656');
      showVideoDirect('',false);
      blankVideoFrame('profile-photo-close-v656');
      var root=ensureShell();
      hideOtherFrames(root,fr,page);
      fr.style.opacity='';fr.style.visibility='';fr.classList.add('on');fr.removeAttribute('inert');fr.setAttribute('aria-hidden','false');
      if(root){root.classList.add('on');root.setAttribute('aria-hidden','false');}
      document.body.classList.add('happyadAppOpen');
      resumeFrame(fr,page,url,'profile-photo-close-v656');
      setNavActive(page,url);updateState(page,url);
      showSkeleton(page,url,false);showLoader(false);releaseNavGate('profile-photo-close-v656');
      return true;
    }catch(_e){return false;}
  }

  function postToFrameV594(page,message){
    try{
      var fr=document.getElementById(frameId(page));
      if(fr&&fr.contentWindow){fr.contentWindow.postMessage(message,'*');return true;}
    }catch(_e){}
    return false;
  }
  function activateMainTabV594(page,extra){
    extra=extra||{};page=String(page||'').trim();
    if(page==='home')return close('main-tab-home-v594');
    if(!isPersistentMainPage(page))return open(pages[page]||extra.url||'index.html',extra);
    var url=rootUrl(extra.url||persistentMainUrl(page));
    if(page==='message')url=persistentMainUrl('message');
    if(page==='video')url=persistentMainUrl('video');
    if(page==='profile')url=persistentMainUrl('profile');
    if(page==='publish')url=persistentMainUrl('publish');
    try{releaseNavGate('activate-main-tab-v594');}catch(_g){}
    try{if(window.HappyMedia)window.HappyMedia.pauseAll('switch-main-tab-'+page+'-v594');}catch(_m){}
    var ok=loadFrame(page,url,extra);
    if(ok){
      pushNav(page,url,!!extra.replace);
      try{setTimeout(function(){postToFrameV594(page,{type:'HAPPYAD_APP_FRAME_VISIBLE',page:page,url:url,source:extra.source||'main-tabs-v594'});},0);}catch(_v){}
    }
    return ok;
  }
  function deliverVideoTargetV594(postId,extra){
    postId=String(postId||'').trim();if(!postId)return false;
    var msg={type:'HAPPYAD_VIDEO_OPEN_POST_V594',postId:postId,id:postId,detail:{postId:postId,id:postId,source:String(extra&&extra.source||'video-target-v594')}};
    var delays=[0,70,190,480,900];
    delays.forEach(function(delay){setTimeout(function(){postToFrameV594('video',msg);},delay);});
    return true;
  }
  function openVideoPostV594(url,extra){
    extra=extra||{};
    var postId=videoPostIdFromUrl(url||'');
    if(!postId)return activateMainTabV594('video',{source:extra.source||'video-central-v594'});
    try{sessionStorage.setItem(VIDEO_TARGET_KEY_V594,postId);}catch(_s){}
    try{window.__HAPPYAD_VIDEO_TARGET_POST_V594=postId;}catch(_w){}
    var ok=activateMainTabV594('video',{source:extra.source||'video-card-v594'});
    deliverVideoTargetV594(postId,extra);
    return ok;
  }
  function installBridge(fr,page){
    try{
      var w=fr.contentWindow,d=fr.contentDocument;if(!w||!d||d.__HAPPYAD_CORE_NAV_V8_BRIDGED__)return;d.__HAPPYAD_CORE_NAV_V8_BRIDGED__=true;
      w.happyadOpenInternalUrlV492=function(url,extra){return open(url,extra||{});};
      w.happyadOpenAppPage=function(p,url){return openAppPage(p,url);};
      w.happyadCloseAppPage=function(){return false;};
      d.addEventListener('click',function(e){
        try{
          var a=e.target&&e.target.closest&&e.target.closest('a[href]');if(!a)return;
          var href=a.getAttribute('href')||'';var rt=rootUrl(href);var pp=pageOf(rt);
          if(pp==='home'||pages[pp]){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();open(rt,{source:'frame-link-'+page});return false;}
        }catch(_e){}
      },true);
    }catch(_e){}
  }
  function pushNav(page,url,replace){
    try{history.replaceState(state(page,url),'',location.href);}catch(_e){}
  }
  function open(url,extra){
    extra=extra||{};url=rootUrl(url||'index.html');var page=pageOf(url,extra.page);
    var normalized=normalizeRouteForOpen(page,url);
    if(normalized.invalidPublic){page=normalized.view;url=normalized.url;extra.replace=true;}
    if(page!=='profile_public')destroyVisitorFrameV668('leave-visitor-for-'+String(page||'unknown'));
    if(page==='profile_public'){
      url=ensurePublicProfileUrl(url,extra);
      if(!url){try{console.warn('HAPPYAD profile_public blocked: missing uid');}catch(_w){} return false;}
      var __profileUid=profileUidFromUrl(url);
      if(__profileUid&&isOwnProfileUid(__profileUid)){
        try{localStorage.removeItem('HAPPYAD_ACTIVE_PROFILE');}catch(_ap){}
        try{sessionStorage.removeItem('HAPPYAD_PROFILE_MASTER_ACTIVE_UID');sessionStorage.setItem('HAPPYAD_PROFILE_MASTER_MODE','my');}catch(_ss){}
        url='modules/user.html';
        page='profile';
      }else if(__profileUid){
        try{sessionStorage.setItem('HAPPYAD_PROFILE_MASTER_ACTIVE_UID',__profileUid);sessionStorage.setItem('HAPPYAD_PROFILE_MASTER_ACTIVE_URL',url);localStorage.setItem('HAPPYAD_PUBLIC_PROFILE_ACTIVE_UID',__profileUid);localStorage.setItem('HAPPYAD_ACTIVE_PROFILE_UID',__profileUid);}catch(_uid){}
        if(activePage==='profile_public'&&activeUrl&&rootUrl(activeUrl)!==rootUrl(url))extra.replace=true;
      }
    }
    if(page==='video'&&hasPost(url)&&!extra.__happyadVideoPersistentV594)return openVideoPostV594(url,extra);
    if(page==='home')return close('open-home',extra.fromPop||extra.replace);
    if(page==='profile'||page==='profile_public'){
      clearVideoRouteMemory('open-'+page+'-v656');
      showVideoDirect('',false);
      blankVideoFrame('open-'+page+'-v656');
    }
    if(navBusy()&&!extra.fromPop&&!extra.replace&&!extra.force){
      if(samePendingTarget(page,url))return true;
      try{window.__HAPPYAD_NAV_REPLACED_PENDING_V615__={from:pendingNav,to:{page:page,url:url},t:Date.now()};}catch(_ig){}
      releaseNavGate('replace-pending-target-v615');
    }
    beginNavGate(page,url);
    if(page!=='video'||!hasPost(url))clearVideoRouteMemory('open-'+page);
    if(page==='video'&&!hasPost(url))blankVideoFrame('open-video-central');
    try{if(window.HappyMedia)HappyMedia.pauseAll('before-open-'+page);}catch(_e){}
    var ok=loadFrame(page,url,extra);
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
    var root=shell(),frames=[];
    try{if(root)frames=Array.prototype.slice.call(root.querySelectorAll('.happyadAppFrame'));}catch(_e){frames=[];}

    /* V619: rendre l'Accueil visible avant tout nettoyage coûteux. */
    try{
      frames.forEach(function(fr){fr.classList.remove('on');fr.setAttribute('aria-hidden','true');fr.setAttribute('inert','');});
      if(root){root.classList.remove('on','happyadSkeletonOpen');root.setAttribute('aria-hidden','true');}
      showSkeleton('home','index.html',false);showVideoDirect('',false);showLoader(false);releaseNavGate(reason);
      document.body.classList.remove('happyadAppOpen','happyadPublishFullscreenV586','no-scroll','modal-open','story-open','fullscreen-open','happyad-story-fullscreen-lock','happyadShareOpen');
      document.documentElement.classList.remove('no-scroll','modal-open','story-open','fullscreen-open','happyad-story-fullscreen-lock','happyadShareOpen');
      document.body.classList.add('happyadMainDockVisible');
      setNavActive('home','index.html');updateState('home','index.html');
      try{if(replace!==false)history.replaceState(state('home','index.html'),'',location.href);}catch(_h){}
      try{destroyVisitorFrameV668(reason+'-home-v668');}catch(_visitorDestroy){}
      try{scheduleMainTabsPreloadV594();}catch(_warm){}
    }catch(_e){}

    /* Le média et les observers sont suspendus après le premier rendu Accueil. */
    setTimeout(function(){
      clearVideoRouteMemory(reason);blankVideoFrame(reason);
      try{if(window.HappyMedia)HappyMedia.pauseAll(reason);}catch(_m){}
      frames.forEach(function(fr){try{pauseFrame(fr,reason);}catch(_p){}});
      try{
        removeLegacyTapShield();
        document.documentElement.style.removeProperty('overflow');document.documentElement.style.removeProperty('overflow-y');document.documentElement.style.removeProperty('touch-action');
        document.body.style.removeProperty('overflow');document.body.style.removeProperty('overflow-y');document.body.style.removeProperty('touch-action');document.body.style.removeProperty('position');document.body.style.removeProperty('top');document.body.style.removeProperty('width');
        clearBootRestoreMaskV16ZJ('close-'+reason);
        if(window.HappyOverlayMasterV615)window.HappyOverlayMasterV615.reconcile('navigation-close-'+reason);
      }catch(_cleanup){}
    },0);
    return true;
  }
  function back(){return false;}

  /* V584: ancien contrôleur du bouton téléphone supprimé. */
  function restore(page,url){
    restoring=true;
    try{
      if(!page||page==='home')close('pop-home',false);
      else open(url||pages[page],{page:page,replace:true,fromPop:true});
    }finally{setTimeout(function(){restoring=false;},0);}
  }
  function activeFrame(){try{var r=shell();return r&&r.querySelector&&r.querySelector('.happyadAppFrame.on[data-happyad-page]');}catch(_e){return null;}}

  function frameFromMessageSourceV623(source){
    try{
      var root=shell();if(!root||!source)return null;
      var list=root.querySelectorAll('.happyadAppFrame');
      for(var i=0;i<list.length;i++){try{if(list[i].contentWindow===source)return list[i];}catch(_e){}}
    }catch(_e){}
    return null;
  }
  function acceptFirstRenderV623(ev,data){
    try{
      var fr=frameFromMessageSourceV623(ev&&ev.source);if(!fr)return false;
      var page=fr.getAttribute('data-happyad-page')||'';
      var type=String(data&&data.type||'');
      /* V625: le signal générique du début de document ne ferme plus le squelette
         des pages lourdes. On attend leur maître réellement prêt. */
      if((page==='profile'||page==='profile_public')&&type!=='HAPPYAD_PROFILE_VISUAL_READY_V621C'&&type!=='HAPPYAD_PROFILE_READY')return false;
      if(page==='message'&&type!=='HAPPYAD_MESSAGE_CENTER_READY')return false;
      if(page==='video'&&type!=='HAPPYAD_VIDEO_TAB_READY_V594'&&type!=='HAPPYAD_VIDEO_READY')return false;
      fr.setAttribute('data-happyad-first-render-ready-v623','1');
      fr.setAttribute('data-happyad-first-render-reason-v623',type||'ready');
      if(fr.getAttribute('data-happyad-defer-visible')==='1'){
        revealFrame(fr,page,fr.getAttribute('data-happyad-route-url-v601')||fr.getAttribute('data-happyad-src')||pages[page]||'',type||'first-render-v625');
      }
      return true;
    }catch(_e){return false;}
  }

  window.HappyNavigation={
    version:MASTER_VERSION,rootUrl:rootUrl,pathOf:pathOf,pageOf:pageOf,profileUidFromUrl:profileUidFromUrl,isOwnProfileUid:isOwnProfileUid,open:open,openAppPage:openAppPage,close:close,back:back,restore:restore,
    activeFrame:activeFrame,isBusy:navBusy,releaseNavGate:releaseNavGate,pauseFrame:pauseFrame,resumeFrame:resumeFrame,clearVideoRouteMemory:clearVideoRouteMemory,blankVideoFrame:blankVideoFrame,prefetchUrl:prefetchUrl,scheduleSoftPreload:scheduleSoftPreload,prepareOwnerProfile:prepareOwnerProfileOpenV649,
    preloadFrame:preloadFrame,preloadMainTabs:scheduleMainTabsPreloadV594,warmVideo:preloadVideoFrameV624,activateMainTab:activateMainTabV594,openVideoPost:openVideoPostV594,postToFrame:postToFrameV594,deliverVisitorProfile:deliverVisitorTargetV601,restoreProfileAfterPhoto:restoreProfileSurfaceAfterPhotoV656
  };
  window.happyadOpenInternalUrlV492=function(url,extra){return window.HappyNavigation.open(url,extra||{});};
  window.happyadOpenAppPage=function(page,url){return window.HappyNavigation.openAppPage(page,url);};
  window.happyadCloseAppPage=function(){return false;};

  try{document.addEventListener('click',function(e){
    try{
      var a=e.target&&e.target.closest&&e.target.closest('a[href]');if(!a)return;
      var href=a.getAttribute('href')||'';var rt=rootUrl(href);var pg=pageOf(rt);
      if(pg&&pg!=='home'&&pages[pg]){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();open(rt,{source:'doc-link'});return false;}
      if(pg==='home'&&(document.body.classList.contains('happyadAppOpen')||activePage!=='home')){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();close('home-link');return false;}
    }catch(_e){}
  },true);}catch(_e){}
  try{window.addEventListener('message',function(ev){
    try{
      var d=ev&&ev.data;if(!d)return;
      var readyType=String(d&&d.type||'');
      if(readyType==='HAPPYAD_INTERNAL_SCREEN_CLOSE_V591'&&d.detail&&String(d.detail.id||'')==='profile-photo'){
        restoreProfileSurfaceAfterPhotoV656(ev.source,d.detail||{});
      }
      if(readyType==='HAPPYAD_FRAME_BOOTSTRAP_READY_V623'||readyType==='HAPPYAD_FIRST_RENDER_READY_V623'||readyType==='HAPPYAD_FIRST_RENDER_READY_V622'||readyType==='HAPPYAD_MESSAGE_CENTER_READY'||readyType==='HAPPYAD_PROFILE_VISUAL_READY_V621C'||readyType==='HAPPYAD_VIDEO_TAB_READY_V594'||readyType==='HAPPYAD_VIDEO_READY'||readyType==='HAPPYAD_PROFILE_READY'){
        acceptFirstRenderV623(ev,d);
      }
      if(d==='HAPPYAD_CLOSE_APP_PAGE'||d.type==='HAPPYAD_CLOSE_APP_PAGE'||d.type==='HAPPYAD_NAV_BACK_REQUEST'){
        ev.stopImmediatePropagation&&ev.stopImmediatePropagation();
        return false;
      }
      if(d.type==='HAPPYAD_PROFILE_SWITCH_PAINTED_V601'){
        if(activePage!=='profile_public')return false;
        ev.stopImmediatePropagation&&ev.stopImmediatePropagation();
        var vfr=document.getElementById(frameId('profile_public'));
        if(vfr){
          var expected=String(vfr.getAttribute('data-happyad-target-uid-v601')||'');
          if(!expected||!d.uid||String(d.uid)===expected){
            try{if(vfr.__happyadVisitorRevealFallbackV601){clearTimeout(vfr.__happyadVisitorRevealFallbackV601);vfr.__happyadVisitorRevealFallbackV601=null;}}catch(_vf){}
            revealFrame(vfr,'profile_public',vfr.getAttribute('data-happyad-route-url-v601')||activeUrl,'visitor-painted-v601');
          }
        }
        return true;
      }
      if(d.type==='HAPPYAD_OPEN_INTERNAL_URL' && d.url){
        ev.stopImmediatePropagation&&ev.stopImmediatePropagation();
        try{if(window.HappyInternalReturnV587&&typeof window.HappyInternalReturnV587.closeNotification==='function')window.HappyInternalReturnV587.closeNotification('notification-internal-url-v587');}catch(_v587){}
        return open(d.url,d.extra||{source:'message-open'});
      }
    }catch(_e){}
  },true);}catch(_e){}

  /* V584: ancien contrôleur popstate supprimé. */

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
      var nr=normalizeRouteForOpen(String(r.view),r.url||pages[r.view]||'index.html');
      if(nr.invalidPublic)return false;
      var page=nr.view;
      var url=nr.url;
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
    if(!restored){
      bootHomeSafety();
      scheduleMainTabsPreloadV594();
    }
    try{window.__HAPPYAD_LAZY_MODULE_BOOT_V614__={at:Date.now(),preloadedFrames:4,directMainPages:true,visitorSkeletonOnly:true};}catch(_e){}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootV16ZJ,{once:true});else bootV16ZJ();
  try{if(window.HappyMasterRegistry)HappyMasterRegistry.register('navigation',{file:'core/navigation-master-v656.js',responsibility:'navigation unique, iframe, retour interne, bouton téléphone, ouverture modules',legacy:['happyadOpenInternalUrlV492','happyadOpenAppPage','happyadCloseAppPage','V492 router','V520 history'],active:true,version:MASTER_VERSION});}catch(_e){}
})();
