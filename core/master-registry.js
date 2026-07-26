(function(){
  'use strict';
  if(window.HappyMasterRegistry)return;
  var masters={};
  function clone(v){try{return JSON.parse(JSON.stringify(v));}catch(_e){return v;}}
  function register(name,spec){
    if(!name)return null;
    masters[name]=Object.assign({name:name,version:'CORE_V4',active:false,mode:'grouped-safe',createdAt:Date.now()},spec||{});
    try{if(window.HappyCorrectionRegistry){window.HappyCorrectionRegistry.register('master:'+name,masters[name]);}}catch(_e){}
    return masters[name];
  }
  function list(){return clone(masters);}
  function get(name){return clone(masters[name]);}
  window.HappyMasterRegistry={version:'CORE_V4',register:register,list:list,get:get,note:'V4: un endroit officiel par module/catégorie, sans changer le design ni supprimer brutalement les anciens blocs.'};
})();
