-- HAPPYAD messages: index rapides + résolution profils.
-- Ne supprime aucune table. Exécuter dans Supabase SQL Editor.

create index if not exists idx_happyad_messages_box_conversation_created
  on public.happyad_messages_box (conversation_id, created_at);

create index if not exists idx_happyad_messages_box_pair_created
  on public.happyad_messages_box (user_a, user_b, created_at);

create index if not exists idx_happyad_messages_box_sender_receiver_created
  on public.happyad_messages_box (sender_id, receiver_id, created_at);

create index if not exists idx_happyad_messages_conversation_created
  on public.happyad_messages (conversation_id, created_at);

create index if not exists idx_happyad_conversations_user1_updated
  on public.happyad_conversations (user1_id, updated_at desc);

create index if not exists idx_happyad_conversations_user2_updated
  on public.happyad_conversations (user2_id, updated_at desc);

-- Index profils sécurisés : créés seulement si les colonnes existent.
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='user_id') then
    execute 'create index if not exists idx_profiles_user_id on public.profiles (user_id)';
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='uid') then
    execute 'create index if not exists idx_profiles_uid on public.profiles (uid)';
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='auth_id') then
    execute 'create index if not exists idx_profiles_auth_id on public.profiles (auth_id)';
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='happyad_presence' and column_name='user_id') then
    execute 'create index if not exists idx_happyad_presence_user_id on public.happyad_presence (user_id)';
  end if;
end $$;
