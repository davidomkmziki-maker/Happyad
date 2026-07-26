# HAPPYAD V639 — Point 1 : cartes vidéo du profil

Base : V638 validée.

Correction ciblée :
- validation réelle des miniatures vidéo avant affichage ;
- essai séquentiel des différentes miniatures disponibles ;
- si toutes sont invalides, affichage de la première image réelle de la vidéo ;
- état de chargement conservé jusqu’au chargement réel ;
- aucun pictogramme d’image cassée ;
- aperçu vidéo en `preload=metadata`, sans lecture automatique ;
- aucune modification des albums, de la pagination, du fullscreen, du zoom, des Stories ou des compteurs.
