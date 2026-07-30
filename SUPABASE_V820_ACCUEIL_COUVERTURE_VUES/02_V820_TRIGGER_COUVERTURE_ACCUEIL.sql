-- HAPPYAD V820 — Partie 02/03
-- Applique automatiquement le choix Accueil et la couverture sélectionnée.
-- Le RPC V811/V813 reste inchangé : les nouveaux choix passent dans marketplace_details.

begin;

create or replace function public.happyad_marketplace_apply_home_fields_v820()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_details jsonb := coalesce(new.marketplace_details,'{}'::jsonb);
  v_media jsonb := coalesce(new.marketplace_media,'[]'::jsonb);
  v_index integer := 0;
  v_count integer := 0;
  v_cover jsonb := '{}'::jsonb;
  v_show_text text := lower(trim(coalesce(v_details->>'show_on_home','false')));
begin
  if coalesce(new.happyad_marketplace,false) is not true
     and lower(trim(coalesce(new.mode,''))) <> 'marketplace' then
    return new;
  end if;

  new.marketplace_show_on_home := v_show_text in ('true','1','yes','oui','on');

  if coalesce(v_details->>'cover_index','') ~ '^[0-9]+$' then
    v_index := (v_details->>'cover_index')::integer;
  end if;

  if jsonb_typeof(v_media)='array' then
    v_count := jsonb_array_length(v_media);
  end if;

  if v_count > 0 then
    v_index := greatest(0,least(v_index,v_count-1));
    v_cover := coalesce(v_media->v_index,'{}'::jsonb);
  else
    v_index := 0;
  end if;

  new.marketplace_cover_index := v_index;
  new.marketplace_cover_url := nullif(trim(coalesce(v_cover->>'src','')),'');
  new.marketplace_cover_path := nullif(trim(coalesce(v_cover->>'path','')),'');
  new.marketplace_cover_type := case
    when lower(trim(coalesce(v_cover->>'type','')))='video' then 'video'
    else 'image'
  end;

  if new.marketplace_cover_url is not null then
    new.media_url := new.marketplace_cover_url;
    new.media_path := coalesce(new.marketplace_cover_path,new.media_path);
    new.media_type := new.marketplace_cover_type;
    new.kind := case when new.marketplace_cover_type='video' then 'video' else 'photo' end;
  end if;

  new.listing_views_count := greatest(coalesce(new.listing_views_count,0),0);
  return new;
end;
$$;

drop trigger if exists happyad_marketplace_apply_home_fields_v820_trg on public.happyad_posts;
create trigger happyad_marketplace_apply_home_fields_v820_trg
before insert or update of marketplace_details, marketplace_media, happyad_marketplace, mode
on public.happyad_posts
for each row
execute function public.happyad_marketplace_apply_home_fields_v820();

-- Applique la règle aux annonces déjà présentes sans modifier leur contenu.
update public.happyad_posts
set marketplace_details = coalesce(marketplace_details,'{}'::jsonb)
where coalesce(happyad_marketplace,false)=true
   or lower(trim(coalesce(mode,'')))='marketplace';

commit;

select
  to_regprocedure('public.happyad_marketplace_apply_home_fields_v820()') is not null as trigger_function_ok,
  exists(select 1 from pg_trigger where tgname='happyad_marketplace_apply_home_fields_v820_trg' and not tgisinternal) as trigger_ok;
