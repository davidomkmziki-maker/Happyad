# HAPPYAD V646 — Étape 3 : cartes Profil persistantes

## Correction ciblée
- Suppression de la virtualisation CSS `content-visibility:auto` sur les cartes, images et vidéos des deux profils.
- Mon profil conserve son rendu différentiel V638 et les mêmes nœuds DOM.
- Profil visiteur ne remplace plus toute la grille pendant une pagination : les cartes existantes sont réutilisées par `data-post-id`.
- Les médias déjà chargés sont conservés lorsque leur signature n'a pas changé.
- La position interne d'un album, les actions locales et l'état visuel d'une carte ne sont plus perdus lors de l'ajout d'une nouvelle page.

## Non modifié
- Contrôleur de scroll V645.
- Seuil de la flèche retour en haut.
- Pagination 9 par 9 et curseurs Supabase V627.
- Fullscreen photo/zoom.
- Stories, compteurs et navigation.
