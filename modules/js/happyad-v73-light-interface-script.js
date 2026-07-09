// Extracted from index.html. Keep load order.
(function(){
  if(window.__happyadV73LightInterface)return;
  window.__happyadV73LightInterface=true;
  const prevOpen=window.openResolutionChat;
  const prevRender=window.renderResolutionChat;
  const prevChoose=window.chooseIssue;
  const prevSend=window.sendResolutionMessage;
  const prevPending=window.markResolutionPending;
  const prevSolved=window.markResolutionSolved;
  const prevPhoto=window.handleResolutionPhoto;
  function esc(v){return String(v==null?'':v).replace(/[&<>\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]})}
  function js(v){return String(v==null?'':v).replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,' ')}
  function orders(){try{return (typeof boutiqueOrders!=='undefined'&&Array.isArray(boutiqueOrders))?boutiqueOrders:(Array.isArray(window.boutiqueOrders)?window.boutiqueOrders:[])}catch(e){return []}}
  function orderById(id){return orders().find(function(o){return String(o&&o.id)===String(id)})||null}
  function currentOrder(){return orderById(window.currentResolutionOrderId)||orders()[0]||null}
  function completed(o){return !!(o&&(o.clientReceived||o.fundsReleased||o.payoutAt||o.status==='completed'||o.status==='released'||o.status==='validated'||o.status==='validée'||o.status==='done'||o.status==='closed'))}
  function money(o){try{if(typeof window.orderTotalText==='function')return window.orderTotalText(o)}catch(e){} try{if(typeof formatBoutiqueAmount==='function')return formatBoutiqueAmount(o.totalK||o.total||0)}catch(e){} return (o&&o.totalText)||((o&&o.totalK?o.totalK:0)+' UGX')}
  function roleLabel(r){return r==='seller'?'Vendeur':(r==='support'?'Support HAPPYAD':'Client')}
  function time(v){try{return new Date(v||Date.now()).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}catch(e){return ''}}
  function ticket(o){
    window.resolutionTickets=window.resolutionTickets||{};
    if(!o)return {messages:[]};
    if(!window.resolutionTickets[o.id])window.resolutionTickets[o.id]={id:'R-'+o.id,orderId:o.id,status:'closed',reason:'Voir chat',createdAt:new Date().toISOString(),messages:[]};
    const t=window.resolutionTickets[o.id];
    if(!Array.isArray(t.messages))t.messages=[];
    return t;
  }
  function openScreen(){
    try{if(typeof show==='function'){show('resolution');return}}catch(e){}
    document.querySelectorAll('.module').forEach(function(m){m.classList.toggle('active',m.id==='resolution')});
    window.currentScreen='resolution';
  }
  function setTop(o){
    try{if(typeof setHeader==='function')setHeader('Voir chat','Commande terminée')}catch(e){}
    const title=document.getElementById('resolutionTitle'); if(title)title.textContent='Voir chat';
    const sub=document.getElementById('resolutionSub'); if(sub)sub.textContent=o?(String(o.id||'')+' · '+String(o.product||'Commande')+' · '+money(o)):'Commande terminée';
    const rule=document.getElementById('resolutionRule'); if(rule)rule.textContent='';
  }
  function proof(o){
    if(!o||(!o.proofPhotoUrl&&!o.proof&&!o.proofPhotoName))return '';
    const media=o.proofPhotoUrl?'<img src="'+esc(o.proofPhotoUrl)+'" alt="Preuve livraison">':'<div class="v73ProofIcon">Preuve</div>';
    const role=(window.currentResolutionRole==='seller')?'seller':'client';
    return '<div class="v73Proof" onclick="event.stopPropagation(); if(typeof openProofFull===\'function\')openProofFull(\''+js(o.id)+'\',\''+role+'\')">'+media+'<div><b>Preuve livraison</b><span>'+esc(o.proof||o.proofPhotoName||'Livraison déclarée')+'</span></div><em>Voir</em></div>';
  }
  function history(o){
    const t=ticket(o);
    const msgs=(t.messages||[]).slice(-8);
    if(!msgs.length)return '<div class="v73NoMsg">Aucun message.</div>';
    return '<div class="v73History"><div class="v73HistoryTitle">Historique</div>'+msgs.map(function(m){const cls=m.role==='seller'?'seller':(m.role==='support'?'support':'client');return '<div class="v73Msg '+cls+'"><b>'+esc(roleLabel(m.role))+'</b><span>'+esc(m.text||'').replace(/\n/g,'<br>')+'</span><small>'+time(m.at)+'</small></div>';}).join('')+'</div>';
  }
  function hideActiveControls(){
    const sec=document.getElementById('resolution');
    if(sec)sec.classList.add('v73-readonly','v72-readonly','v71-readonly');
    const selectors=['.resolutionComposer','.resolutionActions','.resolutionFooterActions','.reasonGrid','textarea','input[type="file"]','.hiddenResolutionFile','.resolutionFileRow','.resolutionProof','.resolutionSend'];
    selectors.forEach(function(sel){document.querySelectorAll('#resolution '+sel).forEach(function(el){el.style.display='none';el.style.pointerEvents='none';try{el.disabled=true}catch(e){}})});
    document.querySelectorAll('#resolution .resolutionCard').forEach(function(card){
      if(card.querySelector('.reasonGrid')||card.querySelector('.resolutionComposer'))card.style.display='none';
    });
  }
  function renderReadonly(){
    const o=currentOrder();
    hideActiveControls();
    setTop(o);
    const box=document.getElementById('resolutionChat')||document.getElementById('resolutionBox');
    if(!box)return;
    if(!o){box.innerHTML='<div class="v73ReadOnlyBox"><div class="v73NoMsg">Aucune commande à afficher.</div></div>';return;}
    box.innerHTML='<div class="v73ReadOnlyBox"><div class="v73MiniOrder"><b>'+esc(o.product||'Commande')+'</b><span>'+esc(o.id||'')+' · '+esc(money(o))+'</span></div>'+proof(o)+history(o)+'</div>';
    try{if(typeof hydrateIcons==='function')hydrateIcons(box)}catch(e){}
  }
  function blockIfDone(){const o=currentOrder(); if(completed(o)){renderReadonly(); try{toast('Chat en vue seule')}catch(e){} return true;} return false;}
  window.openResolutionChat=function(orderId,role,reason){
    const o=orderById(orderId);
    if(o&&completed(o)){
      window.currentResolutionOrderId=o.id; window.currentResolutionRole=role||'client'; window.currentIssue='Voir chat';
      openScreen(); setTimeout(renderReadonly,30); return;
    }
    const sec=document.getElementById('resolution'); if(sec)sec.classList.remove('v73-readonly','v72-readonly','v71-readonly');
    if(typeof prevOpen==='function')return prevOpen.apply(this,arguments);
  };
  window.renderResolutionChat=function(){
    const o=currentOrder();
    if(o&&completed(o))return renderReadonly();
    const sec=document.getElementById('resolution'); if(sec)sec.classList.remove('v73-readonly','v72-readonly','v71-readonly');
    if(typeof prevRender==='function')return prevRender.apply(this,arguments);
  };
  window.chooseIssue=function(){if(blockIfDone())return; if(typeof prevChoose==='function')return prevChoose.apply(this,arguments)};
  window.sendResolutionMessage=function(){if(blockIfDone())return; if(typeof prevSend==='function')return prevSend.apply(this,arguments)};
  window.markResolutionPending=function(){if(blockIfDone())return; if(typeof prevPending==='function')return prevPending.apply(this,arguments)};
  window.markResolutionSolved=function(){if(blockIfDone())return; if(typeof prevSolved==='function')return prevSolved.apply(this,arguments)};
  window.handleResolutionPhoto=function(input){if(blockIfDone()){if(input)input.value='';return;} if(typeof prevPhoto==='function')return prevPhoto.apply(this,arguments)};
  setTimeout(function(){try{if(window.currentScreen==='resolution')window.renderResolutionChat()}catch(e){}},60);
})();
