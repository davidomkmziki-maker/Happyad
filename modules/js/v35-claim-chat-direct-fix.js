// Extracted from index.html. Keep load order.
(function(){
  const claimThreads = {};
  function orders(){
    try { return (typeof boutiqueOrders !== 'undefined' && Array.isArray(boutiqueOrders)) ? boutiqueOrders : []; }
    catch(e){ return []; }
  }
  function findOrderSafe(id){
    const list = orders();
    return list.find(o => String(o.id) === String(id)) || list[0] || null;
  }
  function ensureThread(order){
    if(!order) return [];
    if(!claimThreads[order.id]){
      claimThreads[order.id] = [
        {role:'support', text:'Dossier ouvert. Le paiement reste protégé pendant la résolution.'}
      ];
    }
    return claimThreads[order.id];
  }
  function roleName(role){
    if(role === 'seller') return 'Vendeur';
    if(role === 'support') return 'Support HAPPYAD';
    return 'Client';
  }
  function statusLabel(order){
    if(order?.clientReceived) return 'Commande validée';
    if(order?.claimOpen) return 'Revendication ouverte';
    if(order?.sellerDelivered) return 'En attente client';
    return 'Commande en cours';
  }
  window.openResolutionChat = function(orderId, role='client', reason='Revendication'){
    const order = findOrderSafe(orderId);
    if(!order){
      if(typeof toast === 'function') toast('Aucune commande payée');
      return;
    }
    window.currentResolutionOrderId = order.id;
    window.currentResolutionRole = role;
    window.currentIssue = reason || 'Revendication';
    order.claimOpen = true;
    order.claimReason = window.currentIssue;
    const thread = ensureThread(order);
    const starter = role === 'seller' ? 'Le vendeur a ouvert le dossier.' : 'Le client a ouvert une revendication.';
    if(!thread.some(m => m.auto === role + ':' + window.currentIssue)){
      thread.push({role, text: window.currentIssue + ' — ' + starter, auto: role + ':' + window.currentIssue});
    }
    const title = document.getElementById('resolutionTitle');
    const sub = document.getElementById('resolutionSub');
    if(title) title.textContent = 'Dossier commande';
    if(sub) sub.textContent = `${order.id} · ${order.product} · ${typeof formatBoutiqueAmount === 'function' ? formatBoutiqueAmount(order.totalK || 0) : (order.totalK || '')}`;
    document.querySelectorAll('#issueChips .issueChip').forEach(btn=>{
      const txt = (btn.textContent || '').trim();
      btn.classList.toggle('active', txt === reason || (reason && txt.includes(reason.split(' ')[0])));
    });
    renderResolutionChat();
    if(typeof show === 'function') show('resolution');
    if(typeof toast === 'function') toast('Dossier ouvert');
  };
  window.chooseIssue = function(btn,label){
    window.currentIssue = label || 'Revendication';
    document.querySelectorAll('#issueChips .issueChip').forEach(b=>b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    const input = document.getElementById('resolutionInput');
    const presets = {
      'Je n’ai pas reçu':'Je n’ai pas reçu ma commande. Je demande vérification.',
      'Annulation':'Je demande l’annulation de cette commande.',
      'Difficulté livraison':'J’ai une difficulté réelle pour expédier cette commande.',
      'Déjà expédié':'La commande est déjà expédiée. Je peux fournir une preuve.',
      'Problème général':''
    };
    if(input) input.value = presets[label] || '';
  };
  window.renderResolutionChat = function(){
    const box = document.getElementById('resolutionChat');
    if(!box) return;
    const order = findOrderSafe(window.currentResolutionOrderId);
    if(!order){
      box.innerHTML = '<div class="chatBubble support"><b>Support HAPPYAD</b><span>Aucune commande disponible.</span></div>';
      return;
    }
    const title = document.getElementById('resolutionTitle');
    const sub = document.getElementById('resolutionSub');
    if(title) title.textContent = 'Dossier commande';
    if(sub) sub.textContent = `${order.id} · ${order.product} · ${typeof formatBoutiqueAmount === 'function' ? formatBoutiqueAmount(order.totalK || 0) : (order.totalK || '')}`;
    const thread = ensureThread(order);
    const proof = order.proofPhotoUrl ? `<div class="clientProof"><img src="${order.proofPhotoUrl}" alt="Preuve"><b>Preuve livraison</b><br>${order.proof || 'Photo ajoutée par le vendeur'}</div>` : '';
    box.innerHTML = `
      <div class="resolutionMiniCard">
        <b>${order.product}</b>
        <span>${statusLabel(order)} · ${order.claimReason || window.currentIssue || 'Revendication'}</span>
      </div>
      ${proof}
      ${thread.map(m=>`<div class="chatBubble ${m.role === 'seller' ? 'seller' : m.role === 'support' ? 'support' : 'client'}"><b>${roleName(m.role)}</b><span>${String(m.text).replace(/\n/g,'<br>')}</span></div>`).join('')}
    `;
    box.scrollTop = box.scrollHeight;
    if(typeof hydrateIcons === 'function') hydrateIcons(box);
  };
  window.sendResolutionMessage = function(){
    const order = findOrderSafe(window.currentResolutionOrderId);
    const input = document.getElementById('resolutionInput');
    if(!order){ if(typeof toast === 'function') toast('Aucune commande'); return; }
    const text = (input?.value || '').trim();
    if(!text){ if(typeof toast === 'function') toast('Écrivez un message'); return; }
    order.claimOpen = true;
    order.claimReason = window.currentIssue || order.claimReason || 'Revendication';
    ensureThread(order).push({role: window.currentResolutionRole || 'client', text});
    if(input) input.value = '';
    renderResolutionChat();
    if(typeof renderCart === 'function') renderCart();
    if(typeof renderSellerOrders === 'function') renderSellerOrders();
    if(typeof toast === 'function') toast('Message envoyé');
  };
  window.markResolutionPending = function(){
    const order = findOrderSafe(window.currentResolutionOrderId);
    if(!order){ if(typeof toast === 'function') toast('Aucune commande'); return; }
    order.claimOpen = true;
    order.claimStatus = 'support';
    ensureThread(order).push({role:'support', text:'Support HAPPYAD alerté. Le paiement reste protégé.'});
    renderResolutionChat();
    if(typeof toast === 'function') toast('Support alerté');
  };
  window.markResolutionSolved = function(){
    const order = findOrderSafe(window.currentResolutionOrderId);
    if(!order){ if(typeof toast === 'function') toast('Aucune commande'); return; }
    order.claimOpen = false;
    order.claimStatus = 'resolved';
    ensureThread(order).push({role:'support', text:'Dossier marqué comme résolu.'});
    renderResolutionChat();
    if(typeof renderCart === 'function') renderCart();
    if(typeof renderSellerOrders === 'function') renderSellerOrders();
    if(typeof toast === 'function') toast('Dossier résolu');
  };
})();
