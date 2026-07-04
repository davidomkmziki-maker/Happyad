# HAPPYAD core — structure actuelle V1

Cette version garde le design et les fichiers actuels de HAPPYAD.

Objectif : ajouter une organisation centrale sans réécrire le visuel.

- `router.js` : futur point unique de navigation.
- `history.js` : futur point unique du retour téléphone/interne.
- `state.js` : état global minimal.
- `api.js` : accès Supabase central, sans déplacer encore les requêtes.
- `cache.js` : cache central futur + audit des anciennes clés.
- `media.js` : pause/stop média central.
- `auth.js` : compte connecté/logout/login.
- `permissions.js` : propriétaire/visiteur/non connecté.

V1 ne supprime pas encore les anciens blocs métier. Elle prépare le nettoyage par module.
