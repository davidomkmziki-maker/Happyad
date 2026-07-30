-- HAPPYAD V811 — PARTIE 01/04
-- Fondation de publication Marketplace pour toutes les catégories.
-- Exécuter après V801, V803/V804 et V810.

begin;

create extension if not exists pgcrypto;

do $$
begin
  if to_regclass('public.happyad_posts') is null then
    raise exception 'HAPPYAD_POSTS_TABLE_REQUIRED';
  end if;
  if to_regclass('public.happyad_seller_verification_requests') is null
     or to_regprocedure('public.happyad_is_verified_seller(uuid)') is null then
    raise exception 'HAPPYAD_V801_VERIFICATION_REQUIRED';
  end if;
end $$;

-- La centrale existante happyad_posts reste l'unique table publique d'annonces.
alter table public.happyad_posts add column if not exists happyad_marketplace boolean not null default false;
alter table public.happyad_posts add column if not exists marketplace_category text;
alter table public.happyad_posts add column if not exists listing_type text;
alter table public.happyad_posts add column if not exists listing_status text not null default 'active';
alter table public.happyad_posts add column if not exists marketplace_price numeric;
alter table public.happyad_posts add column if not exists price_label text;
alter table public.happyad_posts add column if not exists currency text;
alter table public.happyad_posts add column if not exists country text;
alter table public.happyad_posts add column if not exists city text;
alter table public.happyad_posts add column if not exists availability text;
alter table public.happyad_posts add column if not exists product_condition text;
alter table public.happyad_posts add column if not exists quantity integer;
alter table public.happyad_posts add column if not exists product_brand text;
alter table public.happyad_posts add column if not exists product_model text;
alter table public.happyad_posts add column if not exists marketplace_media jsonb not null default '[]'::jsonb;
alter table public.happyad_posts add column if not exists marketplace_details jsonb not null default '{}'::jsonb;
alter table public.happyad_posts add column if not exists marketplace_proof_status text;
alter table public.happyad_posts add column if not exists seller_verification_id uuid;
alter table public.happyad_posts add column if not exists keywords text;
alter table public.happyad_posts add column if not exists is_active boolean not null default true;
alter table public.happyad_posts add column if not exists updated_at timestamptz not null default now();

-- Champs indexables propres aux catégories.
alter table public.happyad_posts add column if not exists vehicle_year integer;
alter table public.happyad_posts add column if not exists vehicle_mileage numeric;
alter table public.happyad_posts add column if not exists land_area numeric;
alter table public.happyad_posts add column if not exists land_area_unit text;
alter table public.happyad_posts add column if not exists land_use text;
alter table public.happyad_posts add column if not exists land_document_type text;
alter table public.happyad_posts add column if not exists service_mode text;
alter table public.happyad_posts add column if not exists service_pricing text;
alter table public.happyad_posts add column if not exists service_experience text;
alter table public.happyad_posts add column if not exists company_name text;
alter table public.happyad_posts add column if not exists job_contract text;
alter table public.happyad_posts add column if not exists job_work_mode text;
alter table public.happyad_posts add column if not exists job_experience text;
alter table public.happyad_posts add column if not exists job_positions integer;
alter table public.happyad_posts add column if not exists job_deadline date;
alter table public.happyad_posts add column if not exists job_salary numeric;
alter table public.happyad_posts add column if not exists job_salary_currency text;
alter table public.happyad_posts add column if not exists property_type text;
alter table public.happyad_posts add column if not exists property_rooms integer;
alter table public.happyad_posts add column if not exists property_area numeric;

-- Les justificatifs sensibles ne sont jamais placés dans happyad_posts.
create table if not exists public.happyad_marketplace_private_proofs (
  id uuid primary key default gen_random_uuid(),
  listing_id text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  seller_verification_id uuid,
  category text not null,
  ownership_paths text[] not null default '{}'::text[],
  official_paths text[] not null default '{}'::text[],
  attested boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint happyad_marketplace_private_attested_v811_check check (attested = true),
  constraint happyad_marketplace_private_category_v811_check check (
    category in ('Produit','Électronique','Véhicule','Terrain','Service','Emploi','Immobilier','Autre')
  )
);

create index if not exists happyad_marketplace_private_user_v811_idx
  on public.happyad_marketplace_private_proofs (user_id, created_at desc);
create index if not exists happyad_posts_marketplace_category_price_v811_idx
  on public.happyad_posts (marketplace_category, city, currency, marketplace_price, created_at desc)
  where happyad_marketplace = true and listing_status = 'active' and is_active = true;
create index if not exists happyad_posts_marketplace_owner_v811_idx
  on public.happyad_posts (user_id, created_at desc)
  where happyad_marketplace = true;

alter table public.happyad_marketplace_private_proofs enable row level security;
grant select on public.happyad_marketplace_private_proofs to authenticated;

drop policy if exists "happyad marketplace private owner read v811" on public.happyad_marketplace_private_proofs;
create policy "happyad marketplace private owner read v811"
on public.happyad_marketplace_private_proofs
for select to authenticated
using (user_id = auth.uid());

drop policy if exists "happyad marketplace private admin read v811" on public.happyad_marketplace_private_proofs;
create policy "happyad marketplace private admin read v811"
on public.happyad_marketplace_private_proofs
for select to authenticated
using (public.happyad_seller_verification_admin_allowed());

create or replace function public.happyad_touch_marketplace_private_v811()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists happyad_touch_marketplace_private_v811 on public.happyad_marketplace_private_proofs;
create trigger happyad_touch_marketplace_private_v811
before update on public.happyad_marketplace_private_proofs
for each row execute function public.happyad_touch_marketplace_private_v811();

commit;

select
  to_regclass('public.happyad_posts') is not null as posts_ok,
  to_regclass('public.happyad_marketplace_private_proofs') is not null as private_proofs_ok,
  exists(select 1 from information_schema.columns where table_schema='public' and table_name='happyad_posts' and column_name='marketplace_details') as details_ok,
  exists(select 1 from information_schema.columns where table_schema='public' and table_name='happyad_posts' and column_name='vehicle_year') as vehicle_fields_ok,
  exists(select 1 from information_schema.columns where table_schema='public' and table_name='happyad_posts' and column_name='job_contract') as job_fields_ok;
