// Extracted from index.html. Keep load order.
// v23 : paiement protégé + validation livraison vendeur/client
let selectedPayMethod='Mobile Money';
let boutiqueOrders=[];
// HAPPYAD FIX BOUTIQUE PERFORMANCE — partager les commandes entre tous les modules
(function exposeBoutiqueOrders(){
  try{
    Object.defineProperty(window,'boutiqueOrders',{
      configurable:true,
      enumerable:false,
      get:function(){return boutiqueOrders;},
      set:function(v){ boutiqueOrders=Array.isArray(v)?v:[]; }
    });
  }catch(e){ try{ window.boutiqueOrders=boutiqueOrders; }catch(_){} }
})();
function ensureDemoSellerOrders(){ /* Données test supprimées : aucune commande démo. */ }
function openPaymentPopup(){
  if(!cart || !cart.length){toast('Votre panier est vide');return;}
  const box=document.getElementById('paymentOverlay');
  if(box){box.classList.add('show');hydrateIcons(box);}
}
function closePaymentPopup(e){
  if(e && e.target && e.target.id!=='paymentOverlay') return;
  document.getElementById('paymentOverlay')?.classList.remove('show');
}
function selectPayMethod(el,label){
  selectedPayMethod=label;
  document.querySelectorAll('.payOption').forEach(x=>x.classList.remove('active'));
  el.classList.add('active');
}
function payAndCreateOrder(){
  const items=(cart||[]).map(item=>({product:products.find(p=>p.id===item.id), qty:item.qty})).filter(x=>x.product&&x.qty>0);
  if(!items.length){toast('Votre panier est vide');return;}
  items.forEach(item=>{
    boutiqueOrders.push({
      id:'CMD-'+(1000+boutiqueOrders.length+1),
      productId:item.product.id,
      product:item.product.name,
      buyer:'Client HAPPYAD',
      qty:item.qty,
      totalK:priceNumber(item.product)*item.qty,
      status:'paid',
      sellerDelivered:false,
      clientReceived:false,
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
}
function renderCart(){
  const cartItems=(cart||[]).map(item=>({product:products.find(p=>p.id===item.id), qty:item.qty})).filter(x=>x.product&&x.qty>0);
  const totalK=cartItems.reduce((sum,item)=>sum+(priceNumber(item.product)*item.qty),0);
  const totalText=formatBoutiqueAmount(totalK);
  const ordersHtml=boutiqueOrders.length?`<div class="orderCard"><h3>Mes commandes payées</h3>${boutiqueOrders.map(o=>`<div class="cartLine"><span>${o.product} × ${o.qty}</span><b>${formatBoutiqueAmount(o.totalK)}</b></div><div class="deliveryStatus ${o.clientReceived?'done':''}">${o.clientReceived?'Commande reçue':'En attente de réception'}</div>${o.sellerDelivered&&!o.clientReceived?`<div class="confirmReceiveBox"><div class="confirmWarn">Le vendeur a confirmé la livraison avec preuve. Validez seulement si vous avez réellement reçu la commande.</div>${o.proofVisible?`<div class="clientProof">${o.proofPhotoUrl?`<img src="${o.proofPhotoUrl}" alt="Preuve livraison">`:''}<b>Preuve de livraison visible</b><br>${o.proof||'Photo preuve ajoutée par le vendeur'}</div>`:''}<button class="btn" style="width:100%" onclick="confirmReceivedStep1('${o.id}')">J’ai reçu la commande</button></div>`:''}`).join('')}</div>`:'';
  document.getElementById('cartRows').innerHTML=cartItems.length?`<div class="orderStatus"><div class="statusIcon">${icon('shield','ico')}</div><div><b>Commande sécurisée</b><p>Payez avec une méthode proposée par HAPPYAD. L’argent reste gardé jusqu’à réception confirmée.</p></div></div><div class="card">${cartItems.map(item=>{const p=item.product;return `<div class="row"><div class="mini">${icon('bag','ico')}</div><div class="rowInfo"><b>${p.name}</b><span><span class="cartSellerLine">${sellerProfile(p.seller).displayName} ${badgeSvg(p.seller)}</span><br>${p.price}</span><div class="small">Quantité : ${item.qty}</div></div><button class="circleBtn" onclick="event.stopPropagation();decreaseCart(${p.id})">−</button><b>${item.qty}</b><button class="circleBtn" onclick="event.stopPropagation();addCart(${p.id})">+</button><button class="circleBtn danger" onclick="event.stopPropagation();removeCart(${p.id})">${icon('trash','icoMini')}</button></div>`}).join('')}<div class="cartLine"><span>Sous-total</span><b>${totalText}</b></div><div class="cartLine"><span>Livraison</span><b>À confirmer</b></div><div class="cartLine"><span>Garantie</span><b>Active</b></div><div class="cartLine"><span>Total estimé</span><b class="total">${totalText}</b></div><div class="cartSteps"><div><span>1</span>Vous payez et la commande est créée.</div><div><span>2</span>Le vendeur confirme la livraison avec preuve.</div><div><span>3</span>Vous confirmez la réception, puis le vendeur reçoit l’argent.</div></div><br><br><button class="btn" style="width:100%" onclick="openPaymentPopup()">Continuer le paiement</button></div>${ordersHtml}`:`<div class="orderStatus"><div class="statusIcon">${icon('shield','ico')}</div><div><b>Panier sécurisé</b><p>Ajoutez un produit au panier. Les commandes apparaissent seulement après paiement confirmé.</p></div></div>${ordersHtml||'<div class="card empty">Aucun article dans le panier.</div>'}`;
  hydrateIcons(document.getElementById('cartRows'));
}
function renderSellerOrders(){
  updateDeliveryCounters();
  const box=document.getElementById('sellerOrdersList'); if(!box) return;
  if(!boutiqueOrders.length){
    box.innerHTML=`<div class="sellerOrderCard"><div class="sellerOrderTop"><div class="statusIcon">${icon('shield','ico')}</div><div><b>Aucune livraison à valider</b><span>Les commandes apparaîtront ici seulement après paiement confirmé par HAPPYAD.</span></div></div></div>`;
    hydrateIcons(box);
    return;
  }
  box.innerHTML=boutiqueOrders.map(o=>{
    const validated = !!o.clientReceived;
    const waitingClient = o.sellerDelivered && !validated;
    const statusText = validated ? 'Commande validée · argent libéré' : (waitingClient ? 'En attente validation client' : 'À livrer');
    const btnText = validated ? 'Validé par le client' : (waitingClient ? 'Preuve envoyée · attente client' : 'Valider livraison avec preuve');
    const btnDisabled = validated || waitingClient ? 'disabled' : '';
    const extra = validated ? `<div class="adminNotice"><span data-ico="shield"></span><span>Client a confirmé la réception. HAPPYAD libère automatiquement l’argent au vendeur, frais plateforme déjà coupés.</span></div>` : (waitingClient ? `<div class="adminNotice"><span data-ico="message"></span><span>Preuve envoyée au client. Le statut deviendra “Validé” dès que le client confirme la réception.</span></div>` : '');
    const previewClass=o.proofPhotoUrl?'proofPreview show':'proofPreview';
    return `<div class="sellerOrderCard"><div class="sellerOrderTop"><div class="mini">${icon('bag','ico')}</div><div style="flex:1"><b>${o.product}</b><span>${o.id} · ${o.buyer} · ${formatBoutiqueAmount(o.totalK)}</span><div class="deliveryStatus ${o.sellerDelivered?'done':''}">${statusText}</div></div></div><div class="deliveryProofBox ${o.sellerDelivered?'show':''}" id="proof-${o.id}"><textarea placeholder="Écrire la preuve de livraison : lieu, heure, nom reçu..." ${validated?'readonly':''}>${o.proof||''}</textarea><div class="proofPhotoActions"><label class="proofPick" for="proofFile-${o.id}">${icon('image','icoMini')} Photo preuve</label><label class="proofPick" for="proofCam-${o.id}">${icon('camera','icoMini')} Appareil photo</label></div><input class="hiddenFile" id="proofFile-${o.id}" type="file" accept="image/*" onchange="handleProofPhoto('${o.id}',this)" ${validated?'disabled':''}><input class="hiddenFile" id="proofCam-${o.id}" type="file" accept="image/*" capture="environment" onchange="handleProofPhoto('${o.id}',this)" ${validated?'disabled':''}><div class="${previewClass}" id="proofPreview-${o.id}">${o.proofPhotoUrl?`<img src="${o.proofPhotoUrl}" alt="Preuve livraison">`:''}<span>${o.proofPhotoName||'Aucune photo ajoutée'}</span></div><div class="proofAudience">${icon('eye','icoMini')} Visible par HAPPYAD, le client et le créateur après envoi.</div></div>${extra}<button class="btn ${validated?'dark':''}" style="width:100%" onclick="sellerValidateDelivery('${o.id}')" ${btnDisabled}>${btnText}</button></div>`
  }).join('');
  hydrateIcons(box);
}
function handleProofPhoto(id,input){
  const o=boutiqueOrders.find(x=>x.id===id); if(!o || !input.files || !input.files[0]) return;
  const file=input.files[0];
  if(!file.type || !file.type.startsWith('image/')){toast('Ajoutez uniquement une vraie photo'); input.value=''; return;}
  const reader=new FileReader();
  reader.onload=()=>{
    o.proofPhotoName=file.name||'photo-preuve.jpg';
    o.proofPhotoUrl=reader.result;
    const prev=document.getElementById('proofPreview-'+id);
    if(prev){prev.classList.add('show');prev.innerHTML=`<img src="${o.proofPhotoUrl}" alt="Preuve livraison"><span>${o.proofPhotoName}</span>`;}
    toast('Photo preuve ajoutée');
  };
  reader.readAsDataURL(file);
}
function sellerValidateDelivery(id){
  const o=boutiqueOrders.find(x=>x.id===id); if(!o) return;
  if(o.clientReceived){toast('Commande déjà validée');return;}
  if(o.sellerDelivered){toast('Preuve déjà envoyée au client');return;}
  const box=document.getElementById('proof-'+id);
  if(box && !box.classList.contains('show')){box.classList.add('show');toast('Ajoutez la preuve puis validez');return;}
  if(!o.proofPhotoUrl){toast('Photo preuve obligatoire');return;}
  const proof=box?.querySelector('textarea')?.value?.trim()||'Livraison déclarée par le vendeur';
  o.proof=proof;o.proofVisible=true;o.sellerDelivered=true;
  renderSellerOrders();
  renderCart();
  renderProfilePublications();
  updateDeliveryCounters();
  toast('Preuve envoyée au client');
}
function confirmReceivedStep1(id){
  const ok=confirm('Confirmez-vous avoir reçu cette commande ?');
  if(!ok) return;
  const ok2=confirm('Confirmation finale : après validation, HAPPYAD libère l’argent au vendeur, frais plateforme déjà coupés. Continuer ?');
  if(!ok2) return;
  const o=boutiqueOrders.find(x=>x.id===id); if(!o) return;
  o.clientReceived=true;o.status='released';
  renderCart();
  renderSellerOrders();
  renderProfilePublications();
  updateDeliveryCounters();
  toast('Réception confirmée. Argent envoyé au vendeur.');
}

/* HAPPYAD V611: ancien centre de résolution/chat commande supprimé. */

// relancer l’affichage avec la nouvelle logique
try{renderCart();renderSellerOrders();hydrateIcons();}catch(e){}
