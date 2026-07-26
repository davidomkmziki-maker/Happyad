-- HAPPYAD V39A — Entretien sûr des abonnements Push
-- À exécuter une seule fois après SUPABASE_HAPPYAD_PUSH_PHASE38E1.sql.
-- Ne touche ni aux messages ni aux conversations.

create or replace function public.happyad_push_cleanup_own_subscriptions()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_count integer := 0;
  v_more integer := 0;
begin
  if v_uid is null then return 0; end if;

  -- Désactive uniquement les abonnements explicitement expirés.
  update public.happyad_push_subscriptions
     set enabled = false, updated_at = now()
   where user_id = v_uid
     and enabled = true
     and expiration_time is not null
     and expiration_time > 0
     and expiration_time <= floor(extract(epoch from now()) * 1000)::bigint;
  get diagnostics v_count = row_count;

  -- Pour une même installation, garde seulement l'endpoint actif le plus récent.
  with ranked as (
    select endpoint,
           row_number() over (
             partition by user_id, installation_id
             order by updated_at desc, last_seen_at desc, endpoint
           ) as rn
      from public.happyad_push_subscriptions
     where user_id = v_uid and enabled = true
  )
  update public.happyad_push_subscriptions s
     set enabled = false, updated_at = now()
    from ranked r
   where s.endpoint = r.endpoint and r.rn > 1;
  get diagnostics v_more = row_count;
  v_count := v_count + v_more;

  return v_count;
end;
$$;

revoke all on function public.happyad_push_cleanup_own_subscriptions() from public;
grant execute on function public.happyad_push_cleanup_own_subscriptions() to authenticated;
