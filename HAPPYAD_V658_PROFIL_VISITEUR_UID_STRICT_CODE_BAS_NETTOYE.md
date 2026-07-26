# HAPPYAD V658 — Profil visiteur UID strict et code bas nettoyé

Base : V657.

Corrections ciblées :
- suppression du texte littéral `\n\n` visible sous les publications ;
- suppression de tout repli vers IndexedDB local pour un Profil visiteur ;
- verrouillage strict des publications et médias sur l’UID du visiteur ouvert ;
- rafraîchissement Supabase d’un média limité à `id + user_id` ;
- copie limitée aux champs média, sans modifier l’identité de la carte ;
- nettoyage unique des caches visiteurs potentiellement contaminés par V657 ;
- pagination et sauvegarde des caches filtrées par propriétaire.

Parties non modifiées : navigation V656, démarrage Accueil V655, scroll V654, menu V653, zoom V651.
