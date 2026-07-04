(function(){
  'use strict';
  if(window.__HAPPYAD_NOTIF_MSG_MASTER_V4__)return;
  window.__HAPPYAD_NOTIF_MSG_MASTER_V4__=true;
  var MASTER_VERSION='NOTIFICATIONS_MESSAGES_MASTER_V4';
  function openNotifications(params){params=params||{};var url='modules/notifications.html';var qs=[];if(params.cat)qs.push('cat='+encodeURIComponent(params.cat));if(params.open)qs.push('open='+encodeURIComponent(params.open));if(qs.length)url+='?'+qs.join('&');try{if(window.HappyNavigation)return HappyNavigation.open(url,{source:MASTER_VERSION});}catch(_e){}try{if(window.happyadOpenInternalUrlV492)return happyadOpenInternalUrlV492(url,{source:MASTER_VERSION});}catch(_e2){}location.href=url;return true;}
  function openMessages(params){params=params||{};var url='messages.html'+(params.uid?('?uid='+encodeURIComponent(params.uid)):'');try{if(window.HappyNavigation)return HappyNavigation.open(url,{source:MASTER_VERSION});}catch(_e){}try{if(window.happyadOpenInternalUrlV492)return happyadOpenInternalUrlV492(url,{source:MASTER_VERSION});}catch(_e2){}location.href=url;return true;}
  window.HappyNotificationsMessages={version:MASTER_VERSION,openNotifications:openNotifications,openMessages:openMessages};
  try{if(window.HappyMasterRegistry)HappyMasterRegistry.register('notifications-messages',{file:'core/notifications-messages-master.js',responsibility:'notifications, messages, compteurs, ouverture via route unique',active:false});}catch(_e){}
})();
