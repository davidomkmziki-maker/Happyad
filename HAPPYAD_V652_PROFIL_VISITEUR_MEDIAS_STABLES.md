# HAPPYAD V652 — Médias stables du Profil visiteur

Base : V651 validée.

- Correction ciblée uniquement sur les cartes média du Profil visiteur.
- Conservation de tous les alias média Supabase : media, home_media, video, image, photo, poster, thumbnail, cover et preview.
- Une vidéo n’est plus déclarée prête avant `loadeddata`/`canplay`.
- Poster affiché directement lorsqu’il existe.
- Première image vidéo préparée avec deux nouvelles tentatives maximum.
- En cas d’échec durable, affichage d’un placeholder neutre au lieu d’une carte noire.
- Les cartes persistantes, la pagination, le zoom V651, Mon profil, l’Accueil, le menu et le scroll ne sont pas modifiés.
