# HAPPYAD V786 — PHOTO RÉELLE DANS LE POPUP PUSH

Base : V785, elle-même issue de V784.

## Cause exacte corrigée
La V785 récupérait la vraie photo, mais après préchargement elle donnait à Android une pseudo-adresse `__happyad_push_avatar__/...img` disponible seulement dans le CacheStorage du Service Worker. Certains téléphones ne peuvent pas utiliser cette pseudo-adresse comme icône de notification et remplacent silencieusement l’image par le logo HAPPYAD.

## Correction V786
- La photo de l’expéditeur reste l’URL exacte reçue du profil.
- Pour les téléphones qui refusent une icône distante, la photo passe par `/.netlify/functions/happyad-push-avatar`.
- Cette adresse est sur le même domaine que HAPPYAD et renvoie un vrai JPEG/PNG/WebP avec son Content-Type.
- Le Service Worker ne transmet plus jamais une URL artificielle du CacheStorage à `showNotification`.
- Le logo HAPPYAD reste seulement le dernier secours quand aucune photo réelle n’existe.
- Aucun changement sur la livraison Push, les messages, les compteurs ou les Stories.

## Déploiement
Déployer le ZIP complet sur Netlify. Le nouveau Service Worker V786 et la fonction Netlify avatar seront installés ensemble. Après le premier chargement de V786, fermer complètement HAPPYAD puis envoyer un nouveau message de test.
