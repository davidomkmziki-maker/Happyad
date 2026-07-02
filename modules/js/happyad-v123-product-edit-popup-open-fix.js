/* HAPPYAD V123 — ouverture réelle popup Modifier produit
   Corrige les clics Modifier sur cartes Mon profil et lignes Mes produits.
   Le script ne crée aucune image : il rend seulement le popup d'édition accessible et fonctionnel. */
(function(){
  if(window.__happyadV123ProductEditPopupOpenFix) return;
  window.__happyadV123ProductEditPopupOpenFix = true;

  function toastSafe(msg){
    try{ if(typeof toast === 'function') toast(msg); else console.log('[HAPPYAD]', msg); }catch(e){ console.log('[HAPPYAD]', msg); }
  }
  function productsList(){
    try{ if(typeof products !== 'undefined' && Array.isArray(products)) return products; }catch(e){}
    return Array.isArray(window.products) ? window.products : [];
  }
  function normalizeId(v){ return String(v == null ? '' : v); }
  function byId(id){
    var sid = normalizeId(id);
    return productsList().find(function(p){ return normalizeId(p && p.id) === sid; }) || null;
  }
  function textOf(el){ return String((el && (el.textContent || el.value)) || '').trim(); }
  function productFromButton(btn){
    if(!btn) return null;
    var id = btn.getAttribute('data-product-id') || btn.getAttribute('data-id') || '';
    if(!id){
      var card = btn.closest && btn.closest('[data-product-id]');
      if(card) id = card.getAttribute('data-product-id') || '';
    }
    if(!id){
      var onclick = btn.getAttribute('onclick') || '';
      var m = onclick.match(/openProductEditor\(([^)]+)\)/);
      if(m){
        try{ id = Function('return (' + m[1] + ')')(); }
        catch(e){ id = String(m[1]).replace(/^['\"]|['\"]$/g,''); }
      }
    }
    var p = id ? byId(id) : null;
    if(p) return p;
    var box = btn.closest && (btn.closest('.product') || btn.closest('.row'));
    var name = textOf(box && (box.querySelector('.name') || box.querySelector('.rowInfo b')));
    if(name){
      return productsList().find(function(x){ return textOf({textContent:x && (x.name || x.title)}).toLowerCase() === name.toLowerCase(); }) || null;
    }
    return null;
  }
  function parseAmount(p){
    p = p || {};
    var direct = Number(p.unitAmount || p.priceAmount || p.amount || 0);
    if(direct > 0) return Math.round(direct);
    var raw = String(p.priceText || p.price || '');
    var n = Number(raw.replace(/,/g,'.').replace(/[^0-9.]/g,'')) || 0;
    if(/\bK\b/i.test(raw)) n *= 1000;
    if(/\bM\b/i.test(raw)) n *= 1000000;
    if(/\bB\b/i.test(raw)) n *= 1000000000;
    return Math.round(n || 0);
  }
  function parseCurrency(p){
    p = p || {};
    var raw = String(p.currency || p.currencyCode || p.devise || p.monnaie || p.priceText || p.price || '').toUpperCase();
    var m = raw.match(/\b[A-Z]{3}\b/);
    return m ? m[0] : 'UGX';
  }
  function cleanAmount(v){ return String(v == null ? '' : v).replace(/[^0-9]/g,''); }
  function formatMoney(amount, currency){
    amount = Number(amount) || 0;
    currency = String(currency || 'UGX').toUpperCase();
    try{ if(typeof window.formatBoutiqueMoney === 'function') return window.formatBoutiqueMoney(amount, currency); }catch(e){}
    if(amount >= 1000000000) return (Math.round(amount/100000000)/10).toString().replace(/\.0$/,'') + 'B ' + currency;
    if(amount >= 1000000) return (Math.round(amount/100000)/10).toString().replace(/\.0$/,'') + 'M ' + currency;
    if(amount >= 1000) return (Math.round(amount/100)/10).toString().replace(/\.0$/,'') + 'K ' + currency;
    return Math.round(amount) + ' ' + currency;
  }
  function parseZonesText(txt){
    try{ if(typeof window.parseDeliveryZones === 'function') return window.parseDeliveryZones(txt); }catch(e){}
    return String(txt || '').split(/\n|;/).map(function(row){
      row = row.trim(); if(!row) return null;
      var parts = row.split('|');
      return {name:String(parts[0] || 'Zone').trim(), hours:Math.max(1, Number(String(parts[1] || '2').replace(/[^0-9.]/g,'')) || 2)};
    }).filter(Boolean);
  }
  function zonesToText(zones){
    if(!Array.isArray(zones) || !zones.length) return 'Kampala centre | 2h\nMakindye / Kansanga | 4h\nEntebbe / Wakiso | 24h';
    return zones.map(function(z){ return String((z && (z.name || z.zone)) || 'Zone').trim() + ' | ' + Math.max(1, Number((z && (z.hours || z.delay)) || 2) || 2) + 'h'; }).join('\n');
  }
  function ensureCategory(){
    var sheet = document.querySelector('#productEditOverlay .productEditSheet');
    if(!sheet) return null;
    var cat = document.getElementById('prodEditCategory');
    if(!cat){
      cat = document.createElement('select');
      cat.id = 'prodEditCategory';
      cat.className = 'prodEditCategory';
      cat.setAttribute('aria-label','Catégorie produit');
      cat.innerHTML = '<option value="mode">Mode</option><option value="deco">Décoration</option><option value="support">Support</option><option value="cuisine">Cuisine</option>';
      var desc = document.getElementById('prodEditDesc');
      if(desc && desc.parentNode) desc.parentNode.insertBefore(cat, desc);
      else sheet.appendChild(cat);
    }
    return cat;
  }
  function ensureZones(){
    var sheet = document.querySelector('#productEditOverlay .productEditSheet');
    if(!sheet) return null;
    var zones = document.getElementById('prodEditZones');
    if(!zones){
      var btn = sheet.querySelector('button.btn');
      var wrap = document.createElement('div');
      wrap.innerHTML = '<div class="deliveryZonesHelp"><b>Zones de livraison</b><br>Une zone par ligne : <b>Nom zone | heures</b></div><textarea id="prodEditZones" placeholder="Kampala centre | 2h\nMakindye | 4h\nEntebbe | 24h"></textarea>';
      if(btn && btn.parentNode) btn.parentNode.insertBefore(wrap, btn);
      else sheet.appendChild(wrap);
      zones = document.getElementById('prodEditZones');
    }
    return zones;
  }
  function ensureEditor(){
    var overlay = document.getElementById('productEditOverlay');
    if(!overlay) return null;
    ensureCategory();
    ensureZones();
    var price = document.getElementById('prodEditPrice');
    if(price && !price.dataset.v123Digits){
      price.setAttribute('type','text');
      price.setAttribute('inputmode','numeric');
      price.setAttribute('autocomplete','off');
      price.addEventListener('input', function(){
        var c = cleanAmount(this.value);
        if(this.value !== c) this.value = c;
      });
      price.dataset.v123Digits = '1';
    }
    return overlay;
  }
  function currentCurrency(){
    var cur = document.getElementById('prodEditCurrency');
    var code = String((cur && cur.value) || '').toUpperCase();
    return /^[A-Z]{3}$/.test(code) ? code : 'UGX';
  }
  function setCurrency(code){
    code = String(code || 'UGX').toUpperCase();
    var cur = document.getElementById('prodEditCurrency');
    if(cur){
      try{
        var has = Array.prototype.some.call(cur.options, function(o){ return o.value === code; });
        if(!has) cur.insertAdjacentHTML('afterbegin','<option value="'+code+'">'+code+'</option>');
        cur.value = code;
      }catch(e){}
    }
    try{ if(typeof window.pickProductCurrency === 'function') window.pickProductCurrency(code); }catch(e){}
  }
  function setEditing(id){
    window.__happyadEditingProductId = normalizeId(id);
    try{ editingProductId = id; }catch(e){ window.editingProductId = id; }
  }
  function getEditing(){
    try{ if(typeof editingProductId !== 'undefined' && editingProductId != null) return editingProductId; }catch(e){}
    return window.__happyadEditingProductId || window.editingProductId;
  }
  function openVisibleOverlay(overlay){
    overlay.classList.add('show');
    overlay.style.display = 'flex';
    overlay.style.visibility = 'visible';
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'auto';
    document.body.classList.add('happyadProductEditOpen');
  }
  function closeOverlay(){
    var overlay = document.getElementById('productEditOverlay');
    if(overlay){
      overlay.classList.remove('show');
      overlay.style.display = '';
      overlay.style.visibility = '';
      overlay.style.opacity = '';
      overlay.style.pointerEvents = '';
    }
    document.body.classList.remove('happyadProductEditOpen');
  }
  function refreshAll(productId){
    var names = ['renderProducts','renderHomeSections','renderProfilePublications','renderVendorPublications','renderStats','renderMine','renderCart','renderSellerOrders','updatePublicPreviewRating','syncCartCount','updateDeliveryCounters'];
    names.forEach(function(fn){
      try{ if(typeof window[fn] === 'function') window[fn](); }
      catch(e){}
      try{ if(typeof eval(fn) === 'function') eval(fn)(); }
      catch(e){}
    });
    try{ if(document.querySelector('#detail.module.active') && typeof window.openDetail === 'function') window.openDetail(productId); }catch(e){}
    try{ if(typeof hydrateIcons === 'function') hydrateIcons(document); }catch(e){}
  }
  async function persist(p){
    try{
      if(window.HAPPYAD_SUPABASE_PRODUCTS && typeof window.HAPPYAD_SUPABASE_PRODUCTS.updateProduct === 'function'){
        await window.HAPPYAD_SUPABASE_PRODUCTS.updateProduct(p.id, {
          title:p.name || p.title || 'Produit boutique',
          description:p.desc || p.description || '',
          category:p.cat || p.category || 'mode',
          price_amount:Number(p.unitAmount || p.priceAmount || p.amount || 0) || 0,
          currency:String(p.currency || p.currencyCode || p.devise || 'UGX').toUpperCase()
        });
      }
    }catch(e){ console.warn('[HAPPYAD V123] Supabase update skipped', e); }
  }

  window.closeProductEditor = function(e){
    if(e && e.target && e.target.id && e.target.id !== 'productEditOverlay') return false;
    closeOverlay();
    return false;
  };

  window.openProductEditor = function(id){
    var p = byId(id);
    if(!p){ toastSafe('Produit introuvable'); return false; }
    var overlay = ensureEditor();
    if(!overlay){ toastSafe('Éditeur indisponible'); return false; }
    setEditing(p.id);
    var name = document.getElementById('prodEditName');
    var price = document.getElementById('prodEditPrice');
    var desc = document.getElementById('prodEditDesc');
    var cat = ensureCategory();
    var zones = ensureZones();
    if(name) name.value = p.name || p.title || '';
    if(price) price.value = parseAmount(p) ? String(parseAmount(p)) : '';
    if(cat) cat.value = String(p.cat || p.category || 'mode').toLowerCase();
    if(desc) desc.value = p.desc || p.description || '';
    if(zones) zones.value = zonesToText(p.deliveryZones || p.delivery_zones);
    setCurrency(parseCurrency(p));
    openVisibleOverlay(overlay);
    try{ if(typeof hydrateIcons === 'function') hydrateIcons(overlay); }catch(e){}
    setTimeout(function(){ try{ if(name) name.focus(); }catch(e){} }, 70);
    return false;
  };

  window.saveProductEdit = async function(){
    var p = byId(getEditing());
    if(!p){ toastSafe('Produit introuvable'); return false; }
    ensureEditor();
    var title = String((document.getElementById('prodEditName') || {}).value || '').trim();
    var amount = Number(cleanAmount((document.getElementById('prodEditPrice') || {}).value || '')) || 0;
    var category = String((document.getElementById('prodEditCategory') || {}).value || p.cat || p.category || 'mode').toLowerCase();
    var description = String((document.getElementById('prodEditDesc') || {}).value || '').trim();
    var currency = currentCurrency();
    if(!title){ toastSafe('Titre obligatoire'); return false; }
    if(!amount){ toastSafe('Montant obligatoire'); return false; }
    p.name = title; p.title = title;
    p.cat = category; p.category = category;
    p.desc = description; p.description = description;
    p.currency = currency; p.currencyCode = currency; p.devise = currency;
    p.unitAmount = amount; p.priceAmount = amount; p.amount = amount;
    p.priceText = formatMoney(amount, currency); p.price = p.priceText;
    var ztxt = String((document.getElementById('prodEditZones') || {}).value || '').trim();
    if(ztxt) p.deliveryZones = parseZonesText(ztxt);
    closeOverlay();
    refreshAll(p.id);
    toastSafe('Publication modifiée');
    persist(p);
    return false;
  };

  function bindEditButtons(root){
    root = root || document;
    var selectors = '#profile .ownerTools .edit, [data-edit-product="1"], #myList .rowActions .circleBtn:first-child';
    try{
      root.querySelectorAll(selectors).forEach(function(btn){
        btn.setAttribute('type','button');
        if(!btn.getAttribute('data-edit-product')) btn.setAttribute('data-edit-product','1');
        var p = productFromButton(btn);
        if(p && !btn.getAttribute('data-product-id')) btn.setAttribute('data-product-id', normalizeId(p.id));
      });
    }catch(e){}
  }
  document.addEventListener('click', function(ev){
    var target = ev.target;
    var btn = target && target.closest && target.closest('#profile .ownerTools .edit, [data-edit-product="1"], #myList .rowActions .circleBtn:first-child');
    if(!btn) return;
    var p = productFromButton(btn);
    if(!p) return;
    ev.preventDefault();
    ev.stopPropagation();
    if(ev.stopImmediatePropagation) ev.stopImmediatePropagation();
    window.openProductEditor(p.id);
  }, true);

  document.addEventListener('DOMContentLoaded', function(){ bindEditButtons(document); ensureEditor(); });
  setTimeout(function(){ bindEditButtons(document); ensureEditor(); }, 200);
  setTimeout(function(){ bindEditButtons(document); ensureEditor(); }, 1000);
  try{
    new MutationObserver(function(muts){
      muts.forEach(function(m){ if(m.addedNodes && m.addedNodes.length) bindEditButtons(document); });
    }).observe(document.documentElement, {childList:true, subtree:true});
  }catch(e){}
})();
