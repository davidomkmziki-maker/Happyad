-- HAPPYAD V820 — Partie 01/03
-- Ajoute les champs nécessaires au choix Accueil, à la couverture et au compteur de vues.

begin;

alter table public.happyad_posts
  add column if not exists marketplace_show_on_home boolean not null default false,
  add column if not exists marketplace_cover_index integer not null default 0,
  add column if not exists marketplace_cover_url text,
  add column if not exists marketplace_cover_path text,
  add column if not exists marketplace_cover_type text,
  add column if not exists listing_views_count bigint not null default 0,
  add column if not exists marketplace_details jsonb not null default '{}'::jsonb,
  add column if not exists marketplace_media jsonb not null default '[]'::jsonb;

alter table public.happyad_posts
  drop constraint if exists happyad_posts_marketplace_cover_index_v820_check;

alter table public.happyad_posts
  add constraint happyad_posts_marketplace_cover_index_v820_check
  check (marketplace_cover_index between 0 and 99) not valid;

create index if not exists happyad_posts_marketplace_home_v820_idx
  on public.happyad_posts (marketplace_show_on_home, created_at desc)
  where coalesce(happyad_marketplace,false)=true
    and coalesce(listing_status,'active')='active'
    and coalesce(is_active,true)=true
    and deleted_at is null;

create index if not exists happyad_posts_listing_views_v820_idx
  on public.happyad_posts (listing_views_count desc, created_at desc)
  where coalesce(happyad_marketplace,false)=true;

commit;

select
  to_regclass('public.happyad_posts') is not null as posts_ok,
  exists(select 1 from information_schema.columns where table_schema='public' and table_name='happyad_posts' and column_name='marketplace_show_on_home') as accueil_ok,
  exists(select 1 from information_schema.columns where table_schema='public' and table_name='happyad_posts' and column_name='marketplace_cover_url') as couverture_ok,
  exists(select 1 from information_schema.columns where table_schema='public' and table_name='happyad_posts' and column_name='listing_views_count') as vues_ok;
