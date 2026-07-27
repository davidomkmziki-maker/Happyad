# HAPPYAD V787 — Point 2 : messages reçus déjà présents dans le chat

Base stricte : `HAPPYAD_V785_PUSH_AVATAR_EXPEDITEUR_REEL.zip`.

## Correction isolée
- Le pont Realtime global cible désormais l’iframe active `happyadAppFrame_message`.
- Les événements arrivés avant la création ou la disponibilité de l’iframe sont conservés dans une file bornée.
- À `HAPPYAD_MESSAGE_CENTER_READY`, la file parent est transmise dans l’ordre.
- Le module Messages conserve une seconde file pendant l’ouverture du compte et d’IndexedDB.
- Dès que le cache local est prêt, le message est fusionné, son aperçu est mis à jour et il est persisté avant l’ouverture manuelle du chat.
- Le rattrapage différentiel Supabase existant reste actif comme confirmation et sécurité réseau.

## Non modifié
- Point 1 popup système : tentative V786 non reprise.
- Point 3 compteur optimiste : non modifié.
- Point 4 ouverture depuis popup : non modifié.
- SQL, tables, RPC et fonction Supabase Push V785 : inchangés.

## Cache
Le Service Worker passe à V787 uniquement pour livrer immédiatement les fichiers corrigés et supprimer les anciens caches statiques/runtime.
