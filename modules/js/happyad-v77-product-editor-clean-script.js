// Extracted from index.html. Keep load order.
(function(){
  function cleanProductEditor(){
    var overlay=document.getElementById('productEditOverlay');
    if(!overlay)return;
    var title=overlay.querySelector('.sheetTop b');
    if(title)title.textContent='Modifier';
    var sub=overlay.querySelector('.sheetTop span');
    if(sub)sub.textContent='';
    var price=document.getElementById('prodEditPrice');
    if(price)price.setAttribute('placeholder','Montant');
    var desc=document.getElementById('prodEditDesc');
    if(desc)desc.setAttribute('placeholder','Description');
    var zones=document.getElementById('prodEditZones');
    if(zones)zones.setAttribute('placeholder','Kampala centre | 2h\nMakindye | 4h\nEntebbe | 24h');
    overlay.querySelectorAll('.v62CurrencyAdminNote,.currencyEditHelp,.editHint,#prodEditCurrencyAdminNote,#currencyEditHelp').forEach(function(el){
      el.style.display='none';
      el.setAttribute('aria-hidden','true');
    });
    overlay.querySelectorAll('.deliveryZonesHelp').forEach(function(el){
      el.innerHTML='<b>Livraison</b>';
    });
    var save=overlay.querySelector('button.btn[onclick*="saveProductEdit"]');
    if(save){
      var ico=save.querySelector('.icoMini');
      save.innerHTML=(ico?ico.outerHTML+' ':'')+'Enregistrer';
      try{if(typeof hydrateIcons==='function')hydrateIcons(save)}catch(e){}
    }
  }
  var previousOpen=window.openProductEditor;
  if(typeof previousOpen==='function' && !previousOpen.__v77CleanWrapped){
    var wrapped=function(){
      var result=previousOpen.apply(this,arguments);
      setTimeout(cleanProductEditor,0);
      setTimeout(cleanProductEditor,60);
      setTimeout(cleanProductEditor,180);
      return result;
    };
    wrapped.__v77CleanWrapped=true;
    window.openProductEditor=wrapped;
  }
  var overlay=document.getElementById('productEditOverlay');
  if(overlay && window.MutationObserver){
    var busy=false;
    new MutationObserver(function(){
      if(busy)return;
      busy=true;
      setTimeout(function(){cleanProductEditor();busy=false;},20);
    }).observe(overlay,{childList:true,subtree:true,attributes:true,attributeFilter:['style','class']});
  }
  setTimeout(cleanProductEditor,80);
})();
