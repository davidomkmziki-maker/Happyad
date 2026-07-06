HAPPYAD_CHAT_ACTIONS_REAL_V2D

Version corrective du nouveau système messages happyad_chat_*.

Corrections V2D :
1. Ouverture directe depuis profil visiteur sans écran blanc : le chat s'affiche immédiatement avec l'identité du profil, puis Supabase synchronise en arrière-plan.
2. Anti-double message côté expéditeur : client_temp_id est prioritaire pour fusionner la bulle locale et le message sauvegardé Supabase.
3. Actions long press réellement branchées :
   - conversation : supprimer pour moi
   - mon message : supprimer pour tous / supprimer pour moi / modifier pendant 20 min / épingler
   - message reçu : supprimer pour moi
4. Correction SQL V2C : l'ancienne fonction happyad_chat_hide_conversation_for_me avait une signature invalide. V2D la recrée proprement.
5. Protection identité conversation : ouvrir une conversation ne doit plus réécrire le nom, avatar ou badge des autres conversations.

SQL à exécuter après HAPPYAD_CHAT_CLEAN_V2B.sql :
supabase/HAPPYAD_CHAT_ACTIONS_V2D_FIX.sql

Anciennes tables ignorées par le code :
- happyad_messages_box
- happyad_messages
- happyad_conversations

Tables actives :
- happyad_chat_conversations
- happyad_chat_messages
