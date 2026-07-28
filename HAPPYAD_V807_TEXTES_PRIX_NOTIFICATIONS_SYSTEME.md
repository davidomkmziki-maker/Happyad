# HAPPYAD V807 — Textes publics, prix/devise et Notifications Système

Base : HAPPYAD V806.

Corrections :
- aucune mention utilisateur de Supabase ou de données internes dans la vérification Chat ;
- « administrateur » remplacé par « équipe HAPPYAD » dans les messages utilisateur ;
- prix des annonces forcé en blanc et devise ajoutée même si un ancien `price_label` ne la contenait pas ;
- pont central de Notifications Système pour dossier transmis, en examen, approuvé, refusé et annonce publiée ;
- correction d’un conflit V803/V804 : `index.html` chargeait un fichier V803 inexistant alors que le vrai maître est `product-publication-supabase-master-v804.js` ;
- viewport clavier V806, sticker, Accueil, Messages et profils conservés.

SQL requis : `SUPABASE_HAPPYAD_V807_NOTIFICATIONS_SYSTEME_VALIDATIONS_ANNONCES.sql`.
