-- ============================================================================
-- HAPPYAD V783 — NETTOYAGE CIBLE MESSAGES LUS + TEMPS DES STORIES
-- Base applicative : V781 renouvelée
--
-- À exécuter EN PREMIER dans Supabase > SQL Editor.
-- Ce script ne crée aucune seconde messagerie et ne déplace aucune donnée.
-- Il répare uniquement les curseurs du noyau happyad_msg_* existant et les
-- horodatages de la table officielle public.happyad_stories.
-- ============================================================================

begin;

set local lock_timeout = '15s';
set local statement_timeout = '180s';

select pg_advisory_xact_lock(hashtext('happyad_v783_messages_stories_cleanup'));

-- --------------------------------------------------------------------------
-- 1. GARDE-FOUS
-- --------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.happyad_msg_conversations') is null
     or to_regclass('public.happyad_msg_conversation_members') is null
     or to_regclass('public.happyad_msg_messages') is null then
    raise exception 'Noyau Messages canonique happyad_msg_* introuvable. Nettoyage arrêté sans modification.';
  end if;

  if to_regclass('public.happyad_stories') is null then
    raise exception 'Table officielle public.happyad_stories introuvable. Nettoyage arrêté sans modification.';
  end if;
end
$$;

-- --------------------------------------------------------------------------
-- 2. CURSEURS MESSAGES : MEMBRES MANQUANTS + VALEURS COHÉRENTES
-- --------------------------------------------------------------------------
-- Toute ligne membre qui ne correspond pas à la paire canonique est une
-- ancienne anomalie : elle est retirée avant de recréer les deux membres.
delete from public.happyad_msg_conversation_members cm
using public.happyad_msg_conversations c
where c.id = cm.conversation_id
  and cm.user_id <> c.direct_user_a
  and cm.user_id <> c.direct_user_b;

-- Les deux membres canoniques sont recréés uniquement s'ils manquent.
insert into public.happyad_msg_conversation_members
  (conversation_id, user_id, joined_at, last_delivered_seq, last_read_seq)
select c.id, c.direct_user_a, coalesce(c.created_at, now()), 0, 0
from public.happyad_msg_conversations c
where c.direct_user_a is not null
on conflict (conversation_id, user_id) do nothing;

insert into public.happyad_msg_conversation_members
  (conversation_id, user_id, joined_at, last_delivered_seq, last_read_seq)
select c.id, c.direct_user_b, coalesce(c.created_at, now()), 0, 0
from public.happyad_msg_conversations c
where c.direct_user_b is not null
on conflict (conversation_id, user_id) do nothing;

-- Normalisation atomique :
-- • jamais de valeur négative ;
-- • jamais au-delà du dernier server_seq réel de la conversation ;
-- • lu implique livré ;
-- • dates cohérentes avec les curseurs.
with conversation_max as (
  select
    c.id as conversation_id,
    coalesce(max(m.server_seq), 0)::bigint as max_seq
  from public.happyad_msg_conversations c
  left join public.happyad_msg_messages m on m.conversation_id = c.id
  group by c.id
), normalized as (
  select
    cm.conversation_id,
    cm.user_id,
    greatest(
      least(greatest(coalesce(cm.last_delivered_seq, 0), 0), mx.max_seq),
      least(greatest(coalesce(cm.last_read_seq, 0), 0), mx.max_seq)
    )::bigint as delivered_seq,
    least(greatest(coalesce(cm.last_read_seq, 0), 0), mx.max_seq)::bigint as read_seq,
    cm.last_delivered_at,
    cm.last_read_at
  from public.happyad_msg_conversation_members cm
  join conversation_max mx on mx.conversation_id = cm.conversation_id
)
update public.happyad_msg_conversation_members cm
set
  last_delivered_seq = n.delivered_seq,
  last_read_seq = n.read_seq,
  last_delivered_at = case
    when n.delivered_seq = 0 then null
    else coalesce(n.last_delivered_at, n.last_read_at, now())
  end,
  last_read_at = case
    when n.read_seq = 0 then null
    else coalesce(n.last_read_at, n.last_delivered_at, now())
  end
from normalized n
where cm.conversation_id = n.conversation_id
  and cm.user_id = n.user_id;

-- Le dernier message de la conversation est recalculé depuis la vérité serveur.
with latest as (
  select distinct on (m.conversation_id)
    m.conversation_id,
    m.id,
    m.server_seq,
    m.created_at
  from public.happyad_msg_messages m
  order by m.conversation_id, m.server_seq desc
)
update public.happyad_msg_conversations c
set
  last_message_id = l.id,
  last_message_seq = l.server_seq,
  last_message_at = l.created_at,
  updated_at = greatest(coalesce(c.updated_at, l.created_at), l.created_at)
from latest l
where c.id = l.conversation_id
  and (
    c.last_message_id is distinct from l.id
    or c.last_message_seq is distinct from l.server_seq
    or c.last_message_at is distinct from l.created_at
  );

-- Conversations réellement vides : état dernier message remis à zéro.
update public.happyad_msg_conversations c
set
  last_message_id = null,
  last_message_seq = null,
  last_message_at = null,
  updated_at = coalesce(c.updated_at, c.created_at, now())
where not exists (
  select 1 from public.happyad_msg_messages m where m.conversation_id = c.id
)
and (c.last_message_id is not null or c.last_message_seq is not null or c.last_message_at is not null);

-- --------------------------------------------------------------------------
-- 3. STORIES : HORODATAGES RÉELS ET EXPIRATION 24 H
-- --------------------------------------------------------------------------
alter table public.happyad_stories
  add column if not exists created_at timestamptz,
  add column if not exists expires_at timestamptz,
  add column if not exists is_active boolean;

alter table public.happyad_stories
  alter column created_at set default now(),
  alter column is_active set default true;

-- Une ligne sans date reçoit une date serveur. Une date très future, souvent
-- issue de l'horloge locale du téléphone, est ramenée au temps serveur.
update public.happyad_stories
set created_at = now()
where created_at is null
   or created_at > now() + interval '5 minutes';

-- Une Story active possède toujours une expiration cohérente à +24 h.
update public.happyad_stories
set expires_at = created_at + interval '24 hours'
where expires_at is null
   or expires_at <= created_at
   or expires_at > created_at + interval '24 hours 5 minutes';

update public.happyad_stories
set is_active = false
where coalesce(is_active, true) = true
  and expires_at <= now();

update public.happyad_stories
set is_active = true
where is_active is null
  and expires_at > now();

alter table public.happyad_stories
  alter column created_at set not null,
  alter column is_active set not null;

analyze public.happyad_msg_conversations;
analyze public.happyad_msg_conversation_members;
analyze public.happyad_msg_messages;
analyze public.happyad_stories;

commit;

-- --------------------------------------------------------------------------
-- 4. CONTRÔLE FINAL — les trois compteurs doivent être 0.
-- --------------------------------------------------------------------------
select
  count(*) filter (
    where cm.last_read_seq < 0
       or cm.last_delivered_seq < 0
       or cm.last_read_seq > cm.last_delivered_seq
       or cm.last_delivered_seq > coalesce(mx.max_seq, 0)
  )::bigint as invalid_message_cursors,
  (select count(*) from public.happyad_stories where created_at is null)::bigint as stories_without_created_at,
  (select count(*) from public.happyad_stories where expires_at is null or expires_at <= created_at)::bigint as stories_with_invalid_expiry
from public.happyad_msg_conversation_members cm
left join (
  select conversation_id, max(server_seq)::bigint as max_seq
  from public.happyad_msg_messages
  group by conversation_id
) mx on mx.conversation_id = cm.conversation_id;
