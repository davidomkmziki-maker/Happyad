# HAPPYAD V626 — Notifications directes sans squelette

Correction ciblée depuis V625 :

- la centrale Notifications est montée une seule fois dès le démarrage de l’application ;
- le clic sur la cloche affiche directement la vraie page Notifications ;
- l’ancien écran intermédiaire composé de lignes et d’avatars factices est supprimé ;
- l’iframe Notifications reste conservée en mémoire après fermeture et n’est pas recréée au prochain clic ;
- l’actualisation des notifications continue silencieusement dans la page réelle ;
- le Profil visiteur reste la seule page autorisée à utiliser le squelette de verrouillage UID ;
- le Service Worker passe à V626 et retire les anciens caches HAPPYAD.

Aucune modification du design interne des Notifications, de Supabase ou des règles métier.
