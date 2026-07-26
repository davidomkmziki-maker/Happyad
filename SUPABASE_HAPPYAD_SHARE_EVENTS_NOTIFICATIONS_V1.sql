-- ============================================================
-- HAPPYAD — PARTAGES REELS + COMPTEUR + NOTIFICATIONS V1
-- Date : 2026-07-15
-- ============================================================
--
-- Chaque partage réellement engagé crée un événement distinct.
-- Le même utilisateur peut partager plusieurs fois la même publication.
--
-- Comptage :
--   - partage vers 1 application : +1
--   - envoi HAPPYAD réussi à N personnes : +N
--   - simple ouverture du popup : +0
--   - copie du lien seule : +0
--
-- Le RPC est idempotent grâce à client_event_id : un même appel
-- rejoué par erreur ne peut pas augmenter le compteur deux fois.
-- ============================================================

begin;

select pg_advisory_xact_lock(hashtext('happyad_share_events_v1'));
create extension if not exists pgcrypto;
create schema if not exists happyad_private;
revoke all on schema happyad_private from public, anon, authenticated;

create table if not exists public.happyad_share_events (
  id uuid primary key default gen_random_uuid(),
  client_event_id uuid not null,
  post_id text not null,
  content_type text not null default 'photo',
  actor_id uuid not null references auth.users(id) on delete cascade,
  channel text not null default 'unknown',
  share_units integer not null default 1,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),

  constraint happyad_share_events_units_check
    check (share_units between 1 and 20),
  constraint happyad_share_events_content_type_check
    check (content_type in ('photo','video')),
  constraint happyad_share_events_metadata_object
    check (jsonb_typeof(metadata) = 'object'),
  constraint happyad_share_events_actor_client_unique
    unique (actor_id, client_event_id)
);

comment on table public.happyad_share_events is
  'HAPPYAD_SHARE_EVENTS_V1 — un événement par partage réellement engagé; répétitions autorisées';

create index if not exists happyad_share_events_post_created_idx
  on public.happyad_share_events (post_id, created_at desc);
create index if not exists happyad_share_events_actor_created_idx
  on public.happyad_share_events (actor_id, created_at desc);

alter table public.happyad_share_events enable row level security;
revoke all on table public.happyad_share_events from anon, authenticated;

-- Aucun INSERT direct depuis le navigateur : uniquement le RPC sécurisé.

create or replace function public.happyad_share_commit(
  p_post_id text,
  p_content_type text default null,
  p_channel text default 'unknown',
  p_share_units integer default 1,
  p_client_event_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns table (
  event_id uuid,
  shares_count bigint,
  applied boolean
)
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_actor_id uuid := auth.uid();
  v_event_id uuid;
  v_client_event_id uuid := coalesce(p_client_event_id, gen_random_uuid());
  v_post_id text := nullif(btrim(coalesce(p_post_id, '')), '');
  v_channel text := left(coalesce(nullif(btrim(p_channel), ''), 'unknown'), 64);
  v_units integer := least(greatest(coalesce(p_share_units, 1), 1), 20);
  v_owner_id uuid;
  v_type text;
  v_count bigint;
  v_preview text;
  v_actor_name text;
  v_actor_snapshot jsonb := '{}'::jsonb;
  v_inserted boolean := false;
begin
  if v_actor_id is null then
    raise exception 'Connexion requise pour partager';
  end if;
  if v_post_id is null then
    raise exception 'Publication introuvable';
  end if;

  -- Verrouille la publication pour garantir un compteur atomique.
  select
    p.user_id,
    case
      when lower(coalesce(p.media_type, p.home_media_type, p.post_type, ''))
           ~ 'video|reel|clip|mp4|webm|mov'
        then 'video'
      else 'photo'
    end,
    coalesce(
      nullif(btrim(coalesce(p.thumbnail_url, '')), ''),
      nullif(btrim(coalesce(p.poster_url, '')), ''),
      nullif(btrim(coalesce(p.cover_url, '')), ''),
      nullif(btrim(coalesce(p.home_media_url, '')), ''),
      nullif(btrim(coalesce(p.media_url, '')), ''),
      nullif(btrim(coalesce(p.video_url_compressed, '')), ''),
      nullif(btrim(coalesce(p.video_url_original, '')), ''),
      nullif(btrim(coalesce(p.media_path, '')), '')
    )
  into v_owner_id, v_type, v_preview
  from public.happyad_posts p
  where p.id = v_post_id
    and p.deleted_at is null
  for update;

  if not found or v_owner_id is null then
    raise exception 'Publication ou propriétaire introuvable';
  end if;

  if lower(btrim(coalesce(p_content_type, ''))) in ('photo','video') then
    v_type := lower(btrim(p_content_type));
  end if;

  insert into public.happyad_share_events (
    client_event_id,
    post_id,
    content_type,
    actor_id,
    channel,
    share_units,
    metadata,
    created_at
  ) values (
    v_client_event_id,
    v_post_id,
    v_type,
    v_actor_id,
    v_channel,
    v_units,
    coalesce(p_metadata, '{}'::jsonb),
    now()
  )
  on conflict (actor_id, client_event_id) do nothing
  returning id into v_event_id;

  v_inserted := v_event_id is not null;

  if not v_inserted then
    select e.id into v_event_id
    from public.happyad_share_events e
    where e.actor_id = v_actor_id
      and e.client_event_id = v_client_event_id
    limit 1;

    select coalesce(p.shares_count, 0)::bigint into v_count
    from public.happyad_posts p
    where p.id = v_post_id;

    return query select v_event_id, coalesce(v_count,0), false;
    return;
  end if;

  update public.happyad_posts p
  set shares_count = coalesce(p.shares_count, 0) + v_units
  where p.id = v_post_id
  returning p.shares_count::bigint into v_count;

  select
    coalesce(
      nullif(btrim(coalesce(pr.full_name, '')), ''),
      nullif(btrim(coalesce(pr.username, '')), ''),
      'Un utilisateur'
    ),
    jsonb_strip_nulls(jsonb_build_object(
      'id', pr.id,
      'username', nullif(btrim(coalesce(pr.username, '')), ''),
      'full_name', nullif(btrim(coalesce(pr.full_name, '')), ''),
      'avatar_url', nullif(btrim(coalesce(pr.avatar_url, '')), ''),
      'badge', nullif(btrim(coalesce(pr.badge, '')), '')
    ))
  into v_actor_name, v_actor_snapshot
  from public.profiles pr
  where pr.id = v_actor_id
  limit 1;

  if v_actor_name is null then v_actor_name := 'Un utilisateur'; end if;
  if v_actor_snapshot is null or v_actor_snapshot = '{}'::jsonb then
    v_actor_snapshot := jsonb_build_object('id', v_actor_id);
  end if;

  -- Notification distincte pour chaque événement réel.
  if v_owner_id <> v_actor_id then
    perform happyad_private.notification_emit(
      p_recipient_id      => v_owner_id,
      p_actor_id          => v_actor_id,
      p_notification_type => 'share',
      p_entity_type       => 'post',
      p_entity_id         => v_post_id,
      p_post_id           => v_post_id,
      p_comment_id        => null,
      p_order_id          => null,
      p_title             => 'Nouveau partage',
      p_body              => case
        when v_units > 1 then v_actor_name || ' a partagé votre publication ' || v_units::text || ' fois.'
        else v_actor_name || ' a partagé votre publication.'
      end,
      p_preview_url       => v_preview,
      p_actor_snapshot    => v_actor_snapshot,
      p_metadata          => jsonb_strip_nulls(jsonb_build_object(
        'source_table', 'happyad_share_events',
        'share_event_id', v_event_id,
        'content_type', v_type,
        'channel', v_channel,
        'share_units', v_units,
        'route', 'publication'
      )),
      p_dedupe_key        => 'share:' || v_event_id::text
    );
  end if;

  return query select v_event_id, coalesce(v_count,0), true;
end
$function$;

revoke all on function public.happyad_share_commit(
  text, text, text, integer, uuid, jsonb
) from public, anon;

grant execute on function public.happyad_share_commit(
  text, text, text, integer, uuid, jsonb
) to authenticated;

commit;
select pg_notify('pgrst', 'reload schema');

-- Vérification
select
  to_regclass('public.happyad_share_events') as share_events_table,
  to_regprocedure('public.happyad_share_commit(text,text,text,integer,uuid,jsonb)') as commit_rpc,
  obj_description('public.happyad_share_events'::regclass, 'pg_class') as installed_version;
