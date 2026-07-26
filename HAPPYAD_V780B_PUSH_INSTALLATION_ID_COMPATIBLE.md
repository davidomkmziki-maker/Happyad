# HAPPYAD V780B — Push `installation_id` compatible

## Erreur corrigée

La table historique `happyad_push_subscriptions` contient une colonne obligatoire `installation_id`, alors que la RPC V776B/V780 insérait uniquement `device_id`.

Le navigateur envoyait déjà correctement `p_installation_id`. L'erreur se produisait uniquement au moment de l'INSERT SQL :

`null value in column "installation_id" violates not-null constraint`

## Correction

- Conservation de `installation_id` et `device_id`.
- Les deux colonnes reçoivent le même identifiant réel de l'installation active.
- Normalisation des anciennes lignes.
- Recréation ciblée de `happyad_push_register_subscription`.
- Recréation ciblée de `happyad_push_cleanup_own_subscriptions`.
- Conservation de la règle d'un seul endpoint actif par compte.
- Aucun changement dans le JavaScript, le Service Worker ou l'Edge Function V779.

## Fichier à exécuter maintenant

`SUPABASE_HAPPYAD_PUSH_V780B_REPARATION_INSTALLATION_ID.sql`

Ce fichier suffit lorsque le SQL V776B a déjà été exécuté.

## Résultats attendus

- `installation_id` : `text`, `NO`
- `device_id` : `text`, `NO`
- `invalid_installation_ids = 0`
- `invalid_device_ids = 0`
- `accounts_with_conflict = 0`

Après le SQL, attendre quelques secondes, revenir dans HAPPYAD et toucher **Réenregistrer ce lien**. Aucun redéploiement Netlify ou Edge Function n'est nécessaire pour cette réparation.
