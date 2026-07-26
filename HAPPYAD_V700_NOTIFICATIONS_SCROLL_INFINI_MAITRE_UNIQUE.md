# HAPPYAD V700 — Notifications scroll infini maître unique

Base : HAPPYAD V699.

## Zone modifiée
- Centre Notifications uniquement.
- Maître Supabase Notifications et cache PWA associés.

## Corrections
- Un seul maître de scroll vertical : `core/notification-infinite-scroll-master-v700.js`.
- Le titre, le bouton Retour, le bouton Filtre et la rangée des catégories restent fixes.
- Seule la liste des notifications défile verticalement.
- La barre de défilement verticale est entièrement masquée sur Android et navigateurs compatibles.
- Chargement progressif par tranches : 12 notifications au premier rendu, puis 10 supplémentaires à l’approche du bas.
- État séparé pour chaque filtre : Toutes, Likes, Abonnés, Commentaires, Favoris, Activité et Système.
- Chaque filtre conserve sa propre position et le nombre de notifications déjà rendu.
- Pagination Supabase silencieuse au-delà des 100 premières lignes, jusqu’à 500 lignes en mémoire.
- Les nouvelles notifications Realtime restent ajoutées en tête sans casser le scroll courant.
- Aucun changement des routes d’ouverture des publications, Stories ou profils.

## SQL
Aucun nouveau SQL nécessaire.

## Fichiers principaux
- `core/notification-master-v700.js`
- `core/notification-infinite-scroll-master-v700.js`
- `modules/notification-center.html`
- `core/internal-return-master-v694.js`
- `index.html`
- `service-worker.js`
