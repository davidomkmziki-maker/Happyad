// Extracted from index.html. Keep load order.
(function(){
  if(window.__happyadV69TwoPointsOnly)return;
  window.__happyadV69TwoPointsOnly=true;
  const prevRender=window.renderResolutionChat;
  window.renderResolutionChat=function(){
    if(typeof prevRender==='function')prevRender.apply(this,arguments);
    try{
      const box=document.getElementById('resolutionBox');
      if(!box || !box.classList.contains('resolutionReadOnly'))return;
      box.querySelectorAll('textarea,input[type=file],.resolutionComposer,.resolutionFooterActions').forEach(function(el){
        el.style.display='none';
        if('disabled' in el)el.disabled=true;
      });
    }catch(e){}
  };
})();
