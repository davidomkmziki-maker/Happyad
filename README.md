# HAPPYAD V698 — Barre de réponse Story extensible

Base : V697.

- La barre de réponse grandit vers le haut selon la longueur du texte.
- Une hauteur maximale est appliquée, puis le texte défile à l’intérieur sans barre de scroll visible.
- Envoyer, J’aime et Partager restent alignés et accessibles.
- Aucun SQL supplémentaire.

Voir `HAPPYAD_V698_BARRE_REPONSE_STORY_EXTENSIBLE.md`.

---

# HAPPYAD V696 — Accueil prépeint et Stories interactives directes

Base : V695.

- Prépeinture des cartes Accueil autour de l’écran pour éviter les zones noires lors d’un retour rapide.
- J’aime Story enregistré avec synchronisation silencieuse et notification Supabase.
- Icône Partager Story remplacée par un symbole de partage identifiable à trois points reliés.
- Réponse Story envoyée sans écran de traitement ; le destinataire ouvre la Story exacte depuis la carte du message.
- SQL requis une seule fois : `SUPABASE_HAPPYAD_STORY_LIKE_NOTIFICATIONS_V696.sql`.

Voir `HAPPYAD_V696_ACCUEIL_SCROLL_PREPEINT_STORIES_INTERACTIONS_DIRECTES.md`.

---

HAPPYAD V694 — Notifications : retour du dock et pagination Accueil stable

HAPPYAD V692 — Éditeur miniature vidéo compact et frame prête

# HAPPYAD V688 — Messages : médias locaux persistants

Cette archive part de V687. Elle conserve les médias ordinaires déjà téléchargés dans le stockage local privé, protège ce cache pendant les mises à jour et vérifie le fichier local avant de reproposer un téléchargement. Aucun SQL supplémentaire.

# HAPPYAD V687 — Retour exact vers le même onglet Profil

Base : V686.

Correction ciblée :

- depuis Favoris, Republier ou Privé, le retour d’une photo ou d’une vidéo revient exactement au même bouton ;
- même liste et même position de scroll conservées ;
- le contexte n’est plus supprimé avant les signaux de reprise du parent ;
- `APP_FRAME_VISIBLE`, `MODULE_RESUME`, `focus`, `pageshow` et fermeture Fullscreen partagent le même verrou de retour ;
- un clic volontaire sur un autre onglet reste prioritaire ;
- une nouvelle ouverture explicite de Mon profil depuis le menu inférieur démarre toujours sur Publications ;
- aucun changement Supabase et aucun SQL.

La version doit être validée sur téléphone avant de devenir la nouvelle base stable.

---

# HAPPYAD V686 — Ouverture des onglets Profil fiable

Base : V685.

Corrections ciblées :

- Favoris, Republier et Privé utilisent un seul ouvreur délégué au panneau, au lieu d’un écouteur tactile distinct sur chaque carte.
- Un toucher ouvre une seule publication ; le clic Android et le secours pointerup sont dédupliqués.
- Les photos utilisent le Fullscreen réel du profil ; les vidéos passent d’abord par l’ouvreur vidéo existant.
- Le verrou de réouverture photo accepte explicitement le geste réel des cartes V686.
- En ouvrant Mon profil ou un nouveau Profil visiteur depuis la navigation, l’onglet Publications est sélectionné par défaut.
- Le retour depuis une photo ou une vidéo ouverte dans Favoris, Republier ou Privé conserve l’onglet concerné.
- Les signaux multiples de reprise d’un même retour sont regroupés pour éviter qu’un second signal remette Publications par erreur.
- Aucun changement de Supabase, Messages, Notifications, Stories ou Centrale vidéo.
- Aucun SQL supplémentaire.

La version doit être validée sur téléphone avant d’être considérée comme nouvelle base stable.

---

# HAPPYAD V684

Base candidate : les onglets Favoris, Republier et Privé restent strictement isolés. Une publication de ces onglets n’utilise plus les anciens ouvreurs génériques du profil : un seul clic déclenche une seule ouverture, puis le verrou est libéré proprement au retour. En revenant sur Publications, le contrôleur de pagination et sa sentinelle sont reconnectés sans reconstruire la grille.

Voir `HAPPYAD_V684_OUVERTURE_UNIQUE_ONGLETS_PAGINATION_PUBLICATIONS.md`.


## HAPPYAD V685 — Ouverture au premier geste après retour
- Les cartes Favoris, Republier et Privé conservent leur DOM au retour photo/vidéo.
- Les signaux focus/pageshow/reprise sont regroupés et ne reconstruisent plus toute la grille sous le doigt.
- Une seule carte est armée par pointerdown/pointerup ; le clic synthétique suivant est neutralisé.
- Le verrou photo reconnaît le premier nouveau geste réel après fermeture, sans demander un second clic.
- La grille Publications et sa pagination restent inchangées.

## V700 — Notifications scroll infini maître unique
Le centre Notifications utilise maintenant une zone de défilement verticale indépendante. Le titre et les filtres restent fixes, la barre de scroll est invisible, chaque filtre garde sa position et la pagination Supabase continue silencieusement au bas de la liste. Aucun SQL supplémentaire.
