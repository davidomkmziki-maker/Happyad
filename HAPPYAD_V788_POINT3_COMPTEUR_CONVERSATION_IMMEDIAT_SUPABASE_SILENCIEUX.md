# HAPPYAD V788 — Point 3 : compteur conversation immédiat, Supabase silencieux

Base stricte : `HAPPYAD_V787_POINT2_MESSAGES_REALTIME_PRECHARGES.zip`.

## Correction isolée

- Au premier toucher sur une conversation, son compteur non lu passe immédiatement à zéro.
- La conversation et IndexedDB sont mis à jour sans attendre le réseau.
- Le compteur général Messages est diminué immédiatement du nombre retiré.
- `happyad_msg_mark_read` confirme ensuite la lecture en arrière-plan.
- En cas de coupure réseau, la confirmation est retentée silencieusement, sans popup d'erreur.
- Un ancien snapshot Supabase ne peut pas remettre le compteur pendant la confirmation.
- Un vrai nouveau message avec un `server_seq` supérieur peut recréer normalement le compteur.

## Inchangé

- Point 1 non repris : Push et fonction Supabase restent ceux de V785.
- Point 2 V787 conservé : nouveaux messages Realtime préchargés dans le chat.
- Point 4 non traité.
- Aucun SQL, aucune table et aucune RPC ne sont ajoutés ou remplacés.
