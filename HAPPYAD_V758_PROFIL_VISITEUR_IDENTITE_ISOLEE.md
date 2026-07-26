# HAPPYAD V758 — Profil visiteur : identité isolée

Base : `HAPPYAD_V757_AUDIT_CONFLITS_STABLE.zip`

## Correction unique
- `profile-identity-stable-master-v741.js` ne peint plus le nom, le pseudo ou la photo du compte connecté dans une route `public=1`.
- `profile-avatar-recovery-master-v743.js` ne récupère plus et n’enregistre plus l’avatar du propriétaire depuis le DOM d’un Profil visiteur.
- Les écritures dans les caches centraux du compte connecté sont bloquées depuis le Profil visiteur.
- Mon profil conserve V741/V743 et la persistance V756.
- Aucun changement dans Messages, Accueil, Assistance, Admin, Supabase ou SQL.
- Les références des deux scripts et le Service Worker sont versionnés en V758 pour éviter la reprise des anciens fichiers en cache.

## Tests ciblés
1. Ouvrir Mon profil.
2. Ouvrir successivement deux Profils visiteurs différents.
3. Vérifier qu’aucun nom, pseudo ou avatar du compte connecté n’apparaît pendant le chargement.
4. Revenir à Mon profil et vérifier son identité.
5. Vérifier le retour depuis un Profil visiteur vers la publication d’origine.
