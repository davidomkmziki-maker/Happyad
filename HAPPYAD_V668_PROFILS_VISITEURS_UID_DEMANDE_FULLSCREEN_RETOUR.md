# HAPPYAD V668 — Profils visiteurs UID à la demande et fullscreen retour stable

Base stricte: V665.

1. Profil visiteur
- aucune publication de Mon profil ou de l'Accueil n'est utilisée comme secours;
- cache unique `HAPPYAD_PUBLIC_PROFILE_POSTS_<UID>`;
- un post sans propriétaire Supabase réel est refusé;
- changement d'UID = nouvelle frame et nouvelle grille.

2. Chargement à la demande
- aucune frame Profil visiteur n'est préchargée;
- la frame est créée au clic;
- elle est détruite lorsqu'on quitte le Profil visiteur;
- elle est recréée pour un autre UID.

3. Fullscreen photo
- le retour du fullscreen Profil passe par une seule fonction interne au Profil;
- l'application derrière est isolée;
- un bouclier court absorbe le clic fantôme après Retour;
- une nouvelle ouverture exige un nouveau toucher réel après le délai de sécurité.
