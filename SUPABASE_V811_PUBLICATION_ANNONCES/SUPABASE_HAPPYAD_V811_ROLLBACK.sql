-- Annulation technique V811. À utiliser uniquement sur demande.
begin;
drop function if exists public.happyad_set_listing_status_v1(text,text);
drop function if exists public.happyad_publish_listing_v1(text,text,text,text,text,text,text,numeric,text,text,jsonb,text[],jsonb,text[],text[],boolean);
drop trigger if exists happyad_touch_marketplace_private_v811 on public.happyad_marketplace_private_proofs;
drop function if exists public.happyad_touch_marketplace_private_v811();
drop table if exists public.happyad_marketplace_private_proofs;
commit;
