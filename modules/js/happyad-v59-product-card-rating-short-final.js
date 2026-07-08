// Extracted from index.html. Keep load order.
(function(){
  if(window.__happyadV59ProductShortRating)return;
  window.__happyadV59ProductShortRating=true;
  function cleanProductRatings(root){
    try{
      (root||document).querySelectorAll('.product .sellerMini .sellerRating').forEach(function(el){
        var t=(el.textContent||'').trim();
        t=t.replace(/\s*\/\s*5/g,'').replace(/\s+\d+%/g,'');
        t=t.replace(/(★\s*)(\d+)\.(\d)/,'$1$2,$3');
        el.textContent=t;
      });
      (root||document).querySelectorAll('.product .sellerMini .productRatingSmall').forEach(function(el){el.remove()});
    }catch(e){}
  }
  ['renderProducts','renderHomeSections','renderProfilePublications','renderVendorPublications'].forEach(function(name){
    var old=window[name];
    if(typeof old==='function'&&!old.__v59ShortRating){
      var wrapped=function(){var r=old.apply(this,arguments);setTimeout(function(){cleanProductRatings(document)},0);return r};
      wrapped.__v59ShortRating=true;
      window[name]=wrapped;
    }
  });
  cleanProductRatings(document);
  setTimeout(function(){cleanProductRatings(document)},120);
})();
