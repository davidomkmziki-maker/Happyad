-- HAPPYAD V811 — PARTIE 02/04
-- Médias publics et justificatifs privés.

begin;

-- Bucket public déjà utilisé par HAPPYAD. La configuration est renforcée sans changer son identifiant.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values (
  'happyad-media','happyad-media',true,62914560,
  array['image/jpeg','image/png','image/webp','video/mp4','video/webm','video/quicktime']::text[]
)
on conflict (id) do nothing;

-- Bucket privé séparé pour les cartes grises, titres, autorisations et justificatifs.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values (
  'happyad-marketplace-private','happyad-marketplace-private',false,12582912,
  array['image/jpeg','image/png','image/webp','application/pdf']::text[]
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Retirer les anciennes politiques V803 plus larges avant d'installer le chemin V811.
drop policy if exists "happyad marketplace owner upload v803" on storage.objects;
drop policy if exists "happyad marketplace owner delete v803" on storage.objects;

-- UID/marketplace/LISTING_ID/public/fichier
drop policy if exists "happyad marketplace public upload v811" on storage.objects;
create policy "happyad marketplace public upload v811"
on storage.objects
for insert to authenticated
with check (
  bucket_id = 'happyad-media'
  and (storage.foldername(name))[1] = auth.uid()::text
  and (storage.foldername(name))[2] = 'marketplace'
  and (storage.foldername(name))[4] = 'public'
);

drop policy if exists "happyad marketplace public owner delete v811" on storage.objects;
create policy "happyad marketplace public owner delete v811"
on storage.objects
for delete to authenticated
using (
  bucket_id = 'happyad-media'
  and (storage.foldername(name))[1] = auth.uid()::text
  and (storage.foldername(name))[2] = 'marketplace'
  and (storage.foldername(name))[4] = 'public'
);

-- UID/marketplace/LISTING_ID/private/TYPE/fichier
drop policy if exists "happyad marketplace private upload v811" on storage.objects;
create policy "happyad marketplace private upload v811"
on storage.objects
for insert to authenticated
with check (
  bucket_id = 'happyad-marketplace-private'
  and (storage.foldername(name))[1] = auth.uid()::text
  and (storage.foldername(name))[2] = 'marketplace'
  and (storage.foldername(name))[4] = 'private'
  and (storage.foldername(name))[5] in ('ownership','official')
);

drop policy if exists "happyad marketplace private owner read files v811" on storage.objects;
create policy "happyad marketplace private owner read files v811"
on storage.objects
for select to authenticated
using (
  bucket_id = 'happyad-marketplace-private'
  and (storage.foldername(name))[1] = auth.uid()::text
  and (storage.foldername(name))[2] = 'marketplace'
);

drop policy if exists "happyad marketplace private admin read files v811" on storage.objects;
create policy "happyad marketplace private admin read files v811"
on storage.objects
for select to authenticated
using (
  bucket_id = 'happyad-marketplace-private'
  and public.happyad_seller_verification_admin_allowed()
);

-- Suppression possible uniquement tant que le chemin n'est pas lié à une annonce publiée.
drop policy if exists "happyad marketplace private owner delete orphan v811" on storage.objects;
create policy "happyad marketplace private owner delete orphan v811"
on storage.objects
for delete to authenticated
using (
  bucket_id = 'happyad-marketplace-private'
  and (storage.foldername(name))[1] = auth.uid()::text
  and (storage.foldername(name))[2] = 'marketplace'
  and not exists (
    select 1
    from public.happyad_marketplace_private_proofs p
    where p.user_id = auth.uid()
      and (name = any(p.ownership_paths) or name = any(p.official_paths))
  )
);

commit;

select
  exists(select 1 from storage.buckets where id='happyad-media' and public=true) as public_media_ok,
  exists(select 1 from storage.buckets where id='happyad-marketplace-private' and public=false) as private_documents_ok;
