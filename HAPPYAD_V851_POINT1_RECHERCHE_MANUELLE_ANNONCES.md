# HAPPYAD V851 — Point 1 : recherche manuelle dans Annonces

Base : `HAPPYAD3.zip` (V850).

## Correction appliquée
- Conservation de « HAPPYAD Marketplace ».
- Suppression visuelle de « Toutes les annonces ».
- Suppression du compteur d’annonces.
- Suppression du bouton orange Ajouter/+ de la barre.
- Ajout d’un bouton loupe SVG compact.
- Ajout d’un champ de recherche manuelle indépendant du moteur IA.
- Recherche dans le titre, la description, la catégorie, le lieu, le vendeur et les champs structurés disponibles.
- Respect de la catégorie horizontale sélectionnée.
- Fermeture du champ après validation, avec résultats conservés.
- Réouverture possible pour modifier ou effacer la recherche.
- Chargement du reste des annonces avant finalisation d’une recherche lorsque nécessaire.
- `renderMarketOffers()` ne dépend plus de `#marketTotal`.

## Cache
- Service Worker renouvelé : `happyad-pwa-V851-market-manual-search-20260801-1`.
- URL du module Chat et du maître d’intégration renouvelée en V851.
- Caches persistants Messages/Push conservés.

## Hors périmètre
- Les points 2, 3 et 4 sur les barres fixes ne sont pas encore appliqués.
- Aucun SQL.
