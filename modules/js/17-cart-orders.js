// Extracted from index.html. Keep load order.
/* V44 : correction affichage livraisons vendeur - utiliser les vraies commandes locales */
(function(){
  function getOrdersList(){
    try{
      if(typeof boutiqueOrders !== 'undefined' && Array.isArray(boutiqueOrders)) return boutiqueOrders;
    }catch(e){}
    return Array.isArray(window.boutiqueOrders) ? window.boutiqueOrders : [];
  }
  function q(x){return String(x==null?'':x)}
  function orderDone(o){return !!(o && (o.clientReceived || o.status==='completed' || o.fundsReleased));}
  function orderCancel(o){return !!(o && o.cancelRequested && !orderDone(o) && !o.refunded);}
  function fmtDateTime(d){try{return new Date(d).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}catch(e){return ''}}
  function safeAmount(v){try{return formatBoutiqueAmount(v)}catch(e){return (v||0)+'K UGX'}}
  function clientName(o){return q(o.buyerName || o.buyer || window.happyadClientAccount?.name || 'Client HAPPYAD') || 'Client HAPPYAD'}
  function clientPhone(o){return q(o.deliveryPhone || o.phone || o.buyerPhone || '')}
  function clientBadge(){return '<span class="sellerBadge" style="display:inline-grid;place-items:center;width:20px;height:20px;border-radius:50%;background:linear-gradient(135deg,#ff7a00,#c55cff);border:1px solid rgba(255,255,255,.22)">'+(typeof icon==='function'?icon('shield','icoMini'):'✓')+'</span>'}
  function ensureBuyerFields(o){
    if(!o) return o;
    if(!o.buyerName) o.buyerName=clientName(o);
    if(!o.buyerProfileId) o.buyerProfileId=window.happyadClientAccount?.id || 'client-demo';
    return o;
  }
  function sellerMeta(o){
    ensureBuyerFields(o);
    const parts=[];
    if(o.deliveryZone) parts.push(`<span class="metaPill">${o.deliveryZone}</span>`);
    if(o.deliveryDelayHours) parts.push(`<span class="metaPill">${o.deliveryDelayHours}h</span>`);
    if(o.deliveryEtaAt) parts.push(`<span class="metaPill">Réception ${fmtDateTime(o.deliveryEtaAt)}</span>`);
    parts.push(`<span class="metaPill client">Client : ${clientName(o)}</span>`);
    if(clientPhone(o)) parts.push(`<span class="metaPill phone">Tel : ${clientPhone(o)}</span>`);
    return `<div class="sellerClientMeta">${parts.join('')}</div>`;
  }

  window.openClientProfile=function(orderId){
    const o=getOrdersList().find(x=>String(x.id)===String(orderId));
    if(!o){if(typeof toast==='function')toast('Commande introuvable');return;}
    ensureBuyerFields(o);
    const overlay=document.getElementById('paymentOverlay');
    const sheet=overlay?.querySelector('.paymentSheet');
    if(!overlay||!sheet){if(typeof toast==='function')toast('Profil client indisponible');return;}
    const name=clientName(o), phone=clientPhone(o)||'Non renseigné', initial=(name.trim()[0]||'C').toUpperCase();
    sheet.classList.add('clientProfileSheet');
    sheet.innerHTML=`
      <div class="sheetTop"><div><b>Profil client</b><span>Compte HAPPYAD</span></div><button class="circleBtn" onclick="closePaymentPopup()">×</button></div>
      <div class="clientHead"><div class="clientAvatar">${initial}</div><div><div class="clientName">${name} ${clientBadge()}</div><div class="clientSub">Client HAPPYAD</div></div></div>
      <div class="clientInfoList">
        <div class="clientInfoItem"><span>Commande</span><b>${o.id} · ${o.product}</b></div>
        <div class="clientInfoItem"><span>Zone</span><b>${o.deliveryZone||'Non renseignée'}${o.deliveryDelayHours?' · '+o.deliveryDelayHours+'h':''}</b></div>
        <div class="clientInfoItem"><span>Réception</span><b>${o.deliveryEtaAt?fmtDateTime(o.deliveryEtaAt):'À confirmer'}</b></div>
        <div class="clientInfoItem"><span>Téléphone</span><b>${phone}</b></div>
      </div>
      <div class="clientActionRow"></div>`;
    overlay.classList.add('show');
    try{hydrateIcons(sheet)}catch(e){}
  };

  const previousPayAndCreate=window.payAndCreateOrder;
  window.payAndCreateOrder=function(){
    if(typeof previousPayAndCreate==='function') previousPayAndCreate.apply(this,arguments);
    getOrdersList().forEach(ensureBuyerFields);
    try{window.renderSellerOrders();updateDeliveryCounters();}catch(e){}
  };

  window.renderSellerOrders=function(){
    const orders=getOrdersList();
    orders.forEach(ensureBuyerFields);
    try{if(typeof updateDeliveryCounters==='function') updateDeliveryCounters()}catch(e){}
    const box=document.getElementById('sellerOrdersList'); if(!box) return;
    if(!orders.length){
      box.innerHTML=`<div class="sellerOrderCard"><div class="sellerOrderTop"><div class="statusIcon">${typeof icon==='function'?icon('shield','ico'):''}</div><div><b>Aucune livraison</b></div></div></div>`;
      try{hydrateIcons(box)}catch(e){}
      return;
    }
    box.innerHTML=orders.map(o=>{
      const completed=orderDone(o), cancel=orderCancel(o), waiting=o.sellerDelivered&&!completed&&!cancel;
      const statusText=completed?'Validé':(cancel?'Annulé':(waiting?'En attente client':'À livrer'));
      const statusCls=completed?'done':(cancel?'cancel':'');
      const proofDisabled=(completed||waiting||cancel)?'disabled':'';
      const readonly=(completed||cancel)?'readonly':'';
      const money=completed?`<div class="adminNotice"><span data-ico="shield"></span><span>Argent reçu : ${safeAmount(o.sellerAmountK||o.totalK)}.</span></div>`:(waiting?`<div class="adminNotice"><span data-ico="message"></span><span>Preuve envoyée au client.</span></div>`:'');
      const cancelBox=cancel?`<div class="sellerCancelledBox">Annulation demandée</div>`:'';
      const buttons=completed?'':(cancel?'':`<div class="orderButtons"><button class="btn cancel" onclick="openClientProfile('${o.id}')">Ouvrir profil client</button></div><button class="btn ${waiting?'dark':''}" style="width:100%;margin-top:10px" onclick="sellerValidateDelivery('${o.id}')" ${waiting?'disabled':''}>${waiting?'Preuve envoyée':'Valider livraison'}</button>`);
      const claimBadge=(o.claimOpen&&!completed&&!cancel)?`<div class="claimOpenBadge seller">Revendication ouverte</div>`:'';
      return `<div class="sellerOrderCard"><div class="sellerOrderTop"><div class="mini">${typeof icon==='function'?icon('bag','ico'):''}</div><div style="flex:1"><b>${o.product}</b><span>${o.id} · ${safeAmount(o.totalK)}</span><div class="deliveryStatus ${statusCls}">${statusText}</div></div></div>${sellerMeta(o)}<div class="deliveryProofBox ${o.sellerDelivered?'show':''}" id="proof-${o.id}"><textarea placeholder="Preuve de livraison" ${readonly}>${o.proof||''}</textarea><div class="proofPhotoActions"><label class="proofPick" for="proofFile-${o.id}">${typeof icon==='function'?icon('image','icoMini'):''} Photo</label><label class="proofPick" for="proofCam-${o.id}">${typeof icon==='function'?icon('camera','icoMini'):''} Caméra</label></div><input class="hiddenFile" id="proofFile-${o.id}" type="file" accept="image/*" onchange="handleProofPhoto('${o.id}',this)" ${proofDisabled}><input class="hiddenFile" id="proofCam-${o.id}" type="file" accept="image/*" capture="environment" onchange="handleProofPhoto('${o.id}',this)" ${proofDisabled}><div class="${o.proofPhotoUrl?'proofPreview show':'proofPreview'}" id="proofPreview-${o.id}">${o.proofPhotoUrl?`<img src="${o.proofPhotoUrl}" alt="Preuve livraison">`:''}<span>${o.proofPhotoName||'Aucune photo'}</span></div></div>${money}${cancelBox}${claimBadge}${buttons}</div>`;
    }).join('');
    try{hydrateIcons(box)}catch(e){}
  };

  try{getOrdersList().forEach(ensureBuyerFields);window.renderSellerOrders()}catch(e){console.warn('v44 seller orders visible',e)}
})();
