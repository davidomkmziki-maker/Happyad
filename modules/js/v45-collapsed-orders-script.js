// Extracted from index.html. Keep load order.
(function(){
  function ordersList(){try{return Array.isArray(boutiqueOrders)?boutiqueOrders:[]}catch(e){return Array.isArray(window.boutiqueOrders)?window.boutiqueOrders:[]}}
  function productList(){try{return Array.isArray(products)?products:[]}catch(e){return []}}
  function cartList(){try{return Array.isArray(cart)?cart:[]}catch(e){return []}}
  function money(v){try{return formatBoutiqueAmount(v)}catch(e){return (v||0)+'K UGX'}}
  function ico(name,cls){try{return icon(name,cls||'icoMini')}catch(e){return ''}}
  function h(s){return String(s==null?'':s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]))}
  function fmt(d){try{return new Date(d).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}catch(e){return ''}}
  function isDone(o){return !!(o&&(o.clientReceived||o.status==='completed'||o.status==='released'||o.fundsReleased||o.payoutAt))}
  function isCancel(o){return !!(o&&o.cancelRequested&&!isDone(o)&&!o.refunded)}
  function reached(o){return !o?.deliveryEtaAt || Date.now()>=new Date(o.deliveryEtaAt).getTime()}
  function buyerName(o){return h(o.buyerName||o.buyer||window.happyadClientAccount?.name||'Client HAPPYAD')}
  function phone(o){return h(o.deliveryPhone||o.phone||o.buyerPhone||'')}
  function pById(id){return productList().find(p=>String(p.id)===String(id))}
  function orderProductButton(o){return `<button class="orderViewProductBtn" onclick="event.stopPropagation();openOrderProduct('${h(o.id)}')">${ico('eye')} Voir produit</button>`}
  function deliveryMeta(o){
    if(!o.deliveryZone) return '';
    return `<div class="orderMiniInfo"><b>${h(o.deliveryZone)}</b>${o.deliveryDelayHours?` · ${h(o.deliveryDelayHours)}h`:''}<br><span>Réception prévue : ${fmt(o.deliveryEtaAt)}</span><br><span class="phoneSaved">Contact enregistré</span></div>`;
  }
  function sellerMeta(o){
    const parts=[];
    if(o.deliveryZone) parts.push(`<span class="metaPill">${h(o.deliveryZone)}</span>`);
    if(o.deliveryDelayHours) parts.push(`<span class="metaPill">${h(o.deliveryDelayHours)}h</span>`);
    if(o.deliveryEtaAt) parts.push(`<span class="metaPill">Réception ${fmt(o.deliveryEtaAt)}</span>`);
    parts.push(`<span class="metaPill client">Client : ${buyerName(o)}</span>`);
    if(phone(o)) parts.push(`<span class="metaPill phone">Tel : ${phone(o)}</span>`);
    return `<div class="sellerClientMeta">${parts.join('')}</div>`;
  }
  function proofBlock(o){
    if(!o.proofVisible && !o.proofPhotoUrl && !o.proof) return '';
    return `<div class="compactProof">${o.proofPhotoUrl?`<img src="${o.proofPhotoUrl}" alt="Preuve livraison">`:ico('image')}<div><b>Preuve de livraison</b><br>${h(o.proof||o.proofPhotoName||'Livraison déclarée')}</div></div>`;
  }
  window.toggleOrderDetails=function(id){
    const el=document.getElementById(id);
    if(!el) return;
    el.classList.toggle('open');
  };
  function completedBuyerOrder(o){
    const id='buyerDone-'+h(o.id);
    const rating=(typeof ratingBox==='function')?ratingBox(o):'';
    return `<div class="orderSlim" onclick="toggleOrderDetails('${id}')"><div><b>${h(o.product)} × ${h(o.qty)}</b><span>${money(o.totalK)} · Validée</span></div><div class="sellerOrderSlimRight"><span class="orderSlimStatus">Validée</span><button class="orderSlimBtn" onclick="event.stopPropagation();toggleOrderDetails('${id}')">Voir ∨</button></div></div><div class="orderSlimDetails" id="${id}">${orderProductButton(o)}${deliveryMeta(o)}${proofBlock(o)}<div class="cartLine"><span>Paiement vendeur</span><b>Envoyé</b></div>${rating}</div>`;
  }
  function activeBuyerOrder(o){
    const cancel=isCancel(o); const canReceive=o.sellerDelivered&&!isDone(o)&&!cancel; const canClaim=!isDone(o)&&!cancel;
    const status=cancel?'En attente d’annulation':(o.sellerDelivered?'À confirmer':'En préparation');
    const proof=canReceive?proofBlock(o):'';
    let actions='';
    if(canClaim){
      if(!o.sellerDelivered && !reached(o)) actions=`<div class="lockedDelivery">Annulation indisponible jusqu’à ${fmt(o.deliveryEtaAt)}</div><button class="btn dark" style="width:100%" onclick="show('messages')">Message vendeur</button>`;
      else actions=`<div class="claimVisibleRow forceClaimRow"><button class="claimMainBtn" onclick="${o.sellerDelivered?`openResolutionChat('${h(o.id)}','client','Je n’ai pas reçu')`:`requestCancelOrder('${h(o.id)}')`}">${o.sellerDelivered?'Je n’ai pas reçu':'Annuler'}</button><button class="claimSecondBtn" onclick="openResolutionChat('${h(o.id)}','client','Revendication')">Revendication</button></div>`;
    }
    const receive=canReceive?`<div class="confirmReceiveBox"><div class="confirmWarn">Validez seulement après réception réelle.</div>${proof}<button class="btn" style="width:100%" onclick="confirmReceivedStep1('${h(o.id)}')">J’ai reçu la commande</button></div>`:'';
    const cancelBlock=cancel?`<div class="cancelPendingBox">Annulation en attente</div><div class="orderButtons oneBtn"><button class="btn cancel" onclick="openResolutionChat('${h(o.id)}','client','Annulation')">Ouvrir dossier</button></div>`:'';
    const claimBadge=(o.claimOpen&&!cancel)?`<div class="claimOpenBadge">Revendication ouverte</div>`:'';
    return `<div class="cartLine"><span>${h(o.product)} × ${h(o.qty)}</span><b>${money(o.totalK)}</b></div><div class="orderProductActionRow"><div class="deliveryStatus ${cancel?'cancel':''}">${status}</div>${orderProductButton(o)}</div>${deliveryMeta(o)}${receive}${cancelBlock}${actions}${claimBadge}`;
  }
  window.renderCart=function(){
    const items=cartList().map(item=>({product:pById(item.id),qty:item.qty})).filter(x=>x.product&&x.qty>0);
    const totalK=items.reduce((s,i)=>s+(Number((String(i.product.price||'').match(/\d+/)||[0])[0])||0)*i.qty,0);
    const orders=ordersList();
    const ordersHtml=orders.length?`<div class="orderCard"><h3>Mes commandes</h3>${orders.map(o=>isDone(o)?completedBuyerOrder(o):activeBuyerOrder(o)).join('')}</div>`:'';
    const cartHtml=items.length?`<div class="orderStatus"><div class="statusIcon">${ico('shield','ico')}</div><div><b>Paiement sécurisé</b></div></div><div class="card">${items.map(item=>{const p=item.product;return `<div class="row"><div class="mini">${ico('bag','ico')}</div><div class="rowInfo"><b>${h(p.name)}</b><span>${h((sellerProfile(p.seller)||{}).displayName||p.seller||'Vendeur')} ${typeof badgeSvg==='function'?badgeSvg(p.seller):''}<br>${h(p.price)}</span><div class="small">Quantité : ${h(item.qty)}</div></div><button class="circleBtn" onclick="event.stopPropagation();decreaseCart(${p.id})">−</button><b>${h(item.qty)}</b><button class="circleBtn" onclick="event.stopPropagation();addCart(${p.id})">+</button><button class="circleBtn danger" onclick="event.stopPropagation();removeCart(${p.id})">${ico('trash')}</button></div>`}).join('')}<div class="cartLine"><span>Sous-total</span><b>${money(totalK)}</b></div><div class="cartLine"><span>Total</span><b class="total">${money(totalK)}</b></div><br><button class="btn" style="width:100%" onclick="show('messages')">${ico('message')} Message vendeur</button><br><br><button class="btn" style="width:100%" onclick="openPaymentPopup()">Continuer le paiement</button></div>`:'';
    const target=document.getElementById('cartRows');
    if(target) target.innerHTML=cartHtml+ordersHtml || '<div class="card empty">Aucun article dans le panier.</div>';
    try{hydrateIcons(target); if(typeof updatePublicPreviewRating==='function') updatePublicPreviewRating()}catch(e){}
  };
  function completedSellerOrder(o){
    const id='sellerDone-'+h(o.id);
    return `<div class="sellerOrderSlim" onclick="toggleOrderDetails('${id}')"><div class="miniIcon">${ico('shield')}</div><div class="sellerOrderSlimMain"><b>${h(o.product)}</b><span>${h(o.id)} · ${money(o.totalK)} · Validé</span></div><div class="sellerOrderSlimRight"><span class="orderSlimStatus">Validé</span><button class="orderSlimBtn" onclick="event.stopPropagation();toggleOrderDetails('${id}')">Voir ∨</button></div></div><div class="orderSlimDetails" id="${id}">${sellerMeta(o)}${proofBlock(o)}<div class="cartLine"><span>Client</span><b>${buyerName(o)}</b></div>${phone(o)?`<div class="cartLine"><span>Téléphone</span><b>${phone(o)}</b></div>`:''}<div class="cartLine"><span>Argent reçu</span><b>${money(o.sellerAmountK||o.totalK)}</b></div></div>`;
  }
  function activeSellerOrder(o){
    const cancel=isCancel(o), waiting=o.sellerDelivered&&!isDone(o)&&!cancel;
    const statusText=cancel?'Annulé':(waiting?'En attente client':'À livrer');
    const statusCls=cancel?'cancel':'';
    const proofDisabled=(waiting||cancel)?'disabled':'';
    const readonly=cancel?'readonly':'';
    const cancelBox=cancel?`<div class="sellerCancelledBox">Annulation demandée</div><div class="orderButtons oneBtn"><button class="btn problem" onclick="openResolutionChat('${h(o.id)}','seller','Annulation')">Ouvrir dossier</button></div>`:'';
    const buttons=cancel?'':`<div class="orderButtons"><button class="btn cancel" onclick="openClientProfile('${h(o.id)}')">Ouvrir profil client</button><button class="btn problem" onclick="openResolutionChat('${h(o.id)}','seller','Ouvrir dossier')">Ouvrir dossier</button></div><button class="btn ${waiting?'dark':''}" style="width:100%;margin-top:10px" onclick="sellerValidateDelivery('${h(o.id)}')" ${waiting?'disabled':''}>${waiting?'Preuve envoyée':'Valider livraison'}</button>`;
    const info=waiting?`<div class="adminNotice"><span data-ico="message"></span><span>Notification envoyée au client.</span></div>`:'';
    const claimBadge=(o.claimOpen&&!cancel)?`<div class="claimOpenBadge seller">Revendication ouverte</div>`:'';
    return `<div class="sellerOrderCard"><div class="sellerOrderTop"><div class="mini">${ico('bag','ico')}</div><div style="flex:1"><b>${h(o.product)}</b><span>${h(o.id)} · ${money(o.totalK)}</span><div class="deliveryStatus ${statusCls}">${statusText}</div></div></div>${sellerMeta(o)}<div class="deliveryProofBox ${o.sellerDelivered?'show':''}" id="proof-${h(o.id)}"><textarea placeholder="Preuve de livraison" ${readonly}>${h(o.proof||'')}</textarea><div class="proofPhotoActions"><label class="proofPick" for="proofFile-${h(o.id)}">${ico('image')} Photo</label><label class="proofPick" for="proofCam-${h(o.id)}">${ico('camera')} Caméra</label></div><input class="hiddenFile" id="proofFile-${h(o.id)}" type="file" accept="image/*" onchange="handleProofPhoto('${h(o.id)}',this)" ${proofDisabled}><input class="hiddenFile" id="proofCam-${h(o.id)}" type="file" accept="image/*" capture="environment" onchange="handleProofPhoto('${h(o.id)}',this)" ${proofDisabled}><div class="${o.proofPhotoUrl?'proofPreview show':'proofPreview'}" id="proofPreview-${h(o.id)}">${o.proofPhotoUrl?`<img src="${o.proofPhotoUrl}" alt="Preuve livraison">`:''}<span>${h(o.proofPhotoName||'Aucune photo')}</span></div></div>${info}${cancelBox}${claimBadge}${buttons}</div>`;
  }
  window.renderSellerOrders=function(){
    const list=ordersList();
    try{if(typeof updateDeliveryCounters==='function') updateDeliveryCounters()}catch(e){}
    const box=document.getElementById('sellerOrdersList'); if(!box) return;
    if(!list.length){box.innerHTML=`<div class="sellerOrderCard"><div class="sellerOrderTop"><div class="statusIcon">${ico('shield','ico')}</div><div><b>Aucune livraison</b></div></div></div>`;try{hydrateIcons(box)}catch(e){};return;}
    const active=list.filter(o=>!isDone(o));
    const done=list.filter(isDone);
    const activeHtml=active.length?active.map(activeSellerOrder).join(''):`<div class="sellerOrderCard"><div class="sellerOrderTop"><div class="statusIcon">${ico('shield','ico')}</div><div><b>Aucune commande à traiter</b></div></div></div>`;
    const doneHtml=done.length?`<div class="sellerOrderHistory"><div class="orderHistoryTitle">Historique</div>${done.map(completedSellerOrder).join('')}</div>`:'';
    box.innerHTML=activeHtml+doneHtml;
    const screen=document.getElementById('sellerOrdersScreenCount'); if(screen) screen.textContent=active.length?`${active.length} commande${active.length>1?'s':''} à traiter`:'Aucune commande à traiter';
    try{hydrateIcons(box)}catch(e){}
  };
  try{window.renderCart();window.renderSellerOrders()}catch(e){console.warn('v45 compact done',e)}
})();
