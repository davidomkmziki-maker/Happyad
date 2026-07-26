# HAPPYAD V776 — Push : rappel 24 h et lien actif unique

Base : `HAPPYAD_V775_MESSAGES_COMPOSITEUR_ANCRE_BAS_STABLE.zip`

## Point 2 corrigé

Cette version corrige deux comportements du même chemin Push :

1. rappeler l’activation des notifications toutes les 24 heures tant que l’utilisateur ne les a pas activées ;
2. conserver un seul lien/endpoint Push actif par compte et supprimer les anciens liens.

Le point 3 concernant l’apparence du popup système, le logo HAPPYAD et la photo exacte de l’expéditeur n’est pas modifié dans cette version.

## 1. Rappel d’activation toutes les 24 heures

Le moteur `core/push-master.js` utilise maintenant une échéance propre à :

- l’UID du compte connecté ;
- l’installation actuelle de HAPPYAD.

Comportement :

- à la première ouverture connectée, le rappel apparaît si l’autorisation n’est pas accordée ;
- si l’utilisateur ferme le rappel avec X, la prochaine apparition est programmée 24 heures plus tard ;
- si HAPPYAD reste ouvert, une minuterie interne contrôle l’échéance ;
- si HAPPYAD était fermé, le rappel est revérifié à la prochaine ouverture ;
- les événements `pageshow`, `focus`, `visibilitychange`, retour en ligne et changement de session relancent la vérification ;
- si l’autorisation a été refusée définitivement, le rappel revient après 24 heures avec des instructions adaptées ;
- l’ancien délai global V1 est migré une seule fois vers la nouvelle clé par compte et installation.

Limite du système : avant que l’utilisateur accorde l’autorisation Push, Android/Chrome ne permet pas à HAPPYAD d’afficher ce rappel lorsque l’application est complètement fermée. Le rappel revient donc pendant une session ouverte ou à la prochaine ouverture après l’échéance.

## 2. Paramètres reliés au vrai système Push

Dans `Profil > Paramètres > Notifications`, une carte « Notifications du téléphone » affiche maintenant l’état réel :

- non prises en charge ;
- non autorisées ;
- bloquées par le navigateur ;
- autorisées mais non enregistrées ;
- actives sur le lien courant.

Le bouton de cette carte appelle directement le maître Push et peut :

- demander l’autorisation système ;
- créer ou renouveler la souscription ;
- réenregistrer le lien courant comme destination unique ;
- afficher les instructions lorsque le navigateur a bloqué l’autorisation.

Les interrupteurs de catégories existants sont conservés.

## 3. Un seul lien Push actif par compte

Le fichier SQL obligatoire `SUPABASE_HAPPYAD_PUSH_V776_UN_SEUL_LIEN_ACTIF.sql` travaille sur la table existante `happyad_push_subscriptions`.

Il :

- nettoie les doublons historiques par compte ;
- conserve la ligne active la plus récente ;
- supprime les autres endpoints du même compte ;
- ajoute une garantie unique sur `user_id` ;
- garde aussi un endpoint unique au niveau global ;
- remplace atomiquement l’ancien lien lors d’une nouvelle activation ;
- fournit une RPC de vérification après enregistrement ;
- supprime toutes les souscriptions du compte lors d’une déconnexion explicite ;
- termine par deux requêtes de contrôle.

Après installation, l’Edge Function existante peut continuer à sélectionner les lignes `enabled=true` : la table ne peut plus en contenir plusieurs pour le même compte.

## 4. Déconnexion sécurisée

La suppression serveur est appelée avant la fermeture de la session dans :

- le maître central d’authentification ;
- Paramètres > Déconnexion ;
- le bouton Déconnexion du Profil.

Même si le navigateur ne retrouve plus sa souscription locale, la RPC `happyad_push_disable_all_own_subscriptions()` supprime la ligne du compte côté Supabase.

## Ordre obligatoire d’installation

1. Ouvrir Supabase > SQL Editor.
2. Exécuter entièrement `SUPABASE_HAPPYAD_PUSH_V776_UN_SEUL_LIEN_ACTIF.sql`.
3. Vérifier que la dernière requête affiche `accounts_with_conflict = 0`.
4. Déployer ensuite le ZIP V776.
5. Ouvrir HAPPYAD avec un compte connecté.
6. Aller dans Profil > Paramètres > Notifications et activer ou réenregistrer le lien courant.

Sans l’exécution du SQL, le client V776 refusera de confirmer l’activation unique si plusieurs endpoints restent actifs.

## Fichiers modifiés

- `core/push-master.js`
- `core/profile-settings-master-v722.js`
- `core/auth-session-master-v598.js`
- `modules/user.html`
- `index.html`
- `service-worker.js`

## Fichier ajouté

- `SUPABASE_HAPPYAD_PUSH_V776_UN_SEUL_LIEN_ACTIF.sql`

## Cache et version

- Service Worker : `happyad-pwa-V776-push-24h-single-active-link-20260726-1`
- Push master : `HAPPYAD_PUSH_MASTER_V40A_24H_SINGLE_ACTIVE_LINK`
- Paramètres : `HAPPYAD_PROFILE_SETTINGS_V776_PUSH_SYSTEME_REEL`

## Contrôles réalisés

- syntaxe de `core/push-master.js` valide ;
- syntaxe de `core/profile-settings-master-v722.js` valide ;
- syntaxe de `core/auth-session-master-v598.js` valide ;
- syntaxe du Service Worker valide ;
- 145 scripts JavaScript intégrés à `index.html` et `modules/user.html` vérifiés ;
- seulement les six fichiers techniques annoncés diffèrent de la V775, avec le SQL et ce rapport ajoutés ;
- le point 1 Messages V775 est conservé ;
- l’Accueil V774 et les autres modules ne sont pas modifiés.
