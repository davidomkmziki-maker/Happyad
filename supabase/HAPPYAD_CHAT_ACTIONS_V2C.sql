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
