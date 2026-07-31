# HAPPYAD V848 — Moteur unifié 9 axes et multi-demandes sans perte

Base stricte : `HAPPYAD2.zip` / candidate V844 fournie par l’utilisateur.

## Connexion Supabase

- Compréhension : `happyad_chat_understand_v3` — V846R1 validée 12/12.
- Décomposition : `happyad_chat_decompose_requests_v2` — V847.
- Batch : `happyad_chat_search_batch_v2` — V847.
- Recherche/scoring : `happyad_chat_search_posts_v2` — V845R1.

## Corrections du ZIP

- Le score Supabase devient l’unique pourcentage affiché.
- Suppression du mélange ancien `72 % serveur + 28 % local`.
- Les neuf axes et leurs détails sont conservés sur chaque résultat.
- Les priorités dynamiques sont conservées sur chaque résultat.
- Jusqu’à 12 demandes sont conservées et exécutées dans l’ordre.
- Plus de suppression silencieuse après la sixième demande.
- Au-delà de 12 demandes, le Chat demande de diviser le message sans lancer une recherche tronquée.
- La clarification finale produite par V847 est affichée telle quelle.
- Une requête riche Nissan/camion/diesel reste une seule demande.
- Cache renouvelé en V848 sans supprimer les caches persistants des messages et du Push.

## Périmètre non modifié

Médias, vidéo, Accueil, publication, profils, Messages, Push, Assistance et vérification vendeur restent identiques à la base reçue.

## Pré-requis

Les SQL V845, V845R1, V846, V846R1 et V847 doivent rester installés dans Supabase. Ils ont été exécutés et validés avant la création de ce ZIP.
