# HAPPYAD V834 — CONTEXTE CONVERSATIONNEL STABLE

Base : V833.

## Correction

- Le Chat accepte le signal serveur `reset_context` et `interaction_type = new_search`.
- Une nouvelle demande complète ouvre une nouvelle session de recherche locale.
- Les anciens champs (catégorie, ville, budget, produit, service et critères) sont vidés avant d'appliquer la nouvelle compréhension Supabase.
- Les précisions d'une recherche en cours continuent à fusionner avec le contexte existant.
- La RPC reste `happyad_chat_understand_v2` : les futurs ajouts de données Supabase ne nécessitent pas de redéploiement.

## Prérequis

Exécuter d'abord les SQL V834 parties 01 et 02, puis les tests de la partie 03.
