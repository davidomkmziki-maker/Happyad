/* HAPPYAD V656 — retour photo Profil visiteur sans bascule Vidéo */
(function(){
  'use strict';
  if(window.__HAPPYAD_PROFILE_ROUTE_GUARD_V656__)return;
  window.__HAPPYAD_PROFILE_ROUTE_GUARD_V656__=true;
  var blockUntil=0;
  function now(){return Date.now?Date.now():(new Date()).getTime();}
  function arm(reason){blockUntil=Math.max(blockUntil,now()+900);try{window.__HAPPYAD_PROFILE_MEDIA_NAV_BLOCK_UNTIL_V656=blockUntil;window.__HAPPYAD_PROFILE_MEDIA_NAV_BLOCK_REASON_V656=String(reason||'photo-close');}catch(_e){}return blockUntil;}
  function blocked(){return now()<Math.max(blockUntil,Number(window.__HAPPYAD_PROFILE_MEDIA_NAV_BLOCK_UNTIL_V656||0));}
  function stop(ev){try{ev.preventDefault();ev.stopPropagation();if(ev.stopImmediatePropagation)ev.stopImmediatePropagation();}catch(_e){}}
  function postId(x){return String((x&&x.id)||x||'').trim();}
  function safeOpen(url,extra){
    url=String(url||'').trim();if(!url)return false;extra=Object.assign({source:'profile-route-guard-v656',force:true},extra||{});
    try{if(typeof window.happyadOpenInternalUrlV492==='function')return !!window.happyadOpenInternalUrlV492(url,extra);}catch(_e){}
    try{if(window.parent&&window.parent!==window&&window.parent.postMessage){window.parent.postMessage({type:'HAPPYAD_OPEN_INTERNAL_URL',url:url,extra:extra},'*');return true;}}catch(_p){}
    try{if(window.HappyNavigation&&typeof window.HappyNavigation.open==='function')return !!window.HappyNavigation.open(url,extra);}catch(_n){}
    try{if(window.parent===window){location.href=url.replace(/^modules\//,'');return true;}}catch(_l){}
    return false;
  }
  function openVideo(postOrId){
    var id=postId(postOrId);if(!id||blocked())return false;
    try{if(typeof window.happyadProfilePrimeCentralOpen==='function')window.happyadProfilePrimeCentralOpen(postOrId,true);else if(typeof happyadProfilePrimeCentralOpen==='function')happyadProfilePrimeCentralOpen(postOrId,true);}catch(_e){}
    return safeOpen('modules/video.html?post='+encodeURIComponent(id),{page:'video',postId:id});
  }
  window.happyadProfileOpenInternalV656=safeOpen;
  window.openLongPublishedVideo=openVideo;
  try{openLongPublishedVideo=openVideo;}catch(_e){}

  /* Le retour du viewer V581 arme la protection même avec le bouton téléphone. */
  try{
    if(window.HappyProfilePostFeedV581&&typeof window.HappyProfilePostFeedV581.close==='function'&&!window.HappyProfilePostFeedV581.__v656Wrapped){
      var oldClose=window.HappyProfilePostFeedV581.close;
      window.HappyProfilePostFeedV581.close=function(){arm('v581-close');return oldClose.apply(this,arguments);};
      window.HappyProfilePostFeedV581.__v656Wrapped=true;
    }
  }catch(_wrap){}

  window.addEventListener('message',function(ev){
    var d=ev&&ev.data;
    if(d&&d.type==='HAPPYAD_INTERNAL_BACK_EXECUTE_V591'&&d.detail&&d.detail.id==='profile-photo')arm('internal-back');
  },true);

  document.addEventListener('click',function(ev){
    var t=ev.target;
    try{
      if(t&&t.closest&&t.closest('.ha581Back,#happyadHomePhotoFullscreen .haHomeFsClose,#happyadHomePhotoFullscreen .haHomeFsAlbumSlide img')){arm('photo-close-click');return;}
      var card=t&&t.closest&&t.closest('.profilePost.videoPost[data-post-id]');
      if(!card)return;
      if(t.closest('[data-profile-act],.profileAct,.profileDelete,[data-delete-post],.haPostSheet,button,input,textarea,select,a'))return;
      stop(ev);
      if(blocked())return false;
      return openVideo(card.__happyadPost||{id:card.dataset.postId});
    }catch(_e){}
  },true);

  document.addEventListener('pointerup',function(ev){
    try{if(ev.target&&ev.target.closest&&ev.target.closest('.ha581Back,#happyadHomePhotoFullscreen .haHomeFsClose'))arm('photo-close-pointer');}catch(_e){}
  },true);
})();
