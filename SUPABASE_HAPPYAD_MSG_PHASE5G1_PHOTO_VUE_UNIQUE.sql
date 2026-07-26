-- ============================================================================
-- HAPPYAD MESSAGES V37 — PHASE 5G1
-- PHOTO EN VUE UNIQUE : RÉSERVATION, CONSOMMATION ET DISPARITION PAR COMPTE
-- ============================================================================
-- À exécuter dans Supabase > SQL Editor. Le script peut être relancé pour réparer 5G1.
-- Ce correctif reste dans les six tables canoniques de la messagerie.
-- Il ne crée aucune deuxième centrale et ne touche à aucun autre module HAPPYAD.
-- ============================================================================

begin;

set local lock_timeout = '10s';
set local statement_timeout = '120s';
select pg_advisory_xact_lock(hashtext('happyad_messages_phase5g1_photo_view_once'));

create extension if not exists pgcrypto;

-- --------------------------------------------------------------------------
-- 1. État serveur supplémentaire dans la table d'accès existante.
-- Une seule ligne reste utilisée : celle du destinataire du message.
-- --------------------------------------------------------------------------
alter table public.happyad_msg_message_access
  add column if not exists claim_token uuid,
  add column if not exists claim_expires_at timestamptz,
  add column if not exists dismissed_at timestamptz,
  add column if not exists sender_dismissed_at timestamptz;

alter table public.happyad_msg_message_access
  drop constraint if exists happyad_msg_access_claim_consistency_chk;

alter table public.happyad_msg_message_access
  add constraint happyad_msg_access_claim_consistency_chk
  check (
    (claim_token is null and claim_expires_at is null)
    or
    (claim_token is not null and claim_expires_at is not null)
  );

create index if not exists happyad_msg_access_claim_expiry_idx
  on public.happyad_msg_message_access (claim_expires_at)
  where claim_token is not null and consumed_at is null;

-- --------------------------------------------------------------------------
-- 2. Lecture Realtime de l'état par les deux membres de la conversation.
-- Les écritures directes restent interdites : elles passent par les RPC.
-- --------------------------------------------------------------------------
alter table public.happyad_msg_message_access enable row level security;

drop policy if exists happyad_msg_message_access_select_members_5g1
  on public.happyad_msg_message_access;

create policy happyad_msg_message_access_select_members_5g1
on public.happyad_msg_message_access
for select
to authenticated
using (
  exists (
    select 1
    from public.happyad_msg_messages m
    join public.happyad_msg_conversation_members cm
      on cm.conversation_id = m.conversation_id
     and cm.user_id = auth.uid()
    where m.id = happyad_msg_message_access.message_id
  )
);

revoke insert, update, delete on public.happyad_msg_message_access from anon, authenticated;

-- --------------------------------------------------------------------------
-- 3. État minimal des vues uniques de la conversation.
-- Aucun chemin Storage ni contenu média n'est retourné ici.
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
    and m.kind = 'photo'
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
-- 4. Réserver la première ouverture.
-- Le clic seul ne consomme rien. La réservation expire après deux minutes.
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
  v_expires timestamptz := now() + interval '2 minutes';
begin
  if v_me is null then
    raise exception 'Utilisateur non connecté.' using errcode = '42501';
  end if;

  select m.*
    into v_message
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

  select a.*
    into v_access
  from public.happyad_msg_message_access a
  where a.message_id = p_message_id
    and a.user_id = v_me
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

    -- opened_at représente la première identité temporelle de l'accès.
    -- Il est volontairement conservé : le garde-fou canonique l'interdit en modification.
    update public.happyad_msg_message_access a
       set claim_token = v_token,
           claim_expires_at = v_expires,
           dismissed_at = null
     where a.message_id = p_message_id
       and a.user_id = v_me;
  else
    insert into public.happyad_msg_message_access (
      message_id,
      user_id,
      opened_at,
      claim_token,
      claim_expires_at
    ) values (
      p_message_id,
      v_me,
      now(),
      v_token,
      v_expires
    );
  end if;

  select a.*
    into v_attachment
  from public.happyad_msg_attachments a
  where a.message_id = p_message_id
  order by a.position
  limit 1;

  if not found
     or coalesce(v_attachment.mime_type,'') not like 'image/%'
     or nullif(btrim(v_attachment.storage_path),'') is null then
    update public.happyad_msg_message_access a
       set claim_token = null,
           claim_expires_at = null
     where a.message_id = p_message_id
       and a.user_id = v_me
       and a.claim_token = v_token;
    raise exception 'Fichier photo vue unique indisponible.' using errcode = 'P0002';
  end if;

  return query
  select
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
-- 5. Consommer uniquement après décodage réel de l'image côté lecteur.
-- --------------------------------------------------------------------------
drop function if exists public.happyad_msg_consume_view_once_internal(uuid);
drop function if exists public.happyad_msg_consume_view_once_internal(uuid, uuid);
drop function if exists public.happyad_msg_consume_view_once(uuid);

create function public.happyad_msg_consume_view_once_internal(
  p_message_id uuid,
  p_claim_token uuid
)
returns table (
  message_id uuid,
  consumed_at timestamptz
)
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_consumed_at timestamptz;
begin
  if v_me is null then
    raise exception 'Utilisateur non connecté.' using errcode = '42501';
  end if;

  update public.happyad_msg_message_access a
     set consumed_at = now(),
         claim_token = null,
         claim_expires_at = null
   where a.message_id = p_message_id
     and a.user_id = v_me
     and a.consumed_at is null
     and a.claim_token = p_claim_token
     and a.claim_expires_at > now()
  returning a.consumed_at into v_consumed_at;

  if v_consumed_at is null then
    raise exception 'Autorisation expirée ou photo déjà ouverte.' using errcode = '42501';
  end if;

  return query select p_message_id, v_consumed_at;
end;
$$;

-- Annuler proprement une réservation si l'image n'a pas été affichée.
drop function if exists public.happyad_msg_release_view_once_claim(uuid, uuid);

create function public.happyad_msg_release_view_once_claim(
  p_message_id uuid,
  p_claim_token uuid
)
returns boolean
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_me uuid := auth.uid();
  v_released boolean := false;
begin
  if v_me is null then return false; end if;

  update public.happyad_msg_message_access a
     set claim_token = null,
         claim_expires_at = null
   where a.message_id = p_message_id
     and a.user_id = v_me
     and a.consumed_at is null
     and a.claim_token = p_claim_token;

  v_released := found;
  return v_released;
end;
$$;

-- --------------------------------------------------------------------------
-- 6. Disparition persistante par compte.
-- Destinataire : fermeture du lecteur. Expéditeur : toucher « Message ouvert ».
-- --------------------------------------------------------------------------
drop function if exists public.happyad_msg_dismiss_view_once_for_me(uuid);

create function public.happyad_msg_dismiss_view_once_for_me(
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
     set dismissed_at = coalesce(a.dismissed_at, now())
   where a.message_id = p_message_id
     and a.user_id = v_me
     and a.consumed_at is not null
  returning a.dismissed_at into v_at;

  if v_at is null then
    raise exception 'Photo non consommée.' using errcode = '42501';
  end if;
  return v_at;
end;
$$;

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
         and m.kind = 'photo'
     )
  returning a.sender_dismissed_at into v_at;

  if v_at is null then
    raise exception 'Message ouvert introuvable.' using errcode = '42501';
  end if;
  return v_at;
end;
$$;

-- --------------------------------------------------------------------------
-- 7. Lecture Storage sécurisée.
-- La vérification des tables Messages passe par une fonction SECURITY DEFINER
-- afin que les RLS internes ne transforment pas un objet existant en
-- « Object not found » dans l'API Storage.
-- --------------------------------------------------------------------------
do $$
declare
  p record;
begin
  for p in
    select policyname
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and (
        coalesce(qual,'') ilike '%happyad-message-files%'
        or coalesce(with_check,'') ilike '%happyad-message-files%'
      )
  loop
    execute format('drop policy if exists %I on storage.objects', p.policyname);
  end loop;
end
$$;


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
    join public.happyad_msg_messages m
      on m.id = a.message_id
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

revoke all on function public.happyad_msg_can_read_storage_object(text, text)
  from public, anon;
grant execute on function public.happyad_msg_can_read_storage_object(text, text)
  to authenticated;


-- Upload uniquement dans le chemin canonique conversation_id/sender_id/client_id/fichier.
create policy happyad_message_files_insert_phase5g1
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'happyad-message-files'
  and (storage.foldername(name))[2] = auth.uid()::text
  and exists (
    select 1
    from public.happyad_msg_conversation_members cm
    where cm.conversation_id::text = (storage.foldername(name))[1]
      and cm.user_id = auth.uid()
  )
);

-- Nettoyage d'un upload échoué par son propriétaire uniquement.
create policy happyad_message_files_delete_phase5g1
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'happyad-message-files'
  and (storage.foldername(name))[2] = auth.uid()::text
);

create policy happyad_message_files_select_phase5g1
on storage.objects
for select
to authenticated
using (
  bucket_id = 'happyad-message-files'
  and public.happyad_msg_can_read_storage_object(bucket_id, name)
);

-- --------------------------------------------------------------------------
-- 8. Droits RPC uniquement pour les comptes connectés.
-- --------------------------------------------------------------------------
revoke all on function public.happyad_msg_list_view_once_states(uuid) from public, anon;
revoke all on function public.happyad_msg_claim_view_once(uuid) from public, anon;
revoke all on function public.happyad_msg_consume_view_once_internal(uuid, uuid) from public, anon;
revoke all on function public.happyad_msg_release_view_once_claim(uuid, uuid) from public, anon;
revoke all on function public.happyad_msg_dismiss_view_once_for_me(uuid) from public, anon;
revoke all on function public.happyad_msg_dismiss_opened_view_once(uuid) from public, anon;

grant execute on function public.happyad_msg_list_view_once_states(uuid) to authenticated;
grant execute on function public.happyad_msg_claim_view_once(uuid) to authenticated;
grant execute on function public.happyad_msg_consume_view_once_internal(uuid, uuid) to authenticated;
grant execute on function public.happyad_msg_release_view_once_claim(uuid, uuid) to authenticated;
grant execute on function public.happyad_msg_dismiss_view_once_for_me(uuid) to authenticated;
grant execute on function public.happyad_msg_dismiss_opened_view_once(uuid) to authenticated;

commit;

-- --------------------------------------------------------------------------
-- 9. Contrôle final visible.
-- --------------------------------------------------------------------------
select
  'PHASE_5G1_PHOTO_VIEW_ONCE_OK' as status,
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'happyad_msg_message_access'
      and column_name = 'sender_dismissed_at'
  ) as access_state_ready,
  to_regprocedure('public.happyad_msg_claim_view_once(uuid)') is not null as claim_rpc_ready,
  to_regprocedure('public.happyad_msg_consume_view_once_internal(uuid,uuid)') is not null as consume_rpc_ready,
  to_regprocedure('public.happyad_msg_can_read_storage_object(text,text)') is not null as storage_guard_ready;

select policyname, cmd, qual
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and coalesce(qual,'') ilike '%happyad-message-files%'
order by policyname;


-- Diagnostic non destructif : 0 est attendu.
select count(*)::bigint as view_once_photo_objects_missing
from public.happyad_msg_attachments a
join public.happyad_msg_messages m on m.id = a.message_id
left join storage.objects o
  on o.bucket_id = a.bucket
 and o.name = a.storage_path
where m.view_once is true
  and m.kind = 'photo'
  and m.deleted_for_all_at is null
  and o.id is null;
