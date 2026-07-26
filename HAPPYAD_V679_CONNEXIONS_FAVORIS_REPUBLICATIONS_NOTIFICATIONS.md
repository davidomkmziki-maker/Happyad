# HAPPYAD V679 — Connexions Favoris, Republications et Notifications

Base : **HAPPYAD V678**, issue de la base stable V669 puis du correctif Fullscreen V677.

## Zone corrigée

Cette version traite uniquement le deuxième chantier :

- Favoris reliés à Mon profil et aux notifications ;
- Republications reliées à Mon profil, au Profil visiteur et aux notifications ;
- Partages réels reliés aux notifications ;
- conservation des modules déjà stabilisés.

## Comportement obtenu

### Favoris

- L’onglet **Favoris** de Mon profil lit les actions `favorite/fav/save` du compte connecté depuis `happyad_content_actions`.
- Les publications apparaissent par pages de 9, puis se chargent au scroll.
- L’onglet reste privé et n’est jamais proposé sur un Profil visiteur.
- Le cache est séparé par UID et par onglet afin d’empêcher l’affichage des favoris d’un autre compte.
- Une vérification Supabase remplace silencieusement le cache sans flash vide.

### Republications

- L’onglet **Republier** fonctionne dans Mon profil et dans le Profil visiteur.
- Il récupère les actions `repost/republish/republication` du propriétaire réel du profil.
- Les publications sont chargées par pages de 9.
- Le retour depuis Photo/Vidéo conserve l’onglet et le bon UID.
- Aucune commande propriétaire (suppression, privé) n’est ajoutée sur une publication provenant d’un autre compte.

### Notifications

Le fichier SQL V679 installe :

- les notifications automatiques lors d’un nouvel ajout aux Favoris ;
- les notifications automatiques lors d’une Republication ;
- le RPC sécurisé des partages réels et ses notifications ;
- une déduplication par publication, acteur et type d’action ;
- l’absence de notification lorsqu’un utilisateur agit sur sa propre publication.

Le maître Notifications reconnaît explicitement les types `favorite`, `repost` et `share`.

## Fichier SQL à exécuter

Exécuter une seule fois dans Supabase :

`SUPABASE_HAPPYAD_SOCIAL_CONNECTIONS_V679.sql`

Sans cette exécution, les onglets Favoris/Republier peuvent lire les actions existantes, mais les nouvelles notifications serveur ne seront pas créées.

## Fichiers principaux modifiés

- `core/profile-master-v665.js`
- `core/profile-social-tabs-master-v679.js`
- `core/profile-social-tabs-master-v679.css`
- `core/notification-master.js`
- `modules/user.html`
- `index.html`
- `service-worker.js`
- `SUPABASE_HAPPYAD_SOCIAL_CONNECTIONS_V679.sql`

## Hors de cette version

- persistance des médias téléchargés dans Messages ;
- réparation des miniatures et vidéos noires ;
- modification du noyau V678 des compteurs et couleurs d’actions.
