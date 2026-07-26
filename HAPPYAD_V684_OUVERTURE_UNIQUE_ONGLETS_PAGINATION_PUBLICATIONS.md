# HAPPYAD V684 — Ouverture unique des onglets et pagination Publications

Base : V683.

## Causes identifiées

1. Les cartes Favoris / Republier / Privé portaient encore la classe générique `profilePost`. Les anciens ouvreurs photo et vidéo du profil pouvaient donc intercepter le même clic que le maître des onglets.
2. Lorsqu’un onglet spécialisé masquait `publicationsBox`, le contrôleur historique de pagination perdait sa liste et sa sentinelle. Le retour sur Publications ne lui demandait pas de reconstruire ses observateurs.

## Corrections

- Cartes des onglets spécialisées isolées avec `haProfileContentTileV684`, hors des sélecteurs génériques `profilePost`.
- Un seul chemin d’ouverture : Fullscreen photo réel pour les photos, navigation interne directe vers la Centrale vidéo pour les vidéos.
- Verrou court anti-double-clic, libéré au retour, à la fermeture du Fullscreen, à la reprise du module et au retour de visibilité.
- Le geste frais requis après fermeture photo reconnaît aussi les cartes V684, ce qui permet les réouvertures successives.
- À chaque retour vers Publications, reconnexion du contrôleur de scroll, de la sentinelle et de la pagination, sans effacer les cartes déjà chargées.
- Onglet actif, UID, contenu strict Supabase et retours V683 conservés.

## Fichiers principaux

- `core/profile-content-tabs-master-v684.js`
- `core/profile-content-tabs-master-v684.css`
- `modules/user.html`
- `service-worker.js`
- `index.html`

Aucun SQL supplémentaire.
