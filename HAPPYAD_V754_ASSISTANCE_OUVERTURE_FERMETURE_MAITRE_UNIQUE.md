# HAPPYAD V754 — Assistance ouverture/fermeture maître unique

- Suppression des anciens maîtres V738/V751/V753 d’ouverture et fermeture.
- Un seul shell parent V754, une seule frame, un seul chemin open et un seul chemin close.
- Paramètres et Messages ouvrent uniquement sur click, sans pointerdown/pointerup concurrent.
- Le X ferme depuis le click terminé dans l’iframe; le shell reste au-dessus pendant 120 ms avant de rendre la page précédente interactive.
- Aucun history.back, aucun focus automatique sur l’ancien bouton, aucun bouton X parent superposé.
- Préchargement silencieux de la frame après le démarrage.
- Assistance V750 Realtime et Auth Storage V752 conservés.
