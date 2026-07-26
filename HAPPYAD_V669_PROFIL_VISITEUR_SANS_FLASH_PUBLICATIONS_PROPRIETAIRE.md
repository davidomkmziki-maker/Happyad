# HAPPYAD V669 — Profil visiteur sans flash des publications propriétaire

Base stricte : V668, elle-même issue de la V665 validée.

Correction ciblée :
- verrou de premier affichage activé dans le `<head>` avant tout rendu du Profil ;
- sur une route `public=1&uid=...`, `profilePostsList` de Mon profil est masqué définitivement ;
- la zone Publications reste invisible jusqu’à son remplacement par le squelette du bon UID ;
- le verrou est libéré seulement après association de `publicationsBox` à l’UID demandé ;
- un garde DOM retire toute recréation tardive de la grille propriétaire avant le prochain rendu écran.

Parties inchangées :
- chargement visiteur à la demande V668 ;
- cache visiteur strict par UID ;
- fullscreen et retour stable V668 ;
- zoom V662 ;
- scroll et isolation légère de la base V665.
