# HAPPYAD V838 — ANNONCES ACTIVES ET RÉPONSES NATURELLES

- Exclut les publications supprimées (`deleted_at IS NOT NULL`) de la recherche Supabase.
- Le Chat ne réutilise plus une annonce absente de la réponse serveur active.
- Les identifiants supprimés localement sont exclus immédiatement avant synchronisation.
- Une demande générique de téléphone accepte iPhone, Samsung et autres smartphones comme résultats exacts si la ville correspond.
- Corrige les formulations « véhicule véhicule » et « telephone » sans accent.
- Conserve V837 pour les couvertures vidéo et l'arrêt audio.
