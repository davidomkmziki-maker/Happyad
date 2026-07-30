-- HAPPYAD V817 — PARTIE 02/03 — RECHERCHE AVEC BUDGET SÉMANTIQUE
-- Prérequis : partie 01 réussie.

begin;

create or replace function public.happyad_chat_search_posts_v1(
  p_understanding jsonb,
  p_offset integer default 0,
  p_limit_per_category integer default 5
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_limit integer := least(greatest(coalesce(p_limit_per_category,5),1),5);
  v_offset integer := greatest(coalesce(p_offset,0),0);
  v_global_query text := public.happyad_ai_normalize_text(coalesce(p_understanding->>'search_query',p_understanding->>'normalized_text',''));
  v_city text := public.happyad_ai_normalize_text(p_understanding->>'city');
  v_country text := public.happyad_ai_normalize_text(p_understanding->>'country');
  v_global_brand text := public.happyad_ai_normalize_text(p_understanding->>'brand');
  v_global_model text := public.happyad_ai_normalize_text(p_understanding->>'model');
  v_groups jsonb;
begin
  if coalesce(p_understanding->>'intent','unknown') not in ('search','compare','price_question','unknown') then
    return jsonb_build_object('ok',false,'error','INTENT_NOT_SEARCHABLE','groups','[]'::jsonb);
  end if;

  with detailed_json as (
    select e.value as item
    from jsonb_array_elements(
      case when jsonb_typeof(p_understanding->'category_requests')='array'
           then p_understanding->'category_requests' else '[]'::jsonb end
    ) as e(value)
  ), requested_detailed as (
    select
      nullif(item->>'category','') code,
      public.happyad_ai_normalize_text(coalesce(item->>'search_query','')) request_query,
      array(
        select public.happyad_ai_normalize_text(value)
        from jsonb_array_elements_text(
          case when jsonb_typeof(item->'brands')='array' then item->'brands' else '[]'::jsonb end
        )
      ) brands,
      array(
        select public.happyad_ai_normalize_text(value)
        from jsonb_array_elements_text(
          case when jsonb_typeof(item->'models')='array' then item->'models' else '[]'::jsonb end
        )
      ) models
    from detailed_json
    where nullif(item->>'category','') is not null
  ), category_json as (
    select value code
    from jsonb_array_elements_text(
      case when jsonb_typeof(p_understanding->'categories')='array'
           then p_understanding->'categories' else '[]'::jsonb end
    )
  ), requested_categories as (
    select
      c.code,
      case when not exists(select 1 from requested_detailed) then v_global_query else '' end request_query,
      case when not exists(select 1 from requested_detailed) then array_remove(array[v_global_brand],'') else array[]::text[] end brands,
      case when not exists(select 1 from requested_detailed) then array_remove(array[v_global_model],'') else array[]::text[] end models
    from category_json c
    where not exists(select 1 from requested_detailed d where d.code=c.code)
  ), requested as (
    select * from requested_detailed
    union all
    select * from requested_categories
  ), requested_or_all as (
    select * from requested
    union all
    select
      'all',v_global_query,array_remove(array[v_global_brand],''),array_remove(array[v_global_model],'')
    where not exists(select 1 from requested)
  ), requested_map as (
    select
      r.code,r.request_query,r.brands,r.models,
      public.happyad_ai_build_tsquery_v1(r.request_query) request_tsquery,
      c.marketplace_value,c.label_fr,c.label_en,c.label_ln,c.label_sw,c.sort_order
    from requested_or_all r
    left join public.happyad_ai_categories c on c.code=r.code and c.active=true
  ), candidates as (
    select
      r.code as requested_code,
      r.request_query,
      r.request_tsquery,
      r.brands,
      r.models,
      coalesce(pc.code,nullif(public.happyad_ai_normalize_text(p.marketplace_category),''),'produit') as result_category,
      coalesce(pc.label_fr,p.marketplace_category,'Produit') as label_fr,
      coalesce(pc.label_en,p.marketplace_category,'Product') as label_en,
      coalesce(pc.label_ln,p.marketplace_category,'Eloko') as label_ln,
      coalesce(pc.label_sw,p.marketplace_category,'Bidhaa') as label_sw,
      coalesce(pc.sort_order,999) as category_order,
      p.*,
      (r.request_tsquery is not null and p.happyad_ai_search_vector @@ r.request_tsquery) as text_match,
      (
        case when r.code<>'all' and pc.code=r.code then 35 else 12 end
        + case when r.request_tsquery is not null and p.happyad_ai_search_vector @@ r.request_tsquery
               then least(30,ts_rank_cd(p.happyad_ai_search_vector,r.request_tsquery)*60) else 0 end
        + case when cardinality(r.brands)>0 and public.happyad_ai_normalize_text(p.product_brand)=any(r.brands) then 16 else 0 end
        + case when cardinality(r.models)>0 and exists(
                   select 1 from unnest(r.models) requested_model
                   where public.happyad_ai_normalize_text(p.product_model)=requested_model
                      or p.happyad_ai_search_text like '%'||requested_model||'%'
                 ) then 20 else 0 end
        + case when v_city<>'' and public.happyad_ai_normalize_text(p.city)=v_city then 18 else 0 end
        + case when v_country<>'' and public.happyad_ai_normalize_text(p.country)=v_country then 8 else 0 end
        + public.happyad_ai_budget_match_score_v817(p.marketplace_price,p.currency,p_understanding->'budget')
        + case when p.seller_verification_id is not null then 5 else 0 end
        + greatest(0,5-least(5,extract(epoch from (now()-p.created_at))/2592000.0))
      )::numeric as match_score
    from public.happyad_posts p
    cross join requested_map r
    left join public.happyad_ai_categories pc
      on public.happyad_ai_normalize_text(pc.marketplace_value)=public.happyad_ai_normalize_text(p.marketplace_category)
      and pc.active=true
    where (p.happyad_marketplace=true or p.marketplace_category is not null)
      and coalesce(p.listing_status,'active')='active'
      and coalesce(p.is_active,true)=true
      and (r.code='all' or pc.code=r.code)
      and (p.created_at is null or p.created_at<=now())
  ), ranked as (
    select c.*,
      row_number() over(
        partition by result_category
        order by text_match desc,match_score desc,created_at desc nulls last,id::text
      ) as rn,
      count(*) over(partition by result_category) as total_count
    from candidates c
  ), sliced as (
    select * from ranked where rn>v_offset and rn<=v_offset+v_limit
  ), grouped as (
    select
      result_category,
      max(label_fr) label_fr,max(label_en) label_en,max(label_ln) label_ln,max(label_sw) label_sw,
      min(category_order) category_order,max(total_count) total_count,
      jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
        'id',id::text,
        'title',coalesce(to_jsonb(sliced)->>'title',to_jsonb(sliced)->>'caption','Annonce HAPPYAD'),
        'description',coalesce(to_jsonb(sliced)->>'description',to_jsonb(sliced)->>'content',''),
        'category',marketplace_category,
        'price',marketplace_price,
        'price_label',price_label,
        'currency',currency,
        'country',country,
        'city',city,
        'location',coalesce(to_jsonb(sliced)->>'location',concat_ws(' · ',city,country)),
        'availability',availability,
        'condition',product_condition,
        'brand',product_brand,
        'model',product_model,
        'media',marketplace_media,
        'media_url',coalesce(to_jsonb(sliced)->>'media_url',to_jsonb(sliced)->>'url',''),
        'seller_uid',coalesce(to_jsonb(sliced)->>'user_id',to_jsonb(sliced)->>'owner_id',to_jsonb(sliced)->>'author_id',''),
        'seller_name',coalesce(nullif(to_jsonb(sliced)->>'creator_name',''),nullif(to_jsonb(sliced)->>'display_name',''),nullif(to_jsonb(sliced)->>'username',''),'Annonceur HAPPYAD'),
        'seller_verified',seller_verification_id is not null,
        'created_at',created_at,
        'match_kind',case when text_match then 'relevant' else 'category_alternative' end,
        'match_score',round(match_score,2)
      )) order by text_match desc,match_score desc,created_at desc nulls last) items
    from sliced
    group by result_category
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'category',result_category,
    'labels',jsonb_build_object('fr',label_fr,'en',label_en,'ln',label_ln,'sw',label_sw),
    'offset',v_offset,
    'limit',v_limit,
    'total',total_count,
    'has_more',total_count>v_offset+v_limit,
    'items',items
  ) order by category_order,result_category),'[]'::jsonb)
  into v_groups
  from grouped;

  return jsonb_build_object(
    'ok',true,'version','V817','offset',v_offset,
    'limit_per_category',v_limit,'groups',coalesce(v_groups,'[]'::jsonb)
  );
end;
$$;

revoke all on function public.happyad_chat_search_posts_v1(jsonb,integer,integer) from public;
grant execute on function public.happyad_chat_search_posts_v1(jsonb,integer,integer) to anon, authenticated;

commit;
