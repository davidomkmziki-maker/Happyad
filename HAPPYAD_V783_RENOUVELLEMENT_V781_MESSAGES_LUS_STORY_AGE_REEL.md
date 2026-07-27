# HAPPYAD V783 — Renouvellement propre de la V781

Base utilisée : `HAPPYAD_V781_PUSH_AVATAR_REEL_ACTIVATION_VOLONTAIRE.zip`

La V782 n’a pas été reprise. Le moteur Push et l’interface d’activation volontaire de la V781 sont conservés, tandis que les corrections Messages et Stories sont isolées.

## 1. Messages déjà lus qui ne se mettent pas à jour

### Défaut confirmé

Le frontend possède déjà le chemin canonique basé sur :

- `happyad_msg_conversation_members.last_delivered_seq` ;
- `happyad_msg_conversation_members.last_read_seq` ;
- `happyad_msg_mark_delivered(conversation_id, server_seq)` ;
- `happyad_msg_mark_read(conversation_id, server_seq)` ;
- un abonnement Realtime unique.

Mais l’état de l’autre membre pouvait rester ancien lorsque :

- la signature SQL de la RPC ne correspondait plus exactement au client ;
- la ligne membre de l’autre compte n’était pas lisible par Realtime à cause de RLS ;
- Android suspendait un événement Realtime ;
- un ancien cache conservait les anciennes coches.

### Correction V783

- RPC `happyad_msg_mark_delivered(uuid,bigint)` recréée avec la signature exacte.
- RPC `happyad_msg_mark_read(uuid,bigint)` recréée avec la signature exacte.
- Nouvelle RPC légère `happyad_msg_receipt_state(uuid)` qui retourne les quatre curseurs exacts des deux membres.
- `happyad_msg_conversation_members` est publiée en Realtime avec `REPLICA IDENTITY FULL`.
- Politique RLS : un membre peut lire les deux lignes membres de sa conversation, sans pouvoir lire les autres conversations.
- Le module Messages conserve Realtime comme chemin immédiat et ajoute une seule vérification bornée toutes les 3 secondes, uniquement lorsqu’une conversation est réellement visible.
- Vérification également après focus, retour dans l’application, retour du réseau et confirmation de lecture.
- Aucun retour à `happyad_msg_message_receipts`, `happyad_messages` ou une ancienne messagerie parallèle.

## 2. Âge de la Story bloqué à 0s

### Défauts confirmés

- L’âge était calculé une seule fois lors de l’ouverture du lecteur.
- Un timestamp absent ou invalide était remplacé silencieusement par `Date.now()`.
- Le secours local de « Ma Story » recréait parfois la Story avec `createdAt: Date.now()` à chaque rendu.

### Correction V783

- Parseur unique pour ISO, millisecondes et secondes Unix.
- Aucun timestamp manquant n’est plus transformé en faux « maintenant ».
- Le lecteur met l’âge à jour chaque seconde pendant son ouverture.
- Le Radar actualise ses âges chaque seconde sans reconstruire les cartes.
- Le secours local n’est accepté que s’il possède :
  - un vrai UUID de Story ;
  - le vrai `created_at` ;
  - une expiration encore valide.
- `modules/user.html` conserve désormais `storyCreatedAt` et `storyExpiresAt` depuis la ligne officielle Supabase.
- La source officielle reste uniquement `public.happyad_stories`.

## 3. SQL fournis

### A. Nettoyage des données existantes

`SUPABASE_HAPPYAD_V783_NETTOYAGE_MESSAGES_STORIES.sql`

Ce fichier :

- enlève les membres Messages non canoniques ;
- recrée les deux membres manquants ;
- normalise les curseurs négatifs, trop élevés ou incohérents ;
- impose `last_read_seq <= last_delivered_seq` ;
- recalcule le dernier message réel de chaque conversation ;
- répare `created_at`, `expires_at` et `is_active` des Stories ;
- désactive les Stories expirées.

Résultat attendu :

```text
invalid_message_cursors = 0
stories_without_created_at = 0
stories_with_invalid_expiry = 0
```

### B. Installation complète stable

`SUPABASE_HAPPYAD_V783_MESSAGES_LUS_STORIES_TEMPS_COMPLET.sql`

Ce fichier installe :

- le trigger de normalisation du temps des Stories ;
- les index actifs Stories ;
- la RPC de diagnostic `happyad_story_age_state_v783` ;
- la visibilité RLS sûre des curseurs Messages ;
- la RPC exacte de l’état des coches ;
- les RPC livré/lu, y compris les wrappers à un paramètre pour compatibilité ;
- Realtime pour membres Messages et Stories ;
- le rechargement du schéma PostgREST.

Les six valeurs du contrôle final doivent être `true`.

## 4. Nouvelle fonction Supabase

`SUPABASE_EDGE_FUNCTION_HAPPYAD_PUSH_PRODUCTION_V783.ts`

Il s’agit du moteur Push correct de la V781, renouvelé et réellement intégré dans :

`supabase/functions/happyad-push-test/index.ts`

Cette fonction ne crée aucune table Messages ou Story. Elle conserve :

- la livraison Push V781 ;
- l’endpoint actif unique ;
- l’identité/avatar multi-chemin ;
- le fallback HAPPYAD ;
- l’activation volontaire depuis Paramètres.

## 5. Ordre obligatoire

1. Sauvegarder la base Supabase.
2. Exécuter entièrement `SUPABASE_HAPPYAD_V783_NETTOYAGE_MESSAGES_STORIES.sql`.
3. Vérifier les trois valeurs à zéro.
4. Exécuter entièrement `SUPABASE_HAPPYAD_V783_MESSAGES_LUS_STORIES_TEMPS_COMPLET.sql`.
5. Vérifier les six valeurs `true`.
6. Remplacer le contenu de la fonction `happyad-push-test` par la fonction V783 et la déployer.
7. Déployer le ZIP V783 sur Netlify.
8. Ouvrir HAPPYAD avec Internet et actualiser une fois pour installer le Service Worker V783.

## 6. Tests

### Messages lus

1. Le compte A envoie un message à B.
2. B ouvre la conversation.
3. Chez A, les deux coches doivent devenir vertes sans rouvrir la conversation.
4. Fermer puis rouvrir A : l’état lu doit rester vert.
5. Tester aussi après mise en arrière-plan puis retour dans HAPPYAD.

### Âge Story

1. Publier une nouvelle Story.
2. Ouvrir immédiatement : 0 s doit évoluer vers 1 s, 2 s, 3 s, etc.
3. Fermer puis rouvrir : l’âge doit continuer depuis l’heure serveur, pas repartir à 0 s.
4. Vérifier la même Story dans le Radar et dans le Profil.
5. Après 24 heures, elle doit devenir inactive.

## 7. Contrôles techniques locaux

- `core/story-master-v699.js` : syntaxe valide.
- `service-worker.js` : syntaxe valide.
- `core/navigation-master-v668.js` : syntaxe valide.
- `core/main-tabs-master-v615.js` : syntaxe valide.
- `core/share-master.js` : syntaxe valide.
- 57 scripts intégrés dans `index.html` : valides.
- 4 scripts intégrés dans `modules/message-center.html` : valides.
- 88 scripts intégrés dans `modules/user.html` : valides.
- La fonction V783 intégrée dans le ZIP est identique au fichier autonome fourni.
