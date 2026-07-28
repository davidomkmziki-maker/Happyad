-- HAPPYAD V801 — Vérification vendeur validée uniquement par un administrateur.
-- Source d'autorité admin : public.happyad_admin_is_allowed() lorsqu'elle existe,
-- puis compatibilité stricte avec happyad_admin_users / profiles.
-- Rôles autorisés pour décider : OWNER, SUPERADMIN, ADMIN uniquement.

begin;

create extension if not exists pgcrypto;

create or replace function public.happyad_seller_verification_admin_allowed()
returns boolean
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_allowed boolean := false;
  v_row jsonb;
  v_role text := '';
  v_active text := '';
begin
  if auth.uid() is null then
    return false;
  end if;

  -- Réutiliser d'abord le garde-fou officiel du système administrateur HAPPYAD.
  if to_regprocedure('public.happyad_admin_is_allowed()') is not null then
    begin
      execute 'select public.happyad_admin_is_allowed()' into v_allowed;
      -- Le résultat officiel est conservé comme signal, mais la décision reste
      -- strictement limitée aux rôles OWNER / SUPERADMIN / ADMIN ci-dessous.
    exception when others then
      v_allowed := false;
    end;
  end if;

  -- Compatibilité avec la table centrale happyad_admin_users sans supposer ses colonnes exactes.
  if to_regclass('public.happyad_admin_users') is not null then
    begin
      execute $q$
        select to_jsonb(a)
        from public.happyad_admin_users a
        where coalesce(
          to_jsonb(a)->>'user_id',
          to_jsonb(a)->>'uid',
          to_jsonb(a)->>'profile_id',
          to_jsonb(a)->>'id'
        ) = auth.uid()::text
        limit 1
      $q$ into v_row;

      if v_row is not null then
        v_role := upper(coalesce(
          v_row->>'admin_role',
          v_row->>'role',
          v_row->>'user_role',
          v_row->>'account_role',
          ''
        ));
        v_active := lower(coalesce(v_row->>'status',v_row->>'state','active'));
        if v_role in ('OWNER','SUPERADMIN','ADMIN')
           and v_active not in ('blocked','disabled','inactive','suspended','deleted','false','0')
           and lower(coalesce(v_row->>'active','true')) not in ('false','0','no','non') then
          return true;
        end if;
      end if;
    exception when others then
      null;
    end;
  end if;

  -- Dernier fallback : rôle présent sur le vrai profil Supabase.
  if to_regclass('public.profiles') is not null then
    begin
      execute 'select to_jsonb(p) from public.profiles p where p.id = auth.uid() limit 1' into v_row;
      if v_row is not null then
        v_role := upper(coalesce(
          v_row->>'admin_role',
          v_row->>'role',
          v_row->>'user_role',
          v_row->>'account_role',
          ''
        ));
        if v_role in ('OWNER','SUPERADMIN','ADMIN')
           or lower(coalesce(v_row->>'is_admin','false')) = 'true' then
          return true;
        end if;
      end if;
    exception when others then
      null;
    end;
  end if;

  return false;
end;
$$;

revoke all on function public.happyad_seller_verification_admin_allowed() from public;
grant execute on function public.happyad_seller_verification_admin_allowed() to authenticated;

create table if not exists public.happyad_seller_verification_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_type text not null default 'user',
  full_name text not null,
  country text not null,
  city text not null,
  identity_type text not null,
  identity_number text not null,
  document_paths text[] not null default '{}'::text[],
  selfie_path text not null,
  consent boolean not null default false,
  status text not null default 'pending',
  admin_note text,
  decided_by uuid references auth.users(id) on delete set null,
  decided_at timestamptz,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint happyad_seller_verification_status_check
    check (status in ('pending','under_review','approved','rejected')),
  constraint happyad_seller_verification_documents_check
    check (cardinality(document_paths) between 1 and 2),
  constraint happyad_seller_verification_consent_check
    check (consent = true),
  constraint happyad_seller_verification_full_name_check
    check (char_length(trim(full_name)) between 3 and 160),
  constraint happyad_seller_verification_identity_number_check
    check (char_length(trim(identity_number)) between 4 and 120)
);

create index if not exists happyad_seller_verification_user_date_idx
  on public.happyad_seller_verification_requests (user_id, submitted_at desc);
create index if not exists happyad_seller_verification_status_date_idx
  on public.happyad_seller_verification_requests (status, submitted_at asc);
create unique index if not exists happyad_seller_verification_one_active_per_user_idx
  on public.happyad_seller_verification_requests (user_id)
  where status in ('pending','under_review');

create or replace function public.happyad_touch_seller_verification_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists happyad_touch_seller_verification_updated_at
  on public.happyad_seller_verification_requests;
create trigger happyad_touch_seller_verification_updated_at
before update on public.happyad_seller_verification_requests
for each row execute function public.happyad_touch_seller_verification_updated_at();

alter table public.happyad_seller_verification_requests enable row level security;

-- Le demandeur voit uniquement ses dossiers. Les écritures passent par les RPC sécurisées.
drop policy if exists "happyad verification owner read" on public.happyad_seller_verification_requests;
create policy "happyad verification owner read"
on public.happyad_seller_verification_requests
for select to authenticated
using (user_id = auth.uid());

-- Les administrateurs autorisés voient et traitent tous les dossiers.
drop policy if exists "happyad verification admin read" on public.happyad_seller_verification_requests;
create policy "happyad verification admin read"
on public.happyad_seller_verification_requests
for select to authenticated
using (public.happyad_seller_verification_admin_allowed());

drop policy if exists "happyad verification admin update" on public.happyad_seller_verification_requests;
create policy "happyad verification admin update"
on public.happyad_seller_verification_requests
for update to authenticated
using (public.happyad_seller_verification_admin_allowed())
with check (public.happyad_seller_verification_admin_allowed());

-- Bucket privé : aucun document n'est public.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'happyad-verification-private',
  'happyad-verification-private',
  false,
  10485760,
  array['image/jpeg','image/png','image/webp','application/pdf']::text[]
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- L'utilisateur peut charger uniquement dans son propre dossier UID/REQUEST_ID/.
drop policy if exists "happyad verification owner upload" on storage.objects;
create policy "happyad verification owner upload"
on storage.objects
for insert to authenticated
with check (
  bucket_id = 'happyad-verification-private'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- L'utilisateur peut relire uniquement ses propres fichiers privés.
drop policy if exists "happyad verification owner read files" on storage.objects;
create policy "happyad verification owner read files"
on storage.objects
for select to authenticated
using (
  bucket_id = 'happyad-verification-private'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Suppression autorisée seulement pour un fichier orphelin, jamais pour un dossier déjà soumis.
drop policy if exists "happyad verification owner delete orphan" on storage.objects;
create policy "happyad verification owner delete orphan"
on storage.objects
for delete to authenticated
using (
  bucket_id = 'happyad-verification-private'
  and (storage.foldername(name))[1] = auth.uid()::text
  and not exists (
    select 1
    from public.happyad_seller_verification_requests r
    where r.user_id = auth.uid()
      and (name = any(r.document_paths) or name = r.selfie_path)
  )
);

-- Les administrateurs autorisés lisent les documents privés.
drop policy if exists "happyad verification admin read files" on storage.objects;
create policy "happyad verification admin read files"
on storage.objects
for select to authenticated
using (
  bucket_id = 'happyad-verification-private'
  and public.happyad_seller_verification_admin_allowed()
);

create or replace function public.happyad_submit_seller_verification_v1(
  p_request_id uuid,
  p_account_type text,
  p_full_name text,
  p_country text,
  p_city text,
  p_identity_type text,
  p_identity_number text,
  p_document_paths text[],
  p_selfie_path text,
  p_consent boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, storage, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_prefix text;
  v_path text;
  v_row public.happyad_seller_verification_requests;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED';
  end if;
  if p_request_id is null then
    raise exception 'REQUEST_ID_REQUIRED';
  end if;
  if coalesce(p_consent,false) is not true then
    raise exception 'CONSENT_REQUIRED';
  end if;
  if char_length(trim(coalesce(p_full_name,''))) < 3 then
    raise exception 'FULL_NAME_INVALID';
  end if;
  if char_length(trim(coalesce(p_country,''))) < 2 or char_length(trim(coalesce(p_city,''))) < 2 then
    raise exception 'LOCATION_REQUIRED';
  end if;
  if char_length(trim(coalesce(p_identity_type,''))) < 2 then
    raise exception 'IDENTITY_TYPE_REQUIRED';
  end if;
  if char_length(trim(coalesce(p_identity_number,''))) < 4 then
    raise exception 'IDENTITY_NUMBER_INVALID';
  end if;
  if coalesce(cardinality(p_document_paths),0) not between 1 and 2 then
    raise exception 'DOCUMENT_COUNT_INVALID';
  end if;

  if exists (
    select 1 from public.happyad_seller_verification_requests
    where user_id = v_uid and status in ('pending','under_review')
  ) then
    raise exception 'ACTIVE_REQUEST_ALREADY_EXISTS';
  end if;

  v_prefix := v_uid::text || '/' || p_request_id::text || '/';
  foreach v_path in array p_document_paths loop
    if v_path is null or left(v_path, char_length(v_prefix)) <> v_prefix then
      raise exception 'DOCUMENT_PATH_INVALID';
    end if;
    if not exists (
      select 1 from storage.objects
      where bucket_id = 'happyad-verification-private' and name = v_path
    ) then
      raise exception 'DOCUMENT_UPLOAD_MISSING';
    end if;
  end loop;

  if p_selfie_path is null or left(p_selfie_path, char_length(v_prefix)) <> v_prefix then
    raise exception 'SELFIE_PATH_INVALID';
  end if;
  if not exists (
    select 1 from storage.objects
    where bucket_id = 'happyad-verification-private' and name = p_selfie_path
  ) then
    raise exception 'SELFIE_UPLOAD_MISSING';
  end if;

  insert into public.happyad_seller_verification_requests (
    id,user_id,account_type,full_name,country,city,identity_type,identity_number,
    document_paths,selfie_path,consent,status,submitted_at
  ) values (
    p_request_id,v_uid,coalesce(nullif(trim(p_account_type),''),'user'),trim(p_full_name),
    trim(p_country),trim(p_city),trim(p_identity_type),trim(p_identity_number),
    p_document_paths,p_selfie_path,true,'pending',now()
  ) returning * into v_row;

  return jsonb_build_object(
    'id',v_row.id,
    'requestId',v_row.id,
    'status',v_row.status,
    'fullName',v_row.full_name,
    'submittedAt',v_row.submitted_at,
    'adminValidation',true
  );
end;
$$;

revoke all on function public.happyad_submit_seller_verification_v1(uuid,text,text,text,text,text,text,text[],text,boolean) from public;
grant execute on function public.happyad_submit_seller_verification_v1(uuid,text,text,text,text,text,text,text[],text,boolean) to authenticated;

create or replace function public.happyad_get_my_seller_verification_v1()
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_row public.happyad_seller_verification_requests;
begin
  if auth.uid() is null then
    return null;
  end if;

  select * into v_row
  from public.happyad_seller_verification_requests
  where user_id = auth.uid()
  order by
    case status when 'approved' then 0 when 'under_review' then 1 when 'pending' then 2 else 3 end,
    submitted_at desc
  limit 1;

  if v_row.id is null then
    return null;
  end if;

  return jsonb_build_object(
    'id',v_row.id,
    'requestId',v_row.id,
    'status',v_row.status,
    'fullName',v_row.full_name,
    'submittedAt',v_row.submitted_at,
    'decidedAt',v_row.decided_at,
    'adminNote',v_row.admin_note,
    'adminValidation',true
  );
end;
$$;

revoke all on function public.happyad_get_my_seller_verification_v1() from public;
grant execute on function public.happyad_get_my_seller_verification_v1() to authenticated;

create or replace function public.happyad_is_verified_seller(p_user_id uuid default auth.uid())
returns boolean
language sql
security definer
stable
set search_path = public, auth, pg_temp
as $$
  select exists (
    select 1
    from public.happyad_seller_verification_requests r
    where r.user_id = coalesce(p_user_id,auth.uid())
      and r.status = 'approved'
  );
$$;

revoke all on function public.happyad_is_verified_seller(uuid) from public;
grant execute on function public.happyad_is_verified_seller(uuid) to authenticated;

-- Liste sécurisée pour la future page Admin « Vérifications vendeurs ».
create or replace function public.happyad_admin_list_seller_verifications_v1(
  p_status text default null,
  p_limit integer default 100
)
returns setof public.happyad_seller_verification_requests
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
begin
  if not public.happyad_seller_verification_admin_allowed() then
    raise exception 'ADMIN_ACCESS_REQUIRED';
  end if;

  return query
  select r.*
  from public.happyad_seller_verification_requests r
  where p_status is null or p_status = '' or r.status = lower(p_status)
  order by
    case r.status when 'pending' then 0 when 'under_review' then 1 when 'rejected' then 2 else 3 end,
    r.submitted_at asc
  limit greatest(1,least(coalesce(p_limit,100),300));
end;
$$;

revoke all on function public.happyad_admin_list_seller_verifications_v1(text,integer) from public;
grant execute on function public.happyad_admin_list_seller_verifications_v1(text,integer) to authenticated;

create or replace function public.happyad_admin_decide_seller_verification_v1(
  p_request_id uuid,
  p_decision text,
  p_admin_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_decision text := lower(trim(coalesce(p_decision,'')));
  v_row public.happyad_seller_verification_requests;
begin
  if not public.happyad_seller_verification_admin_allowed() then
    raise exception 'ADMIN_ACCESS_REQUIRED';
  end if;
  if v_decision not in ('approved','rejected') then
    raise exception 'DECISION_MUST_BE_APPROVED_OR_REJECTED';
  end if;

  update public.happyad_seller_verification_requests
  set status = v_decision,
      admin_note = nullif(trim(coalesce(p_admin_note,'')),''),
      decided_by = auth.uid(),
      decided_at = now(),
      updated_at = now()
  where id = p_request_id
    and status in ('pending','under_review')
  returning * into v_row;

  if v_row.id is null then
    raise exception 'REQUEST_NOT_FOUND_OR_ALREADY_DECIDED';
  end if;

  return jsonb_build_object(
    'id',v_row.id,
    'requestId',v_row.id,
    'userId',v_row.user_id,
    'status',v_row.status,
    'fullName',v_row.full_name,
    'adminNote',v_row.admin_note,
    'decidedAt',v_row.decided_at,
    'decidedBy',v_row.decided_by,
    'adminValidation',true
  );
end;
$$;

revoke all on function public.happyad_admin_decide_seller_verification_v1(uuid,text,text) from public;
grant execute on function public.happyad_admin_decide_seller_verification_v1(uuid,text,text) to authenticated;

-- Realtime : le compte reçoit le changement pending -> approved/rejected dès la décision admin.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.happyad_seller_verification_requests;
    exception when duplicate_object then
      null;
    end;
  end if;
end $$;

commit;

-- CONTRÔLE APRÈS EXÉCUTION
select
  to_regclass('public.happyad_seller_verification_requests') is not null as verification_table,
  to_regprocedure('public.happyad_submit_seller_verification_v1(uuid,text,text,text,text,text,text,text[],text,boolean)') is not null as submit_rpc,
  to_regprocedure('public.happyad_get_my_seller_verification_v1()') is not null as status_rpc,
  to_regprocedure('public.happyad_admin_decide_seller_verification_v1(uuid,text,text)') is not null as admin_decision_rpc,
  exists(select 1 from storage.buckets where id='happyad-verification-private' and public=false) as private_bucket;
