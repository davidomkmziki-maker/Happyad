# HAPPYAD V777 — Push avatar exact, badge HAPPYAD et réception hors application

Base : `HAPPYAD_V776B_PUSH_RAPPEL_24H_LIEN_ACTIF_UNIQUE_SQL_CORRIGE.zip`

## Point 3 corrigé

### Notification Messages

- La photo HTTPS exacte de l’expéditeur devient prioritaire dans `NotificationOptions.icon`.
- Le petit badge système reste `icons/happyad-notification-badge-96.png` afin d’identifier HAPPYAD.
- Si l’avatar est vide, invalide ou impossible à charger, la notification réessaie avec le logo HAPPYAD.
- Le nom de l’expéditeur reste le titre et l’aperçu réel du message reste le corps.
- Le clic conserve l’UID, la conversation, le message, le nom, l’avatar, le badge et le handle de l’expéditeur.

### Un seul lien actif, y compris côté fonction serveur

La fonction Supabase V777 ne prend qu’une souscription active par destinataire. Même si une ancienne ligne anormale subsiste, elle choisit la ligne `updated_at` la plus récente et n’envoie pas à plusieurs endpoints.

### Test hors application

Le popup `Tester hors application` programme un Push dans 12 secondes. Après avoir touché `Tester`, il faut fermer HAPPYAD et retirer Chrome de l’écran, sans utiliser `Forcer l’arrêt`.

## Fichiers modifiés

- `service-worker.js`
- `core/push-master.js`
- `index.html`

## Fonction Supabase à redéployer

Fichier complet :

- `SUPABASE_EDGE_FUNCTION_HAPPYAD_PUSH_PRODUCTION_V777.ts`
- copie prête dans `supabase/functions/happyad-push-test/index.ts`

Le nom de la fonction doit rester `happyad-push-test`, car le module Messages et le test utilisent déjà ce chemin.

## Ordre de déploiement

1. Confirmer que le SQL V776B s’exécute sans erreur et affiche `accounts_with_conflict = 0`.
2. Remplacer le code de la fonction Supabase `happyad-push-test` par le fichier V777 et déployer la fonction.
3. Déployer le ZIP V777 sur Netlify.
4. Ouvrir HAPPYAD une fois pour installer le Service Worker V777 et réenregistrer le lien actif.
5. Toucher `Tester`, fermer HAPPYAD et Chrome, puis attendre 12 secondes.
6. Faire ensuite un test réel depuis un deuxième compte avec une photo de profil publique HTTPS.

## Conditions nécessaires pour recevoir quand tout est fermé

- autorisation Notifications accordée ;
- souscription Push active enregistrée dans Supabase ;
- Service Worker V777 installé ;
- téléphone connecté au réseau ;
- notifications de Chrome/HAPPYAD non désactivées dans Android ;
- Chrome ou la PWA non placés en état `Forcer l’arrêt` ;
- données du site et Service Worker non supprimés.

## Limite de vérification

Le code et le chemin de test sont vérifiés dans l’archive, mais la réception réelle sur un téléphone ne peut être confirmée qu’après déploiement de la fonction Supabase et du ZIP, puis exécution du test de 12 secondes sur l’appareil.
