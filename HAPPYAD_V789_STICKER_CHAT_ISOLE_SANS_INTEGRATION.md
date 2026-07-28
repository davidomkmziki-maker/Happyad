# HAPPYAD V789 — Sticker Chat isolé, sans intégration du Chat

Base utilisée strictement : `HAPPYAD_V785_PUSH_AVATAR_EXPEDITEUR_REEL.zip`.

## Correction isolée

- Ajout du sticker Chat dans la rangée Radar, immédiatement après `Ta story`.
- Les autres stories restent ensuite dans leur ordre normal.
- Utilisation de l'image fournie par l'utilisateur, redimensionnée et optimisée ; aucune nouvelle image générée.
- Animation CSS légère uniquement, sans GIF ni vidéo.
- Le sticker ne déplace pas les stories et n'est pas déplaçable.
- Aucun fichier du moteur central Accueil ou du moteur Story n'a été réécrit.

## Bouton de droite du Radar

- L'ancien contenu et l'ancien lien `Voir sur la carte` sont neutralisés.
- Le bouton affiche désormais `Annonces`.
- Il n'ouvre ni l'ancienne Carte ni le Chat : l'intégration sera faite après validation de la structure du Chat.

## Sécurité

- Le clic du sticker émet uniquement l'événement `happyad:chat-sticker-requested`.
- Le clic sur `Annonces` émet uniquement l'événement `happyad:annonces-requested`.
- Aucune conversation locale, aucune centrale parallèle et aucune donnée de démonstration n'ont été ajoutées.
