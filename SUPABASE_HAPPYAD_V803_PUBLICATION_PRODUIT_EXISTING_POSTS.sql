-- HAPPYAD V803 — Publication Produit dans la centrale existante public.happyad_posts.
-- Prérequis : SUPABASE_HAPPYAD_V801_VERIFICATION_VENDEUR_ADMIN.sql déjà exécuté.
-- Cette migration ne crée aucune deuxième table d'annonces.
-- Un produit est publié uniquement par un compte vendeur approuvé par un administrateur.

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

-- Colonnes spécialisées ajoutées à la centrale de publications existante.
-- Les champs sociaux déjà présents dans happyad_posts restent intacts.
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
alter table public.happyad_posts add column if not exists seller_verification_id uuid;
alter table public.happyad_posts add column if not exists keywords text;
alter table public.happyad_posts add column if not exists is_active boolean not null default true;

-- Contrainte limitée à la nouvelle colonne de statut, sans toucher aux anciens posts.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'happyad_posts_listing_status_v803_check'
      and conrelid = 'public.happyad_posts'::regclass
  ) then
    alter table public.happyad_posts
      add constraint happyad_posts_listing_status_v803_check
      check (listing_status in ('active','paused','sold','expired','removed')) not valid;
  end if;
end $$;

create index if not exists happyad_posts_marketplace_active_v803_idx
  on public.happyad_posts (happyad_marketplace, listing_status, created_at desc);
create index if not exists happyad_posts_marketplace_category_v803_idx
  on public.happyad_posts (marketplace_category, city, created_at desc)
  where happyad_marketplace = true;

-- Réutiliser le bucket média officiel de HAPPYAD. S'il existe déjà, sa configuration n'est pas modifiée.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values (
  'happyad-media','happyad-media',true,62914560,
  array['image/jpeg','image/png','image/webp','video/mp4','video/webm','video/quicktime']::text[]
)
on conflict (id) do nothing;

-- Dossier réservé : UID/marketplace/LISTING_ID/fichier.
drop policy if exists "happyad marketplace owner upload v803" on storage.objects;
create policy "happyad marketplace owner upload v803"
on storage.objects
for insert to authenticated
with check (
  bucket_id = 'happyad-media'
  and (storage.foldername(name))[1] = auth.uid()::text
  and (storage.foldername(name))[2] = 'marketplace'
);

-- Nettoyage autorisé uniquement dans son propre dossier Marketplace.
drop policy if exists "happyad marketplace owner delete v803" on storage.objects;
create policy "happyad marketplace owner delete v803"
on storage.objects
for delete to authenticated
using (
  bucket_id = 'happyad-media'
  and (storage.foldername(name))[1] = auth.uid()::text
  and (storage.foldername(name))[2] = 'marketplace'
);

create or replace function public.happyad_publish_product_v1(
  p_listing_id text,
  p_title text,
  p_description text,
  p_offer_type text,
  p_category text,
  p_country text,
  p_city text,
  p_price numeric,
  p_currency text,
  p_availability text,
  p_condition text,
  p_quantity integer,
  p_brand text,
  p_model text,
  p_media_paths text[],
  p_media_items jsonb,
  p_attested boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, storage, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_verification public.happyad_seller_verification_requests;
  v_profile jsonb := '{}'::jsonb;
  v_path text;
  v_prefix text;
  v_item jsonb;
  v_first jsonb;
  v_row jsonb;
  v_filtered jsonb;
  v_saved jsonb;
  v_columns text;
  v_values text;
  v_name text := 'Utilisateur HAPPYAD';
  v_username text := '';
  v_avatar text := '';
  v_badge text := 'aucun';
  v_price_label text;
  v_location text;
  v_keywords text;
  v_media_type text;
  v_post_kind text;
  v_media_url text;
  v_media_path text;
  v_file_name text;
  v_mime_type text;
  v_category text;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if not public.happyad_is_verified_seller(v_uid) then raise exception 'SELLER_NOT_APPROVED'; end if;

  select * into v_verification
  from public.happyad_seller_verification_requests
  where user_id = v_uid and status = 'approved'
  order by decided_at desc nulls last, submitted_at desc
  limit 1;

  if v_verification.id is null then raise exception 'SELLER_NOT_APPROVED'; end if;
  if trim(coalesce(p_listing_id,'')) !~ '^market_[A-Za-z0-9_-]{8,100}$' then raise exception 'LISTING_ID_INVALID'; end if;
  if exists (select 1 from public.happyad_posts p where p.id::text = trim(p_listing_id)) then raise exception 'LISTING_ALREADY_EXISTS'; end if;
  v_category := case when lower(trim(coalesce(p_category,''))) in ('électronique','electronique') then 'Électronique' else 'Produit' end;
  if lower(trim(coalesce(p_category,''))) not in ('produit','électronique','electronique') then raise exception 'CATEGORY_INVALID'; end if;
  if char_length(trim(coalesce(p_title,''))) not between 3 and 180 then raise exception 'TITLE_INVALID'; end if;
  if char_length(trim(coalesce(p_description,''))) not between 50 and 6000 then raise exception 'DESCRIPTION_INVALID'; end if;
  if char_length(trim(coalesce(p_country,''))) < 2 or char_length(trim(coalesce(p_city,''))) < 2 then raise exception 'LOCATION_REQUIRED'; end if;
  if coalesce(p_price,0) <= 0 then raise exception 'PRICE_INVALID'; end if;
  if char_length(trim(coalesce(p_currency,''))) < 2 then raise exception 'CURRENCY_REQUIRED'; end if;
  if char_length(trim(coalesce(p_availability,''))) < 2 then raise exception 'AVAILABILITY_REQUIRED'; end if;
  if trim(coalesce(p_condition,'')) not in ('Neuf','Comme neuf','Occasion','Reconditionné') then raise exception 'CONDITION_INVALID'; end if;
  if coalesce(p_quantity,0) < 1 or p_quantity > 999999 then raise exception 'QUANTITY_INVALID'; end if;
  if coalesce(p_attested,false) is not true then raise exception 'ATTESTATION_REQUIRED'; end if;
  if coalesce(cardinality(p_media_paths),0) not between 1 and 6 then raise exception 'MEDIA_COUNT_INVALID'; end if;
  if p_media_items is null or jsonb_typeof(p_media_items) is distinct from 'array' or jsonb_array_length(p_media_items) <> cardinality(p_media_paths) then raise exception 'MEDIA_ITEMS_INVALID'; end if;

  v_prefix := v_uid::text || '/marketplace/' || trim(p_listing_id) || '/';
  foreach v_path in array p_media_paths loop
    if v_path is null or left(v_path,char_length(v_prefix)) <> v_prefix then raise exception 'MEDIA_PATH_INVALID'; end if;
    if not exists(select 1 from storage.objects where bucket_id='happyad-media' and name=v_path) then raise exception 'MEDIA_UPLOAD_MISSING'; end if;
  end loop;

  for v_item in select value from jsonb_array_elements(p_media_items) loop
    if coalesce(v_item->>'path','') = '' or not (v_item->>'path' = any(p_media_paths)) then raise exception 'MEDIA_ITEM_PATH_INVALID'; end if;
    if coalesce(v_item->>'type','') not in ('image','video') then raise exception 'MEDIA_TYPE_INVALID'; end if;
    if coalesce(v_item->>'src','') not like '%/storage/v1/object/public/happyad-media/%' then raise exception 'MEDIA_URL_INVALID'; end if;
  end loop;

  if to_regclass('public.profiles') is not null then
    begin
      execute 'select to_jsonb(p) from public.profiles p where p.id = $1 limit 1' into v_profile using v_uid;
    exception when others then v_profile := '{}'::jsonb;
    end;
  end if;

  v_name := coalesce(nullif(trim(v_profile->>'full_name'),''),nullif(trim(v_profile->>'display_name'),''),nullif(trim(v_profile->>'name'),''),nullif(trim(v_verification.full_name),''),'Utilisateur HAPPYAD');
  v_username := coalesce(nullif(trim(v_profile->>'username'),''),nullif(trim(v_profile->>'handle'),''),'');
  v_avatar := coalesce(nullif(trim(v_profile->>'avatar_url'),''),nullif(trim(v_profile->>'avatar'),''),'');
  v_badge := coalesce(nullif(trim(v_profile->>'badge'),''),nullif(trim(v_profile->>'user_badge'),''),'aucun');
  v_price_label := trim(p_price::text) || ' ' || upper(trim(p_currency));
  v_location := trim(p_city) || ' · ' || trim(p_country);
  v_keywords := trim(concat_ws(' ',p_title,p_brand,p_model,p_description,p_city,p_country,v_category));
  v_first := p_media_items->0;
  v_media_type := coalesce(v_first->>'type','image');
  v_post_kind := case when v_media_type='video' then 'video' else 'photo' end;
  v_media_url := coalesce(v_first->>'src','');
  v_media_path := coalesce(v_first->>'path','');
  v_file_name := coalesce(v_first->>'name','');
  v_mime_type := coalesce(v_first->>'mime','');

  -- Objet filtré ensuite selon les colonnes réellement présentes dans la base active.
  v_row := jsonb_build_object(
    'id',trim(p_listing_id),
    'user_id',v_uid,
    'mode','publish',
    'title',trim(p_title),
    'description',trim(p_description),
    'category',v_category,
    'marketplace_category',v_category,
    'listing_type',coalesce(nullif(trim(p_offer_type),''),'À vendre'),
    'listing_status','active',
    'happyad_marketplace',true,
    'marketplace_price',p_price,
    'price',p_price::text,
    'price_label',v_price_label,
    'currency',upper(trim(p_currency)),
    'country',trim(p_country),
    'city',trim(p_city),
    'location',v_location,
    'availability',trim(p_availability),
    'product_condition',trim(p_condition),
    'condition',trim(p_condition),
    'quantity',p_quantity,
    'product_brand',nullif(trim(coalesce(p_brand,'')),''),
    'product_model',nullif(trim(coalesce(p_model,'')),''),
    'marketplace_media',p_media_items,
    'media_url',v_media_url,
    'media_path',v_media_path,
    'media_type',v_post_kind,
    'kind',v_post_kind,
    'mime_type',v_mime_type,
    'file_name',v_file_name,
    'creator_name',v_name,
    'display_name',v_name,
    'username',v_username,
    'handle',v_username,
    'avatar_url',v_avatar,
    'badge',v_badge,
    'seller_verification_id',v_verification.id,
    'keywords',v_keywords,
    'is_active',true,
    'created_at',now(),
    'updated_at',now()
  );

  select coalesce(jsonb_object_agg(e.key,e.value),'{}'::jsonb)
  into v_filtered
  from jsonb_each(v_row) e
  where exists (
    select 1 from information_schema.columns c
    where c.table_schema='public' and c.table_name='happyad_posts' and c.column_name=e.key
  );

  -- Insérer uniquement les colonnes fournies afin de conserver tous les DEFAULT
  -- et toutes les colonnes internes déjà utilisées par HAPPYAD principal.
  select
    string_agg(format('%I',c.column_name),',' order by c.ordinal_position),
    string_agg(format('(jsonb_populate_record(null::public.happyad_posts,$1)).%I',c.column_name),',' order by c.ordinal_position)
  into v_columns,v_values
  from information_schema.columns c
  where c.table_schema='public'
    and c.table_name='happyad_posts'
    and coalesce(c.is_generated,'NEVER')='NEVER'
    and v_filtered ? c.column_name::text;

  if coalesce(v_columns,'')='' or coalesce(v_values,'')='' then
    raise exception 'HAPPYAD_POSTS_COLUMNS_UNAVAILABLE';
  end if;

  execute format(
    'insert into public.happyad_posts as hp (%s) select %s returning to_jsonb(hp)',
    v_columns,v_values
  ) into v_saved using v_filtered;

  return jsonb_build_object(
    'ok',true,
    'listing',v_saved || jsonb_build_object(
      'happyad_marketplace',true,
      'marketplace_category',v_category,
      'listing_status','active',
      'marketplace_price',p_price,
      'price_label',v_price_label,
      'product_condition',trim(p_condition),
      'product_brand',nullif(trim(coalesce(p_brand,'')),''),
      'product_model',nullif(trim(coalesce(p_model,'')),''),
      'marketplace_media',p_media_items,
      'seller_verification_id',v_verification.id
    )
  );
end;
$$;

revoke all on function public.happyad_publish_product_v1(text,text,text,text,text,text,text,numeric,text,text,text,integer,text,text,text[],jsonb,boolean) from public;
grant execute on function public.happyad_publish_product_v1(text,text,text,text,text,text,text,numeric,text,text,text,integer,text,text,text[],jsonb,boolean) to authenticated;

commit;

-- CONTRÔLE APRÈS EXÉCUTION
select
  to_regclass('public.happyad_posts') is not null as existing_posts_table,
  to_regprocedure('public.happyad_publish_product_v1(text,text,text,text,text,text,text,numeric,text,text,text,integer,text,text,text[],jsonb,boolean)') is not null as product_rpc,
  exists(select 1 from information_schema.columns where table_schema='public' and table_name='happyad_posts' and column_name='happyad_marketplace') as marketplace_flag,
  exists(select 1 from information_schema.columns where table_schema='public' and table_name='happyad_posts' and column_name='marketplace_media') as marketplace_media,
  exists(select 1 from storage.buckets where id='happyad-media') as existing_media_bucket;
