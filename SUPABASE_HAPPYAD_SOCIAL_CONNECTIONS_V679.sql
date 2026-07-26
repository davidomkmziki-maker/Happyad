-- ============================================================
-- HAPPYAD V679 — CONNEXIONS FAVORIS / REPUBLICATIONS / PARTAGES
-- À exécuter une seule fois dans l'éditeur SQL Supabase.
-- ============================================================

begin;
create extension if not exists pgcrypto;
create schema if not exists happyad_private;
revoke all on schema happyad_private from public, anon, authenticated;

create table if not exists public.happyad_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references auth.users(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  notification_type text not null default 'activity',
  entity_type text not null default 'post',
  entity_id text,
  post_id text,
  comment_id text,
  order_id text,
  title text,
  body text,
  preview_url text,
  actor_snapshot jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  dedupe_key text,
  is_read boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.happyad_notifications add column if not exists recipient_id uuid;
alter table public.happyad_notifications add column if not exists actor_id uuid;
alter table public.happyad_notifications add column if not exists notification_type text;
alter table public.happyad_notifications add column if not exists entity_type text;
alter table public.happyad_notifications add column if not exists entity_id text;
alter table public.happyad_notifications add column if not exists post_id text;
alter table public.happyad_notifications add column if not exists comment_id text;
alter table public.happyad_notifications add column if not exists order_id text;
alter table public.happyad_notifications add column if not exists title text;
alter table public.happyad_notifications add column if not exists body text;
alter table public.happyad_notifications add column if not exists preview_url text;
alter table public.happyad_notifications add column if not exists actor_snapshot jsonb default '{}'::jsonb;
alter table public.happyad_notifications add column if not exists metadata jsonb default '{}'::jsonb;
alter table public.happyad_notifications add column if not exists dedupe_key text;
alter table public.happyad_notifications add column if not exists is_read boolean default false;
alter table public.happyad_notifications add column if not exists read_at timestamptz;
alter table public.happyad_notifications add column if not exists created_at timestamptz default now();
alter table public.happyad_notifications add column if not exists updated_at timestamptz default now();

create index if not exists happyad_notifications_recipient_created_v679_idx
  on public.happyad_notifications(recipient_id, created_at desc);
create index if not exists happyad_notifications_dedupe_v679_idx
  on public.happyad_notifications(dedupe_key);

-- Compatibilité : le RPC Partage utilise notification_emit. On ne remplace
-- jamais la fonction existante ; on crée seulement un secours si elle manque.
do $block$
begin
  if not exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='happyad_private' and p.proname='notification_emit') then
    execute $ddl$
      create function happyad_private.notification_emit(
        p_recipient_id uuid,
        p_actor_id uuid,
        p_notification_type text,
        p_entity_type text,
        p_entity_id text,
        p_post_id text,
        p_comment_id text,
        p_order_id text,
        p_title text,
        p_body text,
        p_preview_url text,
        p_actor_snapshot jsonb,
        p_metadata jsonb,
        p_dedupe_key text
      ) returns uuid
      language plpgsql
      security definer
      set search_path = ''
      as $fn$
      declare
        v_id uuid;
      begin
        if p_recipient_id is null then return null; end if;

        if nullif(btrim(coalesce(p_dedupe_key,'')),'') is not null then
          select n.id into v_id
          from public.happyad_notifications n
          where n.dedupe_key = p_dedupe_key
          order by n.created_at desc
          limit 1;
        end if;

        if v_id is not null then
          update public.happyad_notifications
          set actor_id=p_actor_id,
              notification_type=coalesce(nullif(p_notification_type,''),'activity'),
              entity_type=coalesce(nullif(p_entity_type,''),'post'),
              entity_id=p_entity_id,
              post_id=p_post_id,
              comment_id=p_comment_id,
              order_id=p_order_id,
              title=p_title,
              body=p_body,
              preview_url=p_preview_url,
              actor_snapshot=coalesce(p_actor_snapshot,'{}'::jsonb),
              metadata=coalesce(p_metadata,'{}'::jsonb),
              is_read=false,
              read_at=null,
              created_at=now(),
              updated_at=now()
          where id=v_id;
          return v_id;
        end if;

        insert into public.happyad_notifications(
          recipient_id,actor_id,notification_type,entity_type,entity_id,
          post_id,comment_id,order_id,title,body,preview_url,
          actor_snapshot,metadata,dedupe_key,is_read,created_at,updated_at
        ) values (
          p_recipient_id,p_actor_id,coalesce(nullif(p_notification_type,''),'activity'),
          coalesce(nullif(p_entity_type,''),'post'),p_entity_id,p_post_id,p_comment_id,
          p_order_id,p_title,p_body,p_preview_url,coalesce(p_actor_snapshot,'{}'::jsonb),
          coalesce(p_metadata,'{}'::jsonb),p_dedupe_key,false,now(),now()
        ) returning id into v_id;
        return v_id;
      end
      $fn$
    $ddl$;
  end if;
end
$block$;

commit;
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

-- ============================================================
-- FAVORIS + REPUBLICATIONS : notifications automatiques V679
-- ============================================================
begin;

create or replace function happyad_private.content_action_notification_v679()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_action text := lower(btrim(coalesce(new.action_type,'')));
  v_type text;
  v_owner_id uuid;
  v_preview text;
  v_actor_name text;
  v_actor_snapshot jsonb := '{}'::jsonb;
  v_title text;
  v_body text;
  v_dedupe text;
begin
  if v_action in ('fav','save') then v_action := 'favorite'; end if;
  if v_action in ('republish','republication') then v_action := 'repost'; end if;
  if v_action not in ('favorite','repost') then return new; end if;
  if new.liked is distinct from true then return new; end if;
  if tg_op='UPDATE' then
    if old.liked is true and lower(btrim(coalesce(old.action_type,'')))=lower(btrim(coalesce(new.action_type,''))) then return new; end if;
  end if;

  select
    p.user_id,
    case when lower(coalesce(p.media_type,p.home_media_type,p.post_type,'')) ~ 'video|reel|clip|mp4|webm|mov' then 'video' else 'photo' end,
    coalesce(
      nullif(btrim(coalesce(p.thumbnail_url,'')),''),
      nullif(btrim(coalesce(p.poster_url,'')),''),
      nullif(btrim(coalesce(p.cover_url,'')),''),
      nullif(btrim(coalesce(p.home_media_url,'')),''),
      nullif(btrim(coalesce(p.media_url,'')),''),
      nullif(btrim(coalesce(p.media_path,'')),'')
    )
  into v_owner_id,v_type,v_preview
  from public.happyad_posts p
  where p.id::text = new.post_id::text
    and p.deleted_at is null
  limit 1;

  if v_owner_id is null or new.user_id is null or v_owner_id=new.user_id then return new; end if;

  select
    coalesce(nullif(btrim(coalesce(pr.full_name,'')),''),nullif(btrim(coalesce(pr.username,'')),''),'Un utilisateur'),
    jsonb_strip_nulls(jsonb_build_object(
      'id',pr.id,
      'username',nullif(btrim(coalesce(pr.username,'')),''),
      'full_name',nullif(btrim(coalesce(pr.full_name,'')),''),
      'avatar_url',nullif(btrim(coalesce(pr.avatar_url,'')),''),
      'badge',nullif(btrim(coalesce(pr.badge,'')),'')
    ))
  into v_actor_name,v_actor_snapshot
  from public.profiles pr
  where pr.id=new.user_id
  limit 1;

  v_actor_name := coalesce(nullif(v_actor_name,''),'Un utilisateur');
  if v_actor_snapshot is null or v_actor_snapshot='{}'::jsonb then v_actor_snapshot=jsonb_build_object('id',new.user_id); end if;

  if v_action='favorite' then
    v_title := 'Nouveau favori';
    v_body := v_actor_name || ' a ajouté votre publication aux favoris.';
  else
    v_title := 'Nouvelle republication';
    v_body := v_actor_name || ' a republié votre publication.';
  end if;

  v_dedupe := 'social:'||v_action||':'||new.post_id::text||':'||new.user_id::text;

  perform happyad_private.notification_emit(
    p_recipient_id      => v_owner_id,
    p_actor_id          => new.user_id,
    p_notification_type => v_action,
    p_entity_type       => 'post',
    p_entity_id         => new.post_id::text,
    p_post_id           => new.post_id::text,
    p_comment_id        => null,
    p_order_id          => null,
    p_title             => v_title,
    p_body              => v_body,
    p_preview_url       => v_preview,
    p_actor_snapshot    => v_actor_snapshot,
    p_metadata          => jsonb_strip_nulls(jsonb_build_object(
      'source_table','happyad_content_actions',
      'content_type',coalesce(nullif(new.content_type,''),v_type),
      'action_type',v_action,
      'route','publication'
    )),
    p_dedupe_key        => v_dedupe
  );

  return new;
end
$function$;

drop trigger if exists happyad_content_action_notification_v679 on public.happyad_content_actions;
create trigger happyad_content_action_notification_v679
after insert or update of liked,action_type on public.happyad_content_actions
for each row execute function happyad_private.content_action_notification_v679();

commit;
select pg_notify('pgrst','reload schema');

-- Vérification finale
select
  to_regprocedure('public.happyad_share_commit(text,text,text,integer,uuid,jsonb)') as share_rpc,
  to_regprocedure('happyad_private.content_action_notification_v679()') as social_trigger_function,
  to_regclass('public.happyad_notifications') as notifications_table,
  to_regclass('public.happyad_share_events') as share_events_table;
