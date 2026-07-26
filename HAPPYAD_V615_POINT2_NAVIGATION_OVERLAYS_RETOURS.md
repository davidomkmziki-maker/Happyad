# HAPPYAD V615 — Point 2

Base : V614 Point 1.

## Navigation

- Suppression du bouclier tactile plein écran `happyadAppTapShield`.
- Verrou de navigation logique limité à 850 ms, sans élément transparent au-dessus de l’interface.
- Une nouvelle destination remplace immédiatement une ouverture encore en attente.
- Le chargement différé et le cycle de vie V614 restent actifs.

## Overlays et scroll

- Nouveau maître unique : `core/overlay-scroll-master-v615.js`.
- Chargé dans l’Accueil et les dix pages internes.
- Un overlay fermé devient automatiquement non tactile avec `pointer-events: none`, `aria-hidden` et `inert`.
- Lorsqu’il est réellement rouvert, son interaction est restaurée.
- Les anciens verrous de scroll sont retirés seulement quand aucun overlay actif ne les justifie.
- La couche de contrôle est supprimée du DOM quand elle n’est pas utilisée.

## Retours et notifications

- Nouveau maître `core/internal-return-master-v615.js`.
- Les Notifications ne sont plus préchargées en arrière-plan : leur iframe est créée au premier clic.
- La fermeture des Notifications libère immédiatement son verrou et neutralise son overlay.
- Les retours internes tactiles V611 sont conservés.

## Contrôles

- 61 fichiers JavaScript externes valides.
- 191 scripts intégrés valides.
- Aucune référence locale manquante.
- Le maître d’overlay est chargé dans 10 modules sur 10.
- Tests navigateur réussis : overlay caché, ouverture, fermeture, suppression du bouclier, navigation remplacée et Notifications paresseuses.

Aucun design ni contenu fonctionnel des Publications, Profils, Messages, Photos ou Vidéos n’a été modifié.
