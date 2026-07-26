# HAPPYAD V761 — Messages : badges stricts par UID

Base : `HAPPYAD_V760_MESSAGES_BADGES_UID_RECUPERATION.zip`

## Régression corrigée

V760 interprétait les indicateurs génériques `is_verified` / `verified` comme un badge bleu. Ces indicateurs peuvent seulement signifier que le compte ou l’adresse a été vérifié, ce qui attribuait un badge à presque tous les correspondants.

## Correction ciblée

- Un badge est affiché uniquement lorsqu’un champ de badge explicite du profil contient une valeur reconnue.
- Les indicateurs génériques `is_verified`, `verified`, `is_certified` et `certified` ne créent plus de badge.
- Lorsqu’une ligne `profiles` est retrouvée et ne possède aucun badge officiel, un ancien badge erroné venant de la conversation ou du cache est supprimé.
- La recherche par `profiles.id` et `profiles.user_id` reste active pour les anciens comptes.
- Les badges bleu et violet réellement présents sont conservés.

## Protections conservées

- Protection des avatars V759 intacte.
- Isolation du Profil visiteur V758 intacte.
- Aucun changement dans l’Accueil, l’Assistance, l’Admin ou le SQL Supabase.
