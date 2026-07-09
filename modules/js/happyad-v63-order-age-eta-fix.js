// Extracted from index.html. Keep load order.
(function(){
  if(window.__happyadV63OrderAgeEtaFix)return;
  window.__happyadV63OrderAgeEtaFix=true;

  function orders(){try{return (typeof boutiqueOrders!=='undefined'&&Array.isArray(boutiqueOrders))?boutiqueOrders:(Array.isArray(window.boutiqueOrders)?window.boutiqueOrders:[])}catch(e){return []}}
  function cartList(){try{return (typeof cart!=='undefined'&&Array.isArray(cart))?cart:[]}catch(e){return []}}
  function productsList(){try{return (typeof products!=='undefined'&&Array.isArray(products))?products:[]}catch(e){return []}}
  function productById(id){return productsList().find(function(p){return String(p.id)===String(id)})}
  function esc(v){return String(v==null?'':v).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function js(v){return String(v==null?'':v).replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,' ')}
  function iconSafe(name,cls){try{return icon(name,cls||'icoMini')}catch(e){return ''}}
  function hydrateSafe(el){try{hydrateIcons(el||document)}catch(e){}}
  function toastSafe(t){try{toast(t)}catch(e){}}
  function moneyOrder(o){try{if(typeof window.orderTotalText==='function')return window.orderTotalText(o)}catch(e){} try{if(o.totalText)return o.totalText}catch(e){} try{if(o.currency&&o.totalAmount!=null&&typeof window.formatBoutiqueMoney==='function')return window.formatBoutiqueMoney(o.totalAmount,o.currency)}catch(e){} try{return formatBoutiqueAmount(o.totalK||0)}catch(e){return (o.totalK||0)+' UGX'}}
  function moneyProduct(p){try{if(typeof window.productPriceText==='function')return window.productPriceText(p)}catch(e){} return p&&p.price?p.price:''}
  function parseProductPrice(p){try{if(window.HAPPYAD_CURRENCY_TOOLS&&typeof window.HAPPYAD_CURRENCY_TOOLS.parsePrice==='function')return window.HAPPYAD_CURRENCY_TOOLS.parsePrice(p)}catch(e){} try{const n=typeof priceNumber==='function'?priceNumber(p):0;return {amount:n*1000,currency:'UGX'}}catch(e){return {amount:0,currency:'UGX'}}}
  function formatMoney(amount,currency){try{if(typeof window.formatBoutiqueMoney==='function')return window.formatBoutiqueMoney(amount,currency)}catch(e){} try{return formatBoutiqueAmount(currency==='UGX'?amount/1000:amount,currency)}catch(e){return String(amount||0)+' '+(currency||'UGX')}}
  function done(o){return !!(o&&(o.clientReceived||o.status==='completed'||o.status==='released'||o.fundsReleased||o.payoutAt))}
  function cancelled(o){return !!(o&&o.cancelRequested&&!done(o)&&!o.refunded)}
  function addHours(d,h){return new Date(new Date(d).getTime()+(Number(h)||0)*3600000)}
  function fmtClock(d){try{return new Date(d).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}catch(e){return 'À confirmer'}}
  function fmtArrival(d){try{const dt=new Date(d), now=new Date(); const same=dt.toDateString()===now.toDateString(); const tomorrow=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1).toDateString()===dt.toDateString(); const time=dt.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}); if(same)return "Aujourd’hui "+time; if(tomorrow)return "Demain "+time; return dt.toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});}catch(e){return 'À confirmer'}}
  function ageText(date){
    const t=new Date(date).getTime(); if(!t)return 'maintenant';
    const diff=Math.max(0,Date.now()-t), min=Math.floor(diff/60000), h=Math.floor(min/60), d=Math.floor(h/24);
    if(min<1)return 'à l’instant';
    if(min<60)return 'il y a '+min+' min';
    if(h<24)return 'il y a '+h+'h';
    if(d===1)return 'hier';
    if(d<7)return 'il y a '+d+' jours';
    return fmtClock(date);
  }
  function normalizeZoneForOrder(o){
    if(!o)return o;
    if(!o.paidAt)o.paidAt=o.createdAt||o.orderAt||new Date().toISOString();
    const p=productById(o.productId);
    if(!o.deliveryZone){
      try{
        const zones=Array.isArray(p&&p.deliveryZones)?p.deliveryZones:[];
        if(zones.length){o.deliveryZone=zones[0].name||zones[0].zone||'Zone vendeur';o.deliveryDelayHours=Number(zones[0].hours||zones[0].delay||2)||2;}
      }catch(e){}
    }
    if(!o.deliveryZone)o.deliveryZone='Zone livraison';
    if(!o.deliveryDelayHours)o.deliveryDelayHours=2;
    if(!o.deliveryEtaAt)o.deliveryEtaAt=addHours(o.paidAt,o.deliveryDelayHours).toISOString();
    if(!o.orderAgeBaseAt)o.orderAgeBaseAt=o.paidAt;
    return o;
  }
  function normalizeAllOrders(){orders().forEach(normalizeZoneForOrder)}
  function orderTimeMeta(o){
    normalizeZoneForOrder(o);
    const late=!done(o)&&!cancelled(o)&&o.deliveryEtaAt&&Date.now()>new Date(o.deliveryEtaAt).getTime()&&!o.sellerDelivered;
    const cls=done(o)?'done':(late?'late':'');
    const arrived=done(o)&&o.receivedAt?`<div class="line"><span>Reçue</span><b>${esc(fmtArrival(o.receivedAt))}</b></div>`:'';
    return `<div class="orderTimeMeta ${cls}"><div class="line"><span>Âge commande</span><b>${esc(ageText(o.paidAt))}</b></div><div class="line"><span>Arrivée prévue</span><b>${esc(fmtArrival(o.deliveryEtaAt))}</b></div>${arrived}<div class="zone">${esc(o.deliveryZone)} · ${esc(o.deliveryDelayHours)}h</div></div>`;
  }
  function orderProductButton(o){return `<button class="orderViewProductBtn" onclick="event.stopPropagation();openOrderProduct('${js(o.id)}')">${iconSafe('eye')} Voir produit</button>`}
  function proofBlock(o){
    if(!o.proofVisible&&!o.proofPhotoUrl&&!o.proof)return '';
    return `<div class="compactProof">${o.proofPhotoUrl?`<img src="${esc(o.proofPhotoUrl)}" alt="Preuve livraison">`:iconSafe('image')}<div><b>Preuve de livraison</b><br>${esc(o.proof||o.proofPhotoName||'Livraison déclarée')}</div></div>`;
  }
  function buyerOrderHtml(o){
    normalizeZoneForOrder(o);
    const completed=done(o), cancel=cancelled(o), canReceive=!!(o.sellerDelivered&&!completed&&!cancel);
    const status=completed?'Validée':(cancel?'Annulation en attente':(o.sellerDelivered?'À confirmer':'En préparation'));
    const receive=canReceive?`<div class="confirmReceiveBox"><div class="confirmWarn">Validez seulement après réception réelle.</div>${proofBlock(o)}<button class="btn" style="width:100%" onclick="confirmReceivedStep1('${js(o.id)}')">J’ai reçu la commande</button></div>`:'';
    const cancelBlock=cancel?`<div class="cancelPendingBox">Annulation en attente</div>`:'';
    const actions=!completed&&!cancel?`<div class="claimVisibleRow forceClaimRow"><button class="claimMainBtn" onclick="${o.sellerDelivered?`openResolutionChat('${js(o.id)}','client','Je n’ai pas reçu')`:`requestCancelOrder('${js(o.id)}')`}">${o.sellerDelivered?'Je n’ai pas reçu':'Annuler'}</button><button class="claimSecondBtn" onclick="openResolutionChat('${js(o.id)}','client','Revendication')">Revendication</button></div>`:'';
    const rating=completed?(typeof ratingBox==='function'?ratingBox(o):'<div class="deliveryStatus done">Terminée</div>'):'';
    const claim=o.claimOpen&&!completed&&!cancel?'<div class="claimOpenBadge">Revendication ouverte</div>':'';
    return `<div class="cartLine"><span>${esc(o.product)} × ${esc(o.qty||1)}</span><b>${esc(moneyOrder(o))}</b></div><div class="orderProductActionRow"><div class="deliveryStatus ${completed?'done':(cancel?'cancel':'')}">${status}</div>${orderProductButton(o)}</div>${orderTimeMeta(o)}${receive}${cancelBlock}${actions}${claim}${rating}`;
  }
  function cartItemHtml(item){
    const p=productById(item.id); if(!p)return '';
    const seller=(function(){try{return (sellerProfile(p.seller)||{}).displayName||p.seller||'Vendeur'}catch(e){return p.seller||'Vendeur'}})();
    return `<div class="cartProductCard"><div class="cartProductMedia">${iconSafe('bag','ico')}</div><div class="cartProductInfo"><div class="cartProductTitle">${esc(p.name)}</div><div class="cartProductSeller">${esc(seller)} ${typeof badgeSvg==='function'?badgeSvg(p.seller):''}</div><div class="cartProductPrice">${esc(moneyProduct(p))}</div><div class="cartActionUnderPrice"><button class="circleBtn" onclick="event.stopPropagation();decreaseCart(${Number(p.id)||0})">−</button><b>${esc(item.qty)}</b><button class="circleBtn" onclick="event.stopPropagation();addCart(${Number(p.id)||0})">+</button><button class="circleBtn danger" onclick="event.stopPropagation();removeCart(${Number(p.id)||0})">${iconSafe('trash')}</button></div></div></div>`;
  }
  function cartTotalsText(items){
    const totals={};
    items.forEach(function(item){const p=productById(item.id); if(!p)return; const pi=parseProductPrice(p); totals[pi.currency]=(totals[pi.currency]||0)+(Number(pi.amount)||0)*(Number(item.qty)||1);});
    const keys=Object.keys(totals); if(!keys.length)return '0 UGX';
    return keys.map(function(c){return formatMoney(totals[c],c)}).join(' + ');
  }
  function renderCartV63(){
    normalizeAllOrders();
    const box=document.getElementById('cartRows'); if(!box)return;
    const items=cartList().filter(function(x){return productById(x.id)&&(Number(x.qty)||0)>0});
    const ordersHtml=orders().length?`<div class="orderCard"><h3>Mes commandes</h3>${orders().map(buyerOrderHtml).join('')}</div>`:'';
    if(items.length){
      const total=cartTotalsText(items);
      box.innerHTML=`<div class="orderStatus"><div class="statusIcon">${iconSafe('shield','ico')}</div><div><b>Paiement sécurisé</b></div></div><div class="card">${items.map(cartItemHtml).join('')}<div class="cartLine"><span>Sous-total</span><b>${esc(total)}</b></div><div class="cartLine"><span>Total</span><b class="total">${esc(total)}</b></div><br><button class="btn" style="width:100%" onclick="show('messages')">${iconSafe('message')} Message vendeur</button><br><br><button class="btn" style="width:100%" onclick="openPaymentPopup()">Continuer le paiement</button></div>${ordersHtml}`;
    }else{
      box.innerHTML=ordersHtml||'<div class="card empty">Aucun article dans le panier.</div>';
    }
    hydrateSafe(box); try{updatePublicPreviewRating()}catch(e){}
  }
  const previousPay=window.payAndCreateOrder;
  if(!window.__happyadV63PayWrapped&&typeof previousPay==='function'){
    window.__happyadV63PayWrapped=true;
    window.payAndCreateOrder=function(){const before=orders().length; const r=previousPay.apply(this,arguments); setTimeout(function(){orders().slice(before).forEach(normalizeZoneForOrder); renderCartV63(); try{window.renderSellerOrders&&window.renderSellerOrders()}catch(e){}},40); return r};
  }
  window.renderCart=renderCartV63;
  window.HAPPYAD_ORDER_TIME_TOOLS={normalize:normalizeZoneForOrder,ageText:ageText,arrivalText:fmtArrival,render:renderCartV63};
  try{renderCartV63()}catch(e){console.warn('V63 order age eta',e);toastSafe('Affichage commande indisponible')}
  /* V64 disabled: old V63 timer replaced by final compact notification renderer. */
})();
