-- HAPPYAD V849 — ROLLBACK CIBLÉ
-- Pour revenir au batch V847, réexécuter 07B_V847_BATCH_V2.sql.
-- Ce fichier retire uniquement le détecteur de lieu V849.

begin;

drop function if exists public.happyad_ai_shared_location_v849(
  text,text
);

commit;

select 'V849_HELPER_ROLLBACK_OK' as status;
