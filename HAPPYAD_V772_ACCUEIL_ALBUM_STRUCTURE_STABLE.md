# HAPPYAD V772 — Accueil : structure album stable avant hydratation

Date : 26 juillet 2026
Base : V771

## Correction isolée — Point 7

Le moteur des albums de l’Accueil ne remplace plus l’intégralité de `card.innerHTML` lorsque la carte approche de l’écran.

### Nouveau fonctionnement

- `createCard()` reconnaît immédiatement une publication groupée (`__albumCount > 1`).
- La structure finale de l’album est créée avant l’insertion de la carte dans le fil :
  - toutes les diapositives ;
  - les en-têtes ;
  - les textes ;
  - les emplacements médias à ratio réservé ;
  - la barre d’actions fixe ;
  - les points de navigation.
- `hydrateAlbumMedia()` ne reconstruit plus la carte et n’ajoute plus de diapositives.
- L’hydratation ajoute uniquement les images dans les emplacements déjà présents.
- Le ratio appris d’une image reste mémorisé pour le prochain rendu, sans modifier la hauteur de la carte visible.
- Les erreurs média restent contenues dans la boîte média réservée et ne changent pas la géométrie générale de la carte.
- Les clics Profil, Voir plus, actions et ouverture fullscreen sont gérés par délégation sur la structure stable.

## Éléments conservés

- V766 : `scrollBy()` protégé.
- V767 : hydratation média unique.
- V768 : cartes proches sans scan global.
- V769 : style stable pendant le scroll rapide.
- V770 : pagination en série unique.
- V771 : pagination sans reconstruction du Radar/Sponsor.

Aucun changement dans Supabase, les Messages, les Profils, Vidéos, Stories, Notifications, Assistance ou Admin.
