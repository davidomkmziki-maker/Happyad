// Extracted from index.html. Keep load order.
/* V41 : sélection zone livraison + numéro avant paiement, délai verrouille annulation */
(function(){
  const V41_WALLET_BALANCE_K = 250; // prototype: permet de tester solde insuffisant avec gros total
  function nowISO(){return new Date().toISOString()}
  function addHours(date, h){return new Date(new Date(date).getTime() + (Number(h)||0)*60*60*1000)}
  function fmtTime(d){try{return new Date(d).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}catch(e){return ''}}
  function productById(id){return (products||[]).find(p=>String(p.id)===String(id))}
  function defaultZonesForProduct(p){
    const cat=(p&&p.cat)||'mode';
    if(cat==='support') return [{name:'Kampala centre',hours:2},{name:'Makindye',hours:4},{name:'À domicile sur rendez-vous',hours:24}];
    if(cat==='cuisine') return [{name:'Kampala centre',hours:3},{name:'Ntinda',hours:5},{name:'Entebbe',hours:24}];
    return [{name:'Kampala centre',hours:2},{name:'Makindye / Kansanga',hours:4},{name:'Entebbe / Wakiso',hours:24}];
  }
  function normalizeZones(zones, p){
    if(Array.isArray(zones) && zones.length) return zones.map(z=>({name:String(z.name||z.zone||'Zone').trim(),hours:Math.max(1,Number(z.hours||z.delay||z.time||2))})).filter(z=>z.name);
    if(typeof zones==='string' && zones.trim()) return parseZones(zones);
    return defaultZonesForProduct(p);
  }
  function parseZones(txt){
    const raw=String(txt||'').split(/;|\n/).map(x=>x.trim()).filter(Boolean);
    return raw.map(x=>{
      const parts=x.split('|').map(v=>v.trim());
      const name=parts[0]||'Zone';
      const h=parts[1] ? parseFloat(parts[1].replace(/[^0-9.,]/g,'').replace(',','.')) : 2;
      return {name, hours:Math.max(1, Number(h)||2)};
    });
  }
  function zonesToText(zones){return normalizeZones(zones).map(z=>`${z.name} | ${z.hours}h`).join('\n')}
  function ensureDeliveryZones(){
    (products||[]).forEach(p=>{ p.deliveryZones=normalizeZones(p.deliveryZones,p); });
  }
  ensureDeliveryZones();
  window.ensureDeliveryZones=ensureDeliveryZones;
  window.parseDeliveryZones=parseZones;

  function cartItems(){
    return (cart||[]).map(item=>({product:productById(item.id), qty:item.qty})).filter(x=>x.product&&x.qty>0);
  }
  function zoneOptions(p, idx){
    const zones=normalizeZones(p.deliveryZones,p);
    return `<select class="deliveryZoneSelect" data-product-id="${p.id}" data-index="${idx}" onchange="updatePaymentEta()">${zones.map((z,i)=>`<option value="${i}">${z.name} · ${z.hours}h</option>`).join('')}</select>`;
  }
  function selectedZoneForProduct(p, idx){
    const sel=document.querySelector(`.deliveryZoneSelect[data-product-id="${p.id}"][data-index="${idx}"]`);
    const zones=normalizeZones(p.deliveryZones,p);
    return zones[Number(sel?.value)||0] || zones[0];
  }
  window.updatePaymentEta=function(){
    const items=cartItems();
    const etaBox=document.getElementById('paymentEtaBox');
    if(!etaBox) return;
    if(!items.length){etaBox.innerHTML='';return;}
    let maxH=0, labels=[];
    items.forEach((item,idx)=>{const z=selectedZoneForProduct(item.product,idx); maxH=Math.max(maxH, Number(z.hours)||0); labels.push(`${item.product.name}: ${z.name}`);});
    const target=addHours(new Date(), maxH||1);
    etaBox.innerHTML=`<span>Arrivée</span><b>${maxH||1}h · ${fmtTime(target)}</b>`;
  };

  window.openPaymentPopup=function(){
    ensureDeliveryZones();
    const items=cartItems();
    if(!items.length){toast('Votre panier est vide');return;}
    const overlay=document.getElementById('paymentOverlay');
    const sheet=overlay?.querySelector('.paymentSheet');
    if(!overlay||!sheet){toast('Paiement indisponible');return;}
    sheet.innerHTML=`
      <div class="sheetTop"><div><b>Commander</b><span>Finaliser</span></div><button class="circleBtn" onclick="closePaymentPopup()">×</button></div>
      <div class="paySectionTitle">Livraison</div>
      ${items.map((item,idx)=>`<div class="deliveryPayBlock"><b>${item.product.name} × ${item.qty}</b><label>Zone</label>${zoneOptions(item.product,idx)}</div>`).join('')}
      <div id="paymentEtaBox" class="deliveryEta"></div>
      <div class="deliveryPayBlock"><b>Contact</b><label>Téléphone</label><input id="deliveryPhone" inputmode="tel" autocomplete="tel" placeholder="Ex : +256 7xx xxx xxx"></div>
      <div class="paySectionTitle">Paiement</div>
      <div class="payOption active" data-pay="mobile" onclick="selectPayMethod(this,'Mobile Money')"><span data-ico="cart"></span><div><b>Mobile Money</b><small>MTN / Airtel / réseau disponible</small></div></div>
      <div class="payOption" data-pay="card" onclick="selectPayMethod(this,'Carte bancaire')"><span data-ico="shield"></span><div><b>Carte bancaire</b><small>Visa / Mastercard</small></div></div>
      <div class="payOption" data-pay="wallet" onclick="selectPayMethod(this,'Solde HAPPYAD')"><span data-ico="stats"></span><div><b>Solde HAPPYAD</b><small>Solde prototype : ${formatBoutiqueAmount(V41_WALLET_BALANCE_K)}</small></div></div>
      <button class="btn" style="width:100%;margin-top:12px" onclick="payAndCreateOrder()"><span data-ico="shield" class="icoMini"></span> Commander</button>`;
    selectedPayMethod='Mobile Money';
    overlay.classList.add('show');
    hydrateIcons(sheet);
    updatePaymentEta();
  };

  function validatePaymentForm(){
    const phone=(document.getElementById('deliveryPhone')?.value||'').trim();
    if(phone.replace(/[^0-9]/g,'').length<7){toast('Téléphone obligatoire');return null;}
    const items=cartItems();
    if(!items.length){toast('Votre panier est vide');return null;}
    const delivery=[];
    let maxHours=0;
    items.forEach((item,idx)=>{const z=selectedZoneForProduct(item.product,idx); maxHours=Math.max(maxHours,Number(z.hours)||1); delivery.push({productId:item.product.id,zone:z.name,hours:Number(z.hours)||1});});
    const totalK=items.reduce((sum,item)=>sum+(priceNumber(item.product)*item.qty),0);
    if(selectedPayMethod==='Solde HAPPYAD' && totalK>V41_WALLET_BALANCE_K){toast('Solde insuffisant. Commande non créée.');return null;}
    return {phone,items,delivery,maxHours,totalK};
  }

  window.payAndCreateOrder=function(){
    if(paymentBusy){toast('Paiement déjà en cours');return;}
    const form=validatePaymentForm();
    if(!form) return;
    paymentBusy=true;
    const batchId='PAY-'+Date.now();
    const paidAt=nowISO();
    const newOrders=form.items.map((item,idx)=>{
      const z=form.delivery[idx];
      const totalK=priceNumber(item.product)*item.qty;
      const feeK=typeof calcPlatformFee==='function'?calcPlatformFee(totalK):Math.max(1,Math.round(totalK*0.05));
      const eta=addHours(paidAt,z.hours);
      return {
        id:'CMD-'+(1000+(boutiqueOrders||[]).length+idx+1),
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
        paidAt,
        deliveryZone:z.zone,
        deliveryDelayHours:z.hours,
        deliveryEtaAt:eta.toISOString(),
        deliveryPhone:form.phone,
        cancelLockedUntil:eta.toISOString(),
        cancelLocked:true,
        sellerDelivered:false,
        proofSent:false,
        proofVisible:false,
        proof:'',proofPhotoName:'',proofPhotoUrl:'',clientReceived:false,receivedAt:null,fundsReleased:false,payoutAt:null
      };
    });
    boutiqueOrders.push(...newOrders);
    cart=[];
    try{syncCartCount()}catch(e){}
    closePaymentPopup();
    renderCart();renderSellerOrders();renderProfilePublications();try{updateDeliveryCounters()}catch(e){}
    paymentBusy=false;
    toast('Paiement confirmé. Commande créée.');
  };

  function isDone(o){return !!(o && (o.clientReceived || o.status==='completed' || o.fundsReleased));}
  function isCancel(o){return !!(o && o.cancelRequested && !isDone(o) && !o.refunded);}
  function deliveryTimeReached(o){return !o?.deliveryEtaAt || Date.now()>=new Date(o.deliveryEtaAt).getTime();}
  function deliveryMeta(o){
    if(!o.deliveryZone) return '';
    return `<div class="orderMiniInfo"><b>${o.deliveryZone}</b> · ${o.deliveryDelayHours||''}h<br><span>Réception prévue : ${fmtTime(o.deliveryEtaAt)}</span><br><span class="phoneSaved">Contact enregistré</span></div>`;
  }
  window.requestCancelOrder=function(id){
    const o=(boutiqueOrders||[]).find(x=>String(x.id)===String(id));
    if(!o){toast('Commande introuvable');return;}
    if(!deliveryTimeReached(o) && !o.sellerDelivered){toast('Annulation bloquée jusqu’au délai de livraison');return;}
    if(o.sellerDelivered){toast('Ancien centre de résolution supprimé');toast('Livraison déjà déclarée');return;}
    if(o.cancelRequested){toast('Ancien centre de résolution supprimé');return;}
    o.cancelRequested=true;o.status='cancel_pending';o.cancelRequestedAt=nowISO();o.refundHold=true;o.claimOpen=true;o.claimStatus='cancel_pending';
    if(typeof addThread==='function'){addThread(o,'client','Annulation demandée.');addThread(o,'support','Remboursement en attente de vérification.');}
    renderCart();renderSellerOrders();try{updateDeliveryCounters()}catch(e){};toast('Annulation demandée.');
  };


  window.openOrderProduct=function(orderId){
    const o=(boutiqueOrders||[]).find(x=>String(x.id)===String(orderId));
    if(!o){toast('Commande introuvable');return;}
    const p=products.find(x=>String(x.id)===String(o.productId)) || products.find(x=>String(x.name)===String(o.product));
    if(!p){toast('Produit introuvable');return;}
    openDetail(p.id);
  };

  window.renderCart=function(){
    const items=cartItems();
    const totalK=items.reduce((sum,item)=>sum+(priceNumber(item.product)*item.qty),0);
    const totalText=formatBoutiqueAmount(totalK);
    const paidOrders=(boutiqueOrders||[]);
    const ordersHtml=paidOrders.length?`<div class="orderCard"><h3>Mes commandes</h3>${paidOrders.map(o=>{
      const done=isDone(o), cancel=isCancel(o), reached=deliveryTimeReached(o);
      const status=done?'Validée':(cancel?'En attente d’annulation':(o.sellerDelivered?'À confirmer':'En préparation'));
      const proof=o.proofVisible&&!cancel?`<div class="clientProof">${o.proofPhotoUrl?`<img src="${o.proofPhotoUrl}" alt="Preuve livraison">`:''}<b>Preuve de livraison</b><br>${o.proof||'Livraison déclarée'}</div>`:'';
      const confirmBtn=(!cancel && typeof orderCanClientConfirm==='function' && orderCanClientConfirm(o))?`<div class="confirmReceiveBox"><div class="confirmWarn">Validez seulement après réception réelle.</div>${proof}<button class="btn" style="width:100%" onclick="confirmReceivedStep1('${o.id}')">J’ai reçu la commande</button></div>`:(proof||'');
      const cancelBlock=cancel?`<div class="cancelPendingBox">Annulation en attente</div>`:'';
      let actions='';
      if(!done && !cancel){
        if(!o.sellerDelivered && !reached){ actions=`<div class="lockedDelivery">Annulation indisponible jusqu’à ${fmtTime(o.deliveryEtaAt)}</div>`; }
        else { actions=``; }
      }
      const claimBadge=(o.claimOpen&&!done&&!cancel)?`<div class="claimOpenBadge">Revendication ouverte</div>`:'';
      const rating=(typeof ratingBox==='function')?ratingBox(o):'';
      return `<div class="cartLine"><span>${o.product} × ${o.qty}</span><b>${formatBoutiqueAmount(o.totalK)}</b></div><div class="orderProductActionRow"><div class="deliveryStatus ${done?'done':(cancel?'cancel':'')}">${status}</div><button class="orderViewProductBtn" onclick="event.stopPropagation();openOrderProduct('${o.id}')">${icon('eye','icoMini')} Voir produit</button></div>${deliveryMeta(o)}${confirmBtn}${cancelBlock}${actions}${claimBadge}${rating}`;
    }).join('')}</div>`:'';
    document.getElementById('cartRows').innerHTML=items.length?`<div class="orderStatus"><div class="statusIcon">${icon('shield','ico')}</div><div><b>Paiement sécurisé</b></div></div><div class="card">${items.map(item=>{const p=item.product;return `<div class="row"><div class="mini">${icon('bag','ico')}</div><div class="rowInfo"><b>${p.name}</b><span><span class="cartSellerLine">${sellerProfile(p.seller).displayName} ${badgeSvg(p.seller)}</span><br>${p.price}</span><div class="small">Quantité : ${item.qty}</div></div><button class="circleBtn" onclick="event.stopPropagation();decreaseCart(${p.id})">−</button><b>${item.qty}</b><button class="circleBtn" onclick="event.stopPropagation();addCart(${p.id})">+</button><button class="circleBtn danger" onclick="event.stopPropagation();removeCart(${p.id})">${icon('trash','icoMini')}</button></div>`}).join('')}<div class="cartLine"><span>Sous-total</span><b>${totalText}</b></div><div class="cartLine"><span>Total</span><b class="total">${totalText}</b></div><br><br><button class="btn" style="width:100%" onclick="openPaymentPopup()">Continuer le paiement</button></div>${ordersHtml}`:`${ordersHtml||'<div class="card empty">Aucun article dans le panier.</div>'}`;
    try{hydrateIcons(document.getElementById('cartRows'));updatePublicPreviewRating()}catch(e){}
  };

  const oldOpenProductEditor=window.openProductEditor;
  window.openProductEditor=function(id){
    oldOpenProductEditor&&oldOpenProductEditor(id);
    ensureDeliveryZones();
    const sheet=document.querySelector('#productEditOverlay .productEditSheet');
    if(sheet && !document.getElementById('prodEditZones')){
      const btn=sheet.querySelector('button.btn');
      const wrap=document.createElement('div');
      wrap.innerHTML=`<div class="deliveryZonesHelp"><b>Zones de livraison</b><br>Une zone par ligne : <b>Nom zone | heures</b></div><textarea id="prodEditZones" placeholder="Kampala centre | 2h\nMakindye | 4h\nEntebbe | 24h"></textarea>`;
      btn.parentNode.insertBefore(wrap, btn);
    }
    const p=productById(id); const z=document.getElementById('prodEditZones'); if(z&&p) z.value=zonesToText(p.deliveryZones);
  };
  const oldSaveProductEdit=window.saveProductEdit;
  window.saveProductEdit=function(){
    const p=productById(editingProductId);
    if(p){const ztxt=document.getElementById('prodEditZones')?.value||''; p.deliveryZones=parseZones(ztxt);}
    oldSaveProductEdit&&oldSaveProductEdit();
    ensureDeliveryZones();
  };

  const oldRenderSellerOrders=window.renderSellerOrders;
  window.renderSellerOrders=function(){
    if(typeof oldRenderSellerOrders==='function') oldRenderSellerOrders();
    const box=document.getElementById('sellerOrdersList'); if(!box) return;
    (boutiqueOrders||[]).forEach(o=>{
      if(!o.deliveryZone) return;
      const cards=[...box.querySelectorAll('.sellerOrderCard')];
      const card=cards.find(c=>c.textContent.includes(o.id));
      if(card && !card.querySelector('.sellerDeliveryMeta')){
        const top=card.querySelector('.sellerOrderTop');
        if(top){top.insertAdjacentHTML('afterend',`<div class="sellerDeliveryMeta"><span>${o.deliveryZone}</span><span>${o.deliveryDelayHours||''}h</span><span>Réception ${fmtTime(o.deliveryEtaAt)}</span></div>`);}
      }
    });
  };

  try{renderCart();renderSellerOrders();hydrateIcons(document)}catch(e){console.warn('v41 delivery payment',e)}
})();
