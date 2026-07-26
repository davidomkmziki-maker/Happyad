# HAPPYAD V778 — Push avatar réel et réveil hors application renforcé

## Base

Base de départ : `HAPPYAD_V777_PUSH_AVATAR_BADGE_HORS_APPLICATION.zip`.

## Défauts confirmés par le test réel

1. La notification affichait le logo HAPPYAD à la place de la photo de l’expéditeur.
2. Sur le téléphone Samsung testé, la notification pouvait rester absente tant que Chrome ou HAPPYAD n’était pas rouvert.

## Cause 1 — avatar vide côté serveur

La fonction V777 ne cherchait le profil que dans `profiles.id` et dans un nombre limité de colonnes. Or HAPPYAD sait déjà récupérer des avatars depuis plusieurs formes de données : chemins Storage, `profiles.user_id`, présence, métadonnées Auth et anciennes colonnes photo.

Quand aucun avatar HTTPS n’était résolu, le payload recevait le logo HAPPYAD. Le Service Worker ne pouvait donc pas afficher la photo de la personne.

## Correction avatar V778

La fonction Edge V778 cherche maintenant l’identité dans cet ordre :

- le message confirmé ;
- `profiles.id` ;
- `profiles.user_id` ;
- `happyad_presence.user_id` ;
- `auth.users.user_metadata`.

Elle reconnaît les colonnes et formes historiques utilisées dans HAPPYAD, notamment :

- `avatar_url`, `avatar`, `user_avatar` ;
- `profile_photo_url`, `profile_picture_url`, `profile_image_url` ;
- `photo_url`, `picture`, `image_url` ;
- chemins `happyad-media/avatars/...` ;
- chemins `/storage/v1/object/...`.

Le payload transmet :

- `icon` = photo exacte ;
- `image` = photo exacte pour les présentations Android compatibles ;
- `badge` = icône HAPPYAD ;
- `sender_avatar_source` = source utilisée pour le diagnostic.

Le Service Worker essaie successivement :

1. photo comme `icon` et `image` ;
2. photo comme `icon` sans `image` ;
3. logo HAPPYAD en dernier recours.

Le nom réel de l’expéditeur est conservé même en cas de secours.

## Correction réveil V778

Une page HAPPYAD simplement gardée dans Chrome ou dans les applications récentes n’est plus considérée comme réellement ouverte. La notification système est supprimée uniquement si une fenêtre HAPPYAD est à la fois :

- visible ;
- réellement focalisée.

La réception reste assurée par le Push API et le Service Worker, pas par Supabase Realtime dans la page.

## Limite Android/Samsung

Aucun JavaScript du site ne peut réveiller Chrome ou une PWA lorsque le système les a placés en veille profonde ou lorsqu’ils ont été forcés à l’arrêt.

Sur Samsung, vérifier :

1. Paramètres → Batterie → Limites d’utilisation en arrière-plan.
2. Retirer Chrome et HAPPYAD de « Applications en veille » et « Applications en veille profonde ».
3. Ajouter Chrome/HAPPYAD dans « Applications jamais en veille » lorsque cette option existe.
4. Paramètres → Notifications → Notifications des applications → Chrome ou HAPPYAD.
5. Activer Autoriser les notifications, Son et vibration, et Afficher comme fenêtre contextuelle.
6. Ne pas utiliser « Forcer l’arrêt » pendant le test.

## Déploiement obligatoire

1. Remplacer le contenu de la fonction Supabase `happyad-push-test` par `SUPABASE_EDGE_FUNCTION_HAPPYAD_PUSH_PRODUCTION_V778.ts`.
2. Déployer la fonction.
3. Déployer le ZIP V778 sur Netlify.
4. Ouvrir HAPPYAD une fois avec Internet pour installer le Service Worker V778.
5. Actualiser une fois si l’ancien Service Worker reste affiché.
6. Réenregistrer les notifications depuis Profil → Paramètres → Notifications.
7. Envoyer un nouveau message depuis un autre compte possédant une vraie photo de profil.
8. Fermer HAPPYAD et Chrome sans utiliser Forcer l’arrêt.

## Contrôles techniques

- JavaScript `service-worker.js` valide.
- JavaScript `core/push-master.js` valide.
- 108 scripts intégrés de `index.html` valides.
- TypeScript V778 validé avec déclarations Deno/Supabase de contrôle.
- Aucun changement dans Messages V775, Accueil V774, Assistance, Profils, Stories ou Supabase SQL V776B.
