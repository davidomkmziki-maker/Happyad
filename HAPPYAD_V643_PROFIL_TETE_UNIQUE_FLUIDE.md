# HAPPYAD V643 — Profil : tête unique et réduction naturelle

## Correction ciblée
- Suppression du petit en-tête cloné `happyadProfileCompactMasterV569`.
- Le véritable en-tête de Mon profil / Profil visiteur devient sticky et se réduit progressivement.
- Aucun second avatar, aucune duplication du nom ou des statistiques.
- Aucun `MutationObserver`, `ResizeObserver` ou écriture de style à chaque frame pour cette réduction.
- Animation liée directement au scroll du navigateur ; fallback à seuil avec hystérésis sur navigateur ancien.
- Le bouton retour réel reste visible.

## Zones volontairement non modifiées
- Pagination 9 par 9.
- Récupération Supabase et compteurs.
- Stories.
- Cartes publications.
- Fullscreen photo / zoom.
- Navigation générale.

## Fichiers actifs
- `core/profile-master-v643.js`
- `modules/css/profile-master-v643.css`
- `modules/user.html` référence uniquement V643 pour le maître profil.
