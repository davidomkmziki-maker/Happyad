# HAPPYAD Push Test

Cette fonction envoie uniquement une notification de test au compte Supabase connecté.
Elle n'est pas encore branchée sur `happyad_msg_messages`.

Secrets Supabase requis :

- `HAPPYAD_VAPID_PUBLIC_KEY`
- `HAPPYAD_VAPID_PRIVATE_KEY`
- `HAPPYAD_VAPID_SUBJECT`

Déploiement :

```bash
supabase functions deploy happyad-push-test
```
