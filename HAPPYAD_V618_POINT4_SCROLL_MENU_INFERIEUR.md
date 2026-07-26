# HAPPYAD V618 — Point 4 : Scroll et menu inférieur

Base : HAPPYAD V617 Point 5.

## Correction appliquée

- Un seul moteur actif : `core/dock-auto-hide-master-v618.js`.
- Un seul style actif : `core/dock-master-v618.css`.
- Suppression des anciens maîtres Dock V605, V607, V608/V609 et V613G après fusion.
- Suppression des écoutes `touchstart`, `touchmove`, `pointermove` et `wheel` dans le moteur du menu.
- Traitement du scroll regroupé avec `requestAnimationFrame`.
- Aucun scan permanent des conteneurs scrollables.
- Aucune observation `MutationObserver` de toute la page ; seul l’ajout direct d’une nouvelle iframe au shell est observé.
- Seul l’Accueil ou le module actuellement visible peut masquer/afficher le menu.
- Les scrolls des iframes cachées sont ignorés.
- Le menu reste fixe uniquement dans la centrale Vidéo.
- Le fond noir fumé et la taille des boutons sont conservés.
- Le `backdrop-filter` fixe a été retiré pour alléger le rendu Android, tout en conservant le même dégradé fumé.
- Cache PWA versionné V618.

## Contrôles

- 53 fichiers JavaScript externes valides.
- 191 scripts JavaScript intégrés valides.
- 137 références locales vérifiées, aucune manquante.
- 3 feuilles CSS externes analysées sans erreur.
- Aucun `touchmove`, `pointermove` ou `wheel` dans le maître actif du Dock.
- Un seul CSS et un seul JavaScript Dock chargés dans `index.html`.

Le test tactile réel sur Android reste nécessaire avant validation définitive.
