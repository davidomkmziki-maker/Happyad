# HAPPYAD V697 — Story J’aime stable, interface visiteur professionnelle et réponse directe

Base : HAPPYAD V696.

## Corrections

- Le J’aime Story n’utilise plus la table générique des publications.
- Nouveau stockage dédié `happyad_story_likes`, avec RPC sécurisé et notification automatique.
- État optimiste immédiat, puis confirmation Supabase silencieuse.
- Le bouton Envoyer de la Story est toujours visible et devient actif lorsque le texte est saisi.
- Interface visiteur Story resserrée dans un dock professionnel : champ, envoyer, J’aime et partager.
- La réponse Story est envoyée sans écran intermédiaire.
- Dans Messages, la carte reçue affiche une seule information : « Nom a répondu à ta story ».
- Le texte réellement répondu reste affiché sous la carte.
- Un clic sur la carte ouvre toujours directement la Story exacte.

## Supabase

Exécuter une seule fois :

`SUPABASE_HAPPYAD_STORY_LIKES_V697.sql`

Ce SQL migre les éventuels J’aime Story V696, désactive l’ancien déclencheur V696 et installe la table, les RPC, les règles RLS et la notification V697.
