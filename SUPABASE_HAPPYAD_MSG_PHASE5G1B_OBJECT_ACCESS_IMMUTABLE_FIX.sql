-- ============================================================================
-- HAPPYAD MESSAGES V37 — PHASE 5G1B
-- CORRECTION CIBLÉE : OBJECT NOT FOUND + ACCÈS IMMUABLE
-- À exécuter après le premier SQL 5G1 déjà installé.
-- ============================================================================

begin;
set local lock_timeout = '10s';
set local statement_timeout = '120s';
select pg_advisory_xact_lock(hashtext('happyad_messages_phase5g1b_object_access_fix'));

-- 1) Ne jamais modifier opened_at lors d'une nouvelle réservation.
create or replace function public.happyad_msg_claim_view_once(
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
  v_expires timestamptz := now() + interval '2 minutes';
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
     or v_message.kind <> 'photo'
     or v_message.deleted_for_all_at is not null then
    raise exception 'Photo vue unique introuvable.' using errcode = 'P0002';
  end if;

  if v_message.sender_id = v_me then
    raise exception 'L’expéditeur ne peut pas ouvrir sa propre vue unique.' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.happyad_msg_conversation_members cm
    where cm.conversation_id = v_message.conversation_id
      and cm.user_id = v_me
  ) then
    raise exception 'Vue unique non autorisée.' using errcode = '42501';
  end if;

  if exists (
    select 1 from public.happyad_msg_message_deletions d
    where d.message_id = p_message_id and d.user_id = v_me
  ) then
    raise exception 'Ce message a été supprimé pour vous.' using errcode = '42501';
  end if;

  select a.* into v_access
  from public.happyad_msg_message_access a
  where a.message_id = p_message_id and a.user_id = v_me
  for update;

  if found then
    if v_access.consumed_at is not null then
      raise exception 'Cette photo a déjà été ouverte.' using errcode = 'P0001';
    end if;
    if v_access.claim_token is not null
       and v_access.claim_expires_at is not null
       and v_access.claim_expires_at > now() then
      raise exception 'Ouverture déjà en cours. Réessayez dans quelques instants.' using errcode = '55P03';
    end if;

    -- opened_at est immuable et reste la date de première création de l'accès.
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

  if not found
     or coalesce(v_attachment.mime_type,'') not like 'image/%'
     or nullif(btrim(v_attachment.storage_path),'') is null then
    update public.happyad_msg_message_access a
       set claim_token = null, claim_expires_at = null
     where a.message_id = p_message_id
       and a.user_id = v_me
       and a.claim_token = v_token;
    raise exception 'Fichier photo vue unique indisponible.' using errcode = 'P0002';
  end if;

  return query select
    p_message_id,v_token,v_expires,v_attachment.bucket,
    v_attachment.storage_path,v_attachment.file_name,
    v_attachment.mime_type,v_attachment.width,v_attachment.height;
end;
$$;

-- 2) Vérifier Storage via SECURITY DEFINER pour éviter les faux « Object not found ».
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
          and m.kind = 'photo'
          and m.sender_id <> v_me
          and exists (
            select 1 from public.happyad_msg_message_access va
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

revoke all on function public.happyad_msg_can_read_storage_object(text,text) from public, anon;
grant execute on function public.happyad_msg_can_read_storage_object(text,text) to authenticated;

create policy happyad_message_files_select_phase5g1
on storage.objects
for select
to authenticated
using (
  bucket_id = 'happyad-message-files'
  and public.happyad_msg_can_read_storage_object(bucket_id,name)
);

revoke all on function public.happyad_msg_claim_view_once(uuid) from public, anon;
grant execute on function public.happyad_msg_claim_view_once(uuid) to authenticated;

commit;

select
  'PHASE_5G1B_OBJECT_ACCESS_IMMUTABLE_FIX_OK' as status,
  to_regprocedure('public.happyad_msg_claim_view_once(uuid)') is not null as claim_rpc_ready,
  to_regprocedure('public.happyad_msg_can_read_storage_object(text,text)') is not null as storage_guard_ready;

select count(*)::bigint as view_once_photo_objects_missing
from public.happyad_msg_attachments a
join public.happyad_msg_messages m on m.id = a.message_id
left join storage.objects o
  on o.bucket_id = a.bucket and o.name = a.storage_path
where m.view_once is true
  and m.kind = 'photo'
  and m.deleted_for_all_at is null
  and o.id is null;
