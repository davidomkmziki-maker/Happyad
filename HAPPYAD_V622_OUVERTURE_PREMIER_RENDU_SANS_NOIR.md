# HAPPYAD V622 — ouverture au premier rendu sans écran noir

## Correction ciblée

- La page actuellement visible reste affichée pendant la première préparation d’un module.
- Une nouvelle iframe n’est montrée qu’après son premier rendu utilisable.
- Les onglets permanents Vidéo, Messages, Mon profil et Publication suivent désormais cette règle.
- Photo et Carte utilisent un signal léger après leur premier paint.
- Le Profil visiteur conserve son squelette dédié.
- Notifications ne montre plus son calque sombre avant le signal `HAPPYAD_NOTIFICATION_CENTER_READY`.
- Les pages déjà ouvertes restent en mémoire et se réaffichent immédiatement.
- Le Service Worker passe à V622 afin de supprimer les anciens caches d’interface.

## Fichiers maîtres actifs

- `core/navigation-master-v622.js`
- `core/internal-return-master-v622.js`
- `core/frame-first-render-v622.js`

Aucune quantité de publications ni logique de données n’a été modifiée dans cette étape.
