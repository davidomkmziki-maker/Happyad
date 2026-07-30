# HAPPYAD V820 — Accueil, couverture, badges et vues des annonces

Base utilisée : `HAPPYAD_V819_PUBLICATION_RESET_MEDIAS_FIABLES.zip`.

## 1. Médias et multi-sélection

- Le sélecteur public garde `multiple` et accepte les fichiers reconnus comme images ou vidéos par leur type MIME ou leur extension.
- Formats élargis : JPEG/JFIF, PNG/APNG, WEBP, AVIF, HEIC/HEIF, GIF, BMP, TIFF, SVG, JXL, ICO, DNG/RAW et principaux formats photo de constructeurs ; MP4, WEBM, MOV, M4V, 3GP, MKV, AVI, MPEG, OGV, TS/MTS/M2TS, FLV, WMV, VOB, ASF et DIVX.
- Une nouvelle multi-sélection s’ajoute aux médias déjà choisis au lieu de les remplacer.
- Maximum conservé : 6 médias par annonce, 20 Mo par image et 100 Mo par vidéo.
- Un format que Chrome ne sait pas prévisualiser reste sélectionné et est représenté par une carte propre, sans icône cassée.
- La première couverture réellement prévisualisable est sélectionnée automatiquement.

## 2. Choix d’affichage dans l’Accueil

L’étape « Images et confirmation » contient le choix :

`Afficher aussi cette annonce dans l’Accueil`

- Activé : l’annonce est enregistrée avec `marketplace_show_on_home = true`.
- Désactivé : elle reste uniquement dans Annonces et les résultats du Chat.
- Les annonces Marketplace non choisies pour l’Accueil sont exclues du fil social.

## 3. Couverture et ouverture directe

- Le vendeur choisit parmi ses médias celui qui devient la couverture de l’Accueil.
- Le choix est conservé par `marketplace_cover_index`.
- Un trigger Supabase copie la couverture sélectionnée vers les champs média utilisés par l’Accueil.
- Une photo ouvre le plein écran de l’Accueil avec le bouton `Voir l’annonce`.
- Une vidéo ouvre la centrale Vidéo avec le même bouton.
- Le bouton ouvre directement la fiche exacte dans Annonces grâce à son identifiant.

## 4. Badge vendeur

- La carte Annonces lit le badge réel enregistré avec le profil vendeur.
- Le badge apparaît immédiatement à côté du nom lorsqu’il existe.
- La valeur `aucun` n’affiche aucun faux badge.
- Le badge est également présent dans la fiche complète.

## 5. Compteur de vues unique

- Nouvelle table : `public.happyad_listing_views`.
- Nouvelle RPC : `public.happyad_record_listing_view_v1`.
- Une vue est comptée lorsqu’une carte reste visible à au moins 55 % pendant environ 900 ms dans l’Accueil, le Chat ou Annonces.
- L’ouverture de la fiche et la lecture d’une couverture vidéo comptent également.
- Un même compte, ou un même appareil non connecté, ne compte qu’une fois par annonce.
- Le nombre est synchronisé dans `happyad_posts.listing_views_count` et affiché avec une petite icône œil dans Annonces.

## Installation

Exécuter les SQL V820 dans cet ordre :

1. `01_V820_COLONNES_ACCUEIL_COUVERTURE.sql`
2. `02_V820_TRIGGER_COUVERTURE_ACCUEIL.sql`
3. `03_V820_COMPTEUR_VUES.sql`

Déployer ensuite le ZIP V820. Les anciens SQL V810 à V817 ne doivent pas être rejoués.

## Contrôles réalisés

- Syntaxe de tous les fichiers JavaScript : validée avec Node.
- Syntaxe des 78 scripts intégrés dans `index.html`, `happyad-chat.html` et `video.html` : validée.
- Références locales HTML : aucune ressource manquante.
- Service Worker renouvelé en V820.
- Ancien maître de publication V819 retiré du chargement actif.
- Aucun SQL V820 ne supprime les annonces existantes.
