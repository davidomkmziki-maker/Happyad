# HAPPYAD V779 — Popups Push rétablis

Base : V778.

## Défaut confirmé

Le fichier `core/push-master.js` avait été modifié en V778, mais `index.html` continuait à le charger avec l'ancienne URL de cache `push-v41-avatar-badge-background`. Le navigateur et le Service Worker pouvaient donc mélanger un ancien maître client avec le nouveau Service Worker et la nouvelle fonction serveur.

La V778 avait aussi ajouté plusieurs lectures de profil avant l'envoi et une option `image` supplémentaire dans la notification. Ces éléments ne doivent jamais pouvoir bloquer la livraison du popup.

## Corrections V779

- URL réelle du maître Push passée à `push-v43-popup-delivery-priority` dans `index.html` et dans le cache du Service Worker.
- Service Worker passé à V779.
- Chaque Push de message reçu affiche maintenant un popup système, même si HAPPYAD est ouvert.
- Suppression de l'option `image` risquée ; l'avatar reste essayé uniquement comme `icon`.
- En cas d'échec de l'avatar distant, réessai immédiat avec le logo HAPPYAD local.
- Nouveau test hors application autorisé grâce à une nouvelle clé de test.
- Réenregistrement automatique de la souscription au premier démarrage V779.
- Fonction Supabase ramenée au chemin d'envoi fiable de la V777 : un endpoint actif, avatar optionnel, aucune recherche multi-table susceptible de retarder ou bloquer l'envoi.

## Déploiement obligatoire

1. Remplacer le contenu de la fonction Supabase `happyad-push-test` par `SUPABASE_EDGE_FUNCTION_HAPPYAD_PUSH_PRODUCTION_V779.ts`.
2. Déployer la fonction.
3. Déployer le ZIP V779 sur Netlify.
4. Ouvrir HAPPYAD une fois, puis actualiser une fois.
5. Ouvrir Profil → Paramètres → Notifications et toucher Réenregistrer/Activer.
6. Lancer Tester hors application et fermer HAPPYAD/Chrome normalement.

Le SQL V776B reste valable et ne doit pas être réexécuté s'il s'est déjà terminé sans conflit.
