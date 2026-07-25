(function(){
  'use strict';
  if(window.__HAPPYAD_MESSAGE_ASSISTANCE_SHORTCUT_V738__)return;
  window.__HAPPYAD_MESSAGE_ASSISTANCE_SHORTCUT_V738__=true;

  function parentWindow(){try{return window.parent&&window.parent!==window?window.parent:window}catch(_e){return window}}
  function prepare(){
    try{
      var target=parentWindow();
      if(target.HappyadAssistanceMasterV738&&typeof target.HappyadAssistanceMasterV738.prepare==='function')target.HappyadAssistanceMasterV738.prepare('messages-pointer');
      else target.postMessage({type:'HAPPYAD_ASSISTANCE_PREPARE_REQUEST',detail:{source:'messages'}},'*');
    }catch(_e){}
  }
  function openAssistance(event){
    try{event&&event.preventDefault();event&&event.stopPropagation();event&&event.stopImmediatePropagation()}catch(_e){}
    var detail={source:'messages',returnTarget:'message-list'};
    try{
      var target=parentWindow();
      if(target.HappyadAssistanceMasterV738&&typeof target.HappyadAssistanceMasterV738.open==='function')return target.HappyadAssistanceMasterV738.open(detail);
      target.postMessage({type:'HAPPYAD_ASSISTANCE_OPEN_REQUEST',detail:detail},'*');
    }catch(_e){}
  }
  function install(){
    document.querySelectorAll('[data-happyad-assistance-shortcut-v738]').forEach(function(button){
      if(button.__happyadAssistanceBoundV738)return;
      button.__happyadAssistanceBoundV738=true;
      button.addEventListener('pointerdown',prepare,{passive:true});
      button.addEventListener('click',openAssistance,true);
    });
    prepare();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
