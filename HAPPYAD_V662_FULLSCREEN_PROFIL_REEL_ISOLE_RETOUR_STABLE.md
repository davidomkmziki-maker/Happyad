# HAPPYAD V662 — Fullscreen Profil réel isolé et retour stable

- Le viewer V581 concurrent est neutralisé : Mon profil et Profil visiteur utilisent uniquement `#happyadHomePhotoFullscreen`.
- Pendant le fullscreen, la couche `.app` du profil est retirée du rendu/compositing sans détruire ses cartes.
- Le flag V660 est maintenant appliqué au viewer réellement affiché : pagination, médias et workers sont suspendus.
- Les transformations de zoom du viewer réel sont ignorées par l’observateur global des overlays.
- Le retour arme un verrou exigeant un nouveau pointerdown avant toute réouverture, supprimant les clics fantômes.
- Le tap sur image reste compatible à échelle 1, mais ne ferme jamais pendant un zoom actif.
