# HAPPYAD V830 — lecture automatique et chargement Marketplace léger

Base : `HAPPYAD_V828_GALERIE_VIDEO_ACCUEIL_STABLE.zip`.

## Corrections ciblées

1. Les vidéos d’annonce démarrent automatiquement lorsqu’elles sont ouvertes en plein écran dans la galerie Marketplace.
2. Une vidéo ouverte depuis une carte de l’Accueil est ciblée puis lancée automatiquement dans la centrale Vidéo.
3. La centrale Annonces ne charge plus 500 annonces au démarrage. Elle prépare immédiatement au maximum 3 annonces par catégorie.
4. Les annonces choisies comme couverture Accueil (`marketplace_show_on_home`) sont prioritaires, puis les annonces avec média réel, puis les plus récentes.
5. Le reste d’une catégorie est récupéré uniquement après une action explicite « Voir plus ».
6. Le bouton « Voir plus » du Chat ouvre la catégorie correspondante et charge alors ses autres annonces.
7. L’ouverture directe d’une annonce inconnue ne recharge plus toutes les annonces : seule l’annonce demandée est recherchée.

Aucun SQL supplémentaire n’est requis.
