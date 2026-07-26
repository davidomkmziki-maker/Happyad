-- ============================================================================
-- HAPPYAD MESSAGES V37 — PHASE 5G2
-- VIDÉO EN VUE UNIQUE : OUVERTURE INTERNE, CONSOMMATION AU PREMIER DÉMARRAGE
-- ============================================================================
-- À exécuter après les SQL 5G1, 5G1B et 5G1C déjà validés.
-- Ce script étend le système maître existant de la photo vers la vidéo.
-- Il ne crée aucune table ni aucune deuxième centrale Messages.
-- ============================================================================

begin;

set local lock_timeout = '10s';
set local statement_timeout = '120s';
select pg_advisory_xact_lock(hashtext('happyad_messages_phase5g2_video_view_once'));

-- --------------------------------------------------------------------------
-- 1. États vue unique : photo + vidéo.
-- --------------------------------------------------------------------------
drop function if exists public.happyad_msg_list_view_once_states(uuid);

create function public.happyad_msg_list_view_once_states(
  p_conversation_id uuid
)
returns table (
  message_id uuid,
  sender_id uuid,
  message_kind text,
  consumed_at timestamptz,
  recipient_dismissed_at timestamptz,
  sender_dismissed_at timestamptz
)
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_me uuid := auth.uid();
begin
  if v_me is null then
    raise exception 'Utilisateur non connecté.' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.happyad_msg_conversation_members cm
    where cm.conversation_id = p_conversation_id
      and cm.user_id = v_me
  ) then
    raise exception 'Conversation non autorisée.' using errcode = '42501';
  end if;

  return query
  select
    m.id,
    m.sender_id,
    m.kind,
    a.consumed_at,
    a.dismissed_at,
    a.sender_dismissed_at
  from public.happyad_msg_messages m
  left join public.happyad_msg_message_access a
    on a.message_id = m.id
  where m.conversation_id = p_conversation_id
    and m.view_once is true
    and m.kind in ('photo','video')
    and not exists (
      select 1
      from public.happyad_msg_message_deletions d
      where d.message_id = m.id
        and d.user_id = v_me
    )
  order by m.server_seq;
end;
$$;

-- --------------------------------------------------------------------------
-- 2. Réserver une première ouverture photo ou vidéo.
-- Le clic seul ne consomme pas. La vidéo est consommée par le frontend au
-- premier démarrage réel de la lecture.
-- --------------------------------------------------------------------------
drop function if exists public.happyad_msg_claim_view_once(uuid);

create function public.happyad_msg_claim_view_once(
  p_message_id uuid
)
returns table (
  message_id uuid,
  claim_token uuid,
  claim_expires_at timestamptz,
  bucket text,
  storage_path text,
  file_name text,
  mime_type text,
  width integer,
  height integer
)
language plpgsql
security definer
set search_path = public, auth, storage, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_message public.happyad_msg_messages%rowtype;
  v_access public.happyad_msg_message_access%rowtype;
  v_attachment public.happyad_msg_attachments%rowtype;
  v_token uuid := gen_random_uuid();
  v_expires timestamptz;
  v_mime text;
begin
  if v_me is null then
    raise exception 'Utilisateur non connecté.' using errcode = '42501';
  end if;

  select m.* into v_message
  from public.happyad_msg_messages m
  where m.id = p_message_id
  for update;

  if not found
     or v_message.view_once is not true
     or v_message.kind not in ('photo','video')
     or v_message.deleted_for_all_at is not null then
    raise exception 'Média vue unique introuvable.' using errcode = 'P0002';
  end if;

  if v_message.sender_id = v_me then
    raise exception 'L’expéditeur ne peut pas ouvrir sa propre vue unique.' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.happyad_msg_conversation_members cm
    where cm.conversation_id = v_message.conversation_id
      and cm.user_id = v_me
  ) then
    raise exception 'Vue unique non autorisée.' using errcode = '42501';
  end if;

  if exists (
    select 1
    from public.happyad_msg_message_deletions d
    where d.message_id = p_message_id
      and d.user_id = v_me
  ) then
    raise exception 'Ce message a été supprimé pour vous.' using errcode = '42501';
  end if;

  v_expires := now() + case
    when v_message.kind = 'video' then interval '5 minutes'
    else interval '2 minutes'
  end;

  select a.* into v_access
  from public.happyad_msg_message_access a
  where a.message_id = p_message_id
    and a.user_id = v_me
  for update;

  if found then
    if v_access.consumed_at is not null then
      raise exception 'Ce média a déjà été ouvert.' using errcode = 'P0001';
    end if;
    if v_access.claim_token is not null
       and v_access.claim_expires_at is not null
       and v_access.claim_expires_at > now() then
      raise exception 'Ouverture déjà en cours. Réessayez dans quelques instants.' using errcode = '55P03';
    end if;

    -- opened_at reste volontairement immuable.
    update public.happyad_msg_message_access a
       set claim_token = v_token,
           claim_expires_at = v_expires,
           dismissed_at = null
     where a.message_id = p_message_id
       and a.user_id = v_me;
  else
    insert into public.happyad_msg_message_access (
      message_id,user_id,opened_at,claim_token,claim_expires_at
    ) values (
      p_message_id,v_me,now(),v_token,v_expires
    );
  end if;

  select a.* into v_attachment
  from public.happyad_msg_attachments a
  where a.message_id = p_message_id
  order by a.position
  limit 1;

  v_mime := lower(coalesce(v_attachment.mime_type,''));

  if not found
     or nullif(btrim(v_attachment.storage_path),'') is null
     or (v_message.kind = 'photo' and v_mime not like 'image/%')
     or (v_message.kind = 'video' and v_mime not like 'video/%') then
    update public.happyad_msg_message_access a
       set claim_token = null,
           claim_expires_at = null
     where a.message_id = p_message_id
       and a.user_id = v_me
       and a.claim_token = v_token;
    raise exception 'Fichier vue unique indisponible.' using errcode = 'P0002';
  end if;

  return query select
    p_message_id,
    v_token,
    v_expires,
    v_attachment.bucket,
    v_attachment.storage_path,
    v_attachment.file_name,
    v_attachment.mime_type,
    v_attachment.width,
    v_attachment.height;
end;
$$;

-- --------------------------------------------------------------------------
-- 3. Le nettoyage côté expéditeur accepte désormais photo et vidéo.
-- --------------------------------------------------------------------------
drop function if exists public.happyad_msg_dismiss_opened_view_once(uuid);

create function public.happyad_msg_dismiss_opened_view_once(
  p_message_id uuid
)
returns timestamptz
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_at timestamptz;
begin
  if v_me is null then
    raise exception 'Utilisateur non connecté.' using errcode = '42501';
  end if;

  update public.happyad_msg_message_access a
     set sender_dismissed_at = coalesce(a.sender_dismissed_at, now())
   where a.message_id = p_message_id
     and a.consumed_at is not null
     and exists (
       select 1
       from public.happyad_msg_messages m
       where m.id = a.message_id
         and m.sender_id = v_me
         and m.view_once is true
         and m.kind in ('photo','video')
     )
  returning a.sender_dismissed_at into v_at;

  if v_at is null then
    raise exception 'Message ouvert introuvable.' using errcode = '42501';
  end if;
  return v_at;
end;
$$;

-- --------------------------------------------------------------------------
-- 4. Storage : une réservation active autorise le flux privé de la photo ou
-- de la vidéo. Une vue déjà consommée ne peut plus créer une nouvelle URL.
-- --------------------------------------------------------------------------
drop policy if exists happyad_message_files_select_phase5g1 on storage.objects;
drop function if exists public.happyad_msg_can_read_storage_object(text, text);

create function public.happyad_msg_can_read_storage_object(
  p_bucket text,
  p_storage_path text
)
returns boolean
language plpgsql
stable
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_me uuid := auth.uid();
begin
  if v_me is null
     or p_bucket <> 'happyad-message-files'
     or nullif(btrim(coalesce(p_storage_path,'')),'') is null then
    return false;
  end if;

  return exists (
    select 1
    from public.happyad_msg_attachments a
    join public.happyad_msg_messages m on m.id = a.message_id
    join public.happyad_msg_conversation_members cm
      on cm.conversation_id = m.conversation_id
     and cm.user_id = v_me
    where a.bucket = p_bucket
      and a.storage_path = p_storage_path
      and m.deleted_for_all_at is null
      and (
        m.view_once is false
        or (
          m.view_once is true
          and m.kind in ('photo','video')
          and m.sender_id <> v_me
          and exists (
            select 1
            from public.happyad_msg_message_access va
            where va.message_id = m.id
              and va.user_id = v_me
              and va.consumed_at is null
              and va.claim_token is not null
              and va.claim_expires_at > now()
          )
        )
      )
  );
end;
$$;

revoke all on function public.happyad_msg_can_read_storage_object(text,text)
  from public, anon;
grant execute on function public.happyad_msg_can_read_storage_object(text,text)
  to authenticated;

create policy happyad_message_files_select_phase5g1
on storage.objects
for select
to authenticated
using (
  bucket_id = 'happyad-message-files'
  and public.happyad_msg_can_read_storage_object(bucket_id,name)
);

-- --------------------------------------------------------------------------
-- 5. Aperçu = dernier message encore visible, pour photo et vidéo.
-- --------------------------------------------------------------------------
drop function if exists public.happyad_msg_list_visible_conversation_previews();

create function public.happyad_msg_list_visible_conversation_previews()
returns table (
  conversation_id uuid,
  message_id uuid,
  server_seq bigint,
  created_at timestamptz,
  message_kind text,
  message_body text,
  sender_id uuid,
  deleted_for_all_at timestamptz,
  view_once boolean,
  view_once_consumed_at timestamptz,
  view_once_sender_dismissed_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_me uuid := auth.uid();
begin
  if v_me is null then
    raise exception 'Utilisateur non connecté.' using errcode = '42501';
  end if;

  return query
  select
    cm.conversation_id,
    visible_message.id,
    visible_message.server_seq,
    visible_message.created_at,
    visible_message.kind,
    visible_message.body,
    visible_message.sender_id,
    visible_message.deleted_for_all_at,
    visible_message.view_once,
    visible_message.consumed_at,
    visible_message.sender_dismissed_at
  from public.happyad_msg_conversation_members cm
  join lateral (
    select
      m.id,
      m.server_seq,
      m.created_at,
      m.kind,
      m.body,
      m.sender_id,
      m.deleted_for_all_at,
      m.view_once,
      access_state.consumed_at,
      access_state.sender_dismissed_at
    from public.happyad_msg_messages m
    left join lateral (
      select a.consumed_at,a.sender_dismissed_at
      from public.happyad_msg_message_access a
      where a.message_id = m.id
      order by a.opened_at desc
      limit 1
    ) access_state on true
    where m.conversation_id = cm.conversation_id
      and m.server_seq > greatest(coalesce(cm.deleted_through_seq,0),0)
      and not exists (
        select 1
        from public.happyad_msg_message_deletions d
        where d.message_id = m.id
          and d.user_id = v_me
      )
      and (
        m.view_once is false
        or m.kind not in ('photo','video')
        or (m.sender_id = v_me and access_state.sender_dismissed_at is null)
        or (m.sender_id <> v_me and access_state.consumed_at is null)
      )
    order by m.server_seq desc
    limit 1
  ) visible_message on true
  where cm.user_id = v_me
  order by visible_message.server_seq desc;
end;
$$;

-- --------------------------------------------------------------------------
-- 6. Droits.
-- --------------------------------------------------------------------------
revoke all on function public.happyad_msg_list_view_once_states(uuid) from public, anon;
revoke all on function public.happyad_msg_claim_view_once(uuid) from public, anon;
revoke all on function public.happyad_msg_dismiss_opened_view_once(uuid) from public, anon;
revoke all on function public.happyad_msg_list_visible_conversation_previews() from public, anon;

grant execute on function public.happyad_msg_list_view_once_states(uuid) to authenticated;
grant execute on function public.happyad_msg_claim_view_once(uuid) to authenticated;
grant execute on function public.happyad_msg_dismiss_opened_view_once(uuid) to authenticated;
grant execute on function public.happyad_msg_list_visible_conversation_previews() to authenticated;

commit;

select
  'PHASE_5G2_VIDEO_VIEW_ONCE_OK' as status,
  to_regprocedure('public.happyad_msg_claim_view_once(uuid)') is not null as claim_rpc_ready,
  to_regprocedure('public.happyad_msg_consume_view_once_internal(uuid,uuid)') is not null as consume_rpc_ready,
  to_regprocedure('public.happyad_msg_list_visible_conversation_previews()') is not null as preview_rpc_ready,
  to_regprocedure('public.happyad_msg_can_read_storage_object(text,text)') is not null as storage_guard_ready;

-- Diagnostic non destructif : 0 est attendu.
select count(*)::bigint as view_once_video_objects_missing
from public.happyad_msg_attachments a
join public.happyad_msg_messages m on m.id = a.message_id
left join storage.objects o
  on o.bucket_id = a.bucket and o.name = a.storage_path
where m.view_once is true
  and m.kind = 'video'
  and m.deleted_for_all_at is null
  and o.id is null;
