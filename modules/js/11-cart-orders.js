// Extracted from index.html. Keep load order.
/* V30 ROBUSTESSE : schéma métier verrouillé Boutique HAPPYAD */
window.HAPPYAD_BOUTIQUE_SCHEMA={
  cart:'draft_cart',
  payment:'confirmed_once',
  orderStates:['paid','proof_sent','completed'],
  rules:{
    cartDoesNotCreateOrder:true,
    onePaymentCreatesOneOrderBatch:true,
    proofOnce:true,
    clientConfirmationOnce:true,
    sellerPayoutOnce:true,
    lockedPriceAfterPayment:true
  }
};
let paymentBusy=false;
function orderIsActive(o){return !!o && o.status!=='completed' && o.status!=='released' && !o.clientReceived;}
function orderCanReceiveProof(o){return !!o && o.status==='paid' && !o.sellerDelivered && !o.proofVisible;}
function orderCanClientConfirm(o){return !!o && o.status==='proof_sent' && o.sellerDelivered && !o.clientReceived && !o.fundsReleased;}
function calcPlatformFee(totalK){return Math.max(1,Math.round((Number(totalK)||0)*0.05));}
function createLockedOrder(item,batchId){
  const totalK=priceNumber(item.product)*item.qty;
  const feeK=calcPlatformFee(totalK);
  return {
    id:'CMD-'+(1000+(boutiqueOrders||[]).length+1),
    paymentId:batchId,
    productId:item.product.id,
    product:item.product.name,
    seller:item.product.seller,
    buyer:'Client HAPPYAD',
    qty:item.qty,
    unitPriceText:item.product.price,
    lockedPriceK:priceNumber(item.product),
    totalK,
    platformFeeK:feeK,
    sellerAmountK:Math.max(0,totalK-feeK),
    status:'paid',
    method:selectedPayMethod,
    paidAt:new Date().toISOString(),
    sellerDelivered:false,
    proofSent:false,
    proofVisible:false,
    proof:'',
    proofPhotoName:'',
    proofPhotoUrl:'',
    clientReceived:false,
    receivedAt:null,
    fundsReleased:false,
    payoutAt:null
  };
}
function updateDeliveryCounters(){
  const active=(boutiqueOrders||[]).filter(orderIsActive);
  const total=active.reduce((s,o)=>s+(Number(o.qty)||1),0);
  const badge=document.getElementById('sellerDeliveryCount');
  if(badge){badge.textContent=total;badge.classList.toggle('show', total>0);}
  const screen=document.getElementById('sellerOrdersScreenCount');
  if(screen){screen.textContent= total>0 ? `${total} commande${total>1?'s':''} à traiter` : 'Aucune commande à traiter';}
}
function getActiveSellerOrders(){return (boutiqueOrders||[]).filter(orderIsActive);}
function getActiveOrderQty(productId){return getActiveSellerOrders().filter(o=>o.productId===productId).reduce((s,o)=>s+(Number(o.qty)||1),0);}
function getActiveOrderCount(){return getActiveSellerOrders().reduce((s,o)=>s+(Number(o.qty)||1),0);}
function payAndCreateOrder(){
  if(paymentBusy){toast('Paiement déjà en cours');return;}
  const items=(cart||[]).map(item=>({product:products.find(p=>p.id===item.id), qty:item.qty})).filter(x=>x.product&&x.qty>0);
  if(!items.length){toast('Votre panier est vide');return;}
  paymentBusy=true;
  const batchId='PAY-'+Date.now();
  const newOrders=items.map(item=>createLockedOrder(item,batchId));
  boutiqueOrders.push(...newOrders);
  cart=[];
  syncCartCount();
  closePaymentPopup();
  renderCart();
  renderSellerOrders();
  renderProfilePublications();
  updateDeliveryCounters();
  paymentBusy=false;
  toast('Paiement confirmé. Commande créée.');
}
function renderCart(){
  const cartItems=(cart||[]).map(item=>({product:products.find(p=>p.id===item.id), qty:item.qty})).filter(x=>x.product&&x.qty>0);
  const totalK=cartItems.reduce((sum,item)=>sum+(priceNumber(item.product)*item.qty),0);
  const totalText=formatBoutiqueAmount(totalK);
  const paidOrders=(boutiqueOrders||[]);
  const ordersHtml=paidOrders.length?`<div class="orderCard"><h3>Mes commandes</h3>${paidOrders.map(o=>{
    const status=o.clientReceived?'Reçue':(o.sellerDelivered?'À confirmer':'En préparation');
    const proof=o.proofVisible?`<div class="clientProof">${o.proofPhotoUrl?`<img src="${o.proofPhotoUrl}" alt="Preuve livraison">`:''}<b>Preuve de livraison</b><br>${o.proof||'Photo preuve ajoutée par le vendeur'}</div>`:'';
    const confirmBtn=orderCanClientConfirm(o)?`<div class="confirmReceiveBox"><div class="confirmWarn">Validez seulement après réception réelle.</div>${proof}<button class="btn" style="width:100%" onclick="confirmReceivedStep1('${o.id}')">J’ai reçu la commande</button></div>`:(proof||'');
    const claimBtns = !o.clientReceived ? `` : '';
    const claimBadge = o.claimOpen ? `<div class="claimOpenBadge">Revendication ouverte</div>` : '';
    return `<div class="cartLine"><span>${o.product} × ${o.qty}</span><b>${formatBoutiqueAmount(o.totalK)}</b></div><div class="deliveryStatus ${o.clientReceived?'done':''}">${status}</div>${confirmBtn}${claimBtns}${claimBadge}`;
  }).join('')}</div>`:'';
  document.getElementById('cartRows').innerHTML=cartItems.length?`<div class="orderStatus"><div class="statusIcon">${icon('shield','ico')}</div><div><b>Paiement sécurisé</b></div></div><div class="card">${cartItems.map(item=>{const p=item.product;return `<div class="row"><div class="mini">${icon('bag','ico')}</div><div class="rowInfo"><b>${p.name}</b><span><span class="cartSellerLine">${sellerProfile(p.seller).displayName} ${badgeSvg(p.seller)}</span><br>${p.price}</span><div class="small">Quantité : ${item.qty}</div></div><button class="circleBtn" onclick="event.stopPropagation();decreaseCart(${p.id})">−</button><b>${item.qty}</b><button class="circleBtn" onclick="event.stopPropagation();addCart(${p.id})">+</button><button class="circleBtn danger" onclick="event.stopPropagation();removeCart(${p.id})">${icon('trash','icoMini')}</button></div>`}).join('')}<div class="cartLine"><span>Sous-total</span><b>${totalText}</b></div><div class="cartLine"><span>Total</span><b class="total">${totalText}</b></div><br><br><button class="btn" style="width:100%" onclick="openPaymentPopup()">Continuer le paiement</button></div>${ordersHtml}`:`${ordersHtml||'<div class="card empty">Aucun article dans le panier.</div>'}`;
  hydrateIcons(document.getElementById('cartRows'));
}
function renderSellerOrders(){
  updateDeliveryCounters();
  const box=document.getElementById('sellerOrdersList'); if(!box) return;
  if(!(boutiqueOrders||[]).length){
    box.innerHTML=`<div class="sellerOrderCard"><div class="sellerOrderTop"><div class="statusIcon">${icon('shield','ico')}</div><div><b>Aucune livraison</b></div></div></div>`;
    hydrateIcons(box);return;
  }
  box.innerHTML=(boutiqueOrders||[]).map(o=>{
    const completed=o.status==='completed'||o.clientReceived;
    const waiting=o.status==='proof_sent'&&!completed;
    const statusText=completed?'Validé':(waiting?'En attente client':'À livrer');
    const btnText=completed?'Validé':(waiting?'Preuve envoyée':'Valider livraison');
    const disabled=(completed||waiting)?'disabled':'';
    const money=completed?`<div class="adminNotice"><span data-ico="shield"></span><span>Argent reçu : ${formatBoutiqueAmount(o.sellerAmountK||o.totalK)}.</span></div>`:(waiting?`<div class="adminNotice"><span data-ico="message"></span><span>Preuve envoyée au client.</span></div>`:'');
    return `<div class="sellerOrderCard"><div class="sellerOrderTop"><div class="mini">${icon('bag','ico')}</div><div style="flex:1"><b>${o.product}</b><span>${o.id} · ${formatBoutiqueAmount(o.totalK)}</span><div class="deliveryStatus ${completed?'done':''}">${statusText}</div></div></div><div class="deliveryProofBox ${o.sellerDelivered?'show':''}" id="proof-${o.id}"><textarea placeholder="Preuve de livraison" ${completed?'readonly':''}>${o.proof||''}</textarea><div class="proofPhotoActions"><label class="proofPick" for="proofFile-${o.id}">${icon('image','icoMini')} Photo</label><label class="proofPick" for="proofCam-${o.id}">${icon('camera','icoMini')} Caméra</label></div><input class="hiddenFile" id="proofFile-${o.id}" type="file" accept="image/*" onchange="handleProofPhoto('${o.id}',this)" ${completed||waiting?'disabled':''}><input class="hiddenFile" id="proofCam-${o.id}" type="file" accept="image/*" capture="environment" onchange="handleProofPhoto('${o.id}',this)" ${completed||waiting?'disabled':''}><div class="${o.proofPhotoUrl?'proofPreview show':'proofPreview'}" id="proofPreview-${o.id}">${o.proofPhotoUrl?`<img src="${o.proofPhotoUrl}" alt="Preuve livraison">`:''}<span>${o.proofPhotoName||'Aucune photo'}</span></div></div>${money}${o.claimOpen?`<div class="claimOpenBadge seller">Revendication client ouverte</div>`:''}<button class="btn ${completed?'dark':''}" style="width:100%" onclick="sellerValidateDelivery('${o.id}')" ${disabled}>${btnText}</button></div>`;
  }).join('');
  hydrateIcons(box);
}
function sellerValidateDelivery(id){
  const o=(boutiqueOrders||[]).find(x=>x.id===id); if(!o) return;
  if(o.status==='completed'||o.clientReceived){toast('Commande déjà validée');return;}
  if(o.status==='proof_sent'||o.sellerDelivered){toast('Preuve déjà envoyée');return;}
  const box=document.getElementById('proof-'+id);
  if(box && !box.classList.contains('show')){box.classList.add('show');toast('Ajoutez la preuve');return;}
  if(!o.proofPhotoUrl){toast('Photo preuve obligatoire');return;}
  o.proof=box?.querySelector('textarea')?.value?.trim()||'Livraison déclarée';
  o.proofVisible=true;o.proofSent=true;o.sellerDelivered=true;o.status='proof_sent';o.proofSentAt=new Date().toISOString();
  renderSellerOrders();renderCart();renderProfilePublications();updateDeliveryCounters();
  toast('Preuve envoyée au client');
}
function releaseSellerFunds(o){
  if(!o || o.fundsReleased) return false;
  o.fundsReleased=true;o.payoutAt=new Date().toISOString();o.status='completed';
  return true;
}
function confirmReceivedStep1(id){
  const o=(boutiqueOrders||[]).find(x=>x.id===id); if(!o) return;
  if(!orderCanClientConfirm(o)){toast(o.clientReceived?'Déjà confirmé':'Preuve vendeur requise');return;}
  const ok=confirm('Confirmez-vous avoir reçu cette commande ?'); if(!ok) return;
  const ok2=confirm('Confirmation finale : l’argent sera envoyé au vendeur. Continuer ?'); if(!ok2) return;
  o.clientReceived=true;o.receivedAt=new Date().toISOString();
  releaseSellerFunds(o);
  renderCart();renderSellerOrders();renderProfilePublications();updateDeliveryCounters();
  toast('Commande validée.');
}
try{renderCart();renderSellerOrders();renderProfilePublications();updateDeliveryCounters();hydrateIcons();}catch(e){console.warn(e)}
