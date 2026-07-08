// V129 — Mon profil boutique créateur : Note, Satisfaction, Commandes, Vues, Produits
(function(){
  if(window.__HAPPYAD_V118_PROFILE_GLOBAL_STAR_CALC__) return;
  window.__HAPPYAD_V118_PROFILE_GLOBAL_STAR_CALC__=true;

  function clean(v){return String(v==null?'':v).trim();}
  function num(v){
    if(v==null) return NaN;
    var n=parseFloat(String(v).replace(',','.').replace(/[^0-9.\-]/g,''));
    return Number.isFinite(n)?n:NaN;
  }
  function clamp(n,min,max){n=Number(n);if(!Number.isFinite(n))n=0;return Math.max(min,Math.min(max,n));}
  function fmtStar(n){return clamp(Math.round(Number(n||0)*10)/10,0,5).toFixed(1);}
  function pctFromAvg(n){return Math.round(clamp(Number(n||0),0,5)*20);}
  function allProducts(){try{return (typeof products!=='undefined'&&Array.isArray(products))?products:(Array.isArray(window.products)?window.products:[])}catch(e){return []}}
  function allOrders(){try{return (typeof boutiqueOrders!=='undefined'&&Array.isArray(boutiqueOrders))?boutiqueOrders:(Array.isArray(window.boutiqueOrders)?window.boutiqueOrders:[])}catch(e){return []}}
  function safeJSON(k){try{var v=JSON.parse(localStorage.getItem(k)||'null');return v&&typeof v==='object'?v:null}catch(e){return null}}
  function readProfile(){
    try{
      if(window.HAPPYAD_BOUTIQUE_PROFILE_SYNC&&typeof window.HAPPYAD_BOUTIQUE_PROFILE_SYNC.readLocalProfile==='function'){
        var p=window.HAPPYAD_BOUTIQUE_PROFILE_SYNC.readLocalProfile();
        if(p&&typeof p==='object'&&(p.id||p.name||p.full_name||p.display_name||p.username||p.handle)) return p;
      }
    }catch(e){}
    var keys=['HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL','HAPPYAD_LOGGED_USER','HAPPYAD_CURRENT_USER','HAPPYAD_USER','HAPPYAD_USER_V1','HAPPYAD_ACTIVE_PROFILE','HAPPYAD_MAIN_PROFILE','HAPPYAD_PROFILE'];
    for(var i=0;i<keys.length;i++){
      var p=safeJSON(keys[i]);
      if(p&&(p.id||p.user_id||p.uid||p.name||p.full_name||p.display_name||p.username||p.handle)) return p;
    }
    return {};
  }
  function norm(v){return clean(v).toLowerCase().replace(/^@+/,'');}
  function profileTokens(){
    var p=readProfile();
    var t={
      id:norm(p.id||p.user_id||p.uid||p.uuid||localStorage.getItem('HAPPYAD_AUTH_UID')||''),
      name:norm(p.name||p.full_name||p.display_name||p.fullname||''),
      handle:norm(p.handle||p.username||p.user_name||'')
    };
    try{
      var hero=clean(document.querySelector('#profile .vendorHero .happyadName')&&document.querySelector('#profile .vendorHero .happyadName').textContent).replace(/✓|✔|★|⭐/g,'').trim();
      if(hero&&!t.name) t.name=norm(hero);
    }catch(e){}
    return t;
  }
  function isMineProduct(p){
    if(!p) return false;
    try{if(typeof window.happyadBoutiqueIsMine==='function'&&window.happyadBoutiqueIsMine(p)) return true;}catch(e){}
    var t=profileTokens();
    var sid=norm(p.seller_id||p.user_id||p.owner_id||p.profile_id||p.author_id||'');
    var sn=norm(p.seller||p.seller_name||p.vendor_name||p.name_seller||'');
    var sh=norm(p.seller_handle||p.username||p.handle||p.user_name||'');
    return (!!t.id&&sid===t.id)||(!!t.name&&sn===t.name)||(!!t.handle&&sh===t.handle)||(!!t.handle&&sn===t.handle);
  }
  function productId(p){return clean(p&&(p.id||p.product_id||p.uuid||p.uid||''));}
  function orderMatchesProduct(o,p){
    if(!o||!p) return false;
    var oid=clean(o.productId||o.product_id||o.item_id||'');
    var pid=productId(p);
    var on=norm(o.product||o.product_name||o.name||'');
    var pn=norm(p.name||p.title||'');
    return (!!oid&&!!pid&&oid===pid)||(!!on&&!!pn&&on===pn);
  }
  function orderSellerMatchesMe(o){
    if(!o) return false;
    var t=profileTokens();
    var sid=norm(o.seller_id||o.user_id||o.owner_id||'');
    var sn=norm(o.seller||o.seller_name||o.vendor_name||'');
    var sh=norm(o.seller_handle||o.username||o.handle||'');
    return (!!t.id&&sid===t.id)||(!!t.name&&sn===t.name)||(!!t.handle&&sh===t.handle)||(!!t.handle&&sn===t.handle);
  }
  function orderDone(o){return !!(o&&(o.clientReceived||o.status==='completed'||o.status==='released'||o.fundsReleased||o.payoutAt||o.rating));}
  function ratingNumberFromProduct(p){
    var fields=['rating_avg','avg_rating','seller_rating','rating','rate','stars','note'];
    for(var i=0;i<fields.length;i++){
      var n=num(p&&p[fields[i]]);
      if(Number.isFinite(n)&&n>0){ if(n>5&&n<=100) n=n/20; return clamp(n,0,5); }
    }
    return NaN;
  }
  function percentNumberFromProduct(p){
    var fields=['ratingPercent','rating_percent','seller_percent','satisfaction','satisfaction_percent','score_percent','percent'];
    for(var i=0;i<fields.length;i++){
      var n=num(p&&p[fields[i]]);
      if(Number.isFinite(n)&&n>=0){ if(n<=5) n=n*20; return clamp(Math.round(n),0,100); }
    }
    return NaN;
  }
  function productViewsNumber(p){
    var fields=['views','view_count','viewCount','product_views','views_count','vues','clicks','impressions'];
    for(var i=0;i<fields.length;i++){
      var n=num(p&&p[fields[i]]);
      if(Number.isFinite(n)&&n>=0) return Math.max(0,Math.round(n));
    }
    try{
      var extra=p&&(p.stats||p.analytics||p.metrics);
      var n2=num(extra&&(extra.views||extra.view_count||extra.vues));
      if(Number.isFinite(n2)&&n2>=0) return Math.max(0,Math.round(n2));
    }catch(e){}
    return 0;
  }
  function calculateGlobalRating(){
    var ps=allProducts();
    var mine=ps.filter(isMineProduct);
    if(!mine.length) mine=ps.filter(function(p){return norm(p&&p.seller)==='profil boutique'||norm(p&&p.seller)==='vendeur happyad'});
    var ids=mine.map(productId).filter(Boolean);
    var names=mine.map(function(p){return norm(p.name||p.title||'')}).filter(Boolean);
    var orders=allOrders().filter(function(o){
      return orderSellerMatchesMe(o)||mine.some(function(p){return orderMatchesProduct(o,p)})||ids.indexOf(clean(o.productId||o.product_id||o.item_id||''))>-1||names.indexOf(norm(o.product||o.product_name||o.name||''))>-1;
    });
    var ratedOrders=orders.filter(function(o){return orderDone(o)&&Number.isFinite(num(o.rating))&&num(o.rating)>0;});
    var ratings=ratedOrders.map(function(o){return clamp(num(o.rating),1,5)});
    if(!ratings.length){
      ratings=mine.map(ratingNumberFromProduct).filter(function(n){return Number.isFinite(n)&&n>0;});
    }
    var avg=ratings.length ? ratings.reduce(function(s,n){return s+n},0)/ratings.length : 0;
    var pctCandidates=mine.map(percentNumberFromProduct).filter(function(n){return Number.isFinite(n)&&n>=0;});
    var percent;
    if(pctCandidates.length){
      percent=Math.round(pctCandidates.reduce(function(s,n){return s+n},0)/pctCandidates.length);
    }else if(orders.length){
      var completed=orders.filter(function(o){return o.clientReceived||o.status==='completed'||o.status==='released'||o.fundsReleased||o.payoutAt;}).length;
      percent=ratings.length?pctFromAvg(avg):Math.round((completed/orders.length)*100);
    }else{
      percent=pctFromAvg(avg);
    }
    var views=mine.reduce(function(sum,p){return sum+productViewsNumber(p);},0);
    return {avg:fmtStar(avg),number:clamp(avg,0,5),percent:clamp(percent,0,100),products:mine.length,orders:orders.length,views:views,reviews:ratings.length};
  }
  function statLabel(st){return (st&&st.querySelector('span')&&st.querySelector('span').textContent||'').toLowerCase();}
  function setStatValue(profile,className,labelParts,value,newLabel,iconName){
    var stats=Array.prototype.slice.call(profile.querySelectorAll('.svgStats .stat,.sellerProfileStats .stat'));
    var st=className?profile.querySelector('.'+className):null;
    if(!st){
      st=stats.find(function(x){
        var l=statLabel(x);
        return labelParts.some(function(part){return l.indexOf(part)>-1;});
      });
    }
    if(!st) return;
    if(className) st.classList.add(className);
    var strong=st.querySelector('strong');
    var label=st.querySelector('span');
    var ico=st.querySelector('b');
    if(strong) strong.textContent=value;
    if(label && newLabel) label.textContent=newLabel;
    if(ico && iconName) ico.setAttribute('data-ico',iconName);
  }
  function syncTopStar(){
    var profile=document.getElementById('profile');
    if(!profile) return;
    var card=profile.querySelector('.publicCard');
    if(card){card.classList.add('v117HiddenPublicPreview');card.setAttribute('aria-hidden','true');}
    var statsWrap=profile.querySelector('.vendorHero .stats');
    if(statsWrap){
      statsWrap.classList.add('svgStats','sellerProfileStats');
      var labels=Array.prototype.map.call(statsWrap.querySelectorAll('.stat span'),function(x){return (x.textContent||'').toLowerCase();}).join('|');
      if(statsWrap.children.length!==5 || !/note/.test(labels) || !/satisfaction/.test(labels) || !/commande/.test(labels) || !/vue/.test(labels) || !/produit/.test(labels) || /réponse|reponse|publique|globale/.test(labels)){
        statsWrap.innerHTML=''
          +'<div class="stat noteStat globalStarStat v118GlobalStarStat"><b data-ico="star"></b><strong>0.0</strong><span>Note /5</span></div>'
          +'<div class="stat satisfactionStat"><b data-ico="star"></b><strong>0%</strong><span>Satisfaction</span></div>'
          +'<div class="stat ordersStat"><b data-ico="cart"></b><strong>0</strong><span>Commandes</span></div>'
          +'<div class="stat viewsStat"><b data-ico="eye"></b><strong>0</strong><span>Vues</span></div>'
          +'<div class="stat productsStat"><b data-ico="shop"></b><strong>0</strong><span>Produits</span></div>';
      }
    }
    var r=calculateGlobalRating();
    setStatValue(profile,'noteStat',['note'],r.avg,'Note /5','star');
    setStatValue(profile,'satisfactionStat',['satisfaction','réponse','reponse','globale'],String(r.percent||0)+'%','Satisfaction','star');
    setStatValue(profile,'ordersStat',['commande','cmd'],String(r.orders||0),'Commandes','cart');
    setStatValue(profile,'viewsStat',['vue','view'],String(r.views||0),'Vues','eye');
    setStatValue(profile,'productsStat',['produit'],String(r.products||0),'Produits','shop');
    var star=profile.querySelector('.noteStat,.globalStarStat');
    if(star){
      star.classList.add('globalStarStat','v118GlobalStarStat');
      star.setAttribute('title','Note vendeur calculée : '+r.avg+' / 5 · '+r.percent+'% satisfaction');
      try{ if(typeof hydrateIcons==='function') hydrateIcons(star); }catch(e){}
    }
    try{ if(typeof hydrateIcons==='function' && statsWrap) hydrateIcons(statsWrap); }catch(e){}
  }
  window.HAPPYAD_SYNC_PROFILE_TOP_STATS_V128=syncTopStar;
  window.HAPPYAD_SYNC_PROFILE_TOP_STATS_V129=syncTopStar;
  var oldShow=window.show;
  if(typeof oldShow==='function'&&!oldShow.__v118ProfileGlobalStarCalc){
    var wrapped=function(id){
      var r=oldShow.apply(this,arguments);
      if(id==='profile'){setTimeout(syncTopStar,20);setTimeout(syncTopStar,200);setTimeout(syncTopStar,900);setTimeout(syncTopStar,1800);}
      return r;
    };
    wrapped.__v118ProfileGlobalStarCalc=true;
    window.show=wrapped;
  }
  ['DOMContentLoaded','storage'].forEach(function(ev){window.addEventListener(ev,function(){setTimeout(syncTopStar,80);});});
  setTimeout(syncTopStar,120);
  setTimeout(syncTopStar,700);
  setTimeout(syncTopStar,1600);
  window.addEventListener('focus',function(){setTimeout(syncTopStar,100);});
document.addEventListener('visibilitychange',function(){if(!document.hidden)setTimeout(syncTopStar,100);});
})();
