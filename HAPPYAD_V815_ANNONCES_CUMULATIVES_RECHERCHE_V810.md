# HAPPYAD V815 — annonces cumulatives et recherche V810

Corrections ciblées :

1. Le Chat ne rejette plus les annonces dont la disponibilité est écrite sous forme humaine (`Disponible maintenant`, `Sur commande`, `Sur rendez-vous`, etc.).
2. Supabase est toujours consulté comme source de vérité ; le petit cache local ne peut plus remplacer les anciennes annonces par la dernière publiée.
3. Les événements de publication Produit et toutes catégories déclenchent la recharge complète des annonces.
4. La recherche du Chat appelle maintenant `happyad_chat_understand_v1` puis `happyad_chat_search_posts_v1`, avec 5 annonces maximum par catégorie.
5. Les résultats V810 sont fusionnés avec la centrale existante sans supprimer les annonces déjà chargées.
6. Aucun nouveau SQL n'est requis pour V815.
