// V114 SAFE — Mon profil boutique : vraie photo profil dans le grand bloc
(function(){
  if(window.__HAPPYAD_V114_PROFILE_HERO_AVATAR_FIX__) return;
  window.__HAPPYAD_V114_PROFILE_HERO_AVATAR_FIX__ = true;

  function clean(v){ return String(v==null?'':v).trim(); }
  function esc(v){ return clean(v).replace(/"/g,'&quot;'); }
  function safeJson(key){
    try{ const v=JSON.parse(localStorage.getItem(key)||'null'); return v&&typeof v==='object'?v:null; }catch(e){ return null; }
  }
  function avatarOf(p){
    return clean(p && (p.avatar || p.avatar_url || p.photo_url || p.photo || p.picture || p.profile_photo || p.image || p.userAvatar || p.user_avatar));
  }
  function nameOf(p){
    return clean(p && (p.name || p.full_name || p.display_name || p.fullname || p.username || p.handle || p.email));
  }
  function currentProfile(){
    const keys=[
      'HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL',
      'HAPPYAD_USER',
      'HAPPYAD_ACTIVE_PROFILE',
      'HAPPYAD_MAIN_PROFILE',
      'HAPPYAD_PROFILE'
    ];
    for(const k of keys){
      const p=safeJson(k);
      if(p && (avatarOf(p)||nameOf(p))) return p;
    }
    try{
      if(window.HAPPYAD_SUPABASE_CONFIG && window.HAPPYAD_SUPABASE_CONFIG.currentUserName){
        const n=window.HAPPYAD_SUPABASE_CONFIG.currentUserName;
        const hp=window.happyadProfiles || (typeof happyadProfiles!=='undefined'?happyadProfiles:{});
        if(hp && hp[n]) return hp[n];
      }
    }catch(e){}
    try{
      const heroName=document.querySelector('#profile .happyadName');
      if(heroName){
        const n=clean(heroName.textContent);
        const hp=window.happyadProfiles || (typeof happyadProfiles!=='undefined'?happyadProfiles:{});
        if(hp && hp[n]) return hp[n];
      }
    }catch(e){}
    return {};
  }
  function urlFromCss(bg){
    bg=clean(bg);
    if(!bg || bg==='none') return '';
    const m=bg.match(/url\(["']?(.+?)["']?\)/);
    return m ? m[1] : '';
  }
  function publicAvatarUrl(){
    const el=document.querySelector('#profile .publicCardTop .avatar');
    if(!el) return '';
    const img=el.querySelector && el.querySelector('img');
    if(img && img.src) return img.src;
    return urlFromCss(el.style.backgroundImage) || urlFromCss(getComputedStyle(el).backgroundImage);
  }
  function publicAvatarName(){
    const h=document.querySelector('#profile .publicCardTop h3');
    return clean(h && h.textContent);
  }
  function setHero(url, name){
    const el=document.querySelector('#profile .vendorHero .vendorTop .avatar');
    if(!el) return;
    name=clean(name) || 'H';
    url=clean(url);
    el.classList.add('v114ProfileHeroAvatar');
    if(url){
      el.innerHTML='<img src="'+esc(url)+'" alt="'+esc(name)+'">';
      el.style.backgroundImage='';
      // Ne pas utiliser textContent='' ici : cela efface l'image ajoutée par innerHTML.
    }else{
      el.innerHTML='';
      el.style.backgroundImage='';
      el.textContent=name.charAt(0).toUpperCase();
    }
  }
  function apply(){
    const p=currentProfile();
    const url=avatarOf(p) || publicAvatarUrl();
    const name=nameOf(p) || publicAvatarName() || 'Profil HAPPYAD';
    setHero(url,name);
  }

  const oldShow=window.show;
  if(typeof oldShow==='function' && !oldShow.__v114ProfileHeroAvatar){
    const wrapped=function(id){
      const r=oldShow.apply(this,arguments);
      if(id==='profile'){
        setTimeout(apply,30);
        setTimeout(apply,250);
        setTimeout(apply,800);
      }
      return r;
    };
    wrapped.__v114ProfileHeroAvatar=true;
    window.show=wrapped;
  }

  const mo=new MutationObserver(function(){
    const active=document.querySelector('#profile.module.active,#profile.active');
    if(active) setTimeout(apply,20);
  });
  setTimeout(function(){
    const profile=document.getElementById('profile');
    if(profile) mo.observe(profile,{childList:true,subtree:true,attributes:true});
    apply();
  },300);
})();
