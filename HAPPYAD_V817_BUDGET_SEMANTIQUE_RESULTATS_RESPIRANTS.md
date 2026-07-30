# HAPPYAD V817 — Budget sémantique et résultats respirants

## Analyse de la recherche

La recherche conserve l’architecture hybride :

- Supabase `happyad_chat_understand_v1` comprend l’intention, la catégorie, le type, la marque, le modèle, le pays, la ville et le budget.
- Supabase `happyad_chat_search_posts_v1` présélectionne au maximum cinq annonces par catégorie.
- Le Chat vérifie ensuite chaque annonce réelle et calcule le pourcentage final uniquement avec les critères écrits par l’acheteur.

## Budget

V817 distingue désormais :

- `environ 400 USD` / `autour de 400 USD` : cible autour de 400, avec proximité progressive ;
- `maximum 400 USD` / `moins de 400 USD` : plafond strict ;
- `minimum 400 USD` / `à partir de 400 USD` : seuil minimum ;
- `exactement 400 USD` : prix exact ;
- `entre 350 et 450 USD` : fourchette.

Un montant accompagné d’une monnaie, sans opérateur, est interprété comme un prix recherché autour de ce montant, jamais automatiquement comme un maximum.

## Interface

Après la reformulation concise, V817 affiche directement les résultats :

- suppression du bloc « Demande comprise » ;
- suppression du long texte expliquant le calcul ;
- critères conformes masqués ;
- affichage d’au maximum deux écarts utiles sur une carte ;
- bouton « Voir plus » masqué lorsqu’il n’existe pas de résultat supplémentaire ;
- satisfaction réduite à « Résultat utile ? — Oui / Préciser ».

## Exemple attendu

Message : `Bonjour je cherche un téléphone Samsung à Bunia environ 400$`

Reformulation : `Recherche : téléphone Samsung à Bunia, autour de 400 USD.`

Le prix 450 USD est considéré comme proche de 400 USD, et non comme un dépassement d’un budget maximum.
