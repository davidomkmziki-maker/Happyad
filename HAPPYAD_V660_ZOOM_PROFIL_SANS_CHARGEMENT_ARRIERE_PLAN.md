# HAPPYAD V660 — Zoom Profil sans chargement arrière-plan

Base : V659.

- Le fullscreen photo Profil pose un verrou léger pendant son ouverture.
- Pagination Mon profil / Profil visiteur suspendue pendant le fullscreen.
- Les rendus de cartes terminés en arrière-plan sont mémorisés puis appliqués après fermeture.
- Les médias différés et la préparation des vidéos attendent la fermeture.
- Les MutationObserver et intervalles gérés par le cycle de vie sont temporairement suspendus.
- Le zoom V651, le scroll horizontal de l’album, l’Accueil et les 9 cartes initiales restent inchangés.
