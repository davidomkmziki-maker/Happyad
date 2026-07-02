// Extracted from index.html. Keep load order.
(function(){
  function allOrders(){ try{return Array.isArray(boutiqueOrders)?boutiqueOrders:[]}catch(e){return[]} }
  function isDone(o){return !!(o && (o.clientReceived || o.status==='completed' || o.fundsReleased));}
  function isCancel(o){return !!(o && o.cancelRequested && !isDone(o) && !o.refunded);}
  function safeHydrate(el){try{hydrateIcons(el||document)}catch(e){}}

  window.requestCancelOrder = function(id){
    const o=allOrders().find(x=>String(x.id)===String(id));
    if(!o){toast('Commande introuvable');return;}
    if(o.sellerDelivered){openResolutionChat(o.id,'client','Annulation');toast('Livraison déjà déclarée');return;}
    if(o.cancelRequested){openResolutionChat(o.id,'client','Annulation');return;}
    o.cancelRequested=true;
    o.status='cancel_pending';
    o.cancelRequestedAt=new Date().toISOString();
    o.refundHold=true;
    o.claimOpen=true;
    o.claimStatus='cancel_pending';
    if(typeof addThread==='function'){
      addThread(o,'client','Annulation demandée.');
      addThread(o,'support','Remboursement en attente. Le vendeur peut répondre dans le dossier.');
    }
    renderCart();renderSellerOrders();try{updateDeliveryCounters()}catch(e){}
    toast('Annulation demandée.');
  };

  window.renderCart = function(){
    const cartItems=(cart||[]).map(item=>({product:products.find(p=>p.id===item.id), qty:item.qty})).filter(x=>x.product&&x.qty>0);
    const totalK=cartItems.reduce((sum,item)=>sum+(priceNumber(item.product)*item.qty),0);
    const totalText=formatBoutiqueAmount(totalK);
    const paidOrders=allOrders();
    const ordersHtml=paidOrders.length?`<div class="orderCard"><h3>Mes commandes</h3>${paidOrders.map(o=>{
      const done=isDone(o);
      const cancel=isCancel(o);
      const status=done?'Validée':(cancel?'En attente d’annulation':(o.sellerDelivered?'À confirmer':'En préparation'));
      const proof=o.proofVisible&&!cancel?`<div class="clientProof">${o.proofPhotoUrl?`<img src="${o.proofPhotoUrl}" alt="Preuve livraison">`:''}<b>Preuve de livraison</b><br>${o.proof||'Livraison déclarée'}</div>`:'';
      const confirmBtn=(!cancel && typeof orderCanClientConfirm==='function' && orderCanClientConfirm(o))?`<div class="confirmReceiveBox"><div class="confirmWarn">Validez seulement après réception réelle.</div>${proof}<button class="btn" style="width:100%" onclick="confirmReceivedStep1('${o.id}')">J’ai reçu la commande</button></div>`:(proof||'');
      const cancelBlock=cancel?`<div class="cancelPendingBox">Annulation en attente</div><div class="orderButtons oneBtn"><button class="btn cancel" onclick="openResolutionChat('${o.id}','client','Annulation')">Ouvrir dossier</button></div>`:'';
      const actions=(!done&&!cancel)?`<div class="claimVisibleRow forceClaimRow"><button class="claimMainBtn" onclick="${o.sellerDelivered?`openResolutionChat('${o.id}','client','Je n’ai pas reçu')`:`requestCancelOrder('${o.id}')`}">${o.sellerDelivered?'Je n’ai pas reçu':'Annuler'}</button><button class="claimSecondBtn" onclick="openResolutionChat('${o.id}','client','Revendication')">Revendication</button></div>`:'';
      const claimBadge=(o.claimOpen&&!done&&!cancel)?`<div class="claimOpenBadge">Revendication ouverte</div>`:'';
      const rating=(typeof ratingBox==='function')?ratingBox(o):'';
      return `<div class="cartLine"><span>${o.product} × ${o.qty}</span><b>${formatBoutiqueAmount(o.totalK)}</b></div><div class="deliveryStatus ${done?'done':(cancel?'cancel':'')}">${status}</div>${confirmBtn}${cancelBlock}${actions}${claimBadge}${rating}`;
    }).join('')}</div>`:'';
    document.getElementById('cartRows').innerHTML=cartItems.length?`<div class="orderStatus"><div class="statusIcon">${icon('shield','ico')}</div><div><b>Paiement sécurisé</b></div></div><div class="card">${cartItems.map(item=>{const p=item.product;return `<div class="row"><div class="mini">${icon('bag','ico')}</div><div class="rowInfo"><b>${p.name}</b><span><span class="cartSellerLine">${sellerProfile(p.seller).displayName} ${badgeSvg(p.seller)}</span><br>${p.price}</span><div class="small">Quantité : ${item.qty}</div></div><button class="circleBtn" onclick="event.stopPropagation();decreaseCart(${p.id})">−</button><b>${item.qty}</b><button class="circleBtn" onclick="event.stopPropagation();addCart(${p.id})">+</button><button class="circleBtn danger" onclick="event.stopPropagation();removeCart(${p.id})">${icon('trash','icoMini')}</button></div>`}).join('')}<div class="cartLine"><span>Sous-total</span><b>${totalText}</b></div><div class="cartLine"><span>Total</span><b class="total">${totalText}</b></div><br><button class="btn" style="width:100%" onclick="show('messages')">${icon('message','icoMini')} Message vendeur</button><br><br><button class="btn" style="width:100%" onclick="openPaymentPopup()">Continuer le paiement</button></div>${ordersHtml}`:`${ordersHtml||'<div class="card empty">Aucun article dans le panier.</div>'}`;
    safeHydrate(document.getElementById('cartRows'));try{updatePublicPreviewRating()}catch(e){}
  };

  window.renderSellerOrders = function(){
    try{updateDeliveryCounters()}catch(e){}
    const box=document.getElementById('sellerOrdersList'); if(!box) return;
    const list=allOrders();
    if(!list.length){box.innerHTML=`<div class="sellerOrderCard"><div class="sellerOrderTop"><div class="statusIcon">${icon('shield','ico')}</div><div><b>Aucune livraison</b></div></div></div>`;safeHydrate(box);return;}
    box.innerHTML=list.map(o=>{
      const completed=isDone(o);
      const cancel=isCancel(o);
      const waiting=o.sellerDelivered&&!completed&&!cancel;
      const statusText=completed?'Validé':(cancel?'Annulé':(waiting?'En attente client':'À livrer'));
      const statusCls=completed?'done':(cancel?'cancel':'');
      const proofDisabled=(completed||waiting||cancel)?'disabled':'';
      const readonly=(completed||cancel)?'readonly':'';
      const money=completed?`<div class="adminNotice"><span data-ico="shield"></span><span>Argent reçu : ${formatBoutiqueAmount(o.sellerAmountK||o.totalK)}.</span></div>`:(waiting?`<div class="adminNotice"><span data-ico="message"></span><span>Notification envoyée au client.</span></div>`:'');
      const cancelBox=cancel?`<div class="sellerCancelledBox">Annulation demandée par le client</div><div class="orderButtons oneBtn"><button class="btn problem" onclick="openResolutionChat('${o.id}','seller','Annulation')">Ouvrir dossier</button></div>`:'';
      const normalActions=(!completed&&!cancel)?`<div class="orderButtons"><button class="btn cancel" onclick="openResolutionChat('${o.id}','seller','Difficulté livraison')">Difficulté</button><button class="btn problem" onclick="openResolutionChat('${o.id}','seller','Ouvrir dossier')">Ouvrir dossier</button></div><button class="btn ${waiting?'dark':''}" style="width:100%;margin-top:10px" onclick="sellerValidateDelivery('${o.id}')" ${waiting?'disabled':''}>${waiting?'Preuve envoyée':'Valider livraison'}</button>`:'';
      const claimBadge=(o.claimOpen&&!completed&&!cancel)?`<div class="claimOpenBadge seller">Revendication ouverte</div>`:'';
      return `<div class="sellerOrderCard"><div class="sellerOrderTop"><div class="mini">${icon('bag','ico')}</div><div style="flex:1"><b>${o.product}</b><span>${o.id} · ${formatBoutiqueAmount(o.totalK)}</span><div class="deliveryStatus ${statusCls}">${statusText}</div></div></div><div class="deliveryProofBox ${o.sellerDelivered?'show':''}" id="proof-${o.id}"><textarea placeholder="Preuve de livraison" ${readonly}>${o.proof||''}</textarea><div class="proofPhotoActions"><label class="proofPick" for="proofFile-${o.id}">${icon('image','icoMini')} Photo</label><label class="proofPick" for="proofCam-${o.id}">${icon('camera','icoMini')} Caméra</label></div><input class="hiddenFile" id="proofFile-${o.id}" type="file" accept="image/*" onchange="handleProofPhoto('${o.id}',this)" ${proofDisabled}><input class="hiddenFile" id="proofCam-${o.id}" type="file" accept="image/*" capture="environment" onchange="handleProofPhoto('${o.id}',this)" ${proofDisabled}><div class="${o.proofPhotoUrl?'proofPreview show':'proofPreview'}" id="proofPreview-${o.id}">${o.proofPhotoUrl?`<img src="${o.proofPhotoUrl}" alt="Preuve livraison">`:''}<span>${o.proofPhotoName||'Aucune photo'}</span></div></div>${money}${cancelBox}${claimBadge}${normalActions}</div>`;
    }).join(''); safeHydrate(box);
  };
  try{renderCart();renderSellerOrders()}catch(e){console.warn('v39 cancel state',e)}
})();
