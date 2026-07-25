(function(){
  'use strict';
  if(window.__HAPPYAD_ASSISTANCE_SUPABASE_REALTIME_V740__)return;
  window.__HAPPYAD_ASSISTANCE_SUPABASE_REALTIME_V740__=true;

  var BUILD='HAPPYAD_ASSISTANCE_SUPABASE_REALTIME_V740';
  var syncTimer=0,pullTimer=0,syncing=false,pulling=false,started=false;
  var client=null,currentUser=null,channel=null,lastFingerprint='';
  var applyingRemote=false,retryTimer=0,initialPullDone=false;

  function api(){return window.HappyadAssistance||null}
  function clean(v){return String(v==null?'':v).trim()}
  function clone(v){try{return JSON.parse(JSON.stringify(v))}catch(_e){return null}}
  function now(){return new Date().toISOString()}
  function uid(prefix){return (prefix||'ha')+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10)}
  function errText(error){return clean(error&&(error.message||error.details||error.hint||error.error_description)||error)}
  function emit(name,detail){try{window.dispatchEvent(new CustomEvent(name,{detail:detail||{}}))}catch(_e){}}

  function getClient(){
    if(client&&client.rpc)return client;
    try{
      if(window.parent&&window.parent!==window){
        if(typeof window.parent.happyadSb==='function')client=window.parent.happyadSb();
        if(!client&&window.parent.happyadSupabase)client=window.parent.happyadSupabase;
        if(!client&&window.parent.supabaseClient&&window.parent.supabaseClient.rpc)client=window.parent.supabaseClient;
      }
    }catch(_e){}
    return client&&client.rpc?client:null;
  }
  async function getAuthUser(){
    var c=getClient();if(!c||!c.auth)return null;
    try{
      var r=await c.auth.getUser();
      currentUser=r&&r.data&&r.data.user?r.data.user:null;
      return currentUser;
    }catch(_e){return null}
  }
  function getContext(){
    var a=api();
    try{return a&&typeof a.getCurrentContext==='function'?(a.getCurrentContext()||{}):(window.__HAPPYAD_ASSISTANCE_CONTEXT__||{})}catch(_e){return {}}
  }
  function getChats(){
    var a=api();
    try{return a&&typeof a.getChats==='function'?(a.getChats()||[]):[]}catch(_e){return []}
  }
  function replaceChats(rows,currentId){
    var a=api();
    if(!a||typeof a.replaceChats!=='function')return false;
    applyingRemote=true;
    try{return a.replaceChats(rows,{currentId:currentId||a.getCurrentChatId&&a.getCurrentChatId(),remote:true})}
    finally{setTimeout(function(){applyingRemote=false},0)}
  }
  function safeLocalMessage(m){
    var x=clone(m)||{};
    delete x.remoteId;delete x.remoteCaseId;delete x.remoteSyncedAt;
    return x;
  }
  function remoteSender(m){
    if(m&&m.kind==='card')return 'system';
    var role=clean(m&&m.role).toLowerCase();
    if(role==='user')return 'user';
    if(role==='assistant')return 'assistant';
    if(role==='system')return 'system';
    return '';
  }
  function remoteType(m){
    if(m&&m.kind==='card')return 'card';
    var v=clean(m&&(m.message_type||m.type||m.kind)).toLowerCase();
    return ['text','image','video','audio','file','system','card'].indexOf(v)>=0?v:'text';
  }
  function messagePayload(m){
    var sender=remoteSender(m);if(!sender)return null;
    return {
      client_message_id:left(clean(m.id)||uid('msg'),180),
      sender_type:sender,
      sender_name:sender==='assistant'?'Assistance HAPPYAD':'',
      body:clean(m.text||m.body||(m.kind==='card'?(m.cardType||'Carte Assistance'):'')),
      message_type:remoteType(m),
      attachments:Array.isArray(m.attachments)?m.attachments:[],
      event_key:clean(m.event_key||''),
      created_at:m.time||m.created_at||now(),
      metadata:{local_message:safeLocalMessage(m),build:BUILD}
    };
  }
  function left(v,n){return clean(v).slice(0,n)}
  function localMeta(chat){
    return {
      local_chat:{
        id:chat.id,title:chat.title,status:chat.status,state:chat.state,
        categoryId:chat.categoryId||'',selectedCategoryId:chat.selectedCategoryId||'',
        selectedTopicId:chat.selectedTopicId||'',country:chat.country||'',
        adminReason:chat.adminReason||'',closedBy:chat.closedBy||'',
        createdAt:chat.createdAt||now(),updatedAt:chat.updatedAt||now()
      },
      integration:'happyad-v740',build:BUILD
    };
  }
  function meaningfulChat(chat){
    if(!chat||!chat.id)return false;
    if(chat.state==='waiting_admin'||chat.status==='waiting_admin'||chat.status==='resolved')return true;
    return (chat.messages||[]).some(function(m){return m&&m.role==='user'&&clean(m.text)});
  }
  async function syncOne(chat,context){
    var c=getClient();if(!c||!currentUser||!meaningfulChat(chat))return chat;
    var p={
      p_client_case_id:left(chat.id,180),
      p_user_name:left(context.user&&context.user.name,180),
      p_user_username:left(context.user&&context.user.username,100),
      p_user_avatar_url:left(context.user&&context.user.avatar,1200),
      p_country:left(chat.country||context.country,120),
      p_language:left(context.language||navigator.language||'fr',24),
      p_source:left(context.source||'happyad',80),
      p_category_id:left(chat.selectedCategoryId||chat.categoryId,120),
      p_category_label:left(chat.categoryLabel||'',220),
      p_topic_id:left(chat.selectedTopicId||'',120),
      p_topic_label:left(chat.topicLabel||chat.title||'',220),
      p_subject:left(chat.title||'Demande Assistance',300),
      p_metadata:localMeta(chat)
    };
    var r=await c.rpc('happyad_assistance_upsert_case',p);
    if(r.error)throw r.error;
    var remote=Array.isArray(r.data)?r.data[0]:r.data;
    if(!remote||!remote.id)return chat;
    chat.remoteCaseId=remote.id;
    chat.remoteCaseNumber=remote.case_number||chat.remoteCaseNumber||'';
    chat.remoteStatus=remote.status||'';

    var messages=(chat.messages||[]).map(messagePayload).filter(Boolean);
    if(messages.length){
      var sm=await c.rpc('happyad_assistance_sync_messages',{p_case_id:remote.id,p_messages:messages});
      if(sm.error)throw sm.error;
    }
    var waiting=chat.state==='waiting_admin'||chat.status==='waiting_admin';
    if(waiting&&clean(chat.country||context.country)&&!remote.escalated_at){
      var es=await c.rpc('happyad_assistance_escalate_case',{
        p_case_id:remote.id,p_country:chat.country||context.country,p_priority:'normal',
        p_subject:left(chat.title||'Demande Assistance',300),
        p_metadata:{admin_reason:chat.adminReason||'',build:BUILD}
      });
      if(es.error)throw es.error;
      remote=Array.isArray(es.data)?es.data[0]:es.data;
      chat.remoteStatus=remote&&remote.status||'waiting_agent';
    }
    if(chat.status==='resolved'&&remote.status!=='resolved'&&remote.status!=='closed'&&chat.closedBy!=='admin'){
      var fin=await c.rpc('happyad_assistance_user_finish_case',{p_case_id:remote.id,p_status:'resolved'});
      if(fin.error&&errText(fin.error).indexOf('CASE_ACCESS_DENIED_OR_CLOSED')<0)throw fin.error;
      chat.remoteStatus='resolved';
    }
    chat.remoteSyncedAt=now();
    return chat;
  }
  async function syncAll(){
    if(syncing||applyingRemote)return;
    var c=getClient();var a=api();if(!c||!a)return;
    if(!currentUser&&!(await getAuthUser()))return;
    syncing=true;
    try{
      var context=getContext(),rows=getChats(),changed=false;
      for(var i=0;i<rows.length;i++){
        var before=rows[i].remoteSyncedAt||'';
        rows[i]=await syncOne(rows[i],context);
        if((rows[i].remoteSyncedAt||'')!==before)changed=true;
      }
      if(changed)replaceChats(rows,a.getCurrentChatId&&a.getCurrentChatId());
      emit('HAPPYAD_ASSISTANCE_REMOTE_SYNCED_V740',{count:rows.length,at:Date.now()});
      schedulePull(80);
    }catch(error){
      console.warn('HAPPYAD Assistance sync V740',error);
      emit('HAPPYAD_ASSISTANCE_REMOTE_ERROR_V740',{phase:'sync',message:errText(error)});
      scheduleSync(3500);
    }finally{syncing=false}
  }
  function baseChatFromCase(row){
    var meta=row&&row.metadata&&row.metadata.local_chat||{};
    return {
      id:clean(row.client_case_id)||uid('case'),title:meta.title||row.subject||'Demande Assistance',
      status:'open',state:'root',categoryId:meta.categoryId||row.category_id||'',
      selectedCategoryId:meta.selectedCategoryId||row.category_id||'',selectedTopicId:meta.selectedTopicId||row.topic_id||'',
      country:meta.country||row.user_country||'',adminReason:meta.adminReason||'',adminHasReplied:false,
      agentName:row.assigned_agent_name||'',agentConnected:!!row.assigned_agent_id,
      agentConnectionAnnounced:!!row.assigned_agent_id,closedBy:meta.closedBy||'',
      createdAt:meta.createdAt||row.created_at||now(),updatedAt:row.updated_at||meta.updatedAt||now(),messages:[],
      remoteCaseId:row.id,remoteCaseNumber:row.case_number||'',remoteStatus:row.status||''
    };
  }
  function genericLocalMessage(m){
    var role=m.sender_type==='user'?'user':m.sender_type==='agent'?'admin':m.sender_type==='system'?'assistant':'assistant';
    var semantic=m.event_key&&String(m.event_key).indexOf('agent-connected:')===0?'agent-connected':'';
    return {
      id:m.client_message_id||('remote-'+m.id),remoteId:m.id,role:role,text:m.body||'',time:m.created_at||now(),
      feedback:role==='admin'&&semantic!=='agent-connected',feedbackResult:'',origin:role==='admin'?'admin':'bot',
      semantic:semantic,agentName:m.sender_name||''
    };
  }
  function mergeCase(local,row,messages){
    var chat=local||baseChatFromCase(row);
    chat.remoteCaseId=row.id;chat.remoteCaseNumber=row.case_number||chat.remoteCaseNumber||'';chat.remoteStatus=row.status||'';
    chat.title=row.subject||chat.title;chat.country=row.user_country||chat.country;chat.updatedAt=row.updated_at||chat.updatedAt;
    chat.agentName=row.assigned_agent_name||chat.agentName||'';chat.agentConnected=!!row.assigned_agent_id;
    chat.agentConnectionAnnounced=chat.agentConnected||chat.agentConnectionAnnounced;
    var byId={};(chat.messages||[]).forEach(function(m){byId[String(m.id)]=m});
    messages.forEach(function(m){
      var lm=m&&m.metadata&&m.metadata.local_message?clone(m.metadata.local_message):null;
      if(!lm)lm=genericLocalMessage(m);
      if(m.sender_type==='agent'){
        lm.role='admin';lm.origin='admin';lm.feedback=true;lm.semantic=lm.semantic||'agent-reply';lm.agentName=m.sender_name||row.assigned_agent_name||'';
      }
      if(m.sender_type==='system'&&m.event_key&&String(m.event_key).indexOf('agent-connected:')===0){
        lm.role='admin';lm.origin='admin';lm.feedback=false;lm.semantic='agent-connected';lm.agentName=m.sender_name||row.assigned_agent_name||'';
        chat.agentConnected=true;chat.agentConnectionAnnounced=true;chat.agentName=lm.agentName;
      }
      lm.id=lm.id||m.client_message_id||('remote-'+m.id);lm.remoteId=m.id;lm.time=lm.time||m.created_at||now();
      if(!byId[String(lm.id)]){chat.messages.push(lm);byId[String(lm.id)]=lm}
    });
    chat.messages=(chat.messages||[]).sort(function(a,b){return new Date(a.time||0)-new Date(b.time||0)});
    chat.adminHasReplied=chat.messages.some(function(m){return m.role==='admin'&&m.semantic!=='agent-connected'});
    if(['waiting_agent','assigned','answered','waiting_user'].indexOf(row.status)>=0){
      chat.status='waiting_admin';chat.state='waiting_admin';
      chat.messages=chat.messages.filter(function(m){return !(m.kind==='card'&&m.cardType==='resolved')});
    }
    if(row.status==='resolved'||row.status==='closed'){
      chat.status='resolved';chat.state='resolved';chat.closedBy=row.closed_by?'admin':(chat.closedBy||'user');
      if(!chat.messages.some(function(m){return m.kind==='card'&&m.cardType==='resolved'})){
        chat.messages.push({id:'remote-resolved-'+row.id,role:'system',kind:'card',cardType:'resolved',time:row.resolved_at||row.closed_at||row.updated_at||now()});
      }
    }
    return chat;
  }
  async function pullRemote(){
    if(pulling)return;
    var c=getClient(),a=api();if(!c||!a)return;
    if(!currentUser&&!(await getAuthUser()))return;
    pulling=true;
    try{
      var q=await c.from('happyad_assistance_cases').select('*').order('updated_at',{ascending:false}).limit(200);
      if(q.error)throw q.error;
      var cases=q.data||[],ids=cases.map(function(x){return x.id}),allMessages=[];
      for(var start=0;start<ids.length;start+=80){
        var chunk=ids.slice(start,start+80);if(!chunk.length)continue;
        var mr=await c.from('happyad_assistance_messages').select('*').in('case_id',chunk).order('created_at',{ascending:true}).limit(5000);
        if(mr.error)throw mr.error;allMessages=allMessages.concat(mr.data||[]);
      }
      var grouped={};allMessages.forEach(function(m){(grouped[m.case_id]||(grouped[m.case_id]=[])).push(m)});
      var local=getChats(),map={};local.forEach(function(ch){map[String(ch.id)]=ch});
      cases.forEach(function(row){var key=clean(row.client_case_id);map[key]=mergeCase(map[key]||null,row,grouped[row.id]||[])});
      var merged=Object.keys(map).map(function(k){return map[k]}).sort(function(a,b){return new Date(b.updatedAt||0)-new Date(a.updatedAt||0)});
      var fingerprint=JSON.stringify(cases.map(function(x){return [x.id,x.updated_at,x.status,x.user_unread_count,x.assigned_agent_id]}));
      var requestedCurrent=a.getCurrentChatId&&a.getCurrentChatId();
      if(!initialPullDone&&cases.length){
        var initialLocal=local.find(function(x){return String(x.id)===String(requestedCurrent)});
        var pristine=initialLocal&&initialLocal.state==='root'&&initialLocal.status==='open'&&
          (initialLocal.messages||[]).length<=2&&!(initialLocal.messages||[]).some(function(m){return m.role==='user'&&clean(m.text)});
        if(pristine)requestedCurrent=cases[0].client_case_id||requestedCurrent;
      }
      replaceChats(merged,requestedCurrent);initialPullDone=true;lastFingerprint=fingerprint;
      var currentId=requestedCurrent,current=merged.find(function(x){return String(x.id)===String(currentId)});
      if(current&&current.remoteCaseId){
        var row=cases.find(function(x){return x.id===current.remoteCaseId});
        if(row&&Number(row.user_unread_count)>0){
          var last=(grouped[row.id]||[]).slice(-1)[0];
          c.rpc('happyad_assistance_mark_read',{p_case_id:row.id,p_last_message_id:last&&last.id||null}).then(function(){});
        }
      }
      emit('HAPPYAD_ASSISTANCE_REMOTE_PULLED_V740',{cases:cases.length,messages:allMessages.length,at:Date.now()});
    }catch(error){
      console.warn('HAPPYAD Assistance pull V740',error);
      emit('HAPPYAD_ASSISTANCE_REMOTE_ERROR_V740',{phase:'pull',message:errText(error)});
      schedulePull(3500);
    }finally{pulling=false}
  }
  function scheduleSync(delay){
    clearTimeout(syncTimer);syncTimer=setTimeout(syncAll,Math.max(80,Number(delay||260)));
  }
  function schedulePull(delay){clearTimeout(pullTimer);pullTimer=setTimeout(pullRemote,Math.max(40,Number(delay||180)))}
  function stopRealtime(){
    try{if(channel&&client)client.removeChannel(channel)}catch(_e){}channel=null;
  }
  function startRealtime(){
    var c=getClient();if(!c||!currentUser)return;
    stopRealtime();
    channel=c.channel('happyad-assistance-user-v740-'+currentUser.id)
      .on('postgres_changes',{event:'*',schema:'public',table:'happyad_assistance_cases'},function(){schedulePull(80)})
      .on('postgres_changes',{event:'*',schema:'public',table:'happyad_assistance_messages'},function(){schedulePull(80)})
      .subscribe(function(status){emit('HAPPYAD_ASSISTANCE_REALTIME_STATUS_V740',{status:status})});
  }
  async function start(){
    if(started)return;var a=api();if(!a){retryTimer=setTimeout(start,120);return}
    var c=getClient();if(!c){retryTimer=setTimeout(start,350);return}
    var user=await getAuthUser();if(!user){retryTimer=setTimeout(start,700);return}
    started=true;startRealtime();await pullRemote();scheduleSync(120);
    try{
      c.auth.onAuthStateChange(function(_event,session){
        var next=session&&session.user||null;
        if(!next){currentUser=null;started=false;stopRealtime();return}
        if(!currentUser||next.id!==currentUser.id){currentUser=next;startRealtime();schedulePull(40);scheduleSync(100)}
      });
    }catch(_e){}
  }

  window.addEventListener('HAPPYAD_ASSISTANCE_LOCAL_CHANGED_V40',function(){scheduleSync(180)});
  window.addEventListener('HAPPYAD_ASSISTANCE_CONTEXT_CHANGED_V40',function(){scheduleSync(100);schedulePull(80)});
  window.addEventListener('focus',function(){schedulePull(80)});
  window.addEventListener('online',function(){start();schedulePull(40);scheduleSync(80)});
  document.addEventListener('visibilitychange',function(){if(!document.hidden)schedulePull(80)});
  window.HappyadAssistanceRealtimeV740=Object.freeze({build:BUILD,start:start,sync:syncAll,pull:pullRemote,isConnected:function(){return !!(started&&currentUser&&channel)}});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
