
    window.HAPPYAD_SUPABASE_URL = window.HAPPYAD_SUPABASE_URL || "https://txjjyhupbejgjcianrmr.supabase.co";
    window.HAPPYAD_SUPABASE_KEY = window.HAPPYAD_SUPABASE_KEY || "sb_publishable_35EsjCOhZtaPtoZwdyAYOw_KaqlSKHD";
  

    (function(){
      const listView = document.getElementById('listView');
      const chatView = document.getElementById('chatView');
      let rows = Array.from(document.querySelectorAll('.row'));
      const backBtn = document.getElementById('backBtn');
      const listBackBtn = document.getElementById('listBackBtn');
      const chatAvatar = document.getElementById('chatAvatar');
      const chatName = document.getElementById('chatName');
      const chatStatus = document.getElementById('chatStatus');
      const dynamicPreview = document.getElementById('dynamicPreview');
      const chatBody = document.getElementById('chatBody');
      const composer = document.getElementById('composer');
      const messageInput = document.getElementById('messageInput');
      const sendBtn = document.getElementById('sendBtn');
      const onceToggle = document.getElementById('onceToggle');
      const recordTimer = document.getElementById('recordTimer');
      const searchToggle = document.getElementById('searchToggle');
      const listMenuBtn = document.getElementById('listMenuBtn');
      const connectedUserName = document.getElementById('connectedUserName');
      const currentUserAvatar = document.getElementById('currentUserAvatar');
      const currentUserPhoto = document.getElementById('currentUserPhoto');
      const currentUserInitials = document.getElementById('currentUserInitials');
      const currentUserBadge = document.getElementById('currentUserBadge');
      const chatBadge = document.getElementById('chatBadge');
      const searchBar = document.getElementById('searchBar');
      const searchInput = document.getElementById('searchInput');
      const emptyState = document.getElementById('emptyState');
      const fileInput = document.getElementById('fileInput');
      const mediaDraftPanel = document.getElementById('mediaDraftPanel');
      const mediaDraftGrid = document.getElementById('mediaDraftGrid');
      const mediaDraftTitle = document.getElementById('mediaDraftTitle');
      const mediaDraftClear = document.getElementById('mediaDraftClear');
      const attachBtn = document.getElementById('attachBtn');
      const stickerBtn = document.getElementById('stickerBtn');
      const stickerPanel = document.getElementById('stickerPanel');
      const stickers = document.getElementById('stickers');
      const emojiTabs = document.getElementById('emojiTabs');
      const stickerCategoryLabel = document.getElementById('stickerCategoryLabel');
      const stickerDeleteBtn = document.getElementById('stickerDeleteBtn');
      const chatMenuBtn = document.getElementById('chatMenuBtn');
      const actionBackdrop = document.getElementById('actionBackdrop');
      const actionTitle = document.getElementById('actionTitle');
      const actionSubtitle = document.getElementById('actionSubtitle');
      const actionList = document.getElementById('actionList');
      const draftFullViewer = document.getElementById('draftFullViewer');
      const draftFullContent = document.getElementById('draftFullContent');
      const draftFullClose = document.getElementById('draftFullClose');
      const draftFullTitle = document.getElementById('draftFullTitle');
      const mediaViewer = document.getElementById('mediaViewer');
      const viewerContent = document.getElementById('viewerContent');
      const viewerClose = document.getElementById('viewerClose');
      const viewerTitle = document.getElementById('viewerTitle');
      const app = document.querySelector('.app');
      const composerShell = document.getElementById('composerShell');

      const objectUrls = new Set();

      let viewOnceActive = false;
      let voiceRecording = false;
      let voiceRecordStartedAt = 0;
      let voiceRecordTimer = null;
      let voiceRecorder = null;
      let voiceStream = null;
      let voiceChunks = [];
      let pendingMediaFiles = [];

      let currentConversationRow = null;
      let activeSheetCleanup = null;
      let pendingOnceViewerMessage = null;

      const happyadMsgParams = new URLSearchParams(location.search || '');
      const happyadMsgMode = String(happyadMsgParams.get('mode') || 'list').toLowerCase();
      const happyadMsgOrigin = String(happyadMsgParams.get('origin') || happyadMsgParams.get('from') || 'home').toLowerCase();
      const happyadDirectUserId = String(happyadMsgParams.get('to') || happyadMsgParams.get('uid') || happyadMsgParams.get('user_id') || '').trim();
      let activeConversationId = '';
      let activeOtherUserId = '';
      let activeDirectFromVisitor = happyadMsgMode === 'direct' && happyadMsgOrigin === 'visitor_profile';
      let happyadMsgCurrentUser = null;
      let happyadMsgSessionBridgePromise = null;
      let happyadMsgSessionSnapshot = {id:'', ready:false, token:''};
      let happyadMsgSupabase = null;
      let happyadMsgRealtime = null;
      let happyadMsgRealtimeReady = false;
      let happyadMsgRefreshTimer = null;
      let happyadMsgPollTimer = null;
      let happyadMsgMessageLoadSeq = 0;
      let happyadMsgConversationLoadSeq = 0;
      let happyadMsgLoadedOnce = false;
      let happyadMsgLastConversationSignature = '';
      let happyadMsgDisplayedMessages = [];
      let happyadMsgIsRenderingMessages = false;
      let happyadMsgLastLoadMessagesAt = 0;
      let happyadMsgLastMarkReadByConversation = {};
      let happyadMsgRecentListSyncAt = 0;
      let happyadMsgRecentListSyncRunning = false;
      let happyadMsgPollTick = 0;
      let happyadMsgListRefreshTimer = null;
      let happyadMsgInboxRealtime = null;
      let happyadMsgInboxRealtimeReady = false;
      let happyadMsgFastListPollTimer = null;
      let happyadMsgListBootAt = Date.now();
      let happyadMsgListRawSyncAt = 0;
      let happyadMsgListRawSyncRunning = false;
      let happyadMsgInvisibleListTimer = null;
      let happyadMsgInvisibleListRunning = false;
      let happyadMsgLastInvisibleListAt = 0;
      let happyadMsgInboxPulseTimer = null;
      let happyadMsgInboxPulseRunning = false;
      let happyadMsgInboxPulseAt = 0;

      const CONNECTED_USER_FALLBACK = {
        name:'Messages',
        avatar:'',
        story:'active',
        online:true,
        badge:''
      };
      const HAPPYAD_MSG_CACHE_VERSION = 'V637';
      const HAPPYAD_MSG_STABLE_CACHE_VERSION = 'V1';
      const HAPPYAD_MSG_OLD_CACHE_VERSIONS = ['V635','V634','V633','V632','V631','V630','V629','V628','V627','V626','V625','V624','V623','V622','V621','V620','V619','V618','V617','V616','V615','V614'];
      const HAPPYAD_MSG_PROFILE_CACHE_KEY = 'HAPPYAD_MSG_PROFILE_CACHE_STABLE_' + HAPPYAD_MSG_STABLE_CACHE_VERSION;
      const HAPPYAD_MSG_ME_CACHE_KEY = 'HAPPYAD_MSG_ME_CACHE_STABLE_' + HAPPYAD_MSG_STABLE_CACHE_VERSION;
      const HAPPYAD_MSG_CONSUMED_ONCE_KEY = 'HAPPYAD_MSG_VIEW_ONCE_CONSUMED_STABLE_' + HAPPYAD_MSG_STABLE_CACHE_VERSION;
      const HAPPYAD_MSG_UNREAD_IDS_KEY = 'HAPPYAD_MSG_UNREAD_IDS_STABLE_' + HAPPYAD_MSG_STABLE_CACHE_VERSION;

      function safeJsonParse(value){
        if(!value || typeof value !== 'string') return null;
        try{return JSON.parse(value);}catch(e){return null;}
      }

      function firstTextFromObject(obj, keys){
        if(!obj || typeof obj !== 'object') return '';
        for(const key of keys){
          const value = obj[key];
          if(typeof value === 'string' && value.trim()) return value.trim();
        }
        return '';
      }

      function userNameFromObject(obj){
        const direct = firstTextFromObject(obj, ['name','full_name','fullName','display_name','displayName','creatorName','creator_name','user_name','userName','seller_name','author_name','profile_name','username','handle','nom','prenom_nom']);
        if(direct) return direct;
        const first = firstTextFromObject(obj, ['first_name','firstName','prenom']);
        const last = firstTextFromObject(obj, ['last_name','lastName','nom_famille']);
        return (first + ' ' + last).trim();
      }

      function userAvatarFromObject(obj){
        return firstTextFromObject(obj, [
          'avatar','avatar_url','avatarUrl','photo','photo_url','photoUrl','profile_photo','profilePhoto',
          'profile_image','profileImage','image','image_url','imageUrl','picture','picture_url','pictureUrl',
          'user_photo','userPhoto','user_avatar','userAvatar','creator_avatar','creatorAvatar','author_avatar','authorAvatar','seller_avatar','sellerAvatar','profile_pic','profilePic','photo_de_profil','photoDeProfil','photo_profil','photoProfil'
        ]);
      }

      function normalizeBadgeType(value){
        if(value === true || value === 1) return 'blue';
        const raw = String(value == null ? '' : value).trim().toLowerCase();
        if(!raw || raw === 'aucun' || raw === 'none' || raw === 'null' || raw === 'false' || raw === '0' || raw === 'undefined') return '';
        if(['bleu','blue','verified','verify','certified','certifie','certifié','official','officiel','blue_check','badge_blue','verified_badge','true','1'].includes(raw)) return 'blue';
        if(['violet','purple','jaune','yellow','business','creator','createur','créateur','seller','vendeur','shop','boutique','merchant','music','musique','artist','artiste','admin','moderator','staff'].includes(raw)) return 'yellow';
        if(raw.indexOf('violet') >= 0 || raw.indexOf('purple') >= 0 || raw.indexOf('jaune') >= 0 || raw.indexOf('yellow') >= 0 || raw.indexOf('business') >= 0) return 'yellow';
        if(raw.indexOf('verify') >= 0 || raw.indexOf('cert') >= 0 || raw.indexOf('blue') >= 0 || raw.indexOf('bleu') >= 0) return 'blue';
        return 'blue';
      }

      function userBadgeFromObject(obj){
        if(!obj || typeof obj !== 'object') return '';
        const direct = firstTextFromObject(obj, [
          'badge','badge_type','badgeType','user_badge','userBadge','account_badge','accountBadge',
          'role_badge','roleBadge','profile_badge','profileBadge','blue_badge','blueBadge','verifyBadge','verify_level','verifyLevel','certification','certification_type','certificationType','verified_badge','verifiedBadge'
        ]);
        if(direct) return normalizeBadgeType(direct);
        if(obj.is_verified === true || obj.verified === true || obj.certified === true || obj.isCertified === true) return 'verified';
        if(obj.is_creator === true || obj.creator === true || obj.isCreator === true) return 'creator';
        if(obj.is_seller === true || obj.seller === true || obj.isSeller === true || obj.has_shop === true) return 'seller';
        if(obj.is_artist === true || obj.artist === true || obj.isArtist === true || obj.music === true) return 'music';
        if(obj.is_admin === true || obj.admin === true || obj.role === 'admin') return 'admin';
        return '';
      }

      function badgeSvg(type){
        const t = normalizeBadgeType(type);
        if(t === 'creator'){
          return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2.6 14.8 8l6 .86-4.35 4.2 1.03 5.94L12 16.2 6.52 19l1.03-5.94L3.2 8.86l6-.86L12 2.6Z" fill="currentColor"/><path d="M9.1 11.8 11.1 13.8 15.3 9.7" stroke="#06111f" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        }
        if(t === 'seller'){
          return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6.3 8.2h11.4l1 12H5.3l1-12Z" fill="currentColor"/><path d="M9 8.2V6.9a3 3 0 0 1 6 0v1.3" stroke="#06111f" stroke-width="2" stroke-linecap="round"/><path d="m8.8 14.2 2 2 4.4-4.5" stroke="#06111f" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        }
        if(t === 'music'){
          return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="currentColor"/><path d="M15.6 6.9v8.15a2.65 2.65 0 1 1-1.8-2.5V9.1l-5.2 1.05v6.15a2.65 2.65 0 1 1-1.8-2.5V8.45l8.8-1.55Z" fill="#06111f"/></svg>';
        }
        if(t === 'admin'){
          return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2.8 20.2 6v6.3c0 5.1-3.45 8.05-8.2 9-4.75-.95-8.2-3.9-8.2-9V6L12 2.8Z" fill="currentColor"/><path d="M8 12.1 10.7 14.8 16.3 9.2" stroke="#06111f" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        }
        return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2.4 14.1 5l3.3-.45 1 3.15 3 1.5-1.5 3 1.5 3-3 1.5-1 3.15-3.3-.45L12 21.6l-2.1-2.6-3.3.45-1-3.15-3-1.5 1.5-3-1.5-3 3-1.5 1-3.15 3.3.45L12 2.4Z" fill="currentColor"/><path d="m8.3 12.15 2.35 2.35 5.05-5.15" stroke="#06111f" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      }

      function badgeLabel(type){
        const t = normalizeBadgeType(type);
        if(t === 'creator') return 'Badge créateur';
        if(t === 'seller') return 'Badge boutique';
        if(t === 'music') return 'Badge artiste';
        if(t === 'admin') return 'Badge équipe HappyAD';
        if(t === 'verified') return 'Badge vérifié';
        return t ? 'Badge ' + t : '';
      }

      function setBadge(el, type){
        if(!el) return;
        const badgeType = normalizeBadgeType(type);
        if(!badgeType){
          el.className = 'happyad-badge';
          el.innerHTML = '';
          el.removeAttribute('title');
          el.setAttribute('aria-hidden','true');
          return;
        }
        if(badgeType === 'blue' || badgeType === 'yellow'){
          el.className = 'happyad-badge active profile-' + badgeType;
          el.innerHTML = '';
          el.title = 'Badge vérifié';
          el.setAttribute('aria-label','Badge vérifié');
          el.setAttribute('data-badge', badgeType);
          el.removeAttribute('aria-hidden');
          return;
        }
        el.className = 'happyad-badge active ' + badgeType;
        el.innerHTML = badgeSvg(badgeType);
        el.title = badgeLabel(badgeType);
        el.setAttribute('aria-label', badgeLabel(badgeType));
        el.setAttribute('data-badge', badgeType);
        el.removeAttribute('aria-hidden');
      }

      function hydrateRowBadge(row){
        if(!row) return;
        const type = row.dataset.badge || row.dataset.badgeType || row.dataset.userBadge || '';
        const nameEl = row.querySelector('.topline .name');
        if(!nameEl) return;
        let badgeEl = row.querySelector('.topline .happyad-badge');
        if(!badgeEl){
          badgeEl = document.createElement('span');
          badgeEl.className = 'happyad-badge';
          nameEl.insertAdjacentElement('afterend', badgeEl);
        }
        setBadge(badgeEl, type);
      }

      function readConnectedUserFromStorage(){
        const candidates = [
          'HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL','HAPPYAD_USER','HAPPYAD_CURRENT_USER','HAPPYAD_LOGGED_USER',
          'happyad_current_user','happyad_user','currentUser','user',
          'happyad_profile','HAPPYAD_PROFILE','happyad_auth_user','supabase.auth.token'
        ];

        for(const key of candidates){
          const raw = localStorage.getItem(key) || sessionStorage.getItem(key);
          const parsed = safeJsonParse(raw);
          if(!parsed) continue;

          const roots = [parsed, parsed.user, parsed.profile, parsed.currentUser, parsed.session && parsed.session.user, parsed.data && parsed.data.user].filter(Boolean);
          for(const root of roots){
            const name = userNameFromObject(root);
            const avatar = userAvatarFromObject(root) || userAvatarFromObject(root.user_metadata || {}) || userAvatarFromObject(root.raw_user_meta_data || {});
            const badge = userBadgeFromObject(root) || userBadgeFromObject(root.user_metadata || {}) || userBadgeFromObject(root.raw_user_meta_data || {});
            if(name || avatar || badge){
              const id = firstTextFromObject(root, ['id','user_id','uid','uuid','auth_id']) || firstTextFromObject(root.user_metadata || {}, ['id','user_id','uid','uuid','auth_id']) || firstTextFromObject(root.raw_user_meta_data || {}, ['id','user_id','uid','uuid','auth_id']);
              return {id:id || '', name:name || CONNECTED_USER_FALLBACK.name, avatar:avatar || '', story:'active', online:true, badge:badge || CONNECTED_USER_FALLBACK.badge};
            }
          }
        }

        const name = localStorage.getItem('happyad_my_name') || localStorage.getItem('happyadUserName') || localStorage.getItem('myName') || '';
        const avatar = localStorage.getItem('happyad_my_avatar') || localStorage.getItem('happyadUserAvatar') || localStorage.getItem('myAvatar') || '';
        const badge = localStorage.getItem('happyad_my_badge') || localStorage.getItem('happyadUserBadge') || localStorage.getItem('myBadge') || '';
        const uid = localStorage.getItem('HAPPYAD_AUTH_UID') || localStorage.getItem('happyad_my_id') || localStorage.getItem('happyadUserId') || localStorage.getItem('myId') || '';
        if(name || avatar || badge || uid) return {id:uid || '', name:name || CONNECTED_USER_FALLBACK.name, avatar:avatar || '', story:'active', online:true, badge:normalizeBadgeType(badge) || CONNECTED_USER_FALLBACK.badge};

        return Object.assign({}, CONNECTED_USER_FALLBACK);
      }

      function initialsFromName(name){
        const raw = String(name || 'HA').trim();
        const cleaned = raw.replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ').trim();
        const parts = cleaned.split(/\s+/).filter(Boolean);
        let out = 'HA';
        if(parts.length === 1){
          out = Array.from(parts[0]).slice(0,2).join('');
        } else if(parts.length > 1){
          out = (Array.from(parts[0])[0] || '') + (Array.from(parts[parts.length - 1])[0] || '');
        }
        out = String(out || 'HA').toUpperCase();
        return Array.from(out).slice(0,2).join('') || 'HA';
      }
      function initialsClass(initial){
        const len = Array.from(String(initial || '')).length;
        return len > 2 ? ' initials-small' : len > 1 ? ' initials-long' : '';
      }

      function applyConnectedUser(){
        const user = readConnectedUserFromStorage();
        const name = user.name || CONNECTED_USER_FALLBACK.name;
        const avatar = user.avatar || '';

        connectedUserName.textContent = name;
        setBadge(currentUserBadge, user.badge || CONNECTED_USER_FALLBACK.badge);
        const headerInitials = initialsFromName(name);
        currentUserInitials.textContent = headerInitials;
        currentUserAvatar.classList.toggle('initials-long', Array.from(headerInitials).length > 1);
        currentUserAvatar.classList.toggle('story-active', user.story !== 'seen');
        currentUserAvatar.classList.toggle('story-seen', user.story === 'seen');

        if(avatar){
          currentUserPhoto.src = avatar;
          currentUserAvatar.classList.add('has-photo');
          currentUserPhoto.onerror = () => {
            currentUserAvatar.classList.remove('has-photo');
            currentUserPhoto.removeAttribute('src');
          };
        } else {
          currentUserAvatar.classList.remove('has-photo');
          currentUserPhoto.removeAttribute('src');
        }
      }

      applyConnectedUser();

      function sheetIcon(type){
        const icons = {
          trash:'<svg viewBox="0 0 24 24" fill="none"><path d="M4 7h16M9 7V5.2C9 4.55 9.55 4 10.2 4h3.6c.65 0 1.2.55 1.2 1.2V7m-8 0 .7 12.1c.06 1.05.92 1.9 1.98 1.9h4.64c1.06 0 1.92-.85 1.98-1.9L17 7" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>',
          block:'<svg viewBox="0 0 24 24" fill="none"><path d="M18.4 5.6 5.6 18.4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>',
          report:'<svg viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01M10.3 4.8 3.7 16.5c-.75 1.35.22 3 1.75 3h13.1c1.53 0 2.5-1.65 1.75-3L13.7 4.8c-.76-1.36-2.64-1.36-3.4 0Z" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
          me:'<svg viewBox="0 0 24 24" fill="none"><path d="M20 6 9 17l-5-5" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>',
          all:'<svg viewBox="0 0 24 24" fill="none"><path d="M8 7h13M8 12h13M8 17h13M3.5 7h.01M3.5 12h.01M3.5 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
          cancel:'<svg viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/></svg>'
        };
        return icons[type] || '';
      }

      function openActionSheet(config){
        actionList.innerHTML = '';

        const hasTitle = !!(config.title || config.subtitle);
        const head = actionTitle.closest('.sheet-head');
        if(hasTitle){
          head.style.display = '';
          actionTitle.textContent = config.title || '';
          actionSubtitle.textContent = config.subtitle || '';
        } else {
          head.style.display = 'none';
          actionTitle.textContent = '';
          actionSubtitle.textContent = '';
        }

        if(config.mediaPreviewFiles && config.mediaPreviewFiles.length){
          const title = document.createElement('div');
          title.className = 'media-confirm-title';
          title.textContent = 'Aperçu du fichier';
          actionList.appendChild(title);

          const preview = document.createElement('div');
          preview.className = 'media-confirm-preview';
          const files = Array.from(config.mediaPreviewFiles).slice(0, 6);

          files.forEach(file => {
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'media-confirm-item';
            const url = URL.createObjectURL(file);
            objectUrls.add(url);

            if(file.type && file.type.startsWith('image/')){
              const img = document.createElement('img');
              img.src = url;
              img.alt = file.name || 'image';
              item.appendChild(img);
              item.addEventListener('click', () => openMediaViewer('image', url, file.name || 'Image'));
            } else if(file.type && file.type.startsWith('video/')){
              const video = document.createElement('video');
              video.src = url;
              video.muted = true;
              video.playsInline = true;
              item.appendChild(video);
              item.addEventListener('click', () => openMediaViewer('video', url, file.name || 'Vidéo'));
            } else {
              const info = document.createElement('span');
              info.className = 'media-confirm-file';
              info.textContent = file.name || 'Fichier';
              item.appendChild(info);
            }

            preview.appendChild(item);
          });

          if(config.allowAddMedia && files.length < 6){
            const add = document.createElement('button');
            add.type = 'button';
            add.className = 'media-confirm-add';
            add.setAttribute('aria-label','Ajouter un fichier');
            add.textContent = '+';
            add.addEventListener('click', e => {
              e.preventDefault();
              e.stopPropagation();

              const extraInput = document.createElement('input');
              extraInput.type = 'file';
              extraInput.multiple = true;
              extraInput.accept = '*/*';
              extraInput.style.display = 'none';

              extraInput.addEventListener('change', ev => {
                const added = Array.from(ev.target.files || []);
                if(added.length){
                  pendingMediaFiles = pendingMediaFiles.concat(added).slice(0, 6);
                  closeActionSheet();
                  showMediaConfirmSheet(pendingMediaFiles);
                }
                extraInput.remove();
              });

              document.body.appendChild(extraInput);
              extraInput.click();
            });
            preview.appendChild(add);
          }

          actionList.appendChild(preview);
        }

        (config.actions || []).forEach(action => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'sheet-btn ' + (action.kind || '');
          btn.innerHTML = sheetIcon(action.icon) + '<span>' + action.label + '</span>';
          btn.addEventListener('click', () => {
            closeActionSheet();
            if(typeof action.onClick === 'function') action.onClick();
          });
          actionList.appendChild(btn);
        });

        if(!config.hideDefaultCancel){
          const cancel = document.createElement('button');
          cancel.type = 'button';
          cancel.className = 'sheet-btn sheet-cancel';
          cancel.innerHTML = sheetIcon('cancel') + '<span>Annuler</span>';
          cancel.addEventListener('click', closeActionSheet);
          actionList.appendChild(cancel);
        }

        actionBackdrop.classList.add('active');
        actionBackdrop.setAttribute('aria-hidden','false');
        activeSheetCleanup = config.onClose || null;
      }

      function closeActionSheet(){
        actionBackdrop.classList.remove('active');
        actionBackdrop.setAttribute('aria-hidden','true');
        actionList.innerHTML = '';
        if(typeof activeSheetCleanup === 'function') activeSheetCleanup();
        activeSheetCleanup = null;
      }

      actionBackdrop.addEventListener('click', e => {
        if(e.target === actionBackdrop) closeActionSheet();
      });


      document.addEventListener('contextmenu', e => {
        if(e.target.closest('.msg, .bubble, .message-text, .row, .action-sheet')){
          e.preventDefault();
        }
      }, true);

      document.addEventListener('selectstart', e => {
        if(e.target.closest('.msg, .bubble, .message-text, .row, .action-sheet')){
          e.preventDefault();
        }
      }, true);

      function setupLongPress(target, callback){
        let timer = null;
        let startX = 0;
        let startY = 0;
        let fired = false;

        target.addEventListener('pointerdown', e => {
          if(e.button !== undefined && e.button !== 0) return;
          fired = false;
          startX = e.clientX;
          startY = e.clientY;
          timer = setTimeout(() => {
            fired = true;
            callback(e);
          }, 620);
        });

        target.addEventListener('pointermove', e => {
          if(!timer) return;
          const dx = Math.abs(e.clientX - startX);
          const dy = Math.abs(e.clientY - startY);
          if(dx > 12 || dy > 12){
            clearTimeout(timer);
            timer = null;
          }
        });

        ['pointerup','pointercancel','pointerleave'].forEach(type => {
          target.addEventListener(type, () => {
            if(timer){
              clearTimeout(timer);
              timer = null;
            }
          });
        });

        target.addEventListener('click', e => {
          if(fired){
            e.preventDefault();
            e.stopPropagation();
            fired = false;
          }
        }, true);
      }


      function bindMessageLongPress(msg){
        if(!msg || msg.dataset.longpressReady === '1') return;
        msg.dataset.longpressReady = '1';

        let timer = null;
        let startX = 0;
        let startY = 0;
        let fired = false;

        msg.addEventListener('contextmenu', e => {
          e.preventDefault();
          e.stopPropagation();
        });

        msg.addEventListener('selectstart', e => {
          e.preventDefault();
          e.stopPropagation();
        });

        msg.addEventListener('pointerdown', e => {
          if(e.target.closest('.more-btn')) return;
          if(e.button !== undefined && e.button !== 0) return;

          e.preventDefault();

          fired = false;
          startX = e.clientX;
          startY = e.clientY;
          msg.classList.add('selecting');

          timer = setTimeout(() => {
            fired = true;
            msg.classList.remove('selecting');
            showMessageDeleteSheet(msg);
          }, 520);
        });

        msg.addEventListener('pointermove', e => {
          if(!timer) return;
          const dx = Math.abs(e.clientX - startX);
          const dy = Math.abs(e.clientY - startY);
          if(dx > 12 || dy > 12){
            clearTimeout(timer);
            timer = null;
            msg.classList.remove('selecting');
          }
        });

        ['pointerup','pointercancel','pointerleave'].forEach(type => {
          msg.addEventListener(type, () => {
            if(timer){
              clearTimeout(timer);
              timer = null;
            }
            msg.classList.remove('selecting');
          });
        });

        msg.addEventListener('click', e => {
          if(fired){
            e.preventDefault();
            e.stopPropagation();
            fired = false;
          }
        }, true);
      }

      function bindAllMessageLongPress(){
        chatBody.querySelectorAll('.msg').forEach(bindMessageLongPress);
      }

      function showConversationDeleteSheet(row){
        const name = row.dataset.name || '';
        openActionSheet({
          title:'',
          subtitle:'',
          actions:[
            {
              label:'Supprimer cette conversation',
              icon:'trash',
              kind:'danger',
              onClick:async () => {
                try{if(row.dataset.conversationId&&msgClient())await msgClient().rpc('happyad_msg_hide_conversation',{p_conversation_id:row.dataset.conversationId});}catch(e){console.warn('hide conversation',e)}
                row.remove();
                currentConversationRow = null;
                if(chatName.textContent === name) closeChat();
                loadConversations();
              }
            }
          ]
        });
      }

      async function deleteAllConversations(){
        const all=Array.from(document.querySelectorAll('#conversationPanel .row'));
        for(const row of all){try{if(row.dataset.conversationId&&msgClient())await msgClient().rpc('happyad_msg_hide_conversation',{p_conversation_id:row.dataset.conversationId});}catch(e){}}
        all.forEach(row => row.remove());
        currentConversationRow = null;
        if(!chatView.classList.contains('hidden')) closeChat();
        searchInput.value = '';
        searchBar.classList.remove('active');
        try{localStorage.removeItem(msgConversationsCacheKey());}catch(e){}
        emptyState.textContent = 'Aucune conversation.';
        emptyState.style.display = 'block';
      }

      function showListMenuSheet(){
        const existingRows = document.querySelectorAll('#conversationPanel .row');
        if(!existingRows.length){
          emptyState.textContent = 'Aucune conversation.';
          emptyState.style.display = 'block';
          return;
        }

        openActionSheet({
          title:'Options messages',
          subtitle:'Gérer toutes les conversations.',
          actions:[
            {
              label:'Supprimer toutes les conversations',
              icon:'trash',
              kind:'danger',
              onClick:deleteAllConversations
            }
          ]
        });
      }

      function markMessageDeleted(msg, text){
        const bubble = msg.querySelector('.bubble');
        if(!bubble) return;
        msg.classList.add('deleted');
        bubble.innerHTML = '';
        const content = document.createElement('span');
        content.className = 'message-text';
        content.textContent = text;
        const meta = document.createElement('span');
        meta.className = 'meta';
        meta.textContent = nowMeta(false);
        bubble.appendChild(content);
        bubble.appendChild(meta);
      }

      function showMessageDeleteSheet(msg){
        if(!msg || msg.classList.contains('deleted')) return;

        const isMine = msg.classList.contains('me');

        if(!isMine){
          openActionSheet({
            title:'',
            subtitle:'',
            actions:[
              {
                label:'Supprimer',
                icon:'trash',
                kind:'danger',
                onClick:async () => {try{if(msg.dataset.messageId&&msgClient())await msgClient().rpc('happyad_msg_delete_for_me',{p_message_id:msg.dataset.messageId});}catch(e){} msg.remove();}
              }
            ]
          });
          return;
        }

        openActionSheet({
          title:'',
          subtitle:'',
          actions:[
            {
              label:'Supprimer pour moi',
              icon:'me',
              kind:'info',
              onClick:async () => {try{if(msg.dataset.messageId&&msgClient())await msgClient().rpc('happyad_msg_delete_for_me',{p_message_id:msg.dataset.messageId});}catch(e){} msg.remove();}
            },
            {
              label:'Supprimer pour tous',
              icon:'trash',
              kind:'danger',
              onClick:async () => {try{if(msg.dataset.messageId&&msgClient())await msgClient().rpc('happyad_msg_delete_for_all',{p_message_id:msg.dataset.messageId});}catch(e){console.warn('delete all',e)} markMessageDeleted(msg, 'message supprimé');}
            }
          ]
        });
      }

      function showChatMenuSheet(){
        const name = chatName.textContent || 'cet utilisateur';
        openActionSheet({
          title:'Options de conversation',
          subtitle:'Gérer la conversation avec ' + name + '.',
          actions:[
            {
              label:'Bloquer ' + name,
              icon:'block',
              kind:'warn',
              onClick:() => {
                chatStatus.textContent = 'Bloqué';
                chatStatus.style.color = '#ffd36a';
              }
            },
            {
              label:'Signaler cette conversation',
              icon:'report',
              kind:'warn',
              onClick:() => {
                appendSystemMessage('Signalement envoyé. Merci de protéger la communauté HappyAD.');
              }
            },
            {
              label:'Supprimer tous les messages',
              icon:'trash',
              kind:'danger',
              onClick:() => {
                chatBody.innerHTML = '<div class="day">Aujourd’hui</div>';
              }
            }
          ]
        });
      }

      function appendSystemMessage(text){
        const msg = document.createElement('div');
        msg.className = 'msg them';
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        const content = document.createElement('span');
        content.className = 'message-text';
        content.textContent = text;
        bubble.appendChild(content);
        msg.appendChild(bubble);
        chatBody.appendChild(msg);
        bindMessageLongPress(msg);
        scrollChatBottom();
      }


      const STICKER_CATEGORIES = [
        { key:'recent', icon:'🕘', label:'Récents', items:'😀 😃 😄 😁 😆 😅 😂 🤣 🥲 😊 😇 🙂 🙃 😉 😌 😍 🥰 😘 😗 😙 😚 😋 😛 😜 🤪 😎 🤩 🥳 😏 😒 😞 😔 😟 😕 🥺 😢 😭 😤 😠 😡 🤯 😳 🥵 🥶 😱 🤗 🤔 🤭 🤫 😐 😑 🙄 😴 🤤 🥴 🔥 💯 🙏 👏 👌 ❤️ 💙 ✨ 🎉 🤝 ⭐ ✅ 💪'.split(' ') },
        { key:'smileys', icon:'😀', label:'Smileys et émotions', items:'😀 😃 😄 😁 😆 😅 😂 🤣 🥲 ☺️ 😊 😇 🙂 🙃 😉 😌 😍 🥰 😘 😗 😙 😚 😋 😛 😝 😜 🤪 🤨 🧐 🤓 😎 🥸 🤩 🥳 😏 😒 😞 😔 😟 😕 🙁 ☹️ 😣 😖 😫 😩 🥺 😢 😭 😤 😠 😡 🤬 🤯 😳 🥵 🥶 😱 😨 😰 😥 😓 🤗 🤔 🫢 🤭 🫣 🤫 🤥 😶 😐 😑 😬 🫠 🙄 😯 😦 😧 😮 😲 🥱 😴 🤤 😪 😵 😵‍💫 🥴 🤢 🤮 🤧 😷 🤒 🤕 🤑 🤠 😈 👿 👹 👺 🤡 💩 👻 💀 ☠️ 👽 👾 🤖 🎃 😺 😸 😹 😻 😼 😽 🙀 😿 😾'.split(' ') },
        { key:'gestes', icon:'👍', label:'Gestes et corps', items:'👋 🤚 🖐️ ✋ 🖖 🫱 🫲 🫳 🫴 👌 🤌 🤏 ✌️ 🤞 🫰 🤟 🤘 🤙 👈 👉 👆 🖕 👇 ☝️ 🫵 👍 👎 ✊ 👊 🤛 🤜 👏 🙌 🫶 👐 🤲 🤝 🙏 ✍️ 💅 🤳 💪 🦾 🦿 🦵 🦶 👂 🦻 👃 🧠 🫀 🫁 🦷 🦴 👀 👁️ 👅 👄 🫦'.split(' ') },
        { key:'hearts', icon:'❤️', label:'Amour et symboles cœur', items:'❤️ 🧡 💛 💚 💙 💜 🖤 🩶 🤍 🤎 ❤️‍🔥 ❤️‍🩹 ❣️ 💕 💞 💓 💗 💖 💘 💝 💟 💌 💋 🫶 🥰 😍 😘 🌹 🥀 💐 🌺 🌸 🌼 🌻 ✨ 💫 ⭐ 🌟'.split(' ') },
        { key:'people', icon:'👤', label:'Personnes', items:'👶 🧒 👦 👧 🧑 👨 👩 🧔 🧔‍♂️ 🧔‍♀️ 👱 👱‍♂️ 👱‍♀️ 👨‍🦰 👩‍🦰 👨‍🦱 👩‍🦱 👨‍🦳 👩‍🦳 👨‍🦲 👩‍🦲 🧓 👴 👵 🙍 🙍‍♂️ 🙍‍♀️ 🙎 🙎‍♂️ 🙎‍♀️ 🙅 🙅‍♂️ 🙅‍♀️ 🙆 🙆‍♂️ 🙆‍♀️ 💁 💁‍♂️ 💁‍♀️ 🙋 🙋‍♂️ 🙋‍♀️ 🧏 🧏‍♂️ 🧏‍♀️ 🙇 🙇‍♂️ 🙇‍♀️ 🤦 🤦‍♂️ 🤦‍♀️ 🤷 🤷‍♂️ 🤷‍♀️ 👮 👮‍♂️ 👮‍♀️ 🕵️ 🕵️‍♂️ 🕵️‍♀️ 💂 💂‍♂️ 💂‍♀️ 👷 👷‍♂️ 👷‍♀️ 🧑‍⚕️ 👨‍⚕️ 👩‍⚕️ 🧑‍🎓 👨‍🎓 👩‍🎓 🧑‍🏫 👨‍🏫 👩‍🏫 🧑‍⚖️ 👨‍⚖️ 👩‍⚖️ 🧑‍🌾 👨‍🌾 👩‍🌾 🧑‍🍳 👨‍🍳 👩‍🍳 🧑‍🔧 👨‍🔧 👩‍🔧 🧑‍🏭 👨‍🏭 👩‍🏭 🧑‍💼 👨‍💼 👩‍💼 🧑‍🔬 👨‍🔬 👩‍🔬 🧑‍💻 👨‍💻 👩‍💻 🧑‍🎤 👨‍🎤 👩‍🎤 🧑‍🎨 👨‍🎨 👩‍🎨 🧑‍✈️ 👨‍✈️ 👩‍✈️ 🧑‍🚀 👨‍🚀 👩‍🚀 🧑‍🚒 👨‍🚒 👩‍🚒 🤴 👸 🫅 👳 👳‍♂️ 👳‍♀️ 🧕 🤵 🤵‍♂️ 🤵‍♀️ 👰 👰‍♂️ 👰‍♀️ 🤰 🫃 🫄 🤱 👩‍🍼 👨‍🍼 🧑‍🍼 👼 🎅 🤶 🧑‍🎄 🦸 🦸‍♂️ 🦸‍♀️ 🦹 🦹‍♂️ 🦹‍♀️ 🧙 🧙‍♂️ 🧙‍♀️ 🧚 🧚‍♂️ 🧚‍♀️ 🧛 🧛‍♂️ 🧛‍♀️ 🧜 🧜‍♂️ 🧜‍♀️ 🧝 🧝‍♂️ 🧝‍♀️ 🧞 🧞‍♂️ 🧞‍♀️ 🧟 🧟‍♂️ 🧟‍♀️ 🧌'.split(' ') },
        { key:'animals', icon:'🐻', label:'Animaux et nature', items:'🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐻‍❄️ 🐨 🐯 🦁 🐮 🐷 🐽 🐸 🐵 🙈 🙉 🙊 🐒 🐔 🐧 🐦 🐤 🐣 🐥 🦆 🦅 🦉 🦇 🐺 🐗 🐴 🦄 🫎 🐝 🪲 🐞 🦋 🐌 🐛 🐜 🪰 🪱 🦟 🦗 🕷️ 🕸️ 🦂 🐢 🐍 🦎 🦖 🦕 🐙 🦑 🪼 🦐 🦞 🦀 🐡 🐠 🐟 🐬 🐳 🐋 🦈 🦭 🐊 🐅 🐆 🦓 🦍 🦧 🦣 🐘 🦛 🦏 🐪 🐫 🦒 🦘 🦬 🐃 🐂 🐄 🫏 🐎 🐖 🐏 🐑 🦙 🐐 🦌 🐕 🐩 🦮 🐕‍🦺 🐈 🐈‍⬛ 🪽 🪶 🐓 🦃 🦤 🦚 🦜 🦢 🦩 🕊️ 🐇 🦝 🦨 🦡 🦫 🦦 🦥 🐁 🐀 🐿️ 🦔 🐾 🐉 🐲 🌵 🎄 🌲 🌳 🌴 🪵 🌱 🌿 ☘️ 🍀 🎍 🪴 🎋 🍃 🍂 🍁 🪺 🪹 🍄 🐚 🪸 🪨 🌾 💐 🌷 🪷 🌹 🥀 🌺 🌸 🌼 🌻 🌞 🌝 🌛 🌜 🌚 🌕 🌖 🌗 🌘 🌑 🌒 🌓 🌔 🌙 🌎 🌍 🌏 🪐 💫 ⭐ 🌟 ✨ ⚡ ☄️ 💥 🔥 🌪️ 🌈 ☀️ 🌤️ ⛅ 🌥️ ☁️ 🌦️ 🌧️ ⛈️ 🌩️ 🌨️ ❄️ ☃️ ⛄ 🌬️ 💨 💧 💦 ☔ ☂️ 🌊 🌫️'.split(' ') },
        { key:'food', icon:'🍔', label:'Nourriture', items:'🍏 🍎 🍐 🍊 🍋 🍌 🍉 🍇 🍓 🫐 🍈 🍒 🍑 🥭 🍍 🥥 🥝 🍅 🍆 🥑 🥦 🥬 🥒 🌶️ 🫑 🌽 🥕 🫒 🧄 🧅 🥔 🍠 🫚 🥐 🥯 🍞 🥖 🥨 🧀 🥚 🍳 🧈 🥞 🧇 🥓 🥩 🍗 🍖 🦴 🌭 🍔 🍟 🍕 🫓 🥪 🌮 🌯 🫔 🥙 🧆 🥘 🫕 🍝 🍜 🍲 🍛 🍣 🍱 🥟 🦪 🍤 🍙 🍚 🍘 🍥 🥠 🥮 🍢 🍡 🍧 🍨 🍦 🥧 🧁 🍰 🎂 🍮 🍭 🍬 🍫 🍿 🍩 🍪 🌰 🥜 🫘 🍯 🥛 🍼 🫗 ☕ 🫖 🍵 🧃 🥤 🧋 🫙 🍶 🍺 🍻 🥂 🍷 🥃 🍸 🍹 🧉 🍾 🧊 🥄 🍴 🍽️ 🥣 🥡 🥢 🧂'.split(' ') },
        { key:'travel', icon:'🚗', label:'Voyage et lieux', items:'🚗 🚕 🚙 🚌 🚎 🏎️ 🚓 🚑 🚒 🚐 🛻 🚚 🚛 🚜 🏍️ 🛵 🦽 🦼 🛺 🚲 🛴 🛹 🛼 🚏 🛣️ 🛤️ 🛢️ ⛽ 🛞 🚨 🚥 🚦 🛑 🚧 ⚓ 🛟 ⛵ 🛶 🚤 🛥️ 🛳️ ⛴️ 🚢 ✈️ 🛫 🛬 🪂 💺 🚁 🚟 🚠 🚡 🛰️ 🚀 🛸 🛎️ 🧳 ⌛ ⏳ ⌚ ⏰ ⏱️ ⏲️ 🕰️ 🕛 🕧 🕐 🕜 🕑 🕝 🕒 🕞 🕓 🕟 🕔 🕠 🕕 🕡 🕖 🕢 🕗 🕣 🕘 🕤 🕙 🕥 🕚 🕦 🌍 🌎 🌏 🗺️ 🧭 🏔️ ⛰️ 🌋 🗻 🏕️ 🏖️ 🏜️ 🏝️ 🏞️ 🏟️ 🏛️ 🏗️ 🧱 🪨 🪵 🛖 🏘️ 🏚️ 🏠 🏡 🏢 🏣 🏤 🏥 🏦 🏨 🏩 🏪 🏫 🏬 🏭 🏯 🏰 💒 🗼 🗽 ⛪ 🕌 🛕 🕍 ⛩️ 🕋 ⛲ ⛺ 🌁 🌃 🏙️ 🌄 🌅 🌆 🌇 🌉 ♨️ 🎠 🛝 🎡 🎢 💈 🎪'.split(' ') },
        { key:'activities', icon:'⚽', label:'Activités', items:'⚽ 🏀 🏈 ⚾ 🥎 🎾 🏐 🏉 🥏 🎱 🪀 🏓 🏸 🏒 🏑 🥍 🏏 🪃 🥅 ⛳ 🪁 🛝 🏹 🎣 🤿 🥊 🥋 🎽 🛹 🛷 ⛸️ 🥌 🎿 ⛷️ 🏂 🪂 🏋️ 🏋️‍♂️ 🏋️‍♀️ 🤼 🤼‍♂️ 🤼‍♀️ 🤸 🤸‍♂️ 🤸‍♀️ ⛹️ ⛹️‍♂️ ⛹️‍♀️ 🤺 🤾 🤾‍♂️ 🤾‍♀️ 🏌️ 🏌️‍♂️ 🏌️‍♀️ 🏇 🧘 🧘‍♂️ 🧘‍♀️ 🏄 🏄‍♂️ 🏄‍♀️ 🏊 🏊‍♂️ 🏊‍♀️ 🤽 🤽‍♂️ 🤽‍♀️ 🚣 🚣‍♂️ 🚣‍♀️ 🧗 🧗‍♂️ 🧗‍♀️ 🚵 🚵‍♂️ 🚵‍♀️ 🚴 🚴‍♂️ 🚴‍♀️ 🏆 🥇 🥈 🥉 🏅 🎖️ 🏵️ 🎗️ 🎫 🎟️ 🎪 🤹 🤹‍♂️ 🤹‍♀️ 🎭 🩰 🎨 🎬 🎤 🎧 🎼 🎹 🥁 🪘 🎷 🎺 🪗 🎸 🪕 🎻 🪈 🎲 ♟️ 🎯 🎳 🎮 🎰 🧩'.split(' ') },
        { key:'objects', icon:'💡', label:'Objets', items:'⌚ 📱 📲 💻 ⌨️ 🖥️ 🖨️ 🖱️ 🖲️ 🕹️ 🗜️ 💽 💾 💿 📀 📼 📷 📸 📹 🎥 📽️ 🎞️ 📞 ☎️ 📟 📠 📺 📻 🎙️ 🎚️ 🎛️ 🧭 ⏱️ ⏲️ ⏰ 🕰️ ⌛ ⏳ 📡 🔋 🪫 🔌 💡 🔦 🕯️ 🪔 🧯 🛢️ 💸 💵 💴 💶 💷 🪙 💰 💳 🧾 💎 ⚖️ 🪜 🧰 🪛 🔧 🔨 ⚒️ 🛠️ ⛏️ 🪚 🔩 ⚙️ 🪤 🧱 ⛓️ 🧲 🔫 💣 🧨 🪓 🔪 🗡️ ⚔️ 🛡️ 🚬 ⚰️ 🪦 ⚱️ 🏺 🔮 📿 🧿 🪬 💈 ⚗️ 🔭 🔬 🕳️ 🩻 🩹 🩺 💊 💉 🩸 🧬 🦠 🧫 🧪 🌡️ 🧹 🪠 🧺 🧻 🚽 🚰 🚿 🛁 🛀 🧼 🪥 🪒 🧽 🪣 🧴 🛎️ 🔑 🗝️ 🚪 🪑 🛋️ 🛏️ 🛌 🧸 🪆 🖼️ 🪞 🪟 🛍️ 🛒 🎁 🎈 🎏 🎀 🪄 🪅 🎊 🎉 🎎 🏮 🎐 🧧 ✉️ 📩 📨 📧 💌 📥 📤 📦 🏷️ 📪 📫 📬 📭 📮 📯 📜 📃 📄 📑 🧾 📊 📈 📉 🗒️ 🗓️ 📆 📅 🗑️ 📇 🗃️ 🗳️ 🗄️ 📋 📁 📂 🗂️ 🗞️ 📰 📓 📔 📒 📕 📗 📘 📙 📚 📖 🔖 🧷 🔗 📎 🖇️ 📐 📏 🧮 📌 📍 ✂️ 🖊️ 🖋️ ✒️ 🖌️ 🖍️ 📝 ✏️ 🔍 🔎 🔏 🔐 🔒 🔓'.split(' ') },
        { key:'symbols', icon:'🔣', label:'Symboles', items:'❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💔 ❣️ 💕 💞 💓 💗 💖 💘 💝 💟 ☮️ ✝️ ☪️ 🕉️ ☸️ ✡️ 🔯 🕎 ☯️ ☦️ 🛐 ⛎ ♈ ♉ ♊ ♋ ♌ ♍ ♎ ♏ ♐ ♑ ♒ ♓ 🆔 ⚛️ 🉑 ☢️ ☣️ 📴 📳 🈶 🈚 🈸 🈺 🈷️ ✴️ 🆚 💮 🉐 ㊙️ ㊗️ 🈴 🈵 🈹 🈲 🅰️ 🅱️ 🆎 🆑 🅾️ 🆘 ❌ ⭕ 🛑 ⛔ 📛 🚫 💯 💢 ♨️ 🚷 🚯 🚳 🚱 🔞 📵 🚭 ❗ ❕ ❓ ❔ ‼️ ⁉️ 🔅 🔆 〽️ ⚠️ 🚸 🔱 ⚜️ 🔰 ♻️ ✅ 🈯 💹 ❇️ ✳️ ❎ 🌐 💠 Ⓜ️ 🌀 💤 🏧 🚾 ♿ 🅿️ 🛗 🈳 🈂️ 🛂 🛃 🛄 🛅 🚹 🚺 🚼 ⚧️ 🚻 🚮 🎦 📶 🈁 🔣 ℹ️ 🔤 🔡 🔠 🆖 🆗 🆙 🆒 🆕 🆓 0️⃣ 1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣ 6️⃣ 7️⃣ 8️⃣ 9️⃣ 🔟 🔢 #️⃣ *️⃣ ⏏️ ▶️ ⏸️ ⏯️ ⏹️ ⏺️ ⏭️ ⏮️ ⏩ ⏪ ⏫ ⏬ ◀️ 🔼 🔽 ➡️ ⬅️ ⬆️ ⬇️ ↗️ ↘️ ↙️ ↖️ ↕️ ↔️ ↪️ ↩️ ⤴️ ⤵️ 🔀 🔁 🔂 🔄 🔃 🎵 🎶 ➕ ➖ ➗ ✖️ 🟰 ♾️ 💲 💱 ™️ ©️ ®️ 〰️ ➰ ➿ 🔚 🔙 🔛 🔝 🔜 ✔️ ☑️ 🔘 🔴 🟠 🟡 🟢 🔵 🟣 ⚫ ⚪ 🟤 🔺 🔻 🔸 🔹 🔶 🔷 🔳 🔲 ▪️ ▫️ ◾ ◽ ◼️ ◻️ 🟥 🟧 🟨 🟩 🟦 🟪 ⬛ ⬜ 🟫'.split(' ') },
        { key:'flags', icon:'🏳️', label:'Drapeaux', items:'🏳️ 🏴 🏁 🚩 🏳️‍🌈 🏳️‍⚧️ 🇺🇳 🇦🇨 🇦🇩 🇦🇪 🇦🇫 🇦🇬 🇦🇮 🇦🇱 🇦🇲 🇦🇴 🇦🇶 🇦🇷 🇦🇸 🇦🇹 🇦🇺 🇦🇼 🇦🇽 🇦🇿 🇧🇦 🇧🇧 🇧🇩 🇧🇪 🇧🇫 🇧🇬 🇧🇭 🇧🇮 🇧🇯 🇧🇱 🇧🇲 🇧🇳 🇧🇴 🇧🇶 🇧🇷 🇧🇸 🇧🇹 🇧🇻 🇧🇼 🇧🇾 🇧🇿 🇨🇦 🇨🇨 🇨🇩 🇨🇫 🇨🇬 🇨🇭 🇨🇮 🇨🇰 🇨🇱 🇨🇲 🇨🇳 🇨🇴 🇨🇵 🇨🇷 🇨🇺 🇨🇻 🇨🇼 🇨🇽 🇨🇾 🇨🇿 🇩🇪 🇩🇬 🇩🇯 🇩🇰 🇩🇲 🇩🇴 🇩🇿 🇪🇦 🇪🇨 🇪🇪 🇪🇬 🇪🇭 🇪🇷 🇪🇸 🇪🇹 🇪🇺 🇫🇮 🇫🇯 🇫🇰 🇫🇲 🇫🇴 🇫🇷 🇬🇦 🇬🇧 🇬🇩 🇬🇪 🇬🇫 🇬🇬 🇬🇭 🇬🇮 🇬🇱 🇬🇲 🇬🇳 🇬🇵 🇬🇶 🇬🇷 🇬🇸 🇬🇹 🇬🇺 🇬🇼 🇬🇾 🇭🇰 🇭🇲 🇭🇳 🇭🇷 🇭🇹 🇭🇺 🇮🇨 🇮🇩 🇮🇪 🇮🇱 🇮🇲 🇮🇳 🇮🇴 🇮🇶 🇮🇷 🇮🇸 🇮🇹 🇯🇪 🇯🇲 🇯🇴 🇯🇵 🇰🇪 🇰🇬 🇰🇭 🇰🇮 🇰🇲 🇰🇳 🇰🇵 🇰🇷 🇰🇼 🇰🇾 🇰🇿 🇱🇦 🇱🇧 🇱🇨 🇱🇮 🇱🇰 🇱🇷 🇱🇸 🇱🇹 🇱🇺 🇱🇻 🇱🇾 🇲🇦 🇲🇨 🇲🇩 🇲🇪 🇲🇫 🇲🇬 🇲🇭 🇲🇰 🇲🇱 🇲🇲 🇲🇳 🇲🇴 🇲🇵 🇲🇶 🇲🇷 🇲🇸 🇲🇹 🇲🇺 🇲🇻 🇲🇼 🇲🇽 🇲🇾 🇲🇿 🇳🇦 🇳🇨 🇳🇪 🇳🇫 🇳🇬 🇳🇮 🇳🇱 🇳🇴 🇳🇵 🇳🇷 🇳🇺 🇳🇿 🇴🇲 🇵🇦 🇵🇪 🇵🇫 🇵🇬 🇵🇭 🇵🇰 🇵🇱 🇵🇲 🇵🇳 🇵🇷 🇵🇸 🇵🇹 🇵🇼 🇵🇾 🇶🇦 🇷🇪 🇷🇴 🇷🇸 🇷🇺 🇷🇼 🇸🇦 🇸🇧 🇸🇨 🇸🇩 🇸🇪 🇸🇬 🇸🇭 🇸🇮 🇸🇯 🇸🇰 🇸🇱 🇸🇲 🇸🇳 🇸🇴 🇸🇷 🇸🇸 🇸🇹 🇸🇻 🇸🇽 🇸🇾 🇸🇿 🇹🇦 🇹🇨 🇹🇩 🇹🇫 🇹🇬 🇹🇭 🇹🇯 🇹🇰 🇹🇱 🇹🇲 🇹🇳 🇹🇴 🇹🇷 🇹🇹 🇹🇻 🇹🇼 🇹🇿 🇺🇦 🇺🇬 🇺🇲 🇺🇸 🇺🇾 🇺🇿 🇻🇦 🇻🇨 🇻🇪 🇻🇬 🇻🇮 🇻🇳 🇻🇺 🇼🇫 🇼🇸 🇽🇰 🇾🇪 🇾🇹 🇿🇦 🇿🇲 🇿🇼'.split(' ') }
      ];

      let activeStickerCategory = 'recent';
      let stableViewportHeight = Math.max(window.innerHeight || 0, window.visualViewport ? window.visualViewport.height : 0);
      let keyboardForceUntil = 0;

      function buildStickerTabs(){
        emojiTabs.innerHTML = '';
        STICKER_CATEGORIES.forEach(cat => {
          const btn = document.createElement('button');
          btn.className = 'emoji-tab' + (cat.key === activeStickerCategory ? ' active' : '');
          btn.type = 'button';
          btn.textContent = cat.icon;
          btn.title = cat.label;
          btn.dataset.key = cat.key;
          emojiTabs.appendChild(btn);
        });
      }

      function renderStickerCategory(key){
        const cat = STICKER_CATEGORIES.find(item => item.key === key) || STICKER_CATEGORIES[0];
        activeStickerCategory = cat.key;
        stickerCategoryLabel.textContent = cat.label;
        Array.from(emojiTabs.children).forEach(btn => {
          btn.classList.toggle('active', btn.dataset.key === cat.key);
        });

        stickers.innerHTML = '';
        cat.items.forEach(item => {
          const btn = document.createElement('button');
          btn.className = 'sticker';
          btn.type = 'button';
          btn.textContent = item;
          stickers.appendChild(btn);
        });
        requestAnimationFrame(updateComposerSpace);
      }



      /* HAPPYAD MSG V636 — session Supabase stable + RPC temps réel */
      function cleanMsg(v){return String(v==null?'':v).trim();}
      function escMsg(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c;});}
      function msgTimeout(promise, ms, fallback){
        return new Promise(function(resolve){
          var done=false;
          var timer=setTimeout(function(){if(done)return;done=true;resolve({__timeout:true,data:fallback||null,error:null});},ms||4500);
          Promise.resolve(promise).then(function(v){if(done)return;done=true;clearTimeout(timer);resolve(v);}).catch(function(err){if(done)return;done=true;clearTimeout(timer);resolve({data:null,error:err});});
        });
      }
      function safeParam(v){try{return decodeURIComponent(String(v||''));}catch(e){return String(v||'');}}
      function msgClient(){
        try{
          if(happyadMsgSupabase) return happyadMsgSupabase;
          try{if(window.parent && window.parent!==window && window.parent.happyadSupabase){happyadMsgSupabase=window.parent.happyadSupabase;window.happyadSupabase=happyadMsgSupabase;return happyadMsgSupabase;}}catch(_pe){}
          if(window.happyadSupabase){happyadMsgSupabase=window.happyadSupabase;return happyadMsgSupabase;}
          if(window.supabase && window.supabase.createClient){
            const opts={auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:'sb-txjjyhupbejgjcianrmr-auth-token'}};
            happyadMsgSupabase=window.supabase.createClient(window.HAPPYAD_SUPABASE_URL, window.HAPPYAD_SUPABASE_KEY, opts);
            window.happyadSupabase=happyadMsgSupabase;
            try{if(window.parent && window.parent!==window && !window.parent.happyadSupabase)window.parent.happyadSupabase=happyadMsgSupabase;}catch(_e){}
            return happyadMsgSupabase;
          }
        }catch(e){}
        return null;
      }
      function readSupabaseAuthUserFromStorage(){
        try{
          const keys=[];
          try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k)keys.push(k);}}catch(e){}
          try{for(let i=0;i<sessionStorage.length;i++){const k=sessionStorage.key(i);if(k&&keys.indexOf(k)<0)keys.push(k);}}catch(e){}
          for(const k of keys){
            if(!/supabase|sb-|auth-token|auth\.token/i.test(k)) continue;
            const raw=(localStorage.getItem(k)||sessionStorage.getItem(k)||'');
            const parsed=safeJsonParse(raw);
            if(!parsed) continue;
            const roots=[parsed.user, parsed.currentSession&&parsed.currentSession.user, parsed.session&&parsed.session.user, parsed.data&&parsed.data.user, parsed].filter(Boolean);
            for(const root of roots){
              const id=cleanMsg(root&&root.id);
              if(id && /^[0-9a-f-]{20,}$/i.test(id)) return root;
            }
          }
        }catch(e){}
        return null;
      }
      function forEachHappyStorage(callback){
        try{
          const areas=[localStorage,sessionStorage];
          try{if(window.parent&&window.parent!==window&&window.parent.localStorage)areas.push(window.parent.localStorage);}catch(_e){}
          try{if(window.parent&&window.parent!==window&&window.parent.sessionStorage)areas.push(window.parent.sessionStorage);}catch(_e){}
          areas.forEach(function(area){
            try{
              for(let i=0;i<area.length;i++){
                const k=area.key(i); if(!k)continue;
                callback(k,area.getItem(k)||'',area);
              }
            }catch(_e){}
          });
        }catch(e){}
      }
      function sessionCandidateFromValue(raw){
        try{
          const parsed=safeJsonParse(raw); if(!parsed)return null;
          const roots=[parsed,parsed.currentSession,parsed.session,parsed.data&&parsed.data.session,parsed.data,parsed.auth].filter(Boolean);
          for(const root of roots){
            const access=cleanMsg(root.access_token||root.accessToken||root.access);
            const refresh=cleanMsg(root.refresh_token||root.refreshToken||root.refresh);
            const user=(root.user||root.currentUser||parsed.user||parsed.currentSession&&parsed.currentSession.user||parsed.session&&parsed.session.user||{});
            const uid=cleanMsg(user&&user.id);
            const exp=Number(root.expires_at||root.expiresAt||0);
            if(access&&refresh){
              if(exp && exp < Math.floor(Date.now()/1000)-120) continue;
              return {access_token:access,refresh_token:refresh,user:user,id:uid,expires_at:exp||0};
            }
          }
        }catch(e){}
        return null;
      }
      function readSupabaseStoredSession(){
        let found=null;
        forEachHappyStorage(function(k,raw){
          if(found)return;
          if(!/sb-|supabase|auth-token|auth\.token/i.test(k))return;
          const cand=sessionCandidateFromValue(raw);
          if(cand&&cand.access_token&&cand.refresh_token)found=cand;
        });
        return found;
      }
      async function ensureMsgSession(options){
        options=options||{};
        if(happyadMsgSessionBridgePromise && !options.force)return happyadMsgSessionBridgePromise;
        happyadMsgSessionBridgePromise=(async function(){
          const c=msgClient();
          let id='', token='', ready=false, user=null;
          try{
            if(c&&c.auth&&c.auth.getSession){
              const s=await msgTimeout(c.auth.getSession(),2600,null);
              const sess=s&&s.data&&s.data.session;
              id=cleanMsg(sess&&sess.user&&sess.user.id); token=cleanMsg(sess&&sess.access_token); user=sess&&sess.user||null;
              if(id&&token)ready=true;
            }
          }catch(e){}
          if(!ready){
            try{
              const stored=readSupabaseStoredSession();
              if(stored&&stored.access_token&&stored.refresh_token&&c&&c.auth&&c.auth.setSession){
                const set=await msgTimeout(c.auth.setSession({access_token:stored.access_token,refresh_token:stored.refresh_token}),3600,null);
                const sess=set&&set.data&&set.data.session;
                id=cleanMsg(sess&&sess.user&&sess.user.id)||cleanMsg(stored.id);
                token=cleanMsg(sess&&sess.access_token)||stored.access_token;
                user=sess&&sess.user||stored.user||null;
                ready=!!(id&&token);
              }
            }catch(e){}
          }
          if(!ready){
            try{
              if(c&&c.auth&&c.auth.getUser){
                const r=await msgTimeout(c.auth.getUser(),2600,null);
                id=cleanMsg(r&&r.data&&r.data.user&&r.data.user.id)||id;
                user=r&&r.data&&r.data.user||user;
                if(id){
                  const s2=c.auth&&c.auth.getSession?await msgTimeout(c.auth.getSession(),1800,null):null;
                  token=cleanMsg(s2&&s2.data&&s2.data.session&&s2.data.session.access_token)||token;
                  ready=!!token;
                }
              }
            }catch(e){}
          }
          if(id){try{localStorage.setItem('HAPPYAD_AUTH_UID',id);}catch(_e){}}
          if(token&&c&&c.realtime&&typeof c.realtime.setAuth==='function'){try{c.realtime.setAuth(token);}catch(_e){}}
          happyadMsgSessionSnapshot={id:id||stableAuthUidFromAnySource(),ready:!!ready,token:token||'',user:user||null};
          setTimeout(function(){if(happyadMsgSessionBridgePromise)happyadMsgSessionBridgePromise=null;},900);
          return happyadMsgSessionSnapshot;
        })();
        return happyadMsgSessionBridgePromise;
      }

      function stableAuthUidFromAnySource(){
        try{
          const cachedAuth=readSupabaseAuthUserFromStorage();
          if(cachedAuth&&cachedAuth.id)return cleanMsg(cachedAuth.id);
        }catch(e){}
        try{
          const keys=['HAPPYAD_AUTH_UID','happyad_my_id','happyadUserId','myId'];
          for(const k of keys){const v=cleanMsg(localStorage.getItem(k)||sessionStorage.getItem(k));if(v&&v!=='guest')return v;}
        }catch(e){}
        try{
          const u=readConnectedUserFromStorage()||{};
          const id=cleanMsg(u.id||u.user_id||u.uid||u.uuid||u.auth_id);
          if(id&&id!=='guest')return id;
        }catch(e){}
        return '';
      }
      async function msgUser(){
        if(happyadMsgCurrentUser && happyadMsgCurrentUser.id) return happyadMsgCurrentUser;
        const c=msgClient();
        let local=readConnectedUserFromStorage()||{};
        let authUser=readSupabaseAuthUserFromStorage();
        let session=await ensureMsgSession().catch(function(){return {id:'',ready:false,user:null};});
        authUser=(session&&session.user)||authUser||null;
        let profile={};
        const authId=cleanMsg(session&&session.id)||(authUser&&authUser.id)||stableAuthUidFromAnySource()||cleanMsg(local.id||local.user_id||local.uid||local.uuid||localStorage.getItem('HAPPYAD_AUTH_UID'));
        if(authId){
          try{localStorage.setItem('HAPPYAD_AUTH_UID',authId);}catch(_e){}
          try{
            const pr=await msgTimeout(c.from('profiles').select('*').eq('id',authId).maybeSingle(),2200,null);
            if(pr && !pr.error && pr.data) profile=pr.data;
          }catch(e){}
        }
        const meta=(authUser&&authUser.user_metadata)||{};
        const rawMeta=(authUser&&authUser.raw_user_meta_data)||{};
        const cachedMe = readMsgJson(HAPPYAD_MSG_ME_CACHE_KEY, {}) || {};
        const exactMe = findProfileIdentityInCaches(authId) || {};
        happyadMsgCurrentUser={
          id:authId || cleanMsg(cachedMe.id),
          name:userNameFromObject(exactMe)||userNameFromObject(profile)||userNameFromObject(meta)||userNameFromObject(rawMeta)||local.name||local.full_name||local.display_name||cachedMe.name||CONNECTED_USER_FALLBACK.name,
          avatar:userAvatarFromObject(exactMe)||userAvatarFromObject(profile)||userAvatarFromObject(meta)||userAvatarFromObject(rawMeta)||local.avatar||local.avatar_url||cachedMe.avatar||'',
          badge:userBadgeFromObject(exactMe)||userBadgeFromObject(profile)||userBadgeFromObject(meta)||userBadgeFromObject(rawMeta)||local.badge||cachedMe.badge||CONNECTED_USER_FALLBACK.badge,
          online:true,
          story:'active',
          authReady:!!(session&&session.ready),
          sessionReady:!!(session&&session.ready)
        };
        if(happyadMsgCurrentUser.id || happyadMsgCurrentUser.name !== CONNECTED_USER_FALLBACK.name){writeMsgJson(HAPPYAD_MSG_ME_CACHE_KEY,happyadMsgCurrentUser);}
        return happyadMsgCurrentUser;
      }
      function applyMsgUserToHeader(u){
        try{
          if(!u) return;
          connectedUserName.textContent=u.name||'Messages';
          setBadge(currentUserBadge,u.badge||'');
          const myInitials=initialsFromName(u.name||'HA');
          currentUserInitials.textContent=myInitials;
          currentUserAvatar.classList.toggle('initials-long', Array.from(myInitials).length > 1);
          if(u.avatar){currentUserPhoto.src=u.avatar;currentUserAvatar.classList.add('has-photo');}
          else{currentUserAvatar.classList.remove('has-photo');currentUserPhoto.removeAttribute('src');}
        }catch(e){}
      }
      function readMsgJson(key, fallback){
        try{const raw=localStorage.getItem(key)||sessionStorage.getItem(key);return raw?JSON.parse(raw):fallback;}catch(e){return fallback;}
      }
      function writeMsgJson(key, value, sessionToo){
        try{localStorage.setItem(key, JSON.stringify(value));}catch(e){}
        if(sessionToo){try{sessionStorage.setItem(key, JSON.stringify(value));}catch(e){}}
      }
      function msgProfileCache(){return readMsgJson(HAPPYAD_MSG_PROFILE_CACHE_KEY, {}) || {};}
      function saveMsgProfileCache(map){writeMsgJson(HAPPYAD_MSG_PROFILE_CACHE_KEY, map || {});}
      function msgStorageKeys(prefix){
        const out=[];
        try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.indexOf(prefix)===0)out.push(k);}}catch(e){}
        try{for(let i=0;i<sessionStorage.length;i++){const k=sessionStorage.key(i);if(k&&k.indexOf(prefix)===0&&out.indexOf(k)<0)out.push(k);}}catch(e){}
        return out;
      }
      function uniqMsg(arr){const out=[];arr.forEach(function(x){x=cleanMsg(x);if(x&&out.indexOf(x)<0)out.push(x);});return out;}
      function msgCurrentUserCacheId(){
        const u=happyadMsgCurrentUser||readConnectedUserFromStorage()||{};
        return cleanMsg(u.id||u.user_id||u.uid||u.uuid||localStorage.getItem('HAPPYAD_AUTH_UID')||'guest')||'guest';
      }
      function msgReadStateKey(){return 'HAPPYAD_MSG_READ_STATE_STABLE_'+HAPPYAD_MSG_STABLE_CACHE_VERSION+'_'+msgCurrentUserCacheId();}
      function readConversationReadState(){return readMsgJson(msgReadStateKey(),{})||{};}
      function saveConversationReadState(map){writeMsgJson(msgReadStateKey(),map||{});}
      function rememberConversationReadLocal(conversationId){
        try{
          conversationId=cleanMsg(conversationId); if(!conversationId)return;
          const cached=readMessagesCache(conversationId);
          const pairs=readConversationPairsCache();
          let lastId='', lastAt='';
          if(cached.length){const last=cached[cached.length-1]||{}; lastId=messageStableId(last); lastAt=last.created_at||'';}
          if(!lastAt){
            pairs.some(function(pair){
              const item=(pair&&pair.item)||pair||{};
              if(cleanMsg(item.conversation_id)===conversationId){lastId=cleanMsg(item.last_message_id); lastAt=cleanMsg(item.last_message_at||item.conversation_updated_at); return true;}
              return false;
            });
          }
          const map=readConversationReadState();
          map[conversationId]={at:Date.now(),last_message_id:lastId||'',last_message_at:lastAt||''};
          saveConversationReadState(map);
          try{localStorage.setItem('HAPPYAD_MSG_HOME_COUNTER_REFRESH',String(Date.now()));}catch(_e){}
          try{if(window.parent&&window.parent!==window)window.parent.postMessage({type:'HAPPYAD_MSG_COUNTER_REFRESH',conversation_id:conversationId},'*');}catch(_e){}
          try{window.dispatchEvent(new CustomEvent('HAPPYAD_MSG_COUNTER_REFRESH',{detail:{conversation_id:conversationId}}));}catch(_e){}
        }catch(e){}
      }
      function msgUnreadIdsKey(){return HAPPYAD_MSG_UNREAD_IDS_KEY+'_'+msgCurrentUserCacheId();}
      function readUnreadIdsMap(){return readMsgJson(msgUnreadIdsKey(),{})||{};}
      function saveUnreadIdsMap(map){writeMsgJson(msgUnreadIdsKey(),map||{});}
      function cleanupOldUnreadIdsForList(){
        try{
          const now=Date.now();
          const map=readUnreadIdsMap();
          let changed=false;
          Object.keys(map||{}).forEach(function(cid){
            const box=map[cid]||{};
            const ids=box.ids||{};
            Object.keys(ids).forEach(function(id){
              if(now-Number(ids[id]||0)>1000*60*15){delete ids[id]; changed=true;}
            });
            if(!Object.keys(ids).length){delete map[cid]; changed=true;}
            else {box.ids=ids; map[cid]=box;}
          });
          if(changed) saveUnreadIdsMap(map);
        }catch(e){}
      }
      function unreadIdsForConversation(conversationId){
        try{
          const map=readUnreadIdsMap();
          const box=map[cleanMsg(conversationId)]||{};
          const ids=box.ids||{};
          const now=Date.now();
          const out=Object.keys(ids).filter(function(id){return id && now-Number(ids[id]||0) < 1000*60*60*24*14;});
          return out;
        }catch(e){return [];}
      }
      function unreadCountForConversation(conversationId){return Math.min(99, unreadIdsForConversation(conversationId).length);}
      function clearUnreadForConversation(conversationId){
        try{
          conversationId=cleanMsg(conversationId); if(!conversationId)return;
          const map=readUnreadIdsMap();
          if(map[conversationId]){delete map[conversationId]; saveUnreadIdsMap(map);}
        }catch(e){}
      }
      function isConversationActuallyOpen(conversationId){
        try{
          conversationId=cleanMsg(conversationId);
          return !!conversationId && !!activeConversationId && cleanMsg(activeConversationId)===conversationId && !chatView.classList.contains('hidden');
        }catch(e){return false;}
      }
      function removeUnreadForMessage(conversationId,messageId){
        try{
          conversationId=cleanMsg(conversationId); messageId=cleanMsg(messageId); if(!conversationId||!messageId)return;
          const map=readUnreadIdsMap(); const box=map[conversationId]; if(!box||!box.ids)return;
          if(box.ids[messageId]){delete box.ids[messageId]; saveUnreadIdsMap(map);}
        }catch(e){}
      }
      function rememberUnreadMessageForList(m){
        try{
          if(!m)return 0;
          const cid=cleanMsg(m.conversation_id); if(!cid)return 0;
          if(isConversationActuallyOpen(cid)) return 0;
          const mid=messageStableId(m); if(!mid)return unreadCountForConversation(cid);
          const map=readUnreadIdsMap(); const box=map[cid]||{ids:{},at:Date.now()};
          box.ids=box.ids||{};
          box.ids[mid]=Date.now();
          box.at=Date.now();
          map[cid]=box;
          saveUnreadIdsMap(map);
          return unreadCountForConversation(cid);
        }catch(e){return 0;}
      }
      function shouldCountIncomingMessageForList(m){
        try{
          if(!m)return false;
          const cid=cleanMsg(m.conversation_id); if(!cid)return false;
          if(isConversationActuallyOpen(cid)) return false;
          if(m.is_mine===true) return false;
          const me=cleanMsg((happyadMsgCurrentUser&&happyadMsgCurrentUser.id)||msgCurrentUserCacheId());
          if(me && cleanMsg(m.sender_id)===me) return false;
          if(cleanMsg(m.my_read_at)) return false;
          const state=readConversationReadState()[cid]||null;
          const mid=messageStableId(m);
          const created=Date.parse(m.created_at||0)||0;
          if(state){
            if(mid && cleanMsg(state.last_message_id)===mid) return false;
            const at=Number(state.at||0); if(at && created && created <= at+2500) return false;
          } else if(created && created < happyadMsgListBootAt - 5000){
            // Première ouverture: ne pas recompter les anciens messages comme nouveaux.
            return false;
          }
          return true;
        }catch(e){return false;}
      }
      function unreadForConversationItem(item){
        try{
          item=item||{};
          const cid=cleanMsg(item.conversation_id);
          if(!cid) return 0;
          if(isConversationActuallyOpen(cid)) return 0;
          if(item.last_message_is_mine) return 0;
          const localUnread=unreadCountForConversation(cid);
          if(localUnread>0) return localUnread;
          const state=readConversationReadState()[cid]||null;
          if(state){
            const readAt=Number(state.at||0);
            const lastTime=Date.parse(item.last_message_at||item.conversation_updated_at||0)||0;
            if(cleanMsg(item.last_message_id) && cleanMsg(item.last_message_id)===cleanMsg(state.last_message_id)) return 0;
            if(lastTime && readAt && lastTime <= readAt + 2500) return 0;
          }
          if(!item.__unread_confirmed && !item.__server_unread_confirmed) return 0;
          let unread=Number(item.unread_count||0);
          if(!Number.isFinite(unread)||unread<0) unread=0;
          if(unread<=0) return 0;
          /* Protection: l'ancien compteur serveur peut être gonflé. Sans ids locaux,
             on signale seulement qu'il y a un nouveau message au lieu d'afficher 10/11. */
          return 1;
        }catch(e){return 0;}
      }
      function cacheMsgProfile(p, fallbackId){
        try{
          if(!p) return;
          const info=profileInfo(p,fallbackId);
          const id=cleanMsg(info.id||fallbackId);
          if(!id) return;
          const map=msgProfileCache();
          const old=map[id]||{};
          const keepOldExact = old.__profileExact && !p.__profileExact;
          map[id]=Object.assign({}, old, {
            id:id,
            name:keepOldExact ? (old.name||info.name) : ((info.name&&info.name!=='Utilisateur HAPPYAD')?info.name:(old.name||info.name)),
            full_name:keepOldExact ? (old.full_name||old.name||info.name) : ((info.name&&info.name!=='Utilisateur HAPPYAD')?info.name:(old.full_name||old.name||info.name)),
            display_name:keepOldExact ? (old.display_name||old.name||info.name) : ((info.name&&info.name!=='Utilisateur HAPPYAD')?info.name:(old.display_name||old.name||info.name)),
            avatar:keepOldExact ? (old.avatar||info.avatar||'') : (info.avatar||old.avatar||''),
            avatar_url:keepOldExact ? (old.avatar_url||old.avatar||info.avatar||'') : (info.avatar||old.avatar_url||old.avatar||''),
            badge:keepOldExact ? (old.badge||info.badge||'') : (info.badge||old.badge||''),
            user_badge:keepOldExact ? (old.user_badge||old.badge||info.badge||'') : (info.badge||old.user_badge||old.badge||''),
            __profileExact:!!(old.__profileExact||p.__profileExact),
            initial:info.initial||old.initial||'UH',
            at:Date.now()
          });
          saveMsgProfileCache(map);
        }catch(e){}
      }
      function getCachedMsgProfile(id){
        try{const p=msgProfileCache()[cleanMsg(id)]||null;return p&&p.id?p:null;}catch(e){return null;}
      }

      function profileIdOfMessageObject(o){
        o=o||{};
        return cleanMsg(o.id||o.user_id||o.uid||o.uuid||o.auth_id||o.creatorId||o.creator_id||o.owner_id||o.ownerId||o.userId||o.profile_id||o.profileId);
      }
      function isGoodMsgProfileNameValue(v){
        return !isGenericMsgName(v) && cleanMsg(v).toLowerCase().indexOf('aucun compte') < 0 && cleanMsg(v).toLowerCase() !== 'chargement profil...';
      }
      function messageProfileIdentityFromObject(o, fallbackId){
        o=o||{};
        const id=profileIdOfMessageObject(o)||cleanMsg(fallbackId);
        const name=userNameFromObject(o)||o.creatorName||o.creator_name||o.full_name||o.display_name||o.name||o.username||'';
        const avatar=userAvatarFromObject(o)||o.avatar||o.avatar_url||'';
        const badge=userBadgeFromObject(o)||o.badge||o.user_badge||o.userBadge||o.verified_badge||o.verifiedBadge||o.badge_type||o.certification||'';
        return {id:id,user_id:id,name:name,full_name:name,display_name:name,username:o.username||o.handle||'',handle:o.handle||o.username||'',avatar:avatar,avatar_url:avatar,badge:badge,user_badge:badge,__profileExact:true};
      }
      function readMessageArrayCache(key){
        try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[];}catch(e){return [];}
      }
      function findProfileIdentityInCaches(uid){
        uid=cleanMsg(uid); if(!uid)return null;
        let best=null;
        function accept(o){
          try{
            if(!o || best)return;
            const oid=profileIdOfMessageObject(o);
            if(!oid || String(oid)!==String(uid))return;
            const info=messageProfileIdentityFromObject(o,uid);
            if(info.avatar || isGoodMsgProfileNameValue(info.name) || info.badge){best=info;}
          }catch(e){}
        }
        try{accept((window.__HAPPYAD_PUBLIC_PROFILE_RAM_CACHE__||{})[uid]);}catch(e){}
        ['HAPPYAD_PUBLIC_PROFILE_STABLE_'+uid,'HAPPYAD_ACTIVE_PROFILE','HAPPYAD_MESSAGE_DIRECT_PROFILE','HAPPYAD_CENTRAL_USER_V10_CLEAN_STATS_FULL','HAPPYAD_USER','HAPPYAD_CURRENT_USER','HAPPYAD_PROFILE'].forEach(function(k){try{accept(JSON.parse(localStorage.getItem(k)||sessionStorage.getItem(k)||'{}')||{});}catch(e){}});
        ['HAPPYAD_PROFILE_HOME_PHOTO_BRIDGE_V482','HAPPYAD_PUBLIC_PROFILE_CACHE_V1','HAPPYAD_PUBLIC_PROFILE_POSTS_CACHE_V1','HAPPYAD_PROFILE_POSTS_CACHE_V1','HAPPYAD_GLOBAL_POSTS_CACHE_V1','HAPPYAD_PUBLISH_POSTS_V2','HAPPYAD_HOME_POSTS_CACHE_V1','HAPPYAD_SEARCH_POSTS_FAST_CACHE_V1','HAPPYAD_PROFILE_OWN_POSTS_STABLE_CACHE_V1','HAPPYAD_FEED_CACHE_V1','HAPPYAD_POSTS_CACHE_V1','HAPPYAD_CACHED_POSTS_V1'].forEach(function(k){
          readMessageArrayCache(k).some(function(x){accept(x);return !!best;});
        });
        return best;
      }
      function msgConversationsCacheKey(){
        return 'HAPPYAD_MSG_CONVERSATIONS_CACHE_STABLE_'+HAPPYAD_MSG_STABLE_CACHE_VERSION+'_'+msgCurrentUserCacheId();
      }
      function msgConversationCacheKeys(){
        const ids=uniqMsg([msgCurrentUserCacheId(), localStorage.getItem('HAPPYAD_AUTH_UID'), 'guest']);
        const versions=uniqMsg([HAPPYAD_MSG_CACHE_VERSION].concat(HAPPYAD_MSG_OLD_CACHE_VERSIONS||[]));
        let keys=[];
        ids.forEach(function(id){
          keys.push('HAPPYAD_MSG_CONVERSATIONS_CACHE_STABLE_'+HAPPYAD_MSG_STABLE_CACHE_VERSION+'_'+id);
          versions.forEach(function(v){keys.push('HAPPYAD_MSG_CONVERSATIONS_CACHE_'+v+'_'+id);});
        });
        msgStorageKeys('HAPPYAD_MSG_CONVERSATIONS_CACHE_').forEach(function(k){
          if(keys.indexOf(k)<0)keys.push(k);
        });
        return uniqMsg(keys);
      }
      function msgMessagesCacheKey(conversationId){return 'HAPPYAD_MSG_MESSAGES_CACHE_STABLE_'+HAPPYAD_MSG_STABLE_CACHE_VERSION+'_'+cleanMsg(conversationId);}
      function msgMessageCacheKeys(conversationId){
        const cid=cleanMsg(conversationId);
        const versions=uniqMsg([HAPPYAD_MSG_CACHE_VERSION].concat(HAPPYAD_MSG_OLD_CACHE_VERSIONS||[]));
        let keys=['HAPPYAD_MSG_MESSAGES_CACHE_STABLE_'+HAPPYAD_MSG_STABLE_CACHE_VERSION+'_'+cid];
        versions.forEach(function(v){keys.push('HAPPYAD_MSG_MESSAGES_CACHE_'+v+'_'+cid);});
        msgStorageKeys('HAPPYAD_MSG_MESSAGES_CACHE_').forEach(function(k){if(k.endsWith('_'+cid)&&keys.indexOf(k)<0)keys.push(k);});
        return uniqMsg(keys);
      }
      function conversationPairsFromServer(list, profiles){
        return (list||[]).map(function(item){
          const otherId=String(item.other_user_id||'');
          const p=(profiles&&profiles[otherId])||getCachedMsgProfile(otherId)||{id:otherId};
          const safeItem=Object.assign({}, item||{}, {__server_unread_confirmed:true, __unread_confirmed:true, __server_seen_at:Date.now()});
          return {item:safeItem, profile:p};
        });
      }
      function normalizeConversationPairForDisplay(pair){
        try{
          if(!pair)return pair;
          const item=Object.assign({},(pair&&pair.item)||pair||{});
          item.unread_count=unreadForConversationItem(item);
          return {item:item,profile:(pair&&pair.profile)||{}};
        }catch(e){return pair;}
      }
      function mergeConversationPairsForStableList(oldPairs, newPairs){
        try{
          const by={};
          function put(pair, isServer){
            if(!pair)return;
            const item=Object.assign({},(pair&&pair.item)||pair||{});
            const key=cleanMsg(item.conversation_id)||cleanMsg(item.other_user_id);
            if(!key)return;
            const prev=by[key]||{item:{},profile:{}};
            const prevItem=prev.item||{};
            const prevProfile=prev.profile||{};
            const nextProfile=Object.assign({},prevProfile,(pair&&pair.profile)||{});
            const merged=Object.assign({},prevItem,item);
            if(!isServer && !item.__unread_confirmed && !item.__server_unread_confirmed) merged.unread_count=unreadForConversationItem(merged);
            if(isServer){merged.__server_unread_confirmed=true; merged.__unread_confirmed=true; merged.__server_seen_at=Date.now();}
            by[key]={item:merged,profile:nextProfile};
          }
          (oldPairs||[]).forEach(function(pair){put(pair,false);});
          (newPairs||[]).forEach(function(pair){put(pair,true);});
          return Object.keys(by).map(function(k){return normalizeConversationPairForDisplay(by[k]);}).sort(function(a,b){
            const ai=(a&&a.item)||{}, bi=(b&&b.item)||{};
            return (Date.parse(bi.last_message_at||bi.conversation_updated_at||bi.created_at||0)||0)-(Date.parse(ai.last_message_at||ai.conversation_updated_at||ai.created_at||0)||0);
          });
        }catch(e){return (newPairs&&newPairs.length?newPairs:oldPairs)||[];}
      }
      function writeConversationPairsCache(pairs){
        try{
          if(!pairs||!pairs.length)return;
          const cleanPairs=(pairs||[]).map(function(pair){return normalizeConversationPairForDisplay(pair);}).slice(0,80);
          writeMsgJson(msgConversationsCacheKey(),{ts:Date.now(),pairs:cleanPairs});
        }catch(e){}
      }
      function readConversationPairsCache(){
        try{
          const by={};
          msgConversationCacheKeys().forEach(function(k){
            const c=readMsgJson(k,null);
            const pairs=c&&Array.isArray(c.pairs)?c.pairs:[];
            pairs.forEach(function(pair){
              if(!pair)return;
              const item=(pair.item)||pair||{};
              const key=cleanMsg(item.conversation_id)||cleanMsg(item.other_user_id);
              if(!key)return;
              const prev=by[key];
              const prevItem=(prev&&prev.item)||{};
              const prevTime=Date.parse(prevItem.last_message_at||prevItem.conversation_updated_at||prevItem.created_at||0)||0;
              const nextTime=Date.parse(item.last_message_at||item.conversation_updated_at||item.created_at||0)||0;
              const profile=Object.assign({}, (prev&&prev.profile)||{}, pair.profile||{});
              by[key]=(prev && prevTime>nextTime) ? {item:Object.assign({}, item, prevItem), profile:profile} : {item:Object.assign({}, prevItem, item), profile:profile};
            });
          });
          return Object.keys(by).map(function(k){return normalizeConversationPairForDisplay(by[k]);}).sort(function(a,b){
            const ai=(a&&a.item)||{}, bi=(b&&b.item)||{};
            return (Date.parse(bi.last_message_at||bi.conversation_updated_at||bi.created_at||0)||0)-(Date.parse(ai.last_message_at||ai.conversation_updated_at||ai.created_at||0)||0);
          });
        }catch(e){return [];}
      }
      function conversationDisplaySignature(pairs){
        try{
          return (pairs||[]).map(function(pair){
            const item=(pair&&pair.item)||pair||{};
            const p=(pair&&pair.profile)||getCachedMsgProfile(item.other_user_id)||{};
            return [
              cleanMsg(item.conversation_id)||cleanMsg(item.other_user_id),
              cleanMsg(item.other_user_id),
              cleanMsg((p&&p.name)||''),
              cleanMsg((p&&p.avatar)||''),
              cleanMsg((p&&p.badge)||''),
              cleanMsg(item.last_message_id),
              cleanMsg(previewForConversation(item)),
              cleanMsg(timeShort(item.last_message_at||item.conversation_updated_at)),
              unreadForConversationItem(item)
            ].join('|');
          }).join('||');
        }catch(e){return String(Date.now());}
      }
      function renderConversationPairs(pairs, emptyText, options){
        options=options||{};
        const panel=document.getElementById('conversationPanel');
        rows=[];
        if(!pairs||!pairs.length){
          if(options.silent && panel.querySelector('.row')) return true;
          happyadMsgLastConversationSignature='';
          panel.querySelectorAll('.row').forEach(x=>x.remove());
          setEmptyConversations(emptyText||'Aucune conversation.');
          return false;
        }
        const sig=conversationDisplaySignature(pairs);
        if(options.silent && sig && sig===happyadMsgLastConversationSignature && panel.querySelector('.row')){
          rows=Array.from(panel.querySelectorAll('.row'));
          emptyState.style.display='none';
          return true;
        }
        happyadMsgLastConversationSignature=sig;
        emptyState.style.display='none';
        panel.querySelectorAll('.row').forEach(x=>x.remove());
        pairs.forEach(function(pair){
          const item=pair.item||pair;
          const p=pair.profile||getCachedMsgProfile(item.other_user_id)||{};
          if(p&&p.id) cacheMsgProfile(p,p.id);
          const row=makeConversationRow(item,p);
          panel.insertBefore(row,emptyState);
          rows.push(row);
        });
        filterRows(searchInput.value||'');
        return true;
      }
      function messageVisualKey(m){
        try{
          const atts=Array.isArray(m&&m.attachments)?m.attachments:[];
          const attKey=atts.map(function(a){return [a.attachment_type||'',a.file_name||'',a.file_size||'',a.duration_seconds||''].join(':');}).join(',');
          return [
            (m&&m.is_mine)?'me':'them',
            cleanMsg(m&&m.message_type||'text'),
            (m&&m.view_once)?'once':'normal',
            (m&&m.deleted_for_all)?'deleted':'ok',
            messageComparableBody(m),
            String(atts.length),
            attKey
          ].join('|');
        }catch(e){return Math.random().toString(36);}
      }
      function currentDomMessageVisualKeys(){
        return Array.from(chatBody.querySelectorAll('.msg')).map(function(el){return el.dataset.visualKey||'';}).filter(Boolean);
      }
      function sameMsgKeyList(a,b){
        if(!a||!b||a.length!==b.length)return false;
        for(let i=0;i<a.length;i++){if(a[i]!==b[i])return false;}
        return true;
      }
      function isMsgPrefix(prefix,full){
        if(!prefix||!full||prefix.length>full.length)return false;
        for(let i=0;i<prefix.length;i++){if(prefix[i]!==full[i])return false;}
        return true;
      }
      function rememberDisplayedMessages(messages){
        happyadMsgDisplayedMessages=(messages||[]).map(function(m){return Object.assign({},m);});
      }
      function chatHasMessagesDom(){return !!chatBody.querySelector('.msg');}
      async function appendServerMessagesSilently(messages, startIndex){
        const list=messages||[];
        for(let i=startIndex;i<list.length;i++){await renderServerMessage(list[i]); const last=chatBody.querySelector('.msg:last-of-type'); if(last) last.dataset.visualKey=messageVisualKey(list[i]);}
        rememberDisplayedMessages(list);
        scrollChatBottom();
      }
      function updateRenderedMessageMetas(messages){
        try{
          const msgs=Array.from(chatBody.querySelectorAll('.msg'));
          (messages||[]).forEach(function(m,i){
            const el=msgs[i]; if(!el)return;
            const meta=el.querySelector('.meta');
            if(meta) meta.textContent=timeShort(m.created_at)+(m.is_mine?(m.other_read_at?' ✓✓ lu':m.other_delivered_at?' ✓✓':' ✓'):'');
            if(m.message_id) el.dataset.messageId=m.message_id;
            if(m.conversation_id) el.dataset.conversationId=m.conversation_id;
            el.dataset.visualKey=messageVisualKey(m);
          });
        }catch(e){}
      }
      function renderMessagesArray(messages, emptyText, options){
        options=options||{};
        return (async function(){
          const list=messages||[];
          const nextKeys=list.map(messageVisualKey);
          const oldKeys=happyadMsgDisplayedMessages.map(messageVisualKey);
          const domKeys=currentDomMessageVisualKeys();
          const liveKeys=domKeys.length?domKeys:oldKeys;
          if(happyadMsgIsRenderingMessages && options.silent) return !!list.length;
          if(!list.length){
            if(options.silent && chatHasMessagesDom()) return true;
            happyadMsgDisplayedMessages=[];
            chatBody.innerHTML='<div class="empty" style="display:block;padding-top:28px">'+escMsg(emptyText||'Aucun message. Écris le premier message.')+'</div>';
            return false;
          }
          if(sameMsgKeyList(liveKeys,nextKeys) && chatHasMessagesDom()){
            updateRenderedMessageMetas(list);
            rememberDisplayedMessages(list);
            return true;
          }
          if(options.silent && liveKeys.length && isMsgPrefix(liveKeys,nextKeys) && chatHasMessagesDom()){
            await appendServerMessagesSilently(list, liveKeys.length);
            return true;
          }
          happyadMsgIsRenderingMessages=true;
          try{
            chatBody.innerHTML='<div class="day">Aujourd’hui</div>';
            for(const m of list){await renderServerMessage(m);}
            chatBody.querySelectorAll('.msg').forEach(function(el,i){el.dataset.visualKey=nextKeys[i]||'';});
            rememberDisplayedMessages(list);
            scrollChatBottom();
            return true;
          }finally{
            happyadMsgIsRenderingMessages=false;
          }
        })();
      }
      function consumedViewOnceMap(){return readMsgJson(HAPPYAD_MSG_CONSUMED_ONCE_KEY,{})||{};}
      function saveConsumedViewOnceMap(map){writeMsgJson(HAPPYAD_MSG_CONSUMED_ONCE_KEY,map||{});}
      function consumedViewOnceKey(conversationId,messageId){return cleanMsg(conversationId)+'::'+cleanMsg(messageId);}
      function markViewOnceConsumedLocal(conversationId,messageId){
        try{
          conversationId=cleanMsg(conversationId||activeConversationId); messageId=cleanMsg(messageId);
          if(!conversationId||!messageId)return;
          const map=consumedViewOnceMap();
          map[consumedViewOnceKey(conversationId,messageId)]={at:Date.now()};
          saveConsumedViewOnceMap(map);
        }catch(e){}
      }
      function isViewOnceConsumedLocal(conversationId,messageId){
        try{
          const map=consumedViewOnceMap();
          return !!map[consumedViewOnceKey(conversationId,messageId)];
        }catch(e){return false;}
      }
      function messageStableId(m){return cleanMsg(m&& (m.message_id||m.id||m.client_temp_id||m.created_at));}
      function messageComparableBody(m){return cleanMsg((m&&m.deleted_for_all)?'message supprimé':(m&&m.body)||'').toLowerCase();}
      function isLocalPendingMessage(m){const id=messageStableId(m); return /^local_|^local_media_/i.test(id) || (!cleanMsg(m&&m.message_id) && !!cleanMsg(m&&m.client_temp_id));}
      function messagesLikelySame(a,b){
        try{
          if(!a||!b)return false;
          const aid=messageStableId(a), bid=messageStableId(b);
          if(aid&&bid&&aid===bid)return true;
          const ac=cleanMsg(a.client_temp_id), bc=cleanMsg(b.client_temp_id);
          if(ac&&bc&&ac===bc)return true;
          if(!!a.is_mine!==!!b.is_mine)return false;
          if(cleanMsg(a.message_type||'text')!==cleanMsg(b.message_type||'text'))return false;
          const abody=messageComparableBody(a), bbody=messageComparableBody(b);
          const aAtt=Array.isArray(a.attachments)?a.attachments.length:0;
          const bAtt=Array.isArray(b.attachments)?b.attachments.length:0;
          if(abody!==bbody || aAtt!==bAtt)return false;
          const at=Date.parse(a.created_at||0)||0, bt=Date.parse(b.created_at||0)||0;
          if(!at||!bt)return false;
          return Math.abs(at-bt) < 180000;
        }catch(e){return false;}
      }
      function filterConsumedViewOnceMessages(conversationId,messages){
        return (messages||[]).filter(function(m){
          const mid=messageStableId(m);
          return !(m && m.view_once && mid && isViewOnceConsumedLocal(conversationId,mid));
        });
      }
      function mergeMessagesForDisplay(conversationId,cached,server){
        const out=[];
        const add=function(m){
          if(!m)return;
          const mid=messageStableId(m);
          if(m.view_once && mid && isViewOnceConsumedLocal(conversationId,mid))return;
          for(let i=0;i<out.length;i++){
            if(messagesLikelySame(out[i],m)){
              const old=out[i];
              const preferServer = !isLocalPendingMessage(m) || isLocalPendingMessage(old);
              out[i]=preferServer?Object.assign({},old,m):Object.assign({},m,old);
              return;
            }
          }
          out.push(m);
        };
        (cached||[]).forEach(add);
        (server||[]).forEach(add);
        return out.sort(function(a,b){return (Date.parse(a.created_at||0)||0)-(Date.parse(b.created_at||0)||0);});
      }
      function readMessagesCache(conversationId){
        try{
          const by={};
          msgMessageCacheKeys(conversationId).forEach(function(k){
            const c=readMsgJson(k,null);
            const messages=c&&Array.isArray(c.messages)?c.messages:[];
            messages.forEach(function(m){
              const key=messageStableId(m);
              if(key)by[key]=Object.assign({},by[key]||{},m);
            });
          });
          return filterConsumedViewOnceMessages(conversationId,Object.keys(by).map(k=>by[k]).sort(function(a,b){return (Date.parse(a.created_at||0)||0)-(Date.parse(b.created_at||0)||0);}));
        }catch(e){return [];}
      }
      function writeMessagesCache(conversationId, messages){
        try{if(conversationId&&messages)writeMsgJson(msgMessagesCacheKey(conversationId),{ts:Date.now(),messages:filterConsumedViewOnceMessages(conversationId,messages).slice(-350)});}
        catch(e){}
      }
      function isGenericMsgName(name){
        const n=String(name||'').trim().toLowerCase();
        return !n || n==='utilisateur happyad' || n==='happyad' || n==='conversation' || n==='user' || n==='unknown';
      }
      function mergeConversationPairIntoCache(pair){
        try{
          if(!pair||!pair.item)return;
          const cached=readConversationPairsCache();
          const key=cleanMsg(pair.item.conversation_id)||cleanMsg(pair.item.other_user_id);
          if(!key)return;
          let found=false;
          const next=cached.map(function(oldPair){
            const oldItem=(oldPair&&oldPair.item)||oldPair||{};
            const oldKey=cleanMsg(oldItem.conversation_id)||cleanMsg(oldItem.other_user_id);
            if(oldKey!==key)return oldPair;
            found=true;
            const oldProfile=(oldPair&&oldPair.profile)||{};
            const newProfile=pair.profile||{};
            const mergedProfile=Object.assign({},oldProfile,newProfile);
            if(isGenericMsgName(mergedProfile.name||mergedProfile.full_name||mergedProfile.display_name) && !isGenericMsgName(oldProfile.name||oldProfile.full_name||oldProfile.display_name)){
              mergedProfile.name=oldProfile.name; mergedProfile.full_name=oldProfile.full_name||oldProfile.name; mergedProfile.display_name=oldProfile.display_name||oldProfile.name;
            }
            return normalizeConversationPairForDisplay({item:Object.assign({},oldItem,pair.item),profile:mergedProfile});
          });
          if(!found)next.unshift(normalizeConversationPairForDisplay(pair));
          writeConversationPairsCache(next);
        }catch(e){}
      }
      function markConversationReadLocal(conversationId){
        try{
          conversationId=cleanMsg(conversationId);
          if(!conversationId)return;
          clearUnreadForConversation(conversationId);
          rememberConversationReadLocal(conversationId);
          const cached=readConversationPairsCache();
          if(cached.length){
            const next=cached.map(function(pair){
              const item=Object.assign({},(pair&&pair.item)||pair||{});
              if(cleanMsg(item.conversation_id)===conversationId)item.unread_count=0;
              return {item:item,profile:(pair&&pair.profile)||{}};
            });
            writeConversationPairsCache(next);
          }
          document.querySelectorAll('#conversationPanel .row').forEach(function(row){
            if(cleanMsg(row.dataset.conversationId)===conversationId){
              row.classList.remove('unread');
              const pill=row.querySelector('.unread-pill'); if(pill)pill.remove();
            }
          });
        }catch(e){}
      }
      function markConversationReadRemote(conversationId, force){
        try{
          conversationId=cleanMsg(conversationId);
          if(!conversationId)return;
          markConversationReadLocal(conversationId);
          const now=Date.now();
          if(!force && happyadMsgLastMarkReadByConversation[conversationId] && now-happyadMsgLastMarkReadByConversation[conversationId] < 30000) return;
          happyadMsgLastMarkReadByConversation[conversationId]=now;
          const c=msgClient();
          if(c&&c.rpc)c.rpc('happyad_msg_mark_read',{p_conversation_id:conversationId}).catch(function(){});
        }catch(e){}
      }
      function rememberLocalTextMessage(conversationId,text,isMine,isOnce,messageType,forcedId){
        try{
          conversationId=cleanMsg(conversationId); if(!conversationId)return null;
          const cached=readMessagesCache(conversationId);
          const msg={
            message_id: forcedId || ('local_'+Date.now()+'_'+Math.random().toString(16).slice(2)),
            conversation_id:conversationId,
            is_mine:isMine!==false,
            message_type: messageType || 'text',
            body:String(text||''),
            view_once:!!isOnce,
            created_at:new Date().toISOString(),
            send_status:'sent',
            other_delivered_at:null,
            other_read_at:null,
            attachments:[]
          };
          writeMessagesCache(conversationId,cached.concat([msg]));
          if(activeOtherUserId){
            const p=getCachedMsgProfile(activeOtherUserId)||{id:activeOtherUserId};
            mergeConversationPairIntoCache({item:{conversation_id:conversationId,other_user_id:activeOtherUserId,unread_count:0,last_message_id:msg.message_id,last_message_at:msg.created_at,last_message_body:text,last_message_is_mine:true,last_message_type:msg.message_type,last_message_view_once:!!isOnce},profile:p});
          }
          return msg;
        }catch(e){return null;}
      }
      function removeMessageFromLocalCache(conversationId,messageId){
        try{
          conversationId=cleanMsg(conversationId||activeConversationId);
          messageId=cleanMsg(messageId);
          if(!conversationId || !messageId)return;
          const next=readMessagesCache(conversationId).filter(function(m){
            return cleanMsg(m.message_id||m.id||m.client_temp_id||m.created_at)!==messageId;
          });
          writeMsgJson(msgMessagesCacheKey(conversationId),{ts:Date.now(),messages:next});
        }catch(e){}
      }
      function hideViewOnceRemote(messageId){
        try{
          messageId=cleanMsg(messageId);
          if(!messageId || messageId.indexOf('local_')===0)return;
          const c=msgClient();
          if(!c || !c.rpc)return;
          c.rpc('happyad_msg_consume_view_once',{p_message_id:messageId}).then(function(){}).catch(function(){});
          c.rpc('happyad_msg_delete_for_me',{p_message_id:messageId}).then(function(){}).catch(function(){});
        }catch(e){}
      }
      function consumeVisibleViewOnceOnChatClose(){
        try{
          chatBody.querySelectorAll('.once-message[data-view-once="1"]').forEach(function(msg){
            const kind=String(msg.dataset.viewOnceKind||msg.dataset.messageType||'').toLowerCase();
            if(kind==='audio' || msg.classList.contains('voice-message'))return;
            if(kind==='text' || kind==='sticker' || kind==='system')consumeViewOnceMessage(msg,'chat_close');
          });
        }catch(e){}
      }

      async function profilesByIds(ids){
        const out={};
        ids=(ids||[]).map(cleanMsg).filter(Boolean);
        if(!ids.length) return out;
        const c=msgClient();
        function addProfile(p, key){
          if(!p)return;
          const id=cleanMsg(key||p.id||p.user_id||p.uid); if(!id)return;
          const old=out[id]||getCachedMsgProfile(id)||{};
          let merged=Object.assign({},old,p,{id:id,user_id:p.user_id||p.id||id});
          const oldName=old.name||old.full_name||old.display_name;
          const newName=merged.name||merged.full_name||merged.display_name||merged.username;
          if(old.__profileExact && !p.__profileExact){
            if(!isGenericMsgName(oldName)){merged.name=oldName;merged.full_name=old.full_name||oldName;merged.display_name=old.display_name||oldName;}
            if(old.avatar||old.avatar_url){merged.avatar=old.avatar||old.avatar_url;merged.avatar_url=old.avatar_url||old.avatar;}
            if(old.badge||old.user_badge){merged.badge=old.badge||old.user_badge;merged.user_badge=old.user_badge||old.badge;}
            merged.__profileExact=true;
          }
          if(isGenericMsgName(newName) && !isGenericMsgName(oldName)){merged.name=oldName;merged.full_name=oldName;merged.display_name=oldName;}
          out[id]=merged;
          cacheMsgProfile(merged,id);
        }
        ids.forEach(function(id){const exact=findProfileIdentityInCaches(id); if(exact)addProfile(exact,id); const p=getCachedMsgProfile(id); if(p)addProfile(p,id);});
        if(!c)return out;
        try{
          const r=await msgTimeout(c.from('profiles').select('*').in('id',ids),2600,[]);
          (r.data||[]).forEach(function(p){addProfile(p,p.id);});
        }catch(e){}
        try{
          const r2=await msgTimeout(c.from('profiles').select('*').in('user_id',ids),2600,[]);
          (r2.data||[]).forEach(function(p){addProfile(p,p.user_id||p.id);});
        }catch(e){}
        try{
          const r3=await msgTimeout(c.from('happyad_profiles').select('*').in('user_id',ids),2200,[]);
          (r3.data||[]).forEach(function(p){addProfile(p,p.user_id||p.id);});
        }catch(e){}
        try{
          const r4=await msgTimeout(c.from('happyad_profiles').select('*').in('id',ids),2200,[]);
          (r4.data||[]).forEach(function(p){addProfile(p,p.user_id||p.id);});
        }catch(e){}
        return out;
      }
      function profileFromUrl(){
        let saved={};
        try{saved=JSON.parse(sessionStorage.getItem('HAPPYAD_MESSAGE_DIRECT_PROFILE')||localStorage.getItem('HAPPYAD_MESSAGE_DIRECT_PROFILE')||'{}')||{};}catch(e){}
        const cached=getCachedMsgProfile(happyadDirectUserId)||{};
        const name=safeParam(happyadMsgParams.get('name')||'')||saved.name||saved.full_name||saved.display_name||cached.name||cached.full_name||cached.display_name||'';
        return {
          id:happyadDirectUserId,
          user_id:happyadDirectUserId,
          full_name:isGenericMsgName(name)?(cached.name||''):name,
          name:isGenericMsgName(name)?(cached.name||''):name,
          username:safeParam(happyadMsgParams.get('username')||happyadMsgParams.get('handle')||'')||saved.username||saved.handle||cached.username||cached.handle||'',
          avatar_url:safeParam(happyadMsgParams.get('avatar')||'')||saved.avatar||saved.avatar_url||cached.avatar||cached.avatar_url||'',
          avatar:safeParam(happyadMsgParams.get('avatar')||'')||saved.avatar||saved.avatar_url||cached.avatar||cached.avatar_url||'',
          badge:safeParam(happyadMsgParams.get('badge')||'')||saved.badge||saved.user_badge||cached.badge||cached.user_badge||''
        };
      }
      function profileInfo(p, fallbackId){
        p=p||{};
        const id=String(p.id||p.user_id||p.uid||fallbackId||'');
        const exact=findProfileIdentityInCaches(id)||{};
        const cached=getCachedMsgProfile(id)||{};
        const source=exact.__profileExact?Object.assign({},p,exact):p;
        let name=userNameFromObject(source)||source.name||source.full_name||source.display_name||source.username||'';
        if(isGenericMsgName(name)) name=cached.name||cached.full_name||cached.display_name||'';
        if(isGenericMsgName(name)) name='Utilisateur HAPPYAD';
        const avatar=userAvatarFromObject(source)||source.avatar||source.avatar_url||cached.avatar||cached.avatar_url||'';
        const badge=userBadgeFromObject(source)||source.badge||source.user_badge||cached.badge||cached.user_badge||'';
        return {id:id,name:name,avatar:avatar,badge:badge,initial:initialsFromName(name)};
      }
      function previewForConversation(item){
        if(!item || !item.last_message_id) return 'Nouvelle conversation';
        if(item.last_message_deleted_for_all) return 'message supprimé';
        if(item.last_message_has_attachments){
          if(item.last_message_type==='audio') return 'Message vocal';
          if(item.last_message_type==='image') return 'Image';
          if(item.last_message_type==='video') return 'Vidéo';
          if(item.last_message_type==='file') return 'Fichier';
          return (item.last_message_attachments_count||1)+' média';
        }
        return item.last_message_body || 'Message';
      }
      function lastUsableMessageFromList(messages){
        const list=Array.isArray(messages)?messages:[];
        for(let i=list.length-1;i>=0;i--){
          const m=list[i]||{};
          if(m.deleted_for_all) continue;
          const att=Array.isArray(m.attachments)?m.attachments:[];
          if(String(m.body||'').trim() || att.length || m.message_type==='audio') return m;
        }
        for(let i=list.length-1;i>=0;i--){if(list[i]) return list[i];}
        return null;
      }
      function applyMessagesPreviewToItem(item, messages){
        item=Object.assign({}, item||{});
        const last=lastUsableMessageFromList(messages);
        if(!last) return item;
        const att=Array.isArray(last.attachments)?last.attachments:[];
        item.last_message_id=last.message_id||item.last_message_id||'';
        item.last_message_at=last.created_at||item.last_message_at||item.conversation_updated_at||'';
        item.last_message_type=last.message_type||item.last_message_type||'text';
        item.last_message_body=last.deleted_for_all?'message supprimé':(last.body||item.last_message_body||'');
        item.last_message_deleted_for_all=!!last.deleted_for_all;
        item.last_message_is_mine=!!last.is_mine;
        item.last_message_has_attachments=att.length>0;
        item.last_message_attachments_count=att.length;
        return item;
      }
      function enhanceConversationItemFromCache(item){
        try{
          item=Object.assign({}, item||{});
          const cid=cleanMsg(item.conversation_id);
          if(!cid) return item;
          const cached=readMessagesCache(cid);
          if(cached.length){ item=applyMessagesPreviewToItem(item,cached); }
          return item;
        }catch(e){return item||{};}
      }
      function conversationHasKnownMessages(conversationId){
        try{
          conversationId=cleanMsg(conversationId);
          if(!conversationId) return false;
          const cached=readMessagesCache(conversationId);
          if(cached.length) return true;
          const pairs=readConversationPairsCache();
          return pairs.some(function(pair){
            const item=(pair&&pair.item)||pair||{};
            return cleanMsg(item.conversation_id)===conversationId && !!item.last_message_id;
          });
        }catch(e){return false;}
      }
      function setChatLoading(text){
        chatBody.innerHTML='<div class="empty" style="display:block;padding-top:28px">'+escMsg(text||'Chargement messages...')+'</div>';
      }
      function timeShort(ts){
        if(!ts) return '';
        try{
          const d=new Date(ts), now=new Date();
          const same=d.toDateString()===now.toDateString();
          if(same) return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
          return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0');
        }catch(e){return '';}
      }
      function makeConversationRow(item, p){
        item=enhanceConversationItemFromCache(item);
        const info=profileInfo(p,item.other_user_id);
        const unread=unreadForConversationItem(item);
        const row=document.createElement('button');
        row.className='row'+(unread>0?' unread':'');
        row.type='button';
        row.dataset.conversationId=item.conversation_id||'';
        row.dataset.otherUserId=item.other_user_id||info.id||'';
        row.dataset.name=info.name;
        row.dataset.initial=info.initial;
        row.dataset.status='Vu récemment';
        row.dataset.preview=previewForConversation(item);
        row.dataset.time=timeShort(item.last_message_at||item.conversation_updated_at);
        row.dataset.badge=info.badge||'';
        row.dataset.photo=info.avatar||'';
        row.dataset.lastMessageId=item.last_message_id||'';
        const initCls=initialsClass(info.initial);
        row.innerHTML='<div class="avatar story-active purple'+initCls+'">'+(info.avatar?'<img src="'+escMsg(info.avatar)+'" alt="">':escMsg(info.initial))+'</div><div class="content"><div class="topline"><div class="name">'+escMsg(info.name)+'</div><div class="time">'+escMsg(row.dataset.time)+'</div>'+(unread>0?'<span class="unread-pill">'+Math.min(99,unread)+'</span>':'')+'</div><div class="previewline">'+(item.last_message_is_mine?'<div class="checks">✓✓</div>':'')+'<div class="preview">'+escMsg(row.dataset.preview)+'</div></div></div>';
        hydrateRowBadge(row);
        row.addEventListener('click',()=>openChat(row));
        setupLongPress(row,()=>showConversationDeleteSheet(row));
        return row;
      }
      function setEmptyConversations(text){
        emptyState.textContent=text||'Aucune conversation.';
        emptyState.style.display='block';
      }
      async function loadConversations(options){
        options=options||{};
        const convSeq = ++happyadMsgConversationLoadSeq;
        const cachedPairs=readConversationPairsCache();
        if(cachedPairs.length && !happyadMsgLoadedOnce){
          renderConversationPairs(cachedPairs,'Aucune conversation.', {silent:!!options.silent});
          happyadMsgLoadedOnce=true;
        } else if(!cachedPairs.length && !happyadMsgLoadedOnce){
          setEmptyConversations('Chargement conversations...');
        }
        const c=msgClient();
        if(!c){
          if(!cachedPairs.length)setEmptyConversations('Connexion messages...');
          setTimeout(loadConversations,1800);
          return;
        }
        const u=await msgUser();
        applyMsgUserToHeader(u);
        const sessionForList=await ensureMsgSession().catch(function(){return {ready:false,id:''};});
        const fallbackUidForList=cleanMsg((sessionForList&&sessionForList.id)||stableAuthUidFromAnySource());
        if((!sessionForList || !sessionForList.ready) && !fallbackUidForList){
          if(!cachedPairs.length)setEmptyConversations('Connexion messages...');
          else renderConversationPairs(cachedPairs,'Connexion messages...', {silent:!!options.silent});
          setTimeout(function(){ensureMsgSession({force:true}).then(function(){loadConversations({silent:true});});},2500);
          return;
        }
        try{
          let r=await happyadMsgRpc('happyad_msg_get_my_conversations',{},8200,[]);
          if(!r || r.error || r.__timeout){
            r=await msgTimeout(c.from('happyad_msg_my_conversations').select('*').order('last_message_at',{ascending:false,nullsFirst:false}),7500,null);
          }
          if(r && r.__timeout){
            const again=readConversationPairsCache();
            if(again.length)renderConversationPairs(again,'Aucune conversation.', {silent:true});
            else setEmptyConversations('Chargement conversations...');
            setTimeout(loadConversations,1800);
            return;
          }
          if(r && r.error) throw r.error;
          if(convSeq !== happyadMsgConversationLoadSeq) return;
          const list=(r&&r.data)||[];
          const ids=list.map(x=>x.other_user_id).filter(Boolean);
          const profiles=await profilesByIds(ids);
          const backupBefore=readConversationPairsCache();
          let serverPairs=conversationPairsFromServer(list,profiles).map(function(pair){try{if(activeConversationId && cleanMsg((pair.item||{}).conversation_id)===cleanMsg(activeConversationId)){pair.item=Object.assign({},pair.item,{unread_count:0});}}catch(e){} return pair;});
          let pairs=mergeConversationPairsForStableList(backupBefore, serverPairs);
          if(!serverPairs.length && !pairs.length){
            const hard=await happyadMsgHardInboxSync({force:true,fast:false,showEmptyWhenDone:false});
            const backup=readConversationPairsCache();
            if(backup.length){
              renderConversationPairs(backup,'Chargement conversations...', {silent:true});
              happyadMsgLoadedOnce=true;
            } else if(hard){
              happyadMsgLoadedOnce=true;
            } else {
              const realSessionId=await happyadMsgAuthSessionId();
              const fallbackSessionId=realSessionId||stableAuthUidFromAnySource();
              if(!fallbackSessionId){
                setEmptyConversations('Session message non connectée. Reconnecte-toi puis rouvre Messages.');
              }else{
                setEmptyConversations('Chargement conversations...');
                setTimeout(function(){happyadMsgHardInboxSync({force:true,showEmptyWhenDone:true});},650);
              }
            }
            return;
          }
          pairs.forEach(pair=>{try{cacheMsgProfile(pair.profile,(pair.item||{}).other_user_id);}catch(e){}});
          writeConversationPairsCache(pairs);
          renderConversationPairs(pairs,'Aucune conversation.', {silent:!!options.silent});
          happyadMsgLoadedOnce=true;
        }catch(e){
          console.warn('HAPPYAD MSG load conversations',e);
          const backup=readConversationPairsCache();
          if(backup.length){renderConversationPairs(backup,'Aucune conversation.', {silent:true});happyadMsgLoadedOnce=true;}
          else {setEmptyConversations('Chargement conversations...');}
          setTimeout(loadConversations,3500);
        }
      }
      async function signedUrlForAttachment(a){
        if(!a) return '';
        if(a.public_url) return a.public_url;
        const c=msgClient();
        try{
          const r=await c.storage.from(a.bucket_id||'happyad-msg-media').createSignedUrl(a.storage_path,3600);
          return r&&r.data&&r.data.signedUrl||'';
        }catch(e){return '';}
      }
      async function makeServerMediaTile(a, sourceMsg){
        const type=a.attachment_type||'file';
        const url=await signedUrlForAttachment(a);
        if(type==='image'||type==='video'){
          const tile=document.createElement('button');tile.className='media-tile';tile.type='button';
          if(type==='image'){
            const img=document.createElement('img');img.src=url;img.alt=a.file_name||'Image';tile.appendChild(img);
            tile.addEventListener('click',()=>openViewer('image',url,a.file_name||'Image',sourceMsg));
          }else{
            const video=document.createElement('video');video.src=url;video.muted=true;video.playsInline=true;video.preload='metadata';tile.appendChild(video);
            const badge=document.createElement('span');badge.className='play-badge';badge.innerHTML='<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M8 5v14l11-7L8 5Z" fill="currentColor"/></svg>';tile.appendChild(badge);
            tile.addEventListener('click',()=>openViewer('video',url,a.file_name||'Vidéo',sourceMsg));
          }
          return tile;
        }
        const fake={name:a.file_name||'Fichier',size:a.file_size||0,type:a.mime_type||''};
        const card=createFileCard(fake);
        if(sourceMsg && sourceMsg.dataset && sourceMsg.dataset.viewOnce==='1'){
          card.addEventListener('click', function(){ consumeViewOnceMessage(sourceMsg,'file_open'); });
        }
        return card;
      }
      async function renderServerMessage(m){
        const msg=document.createElement('div');
        msg.className='msg '+(m.is_mine?'me':'them')+(m.view_once?' once-message':'')+(m.message_type==='audio'?' voice-message':'');
        msg.dataset.messageId=m.message_id||'';
        msg.dataset.conversationId=m.conversation_id||'';
        msg.dataset.messageType=m.message_type||'';
        if(m.view_once){msg.dataset.viewOnce='1';}
        if(m.deleted_for_all){msg.classList.add('deleted');}
        const attachments=Array.isArray(m.attachments)?m.attachments:[];
        if(m.view_once){
          const firstType=(attachments[0]&&attachments[0].attachment_type)||'';
          msg.dataset.viewOnceKind = attachments.length ? ((m.message_type==='audio'||firstType==='audio')?'audio':'media') : (m.message_type==='sticker'?'sticker':'text');
        }
        const bubble=document.createElement('div');
        bubble.className='bubble'+(attachments.length?' media-bubble':'');
        if(m.deleted_for_all){
          const content=document.createElement('span');content.className='message-text';content.textContent='message supprimé';bubble.appendChild(content);
        }else if(attachments.length){
          if((m.message_type==='audio' || attachments[0].attachment_type==='audio') && attachments[0]){
            const a=attachments[0];
            const audioUrl=await signedUrlForAttachment(a);
            msg.dataset.audioUrl=audioUrl;
            msg.dataset.voiceDuration=String(Math.max(1, Math.round(Number(a.duration_seconds||0) || 1)));
            const wave=document.createElement('span');
            wave.className='voice-wave';
            wave.innerHTML='<span class="voice-play" aria-hidden="true"><svg class="voice-play-icon" viewBox="0 0 24 24" fill="none"><path d="M8 5v14l11-7L8 5Z" fill="currentColor"/></svg></span><span class="voice-bars" aria-hidden="true"></span><span class="voice-progress"><span></span></span><span class="voice-duration">'+msg.dataset.voiceDuration+'s</span>';
            bubble.className='bubble';
            bubble.appendChild(wave);
            msg._serverWaveform = Array.isArray(a.waveform)?a.waveform:defaultVoicePeaks(24);
          } else {
          const visual=attachments.filter(a=>['image','video'].includes(a.attachment_type));
          const others=attachments.filter(a=>!['image','video'].includes(a.attachment_type));
          if(visual.length){
            const grid=document.createElement('div');grid.className='media-grid '+(visual.length===1?'one':visual.length===2?'two':'many');
            for(const a of visual){grid.appendChild(await makeServerMediaTile(a,msg));}
            bubble.appendChild(grid);
          }
          for(const a of others){bubble.appendChild(await makeServerMediaTile(a,msg));}
          if(m.body){fillTextBubble(bubble,m.body,false);}
          }
        }else{
          fillTextBubble(bubble,m.body||'',m.message_type==='sticker');
        }
        const meta=document.createElement('span');meta.className='meta';
        meta.textContent=timeShort(m.created_at)+(m.is_mine?(m.other_read_at?' ✓✓ lu':m.other_delivered_at?' ✓✓':' ✓'):'');
        bubble.appendChild(meta);msg.appendChild(bubble);if(msg.classList.contains('voice-message')) renderVoiceBars(msg, msg._serverWaveform||defaultVoicePeaks(24));chatBody.appendChild(msg);bindMessageLongPress(msg);
      }
      async function loadMessages(conversationId, options){
        options=options||{};
        conversationId=cleanMsg(conversationId);if(!conversationId)return;
        const now=Date.now();
        if(options.silent && now-happyadMsgLastLoadMessagesAt<450) return;
        happyadMsgLastLoadMessagesAt=now;
        const loadSeq = ++happyadMsgMessageLoadSeq;
        activeConversationId=conversationId;
        const cached=readMessagesCache(conversationId);
        const hasDomMessages=chatHasMessagesDom();
        if(cached.length && !hasDomMessages){await renderMessagesArray(cached,'Chargement messages...', {silent:false});}
        else if(cached.length && options.forceCacheRender){await renderMessagesArray(cached,'Chargement messages...', {silent:true});}
        else if(!cached.length && !hasDomMessages && conversationHasKnownMessages(conversationId)){setChatLoading('Chargement messages...');}
        const c=msgClient();
        if(!c){if(!cached.length&&!hasDomMessages)setChatLoading('Connexion messages indisponible.');return;}
        try{
          let r=await happyadMsgRpc('happyad_msg_get_my_messages',{p_conversation_id:conversationId},8200,null);
          if(!r || r.error || r.__timeout){
            r=await msgTimeout(c.from('happyad_msg_my_messages').select('*').eq('conversation_id',conversationId).order('created_at',{ascending:true}),5200,null);
          }
          if(loadSeq !== happyadMsgMessageLoadSeq || activeConversationId !== conversationId) return;
          if(!r) throw new Error('messages_timeout');
          if(r.error) throw r.error;
          const serverMessages=filterConsumedViewOnceMessages(conversationId,(r.data||[]));
          if(serverMessages.length){
            const merged=mergeMessagesForDisplay(conversationId,cached,serverMessages);
            writeMessagesCache(conversationId,merged);
            await renderMessagesArray(merged,'Aucun message. Écris le premier message.', {silent:!!(options.silent||hasDomMessages)});
            mergeConversationPairIntoCache({item:applyMessagesPreviewToItem({conversation_id:conversationId,other_user_id:activeOtherUserId,unread_count:0},merged),profile:getCachedMsgProfile(activeOtherUserId)||{id:activeOtherUserId}});
          }else if(cached.length){
            writeMessagesCache(conversationId,cached);
            if(!hasDomMessages) await renderMessagesArray(cached,'Chargement messages...', {silent:false});
          }else{
            if(conversationHasKnownMessages(conversationId)){
              if(!hasDomMessages)setChatLoading('Synchronisation messages...');
              setTimeout(function(){ if(activeConversationId===conversationId) loadMessages(conversationId,{silent:true}); },1800);
            }else{
              await renderMessagesArray([],'Aucun message. Écris le premier message.', {silent:!!hasDomMessages});
            }
          }
          markConversationReadRemote(conversationId, !!options.forceMarkRead);
          setTimeout(function(){loadConversations({silent:true});},180);
        }catch(e){
          console.warn('HAPPYAD MSG load messages',e);
          markConversationReadLocal(conversationId);
          if(!cached.length&&!hasDomMessages){
            setChatLoading(conversationHasKnownMessages(conversationId)?'Synchronisation messages...':'Chargement messages...');
            setTimeout(function(){ if(activeConversationId===conversationId) loadMessages(conversationId,{silent:true}); },2200);
          }
        }
      }
      function happyadMsgIsUuid(v){return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cleanMsg(v));}
      function happyadMsgDirectCandidateList(raw,p){
        p=p||{};
        let saved={};
        try{saved=JSON.parse(sessionStorage.getItem('HAPPYAD_MESSAGE_DIRECT_PROFILE')||localStorage.getItem('HAPPYAD_MESSAGE_DIRECT_PROFILE')||'{}')||{};}catch(e){}
        const q=happyadMsgParams;
        return [
          saved.auth_uid,saved.auth_id,saved.user_id,saved.uid,saved.uuid,saved.id,
          p.auth_uid,p.auth_id,p.user_id,p.uid,p.uuid,p.owner_id,p.creator_id,p.id,
          q.get('auth_uid'),q.get('auth_id'),q.get('user_id'),q.get('uid'),q.get('to'),raw
        ].map(cleanMsg).filter(Boolean);
      }
      async function happyadMsgResolveDirectTargetId(raw,p){
        raw=cleanMsg(raw); p=p||{};
        const c=msgClient();
        let meId=cleanMsg((happyadMsgCurrentUser&&happyadMsgCurrentUser.id)||stableAuthUidFromAnySource());
        try{const u=await msgUser();meId=cleanMsg(u&&u.id)||meId;}catch(_e){}
        function good(v){v=cleanMsg(v);return happyadMsgIsUuid(v)&&(!meId||v!==meId)?v:'';}
        async function queryProfileByUuid(id){
          id=good(id); if(!id||!c)return '';
          const tables=['profiles','happyad_profiles'];
          for(const t of tables){
            try{
              let r=await msgTimeout(c.from(t).select('*').eq('id',id).maybeSingle(),2400,null);
              if(r&&!r.error&&r.data){
                const row=r.data||{};
                const resolved=good(row.auth_uid)||good(row.auth_id)||good(row.user_id)||good(row.uid)||good(row.uuid)||good(row.id);
                if(resolved){cacheMsgProfile(messageProfileIdentityFromObject(row,resolved),resolved);return resolved;}
              }
            }catch(_e){}
            try{
              let r2=await msgTimeout(c.from(t).select('*').eq('user_id',id).maybeSingle(),2200,null);
              if(r2&&!r2.error&&r2.data){
                const row2=r2.data||{};
                const resolved2=good(row2.auth_uid)||good(row2.auth_id)||good(row2.user_id)||good(row2.uid)||good(row2.uuid)||good(row2.id);
                if(resolved2){cacheMsgProfile(messageProfileIdentityFromObject(row2,resolved2),resolved2);return resolved2;}
              }
            }catch(_e){}
          }
          return '';
        }
        const candidates=happyadMsgDirectCandidateList(raw,p);
        for(const x of candidates){
          const q=await queryProfileByUuid(x);
          if(q)return q;
        }
        for(const x of candidates){
          const g=good(x);
          if(g)return g;
        }
        return '';
      }
      async function openDirectConversation(){
        if(!happyadDirectUserId) return;
        const p0=profileFromUrl();
        const visualId=cleanMsg(p0.user_id||p0.id||happyadDirectUserId);
        cacheMsgProfile(p0,visualId);
        const localRow=makeConversationRow({conversation_id:'',other_user_id:visualId,unread_count:0,last_message_at:null},p0);
        localRow.dataset.status='Connexion...';
        openChat(localRow);
        const directInfo=profileInfo(p0,visualId);
        chatName.textContent=directInfo.name;
        setBadge(chatBadge,directInfo.badge||'');
        if(directInfo.avatar){chatAvatar.innerHTML='<img src="'+escMsg(directInfo.avatar)+'" alt="">';}else{chatAvatar.textContent=directInfo.initial;}
        chatStatus.textContent='Vu récemment';
        setChatLoading('Ouverture conversation...');
        const c=msgClient();
        if(!c){chatBody.innerHTML='<div class="empty" style="display:block;padding-top:28px">Supabase non chargé.</div>';return;}
        try{
          const u=await msgUser();applyMsgUserToHeader(u);
          const targetId=await happyadMsgResolveDirectTargetId(happyadDirectUserId,p0);
          if(!targetId){
            chatStatus.textContent='Profil message invalide';
            chatBody.innerHTML='<div class="empty" style="display:block;padding-top:28px">Ce profil n’a pas encore un identifiant message valide. Corrige son compte puis réessaie.</div>';
            return;
          }
          if(cleanMsg(u&&u.id)===targetId){
            chatStatus.textContent='Profil connecté';
            chatBody.innerHTML='<div class="empty" style="display:block;padding-top:28px">Impossible d’ouvrir un message avec ton propre profil.</div>';
            return;
          }
          const res=await msgTimeout(c.rpc('happyad_msg_get_or_create_conversation',{p_other_user_id:targetId}),6500,null);
          if(!res) throw new Error('conversation_timeout');
          if(res.error) throw res.error;
          if(!res.data) throw new Error('conversation_absente');
          const convId=res.data;
          localRow.dataset.conversationId=convId;
          localRow.dataset.otherUserId=targetId;
          mergeConversationPairIntoCache({item:enhanceConversationItemFromCache({conversation_id:convId,other_user_id:targetId,unread_count:0,last_message_at:null,last_message_body:'Nouvelle conversation',last_message_is_mine:false,last_message_type:'text'}),profile:p0});
          activeConversationId=convId;
          activeOtherUserId=targetId;
          let profiles=await profilesByIds([targetId]);
          const p=profiles[targetId]||getCachedMsgProfile(targetId)||Object.assign({},p0,{id:targetId,user_id:targetId});
          cacheMsgProfile(p,targetId);
          const info=profileInfo(p,targetId);
          localRow.dataset.name=info.name;
          localRow.dataset.initial=info.initial;
          localRow.dataset.badge=info.badge||'';
          localRow.dataset.photo=info.avatar||'';
          chatName.textContent=info.name;
          setBadge(chatBadge,info.badge||'');
          chatStatus.textContent='Vu récemment';
          if(info.avatar){chatAvatar.innerHTML='<img src="'+escMsg(info.avatar)+'" alt="">';}else{chatAvatar.textContent=info.initial;}
          await loadMessages(convId);
        }catch(e){
          console.warn('HAPPYAD MSG direct open',e);
          chatStatus.textContent='Hors ligne';
          chatBody.innerHTML='<div class="empty" style="display:block;padding-top:28px">Conversation non ouverte. Vérifie que ce compte possède un vrai user_id/auth_id Supabase.</div>';
        }
      }
      function parentBackOrClose(){
        try{if(window.parent&&window.parent!==window&&window.parent.HappyNavigation&&typeof window.parent.HappyNavigation.back==='function'){window.parent.HappyNavigation.back();return true;}}catch(e){}
        try{if(window.parent&&window.parent!==window){window.parent.history.back();return true;}}catch(e){}
        try{if(window.happyadCloseAppPage){window.happyadCloseAppPage();return true;}}catch(e){}
        try{history.back();return true;}catch(e){}
        return false;
      }
      function closeMessageCenter(){
        if(!chatView.classList.contains('hidden')){closeChat();return true;}
        return parentBackOrClose();
      }
      async function sendTextMessage(text,isSticker,isOnce){
        const messageType=isSticker?'sticker':'text';
        const local=appendTextMessage(text,isSticker,isOnce);
        const localCache=rememberLocalTextMessage(activeConversationId,text,true,!!isOnce,messageType);
        if(local){
          local.dataset.messageType=messageType;
          local.dataset.viewOnceKind=messageType;
          if(localCache&&localCache.message_id)local.dataset.messageId=localCache.message_id;
          if(activeConversationId)local.dataset.conversationId=activeConversationId;
          if(localCache){local.dataset.visualKey=messageVisualKey(localCache); happyadMsgDisplayedMessages=mergeMessagesForDisplay(activeConversationId,happyadMsgDisplayedMessages,[localCache]);}
        }
        markConversationReadLocal(activeConversationId);
        const c=msgClient();
        if(activeConversationId&&c){
          try{
            const r=await c.rpc('happyad_msg_send_message',{p_conversation_id:activeConversationId,p_body:text,p_message_type:messageType,p_client_temp_id:'web_'+Date.now()+'_'+Math.random().toString(16).slice(2),p_view_once:!!isOnce,p_reply_to_message_id:null});
            if(r.error) throw r.error;
            if(local) {
              const oldId=local.dataset.messageId||'';
              local.dataset.messageId=r.data||oldId;
              if(oldId && r.data && oldId!==r.data) removeMessageFromLocalCache(activeConversationId, oldId);
              rememberLocalTextMessage(activeConversationId,text,true,!!isOnce,messageType,r.data||oldId);
              if(local.dataset.consumed==='1') { markViewOnceConsumedLocal(activeConversationId,r.data||oldId); removeMessageFromLocalCache(activeConversationId,r.data||oldId); hideViewOnceRemote(r.data||oldId); }
            }
            setTimeout(()=>{ if(activeConversationId) loadMessages(activeConversationId,{silent:true}); },900);
          }catch(e){console.warn('HAPPYAD MSG send text',e);appendSystemMessage('Message non envoyé : '+((e&&e.message)||e));}
        }
        return local;
      }
      function kindFromFile(file){
        const t=String(file&&file.type||'');
        if(t.indexOf('image/')===0)return 'image';
        if(t.indexOf('video/')===0)return 'video';
        if(t.indexOf('audio/')===0)return 'audio';
        return 'file';
      }
      async function uploadOneFile(file,conversationId,index){
        const c=msgClient();
        const u=await msgUser();
        const ext=(file.name&&file.name.indexOf('.')>-1?file.name.split('.').pop():'bin').replace(/[^a-z0-9]/ig,'').slice(0,8)||'bin';
        const path=[u.id,conversationId,'pending_'+Date.now()+'_'+index+'_'+Math.random().toString(16).slice(2)+'.'+ext].join('/');
        const up=await c.storage.from('happyad-msg-media').upload(path,file,{upsert:false,contentType:file.type||'application/octet-stream'});
        if(up.error) throw up.error;
        return {attachment_type:kindFromFile(file),bucket_id:'happyad-msg-media',storage_path:path,file_name:file.name||('fichier_'+index),mime_type:file.type||'application/octet-stream',file_size:file.size||0,position:index};
      }
      async function sendMediaMessage(files,isOnce,caption,localMsg){
        files=Array.from(files||[]);if(!files.length)return;
        if(!localMsg)localMsg=appendFileMessage(files,isOnce);
        const localMediaId='local_media_'+Date.now()+'_'+Math.random().toString(16).slice(2);
        if(localMsg){
          localMsg.dataset.messageId=localMsg.dataset.messageId||localMediaId;
          localMsg.dataset.conversationId=activeConversationId||'';
          localMsg.dataset.messageType='media';
          localMsg.dataset.viewOnceKind=files.some(function(f){return kindFromFile(f)==='audio';})?'audio':'media';
        }
        const localMediaRecord={message_id:localMediaId,conversation_id:activeConversationId||'',is_mine:true,message_type:(files.length===1?kindFromFile(files[0]):'media'),body:caption||'',view_once:!!isOnce,deleted_for_all:false,created_at:new Date().toISOString(),attachments:files.map(function(file,index){return {attachment_type:kindFromFile(file),file_name:file.name||('fichier_'+index),file_size:file.size||0,mime_type:file.type||'',duration_seconds:(kindFromFile(file)==='audio'?Number(localMsg&&localMsg.dataset&&localMsg.dataset.voiceDuration||1):'')};})};
        if(localMsg){localMsg.dataset.visualKey=messageVisualKey(localMediaRecord); happyadMsgDisplayedMessages=mergeMessagesForDisplay(activeConversationId,happyadMsgDisplayedMessages,[localMediaRecord]);}
        try{if(activeConversationId&&activeOtherUserId){const p=getCachedMsgProfile(activeOtherUserId)||{id:activeOtherUserId};mergeConversationPairIntoCache({item:{conversation_id:activeConversationId,other_user_id:activeOtherUserId,unread_count:0,last_message_id:localMediaId,last_message_at:new Date().toISOString(),last_message_body:'Média',last_message_is_mine:true,last_message_type:'media',last_message_view_once:!!isOnce,last_message_has_attachments:true,last_message_attachments_count:files.length},profile:p});}}catch(_e){}
        if(!activeConversationId)return localMsg;
        const c=msgClient();
        try{
          const attachments=[];
          for(let i=0;i<files.length;i++){attachments.push(await uploadOneFile(files[i],activeConversationId,i));}
          const msgType=attachments.length===1?attachments[0].attachment_type:'media';
          const r=await c.rpc('happyad_msg_send_media_message',{p_conversation_id:activeConversationId,p_attachments:attachments,p_body:caption||null,p_message_type:msgType,p_client_temp_id:'web_'+Date.now()+'_'+Math.random().toString(16).slice(2),p_view_once:!!isOnce,p_reply_to_message_id:null});
          if(r.error) throw r.error;
          if(localMsg){
            const oldId=localMsg.dataset.messageId||'';
            localMsg.dataset.messageId=r.data||oldId;
            if(localMsg.dataset.consumed==='1') { markViewOnceConsumedLocal(activeConversationId,r.data||oldId); removeMessageFromLocalCache(activeConversationId,r.data||oldId); hideViewOnceRemote(r.data||oldId); }
          }
          setTimeout(()=>{ if(activeConversationId) loadMessages(activeConversationId,{silent:true}); },1000);
        }catch(e){console.warn('HAPPYAD MSG send media',e);appendSystemMessage('Média non envoyé : '+((e&&e.message)||e));}
        return localMsg;
      }
      async function sendVoiceBlob(audioBlob,duration,isOnce,localMsg){
        try{
          if(!audioBlob||!activeConversationId)return localMsg;
          const file=new File([audioBlob],'audio_'+Date.now()+'.webm',{type:audioBlob.type||'audio/webm'});
          return await sendMediaMessage([file],isOnce,null,localMsg);
        }catch(e){console.warn('HAPPYAD MSG voice send',e);return localMsg;}
      }
      function upsertConversationPairDom(pair){
        try{
          const panel=document.getElementById('conversationPanel');
          if(!panel)return false;
          pair=normalizeConversationPairForDisplay(pair||{});
          const item=(pair&&pair.item)||{};
          const profile=(pair&&pair.profile)||{};
          const cid=cleanMsg(item.conversation_id);
          if(!cid)return false;
          emptyState.style.display='none';
          const nextRow=makeConversationRow(item, profile);
          let oldRow=null;
          Array.from(panel.querySelectorAll('.row')).some(function(r){
            if(cleanMsg(r.dataset.conversationId)===cid){oldRow=r;return true;}
            return false;
          });
          if(oldRow){
            oldRow.replaceWith(nextRow);
          }else{
            panel.insertBefore(nextRow, emptyState);
          }
          const first=panel.querySelector('.row');
          if(first && first!==nextRow) panel.insertBefore(nextRow, first);
          rows=Array.from(panel.querySelectorAll('.row'));
          happyadMsgLastConversationSignature=conversationDisplaySignature(readConversationPairsCache());
          return true;
        }catch(e){return false;}
      }
      function renderCachedConversationListSilently(){
        try{
          const cached=readConversationPairsCache();
          if(cached.length)renderConversationPairs(cached,'Aucune conversation.', {silent:true});
          return cached.length;
        }catch(e){return 0;}
      }
      function previewFromRealtimeMessage(m){
        try{
          if(!m)return 'Message';
          if(m.deleted_for_all)return 'message supprimé';
          const body=cleanMsg(m.body);
          if(body)return body;
          const t=cleanMsg(m.message_type||'text').toLowerCase();
          if(t==='audio')return 'Message vocal';
          if(t==='image')return 'Photo';
          if(t==='video')return 'Vidéo';
          if(t==='file')return 'Fichier';
          if(t==='media')return 'Média';
          if(t==='sticker')return 'Sticker';
          return 'Message';
        }catch(e){return 'Message';}
      }
      function normalizeRealtimeMessageRecord(rec){
        rec=rec||{};
        const forcedMe=cleanMsg(rec.__me_id||rec.__uid||'');
        const me=forcedMe||cleanMsg((happyadMsgCurrentUser&&happyadMsgCurrentUser.id)||stableAuthUidFromAnySource()||msgCurrentUserCacheId());
        const sender=cleanMsg(rec.sender_id);
        const receiver=cleanMsg(rec.receiver_id);
        const isMine=(rec.is_mine===true)|| (!!me && sender===me);
        const other=isMine?receiver:sender;
        return Object.assign({},rec,{message_id:cleanMsg(rec.message_id||rec.id),conversation_id:cleanMsg(rec.conversation_id),sender_id:sender,receiver_id:receiver,is_mine:isMine,other_user_id:other,body:rec.body||'',message_type:rec.message_type||'text',created_at:rec.created_at||new Date().toISOString()});
      }
      function normalizeRealtimeMessageRecordForUid(rec, uid){
        const x=Object.assign({},rec||{},{__me_id:cleanMsg(uid)});
        return normalizeRealtimeMessageRecord(x);
      }
      function applyRealtimeMessageToList(raw, options){
        try{
          options=options||{};
          const m=normalizeRealtimeMessageRecord(Object.assign({},raw||{},{__me_id:cleanMsg(options.uid||'')})); if(!m.conversation_id||!m.other_user_id)return;
          const mid=messageStableId(m);
          let unread=0;
          if(typeof m.__receipt_unread_count === 'number'){
            unread=Math.max(0,Math.min(99,Number(m.__receipt_unread_count)||0));
          }else if(shouldCountIncomingMessageForList(m)) unread=rememberUnreadMessageForList(m);
          else { if(mid && cleanMsg(m.my_read_at)) removeUnreadForMessage(m.conversation_id,mid); unread=unreadCountForConversation(m.conversation_id); }
          if(isConversationActuallyOpen(m.conversation_id)) unread=0;
          const profile=getCachedMsgProfile(m.other_user_id)||findProfileIdentityInCaches(m.other_user_id)||{id:m.other_user_id,user_id:m.other_user_id};
          if(profile&&profile.id)cacheMsgProfile(profile,m.other_user_id);
          const item={
            conversation_id:m.conversation_id,
            other_user_id:m.other_user_id,
            unread_count:unread,
            __unread_confirmed:true,
            __server_unread_confirmed:true,
            last_message_id:mid,
            last_message_at:m.created_at,
            conversation_updated_at:m.updated_at||m.created_at,
            last_message_body:previewFromRealtimeMessage(m),
            last_message_type:m.message_type||'text',
            last_message_is_mine:!!m.is_mine,
            last_message_deleted_for_all:!!m.deleted_for_all,
            last_message_view_once:!!m.view_once,
            last_message_has_attachments:Array.isArray(m.attachments)&&m.attachments.length>0,
            last_message_attachments_count:Array.isArray(m.attachments)?m.attachments.length:0
          };
          const realtimePair={item:item,profile:profile};
          mergeConversationPairIntoCache(realtimePair);
          upsertConversationPairDom(realtimePair);
          renderCachedConversationListSilently();
          if(isConversationActuallyOpen(m.conversation_id)){
            setTimeout(function(){loadMessages(m.conversation_id,{silent:true});},80);
          }
        }catch(e){console.warn('HAPPYAD MSG realtime list apply',e);}
      }
      function handleRealtimeMessageEvent(payload){
        try{
          const rec=(payload&&payload.new)||null;
          if(rec && cleanMsg(rec.conversation_id)) applyRealtimeMessageToList(rec,{source:'realtime'});
          if(payload && payload.eventType && payload.eventType!=='INSERT') refreshSoon();
        }catch(e){refreshSoon();}
      }
      async function invisibleListRefresh(options){
        options=options||{};
        const now=Date.now();
        if(happyadMsgInvisibleListRunning)return;
        if(!options.force && now-happyadMsgLastInvisibleListAt<650)return;
        happyadMsgLastInvisibleListAt=now;
        happyadMsgInvisibleListRunning=true;
        try{
          const c=msgClient(); if(!c)return;
          const session=await ensureMsgSession({force:!!options.force}).catch(function(){return {ready:false,id:''};});
          const uid=cleanMsg(session&&session.ready&&session.id); if(!uid)return;
          const r=await msgTimeout(
            c.from('happyad_msg_my_messages')
              .select('*')
              .order('created_at',{ascending:false})
              .limit(18),
            1700,[]
          );
          if(!r||r.__timeout||r.error)return;
          const list=Array.isArray(r.data)?r.data:[];
          const latestByConv={};
          list.slice().reverse().forEach(function(m){
            const n=normalizeRealtimeMessageRecordForUid(m,uid); if(!n.conversation_id)return;
            latestByConv[n.conversation_id]=n;
            if(shouldCountIncomingMessageForList(n)) rememberUnreadMessageForList(n);
            else if(n.my_read_at) removeUnreadForMessage(n.conversation_id,messageStableId(n));
          });
          Object.keys(latestByConv).forEach(function(cid){
            applyRealtimeMessageToList(latestByConv[cid],{source:'invisible-list-refresh',uid:uid});
          });
        }catch(e){
          // silence: l'actualisation invisible ne doit jamais casser l'interface.
        }finally{
          happyadMsgInvisibleListRunning=false;
        }
      }
      async function syncRecentRawMessagesForList(options){
        options=options||{};
        const now=Date.now();
        if(happyadMsgListRawSyncRunning)return;
        if(!options.force && now-happyadMsgListRawSyncAt<1100)return;
        happyadMsgListRawSyncAt=now;
        happyadMsgListRawSyncRunning=true;
        try{
          const c=msgClient(); if(!c)return;
          const session=await ensureMsgSession({force:!!options.force}).catch(function(){return {ready:false,id:''};});
          const uid=cleanMsg(session&&session.ready&&session.id); if(!uid)return;
          const q='sender_id.eq.'+uid+',receiver_id.eq.'+uid;
          const r=await msgTimeout(
            c.from('happyad_msg_messages')
              .select('id,conversation_id,sender_id,receiver_id,message_type,body,client_temp_id,view_once,deleted_for_all,created_at,updated_at,send_status')
              .or(q)
              .order('created_at',{ascending:false})
              .limit(40),
            2200,[]
          );
          if(!r||r.__timeout||r.error)return;
          const rows=Array.isArray(r.data)?r.data:[];
          const latestByConv={};
          rows.slice().reverse().forEach(function(m){
            const n=normalizeRealtimeMessageRecordForUid(m,uid); if(!n.conversation_id)return;
            latestByConv[n.conversation_id]=n;
            if(shouldCountIncomingMessageForList(n)) rememberUnreadMessageForList(n);
          });
          Object.keys(latestByConv).forEach(function(cid){applyRealtimeMessageToList(latestByConv[cid],{source:'raw-list-sync',uid:uid});});
        }catch(e){console.warn('HAPPYAD MSG raw list sync',e);}finally{happyadMsgListRawSyncRunning=false;}
      }
      async function syncRecentMessagesForList(options){
        options=options||{};
        if(options.raw !== false) syncRecentRawMessagesForList({force:!!options.force});
        const now=Date.now();
        if(happyadMsgRecentListSyncRunning)return;
        if(!options.force && now-happyadMsgRecentListSyncAt<2200)return;
        happyadMsgRecentListSyncAt=now;
        happyadMsgRecentListSyncRunning=true;
        try{
          const c=msgClient(); if(!c)return;
          const u=await msgUser().catch(function(){return null;}); if(!u||!u.id)return;
          const uid=cleanMsg(u&&u.id);
          const r=await msgTimeout(c.from('happyad_msg_my_messages').select('*').order('created_at',{ascending:false}).limit(35),4200,[]);
          if(!r||r.__timeout||r.error)return;
          const rows=Array.isArray(r.data)?r.data:[];
          const latestByConv={};
          rows.slice().reverse().forEach(function(m){
            const n=normalizeRealtimeMessageRecordForUid(m,uid); if(!n.conversation_id)return;
            latestByConv[n.conversation_id]=n;
            if(shouldCountIncomingMessageForList(n)) rememberUnreadMessageForList(n);
            else if(n.my_read_at) removeUnreadForMessage(n.conversation_id,messageStableId(n));
          });
          Object.keys(latestByConv).forEach(function(cid){applyRealtimeMessageToList(latestByConv[cid],{source:'recent-sync',uid:uid});});
          if(!Object.keys(latestByConv).length && !readConversationPairsCache().length && !happyadMsgLoadedOnce){setEmptyConversations('Aucune conversation.');}
        }catch(e){console.warn('HAPPYAD MSG recent list sync',e);}finally{happyadMsgRecentListSyncRunning=false;}
      }


      async function happyadMsgRpc(name, args, ms, fallback){
        try{
          const c=msgClient();
          if(!c || !c.rpc) return {data:fallback||null,error:{message:'rpc_unavailable'}};
          /* V636: ne pas couper la messagerie uniquement parce que le pont session a répondu lentement.
             On tente d'abord le RPC; si Supabase refuse le JWT, on force la session puis on réessaie. */
          await ensureMsgSession({force:false}).catch(function(){return {ready:false,id:''};});
          let r=await msgTimeout(c.rpc(name,args||{}), ms||5200, fallback||null);
          const msg=String((r&&r.error&&r.error.message)||r&&r.error||'');
          if((!r || r.error || r.__timeout) && /JWT|session|auth|PGRST301|401|403|not authenticated|Auth session missing/i.test(msg)){
            await ensureMsgSession({force:true}).catch(function(){});
            r=await msgTimeout(c.rpc(name,args||{}), ms||5200, fallback||null);
          }
          return r||{data:fallback||null,error:{message:'rpc_empty_response'}};
        }catch(e){return {data:fallback||null,error:e};}
      }
      async function happyadMsgAuthSessionId(){
        try{
          const s=await ensureMsgSession({force:true});
          return (s&&s.ready&&s.id)?cleanMsg(s.id):'';
        }catch(e){return '';}
      }
      async function msgAuthUserIdFast(){
        try{
          const s=await ensureMsgSession({force:false});
          if(s&&s.id)return cleanMsg(s.id);
        }catch(e){}
        try{
          const fallback=stableAuthUidFromAnySource();
          if(fallback&&fallback!=='guest')return cleanMsg(fallback);
        }catch(e){}
        return '';
      }



      function newerThanCachedConversation(m){
        try{
          const cid=cleanMsg(m&&m.conversation_id); if(!cid)return true;
          const mid=messageStableId(m);
          const pairs=readConversationPairsCache();
          let found=null;
          pairs.some(function(pair){const item=(pair&&pair.item)||pair||{}; if(cleanMsg(item.conversation_id)===cid){found=item; return true;} return false;});
          if(!found)return true;
          if(mid && cleanMsg(found.last_message_id)===mid)return false;
          const nextTime=Date.parse((m&&m.created_at)||0)||0;
          const oldTime=Date.parse(found.last_message_at||found.conversation_updated_at||found.created_at||0)||0;
          return !oldTime || !nextTime || nextTime>=oldTime-1000;
        }catch(e){return true;}
      }

      async function pulseInboxListNow(options){
        options=options||{};
        const now=Date.now();
        if(happyadMsgInboxPulseRunning)return;
        if(!options.force && now-happyadMsgInboxPulseAt<520)return;
        happyadMsgInboxPulseAt=now;
        happyadMsgInboxPulseRunning=true;
        try{
          const c=msgClient(); if(!c)return;
          const uid=cleanMsg(await msgAuthUserIdFast()); if(!uid||uid==='guest')return;
          if(happyadMsgCurrentUser && happyadMsgCurrentUser.id!==uid){happyadMsgCurrentUser.id=uid;}
          const q='sender_id.eq.'+uid+',receiver_id.eq.'+uid;
          const r=await msgTimeout(
            c.from('happyad_msg_messages')
              .select('id,conversation_id,sender_id,receiver_id,message_type,body,client_temp_id,view_once,deleted_for_all,created_at,updated_at,send_status')
              .or(q)
              .order('created_at',{ascending:false})
              .limit(60),
            1800,
            null
          );
          if(!r||r.__timeout||r.error)return;
          const rows=Array.isArray(r.data)?r.data:[];
          const latestByConv={};
          rows.slice().reverse().forEach(function(row){
            const n=normalizeRealtimeMessageRecordForUid(row,uid);
            if(!n.conversation_id)return;
            if(cleanMsg(n.sender_id)!==uid && cleanMsg(n.receiver_id)!==uid)return;
            if(shouldCountIncomingMessageForList(n)) rememberUnreadMessageForList(n);
            latestByConv[n.conversation_id]=n;
          });
          Object.keys(latestByConv).forEach(function(cid){
            const n=latestByConv[cid];
            // Mise à jour silencieuse immédiate: même si l'heure semble identique, on met à jour la ligne.
            applyRealtimeMessageToList(n,{source:'inbox-pulse',uid:uid});
          });
        }catch(e){
          // silence: cette actualisation est seulement un filet de sécurité pour la liste.
        }finally{
          happyadMsgInboxPulseRunning=false;
        }
      }



      async function happyadMsgUnreadCountsFromReceipts(uid){
        const out={};
        try{
          uid=cleanMsg(uid); if(!uid || uid==='guest')return out;
          const c=msgClient(); if(!c)return out;
          const r=await msgTimeout(
            c.from('happyad_msg_message_receipts')
              .select('message_id,conversation_id,read_at')
              .eq('user_id',uid)
              .is('read_at',null)
              .limit(200),
            1800,
            []
          );
          if(!r || r.__timeout || r.error)return out;
          (Array.isArray(r.data)?r.data:[]).forEach(function(x){
            const cid=cleanMsg(x.conversation_id); const mid=cleanMsg(x.message_id);
            if(!cid || !mid)return;
            if(isConversationActuallyOpen(cid))return;
            out[cid]=out[cid]||{};
            out[cid][mid]=true;
          });
        }catch(e){}
        return out;
      }
      function applyUnreadReceiptMapToCache(unreadMap){
        try{
          unreadMap=unreadMap||{};
          const pairs=readConversationPairsCache();
          if(!pairs.length)return;
          const next=pairs.map(function(pair){
            const item=Object.assign({},(pair&&pair.item)||pair||{});
            const cid=cleanMsg(item.conversation_id);
            const count=cid && unreadMap[cid] ? Object.keys(unreadMap[cid]).length : 0;
            item.unread_count=Math.min(99,count);
            item.__unread_confirmed=true;
            item.__server_unread_confirmed=true;
            return {item:item,profile:(pair&&pair.profile)||{}};
          });
          writeConversationPairsCache(next);
          renderConversationPairs(next,'Chargement conversations...', {silent:true});
        }catch(e){}
      }
      async function happyadMsgHardInboxSync(options){
        options=options||{};
        try{
          const c=msgClient(); if(!c)return false;
          const uid=cleanMsg(await msgAuthUserIdFast()); if(!uid || uid==='guest')return false;
          if(happyadMsgCurrentUser && happyadMsgCurrentUser.id!==uid){happyadMsgCurrentUser.id=uid;}
          const q='sender_id.eq.'+uid+',receiver_id.eq.'+uid;
          const unreadMapPromise=happyadMsgUnreadCountsFromReceipts(uid);
          const r=await msgTimeout(
            c.from('happyad_msg_messages')
              .select('id,conversation_id,sender_id,receiver_id,message_type,body,client_temp_id,view_once,deleted_for_all,created_at,updated_at,send_status')
              .or(q)
              .order('created_at',{ascending:false})
              .limit(80),
            options.fast?4500:6500,
            []
          );
          const unreadMap=await unreadMapPromise;
          if(!r || r.__timeout || r.error){
            applyUnreadReceiptMapToCache(unreadMap);
            return false;
          }
          const rows=Array.isArray(r.data)?r.data:[];
          const latestByConv={};
          rows.slice().reverse().forEach(function(row){
            const n=normalizeRealtimeMessageRecordForUid(row,uid);
            if(!n.conversation_id)return;
            if(cleanMsg(n.sender_id)!==uid && cleanMsg(n.receiver_id)!==uid)return;
            const cid=cleanMsg(n.conversation_id);
            const exactCount=unreadMap[cid] ? Object.keys(unreadMap[cid]).length : 0;
            n.__receipt_unread_count=exactCount;
            latestByConv[cid]=n;
          });
          Object.keys(latestByConv).forEach(function(cid){
            const n=latestByConv[cid];
            applyRealtimeMessageToList(n,{source:'hard-inbox-sync',uid:uid});
          });
          /* Après l'upsert des dernières lignes, forcer le compteur exact venant des receipts. */
          const pairs=readConversationPairsCache();
          if(pairs.length){
            const next=pairs.map(function(pair){
              const item=Object.assign({},(pair&&pair.item)||pair||{});
              const cid=cleanMsg(item.conversation_id);
              if(cid){
                const cpt=unreadMap[cid]?Object.keys(unreadMap[cid]).length:0;
                item.unread_count=isConversationActuallyOpen(cid)?0:Math.min(99,cpt);
                item.__unread_confirmed=true;
                item.__server_unread_confirmed=true;
              }
              return {item:item,profile:(pair&&pair.profile)||{}};
            });
            writeConversationPairsCache(next);
            renderConversationPairs(next,'Chargement conversations...', {silent:true});
          }
          if(!rows.length && !readConversationPairsCache().length && options.showEmptyWhenDone){
            setEmptyConversations('Aucune conversation.');
          }
          return !!rows.length;
        }catch(e){return false;}
      }

      function refreshSoon(){
        try{
          if(happyadMsgRefreshTimer)clearTimeout(happyadMsgRefreshTimer);
          happyadMsgRefreshTimer=setTimeout(function(){
            happyadMsgHardInboxSync({force:true,fast:true});
            invisibleListRefresh({force:true});
            syncRecentRawMessagesForList({force:true});
            syncRecentMessagesForList({force:true});
            loadConversations({silent:true});
            if(activeConversationId)loadMessages(activeConversationId,{silent:true});
          },320);
        }catch(e){}
      }
      async function setupInboxRealtime(force){
        const c=msgClient(); if(!c||!c.channel)return;
        try{
          const session=await ensureMsgSession({force:!!force}).catch(function(){return {ready:false,id:''};});
          const uid=cleanMsg(session&&session.ready&&session.id); if(!uid)return;
          if(force && happyadMsgInboxRealtime){try{await c.removeChannel(happyadMsgInboxRealtime);}catch(_e){} happyadMsgInboxRealtime=null; happyadMsgInboxRealtimeReady=false;}
          if(happyadMsgInboxRealtime && happyadMsgInboxRealtimeReady)return;
          let token='';
          try{
            const s=await msgTimeout(c.auth.getSession(),1600,null);
            token=s&&s.data&&s.data.session&&s.data.session.access_token||'';
            if(token && c.realtime && typeof c.realtime.setAuth==='function') c.realtime.setAuth(token);
          }catch(_e){}
          const fast=function(payload){
            try{
              const rec=(payload&&payload.new)||null;
              if(rec&&cleanMsg(rec.conversation_id)) applyRealtimeMessageToList(Object.assign({},rec,{__me_id:uid}),{source:'inbox-filtered',uid:uid});
              refreshSoon();
            }catch(e){refreshSoon();}
          };
          happyadMsgInboxRealtime=c.channel('happyad-msg-inbox-fast-'+uid)
            .on('postgres_changes',{event:'INSERT',schema:'public',table:'happyad_msg_messages',filter:'receiver_id=eq.'+uid},fast)
            .on('postgres_changes',{event:'INSERT',schema:'public',table:'happyad_msg_messages',filter:'sender_id=eq.'+uid},fast)
            .on('postgres_changes',{event:'UPDATE',schema:'public',table:'happyad_msg_messages',filter:'receiver_id=eq.'+uid},fast)
            .on('postgres_changes',{event:'UPDATE',schema:'public',table:'happyad_msg_messages',filter:'sender_id=eq.'+uid},fast)
            .on('postgres_changes',{event:'*',schema:'public',table:'happyad_msg_conversation_members',filter:'user_id=eq.'+uid},function(){syncRecentRawMessagesForList({force:true});loadConversations({silent:true});})
            .subscribe(function(status){
              happyadMsgInboxRealtimeReady = status === 'SUBSCRIBED';
              if(status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED'){
                happyadMsgInboxRealtimeReady=false;
                setTimeout(function(){setupInboxRealtime(true);},1500);
              }
            });
        }catch(e){setTimeout(function(){setupInboxRealtime(true);},1800);}
      }
      async function setupRealtime(force){
        /* HAPPYAD MSG V632 — realtime léger: ne plus écouter toutes les tables globalement.
           Le canal filtré par mon uid dans setupInboxRealtime suffit pour mes messages.
           Cela réduit fortement Disk IO/Reatime et évite que chaque téléphone écoute tous les messages du site. */
        try{
          await setupInboxRealtime(!!force);
          happyadMsgRealtimeReady=true;
        }catch(e){
          happyadMsgRealtimeReady=false;
          setTimeout(function(){setupRealtime(true);},8000);
        }
      }
      function startMessagePolling(){
        try{if(happyadMsgPollTimer)clearInterval(happyadMsgPollTimer);}catch(e){}
        try{if(happyadMsgFastListPollTimer)clearInterval(happyadMsgFastListPollTimer);}catch(e){}
        try{if(happyadMsgInvisibleListTimer)clearInterval(happyadMsgInvisibleListTimer);}catch(e){}
        /* HAPPYAD MSG V632 — anti Disk IO: les anciens intervalles 650ms/1200ms/2600ms forçaient
           trop de lectures Supabase. Maintenant realtime d'abord, polling seulement en sécurité. */
        happyadMsgInvisibleListTimer=setInterval(function(){
          try{
            if(document.hidden)return;
            happyadMsgHardInboxSync({force:true,fast:true});
            pulseInboxListNow({force:true});
          }catch(e){}
        },18000);
        happyadMsgFastListPollTimer=setInterval(function(){
          try{
            if(document.hidden)return;
            pulseInboxListNow({force:true});
            syncRecentRawMessagesForList({force:true});
            if(!happyadMsgInboxRealtimeReady) setupInboxRealtime(true);
          }catch(e){}
        },24000);
        happyadMsgPollTimer=setInterval(function(){
          try{
            if(document.hidden)return;
            happyadMsgPollTick++;
            syncRecentMessagesForList({silent:true});
            if(happyadMsgPollTick%2===0) loadConversations({silent:true});
            if(activeConversationId && !chatView.classList.contains('hidden')) loadMessages(activeConversationId,{silent:true});
            if(!happyadMsgRealtimeReady) setupRealtime(true);
            if(!happyadMsgInboxRealtimeReady) setupInboxRealtime(true);
          }catch(e){}
        },30000);
        try{document.addEventListener('visibilitychange',function(){if(!document.hidden){happyadMsgHardInboxSync({force:true,fast:true});pulseInboxListNow({force:true});loadConversations({silent:true});setupInboxRealtime(true);}},false);}catch(e){}
        try{window.addEventListener('focus',function(){happyadMsgHardInboxSync({force:true,fast:true});pulseInboxListNow({force:true});setupInboxRealtime(true);},false);}catch(e){}
      }
      function bootMessages(){
        try{cleanupOldUnreadIdsForList();}catch(e){}
        try{ensureMsgSession({force:true}).then(function(){loadConversations({silent:true});setupInboxRealtime(true);});}catch(_e){}
        try{applyMsgUserToHeader(readConnectedUserFromStorage()||readMsgJson(HAPPYAD_MSG_ME_CACHE_KEY,{}));}catch(e){}
        try{
          const panel=document.getElementById('conversationPanel');
          panel.querySelectorAll('.row').forEach(x=>x.remove());
          rows=[];
          const cached=readConversationPairsCache();
          if(cached.length)renderConversationPairs(cached,'Aucune conversation.');
          else setEmptyConversations('Chargement conversations...');
        }catch(e){}
        msgUser().then(function(u){applyMsgUserToHeader(u);setupRealtime(true);setupInboxRealtime(true);happyadMsgHardInboxSync({force:true,fast:true});pulseInboxListNow({force:true});invisibleListRefresh({force:true});syncRecentRawMessagesForList({force:true});syncRecentMessagesForList({force:true});}).catch(()=>{setupRealtime(true);setupInboxRealtime(true);happyadMsgHardInboxSync({force:true,fast:true});pulseInboxListNow({force:true});invisibleListRefresh({force:true});syncRecentRawMessagesForList({force:true});syncRecentMessagesForList({force:true});});
        startMessagePolling();
        if(happyadMsgMode==='direct' && happyadDirectUserId) openDirectConversation();
        else { loadConversations(); setTimeout(function(){happyadMsgHardInboxSync({force:true,fast:true});pulseInboxListNow({force:true});invisibleListRefresh({force:true});syncRecentMessagesForList({force:true});},250); }
      }

      buildStickerTabs();
      renderStickerCategory(activeStickerCategory);


      function openChat(row){
        currentConversationRow = row;
        const name = row.dataset.name || 'Conversation';
        const initial = row.dataset.initial || name.slice(0,2).toUpperCase();
        const avatar = row.dataset.avatar || 'purple';
        const status = row.dataset.status || 'Vu récemment';
        const preview = row.dataset.preview || 'Message HappyAD';
        const storyState = row.dataset.story || '';
        const storyClass = storyState === 'active' ? ' story-active' : storyState === 'seen' ? ' story-seen' : '';
        const badgeType = row.dataset.badge || row.dataset.badgeType || row.dataset.userBadge || '';
        const photo = row.dataset.photo || row.dataset.avatarUrl || row.dataset.profilePhoto || '';
        const isOnline = /en ligne|active/i.test(status);
        activeConversationId = row.dataset.conversationId || '';
        activeOtherUserId = row.dataset.otherUserId || '';

        chatName.textContent = name;
        setBadge(chatBadge, badgeType);
        chatStatus.textContent = status;
        chatAvatar.className = 'chat-avatar ' + avatar + storyClass + initialsClass(initial);
        chatAvatar.innerHTML = '';
        if(photo){
          chatAvatar.classList.add('has-photo');
          const img = document.createElement('img');
          img.src = photo;
          img.alt = name;
          img.onerror = () => {
            chatAvatar.classList.remove('has-photo');
            chatAvatar.innerHTML = '';
            chatAvatar.textContent = initial;
            if(isOnline){
              const dot = document.createElement('span');
              dot.className = 'online';
              chatAvatar.appendChild(dot);
            }
          };
          chatAvatar.appendChild(img);
        } else {
          chatAvatar.classList.remove('has-photo');
          chatAvatar.textContent = initial;
        }
        if(isOnline){
          const dot = document.createElement('span');
          dot.className = 'online';
          chatAvatar.appendChild(dot);
        }
        if(dynamicPreview) dynamicPreview.innerHTML = '';
        const cachedBefore=activeConversationId?readMessagesCache(activeConversationId):[];
        if(cachedBefore.length) renderMessagesArray(cachedBefore,'Aucun message. Écris le premier message.');
        else setChatLoading(activeConversationId ? 'Chargement messages...' : 'Ouverture conversation...');
        markConversationReadLocal(activeConversationId);

        row.classList.remove('unread');
        const pill = row.querySelector('.unread-pill');
        if(pill) pill.remove();

        listView.classList.add('hidden');
        chatView.classList.remove('hidden');
        chatView.setAttribute('aria-hidden','false');

        requestAnimationFrame(() => {
          setAppHeight();
          updateAppMetrics();
          updateKeyboardOffset();
          updateComposerSpace();
          bindAllMessageLongPress();
          chatBody.scrollTop = chatBody.scrollHeight;
        });
        if(activeConversationId) loadMessages(activeConversationId);
      }

      function closeChat(){
        consumeVisibleViewOnceOnChatClose();
        if(activeDirectFromVisitor){activeDirectFromVisitor=false;return parentBackOrClose();}
        currentConversationRow = null;
        activeConversationId = '';
        activeOtherUserId = '';
        chatView.classList.add('hidden');
        chatView.setAttribute('aria-hidden','true');
        listView.classList.remove('hidden');
        stickerPanel.classList.remove('active');
        stickerBtn.classList.remove('active');
        messageInput.blur();
      }

      rows.forEach(row => {
        hydrateRowBadge(row);
        row.addEventListener('click', () => openChat(row));
        setupLongPress(row, () => showConversationDeleteSheet(row));
      });
      backBtn.addEventListener('click', closeChat);
      if(listBackBtn) listBackBtn.addEventListener('click', closeMessageCenter);
      listMenuBtn.addEventListener('click', showListMenuSheet);

      chatMenuBtn.addEventListener('click', showChatMenuSheet);
      bindAllMessageLongPress();


      function nowMeta(read){
        const now = new Date();
        const hh = String(now.getHours()).padStart(2,'0');
        const mm = String(now.getMinutes()).padStart(2,'0');
        return hh + ':' + mm + (read ? ' ✓' : '');
      }

      function isLongMessage(text){
        const lines = String(text || '').split(/\r\n|\r|\n/).length;
        return String(text || '').length > 520 || lines > 8;
      }

      function fillTextBubble(bubble, text, isSticker){
        const content = document.createElement('span');
        content.className = 'message-text';
        content.textContent = text;

        if(isSticker){
          bubble.style.fontSize = '34px';
          bubble.style.lineHeight = '1.1';
          bubble.style.padding = '8px 12px 6px';
        } else if(isLongMessage(text)){
          bubble.classList.add('long-message');
          content.classList.add('collapsed');

          const more = document.createElement('button');
          more.type = 'button';
          more.className = 'more-btn';
          more.textContent = 'Voir plus';
          more.addEventListener('click', () => {
            const collapsed = content.classList.toggle('collapsed');
            more.textContent = collapsed ? 'Voir plus' : 'Voir moins';
            updateComposerSpace();
            scrollChatBottom();
          });

          bubble.appendChild(content);
          bubble.appendChild(more);
          return;
        }

        bubble.appendChild(content);
      }


      function defaultVoicePeaks(count){
        const total = Math.max(12, count || 24);
        const peaks = [];
        for(let i = 0; i < total; i++){
          const wave = Math.sin((i / total) * Math.PI * 3.4);
          const soft = Math.sin((i / total) * Math.PI);
          peaks.push(Math.max(.22, Math.min(1, .34 + Math.abs(wave) * .42 + soft * .24)));
        }
        return peaks;
      }

      function renderVoiceBars(msg, peaks){
        const bars = msg ? msg.querySelector('.voice-bars') : null;
        if(!bars) return;
        const values = Array.isArray(peaks) && peaks.length ? peaks : defaultVoicePeaks(24);
        msg._voicePeaks = values;
        bars.innerHTML = '';
        values.forEach(value => {
          const bar = document.createElement('i');
          const h = Math.max(7, Math.min(29, Math.round(7 + (Number(value) || .25) * 22)));
          bar.style.height = h + 'px';
          bars.appendChild(bar);
        });
      }

      async function extractVoicePeaks(blob, count){
        if(!blob || !window.AudioContext && !window.webkitAudioContext) return null;
        try{
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          const ctx = new AudioCtx();
          const buffer = await blob.arrayBuffer();
          const audioBuffer = await ctx.decodeAudioData(buffer.slice(0));
          const channel = audioBuffer.getChannelData(0);
          const total = Math.max(12, count || 24);
          const block = Math.max(1, Math.floor(channel.length / total));
          const peaks = [];

          for(let i = 0; i < total; i++){
            let sum = 0;
            const start = i * block;
            const end = Math.min(channel.length, start + block);
            for(let j = start; j < end; j++) sum += Math.abs(channel[j]);
            peaks.push(sum / Math.max(1, end - start));
          }

          const max = Math.max(...peaks, .001);
          try{ ctx.close(); }catch(e){}
          return peaks.map(v => Math.max(.18, Math.min(1, v / max)));
        }catch(e){
          return null;
        }
      }

      function updateVoiceWave(msg, ratio){
        const progress = msg.querySelector('.voice-progress span');
        const bars = Array.from(msg.querySelectorAll('.voice-bars i'));
        const safeRatio = Math.max(0, Math.min(1, Number(ratio) || 0));
        const activeCount = Math.floor(safeRatio * bars.length);
        if(progress) progress.style.width = (safeRatio * 100) + '%';
        bars.forEach((bar, index) => {
          bar.classList.toggle('active', index < activeCount);
          bar.classList.toggle('current', index === activeCount && safeRatio > 0 && safeRatio < 1);
        });
      }

      function appendVoiceMessage(durationSeconds, isOnce, audioUrl, audioBlob){
        const msg = document.createElement('div');
        msg.className = 'msg me voice-message' + (isOnce ? ' once-message' : '');
        msg.dataset.messageType = 'audio';
        msg.dataset.viewOnceKind = 'audio';
        if(activeConversationId) msg.dataset.conversationId = activeConversationId;
        msg.dataset.voiceDuration = String(Math.max(1, durationSeconds));
        if(audioUrl) msg.dataset.audioUrl = audioUrl;
        if(isOnce){
          msg.dataset.viewOnce = '1';
          msg.dataset.storedInBase = '1';
        }

        const bubble = document.createElement('div');
        bubble.className = 'bubble';

        const wave = document.createElement('span');
        wave.className = 'voice-wave';
        wave.innerHTML =
          '<span class="voice-play" aria-hidden="true">' +
            '<svg class="voice-play-icon" viewBox="0 0 24 24" fill="none"><path d="M8 5v14l11-7L8 5Z" fill="currentColor"/></svg>' +
          '</span>' +
          '<span class="voice-bars" aria-hidden="true"></span>' +
          '<span class="voice-progress"><span></span></span>' +
          '<span class="voice-duration">' + Math.max(1, durationSeconds) + 's</span>';
        bubble.appendChild(wave);

        const meta = document.createElement('span');
        meta.className = 'meta';
        meta.textContent = nowMeta(true);
        bubble.appendChild(meta);

        msg.appendChild(bubble);
        chatBody.appendChild(msg);
        renderVoiceBars(msg, defaultVoicePeaks(24));

        if(audioBlob){
          extractVoicePeaks(audioBlob, 24).then(peaks => {
            if(peaks && chatBody.contains(msg)) renderVoiceBars(msg, peaks);
          });
        }

        bindMessageLongPress(msg);
        scrollChatBottom();
        if(activeConversationId && audioBlob) sendVoiceBlob(audioBlob, durationSeconds, isOnce, msg).catch(function(){});
        return msg;
      }

      function resetVoiceMessage(msg){
        if(!msg) return;
        msg.classList.remove('playing');
        msg.dataset.playing = '0';
        updateVoiceWave(msg, 0);
        const icon = msg.querySelector('.voice-play');
        if(icon){
          icon.innerHTML = '<svg class="voice-play-icon" viewBox="0 0 24 24" fill="none"><path d="M8 5v14l11-7L8 5Z" fill="currentColor"/></svg>';
        }
        if(msg._voiceTimer){
          clearInterval(msg._voiceTimer);
          msg._voiceTimer = null;
        }
        if(msg._voiceFrame){
          cancelAnimationFrame(msg._voiceFrame);
          msg._voiceFrame = null;
        }
        if(msg._audio){
          msg._audio.pause();
          msg._audio.currentTime = 0;
          msg._audio = null;
        }
      }

      function playVoiceMessage(msg){
        if(!msg || !msg.classList.contains('voice-message')) return;

        if(msg.dataset.playing === '1'){
          resetVoiceMessage(msg);
          return;
        }

        chatBody.querySelectorAll('.voice-message.playing').forEach(resetVoiceMessage);

        const duration = Math.max(1, Number(msg.dataset.voiceDuration || 1));
        const icon = msg.querySelector('.voice-play');
        const started = Date.now();

        msg.dataset.playing = '1';
        msg.classList.add('playing');
        if(icon){
          icon.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><path d="M8 5h3v14H8V5Zm5 0h3v14h-3V5Z" fill="currentColor"/></svg>';
        }

        const finishVoicePlayback = () => {
          resetVoiceMessage(msg);
          if(msg.dataset.viewOnce === '1') consumeViewOnceMessage(msg);
        };

        const audioUrl = msg.dataset.audioUrl || '';
        if(audioUrl){
          const audio = new Audio(audioUrl);
          msg._audio = audio;

          const tick = () => {
            if(msg.dataset.playing !== '1' || msg._audio !== audio) return;
            const realDuration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : duration;
            const ratio = realDuration ? audio.currentTime / realDuration : 0;
            updateVoiceWave(msg, ratio);
            if(!audio.paused && !audio.ended) msg._voiceFrame = requestAnimationFrame(tick);
          };

          audio.addEventListener('loadedmetadata', tick);
          audio.addEventListener('timeupdate', () => {
            const realDuration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : duration;
            updateVoiceWave(msg, realDuration ? audio.currentTime / realDuration : 0);
          });
          audio.addEventListener('ended', finishVoicePlayback);
          audio.play().then(() => {
            msg._voiceFrame = requestAnimationFrame(tick);
          }).catch(() => {
            finishVoicePlayback();
          });
          return;
        }

        msg._voiceTimer = setInterval(() => {
          const ratio = Math.min(1, (Date.now() - started) / (duration * 1000));
          updateVoiceWave(msg, ratio);
          if(ratio >= 1) finishVoicePlayback();
        }, 90);
      }

      chatBody.addEventListener('click', e => {
        const voice = e.target.closest('.voice-message');
        if(!voice || !chatBody.contains(voice)) return;
        if(e.target.closest('.more-btn')) return;
        e.preventDefault();
        playVoiceMessage(voice);
      });


      function preferredAudioMimeType(){
        if(!window.MediaRecorder || !MediaRecorder.isTypeSupported) return '';
        const types = [
          'audio/webm;codecs=opus',
          'audio/webm',
          'audio/ogg;codecs=opus',
          'audio/mp4'
        ];
        return types.find(type => MediaRecorder.isTypeSupported(type)) || '';
      }

      function resetVoiceRecorderState(){
        voiceRecording = false;
        composer.classList.remove('recording');
        composer.classList.remove('typing-mode');
        messageInput.placeholder = 'Écrire un message...';
        if(recordTimer) recordTimer.textContent = '0s';
        if(voiceRecordTimer){
          clearInterval(voiceRecordTimer);
          voiceRecordTimer = null;
        }
        if(voiceStream){
          try{ voiceStream.getTracks().forEach(track => track.stop()); }catch(e){}
          voiceStream = null;
        }
        voiceRecorder = null;
        voiceChunks = [];
        updateComposerMode();
      }

      function notifyVoiceError(text){
        appendSystemMessage(text || 'Audio non enregistré. Vérifie l’autorisation du micro.');
      }

      function updateRecordTimer(){
        if(!voiceRecording) return;
        const seconds = Math.max(0, Math.floor((Date.now() - voiceRecordStartedAt) / 1000));
        if(recordTimer) recordTimer.textContent = seconds + 's';
        messageInput.placeholder = 'Enregistrement audio';
      }

      async function startVoiceRecording(){
        if(voiceRecording) return;

        if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder){
          notifyVoiceError('Micro non disponible dans ce mode. Ouvre le fichier depuis Chrome/HTTPS ou installe l’application pour enregistrer le vrai son.');
          return;
        }

        voiceChunks = [];
        voiceRecordStartedAt = Date.now();

        try{
          voiceStream = await navigator.mediaDevices.getUserMedia({audio:true});

          const mimeType = preferredAudioMimeType();
          const options = mimeType ? {mimeType} : undefined;
          voiceRecorder = new MediaRecorder(voiceStream, options);

          voiceRecorder.ondataavailable = e => {
            if(e.data && e.data.size > 0) voiceChunks.push(e.data);
          };

          voiceRecorder.onerror = () => {
            resetVoiceRecorderState();
            notifyVoiceError('Erreur micro : le son n’a pas été enregistré.');
          };

          voiceRecorder.start(250);

          voiceRecording = true;
          voiceRecordStartedAt = Date.now();
          composer.classList.remove('typing-mode');
          composer.classList.add('recording');
          messageInput.value = '';
          autoGrow();
          updateComposerMode();
          updateRecordTimer();
          voiceRecordTimer = setInterval(updateRecordTimer, 250);
        }catch(err){
          resetVoiceRecorderState();
          notifyVoiceError('Micro non autorisé ou non disponible. Autorise le micro puis réessaie.');
        }
      }

      function stopVoiceRecording(send){
        if(!voiceRecording) return;
        const seconds = Math.max(1, Math.round((Date.now() - voiceRecordStartedAt) / 1000));

        voiceRecording = false;
        composer.classList.remove('recording');
        composer.classList.remove('typing-mode');
        messageInput.placeholder = 'Écrire un message...';
        if(recordTimer) recordTimer.textContent = '0s';
        if(voiceRecordTimer){
          clearInterval(voiceRecordTimer);
          voiceRecordTimer = null;
        }

        const finish = (audioUrl, audioBlob) => {
          if(voiceStream){
            try{ voiceStream.getTracks().forEach(track => track.stop()); }catch(e){}
            voiceStream = null;
          }
          voiceRecorder = null;
          updateComposerMode();

          if(!send) return;

          if(audioUrl && audioBlob && audioBlob.size > 0){
            appendVoiceMessage(seconds, viewOnceActive, audioUrl, audioBlob);
          } else {
            notifyVoiceError('Audio vide : le message n’a pas été envoyé parce que le micro n’a capturé aucun son.');
          }
        };

        if(voiceRecorder && voiceRecorder.state !== 'inactive'){
          voiceRecorder.onstop = () => {
            let url = '';
            let blob = null;
            if(voiceChunks.length){
              const type = voiceRecorder && voiceRecorder.mimeType ? voiceRecorder.mimeType : (voiceChunks[0].type || 'audio/webm');
              blob = new Blob(voiceChunks, {type});
              if(blob.size > 0){
                url = URL.createObjectURL(blob);
                objectUrls.add(url);
              }
            }
            finish(url, blob);
            voiceChunks = [];
          };
          try{
            voiceRecorder.requestData();
          }catch(e){}
          voiceRecorder.stop();
        } else {
          finish('', null);
          voiceChunks = [];
        }
      }

      function toggleVoiceRecording(){
        if(voiceRecording){
          stopVoiceRecording(true);
          return;
        }
        startVoiceRecording();
      }

      function appendTextMessage(text, isSticker, isOnce){
        const msg = document.createElement('div');
        msg.className = 'msg me' + (isOnce ? ' once-message' : '');
        msg.dataset.messageType = isSticker ? 'sticker' : 'text';
        msg.dataset.viewOnceKind = isSticker ? 'sticker' : 'text';
        if(activeConversationId) msg.dataset.conversationId = activeConversationId;
        if(isOnce){
          msg.dataset.viewOnce = '1';
          msg.dataset.storedInBase = '1';
        }

        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        fillTextBubble(bubble, text, isSticker);

        const meta = document.createElement('span');
        meta.className = 'meta';
        meta.textContent = nowMeta(true);
        bubble.appendChild(meta);

        msg.appendChild(bubble);
        chatBody.appendChild(msg);
        bindMessageLongPress(msg);
        scrollChatBottom();
        return msg;
      }

      composer.addEventListener('submit', async function(e){
        e.preventDefault();

        const text = messageInput.value.trim();

        if(pendingMediaFiles.length){
          const filesToSend = pendingMediaFiles.slice(0, 6);
          clearPendingMedia();
          messageInput.value = '';
          composer.classList.remove('typing-mode');
          autoGrow();
          updateComposerMode();
          await sendMediaMessage(filesToSend, viewOnceActive, text || null);
          return;
        }

        if(!text){
          toggleVoiceRecording();
          return;
        }

        if(voiceRecording) stopVoiceRecording(false);
        messageInput.value = '';
        composer.classList.remove('typing-mode');
        autoGrow();
        updateComposerMode();
        await sendTextMessage(text, false, viewOnceActive);
      });

      function autoGrow(){
        const hasText = !!messageInput.value.trim();

        if(!hasText && !pendingMediaFiles.length && !voiceRecording){
          composer.classList.remove('typing-mode');
          messageInput.style.height = '';
        } else {
          messageInput.style.height = 'auto';
          messageInput.style.height = Math.min(messageInput.scrollHeight, 158) + 'px';
        }

        updateComposerMode();
        updateComposerSpace();
        scrollChatBottom();
      }


      function updateComposerMode(){
        const hasText = !!messageInput.value.trim();
        const hasMedia = pendingMediaFiles.length > 0;
        const canSend = hasText || hasMedia;

        composer.classList.toggle('has-text', canSend);
        composer.classList.toggle('typing-mode', hasText && !voiceRecording);
        sendBtn.setAttribute('aria-label', canSend ? 'Envoyer' : 'Enregistrer audio');
      }

      function setViewOnce(active){
        viewOnceActive = !!active;
        onceToggle.classList.toggle('active', viewOnceActive);
        onceToggle.setAttribute('aria-pressed', viewOnceActive ? 'true' : 'false');
      }

      onceToggle.addEventListener('click', () => {
        setViewOnce(!viewOnceActive);
      });

      messageInput.addEventListener('input', () => {
        autoGrow();
        updateComposerMode();
      });
      messageInput.addEventListener('focus', () => {
        updateComposerMode();
        stickerPanel.classList.remove('active');
        stickerBtn.classList.remove('active');
        keyboardForceUntil = 0;
        updateKeyboardOffset();
        updateComposerSpace();

        setTimeout(() => {
          updateKeyboardOffset();
          updateComposerSpace();
          scrollChatBottom();
        }, 80);

        setTimeout(() => {
          updateKeyboardOffset();
          updateComposerSpace();
          scrollChatBottom();
        }, 260);

        setTimeout(() => {
          updateKeyboardOffset();
          updateComposerSpace();
          scrollChatBottom();
        }, 520);
      });

      messageInput.addEventListener('blur', () => {
        keyboardForceUntil = 0;
        setTimeout(updateComposerMode, 90);
        setTimeout(() => {
          updateKeyboardOffset();
          updateComposerSpace();
        }, 80);
      });

      searchToggle.addEventListener('click', () => {
        searchBar.classList.toggle('active');
        if(searchBar.classList.contains('active')) searchInput.focus();
        else {
          searchInput.value = '';
          filterRows('');
        }
      });

      function filterRows(value){
        const q = value.trim().toLowerCase();
        let visible = 0;
        rows.forEach(row => {
          const text = ((row.dataset.name || '') + ' ' + (row.dataset.preview || '')).toLowerCase();
          const ok = !q || text.includes(q);
          row.style.display = ok ? 'flex' : 'none';
          if(ok) visible++;
        });
        emptyState.style.display = visible ? 'none' : 'block';
      }
      searchInput.addEventListener('input', e => filterRows(e.target.value));

      emojiTabs.addEventListener('click', e => {
        const btn = e.target.closest('.emoji-tab');
        if(!btn) return;
        renderStickerCategory(btn.dataset.key);
        updateComposerSpace();
      });

      stickerBtn.addEventListener('click', () => {
        const shouldOpen = !stickerPanel.classList.contains('active');
        stickerPanel.classList.toggle('active', shouldOpen);
        stickerBtn.classList.toggle('active', shouldOpen);
        messageInput.blur();
        keyboardForceUntil = 0;
        setTimeout(() => {
          updateKeyboardOffset();
          updateComposerSpace();
        }, 40);
      });

      function insertStickerIntoInput(sticker){
        const value = messageInput.value || '';
        const wasFocused = document.activeElement === messageInput;
        const start = wasFocused && typeof messageInput.selectionStart === 'number' ? messageInput.selectionStart : value.length;
        const end = wasFocused && typeof messageInput.selectionEnd === 'number' ? messageInput.selectionEnd : value.length;
        const before = value.slice(0, start);
        const after = value.slice(end);
        const spacerBefore = before && !/\s$/.test(before) ? ' ' : '';
        const spacerAfter = after && !/^\s/.test(after) ? ' ' : '';
        const insert = spacerBefore + sticker + spacerAfter;

        messageInput.value = before + insert + after;
        const cursor = before.length + insert.length;
        try { messageInput.setSelectionRange(cursor, cursor); } catch(e) {}
        autoGrow();
        updateComposerSpace();

        // Important: do not focus and do not auto-scroll here.
        // A sticker click must not move the conversation or hide the current messages.
      }

      function deleteLastInputUnit(){
        const value = messageInput.value || '';
        if(!value) return;

        const wasFocused = document.activeElement === messageInput;
        const start = wasFocused && typeof messageInput.selectionStart === 'number' ? messageInput.selectionStart : value.length;
        const end = wasFocused && typeof messageInput.selectionEnd === 'number' ? messageInput.selectionEnd : value.length;

        if(start !== end){
          messageInput.value = value.slice(0, start) + value.slice(end);
          try { messageInput.setSelectionRange(start, start); } catch(e) {}
          autoGrow();
          return;
        }

        const before = value.slice(0, start).replace(/\s+$/u, '');
        const after = value.slice(start);
        let cutIndex = before.length;

        try {
          if(window.Intl && Intl.Segmenter){
            const segments = Array.from(new Intl.Segmenter(undefined, {granularity:'grapheme'}).segment(before));
            const last = segments[segments.length - 1];
            cutIndex = last ? last.index : Math.max(0, before.length - 1);
          } else {
            const arr = Array.from(before);
            arr.pop();
            cutIndex = arr.join('').length;
          }
        } catch(e) {
          const arr = Array.from(before);
          arr.pop();
          cutIndex = arr.join('').length;
        }

        const next = before.slice(0, cutIndex).replace(/\s+$/u, '') + after;
        messageInput.value = next;
        const cursor = Math.min(cutIndex, messageInput.value.length);
        try { messageInput.setSelectionRange(cursor, cursor); } catch(e) {}
        autoGrow();
        updateComposerSpace();
      }

      stickerDeleteBtn.addEventListener('pointerdown', e => e.preventDefault());
      stickerDeleteBtn.addEventListener('click', e => {
        e.preventDefault();
        deleteLastInputUnit();
      });



      stickers.addEventListener('click', e => {
        const btn = e.target.closest('.sticker');
        if(!btn) return;
        insertStickerIntoInput(btn.textContent.trim());
      });

      attachBtn.addEventListener('click', () => {
        stickerPanel.classList.remove('active');
        stickerBtn.classList.remove('active');
        fileInput.click();
      });

      function showMediaConfirmSheet(files){
        pendingMediaFiles = Array.from(files || []).slice(0, 6);
        if(!pendingMediaFiles.length) return;

        openActionSheet({
          title:'',
          subtitle:'',
          mediaPreviewFiles: pendingMediaFiles,
          allowAddMedia: pendingMediaFiles.length < 6,
          actions:[
            {
              label:'Envoyer',
              icon:'all',
              kind:'info',
              onClick:() => {
                var filesToSend = pendingMediaFiles.slice(0,6);
                pendingMediaFiles = [];
                fileInput.value = '';
                composer.classList.remove('typing-mode');
                updateComposerMode();
                sendMediaMessage(filesToSend, viewOnceActive, null).catch(function(e){console.warn(e)});
              }
            },
            {
              label:'Annuler',
              icon:'cancel',
              kind:'',
              onClick:() => {
                pendingMediaFiles = [];
                fileInput.value = '';
              }
            }
          ],
          hideDefaultCancel:true
        });
      }




      function cleanMediaFileName(name, kind){
        const raw = String(name || '').trim();
        const generic = !raw || /^file[_-]?[0-9a-f]{10,}/i.test(raw) || /^content:/i.test(raw);

        if(generic){
          if(kind === 'image') return 'Image';
          if(kind === 'video') return 'Vidéo';
          return 'Fichier';
        }

        return raw.length > 34 ? raw.slice(0, 18) + '…' + raw.slice(-10) : raw;
      }

      function extensionFromName(name, fallback){
        const raw = String(name || '');
        const m = raw.match(/\.([a-z0-9]{2,5})(?:$|\?)/i);
        return (m ? m[1] : fallback || '').toUpperCase();
      }

      function setViewerHeader(titleEl, kind, title, details){
        const clean = cleanMediaFileName(title, kind);
        const typeLabel = kind === 'image' ? 'Image' : kind === 'video' ? 'Vidéo' : 'Fichier';
        titleEl.innerHTML = '<strong>' + clean + '</strong><span>' + (details || typeLabel) + '</span>';
      }

      function makeViewerHint(container){
        let hint = container.querySelector('.viewer-hint');
        if(!hint){
          hint = document.createElement('div');
          hint.className = 'viewer-hint';
          hint.textContent = 'Double appui pour zoomer';
          container.appendChild(hint);
          setTimeout(() => hint.classList.add('hide'), 1800);
        }
      }

      function attachSmoothZoom(container, media){
        if(!container || !media) return;

        let scale = 1;
        let tx = 0;
        let ty = 0;
        let startX = 0;
        let startY = 0;
        let startTx = 0;
        let startTy = 0;
        let dragging = false;
        let lastTap = 0;
        let pointers = new Map();
        let pinchStartDistance = 0;
        let pinchStartScale = 1;

        const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
        const apply = (smooth) => {
          media.classList.toggle('zooming', !smooth);
          media.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px,0) scale(' + scale + ')';
        };
        const reset = () => {
          scale = 1;
          tx = 0;
          ty = 0;
          apply(true);
        };
        const zoomTo = (nextScale, clientX, clientY) => {
          const rect = media.getBoundingClientRect();
          const cx = clientX ? clientX - rect.left - rect.width / 2 : 0;
          const cy = clientY ? clientY - rect.top - rect.height / 2 : 0;
          const prev = scale;
          scale = clamp(nextScale, 1, 4);
          if(scale === 1){
            tx = 0;
            ty = 0;
          } else if(prev !== scale){
            tx -= cx * (scale / prev - 1);
            ty -= cy * (scale / prev - 1);
          }
          apply(true);
        };

        media.addEventListener('dblclick', e => {
          e.preventDefault();
          if(scale > 1.05) reset();
          else zoomTo(2.35, e.clientX, e.clientY);
        });

        container.addEventListener('pointerdown', e => {
          if(e.target !== media) return;
          e.preventDefault();
          pointers.set(e.pointerId, {x:e.clientX, y:e.clientY});
          try{ container.setPointerCapture(e.pointerId); }catch(err){}

          const now = Date.now();
          if(now - lastTap < 300 && pointers.size === 1){
            if(scale > 1.05) reset();
            else zoomTo(2.35, e.clientX, e.clientY);
            lastTap = 0;
            return;
          }
          lastTap = now;

          if(pointers.size === 1){
            dragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startTx = tx;
            startTy = ty;
          } else if(pointers.size === 2){
            const pts = Array.from(pointers.values());
            pinchStartDistance = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
            pinchStartScale = scale;
          }
        });

        container.addEventListener('pointermove', e => {
          if(!pointers.has(e.pointerId)) return;
          pointers.set(e.pointerId, {x:e.clientX, y:e.clientY});

          if(pointers.size === 2){
            e.preventDefault();
            const pts = Array.from(pointers.values());
            const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
            if(pinchStartDistance > 0){
              scale = clamp(pinchStartScale * (dist / pinchStartDistance), 1, 4);
              if(scale === 1){ tx = 0; ty = 0; }
              apply(false);
            }
            return;
          }

          if(dragging && scale > 1.05){
            e.preventDefault();
            tx = startTx + (e.clientX - startX);
            ty = startTy + (e.clientY - startY);
            apply(false);
          }
        });

        ['pointerup','pointercancel','pointerleave'].forEach(type => {
          container.addEventListener(type, e => {
            pointers.delete(e.pointerId);
            dragging = false;
            if(scale <= 1.02) reset();
            else apply(true);
          });
        });
      }

      function openDraftFullViewer(kind, url, title){
        draftFullContent.innerHTML = '';
        setViewerHeader(draftFullTitle, kind, title, kind === 'image' ? 'Image prête à envoyer' : kind === 'video' ? 'Vidéo prête à envoyer' : 'Fichier prêt à envoyer');

        let mediaEl = null;
        if(kind === 'image'){
          const img = document.createElement('img');
          img.src = url;
          img.alt = title || 'Image';
          img.className = 'zoomable-media';
          img.onload = () => {
            const ext = extensionFromName(title, 'IMG');
            setViewerHeader(draftFullTitle, 'image', title, 'Image • ' + img.naturalWidth + '×' + img.naturalHeight + (ext ? ' • ' + ext : ''));
          };
          mediaEl = img;
          draftFullContent.appendChild(img);
        } else if(kind === 'video'){
          const video = document.createElement('video');
          video.src = url;
          video.controls = true;
          video.autoplay = true;
          video.playsInline = true;
          video.className = 'zoomable-media';
          video.onloadedmetadata = () => {
            const ext = extensionFromName(title, 'VID');
            const size = video.videoWidth && video.videoHeight ? video.videoWidth + '×' + video.videoHeight : 'Vidéo';
            setViewerHeader(draftFullTitle, 'video', title, 'Vidéo • ' + size + (ext ? ' • ' + ext : ''));
          };
          mediaEl = video;
          draftFullContent.appendChild(video);
        }

        if(mediaEl){
          makeViewerHint(draftFullViewer);
          attachSmoothZoom(draftFullContent, mediaEl);
        }

        draftFullViewer.classList.add('active');
        draftFullViewer.setAttribute('aria-hidden','false');
      }

      function closeDraftFullViewer(){
        draftFullViewer.classList.remove('active');
        draftFullViewer.setAttribute('aria-hidden','true');
        draftFullContent.querySelectorAll('video').forEach(v => {
          try{ v.pause(); }catch(e){}
        });
        draftFullContent.innerHTML = '';
        const hint = draftFullViewer.querySelector('.viewer-hint');
        if(hint) hint.remove();
      }

      draftFullClose.addEventListener('click', closeDraftFullViewer);
      draftFullViewer.addEventListener('click', e => {
        if(e.target === draftFullViewer) closeDraftFullViewer();
      });

      function mediaKind(file){
        if(file.type && file.type.startsWith('image/')) return 'image';
        if(file.type && file.type.startsWith('video/')) return 'video';
        return 'file';
      }

      function clearPendingMedia(){
        pendingMediaFiles = [];
        mediaDraftGrid.innerHTML = '';
        mediaDraftPanel.classList.remove('active');
        mediaDraftPanel.setAttribute('aria-hidden','true');
        fileInput.value = '';
        updateComposerMode();
        updateComposerSpace();
      }

      function addPendingMedia(files){
        const incoming = Array.from(files || []);
        if(!incoming.length) return;

        pendingMediaFiles = pendingMediaFiles.concat(incoming).slice(0, 6);
        renderPendingMedia();
        updateComposerMode();
      }

      function renderPendingMedia(){
        mediaDraftGrid.innerHTML = '';
        if(!pendingMediaFiles.length){
          clearPendingMedia();
          return;
        }

        mediaDraftTitle.textContent = pendingMediaFiles.length > 1 ? pendingMediaFiles.length + ' fichiers prêts à envoyer' : 'Fichier prêt à envoyer';
        mediaDraftPanel.classList.add('active');
        mediaDraftPanel.setAttribute('aria-hidden','false');

        pendingMediaFiles.forEach(file => {
          const item = document.createElement('button');
          item.type = 'button';
          item.className = 'media-draft-item';
          const kind = mediaKind(file);
          const url = URL.createObjectURL(file);
          objectUrls.add(url);

          if(kind === 'image'){
            const img = document.createElement('img');
            img.src = url;
            img.alt = file.name || 'Image';
            item.dataset.previewKind = 'image';
            item.dataset.previewUrl = url;
            item.dataset.previewTitle = file.name || 'Image';
            item.appendChild(img);
            item.addEventListener('pointerup', ev => {
              ev.preventDefault();
              ev.stopPropagation();
              openDraftFullViewer('image', url, file.name || 'Image');
            });
          } else if(kind === 'video'){
            const video = document.createElement('video');
            video.src = url;
            video.muted = true;
            video.playsInline = true;
            item.dataset.previewKind = 'video';
            item.dataset.previewUrl = url;
            item.dataset.previewTitle = file.name || 'Vidéo';
            item.appendChild(video);
            item.addEventListener('pointerup', ev => {
              ev.preventDefault();
              ev.stopPropagation();
              openDraftFullViewer('video', url, file.name || 'Vidéo');
            });
          } else {
            const label = document.createElement('span');
            label.className = 'media-draft-file';
            label.textContent = file.name || 'Fichier';
            item.appendChild(label);
          }

          mediaDraftGrid.appendChild(item);
        });

        if(pendingMediaFiles.length < 6){
          const add = document.createElement('button');
          add.type = 'button';
          add.className = 'media-draft-add';
          add.setAttribute('aria-label','Ajouter un fichier');
          add.textContent = '+';
          add.addEventListener('click', () => fileInput.click());
          mediaDraftGrid.appendChild(add);
        }

        updateComposerSpace();
        scrollChatBottom();
      }

      mediaDraftClear.addEventListener('click', clearPendingMedia);

      mediaDraftGrid.addEventListener('click', e => {
        const item = e.target.closest('.media-draft-item');
        if(!item || !mediaDraftGrid.contains(item)) return;

        const kind = item.dataset.previewKind;
        const url = item.dataset.previewUrl;
        const title = item.dataset.previewTitle || 'Média';

        if(kind && url){
          e.preventDefault();
          e.stopPropagation();
          openDraftFullViewer(kind, url, title);
        }
      });


      fileInput.addEventListener('change', e => {
        const files = Array.from(e.target.files || []);
        if(!files.length) return;
        addPendingMedia(files);
        fileInput.value = '';
        updateComposerMode();
      });

      function appendFileMessage(files, isOnce){
        const msg = document.createElement('div');
        msg.className = 'msg me' + (isOnce ? ' once-message' : '');
        msg.dataset.messageType = 'media';
        msg.dataset.viewOnceKind = Array.from(files||[]).some(function(f){return kindFromFile(f)==='audio';}) ? 'audio' : 'media';
        if(activeConversationId) msg.dataset.conversationId = activeConversationId;
        if(isOnce){
          msg.dataset.viewOnce = '1';
          msg.dataset.storedInBase = '1';
        }

        const bubble = document.createElement('div');
        bubble.className = 'bubble media-bubble';

        if(isOnce){
          const onceDot = document.createElement('span');
          onceDot.className = 'once-dot';
          bubble.appendChild(onceDot);
        }

        const visualFiles = files.filter(file => file.type.startsWith('image/') || file.type.startsWith('video/'));
        const otherFiles = files.filter(file => !file.type.startsWith('image/') && !file.type.startsWith('video/'));

        if(visualFiles.length){
          const grid = document.createElement('div');
          grid.className = 'media-grid ' + (visualFiles.length === 1 ? 'one' : visualFiles.length === 2 ? 'two' : 'many');
          visualFiles.forEach(file => grid.appendChild(createMediaTile(file)));
          bubble.appendChild(grid);
        }

        otherFiles.forEach(file => bubble.appendChild(createFileCard(file)));

        const meta = document.createElement('span');
        meta.className = 'meta';
        meta.textContent = nowMeta(true);
        bubble.appendChild(meta);

        msg.appendChild(bubble);
        chatBody.appendChild(msg);
        bindMessageLongPress(msg);
        updateComposerSpace();
        scrollChatBottom();
        return msg;
      }

      function createMediaTile(file){
        const url = URL.createObjectURL(file);
        objectUrls.add(url);

        const tile = document.createElement('button');
        tile.className = 'media-tile';
        tile.type = 'button';
        tile.title = file.name;

        if(file.type.startsWith('image/')){
          const img = document.createElement('img');
          img.src = url;
          img.alt = file.name || 'Photo';
          tile.appendChild(img);
          tile.addEventListener('click', () => openViewer('image', url, file.name || 'Photo', tile.closest('.once-message')));
        } else {
          const video = document.createElement('video');
          video.src = url;
          video.muted = true;
          video.playsInline = true;
          video.preload = 'metadata';
          tile.appendChild(video);

          const badge = document.createElement('span');
          badge.className = 'play-badge';
          badge.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M8 5v14l11-7L8 5Z" fill="currentColor"/></svg>';
          tile.appendChild(badge);

          tile.addEventListener('click', () => openViewer('video', url, file.name || 'Vidéo', tile.closest('.once-message')));
        }

        return tile;
      }

      function createFileCard(file){
        const card = document.createElement('div');
        card.className = 'file-card';

        const icon = document.createElement('div');
        icon.className = 'file-icon';
        icon.innerHTML = '<svg width="23" height="23" viewBox="0 0 24 24" fill="none"><path d="M7 3h7l4 4v14H7V3Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M14 3v5h5" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';

        const info = document.createElement('div');
        info.className = 'file-info';

        const name = document.createElement('div');
        name.className = 'file-name';
        name.textContent = file.name || 'Fichier';

        const size = document.createElement('div');
        size.className = 'file-size';
        size.textContent = formatBytes(file.size);

        info.appendChild(name);
        info.appendChild(size);
        card.appendChild(icon);
        card.appendChild(info);
        return card;
      }

      function formatBytes(bytes){
        if(!bytes && bytes !== 0) return '';
        const units = ['B','KB','MB','GB'];
        let size = bytes;
        let unit = 0;
        while(size >= 1024 && unit < units.length - 1){
          size /= 1024;
          unit++;
        }
        return (unit === 0 ? size : size.toFixed(size < 10 ? 1 : 0)) + ' ' + units[unit];
      }

      function openViewer(type, url, title, sourceMsg){
        pendingOnceViewerMessage = (sourceMsg && sourceMsg.dataset && sourceMsg.dataset.viewOnce === '1') ? sourceMsg : null;
        viewerContent.innerHTML = '';
        setViewerHeader(viewerTitle, type, title, type === 'image' ? 'Image' : type === 'video' ? 'Vidéo' : 'Média');

        let el;
        if(type === 'image'){
          el = document.createElement('img');
          el.src = url;
          el.alt = title || 'Photo';
          el.onload = () => {
            const ext = extensionFromName(title, 'IMG');
            setViewerHeader(viewerTitle, 'image', title, 'Image • ' + el.naturalWidth + '×' + el.naturalHeight + (ext ? ' • ' + ext : ''));
          };
        } else {
          el = document.createElement('video');
          el.src = url;
          el.controls = true;
          el.autoplay = true;
          el.playsInline = true;
          el.onloadedmetadata = () => {
            const ext = extensionFromName(title, 'VID');
            const size = el.videoWidth && el.videoHeight ? el.videoWidth + '×' + el.videoHeight : 'Vidéo';
            setViewerHeader(viewerTitle, 'video', title, 'Vidéo • ' + size + (ext ? ' • ' + ext : ''));
          };
        }

        el.className = 'zoomable-media';
        viewerContent.appendChild(el);
        makeViewerHint(mediaViewer);
        attachSmoothZoom(viewerContent, el);

        mediaViewer.classList.add('active');
        mediaViewer.setAttribute('aria-hidden','false');
      }

      function closeViewer(){
        const video = viewerContent.querySelector('video');
        if(video) video.pause();
        viewerContent.innerHTML = '';
        const hint = mediaViewer.querySelector('.viewer-hint');
        if(hint) hint.remove();
        mediaViewer.classList.remove('active');
        mediaViewer.setAttribute('aria-hidden','true');
        const onceMsg = pendingOnceViewerMessage;
        pendingOnceViewerMessage = null;
        if(onceMsg && chatBody.contains(onceMsg)) consumeViewOnceMessage(onceMsg,'viewer_close');
      }

      viewerClose.addEventListener('click', closeViewer);
      mediaViewer.addEventListener('click', e => {
        if(e.target === mediaViewer) closeViewer();
      });

      function scrollChatBottom(){
        requestAnimationFrame(() => {
          chatBody.scrollTop = chatBody.scrollHeight;
        });
      }

      function updateAppMetrics(){
        const rect = app.getBoundingClientRect();
        document.documentElement.style.setProperty('--composer-left', Math.round(rect.left) + 'px');
        document.documentElement.style.setProperty('--composer-width', Math.round(rect.width) + 'px');
      }

      function setAppHeight(){
        const vv = window.visualViewport;
        const height = vv && vv.height ? vv.height : window.innerHeight;
        document.documentElement.style.setProperty('--app-height', Math.round(height) + 'px');
      }

      function currentKeyboardOffset(){
        return 0;
      }

      function updateComposerSpace(){
        document.documentElement.style.setProperty('--composer-space', '14px');
      }

      function updateKeyboardOffset(){
        document.documentElement.style.setProperty('--keyboard-offset', '0px');
        document.documentElement.style.setProperty('--keyboard-gap', '0px');
        setAppHeight();
        updateAppMetrics();
        updateComposerSpace();
      }

      if(window.visualViewport){
        window.visualViewport.addEventListener('resize', () => {
          updateKeyboardOffset();
          if(document.activeElement === messageInput) scrollChatBottom();
        });

        window.visualViewport.addEventListener('scroll', () => {
          updateKeyboardOffset();
          if(document.activeElement === messageInput) scrollChatBottom();
        });
      }

      window.addEventListener('orientationchange', () => {
        setTimeout(() => {
          updateKeyboardOffset();
          if(document.activeElement === messageInput) scrollChatBottom();
        }, 160);
      });

      window.addEventListener('resize', () => {
        updateKeyboardOffset();
        if(document.activeElement === messageInput) scrollChatBottom();
      });

      setAppHeight();
      updateAppMetrics();
      updateKeyboardOffset();
      updateComposerSpace();
      setViewOnce(false);
      updateComposerMode();
      bootMessages();


      function consumeViewOnceMessage(msg, reason){
        if(!msg || msg.dataset.viewOnce !== '1' || msg.dataset.consumed === '1') return;
        msg.dataset.consumed = '1';
        const conversationId = cleanMsg(msg.dataset.conversationId || activeConversationId);
        const messageId = cleanMsg(msg.dataset.messageId || '');
        if(conversationId && messageId) { markViewOnceConsumedLocal(conversationId,messageId); removeMessageFromLocalCache(conversationId,messageId); happyadMsgDisplayedMessages=happyadMsgDisplayedMessages.filter(function(m){return cleanMsg(m.message_id||m.id||m.client_temp_id||m.created_at)!==messageId;}); }
        if(messageId) hideViewOnceRemote(messageId);
        msg.classList.add('once-dust');
        setTimeout(() => {
          if(msg && msg.parentNode) msg.remove();
          updateConversationPreviewFromCache(conversationId);
        }, 760);
      }
      function updateConversationPreviewFromCache(conversationId){
        try{
          conversationId=cleanMsg(conversationId||activeConversationId); if(!conversationId)return;
          const messages=readMessagesCache(conversationId).filter(function(m){return !m.view_once;});
          if(!messages.length)return;
          const last=messages[messages.length-1];
          const cached=readConversationPairsCache();
          const next=cached.map(function(pair){
            const item=Object.assign({},(pair&&pair.item)||pair||{});
            if(cleanMsg(item.conversation_id)===conversationId){
              item.last_message_id=last.message_id||last.id||item.last_message_id;
              item.last_message_at=last.created_at||item.last_message_at;
              item.last_message_body=last.deleted_for_all?'message supprimé':(last.body||item.last_message_body||'');
              item.last_message_type=last.message_type||item.last_message_type;
              item.last_message_view_once=false;
            }
            return {item:item,profile:(pair&&pair.profile)||{}};
          });
          writeConversationPairsCache(next);
        }catch(e){}
      }

      chatBody.addEventListener('click', e => {
        const msg = e.target.closest('.once-message');
        if(!msg || !chatBody.contains(msg)) return;
        if(e.target.closest('.more-btn')) return;
        if(msg.classList.contains('voice-message')) return;
        const kind=String(msg.dataset.viewOnceKind||msg.dataset.messageType||'').toLowerCase();
        if(kind==='text' || kind==='sticker' || kind==='system') return;
        if(e.target.closest('.file-card')) consumeViewOnceMessage(msg,'file_open');
      });

      window.addEventListener('keydown', e => {
        if(e.key === 'Escape'){
          if(mediaViewer.classList.contains('active')) closeViewer();
          else if(!chatView.classList.contains('hidden')) closeChat();
        }
      });

      window.addEventListener('beforeunload', () => {
        objectUrls.forEach(url => URL.revokeObjectURL(url));
        objectUrls.clear();
      });
    })();
  