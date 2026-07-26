# HAPPYAD V654 — scroll natif des profils

Base : V653.

Correction ciblée du point 3 :
- suppression des parcours de toutes les cartes pendant chaque événement scroll ;
- suppression des `getComputedStyle()` et `getBoundingClientRect()` répétés pendant le geste ;
- pagination propriétaire et visiteur pilotée par une sentinelle `IntersectionObserver` sous la grille ;
- flèche retour en haut pilotée par l’observation de la 21e carte ;
- l’événement scroll ne fait plus qu’incrémenter un compteur léger ;
- une page supplémentaire ne peut pas se charger plusieurs fois sans nouveau mouvement utilisateur ;
- pagination 9 par 9, squelettes, cartes persistantes et médias V652 conservés ;
- menu V653, zoom V651 et Accueil non modifiés.
