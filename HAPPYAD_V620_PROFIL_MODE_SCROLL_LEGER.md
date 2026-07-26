# HAPPYAD V620 — Profil en mode scroll léger

Base : V619/V618 validée.

## Correction du scroll Profil

- Le profil utilise un mode de travail léger uniquement pendant le défilement.
- Les `setInterval` et `MutationObserver` du module Profil sont suspendus pendant le geste.
- Ils reprennent après 190 ms sans nouvel événement de scroll.
- Si l’utilisateur recommence immédiatement à défiler, le délai est annulé et relancé : aucun double démarrage, aucun conflit.
- Le seuil compact de l’en-tête et les onglets sticky restent fonctionnels pendant le geste.
- À l’arrêt, une seule synchronisation regroupée est exécutée.

## Cartes du Profil

- La grille reste sur 3 colonnes.
- La largeur ne change pas.
- Le ratio passe de 1:1 à 4:5 pour donner légèrement plus de hauteur.
- Les médias restent recadrés avec `object-fit: cover`.
- Mon profil et Profil visiteur utilisent exactement la même géométrie.

## Fichiers actifs

- `core/module-lifecycle-master-v620.js`
- `core/profile-master-v620.js`
- `modules/css/profile-master-v620.css`

Les autres modules conservent leur cycle de vie V614 afin de limiter la portée de la correction au Profil.
