# HAPPYAD V680 — Compteur Notifications stable

Base : **HAPPYAD V679**, avec le SQL social déjà installé.

## Zone corrigée

Uniquement le compteur rouge placé sur l’icône Notifications de l’Accueil.

## Cause identifiée

Le maître Notifications chargeait correctement les nouvelles lignes de `happyad_notifications`, mais il donnait la priorité à un ancien RPC de compteur. Sur certaines bases, ce RPC peut retourner `0` alors que les notifications non lues sont bien présentes. La liste apparaissait donc dans le centre Notifications, mais le badge de l’Accueil restait caché.

## Correction

- le compteur direct de `happyad_notifications` devient la source principale ;
- les lignes non lues déjà récupérées empêchent un faux retour à zéro ;
- le dernier compteur confirmé est restauré immédiatement depuis le cache pendant la reconnexion silencieuse ;
- le canal Realtime reste prioritaire ;
- une vérification silencieuse toutes les 30 secondes sert uniquement de secours lorsque Android suspend Realtime ;
- le badge disparaît seulement lorsque Supabase confirme réellement zéro notification non lue ;
- aucun changement dans Favoris, Republications, Partage, profils, Messages ou Vidéos.

## Fichiers modifiés

- `core/notification-master.js`
- `index.html`
- `service-worker.js`

Aucun nouveau SQL n’est nécessaire.
