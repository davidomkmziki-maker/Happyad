-- HAPPYAD messages : nettoyage optionnel après migration.
-- À exécuter seulement après avoir vérifié que happyad_messages_box contient bien tous les messages.
-- Le site corrigé lit uniquement public.happyad_messages_box pour les messages.

begin;

-- Sauvegarde avant nettoyage.
create table if not exists public.happyad_messages_box_backup_20260706 as
select * from public.happyad_messages_box;

-- Supprime les doublons évidents créés par double lecture/import ancien+nouveau.
-- On garde la première ligne et on supprime les copies strictement identiques sur la même seconde.
with ranked as (
  select
    id,
    row_number() over (
      partition by
        user_a,
        user_b,
        sender_id,
        receiver_id,
        date_trunc('second', created_at),
        body,
        message_type,
        coalesce(media_items::text, '[]'),
        coalesce(file_meta::text, '{}')
      order by created_at asc, updated_at desc, id asc
    ) as rn
  from public.happyad_messages_box
)
delete from public.happyad_messages_box m
using ranked r
where m.id = r.id
  and r.rn > 1;

commit;

-- Quand tout est vérifié, ne supprime pas brutalement l'ancienne table.
-- Renomme-la d'abord en sauvegarde pour éviter une perte définitive :
-- alter table public.happyad_messages rename to happyad_messages_old_backup_20260706;
