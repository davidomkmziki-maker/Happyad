# HAPPYAD V629 — Point 1 : moteur Story unique

Cette version traite uniquement le premier point validé : neutraliser les anciens moteurs Story qui entraient en conflit avec le fullscreen V628.

## Changements

- Le Radar Story maître possède désormais son propre conteneur isolé.
- Le lecteur fullscreen maître possède son propre conteneur et ses propres identifiants internes.
- Les anciens lecteurs `happyStoryViewer`, `happyProfileStoryViewer` et `storyViewerShade` sont masqués dès le début du chargement.
- L'ancien `homeRadarBlock` est neutralisé avant son premier affichage.
- Les anciens écouteurs `happyad:story-opened` ne sont plus déclenchés par le nouveau maître.
- Un verrou réapplique les fonctions du maître si un ancien script tente de les remplacer.
- Mon profil et le Profil visiteur transmettent l'ouverture au maître principal, sans afficher leur lecteur local.

## Non modifié

- Ouvertures directes des pages V626.
- Pagination légère V627.
- Interface Story et commandes V628.
- Supabase, messagerie, publications, vidéos, notifications et navigation.
