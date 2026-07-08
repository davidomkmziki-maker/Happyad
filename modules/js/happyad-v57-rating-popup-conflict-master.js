// Extracted from index.html. Keep load order.
(function(){
  function esc(s){return String(s==null?'':s).replace(/[&<>\"]/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]})}
  function plain(s){var ta=document.createElement('textarea');ta.innerHTML=String(s==null?'':s);return ta.value}
  function ico(name,cls){try{return icon(name,cls||'icoMini')}catch(e){return ''}}
  function orders(){
    try{if(typeof boutiqueOrders!=='undefined'&&Array.isArray(boutiqueOrders)){window.boutiqueOrders=boutiqueOrders;return boutiqueOrders}}catch(e){}
    try{if(Array.isArray(window.boutiqueOrders))return window.boutiqueOrders}catch(e){}
    return [];
  }
  function done(o){return !!(o&&(o.clientReceived||o.status==='completed'||o.status==='released'||o.fundsReleased||o.payoutAt))}
  function hasSellerProof(o){return !!(o&&(o.sellerDelivered||o.proofVisible||o.proofPhotoUrl||o.proofSent||o.status==='proof_sent'))}
  function findOrder(id){
    var key=plain(id);
    var list=orders();
    var found=list.find(function(o){return String(o.id)===String(id)||String(o.id)===key||esc(o.id)===String(id)});
    if(found)return found;
    var receivable=list.filter(function(o){return o&&!done(o)&&hasSellerProof(o)});
    if(receivable.length===1)return receivable[0];
    return null;
  }
  function money(o){try{if(typeof orderTotalText==='function')return orderTotalText(o);if(o.totalText)return o.totalText;if(typeof formatBoutiqueAmount==='function')return formatBoutiqueAmount(o.totalK||0)}catch(e){}return String(o&&o.totalK||'')}
  function refresh(){
    try{window.renderCart&&window.renderCart()}catch(e){}
    try{window.renderSellerOrders&&window.renderSellerOrders()}catch(e){}
    try{window.renderProfilePublications&&window.renderProfilePublications()}catch(e){}
    try{window.renderProducts&&window.renderProducts()}catch(e){}
    try{window.updateDeliveryCounters&&window.updateDeliveryCounters()}catch(e){}
    try{window.updatePublicPreviewRating&&window.updatePublicPreviewRating()}catch(e){}
    setTimeout(injectSellerRatings,30);
  }
  function closeReceivePopup(){var el=document.getElementById('receiveConfirmOverlay');if(el)el.classList.remove('show')}
  function ensureReceivePopup(){
    var el=document.getElementById('receiveConfirmOverlay');
    if(el)return el;
    el=document.createElement('div');el.id='receiveConfirmOverlay';el.className='receiveConfirmOverlay';el.innerHTML='<div class="receiveConfirmSheet" id="receiveConfirmSheet"></div>';
    (document.querySelector('.app')||document.body).appendChild(el);
    el.addEventListener('click',function(e){if(e.target===el)closeReceivePopup()});
    return el;
  }
  function canClientConfirm(o){
    if(!o)return false;
    if(done(o))return true;
    try{if(typeof orderCanClientConfirm==='function')return !!orderCanClientConfirm(o)}catch(e){}
    return hasSellerProof(o);
  }
  function finalizeReception(o){
    if(!o)return false;
    if(!done(o)){
      if(!hasSellerProof(o)){try{toast('Preuve vendeur requise')}catch(e){}return false}
      o.clientReceived=true;
      o.receivedAt=new Date().toISOString();
      o.claimOpen=false;
      o.claimStatus='closed';
      try{if(typeof releaseSellerFunds==='function')releaseSellerFunds(o)}catch(e){}
      o.fundsReleased=true;
      o.payoutAt=o.payoutAt||new Date().toISOString();
      o.status='completed';
    }
    closeReceivePopup();
    refresh();
    setTimeout(function(){showRatingPopup(o)},80);
    return true;
  }
  function openReceivePopup(orderId){
    var o=findOrder(orderId);
    if(!o){try{toast('Commande introuvable')}catch(e){}return}
    if(done(o)){showRatingPopup(o);return}
    if(!canClientConfirm(o)){try{toast('Preuve vendeur requise')}catch(e){}return}
    var overlay=ensureReceivePopup();
    var sheet=document.getElementById('receiveConfirmSheet');
    var checkedId='receive-v57-'+String(o.id).replace(/[^a-zA-Z0-9_-]/g,'');
    sheet.innerHTML=''
      +'<div class="receiveConfirmHead"><div class="receiveConfirmIcon">'+ico('shield','ico')+'</div><div><h3>Réception</h3><p>Validation commande</p></div></div>'
      +'<div class="receiveConfirmInfo">'
      +'<div class="receiveConfirmInfoRow"><span>Produit</span><b>'+esc(o.product)+' × '+esc(o.qty||1)+'</b></div>'
      +'<div class="receiveConfirmInfoRow"><span>Total</span><b>'+esc(money(o))+'</b></div>'
      +'<div class="receiveConfirmInfoRow"><span>Livraison</span><b>'+esc(o.deliveryZone||'Confirmée')+'</b></div>'
      +'<div class="receiveConfirmInfoRow"><span>Preuve</span><b>'+(o.proofPhotoUrl||o.proof?'Ajoutée':'Déclarée')+'</b></div>'
      +'</div>'
      +'<div class="receiveConfirmWarn2">Confirmez après réception.</div>'
      +'<div class="receiveConfirmCheck"><input type="checkbox" id="'+checkedId+'"><label for="'+checkedId+'">Commande reçue en bon état.</label></div>'
      +'<div class="receiveConfirmActions"><button class="softBtn" id="receiveCancelBtnV57">Annuler</button><button class="confirmBtn" id="receiveConfirmBtnV57" disabled>Confirmer</button></div>';
    overlay.classList.add('show');
    try{hydrateIcons(sheet)}catch(e){}
    var chk=document.getElementById(checkedId),btn=document.getElementById('receiveConfirmBtnV57');
    if(chk&&btn)chk.addEventListener('change',function(){btn.disabled=!chk.checked});
    var cancel=document.getElementById('receiveCancelBtnV57');
    if(cancel)cancel.addEventListener('click',closeReceivePopup);
    if(btn)btn.addEventListener('click',function(){finalizeReception(o)});
  }
  function ensureRatingPopup(){
    var el=document.getElementById('ratingFinalOverlay');
    if(el)return el;
    el=document.createElement('div');el.id='ratingFinalOverlay';el.className='ratingFinalOverlay';el.innerHTML='<div class="ratingFinalSheet" id="ratingFinalSheet"></div>';
    (document.querySelector('.app')||document.body).appendChild(el);
    return el;
  }
  function closeRatingPopup(){var el=document.getElementById('ratingFinalOverlay');if(el)el.classList.remove('show')}
  function showRatingPopup(o){
    if(!o)return;
    var overlay=ensureRatingPopup();
    var sheet=document.getElementById('ratingFinalSheet');
    var already=!!o.rating;
    var selected=Number(o.rating||0);
    sheet.innerHTML=''
      +'<div class="ratingFinalTop"><div class="ratingFinalIcon">'+ico('star','ico')+'</div><div><h3>'+(already?'Note enregistrée':'Noter le produit')+'</h3><p>'+(already?'Votre note est visible par le vendeur':'Votre commande est validée')+'</p></div></div>'
      +'<div class="ratingFinalInfo">'
      +'<div class="ratingFinalInfoRow"><span>Produit</span><b>'+esc(o.product)+' × '+esc(o.qty||1)+'</b></div>'
      +'<div class="ratingFinalInfoRow"><span>Total</span><b>'+esc(money(o))+'</b></div>'
      +'<div class="ratingFinalInfoRow"><span>Statut</span><b>Réception confirmée</b></div>'
      +'</div>'
      +'<div class="ratingFinalStars">'+[1,2,3,4,5].map(function(n){return '<button type="button" '+(already?'disabled':'')+' class="'+(selected>=n?'active':'')+'" data-star="'+n+'">★</button>'}).join('')+'</div>'
      +'<div class="ratingFinalHint">'+(already?'La note n’est plus modifiable dans les détails de commande.':'Choisissez une note puis appuyez sur OK. Elle sera visible par le vendeur.')+'</div>'
      +'<div class="ratingFinalActions"><button class="ratingFinalCancel" type="button">Fermer</button><button class="ratingFinalOk" type="button" '+(!already&&!selected?'disabled':'')+'>OK</button></div>';
    overlay.classList.add('show');
    try{hydrateIcons(sheet)}catch(e){}
    var ok=sheet.querySelector('.ratingFinalOk');
    if(!already){
      sheet.querySelectorAll('[data-star]').forEach(function(btn){btn.addEventListener('click',function(){selected=Number(btn.getAttribute('data-star'));sheet.querySelectorAll('[data-star]').forEach(function(b){b.classList.toggle('active',Number(b.getAttribute('data-star'))<=selected)});if(ok)ok.disabled=false})});
    }
    var cancel=sheet.querySelector('.ratingFinalCancel');
    if(cancel)cancel.addEventListener('click',function(){closeRatingPopup();refresh()});
    if(ok)ok.addEventListener('click',function(){
      if(already){closeRatingPopup();refresh();return}
      if(!selected){try{toast('Choisissez une étoile')}catch(e){}return}
      o.rating=selected;o.ratedAt=new Date().toISOString();o.ratingLabel='★ '+selected+'/5';
      closeRatingPopup();refresh();try{toast('Note envoyée au vendeur')}catch(e){}
    });
  }
  window.confirmReceivedStep1=function(id){openReceivePopup(id)};
  window.showRatingPopupForOrder=function(id){var o=findOrder(id);if(!o){try{toast('Commande introuvable')}catch(e){}return}if(!done(o)){try{toast('Confirmez la réception d’abord')}catch(e){}return}showRatingPopup(o)};
  window.rateOrder=function(orderId,stars){
    var o=findOrder(orderId);
    if(!o){try{toast('Commande introuvable')}catch(e){}return}
    if(!done(o)){try{toast('Confirmez la réception d’abord')}catch(e){}return}
    if(o.rating){try{toast('Note déjà envoyée')}catch(e){}return}
    o.rating=Number(stars);o.ratedAt=new Date().toISOString();o.ratingLabel='★ '+o.rating+'/5';refresh();try{toast('Note envoyée au vendeur')}catch(e){}
  };
  window.ratingBox=function(o){
    if(!o||!done(o))return '';
    if(o.rating)return '<div class="finalRatingBox"><b>Votre note</b><div class="ratingDone">★ '+esc(o.rating)+'/5</div></div>';
    return '<div class="finalRatingBox"><b>Note en attente</b><div class="ratingHint">La commande est validée. Ajoutez votre note dans le popup.</div><button class="rateNowBtn" onclick="event.stopPropagation();showRatingPopupForOrder(\''+esc(o.id)+'\')">Noter maintenant</button></div>';
  };
  function sellerRatingBox(o){return '<div class="sellerRatingBox" data-rating-for="'+esc(o.id)+'"><span>Note client</span><b>★ '+esc(o.rating)+'/5</b></div>'}
  function injectSellerRatings(){
    orders().forEach(function(o){
      if(!o||!o.rating)return;
      var details=document.getElementById('sellerDone-'+String(o.id));
      if(!details)return;
      if(details.querySelector('[data-rating-for="'+(window.CSS&&CSS.escape?CSS.escape(String(o.id)):String(o.id).replace(/"/g,'\\"'))+'"]'))return;
      details.insertAdjacentHTML('beforeend',sellerRatingBox(o));
    });
  }
  if(!window.__happyadV57SellerWrapped&&typeof window.renderSellerOrders==='function'){
    window.__happyadV57SellerWrapped=true;
    var baseSeller=window.renderSellerOrders;
    window.renderSellerOrders=function(){var r=baseSeller.apply(this,arguments);try{injectSellerRatings()}catch(e){}return r};
  }
  if(!window.__happyadV57CartWrapped&&typeof window.renderCart==='function'){
    window.__happyadV57CartWrapped=true;
    var baseCart=window.renderCart;
    window.renderCart=function(){var r=baseCart.apply(this,arguments);try{injectSellerRatings()}catch(e){}return r};
  }
  window.__happyadV57RatingMaster={orders:orders,findOrder:findOrder,refresh:refresh,injectSellerRatings:injectSellerRatings};
  try{refresh()}catch(e){}
})();
