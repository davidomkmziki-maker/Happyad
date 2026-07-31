-- HAPPYAD V849 — PARTIE 08A
-- DÉTECTION D'UN LIEU COMMUN EXPLICITE
-- Exemple : « Tous à Bunia » applique Bunia à chaque ligne.
-- Cette fonction n'agit que lorsqu'un marqueur universel est présent.

begin;

create or replace function public.happyad_ai_shared_location_v849(
  p_text text,
  p_language text default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_catalog
as $$
declare
  v_norm text := public.happyad_ai_normalize_text(coalesce(p_text,''));
  v_understanding jsonb := '{}'::jsonb;
  v_fields jsonb := '{}'::jsonb;
  v_city text;
  v_country text;
  v_explicit boolean := false;
begin
  v_explicit := v_norm ~
    '(^| )(tous|toutes|tout|toute|pour tous|pour toutes|chaque demande|les demandes|meme ville|meme endroit)( |$)';

  if not v_explicit then
    return jsonb_build_object(
      'ok',true,
      'version','V849',
      'explicit_shared_location',false
    );
  end if;

  begin
    v_understanding := public.happyad_chat_understand_v3(
      p_text,p_language,null,null,'{}'::jsonb
    );
  exception when others then
    v_understanding := '{}'::jsonb;
  end;

  v_fields := case
    when jsonb_typeof(coalesce(v_understanding->'query_fields','{}'::jsonb))='object'
      then coalesce(v_understanding->'query_fields','{}'::jsonb)
    when jsonb_typeof(coalesce(v_understanding->'slots','{}'::jsonb))='object'
      then coalesce(v_understanding->'slots','{}'::jsonb)
    else '{}'::jsonb
  end;

  v_city := nullif(btrim(coalesce(
    v_fields->>'city',
    v_understanding->>'city',
    ''
  )),'');
  v_country := nullif(btrim(coalesce(
    v_fields->>'country',
    v_understanding->>'country',
    ''
  )),'');

  return jsonb_strip_nulls(jsonb_build_object(
    'ok',true,
    'version','V849',
    'explicit_shared_location',v_city is not null or v_country is not null,
    'city',v_city,
    'country',v_country,
    'source','explicit_universal_phrase'
  ));
end;
$$;

revoke all on function public.happyad_ai_shared_location_v849(
  text,text
) from public;
grant execute on function public.happyad_ai_shared_location_v849(
  text,text
) to anon, authenticated;

commit;

select 'V849_PART_08A_OK' as status;
