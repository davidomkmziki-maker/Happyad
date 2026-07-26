# HAPPYAD V633 — Chemin Story persistant et réouverture multiple

Correction ciblée uniquement sur la réouverture de la Story.

- Le lecteur fullscreen Story est créé une seule fois et reste monté après fermeture.
- La fermeture masque le lecteur sans supprimer ses commandes ni ses médias maîtres.
- Le cercle Radar appelle toujours le même point d’entrée `openOwner()`.
- Le nettoyeur global des anciens boutons Retour ignore explicitement les commandes du lecteur Story.
- Le bouton de fermeture n’utilise plus `aria-label="Retour"`, afin de ne pas être supprimé.
- `ensureViewer()` vérifie et restaure localement les commandes manquantes sans interrompre l’ouverture.
- Le cercle, sa taille, son état vu, le zoom, la pagination et les ouvertures directes des pages ne sont pas modifiés.
