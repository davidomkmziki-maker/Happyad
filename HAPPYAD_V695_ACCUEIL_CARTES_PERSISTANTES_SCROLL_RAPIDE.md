# HAPPYAD V695 — Accueil cartes persistantes au scroll rapide

Base : V694.

## Cause
La fenêtre DOM V616 retirait les anciennes cartes lorsque l’utilisateur descendait. Lors d’un retour rapide vers le haut, elle devait recréer dix cartes avant le prochain rendu, ce qui produisait une zone noire temporaire.

## Correction
- Les publications déjà rendues restent dans le DOM jusqu’au changement réel de filtre ou à leur suppression.
- `content-visibility:auto` garde les cartes hors écran légères.
- La pagination ajoute les nouvelles cartes sans reconstruire celles déjà visibles.
- Les images, vidéos, buffers, actions et états tactiles restent attachés à leurs cartes.
- Plus de `replaceChildren` pendant le scroll.
- Limite générale de 100 publications conservée.

Aucun SQL supplémentaire.
