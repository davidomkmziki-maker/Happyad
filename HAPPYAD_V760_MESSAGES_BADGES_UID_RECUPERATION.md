# HAPPYAD V760 — Messages : récupération des badges par UID

Base : `HAPPYAD_V759_MESSAGES_AVATARS_UID_STRICT.zip`

## Correction ciblée

- Le badge officiel d’un correspondant est recherché dans `profiles` avec son UID réel.
- Compatibilité avec les comptes récents liés par `profiles.id` et les anciens comptes liés par `profiles.user_id`.
- Lecture élargie des champs historiques de badge : `badge`, `user_badge`, `badge_type`, `verified_badge`, `verification_badge`, métadonnées et indicateurs de vérification.
- La correction s’applique à la liste des conversations, à l’en-tête du chat, au sélecteur de contacts et à la recherche de comptes.
- Une valeur officielle trouvée complète les données existantes, mais une ligne ancienne ou incomplète ne supprime pas un badge déjà fourni par la conversation.

## Protections conservées

- L’isolation stricte des photos V759 reste active.
- Aucun avatar, nom ou UID n’est remplacé par le système de badge.
- Aucun changement dans le Profil visiteur V758, l’Accueil, l’Assistance, Supabase SQL ou l’Admin.
- Aucun nouveau moteur parallèle n’a été créé.

## Vérifications

- Syntaxe des scripts intégrés de `modules/message-center.html` validée avec Node.js.
- Syntaxe de la navigation, des onglets, du partage et du Service Worker validée.
- Cas testés : badge bleu direct, badge violet récupéré par `user_id`, badge booléen historique, badge dans les métadonnées et conservation d’un badge existant lorsque la ligne distante est incomplète.
