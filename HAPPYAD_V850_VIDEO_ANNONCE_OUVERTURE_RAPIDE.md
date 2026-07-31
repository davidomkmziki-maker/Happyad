# HAPPYAD V850 — Centrale vidéo vers annonce rapide

Base : HAPPYAD V849 Résultats avant précision.

Corrections ciblées :
- Le clic « Voir l’annonce » coupe immédiatement toutes les vidéos et tous les sons de la Centrale vidéo.
- Le bouton passe immédiatement à « Ouverture… » pour éviter les doubles clics.
- L’annonce active est transmise directement au Chat Marketplace afin d’éviter d’attendre le chargement complet de toutes les annonces.
- Le Chat est préchauffé uniquement lorsque la Centrale vidéo est ouverte, pas au démarrage général de l’application.
- Le Service Worker est renouvelé en V850.
- Les références obsolètes V848/V830 du cache critique sont remplacées par V850.
- Les fichiers vidéo, Chat et Marketplace critiques utilisent network-first-fast pour éviter de réafficher une ancienne correction.

Périmètre inchangé : Accueil, profils, messages, Push, Assistance, publication, vérification vendeur et SQL Supabase.

Aucun nouveau SQL requis.
