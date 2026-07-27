# HAPPYAD V788 — Push immédiat hors application + avatar exact

Base : `HAPPYAD_V787_PUSH_AVATAR_REEL_PNG_ANDROID.zip`

## Problèmes corrigés

1. Après la V787, certains téléphones ne montraient plus la notification lorsque HAPPYAD était fermé. Le Service Worker attendait un contrôle réseau de l'avatar avant `showNotification()`. Cette attente a été supprimée.
2. L'avatar réel de l'expéditeur n'était toujours pas affiché. Le système prend maintenant en priorité la photo réellement chargée dans l'interface Messages au moment de l'envoi.

## Corrections isolées

- Affichage du popup lancé immédiatement dès l'événement Push, sans `fetch`, proxy Netlify ou conversion d'image avant la notification.
- Retour au chemin de livraison hors application stable de la V784.
- L'avatar transmis par le téléphone de l'expéditeur est vérifié par l'UID authentifié.
- Les logos, badges et icônes HAPPYAD sont refusés comme avatar d'expéditeur.
- Les chemins `avatars/...`, `profile-photos/...` et `profile-images/...` sont traités comme des dossiers du bucket `happyad-media`.
- La fonction Supabase n'effectue plus de requête HEAD/GET bloquante avant d'envoyer le Web Push.
- Suppression du relais Netlify `/push-avatar/` introduit en V786/V787.
- Les moteurs Messages, Stories, Accueil, Profil et compteurs ne sont pas modifiés.

## Déploiement obligatoire

1. Déployer le ZIP V788 sur Netlify.
2. Déployer `SUPABASE_EDGE_FUNCTION_HAPPYAD_PUSH_PRODUCTION_V788.ts` dans la fonction Supabase `happyad-push-test`.
3. Ouvrir HAPPYAD une seule fois sur le téléphone destinataire pour installer le Service Worker V788, puis fermer complètement l'application et tester un nouveau message.
