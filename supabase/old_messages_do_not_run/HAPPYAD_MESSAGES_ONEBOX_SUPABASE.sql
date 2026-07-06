-- HAPPYAD Messages OneBox + récupération anciennes conversations
-- Copie tout ce fichier dans Supabase SQL Editor puis clique Run.

create extension if not exists pgcrypto;

create table if not exists public.happyad_messages_box (
  id uuid primary key default gen_random_uuid(),
  conversation_id text not null,
  user_a text not null,
  user_b text not null,
  sender_id text not null,
  receiver_id text not null,
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
    and sender_id in (user_a, user_b)
    and receiver_id in (user_a, user_b)
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

drop policy if exists happyad_messages_box_select_own on public.happyad_messages_box;
create policy happyad_messages_box_select_own
on public.happyad_messages_box
for select
to authenticated
using (auth.uid()::text = user_a or auth.uid()::text = user_b);

drop policy if exists happyad_messages_box_insert_own on public.happyad_messages_box;
create policy happyad_messages_box_insert_own
on public.happyad_messages_box
for insert
to authenticated
with check (
  auth.uid()::text = sender_id
  and auth.uid()::text in (user_a, user_b)
  and receiver_id in (user_a, user_b)
  and sender_id <> receiver_id
);

drop policy if exists happyad_messages_box_update_own on public.happyad_messages_box;
create policy happyad_messages_box_update_own
on public.happyad_messages_box
for update
to authenticated
using (auth.uid()::text = sender_id or auth.uid()::text = receiver_id)
with check (auth.uid()::text = sender_id or auth.uid()::text = receiver_id);

grant select, insert, update on public.happyad_messages_box to authenticated;

-- Récupération durable depuis l'ancien système public.happyad_messages.
-- Cette partie ne supprime rien dans l'ancien système : elle copie seulement vers la boîte unique.
do $$
begin
  if to_regclass('public.happyad_messages') is not null then
    execute $copy_old_messages$
      insert into public.happyad_messages_box (
        conversation_id, user_a, user_b, sender_id, receiver_id,
        body, message_type, media_items, file_meta, client_temp_id,
        is_read, read_at, deleted_for_all, deleted_at, created_at, updated_at
      )
      select
        coalesce(nullif(j->>'conversation_id',''), nullif(j->>'thread_id',''), nullif(j->>'chat_id',''), 'msgbox_' || least(sender_id, receiver_id) || '_' || greatest(sender_id, receiver_id)) as conversation_id,
        least(sender_id, receiver_id) as user_a,
        greatest(sender_id, receiver_id) as user_b,
        sender_id,
        receiver_id,
        coalesce(nullif(j->>'body',''), nullif(j->>'message',''), nullif(j->>'text',''), '') as body,
        coalesce(nullif(j->>'message_type',''), nullif(j->>'type',''), case when nullif(j->>'media_url','') is not null then 'media' else 'text' end) as message_type,
        case
          when nullif(j->>'media_url','') is not null then jsonb_build_array(jsonb_build_object('url', j->>'media_url', 'type', coalesce(j->>'media_type','media')))
          else '[]'::jsonb
        end as media_items,
        '{}'::jsonb as file_meta,
        'oldmsg_' || coalesce(nullif(j->>'id',''), md5(coalesce(j->>'conversation_id','') || sender_id || receiver_id || coalesce(j->>'created_at','') || coalesce(j->>'message','') || coalesce(j->>'text',''))) as client_temp_id,
        case
          when lower(coalesce(j->>'status','')) in ('read','lu') then true
          when lower(coalesce(j->>'is_read','')) in ('true','t','1','yes') then true
          when nullif(j->>'read_at','') is not null then true
          else false
        end as is_read,
        case when coalesce(j->>'read_at','') ~ '^\d{4}-\d{2}-\d{2}' then (j->>'read_at')::timestamptz else null end as read_at,
        case
          when lower(coalesce(j->>'deleted_for_all', j->>'deleted_all', j->>'is_deleted', '')) in ('true','t','1','yes') then true
          when lower(coalesce(j->>'status','')) = 'deleted' then true
          else false
        end as deleted_for_all,
        case when coalesce(j->>'deleted_at','') ~ '^\d{4}-\d{2}-\d{2}' then (j->>'deleted_at')::timestamptz else null end as deleted_at,
        case when coalesce(j->>'created_at','') ~ '^\d{4}-\d{2}-\d{2}' then (j->>'created_at')::timestamptz else now() end as created_at,
        case when coalesce(j->>'updated_at','') ~ '^\d{4}-\d{2}-\d{2}' then (j->>'updated_at')::timestamptz when coalesce(j->>'created_at','') ~ '^\d{4}-\d{2}-\d{2}' then (j->>'created_at')::timestamptz else now() end as updated_at
      from public.happyad_messages m
      cross join lateral (select to_jsonb(m) as j) raw
      cross join lateral (
        select
          coalesce(nullif(j->>'sender_id',''), nullif(j->>'from_id',''), nullif(j->>'user_id',''), nullif(j->>'author_id','')) as sender_id,
          coalesce(nullif(j->>'receiver_id',''), nullif(j->>'to_id',''), nullif(j->>'recipient_id',''), nullif(j->>'target_user_id','')) as receiver_id
      ) ids
      where sender_id is not null
        and receiver_id is not null
        and sender_id <> receiver_id
      on conflict (client_temp_id) do update set
        body = excluded.body,
        is_read = public.happyad_messages_box.is_read or excluded.is_read,
        read_at = coalesce(public.happyad_messages_box.read_at, excluded.read_at),
        deleted_for_all = public.happyad_messages_box.deleted_for_all or excluded.deleted_for_all,
        deleted_at = coalesce(public.happyad_messages_box.deleted_at, excluded.deleted_at),
        updated_at = greatest(public.happyad_messages_box.updated_at, excluded.updated_at);
    $copy_old_messages$;
  end if;
end $$;

-- Realtime.
do $$
begin
  begin
    alter publication supabase_realtime add table public.happyad_messages_box;
  exception
    when duplicate_object then null;
    when undefined_object then null;
  end;
end $$;
