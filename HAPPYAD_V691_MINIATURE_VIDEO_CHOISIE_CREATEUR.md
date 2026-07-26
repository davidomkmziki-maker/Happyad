# HAPPYAD V691 — Miniature vidéo choisie par le créateur

Base utilisée : `HAPPYAD_V688_MESSAGES_MEDIAS_LOCAUX_PERSISTANTS.zip`.

## Correction

Le menu `⋯` d'une vidéo appartenant au compte connecté contient maintenant l'option **Modifier la miniature vidéo**.

Le créateur peut :

- déplacer un curseur sur toute la durée de la vidéo ;
- arrêter la vidéo sur l'image exacte qu'il souhaite ;
- avancer ou reculer d'une seconde ;
- utiliser une image du téléphone lorsque l'ancienne vidéo ne peut pas être décodée sur Android ;
- enregistrer cette image dans Supabase.

La miniature est envoyée dans un nouveau fichier public unique, puis les champs `thumbnail_url`, `poster_url` et, lorsqu'il existe, `cover_frame_time` de `happyad_posts` sont mis à jour uniquement pour le propriétaire réel.

Le nouveau chemin unique évite que les anciens caches conservent l'image noire. Les caches locaux, les cartes visibles, les Fullscreen et la Centrale vidéo sont actualisés. Une écoute Realtime relaie aussi la nouvelle miniature aux autres comptes utilisant V691 ; les autres appareils la récupèrent au prochain chargement depuis Supabase.

## Parties préservées

- navigation et retours Profil V687 ;
- médias Messages persistants V688 ;
- actions sociales et notifications ;
- lecture/pause de la Centrale vidéo ;
- aucune modification SQL nécessaire.
