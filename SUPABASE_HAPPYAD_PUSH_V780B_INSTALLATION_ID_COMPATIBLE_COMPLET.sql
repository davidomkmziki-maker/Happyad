-- HAPPYAD V780B — PUSH : UN SEUL LIEN ACTIF + INSTALLATION_ID COMPATIBLE
-- Exécuter ce fichier COMPLET dans Supabase > SQL Editor avant de tester la V780B.
-- Base compatible : happyad_push_subscriptions V39C/V39A.
-- Cette migration ne touche pas aux tables Messages ni aux notifications internes.

begin;

create extension if not exists pgcrypto;

-- La table existe déjà dans HAPPYAD Push. Ces lignes rendent la migration
-- tolérante si une ancienne installation ne possède pas encore tous les champs.
create table if not exists public.happyad_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  installation_id text not null,
  device_id text not null,
  endpoint text not null,
  p256dh text not null,
  auth_key text not null,
  expiration_time bigint,
  platform text,
  user_agent text,
  app_mode text not null default 'browser',
  permission text not null default 'granted',
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

-- Compatibilité avec les anciennes tables déjà existantes :
-- CREATE TABLE IF NOT EXISTS ne rajoute pas la colonne id à une table existante.
alter table public.happyad_push_subscriptions
  add column if not exists id uuid default gen_random_uuid();

update public.happyad_push_subscriptions
set id = gen_random_uuid()
where id is null;

alter table public.happyad_push_subscriptions
  alter column id set default gen_random_uuid();

alter table public.happyad_push_subscriptions
  alter column id set not null;

create unique index if not exists happyad_push_row_id_uidx
  on public.happyad_push_subscriptions(id);

alter table public.happyad_push_subscriptions add column if not exists installation_id text;
alter table public.happyad_push_subscriptions
  alter column installation_id type text using installation_id::text;
alter table public.happyad_push_subscriptions add column if not exists device_id text;
alter table public.happyad_push_subscriptions add column if not exists endpoint text;
alter table public.happyad_push_subscriptions add column if not exists p256dh text;
alter table public.happyad_push_subscriptions add column if not exists auth_key text;
alter table public.happyad_push_subscriptions add column if not exists expiration_time bigint;
alter table public.happyad_push_subscriptions add column if not exists platform text;
alter table public.happyad_push_subscriptions add column if not exists user_agent text;
alter table public.happyad_push_subscriptions add column if not exists app_mode text default 'browser';
alter table public.happyad_push_subscriptions add column if not exists permission text default 'granted';
alter table public.happyad_push_subscriptions add column if not exists enabled boolean default true;
alter table public.happyad_push_subscriptions add column if not exists created_at timestamptz default now();
alter table public.happyad_push_subscriptions add column if not exists updated_at timestamptz default now();
alter table public.happyad_push_subscriptions add column if not exists last_seen_at timestamptz default now();

update public.happyad_push_subscriptions
set installation_id = coalesce(nullif(btrim(installation_id),''), nullif(btrim(device_id),''), 'legacy-' || id::text),
    device_id = coalesce(nullif(btrim(device_id),''), nullif(btrim(installation_id),''), 'legacy-' || id::text),
    app_mode = coalesce(nullif(btrim(app_mode),''), 'unknown'),
    permission = coalesce(nullif(btrim(permission),''), 'granted'),
    enabled = coalesce(enabled,false),
    created_at = coalesce(created_at,now()),
    updated_at = coalesce(updated_at,created_at,now()),
    last_seen_at = coalesce(last_seen_at,updated_at,created_at,now());

alter table public.happyad_push_subscriptions alter column installation_id set not null;
alter table public.happyad_push_subscriptions alter column device_id set not null;

-- Nettoyage immédiat de tous les anciens liens : garder uniquement la ligne
-- la plus récemment mise à jour pour chaque compte, qu'elle soit active ou non.
with ranked as (
  select
    id,
    row_number() over (
      partition by user_id
      order by coalesce(enabled,false) desc,
               updated_at desc nulls last,
               last_seen_at desc nulls last,
               created_at desc nulls last,
               id desc
    ) as rn
  from public.happyad_push_subscriptions
)
delete from public.happyad_push_subscriptions s
using ranked r
where s.id = r.id
  and r.rn > 1;

-- Un endpoint ne peut appartenir qu'à une seule ligne.
with ranked_endpoint as (
  select
    id,
    row_number() over (
      partition by endpoint
      order by updated_at desc nulls last,
               last_seen_at desc nulls last,
               created_at desc nulls last,
               id desc
    ) as rn
  from public.happyad_push_subscriptions
  where nullif(btrim(endpoint),'') is not null
)
delete from public.happyad_push_subscriptions s
using ranked_endpoint r
where s.id = r.id
  and r.rn > 1;

-- Garantie serveur définitive : une seule ligne Push par compte.
create unique index if not exists happyad_push_one_link_per_user_uidx
  on public.happyad_push_subscriptions(user_id);

create unique index if not exists happyad_push_one_endpoint_uidx
  on public.happyad_push_subscriptions(endpoint);

create index if not exists happyad_push_subscriptions_user_enabled_idx
  on public.happyad_push_subscriptions(user_id,enabled,updated_at desc);

alter table public.happyad_push_subscriptions enable row level security;

drop policy if exists happyad_push_select_own on public.happyad_push_subscriptions;
create policy happyad_push_select_own
on public.happyad_push_subscriptions
for select
to authenticated
using (user_id = auth.uid());

grant usage on schema public to authenticated;
revoke all on table public.happyad_push_subscriptions from anon;
revoke insert,update,delete on table public.happyad_push_subscriptions from authenticated;
grant select on table public.happyad_push_subscriptions to authenticated;

-- Enregistrement atomique du lien courant.
-- Le client V776 utilise exactement cette signature.
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
  if v_endpoint = '' or btrim(coalesce(p_p256dh,'')) = ''
     or btrim(coalesce(p_auth_key,'')) = '' or v_installation = '' then
    raise exception 'PUSH_SUBSCRIPTION_INCOMPLETE' using errcode='22023';
  end if;

  -- Supprimer tous les anciens liens du compte et toute ancienne propriété
  -- du même endpoint avant d'insérer le lien courant.
  delete from public.happyad_push_subscriptions
   where user_id = v_uid
      or endpoint = v_endpoint;
  get diagnostics v_removed = row_count;

  insert into public.happyad_push_subscriptions(
    user_id,installation_id,device_id,endpoint,p256dh,auth_key,expiration_time,
    platform,user_agent,app_mode,permission,enabled,
    created_at,updated_at,last_seen_at
  ) values (
    v_uid,v_installation,v_installation,v_endpoint,btrim(p_p256dh),btrim(p_auth_key),p_expiration_time,
    left(coalesce(p_platform,''),80),left(coalesce(p_user_agent,''),500),
    'browser','granted',true,now(),now(),now()
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

-- Vérification/nettoyage explicite appelée après l'enregistrement par la V776.
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
    'endpoint',v_endpoint
  );
end;
$$;

-- À la déconnexion, supprimer la ligne serveur avant l'unsubscribe navigateur.
drop function if exists public.happyad_push_disable_subscription(text);
create function public.happyad_push_disable_subscription(p_endpoint text)
returns boolean
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then return false; end if;
  delete from public.happyad_push_subscriptions
   where user_id = v_uid
     and endpoint = btrim(coalesce(p_endpoint,''));
  return found;
end;
$$;


-- Déconnexion sûre : supprimer tous les liens du compte même si le navigateur
-- ne retrouve plus sa souscription locale.
drop function if exists public.happyad_push_disable_all_own_subscriptions();
create function public.happyad_push_disable_all_own_subscriptions()
returns integer
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  v_uid uuid := auth.uid();
  v_removed integer := 0;
begin
  if v_uid is null then return 0; end if;
  delete from public.happyad_push_subscriptions where user_id = v_uid;
  get diagnostics v_removed = row_count;
  return v_removed;
end;
$$;

revoke all on function public.happyad_push_register_subscription(text,text,text,text,bigint,text,text,text) from public;
revoke all on function public.happyad_push_cleanup_own_subscriptions(text,text) from public;
revoke all on function public.happyad_push_disable_subscription(text) from public;
revoke all on function public.happyad_push_disable_all_own_subscriptions() from public;

grant execute on function public.happyad_push_register_subscription(text,text,text,text,bigint,text,text,text) to authenticated;
grant execute on function public.happyad_push_cleanup_own_subscriptions(text,text) to authenticated;
grant execute on function public.happyad_push_disable_subscription(text) to authenticated;
grant execute on function public.happyad_push_disable_all_own_subscriptions() to authenticated;

select pg_notify('pgrst','reload schema');

commit;

-- CONTRÔLE FINAL : chaque ligne doit afficher active_links <= 1.
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
  user_id,
  count(*) filter (where enabled is true) as active_links,
  count(*) as stored_links,
  max(updated_at) as last_updated_at
from public.happyad_push_subscriptions
group by user_id
order by active_links desc, stored_links desc, last_updated_at desc;

select
  count(*) filter (where active_links > 1) as accounts_with_conflict,
  count(*) as accounts_checked
from (
  select user_id, count(*) filter (where enabled is true) as active_links
  from public.happyad_push_subscriptions
  group by user_id
) x;
