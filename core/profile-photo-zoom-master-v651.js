/* HAPPYAD V651 — zoom tactile léger exclusivement pour le fullscreen photo Profil V581. */
(function(){
  'use strict';
  if(window.__HAPPYAD_PROFILE_PHOTO_ZOOM_MASTER_V651__)return;
  window.__HAPPYAD_PROFILE_PHOTO_ZOOM_MASTER_V651__=true;

  var root=null;
  var state={
    img:null,slide:null,track:null,
    scale:1,tx:0,ty:0,
    startScale:1,startDistance:0,startMidX:0,startMidY:0,
    baseTx:0,baseTy:0,
    panStartX:0,panStartY:0,panBaseX:0,panBaseY:0,
    viewportW:0,viewportH:0,imageW:0,imageH:0,
    mode:'',raf:0
  };

  function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
  function distance(a,b){var x=b.clientX-a.clientX,y=b.clientY-a.clientY;return Math.sqrt(x*x+y*y)||1;}
  function midpoint(a,b){return {x:(a.clientX+b.clientX)/2,y:(a.clientY+b.clientY)/2};}
  function closestImage(target){
    try{
      var slide=target&&target.closest&&target.closest('.ha581Slide');
      return slide&&slide.querySelector('img');
    }catch(_e){return null;}
  }
  function readGeometry(img){
    var slide=img&&img.closest&&img.closest('.ha581Slide');
    state.slide=slide||null;
    state.track=slide&&slide.closest&&slide.closest('.ha581Album');
    state.viewportW=Math.max(1,slide&&slide.clientWidth||window.innerWidth||1);
    state.viewportH=Math.max(1,slide&&slide.clientHeight||window.innerHeight||1);
    state.imageW=Math.max(1,img&&img.offsetWidth||state.viewportW);
    state.imageH=Math.max(1,img&&img.offsetHeight||state.viewportH);
  }
  function limits(scale){
    return {
      x:Math.max(0,(state.imageW*scale-state.viewportW)/2),
      y:Math.max(0,(state.imageH*scale-state.viewportH)/2)
    };
  }
  function normalizePosition(){
    var lim=limits(state.scale);
    state.tx=clamp(state.tx,-lim.x,lim.x);
    state.ty=clamp(state.ty,-lim.y,lim.y);
  }
  function updateMode(){
    if(!root)return;
    var zoomed=state.scale>1.01;
    root.classList.toggle('ha581ZoomedV651',zoomed);
    if(state.img){
      state.img.dataset.ha581ZoomedV651=zoomed?'1':'0';
      state.img.style.willChange=zoomed?'transform':'';
    }
  }
  function renderNow(){
    state.raf=0;
    if(!state.img)return;
    normalizePosition();
    state.img.style.transform='translate3d('+state.tx.toFixed(2)+'px,'+state.ty.toFixed(2)+'px,0) scale('+state.scale.toFixed(4)+')';
    updateMode();
  }
  function scheduleRender(){
    if(state.raf)return;
    state.raf=requestAnimationFrame(renderNow);
  }
  function reset(reason){
    if(state.raf){cancelAnimationFrame(state.raf);state.raf=0;}
    if(state.img){
      state.img.style.transform='';
      state.img.style.willChange='';
      try{delete state.img.dataset.ha581ZoomedV651;}catch(_e){}
    }
    if(root)root.classList.remove('ha581ZoomedV651');
    state.img=null;state.slide=null;state.track=null;
    state.scale=1;state.tx=0;state.ty=0;state.mode='';
    return true;
  }
  function activate(img){
    if(!img)return false;
    if(state.img&&state.img!==img)reset('image-change');
    state.img=img;
    readGeometry(img);
    return true;
  }
  function beginPinch(e){
    if(!e.touches||e.touches.length<2)return false;
    var img=closestImage(e.target);if(!img||!activate(img))return false;
    var a=e.touches[0],b=e.touches[1],m=midpoint(a,b);
    state.mode='pinch';
    state.startDistance=distance(a,b);
    state.startScale=state.scale;
    state.startMidX=m.x;state.startMidY=m.y;
    state.baseTx=state.tx;state.baseTy=state.ty;
    readGeometry(img);
    return true;
  }
  function beginPan(e){
    if(!state.img||state.scale<=1.01||!e.touches||e.touches.length!==1)return false;
    state.mode='pan';
    state.panStartX=e.touches[0].clientX;state.panStartY=e.touches[0].clientY;
    state.panBaseX=state.tx;state.panBaseY=state.ty;
    return true;
  }
  function onTouchStart(e){
    if(!root||!root.classList.contains('on'))return;
    if(e.touches&&e.touches.length>=2){
      if(beginPinch(e)){e.preventDefault();}
      return;
    }
    if(state.scale>1.01&&closestImage(e.target)===state.img){
      if(beginPan(e))e.preventDefault();
    }
  }
  function onTouchMove(e){
    if(!root||!root.classList.contains('on'))return;
    if(e.touches&&e.touches.length>=2){
      if(state.mode!=='pinch'&&!beginPinch(e))return;
      e.preventDefault();
      var a=e.touches[0],b=e.touches[1],m=midpoint(a,b);
      state.scale=clamp(state.startScale*(distance(a,b)/Math.max(1,state.startDistance)),1,4);
      state.tx=state.baseTx+(m.x-state.startMidX);
      state.ty=state.baseTy+(m.y-state.startMidY);
      scheduleRender();
      return;
    }
    if(e.touches&&e.touches.length===1&&state.scale>1.01&&state.img){
      if(state.mode!=='pan'&&!beginPan(e))return;
      e.preventDefault();
      state.tx=state.panBaseX+(e.touches[0].clientX-state.panStartX);
      state.ty=state.panBaseY+(e.touches[0].clientY-state.panStartY);
      scheduleRender();
    }
  }
  function onTouchEnd(e){
    if(!state.img)return;
    if(e.touches&&e.touches.length>=2){beginPinch(e);return;}
    if(e.touches&&e.touches.length===1&&state.scale>1.01){beginPan(e);return;}
    state.mode='';
    if(state.scale<1.06){reset('snap-home');return;}
    normalizePosition();scheduleRender();
  }
  function onScroll(e){
    if(!state.img||state.scale<=1.01)return;
    var t=e.target;
    if(t&&t.closest&&t.closest('#happyadProfilePostFeedV581'))reset('viewer-scroll');
  }
  function onClick(e){
    if(e.target&&e.target.closest&&e.target.closest('.ha581Back'))reset('back');
  }
  function start(){
    root=document.getElementById('happyadProfilePostFeedV581');
    if(!root)return;
    root.addEventListener('touchstart',onTouchStart,{passive:false,capture:true});
    root.addEventListener('touchmove',onTouchMove,{passive:false,capture:true});
    root.addEventListener('touchend',onTouchEnd,{passive:false,capture:true});
    root.addEventListener('touchcancel',function(){reset('touch-cancel');},{passive:true,capture:true});
    root.addEventListener('scroll',onScroll,true);
    root.addEventListener('click',onClick,true);
    window.addEventListener('orientationchange',function(){reset('orientation');},{passive:true});
    document.addEventListener('visibilitychange',function(){if(document.hidden)reset('hidden');});
    window.HappyProfilePhotoZoomV651={reset:reset,isZoomed:function(){return state.scale>1.01;},version:'V651-PROFILE-ONLY'};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
