# HAPPYAD V625 — Ouverture directe de toutes les pages

Corrections ciblées :

1. **Mon profil, Messages, Publier, Vidéos et les autres pages internes** ouvrent maintenant directement leur vraie interface, sans squelette de navigation.
2. Les quatre onglets principaux sont préparés progressivement en arrière-plan une seule fois, puis leurs iframes restent montées et sont simplement affichées ou cachées.
3. Un clic pendant le préchargement transforme immédiatement la frame cachée en frame active : elle n’est plus remise en pause quand son chargement se termine.
4. **Profil visiteur** conserve le squelette pour verrouiller le bon UID avant l’affichage et empêcher qu’un autre profil apparaisse brièvement.
5. Nouveau Service Worker V625 et nouvelle clé de rechargement pour éviter le mélange avec le cache V624.

Aucun changement de design, de Supabase ou de logique métier.
