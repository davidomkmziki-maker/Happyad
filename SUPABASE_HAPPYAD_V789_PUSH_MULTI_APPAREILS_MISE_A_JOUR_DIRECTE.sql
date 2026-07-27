-- HAPPYAD V789 — PUSH MULTI-APPAREILS + RÉPARATION DES LIENS
-- À exécuter UNE FOIS dans Supabase SQL Editor avant de déployer la fonction V789.
-- Objectif : chaque compte peut conserver plusieurs téléphones actifs,
-- avec exactement un endpoint courant par installation.

begin;

create extension if not exists pgcrypto;

alter table public.happyad_push_subscriptions add column if not exists installation_id text;
alter table public.happyad_push_subscriptions add column if not exists device_id text;
alter table public.happyad_push_subscriptions add column if not exists enabled boolean default true;
alter table public.happyad_push_subscriptions add column if not exists permission text default 'granted';
alter table public.happyad_push_subscriptions add column if not exists updated_at timestamptz default now();
alter table public.happyad_push_subscriptions add column if not exists last_seen_at timestamptz default now();

update public.happyad_push_subscriptions
set installation_id = coalesce(nullif(btrim(installation_id),''), nullif(btrim(device_id),''), 'legacy-' || coalesce(id::text,gen_random_uuid()::text)),
    device_id = coalesce(nullif(btrim(device_id),''), nullif(btrim(installation_id),''), 'legacy-' || coalesce(id::text,gen_random_uuid()::text)),
    enabled = coalesce(enabled,true),
    permission = coalesce(nullif(btrim(permission),''),'granted'),
    updated_at = coalesce(updated_at,now()),
    last_seen_at = coalesce(last_seen_at,updated_at,now());

-- Supprimer l'ancienne garantie qui éliminait les autres téléphones du compte.
drop index if exists public.happyad_push_one_link_per_user_uidx;

-- Un endpoint Web Push ne peut appartenir qu'à une seule ligne.
with ranked_endpoint as (
  select id,
         row_number() over (
           partition by endpoint
           order by coalesce(enabled,false) desc,
                    updated_at desc nulls last,
                    last_seen_at desc nulls last,
                    id desc
         ) rn
  from public.happyad_push_subscriptions
  where nullif(btrim(endpoint),'') is not null
)
delete from public.happyad_push_subscriptions s
using ranked_endpoint r
where s.id=r.id and r.rn>1;

-- Une installation garde uniquement son endpoint le plus récent.
with ranked_installation as (
  select id,
         row_number() over (
           partition by user_id,installation_id
           order by coalesce(enabled,false) desc,
                    updated_at desc nulls last,
                    last_seen_at desc nulls last,
                    id desc
         ) rn
  from public.happyad_push_subscriptions
)
delete from public.happyad_push_subscriptions s
using ranked_installation r
where s.id=r.id and r.rn>1;

create unique index if not exists happyad_push_one_endpoint_uidx
  on public.happyad_push_subscriptions(endpoint);
create unique index if not exists happyad_push_one_installation_per_user_uidx
  on public.happyad_push_subscriptions(user_id,installation_id);
create index if not exists happyad_push_subscriptions_user_enabled_idx
  on public.happyad_push_subscriptions(user_id,enabled,updated_at desc);

-- Enregistrer ou renouveler uniquement l'installation courante.
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
set search_path=public
set row_security=off
as $$
declare
  v_uid uuid:=auth.uid();
  v_endpoint text:=btrim(coalesce(p_endpoint,''));
  v_installation text:=left(btrim(coalesce(p_installation_id,'')),160);
  v_row public.happyad_push_subscriptions;
  v_removed integer:=0;
  v_removed_step integer:=0;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED' using errcode='28000'; end if;
  if v_endpoint='' or btrim(coalesce(p_p256dh,''))='' or btrim(coalesce(p_auth_key,''))='' or v_installation='' then
    raise exception 'PUSH_SUBSCRIPTION_INCOMPLETE' using errcode='22023';
  end if;

  -- L'endpoint courant change de propriétaire si nécessaire.
  delete from public.happyad_push_subscriptions
   where endpoint=v_endpoint
     and (user_id<>v_uid or installation_id<>v_installation);
  get diagnostics v_removed=row_count;

  -- Retirer uniquement l'ancien endpoint de CE téléphone.
  delete from public.happyad_push_subscriptions
   where user_id=v_uid
     and installation_id=v_installation
     and endpoint<>v_endpoint;
  get diagnostics v_removed_step=row_count;
  v_removed:=v_removed+v_removed_step;

  insert into public.happyad_push_subscriptions(
    user_id,installation_id,device_id,endpoint,p256dh,auth_key,expiration_time,
    platform,user_agent,app_mode,permission,enabled,created_at,updated_at,last_seen_at
  ) values (
    v_uid,v_installation,v_installation,v_endpoint,btrim(p_p256dh),btrim(p_auth_key),p_expiration_time,
    left(coalesce(p_platform,''),80),left(coalesce(p_user_agent,''),500),
    'browser','granted',true,now(),now(),now()
  )
  on conflict (user_id,installation_id) do update set
    device_id=excluded.device_id,
    endpoint=excluded.endpoint,
    p256dh=excluded.p256dh,
    auth_key=excluded.auth_key,
    expiration_time=excluded.expiration_time,
    platform=excluded.platform,
    user_agent=excluded.user_agent,
    app_mode=excluded.app_mode,
    permission='granted',
    enabled=true,
    updated_at=now(),
    last_seen_at=now()
  returning * into v_row;

  return jsonb_build_object(
    'ok',true,
    'multi_device',true,
    'removed_old_links_for_this_installation',v_removed,
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

-- Nettoyer seulement les doublons de l'installation courante.
drop function if exists public.happyad_push_cleanup_own_subscriptions(text,text);
create function public.happyad_push_cleanup_own_subscriptions(
  p_keep_endpoint text default null,
  p_keep_installation_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path=public
set row_security=off
as $$
declare
  v_uid uuid:=auth.uid();
  v_endpoint text:=btrim(coalesce(p_keep_endpoint,''));
  v_installation text:=left(btrim(coalesce(p_keep_installation_id,'')),160);
  v_removed integer:=0;
  v_active integer:=0;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED' using errcode='28000'; end if;
  if v_endpoint='' or v_installation='' then raise exception 'KEEP_ENDPOINT_AND_INSTALLATION_REQUIRED' using errcode='22023'; end if;

  delete from public.happyad_push_subscriptions
   where user_id=v_uid
     and installation_id=v_installation
     and endpoint<>v_endpoint;
  get diagnostics v_removed=row_count;

  update public.happyad_push_subscriptions
     set enabled=true,permission='granted',device_id=v_installation,
         updated_at=now(),last_seen_at=now()
   where user_id=v_uid
     and installation_id=v_installation
     and endpoint=v_endpoint;

  select count(*)::integer into v_active
  from public.happyad_push_subscriptions
  where user_id=v_uid and installation_id=v_installation and endpoint=v_endpoint and enabled=true;

  if v_active<>1 then raise exception 'PUSH_CURRENT_INSTALLATION_NOT_CONFIRMED' using errcode='P0001'; end if;

  return jsonb_build_object(
    'ok',true,'multi_device',true,'removed_old_links_for_this_installation',v_removed,
    'active_for_current_installation',v_active,'endpoint',v_endpoint,'installation_id',v_installation
  );
end;
$$;

-- Désactiver uniquement l'endpoint du téléphone courant.
drop function if exists public.happyad_push_disable_subscription(text);
create function public.happyad_push_disable_subscription(p_endpoint text)
returns boolean
language plpgsql
security definer
set search_path=public
set row_security=off
as $$
declare v_uid uuid:=auth.uid();
begin
  if v_uid is null then return false; end if;
  delete from public.happyad_push_subscriptions
   where user_id=v_uid and endpoint=btrim(coalesce(p_endpoint,''));
  return found;
end;
$$;

revoke all on function public.happyad_push_register_subscription(text,text,text,text,bigint,text,text,text) from public;
revoke all on function public.happyad_push_cleanup_own_subscriptions(text,text) from public;
revoke all on function public.happyad_push_disable_subscription(text) from public;
grant execute on function public.happyad_push_register_subscription(text,text,text,text,bigint,text,text,text) to authenticated;
grant execute on function public.happyad_push_cleanup_own_subscriptions(text,text) to authenticated;
grant execute on function public.happyad_push_disable_subscription(text) to authenticated;

select pg_notify('pgrst','reload schema');
commit;

-- CONTRÔLE : plusieurs lignes par compte sont normales, mais une seule par installation.
select user_id,
       count(*) filter(where enabled=true) as active_devices,
       count(distinct installation_id) filter(where enabled=true) as active_installations,
       max(updated_at) as last_updated_at
from public.happyad_push_subscriptions
group by user_id
order by active_devices desc,last_updated_at desc;

select count(*) as duplicate_installations
from (
  select user_id,installation_id,count(*)
  from public.happyad_push_subscriptions
  group by user_id,installation_id
  having count(*)>1
) d;
