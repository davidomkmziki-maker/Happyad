# HAPPYAD V784 — Mon profil : 9 publications initiales puis pagination

Base : `HAPPYAD_V783_RENOUVELLEMENT_V781_MESSAGES_LUS_STORY_AGE_REEL.zip`

## Problème confirmé

La constante initiale était déjà réglée sur 9, mais elle était appliquée après `happyadGroupProfilePosts()`.

L'ancien regroupement possédait un fallback automatique fondé sur :

- le propriétaire ;
- le titre ;
- la description ;
- la catégorie ;
- une fenêtre de 90 secondes.

Des publications indépendantes publiées rapidement avec les mêmes textes pouvaient donc être regroupées par erreur dans une seule carte album. La première requête récupérait 18 lignes Supabase, puis ces lignes pouvaient devenir seulement 3 cartes. La pagination attendait ensuite le premier scroll avant de récupérer ou révéler le reste.

## Correction V784

### Regroupement strict réservé à Mon profil

Une carte album est désormais créée seulement lorsqu'il existe une preuve réelle :

- `batch_id` / `batchId` ;
- `album_id` / `albumId` ;
- `group_id` / `groupId` ;
- autre identifiant explicite de lot ;
- ou un index photo réel supérieur à zéro dans un ancien lot.

Les anciens groupes automatiques `auto|...` sans preuve sont dépliés en publications indépendantes.

Le Profil visiteur conserve son moteur actuel et n'est pas modifié.

### Premier rendu garanti

La première requête compte maintenant les cartes finales après regroupement, et non les simples lignes photo. Elle continue au besoin, dans une limite de quatre pages, jusqu'à obtenir 9 publications visibles ou atteindre la fin réelle du compte.

### Pagination

- 9 cartes au premier rendu si le compte possède au moins 9 publications ;
- 9 cartes supplémentaires par déclenchement de scroll ;
- les vraies publications multi-photos restent une seule carte ;
- aucune pagination automatique sans mouvement de l'utilisateur ;
- le total Supabase affiché en haut du Profil reste inchangé.

## Fichiers modifiés

- `modules/user.html`
- `core/navigation-master-v668.js`
- `core/main-tabs-master-v615.js`
- `index.html` — version de chargement des maîtres
- `service-worker.js` — cache V784

## Éléments non modifiés

- Messages et états lus V783 ;
- Stories et calcul de l'âge V783 ;
- Profil visiteur ;
- Accueil ;
- Vidéos ;
- Notifications Push ;
- tables et fonctions Supabase.

Aucun SQL n'est nécessaire pour cette correction.
