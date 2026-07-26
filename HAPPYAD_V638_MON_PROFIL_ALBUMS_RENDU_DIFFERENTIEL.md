# HAPPYAD V638 — Mon profil albums + rendu différentiel

- Base: V637 validée.
- Albums de Mon profil affichés dans une seule carte avec défilement horizontal et compteur.
- Le regroupement des albums est idempotent: un album conservé dans le cache ne perd plus ses éléments au prochain rendu.
- Les cartes déjà présentes restent dans le DOM. Au scroll, seules les 9 cartes suivantes sont ajoutées.
- La synchronisation cache/Supabase met à jour uniquement les cartes nouvelles ou modifiées.
- Le Realtime des publications est limité au compte affiché; les actions ne resynchronisent que la carte concernée.
- Le total des likes du profil reste indépendant des 9/18 cartes visibles et ne diminue plus à cause de la pagination.
- Le zoom fullscreen V637, les Stories, les ouvertures directes et la pagination 9/9 restent inchangés.
