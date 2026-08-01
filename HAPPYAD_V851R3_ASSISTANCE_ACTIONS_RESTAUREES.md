# HAPPYAD V851R3 — Actions Assistance restaurées

Base utilisée : `HAPPYAD_V851R2_CLAVIER_TROIS_RANGEES_DEPUIS_V851R1.zip`.
Cette base provient elle-même exclusivement de V851R1. Les corrections clavier validées sont conservées.

## Défaut confirmé

Le bloc CSS V851R2 appliquait `display:grid!important` simultanément à :

- `#chatPage.app` ;
- `#requestsPage.requests-page`.

Cette règle plus spécifique annulait :

- `.page-hidden { display:none!important; }` ;
- `.requests-page.show { display:grid; }`.

Les fonctions JavaScript étaient encore présentes, mais leurs changements de classes ne pouvaient plus changer réellement de page. Le menu des archives semblait donc inactif.

## Correction

- `#chatPage` reste en grille uniquement quand il ne possède pas `.page-hidden`.
- `#requestsPage` reste masqué par défaut.
- `#requestsPage.show` devient la seule page d’archives visible.
- La zone correcte des archives est `.requests-content`, et non `.requests-body`.
- Les boutons Assistance reçoivent explicitement `pointer-events:auto` et `touch-action:manipulation`.
- `Commencer une nouvelle discussion` appelle maintenant une action unique qui crée la discussion, restaure la page Chat et replace le fil en bas.
- Le comportement clavier V851R2 reste inchangé.

## Cache renouvelé

Service Worker :

`happyad-pwa-V851R3-assistance-actions-restored-20260801-1`

Module Assistance :

`modules/assistance.html?v=851r3-assistance-actions`

Aucun SQL nécessaire.
