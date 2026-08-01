# HAPPYAD V851R4 — Assistance : lecture des anciens échanges stable

Base utilisée : `HAPPYAD_V851R3_ASSISTANCE_ACTIONS_RESTAUREES.zip`.

## Défaut corrigé

Dans Assistance, lorsqu’un utilisateur remontait manuellement dans les anciens échanges, le fil revenait tout seul au dernier message.

## Cause exacte

Le maître clavier parent envoie régulièrement `HAPPYAD_KEYBOARD_VIEWPORT_V851R2` à l’iframe Assistance, notamment pendant les variations du viewport Android. Le gestionnaire Assistance exécutait systématiquement :

```js
chat.scrollTop = chat.scrollHeight - chat.clientHeight;
```

Chaque signal de viewport ramenait donc le lecteur au bas du fil, même sans nouveau message et même pendant un scroll manuel.

## Correction V851R4

- Suppression du retour forcé au dernier message à chaque signal de viewport.
- La position du lecteur n’est recalculée que si la hauteur ou l’état du clavier change réellement.
- Si l’utilisateur lit les anciens échanges, son `scrollTop` est conservé.
- Si l’utilisateur était déjà près du dernier message, le bas reste ancré lors de l’ouverture ou fermeture du clavier.
- Une protection temporelle empêche une correction automatique pendant un geste de scroll actif.
- `overflow-anchor` est neutralisé sur le fil Assistance pour éviter un second réancrage automatique du navigateur.
- Les actions restaurées en V851R3 restent inchangées : archives, retour, nouvelle discussion et Voir mes demandes.

## Fichiers modifiés

- `modules/assistance.html`
- `core/assistance-integration-master-v738.js`
- `index.html`
- `service-worker.js`

Aucun SQL. Aucun changement dans le Chat HAPPYAD, Messages, Marketplace, médias ou Supabase.

## Cache

Service Worker : `happyad-pwa-V851R4-assistance-scroll-stable-20260801-1`.
