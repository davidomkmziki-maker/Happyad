// Extracted from index.html. Keep load order.
(function(){
  function h(s){return String(s==null?'':s).replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]))}
  function ico(name,cls){try{return icon(name,cls||'icoMini')}catch(e){return ''}}
  function productList(){try{return Array.isArray(products)?products:[]}catch(e){return []}}
  function cartList(){try{return Array.isArray(cart)?cart:[]}catch(e){return []}}
  function orderList(){try{return Array.isArray(boutiqueOrders)?boutiqueOrders:[]}catch(e){return []}}
  function pById(id){return productList().find(p=>String(p.id)===String(id))}
  function sellerName(p){try{return (sellerProfile(p.seller)||{}).displayName||p.seller||'Vendeur'}catch(e){return p?.seller||'Vendeur'}}
  function fmtDate(d){try{return new Date(d).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}catch(e){return ''}}
  function addHours(date,h){return new Date(new Date(date).getTime()+(Number(h)||0)*60*60*1000)}
  function nowISO(){return new Date().toISOString()}

  function parseNumberToken(token){
    token=String(token||'').replace(/\s+/g,'').trim();
    if(!token) return 0;
    if(/^\d{1,3}([.,]\d{3})+$/.test(token)) return Number(token.replace(/[.,]/g,''));
    return Number(token.replace(',','.').replace(/[^0-9.]/g,''))||0;
  }
  function currencyFromText(text){
    const up=String(text||'').toUpperCase();
    if(/\$|USD|US DOLLAR|DOLLAR/.test(up)) return 'USD';
    if(/€|EUR/.test(up)) return 'EUR';
    if(/\bCDF\b|\bFC\b|FRANC/.test(up)) return 'CDF';
    return 'UGX';
  }
  function parseBoutiquePrice(src){
    const text=typeof src==='object' ? String(src?.price||src?.unitPriceText||src?.lockedPriceText||src?.totalText||'') : String(src||'');
    const up=text.toUpperCase();
    const currency=currencyFromText(text);
    const token=(text.match(/[0-9]+(?:[\s.,][0-9]+)*/)||['0'])[0];
    let amount=parseNumberToken(token);
    if(/\bM\b|MILLION/.test(up)) amount*=1000000;
    else if(/\bK\b|MILLE|THOUSAND/.test(up)) amount*=1000;
    return {amount:amount||0,currency,text};
  }
  function trimMoney(n,decimals){
    n=Number(n)||0;
    const fixed=n.toFixed(decimals);
    return fixed.replace(/\.0+$/,'').replace(/(\.\d*[1-9])0+$/,'$1');
  }
  function formatBoutiqueMoney(amount,currency){
    currency=currency||'UGX';
    amount=Number(amount)||0;
    if(currency==='UGX' || currency==='CDF'){
      if(amount>=1000000){
        return trimMoney(amount/1000000,1)+'M '+currency;
      }
      if(amount>=1000){
        return trimMoney(amount/1000,1)+'K '+currency;
      }
      return trimMoney(amount,0)+' '+currency;
    }
    const n=Math.abs(amount)>=1000 ? Math.round(amount).toLocaleString('en-US') : trimMoney(amount,2);
    return n+' '+currency;
  }
  function legacyFormatBoutiqueAmount(k,currency){
    if(currency) return formatBoutiqueMoney(Number(k)||0,currency);
    return formatBoutiqueMoney((Number(k)||0)*1000,'UGX');
  }
  window.parseBoutiquePrice=parseBoutiquePrice;
  window.formatBoutiqueMoney=formatBoutiqueMoney;
  window.formatBoutiqueAmount=legacyFormatBoutiqueAmount;
  window.priceNumber=function(p){
    const parsed=parseBoutiquePrice(p);
    return parsed.currency==='UGX' ? parsed.amount/1000 : parsed.amount;
  };

  function priceInfo(p){return parseBoutiquePrice(p)}
  function cartItems(){return cartList().map(item=>({product:pById(item.id),qty:Number(item.qty)||0})).filter(x=>x.product&&x.qty>0)}
  function groupTotals(items){
    const totals={};
    items.forEach(item=>{
      const pi=priceInfo(item.product);
      totals[pi.currency]=(totals[pi.currency]||0)+pi.amount*item.qty;
    });
    return totals;
  }
  function formatTotals(items){
    const totals=groupTotals(items);
    const keys=Object.keys(totals);
    if(!keys.length) return '0 UGX';
    return keys.map(c=>formatBoutiqueMoney(totals[c],c)).join(' + ');
  }
  function orderTotalText(o){
    if(o?.totalText) return o.totalText;
    if(o?.currency && o?.totalAmount!=null) return formatBoutiqueMoney(o.totalAmount,o.currency);
    const p=pById(o?.productId);
    const parsed=parseBoutiquePrice(o?.unitPriceText || (p&&p.price) || '');
    if(parsed.amount && o?.qty) return formatBoutiqueMoney(parsed.amount*(Number(o.qty)||1),parsed.currency);
    return legacyFormatBoutiqueAmount(o?.totalK||0);
  }
  function sellerAmountText(o){
    if(o?.sellerAmountText) return o.sellerAmountText;
    if(o?.currency && o?.sellerAmount!=null) return formatBoutiqueMoney(o.sellerAmount,o.currency);
    if(o?.currency && o?.totalAmount!=null) return formatBoutiqueMoney(Math.max(0,o.totalAmount-(o.platformFee||0)),o.currency);
    return legacyFormatBoutiqueAmount(o?.sellerAmountK||o?.totalK||0);
  }
  function ensureOrderCurrency(o){
    if(!o) return o;
    if(!o.currency || o.totalAmount==null || !o.totalText){
      const p=pById(o.productId);
      const parsed=parseBoutiquePrice(o.unitPriceText || (p&&p.price) || '');
      if(parsed.amount){
        o.currency=o.currency||parsed.currency;
        o.unitAmount=o.unitAmount||parsed.amount;
        o.totalAmount=o.totalAmount||(parsed.amount*(Number(o.qty)||1));
        o.totalText=o.totalText||formatBoutiqueMoney(o.totalAmount,o.currency);
        if(o.platformFee==null) o.platformFee=Math.max(1,Math.round(o.totalAmount*0.05));
        if(o.sellerAmount==null) o.sellerAmount=Math.max(0,o.totalAmount-o.platformFee);
        o.sellerAmountText=o.sellerAmountText||formatBoutiqueMoney(o.sellerAmount,o.currency);
      }
    }
    return o;
  }
  function normalizeZones(zones,p){
    if(Array.isArray(zones)&&zones.length) return zones.map(z=>({name:String(z.name||z.zone||'Zone').trim(),hours:Math.max(1,Number(z.hours||z.delay||z.time||2))})).filter(z=>z.name);
    if(typeof zones==='string'&&zones.trim()){
      return zones.split(/;|\n/).map(x=>x.trim()).filter(Boolean).map(x=>{
        const parts=x.split('|').map(v=>v.trim());
        const h=parts[1]?parseFloat(parts[1].replace(/[^0-9.,]/g,'').replace(',','.')):2;
        return {name:parts[0]||'Zone',hours:Math.max(1,Number(h)||2)};
      });
    }
    const cat=(p&&p.cat)||'mode';
    if(cat==='support') return [{name:'Kampala centre',hours:2},{name:'Makindye',hours:4},{name:'À domicile sur rendez-vous',hours:24}];
    if(cat==='cuisine') return [{name:'Kampala centre',hours:3},{name:'Ntinda',hours:5},{name:'Entebbe',hours:24}];
    return [{name:'Kampala centre',hours:2},{name:'Makindye / Kansanga',hours:4},{name:'Entebbe / Wakiso',hours:24}];
  }
  function selectedZoneForProduct(p,idx){
    const sel=document.querySelector(`.deliveryZoneSelect[data-product-id="${p.id}"][data-index="${idx}"]`);
    const zones=normalizeZones(p.deliveryZones,p);
    return zones[Number(sel?.value)||0]||zones[0];
  }

  window.payAndCreateOrder=function(){
    try{
      if(typeof paymentBusy!=='undefined' && paymentBusy){toast('Paiement déjà en cours');return;}
      const items=cartItems();
      if(!items.length){toast('Votre panier est vide');return;}
      const phone=(document.getElementById('deliveryPhone')?.value||'').trim();
      if(phone.replace(/[^0-9]/g,'').length<7){toast('Téléphone obligatoire');return;}
      const totals=groupTotals(items);
      if(typeof selectedPayMethod!=='undefined' && selectedPayMethod==='Solde HAPPYAD'){
        if(Object.keys(totals).some(c=>c!=='UGX')){toast('Solde HAPPYAD disponible seulement en UGX');return;}
        if((totals.UGX||0)>250000){toast('Solde insuffisant. Commande non créée.');return;}
      }
      if(typeof paymentBusy!=='undefined') paymentBusy=true;
      const batchId='PAY-'+Date.now();
      const paidAt=nowISO();
      const startLen=orderList().length;
      const newOrders=items.map((item,idx)=>{
        const p=item.product;
        const price=parseBoutiquePrice(p);
        const z=selectedZoneForProduct(p,idx);
        const totalAmount=price.amount*item.qty;
        const fee=Math.max(1,Math.round(totalAmount*0.05));
        const sellerAmount=Math.max(0,totalAmount-fee);
        const eta=addHours(paidAt,z.hours);
        return {
          id:'CMD-'+(1001+startLen+idx),
          paymentId:batchId,
          productId:p.id,
          product:p.name,
          seller:p.seller,
          buyer:'Client HAPPYAD',
          buyerName:'Client HAPPYAD',
          qty:item.qty,
          currency:price.currency,
          unitAmount:price.amount,
          unitPriceText:p.price,
          lockedPriceText:formatBoutiqueMoney(price.amount,price.currency),
          totalAmount,
          totalText:formatBoutiqueMoney(totalAmount,price.currency),
          totalK:price.currency==='UGX'?totalAmount/1000:totalAmount,
          platformFee:fee,
          platformFeeText:formatBoutiqueMoney(fee,price.currency),
          platformFeeK:price.currency==='UGX'?fee/1000:fee,
          sellerAmount,
          sellerAmountText:formatBoutiqueMoney(sellerAmount,price.currency),
          sellerAmountK:price.currency==='UGX'?sellerAmount/1000:sellerAmount,
          status:'paid',
          method:(typeof selectedPayMethod!=='undefined'?selectedPayMethod:'Mobile Money'),
          paidAt,
          deliveryZone:z.name,
          deliveryDelayHours:z.hours,
          deliveryEtaAt:eta.toISOString(),
          deliveryPhone:phone,
          cancelLockedUntil:eta.toISOString(),
          cancelLocked:true,
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
      });
      if(typeof boutiqueOrders!=='undefined') boutiqueOrders.push(...newOrders); else window.boutiqueOrders=(window.boutiqueOrders||[]).concat(newOrders);
      try{cart=[];}catch(e){window.cart=[];}
      try{syncCartCount()}catch(e){}
      try{closePaymentPopup()}catch(e){}
      try{renderCart()}catch(e){}
      try{renderSellerOrders()}catch(e){}
      try{updateDeliveryCounters()}catch(e){}
      if(typeof paymentBusy!=='undefined') paymentBusy=false;
      toast('Paiement confirmé. Commande créée.');
    }catch(err){
      if(typeof paymentBusy!=='undefined') paymentBusy=false;
      console.warn('V50 payment error',err);
      toast('Paiement non terminé');
    }
  };

  function isDone(o){return !!(o&&(o.clientReceived||o.status==='completed'||o.status==='released'||o.fundsReleased||o.payoutAt))}
  function isCancel(o){return !!(o&&o.cancelRequested&&!isDone(o)&&!o.refunded)}
  function reached(o){return !o?.deliveryEtaAt || Date.now()>=new Date(o.deliveryEtaAt).getTime()}
  function orderProductButton(o){return `<button class="orderViewProductBtn" onclick="event.stopPropagation();openOrderProduct('${h(o.id)}')">${ico('eye')} Voir produit</button>`}
  function deliveryMeta(o){if(!o.deliveryZone)return '';return `<div class="orderMiniInfo"><b>${h(o.deliveryZone)}</b>${o.deliveryDelayHours?` · ${h(o.deliveryDelayHours)}h`:''}<br><span>Réception prévue : ${fmtDate(o.deliveryEtaAt)}</span><br><span class="phoneSaved">Contact enregistré</span></div>`}
  function proofBlock(o){if(!o.proofVisible&&!o.proofPhotoUrl&&!o.proof)return '';return `<div class="compactProof">${o.proofPhotoUrl?`<img src="${o.proofPhotoUrl}" alt="Preuve livraison">`:ico('image')}<div><b>Preuve de livraison</b><br>${h(o.proof||o.proofPhotoName||'Livraison déclarée')}</div></div>`}
  function completedBuyerOrder(o){ensureOrderCurrency(o);const id='buyerDone-'+h(o.id);const rating=(typeof ratingBox==='function')?ratingBox(o):'';return `<div class="orderSlim" onclick="toggleOrderDetails('${id}')"><div><b>${h(o.product)} × ${h(o.qty)}</b><span>${orderTotalText(o)} · Validée</span></div><div class="sellerOrderSlimRight"><span class="orderSlimStatus">Validée</span><button class="orderSlimBtn" onclick="event.stopPropagation();toggleOrderDetails('${id}')">Voir ∨</button></div></div><div class="orderSlimDetails" id="${id}">${orderProductButton(o)}${deliveryMeta(o)}${proofBlock(o)}<div class="cartLine"><span>Paiement vendeur</span><b>Envoyé</b></div>${rating}</div>`}
  function activeBuyerOrder(o){ensureOrderCurrency(o);const cancel=isCancel(o);const canReceive=o.sellerDelivered&&!isDone(o)&&!cancel;const canClaim=!isDone(o)&&!cancel;const status=cancel?'En attente d’annulation':(o.sellerDelivered?'À confirmer':'En préparation');const proof=canReceive?proofBlock(o):'';let actions='';if(canClaim){if(!o.sellerDelivered&&!reached(o)){actions=`<div class="lockedDelivery">Annulation indisponible jusqu’à ${fmtDate(o.deliveryEtaAt)}</div><button class="btn dark" style="width:100%" onclick="show('messages')">Message vendeur</button>`}else{actions=`<div class="claimVisibleRow forceClaimRow"><button class="claimMainBtn" onclick="${o.sellerDelivered?`openResolutionChat('${h(o.id)}','client','Je n’ai pas reçu')`:`requestCancelOrder('${h(o.id)}')`}">${o.sellerDelivered?'Je n’ai pas reçu':'Annuler'}</button><button class="claimSecondBtn" onclick="openResolutionChat('${h(o.id)}','client','Revendication')">Revendication</button></div>`}}const receive=canReceive?`<div class="confirmReceiveBox"><div class="confirmWarn">Validez seulement après réception réelle.</div>${proof}<button class="btn" style="width:100%" onclick="confirmReceivedStep1('${h(o.id)}')">J’ai reçu la commande</button></div>`:'';const cancelBlock=cancel?`<div class="cancelPendingBox">Annulation en attente</div><div class="orderButtons oneBtn"><button class="btn cancel" onclick="openResolutionChat('${h(o.id)}','client','Annulation')">Ouvrir dossier</button></div>`:'';const claimBadge=(o.claimOpen&&!cancel)?`<div class="claimOpenBadge">Revendication ouverte</div>`:'';return `<div class="cartLine"><span>${h(o.product)} × ${h(o.qty)}</span><b>${orderTotalText(o)}</b></div><div class="orderProductActionRow"><div class="deliveryStatus ${cancel?'cancel':''}">${status}</div>${orderProductButton(o)}</div>${deliveryMeta(o)}${receive}${cancelBlock}${actions}${claimBadge}`}

  function cartProductItem(item){const p=item.product;return `<div class="cartProductCard"><div class="cartProductMedia">${ico('bag','ico')}</div><div class="cartProductInfo"><div class="cartProductTitle">${h(p.name)}</div><div class="cartProductSeller">${h(sellerName(p))} ${typeof badgeSvg==='function'?badgeSvg(p.seller):''}</div><div class="cartProductPrice">${h(p.price)}</div><div class="cartActionUnderPrice"><button class="circleBtn" onclick="event.stopPropagation();decreaseCart(${p.id})">−</button><b>${h(item.qty)}</b><button class="circleBtn" onclick="event.stopPropagation();addCart(${p.id})">+</button><button class="circleBtn danger" onclick="event.stopPropagation();removeCart(${p.id})">${ico('trash')}</button></div></div></div>`}

  window.renderCart=function(){
    const items=cartItems();
    const totalText=formatTotals(items);
    const orders=orderList().map(ensureOrderCurrency);
    const ordersHtml=orders.length?`<div class="orderCard"><h3>Mes commandes</h3>${orders.map(o=>isDone(o)?completedBuyerOrder(o):activeBuyerOrder(o)).join('')}</div>`:'';
    const cartHtml=items.length?`<div class="orderStatus"><div class="statusIcon">${ico('shield','ico')}</div><div><b>Paiement sécurisé</b></div></div><div class="card">${items.map(cartProductItem).join('')}<div class="cartLine"><span>Sous-total</span><b>${totalText}</b></div><div class="cartLine"><span>Total</span><b class="total">${totalText}</b></div><br><button class="btn" style="width:100%" onclick="show('messages')">${ico('message')} Message vendeur</button><br><br><button class="btn" style="width:100%" onclick="openPaymentPopup()">Continuer le paiement</button></div>`:'';
    const target=document.getElementById('cartRows');
    if(target) target.innerHTML=cartHtml+ordersHtml || '<div class="card empty">Aucun article dans le panier.</div>';
    try{hydrateIcons(target); if(typeof updatePublicPreviewRating==='function') updatePublicPreviewRating()}catch(e){}
  };

  function buyerName(o){return h(o.buyerName||o.buyer||'Client HAPPYAD')}
  function phone(o){return h(o.deliveryPhone||o.phone||'')}
  function sellerMeta(o){return `<div class="sellerDeliveryMeta">${o.deliveryZone?`<span>${h(o.deliveryZone)}</span>`:''}${o.deliveryDelayHours?`<span>${h(o.deliveryDelayHours)}h</span>`:''}${o.deliveryEtaAt?`<span>Réception ${fmtDate(o.deliveryEtaAt)}</span>`:''}<span class="clientPill">Client : ${buyerName(o)}</span>${phone(o)?`<span class="telPill">Tel : ${phone(o)}</span>`:''}</div>`}
  function completedSellerOrder(o){ensureOrderCurrency(o);const id='sellerDone-'+h(o.id);return `<div class="sellerOrderSlim" onclick="toggleOrderDetails('${id}')"><div class="miniIcon">${ico('shield')}</div><div class="sellerOrderSlimMain"><b>${h(o.product)}</b><span>${h(o.id)} · ${orderTotalText(o)} · Validé</span></div><div class="sellerOrderSlimRight"><span class="orderSlimStatus">Validé</span><button class="orderSlimBtn" onclick="event.stopPropagation();toggleOrderDetails('${id}')">Voir ∨</button></div></div><div class="orderSlimDetails" id="${id}">${sellerMeta(o)}${proofBlock(o)}<div class="cartLine"><span>Client</span><b>${buyerName(o)}</b></div>${phone(o)?`<div class="cartLine"><span>Téléphone</span><b>${phone(o)}</b></div>`:''}<div class="cartLine"><span>Argent reçu</span><b>${sellerAmountText(o)}</b></div></div>`}
  function activeSellerOrder(o){ensureOrderCurrency(o);const cancel=isCancel(o),waiting=o.sellerDelivered&&!isDone(o)&&!cancel;const statusText=cancel?'Annulé':(waiting?'En attente client':'À livrer');const statusCls=cancel?'cancel':'';const proofDisabled=(waiting||cancel)?'disabled':'';const readonly=cancel?'readonly':'';const cancelBox=cancel?`<div class="sellerCancelledBox">Annulation demandée</div><div class="orderButtons oneBtn"><button class="btn problem" onclick="openResolutionChat('${h(o.id)}','seller','Annulation')">Ouvrir dossier</button></div>`:'';const buttons=cancel?'':`<div class="orderButtons"><button class="btn cancel" onclick="openClientProfile('${h(o.id)}')">Ouvrir profil client</button><button class="btn problem" onclick="openResolutionChat('${h(o.id)}','seller','Ouvrir dossier')">Ouvrir dossier</button></div><button class="btn ${waiting?'dark':''}" style="width:100%;margin-top:10px" onclick="sellerValidateDelivery('${h(o.id)}')" ${waiting?'disabled':''}>${waiting?'Preuve envoyée':'Valider livraison'}</button>`;const info=waiting?`<div class="adminNotice"><span data-ico="message"></span><span>Notification envoyée au client.</span></div>`:'';const claimBadge=(o.claimOpen&&!cancel)?`<div class="claimOpenBadge seller">Revendication ouverte</div>`:'';return `<div class="sellerOrderCard"><div class="sellerOrderTop"><div class="mini">${ico('bag','ico')}</div><div style="flex:1"><b>${h(o.product)}</b><span>${h(o.id)} · ${orderTotalText(o)}</span><div class="deliveryStatus ${statusCls}">${statusText}</div></div></div>${sellerMeta(o)}<div class="deliveryProofBox ${o.sellerDelivered?'show':''}" id="proof-${h(o.id)}"><textarea placeholder="Preuve de livraison" ${readonly}>${h(o.proof||'')}</textarea><div class="proofPhotoActions"><label class="proofPick" for="proofFile-${h(o.id)}">${ico('image')} Photo</label><label class="proofPick" for="proofCam-${h(o.id)}">${ico('camera')} Caméra</label></div><input class="hiddenFile" id="proofFile-${h(o.id)}" type="file" accept="image/*" onchange="handleProofPhoto('${h(o.id)}',this)" ${proofDisabled}><input class="hiddenFile" id="proofCam-${h(o.id)}" type="file" accept="image/*" capture="environment" onchange="handleProofPhoto('${h(o.id)}',this)" ${proofDisabled}><div class="${o.proofPhotoUrl?'proofPreview show':'proofPreview'}" id="proofPreview-${h(o.id)}">${o.proofPhotoUrl?`<img src="${o.proofPhotoUrl}" alt="Preuve livraison">`:''}<span>${h(o.proofPhotoName||'Aucune photo')}</span></div></div>${info}${cancelBox}${claimBadge}${buttons}</div>`}
  window.renderSellerOrders=function(){
    const list=orderList().map(ensureOrderCurrency);
    try{if(typeof updateDeliveryCounters==='function') updateDeliveryCounters()}catch(e){}
    const box=document.getElementById('sellerOrdersList'); if(!box) return;
    const active=list.filter(o=>!isDone(o));
    const done=list.filter(isDone);
    const activeHtml=active.length?active.map(activeSellerOrder).join(''):`<div class="sellerOrderCard"><div class="sellerOrderTop"><div class="statusIcon">${ico('shield','ico')}</div><div><b>Aucune commande à traiter</b></div></div></div>`;
    const doneHtml=done.length?`<div class="sellerOrderHistory"><div class="orderHistoryTitle">Historique</div>${done.map(completedSellerOrder).join('')}</div>`:'';
    box.innerHTML=activeHtml+doneHtml;
    const screen=document.getElementById('sellerOrdersScreenCount'); if(screen) screen.textContent=active.length?`${active.length} commande${active.length>1?'s':''} à traiter`:'Aucune commande à traiter';
    try{hydrateIcons(box)}catch(e){}
  };

  try{renderCart();renderSellerOrders()}catch(e){console.warn('V50 currency init',e)}
})();
