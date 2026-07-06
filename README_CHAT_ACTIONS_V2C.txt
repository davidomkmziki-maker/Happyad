HAPPYAD_CHAT_ACTIONS_V2C

But : garder le nouveau système messages happyad_chat_* et ajouter les actions réelles demandées.

Actions corrigées dans messages.html :
1. Clique long sur une conversation : popup professionnel + suppression pour moi.
   - Réel Supabase : RPC happyad_chat_hide_conversation_for_me
   - Cache local nettoyé après succès.

2. Clique long sur mon message envoyé :
   - Supprimer pour tous : met deleted_for_all=true dans happyad_chat_messages.
   - Supprimer pour moi : ajoute mon user_id dans hidden_for_user_ids.
   - Modifier : seulement pendant 20 minutes après created_at.
   - Épingler / désépingler : ajoute/enlève mon user_id dans pinned_by_user_ids.

3. Clique long sur message de l'autre :
   - Supprimer pour moi uniquement.

SQL à exécuter :
- Si vous avez déjà exécuté HAPPYAD_CHAT_CLEAN_V2B.sql : exécuter seulement supabase/HAPPYAD_CHAT_ACTIONS_V2C.sql
- Si vous repartez de zéro : exécuter supabase/HAPPYAD_CHAT_CLEAN_V2B.sql, qui inclut maintenant aussi les actions V2C.

Tables actives :
- public.happyad_chat_conversations
- public.happyad_chat_messages

Anciennes tables non utilisées :
- public.happyad_messages_box
- public.happyad_messages
- public.happyad_conversations
