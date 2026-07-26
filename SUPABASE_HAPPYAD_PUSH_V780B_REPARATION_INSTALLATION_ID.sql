-- HAPPYAD V780B — RÉPARATION PUSH : installation_id historique obligatoire
-- Exécuter ce fichier COMPLET dans Supabase > SQL Editor.
-- Il ne touche ni aux messages, ni aux notifications internes, ni aux profils.

begin;

create extension if not exists pgcrypto;

-- Compatibilité avec l'ancienne structure HAPPYAD : certaines installations
-- possèdent une colonne installation_id NOT NULL en plus de device_id.
alter table public.happyad_push_subscriptions
  add column if not exists installation_id text;

-- Garantir un type commun, même si une ancienne version utilisait uuid.
alter table public.happyad_push_subscriptions
  alter column installation_id type text using installation_id::text;

alter table public.happyad_push_subscriptions
  add column if not exists device_id text;

update public.happyad_push_subscriptions
set installation_id = coalesce(
      nullif(btrim(installation_id),''),
      nullif(btrim(device_id),''),
      'legacy-' || coalesce(id::text,gen_random_uuid()::text)
    ),
    device_id = coalesce(
      nullif(btrim(device_id),''),
      nullif(btrim(installation_id),''),
      'legacy-' || coalesce(id::text,gen_random_uuid()::text)
    );

alter table public.happyad_push_subscriptions
  alter column installation_id set not null;

alter table public.happyad_push_subscriptions
  alter column device_id set not null;

-- Enregistrement atomique du seul lien actif du compte.
drop function if exists public.happyad_push_register_subscription(text,text,text,text,bigint,text,text,text);
create function public.happyad_push_register_subscription(
  p_endpoint text,
  p_p256dh text,
  p_auth_key text,
  p_installation_id text,
  p_expiration_time bigint default null,
  p_content_encoding text default 'aes128gcm',
  p_user_agent text default '',
  p_platform text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  v_uid uuid := auth.uid();
  v_endpoint text := btrim(coalesce(p_endpoint,''));
  v_installation text := left(btrim(coalesce(p_installation_id,'')),160);
  v_row public.happyad_push_subscriptions;
  v_removed integer := 0;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED' using errcode='28000';
  end if;

  if v_endpoint = ''
     or btrim(coalesce(p_p256dh,'')) = ''
     or btrim(coalesce(p_auth_key,'')) = ''
     or v_installation = '' then
    raise exception 'PUSH_SUBSCRIPTION_INCOMPLETE' using errcode='22023';
  end if;

  delete from public.happyad_push_subscriptions
   where user_id = v_uid
      or endpoint = v_endpoint;
  get diagnostics v_removed = row_count;

  insert into public.happyad_push_subscriptions(
    user_id,
    installation_id,
    device_id,
    endpoint,
    p256dh,
    auth_key,
    expiration_time,
    platform,
    user_agent,
    app_mode,
    permission,
    enabled,
    created_at,
    updated_at,
    last_seen_at
  ) values (
    v_uid,
    v_installation,
    v_installation,
    v_endpoint,
    btrim(p_p256dh),
    btrim(p_auth_key),
    p_expiration_time,
    left(coalesce(p_platform,''),80),
    left(coalesce(p_user_agent,''),500),
    'browser',
    'granted',
    true,
    now(),
    now(),
    now()
  )
  returning * into v_row;

  return jsonb_build_object(
    'ok',true,
    'single_active_link',true,
    'removed_old_links',v_removed,
    'id',v_row.id,
    'user_id',v_row.user_id,
    'installation_id',v_row.installation_id,
    'device_id',v_row.device_id,
    'endpoint',v_row.endpoint,
    'enabled',v_row.enabled,
    'updated_at',v_row.updated_at,
    'content_encoding',coalesce(nullif(btrim(p_content_encoding),''),'aes128gcm')
  );
end;
$$;

-- Nettoyage secondaire : garder le lien courant et synchroniser les deux IDs.
drop function if exists public.happyad_push_cleanup_own_subscriptions(text,text);
create function public.happyad_push_cleanup_own_subscriptions(
  p_keep_endpoint text default null,
  p_keep_installation_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  v_uid uuid := auth.uid();
  v_endpoint text := btrim(coalesce(p_keep_endpoint,''));
  v_installation text := left(btrim(coalesce(p_keep_installation_id,'')),160);
  v_removed integer := 0;
  v_active integer := 0;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED' using errcode='28000';
  end if;
  if v_endpoint = '' then
    raise exception 'KEEP_ENDPOINT_REQUIRED' using errcode='22023';
  end if;

  delete from public.happyad_push_subscriptions
   where user_id = v_uid
     and endpoint <> v_endpoint;
  get diagnostics v_removed = row_count;

  update public.happyad_push_subscriptions
     set enabled = true,
         permission = 'granted',
         installation_id = case when v_installation <> '' then v_installation else installation_id end,
         device_id = case when v_installation <> '' then v_installation else device_id end,
         updated_at = now(),
         last_seen_at = now()
   where user_id = v_uid
     and endpoint = v_endpoint;

  select count(*)::integer
    into v_active
    from public.happyad_push_subscriptions
   where user_id = v_uid
     and enabled is true;

  if v_active <> 1 then
    raise exception 'PUSH_SINGLE_ACTIVE_LINK_NOT_CONFIRMED' using errcode='P0001';
  end if;

  return jsonb_build_object(
    'ok',true,
    'single_active_link',true,
    'removed_old_links',v_removed,
    'active_count',v_active,
    'installation_id',v_installation,
    'endpoint',v_endpoint
  );
end;
$$;

revoke all on function public.happyad_push_register_subscription(text,text,text,text,bigint,text,text,text) from public;
revoke all on function public.happyad_push_cleanup_own_subscriptions(text,text) from public;

grant execute on function public.happyad_push_register_subscription(text,text,text,text,bigint,text,text,text) to authenticated;
grant execute on function public.happyad_push_cleanup_own_subscriptions(text,text) to authenticated;

select pg_notify('pgrst','reload schema');

commit;

-- CONTRÔLES : les trois résultats doivent être propres.
select
  column_name,
  data_type,
  is_nullable
from information_schema.columns
where table_schema='public'
  and table_name='happyad_push_subscriptions'
  and column_name in ('installation_id','device_id')
order by column_name;

select
  count(*) filter (where installation_id is null or btrim(installation_id)='') as invalid_installation_ids,
  count(*) filter (where device_id is null or btrim(device_id)='') as invalid_device_ids,
  count(*) as stored_links
from public.happyad_push_subscriptions;

select
  count(*) filter (where active_links > 1) as accounts_with_conflict,
  count(*) as accounts_checked
from (
  select user_id, count(*) filter (where enabled is true) as active_links
  from public.happyad_push_subscriptions
  group by user_id
) x;
