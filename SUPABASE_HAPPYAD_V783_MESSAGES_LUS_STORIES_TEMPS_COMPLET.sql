-- ============================================================================
-- HAPPYAD V783 — SQL COMPLET STABLE
-- MESSAGES LUS TEMPS RÉEL + ÂGE SERVEUR DES STORIES
-- Base applicative : V781 renouvelée
--
-- Ordre recommandé :
--   1) SUPABASE_HAPPYAD_V783_NETTOYAGE_MESSAGES_STORIES.sql
--   2) ce fichier complet
--
-- Idempotent : il peut être réexécuté sans créer de seconde table Messages.
-- ============================================================================

begin;

set local lock_timeout = '15s';
set local statement_timeout = '180s';

select pg_advisory_xact_lock(hashtext('happyad_v783_messages_stories_complete'));

create schema if not exists happyad_private;

-- --------------------------------------------------------------------------
-- 1. GARDE-FOUS ET COLONNES OFFICIELLES
-- --------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.happyad_msg_conversations') is null
     or to_regclass('public.happyad_msg_conversation_members') is null
     or to_regclass('public.happyad_msg_messages') is null then
    raise exception 'Noyau Messages canonique happyad_msg_* introuvable. Installation arrêtée.';
  end if;
  if to_regclass('public.happyad_stories') is null then
    raise exception 'Table officielle public.happyad_stories introuvable. Installation arrêtée.';
  end if;
end
$$;

alter table public.happyad_stories
  add column if not exists created_at timestamptz,
  add column if not exists expires_at timestamptz,
  add column if not exists is_active boolean;

alter table public.happyad_stories
  alter column created_at set default now(),
  alter column is_active set default true;

update public.happyad_stories
set created_at = now()
where created_at is null
   or created_at > now() + interval '5 minutes';

update public.happyad_stories
set expires_at = created_at + interval '24 hours'
where expires_at is null
   or expires_at <= created_at
   or expires_at > created_at + interval '24 hours 5 minutes';

update public.happyad_stories
set is_active = false
where coalesce(is_active, true) = true
  and expires_at <= now();

alter table public.happyad_stories
  alter column created_at set not null,
  alter column is_active set not null;

-- --------------------------------------------------------------------------
-- 2. NORMALISATION AUTOMATIQUE DES STORIES
-- --------------------------------------------------------------------------
create or replace function happyad_private.story_time_normalize_v783()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if new.created_at is null
     or new.created_at > clock_timestamp() + interval '5 minutes' then
    new.created_at := clock_timestamp();
  end if;

  if new.expires_at is null
     or new.expires_at <= new.created_at
     or new.expires_at > new.created_at + interval '24 hours 5 minutes' then
    new.expires_at := new.created_at + interval '24 hours';
  end if;

  if new.expires_at <= clock_timestamp() then
    new.is_active := false;
  elsif new.is_active is null then
    new.is_active := true;
  end if;

  return new;
end
$$;

revoke all on function happyad_private.story_time_normalize_v783() from public;

drop trigger if exists happyad_story_time_normalize_v783_trg on public.happyad_stories;
create trigger happyad_story_time_normalize_v783_trg
before insert or update of created_at, expires_at, is_active
on public.happyad_stories
for each row
execute function happyad_private.story_time_normalize_v783();

create index if not exists happyad_stories_active_created_v783_idx
  on public.happyad_stories (created_at desc, id)
  where is_active = true;

create index if not exists happyad_stories_active_expiry_v783_idx
  on public.happyad_stories (expires_at, id)
  where is_active = true;

-- Diagnostic serveur de l'âge d'une Story.
create or replace function public.happyad_story_age_state_v783(p_story_id uuid)
returns table (
  story_id uuid,
  created_at timestamptz,
  expires_at timestamptz,
  server_now timestamptz,
  age_seconds bigint,
  active boolean
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    s.id,
    s.created_at,
    s.expires_at,
    now(),
    greatest(0, floor(extract(epoch from (now() - s.created_at)))::bigint),
    coalesce(s.is_active, false) and s.expires_at > now()
  from public.happyad_stories s
  where s.id = p_story_id
  limit 1;
$$;

grant execute on function public.happyad_story_age_state_v783(uuid) to authenticated;

-- --------------------------------------------------------------------------
-- 3. VISIBILITÉ SÉCURISÉE DES CURSEURS MESSAGES POUR REALTIME
-- --------------------------------------------------------------------------
create or replace function happyad_private.msg_is_member_v783(p_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
set row_security = off
as $$
  select exists (
    select 1
    from public.happyad_msg_conversation_members cm
    where cm.conversation_id = p_conversation_id
      and cm.user_id = auth.uid()
  );
$$;

revoke all on function happyad_private.msg_is_member_v783(uuid) from public;
grant execute on function happyad_private.msg_is_member_v783(uuid) to authenticated;

grant select on public.happyad_msg_conversation_members to authenticated;

alter table public.happyad_msg_conversation_members enable row level security;

drop policy if exists happyad_msg_members_select_conversation_v783
  on public.happyad_msg_conversation_members;
create policy happyad_msg_members_select_conversation_v783
on public.happyad_msg_conversation_members
for select
to authenticated
using (happyad_private.msg_is_member_v783(conversation_id));

-- --------------------------------------------------------------------------
-- 4. ÉTAT EXACT DES COCHES — SOURCE UNIQUE
-- --------------------------------------------------------------------------
create or replace function public.happyad_msg_receipt_state(
  p_conversation_id uuid
)
returns table (
  conversation_id uuid,
  my_last_delivered_seq bigint,
  my_last_read_seq bigint,
  target_last_delivered_seq bigint,
  target_last_read_seq bigint,
  delivered_through_seq bigint,
  read_through_seq bigint
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
begin
  if v_me is null then
    raise exception 'Utilisateur non connecté';
  end if;

  if not exists (
    select 1
    from public.happyad_msg_conversation_members cm
    where cm.conversation_id = p_conversation_id
      and cm.user_id = v_me
  ) then
    raise exception 'Conversation Messages non autorisée';
  end if;

  return query
  select
    p_conversation_id,
    coalesce(me.last_delivered_seq, 0)::bigint,
    coalesce(me.last_read_seq, 0)::bigint,
    coalesce(peer.last_delivered_seq, 0)::bigint,
    coalesce(peer.last_read_seq, 0)::bigint,
    coalesce(me.last_delivered_seq, 0)::bigint,
    coalesce(me.last_read_seq, 0)::bigint
  from public.happyad_msg_conversation_members me
  left join lateral (
    select cm.last_delivered_seq, cm.last_read_seq
    from public.happyad_msg_conversation_members cm
    where cm.conversation_id = p_conversation_id
      and cm.user_id <> v_me
    limit 1
  ) peer on true
  where me.conversation_id = p_conversation_id
    and me.user_id = v_me;
end
$$;

grant execute on function public.happyad_msg_receipt_state(uuid) to authenticated;

-- --------------------------------------------------------------------------
-- 5. RPC LIVRÉ — SIGNATURE EXACTE UTILISÉE PAR V781/V783
-- --------------------------------------------------------------------------
drop function if exists public.happyad_msg_mark_delivered(uuid, bigint);
drop function if exists public.happyad_msg_mark_delivered(uuid);

create function public.happyad_msg_mark_delivered(
  p_conversation_id uuid,
  p_through_server_seq bigint
)
returns table (
  conversation_id uuid,
  my_last_delivered_seq bigint,
  my_last_read_seq bigint,
  target_last_delivered_seq bigint,
  target_last_read_seq bigint,
  delivered_through_seq bigint,
  read_through_seq bigint
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_max_seq bigint := 0;
  v_through bigint := 0;
begin
  if v_me is null then raise exception 'Utilisateur non connecté'; end if;

  if not exists (
    select 1 from public.happyad_msg_conversation_members cm
    where cm.conversation_id = p_conversation_id and cm.user_id = v_me
  ) then
    raise exception 'Conversation Messages non autorisée';
  end if;

  select coalesce(max(m.server_seq), 0)::bigint
    into v_max_seq
  from public.happyad_msg_messages m
  where m.conversation_id = p_conversation_id;

  v_through := least(greatest(coalesce(p_through_server_seq, 0), 0), v_max_seq);

  update public.happyad_msg_conversation_members cm
  set
    last_delivered_seq = greatest(coalesce(cm.last_delivered_seq, 0), v_through),
    last_delivered_at = case
      when greatest(coalesce(cm.last_delivered_seq, 0), v_through) > 0
        then coalesce(cm.last_delivered_at, clock_timestamp())
      else null
    end
  where cm.conversation_id = p_conversation_id
    and cm.user_id = v_me;

  return query select * from public.happyad_msg_receipt_state(p_conversation_id);
end
$$;

grant execute on function public.happyad_msg_mark_delivered(uuid, bigint) to authenticated;

-- Compatibilité avec d'anciens appels à un seul paramètre.
create function public.happyad_msg_mark_delivered(p_conversation_id uuid)
returns table (
  conversation_id uuid,
  my_last_delivered_seq bigint,
  my_last_read_seq bigint,
  target_last_delivered_seq bigint,
  target_last_read_seq bigint,
  delivered_through_seq bigint,
  read_through_seq bigint
)
language sql
security definer
set search_path = public, pg_temp
as $$
  select *
  from public.happyad_msg_mark_delivered(
    p_conversation_id,
    coalesce((select max(server_seq) from public.happyad_msg_messages where conversation_id = p_conversation_id), 0)
  );
$$;

grant execute on function public.happyad_msg_mark_delivered(uuid) to authenticated;

-- --------------------------------------------------------------------------
-- 6. RPC LU — SIGNATURE EXACTE UTILISÉE PAR V781/V783
-- --------------------------------------------------------------------------
drop function if exists public.happyad_msg_mark_read(uuid, bigint);
drop function if exists public.happyad_msg_mark_read(uuid);

create function public.happyad_msg_mark_read(
  p_conversation_id uuid,
  p_through_server_seq bigint
)
returns table (
  conversation_id uuid,
  my_last_delivered_seq bigint,
  my_last_read_seq bigint,
  target_last_delivered_seq bigint,
  target_last_read_seq bigint,
  delivered_through_seq bigint,
  read_through_seq bigint
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_max_seq bigint := 0;
  v_through bigint := 0;
begin
  if v_me is null then raise exception 'Utilisateur non connecté'; end if;

  if not exists (
    select 1 from public.happyad_msg_conversation_members cm
    where cm.conversation_id = p_conversation_id and cm.user_id = v_me
  ) then
    raise exception 'Conversation Messages non autorisée';
  end if;

  select coalesce(max(m.server_seq), 0)::bigint
    into v_max_seq
  from public.happyad_msg_messages m
  where m.conversation_id = p_conversation_id;

  v_through := least(greatest(coalesce(p_through_server_seq, 0), 0), v_max_seq);

  update public.happyad_msg_conversation_members cm
  set
    last_delivered_seq = greatest(coalesce(cm.last_delivered_seq, 0), v_through),
    last_read_seq = greatest(coalesce(cm.last_read_seq, 0), v_through),
    last_delivered_at = case
      when greatest(coalesce(cm.last_delivered_seq, 0), v_through) > 0
        then coalesce(cm.last_delivered_at, clock_timestamp())
      else null
    end,
    last_read_at = case
      when greatest(coalesce(cm.last_read_seq, 0), v_through) > 0
        then clock_timestamp()
      else null
    end
  where cm.conversation_id = p_conversation_id
    and cm.user_id = v_me;

  return query select * from public.happyad_msg_receipt_state(p_conversation_id);
end
$$;

grant execute on function public.happyad_msg_mark_read(uuid, bigint) to authenticated;

create function public.happyad_msg_mark_read(p_conversation_id uuid)
returns table (
  conversation_id uuid,
  my_last_delivered_seq bigint,
  my_last_read_seq bigint,
  target_last_delivered_seq bigint,
  target_last_read_seq bigint,
  delivered_through_seq bigint,
  read_through_seq bigint
)
language sql
security definer
set search_path = public, pg_temp
as $$
  select *
  from public.happyad_msg_mark_read(
    p_conversation_id,
    coalesce((select max(server_seq) from public.happyad_msg_messages where conversation_id = p_conversation_id), 0)
  );
$$;

grant execute on function public.happyad_msg_mark_read(uuid) to authenticated;

-- --------------------------------------------------------------------------
-- 7. REALTIME : LES DEUX MEMBRES REÇOIVENT LES CURSEURS ET LES STORIES
-- --------------------------------------------------------------------------
alter table public.happyad_msg_conversation_members replica identity full;
alter table public.happyad_stories replica identity full;

do $$
begin
  begin
    alter publication supabase_realtime add table public.happyad_msg_conversation_members;
  exception when duplicate_object then null;
  end;

  begin
    alter publication supabase_realtime add table public.happyad_stories;
  exception when duplicate_object then null;
  end;
end
$$;

analyze public.happyad_msg_conversation_members;
analyze public.happyad_msg_messages;
analyze public.happyad_stories;

select pg_notify('pgrst', 'reload schema');

commit;

-- --------------------------------------------------------------------------
-- 8. CONTRÔLE FINAL
-- --------------------------------------------------------------------------
select
  to_regprocedure('public.happyad_msg_mark_read(uuid,bigint)') is not null as mark_read_rpc_ok,
  to_regprocedure('public.happyad_msg_mark_delivered(uuid,bigint)') is not null as mark_delivered_rpc_ok,
  to_regprocedure('public.happyad_msg_receipt_state(uuid)') is not null as receipt_state_rpc_ok,
  to_regprocedure('public.happyad_story_age_state_v783(uuid)') is not null as story_age_rpc_ok,
  exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'happyad_msg_conversation_members'
  ) as message_members_realtime_ok,
  exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'happyad_stories'
  ) as stories_realtime_ok;
