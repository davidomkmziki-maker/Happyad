# HAPPYAD V828 — Galerie vidéo et Accueil stable

Base : V827.

Corrections ciblées :
- la miniature choisie depuis Mon profil est attachée à la vidéo Marketplace correspondante ;
- elle ne devient plus un quatrième média ;
- le nombre de médias reste inchangé ;
- la fiche Annonces ne force plus `video/mp4` et réutilise le lecteur multi-source V827 ;
- les annonces choisies pour l’Accueil sont fusionnées à chaque lecture Supabase, indépendamment de la pagination sociale ;
- elles sont conservées dans le cache confirmé, le snapshot de démarrage et le cache de session ;
- les nouvelles publications Marketplace entrent immédiatement dans ces caches ;
- les types MIME envoyés au Storage sont déduits de l’extension lorsque Android fournit un type vide ou générique.

Aucun SQL supplémentaire n’est requis.
