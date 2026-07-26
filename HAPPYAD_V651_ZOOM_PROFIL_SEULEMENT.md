# HAPPYAD V651 — Zoom fluide uniquement dans Mon profil et Profil visiteur

Base : V649 validée.

- Aucun changement du fullscreen photo de l’Accueil.
- Le viewer Profil V581 conserve son scroll horizontal natif.
- Le zoom personnalisé agit uniquement sur l’image active de V581.
- Le rail horizontal est bloqué seulement quand l’échelle dépasse 1.
- Les transformations sont regroupées avec requestAnimationFrame.
- L’observateur global V615 ignore uniquement les mutations `style` de l’image zoomée V581.
- Aucun MutationObserver ajouté au zoom.
- Réinitialisation au changement de photo, au scroll vertical, à la fermeture et au changement d’orientation.
