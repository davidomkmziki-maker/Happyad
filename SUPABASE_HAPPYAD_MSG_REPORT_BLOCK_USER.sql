-- HAPPYAD V37 — Phase 5F
-- Signaler, bloquer et débloquer un utilisateur dans la messagerie.
-- Le blocage est asymétrique : l'utilisateur bloqué ne peut plus envoyer
-- de messages au bloqueur, jusqu'au déblocage.

begin;

create table if not exists public.happyad_msg_user_blocks (
  blocker_id uuid not null,
  blocked_id uuid not null,
  created_at timestamptz not null default clock_timestamp(),
  constraint happyad_msg_user_blocks_pkey primary key (blocker_id, blocked_id),
  constraint happyad_msg_user_blocks_not_self check (blocker_id <> blocked_id)
);

create index if not exists happyad_msg_user_blocks_blocked_idx
  on public.happyad_msg_user_blocks (blocked_id, blocker_id);

alter table public.happyad_msg_user_blocks enable row level security;
alter table public.happyad_msg_user_blocks replica identity full;

drop policy if exists happyad_msg_user_blocks_select_participants
  on public.happyad_msg_user_blocks;
create policy happyad_msg_user_blocks_select_participants
on public.happyad_msg_user_blocks
for select
to authenticated
using (
  auth.uid() = blocker_id
  or auth.uid() = blocked_id
);

-- Les écritures passent uniquement par les RPC SECURITY DEFINER.
drop policy if exists happyad_msg_user_blocks_insert_none
  on public.happyad_msg_user_blocks;
create policy happyad_msg_user_blocks_insert_none
on public.happyad_msg_user_blocks
for insert
to authenticated
with check (false);

drop policy if exists happyad_msg_user_blocks_delete_none
  on public.happyad_msg_user_blocks;
create policy happyad_msg_user_blocks_delete_none
on public.happyad_msg_user_blocks
for delete
to authenticated
using (false);

create table if not exists public.happyad_msg_user_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null,
  reported_id uuid not null,
  conversation_id uuid not null,
  reason text not null,
  details jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  created_at timestamptz not null default clock_timestamp(),
  constraint happyad_msg_user_reports_not_self check (reporter_id <> reported_id),
  constraint happyad_msg_user_reports_reason_nonempty check (length(btrim(reason)) > 0)
);

create index if not exists happyad_msg_user_reports_reported_created_idx
  on public.happyad_msg_user_reports (reported_id, created_at desc);

create index if not exists happyad_msg_user_reports_reporter_created_idx
  on public.happyad_msg_user_reports (reporter_id, created_at desc);

alter table public.happyad_msg_user_reports enable row level security;

drop policy if exists happyad_msg_user_reports_select_own
  on public.happyad_msg_user_reports;
create policy happyad_msg_user_reports_select_own
on public.happyad_msg_user_reports
for select
to authenticated
using (auth.uid() = reporter_id);

-- Les insertions passent uniquement par la RPC sécurisée.
drop policy if exists happyad_msg_user_reports_insert_none
  on public.happyad_msg_user_reports;
create policy happyad_msg_user_reports_insert_none
on public.happyad_msg_user_reports
for insert
to authenticated
with check (false);

create or replace function public.happyad_msg_get_block_state(
  p_target_user_id uuid
)
returns table (
  blocked_by_me boolean,
  blocked_me boolean
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    exists (
      select 1
      from public.happyad_msg_user_blocks as b
      where b.blocker_id = auth.uid()
        and b.blocked_id = p_target_user_id
    ) as blocked_by_me,
    exists (
      select 1
      from public.happyad_msg_user_blocks as b
      where b.blocker_id = p_target_user_id
        and b.blocked_id = auth.uid()
    ) as blocked_me;
$$;

create or replace function public.happyad_msg_block_user(
  p_target_user_id uuid
)
returns table (
  blocked_by_me boolean,
  blocked_me boolean
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if p_target_user_id is null then
    raise exception 'TARGET_USER_REQUIRED';
  end if;

  if p_target_user_id = v_user_id then
    raise exception 'CANNOT_BLOCK_SELF';
  end if;

  insert into public.happyad_msg_user_blocks as b (
    blocker_id,
    blocked_id,
    created_at
  ) values (
    v_user_id,
    p_target_user_id,
    clock_timestamp()
  )
  on conflict on constraint happyad_msg_user_blocks_pkey
  do update set created_at = excluded.created_at;

  return query
  select s.blocked_by_me, s.blocked_me
  from public.happyad_msg_get_block_state(p_target_user_id) as s;
end;
$$;

create or replace function public.happyad_msg_unblock_user(
  p_target_user_id uuid
)
returns table (
  blocked_by_me boolean,
  blocked_me boolean
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if p_target_user_id is null then
    raise exception 'TARGET_USER_REQUIRED';
  end if;

  delete from public.happyad_msg_user_blocks as b
  where b.blocker_id = v_user_id
    and b.blocked_id = p_target_user_id;

  return query
  select s.blocked_by_me, s.blocked_me
  from public.happyad_msg_get_block_state(p_target_user_id) as s;
end;
$$;

create or replace function public.happyad_msg_report_user(
  p_target_user_id uuid,
  p_conversation_id uuid,
  p_reason text
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_report_id uuid;
  v_reason text := left(btrim(coalesce(p_reason, '')), 80);
begin
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if p_target_user_id is null or p_target_user_id = v_user_id then
    raise exception 'INVALID_REPORTED_USER';
  end if;

  if p_conversation_id is null then
    raise exception 'CONVERSATION_REQUIRED';
  end if;

  if v_reason = '' then
    raise exception 'REPORT_REASON_REQUIRED';
  end if;

  if not exists (
    select 1
    from public.happyad_msg_conversation_members as cm
    where cm.conversation_id = p_conversation_id
      and cm.user_id = v_user_id
  ) then
    raise exception 'CONVERSATION_FORBIDDEN';
  end if;

  if not exists (
    select 1
    from public.happyad_msg_conversation_members as cm
    where cm.conversation_id = p_conversation_id
      and cm.user_id = p_target_user_id
  ) then
    raise exception 'TARGET_NOT_IN_CONVERSATION';
  end if;

  insert into public.happyad_msg_user_reports as r (
    reporter_id,
    reported_id,
    conversation_id,
    reason,
    details
  ) values (
    v_user_id,
    p_target_user_id,
    p_conversation_id,
    v_reason,
    jsonb_build_object('source', 'happyad_message_center')
  )
  returning r.id into v_report_id;

  return v_report_id;
end;
$$;

-- Protection centrale : même en contournant l'interface, Supabase refuse
-- tout nouveau message envoyé à une personne qui a bloqué l'expéditeur.
create or replace function public.happyad_msg_enforce_user_block_on_insert()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.sender_id is null or new.conversation_id is null then
    return new;
  end if;

  if (
    select count(*)
    from public.happyad_msg_conversation_members as cm
    where cm.conversation_id = new.conversation_id
  ) = 2
  and exists (
    select 1
    from public.happyad_msg_user_blocks as b
    join public.happyad_msg_conversation_members as cm
      on cm.conversation_id = new.conversation_id
     and cm.user_id = b.blocker_id
    where b.blocked_id = new.sender_id
      and b.blocker_id <> new.sender_id
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'Vous ne pouvez plus envoyer de messages à cet utilisateur.',
      detail = 'HAPPYAD_USER_BLOCKED';
  end if;

  return new;
end;
$$;

drop trigger if exists happyad_msg_enforce_user_block_before_insert
  on public.happyad_msg_messages;

create trigger happyad_msg_enforce_user_block_before_insert
before insert on public.happyad_msg_messages
for each row
execute function public.happyad_msg_enforce_user_block_on_insert();

revoke all on table public.happyad_msg_user_blocks from public, anon, authenticated;
grant select on table public.happyad_msg_user_blocks to authenticated;

revoke all on table public.happyad_msg_user_reports from public, anon, authenticated;
grant select on table public.happyad_msg_user_reports to authenticated;

revoke all on function public.happyad_msg_get_block_state(uuid) from public;
revoke all on function public.happyad_msg_block_user(uuid) from public;
revoke all on function public.happyad_msg_unblock_user(uuid) from public;
revoke all on function public.happyad_msg_report_user(uuid, uuid, text) from public;
revoke all on function public.happyad_msg_enforce_user_block_on_insert() from public;

grant execute on function public.happyad_msg_get_block_state(uuid) to authenticated;
grant execute on function public.happyad_msg_block_user(uuid) to authenticated;
grant execute on function public.happyad_msg_unblock_user(uuid) to authenticated;
grant execute on function public.happyad_msg_report_user(uuid, uuid, text) to authenticated;

-- Ajout Realtime idempotent.
do $$
begin
  begin
    execute 'alter publication supabase_realtime add table public.happyad_msg_user_blocks';
  exception
    when duplicate_object then null;
    when undefined_object then null;
  end;
end;
$$;

commit;

-- Vérifications facultatives :
-- select * from public.happyad_msg_get_block_state('<UUID_AUTRE_UTILISATEUR>'::uuid);
-- select tgname, tgenabled
-- from pg_trigger
-- where tgrelid = 'public.happyad_msg_messages'::regclass
--   and tgname = 'happyad_msg_enforce_user_block_before_insert'
--   and not tgisinternal;
