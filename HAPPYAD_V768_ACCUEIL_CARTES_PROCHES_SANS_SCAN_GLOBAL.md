# HAPPYAD V768 — Accueil : cartes proches sans scan global

Base : `HAPPYAD_V767_ACCUEIL_HYDRATATION_MEDIA_UNIQUE.zip`

## Point 3 corrigé isolément

- Le prépeint ne parcourt plus toutes les `.miniCard` à chaque événement `scroll`.
- Aucun `getBoundingClientRect()` global n'est exécuté par le prépeint pendant le défilement.
- `IntersectionObserver` devient l'unique sélectionneur des cartes proches de l'écran.
- Les insertions d'images ne retraitent que leur carte propriétaire lorsqu'elle est déjà proche.
- Les cartes retirées sont désobservées et supprimées de la liste des cartes proches.
- `content-visibility:auto` et `contain-intrinsic-size:auto 560px` sont restaurés pour les cartes éloignées.
- Les règles `content-visibility:visible`, `contain:none` et `contain-intrinsic-size:none` du prépeint sont supprimées.
- Le comportement visuel `haHomeFastScrollV696` est conservé intact pour être traité séparément au point 4.
- Les protections V766 et l'hydratation unique V767 restent intactes.
- Service Worker mis à jour en V768.

Aucun changement dans la pagination, le Radar, le Sponsor, les compteurs, Supabase, les Profils, les Messages, les Vidéos, l'Assistance ou l'Admin.
