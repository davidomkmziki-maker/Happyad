// V115 SAFE — Mon profil boutique : photo haut + aperçu public propre
(function(){
  if(window.__HAPPYAD_V115_PROFILE_TOP_PUBLIC_FIX__) return;
  window.__HAPPYAD_V115_PROFILE_TOP_PUBLIC_FIX__ = true;

  function clean(v){ return String(v==null?'':v).trim(); }
  function esc(v){ return clean(v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]}); }
  function safeJson(k){ try{ const v=JSON.parse(localStorage.getItem(k)||'null'); return v&&typeof v==='object'?v:null; }catch(e){ return null; } }
  function avatarOf(p){ return clean(p && (p.avatar || p.avatar_url || p.photo_url || p.photo || p.picture || p.profile_photo || p.image || p.userAvatar || p.user_avatar)); }
  function nameOf(p){ return clean(p && (p.name || p.full_name || p.display_name || p.fullname || p.username || p.handle || p.email)); }
  function handleOf(p){ return clean(p && (p.handle || p.username || p.user_name)); }
  function currentProfile(){
    const keys=[
      'HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL',
      'HAPPYAD_LOGGED_USER',
      'HAPPYAD_CURRENT_USER',
      'HAPPYAD_USER',
      'HAPPYAD_USER_V1',
      'HAPPYAD_ACTIVE_PROFILE',
      'HAPPYAD_MAIN_PROFILE',
      'HAPPYAD_PROFILE'
    ];
    for(const k of keys){
      const p=safeJson(k);
      if(p && (avatarOf(p)||nameOf(p))) return p;
    }
    return {};
  }
  function cssUrl(el){
    if(!el) return '';
    const img=el.querySelector && el.querySelector('img');
    if(img && img.src) return img.src;
    const values=[el.style && el.style.backgroundImage, getComputedStyle(el).backgroundImage];
    for(const bg of values){
      const s=clean(bg);
      if(!s || s==='none') continue;
      const m=s.match(/url\(["']?(.+?)["']?\)/);
      if(m && m[1]) return m[1];
    }
    return '';
  }
  function bottomAvatarUrl(){
    return cssUrl(document.querySelector('#profile .publicCardTop .avatar')) ||
           cssUrl(document.querySelector('#profile .publicCard .avatar')) ||
           cssUrl(document.querySelector('#detailBox .sellerCompact .avatar'));
  }
  function profileName(){
    const p=currentProfile();
    return nameOf(p) || clean(document.querySelector('#profile .publicCardTop h3')?.textContent) || clean(document.querySelector('#profile .happyadName')?.textContent) || 'Profil HAPPYAD';
  }
  function profileHandleOrSubtitle(){
    const p=currentProfile();
    const h=handleOf(p);
    return h ? (h.startsWith('@') ? h : '@'+h) : 'Profil boutique HAPPYAD';
  }
  function profileAvatarUrl(){
    return avatarOf(currentProfile()) || bottomAvatarUrl();
  }
  function setAvatar(el, url, name){
    if(!el) return;
    name=clean(name)||'H';
    url=clean(url);
    el.classList.add('v115RealProfileAvatar');
    if(url){
      el.innerHTML='<img src="'+esc(url)+'" alt="'+esc(name)+'">';
      el.style.backgroundImage='url("'+url.replace(/"/g,'%22')+'")';
      el.style.backgroundSize='cover';
      el.style.backgroundPosition='center';
      // Ne pas utiliser textContent='' ici : cela efface l'image ajoutée par innerHTML.
    }else{
      el.innerHTML='';
      el.style.backgroundImage='';
      el.textContent=name.charAt(0).toUpperCase();
    }
  }
  function fixHero(){
    const name=profileName();
    const url=profileAvatarUrl();
    const heroAvatar=document.querySelector('#profile .vendorHero .vendorTop .avatar');
    setAvatar(heroAvatar,url,name);
    const nameEl=document.querySelector('#profile .vendorHero .happyadName');
    if(nameEl && name){
      const badge=nameEl.querySelector('.happyBadgeMark,.happyadBadge');
      nameEl.childNodes.forEach(n=>{ if(n.nodeType===3) n.textContent=''; });
      if(!nameEl.querySelector('.v115HeroName')){
        const span=document.createElement('span');
        span.className='v115HeroName';
        nameEl.insertBefore(span,nameEl.firstChild);
      }
      nameEl.querySelector('.v115HeroName').textContent=name+' ';
      if(badge && badge.parentNode!==nameEl) nameEl.appendChild(badge);
    }
  }
  function fixPublicCard(){
    const name=profileName();
    const subtitle=profileHandleOrSubtitle();
    const url=profileAvatarUrl();
    const card=document.querySelector('#profile .publicCard');
    if(!card) return;
    setAvatar(card.querySelector('.publicCardTop .avatar'),url,name);
    const h=card.querySelector('.publicCardTop h3');
    if(h) h.textContent=name;
    const p=card.querySelector('.publicCardTop p');
    if(p) p.textContent=subtitle;
    const spans=card.querySelectorAll('.ratingLine span');
    if(spans && spans.length){
      if(spans[1]) spans[1].textContent='Profil boutique HAPPYAD';
      if(spans[3] && !clean(spans[3].textContent)) spans[3].textContent='0.0';
    }
  }
  function apply(){
    const active=document.querySelector('#profile.module.active,#profile.active') || document.getElementById('profile');
    if(!active) return;
    fixPublicCard();
    fixHero();
  }

  const oldShow=window.show;
  if(typeof oldShow==='function' && !oldShow.__v115ProfileTopPublic){
    const wrapped=function(id){
      const r=oldShow.apply(this,arguments);
      if(id==='profile'){
        setTimeout(apply,20);
        setTimeout(apply,150);
        setTimeout(apply,600);
        setTimeout(apply,1400);
      }
      return r;
    };
    wrapped.__v115ProfileTopPublic=true;
    window.show=wrapped;
  }

  const mo=new MutationObserver(function(){
    if(document.querySelector('#profile.module.active,#profile.active')) setTimeout(apply,10);
  });
  setTimeout(function(){
    const profile=document.getElementById('profile');
    if(profile) mo.observe(profile,{childList:true,subtree:true,attributes:true,attributeFilter:['style','class']});
    apply();
    let n=0;
    const timer=setInterval(function(){
      apply();
      if(++n>16) clearInterval(timer);
    },500);
  },250);
})();
