# HAPPYAD V840 — Recherche multiple groupée

Base : HAPPYAD V839.

Corrections ciblées :
- une seule opération de recherche pour un message contenant plusieurs demandes ;
- un seul résumé assistant ;
- résultats regroupés et numérotés par demande ;
- une seule question finale « Résultats utiles ? » ;
- conservation des critères propres à chaque demande et des champs communs comme la ville ;
- aucune séparation d’une demande riche telle que « véhicule Nissan de type camion diesel » ;
- texte utilisateur conservé avec ses retours à la ligne et sa numérotation ;
- nouvelle RPC dynamique `happyad_chat_search_batch_v1` pour améliorer plus tard le groupement dans Supabase sans redéploiement.

Aucune table, règle, fonction V2, donnée d’intelligence ou correction média/audio précédente n’est supprimée.
