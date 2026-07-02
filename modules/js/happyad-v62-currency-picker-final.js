// Extracted from index.html. Keep load order.
(function(){
  if(window.__happyadV62CurrencyAdminPickerFinal)return;
  window.__happyadV62CurrencyAdminPickerFinal=true;

  const PRIORITY=['UGX','CDF','USD','EUR','KES','TZS','RWF','BIF','SSP','XAF','XOF','GBP','ZAR','NGN','GHS','ETB','DJF','SOS','AOA','ZMW','MWK','MZN','BWP','NAD','EGP','MAD','DZD','TND','LYD','SAR','AED','QAR','TRY','INR','CNY','JPY','CAD','AUD'];
  const ALL_CODES=['UGX','CDF','USD','EUR','KES','TZS','RWF','BIF','SSP','XAF','XOF','GBP','ZAR','NGN','GHS','ETB','DJF','SOS','AOA','ZMW','MWK','MZN','BWP','NAD','EGP','MAD','DZD','TND','LYD','SAR','AED','QAR','TRY','INR','CNY','JPY','CAD','AUD','AFN','ALL','AMD','ANG','ARS','AWG','AZN','BAM','BBD','BDT','BGN','BHD','BMD','BND','BOB','BRL','BSD','BTN','BYN','BZD','CHF','CLP','CNY','COP','CRC','CUP','CVE','CZK','DKK','DOP','ERN','FJD','FKP','GEL','GIP','GMD','GNF','GTQ','GYD','HKD','HNL','HTG','HUF','IDR','ILS','IQD','IRR','ISK','JMD','JOD','KGS','KHR','KMF','KPW','KRW','KWD','KYD','KZT','LAK','LBP','LKR','LRD','LSL','MDL','MGA','MKD','MMK','MNT','MOP','MRU','MUR','MVR','MXN','MYR','NIO','NOK','NPR','NZD','OMR','PAB','PEN','PGK','PHP','PKR','PLN','PYG','RON','RSD','RUB','SBD','SCR','SDG','SEK','SGD','SHP','SLE','SRD','STN','SYP','SZL','THB','TJS','TMT','TOP','TTD','TWD','UAH','UYU','UZS','VES','VND','VUV','WST','XCD','XPF','YER','ZWG'];
  const MANUAL_NAMES={
    UGX:'Shilling ougandais',CDF:'Franc congolais',USD:'Dollar américain',EUR:'Euro',KES:'Shilling kényan',TZS:'Shilling tanzanien',RWF:'Franc rwandais',BIF:'Franc burundais',SSP:'Livre sud-soudanaise',XAF:'Franc CFA Afrique centrale',XOF:'Franc CFA Afrique de l’Ouest',GBP:'Livre sterling',ZAR:'Rand sud-africain',NGN:'Naira nigérian',GHS:'Cedi ghanéen',ETB:'Birr éthiopien',DJF:'Franc djiboutien',SOS:'Shilling somalien',AOA:'Kwanza angolais',ZMW:'Kwacha zambien',MWK:'Kwacha malawite',MZN:'Metical mozambicain',BWP:'Pula botswanais',NAD:'Dollar namibien',EGP:'Livre égyptienne',MAD:'Dirham marocain',DZD:'Dinar algérien',TND:'Dinar tunisien',LYD:'Dinar libyen',SAR:'Riyal saoudien',AED:'Dirham des Émirats arabes unis',QAR:'Riyal qatari',TRY:'Livre turque',INR:'Roupie indienne',CNY:'Yuan chinois',JPY:'Yen japonais',CAD:'Dollar canadien',AUD:'Dollar australien',CHF:'Franc suisse',HKD:'Dollar de Hong Kong',SGD:'Dollar de Singapour',BRL:'Real brésilien',MXN:'Peso mexicain',RUB:'Rouble russe',SEK:'Couronne suédoise',NOK:'Couronne norvégienne',DKK:'Couronne danoise',PLN:'Zloty polonais',CZK:'Couronne tchèque',RON:'Leu roumain',HUF:'Forint hongrois',IDR:'Roupie indonésienne',MYR:'Ringgit malaisien',PHP:'Peso philippin',THB:'Baht thaïlandais',VND:'Dong vietnamien',KRW:'Won sud-coréen',PKR:'Roupie pakistanaise',BDT:'Taka bangladais',LKR:'Roupie sri-lankaise',NPR:'Roupie népalaise',AFN:'Afghani afghan',ALL:'Lek albanais',AMD:'Dram arménien',ANG:'Florin antillais',ARS:'Peso argentin',AWG:'Florin arubais',AZN:'Manat azerbaïdjanais',BAM:'Mark convertible bosnien',BBD:'Dollar barbadien',BGN:'Lev bulgare',BHD:'Dinar bahreïni',BMD:'Dollar bermudien',BND:'Dollar brunéien',BOB:'Boliviano bolivien',BSD:'Dollar bahaméen',BTN:'Ngultrum bhoutanais',BYN:'Rouble biélorusse',BZD:'Dollar bélizien',CLP:'Peso chilien',COP:'Peso colombien',CRC:'Colón costaricien',CUP:'Peso cubain',CVE:'Escudo capverdien',DOP:'Peso dominicain',ERN:'Nakfa érythréen',FJD:'Dollar fidjien',FKP:'Livre des Îles Falkland',GEL:'Lari géorgien',GIP:'Livre de Gibraltar',GMD:'Dalasi gambien',GNF:'Franc guinéen',GTQ:'Quetzal guatémaltèque',GYD:'Dollar guyanien',HNL:'Lempira hondurien',HTG:'Gourde haïtienne',ILS:'Shekel israélien',IQD:'Dinar irakien',IRR:'Rial iranien',ISK:'Couronne islandaise',JMD:'Dollar jamaïcain',JOD:'Dinar jordanien',KGS:'Som kirghize',KHR:'Riel cambodgien',KMF:'Franc comorien',KPW:'Won nord-coréen',KWD:'Dinar koweïtien',KYD:'Dollar des îles Caïmans',KZT:'Tenge kazakh',LAK:'Kip laotien',LBP:'Livre libanaise',LRD:'Dollar libérien',LSL:'Loti lésothan',MDL:'Leu moldave',MGA:'Ariary malgache',MKD:'Denar macédonien',MMK:'Kyat birman',MNT:'Tugrik mongol',MOP:'Pataca macanaise',MRU:'Ouguiya mauritanienne',MUR:'Roupie mauricienne',MVR:'Rufiyaa maldivienne',NIO:'Córdoba nicaraguayen',NZD:'Dollar néo-zélandais',OMR:'Rial omanais',PAB:'Balboa panaméen',PEN:'Sol péruvien',PGK:'Kina papou-néo-guinéen',PYG:'Guarani paraguayen',RSD:'Dinar serbe',SBD:'Dollar des Salomon',SCR:'Roupie seychelloise',SDG:'Livre soudanaise',SHP:'Livre de Sainte-Hélène',SLE:'Leone sierra-léonais',SRD:'Dollar surinamais',STN:'Dobra santoméen',SYP:'Livre syrienne',SZL:'Lilangeni swazi',TJS:'Somoni tadjik',TMT:'Manat turkmène',TOP:'Paʻanga tongan',TTD:'Dollar de Trinité-et-Tobago',TWD:'Dollar taïwanais',UAH:'Hryvnia ukrainienne',UYU:'Peso uruguayen',UZS:'Sum ouzbek',VES:'Bolivar vénézuélien',VUV:'Vatu vanuatais',WST:'Tala samoan',XCD:'Dollar des Caraïbes orientales',XPF:'Franc CFP',YER:'Rial yéménite',ZWG:'Zimbabwe Gold'
  };
  const ZERO_DECIMAL={BIF:1,CLP:1,DJF:1,GNF:1,ISK:1,JPY:1,KMF:1,KRW:1,PYG:1,RWF:1,UGX:1,VND:1,VUV:1,XAF:1,XOF:1,XPF:1,CDF:1,MGA:1};
  const COMPACT={UGX:1,CDF:1,KES:1,TZS:1,RWF:1,BIF:1,SSP:1,XAF:1,XOF:1,XPF:1,GNF:1,MGA:1,MWK:1,ZMW:1,LAK:1,KHR:1,VND:1,IDR:1,IRR:1,IQD:1,LBP:1,SYP:1,YER:1,UZS:1,MNT:1,PYG:1,KRW:1,JPY:1};
  function uniqueCodes(list){const seen={};return (list||[]).map(c=>String(c||'').trim().toUpperCase()).filter(c=>/^[A-Z]{3}$/.test(c)&&!seen[c]&&(seen[c]=1));}
  const ALL=uniqueCodes(PRIORITY.concat(ALL_CODES));
  function esc(v){return String(v==null?'':v).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\\':'&#92;'}[c]||c})}
  function cleanNumber(n,d){n=Number(n)||0; return n.toFixed(d).replace(/\.0+$/,'').replace(/(\.\d*?)0+$/,'$1');}
  function currencyName(code){code=String(code||'').toUpperCase(); if(MANUAL_NAMES[code])return MANUAL_NAMES[code]; try{const dn=new Intl.DisplayNames(['fr'],{type:'currency'}); const v=dn.of(code); if(v&&v!==code)return v.charAt(0).toUpperCase()+v.slice(1);}catch(e){} return 'Devise '+code;}
  function loadConfig(){
    let cfg=null; try{cfg=JSON.parse(localStorage.getItem('happyad_currency_config_v62')||'null')}catch(e){}
    if(!cfg||typeof cfg!=='object')cfg={defaultCurrency:'UGX',enabled:{}};
    cfg.defaultCurrency=String(cfg.defaultCurrency||'UGX').toUpperCase();
    if(!cfg.enabled||typeof cfg.enabled!=='object')cfg.enabled={};
    // Pour le test : tout ouvert par défaut. La configuration pourra être ajustée ensuite.
    ALL.forEach(c=>{if(cfg.enabled[c]!==false)cfg.enabled[c]=true});
    if(!ALL.includes(cfg.defaultCurrency))cfg.defaultCurrency='UGX';
    cfg.enabled[cfg.defaultCurrency]=true;
    return cfg;
  }
  let currencyConfig=loadConfig();
  function saveConfig(){try{localStorage.setItem('happyad_currency_config_v62',JSON.stringify(currencyConfig))}catch(e){} window.HAPPYAD_DEFAULT_CURRENCY=currencyConfig.defaultCurrency; window.HAPPYAD_ACTIVE_CURRENCIES=enabledCurrencies(); refreshCurrencyPickerList();}
  function enabledCurrencies(){const enabled=ALL.filter(c=>currencyConfig.enabled[c]!==false); const pri=PRIORITY.filter(c=>enabled.includes(c)); const rest=enabled.filter(c=>!pri.includes(c)).sort(); return uniqueCodes(pri.concat(rest));}
  function normalizeCurrencyCode(v){const c=String(v||'').trim().toUpperCase(); return /^[A-Z]{3}$/.test(c)&&ALL.includes(c)?c:'';}
  function formatMoney(amount,currency){currency=normalizeCurrencyCode(currency)||currencyConfig.defaultCurrency||'UGX'; amount=Number(amount)||0; if(COMPACT[currency]){if(Math.abs(amount)>=1000000000)return cleanNumber(amount/1000000000,1)+'B '+currency; if(Math.abs(amount)>=1000000)return cleanNumber(amount/1000000,1)+'M '+currency; if(Math.abs(amount)>=1000)return cleanNumber(amount/1000,1)+'K '+currency; return cleanNumber(amount,0)+' '+currency;} const dec=ZERO_DECIMAL[currency]?0:(Math.abs(amount)>=1000?0:2); let n; try{n=amount.toLocaleString('en-US',{minimumFractionDigits:0,maximumFractionDigits:dec})}catch(e){n=cleanNumber(amount,dec)} return n+' '+currency;}
  function parsePrice(p){
    const text=String((p&&((p.priceText)||(p.price)))||'');
    let currency=normalizeCurrencyCode(p&&(p.currency||p.currencyCode||p.devise||p.monnaie));
    const match=text.toUpperCase().match(/\b[A-Z]{3}\b/); if(!currency&&match)currency=normalizeCurrencyCode(match[0]);
    if(!currency)currency=currencyConfig.defaultCurrency||'UGX';
    let num=Number(text.replace(/,/g,'.').replace(/[^0-9.]/g,''))||0;
    if(/\bK\b/i.test(text))num*=1000; if(/\bM\b/i.test(text))num*=1000000; if(/\bB\b/i.test(text))num*=1000000000;
    const direct=Number(p&&(p.unitAmount||p.priceAmount||p.amount)); if(direct>0)num=direct;
    return {amount:Math.max(0,num),currency,text};
  }
  function productsList(){try{return (typeof products!=='undefined'&&Array.isArray(products))?products:[]}catch(e){return []}}
  function productById(id){return productsList().find(p=>String(p.id)===String(id))}
  function digitsOnly(v){return String(v||'').replace(/[^0-9]/g,'')}
  function zonesToText(zones){if(!Array.isArray(zones)||!zones.length)return 'Kampala centre | 2h\nMakindye / Kansanga | 4h\nEntebbe / Wakiso | 24h'; return zones.map(z=>String((z&&z.name)||'Zone').trim()+' | '+Math.max(1,Number((z&&z.hours)||2))+'h').join('\n');}
  function parseZonesText(txt){try{if(typeof window.parseDeliveryZones==='function')return window.parseDeliveryZones(txt)}catch(e){} return String(txt||'').split(/;|\n/).map(x=>x.trim()).filter(Boolean).map(x=>{const parts=x.split('|').map(v=>v.trim()); return {name:parts[0]||'Zone',hours:Math.max(1,Number(String(parts[1]||'2').replace(/[^0-9.]/g,''))||2)}});}
  function syncTools(){
    window.HAPPYAD_DEFAULT_CURRENCY=currencyConfig.defaultCurrency;
    window.HAPPYAD_ACTIVE_CURRENCIES=enabledCurrencies();
    window.formatBoutiqueMoney=formatMoney;
    window.formatBoutiqueAmount=function(value,currency){const c=normalizeCurrencyCode(currency); if(c)return formatMoney(Number(value)||0,c); return formatMoney((Number(value)||0)*1000,'UGX')};
    const old=window.HAPPYAD_CURRENCY_TOOLS||{};
    window.HAPPYAD_CURRENCY_TOOLS=Object.assign({},old,{parsePrice:parsePrice,formatMoney:formatMoney,activeCurrencies:enabledCurrencies,currencyName:currencyName,normalizeCurrencyCode:normalizeCurrencyCode});
  }
  function updateHiddenSelect(code){
    let select=document.getElementById('prodEditCurrency')||document.getElementById('prodEditCat');
    if(!select)return null;
    select.id='prodEditCurrency'; select.name='prodEditCurrency'; select.style.display='none';
    const html=enabledCurrencies().map(c=>'<option value="'+esc(c)+'">'+esc(c+' — '+currencyName(c))+'</option>').join('');
    if(select.dataset.v62CurrencyOptions!==String(html.length)){select.innerHTML=html;select.dataset.v62CurrencyOptions=String(html.length)}
    const finalCode=normalizeCurrencyCode(code)||normalizeCurrencyCode(select.value)||currencyConfig.defaultCurrency||'UGX';
    if(![...select.options].some(o=>o.value===finalCode)){select.insertAdjacentHTML('afterbegin','<option value="'+esc(finalCode)+'">'+esc(finalCode+' — '+currencyName(finalCode))+'</option>')}
    select.value=finalCode; return select;
  }
  function selectedCurrency(){return normalizeCurrencyCode(document.getElementById('prodEditCurrency')?.value)||currencyConfig.defaultCurrency||'UGX'}
  function setSelectedCurrency(code,keepOpen){code=normalizeCurrencyCode(code)||currencyConfig.defaultCurrency||'UGX'; const select=updateHiddenSelect(code); if(select)select.value=code; const c=document.getElementById('prodEditCurrencyCode'), n=document.getElementById('prodEditCurrencyName'); if(c)c.textContent=code; if(n)n.textContent=currencyName(code); document.querySelectorAll('.v62CurrencyOption').forEach(btn=>btn.classList.toggle('active',btn.dataset.code===code)); if(!keepOpen)closeCurrencyPicker();}
  function row(code){return '<button type="button" class="v62CurrencyOption '+(code===selectedCurrency()?'active':'')+'" data-code="'+esc(code)+'" onclick="window.pickProductCurrency(\''+esc(code)+'\')"><span><b>'+esc(code)+'</b><small>'+esc(currencyName(code))+'</small></span><span class="v62Check">'+(code===selectedCurrency()?'●':'○')+'</span></button>'}
  function renderCurrencyRows(filter){const list=document.getElementById('prodEditCurrencyList'); if(!list)return; const q=String(filter||'').toLowerCase().trim(); const codes=enabledCurrencies().filter(c=>!q||c.toLowerCase().includes(q)||currencyName(c).toLowerCase().includes(q)); list.innerHTML=codes.map(row).join('')||'<div style="padding:14px 16px;color:#aeb2c1;font-weight:850">Aucune devise active</div>';}
  function closeCurrencyPicker(){document.getElementById('prodEditCurrencyPanel')?.classList.remove('show')}
  function refreshCurrencyPickerList(){try{updateHiddenSelect(selectedCurrency());renderCurrencyRows(document.getElementById('prodEditCurrencySearch')?.value||'');setSelectedCurrency(selectedCurrency(),true)}catch(e){}}
  window.toggleProductCurrencyPicker=function(){const p=document.getElementById('prodEditCurrencyPanel'); if(!p)return; p.classList.toggle('show'); const s=document.getElementById('prodEditCurrencySearch'); if(p.classList.contains('show')&&s){s.value='';renderCurrencyRows('');setTimeout(()=>s.focus(),80)}};
  window.pickProductCurrency=function(code){setSelectedCurrency(code,false)};
  function ensurePicker(code){
    const sheet=document.querySelector('#productEditOverlay .productEditSheet'); if(!sheet)return;
    const price=document.getElementById('prodEditPrice'); if(price){price.setAttribute('type','text');price.setAttribute('inputmode','numeric');price.setAttribute('autocomplete','off');price.setAttribute('placeholder','Montant : chiffres seulement'); if(!price.dataset.v62Digits){price.addEventListener('input',function(){const clean=digitsOnly(this.value); if(this.value!==clean)this.value=clean});price.addEventListener('paste',function(){setTimeout(()=>{this.value=digitsOnly(this.value)},0)});price.dataset.v62Digits='1'}}
    const select=updateHiddenSelect(code);
    if(select&&!document.getElementById('prodEditCurrencyButton')){
      select.insertAdjacentHTML('afterend','<div class="v62CurrencyPickerBox" id="prodEditCurrencyButton" onclick="window.toggleProductCurrencyPicker()"><span><b id="prodEditCurrencyCode"></b><small id="prodEditCurrencyName"></small></span><span class="v62Chevron">⌄</span></div><div class="v62CurrencyPanel" id="prodEditCurrencyPanel"><input class="v62CurrencySearch" id="prodEditCurrencySearch" placeholder="Rechercher devise ou pays"><div class="v62CurrencyList" id="prodEditCurrencyList"></div></div><div class="v62CurrencyAdminNote" id="prodEditCurrencyAdminNote"><b>Devise du montant</b><br>Le montant en haut reste uniquement en chiffres. La devise est choisie ici. Pour le test, toutes les devises sont ouvertes.</div>');
      document.getElementById('prodEditCurrencySearch')?.addEventListener('input',function(){renderCurrencyRows(this.value)});
    }
    if(!document.getElementById('prodEditZones')){const btn=sheet.querySelector('button.btn'); if(btn){const wrap=document.createElement('div');wrap.innerHTML='<div class="deliveryZonesHelp"><b>Zones de livraison</b><br>Une zone par ligne : <b>Nom zone | heures</b></div><textarea id="prodEditZones" placeholder="Kampala centre | 2h\nMakindye | 4h\nEntebbe | 24h"></textarea>';btn.parentNode.insertBefore(wrap,btn)}}
    setSelectedCurrency(code||selectedCurrency(),true); renderCurrencyRows('');
  }
  function refreshAllAfterEdit(productId){
    try{productsList().forEach(p=>{const pi=parsePrice(p);p.currency=pi.currency;p.currencyCode=pi.currency;p.devise=pi.currency;p.unitAmount=pi.amount;p.priceAmount=pi.amount;p.priceText=formatMoney(pi.amount,pi.currency);p.price=p.priceText})}catch(e){}
    ['renderProducts','renderHomeSections','renderProfilePublications','renderVendorPublications','renderStats','renderMine','renderCart','renderSellerOrders','updatePublicPreviewRating','syncCartCount'].forEach(fn=>{try{if(typeof window[fn]==='function')window[fn]()}catch(e){}});
    try{if((window.currentScreen==='detail'||document.querySelector('#detail.module.active'))&&window.activeDetailProduct&&String(window.activeDetailProduct.id)===String(productId)&&typeof window.openDetail==='function')window.openDetail(productId)}catch(e){}
    try{hydrateIcons(document)}catch(e){}
  }
  window.openProductEditor=function(id){
    const p=productById(id); if(!p){try{toast('Produit introuvable')}catch(e){} return;}
    try{editingProductId=p.id}catch(e){window.editingProductId=p.id}
    const pi=parsePrice(p), amount=Math.round(Number(p.unitAmount||p.priceAmount||pi.amount||0)), currency=normalizeCurrencyCode(p.currency||p.currencyCode||p.devise||pi.currency)||currencyConfig.defaultCurrency||'UGX';
    const name=document.getElementById('prodEditName'), price=document.getElementById('prodEditPrice'), desc=document.getElementById('prodEditDesc'), zones=document.getElementById('prodEditZones');
    ensurePicker(currency);
    if(name)name.value=p.name||'';
    if(price)price.value=amount?String(amount):'';
    if(desc)desc.value=p.desc||'Produit élégant et durable. L’acheteur voit les détails essentiels, photos, livraison et conditions du vendeur.';
    if(zones)zones.value=zonesToText(p.deliveryZones);
    setSelectedCurrency(currency,true);
    document.getElementById('productEditOverlay')?.classList.add('show');
    try{hydrateIcons(document.getElementById('productEditOverlay'))}catch(e){}
  };
  window.saveProductEdit=function(){
    let p=null; try{p=productById(editingProductId)}catch(e){p=productById(window.editingProductId)}
    if(!p){try{toast('Produit introuvable')}catch(e){} return;}
    ensurePicker(selectedCurrency());
    const title=(document.getElementById('prodEditName')?.value||'').trim();
    const amount=Number(digitsOnly(document.getElementById('prodEditPrice')?.value||''))||0;
    const currency=selectedCurrency();
    if(!title){try{toast('Titre obligatoire')}catch(e){} return;}
    if(!amount){try{toast('Montant obligatoire : chiffres seulement')}catch(e){} return;}
    p.name=title; p.currency=currency; p.currencyCode=currency; p.devise=currency; p.unitAmount=amount; p.priceAmount=amount; p.priceText=formatMoney(amount,currency); p.price=p.priceText; p.desc=(document.getElementById('prodEditDesc')?.value||'').trim();
    const ztxt=document.getElementById('prodEditZones')?.value||''; if(ztxt.trim())p.deliveryZones=parseZonesText(ztxt);
    document.getElementById('productEditOverlay')?.classList.remove('show');
    refreshAllAfterEdit(p.id);
    try{toast('Produit modifié : '+p.priceText)}catch(e){}
  };
  window.HAPPYAD_CURRENCY_CONFIG={
    all:function(){return ALL.map(c=>({code:c,name:currencyName(c),enabled:currencyConfig.enabled[c]!==false,default:c===currencyConfig.defaultCurrency}))},
    config:function(){return JSON.parse(JSON.stringify(currencyConfig))},
    enabledCurrencies:enabledCurrencies,
    currencyName:currencyName,
    setDefault:function(code){code=normalizeCurrencyCode(code); if(!code)return false; currencyConfig.defaultCurrency=code; currencyConfig.enabled[code]=true; saveConfig(); return true},
    setEnabled:function(code,enabled){code=normalizeCurrencyCode(code); if(!code)return false; currencyConfig.enabled[code]=!!enabled; if(code===currencyConfig.defaultCurrency)currencyConfig.enabled[code]=true; saveConfig(); return true},
    enable:function(code){return this.setEnabled(code,true)},
    disable:function(code){return this.setEnabled(code,false)},
    resetAll:function(){currencyConfig={defaultCurrency:'UGX',enabled:{}};ALL.forEach(c=>currencyConfig.enabled[c]=true);saveConfig();return true}
  };
  syncTools(); ensurePicker(currencyConfig.defaultCurrency);
})();
