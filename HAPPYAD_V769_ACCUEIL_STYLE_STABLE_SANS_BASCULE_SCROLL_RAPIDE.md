# HAPPYAD V769 — Accueil : style stable sans bascule pendant le scroll rapide

## Correction isolée du point 4

- Suppression de la classe globale `haHomeFastScrollV696`.
- Suppression de la détection de vitesse qui modifiait toutes les cartes pendant le scroll.
- Les ombres, transitions, animations et pseudo-éléments ne sont plus désactivés puis réactivés après 150 ms.
- Aucun listener `scroll` supplémentaire ne reste dans le prépeint.
- L’IntersectionObserver des cartes proches, l’hydratation média unique et la protection scrollBy restent inchangés.
- Service Worker mis à jour en V769.

## Périmètre intact

Pagination, Radar, Sponsor, compteurs, profils, messages, vidéos, assistance, administration et Supabase non modifiés.
