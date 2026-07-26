-- HAPPYAD V634 — mentions structurées avant publication d'une Story.
-- À exécuter une seule fois dans Supabase SQL Editor.

alter table if exists public.happyad_stories
  add column if not exists mentioned_user_ids text[] not null default '{}'::text[],
  add column if not exists mention_handles text[] not null default '{}'::text[];

-- Normalise les anciennes lignes qui auraient une valeur NULL.
update public.happyad_stories
set mentioned_user_ids = coalesce(mentioned_user_ids, '{}'::text[]),
    mention_handles = coalesce(mention_handles, '{}'::text[])
where mentioned_user_ids is null or mention_handles is null;

-- Une Story peut mentionner au maximum 20 comptes.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'happyad_stories_mentions_max_20'
      and conrelid = 'public.happyad_stories'::regclass
  ) then
    alter table public.happyad_stories
      add constraint happyad_stories_mentions_max_20
      check (
        coalesce(cardinality(mentioned_user_ids), 0) <= 20
        and coalesce(cardinality(mention_handles), 0) <= 20
      );
  end if;
end $$;

create index if not exists happyad_stories_mentioned_user_ids_gin_idx
  on public.happyad_stories using gin (mentioned_user_ids);
