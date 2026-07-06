-- HAPPYAD Messages OneBox — schéma unique et durable.
-- Objectif : une seule table Supabase pour messages + conversations dérivées.
-- Aucun message déjà reçu ne doit disparaître côté application : l'app garde aussi un cache local et fusionne les nouvelles lignes.

create table if not exists public.happyad_messages_box (
  id uuid primary key default gen_random_uuid(),
  conversation_id text not null,
  user_a uuid not null references auth.users(id) on delete cascade,
  user_b uuid not null references auth.users(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  receiver_id uuid not null references auth.users(id) on delete cascade,
  body text not null default '',
  message_type text not null default 'text',
  media_items jsonb not null default '[]'::jsonb,
  file_meta jsonb not null default '{}'::jsonb,
  client_temp_id text unique,
  is_read boolean not null default false,
  read_at timestamptz,
  deleted_for_all boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint happyad_messages_box_pair_check check (user_a <> user_b),
  constraint happyad_messages_box_sender_receiver_check check (
    sender_id <> receiver_id
    and sender_id in (user_a,user_b)
    and receiver_id in (user_a,user_b)
  )
);

create index if not exists happyad_messages_box_user_a_idx on public.happyad_messages_box(user_a, created_at desc);
create index if not exists happyad_messages_box_user_b_idx on public.happyad_messages_box(user_b, created_at desc);
create index if not exists happyad_messages_box_conversation_idx on public.happyad_messages_box(conversation_id, created_at asc);
create index if not exists happyad_messages_box_receiver_unread_idx on public.happyad_messages_box(receiver_id, is_read, created_at desc);
create index if not exists happyad_messages_box_client_temp_idx on public.happyad_messages_box(client_temp_id);

create or replace function public.happyad_messages_box_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists happyad_messages_box_touch_updated_at on public.happyad_messages_box;
create trigger happyad_messages_box_touch_updated_at
before update on public.happyad_messages_box
for each row execute function public.happyad_messages_box_touch_updated_at();

alter table public.happyad_messages_box enable row level security;

drop policy if exists "happyad_messages_box_select_own" on public.happyad_messages_box;
create policy "happyad_messages_box_select_own"
on public.happyad_messages_box for select
to authenticated
using (auth.uid() = user_a or auth.uid() = user_b);

drop policy if exists "happyad_messages_box_insert_own" on public.happyad_messages_box;
create policy "happyad_messages_box_insert_own"
on public.happyad_messages_box for insert
to authenticated
with check (
  auth.uid() = sender_id
  and auth.uid() in (user_a,user_b)
  and receiver_id in (user_a,user_b)
  and sender_id <> receiver_id
);

drop policy if exists "happyad_messages_box_update_own" on public.happyad_messages_box;
create policy "happyad_messages_box_update_own"
on public.happyad_messages_box for update
to authenticated
using (auth.uid() = sender_id or auth.uid() = receiver_id)
with check (auth.uid() = sender_id or auth.uid() = receiver_id);

-- Realtime : ajoute la boîte messages à la publication Supabase Realtime.
do $$
begin
  begin
    alter publication supabase_realtime add table public.happyad_messages_box;
  exception when duplicate_object then null;
  end;
end $$;

-- Anciennes tables V2 non utilisées par ce nouveau système :
-- public.happyad_conversations_v2
-- public.happyad_messages_v2
-- Ne les supprime pas si tu veux garder une sauvegarde. Le nouveau code lit uniquement public.happyad_messages_box.
