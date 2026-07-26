# HAPPYAD V767 — Accueil : hydratation média unique

Base : `HAPPYAD_V766_ACCUEIL_SCROLLBY_PROTEGE.zip`

Correction isolée du point 2 de l’audit Accueil :

- `observeHomeCard()` dans `index.html` reste l’unique moteur autorisé à appeler `hydrateMedia()` pour les cartes de l’Accueil.
- `core/home-scroll-prepaint-master-v696.js` ne lance plus aucun média, album, vidéo, requête Storage ou lecture de blob.
- Le prépeint V696 est conservé uniquement pour mémoriser et repeindre les images déjà créées par le moteur maître.
- Le `MutationObserver` du prépeint peut encore détecter les nouvelles cartes, mais il ne démarre plus leur hydratation immédiatement.
- La protection `scrollBy()` de la V766 reste intacte.
- La version du Service Worker et les URLs de cache sont renouvelées pour empêcher le navigateur de conserver l’ancien prépeint.

Parties non modifiées : distances de pagination, scans de cartes du prépeint, classe de scroll rapide, `content-visibility`, Radar, Sponsor, compteurs Supabase, Profils, Messages, Vidéos, Notifications, Assistance, Admin et SQL.
