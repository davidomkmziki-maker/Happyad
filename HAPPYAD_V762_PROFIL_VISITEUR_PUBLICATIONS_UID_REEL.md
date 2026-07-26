# HAPPYAD V762 — Profil visiteur : publications par UID réel

Base : `HAPPYAD_V761_MESSAGES_BADGES_UID_STRICT.zip`

## Point corrigé

Certains Profils visiteurs affichaient uniquement les squelettes ou indiquaient zéro publication alors que leurs publications existaient dans `happyad_posts`.

## Correction ciblée

- `user_id` reste la colonne propriétaire prioritaire.
- Lorsqu'aucune publication n'est trouvée par `user_id`, le Profil visiteur recherche les anciens comptes par `creator_id`, `owner_id`, `author_id`, `auth_user_id` et `account_uid`.
- Tous les UID propriétaires réellement présents dans une ligne sont conservés pendant la normalisation du post.
- Une publication est acceptée uniquement si au moins un de ses vrais champs propriétaires correspond à l'UID du visiteur ouvert.
- La pagination continue ensuite avec la colonne propriétaire réellement trouvée pour ce profil.
- Le compteur Publications utilise la même résolution UID.
- Une erreur réseau ou une colonne ancienne indisponible ne peut plus enregistrer à tort le profil comme vide pendant 24 heures.
- Les anciens caches « profil vide » et les compteurs zéro potentiellement erronés sont nettoyés une seule fois, sans supprimer les publications ni les médias.

## Protections conservées

- Isolation du Profil visiteur V758 intacte.
- Avatars Messages V759 intacts.
- Badges Messages stricts V761 intacts.
- Aucun changement dans l'Accueil, le scroll, l'Assistance, l'Admin ou le SQL Supabase.
