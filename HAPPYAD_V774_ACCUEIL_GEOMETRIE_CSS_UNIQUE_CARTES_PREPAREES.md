# HAPPYAD V774 — Accueil : géométrie CSS unique et cartes préparées

Base : V773.

## Correction isolée du point 9

- Ajout d’un maître CSS final limité à `#list.homeTimeline`.
- Les ratios photo ne dépendent plus de `@media(max-height:700px)`.
- La disparition/réapparition des barres Android ne peut plus basculer une photo verticale de 3/4 vers 4/5 pendant le scroll.
- Ratio fixe par type déjà déterminé avant insertion : vertical 3/4, carré 1/1, large 4/3, panorama 16/9, vidéo 1/1.
- Les albums V772 ont une seule géométrie finale pour le rail, les diapositives et les boîtes média.
- Les conteneurs de géométrie n’utilisent plus de transition CSS.
- Les petites zones dynamiques (média, corps, actions) ne peuvent plus devenir l’ancre de scroll du navigateur ; la carte complète reste l’ancre stable.
- Le prépeint marque les cartes proches avec `haHomeNearLayoutV774` et force leur mise en page environ 2 200 px avant leur arrivée par le bas.
- Les cartes éloignées conservent `content-visibility:auto`; leurs tailles intrinsèques sont adaptées aux photos, vidéos et albums.
- Aucun scan global, aucune hydratation média supplémentaire et aucune requête Supabase ajoutée.

## Éléments non modifiés

- Pagination V770.
- Radar/Sponsor V771.
- Structure album V772.
- Actions par tranche V773.
- Messages, Profils, Vidéos, Stories, Notifications, Assistance, Admin et schéma Supabase.
