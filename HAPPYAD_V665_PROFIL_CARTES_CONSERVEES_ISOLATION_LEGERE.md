# HAPPYAD V665 — Cartes Profil conservées et isolation légère

- Même DOM conservé lors du passage vers une autre page et au retour.
- Verrou de 2,6 s contre les rendus redondants de reprise, uniquement si UID et liste d’identifiants sont strictement identiques.
- Les nouvelles publications restent rendues si la liste distante a réellement changé.
- Optimiseurs V619/V570 limités aux cartes nouvelles ou modifiées.
- Les images déjà décodées et vidéos déjà prêtes ne sont plus reconfigurées au retour.
- `content-visibility:auto` reste absent.
- Isolation légère : grille `contain: layout style`, carte `contain: layout paint style`, média `contain: layout paint`.
- Zoom V662, pagination V654, menu V653 et limite basse V664 conservés.
