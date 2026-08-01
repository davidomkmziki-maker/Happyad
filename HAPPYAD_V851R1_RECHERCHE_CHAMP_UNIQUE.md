# HAPPYAD V851R1 — Recherche Annonces avec champ visuel unique

Date : 1 août 2026
Base : `HAPPYAD_V851_POINT1_RECHERCHE_MANUELLE_ANNONCES.zip`

## Correction ciblée

La recherche manuelle fonctionnait, mais le style global `input:focus` ajoutait une ombre bleue arrondie au champ `#marketSearchInput`. Cette ombre apparaissait à l'intérieur du conteneur `.market-search-shell` et donnait visuellement deux champs superposés.

V851R1 applique uniquement la correction visuelle suivante :

- suppression forcée de la bordure, du fond, du rayon et de l'ombre du champ interne ;
- neutralisation explicite des états `:focus` et `:focus-visible` du champ interne ;
- conservation d'un seul contour de focus sur `.market-search-shell` ;
- conservation complète de la recherche, des catégories, du filtrage, de la pagination et des cartes.

## Fichiers modifiés

- `modules/happyad-chat.html`
- `core/chat-integration-master-v795.js`
- `service-worker.js`
- `index.html`

## Cache

- Service Worker : `happyad-pwa-V851R1-market-search-single-field-20260801-1`
- URL Chat : `modules/happyad-chat.html?v=851r1-market-search-single-field`
- Les caches persistants Messages et Push sont conservés.

## Contrôles effectués

- syntaxe de `service-worker.js` valide ;
- syntaxe de `core/chat-integration-master-v795.js` valide ;
- script interne de `modules/happyad-chat.html` valide ;
- 57 scripts internes de `index.html` valides ;
- test Chromium : le champ interne a `border: 0`, `box-shadow: none`, fond transparent et rayon nul ;
- un seul contour reste visible sur le conteneur complet ;
- recherche Bunia et Samsung S21 toujours fonctionnelle ;
- catégories immobiles à l'ouverture du champ ;
- aucune erreur JavaScript pendant le test.

Aucun SQL nécessaire. Les points 2, 3 et 4 des barres fixes ne sont pas encore modifiés.
