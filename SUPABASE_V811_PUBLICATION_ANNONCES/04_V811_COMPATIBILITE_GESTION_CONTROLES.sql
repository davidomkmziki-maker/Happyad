-- HAPPYAD V811 — PARTIE 04/04
-- Compatibilité V803/V804, gestion du statut et contrôles finaux.

begin;

-- L'ancienne RPC Produit devient un simple adaptateur vers l'unique moteur V811.
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
language sql
security definer
set search_path = public, auth, storage, pg_temp
as $$
  select public.happyad_publish_listing_v1(
    p_listing_id,
    p_title,
    p_description,
    p_offer_type,
    p_category,
    p_country,
    p_city,
    p_price,
    p_currency,
    p_availability,
    jsonb_build_object(
      'condition',p_condition,
      'quantity',p_quantity,
      'product_brand',p_brand,
      'product_model',p_model
    ),
    p_media_paths,
    p_media_items,
    '{}'::text[],
    '{}'::text[],
    p_attested
  );
$$;

revoke all on function public.happyad_publish_product_v1(text,text,text,text,text,text,text,numeric,text,text,text,integer,text,text,text[],jsonb,boolean) from public;
grant execute on function public.happyad_publish_product_v1(text,text,text,text,text,text,text,numeric,text,text,text,integer,text,text,text[],jsonb,boolean) to authenticated;

-- Le propriétaire peut suspendre, réactiver, marquer vendu ou retirer son annonce.
create or replace function public.happyad_set_listing_status_v1(
  p_listing_id text,
  p_status text
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_status text := lower(trim(coalesce(p_status,'')));
  v_saved jsonb;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if v_status not in ('active','paused','sold','removed') then raise exception 'STATUS_INVALID'; end if;

  update public.happyad_posts p
  set listing_status = v_status,
      is_active = (v_status = 'active'),
      updated_at = now()
  where p.id::text = trim(p_listing_id)
    and p.user_id = v_uid
    and p.happyad_marketplace = true
  returning to_jsonb(p) into v_saved;

  if v_saved is null then raise exception 'LISTING_NOT_FOUND_OR_FORBIDDEN'; end if;
  return jsonb_build_object('ok',true,'listing',v_saved);
end;
$$;

revoke all on function public.happyad_set_listing_status_v1(text,text) from public;
grant execute on function public.happyad_set_listing_status_v1(text,text) to authenticated;

commit;

-- CONTRÔLES FINAUX : toutes les colonnes doivent être à true.
select
  to_regclass('public.happyad_posts') is not null as posts_table,
  to_regclass('public.happyad_marketplace_private_proofs') is not null as private_proofs_table,
  to_regprocedure('public.happyad_publish_listing_v1(text,text,text,text,text,text,text,numeric,text,text,jsonb,text[],jsonb,text[],text[],boolean)') is not null as all_categories_rpc,
  to_regprocedure('public.happyad_publish_product_v1(text,text,text,text,text,text,text,numeric,text,text,text,integer,text,text,text[],jsonb,boolean)') is not null as old_product_adapter,
  to_regprocedure('public.happyad_set_listing_status_v1(text,text)') is not null as status_rpc,
  exists(select 1 from storage.buckets where id='happyad-media' and public=true) as public_media_bucket,
  exists(select 1 from storage.buckets where id='happyad-marketplace-private' and public=false) as private_proof_bucket,
  exists(select 1 from information_schema.columns where table_schema='public' and table_name='happyad_posts' and column_name='marketplace_details') as all_details_column,
  exists(select 1 from information_schema.columns where table_schema='public' and table_name='happyad_posts' and column_name='property_type') as property_fields,
  exists(select 1 from information_schema.columns where table_schema='public' and table_name='happyad_posts' and column_name='service_mode') as service_fields;
