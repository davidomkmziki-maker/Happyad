# HAPPYAD V634 — Story : vues, menu, partage et mentions

Base : V633 validée. Le cercle Radar, le zoom naturel, le fullscreen persistant, la réouverture multiple, les ouvertures directes des pages et la pagination V627 restent inchangés.

## Changements

- Le propriétaire voit désormais deux commandes en bas : **Vues** avec une icône SVG de statistiques, et **Partager**.
- **Vues** regroupe les personnes ayant vu la Story et leurs actions disponibles : vue, j’aime et réponse.
- Les boutons **Mentionner** et **Plus** ont été retirés du bas du lecteur.
- Le menu `⋮` en haut contient :
  - propriétaire : supprimer la Story ;
  - visiteur : désactiver les Stories de ce compte ou signaler la Story.
- Le partage d’une Story ouvre le centre de conversations HAPPYAD, avec contacts, sélection et recherche. Maximum : 20 destinataires.
- Une Story partagée apparaît comme une carte Story dans la conversation et peut rouvrir le lecteur fullscreen unique.
- Les réponses Story sont enregistrées avec un identifiant structuré invisible afin d’alimenter correctement les statistiques, tout en affichant « A répondu à ta story » dans Messages.
- Les mentions sont choisies avant la publication d’une Story. Maximum : 20 personnes.
- Plusieurs Stories du propriétaire restent regroupées dans le même cercle Radar.

## SQL à exécuter

Exécuter `SUPABASE_HAPPYAD_STORY_MENTIONS_V634.sql` pour enregistrer durablement les identifiants des personnes mentionnées dans `happyad_stories`.

Le frontend reste tolérant : si le SQL n’est pas encore exécuté, la Story se publie sans bloquer, mais les mentions distantes ne seront pas conservées.
