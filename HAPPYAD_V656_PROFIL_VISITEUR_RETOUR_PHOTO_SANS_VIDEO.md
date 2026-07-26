# HAPPYAD V656 — Profil visiteur : retour photo sans bascule vidéo

Base : V655.

Corrections ciblées :
- les rappels différés d’une ancienne frame ne peuvent plus reprendre l’écran ;
- une frame Profil visiteur naviguée par erreur vers une vidéo est détectée et rechargée comme profil ;
- la fermeture du fullscreen restaure explicitement la frame Profil active et masque la frame Vidéo ;
- les cartes vidéo du Profil passent uniquement par le routeur parent, jamais par `location.href` dans l’iframe ;
- protection de 900 ms après fermeture photo contre un clic résiduel sur une carte vidéo.

Accueil V655, scroll V654, menu V653, médias V652 et zoom V651 conservés.
