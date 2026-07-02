// Extracted from index.html. Keep load order.
(function(){
  function ensureResolutionModule(){
    if(document.getElementById('resolution')) return;
    const main=document.getElementById('content');
    if(!main) return;
    const sec=document.createElement('section');
    sec.className='module';
    sec.id='resolution';
    sec.innerHTML='<div id="resolutionBox"></div>';
    main.appendChild(sec);
  }
  ensureResolutionModule();
  window.resolutionTickets=window.resolutionTickets||{};
  window.currentResolutionOrderId=null;
  window.currentResolutionRole='client';
  window.currentResolutionPhoto=null;
  const originalShow=window.show;
  window.show=function(id,opts){
    ensureResolutionModule();
    if(id==='resolution'){
      if(!opts?.fromBack && window.currentScreen && window.currentScreen!==id){
        window.navStack=window.navStack||[];
        if(window.navStack[window.navStack.length-1]!==window.currentScreen) window.navStack.push(window.currentScreen);
      }
      window.currentScreen='resolution';
      document.querySelectorAll('.module').forEach(m=>m.classList.toggle('active',m.id==='resolution'));
      document.querySelectorAll('.nav').forEach(x=>x.classList.remove('active'));
      if(typeof setHeader==='function') setHeader('Revendication','Chat commande');
      const content=document.getElementById('content'); if(content) content.scrollTop=0;
      renderResolutionChat();
      if(typeof hydrateIcons==='function') hydrateIcons();
      return;
    }
    return originalShow.call(this,id,opts||{});
  };
  function money(o){ return typeof formatBoutiqueAmount==='function'?formatBoutiqueAmount(o.totalK||0):((o.totalK||0)+'K UGX'); }
  function orderList(){ return window.boutiqueOrders||[]; }
  function findOrder(id){ return orderList().find(o=>o.id===id); }
  function ticketFor(order, openerRole, reason){
    const id=order.id;
    if(!window.resolutionTickets[id]){
      window.resolutionTickets[id]={
        id:'R-'+id,
        orderId:id,
        status:'open',
        reason:reason||'Problème commande',
        createdAt:new Date().toISOString(),
        photoName:'',photoUrl:'',
        messages:[
          {role:'support',text:'Dossier ouvert. HAPPYAD garde le paiement en sécurité pendant la vérification.',at:new Date().toISOString()}
        ]
      };
    }
    const t=window.resolutionTickets[id];
    t.reason=reason||t.reason;
    order.claimOpen=true;order.claimStatus='open';order.claimReason=t.reason;
    if(openerRole==='client' && !t.messages.some(m=>m.auto==='clientOpen')) t.messages.push({role:'client',text:'Je signale un problème sur cette commande.',at:new Date().toISOString(),auto:'clientOpen'});
    if(openerRole==='seller' && !t.messages.some(m=>m.auto==='sellerOpen')) t.messages.push({role:'seller',text:'Je signale une difficulté liée à cette livraison.',at:new Date().toISOString(),auto:'sellerOpen'});
    return t;
  }
  window.openResolutionChat=function(orderId,role='client',reason='Problème commande'){
    const o=findOrder(orderId);
    if(!o){ if(typeof toast==='function') toast('Commande introuvable'); return; }
    window.currentResolutionOrderId=orderId;
    window.currentResolutionRole=role;
    window.currentResolutionPhoto=null;
    ticketFor(o,role,reason);
    show('resolution');
  };
  window.selectResolutionReason=function(reason,btn){
    const o=findOrder(window.currentResolutionOrderId); if(!o) return;
    const t=ticketFor(o,window.currentResolutionRole,reason);
    t.reason=reason;o.claimReason=reason;
    document.querySelectorAll('.reasonBtn').forEach(b=>b.classList.remove('active'));
    btn?.classList.add('active');
    renderResolutionChat(false);
  };
  window.handleResolutionPhoto=function(input){
    if(!input.files||!input.files[0]) return;
    const file=input.files[0];
    if(!file.type||!file.type.startsWith('image/')){ if(typeof toast==='function') toast('Photo uniquement'); input.value=''; return; }
    const reader=new FileReader();
    reader.onload=function(){
      window.currentResolutionPhoto={name:file.name||'preuve.jpg',url:reader.result};
      const prev=document.getElementById('resolutionPhotoPreview');
      if(prev){prev.classList.add('show');prev.innerHTML='<img src="'+reader.result+'"><span>'+window.currentResolutionPhoto.name+'</span>';}
    };
    reader.readAsDataURL(file);
  };
  window.sendResolutionMessage=function(){
    const o=findOrder(window.currentResolutionOrderId); if(!o) return;
    const t=ticketFor(o,window.currentResolutionRole);
    const box=document.getElementById('resolutionText');
    const text=(box?.value||'').trim();
    if(!text && !window.currentResolutionPhoto){ if(typeof toast==='function') toast('Écris un message ou ajoute une photo'); return; }
    let msg=text||'Photo ajoutée';
    if(window.currentResolutionPhoto){
      t.photoName=window.currentResolutionPhoto.name;t.photoUrl=window.currentResolutionPhoto.url;
      msg += '\n📷 '+window.currentResolutionPhoto.name;
    }
    t.messages.push({role:window.currentResolutionRole,text:msg,at:new Date().toISOString()});
    o.claimOpen=true;o.claimStatus='open';
    window.currentResolutionPhoto=null;
    if(box) box.value='';
    renderResolutionChat();
    if(typeof toast==='function') toast('Message ajouté au dossier');
  };
  window.markResolutionResolved=function(who){
    const o=findOrder(window.currentResolutionOrderId); if(!o) return;
    const t=ticketFor(o,who);
    if(who==='client') t.clientOk=true;
    if(who==='seller') t.sellerOk=true;
    t.messages.push({role:who,text:'Je confirme que le problème est résolu.',at:new Date().toISOString()});
    if(t.clientOk&&t.sellerOk){
      t.status='resolved';o.claimOpen=false;o.claimStatus='resolved';
      t.messages.push({role:'support',text:'Dossier résolu. La commande peut continuer selon son statut.',at:new Date().toISOString()});
    }
    renderResolutionChat();
  };
  window.escalateResolution=function(){
    const o=findOrder(window.currentResolutionOrderId); if(!o) return;
    const t=ticketFor(o,window.currentResolutionRole);
    t.status='support';o.claimOpen=true;o.claimStatus='support';
    t.messages.push({role:'support',text:'Dossier envoyé au support HAPPYAD pour décision.',at:new Date().toISOString()});
    renderResolutionChat();
    if(typeof toast==='function') toast('Support HAPPYAD alerté');
  };
  window.renderResolutionChat=function(){
    const box=document.getElementById('resolutionBox'); if(!box) return;
    const o=findOrder(window.currentResolutionOrderId)||orderList()[0];
    if(!o){ box.innerHTML='<div class="card empty">Aucune commande.</div>'; return; }
    window.currentResolutionOrderId=o.id;
    const t=ticketFor(o,window.currentResolutionRole||'client');
    const role=window.currentResolutionRole||'client';
    const reasons=role==='client'?['Je n’ai pas reçu','Produit différent','Produit abîmé','Retard livraison']:['Déjà expédié','Retard transport','Adresse difficile','Stock / préparation'];
    box.innerHTML=`<div class="resolutionShell">
      <div class="resolutionHead"><span class="resolutionStatus ${t.status==='resolved'?'done':'open'}">${t.status==='resolved'?'Résolu':'Ouvert'}</span><h2>${o.product}</h2><p>${o.id} · ${money(o)} · ${role==='client'?'Client':'Vendeur'}</p><div class="resolutionMeta"><div><b>Cause</b>${t.reason}</div><div><b>Paiement</b>Gardé par HAPPYAD</div></div></div>
      <div class="resolutionCard"><h3>Choisir la cause</h3><div class="reasonGrid">${reasons.map(r=>`<button class="reasonBtn ${t.reason===r?'active':''}" onclick="selectResolutionReason('${r}',this)">${r}</button>`).join('')}</div></div>
      <div class="resolutionCard"><h3>Chat de revendication</h3><div class="chatBox">${t.messages.map(m=>`<div class="msgBubble ${m.role}"><b>${m.role==='support'?'HAPPYAD Support':m.role==='seller'?'Vendeur':'Client'}</b>${String(m.text).replace(/\n/g,'<br>')}<small>${new Date(m.at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</small></div>`).join('')}</div></div>
      <div class="resolutionCard"><h3>Ajouter une réponse</h3><div class="resolutionComposer"><textarea id="resolutionText" placeholder="Écrire votre message..."></textarea><div class="resolutionFileRow"><label class="resolutionPick" for="resolutionFile">${typeof icon==='function'?icon('image','icoMini'):''} Photo</label><label class="resolutionPick" for="resolutionCamera">${typeof icon==='function'?icon('camera','icoMini'):''} Caméra</label></div><input class="hiddenResolutionFile" id="resolutionFile" type="file" accept="image/*" onchange="handleResolutionPhoto(this)"><input class="hiddenResolutionFile" id="resolutionCamera" type="file" accept="image/*" capture="environment" onchange="handleResolutionPhoto(this)"><div class="resolutionProof" id="resolutionPhotoPreview"></div><button class="btn" onclick="sendResolutionMessage()">Envoyer</button></div></div>
      <div class="resolutionFooterActions"><button class="btn dark" onclick="markResolutionResolved('${role}')">Problème résolu</button><button class="btn claim" onclick="escalateResolution()">Support HAPPYAD</button></div>
    </div>`;
    if(typeof hydrateIcons==='function') hydrateIcons(box);
  };
  function addClientClaimButtons(){
    const rows=document.getElementById('cartRows'); if(!rows) return;
    const card=rows.querySelector('.orderCard'); if(!card || card.dataset.claimReady==='1') return;
    card.dataset.claimReady='1';
    (window.boutiqueOrders||[]).forEach(o=>{
      if(o.clientReceived) return;
      const div=document.createElement('div');
      div.className='resolutionActions';
      div.innerHTML=`<button class="btn claim" onclick="openResolutionChat('${o.id}','client','Je n’ai pas reçu')">Je n’ai pas reçu</button><button class="btn issue" onclick="openResolutionChat('${o.id}','client','Problème commande')">Revendication</button>`;
      card.appendChild(div);
      if(o.claimOpen){ const b=document.createElement('div'); b.className='resolutionBadge'; b.textContent='Revendication ouverte'; card.appendChild(b); }
    });
  }
  function addSellerClaimButtons(){
    const list=document.getElementById('sellerOrdersList'); if(!list) return;
    const cards=list.querySelectorAll('.sellerOrderCard');
    (window.boutiqueOrders||[]).forEach((o,i)=>{
      const c=cards[i]; if(!c || c.dataset.claimReady==='1') return;
      c.dataset.claimReady='1';
      const div=document.createElement('div'); div.className='resolutionActions';
      div.innerHTML=`<button class="btn issue" onclick="openResolutionChat('${o.id}','seller','Difficulté livraison')">Difficulté</button><button class="btn claim" onclick="openResolutionChat('${o.id}','seller','Répondre revendication')">Dossier</button>`;
      c.appendChild(div);
      if(o.claimOpen){ const b=document.createElement('div'); b.className='resolutionBadge'; b.textContent='Revendication client'; c.appendChild(b); }
    });
  }
  const oldRenderCart=window.renderCart;
  window.renderCart=function(){ oldRenderCart&&oldRenderCart(); addClientClaimButtons(); };
  const oldRenderSellerOrders=window.renderSellerOrders;
  window.renderSellerOrders=function(){ oldRenderSellerOrders&&oldRenderSellerOrders(); addSellerClaimButtons(); };
  setTimeout(()=>{try{renderCart();renderSellerOrders();}catch(e){}},80);
})();
