# HAPPYAD V844 — Listes sans perte et clarification unique

Base : `HAPPYAD_V843_PARCOURS_RAPIDE_INDICATEUR_IMMEDIAT.zip`.

## Correction ciblée

- Chaque ligne explicite d’une liste est conservée, même si son objet est encore général.
- Les puces sont acceptées avec ou sans espace : `- un travailleur` et `-un travailleur`.
- `un travailleur` n’est plus supprimé : les autres demandes sont recherchées immédiatement et cette ligne devient « précision nécessaire ».
- Une seule question finale demande le type de travailleur recherché.
- `travailleur à la maison`, `baby-sitter`, `garde bébé` et les alias V841 restent classés directement sans clarification.
- Une demande riche comme « véhicule Nissan qui ressemble à un camion diesel » reste une seule recherche.
- La vitesse et l’indicateur immédiat V843 restent intacts.

## Supabase

Exécuter les SQL V844 dans l’ordre 01 à 03 avant le déploiement du ZIP.
Les RPC gardent leurs noms stables :

- `happyad_chat_decompose_requests_v1`
- `happyad_chat_search_batch_v1`
