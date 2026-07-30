-- HAPPYAD V817 — BUDGET SÉMANTIQUE : AUTOUR / MAXIMUM / MINIMUM / EXACT / FOURCHETTE
-- Exécuter une seule fois après V810 à V813. Le fichier est relançable.
-- Il ne supprime aucune annonce et ne modifie pas les données Marketplace.

begin;

create or replace function public.happyad_ai_parse_amount_v817(
  p_raw text,
  p_suffix text default null
)
returns numeric
language plpgsql
immutable
parallel safe
set search_path = pg_catalog, public
as $$
declare
  v_clean text := lower(coalesce(p_raw,''));
  v_suffix text := lower(coalesce(p_suffix,''));
  v_value numeric;
begin
  v_clean := regexp_replace(v_clean,'[ _]','','g');
  if v_suffix in ('k','m') then
    v_clean := replace(v_clean,',','.');
    if v_clean !~ '^[0-9]+(?:\.[0-9]+)?$' then return null; end if;
    v_value := v_clean::numeric * case when v_suffix='m' then 1000000 else 1000 end;
  else
    v_clean := regexp_replace(v_clean,'[^0-9]','','g');
    if v_clean='' then return null; end if;
    v_value := v_clean::numeric;
  end if;
  return v_value;
exception when others then
  return null;
end;
$$;

create or replace function public.happyad_ai_extract_budget_v1(p_text text)
returns jsonb
language plpgsql
immutable
parallel safe
set search_path = pg_catalog, public
as $$
declare
  v_raw text := lower(coalesce(p_text,''));
  v_text text := public.happyad_ai_normalize_text(p_text);
  v_match text[];
  v_amount numeric;
  v_first numeric;
  v_second numeric;
  v_min numeric;
  v_max numeric;
  v_target numeric;
  v_currency text;
  v_mode text;
  v_has_operator boolean := false;
begin
  v_currency := case
    when v_raw ~ '[$]' or v_text ~ '(^| )usd( |$)' or v_text ~ 'dollars?' then 'USD'
    when v_raw ~ '€' or v_text ~ '(^| )eur( |$)' or v_text ~ 'euros?' then 'EUR'
    when v_raw ~ '£' or v_text ~ '(^| )gbp( |$)' then 'GBP'
    when v_text ~ '(^| )(ugx|ush)( |$)' or v_text ~ 'uganda shillings?' then 'UGX'
    when v_text ~ '(^| )(cdf|fc)( |$)' or v_text ~ 'francs? congolais?' then 'CDF'
    when v_text ~ '(^| )(kes|ksh)( |$)' or v_text ~ 'kenya shillings?' then 'KES'
    when v_text ~ '(^| )rwf( |$)' then 'RWF'
    when v_text ~ '(^| )tzs( |$)' then 'TZS'
    else null
  end;

  -- Fourchettes : « entre 350 et 450 USD » ou « 350-450 USD ».
  v_match := regexp_match(v_raw,
    '(?:entre|between|from)\s*([0-9][0-9 _.,]*?)([km]?)\s*(?:usd|ugx|ush|cdf|fc|eur|kes|ksh|rwf|tzs|gbp|dollars?|euros?|[$€£])?\s*(?:et|and|a|à|to|-)\s*([0-9][0-9 _.,]*?)([km]?)\s*(?:usd|ugx|ush|cdf|fc|eur|kes|ksh|rwf|tzs|gbp|dollars?|euros?|[$€£])?(?:\s|$)',
    'i');
  if v_match is null then
    v_match := regexp_match(v_raw,
      '([0-9][0-9 _.,]*?)([km]?)\s*(?:-|a|à|to)\s*([0-9][0-9 _.,]*?)([km]?)\s*(?:usd|ugx|ush|cdf|fc|eur|kes|ksh|rwf|tzs|gbp|dollars?|euros?|[$€£])(?:\s|$)',
      'i');
  end if;
  if v_match is not null then
    v_first := public.happyad_ai_parse_amount_v817(v_match[1],v_match[2]);
    v_second := public.happyad_ai_parse_amount_v817(v_match[3],v_match[4]);
    if v_first is not null and v_second is not null and v_first>0 and v_second>0 then
      v_min := least(v_first,v_second);
      v_max := greatest(v_first,v_second);
      v_target := (v_min+v_max)/2;
      return jsonb_strip_nulls(jsonb_build_object(
        'mode','range','target',v_target,'min',v_min,'max',v_max,
        'currency',v_currency,'tolerance',0
      ));
    end if;
  end if;

  -- Montant simple. On privilégie un montant lié à une monnaie afin de ne
  -- jamais confondre un modèle (S21), une année ou une quantité avec le budget.
  v_match := regexp_match(v_raw,
    '[$€£]\s*([0-9]+(?:[.,][0-9]+)?|[0-9][0-9 _.,]*[0-9])\s*([km]?)',
    'i');
  if v_match is null then
    v_match := regexp_match(v_raw,
      '([0-9]+(?:[.,][0-9]+)?|[0-9][0-9 _.,]*[0-9])\s*([km]?)\s*(?:usd|ugx|ush|cdf|fc|eur|kes|ksh|rwf|tzs|gbp|dollars?|euros?|[$€£])',
      'i');
  end if;
  if v_match is null then
    v_match := regexp_match(v_raw,
      '(?:budget|prix|montant|maximum|maximal|max|moins de|pas plus de|jusqu a|minimum|au moins|a partir de|environ|environs|autour de|a peu pres|approximativement|vers|about|around|approximately|at least|under|up to|bajeti|takribani|karibu|pene na)\s*[:=]?\s*([0-9]+(?:[.,][0-9]+)?|[0-9][0-9 _.,]*[0-9])\s*([km]?)',
      'i');
  end if;
  if v_match is null then
    v_match := regexp_match(v_raw,
      '([0-9]+(?:[.,][0-9]+)?|[0-9][0-9 _.,]*[0-9])\s*([km]?)\s*(?:maximum|maximal|max|budget|prix|environ|environs|around|approximately)',
      'i');
  end if;
  if v_match is null then return '{}'::jsonb; end if;

  v_amount := public.happyad_ai_parse_amount_v817(v_match[1],v_match[2]);
  if v_amount is null or v_amount<=0 then return '{}'::jsonb; end if;

  if v_text ~ '(^| )(maximum|maximal|max|moins de|pas plus de|jusqu a|under|below|not more than|up to|isizidi|chini ya|na se ya|eleka te)( |$)' then
    v_mode := 'max'; v_has_operator := true;
  elsif v_text ~ '(^| )(minimum|au moins|a partir de|at least|kuanzia|angalau|ata moke|kobanda na)( |$)' then
    v_mode := 'min'; v_has_operator := true;
  elsif v_text ~ '(^| )(exactement|prix exact|exact|precisement|exactly|fixed price)( |$)' then
    v_mode := 'exact'; v_has_operator := true;
  elsif v_text ~ '(^| )(environ|environs|autour de|aux alentours de|a peu pres|approximativement|vers|pres de|about|around|approximately|approx|roughly|circa|takribani|karibu|pene na)( |$)' then
    v_mode := 'around'; v_has_operator := true;
  elsif v_text ~ '(^| )(budget|prix|montant|bajeti)( |$)' then
    v_mode := 'around'; v_has_operator := true;
  else
    v_mode := 'around';
  end if;

  -- Ne pas interpréter un nombre isolé (année, quantité) comme budget.
  if v_currency is null and not v_has_operator then return '{}'::jsonb; end if;

  if v_mode='max' then
    return jsonb_strip_nulls(jsonb_build_object(
      'mode','max','target',v_amount,'min',null,'max',v_amount,
      'currency',v_currency,'tolerance',0
    ));
  elsif v_mode='min' then
    return jsonb_strip_nulls(jsonb_build_object(
      'mode','min','target',v_amount,'min',v_amount,'max',null,
      'currency',v_currency,'tolerance',0
    ));
  elsif v_mode='exact' then
    return jsonb_strip_nulls(jsonb_build_object(
      'mode','exact','target',v_amount,'min',v_amount,'max',v_amount,
      'currency',v_currency,'tolerance',0
    ));
  end if;

  -- « Environ / autour » : cible centrale et zone proche ±20 %.
  return jsonb_strip_nulls(jsonb_build_object(
    'mode','around','target',v_amount,
    'min',round(v_amount*0.80,2),'max',round(v_amount*1.20,2),
    'currency',v_currency,'tolerance',0.20
  ));
exception when others then
  return '{}'::jsonb;
end;
$$;

create or replace function public.happyad_ai_budget_match_score_v817(
  p_price numeric,
  p_currency text,
  p_budget jsonb
)
returns numeric
language plpgsql
immutable
parallel safe
set search_path = pg_catalog, public
as $$
declare
  v_mode text := lower(coalesce(p_budget->>'mode',''));
  v_currency text := upper(coalesce(p_budget->>'currency',''));
  v_actual_currency text := upper(coalesce(p_currency,''));
  v_target numeric;
  v_min numeric;
  v_max numeric;
  v_ratio numeric;
  v_edge numeric;
begin
  if p_budget is null or p_budget='{}'::jsonb or p_price is null or p_price<=0 then return 0; end if;
  begin v_target := nullif(p_budget->>'target','')::numeric; exception when others then v_target := null; end;
  begin v_min := nullif(p_budget->>'min','')::numeric; exception when others then v_min := null; end;
  begin v_max := nullif(p_budget->>'max','')::numeric; exception when others then v_max := null; end;
  v_target := coalesce(v_target,v_max,v_min);
  if v_target is null or v_target<=0 then return 0; end if;
  if v_mode='' then v_mode := case when v_min is not null and v_max is not null and v_min<>v_max then 'range' when v_max is not null then 'max' else 'around' end; end if;
  if v_currency<>'' and v_actual_currency<>'' and v_currency<>v_actual_currency then return -20; end if;

  if v_mode='max' then
    if p_price<=v_target then return 12; end if;
    v_ratio := (p_price-v_target)/greatest(v_target,1);
    return case when v_ratio<=0.10 then 6 when v_ratio<=0.20 then 2 when v_ratio<=0.35 then -6 else -least(25,v_ratio*20) end;
  elsif v_mode='min' then
    if p_price>=v_target then return 12; end if;
    v_ratio := (v_target-p_price)/greatest(v_target,1);
    return case when v_ratio<=0.10 then 6 when v_ratio<=0.20 then 2 when v_ratio<=0.35 then -6 else -least(25,v_ratio*20) end;
  elsif v_mode='range' and v_min is not null and v_max is not null then
    if p_price between v_min and v_max then return 12; end if;
    v_edge := case when p_price<v_min then v_min else v_max end;
    v_ratio := abs(p_price-v_edge)/greatest(v_edge,1);
    return case when v_ratio<=0.08 then 7 when v_ratio<=0.18 then 2 when v_ratio<=0.30 then -6 else -least(25,v_ratio*20) end;
  end if;

  v_ratio := abs(p_price-v_target)/greatest(v_target,1);
  if v_mode='exact' then
    return case when v_ratio<=0.02 then 12 when v_ratio<=0.05 then 9 when v_ratio<=0.10 then 4 when v_ratio<=0.20 then -3 else -least(25,v_ratio*20) end;
  end if;
  return case when v_ratio<=0.05 then 12 when v_ratio<=0.10 then 11 when v_ratio<=0.20 then 8 when v_ratio<=0.35 then 3 when v_ratio<=0.50 then -5 else -least(25,v_ratio*20) end;
end;
$$;

insert into public.happyad_ai_terms
(term,language,term_type,canonical_value,category_code,subcategory_code,weight,priority,metadata)
values
  ('environ','fr','budget_operator','around',null,null,1.8,35,'{"version":"V817"}'::jsonb),
  ('environs','fr','budget_operator','around',null,null,1.8,35,'{"version":"V817"}'::jsonb),
  ('autour de','fr','budget_operator','around',null,null,1.8,35,'{"version":"V817"}'::jsonb),
  ('à peu près','fr','budget_operator','around',null,null,1.8,35,'{"version":"V817"}'::jsonb),
  ('approximativement','fr','budget_operator','around',null,null,1.8,35,'{"version":"V817"}'::jsonb),
  ('about','en','budget_operator','around',null,null,1.8,35,'{"version":"V817"}'::jsonb),
  ('around','en','budget_operator','around',null,null,1.8,35,'{"version":"V817"}'::jsonb),
  ('approximately','en','budget_operator','around',null,null,1.8,35,'{"version":"V817"}'::jsonb),
  ('takribani','sw','budget_operator','around',null,null,1.8,35,'{"version":"V817"}'::jsonb),
  ('karibu','sw','budget_operator','around',null,null,1.8,35,'{"version":"V817"}'::jsonb),
  ('pene na','ln','budget_operator','around',null,null,1.8,35,'{"version":"V817"}'::jsonb),
  ('exactement','fr','budget_operator','exact',null,null,1.8,35,'{"version":"V817"}'::jsonb),
  ('exactly','en','budget_operator','exact',null,null,1.8,35,'{"version":"V817"}'::jsonb)
on conflict do nothing;

revoke all on function public.happyad_ai_parse_amount_v817(text,text) from public;
revoke all on function public.happyad_ai_extract_budget_v1(text) from public;
revoke all on function public.happyad_ai_budget_match_score_v817(numeric,text,jsonb) from public;
grant execute on function public.happyad_ai_extract_budget_v1(text) to anon, authenticated;

commit;
