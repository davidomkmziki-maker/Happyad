// Extracted from index.html. Keep load order.
/* HAPPYAD Boutique v37 - règles robustes annulation/remboursement/paiement */
(function(){
  const WALLET_BALANCE_K = 50; // prototype : solde HAPPYAD insuffisant si total > 50K

  function orders(){ return (typeof boutiqueOrders!=='undefined' ? boutiqueOrders : []); }
  function nowMs(){ return Date.now(); }
  function ensureOrderMeta(o){
    if(!o) return o;
    if(!o.createdAt) o.createdAt = new Date().toISOString();
    if(!o.status) o.status = o.clientReceived ? 'completed' : (o.sellerDelivered ? 'proof_sent' : 'paid');
    return o;
  }
  function orderById(id){ return orders().find(o=>String(o.id)===String(id)); }
  function minSinceCreated(o){
    ensureOrderMeta(o);
    return (nowMs() - new Date(o.createdAt).getTime()) / 60000;
  }
  function canCancel(o){
    ensureOrderMeta(o);
    return !o.sellerDelivered && !o.clientReceived && !o.fundsReleased && !o.refunded && o.status !== 'completed';
  }
  function isWithinCancelWindow(o){ return minSinceCreated(o) <= 30; }
  function addThread(o, role, text){
    try{
      if(typeof ensureResolutionThread==='function'){
        ensureResolutionThread(o).push({role,text});
      }
    }catch(e){}
  }
  function statusLabel(o){
    ensureOrderMeta(o);
    if(o.refunded) return 'Remboursée';
    if(o.cancelRequested && o.refundBlocked) return 'Vérification';
    if(o.cancelRequested) return 'Annulation en attente';
    if(o.clientReceived || o.status==='completed') return 'Terminée';
    if(o.claimOpen || o.dispute) return 'Revendication ouverte';
    if(o.sellerDelivered) return 'À confirmer';
    if(o.status==='paid') return 'Payée';
    return 'En cours';
  }
  function paymentFailure(msg){
    const n=document.getElementById('payError');
    if(n){ n.textContent=msg; n.classList.add('show'); }
    if(typeof toast==='function') toast(msg);
  }
  window.payAndCreateOrder = function(){
    const items=(cart||[]).map(item=>({product:products.find(p=>p.id===item.id), qty:item.qty})).filter(x=>x.product&&x.qty>0);
    if(!items.length){toast('Votre panier est vide');return;}
    const totalK=items.reduce((s,it)=>s+(priceNumber(it.product)*it.qty),0);
    if(selectedPayMethod==='Solde HAPPYAD' && totalK > WALLET_BALANCE_K){
      paymentFailure('Solde insuffisant. La commande n’est pas créée.');
      return;
    }
    const paymentRef='PAY-'+Date.now();
    items.forEach(item=>{
      const already=orders().find(o=>o.paymentRef===paymentRef && o.productId===item.product.id);
      if(already) return;
      orders().push({
        id:'CMD-'+(1000+orders().length+1),
        paymentRef,
        productId:item.product.id,
        product:item.product.name,
        buyer:'Client HAPPYAD',
        qty:item.qty,
        totalK:priceNumber(item.product)*item.qty,
        sellerAmountK:Math.round(priceNumber(item.product)*item.qty*0.95),
        status:'paid',
        createdAt:new Date().toISOString(),
        sellerDelivered:false,
        clientReceived:false,
        fundsReleased:false,
        refunded:false,
        cancelRequested:false,
        proof:'',
        proofPhotoName:'',
        proofPhotoUrl:'',
        proofVisible:false,
        method:selectedPayMethod
      });
    });
    cart=[];
    syncCartCount();
    closePaymentPopup();
    renderCart();
    renderSellerOrders();
    renderProfilePublications();
    updateDeliveryCounters();
    toast('Paiement confirmé. Commande créée.');
  };

  const oldOpenPaymentPopup = window.openPaymentPopup;
  window.openPaymentPopup = function(){
    if(typeof oldOpenPaymentPopup==='function') oldOpenPaymentPopup();
    setTimeout(()=>{
      const sheet=document.querySelector('.paymentSheet');
      if(sheet && !document.getElementById('payError')){
        const d=document.createElement('div');
        d.id='payError'; d.className='failNotice';
        d.textContent='';
        const btn=sheet.querySelector('button.btn:last-child');
        sheet.insertBefore(d, btn);
      }
    },0);
  };

  window.requestCancelOrder = function(id){
    const o=orderById(id);
    if(!o){toast('Commande introuvable');return;}
    ensureOrderMeta(o);
    if(!canCancel(o)){
      toast('Ancien centre de résolution supprimé');
      toast('Annulation automatique impossible');
      return;
    }
    if(!isWithinCancelWindow(o)){
      toast('Ancien centre de résolution supprimé');
      toast('Annulation automatique fermée après 30 min');
      return;
    }
    o.cancelRequested=true;
    o.status='cancel_pending';
    o.refundHold=true;
    o.cancelRequestedAt=new Date().toISOString();
    o.refundDueAt=new Date(nowMs()+2*60*60*1000).toISOString();
    addThread(o,'client','Annulation demandée. Remboursement en attente 2h.');
    addThread(o,'support','Le vendeur peut bloquer le remboursement s’il prouve que la livraison est déjà partie.');
    renderCart(); renderSellerOrders(); updateDeliveryCounters();
    toast('Annulation demandée. Remboursement en attente.');
  };

  window.sellerAlreadyShipped = function(id){
    const o=orderById(id);
    if(!o){toast('Commande introuvable');return;}
    ensureOrderMeta(o);
    o.refundBlocked=true;
    o.status='support_review';
    o.claimOpen=true;
    addThread(o,'seller','Le vendeur signale que la livraison était déjà partie.');
    addThread(o,'support','Remboursement bloqué. Dossier en vérification.');
    renderSellerOrders(); renderCart();
    toast('Ancien centre de résolution supprimé');
  };

  window.renderCart = function(){
    const cartItems=(cart||[]).map(item=>({product:products.find(p=>p.id===item.id), qty:item.qty})).filter(x=>x.product&&x.qty>0);
    const totalK=cartItems.reduce((sum,item)=>sum+(priceNumber(item.product)*item.qty),0);
    const totalText=formatBoutiqueAmount(totalK);
    const paidOrders=(orders()||[]).map(ensureOrderMeta);
    const ordersHtml=paidOrders.length?`<div class="orderCard"><h3>Mes commandes</h3>${paidOrders.map(o=>{
      const completed=o.clientReceived||o.status==='completed';
      const canClaim=!completed && !o.refunded;
      const canReceive=o.sellerDelivered && !completed && !o.cancelRequested;
      const cancelBlock=(canCancel(o) && !o.cancelRequested) ? `<button class="btn cancel" onclick="requestCancelOrder('${o.id}')">Annuler commande</button>` : '';
      const cancelInfo=o.cancelRequested&&!o.refunded?`<div class="refundHoldBox">${o.refundBlocked?'Remboursement bloqué · vérification en cours':'Annulation demandée · remboursement en attente 2h'}</div>`:'';
      const proof=o.sellerDelivered&&!completed?`<div class="confirmReceiveBox"><div class="confirmWarn">Validez seulement après réception réelle.</div>${o.proofVisible?`<div class="clientProof">${o.proofPhotoUrl?`<img src="${o.proofPhotoUrl}" alt="Preuve livraison">`:''}<b>Preuve de livraison</b><br>${o.proof||'Livraison déclarée'}</div>`:''}<button class="btn" style="width:100%" onclick="confirmReceivedStep1('${o.id}')">J’ai reçu la commande</button></div>`:'';
      const claim=canClaim?``:'';
      const rating=completed?(typeof ratingBox==='function'?ratingBox(o):'<div class="deliveryStatus done">Terminée</div>'):'';
      return `<div class="cartLine"><span>${o.product} × ${o.qty}</span><b>${formatBoutiqueAmount(o.totalK)}</b></div><div class="deliveryStatus ${completed?'done':''}">${statusLabel(o)}</div>${cancelInfo}${proof}${rating}<div class="orderButtons ${cancelBlock?'':'one'}">${cancelBlock}</div>${claim}`;
    }).join('')}</div>`:'';
    document.getElementById('cartRows').innerHTML=cartItems.length?`<div class="orderStatus"><div class="statusIcon">${icon('shield','ico')}</div><div><b>Commande sécurisée</b></div></div><div class="card">${cartItems.map(item=>{const p=item.product;return `<div class="row"><div class="mini">${icon('bag','ico')}</div><div class="rowInfo"><b>${p.name}</b><span><span class="cartSellerLine">${sellerProfile(p.seller).displayName} ${badgeSvg(p.seller)}</span><br>${p.price}</span><div class="small">Quantité : ${item.qty}</div></div><button class="circleBtn" onclick="event.stopPropagation();decreaseCart(${p.id})">−</button><b>${item.qty}</b><button class="circleBtn" onclick="event.stopPropagation();addCart(${p.id})">+</button><button class="circleBtn danger" onclick="event.stopPropagation();removeCart(${p.id})">${icon('trash','icoMini')}</button></div>`}).join('')}<div class="cartLine"><span>Sous-total</span><b>${totalText}</b></div><div class="cartLine"><span>Total</span><b class="total">${totalText}</b></div><br><br><button class="btn" style="width:100%" onclick="openPaymentPopup()">Continuer le paiement</button></div>${ordersHtml}`:`${ordersHtml||'<div class="card empty">Aucun article dans le panier.</div>'}`;
    hydrateIcons(document.getElementById('cartRows')); updatePublicPreviewRating();
  };

  window.renderSellerOrders = function(){
    updateDeliveryCounters();
    const box=document.getElementById('sellerOrdersList'); if(!box) return;
    const list=(orders()||[]).map(ensureOrderMeta);
    if(!list.length){box.innerHTML=`<div class="sellerOrderCard"><div class="sellerOrderTop"><div class="statusIcon">${icon('shield','ico')}</div><div><b>Aucune livraison</b></div></div></div>`;hydrateIcons(box);return;}
    box.innerHTML=list.map(o=>{
      const completed=o.status==='completed'||o.clientReceived||o.fundsReleased;
      const waiting=o.sellerDelivered&&!completed&&!o.cancelRequested;
      const cancelPending=o.cancelRequested&&!completed;
      const statusText=completed?'Validé':(cancelPending?'Annulation':'À livrer');
      const disabled=(completed||waiting||cancelPending)?'disabled':'';
      const money=completed?`<div class="adminNotice"><span data-ico="shield"></span><span>Argent reçu : ${formatBoutiqueAmount(o.sellerAmountK||o.totalK)}.</span></div>`:(waiting?`<div class="adminNotice"><span data-ico="message"></span><span>Preuve envoyée au client.</span></div>`:'');
      const cancelBox=cancelPending?`<div class="refundHoldBox">${o.refundBlocked?'Remboursement bloqué · vérification':'Annulation client · remboursement en attente 2h'}</div><div class="orderButtons"><button class="btn problem" onclick="sellerAlreadyShipped('${o.id}')">Déjà expédié</button></div>`:'';
      const claimButtons=completed?'':``;
      return `<div class="sellerOrderCard"><div class="sellerOrderTop"><div class="mini">${icon('bag','ico')}</div><div style="flex:1"><b>${o.product}</b><span>${o.id} · ${formatBoutiqueAmount(o.totalK)}</span><div class="deliveryStatus ${completed?'done':''}">${statusText}</div></div></div><div class="deliveryProofBox ${o.sellerDelivered?'show':''}" id="proof-${o.id}"><textarea placeholder="Preuve de livraison" ${completed||cancelPending?'readonly':''}>${o.proof||''}</textarea><div class="proofPhotoActions"><label class="proofPick" for="proofFile-${o.id}">${icon('image','icoMini')} Photo</label><label class="proofPick" for="proofCam-${o.id}">${icon('camera','icoMini')} Caméra</label></div><input class="hiddenFile" id="proofFile-${o.id}" type="file" accept="image/*" onchange="handleProofPhoto('${o.id}',this)" ${completed||waiting||cancelPending?'disabled':''}><input class="hiddenFile" id="proofCam-${o.id}" type="file" accept="image/*" capture="environment" onchange="handleProofPhoto('${o.id}',this)" ${completed||waiting||cancelPending?'disabled':''}><div class="${o.proofPhotoUrl?'proofPreview show':'proofPreview'}" id="proofPreview-${o.id}">${o.proofPhotoUrl?`<img src="${o.proofPhotoUrl}" alt="Preuve livraison">`:''}<span>${o.proofPhotoName||'Aucune photo'}</span></div></div>${money}${cancelBox}${o.claimOpen&&!completed?`<div class="claimOpenBadge seller">Revendication ouverte</div>`:''}${claimButtons}<button class="btn ${completed?'dark':''}" style="width:100%;margin-top:10px" onclick="sellerValidateDelivery('${o.id}')" ${disabled}>${completed?'Validé':(waiting?'Preuve envoyée':'Valider livraison')}</button></div>`;
    }).join(''); hydrateIcons(box);
  };

  try{renderCart();renderSellerOrders();}catch(e){console.warn('v37 robustesse', e)}
})();
