# HAPPYAD V851R2 — Clavier en trois rangées depuis V851R1

## Base obligatoire utilisée
- Source unique : `HAPPYAD_V851R1_RECHERCHE_CHAMP_UNIQUE.zip`.
- V852, V853 et V854 non utilisées.
- Recherche manuelle Annonces V851R1 conservée.
- Aucun SQL.

## Problème corrigé
Quand le clavier Android s'ouvrait, Chrome pouvait déplacer l'ensemble de l'iframe : barre haute, messages et saisie. Les calculs `visualViewport` internes ajoutaient ensuite un second redimensionnement.

## Construction V851R2
Chaque espace de saisie est désormais organisé en trois rangées :
1. barre haute locale immobile ;
2. messages, seule zone flexible et scrollable ;
3. saisie au-dessus du clavier.

La page principale :
- utilise `interactive-widget=resizes-content` ;
- verrouille son propre scroll pendant une conversation privée, le Chat ou l'Assistance ;
- applique une hauteur visible unique au conteneur extérieur actif ;
- transmet la même hauteur à l'iframe ;
- utilise `visualViewport` seulement comme solution de repli pour les anciens comportements Chrome.

La liste des Conversations n'est pas forcée en plein écran : le verrouillage spécial s'active uniquement lorsqu'une conversation privée est réellement ouverte, puis se retire au retour à la liste.

## Modules concernés
- `index.html`
- `service-worker.js`
- `core/keyboard-surface-master-v851r2.css` — nouveau maître unique
- `core/keyboard-surface-master-v851r2.js` — nouveau maître unique
- `core/chat-integration-master-v795.js`
- `core/assistance-integration-master-v738.js`
- `core/navigation-master-v668.js`
- `core/main-tabs-master-v615.js`
- `modules/message-center.html`
- `modules/happyad-chat.html`
- `modules/assistance.html`

## Tests exécutés
- Syntaxe Node valide : Service Worker et tous les JavaScript externes modifiés.
- 57 scripts internes de `index.html` valides.
- 4 scripts internes de `message-center.html` valides.
- script interne de `happyad-chat.html` valide.
- 2 scripts internes de `assistance.html` valides.
- Toutes les ressources préchargées par le Service Worker existent.
- Test de géométrie Chromium, hauteur 844 px puis 520 px :
  - Chat : barre haute `top = 6 px` avant et après ; zone messages réduite ; saisie à 520 px.
  - Conversation privée : barre haute `top = 0 px` avant et après ; zone messages réduite ; saisie à 520 px.
  - Assistance : barre haute `top = 6 px` avant et après ; zone messages réduite ; saisie à 513 px avec marge existante conservée.
- Test parent : surface extérieure 844 px puis 520 px, sans déplacement de son sommet.
- Test retour Messages : verrouillage absent dans la liste, actif dans la conversation, retiré au retour à la liste.
- Test restauration du scroll de l'Accueil après fermeture du module.

## Cache
Service Worker :
`happyad-pwa-V851R2-keyboard-rows-from-v851r1-20260801-1`

Caches persistants conservés :
- `happyad-message-media-v1`
- `happyad-push-state-v1`
- `happyad-push-avatar-v2`

## Test final nécessaire après déploiement
Le test Chromium valide la construction et le redimensionnement. Le dernier contrôle reste le véritable clavier Android sur Netlify dans :
1. une conversation privée ;
2. Je cherche ;
3. Assistance administrateurs.
