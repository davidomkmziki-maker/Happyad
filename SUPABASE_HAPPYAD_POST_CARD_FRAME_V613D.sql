-- HAPPYAD V613D — cadrage de la carte et image de couverture vidéo
-- À exécuter dans Supabase lorsque le projet est disponible.

alter table if exists public.happyad_posts
  add column if not exists image_crop jsonb,
  add column if not exists cover_frame_time numeric default 0;

comment on column public.happyad_posts.image_crop is
  'Cadrage choisi par l’utilisateur pour la carte: {scale,x,y}';

comment on column public.happyad_posts.cover_frame_time is
  'Seconde choisie dans la vidéo pour générer la miniature de la carte';
