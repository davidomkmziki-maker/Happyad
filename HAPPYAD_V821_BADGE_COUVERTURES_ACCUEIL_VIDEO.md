# HAPPYAD V821 — badge officiel et couvertures Accueil/Vidéo réellement reliées

## Corrections

1. La centrale Annonces utilise maintenant la forme officielle du badge HAPPYAD (étoile dentelée avec coche), avec la couleur du badge réel.
2. Le maître Marketplace est réellement chargé par `index.html`. V820 le mettait uniquement dans le Service Worker et conservait en plus une référence vers un fichier V819 absent.
3. Les champs `marketplace_show_on_home`, couverture, type de couverture, badge et vues sont conservés dans les objets et caches de l’Accueil.
4. L’Accueil relit directement Supabase pour les annonces actives choisies par le vendeur et retire celles qui ne doivent pas y apparaître.
5. Une couverture photo ouvre le plein écran photo avec le bouton **Voir l’annonce**, relié à l’identifiant exact.
6. Une couverture vidéo est reconnue comme vidéo, apparaît dans la centrale Vidéo et affiche le bouton **Voir l’annonce**, relié à la même publication.
7. Les mises à jour sont reprises après publication, au retour dans l’application et par Realtime.

## SQL

Aucun nouveau SQL. Les trois SQL V820 déjà exécutés restent utilisés.
