(function(){
  'use strict';
  if(window.__HAPPYAD_MODULE_LIFECYCLE_MASTER_V614__)return;
  window.__HAPPYAD_MODULE_LIFECYCLE_MASTER_V614__=true;

  var VERSION='MODULE_LIFECYCLE_V614';
  var nativeSetInterval=window.setInterval.bind(window);
  var nativeClearInterval=window.clearInterval.bind(window);
  var nativeClearTimeout=window.clearTimeout.bind(window);
  var NativeMutationObserver=window.MutationObserver;
  var intervalSeq=614000000;
  var intervals=new Map();
  var observers=new Set();
  var suspended=false;
  var suspendedAt=0;

  function safeCall(fn,args){
    try{
      if(typeof fn==='function')return fn.apply(window,args||[]);
      if(typeof fn==='string')return (0,eval)(fn);
    }catch(err){try{console.warn('HAPPYAD lifecycle interval',err);}catch(_e){}}
  }
  function startInterval(rec){
    if(!rec||!rec.enabled||suspended||rec.nativeId!=null)return;
    rec.nativeId=nativeSetInterval(function(){safeCall(rec.fn,rec.args);},Math.max(16,Number(rec.delay)||0));
  }
  window.setInterval=function(fn,delay){
    var args=Array.prototype.slice.call(arguments,2);
    var token=++intervalSeq;
    var rec={token:token,fn:fn,delay:delay,args:args,enabled:true,nativeId:null};
    intervals.set(token,rec);
    startInterval(rec);
    return token;
  };
  window.clearInterval=function(id){
    var rec=intervals.get(id);
    if(rec){
      rec.enabled=false;
      if(rec.nativeId!=null){try{nativeClearInterval(rec.nativeId);}catch(_e){}rec.nativeId=null;}
      intervals.delete(id);
      return;
    }
    try{nativeClearInterval(id);}catch(_e){}
  };
  window.clearTimeout=function(id){
    if(intervals.has(id)){window.clearInterval(id);return;}
    try{nativeClearTimeout(id);}catch(_e){}
  };

  if(NativeMutationObserver){
    function ManagedMutationObserver(callback){
      var nativeObserver=new NativeMutationObserver(callback);
      var records=[];
      var originalObserve=nativeObserver.observe.bind(nativeObserver);
      var originalDisconnect=nativeObserver.disconnect.bind(nativeObserver);
      nativeObserver.observe=function(target,options){
        records.push({target:target,options:options});
        if(!suspended)return originalObserve(target,options);
      };
      nativeObserver.disconnect=function(){records.length=0;return originalDisconnect();};
      nativeObserver.__happyadLifecyclePause=function(){try{originalDisconnect();}catch(_e){}};
      nativeObserver.__happyadLifecycleResume=function(){
        records.forEach(function(item){
          try{if(item.target&&item.target.isConnected!==false)originalObserve(item.target,item.options);}catch(_e){}
        });
      };
      observers.add(nativeObserver);
      return nativeObserver;
    }
    ManagedMutationObserver.prototype=NativeMutationObserver.prototype;
    try{Object.setPrototypeOf(ManagedMutationObserver,NativeMutationObserver);}catch(_e){}
    window.MutationObserver=ManagedMutationObserver;
  }

  function pauseMedia(){
    try{
      document.querySelectorAll('video,audio').forEach(function(media){
        try{media.pause();}catch(_e){}
      });
    }catch(_e){}
  }
  function setCssPaused(on){
    try{
      var root=document.documentElement;
      if(root)root.classList.toggle('happyadModuleSuspendedV614',!!on);
      var st=document.getElementById('happyadModuleLifecycleStyleV614');
      if(!st){
        st=document.createElement('style');
        st.id='happyadModuleLifecycleStyleV614';
        st.textContent='html.happyadModuleSuspendedV614 *,html.happyadModuleSuspendedV614 *:before,html.happyadModuleSuspendedV614 *:after{animation-play-state:paused!important;}';
        (document.head||document.documentElement).appendChild(st);
      }
    }catch(_e){}
  }
  function suspend(reason){
    if(suspended){pauseMedia();return false;}
    suspended=true;suspendedAt=Date.now();
    intervals.forEach(function(rec){
      if(rec.nativeId!=null){try{nativeClearInterval(rec.nativeId);}catch(_e){}rec.nativeId=null;}
    });
    observers.forEach(function(ob){try{ob.__happyadLifecyclePause&&ob.__happyadLifecyclePause();}catch(_e){}});
    pauseMedia();setCssPaused(true);
    try{window.dispatchEvent(new CustomEvent('HAPPYAD_MODULE_SUSPEND_V614',{detail:{reason:String(reason||''),at:suspendedAt}}));}catch(_e){}
    return true;
  }
  function resume(reason){
    if(!suspended){setCssPaused(false);return false;}
    suspended=false;
    setCssPaused(false);
    observers.forEach(function(ob){try{ob.__happyadLifecycleResume&&ob.__happyadLifecycleResume();}catch(_e){}});
    intervals.forEach(startInterval);
    try{window.dispatchEvent(new CustomEvent('HAPPYAD_MODULE_RESUME_V614',{detail:{reason:String(reason||''),hiddenMs:Math.max(0,Date.now()-suspendedAt),at:Date.now()}}));}catch(_e){}
    return true;
  }
  function status(){return {version:VERSION,suspended:suspended,intervals:intervals.size,observers:observers.size};}

  window.addEventListener('message',function(event){
    var data=event&&event.data;
    var type=typeof data==='string'?data:String(data&&data.type||'');
    if(type==='HAPPYAD_APP_FRAME_HIDDEN'||type==='HAPPYAD_MODULE_SUSPEND'||type==='HAPPYAD_PAUSE_ALL_MEDIA'||type==='HAPPYAD_STOP_MEDIA'){
      suspend(data&&data.reason||type);
      return;
    }
    if(type==='HAPPYAD_APP_FRAME_VISIBLE'||type==='HAPPYAD_MODULE_RESUME'){
      resume(data&&data.source||type);
    }
  },true);

  window.addEventListener('pagehide',function(){suspend('pagehide');});
  window.addEventListener('pageshow',function(){
    try{if(window.parent===window)resume('pageshow-standalone');}catch(_e){}
  });

  window.HappyModuleLifecycleV614={version:VERSION,suspend:suspend,resume:resume,status:status};
})();
