# HAPPYAD V644 — Profil statique et flèche retour en haut

- Suppression du système V643 de réduction de la vraie tête.
- Suppression des anciens styles de tête compacte/clonée V569/V619/V620.
- Le profil reste entièrement statique dans le flux normal.
- Une seule flèche transparente apparaît après la 7e ligne de la grille (21 cartes pour 3 colonnes).
- La flèche utilise un seul écouteur `scroll` passif, regroupé par `requestAnimationFrame`.
- Le seuil est calculé uniquement au rendu, au redimensionnement ou à la réouverture du profil.
- Aucun accès Supabase, aucune pagination, story, publication ou fenêtre fullscreen n’a été modifié.
