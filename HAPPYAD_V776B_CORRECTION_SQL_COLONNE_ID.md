# HAPPYAD V776B — Correction SQL colonne `id`

La table `happyad_push_subscriptions` existait déjà sans colonne `id`.
Le script V776 utilisait cette colonne pour classer et nettoyer les anciennes souscriptions.

La V776B ajoute maintenant `id uuid` lorsqu'elle manque, remplit les anciennes lignes,
fixe la valeur par défaut, impose `NOT NULL` et crée un index unique avant le nettoyage.

Le code HAPPYAD reste identique à la V776. Seul le SQL de migration a été corrigé.

Exécuter le fichier SQL V776B complet depuis la première ligne.
