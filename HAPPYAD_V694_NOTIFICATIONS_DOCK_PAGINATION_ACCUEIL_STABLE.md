# HAPPYAD V694 — Retour du dock Notifications et pagination Accueil stable

Base : V693.

## 1. Notification vers une publication

- Les routes internes `home_post`, `home_comment` et `notification_center` sont reconnues comme des états de l’Accueil pour le menu inférieur.
- La fermeture ou la remise de la page Notifications retire toujours ses styles et son verrou de dock.
- Le dock est réconcilié immédiatement, puis vérifié deux fois après le passage vers la publication pour absorber les signaux Android tardifs.
- La classe d’auto-masquage du scroll est nettoyée par le maître du dock uniquement lorsque aucun autre écran interne n’est ouvert.
- Les commentaires et les vrais Fullscreen conservent leurs propres règles de masquage.

## 2. Pagination de l’Accueil

- Le curseur Supabase reste toujours positionné sur la publication la plus ancienne déjà connue et ne revient plus vers la première page après lecture du cache.
- Les pages distantes composées uniquement de doublons sont traversées silencieusement, avec une limite de sécurité.
- Lorsqu’une nouvelle page est reçue, la limite de rendu augmente immédiatement : les nouvelles cartes ne restent plus invisibles derrière l’ancien bas du fil.
- Une sentinelle `IntersectionObserver` complète l’écouteur de scroll et relance le chargement au bas réel du fil.
- Le rendu virtuel, l’ordre serveur, les 10 publications initiales et la conservation des cartes restent inchangés.

Aucun SQL supplémentaire.
