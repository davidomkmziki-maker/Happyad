HAPPYAD Messages - Open Conversation V10

Correction 2 uniquement : openConversation().
- La conversation s'ouvre immédiatement avec le profil cible.
- La liste est masquée immédiatement et l'écran chat devient actif avant toute attente Supabase.
- Le vrai happyad_conversations.id est résolu en arrière-plan.
- Si un id local msgbox_* était utilisé au départ, il est remplacé par le vrai UUID Supabase sans refermer l'écran.
- Les messages sont relus après résolution du vrai conversation_id.

Ce patch ne touche pas au point 3 sendText().
