# HAPPYAD V621 — Point 6 : centrale vidéo fluide

Base : V620.

## Correction structurelle

- La centrale vidéo ne construit plus jusqu’à 80 interfaces complètes.
- Seulement trois publications existent à la fois dans le DOM : précédente, active et suivante.
- Au changement de vidéo, la fenêtre glisse et recycle les deux cartes encore utiles au lieu de reconstruire tout le fil.
- La vidéo active conserve son élément pendant le déplacement de la fenêtre.
- Les voisines utilisent `preload=metadata`; seule la vidéo active passe en préchargement complet.
- La vidéo éloignée est réellement détruite : pause, retrait de la source et libération des URL Blob.
- Un seul écouteur de scroll pilote sélection, pause, lecture et recyclage. L’ancien second scan audio au scroll est désactivé.
- La recherche filtre la liste complète en mémoire, puis reconstruit seulement la fenêtre de trois résultats.
- L’ouverture d’une vidéo précise depuis notification/lien monte directement la bonne fenêtre même si cette vidéo n’était pas dans les trois éléments visibles.
- La suppression d’une vidéo reconstruit proprement la fenêtre sans laisser d’espace vide.
- Le menu inférieur fixe dans la centrale vidéo et les corrections V614–V620 sont conservés.

## Limites volontaires

- Aucun design n’a été modifié.
- Les actions, commentaires, profil, signalement et partage restent inchangés.
- Cette version ne traite pas encore le point 7 Photos/fullscreen.
