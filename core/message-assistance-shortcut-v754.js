(function(){
  'use strict';
  if(window.__HAPPYAD_MESSAGE_ASSISTANCE_SHORTCUT_V754__)return;
  window.__HAPPYAD_MESSAGE_ASSISTANCE_SHORTCUT_V754__=true;

  var lastOpenAt=0;
  function parentWindow(){try{return window.parent&&window.parent!==window?window.parent:window}catch(_e){return window}}
  function openAssistance(event){
    try{event.preventDefault();event.stopPropagation();event.stopImmediatePropagation()}catch(_e){}
    var now=Date.now();
    if(now-lastOpenAt<350)return false;
    lastOpenAt=now;
    var detail={source:'messages',returnTarget:'message-list'};
    try{
      var target=parentWindow();
      var master=target.HappyadAssistanceMasterV754;
      if(master&&typeof master.open==='function')master.open(detail);
      else target.postMessage({type:'HAPPYAD_ASSISTANCE_V754_OPEN',detail:detail},location.origin);
    }catch(_e){}
    return false;
  }
  function install(){
    document.querySelectorAll('[data-happyad-assistance-shortcut-v754]').forEach(function(button){
      if(button.__happyadAssistanceShortcutV754)return;
      button.__happyadAssistanceShortcutV754=true;
      button.style.touchAction='manipulation';
      button.addEventListener('click',openAssistance,false);
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
