# HAPPYAD V787 — Avatar réel Push, PNG Android

Base : `HAPPYAD_V786_PUSH_AVATAR_MEME_ORIGINE_ANDROID.zip`

## Correction isolée du point 1

1. Le logo applicatif HAPPYAD est désormais rejeté comme valeur possible de `sender_avatar`.
2. Le navigateur de l’expéditeur joint au Push la photo réellement utilisée dans son identité connectée (`sender_avatar_hint`).
3. La fonction Supabase accepte ce hint uniquement pour l’utilisateur authentifié et revérifie l’URL HTTPS.
4. La recherche Supabase `profiles`, `happyad_profiles`, `happyad_presence` et Auth reste active en secours.
5. Le relais Netlify transforme toute vraie photo en PNG carré 192 × 192 avant de la fournir à Android.
6. La notification utilise une URL HTTPS réelle `/push-avatar/<hash>.png`, jamais une pseudo-URL CacheStorage.
7. Le Service Worker et sa référence sont renouvelés en V787.

## Fichiers principaux modifiés

- `modules/message-center.html`
- `SUPABASE_EDGE_FUNCTION_HAPPYAD_PUSH_PRODUCTION_V787.ts`
- `supabase/functions/happyad-push-test/index.ts`
- `service-worker.js`
- `netlify/functions/happyad-push-avatar.js`
- `_redirects`
- `netlify.toml`
- `index.html`
- `manifest.webmanifest`

## Déploiement obligatoire

Le ZIP doit être déployé sur Netlify **et** la fonction Supabase `happyad-push-test` doit être remplacée par :

`SUPABASE_EDGE_FUNCTION_HAPPYAD_PUSH_PRODUCTION_V787.ts`

Sans la mise à jour de la fonction Supabase, `sender_avatar_hint` ne sera pas pris en compte.

## À propos de `happyad1.netlify.app`

Cette ligne est l’origine Web affichée par le navigateur/Android. Le code de la notification ne peut pas la masquer. Un domaine personnalisé peut remplacer `happyad1.netlify.app` par le domaine HAPPYAD. Pour garantir une notification native affichant uniquement le nom de l’application, il faut ensuite utiliser l’APK natif.

## Périmètre conservé

- aucun changement des messages lus ;
- aucun changement des compteurs ;
- aucun changement des Stories ;
- aucun changement du moteur de livraison Push ;
- points 2 à 5 non traités.
