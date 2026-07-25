(function(){
  'use strict';
  if(window.__HAPPYAD_GUEST_RADAR_AUTH_V598__)return;
  window.__HAPPYAD_GUEST_RADAR_AUTH_V598__=true;
  var VERSION='GUEST_RADAR_AUTH_V598';
  var observer=null;
  var timer=0;
  var applying=false;
  function clean(v){return String(v==null?'':v).trim();}
  function auth(){return window.HappyAuthSessionV598||window.HappyAuthSessionV597||window.HappyAuthSessionV596||window.HappyAuthSessionV595||null;}
  function guest(){
    var a=auth();
    if(a&&typeof a.isAuthenticated==='function'){
      if(typeof a.isReady!=='function'||a.isReady())return !a.isAuthenticated();
    }
    try{return !(localStorage.getItem('HAPPYAD_SESSION_ACTIVE')==='1'&&/^[0-9a-f-]{36}$/i.test(clean(localStorage.getItem('HAPPYAD_AUTH_UID'))));}catch(_e){return true;}
  }
  function closeStoryViewers(){
    ['happyStoryViewer','happyProfileStoryViewer'].forEach(function(id){try{var el=document.getElementById(id);if(el)el.classList.remove('on','full','show','open');}catch(_e){}});
    try{document.body.classList.remove('story-open','happyad-story-fullscreen-lock');document.documentElement.classList.remove('story-open','happyad-story-fullscreen-lock');}catch(_e){}
  }
  function ensureCss(){
    if(document.getElementById('happyadGuestRadarAuthCssV598'))return;
    var st=document.createElement('style');st.id='happyadGuestRadarAuthCssV598';st.textContent='\
#homeRadarBlock.happyadGuestRadarV598 .radarRow>*:not(.happyadGuestAuthButtonsV598){display:none!important;visibility:hidden!important;pointer-events:none!important}\
#homeRadarBlock.happyadGuestRadarV598 .radarRow{display:flex!important;align-items:center!important;gap:10px!important;overflow:visible!important;padding:8px 0 4px!important;min-height:58px!important}\
#homeRadarBlock .happyadGuestAuthButtonsV598{display:flex!important;align-items:center!important;gap:10px!important;width:100%!important;max-width:430px!important}\
#homeRadarBlock .happyadGuestAuthBtnV598{appearance:none!important;min-height:46px!important;flex:1 1 0!important;border:1.5px solid rgba(255,255,255,.78)!important;border-radius:16px!important;background:rgba(255,255,255,.035)!important;color:#fff!important;font:900 15px/1 system-ui,-apple-system,Segoe UI,sans-serif!important;padding:0 16px!important;display:flex!important;align-items:center!important;justify-content:center!important;white-space:nowrap!important;touch-action:manipulation!important;transition:transform .11s ease,background .11s ease,border-color .11s ease,color .11s ease!important}\
#homeRadarBlock .happyadGuestAuthBtnV598:active{background:rgba(190,196,205,.17)!important;border-color:#fff!important;color:#fff!important;transform:scale(.97) translateY(1px)!important}\
';document.head.appendChild(st);
  }
  function makeButtons(row){
    var box=document.createElement('div');box.className='happyadGuestAuthButtonsV598';box.setAttribute('data-happyad-guest-auth','1');
    box.innerHTML='<button type="button" class="happyadGuestAuthBtnV598" data-happyad-auth-direct-v598="login">Connexion</button><button type="button" class="happyadGuestAuthBtnV598" data-happyad-auth-direct-v598="signup">Inscription</button>';
    row.insertBefore(box,row.firstChild||null);return box;
  }
  function apply(){
    if(applying)return;applying=true;
    try{
      ensureCss();
      var isGuest=guest();
      document.querySelectorAll('#homeRadarBlock').forEach(function(block){
        var row=block.querySelector('.radarRow');if(!row)return;
        var box=row.querySelector('.happyadGuestAuthButtonsV598');
        if(isGuest){
          block.classList.add('happyadGuestRadarV598');
          if(!box)box=makeButtons(row);
          box.style.display='flex';
        }else{
          block.classList.remove('happyadGuestRadarV598');
          if(box)box.remove();
        }
      });
      if(isGuest)closeStoryViewers();
    }finally{applying=false;}
  }
  function schedule(delay){clearTimeout(timer);timer=setTimeout(apply,Math.max(0,delay||0));}
  function boot(){
    apply();
    try{observer=new MutationObserver(function(){schedule(30);});observer.observe(document.body,{childList:true,subtree:true});}catch(_e){}
    window.addEventListener('HAPPYAD_AUTH_STATE_V595',function(){schedule(0);setTimeout(apply,120);},true);
    window.addEventListener('storage',function(ev){if(!ev||/HAPPYAD_(SESSION_ACTIVE|AUTH_UID|FORCE_LOGOUT)/.test(ev.key||''))schedule(0);});
    setInterval(apply,900);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.HappyGuestRadarV598={version:VERSION,apply:apply,isGuest:guest};
  try{if(window.HappyMasterRegistry)window.HappyMasterRegistry.register('guest-radar-auth',{file:'core/guest-radar-auth-v598.js',responsibility:'masquer les stories invité et afficher Connexion/Inscription dans Radar',active:true,version:VERSION});}catch(_e){}
})();
