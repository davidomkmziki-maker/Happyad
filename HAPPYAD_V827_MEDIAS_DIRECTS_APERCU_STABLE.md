# HAPPYAD V827 — Médias directs et aperçu stable

Base utilisée : `HAPPYAD_V821_BADGE_COUVERTURES_ACCUEIL_VIDEO.zip`.

## Correction ciblée

- Aucun système de conversion serveur ni file de préparation n'est ajouté.
- Les fichiers restent envoyés directement vers `happyad-media`, comme dans la publication normale.
- La multi-sélection cumulative reste active, jusqu'à 6 médias.
- Les types MIME génériques Android (`application/octet-stream`, type vide, téléchargement générique) sont remplacés localement par le type déduit du nom du fichier.
- Les photos et vidéos sont reconnues aussi par leur extension lorsque le téléphone ne fournit pas le bon type.
- Le même chargeur est utilisé dans :
  - la vignette de sélection ;
  - l'aperçu compact de l'annonce ;
  - le plein écran ;
  - le choix de la couverture.
- Pour chaque aperçu, HAPPYAD essaie dans l'ordre :
  1. la source MIME normalisée ;
  2. le fichier original ;
  3. une copie locale avec le type MIME corrigé.
- Une première erreur du lecteur ne détruit plus immédiatement l'aperçu.
- La vidéo plein écran n'est plus lancée automatiquement avant que ses métadonnées soient prêtes.
- Un média n'est plus interdit comme couverture uniquement parce qu'un premier essai local a échoué.
- Le fichier original reste celui envoyé à Supabase, sauf les photos volontairement recadrées/optimisées par l'éditeur.

## Formats reconnus par le sélecteur

Photos : JPG, JPEG, JFIF, PNG, WEBP, AVIF, HEIC, HEIF, GIF, APNG, BMP, TIFF, SVG, JXL, ICO et principaux RAW.

Vidéos : MP4, WEBM, MOV, QT, M4V, 3GP, 3G2, MKV, AVI, MPEG, MPG, OGV, OGG, TS, MTS, M2TS, FLV, F4V, WMV, VOB, ASF, DIVX, MXF, DV, RM, RMVB, H.264, H.265/HEVC et AV1.

La reconnaissance et l'envoi direct ne peuvent pas ajouter à Chrome un décodeur absent du téléphone. Un codec réellement non pris en charge par le navigateur peut rester sans aperçu local, mais il n'est plus faussement rejeté à cause d'un MIME vide ou générique.

## Installation

Aucun nouveau SQL V827 n'est requis.

Si le rollback V826B des essais V822/V823 n'a pas encore été exécuté avec succès, exécuter d'abord :
`SUPABASE_HAPPYAD_V826B_ANNULER_APRES_V821_SANS_SUPPRIMER_BUCKET.sql`.

Ensuite déployer le ZIP V827 et fermer complètement HAPPYAD avant de le rouvrir afin de charger le Service Worker V827.
