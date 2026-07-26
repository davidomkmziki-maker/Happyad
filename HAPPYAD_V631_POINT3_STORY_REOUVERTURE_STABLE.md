# HAPPYAD V631 — Point 3 : réouverture Story stable

Cette version corrige uniquement le comportement après fermeture du lecteur Story.

- Le CSS du cercle Radar est installé avant le premier rendu.
- Le cercle possède sa taille normale dès l’ouverture de l’Accueil.
- Après fermeture du fullscreen, le Radar est reconstruit avec un gestionnaire de clic neuf.
- Le clic utilise une délégation locale basée sur `owner_id + story_id`, donc le passage vu/non vu ne rend plus le cercle inerte.
- Les routes publiques Story sont réarmées après fermeture et lors du retour de page.
- Aucun changement sur le design fullscreen, les ouvertures directes des pages, la pagination V627, Supabase ou les autres modules.
