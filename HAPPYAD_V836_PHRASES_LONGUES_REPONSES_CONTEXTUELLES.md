# HAPPYAD V836 — Phrases longues et réponses contextuelles

Base : `HAPPYAD_V835_FORMULAIRE_CERVEAU_RECHERCHE_RAPIDE.zip`.

## Corrections

- Le client ne détruit plus automatiquement le contexte lorsqu’un message est simplement long.
- Supabase décide si le message est une précision ou une nouvelle recherche.
- Une nouvelle catégorie remplace l’ancien objet, la marque, le modèle, la transaction et le budget incompatibles.
- La ville et le pays sont conservés lorsqu’ils restent compatibles.
- Le mode `budget.mode = any` vide immédiatement l’ancien budget local.
- Les résultats reçoivent une seule réponse adaptée : résultat exact, résultat proche ou aucune annonce.
- Suppression de la seconde réponse répétitive après une recherche vide.
- Réponses naturelles selon la catégorie et la transaction.
- Cache Service Worker renouvelé en V836.

## SQL requis

Exécuter le paquet `HAPPYAD_V836_SQL_PHRASES_LONGUES_REPONSES.zip` avant de déployer ce ZIP.
