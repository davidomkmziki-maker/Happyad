-- HAPPYAD V811 + correctif V812 — PARTIE 03/04
-- RPC unique de publication réelle pour toutes les catégories.

begin;

create or replace function public.happyad_publish_listing_v1(
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
  p_details jsonb,
  p_media_paths text[],
  p_media_items jsonb,
  p_ownership_paths text[],
  p_official_paths text[],
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
  v_details jsonb := coalesce(p_details,'{}'::jsonb);
  v_category text;
  v_path text;
  v_prefix_public text;
  v_prefix_private text;
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
  v_media_count integer := coalesce(cardinality(p_media_paths),0);
  v_ownership_count integer := coalesce(cardinality(p_ownership_paths),0);
  v_official_count integer := coalesce(cardinality(p_official_paths),0);
  v_condition text := trim(coalesce(v_details->>'condition',''));
  v_quantity integer;
  v_vehicle_year integer;
  v_vehicle_mileage numeric;
  v_land_area numeric;
  v_job_positions integer;
  v_property_rooms integer;
  v_property_area numeric;
  v_job_deadline date;
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

  v_category := case lower(trim(translate(coalesce(p_category,''),'ÉÈÊËéèêë','EEEEeeee')))
    when 'produit' then 'Produit'
    when 'product' then 'Produit'
    when 'electronique' then 'Électronique'
    when 'electronics' then 'Électronique'
    when 'vehicule' then 'Véhicule'
    when 'vehicle' then 'Véhicule'
    when 'terrain' then 'Terrain'
    when 'land' then 'Terrain'
    when 'service' then 'Service'
    when 'emploi' then 'Emploi'
    when 'job' then 'Emploi'
    when 'immobilier' then 'Immobilier'
    when 'property' then 'Immobilier'
    when 'real estate' then 'Immobilier'
    when 'autre' then 'Autre'
    when 'other' then 'Autre'
    else null
  end;

  if v_category is null then raise exception 'CATEGORY_INVALID'; end if;
  if char_length(trim(coalesce(p_title,''))) not between 3 and 180 then raise exception 'TITLE_INVALID'; end if;
  if char_length(trim(coalesce(p_description,''))) not between 10 and 6000 then raise exception 'DESCRIPTION_INVALID'; end if;
  if char_length(trim(coalesce(p_offer_type,''))) < 2 then raise exception 'TYPE_REQUIRED'; end if;
  if char_length(trim(coalesce(p_country,''))) < 2 or char_length(trim(coalesce(p_city,''))) < 2 then raise exception 'LOCATION_REQUIRED'; end if;
  if coalesce(p_attested,false) is not true then raise exception 'ATTESTATION_REQUIRED'; end if;
  if p_media_items is null or jsonb_typeof(p_media_items) is distinct from 'array' or jsonb_array_length(p_media_items) <> v_media_count then raise exception 'MEDIA_ITEMS_INVALID'; end if;
  if v_media_count > 6 then raise exception 'MEDIA_COUNT_INVALID'; end if;

  -- Conversions sécurisées des détails numériques.
  if coalesce(v_details->>'quantity','') ~ '^[0-9]+$' then v_quantity := (v_details->>'quantity')::integer; end if;
  if coalesce(v_details->>'vehicle_year','') ~ '^[0-9]{4}$' then v_vehicle_year := (v_details->>'vehicle_year')::integer; end if;
  if coalesce(v_details->>'vehicle_mileage','') ~ '^[0-9]+([.][0-9]+)?$' then v_vehicle_mileage := (v_details->>'vehicle_mileage')::numeric; end if;
  if coalesce(v_details->>'land_area','') ~ '^[0-9]+([.][0-9]+)?$' then v_land_area := (v_details->>'land_area')::numeric; end if;
  if coalesce(v_details->>'job_positions','') ~ '^[0-9]+$' then v_job_positions := (v_details->>'job_positions')::integer; end if;
  if coalesce(v_details->>'property_rooms','') ~ '^[0-9]+$' then v_property_rooms := (v_details->>'property_rooms')::integer; end if;
  if coalesce(v_details->>'property_area','') ~ '^[0-9]+([.][0-9]+)?$' then v_property_area := (v_details->>'property_area')::numeric; end if;
  if coalesce(v_details->>'job_deadline','') ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then
    begin v_job_deadline := (v_details->>'job_deadline')::date; exception when others then v_job_deadline := null; end;
  end if;

  -- Règles communes de prix et disponibilité.
  if v_category <> 'Emploi' and coalesce(p_price,0) <= 0 then raise exception 'PRICE_INVALID'; end if;
  if coalesce(p_price,0) > 0 and char_length(trim(coalesce(p_currency,''))) < 2 then raise exception 'CURRENCY_REQUIRED'; end if;
  if v_category <> 'Emploi' and char_length(trim(coalesce(p_availability,''))) < 2 then raise exception 'AVAILABILITY_REQUIRED'; end if;

  -- Règles propres à chaque catégorie.
  if v_category in ('Produit','Électronique') then
    if v_media_count not between 1 and 6 then raise exception 'MEDIA_COUNT_INVALID'; end if;
    if v_condition not in ('Neuf','Comme neuf','Occasion','Reconditionné') then raise exception 'CONDITION_INVALID'; end if;
    if coalesce(v_quantity,0) not between 1 and 999999 then raise exception 'QUANTITY_INVALID'; end if;
  elsif v_category = 'Véhicule' then
    if v_media_count not between 2 and 6 then raise exception 'MEDIA_COUNT_INVALID'; end if;
    if v_condition not in ('Neuf','Comme neuf','Occasion','Reconditionné') then raise exception 'CONDITION_INVALID'; end if;
    if v_vehicle_year is null or v_vehicle_year < 1950 or v_vehicle_year > extract(year from now())::integer + 1 or coalesce(v_vehicle_mileage,-1) < 0 then raise exception 'VEHICLE_DETAILS_INVALID'; end if;
    if v_ownership_count < 1 then raise exception 'OWNERSHIP_REQUIRED'; end if;
    if v_official_count < 1 then raise exception 'OFFICIAL_REQUIRED'; end if;
  elsif v_category = 'Terrain' then
    if v_media_count not between 2 and 6 then raise exception 'MEDIA_COUNT_INVALID'; end if;
    if coalesce(v_land_area,0) <= 0
       or char_length(trim(coalesce(v_details->>'land_area_unit',''))) < 1
       or char_length(trim(coalesce(v_details->>'land_use',''))) < 2
       or char_length(trim(coalesce(v_details->>'land_document_type',''))) < 2 then raise exception 'LAND_DETAILS_INVALID'; end if;
    if v_ownership_count < 1 then raise exception 'OWNERSHIP_REQUIRED'; end if;
    if v_official_count < 1 then raise exception 'OFFICIAL_REQUIRED'; end if;
  elsif v_category = 'Service' then
    if v_media_count not between 1 and 6 then raise exception 'MEDIA_COUNT_INVALID'; end if;
    if char_length(trim(coalesce(v_details->>'service_mode',''))) < 2
       or char_length(trim(coalesce(v_details->>'service_pricing',''))) < 2
       or char_length(trim(coalesce(v_details->>'service_experience',''))) < 1 then raise exception 'SERVICE_DETAILS_INVALID'; end if;
  elsif v_category = 'Emploi' then
    if v_media_count not between 1 and 6 then raise exception 'MEDIA_COUNT_INVALID'; end if;
    if char_length(trim(coalesce(v_details->>'company_name',''))) < 2
       or char_length(trim(coalesce(v_details->>'job_contract',''))) < 2
       or char_length(trim(coalesce(v_details->>'job_work_mode',''))) < 2
       or char_length(trim(coalesce(v_details->>'job_experience',''))) < 1
       or coalesce(v_job_positions,0) < 1 then raise exception 'JOB_DETAILS_INVALID'; end if;
    if v_ownership_count < 1 then raise exception 'OWNERSHIP_REQUIRED'; end if;
  elsif v_category = 'Immobilier' then
    if v_media_count not between 2 and 6 then raise exception 'MEDIA_COUNT_INVALID'; end if;
    if char_length(trim(coalesce(v_details->>'property_type',''))) < 2
       or coalesce(v_property_rooms,0) < 1
       or coalesce(v_property_area,0) <= 0 then raise exception 'PROPERTY_DETAILS_INVALID'; end if;
    if v_ownership_count < 1 then raise exception 'OWNERSHIP_REQUIRED'; end if;
    if v_official_count < 1 then raise exception 'OFFICIAL_REQUIRED'; end if;
  elsif v_category = 'Autre' then
    if v_media_count not between 2 and 6 then raise exception 'MEDIA_COUNT_INVALID'; end if;
    if v_condition not in ('Neuf','Comme neuf','Occasion','Reconditionné') then raise exception 'CONDITION_INVALID'; end if;
    if coalesce(v_quantity,0) not between 1 and 999999 then raise exception 'QUANTITY_INVALID'; end if;
    if v_ownership_count < 1 then raise exception 'OWNERSHIP_REQUIRED'; end if;
  end if;

  if v_ownership_count > 2 or v_official_count > 2 then raise exception 'PRIVATE_COUNT_INVALID'; end if;

  -- Vérification des médias publics réellement chargés.
  v_prefix_public := v_uid::text || '/marketplace/' || trim(p_listing_id) || '/public/';
  foreach v_path in array coalesce(p_media_paths,'{}'::text[]) loop
    if v_path is null or left(v_path,char_length(v_prefix_public)) <> v_prefix_public then raise exception 'MEDIA_PATH_INVALID'; end if;
    if not exists(select 1 from storage.objects where bucket_id='happyad-media' and name=v_path) then raise exception 'MEDIA_UPLOAD_MISSING'; end if;
  end loop;

  for v_item in select value from jsonb_array_elements(p_media_items) loop
    if coalesce(v_item->>'path','') = '' or not (v_item->>'path' = any(coalesce(p_media_paths,'{}'::text[]))) then raise exception 'MEDIA_ITEM_PATH_INVALID'; end if;
    if coalesce(v_item->>'type','') not in ('image','video') then raise exception 'MEDIA_TYPE_INVALID'; end if;
    if coalesce(v_item->>'src','') not like '%/storage/v1/object/public/happyad-media/%' then raise exception 'MEDIA_URL_INVALID'; end if;
  end loop;

  -- Vérification des justificatifs privés réellement chargés.
  v_prefix_private := v_uid::text || '/marketplace/' || trim(p_listing_id) || '/private/';
  foreach v_path in array coalesce(p_ownership_paths,'{}'::text[]) loop
    if v_path is null or left(v_path,char_length(v_prefix_private)) <> v_prefix_private then raise exception 'PRIVATE_PATH_INVALID'; end if;
    if not exists(select 1 from storage.objects where bucket_id='happyad-marketplace-private' and name=v_path) then raise exception 'PRIVATE_UPLOAD_MISSING'; end if;
  end loop;
  foreach v_path in array coalesce(p_official_paths,'{}'::text[]) loop
    if v_path is null or left(v_path,char_length(v_prefix_private)) <> v_prefix_private then raise exception 'PRIVATE_PATH_INVALID'; end if;
    if not exists(select 1 from storage.objects where bucket_id='happyad-marketplace-private' and name=v_path) then raise exception 'PRIVATE_UPLOAD_MISSING'; end if;
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
  v_price_label := case when coalesce(p_price,0) > 0 then trim(p_price::text) || ' ' || upper(trim(p_currency)) else 'Salaire non précisé' end;
  v_location := trim(p_city) || ' · ' || trim(p_country);
  v_keywords := trim(concat_ws(' ',p_title,p_description,p_city,p_country,v_category,p_offer_type,v_details::text));
  v_first := p_media_items->0;
  v_media_type := coalesce(v_first->>'type','image');
  v_post_kind := case when v_media_type='video' then 'video' else 'photo' end;
  v_media_url := coalesce(v_first->>'src','');
  v_media_path := coalesce(v_first->>'path','');
  v_file_name := coalesce(v_first->>'name','');
  v_mime_type := coalesce(v_first->>'mime','');

  -- Objet adaptatif : seules les colonnes réellement présentes sont insérées.
  v_row := jsonb_build_object(
    'id',trim(p_listing_id),
    'user_id',v_uid,
    'mode','marketplace',
    'title',trim(p_title),
    'description',trim(p_description),
    'category',v_category,
    'marketplace_category',v_category,
    'listing_type',trim(p_offer_type),
    'listing_status','active',
    'happyad_marketplace',true,
    'marketplace_price',case when coalesce(p_price,0)>0 then p_price else null end,
    'price',case when coalesce(p_price,0)>0 then p_price::text else '' end,
    'price_label',v_price_label,
    'currency',case when coalesce(p_price,0)>0 then upper(trim(p_currency)) else '' end,
    'country',trim(p_country),
    'city',trim(p_city),
    'location',v_location,
    'availability',case when v_category='Emploi' then 'Selon l’employeur' else trim(p_availability) end,
    'product_condition',case when v_category in ('Produit','Électronique','Véhicule','Autre') then nullif(v_condition,'') else null end,
    'condition',case when v_category in ('Produit','Électronique','Véhicule','Autre') then nullif(v_condition,'') else null end,
    'quantity',case when v_category in ('Produit','Électronique','Autre') then v_quantity else null end,
    'product_brand',case when v_category in ('Produit','Électronique') then nullif(trim(coalesce(v_details->>'product_brand','')),'') else null end,
    'product_model',case when v_category in ('Produit','Électronique') then nullif(trim(coalesce(v_details->>'product_model','')),'') else null end,
    'vehicle_year',case when v_category='Véhicule' then v_vehicle_year else null end,
    'vehicle_mileage',case when v_category='Véhicule' then v_vehicle_mileage else null end,
    'land_area',case when v_category='Terrain' then v_land_area else null end,
    'land_area_unit',case when v_category='Terrain' then nullif(trim(coalesce(v_details->>'land_area_unit','')),'') else null end,
    'land_use',case when v_category='Terrain' then nullif(trim(coalesce(v_details->>'land_use','')),'') else null end,
    'land_document_type',case when v_category='Terrain' then nullif(trim(coalesce(v_details->>'land_document_type','')),'') else null end,
    'service_mode',case when v_category='Service' then nullif(trim(coalesce(v_details->>'service_mode','')),'') else null end,
    'service_pricing',case when v_category='Service' then nullif(trim(coalesce(v_details->>'service_pricing','')),'') else null end,
    'service_experience',case when v_category='Service' then nullif(trim(coalesce(v_details->>'service_experience','')),'') else null end,
    'company_name',case when v_category='Emploi' then nullif(trim(coalesce(v_details->>'company_name','')),'') else null end,
    'job_contract',case when v_category='Emploi' then nullif(trim(coalesce(v_details->>'job_contract','')),'') else null end,
    'job_work_mode',case when v_category='Emploi' then nullif(trim(coalesce(v_details->>'job_work_mode','')),'') else null end,
    'job_experience',case when v_category='Emploi' then nullif(trim(coalesce(v_details->>'job_experience','')),'') else null end,
    'job_positions',case when v_category='Emploi' then v_job_positions else null end,
    'job_deadline',case when v_category='Emploi' then v_job_deadline else null end,
    'job_salary',case when v_category='Emploi' and coalesce(p_price,0)>0 then p_price else null end,
    'job_salary_currency',case when v_category='Emploi' and coalesce(p_price,0)>0 then upper(trim(p_currency)) else null end,
    'property_type',case when v_category='Immobilier' then nullif(trim(coalesce(v_details->>'property_type','')),'') else null end,
    'property_rooms',case when v_category='Immobilier' then v_property_rooms else null end,
    'property_area',case when v_category='Immobilier' then v_property_area else null end,
    'marketplace_details',v_details,
    'marketplace_proof_status',case when v_ownership_count+v_official_count>0 then 'stored_private' else 'seller_attestation' end,
    'marketplace_media',p_media_items,
    'media_url',v_media_url,
    'media_path',v_media_path,
    'media_type',v_media_type,
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

  select
    string_agg(format('%I',c.column_name),',' order by c.ordinal_position),
    string_agg(format('(jsonb_populate_record(null::public.happyad_posts,$1)).%I',c.column_name),',' order by c.ordinal_position)
  into v_columns,v_values
  from information_schema.columns c
  where c.table_schema='public'
    and c.table_name='happyad_posts'
    and coalesce(c.is_generated,'NEVER')='NEVER'
    and v_filtered ? c.column_name::text;

  if coalesce(v_columns,'')='' or coalesce(v_values,'')='' then raise exception 'HAPPYAD_POSTS_COLUMNS_UNAVAILABLE'; end if;

  execute format(
    'insert into public.happyad_posts as hp (%s) select %s returning to_jsonb(hp)',
    v_columns,v_values
  ) into v_saved using v_filtered;

  insert into public.happyad_marketplace_private_proofs (
    listing_id,user_id,seller_verification_id,category,ownership_paths,official_paths,attested
  ) values (
    trim(p_listing_id),v_uid,v_verification.id,v_category,
    coalesce(p_ownership_paths,'{}'::text[]),coalesce(p_official_paths,'{}'::text[]),true
  );

  return jsonb_build_object(
    'ok',true,
    'listing',v_saved || jsonb_build_object(
      'happyad_marketplace',true,
      'marketplace_category',v_category,
      'listing_status','active',
      'marketplace_price',case when coalesce(p_price,0)>0 then p_price else null end,
      'price_label',v_price_label,
      'marketplace_details',v_details,
      'marketplace_media',p_media_items,
      'marketplace_proof_status',case when v_ownership_count+v_official_count>0 then 'stored_private' else 'seller_attestation' end,
      'seller_verification_id',v_verification.id
    )
  );
end;
$$;

revoke all on function public.happyad_publish_listing_v1(text,text,text,text,text,text,text,numeric,text,text,jsonb,text[],jsonb,text[],text[],boolean) from public;
grant execute on function public.happyad_publish_listing_v1(text,text,text,text,text,text,text,numeric,text,text,jsonb,text[],jsonb,text[],text[],boolean) to authenticated;

commit;

select to_regprocedure(
  'public.happyad_publish_listing_v1(text,text,text,text,text,text,text,numeric,text,text,jsonb,text[],jsonb,text[],text[],boolean)'
) is not null as publish_all_categories_rpc_ok;
