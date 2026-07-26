# HAPPYAD V770 — Accueil : pagination en série unique

## Correction isolée du point 5

- Un verrou unique empêche deux vagues de pagination de travailler simultanément.
- Une tranche locale de cinq cartes attend deux peintures navigateur avant la tranche suivante.
- Le listener `scroll` de pagination concurrent est supprimé.
- `IntersectionObserver` devient l’unique déclencheur pendant le défilement.
- Resize et pageshow utilisent le même ordonnanceur temporisé.
- La distance de déclenchement passe d’environ 1650/1800 px à une zone dynamique de 650 à 1000 px, avec rootMargin de 950 px.
- Les réponses Supabase, doublons et reprises utilisent le même verrou et ne peuvent plus lancer plusieurs cycles parallèles.
- Les corrections V766 à V769 restent intactes.

## Périmètre intact

Taille des pages Supabase, ordre created_at/id, médias, Radar, Sponsor, compteurs, profils, messages, vidéos, assistance et administration non modifiés.
