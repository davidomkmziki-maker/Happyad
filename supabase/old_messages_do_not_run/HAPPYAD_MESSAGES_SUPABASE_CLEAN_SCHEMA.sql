-- HAPPYAD MESSAGES — organisation Supabase propre et rapide
-- Objectif : une source active pour les vrais messages = public.happyad_messages_box
-- Conversations = public.happyad_conversations comme index léger.
-- Ancienne table public.happyad_messages reste en backup/fallback, sans suppression.

begin;

-- 1) Colonnes minimales côté box. Les ALTER sont sans danger si la colonne existe déjà.
alter table if exists public.happyad_messages_box add column if not exists conversation_id text;
alter table if exists public.happyad_messages_box add column if not exists user_a text;
alter table if exists public.happyad_messages_box add column if not exists user_b text;
alter table if exists public.happyad_messages_box add column if not exists sender_id uuid;
alter table if exists public.happyad_messages_box add column if not exists receiver_id uuid;
alter table if exists public.happyad_messages_box add column if not exists body text;
alter table if exists public.happyad_messages_box add column if not exists message_type text default 'text';
alter table if exists public.happyad_messages_box add column if not exists client_temp_id text;
alter table if exists public.happyad_messages_box add column if not exists is_read boolean default false;
alter table if exists public.happyad_messages_box add column if not exists read_at timestamptz;
alter table if exists public.happyad_messages_box add column if not exists deleted_for_all boolean default false;
alter table if exists public.happyad_messages_box add column if not exists created_at timestamptz default now();
alter table if exists public.happyad_messages_box add column if not exists updated_at timestamptz default now();

-- 2) Remplir user_a/user_b depuis sender_id/receiver_id pour accélérer les recherches par paire.
update public.happyad_messages_box
set
  user_a = least(sender_id::text, receiver_id::text),
  user_b = greatest(sender_id::text, receiver_id::text),
  updated_at = coalesce(updated_at, created_at, now())
where sender_id is not null
  and receiver_id is not null
  and (user_a is null or user_b is null or user_a = '' or user_b = '');

-- 3) Import sécurisé depuis l'ancienne table vers la box si certaines lignes manquent encore.
insert into public.happyad_messages_box (
  conversation_id, user_a, user_b, sender_id, receiver_id, body, message_type,
  client_temp_id, is_read, read_at, deleted_for_all, created_at, updated_at
)
select
  m.conversation_id::text,
  least(m.sender_id::text, m.receiver_id::text),
  greatest(m.sender_id::text, m.receiver_id::text),
  m.sender_id,
  m.receiver_id,
  coalesce(nullif(m.body,''), nullif(m.text,''), nullif(m.message,''), ''),
  coalesce(nullif(m.media_type,''), 'text'),
  'old_' || m.id::text,
  coalesce(m.is_read,false),
  m.read_at,
  coalesce(m.deleted_all,false) or coalesce(m.is_deleted,false) or lower(coalesce(m.status,'')) = 'deleted',
  coalesce(m.created_at, now()),
  coalesce(m.created_at, now())
from public.happyad_messages m
where m.sender_id is not null
  and m.receiver_id is not null
  and not exists (
    select 1 from public.happyad_messages_box b
    where b.client_temp_id = 'old_' || m.id::text
       or b.id::text = m.id::text
  );

-- 4) Index rapides : conversation directe, paire, et compteur non lu.
create index if not exists idx_happyad_messages_box_conversation_created
  on public.happyad_messages_box (conversation_id, created_at desc);
create index if not exists idx_happyad_messages_box_pair_created
  on public.happyad_messages_box (user_a, user_b, created_at desc);
create index if not exists idx_happyad_messages_box_sender_receiver_created
  on public.happyad_messages_box (sender_id, receiver_id, created_at desc);
create index if not exists idx_happyad_messages_box_receiver_unread
  on public.happyad_messages_box (receiver_id, is_read) where is_read = false;
create index if not exists idx_happyad_conversations_user1_updated
  on public.happyad_conversations (user1_id, updated_at desc);
create index if not exists idx_happyad_conversations_user2_updated
  on public.happyad_conversations (user2_id, updated_at desc);

-- 5) RPC rapide pour l'interface. Accepte p_user_id pour compatibilité avec le profil HAPPYAD actif.
create or replace function public.happyad_messages_thread(
  p_user_id text,
  p_conversation_id text default null,
  p_other_id text default null,
  p_limit int default 320
)
returns table (
  source_table text,
  id text,
  conversation_id text,
  user_a text,
  user_b text,
  sender_id text,
  receiver_id text,
  body text,
  message_type text,
  client_temp_id text,
  is_read boolean,
  read_at timestamptz,
  deleted_for_all boolean,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select * from (
    select
      'happyad_messages_box'::text as source_table,
      b.id::text,
      b.conversation_id::text,
      b.user_a::text,
      b.user_b::text,
      b.sender_id::text,
      b.receiver_id::text,
      coalesce(b.body,'')::text as body,
      coalesce(b.message_type,'text')::text as message_type,
      b.client_temp_id::text,
      coalesce(b.is_read,false) as is_read,
      b.read_at,
      coalesce(b.deleted_for_all,false) as deleted_for_all,
      coalesce(b.created_at, now()) as created_at,
      coalesce(b.updated_at, b.created_at, now()) as updated_at
    from public.happyad_messages_box b
    where
      (p_user_id is null or p_user_id = '' or b.sender_id::text = p_user_id or b.receiver_id::text = p_user_id or b.user_a = p_user_id or b.user_b = p_user_id)
      and (
        (p_conversation_id is not null and p_conversation_id <> '' and b.conversation_id = p_conversation_id)
        or (
          p_other_id is not null and p_other_id <> '' and p_user_id is not null and p_user_id <> ''
          and (
            (b.user_a = least(p_user_id, p_other_id) and b.user_b = greatest(p_user_id, p_other_id))
            or (b.sender_id::text = p_user_id and b.receiver_id::text = p_other_id)
            or (b.sender_id::text = p_other_id and b.receiver_id::text = p_user_id)
          )
        )
      )
    union all
    select
      'happyad_messages'::text as source_table,
      m.id::text,
      m.conversation_id::text,
      least(m.sender_id::text, m.receiver_id::text),
      greatest(m.sender_id::text, m.receiver_id::text),
      m.sender_id::text,
      m.receiver_id::text,
      coalesce(nullif(m.body,''), nullif(m.text,''), nullif(m.message,''), '')::text,
      coalesce(nullif(m.media_type,''),'text')::text,
      ('old_' || m.id::text)::text,
      coalesce(m.is_read,false),
      m.read_at,
      (coalesce(m.deleted_all,false) or coalesce(m.is_deleted,false) or lower(coalesce(m.status,'')) = 'deleted'),
      coalesce(m.created_at, now()),
      coalesce(m.created_at, now())
    from public.happyad_messages m
    where
      (p_user_id is null or p_user_id = '' or m.sender_id::text = p_user_id or m.receiver_id::text = p_user_id)
      and (
        (p_conversation_id is not null and p_conversation_id <> '' and m.conversation_id::text = p_conversation_id)
        or (
          p_other_id is not null and p_other_id <> '' and p_user_id is not null and p_user_id <> ''
          and ((m.sender_id::text = p_user_id and m.receiver_id::text = p_other_id) or (m.sender_id::text = p_other_id and m.receiver_id::text = p_user_id))
        )
      )
  ) x
  order by x.created_at asc
  limit greatest(1, least(coalesce(p_limit,320), 500));
end;
$$;

grant execute on function public.happyad_messages_thread(text,text,text,int) to anon, authenticated;

create or replace function public.happyad_messages_conversations(
  p_user_id text,
  p_limit int default 160
)
returns table (
  id text,
  conversation_id text,
  user_a text,
  user_b text,
  last_message text,
  last_sender_id text,
  last_message_at timestamptz,
  updated_at timestamptz,
  created_at timestamptz,
  unread_a int,
  unread_b int
)
language sql
security definer
set search_path = public
as $$
  with ranked as (
    select
      coalesce(nullif(user_a,''), least(sender_id::text, receiver_id::text)) as ua,
      coalesce(nullif(user_b,''), greatest(sender_id::text, receiver_id::text)) as ub,
      conversation_id::text as cid,
      sender_id::text as sid,
      receiver_id::text as rid,
      coalesce(nullif(body,''),'Message') as body,
      coalesce(is_read,false) as read_state,
      coalesce(created_at, now()) as ca,
      coalesce(updated_at, created_at, now()) as ua_time,
      row_number() over (partition by coalesce(nullif(user_a,''), least(sender_id::text, receiver_id::text)), coalesce(nullif(user_b,''), greatest(sender_id::text, receiver_id::text)) order by coalesce(created_at, now()) desc) as rn
    from public.happyad_messages_box
    where p_user_id is null or p_user_id = '' or sender_id::text = p_user_id or receiver_id::text = p_user_id or user_a = p_user_id or user_b = p_user_id
  ), unread as (
    select coalesce(nullif(user_a,''), least(sender_id::text, receiver_id::text)) as ua,
           coalesce(nullif(user_b,''), greatest(sender_id::text, receiver_id::text)) as ub,
           count(*) filter (where receiver_id::text = p_user_id and coalesce(is_read,false) = false) as unread_count
    from public.happyad_messages_box
    where p_user_id is null or p_user_id = '' or sender_id::text = p_user_id or receiver_id::text = p_user_id or user_a = p_user_id or user_b = p_user_id
    group by 1,2
  )
  select
    r.cid as id,
    r.cid as conversation_id,
    r.ua as user_a,
    r.ub as user_b,
    r.body as last_message,
    r.sid as last_sender_id,
    r.ca as last_message_at,
    r.ua_time as updated_at,
    r.ca as created_at,
    case when r.ua = p_user_id then coalesce(u.unread_count,0)::int else 0 end as unread_a,
    case when r.ub = p_user_id then coalesce(u.unread_count,0)::int else 0 end as unread_b
  from ranked r
  left join unread u on u.ua = r.ua and u.ub = r.ub
  where r.rn = 1
  order by r.ca desc
  limit greatest(1, least(coalesce(p_limit,160), 250));
$$;

grant execute on function public.happyad_messages_conversations(text,int) to anon, authenticated;

create or replace function public.happyad_send_message_box(
  p_sender_id text,
  p_receiver_id text,
  p_body text,
  p_conversation_id text default null,
  p_client_temp_id text default null
)
returns setof public.happyad_messages_box
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sender text := coalesce(nullif(p_sender_id,''), auth.uid()::text, nullif(current_setting('request.jwt.claim.sub', true), ''));
  v_cid text;
  v_row public.happyad_messages_box;
begin
  if v_sender is null or v_sender = '' then
    raise exception 'Expéditeur manquant';
  end if;
  if p_receiver_id is null or p_receiver_id = '' then
    raise exception 'Destinataire manquant';
  end if;
  v_cid := coalesce(nullif(p_conversation_id,''), 'msgbox_' || regexp_replace(least(v_sender,p_receiver_id) || '_' || greatest(v_sender,p_receiver_id), '[^a-zA-Z0-9_.-]', '_', 'g'));
  insert into public.happyad_messages_box(conversation_id,user_a,user_b,sender_id,receiver_id,body,message_type,client_temp_id,is_read,created_at,updated_at)
  values(v_cid, least(v_sender,p_receiver_id), greatest(v_sender,p_receiver_id), v_sender::uuid, p_receiver_id::uuid, coalesce(p_body,''), 'text', p_client_temp_id, false, now(), now())
  returning * into v_row;
  return next v_row;
end;
$$;

grant execute on function public.happyad_send_message_box(text,text,text,text,text) to anon, authenticated;

commit;
