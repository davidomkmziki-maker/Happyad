# HAPPYAD V687 — Retour stable vers le même onglet du Profil

Base : V686.

## Défaut observé

Depuis Favoris, Republier ou Privé, l’ouverture photo/vidéo était correcte, mais le retour pouvait remettre automatiquement l’onglet Publications.

## Cause exacte

Le contexte de retour était supprimé dès le signal de fermeture du Fullscreen photo. Le parent envoyait ensuite plusieurs signaux de reprise (`APP_FRAME_VISIBLE`, `MODULE_RESUME`, `focus`, `pageshow`). Le premier signal ne trouvait plus le contexte Favoris/Republier/Privé et interprétait la reprise comme une nouvelle ouverture du Profil, donc sélectionnait Publications.

Une seconde fenêtre de conflit existait juste après l’ouverture du Profil : le signal groupé conservait encore `posts` même après un clic volontaire sur Favoris, Republier ou Privé.

## Correction V687

- Le contexte de retour n’est plus supprimé au signal de fermeture.
- L’onglet, l’UID, le mode propriétaire/visiteur, la publication et la position de scroll sont mémorisés avant l’ouverture du média.
- Tous les signaux d’un même retour utilisent un verrou temporaire unique et restaurent exactement le même onglet.
- Le panneau et ses cartes DOM sont conservés ; aucune reconstruction de grille au retour.
- La position de scroll est réappliquée silencieusement.
- Un clic volontaire sur un autre onglet annule immédiatement le contexte de retour.
- Une nouvelle ouverture explicite de Mon profil depuis le menu inférieur continue de démarrer sur Publications.
- Le contexte est nettoyé seulement après stabilisation complète du retour.
- Fonctionne pour photo et vidéo, Mon profil et Profil visiteur (Republier côté visiteur).

Aucun SQL supplémentaire.
