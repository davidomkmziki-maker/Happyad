-- HAPPYAD Messages Speed Indexes
-- À exécuter dans Supabase SQL Editor si l'ouverture messages/conversations reste lente.
-- Ce fichier n'efface rien. Il ajoute seulement des index utiles aux requêtes rapides du site.

create extension if not exists pgcrypto;

-- Messages actifs : happyad_messages_box
create index if not exists happyad_messages_box_conversation_created_desc_idx
  on public.happyad_messages_box (conversation_id, created_at desc);

create index if not exists happyad_messages_box_user_a_created_desc_idx
  on public.happyad_messages_box (user_a, created_at desc);

create index if not exists happyad_messages_box_user_b_created_desc_idx
  on public.happyad_messages_box (user_b, created_at desc);

create index if not exists happyad_messages_box_sender_receiver_created_desc_idx
  on public.happyad_messages_box (sender_id, receiver_id, created_at desc);

create index if not exists happyad_messages_box_receiver_unread_created_desc_idx
  on public.happyad_messages_box (receiver_id, is_read, created_at desc);

-- Conversations : happyad_conversations
-- Les DO blocks évitent l'erreur si certains anciens noms de colonnes n'existent pas.
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='happyad_conversations' and column_name='user1_id') then
    execute 'create index if not exists happyad_conversations_user1_updated_idx on public.happyad_conversations (user1_id, updated_at desc)';
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='happyad_conversations' and column_name='user2_id') then
    execute 'create index if not exists happyad_conversations_user2_updated_idx on public.happyad_conversations (user2_id, updated_at desc)';
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='happyad_conversations' and column_name='user_a') then
    execute 'create index if not exists happyad_conversations_user_a_updated_idx on public.happyad_conversations (user_a, updated_at desc)';
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='happyad_conversations' and column_name='user_b') then
    execute 'create index if not exists happyad_conversations_user_b_updated_idx on public.happyad_conversations (user_b, updated_at desc)';
  end if;
end $$;
