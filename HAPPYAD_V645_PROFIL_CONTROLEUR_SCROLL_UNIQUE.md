# HAPPYAD V645 — Contrôleur de scroll unique du profil

## Correction ciblée

- Suppression de l’écouteur vertical propre à la pagination de Mon profil.
- Suppression de l’écouteur vertical propre à la pagination du Profil visiteur.
- La flèche retour en haut et les deux paginations utilisent désormais un seul contrôleur vertical V645.
- Le contrôleur sélectionne automatiquement la pagination propriétaire ou visiteur selon la route `public=1`.
- La vérification de pagination reste différée de 70 ms et conserve les protections de chargement V627.
- Le seuil de la flèche reste fixé après la 7e ligne, soit 21 cartes sur une grille de trois colonnes.

## Éléments non modifiés

- En-tête statique validé en V644.
- Pagination par lots de 9 et curseurs Supabase V627.
- Menu inférieur V618.
- Fullscreen photo, zoom, albums, stories, compteurs et navigation.
