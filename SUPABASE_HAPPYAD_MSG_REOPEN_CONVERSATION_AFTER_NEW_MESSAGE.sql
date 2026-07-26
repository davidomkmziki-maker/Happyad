-- HAPPYAD V37 — Phase 5E1
-- Après « Supprimer la conversation », tout nouveau message réactive automatiquement
-- la conversation pour le compte qui l'avait supprimée, sans restaurer les anciens messages.

begin;

create or replace function public.happyad_msg_reopen_deleted_conversation_on_new_message()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.happyad_msg_conversation_members as cm
  set conversation_deleted_at = null
  where cm.conversation_id = new.conversation_id
    and cm.conversation_deleted_at is not null
    and (
      new.server_seq is null
      or coalesce(cm.deleted_through_seq, 0) < new.server_seq
    );

  return new;
end;
$$;

drop trigger if exists happyad_msg_reopen_deleted_conversation_after_insert
  on public.happyad_msg_messages;

create trigger happyad_msg_reopen_deleted_conversation_after_insert
after insert on public.happyad_msg_messages
for each row
execute function public.happyad_msg_reopen_deleted_conversation_on_new_message();

revoke all on function public.happyad_msg_reopen_deleted_conversation_on_new_message() from public;

commit;

-- Vérification facultative :
-- select tgname, tgenabled
-- from pg_trigger
-- where tgrelid = 'public.happyad_msg_messages'::regclass
--   and tgname = 'happyad_msg_reopen_deleted_conversation_after_insert'
--   and not tgisinternal;
