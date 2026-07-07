// Extracted from index.html. Keep load order.
(function(){
  function ordersList(){try{return Array.isArray(boutiqueOrders)?boutiqueOrders:[]}catch(e){return Array.isArray(window.boutiqueOrders)?window.boutiqueOrders:[]}}
  function productList(){try{return Array.isArray(products)?products:[]}catch(e){return []}}
  function cartList(){try{return Array.isArray(cart)?cart:[]}catch(e){return []}}
  function money(v){try{return formatBoutiqueAmount(v)}catch(e){return (v||0)+'K UGX'}}
  function ico(name,cls){try{return icon(name,cls||'icoMini')}catch(e){return ''}}
  function h(s){return String(s==null?'':s).replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]))}
  function fmt(d){try{return new Date(d).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}catch(e){return ''}}
  function isDone(o){return !!(o&&(o.clientReceived||o.status==='completed'||o.status==='released'||o.fundsReleased||o.payoutAt))}
  function isCancel(o){return !!(o&&o.cancelRequested&&!isDone(o)&&!o.refunded)}
  function reached(o){return !o?.deliveryEtaAt || Date.now()>=new Date(o.deliveryEtaAt).getTime()}
  function pById(id){return productList().find(p=>String(p.id)===String(id))}
  function priceK(p){try{return priceNumber(p)}catch(e){return Number((String(p?.price||'').match(/\d+/)||[0])[0])||0}}
  function sellerName(p){try{return (sellerProfile(p.seller)||{}).displayName||p.seller||'Vendeur'}catch(e){return p?.seller||'Vendeur'}}
  function orderProductButton(o){return `<button class="orderViewProductBtn" onclick="event.stopPropagation();openOrderProduct('${h(o.id)}')">${ico('eye')} Voir produit</button>`}
  function deliveryMeta(o){if(!o.deliveryZone)return '';return `<div class="orderMiniInfo"><b>${h(o.deliveryZone)}</b>${o.deliveryDelayHours?` · ${h(o.deliveryDelayHours)}h`:''}<br><span>Réception prévue : ${fmt(o.deliveryEtaAt)}</span><br><span class="phoneSaved">Contact enregistré</span></div>`}
  function proofBlock(o){if(!o.proofVisible&&!o.proofPhotoUrl&&!o.proof)return '';return `<div class="compactProof">${o.proofPhotoUrl?`<img src="${o.proofPhotoUrl}" alt="Preuve livraison">`:ico('image')}<div><b>Preuve de livraison</b><br>${h(o.proof||o.proofPhotoName||'Livraison déclarée')}</div></div>`}
  function completedBuyerOrder(o){const id='buyerDone-'+h(o.id);const rating=(typeof ratingBox==='function')?ratingBox(o):'';return `<div class="orderSlim" onclick="toggleOrderDetails('${id}')"><div><b>${h(o.product)} × ${h(o.qty)}</b><span>${money(o.totalK)} · Validée</span></div><div class="sellerOrderSlimRight"><span class="orderSlimStatus">Validée</span><button class="orderSlimBtn" onclick="event.stopPropagation();toggleOrderDetails('${id}')">Voir ∨</button></div></div><div class="orderSlimDetails" id="${id}">${orderProductButton(o)}${deliveryMeta(o)}${proofBlock(o)}<div class="cartLine"><span>Paiement vendeur</span><b>Envoyé</b></div>${rating}</div>`}
  function activeBuyerOrder(o){const cancel=isCancel(o);const canReceive=o.sellerDelivered&&!isDone(o)&&!cancel;const canClaim=!isDone(o)&&!cancel;const status=cancel?'En attente d’annulation':(o.sellerDelivered?'À confirmer':'En préparation');const proof=canReceive?proofBlock(o):'';let actions='';if(canClaim){if(!o.sellerDelivered&&!reached(o)){actions=`<div class="lockedDelivery">Annulation indisponible jusqu’à ${fmt(o.deliveryEtaAt)}</div>`}else{actions=``}}const receive=canReceive?`<div class="confirmReceiveBox"><div class="confirmWarn">Validez seulement après réception réelle.</div>${proof}<button class="btn" style="width:100%" onclick="confirmReceivedStep1('${h(o.id)}')">J’ai reçu la commande</button></div>`:'';const cancelBlock=cancel?`<div class="cancelPendingBox">Annulation en attente</div>`:'';const claimBadge=(o.claimOpen&&!cancel)?`<div class="claimOpenBadge">Revendication ouverte</div>`:'';return `<div class="cartLine"><span>${h(o.product)} × ${h(o.qty)}</span><b>${money(o.totalK)}</b></div><div class="orderProductActionRow"><div class="deliveryStatus ${cancel?'cancel':''}">${status}</div>${orderProductButton(o)}</div>${deliveryMeta(o)}${receive}${cancelBlock}${actions}${claimBadge}`}
  function cartProductItem(item){const p=item.product;return `<div class="cartProductCard"><div class="cartProductMedia">${ico('bag','ico')}</div><div class="cartProductInfo"><div class="cartProductTitle">${h(p.name)}</div><div class="cartProductSeller">${h(sellerName(p))} ${typeof badgeSvg==='function'?badgeSvg(p.seller):''}</div><div class="cartProductPrice">${h(p.price)}</div><div class="cartActionUnderPrice"><button class="circleBtn" onclick="event.stopPropagation();decreaseCart(${p.id})">−</button><b>${h(item.qty)}</b><button class="circleBtn" onclick="event.stopPropagation();addCart(${p.id})">+</button><button class="circleBtn danger" onclick="event.stopPropagation();removeCart(${p.id})">${ico('trash')}</button></div></div></div>`}
  window.renderCart=function(){
    const items=cartList().map(item=>({product:pById(item.id),qty:item.qty})).filter(x=>x.product&&x.qty>0);
    const totalK=items.reduce((s,i)=>s+priceK(i.product)*i.qty,0);
    const orders=ordersList();
    const ordersHtml=orders.length?`<div class="orderCard"><h3>Mes commandes</h3>${orders.map(o=>isDone(o)?completedBuyerOrder(o):activeBuyerOrder(o)).join('')}</div>`:'';
    const cartHtml=items.length?`<div class="orderStatus"><div class="statusIcon">${ico('shield','ico')}</div><div><b>Paiement sécurisé</b></div></div><div class="card">${items.map(cartProductItem).join('')}<div class="cartLine"><span>Sous-total</span><b>${money(totalK)}</b></div><div class="cartLine"><span>Total</span><b class="total">${money(totalK)}</b></div><br><br><button class="btn" style="width:100%" onclick="openPaymentPopup()">Continuer le paiement</button></div>`:'';
    const target=document.getElementById('cartRows');
    if(target) target.innerHTML=cartHtml+ordersHtml || '<div class="card empty">Aucun article dans le panier.</div>';
    try{hydrateIcons(target); if(typeof updatePublicPreviewRating==='function') updatePublicPreviewRating()}catch(e){}
  };
  try{window.renderCart()}catch(e){console.warn('v47 cart layout',e)}
})();
