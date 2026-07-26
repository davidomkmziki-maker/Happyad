# HAPPYAD V628 — Story fullscreen unique et directe

Base : V627.

## Modifications limitées aux stories

- Ouverture immédiate depuis le cache du Radar ou du profil, puis synchronisation Supabase silencieuse.
- Un seul lecteur fixe fullscreen pour le Radar, Mon profil et le Profil visiteur.
- Fin de la dernière story : fermeture directe du lecteur.
- Photos et vidéos en cadrage naturel (`object-fit: contain`) sans zoom forcé.
- Zoom tactile naturel : pincement, déplacement quand le média est agrandi et double appui pour agrandir/réinitialiser.
- Photo : progression de 10 secondes. Vidéo : progression liée à sa durée réelle.
- Appui long : pause ; relâchement : reprise ; appui gauche/droite : précédente/suivante.
- Réponse à une story envoyée par la vraie messagerie HAPPYAD avec la mention `↩ A répondu à ta story`.
- Story personnelle : quatre options confirmées — Activité, Partager, Mentionner, Plus.
- Radar : un seul cercle personnel. Lorsqu’une story existe, le petit bouton `+` est posé sur ce même cercle pour en ajouter une autre.
- Cercles Radar agrandis à 74 px, ou 68 px sur les écrans étroits.

## Éléments conservés

- Ouvertures directes V626 inchangées.
- Pagination légère V627 inchangée.
- Navigation, Messages, Notifications, Vidéos, Publication et profils non reconstruits.
- Aucune modification SQL requise.
