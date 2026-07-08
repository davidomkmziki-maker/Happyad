// Extracted from index.html. Keep load order.
(function(){
  if(window.__happyadV58RatingEngine)return;
  window.__happyadV58RatingEngine=true;
  function esc(v){return String(v==null?'':v).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function clamp(n,min,max){n=Number(n);if(!Number.isFinite(n))n=0;return Math.max(min,Math.min(max,n))}
  function avgRound(n){n=clamp(n,0,5);return Math.round(n*10)/10}
  function fmt(n){return avgRound(n).toFixed(1)}
  function displayRate(v){return String(v==null?'':v).replace('.',',')}
  function pct(n){return Math.round(clamp(n,0,5)*20)}
  function orderDone(o){return !!(o&&(o.clientReceived||o.status==='completed'||o.status==='released'||o.fundsReleased||o.payoutAt||o.rating))}
  function allProducts(){try{return (typeof products!=='undefined'&&Array.isArray(products))?products:[]}catch(e){return []}}
  function allOrders(){try{return (typeof boutiqueOrders!=='undefined'&&Array.isArray(boutiqueOrders))?boutiqueOrders:(Array.isArray(window.boutiqueOrders)?window.boutiqueOrders:[])}catch(e){return []}}
  function baseRate(p){
    if(!p)return 0;
    if(p.__happyadBaseRate==null){p.__happyadBaseRate=Number(parseFloat(p.rate)||0)}
    return clamp(p.__happyadBaseRate||0,0,5);
  }
  function productFromOrder(o){
    var list=allProducts();
    if(!o)return null;
    return list.find(function(p){return String(p.id)===String(o.productId)})||list.find(function(p){return String(p.name)===String(o.product)})||null;
  }
  function orderMatchesProduct(o,p){
    if(!o||!p)return false;
    return String(o.productId)===String(p.id)||String(o.product)===String(p.name);
  }
  function orderSeller(o){
    if(!o)return '';
    if(o.seller)return String(o.seller);
    var p=productFromOrder(o);
    return p?String(p.seller||''):'';
  }
  function ratedOrdersForProduct(p){
    return allOrders().filter(function(o){return orderMatchesProduct(o,p)&&o.rating&&orderDone(o)});
  }
  function ratedOrdersForSeller(seller){
    seller=String(seller||'');
    return allOrders().filter(function(o){return o.rating&&orderDone(o)&&String(orderSeller(o))===seller});
  }
  function productsForSeller(seller){
    seller=String(seller||'');
    return allProducts().filter(function(p){return String(p.seller||'')===seller});
  }
  function productRating(p){
    if(!p)return {avg:'0.0',number:0,percent:0,count:0,base:true};
    var ratings=ratedOrdersForProduct(p).map(function(o){return clamp(o.rating,1,5)});
    if(ratings.length){
      var a=ratings.reduce(function(s,n){return s+n},0)/ratings.length;
      return {avg:fmt(a),number:avgRound(a),percent:pct(a),count:ratings.length,base:false};
    }
    var b=baseRate(p)||0;
    return {avg:fmt(b),number:avgRound(b),percent:pct(b),count:0,base:true};
  }
  function sellerRating(seller){
    var rated=ratedOrdersForSeller(seller).map(function(o){return clamp(o.rating,1,5)});
    var sellerProducts=productsForSeller(seller);
    if(rated.length){
      var a=rated.reduce(function(s,n){return s+n},0)/rated.length;
      return {avg:fmt(a),number:avgRound(a),percent:pct(a),reviews:rated.length,products:sellerProducts.length,base:false};
    }
    var bases=sellerProducts.map(baseRate).filter(function(n){return n>0});
    var fallback=bases.length?bases.reduce(function(s,n){return s+n},0)/bases.length:0;
    return {avg:fmt(fallback),number:avgRound(fallback),percent:pct(fallback),reviews:0,products:sellerProducts.length,base:true};
  }
  function ordersForSeller(seller){return allOrders().filter(function(o){return String(orderSeller(o))===String(seller||'')})}
  function syncProductRatings(){
    allProducts().forEach(function(p){
      var r=productRating(p);
      p.rate=r.avg;
      p.ratingPercent=r.percent;
      p.ratingCount=r.count;
      p.ratingIsBase=!!r.base;
    });
  }
  function currentProfileSeller(){
    var line=document.querySelector('#profile .publicCard .ratingLine');
    if(line){
      var spans=Array.prototype.slice.call(line.querySelectorAll('span'));
      var s=spans.find(function(x){var t=(x.textContent||'').trim();return t&&!/\d/.test(t)&&!/%|\//.test(t)});
      if(s&&s.textContent.trim())return s.textContent.trim();
    }
    var ps=allProducts();
    return ps[0]?ps[0].seller:'';
  }
  function ratingLabelForProduct(p){
    var r=productRating(p);
    return displayRate(r.avg);
  }
  function updatePublicPreviewRating(){
    syncProductRatings();
    var seller=currentProfileSeller();
    var r=sellerRating(seller);
    var sellerOrders=ordersForSeller(seller);
    document.querySelectorAll('#profile .publicCard .ratingLine').forEach(function(line){
      var spans=Array.prototype.slice.call(line.querySelectorAll('span'));
      var name=spans.find(function(x){var t=(x.textContent||'').trim();return t&&!/\d/.test(t)&&!/%|\//.test(t)});
      var note=spans.find(function(x){return /\d+(\.\d+)?\s*\/\s*5/.test(x.textContent||'')});
      var percent=spans.find(function(x){return /\d+%/.test(x.textContent||'')});
      if(name)name.textContent=seller||name.textContent;
      if(note)note.textContent=r.avg+' / 5';
      if(percent)percent.textContent=r.percent+'%';
      var bar=line.querySelector('.ratingBar i');if(bar)bar.style.width=r.percent+'%';
    });
    document.querySelectorAll('#profile .publicCard').forEach(function(card){
      var info=Array.prototype.slice.call(card.children).find(function(el){return el.tagName==='DIV' && /Produits|Commandes|Satisfaction/.test(el.textContent||'') && !el.classList.contains('publicCardTop') && !el.classList.contains('ratingLine')});
      if(info)info.textContent=(r.products||0)+' Produit'+((r.products||0)>1?'s':'')+' • '+sellerOrders.length+' Commande'+(sellerOrders.length>1?'s':'')+' • '+r.percent+'% Satisfaction';
    });
    var stats=document.querySelectorAll('#profile .svgStats .stat');
    stats.forEach(function(st){
      var label=(st.querySelector('span')?.textContent||'').toLowerCase();
      if(label.includes('note')){var strong=st.querySelector('strong');if(strong)strong.textContent=r.avg;}
      if(label.includes('produit')){var strong2=st.querySelector('strong');if(strong2)strong2.textContent=r.products||0;}
    });
    try{ if(window.HAPPYAD_SYNC_PROFILE_TOP_STATS_V128) window.HAPPYAD_SYNC_PROFILE_TOP_STATS_V128(); }catch(e){}
    return r;
  }
  function productCard(p, owner){
    syncProductRatings();
    var enabled=(typeof globalCartEnabled==='undefined'||globalCartEnabled) && (!window.productCartEnabled?true:productCartEnabled[p.id]!==false);
    try{enabled=globalCartEnabled && productCartEnabled[p.id]!==false}catch(e){}
    var offClass=enabled?'':' cartOffCard';
    var ownerToggle=owner?'<button class="miniSwitchBtn '+((typeof productCartEnabled!=='undefined'&&productCartEnabled[p.id]===false)?'off':'')+'" onclick="event.stopPropagation();toggleProductCart('+p.id+')">'+icon('cart','icoMini')+' '+((typeof productCartEnabled!=='undefined'&&productCartEnabled[p.id]===false)?'Panier OFF':'Panier ON')+'</button>':'';
    var cartBtn=enabled?'<button class="btn white" style="width:100%;height:46px;margin-top:12px" onclick="event.stopPropagation();addCart('+p.id+')">'+icon('cart','icoMini')+' Panier</button>':'<button class="btn dark" style="width:100%;height:46px;margin-top:12px" onclick="event.stopPropagation();toast(\'Panier désactivé par le vendeur\')">'+icon('cart','icoMini')+' Panier désactivé</button><div class="cartOffMsg">Désactivé temporairement : rupture stock ou changement prix.</div>';
    var r=productRating(p);
    var shortRate=displayRate(r.avg);
    var sellerHtml=(typeof sellerLineHTML==='function')?sellerLineHTML(p.seller,shortRate,true):'<span>'+esc(p.seller)+'</span> <span class="sellerRating">★ '+shortRate+'</span>';
    var title=r.count?('Note calculée sur '+r.count+' avis client'):'Note actuelle du produit';
    return '<article class="product'+offClass+' '+(enabled?'':'disabledCart')+'" onclick="openDetail('+p.id+')"><div class="pic"><span class="tag">'+esc(p.tag)+'</span><button class="heart" onclick="event.stopPropagation();this.classList.toggle(\'liked\')">'+icon('heart','ico')+'</button><div class="bag">'+icon('bag','icoLg')+'</div><span class="stockBadge '+(enabled?'':'off')+'">'+(enabled?'Disponible':'Panier OFF')+'</span></div><div class="pbody"><div class="cat">'+esc(p.cat)+'</div><div class="name">'+esc(p.name)+'</div><div class="sellerMini" title="'+esc(title)+'">'+sellerHtml+'</div><div class="price">'+esc(p.price)+'</div>'+ownerToggle+cartBtn+'</div></article>';
  }
  try{card=productCard;window.card=productCard}catch(e){window.card=productCard}
  if(typeof renderProducts==='function'){
    renderProducts=function(){
      syncProductRatings();
      var q=(document.getElementById('q')?.value||'').toLowerCase();
      var home=document.getElementById('home');
      var list=allProducts().filter(function(p){return (typeof cat==='undefined'||cat==='all'||p.cat===cat)&&((p.name+' '+p.seller+' '+p.cat).toLowerCase().includes(q))});
      var count=document.getElementById('count');if(count)count.textContent=list.length+' article'+(list.length>1?'s':'');
      var catalog=document.getElementById('catalog');if(catalog)catalog.innerHTML=list.map(function(p){return productCard(p,false)}).join('');
      if(home)home.classList.toggle('searching',!!q);
      try{renderHomeSections()}catch(e){}
      try{hydrateIcons(document.getElementById('home'))}catch(e){}
      try{updatePublicPreviewRating()}catch(e){}
    };
    window.renderProducts=renderProducts;
  }
  if(typeof renderHomeSections==='function'){
    renderHomeSections=function(){
      syncProductRatings();
      var box=document.getElementById('homeSections');if(!box)return;
      var cats=(typeof marketCategories==='function')?marketCategories():[{key:'all',title:'Pour toi'}];
      box.innerHTML=cats.map(function(c){
        var list=allProducts().filter(function(p){return c.key==='all'||p.cat===c.key});
        if(!list.length)return '';
        return '<section class="homeSection"><div class="homeSectionHead"><h3>'+esc(c.title)+'</h3><button class="seeMore" onclick="openCategoryView(\''+esc(c.key)+'\')">Voir plus '+icon('chevron','icoMini')+'</button></div><div class="rail">'+list.slice(0,6).map(function(p){return productCard(p,false)}).join('')+'</div></section>';
      }).join('');
    };
    window.renderHomeSections=renderHomeSections;
  }
  if(typeof renderProfilePublications==='function'){
    renderProfilePublications=function(){
      syncProductRatings();
      var list=allProducts().filter(function(p){return typeof profileCat==='undefined'||profileCat==='all'||p.cat===profileCat});
      var box=document.getElementById('profilePreview');if(box)box.innerHTML=list.map(function(p){return (typeof publicationCard==='function'?publicationCard(p,true):productCard(p,true))}).join('');
      try{hydrateIcons(box)}catch(e){}
      try{updatePublicPreviewRating()}catch(e){}
    };
    window.renderProfilePublications=renderProfilePublications;
  }
  if(typeof renderVendorPublications==='function'){
    renderVendorPublications=function(){
      syncProductRatings();
      var base=(window.currentVendorProducts||allProducts());
      var list=base.filter(function(p){return typeof vendorCat==='undefined'||vendorCat==='all'||p.cat===vendorCat});
      var box=document.getElementById('vendorPublications');if(box)box.innerHTML=list.map(function(p){return (typeof publicationCard==='function'?publicationCard(p,false):productCard(p,false))}).join('');
      try{hydrateIcons(box)}catch(e){}
    };
    window.renderVendorPublications=renderVendorPublications;
  }
  if(typeof openCategoryView==='function'){
    openCategoryView=function(key){
      syncProductRatings();
      var cats=(typeof marketCategories==='function')?marketCategories():[{key:'all',title:'Pour toi'}];
      var c=cats.find(function(x){return x.key===key})||cats[0];
      var list=allProducts().filter(function(p){return key==='all'||p.cat===key});
      var box=document.getElementById('categoryBox');if(box)box.innerHTML='<div class="categoryViewTop"><div><h2>'+esc(c.title)+'</h2><span>Catégorie</span></div><button class="inlineBack" onclick="show(\'home\')">Retour</button></div><div class="grid">'+list.map(function(p){return productCard(p,false)}).join('')+'</div>';
      try{show('categoryView')}catch(e){}
      try{hydrateIcons(box)}catch(e){}
    };
    window.openCategoryView=openCategoryView;
  }
  if(typeof openVendor==='function'){
    openVendor=function(seller){
      syncProductRatings();
      var list=allProducts().filter(function(p){return p.seller===seller});
      var shown=list.length?list:allProducts();
      var r=sellerRating(seller);
      var orderCount=ordersForSeller(seller).length;
      var box=document.getElementById('vendorBox');
      if(box)box.innerHTML='<div class="vendorHero"><div class="vendorTop"><div class="avatar">'+esc(String(seller||' ')[0])+'</div><div><h2 class="happyadName">'+esc((typeof sellerProfile==='function'?sellerProfile(seller).displayName:seller))+' '+(typeof badgeSvg==='function'?badgeSvg(seller,'happyadBadge'):'')+'</h2><div class="small">Profil HAPPYAD vendeur</div></div><span class="status" style="margin-left:auto"><i class="greenDot"></i>Actif</span></div><div class="stats sellerPublicStats"><div class="stat satisfactionStat"><b data-ico="star"></b><strong>'+r.percent+'%</strong><span>Satisfaction</span></div><div class="stat productsStat"><b data-ico="shop"></b><strong>'+shown.length+'</strong><span>Produits</span></div><div class="stat noteStat"><b data-ico="star"></b><strong>'+r.avg+'</strong><span>Note /5</span></div></div></div><div class="profileCard"><h3>À propos du vendeur</h3><p class="small">La note vendeur est calculée automatiquement avec les notes validées sur ses produits.</p></div><div class="freeHead"><h3>Publications boutique</h3><span>filtre ∨</span></div><div class="freeCats"><button class="chip active" onclick="vendorCat=\'all\';activateChip(this);renderVendorPublications()">Tout</button><button class="chip" onclick="vendorCat=\'mode\';activateChip(this);renderVendorPublications()">Mode</button><button class="chip" onclick="vendorCat=\'deco\';activateChip(this);renderVendorPublications()">Décoration</button><button class="chip" onclick="vendorCat=\'support\';activateChip(this);renderVendorPublications()">Support</button><button class="chip" onclick="vendorCat=\'cuisine\';activateChip(this);renderVendorPublications()">Cuisine</button></div><div class="freeGrid" id="vendorPublications"></div>';
      try{show('vendor')}catch(e){}
      window.currentVendorProducts=shown;
      try{renderVendorPublications()}catch(e){}
      try{hydrateIcons(box)}catch(e){}
    };
    window.openVendor=openVendor;
  }
  if(typeof applySort==='function'){
    applySort=function(type){
      syncProductRatings();
      var ps=allProducts();
      if(type==='rating'){ps.sort(function(a,b){return productRating(b).number-productRating(a).number});try{toast('Tri appliqué : meilleures étoiles')}catch(e){}}
      else if(type==='new'){ps.sort(function(a,b){return b.id-a.id});try{toast('Tri appliqué : nouveautés')}catch(e){}}
      else if(type==='priceLow'){ps.sort(function(a,b){return (typeof priceNumber==='function'?priceNumber(a):0)-(typeof priceNumber==='function'?priceNumber(b):0)});try{toast('Tri appliqué : prix bas')}catch(e){}}
      else if(type==='priceHigh'){ps.sort(function(a,b){return (typeof priceNumber==='function'?priceNumber(b):0)-(typeof priceNumber==='function'?priceNumber(a):0)});try{toast('Tri appliqué : prix haut')}catch(e){}}
      else if(type==='available'){ps.sort(function(a,b){return ((typeof isCartEnabled==='function'&&isCartEnabled(b.id))?1:0)-((typeof isCartEnabled==='function'&&isCartEnabled(a.id))?1:0)});try{toast('Tri appliqué : disponibles')}catch(e){}}
      try{toggleSortMenu(false)}catch(e){};try{renderProducts()}catch(e){};try{renderProfilePublications()}catch(e){};try{renderVendorPublications()}catch(e){};
    };
    window.applySort=applySort;
  }
  var oldRate=window.rateOrder;
  window.rateOrder=function(orderId,stars){
    var before=allOrders().map(function(o){return {o:o,r:o.rating}});
    if(typeof oldRate==='function')oldRate(orderId,stars);
    var changed=before.some(function(x){return x.o&&x.o.rating!==x.r})||allOrders().some(function(o){return String(o.id)===String(orderId)&&Number(o.rating)===Number(stars)});
    syncProductRatings();
    try{renderProducts()}catch(e){}
    try{renderProfilePublications()}catch(e){}
    try{renderVendorPublications()}catch(e){}
    try{updatePublicPreviewRating()}catch(e){}
    return changed;
  };
  var oldShowRating=window.showRatingPopupForOrder;
  window.showRatingPopupForOrder=function(id){
    var r=typeof oldShowRating==='function'?oldShowRating(id):undefined;
    setTimeout(function(){syncProductRatings();try{renderProducts()}catch(e){}try{renderProfilePublications()}catch(e){}try{renderVendorPublications()}catch(e){}try{updatePublicPreviewRating()}catch(e){}},250);
    return r;
  };
  window.getProductRatingV58=productRating;
  window.getSellerRatingV58=sellerRating;
  window.syncProductSellerRatingsV58=syncProductRatings;
  window.updatePublicPreviewRating=updatePublicPreviewRating;
  try{syncProductRatings();updatePublicPreviewRating()}catch(e){}
  setTimeout(function(){try{syncProductRatings();renderProducts();renderProfilePublications();updatePublicPreviewRating()}catch(e){}},80);
})();
