# HAPPYAD V637 — Zoom naturel uniquement dans le fullscreen photo

Base : V635 validée.

## Correction ciblée
- Zoom photo ajouté uniquement dans `#happyadHomePhotoFullscreen`.
- Pincement à deux doigts de 1× à 4×.
- Déplacement à un doigt uniquement lorsque la photo est agrandie.
- À 1×, le glissement horizontal natif des albums reste prioritaire.
- Le zoom est remis à zéro au changement de photo, à la fermeture et à la prochaine ouverture.
- Les clics produits après un pincement sont neutralisés pour éviter une fermeture involontaire.

## Zones non modifiées
- Cartes de l’Accueil.
- Cartes de Mon profil et Profil visiteur.
- Pagination et chargement au scroll.
- Affichage multi-albums dans les cartes.
- Stories et vidéos.
- Supabase.
