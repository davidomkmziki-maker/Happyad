# HAPPYAD V642 — Cartes vidéo profil et ordre Accueil stable

Base : V641.

## Correction 1 — cartes vidéo de Mon profil
- Restauration du moteur média stable de V638.
- Suppression du moteur V639 qui pouvait injecter une URL vidéo dans une balise image.
- Garde ciblée : une URL `.mp4/.webm/.mov` ne peut plus rester dans `<img>`.
- Aucune reconstruction des autres cartes.

## Correction 2 — ordre de l’Accueil
- Le dernier ordre réellement confirmé par Supabase est conservé dans `HAPPYAD_HOME_CONFIRMED_ORDER_V642`.
- À l’ouverture, cet ordre est prioritaire, même si Supabase est lent ou indisponible.
- Une ancienne publication sans date valide n’est plus marquée avec `Date.now()` et ne peut plus remonter artificiellement en tête.
- Les nouvelles réponses Supabase mettent à jour silencieusement le snapshot confirmé.
- Pagination 10/10 et fenêtre DOM inchangées.

Aucune modification des Stories, du zoom fullscreen, de la pagination Profil 9/9, du total J’aime V640 ou des ouvertures directes.
