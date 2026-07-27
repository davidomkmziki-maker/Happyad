# HAPPYAD V785 — AVATAR RÉEL DE L’EXPÉDITEUR DANS LE PUSH

## Base
Cette version repart uniquement de `HAPPYAD_V784_MON_PROFIL_9_PUBLICATIONS_INITIALES_PAGINATION.zip`.

## Correction isolée — Point 1
- L’UID authentifié de l’expéditeur reste la source officielle.
- Recherche de la ligne d’identité dans `profiles` par `id`, puis anciens champs compatibles (`user_id`, `uid`, `auth_user_id`, `auth_id`, `account_uid`, `profile_id`).
- Compatibilité de secours avec `happyad_profiles`, `happyad_presence` et les métadonnées Auth.
- Lecture de toutes les colonnes photo réellement utilisées par HAPPYAD.
- Correction principale : `avatars/...`, `profile-photos/...` et `profile-images/...` sont d’abord traités comme des dossiers du bucket officiel `happyad-media`, et non comme des buckets séparés.
- Vérification de l’URL image avant l’envoi ; prise en charge d’une URL signée si le bucket est privé.
- Le payload contient maintenant la source, la colonne et l’état de résolution de l’avatar.
- Le Service Worker précharge la photo et la conserve dans un cache local dédié avant l’affichage.
- Si Android refuse les actions de notification, un deuxième essai conserve la même photo réelle au lieu de revenir immédiatement au logo HAPPYAD.
- Le logo HAPPYAD n’est utilisé à gauche qu’après échec réel de la photo ; la raison est enregistrée dans `last-avatar-fallback`.

## Fichiers principaux
- `SUPABASE_EDGE_FUNCTION_HAPPYAD_PUSH_PRODUCTION_V785.ts`
- `supabase/functions/happyad-push-test/index.ts`
- `service-worker.js`
- `index.html`

## Déploiement obligatoire
La fonction Supabase déployée `happyad-push-test` doit être remplacée par le contenu de :
`SUPABASE_EDGE_FUNCTION_HAPPYAD_PUSH_PRODUCTION_V785.ts`

Ensuite, déployer le site V785 sur Netlify. Aucun nouveau SQL n’est nécessaire pour ce point.

## Non modifié
- Livraison Push et endpoints actifs.
- Activation volontaire des notifications.
- Messages lus, Realtime, Stories, Accueil et Mon profil.
- Points 2 à 5, qui seront traités séparément.
