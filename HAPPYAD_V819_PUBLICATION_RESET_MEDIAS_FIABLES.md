# HAPPYAD V819 — Publication réinitialisée et médias fiables

Base : V818.

## Corrections

- Après confirmation Supabase, passage automatique dans **Annonces** sur la catégorie publiée.
- La nouvelle annonce est mise en évidence quelques secondes.
- Le formulaire **Je propose** est remis intégralement à zéro après le succès : détails, documents, attestation, aperçu, médias, messages et étape active.
- Relecture de `happyad_posts` après publication afin de conserver la liste cumulative des annonces.
- Les images choisies sont décodées, orientées, redimensionnées au besoin et normalisées en JPEG avant l’aperçu et l’envoi.
- Les vidéos sont contrôlées avant ajout ; seuls MP4 et WEBM réellement lisibles sont conservés.
- Les formats impossibles à afficher sont refusés avec un message clair au lieu de produire une vignette cassée.
- Les anciennes URL locales `blob:` ne sont plus interprétées comme des médias d’annonces enregistrées.
- Les cartes Recherche, Annonces, Détails et les miniatures utilisent un visuel HAPPYAD propre si une URL distante échoue.

## Installation

Aucun nouveau SQL. Déployer le ZIP V819, fermer entièrement l’ancienne page puis rouvrir HAPPYAD afin d’activer le Service Worker V819.
