// Extracted from index.html. Keep load order.
function icon(name, cls='ico'){
  const common='fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  const paths={
    home:`<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10.5V21h14V10.5"/><path d="M9 21v-6h6v6"/>`,
    grid:`<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>`,
    user:`<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>`,
    stats:`<path d="M4 19V5"/><path d="M8 19v-7"/><path d="M13 19V8"/><path d="M18 19v-4"/>`,
    cart:`<path d="M6 6h15l-2 8H8L6 3H3"/><circle cx="9" cy="20" r="1.5" fill="currentColor" stroke="none"/><circle cx="18" cy="20" r="1.5" fill="currentColor" stroke="none"/>`,
    shop:`<path d="M4 10h16l-1-5H5l-1 5Z"/><path d="M6 10v10h12V10"/><path d="M9 20v-5h6v5"/>`,
    store:`<path d="M4 10h16l-1-5H5l-1 5Z"/><path d="M6 10v10h12V10"/><path d="M9 20v-5h6v5"/>`,
    eye:`<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>`,
    message:`<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/><path d="M8 9h8M8 13h5"/>`,
    star:`<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2 7.5 14 3 9.6l6.2-.9L12 3Z"/>`,
    pin:`<path d="M12 21s7-5.2 7-12a7 7 0 0 0-14 0c0 6.8 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/>`,
    doc:`<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/>`,
    edit:`<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>`,
    image:`<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8" cy="10" r="2"/><path d="m21 15-5-5L5 19"/>`,
    camera:`<path d="M4 7h3l2-3h6l2 3h3v13H4z"/><circle cx="12" cy="13" r="4"/>`,
    shield:`<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-5"/>`,
    trash:`<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 15H6L5 6"/><path d="M10 11v6M14 11v6"/>`,
    chevron:`<path d="m9 18 6-6-6-6"/>`,
    bag:`<path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/>`,
    heart:`<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/>`,
    play:`<polygon points="9 7 19 12 9 17 9 7" fill="currentColor" stroke="none"/>`,
    fullscreen:`<path d="M8 3H3v5"/><path d="M16 3h5v5"/><path d="M21 16v5h-5"/><path d="M3 16v5h5"/>`
  };
  return `<svg class="${cls}" viewBox="0 0 24 24" ${common}>${paths[name]||paths.bag}</svg>`;
}
function hydrateIcons(root=document){
  root.querySelectorAll('[data-ico]').forEach(el=>{ const n=el.getAttribute('data-ico'); if(!el.dataset.ready){ el.innerHTML=icon(n, el.classList.contains('iconBox')?'icoLg':'ico'); el.dataset.ready='1'; }});
  root.querySelectorAll('.navIcon').forEach(el=>{ if(!el.dataset.ready){ el.innerHTML=icon(el.dataset.ico,'ico'); el.dataset.ready='1'; }});
}

// La Boutique ne crée pas un badge séparé : elle lit le badge officiel du profil HAPPYAD.
const happyadProfiles={};
try{ window.happyadProfiles = happyadProfiles; }catch(e){}
function cleanSellerProfileValue(v){return String(v==null?'':v).trim();}
function sellerProfileKey(v){return cleanSellerProfileValue(v).toLowerCase().replace(/^@+/,'');}
function firstSellerProfileValue(obj, keys){
  obj=obj||{};
  for(const k of keys){ const v=cleanSellerProfileValue(obj[k]); if(v) return v; }
  return '';
}
function normalizeHappyadSellerProfile(profile, fallbackName){
  profile=profile||{};
  const id=firstSellerProfileValue(profile,['id','user_id','uid','auth_id','seller_id','owner_id','creator_id']);
  const displayName=firstSellerProfileValue(profile,['displayName','display_name','full_name','name','seller_name','sellerName','seller','vendor_name','username','handle']) || cleanSellerProfileValue(fallbackName) || 'Vendeur HAPPYAD';
  const username=firstSellerProfileValue(profile,['username','handle','seller_username','sellerHandle','seller_handle']);
  const avatar=firstSellerProfileValue(profile,['avatar','avatar_url','photo','photo_url','profile_photo','picture','image','userAvatar','user_avatar','sellerAvatar','seller_avatar']);
  const badge=firstSellerProfileValue(profile,['badge','user_badge','badge_type','certification','certified','is_verified','verified','blue_badge','verifyBadge','verified_badge','role_badge','profile_badge','sellerBadge','seller_badge']);
  return Object.assign({}, profile, {id:id||profile.id, user_id:id||profile.user_id, displayName:displayName, full_name:displayName, name:displayName, username:username, handle:username, avatar:avatar, avatar_url:avatar, badge:badge||'none'});
}
function rememberHappyadSellerProfile(profile, product){
  const p=product||{};
  const prof=normalizeHappyadSellerProfile(profile, p.seller || p.seller_name || p.vendor_name || '');
  const keys=[prof.id, prof.user_id, prof.displayName, prof.full_name, prof.name, prof.username, prof.handle, p.seller, p.seller_name, p.seller_id, p.user_id, p.owner_id, p.creator_id].map(cleanSellerProfileValue).filter(Boolean);
  keys.forEach(function(k){
    happyadProfiles[k]=prof;
    const lk=sellerProfileKey(k);
    if(lk) happyadProfiles[lk]=prof;
  });
  try{ window.happyadProfiles = happyadProfiles; }catch(e){}
  return prof;
}
try{ window.rememberHappyadSellerProfile = rememberHappyadSellerProfile; }catch(e){}
function sellerProfile(ref){
  if(ref && typeof ref==='object') return rememberHappyadSellerProfile(ref, ref);
  const raw=cleanSellerProfileValue(ref);
  const key=sellerProfileKey(raw);
  return happyadProfiles[raw] || happyadProfiles[key] || {displayName:raw||'Vendeur HAPPYAD',badge:'none'};
}
function realHappyadBadgeClass(v){
  v=String(v||'').toLowerCase().trim();
  if(!v||v==='aucun'||v==='none'||v==='false'||v==='0'||v==='null'||v==='undefined')return '';
  if(v.indexOf('bleu')>=0||v.indexOf('blue')>=0||v.indexOf('verify')>=0||v.indexOf('cert')>=0||v==='true'||v==='1')return 'blue';
  if(v.indexOf('violet')>=0||v.indexOf('purple')>=0)return 'violet';
  if(v.indexOf('jaune')>=0||v.indexOf('yellow')>=0||v.indexOf('business')>=0||v.indexOf('premium')>=0)return 'yellow';
  return 'blue';
}
function badgeSvg(name, cls='sellerBadge') {
  const prof=sellerProfile(name);
  const c=realHappyadBadgeClass(prof.badge);
  if(!c) return '';
  return `<span class="${cls} happyBadgeMark ${c}" title="Badge HAPPYAD officiel" data-happyad-badge="${String(prof.badge||'').replace(/"/g,'&quot;')}"></span>`;
}
function sellerLineHTML(seller, rate='', withAvatar=true) {
  const prof=sellerProfile(seller);
  // V127: vendeur préchargé depuis Supabase/cache pour afficher nom + badge immédiatement sur autre téléphone.
  const rating = rate ? `<span class="sellerRating">★ ${rate}</span>` : '';
  return `<span class="sellerMetaName"><span class="sellerText">${htmlEscape(prof.displayName)}</span>${badgeSvg(seller)}</span>${rating}`;
}
function sellerAvatarHTML(seller, cls='avatar'){
  const prof=sellerProfile(seller);
  const av=cleanSellerProfileValue(prof.avatar || prof.avatar_url || prof.seller_avatar);
  const name=cleanSellerProfileValue(prof.displayName || seller || 'Vendeur HAPPYAD');
  if(av){
    return `<div class="${cls} hasRealAvatar"><img src="${htmlEscape(av)}" alt="${htmlEscape(name)}"></div>`;
  }
  return `<div class="${cls}">${htmlEscape(name.slice(0,1).toUpperCase() || 'V')}</div>`;
}

const products=[];
let cat='all',cart=[];
let currentScreen='home';
let navStack=[];
let globalCartEnabled=true;
const productCartEnabled={};

// HAPPYAD FIX BOUTIQUE PERFORMANCE — une seule source d'état pour éviter les petits conflits
(function exposeBoutiqueState(){
  function expose(name, getValue, setValue){
    try{
      var d=Object.getOwnPropertyDescriptor(window,name);
      if(d && d.__happyadStateBridge) return;
      Object.defineProperty(window,name,{
        configurable:true,
        enumerable:false,
        get:getValue,
        set:setValue || function(){}
      });
      try{ Object.getOwnPropertyDescriptor(window,name).__happyadStateBridge=true; }catch(e){}
    }catch(e){ try{ window[name]=getValue(); }catch(_){} }
  }
  expose('products', function(){return products;}, function(v){ if(Array.isArray(v)){ products.splice.apply(products,[0,products.length].concat(v)); } });
  expose('cart', function(){return cart;}, function(v){ cart=Array.isArray(v)?v:[]; });
  expose('productCartEnabled', function(){return productCartEnabled;});
  expose('globalCartEnabled', function(){return globalCartEnabled;}, function(v){ globalCartEnabled=!!v; });
  expose('currentScreen', function(){return currentScreen;}, function(v){ currentScreen=String(v||'home'); });
})();
const userHasBoutiqueAccount=true; // false = acheteur sans compte boutique : pas de menu flottant, panier uniquement
const userIsValidatedSeller=true; // false = publication HAPPYAD normale : aucun bouton prix / panier vendeur
function jsArg(v){return JSON.stringify(String(v));}
function htmlEscape(v){
  return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]});
}
function textToHtml(v){
  return htmlEscape(v).replace(/\n/g,'<br>');
}
function productRealDescription(p){
  p=p||{};
  const raw=String(p.desc || p.description || p.product_description || p.long_description || p.caption || p.details || '').trim();
  return raw || 'Aucune description.';
}
function productDescriptionHtml(p){
  const raw=productRealDescription(p);
  if(raw.length<=170){
    return textToHtml(raw);
  }
  let first=raw.slice(0,170);
  const cut=first.lastIndexOf(' ');
  if(cut>90) first=raw.slice(0,cut);
  const more=raw.slice(first.length);
  return textToHtml(first)+'<span class="moreText">'+textToHtml(more)+'</span><br><button class="seeDesc" onclick="toggleDesc()">Voir plus</button>';
}
function toggleSearch(force){const p=document.getElementById('searchPanel');p.classList.toggle('open', force===undefined ? !p.classList.contains('open') : !!force); if(p.classList.contains('open')) setTimeout(()=>document.getElementById('q')?.focus(),60)}
function toggleCats(){document.getElementById('cats')?.classList.toggle('catsCollapsed')}
function card(p, owner=false){
  const pid=jsArg(p.id);
  const enabled = globalCartEnabled && productCartEnabled[p.id] !== false;
  const offClass = enabled ? '' : ' cartOffCard';
  const ownerToggle = owner ? `<button class="miniSwitchBtn ${productCartEnabled[p.id]===false?'off':''}" onclick="event.stopPropagation();toggleProductCart(${pid})">${icon('cart','icoMini')} ${productCartEnabled[p.id]===false?'Panier OFF':'Panier ON'}</button>` : '';
  const cartBtn = enabled
    ? `<button class="btn white" style="width:100%;height:46px;margin-top:12px" onclick="event.stopPropagation();addCart(${pid})">${icon('cart','icoMini')} Panier</button>`
    : `<button class="btn dark" style="width:100%;height:46px;margin-top:12px" onclick="event.stopPropagation();toast('Panier désactivé par le vendeur')">${icon('cart','icoMini')} Panier désactivé</button><div class="cartOffMsg">Désactivé temporairement : rupture stock ou changement prix.</div>`;
  return `<article class="product${offClass} ${enabled?'':'disabledCart'}" data-product-id="${htmlEscape(p.id)}" data-product-name="${htmlEscape(p.name)}" onclick="openDetail(${pid})"><div class="pic"><span class="tag">${p.tag}</span><button class="heart" onclick="event.stopPropagation();this.classList.toggle('liked')">${icon('heart','ico')}</button><div class="bag">${icon('bag','icoLg')}</div><span class="stockBadge ${enabled?'':'off'}">${enabled?'Disponible':'Panier OFF'}</span></div><div class="pbody"><div class="cat">${p.cat}</div><div class="name">${p.name}</div><div class="sellerMini">${sellerLineHTML(p.seller,p.rate,true)}</div><div class="price">${p.price}</div>${ownerToggle}${cartBtn}</div></article>`
}
function syncCartSwitchUI(){
  const sw=document.getElementById('globalCartSwitch');
  const t=document.getElementById('globalCartTitle');
  const sub=document.getElementById('globalCartSub');
  if(sw) sw.classList.toggle('off', !globalCartEnabled);
  if(t) t.textContent = globalCartEnabled ? 'Panier global actif' : 'Panier global désactivé';
  if(sub) sub.textContent = globalCartEnabled ? 'Si tu désactives ici, tous les boutons panier de tes produits seront fermés temporairement.' : 'Tous les produits sont fermés temporairement. Les acheteurs verront “panier désactivé”.';
}
function toggleGlobalCart(){
  globalCartEnabled=!globalCartEnabled;
  syncCartSwitchUI();
  renderProducts();renderProfilePublications();renderVendorPublications();
  toast(globalCartEnabled?'Tous les paniers sont actifs':'Tous les paniers sont désactivés');
}
function toggleProductCart(id){
  productCartEnabled[id]=!productCartEnabled[id];
  renderProducts();renderProfilePublications();renderVendorPublications();
  const p=products.find(x=>String(x.id)===String(id));
  toast((productCartEnabled[id]?'Panier activé : ':'Panier désactivé : ')+(p?p.name:''));
}
function marketCategories(){return [{key:'all',title:'Pour toi'},{key:'mode',title:'Mode'},{key:'support',title:'Support'},{key:'deco',title:'Décoration'},{key:'cuisine',title:'Cuisine'}]}
function catList(key){return products.filter(p=>key==='all'||p.cat===key)}
function renderProducts(){
  const q=(document.getElementById('q')?.value||'').toLowerCase();
  const home=document.getElementById('home');
  const list=products.filter(p=>(cat==='all'||p.cat===cat)&&(`${p.name} ${p.seller} ${p.cat}`.toLowerCase().includes(q)));
  document.getElementById('count').textContent=list.length+' article'+(list.length>1?'s':'');
  document.getElementById('catalog').innerHTML=list.map(card).join('');
  home?.classList.toggle('searching', !!q);
  renderHomeSections();
  hydrateIcons(document.getElementById('home'));
}
function renderHomeSections(){
  const box=document.getElementById('homeSections'); if(!box) return;
  box.innerHTML=marketCategories().map(c=>{
    const list=catList(c.key);
    if(!list.length) return '';
    return `<section class="homeSection"><div class="homeSectionHead"><h3>${c.title}</h3><button class="seeMore" onclick="openCategoryView('${c.key}')">Voir plus ${icon('chevron','icoMini')}</button></div><div class="rail">${list.slice(0,6).map(p=>card(p)).join('')}</div></section>`;
  }).join('');
}
function openCategoryView(key){
  const c=marketCategories().find(x=>x.key===key)||marketCategories()[0];
  const list=catList(key);
  document.getElementById('categoryBox').innerHTML=`<div class="categoryViewTop"><div><h2>${c.title}</h2><span>Catégorie</span></div><button class="inlineBack" onclick="show('home')">Retour</button></div><div class="grid">${list.map(p=>card(p)).join('')}</div>`;
  show('categoryView');
  hydrateIcons(document.getElementById('categoryBox'));
}
function toggleSortMenu(force){const m=document.getElementById('sortMenu'); if(!m) return; m.classList.toggle('open', force===undefined ? !m.classList.contains('open') : !!force); hydrateIcons(m)}
function priceNumber(p){return parseFloat(String(p.price).replace(/[^0-9.]/g,''))||0}
function applySort(type){
  if(type==='rating'){products.sort((a,b)=>parseFloat(b.rate)-parseFloat(a.rate));toast('Tri appliqué : meilleures étoiles')}
  if(type==='new'){products.sort((a,b)=>b.id-a.id);toast('Tri appliqué : nouveautés')}
  if(type==='priceLow'){products.sort((a,b)=>priceNumber(a)-priceNumber(b));toast('Tri appliqué : prix bas')}
  if(type==='priceHigh'){products.sort((a,b)=>priceNumber(b)-priceNumber(a));toast('Tri appliqué : prix haut')}
  if(type==='available'){products.sort((a,b)=>(isCartEnabled(b.id)?1:0)-(isCartEnabled(a.id)?1:0));toast('Tri appliqué : disponibles')}
  toggleSortMenu(false);renderProducts();renderProfilePublications();renderVendorPublications();
}
function sortMarket(){applySort('rating')}
function refreshMarket(){const btn=document.getElementById('refreshMarketBtn');btn?.classList.add('spin');setTimeout(()=>btn?.classList.remove('spin'),600);products.push(products.shift());renderProducts();toast('Marché actualisé')}
function selectCategory(key, btn){
  activateChip(btn);
  cat=key;
  toggleCats();
  if(key==='all'){renderProducts();show('home');toast('Toutes les catégories');return;}
  openCategoryView(key);
}
function activateChip(b){b.parentElement.querySelectorAll('.chip,.catCard').forEach(x=>x.classList.remove('active'));b.classList.add('active')}
function setHeader(t,s){document.getElementById('screenTitle').innerHTML=t;document.getElementById('screenSub').textContent=s}
function show(id, opts={}){
  const fromBack=!!opts.fromBack;
  if(!fromBack && currentScreen && currentScreen!==id){
    if(navStack[navStack.length-1]!==currentScreen) navStack.push(currentScreen);
    if(navStack.length>12) navStack=navStack.slice(-12);
  }
  currentScreen=id;
  document.querySelectorAll('.module').forEach(m=>m.classList.toggle('active',m.id===id));
  const idx={home:0,messages:1,profile:2,cart:3};
  document.querySelectorAll('.nav').forEach(x=>x.classList.remove('active'));
  if(idx[id]!=null){document.querySelectorAll('.nav')[idx[id]].classList.add('active')}
  const titles={home:['HAPPYAD Boutique','Marché boutique'],messages:['Messages','Vos discussions'],products:['Mes produits','Dans mon profil'],profile:['Mon profil<br>boutique','Profil HAPPYAD connecté'],stats:['Stats boutique','Dans mon profil'],cart:['Panier','Commande et livraison'],sellerOrders:['Livraisons','Validation vendeur'],settings:['Paramètres','Paramètres boutique'],editProfile:['Modifier profil','Modification'],detail:['Détails produit','Informations boutique'],vendor:['Profil vendeur','Produits boutique du vendeur'],categoryView:['Produits','Catégorie boutique'],resolution:['Résolution','Problème commande']};
  setHeader(...titles[id]);
  document.getElementById('content').scrollTop=0;
  if(id==='products')renderMine();
  if(id==='stats')renderStats();
  if(id==='cart')renderCart();if(id==='sellerOrders')renderSellerOrders();
  hydrateIcons();bindEditPreview();
}
function openDetail(id){
  const p=products.find(x=>String(x.id)===String(id));
  if(!p){toast('Produit introuvable');return;}
  window.activeDetailProduct=p; window.currentDetailProduct=p;
  window.activeMediaIndex=0; window.detailMediaIndex=0;
  const media=[
    {type:'photo',label:'Photo 1',orientation:'landscape'},
    {type:'photo',label:'Photo 2',orientation:'portrait'},
    {type:'photo',label:'Photo 3',orientation:'square'},
    {type:'photo',label:'Photo 4',orientation:'landscape'},
    {type:'video',label:'Vidéo',orientation:'portrait'}
  ];
  window.detailVideoPlaying=false;
  window.activeDetailMedia=media; window.detailMedia=media;
  const recos=products.filter(x=>x.id!==p.id).slice(0,5);
  const detailDescHtml=productDescriptionHtml(p);
  document.getElementById('detailBox').innerHTML=`
    <div class="detailPageCard detailMedia">
      <div class="bigPic" id="detailMainMedia" onclick="mainMediaTap()"></div>
      <div class="thumbRail" id="detailThumbs">
        ${media.map((m,i)=>`<button class="mediaThumb ${i===0?'active':''}" onclick="selectDetailMedia(${i})" aria-label="${m.label}">${m.type==='video'?icon('play','ico'):icon('image','ico')}<small>${i+1}</small></button>`).join('')}
      </div>
    </div>
    <div class="detailPageCard detailInfoCard">
      <div class="detailTopLine"><h2>${p.name}</h2><div class="orangePrice">${p.price}</div></div>
      <div class="sellerCompact" onclick="openVendor(${jsArg(p.seller)})">
        ${sellerAvatarHTML(p.seller)}
        <div style="flex:1;min-width:0"><b class="sellerLineName"><span class="v109SellerName">${htmlEscape(sellerProfile(p.seller).displayName)} </span>${badgeSvg(p.seller)}</b><div class="small">Voir boutique › · ★ ${p.rate}</div></div>
        <button class="btn dark" onclick="event.stopPropagation();openVendor(${jsArg(p.seller)})">Profil</button>
      </div>
      <div class="detailChips"><button class="detailChip ok" onclick="detailChipInfo('stock',this)">${icon('shield','icoMini')} Disponible</button><button class="detailChip" onclick="detailChipInfo('category',this)">${icon('grid','icoMini')} ${p.cat}</button><button class="detailChip" onclick="detailChipInfo('delivery',this)">${icon('cart','icoMini')} Livraison</button><button class="detailChip" onclick="detailChipInfo('location',this)">${icon('pin','icoMini')} Kampala</button></div>
      <div class="descBox collapsed" id="detailDesc"><b>Description</b><br>${detailDescHtml}</div>
      <div class="detailActionBar"><button class="btn" onclick="addCart(${jsArg(p.id)})">${icon('cart','icoMini')} Ajouter au panier</button><button class="btn dark" onclick="openProductSellerMessage(${jsArg(p.id)})">${icon('message','icoMini')} Message vendeur</button></div>
    </div>
    <div class="homeSection"><div class="homeSectionHead"><h3>Recommandations</h3><button class="seeMore" onclick="openCategoryView('all')">Voir plus ›</button></div><div class="recoRail">${recos.map(x=>card(x)).join('')}</div></div>`;
  show('detail');
  renderDetailMedia();
  hydrateIcons(document.getElementById('detailBox'));
}

function detailChipInfo(type, btn){
  document.querySelectorAll('.detailChip').forEach(x=>x.classList.remove('activeInfo'));
  btn?.classList.add('activeInfo');
  const messages={
    stock:'Produit disponible. Le panier peut être désactivé si le vendeur change le prix ou le stock.',
    category:'Catégorie du produit. Clique sur Voir plus pour explorer cette catégorie.',
    delivery:'Livraison à discuter avec le vendeur via HAPPYAD Messages.',
    location:'Localisation publique du vendeur : Kampala.'
  };
  toast(messages[type]||'Information produit');
}
function toggleDesc(){const d=document.getElementById('detailDesc'); if(!d) return; d.classList.toggle('collapsed'); const b=d.querySelector('.seeDesc'); if(b) b.textContent=d.classList.contains('collapsed')?'Voir plus':'Voir moins';}
function openVendor(seller){const list=products.filter(p=>p.seller===seller||String(p.seller_id||'')===String(seller||''));const shown=list.length?list:products;const sellerRef=(list[0]&&list[0].seller)||seller;document.getElementById('vendorBox').innerHTML=`<div class="vendorHero"><div class="vendorTop">${sellerAvatarHTML(sellerRef)}<div><h2 class="happyadName">${htmlEscape(sellerProfile(sellerRef).displayName)} ${badgeSvg(sellerRef,'happyadBadge')}</h2><div class="small">Profil HAPPYAD vendeur</div></div><span class="status" style="margin-left:auto"><i class="greenDot"></i>Actif</span></div><div class="stats sellerPublicStats"><div class="stat satisfactionStat"><b data-ico="star"></b><strong>0%</strong><span>Satisfaction</span></div><div class="stat productsStat"><b data-ico="shop"></b><strong>${shown.length}</strong><span>Produits</span></div><div class="stat noteStat"><b data-ico="star"></b><strong>0.0</strong><span>Note /5</span></div></div></div><div class="profileCard"><h3>À propos du vendeur</h3><p class="small">Produits, services et créations publiés depuis son compte HAPPYAD.</p></div><div class="freeHead"><h3>Publications boutique</h3><span>filtre ∨</span></div><div class="freeCats"><button class="chip active" onclick="vendorCat='all';activateChip(this);renderVendorPublications()">Tout</button><button class="chip" onclick="vendorCat='mode';activateChip(this);renderVendorPublications()">Mode</button><button class="chip" onclick="vendorCat='deco';activateChip(this);renderVendorPublications()">Décoration</button><button class="chip" onclick="vendorCat='support';activateChip(this);renderVendorPublications()">Support</button><button class="chip" onclick="vendorCat='cuisine';activateChip(this);renderVendorPublications()">Cuisine</button></div><div class="freeGrid" id="vendorPublications"></div>`;show('vendor');window.currentVendorProducts=shown;renderVendorPublications();hydrateIcons(document.getElementById('vendorBox'))}

function renderDetailMedia(){
  const p=window.activeDetailProduct; const media=window.activeDetailMedia||[]; const m=media[window.activeMediaIndex||0];
  const box=document.getElementById('detailMainMedia'); if(!box||!p||!m) return;
  const orientation=m.orientation||'landscape';
  const playClass=window.detailVideoPlaying?' playing':'';
  const mediaIcon=m.type==='video'?icon(window.detailVideoPlaying?'play':'play','icoLg'):icon('bag','icoLg');
  const playState=m.type==='video' ? `<div class="playState">${icon(window.detailVideoPlaying?'play':'play','icoMini')} <span>${window.detailVideoPlaying?'Lecture vidéo':'Toucher pour lire'}</span><div class="playBar"><i style="width:${window.detailVideoPlaying?'44':'0'}%"></i></div></div>` : '';
  box.innerHTML=`<button class="fullBtn" onclick="event.stopPropagation();openMediaViewer(true)" aria-label="Plein écran">${icon('fullscreen','icoMini')}</button><span class="tag">${m.type==='video'?'Vidéo':p.tag}</span><button class="heart" onclick="event.stopPropagation();this.classList.toggle('liked');toast(this.classList.contains('liked')?'Ajouté aux favoris':'Retiré des favoris')">${icon('heart','ico')}</button><div class="detailVisual ${m.type} ${orientation}${playClass}"><div class="mediaShape">${mediaIcon}</div></div>${playState}<div class="mediaHint">${m.type==='video'?'Vidéo au format publié : '+orientation:'Toucher pour voir grand · format naturel'}</div>`;
  document.querySelectorAll('#detailThumbs .mediaThumb').forEach((b,k)=>{b.classList.toggle('active',k===(window.activeMediaIndex||0));b.classList.toggle('playing',m.type==='video'&&k===(window.activeMediaIndex||0)&&window.detailVideoPlaying)});
}
function mainMediaTap(){
  const media=window.activeDetailMedia||[]; const m=media[window.activeMediaIndex||0]; if(!m) return;
  if(m.type==='video'){ toggleDetailVideo(); return; }
  openMediaViewer(false);
}
function toggleDetailVideo(){
  const media=window.activeDetailMedia||[]; const m=media[window.activeMediaIndex||0];
  if(!m || m.type!=='video'){openMediaViewer(false);return;}
  window.detailVideoPlaying=!window.detailVideoPlaying;
  renderDetailMedia();
  toast(window.detailVideoPlaying?'Vidéo en lecture selon son format publié':'Vidéo en pause');
}
function selectDetailMedia(i){
  window.activeMediaIndex=i; window.detailMediaIndex=i;
  window.detailVideoPlaying=false;
  renderDetailMedia();
  const media=window.activeDetailMedia||[]; const m=media[i];
  if(m?.type==='video') toast('Vidéo sélectionnée : toucher pour lire');
}
function viewerNext(step){
  const media=window.activeDetailMedia||[]; if(!media.length) return;
  window.activeMediaIndex=(window.activeMediaIndex+step+media.length)%media.length; window.detailMediaIndex=window.activeMediaIndex;
  window.detailVideoPlaying=false;
  renderDetailMedia();
  openMediaViewer(true);
}
function openMediaViewer(fromButton=false){
  const p=window.activeDetailProduct || window.currentDetailProduct;
  const media=window.activeDetailMedia || window.detailMedia || [];
  const idx=Number.isInteger(window.activeMediaIndex) ? window.activeMediaIndex : 0;
  if(!p || !media.length) return;
  const m=media[idx] || media[0];
  const isVideo=m.type==='video';
  const orientation=m.orientation || 'landscape';
  let viewer=document.getElementById('fullViewer');
  if(!viewer){
    viewer=document.createElement('div');
    viewer.id='fullViewer';
    viewer.className='fullViewer';
    viewer.addEventListener('click', (e)=>{ if(e.target===viewer) closeMediaViewer(); });
    document.body.appendChild(viewer);
  }
  const mediaLabel=isVideo?'Vidéo au format publié':'Photo au format naturel';
  const caption=`${p.name} · ${idx+1}/${media.length} <span>${mediaLabel} · ${orientation}</span>`;
  const thumbs=media.map((x,i)=>`<button class="viewerThumb ${i===idx?'active':''}" onclick="event.stopPropagation();selectDetailMedia(${i});openMediaViewer(true)" aria-label="Média ${i+1}">${icon(x.type==='video'?'play':'image','icoMini')}</button>`).join('');
  const playOverlay=isVideo?`<div class="viewerPlayBadge">${icon(window.detailVideoPlaying?'pause':'play','icoMini')} ${window.detailVideoPlaying?'Lecture':'Toucher pour lire'}</div><div class="viewerProgress"><i style="width:${window.detailVideoPlaying?'45':'0'}%"></i></div>`:'';
  function viewerEsc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  const mediaUrl=String(m.url||m.mediaUrl||m.image_url||m.video_url||m.publicUrl||m.src||'').trim();
  const mediaHtml=mediaUrl
    ? (isVideo
        ? `<video class="viewerRealMedia" src="${viewerEsc(mediaUrl)}" playsinline webkit-playsinline controls preload="metadata"></video>`
        : `<img class="viewerRealMedia" src="${viewerEsc(mediaUrl)}" alt="${viewerEsc(p.name||'Média boutique')}" loading="eager">`)
    : `<div class="mediaShape">${icon(isVideo?(window.detailVideoPlaying?'pause':'play'):'bag','icoLg')}</div>`;
  viewer.innerHTML=`<div class="fullViewerBox">
    <div class="fullViewerTop">
      <button class="viewerBtn" onclick="event.stopPropagation();closeMediaViewer()" aria-label="Fermer">×</button>
      <div class="fullViewerTitle"><b>${p.name}</b><span>${mediaLabel} · format conservé</span></div>
      <button class="viewerBtn" onclick="event.stopPropagation();viewerNext(1)" aria-label="Suivant">›</button>
      <button class="viewerBtn" onclick="event.stopPropagation();requestTrueFullscreen()" aria-label="Plein écran système">${icon('fullscreen','icoMini')}</button>
    </div>
    <div class="viewerMedia ${isVideo?'video':'photo'} ${orientation} ${isVideo&&window.detailVideoPlaying?'playing':''}" onclick="${isVideo?'':'viewerNext(1)'}">
      ${mediaHtml}${playOverlay}
    </div>
    <div class="fullViewerControls"><button class="viewerBtn" onclick="event.stopPropagation();viewerNext(-1)" aria-label="Précédent">‹</button><button class="viewerBtn" onclick="event.stopPropagation();viewerNext(1)" aria-label="Suivant">›</button></div>
    <div class="fullViewerBottom"><div class="viewerCaption">${caption}</div><div class="viewerThumbs">${thumbs}</div></div>
  </div>`;
  viewer.classList.add('show');
  document.body.style.overflow='hidden';
  if(fromButton && viewer.requestFullscreen && !document.fullscreenElement){ viewer.requestFullscreen().catch(()=>{}); }
}
function requestTrueFullscreen(){
  const viewer=document.getElementById('fullViewer');
  if(!viewer) return;
  if(document.fullscreenElement){ document.exitFullscreen?.(); return; }
  viewer.requestFullscreen?.().catch(()=>{});
}
function closeMediaViewer(){ const v=document.getElementById('fullViewer'); v?.classList.remove('show'); document.body.style.overflow=''; if(document.fullscreenElement===v){document.exitFullscreen?.().catch(()=>{});} }

function renderMine(){document.getElementById('myList').innerHTML=products.slice(0,4).map((p,i)=>{const pending=i===0;return `<div class="row"><div class="mini">${icon('bag','ico')}</div><div class="rowInfo"><b>${p.name}</b><span>${p.price}<br><span style="color:${pending?'#ffd2a6':'var(--green)'}">● ${pending?'Commande en attente':'En ligne'}</span></span><div class="priceLock sellerOnly">${pending?'Commande en attente':''}</div></div><div class="rowActions"><button class="circleBtn" type="button" data-product-id="${htmlEscape(p.id)}" data-edit-product="1" onclick="event.preventDefault();event.stopPropagation();return openProductEditor(${jsArg(p.id)})">${icon('edit','icoMini')}</button><button class="circleBtn" onclick="${pending?`toast('Suppression impossible : commande en attente')`:`requestAdminAction('delete','${p.name.replace(/'/g,"\'")}')`}">${icon('trash','icoMini')}</button></div></div>`}).join('')}

let statsPeriod='week', statsExpanded=false;
const statsData={
  week:{views:'0',clicks:'0',messages:'0',sales:'0',revenue:'0',growth:['','','',''],mult:1},
  month:{views:'0',clicks:'0',messages:'0',sales:'0',revenue:'0',growth:['','','',''],mult:1},
  year:{views:'0',clicks:'0',messages:'0',sales:'0',revenue:'0',growth:['','','',''],mult:1}
};
function selectStatsPeriod(period,btn){
  statsPeriod=period;
  document.querySelectorAll('.statsPeriod .periodBtn').forEach(b=>b.classList.remove('active'));
  btn?.classList.add('active');
  renderStats();
}
function statDashCard(label,value,trend,ico){
  return `<div class="dashCard" onclick="toast('${label} ouvert')"><div class="top"><span>${label}</span>${icon(ico,'icoMini')}</div><b>${value}</b><span class="up">${trend}</span></div>`;
}
function renderStats(){
  const d=statsData[statsPeriod]||statsData.week;
  const dash=document.getElementById('statsDash');
  if(dash){dash.innerHTML=[
    statDashCard('Revenu',d.revenue,d.growth[0],'stats'),
    statDashCard('Ventes',d.sales,d.growth[3],'cart'),
    statDashCard('Messages',d.messages,d.growth[2],'message'),
    statDashCard('Vues',d.views,d.growth[0],'eye')
  ].join('');}
  const list=statsExpanded?products:products.slice(0,4);
  const rows=document.getElementById('statRows');
  if(rows){rows.innerHTML=list.map((p,i)=>{
    const views=(550-i*70)*d.mult;
    const sales=Math.max(1,(12-i*2)*d.mult);
    const revenue=(sales*(i===0?120: i===1?100: i===2?35:45));
    const width=Math.max(22,88-i*9);
    return `<div class="statProductRow" onclick="openDetail(${p.id})"><div class="mini">${icon('bag','ico')}</div><div class="rowInfo"><b>${p.name}</b><div class="statMeta"><span>${views} vues</span><span>${sales} ventes</span><span class="statAmount">${revenue}K UGX</span></div><div class="bar"><i style="width:${width}%"></i></div></div><button class="miniStatBtn" onclick="event.stopPropagation();openDetail(${p.id})">${icon('chevron','icoMini')}</button></div>`
  }).join('');}
  const total=document.getElementById('statsTotalRevenue');
  if(total) total.textContent=d.revenue;
  hydrateIcons(document.getElementById('stats'));
}
function toggleAllStatsProducts(){statsExpanded=!statsExpanded; renderStats(); toast(statsExpanded?'Tous les produits affichés':'Liste réduite');}
function openRevenueDetails(){toast('Détails revenus : ventes, paiements et commandes');}
function refreshStats(){renderStats(); toast('Stats actualisées');}

function formatBoutiqueAmount(k){
  k=Number(k)||0;
  if(k>=1000){
    const m=k/1000;
    const text=(m%1===0?String(Math.round(m)):m.toFixed(1).replace(/\.0$/,''));
    return text+'M UGX';
  }
  return k+'K UGX';
}
function cartQty(){return cart.reduce((sum,item)=>sum+(item.qty||0),0)}
function syncCartCount(){document.getElementById('cartN').textContent=cartQty()}
function addCart(id){
  const p=products.find(x=>String(x.id)===String(id));
  if(!p){return}
  const existing=cart.find(item=>String(item.id)===String(id));
  if(existing){existing.qty+=1}else{cart.push({id:p.id, qty:1})}
  syncCartCount();
  if(currentScreen==='cart') renderCart();
  toast(existing?'Quantité ajoutée':'✓ ajouté au panier');
}
function decreaseCart(id){
  const item=cart.find(x=>String(x.id)===String(id));
  if(!item) return;
  item.qty-=1;
  if(item.qty<=0){cart=cart.filter(x=>String(x.id)!==String(id))}
  syncCartCount();
  renderCart();
}
function removeCart(id){
  cart=cart.filter(x=>String(x.id)!==String(id));
  syncCartCount();
  renderCart();
  toast('Produit retiré du panier');
}
function renderCart(){
  const cartItems=cart.map(item=>({product:products.find(p=>p.id===item.id), qty:item.qty})).filter(x=>x.product&&x.qty>0);
  const totalK=cartItems.reduce((sum,item)=>sum+(priceNumber(item.product)*item.qty),0);
  const totalText=formatBoutiqueAmount(totalK);
  document.getElementById('cartRows').innerHTML=cartItems.length?`<div class="orderStatus"><div class="statusIcon">${icon('shield','ico')}</div><div><b>Commande sécurisée</b><p>Votre paiement reste protégé jusqu’à la confirmation de réception.</p></div></div><div class="card">${cartItems.map(item=>{const p=item.product;return `<div class="row"><div class="mini">${icon('bag','ico')}</div><div class="rowInfo"><b>${p.name}</b><span><span class="cartSellerLine">${sellerProfile(p.seller).displayName} ${badgeSvg(p.seller)}</span><br>${p.price}</span><div class="small">Quantité : ${item.qty}</div></div><button class="circleBtn" onclick="event.stopPropagation();decreaseCart(${p.id})">−</button><b>${item.qty}</b><button class="circleBtn" onclick="event.stopPropagation();addCart(${p.id})">+</button><button class="circleBtn danger" onclick="event.stopPropagation();removeCart(${p.id})">${icon('trash','icoMini')}</button></div>`}).join('')}<div class="cartLine"><span>Sous-total</span><b>${totalText}</b></div><div class="cartLine"><span>Livraison</span><b>À confirmer</b></div><div class="cartLine"><span>Garantie</span><b>Active</b></div><div class="cartLine"><span>Total estimé</span><b class="total">${totalText}</b></div><div class="cartSteps"><div><span>1</span>Vous confirmez la commande.</div><div><span>2</span>Le vendeur prépare la livraison.</div><div><span>3</span>Vous confirmez la réception.</div></div><br><button class="btn" style="width:100%" onclick="show('messages')">${icon('message','icoMini')} Message vendeur</button><br><br><button class="btn" style="width:100%" onclick="toast('Commande validée')">Valider la commande</button></div>`:`<div class="orderStatus"><div class="statusIcon">${icon('shield','ico')}</div><div><b>Panier sécurisé</b><p>Ajoutez un produit au panier. Les commandes apparaissent seulement après paiement confirmé.</p></div></div><div class="card empty">Aucun article dans le panier.</div>`;
  hydrateIcons(document.getElementById('cartRows'));
}
function back(){
  const previous=navStack.pop();
  if(previous){show(previous,{fromBack:true});return;}
  if(currentScreen && currentScreen!=='home'){show('home',{fromBack:true});return;}

  /* V546: Boutique ne doit plus réactiver l'ancien retour rapide Profil
     ni faire history.back(). Le parent index.html décide de la vraie cible. */
  try{
    sessionStorage.removeItem('HAPPYAD_PROFILE_FAST_RETURN_V1');
    sessionStorage.removeItem('HAPPYAD_PROFILE_FAST_RETURN_ACTIVE_UNTIL');
  }catch(_s){}

  try{
    if(window.parent&&window.parent!==window){
      var p=window.parent;
      if(p&&typeof p.happyadReturnFromBoutiqueToMainProfileV503==='function'){
        if(p.happyadReturnFromBoutiqueToMainProfileV503({source:'01-profile-back-home-v550'}))return;
      }
      try{
        p.postMessage({type:'HAPPYAD_RETURN_FROM_BOUTIQUE_TO_MAIN_PROFILE_V503',source:'01-profile-back-home-v550'},'*');
        return;
      }catch(_m){}
    }
  }catch(_e){}

  try{location.replace('index.html');return;}catch(_r){}
  location.href='index.html';
}
let tt;function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('show'),1700)}

let profileCat='all', vendorCat='all', currentVendorProducts=products;
function requestAdminAction(type, productName){
  const cause=prompt((type==='edit'?'Cause de modification':'Cause de suppression')+' pour '+productName+' :');
  if(!cause || !cause.trim()){ toast('Cause obligatoire pour envoyer la demande'); return; }
  toast((type==='edit'?'Modification':'Suppression')+' envoyée pour validation');
}
let editingProductId=null;
function openProductEditor(id){
  const p=products.find(x=>x.id===id);
  if(!p) return;
  editingProductId=id;
  document.getElementById('prodEditName').value=p.name||'';
  document.getElementById('prodEditPrice').value=p.price||'';
  document.getElementById('prodEditCat').value=p.cat||'mode';
  document.getElementById('prodEditDesc').value=p.desc||'Produit élégant et durable. L’acheteur voit les détails essentiels, photos, livraison et conditions du vendeur.';
  document.getElementById('productEditOverlay').classList.add('show');
  hydrateIcons(document.getElementById('productEditOverlay'));
}
function closeProductEditor(e){
  if(e && e.target && e.target.id!=='productEditOverlay') return;
  document.getElementById('productEditOverlay')?.classList.remove('show');
}
function saveProductEdit(){
  const p=products.find(x=>x.id===editingProductId);
  if(!p) return;
  p.name=(document.getElementById('prodEditName').value||p.name).trim();
  p.price=(document.getElementById('prodEditPrice').value||p.price).trim();
  p.cat=document.getElementById('prodEditCat').value||p.cat;
  p.desc=(document.getElementById('prodEditDesc').value||'').trim();
  closeProductEditor();
  renderProducts();
  renderProfilePublications();
  renderStats();
  renderCart();
  toast('Publication modifiée');
}
function deleteMarketingOnly(productName){
  toast('Publication marketing supprimée dans HAPPYAD, produit conservé dans la boutique');
}

function getActiveSellerOrders(){
  return (boutiqueOrders||[]).filter(o=>!o.clientReceived);
}
function getActiveOrderQty(productId){
  return getActiveSellerOrders().filter(o=>o.productId===productId).reduce((s,o)=>s+(Number(o.qty)||1),0);
}
function getActiveOrderCount(){
  return getActiveSellerOrders().reduce((s,o)=>s+(Number(o.qty)||1),0);
}
function updateDeliveryCounters(){
  const total=getActiveOrderCount();
  const badge=document.getElementById('sellerDeliveryCount');
  if(badge){badge.textContent=total;badge.classList.toggle('show', total>0);}
  const screen=document.getElementById('sellerOrdersScreenCount');
  if(screen){screen.textContent= total>0 ? `${total} commande${total>1?'s':''} à traiter` : 'Aucune commande à traiter';}
}

function publicationCard(p, owner=false){
  let base=card(p, owner).replace('<article class="product','<article class="product pubCard');
  if(!owner) return base;
  const safeName=p.name.replace(/'/g,"\\'");
  const activeQty=getActiveOrderQty(p.id);
  const hasPendingOrder=activeQty>0;
  base = base.replace('<div class="pic">', `${hasPendingOrder?`<div class="productOrderBadge show">${icon('cart','icoMini')} ${activeQty}</div>`:''}<div class="pic">`);
  return base.replace('<div class="pbody">', `<div class="pbody"><div class="ownerTools ownerToolsVertical"><button type="button" class="edit" title="Modifier" aria-label="Modifier la publication" data-product-id="${htmlEscape(p.id)}" data-edit-product="1" onclick="event.preventDefault();event.stopPropagation();return openProductEditor(${jsArg(p.id)})">${icon('edit','icoMini')}</button><button class="delete" title="Supprimer" aria-label="Supprimer la publication" onclick="event.stopPropagation();${hasPendingOrder?`toast('Suppression impossible : commande en attente')`:`requestAdminAction('delete','${safeName}')`}">${icon('trash','icoMini')}</button></div>`);
}
function renderProfilePublications(){
  const list=products.filter(p=>profileCat==='all'||p.cat===profileCat);
  document.getElementById('profilePreview').innerHTML=list.map(p=>publicationCard(p,true)).join('');hydrateIcons(document.getElementById('profilePreview'));
}
function renderVendorPublications(){
  const list=(currentVendorProducts||products).filter(p=>vendorCat==='all'||p.cat===vendorCat);
  const box=document.getElementById('vendorPublications'); if(box) box.innerHTML=list.map(p=>publicationCard(p,false)).join('');hydrateIcons(box);
}
function renderPreviewStrip(){
  const strip=document.getElementById('profilePreviewStrip');
  if(strip) strip.innerHTML=products.slice(0,5).map(p=>`<div class="previewTile">${icon('bag','icoLg')}</div>`).join('')+`<div class="previewTile">+${products.length-5}<br><span class="small">Plus</span></div>`;
}


function bindEditPreview(){
  ['editShopName','editShopCity','editShopDesc'].forEach(id=>{
    const el=document.getElementById(id);
    if(el && !el.dataset.bound){
      el.addEventListener('input',()=>{
        const n=document.getElementById('editShopName')?.value || 'Nom boutique';
        const c=document.getElementById('editShopCity')?.value || 'Ville';
        const d=document.getElementById('editShopDesc')?.value || '';
        const pn=document.getElementById('previewShopName'); if(pn) pn.textContent=n;
        const pc=document.getElementById('previewShopCity'); if(pc) pc.textContent=c;
        const pd=document.getElementById('previewShopDesc'); if(pd) pd.textContent=d;
      });
      el.dataset.bound='1';
    }
  });
}
function submitProfileEdit(){
  toast('Modification envoyée pour validation');
  setTimeout(()=>show('profile'),700);
}

function applyBoutiqueAccess(){
  const app=document.querySelector('.app');
  app.classList.toggle('buyerOnly', !userHasBoutiqueAccount);
  app.classList.toggle('notSeller', !userIsValidatedSeller);
  if(!userHasBoutiqueAccount){
    document.querySelectorAll('.nav').forEach(n=>n.style.display='none');
    const cartNav=[...document.querySelectorAll('.nav')].find(n=>n.getAttribute('onclick')==="show('cart')");
    if(cartNav){cartNav.style.display='block';cartNav.style.gridColumn='1 / -1';}
  }
}
applyBoutiqueAccess();syncCartSwitchUI();renderProducts();renderPreviewStrip();renderProfilePublications();renderMine();renderStats();renderCart();updateDeliveryCounters();hydrateIcons();



/* v33 pont visible vers le chat de revendication */
if(typeof window.openResolutionChat==='function'){
  window.openResolution=function(orderId, role){
    const reason = role==='seller' ? 'Difficulté livraison' : 'Je n’ai pas reçu';
    return window.openResolutionChat(orderId, role || 'client', reason);
  };
}
