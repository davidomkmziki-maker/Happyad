# HAPPYAD V771 — Accueil : pagination sans reconstruction Radar/Sponsor

Base : `HAPPYAD_V770_ACCUEIL_PAGINATION_SERIE_UNIQUE.zip`

## Correction isolée — point 6

Le rendu principal de l’Accueil accepte désormais un mode interne `feedOnly` réservé à la pagination.

Pendant l’ajout de publications en bas :

- seul le conteneur `#list` est réconcilié ;
- `renderSponsor()` n’est pas appelé ;
- `renderRadarHome()` n’est pas appelé ;
- `bindHomeSearchAndQuickPost()` n’est pas relancé ;
- le Radar et le Sponsor déjà affichés conservent exactement leurs nœuds DOM et leur position ;
- aucune reconstruction d’un bloc situé au-dessus du fil ne peut déplacer les cartes visibles.

Le mode `feedOnly` est appliqué aux trois chemins de pagination :

1. ajout des publications déjà présentes dans le cache local ;
2. ajout d’une nouvelle page distante Supabase ;
3. mise à jour des auteurs après enrichissement de cette page.

Les ouvertures, actualisations complètes, changements réels du fil et mises à jour explicites du Radar conservent le rendu normal du Radar et du Sponsor.

## Éléments conservés

- V766 : protection de `window.scrollBy()` ;
- V767 : hydratation média unique ;
- V768 : cartes proches sans scan global ;
- V769 : style stable pendant le scroll rapide ;
- V770 : pagination en série unique ;
- taille des pages et requêtes Supabase inchangées ;
- Messages, Profils, Vidéos, Notifications, Stories, Assistance et Admin inchangés.

## Cache

Le Service Worker passe en V771 pour forcer la récupération du nouvel `index.html`.
