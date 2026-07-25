# HAPPYAD V748 — Assistance moteur restauré, ouverture prête et X stable

Base : HAPPYAD V747.

## Cause confirmée
Le remplacement de la fonction de réponse rapide dans une version précédente avait supprimé accidentellement plusieurs fonctions placées entre `assistantReply()` et `renderMessage()` :
- `categoryById`
- `topicById`
- `formatSolution`
- `greeting`
- `greetingAnswer`
- moteur de correspondance texte/catégorie/problème
- `closeAsResolved`
- `routeToAdmin`

Conséquences : les cartes restaient visibles mais un clic produisait une erreur JavaScript ; les messages libres ne recevaient plus de réponse ; la redirection vers un agent pouvait échouer.

## Corrections
- restauration complète des 13 fonctions centrales ;
- reconnaissance Unicode conservée pour les langues non latines ;
- sélection tactile captée par un geste court `pointerdown` → `pointerup`, avec `click` de secours ;
- réponse locale stable en environ 75–150 ms, puis synchronisation Supabase silencieuse ;
- rendu complet autorisé uniquement pour une action locale, rendu différentiel conservé pour Supabase ;
- la frame n’est visible et cliquable qu’après le signal READY réel du moteur Assistance ;
- préchauffage déplacé vers une période d’inactivité sûre au lieu de 80 ms après le démarrage ;
- le X utilise un seul chemin `pointerup`/`touchend`, sans double `pointerdown + touchstart` et sans clic fantôme vers la page située derrière ;
- aucun `history.back()` ni `reopen()` à l’ouverture ou à la fermeture.

## Tests fonctionnels exécutés
- 14 catégories rendues ;
- sélection d’une catégorie → 9 problèmes affichés ;
- sélection d’un problème normal → solution + boutons Résolu/Non résolu ;
- salutation libre → réponse immédiate ;
- demande libre « Je ne peux pas me connecter » → problème détecté et solution affichée ;
- problème administratif « Vérification et badge » → choix du pays affiché ;
- X autonome → page Assistance fermée ;
- aucune erreur JavaScript pendant ces parcours.

## Contrôles statiques
- 291 scripts contrôlés ;
- aucune erreur de syntaxe ;
- aucun identifiant HTML dupliqué ;
- aucune fonction déclarée en double ;
- 13 fonctions centrales présentes ;
- 22 fichiers du cache PWA présents ;
- cache PWA V748.
