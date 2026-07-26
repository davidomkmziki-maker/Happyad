# HAPPYAD V657 — Profil visiteur : récupération complète des images

Base : V656 validée.

Correction ciblée : publications noires ou images introuvables dans le Profil visiteur.

- lecture des URL directes, chemins Supabase Storage, tableaux, JSON et objets média ;
- prise en charge de `media_path`, `storage_path`, `images`, `media_items`, `attachments`, etc. ;
- conversion des chemins `happyad-media` en URL publique ;
- essai successif des différentes sources d'une publication ;
- récupération distante de la ligne Supabase uniquement après échec des sources locales ;
- nouvelle tentative des cartes bloquées en chargement ou en fallback ;
- fond neutre visible au lieu d'une carte noire permanente ;
- aucune modification du retour fullscreen V656, du scroll V654, du menu V653, du zoom V651 ou de l'Accueil V655.
