-- HAPPYAD V849 — PARTIE 08B
-- BATCH V2 CORRIGÉ
-- 1) applique « Tous à Bunia » à chaque demande ;
-- 2) recherche malgré l'absence de lieu ;
-- 3) garde une seule question finale, précise et non bloquante ;
-- 4) laisse « un travailleur » bloqué tant que le métier n'est pas indiqué.

begin;

create or replace function public.happyad_chat_search_batch_v2(
  p_text text,
  p_language text default null,
  p_requests jsonb default null,
  p_shared_fields jsonb default null,
  p_limit_per_request integer default 5
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_plan jsonb := '{}'::jsonb;
  v_requests jsonb := '[]'::jsonb;
  v_shared jsonb := case
    when jsonb_typeof(coalesce(p_shared_fields,'{}'::jsonb))='object'
      then coalesce(p_shared_fields,'{}'::jsonb)
    else '{}'::jsonb
  end;
  v_detected_shared jsonb := '{}'::jsonb;
  v_results jsonb := '[]'::jsonb;
  v_item jsonb;
  v_query text;
  v_ordinal integer;
  v_understanding jsonb;
  v_search jsonb;
  v_limit integer := least(greatest(coalesce(p_limit_per_request,5),1),5);
  v_total integer := 0;
  v_processed integer := 0;
  v_searched integer := 0;
  v_pending integer := 0;
  v_optional_pending integer := 0;
  v_mandatory_pending integer := 0;
  v_pending_ordinals integer[] := array[]::integer[];
  v_optional_ordinals integer[] := array[]::integer[];
  v_mandatory_ordinals integer[] := array[]::integer[];
  v_pending_field text := null;
  v_current_field text;
  v_needs_clarification boolean;
  v_optional_location boolean;
  v_final_question text;
  v_city text;
  v_country text;
  v_category text;
  v_object text;
begin
  if btrim(coalesce(p_text,''))=''
     and jsonb_array_length(coalesce(p_requests,'[]'::jsonb))=0 then
    return jsonb_build_object(
      'ok',false,'version','V849','error','TEXT_OR_REQUESTS_REQUIRED'
    );
  end if;

  if jsonb_typeof(coalesce(p_requests,'[]'::jsonb))='array'
     and jsonb_array_length(coalesce(p_requests,'[]'::jsonb))>0 then
    v_requests := p_requests;
  else
    v_plan := public.happyad_chat_decompose_requests_v2(p_text,p_language);
    v_requests := coalesce(v_plan->'requests','[]'::jsonb);
  end if;

  -- Le lieu transmis par le client reste prioritaire.
  v_city := nullif(btrim(coalesce(v_shared->>'city','')),'');
  v_country := nullif(btrim(coalesce(v_shared->>'country','')),'');

  -- En l'absence de lieu transmis, détecte uniquement un lieu explicitement
  -- déclaré commun : « Tous à Bunia », « toutes à Kampala », etc.
  if v_city is null and v_country is null then
    v_detected_shared := public.happyad_ai_shared_location_v849(
      p_text,p_language
    );

    if coalesce(
      (v_detected_shared->>'explicit_shared_location')::boolean,
      false
    ) then
      v_city := nullif(v_detected_shared->>'city','');
      v_country := nullif(v_detected_shared->>'country','');
      v_shared := v_shared||jsonb_strip_nulls(jsonb_build_object(
        'city',v_city,
        'country',v_country,
        'source','explicit_universal_phrase'
      ));
    end if;
  end if;

  v_total := jsonb_array_length(v_requests);

  if v_total=0 then
    return jsonb_build_object(
      'ok',false,'version','V849','error','NO_REQUEST_FOUND',
      'plan',v_plan
    );
  end if;

  if v_total>12 then
    return jsonb_build_object(
      'ok',false,
      'version','V849',
      'error','TOO_MANY_REQUESTS',
      'maximum',12,
      'received',v_total,
      'message','Le message contient plus de 12 demandes. Aucune demande n’a été supprimée : divise-le en deux messages.'
    );
  end if;

  for v_item in
    select value from jsonb_array_elements(v_requests)
  loop
    v_query := btrim(coalesce(v_item->>'text',''));
    if v_query='' then continue; end if;

    v_processed := v_processed+1;
    begin
      v_ordinal := coalesce(
        nullif(v_item->>'ordinal','')::integer,
        v_processed
      );
    exception when others then
      v_ordinal := v_processed;
    end;

    v_understanding := public.happyad_chat_understand_v3(
      v_query,p_language,v_country,v_city,'{}'::jsonb
    );

    if coalesce(v_understanding->>'ok','false')<>'true' then
      v_results := v_results||jsonb_build_array(jsonb_build_object(
        'ordinal',v_ordinal,
        'query',v_query,
        'status','understanding_error',
        'needs_clarification',false,
        'clarification_is_optional',false,
        'understanding',v_understanding,
        'search',jsonb_build_object('ok',false,'groups','[]'::jsonb)
      ));
      continue;
    end if;

    v_needs_clarification := coalesce(
      (v_understanding->>'needs_clarification')::boolean,
      false
    );
    v_current_field := nullif(
      v_understanding->'clarify_fields'->>0,
      ''
    );
    v_category := nullif(v_understanding->>'primary_category','');
    v_object := nullif(v_understanding->>'object_label','');

    -- Le lieu améliore le filtrage mais ne doit pas bloquer les annonces
    -- quand la catégorie et l'objet sont déjà compris.
    v_optional_location := v_needs_clarification
      and v_current_field='location'
      and v_category is not null
      and v_object is not null;

    if v_needs_clarification then
      v_pending := v_pending+1;
      v_pending_ordinals := array_append(v_pending_ordinals,v_ordinal);

      if v_pending_field is null then
        v_pending_field := coalesce(v_current_field,'mixed');
      elsif v_pending_field<>coalesce(v_current_field,'mixed') then
        v_pending_field := 'mixed';
      end if;

      if v_optional_location then
        v_optional_pending := v_optional_pending+1;
        v_optional_ordinals := array_append(v_optional_ordinals,v_ordinal);
      else
        v_mandatory_pending := v_mandatory_pending+1;
        v_mandatory_ordinals := array_append(v_mandatory_ordinals,v_ordinal);
      end if;
    end if;

    if v_needs_clarification and not v_optional_location then
      v_results := v_results||jsonb_build_array(jsonb_build_object(
        'ordinal',v_ordinal,
        'query',v_query,
        'status','needs_clarification',
        'needs_clarification',true,
        'clarification_is_optional',false,
        'clarification_field',v_current_field,
        'clarification_question',v_understanding->>'assistant_message',
        'understanding',v_understanding,
        'search',jsonb_build_object(
          'ok',true,'version','V845R1','groups','[]'::jsonb
        )
      ));
      continue;
    end if;

    -- Recherche normale ou recherche large sans lieu.
    v_search := public.happyad_chat_search_posts_v2(
      v_understanding,0,v_limit
    );
    v_searched := v_searched+1;

    v_results := v_results||jsonb_build_array(jsonb_build_object(
      'ordinal',v_ordinal,
      'query',v_query,
      'status',case
        when v_optional_location then 'searched_before_optional_clarification'
        else 'searched'
      end,
      'needs_clarification',v_optional_location,
      'clarification_is_optional',v_optional_location,
      'clarification_field',case
        when v_optional_location then 'location' else null
      end,
      'clarification_question',case
        when v_optional_location then
          'Dans quelle ville ou quel pays veux-tu limiter cette recherche ?'
        else null
      end,
      'understanding',v_understanding,
      'search',coalesce(
        v_search,
        jsonb_build_object('ok',false,'groups','[]'::jsonb)
      )
    ));
  end loop;

  -- Une seule question finale et son objet est explicite.
  if v_pending>0 then
    if v_pending=1 then
      select coalesce(
        nullif(x->>'clarification_question',''),
        nullif(x->'understanding'->>'assistant_message',''),
        'Précise seulement l’information indiquée pour cette demande.'
      )
      into v_final_question
      from jsonb_array_elements(v_results) x
      where coalesce((x->>'needs_clarification')::boolean,false)
      limit 1;

    elsif v_mandatory_pending=0 and v_optional_pending>0 then
      v_final_question :=
        'Les résultats sont déjà affichés sans lieu précis. '
        ||'Dans quelle ville ou quel pays veux-tu les limiter pour les demandes '
        ||array_to_string(v_optional_ordinals,', ')||' ?';

    elsif v_optional_pending=0 and v_pending_field='worker_type' then
      v_final_question :=
        'Quel type de travailleur recherches-tu pour les demandes '
        ||array_to_string(v_mandatory_ordinals,', ')
        ||' : aide à domicile, chauffeur, garde d’enfants ou un autre métier ?';

    else
      select string_agg(
        'Demande '||(x->>'ordinal')||' — '
        ||coalesce(
          nullif(x->>'clarification_question',''),
          nullif(x->'understanding'->>'assistant_message',''),
          'précision nécessaire'
        ),
        ' '
        order by (x->>'ordinal')::integer
      )
      into v_final_question
      from jsonb_array_elements(v_results) x
      where coalesce((x->>'needs_clarification')::boolean,false);
    end if;
  end if;

  return jsonb_build_object(
    'ok',true,
    'version','V849',
    'mode',case when v_total>1 then 'multi' else 'single' end,
    'request_count',v_total,
    'processed_request_count',v_processed,
    'searched_request_count',v_searched,
    'pending_clarification_count',v_pending,
    'optional_clarification_count',v_optional_pending,
    'mandatory_clarification_count',v_mandatory_pending,
    'all_requests_preserved',v_processed=v_total,
    'results_displayed_before_optional_clarification',v_optional_pending>0,
    'one_final_clarification',v_pending>0,
    'final_clarification_question',v_final_question,
    'shared_fields',v_shared,
    'plan',v_plan,
    'results',v_results
  );
end;
$$;

commit;

select 'V849_PART_08B_OK' as status;
