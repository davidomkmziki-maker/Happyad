(function(){
  'use strict';
  if(window.__HAPPYAD_PROFILE_SETTINGS_MASTER_V722__)return;
  window.__HAPPYAD_PROFILE_SETTINGS_MASTER_V722__=true;

  var VERSION='HAPPYAD_PROFILE_SETTINGS_V776_PUSH_SYSTEME_REEL';
  var panel=null,view='main',mainScroll=0,mainAnchor=null,mainRestoreToken=0,profileScroll=0,opening=false,remoteReady=false;
  var prefs={
    account_type:'personal',language:'fr',account_public:true,allow_comments:true,allow_messages:true,
    message_preference:'everyone',show_following:false,allow_download:false,allow_share:true,
    collaborations:false,location_visible:false,notify_messages:true,notify_comments:true,
    notify_follows:true,notify_marketing:false
  };

  function $(id){return document.getElementById(id)}
  function clean(v){return String(v==null?'':v).trim()}
  function stop(e){try{e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation()}catch(_e){}}
  function esc(v){return clean(v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function bool(v,d){return v===true||v==='true'||v===1||v==='1'?true:(v===false||v==='false'||v===0||v==='0'?false:!!d)}
  function localUser(){try{return Object.assign({},JSON.parse(localStorage.getItem('HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL')||'{}')||{},window.UserStore&&window.UserStore.data||{})}catch(_e){return (window.UserStore&&window.UserStore.data)||{}}}
  function uid(){var u=localUser();return clean(u.id||u.user_id||localStorage.getItem('HAPPYAD_AUTH_UID'))}
  function client(){try{return window.happyadSupabase||((window.supabase&&window.supabase.createClient)?(window.happyadSupabase=window.supabase.createClient(window.HAPPYAD_SUPABASE_URL,window.HAPPYAD_SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})):null)}catch(_e){return null}}
  function storageKey(){return 'HAPPYAD_PROFILE_SETTINGS_V712_'+(uid()||'local')}
  function readLocal(){try{var r=JSON.parse(localStorage.getItem(storageKey())||'{}')||{};prefs=Object.assign({},prefs,r)}catch(_e){}return prefs}
  function writeLocal(){try{localStorage.setItem(storageKey(),JSON.stringify(prefs))}catch(_e){}}
  function toast(msg){try{if(typeof window.toast==='function')return window.toast(msg)}catch(_e){}var t=$('toast');if(t){t.textContent=msg;t.classList.add('show');clearTimeout(t.__v722);t.__v722=setTimeout(function(){t.classList.remove('show')},2500)}}
  function icon(name){
    var m={
      chev:'<path d="m9 18 6-6-6-6"/>',
      close:'<path d="M7 7l10 10M17 7 7 17"/>',
      'profile-edit':'<circle cx="9" cy="8" r="3"/><path d="M3.8 19c.7-3.1 2.5-5 5.2-5 1.1 0 2.1.3 2.9.8M15.2 12.3l4.5 4.5M14 19l1-3 3.8-3.8a1.6 1.6 0 0 1 2.2 2.2L17.2 18l-3.2 1Z"/>',
      'id-card':'<rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="8.5" cy="10" r="2"/><path d="M5.7 15c.6-1.8 1.5-2.7 2.8-2.7s2.2.9 2.8 2.7M14.5 9h3.5M14.5 13h3.5"/>',
      eye:'<path d="M2.5 12s3.5-5.5 9.5-5.5 9.5 5.5 9.5 5.5-3.5 5.5-9.5 5.5S2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.5"/>',
      comment:'<path d="M5.5 18.2 3 20l.7-3.2A8 8 0 1 1 5.5 18.2Z"/><path d="M8 10h8M8 13.5h5.5"/>',
      message:'<path d="M4.2 16.5A7.5 7.5 0 1 1 7 19l-4 2 1.2-4.5Z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',
      'message-settings':'<path d="M4.2 16.5A7.5 7.5 0 1 1 7 19l-4 2 1.2-4.5Z"/><circle cx="15.5" cy="15.5" r="2.5"/><path d="M15.5 11.8v1.2M15.5 18v1.2M11.8 15.5H13M18 15.5h1.2"/>',
      users:'<path d="M16 20c-.4-2.7-1.9-4.5-4-4.5S8.4 17.3 8 20M12 12.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM18 13.5c1.8.5 2.8 1.8 3 3.8M17 5.8a3 3 0 0 1 0 5.6M6 13.5c-1.8.5-2.8 1.8-3 3.8M7 5.8a3 3 0 0 0 0 5.6"/>',
      pin:'<path d="M20 10c0 5.5-8 11-8 11S4 15.5 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
      'key-lock':'<rect x="9" y="10" width="11" height="9" rx="2"/><path d="M12 10V8a3.5 3.5 0 0 1 7 0v2M9 14H4l-2 2 2 2 2-2 2 2 2-2"/>',
      devices:'<rect x="3" y="4" width="12" height="16" rx="2"/><path d="M7 17h4M17 8h4v10h-4"/>',
      bell:'<path d="M18 9a6 6 0 0 0-12 0c0 5-2.5 6-2.5 8h17c0-2-2.5-3-2.5-8ZM10 20h4"/>',
      download:'<path d="M12 3v11M8 10l4 4 4-4M4 18v2h16v-2"/>',
      share:'<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5"/>',
      handshake:'<path d="m7 12 3-3c1-1 2.2-1 3.2 0l3.8 3.8c.8.8.8 2 0 2.8l-2.2 2.2c-.8.8-2 .8-2.8 0L9.5 15.3M3 8l4 4M21 8l-4 4M8.5 16.5l-1 1c-.8.8-2 .8-2.8 0l-.5-.5c-.8-.8-.8-2 0-2.8l1-1"/>',
      language:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.1 2.4 3.2 5.4 3.2 9S14.1 18.6 12 21M12 3c-2.1 2.4-3.2 5.4-3.2 9S9.9 18.6 12 21"/>',
      'shield-check':'<path d="M12 3 5 6v5.5c0 4.5 2.8 7.3 7 8.5 4.2-1.2 7-4 7-8.5V6l-7-3Z"/><path d="m9 12 2 2 4-4"/>',
      'badge-check':'<path d="m12 2.5 2.2 2 3-.2.8 2.9 2.6 1.5-1.2 2.7 1.2 2.7-2.6 1.5-.8 2.9-3-.2-2.2 2-2.2-2-3 .2-.8-2.9-2.6-1.5 1.2-2.7-1.2-2.7 2.6-1.5.8-2.9 3 .2 2.2-2Z"/><path d="m9.2 12 1.8 1.8 3.8-3.8"/>',
      'storage-clean':'<ellipse cx="9" cy="5.5" rx="5.5" ry="2.5"/><path d="M3.5 5.5v5c0 1.4 2.5 2.5 5.5 2.5M3.5 10.5v5c0 1.4 2.5 2.5 5.5 2.5M15.5 12.5l1 2 2 .7-2 1-1 2-1-2-2-1 2-.7 1-2ZM19.5 5l.6 1.2 1.4.5-1.4.7-.6 1.3-.6-1.3-1.4-.7 1.4-.5.6-1.2"/>',
      help:'<circle cx="12" cy="12" r="9"/><path d="M9.7 9a2.5 2.5 0 1 1 3.7 2.2c-1 .6-1.4 1.2-1.4 2.3M12 17h.01"/>',
      'file-text':'<path d="M6 3h8l4 4v14H6Z"/><path d="M14 3v5h4M9 12h6M9 16h6"/>',
      'pause-circle':'<circle cx="12" cy="12" r="9"/><path d="M10 9v6M14 9v6"/>',
      trash:'<path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6"/>',
      logout:'<path d="M10 5H5v14h5M14 8l4 4-4 4M8 12h10"/>',
      phone:'<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M10 18.5h4"/>',
      'user-plus':'<circle cx="9" cy="8" r="3"/><path d="M3.5 20c.6-3.5 2.4-5.5 5.5-5.5s4.9 2 5.5 5.5M18 8v6M15 11h6"/>',
      megaphone:'<path d="M4 13V9l12-4v12L4 13ZM4 9H2v4h2M7 14l1.5 5h3L10 13"/>'
    };
    return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+(m[name]||m.chev)+'</svg>';
  }
  function userInfo(){var u=localUser(),name=clean(u.name||u.full_name||u.display_name)||'Compte HAPPYAD',handle=clean(u.handle||u.username).replace(/^@+/,'');return {raw:u,name:name,handle:handle?('@'+handle):clean(u.email||u.contact),email:clean(u.email||u.contact),avatar:clean(u.avatar||u.avatar_url),bio:clean(u.bio),country:clean(u.country||u.location),birth:clean(u.birthDate||u.birth_date),type:clean(u.type||prefs.account_type)||'personal'}}
  function section(title,rows){return '<section class="haSettingsSectionV722"><div class="haSettingsSectionTitleV722"><span>'+esc(title)+'</span></div><div class="haSettingsListV722">'+rows+'</div></section>'}
  function row(action,ic,title,desc,end,cls){return '<button type="button" class="haSettingsRowV722 '+(cls||'')+'" data-settings-action="'+esc(action)+'"><span class="haSettingsRowIconV722">'+icon(ic)+'</span><span class="haSettingsRowTextV722"><b>'+esc(title)+'</b><span>'+esc(desc)+'</span></span><span class="haSettingsRowEndV722">'+(end?esc(end):'')+icon('chev')+'</span></button>'}
  function switchRow(key,ic,title,desc){var on=!!prefs[key];return '<div class="haSettingsRowV722" data-setting-row="'+esc(key)+'"><span class="haSettingsRowIconV722">'+icon(ic)+'</span><span class="haSettingsRowTextV722"><b>'+esc(title)+'</b><span>'+esc(desc)+'</span></span><button type="button" class="haSettingsSwitchV722 '+(on?'on':'')+'" data-setting-switch="'+esc(key)+'" aria-pressed="'+(on?'true':'false')+'" aria-label="'+esc(title)+'"></button></div>'}
  function header(title){return '<header class="haSettingsHeaderV722" data-settings-header="1"><div class="haSettingsHeadingV722"><h1 title="'+esc(title)+'">'+esc(title)+'</h1></div><button type="button" class="haSettingsCloseV722" data-settings-close aria-label="Fermer" title="Fermer">'+icon('close')+'</button></header>'}
  function shell(title,sub,body,subview){panel.innerHTML='<div class="haSettingsShellV722">'+header(title,sub,subview)+'<main class="haSettingsScrollV722" id="haSettingsScrollV722">'+body+'</main></div>';view=subview||'main';bindPanel();}

  function captureMainPosition(actionNode){
    var sc=$('haSettingsScrollV722');
    if(!sc||view!=='main')return;
    mainScroll=Math.max(0,sc.scrollTop||0);
    var row=actionNode&&actionNode.closest?actionNode.closest('[data-settings-action]'):null;
    if(!row){
      var rows=[].slice.call(sc.querySelectorAll('[data-settings-action]'));
      var scRect=sc.getBoundingClientRect();
      row=rows.find(function(node){return node.getBoundingClientRect().bottom>scRect.top+1})||rows[0]||null;
    }
    if(row){
      var r=row.getBoundingClientRect(),sr=sc.getBoundingClientRect();
      mainAnchor={action:clean(row.dataset.settingsAction),offset:r.top-sr.top,scrollTop:mainScroll};
    }else mainAnchor={action:'',offset:0,scrollTop:mainScroll};
  }
  function mainTargetPosition(sc){
    var target=Math.max(0,mainScroll||0);
    if(mainAnchor&&mainAnchor.action){
      var action=String(mainAnchor.action).replace(/"/g,'\\"');
      var row=sc.querySelector('[data-settings-action="'+action+'"]');
      if(row){
        var rr=row.getBoundingClientRect(),sr=sc.getBoundingClientRect();
        target=Math.max(0,(sc.scrollTop||0)+(rr.top-sr.top)-Number(mainAnchor.offset||0));
      }
    }
    var max=Math.max(0,(sc.scrollHeight||0)-(sc.clientHeight||0));
    return Math.min(target,max);
  }
  function restoreMainPosition(fluid){
    var token=++mainRestoreToken;
    var sc=$('haSettingsScrollV722');
    if(!sc||view!=='main')return;
    if(fluid)panel.classList.add('haSettingsRestoringV736');
    sc.style.scrollBehavior='auto';
    sc.scrollTop=mainTargetPosition(sc);
    requestAnimationFrame(function(){
      if(token!==mainRestoreToken||view!=='main')return;
      var live=$('haSettingsScrollV722');if(!live)return;
      var target=mainTargetPosition(live);
      if(Math.abs((live.scrollTop||0)-target)>.5)live.scrollTop=target;
      requestAnimationFrame(function(){
        if(token!==mainRestoreToken)return;
        panel.classList.remove('haSettingsRestoringV736');
        live.style.scrollBehavior='';
      });
    });
  }
  function refreshMainControls(){
    if(view!=='main')return false;
    var sc=$('haSettingsScrollV722');if(!sc)return false;
    [].slice.call(sc.querySelectorAll('[data-setting-switch]')).forEach(function(sw){
      var key=clean(sw.dataset.settingSwitch),on=!!prefs[key];
      sw.classList.toggle('on',on);
      sw.setAttribute('aria-pressed',on?'true':'false');
    });
    function updateEnd(action,value){
      var row=sc.querySelector('[data-settings-action="'+action+'"]');
      var end=row&&row.querySelector('.haSettingsRowEndV722');
      if(end)end.innerHTML=(value?esc(value):'')+icon('chev');
    }
    updateEnd('account-type',labelType(prefs.account_type));
    updateEnd('message-preference',labelMessage(prefs.message_preference));
    updateEnd('language',labelLanguage(prefs.language));
    return true;
  }
  function renderMain(){
    var fluidReturn=view!=='main'&&!!mainAnchor;
    var account=section('Compte',
      row('profile-info','profile-edit','Informations personnelles','Nom, bio et localisation','')+
      row('account-type','id-card','Type de compte','Personnel, créateur ou entreprise',labelType(prefs.account_type))
    );
    var privacy=section('Confidentialité',
      switchRow('account_public','eye','Compte public','Autoriser la consultation du profil')+
      switchRow('allow_comments','comment','Commentaires','Autoriser les commentaires')+
      switchRow('allow_messages','message','Messages','Autoriser les nouveaux messages')+
      row('message-preference','message-settings','Qui peut me contacter','Choisir les personnes autorisées',labelMessage(prefs.message_preference))+
      switchRow('show_following','users','Liste des abonnements','Afficher les comptes suivis')+
      switchRow('location_visible','pin','Localisation','Afficher la localisation sur le profil')
    );
    var security=section('Sécurité',
      row('password','key-lock','Mot de passe','Modifier le mot de passe','')+
      row('devices','devices','Appareils connectés','Gérer les sessions actives','')
    );
    var notifications=section('Notifications',
      row('notifications','bell','Notifications','Messages, commentaires et abonnements','')
    );
    var content=section('Contenu',
      switchRow('allow_download','download','Téléchargements','Autoriser le téléchargement des contenus')+
      switchRow('allow_share','share','Partages','Autoriser le partage des publications')+
      switchRow('collaborations','handshake','Collaborations','Recevoir des propositions professionnelles')
    );
    var language=section('Langue',
      row('language','language','Langue de l’application','Langue utilisée dans HAPPYAD',labelLanguage(prefs.language))
    );
    var verification=section('Vérification',
      row('verify-personal','shield-check','Vérification personnelle','Confirmer l’identité du propriétaire','')+
      row('verify-business','badge-check','Entreprise ou personnalité','Demander une vérification professionnelle','')
    );
    var data=section('Stockage et données',
      row('free-space','storage-clean','Libérer mon espace','Voir et vider le cache local','')
    );
    var help=section('Aide et commentaires',
      row('support','help','Signaler un problème','Contacter l’équipe HAPPYAD','')+
      row('terms','file-text','Conditions et confidentialité','Consulter les règles du service','')
    );
    var danger=section('Gestion du compte',
      row('deactivate','pause-circle','Désactiver le compte','Masquer temporairement le profil','','danger')+
      row('delete','trash','Supprimer le compte','Demander la suppression des données','','danger')+
      row('logout','logout','Se déconnecter','Fermer la session sur cet appareil','','danger')
    );
    shell('Paramètres','',account+privacy+security+notifications+content+language+verification+data+help+danger,'main');
    restoreMainPosition(fluidReturn);
  }
  function labelType(v){return v==='business'?'Entreprise':v==='creator'?'Créateur':'Personnel'}
  function labelLanguage(v){return v==='en'?'English':v==='sw'?'Kiswahili':v==='ln'?'Lingala':'Français'}
  function labelMessage(v){return v==='followers'?'Abonnés':v==='requests'?'Demandes':v==='nobody'?'Personne':'Tout le monde'}

  function status(msg,kind){var s=$('haSettingsStatusV722');if(!s)return;s.textContent=msg;s.className='haSettingsStatusV722 show '+(kind||'')}
  function pushMaster(){try{if(window.parent&&window.parent!==window&&window.parent.HappyPushMaster)return window.parent.HappyPushMaster}catch(_e){}try{return window.HappyPushMaster||null}catch(_e){return null}}
  function pushStatusLabelV776(info){
    if(!info||info.supported===false)return 'Les notifications Push ne sont pas prises en charge sur ce téléphone.';
    if(info.permission==='denied')return 'Autorisation bloquée dans les paramètres du navigateur ou du téléphone.';
    if(info.permission==='granted'&&info.subscribed)return 'Notifications système actives sur ce lien.';
    if(info.permission==='granted')return 'Autorisation accordée, mais le lien doit encore être enregistré.';
    return 'Notifications système non activées.';
  }
  async function refreshPushSystemStatusV776(){
    var text=$('haPushSystemStatusV776'),btn=$('haPushSystemActionV776'),master=pushMaster();
    if(!text||!btn)return;
    if(!master||typeof master.status!=='function'){text.textContent='Le moteur Push sera disponible après la mise à jour complète de HAPPYAD.';btn.disabled=true;return}
    try{var info=await master.status();text.textContent=pushStatusLabelV776(info);btn.disabled=false;btn.textContent=info&&info.permission==='granted'&&info.subscribed?'Réenregistrer ce lien':(info&&info.permission==='denied'?'Voir les instructions':'Activer les notifications')}catch(_e){text.textContent='État des notifications indisponible.';btn.disabled=false}
  }
  async function activatePushSystemV776(e){
    stop(e);var btn=e.currentTarget,master=pushMaster();if(!master){status('Moteur Push indisponible.','bad');return}
    disable(btn,true,'Activation...');
    try{
      var result=await (typeof master.activate==='function'?master.activate():null);
      if(result)status('Notifications activées sur ce lien uniquement.','ok');
      await refreshPushSystemStatusV776();
    }catch(err){status('Activation impossible : '+clean(err&&err.message||err),'bad')}finally{disable(btn,false);setTimeout(refreshPushSystemStatusV776,80)}
  }
  function disable(btn,on,label){if(!btn)return;btn.disabled=!!on;if(on){btn.dataset.oldText=btn.textContent;btn.textContent=label||'Traitement...'}else if(btn.dataset.oldText){btn.textContent=btn.dataset.oldText;delete btn.dataset.oldText}}
  async function authUser(){var c=client();if(c&&c.auth&&c.auth.getUser){try{var r=await c.auth.getUser();if(r&&r.data&&r.data.user)return r.data.user}catch(_e){}}var id=uid();return id?{id:id,email:userInfo().email}:null}
  function settingsRow(){return Object.assign({user_id:uid(),updated_at:new Date().toISOString()},prefs)}
  async function savePrefs(patch,quiet){prefs=Object.assign({},prefs,patch||{});writeLocal();var c=client(),u=await authUser();if(c&&u&&u.id){try{var r=await c.from('happyad_user_settings').upsert(Object.assign({},settingsRow(),{user_id:u.id}),{onConflict:'user_id'});if(r&&r.error)throw r.error;remoteReady=true;if(!quiet)toast('Paramètre enregistré');return true}catch(e){if(!quiet)toast('Enregistré sur cet appareil')}}else if(!quiet)toast('Paramètre enregistré sur cet appareil');return false}
  async function loadRemote(){readLocal();var c=client(),u=await authUser();if(!c||!u||!u.id)return false;try{var r=await c.from('happyad_user_settings').select('*').eq('user_id',u.id).maybeSingle();if(r&&r.error)throw r.error;if(r&&r.data){Object.keys(prefs).forEach(function(k){if(r.data[k]!==undefined&&r.data[k]!==null)prefs[k]=typeof prefs[k]==='boolean'?bool(r.data[k],prefs[k]):r.data[k]});writeLocal()}remoteReady=true;if(view==='main')refreshMainControls();return true}catch(_e){remoteReady=false;return false}}
  async function insertRequest(type,payload){var c=client(),u=await authUser();if(!c||!u||!u.id)throw new Error('Connecte-toi pour envoyer cette demande.');var r=await c.from('happyad_account_requests').insert({user_id:u.id,request_type:type,payload:payload||{},status:'pending',created_at:new Date().toISOString()});if(r&&r.error)throw r.error;return true}
  async function updateProfileRemote(payloads){var c=client(),u=await authUser();if(!c||!u||!u.id)throw new Error('Compte non connecté');var last=null;for(var i=0;i<payloads.length;i++){try{var r=await c.from('profiles').update(payloads[i]).eq('id',u.id);if(r&&r.error)throw r.error;return true}catch(e){last=e}}throw last||new Error('Mise à jour impossible')}
  function saveLocalUser(patch){try{var u=localUser();u=Object.assign({},u,patch||{});localStorage.setItem('HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL',JSON.stringify(u));if(window.UserStore){window.UserStore.data=Object.assign({},window.UserStore.data||{},patch||{});if(window.UserStore.save)window.UserStore.save()}}catch(_e){}}

  function openProfileInfo(){var u=userInfo();shell('Informations personnelles','Identité visible sur HAPPYAD','<div class="haSettingsCardV722"><h2>Profil public</h2><p>Ces informations sont utilisées sur ton profil, tes publications et tes conversations.</p></div><form id="haSettingsProfileFormV722" class="haSettingsFormV722"><div class="haSettingsFieldV722"><label>Nom affiché</label><input class="haSettingsInputV722" id="haSetNameV722" maxlength="80" value="'+esc(u.name)+'" required></div><div class="haSettingsFieldV722"><label>Nom d’utilisateur</label><input class="haSettingsInputV722" id="haSetUsernameV722" maxlength="40" value="'+esc(u.handle.replace(/^@+/,''))+'" required></div><div class="haSettingsFieldV722"><label>Biographie</label><textarea class="haSettingsTextareaV722" id="haSetBioV722" maxlength="400">'+esc(u.bio)+'</textarea></div><div class="haSettingsFieldV722"><label>Localisation</label><input class="haSettingsInputV722" id="haSetCountryV722" maxlength="100" value="'+esc(u.country)+'"></div><div class="haSettingsFieldV722"><label>Date de naissance</label><input type="date" class="haSettingsInputV722" id="haSetBirthV722" value="'+esc(u.birth)+'"></div><div class="haSettingsActionsV722"><button class="haSettingsPrimaryV722" type="submit">Enregistrer les modifications</button></div><div id="haSettingsStatusV722" class="haSettingsStatusV722"></div></form>','profile-info')}
  async function submitProfile(e){stop(e);var form=e.currentTarget,btn=form.querySelector('button[type=submit]'),name=clean($('haSetNameV722').value),username=clean($('haSetUsernameV722').value).replace(/^@+/,'').replace(/\s+/g,''),bio=clean($('haSetBioV722').value),country=clean($('haSetCountryV722').value),birth=clean($('haSetBirthV722').value);if(!name||!username){status('Le nom et le nom d’utilisateur sont obligatoires.','bad');return}disable(btn,true,'Enregistrement...');var patch={name:name,full_name:name,handle:username,username:username,bio:bio,country:country,birthDate:birth,birth_date:birth};saveLocalUser(patch);try{await updateProfileRemote([{full_name:name,username:username,bio:bio,country:country,birth_date:birth,updated_at:new Date().toISOString()},{full_name:name,username:username,bio:bio,country:country},{full_name:name,username:username,bio:bio},{full_name:name,username:username}]);status('Informations enregistrées.','ok')}catch(err){status('Informations enregistrées sur cet appareil. La synchronisation sera reprise automatiquement.','ok')}finally{disable(btn,false)}}

  function openChoicePage(type){var isType=type==='account-type',title=isType?'Type de compte':'Langue',sub=isType?'Choisir la catégorie adaptée au profil':'Choisir la langue de préférence',items=isType?[['personal','Personnel','Pour utiliser HAPPYAD à titre individuel.'],['creator','Créateur','Pour développer une audience et publier régulièrement.'],['business','Entreprise','Pour une marque, une organisation ou une activité professionnelle.']]:[['fr','Français','Langue principale de l’interface.'],['en','English','Préférence anglaise pour les modules compatibles.'],['sw','Kiswahili','Préférence kiswahili pour les modules compatibles.'],['ln','Lingala','Préférence lingala pour les modules compatibles.']],key=isType?'account_type':'language',html='<div class="haSettingsNoteV722">Le choix est enregistré sur le compte et sur cet appareil.</div>';items.forEach(function(x){html+='<button type="button" class="haSettingsChoiceV722 '+(prefs[key]===x[0]?'active':'')+'" data-choice-key="'+key+'" data-choice-value="'+x[0]+'"><span><b>'+esc(x[1])+'</b><span>'+esc(x[2])+'</span></span><i></i></button>'});html+='<div id="haSettingsStatusV722" class="haSettingsStatusV722"></div>';shell(title,sub,html,type)}
  async function choose(e){var b=e.target.closest('[data-choice-key]');if(!b)return;stop(e);var key=b.dataset.choiceKey,val=b.dataset.choiceValue,patch={};patch[key]=val;await savePrefs(patch,true);if(key==='account_type'){saveLocalUser({type:val});try{await updateProfileRemote([{type:val,updated_at:new Date().toISOString()},{account_type:val,updated_at:new Date().toISOString()},{type:val}])}catch(_e){}}openChoicePage(key==='account_type'?'account-type':'language');status('Choix enregistré.','ok')}

  function openPassword(){shell('Mot de passe','Sécuriser l’accès au compte','<div class="haSettingsCardV722"><h2>Nouveau mot de passe</h2><p>Utilise au moins huit caractères. La modification s’applique immédiatement au compte connecté.</p></div><form id="haSettingsPasswordFormV722" class="haSettingsFormV722"><div class="haSettingsFieldV722"><label>Nouveau mot de passe</label><input type="password" autocomplete="new-password" class="haSettingsInputV722" id="haSetPassV722" minlength="8" required></div><div class="haSettingsFieldV722"><label>Confirmer le mot de passe</label><input type="password" autocomplete="new-password" class="haSettingsInputV722" id="haSetPass2V722" minlength="8" required></div><div class="haSettingsActionsV722"><button class="haSettingsPrimaryV722" type="submit">Modifier le mot de passe</button></div><div id="haSettingsStatusV722" class="haSettingsStatusV722"></div></form>','password')}
  async function submitPassword(e){stop(e);var form=e.currentTarget,btn=form.querySelector('button[type=submit]'),a=$('haSetPassV722').value,b=$('haSetPass2V722').value;if(a.length<8){status('Le mot de passe doit contenir au moins huit caractères.','bad');return}if(a!==b){status('Les deux mots de passe ne correspondent pas.','bad');return}var c=client();if(!c||!c.auth){status('Service de connexion indisponible.','bad');return}disable(btn,true,'Modification...');try{var r=await c.auth.updateUser({password:a});if(r&&r.error)throw r.error;form.reset();status('Mot de passe modifié avec succès.','ok')}catch(err){status('Modification impossible : '+clean(err&&err.message||err),'bad')}finally{disable(btn,false)}}

  function deviceName(){var ua=navigator.userAgent||'';if(/android/i.test(ua))return 'Téléphone Android';if(/iphone|ipad/i.test(ua))return 'Appareil Apple';if(/windows/i.test(ua))return 'Ordinateur Windows';if(/macintosh/i.test(ua))return 'Ordinateur Mac';return 'Appareil actuel'}
  function openDevices(){shell('Appareils connectés','Contrôle des sessions actives','<div class="haSettingsCardV722"><div class="haSettingsDeviceV722"><span class="haSettingsDeviceIconV722">'+icon('phone')+'</span><div><b>'+esc(deviceName())+'</b><span>Session actuelle · '+esc((navigator.platform||'Navigateur'))+'</span></div></div></div><div class="haSettingsNoteV722">Tu peux fermer toutes les autres sessions sans déconnecter cet appareil.</div><div class="haSettingsActionsV722"><button type="button" class="haSettingsDangerV722" id="haSignoutOthersV722">Déconnecter les autres appareils</button></div><div id="haSettingsStatusV722" class="haSettingsStatusV722"></div>','devices')}
  async function signoutOthers(e){stop(e);var b=e.currentTarget,c=client();if(!c||!c.auth){status('Service de connexion indisponible.','bad');return}disable(b,true,'Déconnexion...');try{var r=await c.auth.signOut({scope:'others'});if(r&&r.error)throw r.error;status('Les autres sessions ont été fermées.','ok')}catch(err){status('Impossible de fermer les autres sessions : '+clean(err&&err.message||err),'bad')}finally{disable(b,false)}}

  function openMessagePreference(){var items=[['everyone','Tout le monde','Les messages arrivent directement.'],['followers','Abonnés uniquement','Seuls les abonnés peuvent écrire directement.'],['requests','Demandes uniquement','Les nouveaux messages restent dans les demandes.'],['nobody','Personne','Aucun nouveau contact autorisé.']],html='';items.forEach(function(x){html+='<button type="button" class="haSettingsChoiceV722 '+(prefs.message_preference===x[0]?'active':'')+'" data-choice-key="message_preference" data-choice-value="'+x[0]+'"><span><b>'+esc(x[1])+'</b><span>'+esc(x[2])+'</span></span><i></i></button>'});html+='<div id="haSettingsStatusV722" class="haSettingsStatusV722"></div>';shell('Préférence des messages','Qui peut contacter ce compte',html,'message-preference')}
  function openNotifications(){var body='<div class="haSettingsCardV722"><h2>Notifications du téléphone</h2><p id="haPushSystemStatusV776">Vérification de l’autorisation...</p><div class="haSettingsActionsV722"><button type="button" class="haSettingsPrimaryV722" id="haPushSystemActionV776">Activer les notifications</button></div></div><div class="haSettingsNoteV722">Les réglages ci-dessous contrôlent les catégories reçues par le compte.</div>'+section('Catégories',switchRow('notify_messages','message','Nouveaux messages','Prévenir lors de la réception d’un message')+switchRow('notify_comments','comment','Commentaires et réponses','Prévenir pour les interactions sur les publications')+switchRow('notify_follows','user-plus','Nouveaux abonnés','Prévenir lors d’un nouvel abonnement')+switchRow('notify_marketing','megaphone','Actualités HAPPYAD','Recevoir les annonces importantes de la plateforme'))+'<div id="haSettingsStatusV722" class="haSettingsStatusV722"></div>';shell('Notifications','Choisir les alertes importantes',body,'notifications');setTimeout(refreshPushSystemStatusV776,30)}

  function openVerification(kind){var business=kind==='business',title=business?'Entreprise ou personnalité':'Vérification personnelle';shell(title,'Envoyer une demande de vérification','<div class="haSettingsCardV722"><h2>'+esc(title)+'</h2><p>'+(business?'Cette demande concerne une entreprise, une organisation, une marque ou une personnalité publique.':'Cette demande confirme que le profil appartient à une personne réelle.')+'</p></div><form id="haSettingsVerifyFormV722" data-verify-kind="'+(business?'business':'personal')+'" class="haSettingsFormV722"><div class="haSettingsFieldV722"><label>Motif de la demande</label><textarea class="haSettingsTextareaV722" id="haVerifyNoteV722" maxlength="800" placeholder="Explique brièvement pourquoi ce compte doit être vérifié" required></textarea></div><div class="haSettingsNoteV722">Les documents sensibles seront demandés uniquement dans l’étape sécurisée de vérification.</div><div class="haSettingsActionsV722"><button type="submit" class="haSettingsPrimaryV722">Envoyer la demande</button></div><div id="haSettingsStatusV722" class="haSettingsStatusV722"></div></form>','verify-'+kind)}
  async function submitVerification(e){stop(e);var f=e.currentTarget,b=f.querySelector('button[type=submit]'),kind=f.dataset.verifyKind,note=clean($('haVerifyNoteV722').value);if(note.length<10){status('Ajoute une explication plus précise.','bad');return}disable(b,true,'Envoi...');try{await insertRequest(kind==='business'?'verification_business':'verification_personal',{note:note,account_type:prefs.account_type});saveLocalUser({verificationPending:true});status('Demande envoyée. Son état sera visible dans le compte.','ok');f.reset()}catch(err){status('Envoi impossible : '+clean(err&&err.message||err)+'. Réessaie dans un instant.','bad')}finally{disable(b,false)}}

  var STORAGE_CACHE_LOCAL_PREFIXES_V734B=[
    'HAPPYAD_GLOBAL_POSTS_CACHE_V1','HAPPYAD_HOME_POSTS_CACHE_V1','HAPPYAD_HOME_BOOT_CACHE','HAPPYAD_ALL_POSTS_V1',
    'HAPPYAD_SEARCH_POSTS_FAST_CACHE_V1','HAPPYAD_HOME_BOOT_SNAPSHOT_V1','HAPPYAD_HOME_CONFIRMED_ORDER_V643',
    'HAPPYAD_VIDEO_CACHE_STABLE_V1','HAPPYAD_PHOTO_STABLE_CACHE_V1','HAPPYAD_STORIES_CACHE_V1',
    'HAPPYAD_AUTHOR_PROFILE_CACHE_V1','HAPPYAD_PUBLIC_PROFILE_CACHE_V1','HAPPYAD_PUBLIC_PROFILE_POSTS_CACHE_V1',
    'HAPPYAD_PROFILE_POSTS_CACHE_V1','HAPPYAD_USER_POSTS_CACHE_V1','HAPPYAD_PROFILE_OWN_POSTS_STABLE_CACHE_V1',
    'HAPPYAD_PROFILE_HOME_PHOTO_BRIDGE_V482','HAPPYAD_FAST_OPEN_PHOTO_V1','HAPPYAD_FAST_OPEN_VIDEO_V1',
    'HAPPYAD_VIDEO_THUMB_V1_','HAPPYAD_PHOTO_FAST_CACHE','HAPPYAD_VIDEO_FAST_CACHE',
    'HAPPYAD_FIXED_RADAR_PUBLIC_CONFIG_V1','HAPPYAD_SEARCH_POSTS_FAST_CACHE_V1'
  ];
  var STORAGE_CACHE_SESSION_KEYS_V734B=[
    'HAPPYAD_SESSION_PROFILE_POSTS_V104','HAPPYAD_SESSION_ALL_POSTS_V104','HAPPYAD_VIDEO_LAST_PAINT_V273',
    'HAPPYAD_FAST_OPEN_PHOTO_V1','HAPPYAD_FAST_OPEN_VIDEO_V1','HAPPYAD_PROFILE_FAST_BOOT_PAINTED_V573',
    'HAPPYAD_PROFILE_OWN_POSTS_STABLE_CACHE_V1','HAPPYAD_PROFILE_POSTS_CACHE_V1','HAPPYAD_USER_POSTS_CACHE_V1'
  ];
  function byteLengthV734B(value){try{return new Blob([String(value==null?'':value)]).size}catch(_e){return String(value==null?'':value).length*2}}
  function formatBytesV734B(bytes){var n=Math.max(0,Number(bytes||0));if(n<1024)return Math.round(n)+' o';if(n<1024*1024)return (n/1024).toFixed(n<10240?1:0)+' Ko';if(n<1024*1024*1024)return (n/(1024*1024)).toFixed(n<10*1024*1024?1:0)+' Mo';return (n/(1024*1024*1024)).toFixed(2)+' Go'}
  function isTemporaryLocalKeyV734B(key){key=clean(key);if(!key)return false;if(key.indexOf('HAPPYAD_MSG_CONNECTED_PROFILE_V1:')===0)return true;return STORAGE_CACHE_LOCAL_PREFIXES_V734B.some(function(prefix){return key===prefix||key.indexOf(prefix+':')===0||key.indexOf(prefix+'_')===0})}
  function localCacheBytesV734B(){var total=0;try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&isTemporaryLocalKeyV734B(k)){var v=localStorage.getItem(k)||'';total+=byteLengthV734B(k)+byteLengthV734B(v)}}}catch(_e){}try{STORAGE_CACHE_SESSION_KEYS_V734B.forEach(function(k){var v=sessionStorage.getItem(k);if(v!=null)total+=byteLengthV734B(k)+byteLengthV734B(v)})}catch(_e){}return total}
  function isRemovableCacheNameV734B(name){name=clean(name);return /runtime/i.test(name)||name==='happyad-message-media-v1'||name==='HAPPYAD_SPONSOR_MEDIA_CACHE_V1'}
  async function cacheStorageBytesV734B(){if(!('caches'in window))return 0;var total=0;try{var names=await caches.keys();for(var i=0;i<names.length;i++){if(!isRemovableCacheNameV734B(names[i]))continue;var cache=await caches.open(names[i]),requests=await cache.keys();for(var j=0;j<requests.length;j++){try{var response=await cache.match(requests[j]);if(!response)continue;var header=Number(response.headers.get('content-length')||0);if(header>0)total+=header;else total+=(await response.clone().blob()).size}catch(_e){}}}}catch(_e){}return total}
  function estimateValueBytesV734B(value,seen){if(value==null)return 0;if(typeof value==='string')return byteLengthV734B(value);if(typeof value==='number'||typeof value==='boolean')return 8;if(typeof Blob!=='undefined'&&value instanceof Blob)return Number(value.size||0);if(typeof ArrayBuffer!=='undefined'&&value instanceof ArrayBuffer)return Number(value.byteLength||0);if(typeof ArrayBuffer!=='undefined'&&ArrayBuffer.isView&&ArrayBuffer.isView(value))return Number(value.byteLength||0);if(typeof value!=='object')return 0;seen=seen||new Set();if(seen.has(value))return 0;seen.add(value);var total=0;if(Array.isArray(value)){value.forEach(function(item){total+=estimateValueBytesV734B(item,seen)});return total}Object.keys(value).forEach(function(k){total+=byteLengthV734B(k)+estimateValueBytesV734B(value[k],seen)});return total}
  function messageDbNamesV734B(){var current=uid(),fallback=current?['happyad-msg-v38a1-'+current]:[];if(!window.indexedDB)return Promise.resolve([]);if(typeof window.indexedDB.databases!=='function')return Promise.resolve(fallback);return window.indexedDB.databases().then(function(list){return (list||[]).map(function(x){return clean(x&&x.name)}).filter(function(name){return name.indexOf('happyad-msg-v38a1-')===0})}).catch(function(){return fallback})}
  function openExistingDbV734B(name){return new Promise(function(resolve){if(!name||!window.indexedDB){resolve(null);return}var req;try{req=indexedDB.open(name)}catch(_e){resolve(null);return}req.onsuccess=function(){resolve(req.result)};req.onerror=function(){resolve(null)};req.onblocked=function(){resolve(null)}})}
  async function messageMediaBytesV734B(){if(!window.indexedDB)return 0;var names=await messageDbNamesV734B(),total=0;for(var i=0;i<names.length;i++){var db=await openExistingDbV734B(names[i]);if(!db)continue;try{if(!db.objectStoreNames.contains('media_cache')){db.close();continue}total+=await new Promise(function(resolve){var sum=0,tx=db.transaction('media_cache','readonly'),req=tx.objectStore('media_cache').openCursor();req.onsuccess=function(){var cursor=req.result;if(!cursor){resolve(sum);return}sum+=estimateValueBytesV734B(cursor.value);cursor.continue()};req.onerror=function(){resolve(sum)};tx.onabort=function(){resolve(sum)}})}catch(_e){}try{db.close()}catch(_e){}}return total}
  async function storageSnapshotV734B(){var estimate={usage:0,quota:0};try{if(navigator.storage&&navigator.storage.estimate)estimate=await navigator.storage.estimate()||estimate}catch(_e){}var parts=await Promise.all([Promise.resolve(localCacheBytesV734B()),cacheStorageBytesV734B(),messageMediaBytesV734B()]);return {usage:Number(estimate.usage||0),quota:Number(estimate.quota||0),temporary:Math.max(0,parts.reduce(function(a,b){return a+Number(b||0)},0))}}
  function renderStorageSnapshotV734B(info){if(view!=='free-space')return;info=info||{};var usage=Math.max(0,Number(info.usage||0)),temporary=Math.min(usage||Number.MAX_SAFE_INTEGER,Math.max(0,Number(info.temporary||0))),protectedBytes=Math.max(0,usage-temporary);var used=$('haStorageUsedV734B'),cache=$('haStorageCacheV734B'),system=$('haStorageProtectedV734B'),bar=$('haStorageBarV734B');if(used)used.textContent=usage?formatBytesV734B(usage)+' utilisés':'Moins de 1 Ko utilisé';if(cache)cache.textContent=temporary?('Environ '+formatBytesV734B(temporary)):'Cache presque vide';if(system)system.textContent=formatBytesV734B(protectedBytes);if(bar){var ratio=usage?Math.max(3,Math.min(96,(temporary/usage)*100)):3;bar.style.width=ratio+'%'} }
  async function refreshStorageV734B(){var used=$('haStorageUsedV734B'),cache=$('haStorageCacheV734B');if(used)used.textContent='Calcul en cours…';if(cache)cache.textContent='Calcul en cours…';try{renderStorageSnapshotV734B(await storageSnapshotV734B())}catch(_e){if(used)used.textContent='Espace local disponible';if(cache)cache.textContent='Taille indisponible'}}
  function openFreeSpace(){shell('Libérer mon espace','Données stockées sur cet appareil','<section class="haStorageOverviewV734B"><span class="haStorageEyebrowV734B">Données HAPPYAD</span><strong id="haStorageUsedV734B">Calcul en cours…</strong><div class="haStorageTrackV734B"><i id="haStorageBarV734B"></i></div><div class="haStorageLegendV734B"><span><i class="cache"></i>Cache temporaire</span><span><i class="protected"></i>Données protégées</span></div></section><section class="haStorageCardV734B"><div class="haStorageCardHeadV734B"><div><h2>Cache temporaire</h2><strong id="haStorageCacheV734B">Calcul en cours…</strong></div><button type="button" id="haClearStorageV734B">Effacer</button></div><p>Supprime les miniatures, aperçus, médias déjà consultés dans Messages et données de chargement. Le compte, les publications, les conversations et les données Supabase restent intacts.</p></section><section class="haStorageProtectedV734B"><h2>Données protégées</h2><strong id="haStorageProtectedV734B">—</strong><p>Connexion, paramètres, brouillons, conversations et fichiers nécessaires au fonctionnement.</p></section><p class="haStorageFootV734B">Les données locales sont conservées dans le stockage sécurisé du navigateur ou de l’application sur cet appareil. Certains fichiers système indispensables ne peuvent pas être supprimés ici.</p><div id="haSettingsStatusV722" class="haSettingsStatusV722"></div>','free-space');refreshStorageV734B()}
  function clearLocalCacheKeysV734B(){var removed=0;try{var keys=[];for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&isTemporaryLocalKeyV734B(k))keys.push(k)}keys.forEach(function(k){try{localStorage.removeItem(k);removed++}catch(_e){}})}catch(_e){}try{STORAGE_CACHE_SESSION_KEYS_V734B.forEach(function(k){if(sessionStorage.getItem(k)!=null){sessionStorage.removeItem(k);removed++}})}catch(_e){}return removed}
  async function clearCacheStorageV734B(){if(!('caches'in window))return 0;try{var names=await caches.keys(),targets=names.filter(isRemovableCacheNameV734B),results=await Promise.all(targets.map(function(name){return caches.delete(name)}));return results.filter(Boolean).length}catch(_e){return 0}}
  async function clearMessageMediaV734B(){if(!window.indexedDB)return 0;var names=await messageDbNamesV734B(),cleared=0;for(var i=0;i<names.length;i++){var db=await openExistingDbV734B(names[i]);if(!db)continue;try{if(db.objectStoreNames.contains('media_cache')){await new Promise(function(resolve){var tx=db.transaction('media_cache','readwrite'),req=tx.objectStore('media_cache').clear();req.onsuccess=function(){resolve(true)};req.onerror=function(){resolve(false)};tx.oncomplete=function(){resolve(true)};tx.onabort=function(){resolve(false)}});cleared++}}catch(_e){}try{db.close()}catch(_e){}}return cleared}
  async function clearTemporaryStorageV734B(e){stop(e);var b=e.currentTarget;disable(b,true,'Effacement…');var before=0;try{var snap=await storageSnapshotV734B();before=Number(snap.usage||0);await Promise.all([Promise.resolve(clearLocalCacheKeysV734B()),clearCacheStorageV734B(),clearMessageMediaV734B()]);try{localStorage.setItem('HAPPYAD_HOME_REFRESH_NEEDED','1');localStorage.setItem('HAPPYAD_PROFILE_REFRESH_NEEDED','1');localStorage.setItem('HAPPYAD_RADAR_REFRESH_NEEDED','1');localStorage.setItem('HAPPYAD_MESSAGES_REFRESH_NEEDED','1')}catch(_e){}try{window.__HAPPYAD_PUBLIC_PROFILE_RAM_CACHE__={};window.__HAPPYAD_STORIES_ITEMS_CACHE=[]}catch(_e){}try{window.parent&&window.parent!==window&&window.parent.postMessage({type:'HAPPYAD_LOCAL_CACHE_CLEARED_V734B',detail:{source:'profile-settings'}},'*')}catch(_e){}var after=await storageSnapshotV734B(),freed=Math.max(0,before-Number(after.usage||0));renderStorageSnapshotV734B(after);status(freed?('Cache vidé · '+formatBytesV734B(freed)+' libérés'):'Cache vidé. Les données du compte sont intactes.','ok')}catch(err){status('Impossible de vider complètement le cache. Réessaie dans un instant.','bad')}finally{disable(b,false)}}
  var supportOpenAtV755=0;
  function openSupport(){
    var nowV755=Date.now();if(nowV755-supportOpenAtV755<450)return true;supportOpenAtV755=nowV755;
    var u=userInfo(),detail={source:'settings',returnTarget:'profile-settings',uid:uid(),language:prefs.language,country:u.country,user:{id:uid(),name:u.name,username:u.handle,avatar:u.avatar}};
    try{
      var target=(window.parent&&window.parent!==window)?window.parent:window;
      var master=target.HappyadAssistanceMasterV757;
      if(master&&typeof master.open==='function')return master.open(detail);
      if(target!==window){target.postMessage({type:'HAPPYAD_ASSISTANCE_V757_OPEN',detail:detail},location.origin);return true}
    }catch(_e){}
    toast('Assistance momentanément indisponible.');
    return false
  }
  function openTerms(){shell('Conditions et confidentialité','Principes essentiels du service','<article class="haSettingsCardV722"><h2>Utilisation responsable</h2><p>Chaque utilisateur doit publier des contenus légaux, respecter les autres personnes et protéger ses identifiants de connexion.</p></article><article class="haSettingsCardV722"><h2>Confidentialité</h2><p>Les paramètres de visibilité contrôlent la manière dont le profil et les interactions sont présentés aux autres utilisateurs. Les informations sensibles ne doivent pas être publiées dans les zones publiques.</p></article><article class="haSettingsCardV722"><h2>Modération et sécurité</h2><p>HAPPYAD peut examiner les signalements, limiter un contenu ou suspendre un compte lorsqu’une règle importante est enfreinte.</p></article><article class="haSettingsCardV722"><h2>Suppression des données</h2><p>Une demande de suppression passe par une confirmation de sécurité avant le traitement définitif.</p></article>','terms')}

  function openDanger(kind){var del=kind==='delete',word=del?'SUPPRIMER':'DÉSACTIVER',title=del?'Supprimer le compte':'Désactiver le compte',desc=del?'La demande concerne la suppression définitive du compte et de ses données après contrôle de sécurité.':'La demande masque temporairement le profil après contrôle de sécurité.';shell(title,'Action protégée','<div class="haSettingsCardV722"><h2>'+esc(title)+'</h2><p>'+esc(desc)+'</p></div><form id="haSettingsDangerFormV722" data-danger-kind="'+kind+'" class="haSettingsFormV722"><div class="haSettingsFieldV722"><label>Écrire '+esc(word)+' pour confirmer</label><input class="haSettingsInputV722" id="haDangerConfirmV722" autocomplete="off" required></div><div class="haSettingsFieldV722"><label>Motif facultatif</label><textarea class="haSettingsTextareaV722" id="haDangerReasonV722" maxlength="800"></textarea></div><div class="haSettingsActionsV722"><button type="submit" class="haSettingsDangerV722">Envoyer la demande</button></div><div id="haSettingsStatusV722" class="haSettingsStatusV722"></div></form>','danger-'+kind)}
  async function submitDanger(e){stop(e);var f=e.currentTarget,b=f.querySelector('button[type=submit]'),kind=f.dataset.dangerKind,required=kind==='delete'?'SUPPRIMER':'DÉSACTIVER',typed=clean($('haDangerConfirmV722').value).toUpperCase(),reason=clean($('haDangerReasonV722').value);if(typed!==required&&!(kind==='deactivate'&&typed==='DESACTIVER')){status('Le mot de confirmation ne correspond pas.','bad');return}disable(b,true,'Envoi...');try{await insertRequest(kind==='delete'?'account_delete':'account_deactivate',{reason:reason,confirmed:true});status('Demande enregistrée. Une vérification de sécurité sera effectuée.','ok');f.reset()}catch(err){status('Demande impossible : '+clean(err&&err.message||err)+'. Réessaie dans un instant.','bad')}finally{disable(b,false)}}
  function openLogout(){shell('Se déconnecter','Fermer la session actuelle','<div class="haSettingsCardV722"><h2>Déconnexion de cet appareil</h2><p>Les données publiques restent disponibles. Une nouvelle connexion sera nécessaire pour gérer le compte.</p></div><div class="haSettingsActionsV722"><button type="button" class="haSettingsDangerV722" id="haLogoutConfirmV722">Se déconnecter maintenant</button><button type="button" class="haSettingsSecondaryV722" data-settings-main>Annuler</button></div><div id="haSettingsStatusV722" class="haSettingsStatusV722"></div>','logout')}
  async function logout(e){stop(e);var b=e.currentTarget;disable(b,true,'Déconnexion...');try{var master=pushMaster();if(master&&typeof master.deactivateCurrent==='function'){try{await master.deactivateCurrent()}catch(_push){}}var c=client();if(c&&c.auth)await c.auth.signOut({scope:'local'});try{window.parent&&window.parent!==window&&window.parent.postMessage({type:'HAPPYAD_AUTH_LOGOUT_REQUEST_V595',detail:{source:'profile-settings-v722'}},'*')}catch(_e){}['HAPPYAD_AUTH_UID','HAPPYAD_ADMIN_GRANTED','HAPPYAD_ADMIN_ROLE','HAPPYAD_OPEN_ADMIN_FROM_SETTINGS','HAPPYAD_ACTIVE_PROFILE'].forEach(function(k){try{localStorage.removeItem(k)}catch(_e){}});try{localStorage.setItem('HAPPYAD_SESSION_ACTIVE','0')}catch(_e){}status('Session fermée.','ok');setTimeout(function(){closeSettings();try{window.parent&&window.parent!==window?window.parent.location.reload():location.reload()}catch(_e){location.href='../index.html'}},350)}catch(err){status('Déconnexion impossible : '+clean(err&&err.message||err),'bad');disable(b,false)}}

  function openAction(action,actionNode){captureMainPosition(actionNode);switch(action){case'profile-info':openProfileInfo();break;case'account-type':openChoicePage('account-type');break;case'language':openChoicePage('language');break;case'password':openPassword();break;case'devices':openDevices();break;case'message-preference':openMessagePreference();break;case'notifications':openNotifications();break;case'verify-personal':openVerification('personal');break;case'verify-business':openVerification('business');break;case'free-space':openFreeSpace();break;case'support':openSupport();break;case'terms':openTerms();break;case'deactivate':openDanger('deactivate');break;case'delete':openDanger('delete');break;case'logout':openLogout();break}}
  function bindPanel(){if(!panel)return;panel.onclick=function(e){var close=e.target.closest('[data-settings-close]');if(close){stop(e);if(view==='main')closeSettings();else renderMain();return}var back=e.target.closest('[data-settings-back],[data-settings-main]');if(back){stop(e);if(view==='main')closeSettings();else renderMain();return}var sw=e.target.closest('[data-setting-switch]');if(sw){stop(e);var key=sw.dataset.settingSwitch,patch={},next=!prefs[key];patch[key]=next;prefs[key]=next;sw.classList.toggle('on',next);sw.setAttribute('aria-pressed',next?'true':'false');captureMainPosition(sw.closest('[data-setting-row]'));savePrefs(patch);return}var action=e.target.closest('[data-settings-action]');if(action){stop(e);openAction(action.dataset.settingsAction,action);return}var choice=e.target.closest('[data-choice-key]');if(choice){choose(e);return}};var f=$('haSettingsProfileFormV722');if(f)f.onsubmit=submitProfile;f=$('haSettingsPasswordFormV722');if(f)f.onsubmit=submitPassword;f=$('haSettingsVerifyFormV722');if(f)f.onsubmit=submitVerification;f=$('haSettingsDangerFormV722');if(f)f.onsubmit=submitDanger;var b=$('haSignoutOthersV722');if(b)b.onclick=signoutOthers;b=$('haLogoutConfirmV722');if(b)b.onclick=logout;b=$('haClearStorageV734B');if(b)b.onclick=clearTemporaryStorageV734B;b=$('haPushSystemActionV776');if(b)b.onclick=activatePushSystemV776}

  function notifyParent(type){try{window.parent&&window.parent!==window&&window.parent.postMessage({type:type,detail:{id:'profile-settings',source:'HAPPYAD'}},'*')}catch(_e){}}
  function openSettings(){if(opening||!panel)return false;opening=true;profileScroll=Math.max(0,window.pageYOffset||document.documentElement.scrollTop||document.body.scrollTop||0);mainScroll=0;mainAnchor=null;mainRestoreToken++;readLocal();renderMain();var s=$('haSettingsScrollV722');if(s){s.style.scrollBehavior='auto';s.scrollTop=0;s.style.scrollBehavior=''}document.body.classList.add('haSettingsOpenV722');panel.classList.add('show');panel.setAttribute('aria-hidden','false');notifyParent('HAPPYAD_INTERNAL_SCREEN_OPEN_V591');requestAnimationFrame(function(){opening=false});loadRemote();return false}
  function closeSettings(force){if(!panel)return false;if(!force&&view!=='main'){renderMain();return false}mainRestoreToken++;panel.classList.remove('show');panel.setAttribute('aria-hidden','true');document.body.classList.remove('haSettingsOpenV722');notifyParent('HAPPYAD_INTERNAL_SCREEN_CLOSE_V591');setTimeout(function(){try{window.scrollTo(0,profileScroll)}catch(_e){}},0);return false}
  function install(){panel=$('settingsPanel');if(!panel)return;['settingsPanel','haSettingsPageV712','haSettingsPageV713','haSettingsPageV714','haSettingsPageV715','haSettingsPageV716','haSettingsPageV717','haSettingsPageV718','haSettingsPageV719','haSettingsPageV720','haSettingsPageV721'].forEach(function(c){panel.classList.remove(c)});['happyad-settings-close-critical-v720','happyad-settings-close-critical-v722'].forEach(function(id){var n=$(id);if(n)n.remove()});panel.removeAttribute('style');panel.classList.add('haSettingsPageV722');panel.setAttribute('aria-hidden','true');readLocal();renderMain();var open=$('openSettings');if(open){open.addEventListener('click',function(e){stop(e);openSettings()},true);open.onclick=function(e){stop(e);return openSettings()}}var mo=new MutationObserver(function(){if(panel.classList.contains('show')&&!document.body.classList.contains('haSettingsOpenV722')){document.body.classList.add('haSettingsOpenV722');notifyParent('HAPPYAD_INTERNAL_SCREEN_OPEN_V591')}else if(!panel.classList.contains('show')&&document.body.classList.contains('haSettingsOpenV722')){document.body.classList.remove('haSettingsOpenV722');notifyParent('HAPPYAD_INTERNAL_SCREEN_CLOSE_V591')}});mo.observe(panel,{attributes:true,attributeFilter:['class']});window.addEventListener('message',function(ev){var d=ev&&ev.data||{},detail=d.detail||{};if(d.type==='HAPPYAD_INTERNAL_BACK_EXECUTE_V591'&&clean(detail.id)==='profile-settings'){if(view==='main')closeSettings();else{renderMain();notifyParent('HAPPYAD_INTERNAL_SCREEN_OPEN_V591')}}},true);document.addEventListener('keydown',function(e){if(!panel.classList.contains('show'))return;var closeTarget=e.target&&e.target.closest&&e.target.closest('[data-settings-close]');if(closeTarget&&(e.key==='Enter'||e.key===' ')){stop(e);if(view==='main')closeSettings();else renderMain();return}if(e.key==='Escape'){stop(e);if(view==='main')closeSettings();else renderMain()}},true);window.HappyProfileSettingsV722={version:VERSION,open:openSettings,close:closeSettings,main:renderMain,settings:function(){return Object.assign({},prefs)}};window.HappyProfileSettingsV721=window.HappyProfileSettingsV722;window.HappyProfileSettingsV720=window.HappyProfileSettingsV722;window.HappyProfileSettingsV717=window.HappyProfileSettingsV722;window.HappyProfileSettingsV716=window.HappyProfileSettingsV722;window.HappyProfileSettingsV715=window.HappyProfileSettingsV722;window.HappyProfileSettingsV714=window.HappyProfileSettingsV722;window.HappyProfileSettingsV713=window.HappyProfileSettingsV722;window.HappyProfileSettingsV712=window.HappyProfileSettingsV722}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
