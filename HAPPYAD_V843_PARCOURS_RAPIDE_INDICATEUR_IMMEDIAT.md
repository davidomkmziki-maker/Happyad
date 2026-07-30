# HAPPYAD V843 — Parcours rapide et indicateur immédiat

Base : `HAPPYAD_V842_DECOMPOSITION_SERVEUR_DYNAMIQUE.zip`.

## Correction ciblée

- Une demande clairement simple ne passe plus par `happyad_chat_decompose_requests_v1`.
- Le Chat appelle directement `happyad_chat_understand_v2`, puis la recherche active.
- Les listes, demandes multiples probables et ambiguïtés conservent la décomposition serveur V842.
- Le panneau « Recherche intelligente en cours… » apparaît immédiatement après l’envoi, avant le premier appel Supabase.
- Le même panneau est réutilisé pendant la compréhension et la recherche afin d’éviter un affichage tardif ou un doublon.
- Le délai artificiel avant la recherche est réduit de 280 ms à 20 ms.
- Les réponses locales évidentes (remerciement, accusé de réception, paiement hors périmètre) ne déclenchent pas le panneau de recherche.
- L’annulation reste respectée pendant la phase de compréhension.

## Conservation

Toutes les corrections V833 à V842 restent présentes : pont Supabase, mémoire conversationnelle, formulaire-cerveau, phrases longues, médias/audio, annonces actives, requêtes multiples prudentes, résultats groupés, alias V841 et décomposition serveur dynamique V842.

Aucun SQL supplémentaire n’est nécessaire pour V843.
