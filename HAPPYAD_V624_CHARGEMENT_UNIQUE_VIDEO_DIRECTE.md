# HAPPYAD V624 — chargement unique et vidéo directe

Corrections ciblées :

- Le squelette Profil et Messages reste visible jusqu’au vrai rendu du module.
- La page interne avec son propre cercle de chargement n’est plus exposée après le squelette.
- La centrale Vidéos ne montre plus de squelette : l’iframe vidéo réelle s’ouvre directement.
- La centrale Vidéos est préparée une seule fois en arrière-plan lorsque l’Accueil est au repos, puis réutilisée sans rechargement.
- Les anciennes surfaces V623 ne sont plus chargées par `index.html`.
- Service Worker V624 avec nouvelle clé de cache et suppression automatique des anciens caches HAPPYAD.

Aucun design, aucune table Supabase et aucun autre module métier n’ont été modifiés.
