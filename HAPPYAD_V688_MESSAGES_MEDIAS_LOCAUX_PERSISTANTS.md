# HAPPYAD V688 — Messages : médias locaux persistants

Base : V687 validée.

## Zone corrigée
- `modules/message-center.html`
- nettoyage de caches dans `index.html`, `modules/user.html` et `core/cache.js`
- `service-worker.js`

## Corrections
1. Les photos, vidéos, audios et fichiers ordinaires téléchargés restent dans le stockage local privé du navigateur (Cache Storage + métadonnées IndexedDB), isolé par UID.
2. Les nettoyages PWA, changements de version et déconnexion ne suppriment plus le cache binaire `happyad-message-media-v1`.
3. À l’ouverture d’une conversation, HAPPYAD vérifie le stockage local avant d’afficher un nouveau bouton Télécharger.
4. Le Blob local est restauré silencieusement et une nouvelle URL locale est créée après fermeture ou redémarrage.
5. Si le fichier a réellement été supprimé par Android ou manque dans le cache, l’état local est retiré silencieusement et le téléchargement est proposé normalement.
6. Les fichiers de taille nulle ne sont plus considérés comme des médias valides.
7. Les vues uniques restent exclues de tout stockage persistant.

Aucun SQL supplémentaire.
