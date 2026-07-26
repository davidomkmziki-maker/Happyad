# HAPPYAD V780 — Activation Push fiable et cache unique

Base : `HAPPYAD_V779_PUSH_POPUP_LIVRAISON_RETABLIE.zip`

## Défaut confirmé

La V779 contenait trois versions différentes du maître Push :

- `index.html` chargeait encore `push-master.js?v=push-v41-avatar-badge-background` ;
- le Service Worker préchargeait une URL V43 ;
- le fichier réel `core/push-master.js` déclarait le moteur V43.

Le navigateur pouvait donc continuer à exécuter l’ancien maître V41 alors que le SQL et le Service Worker utilisaient le nouveau chemin. C’est une cause directe possible du message générique « Impossible d’activer les notifications ».

Un second conflit existait : après l’enregistrement atomique réussi de la souscription, le client exécutait encore un nettoyage puis une lecture de vérification. Une panne de l’un de ces contrôles secondaires faisait déclarer toute l’activation comme échouée, même si l’endpoint avait déjà été enregistré.

## Correction V780

- `index.html`, le Service Worker et le fichier réel utilisent tous la même URL : `push-v44-activation-reliable`.
- Nouveau cache Service Worker V780 ; les anciens caches HAPPYAD sont supprimés à l’activation.
- L’appel RPC `happyad_push_register_subscription` devient l’unique étape serveur bloquante.
- Le nettoyage et la vérification du lien unique restent exécutés, mais en arrière-plan et sans annuler une activation déjà réussie.
- Délai maximum de 12 secondes pour attendre le Service Worker.
- Les erreurs sont maintenant différenciées : session, Service Worker, SQL/RPC, autorisation Android, ancien abonnement bloqué, réseau.
- Profil > Paramètres > Notifications affiche la dernière cause réelle lorsque l’autorisation est accordée mais que le lien n’est pas enregistré.
- Les popups V779 et la fonction Supabase V779 restent inchangés.

## Déploiement

1. Déployer le ZIP V780 sur Netlify.
2. Ouvrir HAPPYAD avec Internet.
3. Actualiser une première fois, attendre 3 à 5 secondes, puis actualiser une seconde fois.
4. Aller dans Profil > Paramètres > Notifications.
5. Toucher Activer ou Réenregistrer.

Le SQL V776B n’a pas besoin d’être réexécuté s’il s’est terminé sans erreur. Si V780 affiche explicitement que le SQL Push doit être réparé, réexécuter alors le SQL V776B complet.

## Contrôles techniques

- `core/push-master.js` : syntaxe valide.
- `service-worker.js` : syntaxe valide.
- 57 scripts JavaScript intégrés dans `index.html` : syntaxe valide.
- Fichiers fonctionnels modifiés : `index.html`, `service-worker.js`, `core/push-master.js`, `core/profile-settings-master-v722.js`.
