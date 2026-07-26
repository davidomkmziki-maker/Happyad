# HAPPYAD V764 — Accueil chargement progressif complet

Base : `HAPPYAD_V763_ACCUEIL_SCROLL_MEDIAS_STABLES.zip`

Correction ciblée du chargement de l’Accueil :

- L’Accueil affiche toujours les 10 premières publications, puis ajoute les suivantes par petits groupes de 5 à l’approche du bas de la liste.
- Le déclenchement utilise maintenant la position réelle du bas de `#list`, plus fiable dans la PWA Android avec le menu inférieur fixe.
- Un sentinel de progression reste attaché à la vraie fin de la liste et est réobservé après chaque rendu.
- Le curseur Supabase part obligatoirement de la dernière ligne de la première page réellement reçue, puis avance page après page. Il ne saute plus des publications intermédiaires à cause d’un ancien élément très vieux conservé dans le cache.
- Si l’utilisateur atteint le bas avant la fin du premier appel Supabase, la pagination attend cette première page au lieu de démarrer depuis le plus vieux cache.
- Les médias des cartes ajoutées progressivement utilisent un chargement immédiat. Une miniature photo cassée retente automatiquement l’image originale.
- Une erreur média temporaire est retentée deux fois avec un indicateur compact au lieu de laisser une grande zone noire vide.
- Les cartes déjà affichées restent conservées dans le DOM et ne sont pas reconstruites pendant le scroll.

Parties non modifiées : Profil visiteur V762, Messages et badges V761, Assistance, Admin, schéma Supabase et SQL.
