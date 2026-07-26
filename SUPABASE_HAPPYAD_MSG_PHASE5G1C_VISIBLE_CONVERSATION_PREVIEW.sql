-- ============================================================================
-- HAPPYAD MESSAGES V37 — PHASE 5G1C
-- APERÇU DE CONVERSATION = DERNIER MESSAGE RÉELLEMENT VISIBLE POUR CE COMPTE
-- ============================================================================
-- À exécuter après 5G1 puis 5G1B.
-- Ce script ajoute seulement une RPC de lecture. Il ne modifie aucune donnée.
-- ============================================================================

begin;

set local lock_timeout = '10s';
set local statement_timeout = '120s';
select pg_advisory_xact_lock(hashtext('happyad_messages_phase5g1c_visible_preview'));

drop function if exists public.happyad_msg_list_visible_conversation_previews();

create function public.happyad_msg_list_visible_conversation_previews()
returns table (
  conversation_id uuid,
  message_id uuid,
  server_seq bigint,
  created_at timestamptz,
  message_kind text,
  message_body text,
  sender_id uuid,
  deleted_for_all_at timestamptz,
  view_once boolean,
  view_once_consumed_at timestamptz,
  view_once_sender_dismissed_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_me uuid := auth.uid();
begin
  if v_me is null then
    raise exception 'Utilisateur non connecté.' using errcode = '42501';
  end if;

  return query
  select
    cm.conversation_id,
    visible_message.id,
    visible_message.server_seq,
    visible_message.created_at,
    visible_message.kind,
    visible_message.body,
    visible_message.sender_id,
    visible_message.deleted_for_all_at,
    visible_message.view_once,
    visible_message.consumed_at,
    visible_message.sender_dismissed_at
  from public.happyad_msg_conversation_members cm
  join lateral (
    select
      m.id,
      m.server_seq,
      m.created_at,
      m.kind,
      m.body,
      m.sender_id,
      m.deleted_for_all_at,
      m.view_once,
      access_state.consumed_at,
      access_state.sender_dismissed_at
    from public.happyad_msg_messages m
    left join lateral (
      select
        a.consumed_at,
        a.sender_dismissed_at
      from public.happyad_msg_message_access a
      where a.message_id = m.id
      order by a.opened_at desc
      limit 1
    ) access_state on true
    where m.conversation_id = cm.conversation_id
      and m.server_seq > greatest(coalesce(cm.deleted_through_seq,0),0)
      and not exists (
        select 1
        from public.happyad_msg_message_deletions d
        where d.message_id = m.id
          and d.user_id = v_me
      )
      and (
        m.view_once is false
        or m.kind <> 'photo'
        or (
          m.sender_id = v_me
          and access_state.sender_dismissed_at is null
        )
        or (
          m.sender_id <> v_me
          and access_state.consumed_at is null
        )
      )
    order by m.server_seq desc
    limit 1
  ) visible_message on true
  where cm.user_id = v_me
  order by visible_message.server_seq desc;
end;
$$;

revoke all on function public.happyad_msg_list_visible_conversation_previews()
  from public, anon;
grant execute on function public.happyad_msg_list_visible_conversation_previews()
  to authenticated;

commit;

select
  'PHASE_5G1C_VISIBLE_CONVERSATION_PREVIEW_OK' as status,
  to_regprocedure('public.happyad_msg_list_visible_conversation_previews()') is not null as preview_rpc_ready;
