-- HAPPYAD V640 — total exact des J’aime reçus par un profil.
-- Source de vérité : happyad_content_actions, reliée à toutes les publications du propriétaire.

create or replace function public.happyad_profile_total_likes_v640(target_uid text)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::bigint
  from public.happyad_content_actions a
  join public.happyad_posts p
    on p.id::text = a.post_id::text
  where p.user_id::text = target_uid
    and p.deleted_at is null
    and a.action_type = 'like'
    and a.liked is true;
$$;

revoke all on function public.happyad_profile_total_likes_v640(text) from public;
grant execute on function public.happyad_profile_total_likes_v640(text) to anon, authenticated;
