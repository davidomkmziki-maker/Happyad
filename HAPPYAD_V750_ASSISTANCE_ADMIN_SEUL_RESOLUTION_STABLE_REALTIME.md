# HAPPYAD V750 — Assistance : agent seul, résolution terminale et Realtime stable

Base : HAPPYAD V749.

## Corrections

1. Après transmission du dossier au pays choisi, le moteur automatique ne répond plus aux nouveaux messages utilisateur. Seul l’agent poursuit la discussion jusqu’à résolution ou fermeture.
2. Le bouton Résolu masque immédiatement la barre de saisie et verrouille localement la discussion, même pendant le délai de confirmation Supabase. La saisie revient uniquement avec une nouvelle discussion.
3. Le message d’appréciation est un vrai dernier message permanent (`resolved-appreciation`) après la carte de fin de session.
4. Chaque message et chaque carte transmet son `timelineOrder`, son type, sa sémantique et un manifeste compact du fil dans Supabase, afin que l’Admin puisse restituer l’ordre exact lors de sa prochaine correction.
5. Realtime V750 : protection contre une ancienne réponse serveur qui rouvrirait un dossier résolu, reconnexion du canal après erreur/timeout, regroupement des événements et marquage lu sans boucle répétitive.

## Maîtres

- `modules/assistance.html`
- `core/assistance-supabase-realtime-v750.js`
- `core/assistance-integration-master-v738.js`

Aucun nouveau SQL n’est requis.
