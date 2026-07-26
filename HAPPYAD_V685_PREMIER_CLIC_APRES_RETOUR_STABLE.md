# HAPPYAD V685 — Premier clic après retour stable

Base : V684.

## Défaut corrigé
Après un premier Fullscreen depuis Favoris, Republier ou Privé, le retour déclenchait plusieurs signaux de restauration (`fullscreen-close`, `focus`, `visibilitychange`, `module-resume`). La grille spécialisée pouvait être reconstruite plusieurs fois pendant le geste suivant. En parallèle, l'ancien verrou anti-réouverture photo exigeait parfois un second geste.

## Correction
- conservation des mêmes cartes DOM lorsque l'UID, l'onglet et les identifiants n'ont pas changé ;
- regroupement des signaux de retour en une seule restauration ;
- aucune requête ni reconstruction lors d'un simple retour sur le même onglet ;
- ouverture par un couple pointerdown/pointerup lié à une seule carte ;
- neutralisation du clic synthétique suivant ;
- suppression des états pressés résiduels ;
- vérification de l'état réel du Fullscreen au lieu d'un drapeau éventuellement ancien ;
- premier nouveau geste réel autorisé immédiatement après la courte protection de fermeture ;
- fonctionnement identique pour photo et vidéo.

Aucun SQL supplémentaire.
