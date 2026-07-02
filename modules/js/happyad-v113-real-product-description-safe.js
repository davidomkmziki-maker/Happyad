// V113 SAFE — Description produit réelle dans Détails Boutique
(function(){
  if(window.__HAPPYAD_V113_REAL_PRODUCT_DESCRIPTION__) return;
  window.__HAPPYAD_V113_REAL_PRODUCT_DESCRIPTION__ = true;

  function clean(v){return String(v==null?'':v).trim();}
  function esc(v){return clean(v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]});}
  function br(v){return esc(v).replace(/\n/g,'<br>');}
  function product(){return window.currentDetailProduct||window.activeDetailProduct||null;}
  function rawDesc(p){
    return clean(p && (p.desc || p.description || p.product_description || p.long_description || p.caption || p.details)) || 'Aucune description.';
  }
  function descHtml(p){
    const raw=rawDesc(p);
    if(raw.length<=170) return br(raw);
    let first=raw.slice(0,170);
    const cut=first.lastIndexOf(' ');
    if(cut>90) first=raw.slice(0,cut);
    return br(first)+'<span class="moreText">'+br(raw.slice(first.length))+'</span><br><button class="seeDesc" onclick="toggleDesc()">Voir plus</button>';
  }
  function apply(){
    const p=product();
    const box=document.getElementById('detailDesc');
    if(!p || !box) return;
    box.innerHTML='<b>Description</b><br>'+descHtml(p);
    box.classList.add('collapsed');
  }
  const oldOpenDetail=window.openDetail;
  if(typeof oldOpenDetail==='function' && !oldOpenDetail.__v113RealDescription){
    const wrapped=function(){
      const r=oldOpenDetail.apply(this,arguments);
      setTimeout(apply,30);
      setTimeout(apply,250);
      return r;
    };
    wrapped.__v113RealDescription=true;
    window.openDetail=wrapped;
  }
  setTimeout(apply,500);
})();
