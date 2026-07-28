# HAPPYAD V804 — Audit et correction ciblée de V803

Base : `HAPPYAD_V803_PUBLICATION_PRODUIT_SUPABASE_CENTRALE_EXISTANTE.zip`.

## Erreurs confirmées dans V803

1. La publication pouvait afficher un succès après un simple `postMessage`, même sans réponse du maître Publication ni confirmation Supabase.
2. La lecture filtrée de `happyad_posts` pouvait retourner une liste vide et masquer les anciennes annonces réelles non encore marquées `happyad_marketplace = true`.
3. L'ouverture du Chat attendait systématiquement une lecture Supabase distante, alors que V802 donnait la priorité au maître existant et au cache local. Cette régression pouvait ralentir le premier affichage.
4. Le prix supprimait tous les séparateurs : une valeur décimale pouvait être transformée incorrectement.
5. Deux accès directs à `verifiedSeller.fullName` pouvaient provoquer une erreur JavaScript si le statut Admin n'était pas encore hydraté.
6. Le maître Produit dépendait du proxy de vérification installé plus tard. V804 conserve directement la référence du maître V801 chargé avant lui.

## Corrections V804

- succès affiché uniquement lorsque la réponse réelle contient `ok = true` et un identifiant de produit ;
- restauration de la priorité rapide V802 : maître existant, cache local, puis Supabase seulement si nécessaire ;
- repli sur les anciennes annonces si le filtre Marketplace ne renvoie aucune ligne ;
- lecture des prix avec virgule ou point décimal ;
- protection du statut et du nom du vendeur approuvé ;
- confirmation obligatoire de l'identifiant retourné par la RPC ;
- maître Produit renommé V804 et cache Service Worker renouvelé ;
- SQL V803 conservé : aucune nouvelle migration n'est nécessaire.

## Éléments inchangés

- SQL V801 et V803 ;
- validation des demandes par Admin V47 ;
- formulaire Vérification vendeur ;
- formulaire Produit ;
- sticker V799 ;
- Accueil, Stories, Profils et Messages ;
- correction Chrome/Google ;
- modes Je cherche, Je propose et Annonces de V802.
