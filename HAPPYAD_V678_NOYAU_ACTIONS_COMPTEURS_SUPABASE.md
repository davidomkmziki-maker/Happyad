# HAPPYAD V678 — Noyau actions et compteurs Supabase

Base : **HAPPYAD V677**, elle-même issue de la base stable V669.

## Corrections de ce lot

- Un même état partagé gère désormais séparément **J’aime**, **Favoris** et **Republication**.
- Le compteur Favoris est disponible sur l’Accueil, les Fullscreen photo, Mon profil, Profil visiteur et la Centrale Photo.
- Les cinq actions sont réparties sur une grille responsive et ne débordent plus lorsque les nombres augmentent.
- J’aime, Favoris et Republication changent immédiatement de couleur et de compteur, puis Supabase est vérifié silencieusement.
- En cas d’échec réel Supabase, seule l’action concernée revient à son état précédent.
- Les réponses Supabase ne peuvent plus confondre une republication avec un favori.
- Mon profil et Profil visiteur disposent d’un maître final pour Posts, Abonnés, Abonnements et J’aime : cache de dernière valeur Supabase confirmée, actualisation silencieuse, protection contre les remises temporaires à zéro et le clignotement.
- La Centrale Photo utilise une seule ligne de cinq actions ; l’ancien doublon visuel Republier est masqué.
- Cache PWA passé à V678.

## Hors de ce lot

Les connexions vers les onglets Favoris/Republications, les notifications, la persistance des médias Messages et le chantier des vidéos noires restent volontairement séparés pour les étapes suivantes.
