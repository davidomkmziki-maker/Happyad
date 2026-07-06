Structure recommandée maintenant :
1) Messages actifs : public.happyad_messages_box
2) Liste/liaison conversation : public.happyad_conversations
3) Ancienne table public.happyad_messages : sauvegarde/migration seulement, le site ne la lit plus.

Si les anciens messages ont déjà été copiés dans happyad_messages_box, ne supprime pas directement happyad_messages.
Renomme-la d'abord en backup après vérification.
SQL optionnel : HAPPYAD_MESSAGES_BOX_DEDUP_OPTIONAL.sql nettoie les doublons stricts dans happyad_messages_box avec backup automatique.

Correction vitesse ajoutée : HAPPYAD_MESSAGES_SPEED_INDEXES.sql
- À exécuter si Supabase reste lent.
- Ajoute seulement les index, ne supprime aucune donnée.
- Le site lit maintenant les messages depuis happyad_messages_box et utilise happyad_conversations seulement comme index de liste.
