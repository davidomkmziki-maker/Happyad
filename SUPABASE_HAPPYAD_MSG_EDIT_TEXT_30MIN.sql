-- HAPPYAD Messages — Phase 5C
-- Modification d'un message texte, réservée à l'expéditeur pendant 30 minutes

begin;

drop function if exists public.happyad_msg_edit_text(uuid, text);

create function public.happyad_msg_edit_text(
  p_message_id uuid,
  p_body text
)
returns table(
  message_id uuid,
  message_server_seq bigint,
  conversation_id uuid,
  sender_id uuid,
  client_message_id uuid,
  message_kind text,
  message_body text,
  reply_to_id uuid,
  created_at timestamp with time zone,
  edited_at timestamp with time zone
)
language plpgsql
security definer
set search_path to 'pg_catalog'
as $$
declare
  v_current_user_id uuid := auth.uid();
  v_body text := btrim(coalesce(p_body, ''));
  v_now timestamptz := clock_timestamp();
  v_message public.happyad_msg_messages%rowtype;
begin
  if v_current_user_id is null then
    raise exception 'Session utilisateur obligatoire';
  end if;

  if p_message_id is null then
    raise exception 'message_id obligatoire';
  end if;

  if v_body = '' then
    raise exception 'Le message modifié ne peut pas être vide';
  end if;

  if char_length(v_body) > 10000 then
    raise exception 'Le message dépasse la longueur autorisée';
  end if;

  select m.*
  into v_message
  from public.happyad_msg_messages m
  where m.id = p_message_id
  for update;

  if not found then
    raise exception 'Message introuvable';
  end if;

  if v_message.sender_id <> v_current_user_id then
    raise exception 'Seul l''expéditeur peut modifier ce message';
  end if;

  if v_message.kind <> 'text' then
    raise exception 'Seuls les messages texte peuvent être modifiés';
  end if;

  if v_message.deleted_for_all_at is not null then
    raise exception 'Un message supprimé ne peut pas être modifié';
  end if;

  if v_now > v_message.created_at + interval '30 minutes' then
    raise exception 'Le délai de modification de 30 minutes est terminé';
  end if;

  -- Enregistrer seulement une vraie modification.
  if v_message.body is distinct from v_body then
    update public.happyad_msg_messages m
    set
      body = v_body,
      edited_at = v_now
    where m.id = p_message_id
    returning m.* into v_message;
  end if;

  return query
  select
    v_message.id,
    v_message.server_seq,
    v_message.conversation_id,
    v_message.sender_id,
    v_message.client_message_id,
    v_message.kind,
    v_message.body,
    v_message.reply_to_id,
    v_message.created_at,
    v_message.edited_at;
end;
$$;

revoke all on function public.happyad_msg_edit_text(uuid, text) from public;
revoke all on function public.happyad_msg_edit_text(uuid, text) from anon;
revoke all on function public.happyad_msg_edit_text(uuid, text) from authenticated;

grant execute on function public.happyad_msg_edit_text(uuid, text) to authenticated;
grant execute on function public.happyad_msg_edit_text(uuid, text) to service_role;

commit;

-- Contrôle court : doit retourner une ligne avec la signature créée.
select
  p.oid::regprocedure::text as function_signature,
  pg_get_function_arguments(p.oid) as arguments,
  pg_get_function_result(p.oid) as result_type
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'happyad_msg_edit_text';
