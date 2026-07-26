-- HAPPYAD V37 — Phase 5E
-- Supprimer une conversation uniquement pour le compte connecté.
-- La conversation réapparaît automatiquement lorsqu'un nouveau message arrive.

begin;

alter table public.happyad_msg_conversation_members
  add column if not exists deleted_through_seq bigint not null default 0;

alter table public.happyad_msg_conversation_members
  add column if not exists conversation_deleted_at timestamptz;

create index if not exists happyad_msg_members_user_deleted_idx
  on public.happyad_msg_conversation_members (user_id, conversation_deleted_at, deleted_through_seq)
  where conversation_deleted_at is not null;

create or replace function public.happyad_msg_delete_conversation_for_me(
  p_conversation_id uuid
)
returns table (
  conversation_id uuid,
  deleted_through_seq bigint,
  deleted_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_last_seq bigint := 0;
  v_deleted_at timestamptz := clock_timestamp();
begin
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if p_conversation_id is null then
    raise exception 'CONVERSATION_REQUIRED';
  end if;

  if not exists (
    select 1
    from public.happyad_msg_conversation_members as cm
    where cm.conversation_id = p_conversation_id
      and cm.user_id = v_user_id
  ) then
    raise exception 'CONVERSATION_FORBIDDEN';
  end if;

  select coalesce(max(m.server_seq), 0)
  into v_last_seq
  from public.happyad_msg_messages as m
  where m.conversation_id = p_conversation_id;

  -- Réutilise le noyau 5D afin que les anciens messages ne reviennent pas
  -- lorsque la conversation est rouverte depuis un profil.
  perform public.happyad_msg_clear_conversation(p_conversation_id);

  update public.happyad_msg_conversation_members as cm
  set deleted_through_seq = greatest(coalesce(cm.deleted_through_seq, 0), v_last_seq),
      conversation_deleted_at = v_deleted_at
  where cm.conversation_id = p_conversation_id
    and cm.user_id = v_user_id;

  return query
  select
    cm.conversation_id,
    cm.deleted_through_seq,
    cm.conversation_deleted_at
  from public.happyad_msg_conversation_members as cm
  where cm.conversation_id = p_conversation_id
    and cm.user_id = v_user_id;
end;
$$;

create or replace function public.happyad_msg_list_conversation_deletions()
returns table (
  conversation_id uuid,
  deleted_through_seq bigint,
  deleted_at timestamptz
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    cm.conversation_id,
    greatest(coalesce(cm.deleted_through_seq, 0), 0)::bigint,
    cm.conversation_deleted_at
  from public.happyad_msg_conversation_members as cm
  where cm.user_id = auth.uid()
    and cm.conversation_deleted_at is not null
  order by cm.conversation_deleted_at desc;
$$;

revoke all on function public.happyad_msg_delete_conversation_for_me(uuid) from public;
revoke all on function public.happyad_msg_list_conversation_deletions() from public;

grant execute on function public.happyad_msg_delete_conversation_for_me(uuid) to authenticated;
grant execute on function public.happyad_msg_list_conversation_deletions() to authenticated;

commit;

-- Vérification facultative après exécution :
-- select proname, pg_get_function_identity_arguments(oid)
-- from pg_proc
-- where pronamespace = 'public'::regnamespace
--   and proname in (
--     'happyad_msg_delete_conversation_for_me',
--     'happyad_msg_list_conversation_deletions'
--   )
-- order by proname;
