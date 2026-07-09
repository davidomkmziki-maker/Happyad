-- HAPPYAD V26 — SQL court: le compteur et la conversation lisent la même source serveur.
-- Objectif: si le badge voit un nouveau message, l'ouverture de la conversation doit aussi le voir.

-- 1) Realtime léger
DO $$
BEGIN
  IF to_regclass('public.happyad_msg_messages') IS NOT NULL THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.happyad_msg_messages;
    EXCEPTION WHEN duplicate_object THEN NULL; WHEN others THEN RAISE NOTICE 'Realtime happyad_msg_messages ignore: %', sqlerrm;
    END;
    BEGIN
      ALTER TABLE public.happyad_msg_messages REPLICA IDENTITY FULL;
    EXCEPTION WHEN others THEN RAISE NOTICE 'Replica happyad_msg_messages ignore: %', sqlerrm;
    END;
  END IF;

  IF to_regclass('public.happyad_msg_attachments') IS NOT NULL THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.happyad_msg_attachments;
    EXCEPTION WHEN duplicate_object THEN NULL; WHEN others THEN RAISE NOTICE 'Realtime attachments ignore: %', sqlerrm;
    END;
    BEGIN
      ALTER TABLE public.happyad_msg_attachments REPLICA IDENTITY FULL;
    EXCEPTION WHEN others THEN RAISE NOTICE 'Replica attachments ignore: %', sqlerrm;
    END;
  END IF;
END $$;

-- 2) Fonction conversation complète V26
DROP FUNCTION IF EXISTS public.happyad_conversation_messages_v26_sync(text);

CREATE OR REPLACE FUNCTION public.happyad_conversation_messages_v26_sync(conv_id text)
RETURNS TABLE(
  id text,
  client_temp_id text,
  conversation_id text,
  sender_id text,
  receiver_id text,
  body text,
  kind text,
  message_type text,
  created_at timestamptz,
  read_at timestamptz,
  is_read boolean,
  deleted_for_all boolean,
  storage_path text,
  bucket text,
  attachment_kind text,
  file_name text,
  mime_type text,
  attachment_id text,
  duration_ms integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  me text := auth.uid()::text;
  t text;
  ok boolean := false;
BEGIN
  IF me IS NULL OR conv_id IS NULL OR btrim(conv_id) = '' THEN RETURN; END IF;

  CREATE TEMP TABLE IF NOT EXISTS pg_temp.ha_v26_thread(
    id text, client_temp_id text, conversation_id text, sender_id text, receiver_id text,
    body text, kind text, message_type text, created_at timestamptz, read_at timestamptz,
    is_read boolean, deleted_for_all boolean, storage_path text, bucket text, attachment_kind text,
    file_name text, mime_type text, attachment_id text, duration_ms integer
  ) ON COMMIT DROP;
  TRUNCATE TABLE pg_temp.ha_v26_thread;

  FOREACH t IN ARRAY ARRAY['happyad_msg_messages','happyad_messages_box'] LOOP
    IF to_regclass('public.' || t) IS NULL THEN CONTINUE; END IF;
    BEGIN
      EXECUTE format($q$
        INSERT INTO pg_temp.ha_v26_thread
        SELECT
          coalesce(j->>'id', j->>'message_id', j->>'client_temp_id', md5(j::text)),
          coalesce(j->>'client_temp_id', j->>'clientTempId', ''),
          coalesce(j->>'conversation_id', j->>'conversationId', ''),
          coalesce(j->>'sender_id', j->>'from_user', j->>'from', j->>'user_a', ''),
          coalesce(j->>'receiver_id', j->>'to_user', j->>'to', j->>'user_b', ''),
          coalesce(j->>'body', j->>'message_body', j->>'text', j->>'caption', j->'file_meta'->>'caption', ''),
          coalesce(j->>'attachment_kind', j->>'message_type', j->>'kind', j->>'type', j->'file_meta'->>'attachment_kind', j->'file_meta'->>'kind', 'text'),
          coalesce(j->>'attachment_kind', j->>'message_type', j->>'kind', j->>'type', j->'file_meta'->>'attachment_kind', j->'file_meta'->>'kind', 'text'),
          coalesce(nullif(j->>'created_at',''), nullif(j->>'inserted_at',''), nullif(j->>'at',''), now()::text)::timestamptz,
          nullif(coalesce(j->>'read_at', j->>'readAt', j->>'seen_at', j->>'seenAt', ''),'')::timestamptz,
          lower(coalesce(j->>'is_read', j->>'isRead', j->>'read', j->>'seen', 'false')) IN ('true','t','1','yes'),
          lower(coalesce(j->>'deleted_for_all', 'false')) IN ('true','t','1','yes'),
          coalesce(j->>'storage_path', j->>'file_path', j->>'path', j->>'public_url', j->'file_meta'->>'storage_path', j->'file_meta'->>'path', ''),
          coalesce(j->>'bucket', j->>'storage_bucket', j->'file_meta'->>'bucket', 'happyad-message-files'),
          coalesce(j->>'attachment_kind', j->>'kind_attachment', j->'file_meta'->>'attachment_kind', j->'file_meta'->>'kind', j->>'message_type', j->>'kind', 'text'),
          coalesce(j->>'file_name', j->>'filename', j->>'name', j->'file_meta'->>'file_name', ''),
          coalesce(j->>'mime_type', j->>'mimetype', j->>'content_type', j->'file_meta'->>'mime_type', ''),
          coalesce(j->>'attachment_id', j->>'file_id', j->'file_meta'->>'attachment_id', ''),
          CASE WHEN coalesce(j->>'duration_ms', j->>'durationMs', j->'file_meta'->>'duration_ms', '') ~ '^[0-9]+$'
               THEN coalesce(j->>'duration_ms', j->>'durationMs', j->'file_meta'->>'duration_ms')::integer ELSE NULL END
        FROM (SELECT to_jsonb(x) j FROM public.%I x) s
        WHERE coalesce(j->>'conversation_id', j->>'conversationId', '') = $1
      $q$, t) USING conv_id;
    EXCEPTION WHEN others THEN RAISE NOTICE 'V26 thread table % ignore: %', t, sqlerrm;
    END;
  END LOOP;

  IF to_regclass('public.happyad_msg_attachments') IS NOT NULL THEN
    BEGIN
      EXECUTE $q$
        INSERT INTO pg_temp.ha_v26_thread
        SELECT
          coalesce(j->>'message_id', j->>'msg_id', j->>'id', j->>'client_temp_id', md5(j::text)),
          coalesce(j->>'client_temp_id', j->>'clientTempId', ''),
          coalesce(j->>'conversation_id', j->>'conversationId', ''),
          coalesce(j->>'sender_id', j->>'from_user', j->>'from', ''),
          coalesce(j->>'receiver_id', j->>'to_user', j->>'to', ''),
          coalesce(j->>'caption',''),
          coalesce(j->>'attachment_kind', j->>'kind', j->>'type', CASE WHEN coalesce(j->>'mime_type', j->>'content_type', '') LIKE 'audio/%' THEN 'audio' ELSE 'file' END),
          coalesce(j->>'attachment_kind', j->>'kind', j->>'type', CASE WHEN coalesce(j->>'mime_type', j->>'content_type', '') LIKE 'audio/%' THEN 'audio' ELSE 'file' END),
          coalesce(nullif(j->>'created_at',''), nullif(j->>'inserted_at',''), nullif(j->>'at',''), now()::text)::timestamptz,
          NULL::timestamptz, false, false,
          coalesce(j->>'storage_path', j->>'file_path', j->>'path', j->>'public_url', ''),
          coalesce(j->>'bucket', j->>'storage_bucket', 'happyad-message-files'),
          coalesce(j->>'attachment_kind', j->>'kind', j->>'type', CASE WHEN coalesce(j->>'mime_type', j->>'content_type', '') LIKE 'audio/%' THEN 'audio' ELSE 'file' END),
          coalesce(j->>'file_name', j->>'filename', j->>'name', ''),
          coalesce(j->>'mime_type', j->>'mimetype', j->>'content_type', ''),
          coalesce(j->>'id', j->>'attachment_id', j->>'file_id', ''),
          CASE WHEN coalesce(j->>'duration_ms', j->>'durationMs', '') ~ '^[0-9]+$' THEN coalesce(j->>'duration_ms', j->>'durationMs')::integer ELSE NULL END
        FROM (SELECT to_jsonb(x) j FROM public.happyad_msg_attachments x) s
        WHERE coalesce(j->>'conversation_id', j->>'conversationId', '') = $1
      $q$ USING conv_id;
    EXCEPTION WHEN others THEN RAISE NOTICE 'V26 attachments ignore: %', sqlerrm;
    END;
  END IF;

  SELECT EXISTS(SELECT 1 FROM pg_temp.ha_v26_thread WHERE conversation_id = conv_id AND (sender_id = me OR receiver_id = me)) INTO ok;
  IF NOT ok THEN RETURN; END IF;

  RETURN QUERY
  WITH one AS (
    SELECT DISTINCT ON (coalesce(nullif(m.id,''), nullif(m.client_temp_id,''), md5(concat_ws('|',m.conversation_id,m.sender_id,m.receiver_id,m.created_at::text,m.body,m.storage_path))))
      m.id, m.client_temp_id, m.conversation_id, m.sender_id, m.receiver_id, m.body,
      m.kind, m.message_type, m.created_at, m.read_at, m.is_read, m.deleted_for_all,
      m.storage_path, m.bucket, m.attachment_kind, m.file_name, m.mime_type, m.attachment_id, m.duration_ms
    FROM pg_temp.ha_v26_thread m
    WHERE m.conversation_id = conv_id AND coalesce(m.deleted_for_all,false) IS FALSE
    ORDER BY coalesce(nullif(m.id,''), nullif(m.client_temp_id,''), md5(concat_ws('|',m.conversation_id,m.sender_id,m.receiver_id,m.created_at::text,m.body,m.storage_path))), m.created_at ASC
  )
  SELECT * FROM one ORDER BY created_at ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.happyad_conversation_messages_v26_sync(text) TO authenticated;

-- 3) Liste conversations V26, triée serveur: non lus d'abord puis dernier message.
DROP FUNCTION IF EXISTS public.happyad_my_conversations_v26_sync();

CREATE OR REPLACE FUNCTION public.happyad_my_conversations_v26_sync()
RETURNS TABLE(
  conversation_id text,
  other_user_id text,
  other_name text,
  other_username text,
  other_avatar text,
  other_badge text,
  last_message_body text,
  last_message_kind text,
  last_message_at timestamptz,
  unread_count integer,
  last_sender_id text,
  last_receiver_id text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  me text := auth.uid()::text;
  t text;
BEGIN
  IF me IS NULL THEN RETURN; END IF;

  CREATE TEMP TABLE IF NOT EXISTS pg_temp.ha_v26_inbox(
    id text, conversation_id text, sender_id text, receiver_id text, body text, kind text,
    created_at timestamptz, read_at timestamptz, is_read boolean, deleted_for_all boolean
  ) ON COMMIT DROP;
  TRUNCATE TABLE pg_temp.ha_v26_inbox;

  FOREACH t IN ARRAY ARRAY['happyad_msg_messages','happyad_messages_box'] LOOP
    IF to_regclass('public.' || t) IS NULL THEN CONTINUE; END IF;
    BEGIN
      EXECUTE format($q$
        INSERT INTO pg_temp.ha_v26_inbox
        SELECT
          coalesce(j->>'id', j->>'message_id', j->>'client_temp_id', md5(j::text)),
          coalesce(j->>'conversation_id', j->>'conversationId', ''),
          coalesce(j->>'sender_id', j->>'from_user', j->>'from', j->>'user_a', ''),
          coalesce(j->>'receiver_id', j->>'to_user', j->>'to', j->>'user_b', ''),
          coalesce(j->>'body', j->>'message_body', j->>'text', j->>'caption', j->'file_meta'->>'caption', ''),
          coalesce(j->>'attachment_kind', j->>'message_type', j->>'kind', j->>'type', j->'file_meta'->>'attachment_kind', j->'file_meta'->>'kind', 'text'),
          coalesce(nullif(j->>'created_at',''), nullif(j->>'inserted_at',''), nullif(j->>'at',''), now()::text)::timestamptz,
          nullif(coalesce(j->>'read_at', j->>'readAt', j->>'seen_at', j->>'seenAt', ''),'')::timestamptz,
          lower(coalesce(j->>'is_read', j->>'isRead', j->>'read', j->>'seen', 'false')) IN ('true','t','1','yes'),
          lower(coalesce(j->>'deleted_for_all', 'false')) IN ('true','t','1','yes')
        FROM (SELECT to_jsonb(x) j FROM public.%I x) s
        WHERE (coalesce(j->>'sender_id', j->>'from_user', j->>'from', j->>'user_a', '') = $1
            OR coalesce(j->>'receiver_id', j->>'to_user', j->>'to', j->>'user_b', '') = $1)
      $q$, t) USING me;
    EXCEPTION WHEN others THEN RAISE NOTICE 'V26 inbox table % ignore: %', t, sqlerrm;
    END;
  END LOOP;

  RETURN QUERY
  WITH clean AS (
    SELECT *, CASE WHEN sender_id = me THEN receiver_id ELSE sender_id END AS other_id
    FROM pg_temp.ha_v26_inbox
    WHERE conversation_id <> '' AND coalesce(deleted_for_all,false) IS FALSE
  ), ranked AS (
    SELECT c.*,
      row_number() OVER(PARTITION BY c.conversation_id ORDER BY c.created_at DESC, c.id DESC) AS rn,
      sum(CASE WHEN c.receiver_id = me AND coalesce(c.is_read,false) = false AND c.read_at IS NULL THEN 1 ELSE 0 END)
        OVER(PARTITION BY c.conversation_id) AS unread
    FROM clean c
  )
  SELECT
    r.conversation_id,
    r.other_id,
    'Utilisateur HAPPYAD'::text,
    ''::text,
    ''::text,
    ''::text,
    coalesce(nullif(r.body,''), CASE WHEN r.kind IN ('audio','voice') THEN 'Message vocal' WHEN r.kind IN ('photo','image') THEN 'Photo' WHEN r.kind = 'file' THEN 'Fichier' ELSE 'Message HappyAD' END)::text,
    coalesce(nullif(r.kind,''), 'text')::text,
    r.created_at,
    coalesce(r.unread,0)::integer,
    r.sender_id,
    r.receiver_id
  FROM ranked r
  WHERE r.rn = 1 AND coalesce(r.other_id,'') <> ''
  ORDER BY CASE WHEN coalesce(r.unread,0) > 0 THEN 0 ELSE 1 END, r.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.happyad_my_conversations_v26_sync() TO authenticated;
