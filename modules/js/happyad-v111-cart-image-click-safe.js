// V111 SAFE — Panier : vraie image produit + clic produit ouvre détail + boutons UUID
(function(){
  if(window.__HAPPYAD_V111_CART_MEDIA_CLICK_SAFE__) return;
  window.__HAPPYAD_V111_CART_MEDIA_CLICK_SAFE__ = true;

  function clean(v){ return String(v==null?'':v).trim(); }
  function esc(v){ return clean(v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]}); }
  function toastSafe(msg){ try{ if(typeof toast==='function') toast(msg); }catch(e){} }

  function productsList(){
    try{ if(Array.isArray(products)) return products; }catch(e){}
    try{ if(Array.isArray(window.products)) return window.products; }catch(e){}
    return [];
  }
  function cartList(){
    try{ if(Array.isArray(cart)) return cart; }catch(e){}
    try{ if(Array.isArray(window.cart)) return window.cart; }catch(e){}
    return [];
  }
  function productById(id){
    return productsList().find(function(p){ return String(p && p.id) === String(id); }) || null;
  }
  function cartItems(){
    return cartList()
      .map(function(item){ return {raw:item, product:productById(item && item.id), qty:Number(item && item.qty)||0}; })
      .filter(function(x){ return x.product && x.qty>0; });
  }
  function firstMedia(p){
    p=p||{};
    const media = [];
    function push(x){
      if(!x) return;
      if(typeof x==='string') media.push({url:x,type:'photo'});
      else media.push(x);
    }
    push(p.homeMediaUrl);
    if(Array.isArray(p.homeMedia)) p.homeMedia.forEach(push);
    if(Array.isArray(p.media)) p.media.forEach(push);
    if(Array.isArray(p.boutiqueMedia)) p.boutiqueMedia.forEach(push);
    push(p.media_url); push(p.image_url); push(p.video_url); push(p.url); push(p.src);
    for(const m of media){
      const url = clean(m.url || m.media_url || m.image_url || m.video_url || m.src || m.path || m);
      if(url){
        const type = clean(m.type || m.media_type || m.kind).toLowerCase()==='video' ? 'video' : 'photo';
        return {url:url,type:type};
      }
    }
    return null;
  }

  function syncCountSafe(){
    try{ if(typeof syncCartCount==='function') syncCartCount(); }catch(e){}
    try{
      const n=document.getElementById('cartN');
      if(n) n.textContent = cartList().reduce(function(s,it){return s+(Number(it.qty)||0)},0);
    }catch(e){}
  }
  function manualAdd(id){
    const p=productById(id);
    if(!p){ toastSafe('Produit introuvable'); return false; }
    try{
      const arr=cartList();
      const item=arr.find(function(x){return String(x.id)===String(p.id)});
      if(item) item.qty=(Number(item.qty)||0)+1;
      else arr.push({id:p.id,qty:1,product_id:p.id,linkedPostId:p.linkedHappyadPostId||p.happyadPostId||null});
      syncCountSafe();
      if(typeof renderCart==='function') renderCart();
      toastSafe(item?'Quantité ajoutée':'Produit ajouté au panier');
      return true;
    }catch(e){ return false; }
  }
  function manualDecrease(id){
    try{
      const arr=cartList();
      const item=arr.find(function(x){return String(x.id)===String(id)});
      if(!item) return false;
      item.qty=(Number(item.qty)||0)-1;
      if(item.qty<=0){
        const i=arr.indexOf(item);
        if(i>=0) arr.splice(i,1);
      }
      syncCountSafe();
      if(typeof renderCart==='function') renderCart();
      return true;
    }catch(e){ return false; }
  }
  function manualRemove(id){
    try{
      const arr=cartList();
      for(let i=arr.length-1;i>=0;i--){ if(String(arr[i].id)===String(id)) arr.splice(i,1); }
      syncCountSafe();
      if(typeof renderCart==='function') renderCart();
      toastSafe('Produit retiré du panier');
      return true;
    }catch(e){ return false; }
  }

  function addCartById(id){
    try{
      if(typeof window.addCart==='function'){
        const before=cartList().reduce(function(s,it){return s+(Number(it.qty)||0)},0);
        const ok=window.addCart(id);
        const after=cartList().reduce(function(s,it){return s+(Number(it.qty)||0)},0);
        if(after>before) return ok;
      }
    }catch(e){}
    return manualAdd(id);
  }
  function decreaseCartById(id){
    try{
      if(typeof window.decreaseCart==='function'){ window.decreaseCart(id); return true; }
    }catch(e){}
    return manualDecrease(id);
  }
  function removeCartById(id){
    try{
      if(typeof window.removeCart==='function'){ window.removeCart(id); return true; }
    }catch(e){}
    return manualRemove(id);
  }

  function openProductDetail(id){
    const p=productById(id);
    if(!p){toastSafe('Produit introuvable');return;}
    try{
      if(typeof window.openDetail==='function') return window.openDetail(p.id);
      if(typeof openDetail==='function') return openDetail(p.id);
    }catch(e){ console.warn('[HAPPYAD V111] open detail failed', e); }
  }

  function patchCartProductCards(){
    const box=document.getElementById('cartRows');
    if(!box) return;
    const items=cartItems();
    const cards=[].slice.call(box.querySelectorAll('.cartProductCard'));
    cards.forEach(function(card,idx){
      const item=items[idx];
      if(!item || !item.product) return;
      const p=item.product;
      const id=String(p.id);
      card.setAttribute('data-v111-product-id', id);
      card.style.cursor='pointer';

      const mediaBox=card.querySelector('.cartProductMedia');
      const m=firstMedia(p);
      if(mediaBox && m){
        mediaBox.classList.add('hasRealCartMedia');
        mediaBox.innerHTML = m.type==='video'
          ? '<video src="'+esc(m.url)+'" muted playsinline preload="metadata"></video><span class="cartVideoMini">▶</span>'
          : '<img src="'+esc(m.url)+'" alt="'+esc(p.name||'Produit')+'" loading="lazy">';
      }

      const buttons=[].slice.call(card.querySelectorAll('.circleBtn'));
      buttons.forEach(function(btn){
        btn.removeAttribute('onclick');
        btn.setAttribute('type','button');
      });
      if(buttons[0]) buttons[0].onclick=function(e){e.preventDefault();e.stopPropagation();decreaseCartById(id);};
      if(buttons[1]) buttons[1].onclick=function(e){e.preventDefault();e.stopPropagation();addCartById(id);};
      if(buttons[2]) buttons[2].onclick=function(e){e.preventDefault();e.stopPropagation();removeCartById(id);};

      card.onclick=function(e){
        if(e.target.closest('button,.circleBtn,[data-no-open]')) return;
        e.preventDefault();
        openProductDetail(id);
      };
    });

    // Ancien layout fallback : .row + .mini
    const rows=[].slice.call(box.querySelectorAll('.card > .row'));
    rows.forEach(function(row,idx){
      if(row.closest('.orderCard')) return;
      const item=items[idx]; if(!item||!item.product) return;
      const p=item.product, id=String(p.id);
      row.style.cursor='pointer';
      const mini=row.querySelector('.mini');
      const m=firstMedia(p);
      if(mini && m){
        mini.classList.add('hasRealCartMedia');
        mini.innerHTML = m.type==='video'
          ? '<video src="'+esc(m.url)+'" muted playsinline preload="metadata"></video><span class="cartVideoMini">▶</span>'
          : '<img src="'+esc(m.url)+'" alt="'+esc(p.name||'Produit')+'" loading="lazy">';
      }
      const buttons=[].slice.call(row.querySelectorAll('.circleBtn'));
      buttons.forEach(btn=>{btn.removeAttribute('onclick');btn.setAttribute('type','button')});
      if(buttons[0]) buttons[0].onclick=function(e){e.preventDefault();e.stopPropagation();decreaseCartById(id);};
      if(buttons[1]) buttons[1].onclick=function(e){e.preventDefault();e.stopPropagation();addCartById(id);};
      if(buttons[2]) buttons[2].onclick=function(e){e.preventDefault();e.stopPropagation();removeCartById(id);};
      row.onclick=function(e){ if(e.target.closest('button,.circleBtn'))return; openProductDetail(id); };
    });
  }

  const oldRender = window.renderCart;
  if(typeof oldRender==='function' && !oldRender.__v111CartMediaClick){
    const wrapped=function(){
      const r=oldRender.apply(this,arguments);
      setTimeout(patchCartProductCards,20);
      setTimeout(patchCartProductCards,180);
      return r;
    };
    wrapped.__v111CartMediaClick=true;
    window.renderCart=wrapped;
  }

  const oldShow=window.show;
  if(typeof oldShow==='function' && !oldShow.__v111CartMediaClick){
    const wrappedShow=function(id){
      const r=oldShow.apply(this,arguments);
      if(id==='cart') setTimeout(patchCartProductCards,80);
      return r;
    };
    wrappedShow.__v111CartMediaClick=true;
    window.show=wrappedShow;
  }

  document.addEventListener('click', function(e){
    const card=e.target && e.target.closest && e.target.closest('#cartRows .cartProductCard[data-v111-product-id], #cartRows .card > .row');
    if(!card || e.target.closest('button,.circleBtn')) return;
    const id=card.getAttribute('data-v111-product-id');
    if(id){ e.preventDefault(); e.stopPropagation(); openProductDetail(id); }
  }, true);

  const mo=new MutationObserver(function(){ setTimeout(patchCartProductCards,30); });
  setTimeout(function(){
    const box=document.getElementById('cartRows');
    if(box) mo.observe(box,{childList:true,subtree:true});
    patchCartProductCards();
  },300);
})();
