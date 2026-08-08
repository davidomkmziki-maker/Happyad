(function(){
'use strict';
if(window.__HAPPYAD_MESSAGE_PRESENCE_APP_V855R51__)return;
window.__HAPPYAD_MESSAGE_PRESENCE_APP_V855R51__=true;
var timer=0;
function touch(){
  if(document.visibilityState==='hidden')return;
  try{
    var master=window.HappyMessagePrivacyV855R51;
    if(master&&typeof master.touchPresence==='function')master.touchPresence(null,false).catch(function(){});
  }catch(_e){}
}
function start(){
  clearInterval(timer);
  touch();
  timer=setInterval(touch,30000);
}
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')touch();},true);
window.addEventListener('focus',touch,true);
window.addEventListener('pageshow',touch,{passive:true});
window.addEventListener('online',touch,{passive:true});
window.addEventListener('beforeunload',function(){clearInterval(timer);},{once:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
