# HAPPYAD V786 — Point 1 : popup notification système remis en tête

Base stricte : `HAPPYAD_V785_PUSH_AVATAR_EXPEDITEUR_REEL.zip`.

## Correction isolée

- Chaque message Push reçoit un tag unique basé sur `message_id`.
- Android/Chrome traite donc le message comme une nouvelle notification et non comme une simple mise à jour silencieuse de la conversation.
- Après affichage réussi, les anciennes notifications de la même conversation sont fermées ; la notification la plus récente reste seule.
- Le `timestamp` de la notification correspond au moment réel d'affichage sur le téléphone afin qu'elle remonte dans la partie supérieure du panneau.
- `renotify`, la vibration, `silent: false` et l'urgence Web Push élevée sont conservés.
- Les notifications appartenant à d'autres conversations ne sont pas fermées.
- Version du Service Worker renouvelée en V786 afin d'éliminer l'ancien cache V785.

## Fichiers modifiés

1. `service-worker.js`
2. `index.html` — uniquement la version d'enregistrement du Service Worker
3. `SUPABASE_EDGE_FUNCTION_HAPPYAD_PUSH_PRODUCTION_V786.ts` — alignement du tag Push sur `message_id`

Aucun SQL n'est nécessaire. Les points 2, 3 et 4 ne sont pas modifiés dans cette archive.

## Limite Android

La bannière supérieure dépend aussi du réglage système du téléphone. Le canal Chrome/HAPPYAD doit rester en mode alerte avec l'option d'affichage à l'écran activée. Le site ne peut pas contourner un canal Android placé manuellement en mode silencieux.
