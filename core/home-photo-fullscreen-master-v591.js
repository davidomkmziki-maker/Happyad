(function(){
  'use strict';
  if(window.__HAPPYAD_HOME_PHOTO_FULLSCREEN_MASTER_V591__)return;
  window.__HAPPYAD_HOME_PHOTO_FULLSCREEN_MASTER_V591__=true;

  var VERSION='V591_HOME_PHOTO_INTERNAL_RETURN';
  var LAYER_ID='home-photo';
  var localObserver=null;

  function controller(){return window.HappyInternalReturnV591||null;}
  function dock(){return document.getElementById('happyadMainDockV585')||document.querySelector('.bottom.happyadMainDockV585');}
  function forceDock(on){
    try{
      var d=dock();
      document.body.classList.toggle('happyadPhotoSurfaceV591',!!on);
      if(on)document.body.classList.remove('happyadMainDockVisible');
      if(!d)return;
      if(on){d.setAttribute('aria-hidden','true');d.style.setProperty('display','none','important');d.style.setProperty('visibility','hidden','important');d.style.setProperty('pointer-events','none','important');}
      else{d.removeAttribute('aria-hidden');d.style.removeProperty('display');d.style.removeProperty('visibility');d.style.removeProperty('pointer-events');}
    }catch(_e){}
  }
  function restoreHomeSource(){
    try{
      var s=window.__happyadPhotoReturnSourceV478||{};
      var y=Number(s.scrollY);
      if(isFinite(y))requestAnimationFrame(function(){requestAnimationFrame(function(){try{window.scrollTo(0,y);}catch(_e){}});});
    }catch(_e){}
  }
  function closeLocal(){
    var box=document.getElementById('happyadHomePhotoFullscreen');
    if(!box)return false;
    try{
      box.classList.remove('on');
      box.setAttribute('aria-hidden','true');
      document.body.classList.remove('haHomePhotoFsLock');
      var tr=box.querySelector('.haHomeFsAlbumTrack');if(tr)tr.innerHTML='';
    }catch(_e){}
    try{var c=controller();if(c)c.close(LAYER_ID);}catch(_e){}
    forceDock(false);
    restoreHomeSource();
    return true;
  }
  function requestBack(ev){
    if(ev){ev.preventDefault();ev.stopPropagation();if(ev.stopImmediatePropagation)ev.stopImmediatePropagation();}
    try{var c=controller();if(c&&typeof c.back==='function')return c.back(LAYER_ID);}catch(_e){}
    return closeLocal();
  }
  function ensureLocalBack(){
    var box=document.getElementById('happyadHomePhotoFullscreen');
    if(!box)return null;
    var b=box.querySelector('.haHomeFsBackV591');
    if(!b){
      var old=box.querySelector('.haHomeFsBackV590,.haHomeFsClose');
      b=old||document.createElement('button');
      b.type='button';
      b.className='haHomeFsClose haHomeFsBackV591 happyadInternalBackV591';
      b.setAttribute('aria-label','Revenir à la page précédente');
      b.setAttribute('data-happyad-internal-return-v591','1');
      b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>';
      if(!old){var card=box.querySelector('.haHomeFsCard')||box;card.insertBefore(b,card.firstChild||null);}
    }
    b.setAttribute('data-happyad-internal-return-v591','1');
    if(!b.__happyadV591Bound){b.__happyadV591Bound=true;b.addEventListener('click',requestBack,true);}
    return b;
  }
  function syncLocal(){
    var box=document.getElementById('happyadHomePhotoFullscreen');
    if(!box)return;
    var open=box.classList.contains('on');
    if(open){
      ensureLocalBack();box.setAttribute('aria-hidden','false');forceDock(true);
      try{var c=controller();if(c)c.open(LAYER_ID,{onBack:closeLocal});}catch(_e){}
    }else{
      try{var c2=controller();if(c2)c2.close(LAYER_ID);}catch(_e){}
      forceDock(false);
    }
  }
  function observeLocal(){
    var box=document.getElementById('happyadHomePhotoFullscreen');
    if(!box)return;
    if(localObserver)try{localObserver.disconnect();}catch(_e){}
    localObserver=new MutationObserver(syncLocal);
    localObserver.observe(box,{attributes:true,attributeFilter:['class'],childList:true,subtree:false});
    syncLocal();
  }
  function patchLocalOpen(){
    try{
      var old=window.happyadOpenHomePhotoFullscreen;
      if(typeof old!=='function'||old.__happyadV591Wrapped)return;
      var wrapped=async function(){
        forceDock(true);
        try{var c=controller();if(c)c.open(LAYER_ID,{onBack:closeLocal});}catch(_e){}
        var result;
        try{result=await old.apply(this,arguments);}catch(err){try{var c2=controller();if(c2)c2.close(LAYER_ID);}catch(_e){}forceDock(false);throw err;}
        ensureLocalBack();observeLocal();syncLocal();
        return result;
      };
      wrapped.__happyadV591Wrapped=true;
      window.happyadOpenHomePhotoFullscreen=wrapped;
    }catch(_e){}
  }
  function start(){patchLocalOpen();observeLocal();setTimeout(patchLocalOpen,80);setTimeout(patchLocalOpen,500);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  window.HappyHomePhotoFullscreenV591={version:VERSION,close:closeLocal,back:requestBack};
})();
