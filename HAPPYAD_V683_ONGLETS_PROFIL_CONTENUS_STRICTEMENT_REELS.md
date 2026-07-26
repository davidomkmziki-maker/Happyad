# HAPPYAD V683 — Onglets Profil aux contenus strictement réels

Base : V682, après validation de V681.

## Cause corrigée
V682 ajoutait sa grille spécialisée à l’intérieur de `publicationsBox`, zone que l’ancien moteur Publications pouvait reconstruire. Les publications normales restaient alors visibles derrière les onglets sélectionnés. De plus, l’onglet Privé acceptait des indicateurs locaux et des états trop larges, ce qui pouvait classer à tort des publications comme privées.

## Correction
- Le contenu Publications reste dans `publicationsBox`.
- Favoris, Republier et Privé utilisent désormais un panneau indépendant, placé hors du moteur Publications.
- Quand un onglet spécialisé est actif, `publicationsBox` est entièrement masqué : aucune publication ordinaire ne peut apparaître dessous ou à sa place.
- Favoris lit uniquement les lignes Supabase actives de l’utilisateur (`liked=true`, action `favorite/fav/save`).
- Republier lit uniquement les lignes Supabase actives de l’utilisateur (`liked=true`, action `repost/republish/republication`).
- Privé lit uniquement les publications du propriétaire dont l’état Supabase est explicitement privé.
- Les anciens caches V679/V682 des onglets sont supprimés et ne sont plus utilisés pour afficher un contenu potentiellement périmé.
- Une publication personnelle ajoutée aux Favoris ou republiée est acceptée exactement comme toute autre publication.
- Mon profil et chaque Profil visiteur gardent un état d’onglet séparé par UID.
- Le retour depuis une photo ou une vidéo conserve le même onglet et la même liste.
- Profil visiteur expose uniquement Publications et Republier.

## Fichiers principaux
- `core/profile-content-tabs-master-v683.js`
- `core/profile-content-tabs-master-v683.css`
- `core/profile-master-v665.js`
- `modules/user.html`
- `service-worker.js`

Aucun SQL supplémentaire n’est nécessaire.
