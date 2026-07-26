# HAPPYAD V663 — Onglets Profil sticky sans flou

Base : V662 validée.

Correction ciblée :
- suppression de `backdrop-filter: blur(16px)` sur `#happyadProfileTabsMaster` ;
- fond opaque conservé pour garder le même contraste ;
- position sticky, dimensions, onglets et navigation inchangés ;
- cache PWA renouvelé pour ne pas reprendre l’ancien CSS.

Aucune modification des cartes, médias, vidéos, sentinelles, pagination, fullscreen ou zoom.
