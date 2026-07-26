# HAPPYAD V696 — Accueil prépeint et Stories interactives directes

Base : HAPPYAD V695.

## 1. Accueil — scroll rapide sans cartes noires

- Les cartes déjà chargées restent dans le DOM comme en V695.
- Les images situées autour de l’écran sont décodées et prépeintes avant leur retour dans la zone visible.
- Une copie visuelle locale de l’image chargée reste derrière le média afin d’éviter une surface noire pendant une recomposition Android.
- Pendant un défilement très rapide, les effets coûteux (ombres, filtres, transitions) sont suspendus brièvement, puis restaurés.
- Les nouvelles cartes ajoutées par pagination sont préparées automatiquement.
- Aucun changement de l’ordre serveur, de la pagination V694 ou de la limite générale de l’Accueil.

## 2. Story visiteur — J’aime réel

- Le cœur change immédiatement et conserve son état par compte.
- L’action est enregistrée dans `happyad_content_actions` avec `content_type = story`.
- Une vérification Supabase silencieuse confirme l’état sans clignotement.
- Le SQL V696 ajoute la notification `story_like` au propriétaire de la Story.
- Les J’aime sur sa propre Story ne produisent pas de notification.

## 3. Story visiteur — partage reconnaissable

- L’ancien symbole ambigu est remplacé par un symbole de partage SVG à trois points reliés.
- Le partage continue d’utiliser le maître de partage HAPPYAD existant.

## 4. Réponse directe à une Story

- Le texte disparaît immédiatement du champ au moment de l’envoi.
- Aucun écran de traitement ni message de réussite n’est affiché.
- En cas d’échec réel seulement, le texte est restauré.
- Le message reçu contient une carte « Réponse à la story ».
- Un clic sur cette carte ouvre directement la Story exacte grâce à son `story_id`, son propriétaire et ses métadonnées.
- Les notifications Story qui contiennent un identifiant Story ouvrent également cette Story directement.

## Installation Supabase

Exécuter une seule fois, après le SQL social V679 :

`SUPABASE_HAPPYAD_STORY_LIKE_NOTIFICATIONS_V696.sql`

Aucun autre SQL n’est requis.

## Parties préservées

- Miniature vidéo globale V693.
- Pagination Accueil et retour du dock V694.
- Cartes persistantes V695.
- Retour exact vers le même onglet Profil V687.
- Médias Messages persistants V688.
