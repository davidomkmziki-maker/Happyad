-- HAPPYAD V697 — J'aime Story stable + notification
-- À exécuter une seule fois après le SQL social V679.
-- Cette version remplace le stockage Story dans happyad_content_actions
-- par une table dédiée, afin d'éviter les contraintes réservées aux publications.

begin;

create table if not exists public.happyad_story_likes (
  story_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  liked boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (story_id, user_id)
);

create index if not exists happyad_story_likes_story_idx
  on public.happyad_story_likes (story_id, liked, updated_at desc);
create index if not exists happyad_story_likes_user_idx
  on public.happyad_story_likes (user_id, updated_at desc);

alter table public.happyad_story_likes enable row level security;

drop policy if exists happyad_story_likes_select_v697 on public.happyad_story_likes;
create policy happyad_story_likes_select_v697
on public.happyad_story_likes
for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.happyad_stories s
    where s.id::text = happyad_story_likes.story_id
      and s.user_id = auth.uid()
  )
);

drop policy if exists happyad_story_likes_insert_v697 on public.happyad_story_likes;
create policy happyad_story_likes_insert_v697
on public.happyad_story_likes
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists happyad_story_likes_update_v697 on public.happyad_story_likes;
create policy happyad_story_likes_update_v697
on public.happyad_story_likes
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists happyad_story_likes_delete_v697 on public.happyad_story_likes;
create policy happyad_story_likes_delete_v697
on public.happyad_story_likes
for delete
to authenticated
using (user_id = auth.uid());

grant select, insert, update, delete on public.happyad_story_likes to authenticated;
grant all on public.happyad_story_likes to service_role;

-- Migration silencieuse des éventuels J'aime Story créés par V696.
insert into public.happyad_story_likes (story_id,user_id,liked,created_at,updated_at)
select
  coalesce(nullif(a.post_id::text,''),nullif(a.content_id::text,'')),
  a.user_id,
  coalesce(a.liked,true),
  coalesce(a.created_at,now()),
  coalesce(a.created_at,now())
from public.happyad_content_actions a
where lower(btrim(coalesce(a.content_type,'')))='story'
  and lower(btrim(coalesce(a.action_type,'')))='like'
  and a.user_id is not null
  and coalesce(nullif(a.post_id::text,''),nullif(a.content_id::text,'')) is not null
on conflict (story_id,user_id) do update
set liked=excluded.liked,
    updated_at=greatest(public.happyad_story_likes.updated_at,excluded.updated_at);

create or replace function public.happyad_story_like_state_v697(p_story_id text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_uid uuid := auth.uid();
  v_liked boolean := false;
begin
  if v_uid is null or nullif(btrim(coalesce(p_story_id,'')),'') is null then
    return false;
  end if;

  select coalesce(l.liked,false)
  into v_liked
  from public.happyad_story_likes l
  where l.story_id=btrim(p_story_id)
    and l.user_id=v_uid
  limit 1;

  return coalesce(v_liked,false);
end
$function$;

grant execute on function public.happyad_story_like_state_v697(text) to authenticated;
grant execute on function public.happyad_story_like_state_v697(text) to service_role;

create or replace function public.happyad_story_like_set_v697(
  p_story_id text,
  p_liked boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_uid uuid := auth.uid();
  v_story_id text := btrim(coalesce(p_story_id,''));
  v_exists boolean := false;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED' using errcode='42501';
  end if;
  if v_story_id='' then
    raise exception 'STORY_ID_REQUIRED' using errcode='22023';
  end if;

  select exists(
    select 1
    from public.happyad_stories s
    where s.id::text=v_story_id
      and coalesce(s.is_active,true)=true
  ) into v_exists;

  if not v_exists then
    raise exception 'STORY_NOT_FOUND' using errcode='P0002';
  end if;

  insert into public.happyad_story_likes(story_id,user_id,liked,created_at,updated_at)
  values(v_story_id,v_uid,coalesce(p_liked,true),now(),now())
  on conflict(story_id,user_id) do update
  set liked=excluded.liked,
      updated_at=now();

  return jsonb_build_object(
    'story_id',v_story_id,
    'user_id',v_uid,
    'liked',coalesce(p_liked,true),
    'updated_at',now()
  );
end
$function$;

grant execute on function public.happyad_story_like_set_v697(text,boolean) to authenticated;
grant execute on function public.happyad_story_like_set_v697(text,boolean) to service_role;

create or replace function happyad_private.story_like_notification_v697()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_story jsonb;
  v_owner_id uuid;
  v_actor_name text;
  v_actor_snapshot jsonb := '{}'::jsonb;
  v_preview text;
  v_media_type text;
  v_description text;
  v_created_at text;
  v_expires_at text;
begin
  if new.liked is distinct from true then return new; end if;
  if tg_op='UPDATE' and old.liked is true then return new; end if;

  select to_jsonb(s) into v_story
  from public.happyad_stories s
  where s.id::text=new.story_id
  limit 1;

  if v_story is null then return new; end if;
  v_owner_id := nullif(v_story->>'user_id','')::uuid;
  if v_owner_id is null or v_owner_id=new.user_id then return new; end if;

  v_preview := coalesce(
    nullif(btrim(coalesce(v_story->>'thumbnail_url','')),''),
    nullif(btrim(coalesce(v_story->>'poster_url','')),''),
    nullif(btrim(coalesce(v_story->>'preview_url','')),''),
    nullif(btrim(coalesce(v_story->>'media_url','')),'')
  );
  v_media_type := case when lower(coalesce(v_story->>'media_type',v_story->>'kind','')) ~ 'video|reel|clip|mp4|webm|mov' then 'video' else 'photo' end;
  v_description := nullif(btrim(coalesce(v_story->>'description',v_story->>'caption','')),'');
  v_created_at := coalesce(v_story->>'created_at','');
  v_expires_at := coalesce(v_story->>'expires_at','');

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
  if v_actor_snapshot is null or v_actor_snapshot='{}'::jsonb then
    v_actor_snapshot=jsonb_build_object('id',new.user_id);
  end if;

  perform happyad_private.notification_emit(
    p_recipient_id      => v_owner_id,
    p_actor_id          => new.user_id,
    p_notification_type => 'story_like',
    p_entity_type       => 'story',
    p_entity_id         => new.story_id,
    p_post_id           => null,
    p_comment_id        => null,
    p_order_id          => null,
    p_title             => 'Nouveau J’aime sur votre story',
    p_body              => v_actor_name || ' a aimé votre story.',
    p_preview_url       => v_preview,
    p_actor_snapshot    => v_actor_snapshot,
    p_metadata          => jsonb_strip_nulls(jsonb_build_object(
      'source_table','happyad_story_likes',
      'route','story',
      'story_id',new.story_id,
      'owner_id',v_owner_id,
      'user_id',v_owner_id,
      'content_type','story',
      'media_type',v_media_type,
      'media_url',v_preview,
      'preview_url',v_preview,
      'description',v_description,
      'created_at',nullif(v_created_at,''),
      'expires_at',nullif(v_expires_at,'')
    )),
    p_dedupe_key        => 'story:like:'||new.story_id||':'||new.user_id::text
  );

  return new;
end
$function$;

-- Désactive le chemin V696 qui utilisait la table des publications.
drop trigger if exists happyad_story_like_notification_v696 on public.happyad_content_actions;
drop function if exists happyad_private.story_like_notification_v696();

drop trigger if exists happyad_story_like_notification_v697 on public.happyad_story_likes;
create trigger happyad_story_like_notification_v697
after insert or update of liked on public.happyad_story_likes
for each row execute function happyad_private.story_like_notification_v697();

-- Realtime, sans erreur si la table est déjà publiée.
do $do$
begin
  begin
    alter publication supabase_realtime add table public.happyad_story_likes;
  exception when duplicate_object then null;
  end;
end
$do$;

commit;
select pg_notify('pgrst','reload schema');

select
  to_regclass('public.happyad_story_likes') as story_likes_table,
  to_regprocedure('public.happyad_story_like_set_v697(text,boolean)') as set_rpc,
  to_regprocedure('public.happyad_story_like_state_v697(text)') as state_rpc,
  (select tgname from pg_trigger where tgname='happyad_story_like_notification_v697' and not tgisinternal limit 1) as notification_trigger;
