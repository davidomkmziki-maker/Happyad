# HAPPYAD V677 — Fullscreen profils : actions persistantes

Base : **HAPPYAD V669**.

Correction ciblée uniquement sur le Fullscreen photo de **Mon profil** et du **Profil visiteur** :

- neutralisation de l’ancien moteur V485 qui reconstruisait seulement 3 actions après une réouverture ;
- conservation d’un seul maître d’actions Fullscreen, le maître V572 ;
- création directe du conteneur d’actions dans le Fullscreen unique V483 ;
- restauration immédiate des 5 actions à chaque ouverture : J’aime, Commentaire, Partage, Republication et Favoris ;
- contrôle automatique du nombre d’actions afin qu’un ancien rendu incomplet soit remplacé ;
- identifiant de la publication racine réappliqué à chaque ouverture, y compris pour les albums ;
- cache PWA passé à V677 pour empêcher le mélange avec l’ancien affichage.

Les ouvertures directes, UID visiteur V669, scroll, pagination, zoom, retour Fullscreen et autres modules ne sont pas modifiés.
