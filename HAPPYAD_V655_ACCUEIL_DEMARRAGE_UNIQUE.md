# HAPPYAD V655 — Accueil démarrage unique

Base : V654 validée.

## Correction ciblée

- Un seul démarrage `loadPosts()` actif à la fois.
- Une seule promesse Supabase partagée pour les publications de l’Accueil.
- `pageshow`, `focus` et `visibilitychange` ne relancent plus une synchronisation pendant le démarrage initial.
- Les refreshs simultanés après démarrage partagent également une seule promesse.
- Suppression du `location.reload()` automatique lors du changement de service worker.
- Cache PWA renouvelé en V655.

## Parties non modifiées

- Profil V654 et pagination par sentinelles.
- Médias Profil visiteur V652.
- Zoom Profil V651.
- Menu inférieur V653.
- Fullscreens, stories, vidéos et compteurs.
