-- HAPPYAD V849 — PARTIE 08C
-- TEST CONSOLIDÉ DU LIEU COMMUN ET DES RÉSULTATS AVANT PRÉCISION
-- Lecture seule. Retourne une seule ligne JSON.

begin;
set transaction read only;

with
t1 as (
  select public.happyad_chat_search_batch_v2(
    $msg$
Je cherche
- une maison
- un véhicule
- un travailleur
- un téléphone
Tous à Bunia
$msg$,
    'fr',null,null,1
  ) result
),
t2 as (
  select public.happyad_chat_search_batch_v2(
    $msg$
- maison de 4 chambres
- un travailleur de la maison
- un téléphone iPhone
- un véhicule Mercedes
$msg$,
    'fr',null,null,1
  ) result
),
t3 as (
  select public.happyad_chat_search_batch_v2(
    $msg$
- un travailleur
- un téléphone iPhone
$msg$,
    'fr',null,null,1
  ) result
)
select jsonb_pretty(jsonb_build_object(
  'version','V849',

  'T1_TOUS_A_BUNIA',jsonb_build_object(
    'shared_fields',t1.result->'shared_fields',
    'searched',t1.result->'searched_request_count',
    'pending',t1.result->'pending_clarification_count',
    'optional',t1.result->'optional_clarification_count',
    'mandatory',t1.result->'mandatory_clarification_count',
    'final_question',t1.result->'final_clarification_question',
    'statuses',(
      select jsonb_agg(jsonb_build_object(
        'ordinal',x->'ordinal',
        'status',x->'status',
        'city',x->'understanding'->'city',
        'needs_clarification',x->'needs_clarification',
        'groups',jsonb_array_length(
          coalesce(x->'search'->'groups','[]'::jsonb)
        )
      ) order by (x->>'ordinal')::integer)
      from jsonb_array_elements(t1.result->'results') x
    ),
    'status',case
      when lower(coalesce(t1.result->'shared_fields'->>'city',''))='bunia'
       and (t1.result->>'searched_request_count')::integer=3
       and (t1.result->>'mandatory_clarification_count')::integer=1
      then 'OK' else 'A_CORRIGER' end
  ),

  'T2_SANS_LIEU_RESULTATS_DABORD',jsonb_build_object(
    'searched',t2.result->'searched_request_count',
    'pending',t2.result->'pending_clarification_count',
    'optional',t2.result->'optional_clarification_count',
    'mandatory',t2.result->'mandatory_clarification_count',
    'results_before_question',
      t2.result->'results_displayed_before_optional_clarification',
    'final_question',t2.result->'final_clarification_question',
    'statuses',(
      select jsonb_agg(jsonb_build_object(
        'ordinal',x->'ordinal',
        'status',x->'status',
        'clarification_is_optional',x->'clarification_is_optional',
        'groups',jsonb_array_length(
          coalesce(x->'search'->'groups','[]'::jsonb)
        )
      ) order by (x->>'ordinal')::integer)
      from jsonb_array_elements(t2.result->'results') x
    ),
    'status',case
      when (t2.result->>'searched_request_count')::integer=4
       and (t2.result->>'optional_clarification_count')::integer=4
       and (t2.result->>'mandatory_clarification_count')::integer=0
       and (t2.result->>'results_displayed_before_optional_clarification')::boolean
      then 'OK' else 'A_CORRIGER' end
  ),

  'T3_PRECISIONS_MIXTES',jsonb_build_object(
    'searched',t3.result->'searched_request_count',
    'optional',t3.result->'optional_clarification_count',
    'mandatory',t3.result->'mandatory_clarification_count',
    'final_question',t3.result->'final_clarification_question',
    'status',case
      when (t3.result->>'searched_request_count')::integer=1
       and (t3.result->>'optional_clarification_count')::integer=1
       and (t3.result->>'mandatory_clarification_count')::integer=1
       and position('Demande 1' in coalesce(
         t3.result->>'final_clarification_question',''
       ))>0
      then 'OK' else 'A_CORRIGER' end
  )
)) as resultat_complet
from t1,t2,t3;

rollback;
