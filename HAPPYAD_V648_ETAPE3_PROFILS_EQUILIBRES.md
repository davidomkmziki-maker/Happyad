# HAPPYAD V648 — Étape 3 : profils équilibrés

Base : V647 validée.

## Corrections ciblées

- Mon profil conserve son signal `happyad:profile-posts-rendered`.
- Profil visiteur émet désormais le même signal après une modification réelle de sa grille.
- La flèche retour en haut et le contrôleur de pagination recalculent donc correctement après les pages visiteur.
- Les requêtes Supabase d’état d’abonnement ne sont plus relancées à chaque pagination/rendu visiteur.
- Une seule requête est partagée si plusieurs rendus arrivent ensemble, avec une fenêtre locale de 60 secondes par UID.
- Les boutons S’abonner et Message restent reliés à chaque rendu.

## Parties non modifiées

- pagination 9 par 9 ;
- cartes persistantes V646 ;
- squelettes V647 ;
- scroll unique ;
- en-tête statique ;
- stories, compteurs et fullscreen photo.
