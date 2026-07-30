# HAPPYAD V832 — Chat Intelligence Supabase dynamique

Base conservée : `HAPPYAD_V830_AUTOPLAY_3_ANNONCES_PAR_CATEGORIE.zip`.

## Correction

- Le Chat appelle `happyad_chat_understand_v2` avant le moteur local pour chaque recherche, formulation ambiguë et salutation.
- Le contexte JSON renvoyé par Supabase est conservé entre les messages et dans la mémoire locale de la conversation.
- Les réponses, catégories, sous-catégories, corrections, langues et champs manquants proviennent de Supabase.
- `happyad_chat_search_posts_v1` reçoit directement la compréhension V2.
- Le moteur local V830 reste uniquement comme secours si Supabase ou la RPC est indisponible.
- Toute future insertion de termes/règles dans les tables V831 devient active au prochain message sans redéployer le ZIP.
- Les futures améliorations de logique doivent utiliser `CREATE OR REPLACE FUNCTION public.happyad_chat_understand_v2(...)` afin de conserver le même contrat RPC.

## Cache

Service Worker renouvelé en V832 pour charger immédiatement le nouveau module Chat.

## SQL

Aucun SQL supplémentaire requis si toutes les parties V831 ont déjà été exécutées.
