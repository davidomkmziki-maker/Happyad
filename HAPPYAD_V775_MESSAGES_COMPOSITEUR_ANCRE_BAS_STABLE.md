# HAPPYAD V775 — Messages : compositeur ancré en bas et croissance stable

Base : `HAPPYAD_V774_ACCUEIL_GEOMETRIE_CSS_UNIQUE_CARTES_PREPAREES.zip`

## Point 1 corrigé — Barre de saisie Messages

### Problème confirmé
Quand le texte passait à la deuxième ligne, plusieurs mécanismes déplaçaient simultanément l’interface :

- redimensionnement du `textarea` ;
- `ResizeObserver` du compositeur ;
- `scrollChatToLatest()` ;
- `scrollIntoView()` sur le dernier message ;
- `scrollIntoView()` sur le compositeur lors des événements du clavier.

La fonction clavier recréait aussi à chaque appel :

- un écouteur `storage` ;
- un `BroadcastChannel` d’identité.

Ces écouteurs pouvaient donc s’accumuler pendant les ouvertures du clavier et les changements de hauteur.

### Correction V775

- Le compositeur reste physiquement ancré en bas du `chatView`.
- Le champ grandit vers le haut lorsque la deuxième ligne apparaît.
- Le redimensionnement conserve l’écart exact avec le bas seulement si l’utilisateur était déjà proche du dernier message.
- Si l’utilisateur lit d’anciens messages plus haut, la saisie ne le renvoie pas en bas.
- `scrollIntoView()` est supprimé du chemin du clavier et du chemin « dernier message ».
- `chatBody` devient l’unique conteneur autorisé à ajuster son propre `scrollTop`.
- Le `ResizeObserver` ne lance plus les multiples corrections temporisées de `scrollChatToLatest()`.
- Le focus programmatique utilise `preventScroll:true` lorsque le navigateur le permet.
- Les écouteurs d’identité sont maintenant liés une seule fois à l’initialisation du module.
- `overflow-anchor:none` empêche le navigateur de choisir le champ ou le compositeur comme ancre de scroll.

## Vérification préparatoire — Un seul lien Push actif

Le code actuel n’assure pas encore de façon démontrable qu’un seul ancien lien reste actif.

### Constats

- `happyad_push_register_subscription` enregistre l’endpoint courant.
- Ensuite, le client appelle `happyad_push_cleanup_own_subscriptions`, mais cette RPC est optionnelle, sans paramètres et son résultat est ignoré.
- Le code SQL ou la fonction serveur de cette RPC n’est pas présent dans le ZIP ; son comportement réel ne peut donc pas être confirmé ici.
- À la déconnexion, le navigateur exécute `unsubscribeLocal()`, mais ne désactive pas obligatoirement la ligne correspondante côté Supabase avant l’unsubscribe.
- Des endpoints créés depuis d’anciens domaines ou anciens liens Netlify peuvent donc rester actifs côté serveur.

### Règle à appliquer au prochain point Push

La prochaine activation doit devenir l’unique destination du compte :

1. enregistrer l’endpoint courant ;
2. désactiver atomiquement tous les autres endpoints du même utilisateur ;
3. ne garder actif que l’endpoint courant ;
4. lors d’une déconnexion, désactiver l’endpoint côté Supabase avant l’unsubscribe local ;
5. la fonction d’envoi doit sélectionner uniquement les lignes actives ;
6. un nouvel endpoint remplace les anciens liens du même compte.

Cette partie Push n’est pas modifiée dans la V775 afin de garder le point 1 Messages isolé.

## Fichiers modifiés

- `modules/message-center.html`
- `core/navigation-master-v668.js` — version d’URL du module Messages
- `core/main-tabs-master-v615.js` — version d’URL du module Messages
- `core/share-master.js` — version d’URL de secours du module Messages
- `index.html` — versions actives et enregistrement du Service Worker
- `service-worker.js` — cache V775

## Contrôles

- Scripts intégrés de `modules/message-center.html` : syntaxe valide.
- 58 scripts intégrés de `index.html` : syntaxe valide.
- Scripts de navigation actifs : syntaxe valide.
- Service Worker : syntaxe valide.
- Aucune modification de Supabase, des tables, du Push, de l’Accueil, des Profils, des Vidéos, des Stories, des Notifications, de l’Assistance ou de l’Admin.
