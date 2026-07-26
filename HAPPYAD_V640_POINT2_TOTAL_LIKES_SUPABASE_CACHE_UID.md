# HAPPYAD V640 — Point 2 : total J’aime Supabase

- Le total J’aime du profil n’est plus additionné depuis les 9/18 cartes visibles.
- Supabase est la source de vérité pour toutes les publications du compte.
- Cache local séparé par UID pour l’affichage immédiat.
- Réconciliation silencieuse avec Supabase, y compris après Like/Unlike et Realtime.
- RPC SQL optimisée pour les comptes avec beaucoup de publications ; fallback intégré si le SQL n’est pas encore exécuté.
- Aucun changement aux cartes vidéo V639, albums, pagination, fullscreen, zoom ou Stories.
