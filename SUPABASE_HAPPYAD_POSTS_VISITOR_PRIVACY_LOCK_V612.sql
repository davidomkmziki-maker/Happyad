-- HAPPYAD V612 — VERROU RÉEL DES PUBLICATIONS PRIVÉES
-- À exécuter une seule fois dans Supabase SQL Editor.
-- Objectif :
-- 1) uniformiser l'état privé dans happyad_posts ;
-- 2) empêcher anon/authenticated de lire une publication privée ;
-- 3) laisser uniquement le propriétaire lire ses propres publications privées.

begin;

alter table public.happyad_posts
  add column if not exists visibility text not null default 'public';

alter table public.happyad_posts
  add column if not exists is_private boolean not null default false;

alter table public.happyad_posts
  add column if not exists private_at timestamptz;

-- Récupère les anciens états privés si d'anciennes colonnes existent déjà.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='happyad_posts' and column_name='privacy'
  ) then
    execute $q$
      update public.happyad_posts
      set visibility='private', is_private=true,
          private_at=coalesce(private_at, now())
      where lower(coalesce(privacy::text,'')) in ('private','privé','prive','only_me','only-me','moi')
    $q$;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='happyad_posts' and column_name='audience'
  ) then
    execute $q$
      update public.happyad_posts
      set visibility='private', is_private=true,
          private_at=coalesce(private_at, now())
      where lower(coalesce(audience::text,'')) in ('private','privé','prive','only_me','only-me','moi','friends','followers','custom','restricted')
    $q$;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='happyad_posts' and column_name='status'
  ) then
    execute $q$
      update public.happyad_posts
      set visibility='private', is_private=true,
          private_at=coalesce(private_at, now())
      where lower(coalesce(status::text,'')) in ('private','privé','prive','draft','brouillon','hidden','archived','unpublished')
    $q$;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='happyad_posts' and column_name='private'
  ) then
    execute $q$
      update public.happyad_posts
      set visibility='private', is_private=true,
          private_at=coalesce(private_at, now())
      where lower(coalesce("private"::text,'')) in ('true','1','private','privé','prive')
    $q$;
  end if;
end $$;

update public.happyad_posts
set visibility='private',
    is_private=true,
    private_at=coalesce(private_at, now())
where is_private=true
   or private_at is not null
   or lower(coalesce(visibility,'')) in ('private','privé','prive','only_me','only-me','moi','friends','followers','custom','restricted');

update public.happyad_posts
set visibility='public'
where not coalesce(is_private,false)
  and private_at is null
  and (visibility is null or btrim(visibility)='');

create or replace function public.happyad_posts_visibility_sync_v612()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if coalesce(new.is_private,false)
     or new.private_at is not null
     or lower(coalesce(new.visibility,'')) in ('private','privé','prive','only_me','only-me','moi','friends','followers','custom','restricted') then
    new.visibility := 'private';
    new.is_private := true;
    new.private_at := coalesce(new.private_at, now());
  else
    new.visibility := coalesce(nullif(btrim(new.visibility),''),'public');
    new.is_private := false;
    new.private_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists happyad_posts_visibility_sync_v612 on public.happyad_posts;
create trigger happyad_posts_visibility_sync_v612
before insert or update of visibility, is_private, private_at
on public.happyad_posts
for each row
execute function public.happyad_posts_visibility_sync_v612();

alter table public.happyad_posts enable row level security;

-- La policy permissive garantit que la table reste lisible même si elle n'avait
-- encore aucune policy SELECT. Elle n'autorise que public ou propriétaire.
drop policy if exists happyad_posts_public_or_owner_select_v612 on public.happyad_posts;
create policy happyad_posts_public_or_owner_select_v612
on public.happyad_posts
for select
to anon, authenticated
using (
  (
    coalesce(is_private,false)=false
    and private_at is null
    and lower(coalesce(visibility,'public')) not in ('private','privé','prive','only_me','only-me','moi','friends','followers','custom','restricted')
  )
  or auth.uid()::text = user_id::text
);

-- Policy restrictive : même une ancienne policy SELECT trop large ne peut plus
-- rendre une publication privée visible à un visiteur.
drop policy if exists happyad_posts_privacy_guard_v612 on public.happyad_posts;
create policy happyad_posts_privacy_guard_v612
on public.happyad_posts
as restrictive
for select
to anon, authenticated
using (
  (
    coalesce(is_private,false)=false
    and private_at is null
    and lower(coalesce(visibility,'public')) not in ('private','privé','prive','only_me','only-me','moi','friends','followers','custom','restricted')
  )
  or auth.uid()::text = user_id::text
);

commit;

-- Vérification facultative après exécution :
-- select id,user_id,visibility,is_private,private_at
-- from public.happyad_posts
-- order by created_at desc
-- limit 50;
