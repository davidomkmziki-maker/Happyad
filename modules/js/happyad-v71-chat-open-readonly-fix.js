// Extracted from index.html. Keep load order.
(function(){
  if(window.__happyadV71ChatOpenReadonlyFix)return;
  window.__happyadV71ChatOpenReadonlyFix=true;
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function js(v){return String(v==null?'':v).replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,' ')}
  function list(){try{return Array.isArray(window.boutiqueOrders)?window.boutiqueOrders:(Array.isArray(boutiqueOrders)?boutiqueOrders:[])}catch(e){return []}}
  function findOrder(id){const a=list(); return a.find(function(o){return String(o&&o.id)===String(id)})||a[0]||null}
  function finished(o){return !!(o&&(o.clientReceived||o.fundsReleased||o.status==='completed'||o.status==='released'||o.status==='validated'||o.status==='done'))}
  function money(o){try{if(typeof formatBoutiqueAmount==='function')return formatBoutiqueAmount(o.totalK||0)}catch(e){} return (o&&o.totalK?o.totalK:'0')+' UGX'}
  function roleName(r){return r==='seller'?'Vendeur':(r==='support'?'Support HAPPYAD':'Client')}
  function statusText(o){if(finished(o))return 'Commande validée · Voir chat'; if(o&&o.claimOpen)return 'Revendication ouverte'; if(o&&o.sellerDelivered)return 'En attente client'; return 'Opération en cours'}
  function ticket(o,reason,create){
    window.resolutionTickets=window.resolutionTickets||{};
    if(!o)return {messages:[]};
    if(!window.resolutionTickets[o.id]){
      window.resolutionTickets[o.id]={id:'R-'+o.id,orderId:o.id,status:'open',reason:reason||'Revendication',createdAt:new Date().toISOString(),messages:[]};
    }
    const t=window.resolutionTickets[o.id];
    if(reason)t.reason=reason;
    if(create&&!t.messages.some(function(m){return m.auto==='supportOpen'}))t.messages.push({role:'support',text:'Dossier ouvert. Le paiement reste protégé pendant la résolution.',at:new Date().toISOString(),auto:'supportOpen'});
    return t;
  }
  function activateResolution(){
    try{if(typeof show==='function'){show('resolution');return}}catch(e){}
    document.querySelectorAll('.module').forEach(function(m){m.classList.toggle('active',m.id==='resolution')});
    window.currentScreen='resolution';
    try{if(typeof setHeader==='function')setHeader('Revendication','Chat commande')}catch(e){}
  }
  function setHeaderFor(o,ro){
    const title=document.getElementById('resolutionTitle');
    const sub=document.getElementById('resolutionSub');
    const rule=document.getElementById('resolutionRule');
    if(title)title.textContent=ro?'Voir chat':'Dossier commande';
    if(sub)sub.textContent=o?(String(o.id||'')+' · '+String(o.product||'Commande')+' · '+money(o)):'Commande liée';
    if(rule)rule.textContent=ro?'Opération terminée : chat en vue seule. Impossible d’écrire ou d’ajouter une preuve.':'Chat disponible uniquement pendant une opération en cours / revendication.';
  }
  function proofHtml(o,role){
    if(!o||(!o.proofPhotoUrl&&!o.proof))return '';
    const media=o.proofPhotoUrl?'<img src="'+esc(o.proofPhotoUrl)+'" alt="Preuve livraison">':'<div class="v71ProofIcon">Preuve</div>';
    return '<div class="v71ProofCard" onclick="event.stopPropagation();openProofFull(\''+js(o.id)+'\',\''+(role==='seller'?'seller':'client')+'\')">'+media+'<div><b>Preuve livraison</b><span>'+esc(o.proof||o.proofPhotoName||'Livraison déclarée')+'</span></div><em>Voir</em></div>';
  }
  function messagesHtml(t,ro,role){
    let msgs=(t&&Array.isArray(t.messages))?t.messages.slice():[];
    if(!msgs.length){
      msgs=[{role:'support',text:ro?'Opération terminée. Historique disponible en consultation seule.':'Dossier ouvert. Écrivez seulement si l’opération est encore en cours.',at:new Date().toISOString()}];
    }
    return msgs.map(function(m){const cls=m.role==='seller'?'seller':(m.role==='support'?'support':'client'); const at=m.at?'<small>'+esc(new Date(m.at).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}))+'</small>':''; return '<div class="chatBubble '+cls+'"><b>'+roleName(m.role)+'</b><span>'+esc(m.text).replace(/\n/g,'<br>')+'</span>'+at+'</div>'}).join('');
  }
  window.renderResolutionChat=function(){
    const o=findOrder(window.currentResolutionOrderId);
    const role=window.currentResolutionRole||'client';
    const ro=finished(o);
    const sec=document.getElementById('resolution'); if(sec)sec.classList.toggle('v71-readonly',!!ro);
    const box=document.getElementById('resolutionChat')||document.getElementById('resolutionBox');
    if(!box)return;
    if(!o){box.innerHTML='<div class="card empty">Aucune commande.</div>';return;}
    setHeaderFor(o,ro);
    const t=ticket(o,window.currentIssue||o.claimReason||'Revendication',!ro);
    const mini='<div class="v71ChatMini"><b>'+esc(o.product||'Commande')+'</b><span>'+esc(statusText(o))+'</span></div>';
    const readonly=ro?'<div class="v71ReadOnlyNotice">Ce chat est en vue seule parce que l’opération est terminée. Vous pouvez seulement voir la preuve et l’historique.</div>':'';
    box.innerHTML=mini+proofHtml(o,role)+readonly+messagesHtml(t,ro,role);
    try{box.scrollTop=box.scrollHeight}catch(e){}
    try{if(typeof hydrateIcons==='function')hydrateIcons(box)}catch(e){}
  };
  window.openResolutionChat=function(orderId,role,reason){
    const o=findOrder(orderId);
    if(!o){try{toast('Commande introuvable')}catch(e){} return;}
    const ro=finished(o);
    window.currentResolutionOrderId=o.id;
    window.currentResolutionRole=role||'client';
    window.currentIssue=ro?'Voir chat':(reason||'Revendication');
    if(!ro){
      o.claimOpen=true; o.claimReason=window.currentIssue;
      const t=ticket(o,window.currentIssue,true);
      const auto=(role||'client')+':'+window.currentIssue;
      if(!t.messages.some(function(m){return m.auto===auto}))t.messages.push({role:role==='seller'?'seller':'client',text:window.currentIssue+' — '+(role==='seller'?'Le vendeur a ouvert le dossier.':'Le client a ouvert une revendication.'),at:new Date().toISOString(),auto:auto});
    }
    setHeaderFor(o,ro);
    activateResolution();
    setTimeout(function(){try{window.renderResolutionChat()}catch(e){}},30);
  };
  window.openResolution=function(orderId,role){
    const o=findOrder(orderId||window.currentResolutionOrderId);
    if(o)window.openResolutionChat(o.id,role||'client',finished(o)?'Voir chat':'Revendication');
    else activateResolution();
  };
  window.chooseIssue=function(btn,label){
    const o=findOrder(window.currentResolutionOrderId);
    if(finished(o)){try{toast('Opération terminée : chat en vue seule.')}catch(e){} return;}
    window.currentIssue=label||'Revendication';
    if(o){o.claimOpen=true;o.claimReason=window.currentIssue;ticket(o,window.currentIssue,true)}
    document.querySelectorAll('#issueChips .issueChip').forEach(function(b){b.classList.remove('active')});
    if(btn)btn.classList.add('active');
    const input=document.getElementById('resolutionInput'); if(input){const presets={'Je n’ai pas reçu':'Je n’ai pas reçu ma commande. Merci de vérifier.','Annulation':'Je demande l’annulation de cette commande.','Difficulté livraison':'J’ai une difficulté réelle pour cette livraison.','Déjà expédié':'La commande est déjà expédiée. Je peux fournir une preuve.','Problème général':''}; input.value=presets[window.currentIssue]||'';}
    window.renderResolutionChat();
  };
  window.sendResolutionMessage=function(){
    const o=findOrder(window.currentResolutionOrderId);
    if(!o){try{toast('Aucune commande')}catch(e){} return;}
    if(finished(o)){try{toast('Opération terminée : impossible d’écrire dans ce chat.')}catch(e){} window.renderResolutionChat(); return;}
    const input=document.getElementById('resolutionInput')||document.getElementById('resolutionText');
    const text=(input&&input.value||'').trim();
    if(!text){try{toast('Écrivez un message')}catch(e){} return;}
    const t=ticket(o,window.currentIssue||o.claimReason||'Revendication',true);
    o.claimOpen=true;o.claimReason=window.currentIssue||o.claimReason||'Revendication';
    t.messages.push({role:window.currentResolutionRole||'client',text:text,at:new Date().toISOString()});
    if(input)input.value='';
    window.renderResolutionChat();
    try{if(typeof renderCart==='function')renderCart()}catch(e){}
    try{if(typeof renderSellerOrders==='function')renderSellerOrders()}catch(e){}
  };
  const oldPhoto=window.handleResolutionPhoto;
  window.handleResolutionPhoto=function(input){
    const o=findOrder(window.currentResolutionOrderId);
    if(finished(o)){try{toast('Opération terminée : impossible d’ajouter une preuve.')}catch(e){} if(input)input.value=''; return;}
    if(typeof oldPhoto==='function')return oldPhoto.apply(this,arguments);
  };
  window.markResolutionPending=function(){
    const o=findOrder(window.currentResolutionOrderId); if(!o)return;
    if(finished(o)){try{toast('Opération terminée : chat en vue seule.')}catch(e){} return;}
    const t=ticket(o,window.currentIssue||'Revendication',true); o.claimOpen=true;o.claimStatus='support';
    t.messages.push({role:'support',text:'Support HAPPYAD alerté. Le paiement reste protégé.',at:new Date().toISOString()}); window.renderResolutionChat();
  };
  window.markResolutionSolved=function(){
    const o=findOrder(window.currentResolutionOrderId); if(!o)return;
    if(finished(o)){try{toast('Opération terminée : chat en vue seule.')}catch(e){} return;}
    const t=ticket(o,window.currentIssue||'Revendication',true); o.claimOpen=false;o.claimStatus='resolved';
    t.messages.push({role:'support',text:'Dossier marqué comme résolu.',at:new Date().toISOString()}); window.renderResolutionChat();
    try{if(typeof renderCart==='function')renderCart()}catch(e){}; try{if(typeof renderSellerOrders==='function')renderSellerOrders()}catch(e){};
  };
})();
