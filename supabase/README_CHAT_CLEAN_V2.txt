HAPPYAD CHAT CLEAN V2B

À exécuter dans Supabase :
  supabase/HAPPYAD_CHAT_CLEAN_V2B.sql

Pourquoi V2B ?
Le SQL V2 peut échouer si une première tentative a déjà créé happyad_chat_messages.conversation_id en uuid.
V2B reset seulement les nouvelles tables happyad_chat_* puis les recrée propres avec conversation_id en text.

Important :
- Ne touche pas aux anciennes tables happyad_messages_box / happyad_messages / happyad_conversations.
- Ne pas exécuter les anciens SQL dans supabase/old_messages_do_not_run/.
- Après exécution, tester : select count(*) from public.happyad_chat_conversations; et select count(*) from public.happyad_chat_messages;
