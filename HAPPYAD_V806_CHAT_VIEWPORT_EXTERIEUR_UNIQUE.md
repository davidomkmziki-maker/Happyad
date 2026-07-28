# HAPPYAD V806 — Chat viewport extérieur unique

Base : HAPPYAD V804.

## Défaut corrigé
Chrome/Google redimensionnait la frame extérieure avec `visualViewport.height` pendant que le Chat interne recalculait déjà sa propre hauteur. Les deux calculs pouvaient laisser une fine bande découverte et montrer une partie de l’Accueil derrière le formulaire.

## Correction isolée
- suppression complète du gestionnaire `visualViewport` dans le parent HAPPYAD ;
- host Chat toujours `position: fixed; inset: 0` ;
- iframe toujours `width: 100%; height: 100%` ;
- fond opaque permanent avec bouclier de sous-pixels ;
- le module `happyad-chat.html` reste strictement celui de V804 et gère seul le clavier, le scroll et les champs ;
- publication Produit V804, vérification vendeur V801, modes V802, sticker, Accueil, Messages et profils inchangés ;
- aucun SQL supplémentaire.
