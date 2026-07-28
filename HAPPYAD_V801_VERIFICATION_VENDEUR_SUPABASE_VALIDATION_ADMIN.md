# HAPPYAD V801 — Vérification vendeur Supabase validée par administrateur

Base conservée : `HAPPYAD_V800_AUDIT_CONFLITS_CHAMPS_VERIFICATION_PRODUITS.zip`.

## Correction isolée

La demande de vérification vendeur du Chat est maintenant connectée à Supabase.

- documents chargés dans le bucket privé `happyad-verification-private` ;
- aucune URL publique n'est créée ;
- demande enregistrée dans `happyad_seller_verification_requests` ;
- statut initial obligatoire : `pending` ;
- un utilisateur ne peut pas avoir deux demandes actives ;
- seul un compte administrateur `OWNER`, `SUPERADMIN` ou `ADMIN` peut approuver ou refuser ;
- garde-fou compatible avec `happyad_admin_is_allowed()`, `happyad_admin_users` et les rôles de `profiles` ;
- décision admin : `approved` ou `rejected` ;
- le statut est renvoyé au Chat et synchronisé en Realtime ;
- en cas de refus, le motif admin est affiché et l'utilisateur peut soumettre un nouveau dossier ;
- la publication d'une offre reste bloquée tant que le statut n'est pas `approved`.

## SQL à exécuter avant le test

`SUPABASE_HAPPYAD_V801_VERIFICATION_VENDEUR_ADMIN.sql`

Le SQL crée :

- la table des demandes ;
- le bucket privé et ses règles RLS ;
- la fonction d'envoi utilisateur ;
- la fonction de lecture du statut personnel ;
- la fonction de contrôle vendeur vérifié ;
- la liste sécurisée pour la future page Admin ;
- la fonction admin d'approbation ou de rejet ;
- la diffusion Realtime des changements de statut.

## Fonctions Admin préparées

- `happyad_admin_list_seller_verifications_v1(status, limite)`
- `happyad_admin_decide_seller_verification_v1(request_id, decision, note)`

Valeurs de décision autorisées :

- `approved`
- `rejected`

## Fichiers ajoutés ou corrigés

- `core/seller-verification-supabase-master-v801.js`
- `core/chat-integration-master-v795.js`
- `modules/happyad-chat.html`
- `index.html`
- `service-worker.js`
- `SUPABASE_HAPPYAD_V801_VERIFICATION_VENDEUR_ADMIN.sql`

## Éléments conservés

- sticker V799/V800 ;
- seule la bouche du sticker est animée ;
- Accueil et Stories inchangés ;
- bouton `📍 Annonces` inchangé ;
- compatibilité Chrome/Google V795 conservée ;
- centrale Annonces et vrai maître Messages conservés ;
- Publication Produit reste préparée mais n'est pas encore connectée à Supabase dans cette étape.
