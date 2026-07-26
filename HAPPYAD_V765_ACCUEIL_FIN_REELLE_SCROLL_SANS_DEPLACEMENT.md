# HAPPYAD V765 — Accueil fin réelle et scroll sans déplacement

Base : `HAPPYAD_V764_ACCUEIL_CHARGEMENT_PROGRESSIF_COMPLET.zip`

Corrections ciblées sur les deux défauts observés dans l’Accueil :

- Le texte « Chargement progressif » est supprimé. Seul un petit cercle apparaît pendant une vraie requête de pagination.
- Le sentinel reste invisible lorsqu’il attend simplement l’approche du bas de la liste et disparaît complètement lorsque la dernière publication Supabase est atteinte.
- Chaque requête demande une ligne de contrôle supplémentaire (`20 + 1`). Cette ligne permet de savoir immédiatement si une page est réellement la dernière, y compris lorsque le nombre total de publications est exactement un multiple de 20.
- La ligne de contrôle n’est pas sautée : le curseur reste placé sur la vingtième publication et la ligne supplémentaire devient la première publication de la page suivante.
- Les nouvelles cartes ajoutées au-dessus ou au milieu du contenu conservent la première carte visible comme ancre. La position verticale de l’utilisateur est restaurée après la réconciliation du DOM.
- Les photos ne changent plus de ratio après leur chargement. La carte réserve sa hauteur avant l’arrivée de l’image, apprend le vrai ratio en arrière-plan, puis l’utilise dès la prochaine ouverture sans déplacer l’écran courant.
- La même protection de hauteur est appliquée aux photos d’albums.
- Les vidéos gardent leur cadre carré existant et ne sont plus déplacées par le chargement tardif des photos voisines.

Parties non modifiées : Profil visiteur V762, Messages et badges V761, Assistance, Admin, schéma Supabase et SQL.
