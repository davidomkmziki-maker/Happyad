// Extracted from index.html. Keep load order.
(function(){
  if(window.__happyadV72FinalReadonlyChat)return;
  window.__happyadV72FinalReadonlyChat=true;
  const prevOpen=window.openResolutionChat;
  const prevRender=window.renderResolutionChat;
  const prevChoose=window.chooseIssue;
  const prevSend=window.sendResolutionMessage;
  const prevPending=window.markResolutionPending;
  const prevSolved=window.markResolutionSolved;
  const prevPhoto=window.handleResolutionPhoto;
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function js(v){return String(v==null?'':v).replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,' ')}
  function allOrders(){try{return Array.isArray(window.boutiqueOrders)?window.boutiqueOrders:(Array.isArray(boutiqueOrders)?boutiqueOrders:[])}catch(e){return []}}
  function orderById(id){const a=allOrders(); return a.find(function(o){return String(o&&o.id)===String(id)})||null}
  function currentOrder(){return orderById(window.currentResolutionOrderId)||allOrders()[0]||null}
  function completed(o){return !!(o&&(o.clientReceived||o.fundsReleased||o.status==='completed'||o.status==='released'||o.status==='validated'||o.status==='validée'||o.status==='done'||o.status==='closed'))}
  function money(o){try{if(typeof formatBoutiqueAmount==='function')return formatBoutiqueAmount(o.totalK||o.total||0)}catch(e){} return esc(o&&o.totalText?o.totalText:((o&&o.totalK?o.totalK:'0')+' UGX'))}
  function roleName(r){return r==='seller'?'Vendeur':(r==='support'?'Support HAPPYAD':'Client')}
  function time(v){try{return new Date(v||Date.now()).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}catch(e){return ''}}
  function ensureTicket(o){
    window.resolutionTickets=window.resolutionTickets||{};
    if(!o)return {messages:[]};
    if(!window.resolutionTickets[o.id]){
      window.resolutionTickets[o.id]={id:'R-'+o.id,orderId:o.id,status:'closed',reason:'Voir chat',createdAt:new Date().toISOString(),messages:[]};
    }
    const t=window.resolutionTickets[o.id];
    if(!Array.isArray(t.messages))t.messages=[];
    if(!t.messages.length){t.messages.push({role:'support',text:'Opération terminée. Ce dossier est disponible en consultation seule.',at:new Date().toISOString(),auto:'readonlyDone'});}
    return t;
  }
  function setScreen(){
    try{if(typeof show==='function'){show('resolution');return}}catch(e){}
    document.querySelectorAll('.module').forEach(function(m){m.classList.toggle('active',m.id==='resolution')});
    window.currentScreen='resolution';
    try{if(typeof setHeader==='function')setHeader('Revendication','Voir chat')}catch(e){}
  }
  function setTop(o){
    try{if(typeof setHeader==='function')setHeader('Revendication','Voir chat')}catch(e){}
    const title=document.getElementById('resolutionTitle'); if(title)title.textContent='Voir chat';
    const sub=document.getElementById('resolutionSub'); if(sub)sub.textContent=o?(String(o.id||'')+' · '+String(o.product||'Commande')+' · '+money(o)):'Commande terminée';
    const rule=document.getElementById('resolutionRule'); if(rule)rule.textContent='Opération terminée : chat en lecture seule. Vous pouvez seulement consulter l’historique et la preuve.';
  }
  function proofBlock(o){
    if(!o||(!o.proofPhotoUrl&&!o.proof&&!o.proofPhotoName))return '';
    const media=o.proofPhotoUrl?'<img src="'+esc(o.proofPhotoUrl)+'" alt="Preuve livraison">':'<div class="v72ProofIcon">Preuve</div>';
    return '<div class="v72Proof" onclick="event.stopPropagation(); if(typeof openProofFull===\'function\')openProofFull(\''+js(o.id)+'\',\''+(window.currentResolutionRole==='seller'?'seller':'client')+'\')">'+media+'<div><b>Preuve livraison</b><span>'+esc(o.proof||o.proofPhotoName||'Livraison déclarée')+'</span></div><em>Voir</em></div>';
  }
  function historyBlock(o){
    const t=ensureTicket(o);
    let msgs=t.messages.slice(-8);
    return msgs.map(function(m){const cls=m.role==='seller'?'seller':(m.role==='support'?'support':'client'); return '<div class="v72Msg '+cls+'"><b>'+esc(roleName(m.role))+'</b><span>'+esc(m.text||'').replace(/\n/g,'<br>')+'</span><small>'+time(m.at)+'</small></div>';}).join('');
  }
  function renderReadonly(){
    const o=currentOrder();
    const sec=document.getElementById('resolution'); if(sec)sec.classList.add('v72-readonly','v71-readonly');
    const box=document.getElementById('resolutionChat')||document.getElementById('resolutionBox'); if(!box)return;
    if(!o){box.innerHTML='<div class="v72ReadOnlyBox"><div class="v72ReadOnlyEnd">Aucune commande à afficher.</div></div>';return;}
    setTop(o);
    box.innerHTML='<div class="v72ReadOnlyBox"><div class="v72MiniHead"><b>'+esc(o.product||'Commande')+'</b><span>Commande validée · Voir chat</span></div>'+proofBlock(o)+'<div class="v72HistoryTitle">Historique</div>'+historyBlock(o)+'<div class="v72ReadOnlyEnd">Vue seule : aucune écriture possible après la fin de l’opération.</div></div>';
    try{if(typeof hydrateIcons==='function')hydrateIcons(box)}catch(e){}
    try{box.scrollTop=0}catch(e){}
  }
  function blockIfDone(){const o=currentOrder(); if(completed(o)){try{toast('Opération terminée : chat en vue seule.')}catch(e){} renderReadonly(); return true;} return false;}
  window.openResolutionChat=function(orderId,role,reason){
    const o=orderById(orderId);
    if(o&&completed(o)){
      window.currentResolutionOrderId=o.id;
      window.currentResolutionRole=role||'client';
      window.currentIssue='Voir chat';
      setScreen();
      setTimeout(renderReadonly,20);
      return;
    }
    if(typeof prevOpen==='function')return prevOpen.apply(this,arguments);
  };
  window.renderResolutionChat=function(){
    const o=currentOrder();
    if(o&&completed(o))return renderReadonly();
    const sec=document.getElementById('resolution'); if(sec)sec.classList.remove('v72-readonly','v71-readonly');
    if(typeof prevRender==='function')return prevRender.apply(this,arguments);
  };
  window.chooseIssue=function(){if(blockIfDone())return; if(typeof prevChoose==='function')return prevChoose.apply(this,arguments)};
  window.sendResolutionMessage=function(){if(blockIfDone())return; if(typeof prevSend==='function')return prevSend.apply(this,arguments)};
  window.markResolutionPending=function(){if(blockIfDone())return; if(typeof prevPending==='function')return prevPending.apply(this,arguments)};
  window.markResolutionSolved=function(){if(blockIfDone())return; if(typeof prevSolved==='function')return prevSolved.apply(this,arguments)};
  window.handleResolutionPhoto=function(input){if(blockIfDone()){if(input)input.value='';return;} if(typeof prevPhoto==='function')return prevPhoto.apply(this,arguments)};
})();
