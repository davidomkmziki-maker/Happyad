# HAPPYAD V793 — Chat V37 intégré depuis V791

Base utilisée : `HAPPYAD_V791_STICKER_HEUREUX_SANS_HALO_JAUNE.zip`.
La V792 et son mouvement multidirectionnel des yeux ne sont pas repris.

## Vérification du Chat V37

Le fichier `HAPPYAD_CHAT_CONNEXION_V37_SANS_DONNEES_TEST_PRET_INTEGRATION_HAPPYAD.html` contient les ponts nécessaires :

- `HAPPYAD_CHAT_READY` et `HAPPYAD_CHAT_INIT` ;
- modes `ask`, `offer` et `market` ;
- réception des vraies annonces ;
- réception de l’utilisateur connecté ;
- bouton Retour avec `HAPPYAD_CHAT_CLOSE` ;
- demande d’ouverture de la vraie conversation avec `HAPPYAD_OPEN_MESSAGE_DIRECT` ;
- absence d’annonces de démonstration.

## Intégration V793

- Le clic sur le sticker ouvre le Chat directement sur **Je cherche**.
- Le bouton **📍 Annonces** ouvre le même Chat directement sur **Annonces**.
- Le Chat est placé dans `modules/happyad-chat.html`.
- Une frame plein écran indépendante est créée uniquement au premier clic.
- Aucun maître de l’Accueil, du Radar, des Stories ou de la pagination n’est remplacé.
- Le bouton Retour ferme uniquement la frame et restaure l’Accueil à sa position.
- Les annonces sont alimentées par les publications réelles déjà chargées/cachées dans HAPPYAD, avec repli Supabase.
- L’identité réelle du compte connecté est transmise au Chat.
- **Contacter dans Messages HAPPYAD** ouvre le vrai maître Messages par UID et ne crée pas de conversation locale parallèle.
- Le contexte de l’annonce est conservé dans `HAPPYAD_PENDING_LISTING_CONTEXT_V793` pour la future carte de contexte Messages.
- Les flux Vérification vendeur et Publication ne sont pas déclarés comme transmis tant que leurs maîtres de production ne sont pas connectés.
- Cache Service Worker renouvelé en V793.
