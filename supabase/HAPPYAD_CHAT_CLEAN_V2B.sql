-- HAPPYAD_CHAT_CLEAN_V2B.sql
-- Objectif : nouveau système messages propre, sans lire happyad_messages_box / happyad_messages / happyad_conversations.
-- Tables actives côté code :
--   public.happyad_chat_conversations
--   public.happyad_chat_messages
-- Les anciennes tables restent en sauvegarde. Ne pas les supprimer avant validation complète sur téléphone.

-- PATCH V2B : reset uniquement les nouvelles tables happyad_chat_* si elles ont été créées avec un mauvais type (uuid/text).
-- IMPORTANT : ce reset ne touche PAS aux anciennes tables happyad_messages_box, happyad_messages, happyad_conversations.
-- Comme ce système chat est neuf, on supprime seulement les objets happyad_chat_* partiellement créés puis on les recrée propres en TEXT.

drop function if exists public.happyad_chat_send_message(text,text,text,text,text);
drop function if exists public.happyad_chat_thread(text,text,text,int);
drop function if exists public.happyad_chat_conversation_list(text,int);
drop function if exists public.happyad_chat_after_message();
drop function if exists public.happyad_chat_before_message();
drop function if exists public.happyad_chat_normalize_conversation();
drop function if exists public.happyad_chat_pair_key(text,text);
drop table if exists public.happyad_chat_messages cascade;
drop table if exists public.happyad_chat_conversations cascade;

create extension if not exists pgcrypto;

create table if not exists public.happyad_chat_conversations (
  id text primary key default ('chat_' || replace(gen_random_uuid()::text, '-', '')),
  pair_key text,
  user1_id text,
  user2_id text,
  user_a text,
  user_b text,
  last_message text,
  last_sender_id text,
  last_message_at timestamptz,
  unread_a integer not null default 0,
  unread_b integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.happyad_chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id text not null,
  user_a text,
  user_b text,
  sender_id text not null,
  receiver_id text not null,
  body text,
  message_type text not null default 'text',
  media_items jsonb,
  file_meta jsonb,
  media_url text,
  client_temp_id text,
  is_read boolean not null default false,
  read_at timestamptz,
  deleted_for_all boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.happyad_chat_conversations add column if not exists pair_key text;
alter table public.happyad_chat_conversations add column if not exists user1_id text;
alter table public.happyad_chat_conversations add column if not exists user2_id text;
alter table public.happyad_chat_conversations add column if not exists user_a text;
alter table public.happyad_chat_conversations add column if not exists user_b text;
alter table public.happyad_chat_conversations add column if not exists last_message text;
alter table public.happyad_chat_conversations add column if not exists last_sender_id text;
alter table public.happyad_chat_conversations add column if not exists last_message_at timestamptz;
alter table public.happyad_chat_conversations add column if not exists unread_a integer not null default 0;
alter table public.happyad_chat_conversations add column if not exists unread_b integer not null default 0;
alter table public.happyad_chat_conversations add column if not exists created_at timestamptz not null default now();
alter table public.happyad_chat_conversations add column if not exists updated_at timestamptz not null default now();

alter table public.happyad_chat_messages add column if not exists conversation_id text;
alter table public.happyad_chat_messages add column if not exists user_a text;
alter table public.happyad_chat_messages add column if not exists user_b text;
alter table public.happyad_chat_messages add column if not exists sender_id text;
alter table public.happyad_chat_messages add column if not exists receiver_id text;
alter table public.happyad_chat_messages add column if not exists body text;
alter table public.happyad_chat_messages add column if not exists message_type text not null default 'text';
alter table public.happyad_chat_messages add column if not exists media_items jsonb;
alter table public.happyad_chat_messages add column if not exists file_meta jsonb;
alter table public.happyad_chat_messages add column if not exists media_url text;
alter table public.happyad_chat_messages add column if not exists client_temp_id text;
alter table public.happyad_chat_messages add column if not exists is_read boolean not null default false;
alter table public.happyad_chat_messages add column if not exists read_at timestamptz;
alter table public.happyad_chat_messages add column if not exists deleted_for_all boolean not null default false;
alter table public.happyad_chat_messages add column if not exists deleted_at timestamptz;
alter table public.happyad_chat_messages add column if not exists created_at timestamptz not null default now();
alter table public.happyad_chat_messages add column if not exists updated_at timestamptz not null default now();

create or replace function public.happyad_chat_pair_key(a text, b text)
returns text
language sql
immutable
as $$
  select case
    when nullif(trim(coalesce(a,'')), '') is null or nullif(trim(coalesce(b,'')), '') is null then null
    when trim(a) <= trim(b) then trim(a) || '|' || trim(b)
    else trim(b) || '|' || trim(a)
  end
$$;

create or replace function public.happyad_chat_normalize_conversation()
returns trigger
language plpgsql
as $$
declare
  v_a text;
  v_b text;
begin
  v_a := nullif(trim(coalesce(new.user_a, new.user1_id, '')), '');
  v_b := nullif(trim(coalesce(new.user_b, new.user2_id, '')), '');

  if v_a is not null and v_b is not null then
    if v_a <= v_b then
      new.user_a := v_a;
      new.user_b := v_b;
    else
      new.user_a := v_b;
      new.user_b := v_a;
    end if;
    new.user1_id := coalesce(nullif(trim(coalesce(new.user1_id,'')),''), new.user_a);
    new.user2_id := coalesce(nullif(trim(coalesce(new.user2_id,'')),''), new.user_b);
    new.pair_key := public.happyad_chat_pair_key(new.user_a, new.user_b);
  end if;

  if nullif(trim(coalesce(new.id,'')), '') is null then
    new.id := 'chat_' || replace(gen_random_uuid()::text, '-', '');
  end if;

  new.updated_at := coalesce(new.updated_at, now());
  new.created_at := coalesce(new.created_at, now());
  return new;
end;
$$;

drop trigger if exists happyad_chat_conversations_normalize on public.happyad_chat_conversations;
create trigger happyad_chat_conversations_normalize
before insert or update on public.happyad_chat_conversations
for each row execute function public.happyad_chat_normalize_conversation();

create or replace function public.happyad_chat_before_message()
returns trigger
language plpgsql
as $$
declare
  v_pair text;
  v_a text;
  v_b text;
  v_cid text;
begin
  new.sender_id := nullif(trim(coalesce(new.sender_id,'')), '');
  new.receiver_id := nullif(trim(coalesce(new.receiver_id,'')), '');

  if new.sender_id is null or new.receiver_id is null then
    raise exception 'sender_id and receiver_id are required';
  end if;

  if new.sender_id = new.receiver_id then
    raise exception 'sender_id and receiver_id cannot be identical';
  end if;

  if new.sender_id <= new.receiver_id then
    v_a := new.sender_id;
    v_b := new.receiver_id;
  else
    v_a := new.receiver_id;
    v_b := new.sender_id;
  end if;

  new.user_a := coalesce(nullif(trim(coalesce(new.user_a,'')), ''), v_a);
  new.user_b := coalesce(nullif(trim(coalesce(new.user_b,'')), ''), v_b);

  if new.user_a > new.user_b then
    v_a := new.user_a;
    new.user_a := new.user_b;
    new.user_b := v_a;
  end if;

  v_pair := public.happyad_chat_pair_key(new.user_a, new.user_b);
  v_cid := nullif(trim(coalesce(new.conversation_id,'')), '');

  if v_cid is null or v_cid like 'msgbox_%' then
    select id into v_cid
    from public.happyad_chat_conversations
    where pair_key = v_pair
    order by updated_at desc
    limit 1;

    if v_cid is null then
      v_cid := 'chat_' || md5(v_pair || '|' || now()::text || '|' || gen_random_uuid()::text);
    end if;
  end if;

  new.conversation_id := v_cid;
  new.updated_at := coalesce(new.updated_at, now());
  new.created_at := coalesce(new.created_at, now());
  return new;
end;
$$;

drop trigger if exists happyad_chat_messages_before on public.happyad_chat_messages;
create trigger happyad_chat_messages_before
before insert or update on public.happyad_chat_messages
for each row execute function public.happyad_chat_before_message();

create or replace function public.happyad_chat_after_message()
returns trigger
language plpgsql
as $$
declare
  v_pair text;
  v_last text;
begin
  v_pair := public.happyad_chat_pair_key(new.user_a, new.user_b);
  v_last := case
    when new.deleted_for_all then 'message supprimé'
    when nullif(trim(coalesce(new.body,'')), '') is not null then new.body
    when new.message_type <> 'text' then 'Fichier'
    else 'Message'
  end;

  insert into public.happyad_chat_conversations(
    id, pair_key, user1_id, user2_id, user_a, user_b,
    last_message, last_sender_id, last_message_at, updated_at, created_at
  ) values (
    new.conversation_id, v_pair, new.user_a, new.user_b, new.user_a, new.user_b,
    v_last, new.sender_id, new.created_at, now(), coalesce(new.created_at, now())
  )
  on conflict (id) do update set
    pair_key = excluded.pair_key,
    user1_id = excluded.user1_id,
    user2_id = excluded.user2_id,
    user_a = excluded.user_a,
    user_b = excluded.user_b,
    last_message = excluded.last_message,
    last_sender_id = excluded.last_sender_id,
    last_message_at = excluded.last_message_at,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists happyad_chat_messages_after_insert on public.happyad_chat_messages;
create trigger happyad_chat_messages_after_insert
after insert on public.happyad_chat_messages
for each row execute function public.happyad_chat_after_message();

create unique index if not exists happyad_chat_conversations_pair_key_uidx
  on public.happyad_chat_conversations(pair_key)
  where pair_key is not null;

create index if not exists happyad_chat_conversations_user_a_updated_idx
  on public.happyad_chat_conversations(user_a, updated_at desc);
create index if not exists happyad_chat_conversations_user_b_updated_idx
  on public.happyad_chat_conversations(user_b, updated_at desc);
create index if not exists happyad_chat_conversations_user1_updated_idx
  on public.happyad_chat_conversations(user1_id, updated_at desc);
create index if not exists happyad_chat_conversations_user2_updated_idx
  on public.happyad_chat_conversations(user2_id, updated_at desc);

create index if not exists happyad_chat_messages_conversation_created_idx
  on public.happyad_chat_messages(conversation_id, created_at asc);
create index if not exists happyad_chat_messages_user_a_created_idx
  on public.happyad_chat_messages(user_a, created_at desc);
create index if not exists happyad_chat_messages_user_b_created_idx
  on public.happyad_chat_messages(user_b, created_at desc);
create index if not exists happyad_chat_messages_sender_receiver_created_idx
  on public.happyad_chat_messages(sender_id, receiver_id, created_at desc);
create index if not exists happyad_chat_messages_receiver_unread_idx
  on public.happyad_chat_messages(receiver_id, is_read, created_at desc);
create index if not exists happyad_chat_messages_client_temp_idx
  on public.happyad_chat_messages(client_temp_id);

create or replace function public.happyad_chat_conversation_list(p_user_id text, p_limit int default 160)
returns table (
  id text,
  conversation_id text,
  user1_id text,
  user2_id text,
  user_a text,
  user_b text,
  _other_id text,
  other_user_id text,
  last_message text,
  last_sender_id text,
  last_message_at timestamptz,
  updated_at timestamptz,
  created_at timestamptz,
  unread_a integer,
  unread_b integer,
  source_table text
)
language sql
stable
as $$
  select
    c.id,
    c.id as conversation_id,
    c.user1_id,
    c.user2_id,
    c.user_a,
    c.user_b,
    case when c.user_a = p_user_id then c.user_b else c.user_a end as _other_id,
    case when c.user_a = p_user_id then c.user_b else c.user_a end as other_user_id,
    coalesce(c.last_message, 'Message') as last_message,
    c.last_sender_id,
    c.last_message_at,
    c.updated_at,
    c.created_at,
    case when c.user_a = p_user_id then (
      select count(*)::int from public.happyad_chat_messages m
      where m.conversation_id = c.id and m.receiver_id = p_user_id and m.is_read = false
    ) else 0 end as unread_a,
    case when c.user_b = p_user_id then (
      select count(*)::int from public.happyad_chat_messages m
      where m.conversation_id = c.id and m.receiver_id = p_user_id and m.is_read = false
    ) else 0 end as unread_b,
    'happyad_chat_conversations'::text as source_table
  from public.happyad_chat_conversations c
  where p_user_id in (c.user_a, c.user_b, c.user1_id, c.user2_id)
  order by c.updated_at desc nulls last, c.last_message_at desc nulls last, c.created_at desc
  limit greatest(1, least(coalesce(p_limit,160), 500));
$$;

create or replace function public.happyad_chat_thread(
  p_user_id text,
  p_conversation_id text default null,
  p_other_id text default null,
  p_limit int default 320
)
returns setof public.happyad_chat_messages
language sql
stable
as $$
  select m.*
  from public.happyad_chat_messages m
  where
    p_user_id in (m.user_a, m.user_b, m.sender_id, m.receiver_id)
    and (
      (nullif(trim(coalesce(p_conversation_id,'')), '') is not null and m.conversation_id::text = p_conversation_id)
      or (
        nullif(trim(coalesce(p_other_id,'')), '') is not null
        and public.happyad_chat_pair_key(m.sender_id, m.receiver_id) = public.happyad_chat_pair_key(p_user_id, p_other_id)
      )
    )
  order by m.created_at asc
  limit greatest(1, least(coalesce(p_limit,320), 800));
$$;

create or replace function public.happyad_chat_send_message(
  p_sender_id text,
  p_receiver_id text,
  p_body text,
  p_conversation_id text default null,
  p_client_temp_id text default null
)
returns setof public.happyad_chat_messages
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.happyad_chat_messages;
begin
  insert into public.happyad_chat_messages(
    conversation_id, sender_id, receiver_id, body, message_type, client_temp_id, is_read, created_at, updated_at
  ) values (
    nullif(trim(coalesce(p_conversation_id,'')), ''),
    nullif(trim(coalesce(p_sender_id,'')), ''),
    nullif(trim(coalesce(p_receiver_id,'')), ''),
    coalesce(p_body,''),
    'text',
    nullif(trim(coalesce(p_client_temp_id,'')), ''),
    false,
    now(),
    now()
  )
  returning * into v_row;

  return next v_row;
end;
$$;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.happyad_chat_conversations to anon, authenticated;
grant select, insert, update, delete on public.happyad_chat_messages to anon, authenticated;
grant execute on function public.happyad_chat_conversation_list(text,int) to anon, authenticated;
grant execute on function public.happyad_chat_thread(text,text,text,int) to anon, authenticated;
grant execute on function public.happyad_chat_send_message(text,text,text,text,text) to anon, authenticated;

alter table public.happyad_chat_conversations enable row level security;
alter table public.happyad_chat_messages enable row level security;

drop policy if exists happyad_chat_conversations_read_test on public.happyad_chat_conversations;
create policy happyad_chat_conversations_read_test
on public.happyad_chat_conversations for select
to anon, authenticated
using (true);

drop policy if exists happyad_chat_conversations_write_test on public.happyad_chat_conversations;
create policy happyad_chat_conversations_write_test
on public.happyad_chat_conversations for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists happyad_chat_messages_read_test on public.happyad_chat_messages;
create policy happyad_chat_messages_read_test
on public.happyad_chat_messages for select
to anon, authenticated
using (true);

drop policy if exists happyad_chat_messages_write_test on public.happyad_chat_messages;
create policy happyad_chat_messages_write_test
on public.happyad_chat_messages for all
to anon, authenticated
using (true)
with check (true);

-- Realtime : ignore l'erreur si la table est déjà ajoutée à la publication.
do $$
begin
  begin
    alter publication supabase_realtime add table public.happyad_chat_conversations;
  exception when duplicate_object then null; when undefined_object then null; when others then null;
  end;

  begin
    alter publication supabase_realtime add table public.happyad_chat_messages;
  exception when duplicate_object then null; when undefined_object then null; when others then null;
  end;
end $$;

-- Vérification rapide après exécution :
-- select count(*) from public.happyad_chat_conversations;
-- select count(*) from public.happyad_chat_messages;
-- HAPPYAD_CHAT_ACTIONS_V2C.sql
-- Ajoute les actions réelles au nouveau système messages :
-- 1) supprimer conversation pour moi
-- 2) supprimer message pour moi
-- 3) supprimer mon message pour tous
-- 4) modifier mon message pendant 20 minutes seulement
-- 5) épingler/désépingler un message pour moi
-- A exécuter APRES HAPPYAD_CHAT_CLEAN_V2B.sql si V2B a déjà été exécuté.

alter table public.happyad_chat_conversations
  add column if not exists hidden_for_user_ids text[] not null default '{}'::text[];

alter table public.happyad_chat_messages
  add column if not exists hidden_for_user_ids text[] not null default '{}'::text[];
alter table public.happyad_chat_messages
  add column if not exists pinned_by_user_ids text[] not null default '{}'::text[];
alter table public.happyad_chat_messages
  add column if not exists edited_at timestamptz;
alter table public.happyad_chat_messages
  add column if not exists edited_by text;

update public.happyad_chat_conversations
set hidden_for_user_ids = '{}'::text[]
where hidden_for_user_ids is null;

update public.happyad_chat_messages
set hidden_for_user_ids = '{}'::text[]
where hidden_for_user_ids is null;

update public.happyad_chat_messages
set pinned_by_user_ids = '{}'::text[]
where pinned_by_user_ids is null;

create or replace function public.happyad_chat_array_add(arr text[], val text)
returns text[]
language sql
immutable
as $$
  select coalesce(array_agg(distinct x), '{}'::text[])
  from unnest(coalesce(arr, '{}'::text[]) || array[nullif(trim(coalesce(val,'')), '')]) as x
  where x is not null and trim(x) <> '';
$$;

create or replace function public.happyad_chat_array_remove(arr text[], val text)
returns text[]
language sql
immutable
as $$
  select coalesce(array_agg(distinct x), '{}'::text[])
  from unnest(coalesce(arr, '{}'::text[])) as x
  where x is not null and trim(x) <> '' and x <> nullif(trim(coalesce(val,'')), '');
$$;

create or replace function public.happyad_chat_refresh_conversation(p_conversation_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.happyad_chat_messages;
  v_last text;
begin
  select * into v_row
  from public.happyad_chat_messages
  where conversation_id = p_conversation_id
  order by created_at desc
  limit 1;

  if not found then
    update public.happyad_chat_conversations
    set last_message = null,
        last_sender_id = null,
        last_message_at = null,
        updated_at = now()
    where id = p_conversation_id;
    return;
  end if;

  v_last := case
    when v_row.deleted_for_all then 'message supprimé'
    when nullif(trim(coalesce(v_row.body,'')), '') is not null then v_row.body
    when coalesce(v_row.message_type,'text') <> 'text' then 'Fichier'
    else 'Message'
  end;

  update public.happyad_chat_conversations
  set last_message = v_last,
      last_sender_id = v_row.sender_id,
      last_message_at = v_row.created_at,
      updated_at = now()
  where id = p_conversation_id;
end;
$$;

create or replace function public.happyad_chat_after_message()
returns trigger
language plpgsql
as $$
declare
  v_pair text;
  v_last text;
begin
  v_pair := public.happyad_chat_pair_key(new.user_a, new.user_b);
  v_last := case
    when new.deleted_for_all then 'message supprimé'
    when nullif(trim(coalesce(new.body,'')), '') is not null then new.body
    when new.message_type <> 'text' then 'Fichier'
    else 'Message'
  end;

  insert into public.happyad_chat_conversations(
    id, pair_key, user1_id, user2_id, user_a, user_b,
    last_message, last_sender_id, last_message_at, hidden_for_user_ids, updated_at, created_at
  ) values (
    new.conversation_id, v_pair, new.user_a, new.user_b, new.user_a, new.user_b,
    v_last, new.sender_id, new.created_at, '{}'::text[], now(), coalesce(new.created_at, now())
  )
  on conflict (id) do update set
    pair_key = excluded.pair_key,
    user1_id = excluded.user1_id,
    user2_id = excluded.user2_id,
    user_a = excluded.user_a,
    user_b = excluded.user_b,
    last_message = excluded.last_message,
    last_sender_id = excluded.last_sender_id,
    last_message_at = excluded.last_message_at,
    hidden_for_user_ids = '{}'::text[],
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists happyad_chat_messages_after_insert on public.happyad_chat_messages;
create trigger happyad_chat_messages_after_insert
after insert on public.happyad_chat_messages
for each row execute function public.happyad_chat_after_message();

create or replace function public.happyad_chat_after_message_update()
returns trigger
language plpgsql
as $$
begin
  perform public.happyad_chat_refresh_conversation(new.conversation_id);
  return new;
end;
$$;

drop trigger if exists happyad_chat_messages_after_update on public.happyad_chat_messages;
create trigger happyad_chat_messages_after_update
after update on public.happyad_chat_messages
for each row execute function public.happyad_chat_after_message_update();

create or replace function public.happyad_chat_conversation_list(p_user_id text, p_limit int default 160)
returns table (
  id text,
  conversation_id text,
  user1_id text,
  user2_id text,
  user_a text,
  user_b text,
  _other_id text,
  other_user_id text,
  last_message text,
  last_sender_id text,
  last_message_at timestamptz,
  updated_at timestamptz,
  created_at timestamptz,
  unread_a integer,
  unread_b integer,
  source_table text
)
language sql
stable
as $$
  select
    c.id,
    c.id as conversation_id,
    c.user1_id,
    c.user2_id,
    c.user_a,
    c.user_b,
    case when c.user_a = p_user_id then c.user_b else c.user_a end as _other_id,
    case when c.user_a = p_user_id then c.user_b else c.user_a end as other_user_id,
    coalesce(c.last_message, 'Message') as last_message,
    c.last_sender_id,
    c.last_message_at,
    c.updated_at,
    c.created_at,
    case when c.user_a = p_user_id then (
      select count(*)::int from public.happyad_chat_messages m
      where m.conversation_id = c.id
        and m.receiver_id = p_user_id
        and m.is_read = false
        and not (coalesce(m.hidden_for_user_ids, '{}'::text[]) @> array[p_user_id])
    ) else 0 end as unread_a,
    case when c.user_b = p_user_id then (
      select count(*)::int from public.happyad_chat_messages m
      where m.conversation_id = c.id
        and m.receiver_id = p_user_id
        and m.is_read = false
        and not (coalesce(m.hidden_for_user_ids, '{}'::text[]) @> array[p_user_id])
    ) else 0 end as unread_b,
    'happyad_chat_conversations'::text as source_table
  from public.happyad_chat_conversations c
  where p_user_id in (c.user_a, c.user_b, c.user1_id, c.user2_id)
    and not (coalesce(c.hidden_for_user_ids, '{}'::text[]) @> array[p_user_id])
  order by c.updated_at desc nulls last, c.last_message_at desc nulls last, c.created_at desc
  limit greatest(1, least(coalesce(p_limit,160), 500));
$$;

create or replace function public.happyad_chat_thread(
  p_user_id text,
  p_conversation_id text default null,
  p_other_id text default null,
  p_limit int default 320
)
returns setof public.happyad_chat_messages
language sql
stable
as $$
  select m.*
  from public.happyad_chat_messages m
  where
    p_user_id in (m.user_a, m.user_b, m.sender_id, m.receiver_id)
    and not (coalesce(m.hidden_for_user_ids, '{}'::text[]) @> array[p_user_id])
    and (
      (nullif(trim(coalesce(p_conversation_id,'')), '') is not null and m.conversation_id::text = p_conversation_id)
      or (
        nullif(trim(coalesce(p_other_id,'')), '') is not null
        and public.happyad_chat_pair_key(m.sender_id, m.receiver_id) = public.happyad_chat_pair_key(p_user_id, p_other_id)
      )
    )
  order by m.created_at asc
  limit greatest(1, least(coalesce(p_limit,320), 800));
$$;

create or replace function public.happyad_chat_hide_conversation_for_me(
  p_conversation_id text,
  p_user_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.happyad_chat_conversations
  set hidden_for_user_ids = public.happyad_chat_array_add(hidden_for_user_ids, p_user_id),
      updated_at = now()
  where id = p_conversation_id
    and p_user_id in (user_a, user_b, user1_id, user2_id);

  update public.happyad_chat_messages
  set hidden_for_user_ids = public.happyad_chat_array_add(hidden_for_user_ids, p_user_id),
      updated_at = now()
  where conversation_id = p_conversation_id
    and p_user_id in (user_a, user_b, sender_id, receiver_id);
end;
$$;

create or replace function public.happyad_chat_hide_message_for_me(
  p_message_id uuid,
  p_user_id text
)
returns setof public.happyad_chat_messages
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.happyad_chat_messages;
begin
  update public.happyad_chat_messages
  set hidden_for_user_ids = public.happyad_chat_array_add(hidden_for_user_ids, p_user_id),
      updated_at = now()
  where id = p_message_id
    and p_user_id in (user_a, user_b, sender_id, receiver_id)
  returning * into v_row;

  if not found then
    raise exception 'message not found or not allowed';
  end if;

  return next v_row;
end;
$$;

create or replace function public.happyad_chat_delete_message_for_all(
  p_message_id uuid,
  p_user_id text
)
returns setof public.happyad_chat_messages
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.happyad_chat_messages;
begin
  update public.happyad_chat_messages
  set deleted_for_all = true,
      body = null,
      media_items = null,
      file_meta = null,
      media_url = null,
      deleted_at = now(),
      updated_at = now()
  where id = p_message_id
    and sender_id = p_user_id
  returning * into v_row;

  if not found then
    raise exception 'message not found or not allowed';
  end if;

  perform public.happyad_chat_refresh_conversation(v_row.conversation_id);
  return next v_row;
end;
$$;

create or replace function public.happyad_chat_edit_message(
  p_message_id uuid,
  p_user_id text,
  p_body text
)
returns setof public.happyad_chat_messages
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.happyad_chat_messages;
begin
  update public.happyad_chat_messages
  set body = coalesce(p_body,''),
      edited_at = now(),
      edited_by = p_user_id,
      updated_at = now()
  where id = p_message_id
    and sender_id = p_user_id
    and deleted_for_all = false
    and created_at >= now() - interval '20 minutes'
  returning * into v_row;

  if not found then
    raise exception 'modification possible only for sender within 20 minutes';
  end if;

  perform public.happyad_chat_refresh_conversation(v_row.conversation_id);
  return next v_row;
end;
$$;

create or replace function public.happyad_chat_pin_message(
  p_message_id uuid,
  p_user_id text,
  p_pin boolean default true
)
returns setof public.happyad_chat_messages
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.happyad_chat_messages;
begin
  update public.happyad_chat_messages
  set pinned_by_user_ids = case
        when coalesce(p_pin,true) then public.happyad_chat_array_add(pinned_by_user_ids, p_user_id)
        else public.happyad_chat_array_remove(pinned_by_user_ids, p_user_id)
      end,
      updated_at = now()
  where id = p_message_id
    and p_user_id in (user_a, user_b, sender_id, receiver_id)
  returning * into v_row;

  if not found then
    raise exception 'message not found or not allowed';
  end if;

  return next v_row;
end;
$$;

create index if not exists happyad_chat_conversations_hidden_idx
  on public.happyad_chat_conversations using gin(hidden_for_user_ids);
create index if not exists happyad_chat_messages_hidden_idx
  on public.happyad_chat_messages using gin(hidden_for_user_ids);
create index if not exists happyad_chat_messages_pinned_idx
  on public.happyad_chat_messages using gin(pinned_by_user_ids);

GRANT execute on function public.happyad_chat_hide_conversation_for_me(text,text) to anon, authenticated;
GRANT execute on function public.happyad_chat_hide_message_for_me(uuid,text) to anon, authenticated;
GRANT execute on function public.happyad_chat_delete_message_for_all(uuid,text) to anon, authenticated;
GRANT execute on function public.happyad_chat_edit_message(uuid,text,text) to anon, authenticated;
GRANT execute on function public.happyad_chat_pin_message(uuid,text,boolean) to anon, authenticated;
GRANT execute on function public.happyad_chat_refresh_conversation(text) to anon, authenticated;

-- Vérification rapide :
-- select column_name from information_schema.columns where table_name='happyad_chat_messages' and column_name in ('hidden_for_user_ids','pinned_by_user_ids','edited_at','edited_by');
