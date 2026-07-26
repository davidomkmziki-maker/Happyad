-- HAPPYAD V38E1 — Abonnements Web Push par UUID Supabase
-- Exécuter une seule fois dans Supabase SQL Editor.
-- Cette phase ne touche aucune table Messages existante.

create table if not exists public.happyad_push_subscriptions (
  endpoint text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  p256dh text not null,
  auth_key text not null,
  installation_id text not null,
  expiration_time bigint,
  content_encoding text not null default 'aes128gcm',
  user_agent text,
  platform text,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create index if not exists happyad_push_subscriptions_user_idx
  on public.happyad_push_subscriptions(user_id, enabled, last_seen_at desc);

alter table public.happyad_push_subscriptions enable row level security;

revoke all on table public.happyad_push_subscriptions from anon;
revoke all on table public.happyad_push_subscriptions from authenticated;
grant select on table public.happyad_push_subscriptions to authenticated;
grant select, update on table public.happyad_push_subscriptions to service_role;

-- Lecture limitée aux appareils du compte connecté.
drop policy if exists happyad_push_select_own on public.happyad_push_subscriptions;
create policy happyad_push_select_own
on public.happyad_push_subscriptions
for select
to authenticated
using (user_id = auth.uid());

-- Enregistrement atomique et réattribution sûre de l'endpoint au compte actuel.
create or replace function public.happyad_push_register_subscription(
  p_endpoint text,
  p_p256dh text,
  p_auth_key text,
  p_installation_id text,
  p_expiration_time bigint default null,
  p_content_encoding text default 'aes128gcm',
  p_user_agent text default null,
  p_platform text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_endpoint text := btrim(coalesce(p_endpoint,''));
  v_p256dh text := btrim(coalesce(p_p256dh,''));
  v_auth text := btrim(coalesce(p_auth_key,''));
  v_install text := btrim(coalesce(p_installation_id,''));
begin
  if v_uid is null then
    raise exception 'HAPPYAD_PUSH_AUTH_REQUIRED';
  end if;
  if v_endpoint = '' or v_p256dh = '' or v_auth = '' or v_install = '' then
    raise exception 'HAPPYAD_PUSH_INVALID_SUBSCRIPTION';
  end if;

  insert into public.happyad_push_subscriptions (
    endpoint,user_id,p256dh,auth_key,installation_id,expiration_time,
    content_encoding,user_agent,platform,enabled,created_at,updated_at,last_seen_at
  ) values (
    v_endpoint,v_uid,v_p256dh,v_auth,v_install,p_expiration_time,
    coalesce(nullif(btrim(p_content_encoding),''),'aes128gcm'),
    nullif(btrim(coalesce(p_user_agent,'')),''),
    nullif(btrim(coalesce(p_platform,'')),''),
    true,now(),now(),now()
  )
  on conflict (endpoint) do update set
    user_id = excluded.user_id,
    p256dh = excluded.p256dh,
    auth_key = excluded.auth_key,
    installation_id = excluded.installation_id,
    expiration_time = excluded.expiration_time,
    content_encoding = excluded.content_encoding,
    user_agent = excluded.user_agent,
    platform = excluded.platform,
    enabled = true,
    updated_at = now(),
    last_seen_at = now();

  -- Un même appareil ne garde qu'un endpoint actif pour ce compte.
  update public.happyad_push_subscriptions
     set enabled = false, updated_at = now()
   where user_id = v_uid
     and installation_id = v_install
     and endpoint <> v_endpoint
     and enabled = true;

  return jsonb_build_object('ok',true,'user_id',v_uid,'endpoint',v_endpoint);
end;
$$;

revoke all on function public.happyad_push_register_subscription(text,text,text,text,bigint,text,text,text) from public;
grant execute on function public.happyad_push_register_subscription(text,text,text,text,bigint,text,text,text) to authenticated;

create or replace function public.happyad_push_disable_subscription(p_endpoint text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then return false; end if;
  update public.happyad_push_subscriptions
     set enabled = false, updated_at = now()
   where user_id = v_uid
     and endpoint = btrim(coalesce(p_endpoint,''));
  return found;
end;
$$;

revoke all on function public.happyad_push_disable_subscription(text) from public;
grant execute on function public.happyad_push_disable_subscription(text) to authenticated;

-- Fonction service-role utilisée par l'Edge Function pour neutraliser un endpoint expiré.
create or replace function public.happyad_push_disable_expired(p_endpoint text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.happyad_push_subscriptions
     set enabled = false, updated_at = now()
   where endpoint = p_endpoint;
$$;

revoke all on function public.happyad_push_disable_expired(text) from public;
grant execute on function public.happyad_push_disable_expired(text) to service_role;
