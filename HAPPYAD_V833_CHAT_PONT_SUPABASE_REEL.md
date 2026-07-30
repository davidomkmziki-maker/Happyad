# HAPPYAD V833 — CHAT PONT SUPABASE RÉEL

Base : HAPPYAD V832, elle-même issue de V830.

## Cause corrigée
V832 cherchait principalement `HAPPYAD_SUPABASE`, `supabaseClient` et d'autres alias dans l'iframe Chat. Le client réellement initialisé par HAPPYAD est `happyadSupabase` (ou retourné par `happyadSb()`). La RPC `happyad_chat_understand_v2` n'était donc pas appelée et le Chat revenait silencieusement à l'ancien moteur local.

## Correction
- détection de `window.happyadSupabase` et `window.parent.happyadSupabase` ;
- appel de `happyadSb()` dans la page et le parent ;
- création contrôlée du client parent si nécessaire ;
- attente jusqu'à 2,4 secondes pendant l'initialisation ;
- vérification conjointe de `.from()` et `.rpc()` ;
- état diagnostic `HAPPYAD_CHAT_INTELLIGENCE_LAST_SUCCESS/LAST_ERROR` ;
- cache Service Worker renouvelé V833.

## Résultat attendu
Les règles V831 déjà installées dans Supabase sont réellement utilisées. Les extensions SQL futures deviennent actives sans redéployer le ZIP, tant que la RPC stable `happyad_chat_understand_v2` est conservée.

Aucun nouveau SQL nécessaire.
