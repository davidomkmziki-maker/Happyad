# HAPPYAD V653 — Menu inférieur : retour automatique

Base : V652.

Correction ciblée :
- le menu peut se masquer pendant un scroll vers le bas ;
- il revient automatiquement après 460 ms sans scroll ;
- dans la Centrale vidéo, le menu est forcé visible dès que la frame active, sa route, son chargement ou la lecture vidéo est détecté ;
- un ancien état caché est retiré à la navigation, au retour de visibilité et au pageshow.

Non modifié : médias Profil visiteur V652, zoom Profil V651, scroll Profil, pagination, démarrage Accueil.
