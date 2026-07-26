# HAPPYAD V649 — Profils propriétaire et visiteur isolés

Correction ciblée du passage Profil visiteur vers Mon profil.

- Le bouton Mon profil efface l’UID public actif avant d’afficher la frame propriétaire.
- La frame propriétaire reçoit un signal explicite `HAPPYAD_PROFILE_SHOW_OWNER_V649`.
- Les classes et actions visiteur sont retirées sans reconstruire les publications du propriétaire.
- Les délais, fallbacks et signaux tardifs de l’ancienne frame visiteur sont annulés.
- La frame visiteur reçoit un signal de désactivation et ignore les anciens changements d’UID jusqu’à sa prochaine ouverture explicite.
- Une frame visiteur ne peut plus se révéler lorsque la route active est Mon profil.
- Les caches stables par UID visiteur sont conservés pour les prochaines ouvertures.
