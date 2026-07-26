# HAPPYAD V752 — Connexion quota Storage stable

Base : HAPPYAD V751.

## Cause corrigée
Le navigateur refusait d'enregistrer la session Supabase (`sb-...-auth-token`) car le quota de `localStorage` était rempli par des caches temporaires, notamment les caches de publications, Stories, profils et miniatures vidéo encodées.

## Corrections
- Nouveau maître `core/auth-storage-quota-master-v752.js` chargé avant toute création de client Supabase.
- Stockage Auth personnalisé compatible Supabase : lecture locale puis secours persistant IndexedDB.
- En cas de quota, suppression ciblée des caches temporaires uniquement, puis nouvel essai automatique.
- Connexion, profil, paramètres, conversations, brouillons et actions protégés.
- Migration silencieuse des anciens tokens Supabase vers IndexedDB.
- Nouvel essai automatique de connexion si un ancien client rencontre encore l'erreur de quota.
- `Libérer mon espace` reconnaît aussi les anciennes miniatures vidéo et le cache de démarrage.
- Le correctif est chargé dans l'accueil, Profil, Messages, Photo, Vidéo, Publication et récupération du mot de passe.
- Cache PWA V752.

Aucun SQL n'est nécessaire.
