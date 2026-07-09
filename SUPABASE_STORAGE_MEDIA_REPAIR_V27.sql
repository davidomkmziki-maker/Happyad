-- HAPPYAD V27 — Réparation ciblée publication / Storage média
-- À exécuter dans Supabase SQL Editor si la publication affiche :
-- "Storage upload: The database schema is invalid or incompatible."
-- Ce SQL ne touche PAS aux messages. Il vérifie/répare seulement les buckets et policies utilisés par la publication.

-- 1) Vérification minimale du service Storage Supabase
DO $$
BEGIN
  IF to_regclass('storage.buckets') IS NULL THEN
    RAISE EXCEPTION 'Schema Storage incomplet: table storage.buckets introuvable. Redémarre le projet Supabase puis contacte Supabase Support si ça reste bloqué.';
  END IF;
  IF to_regclass('storage.objects') IS NULL THEN
    RAISE EXCEPTION 'Schema Storage incomplet: table storage.objects introuvable. Redémarre le projet Supabase puis contacte Supabase Support si ça reste bloqué.';
  END IF;
END $$;

-- 2) Bucket principal des publications: photos, vidéos, avatars, boutique
INSERT INTO storage.buckets (id, name, public)
VALUES ('happyad-media', 'happyad-media', true)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    public = true;

-- 3) Bucket fichiers/messages: vocaux et pièces jointes DM
INSERT INTO storage.buckets (id, name, public)
VALUES ('happyad-message-files', 'happyad-message-files', false)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    public = false;

-- 4) Policies propres pour happyad-media
DO $$
BEGIN
  IF to_regclass('storage.objects') IS NOT NULL THEN
    BEGIN
      DROP POLICY IF EXISTS "happyad_media_public_select_v27" ON storage.objects;
      CREATE POLICY "happyad_media_public_select_v27"
      ON storage.objects FOR SELECT TO public
      USING (bucket_id = 'happyad-media');
    EXCEPTION WHEN others THEN RAISE NOTICE 'Policy select happyad-media ignorée: %', sqlerrm;
    END;

    BEGIN
      DROP POLICY IF EXISTS "happyad_media_auth_insert_v27" ON storage.objects;
      CREATE POLICY "happyad_media_auth_insert_v27"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'happyad-media' AND auth.uid() IS NOT NULL);
    EXCEPTION WHEN others THEN RAISE NOTICE 'Policy insert happyad-media ignorée: %', sqlerrm;
    END;

    BEGIN
      DROP POLICY IF EXISTS "happyad_media_auth_update_v27" ON storage.objects;
      CREATE POLICY "happyad_media_auth_update_v27"
      ON storage.objects FOR UPDATE TO authenticated
      USING (bucket_id = 'happyad-media' AND auth.uid() IS NOT NULL)
      WITH CHECK (bucket_id = 'happyad-media' AND auth.uid() IS NOT NULL);
    EXCEPTION WHEN others THEN RAISE NOTICE 'Policy update happyad-media ignorée: %', sqlerrm;
    END;

    BEGIN
      DROP POLICY IF EXISTS "happyad_media_auth_delete_v27" ON storage.objects;
      CREATE POLICY "happyad_media_auth_delete_v27"
      ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'happyad-media' AND auth.uid() IS NOT NULL);
    EXCEPTION WHEN others THEN RAISE NOTICE 'Policy delete happyad-media ignorée: %', sqlerrm;
    END;
  END IF;
END $$;

-- 5) Policies propres pour happyad-message-files
DO $$
BEGIN
  IF to_regclass('storage.objects') IS NOT NULL THEN
    BEGIN
      DROP POLICY IF EXISTS "happyad_message_files_select_v27" ON storage.objects;
      CREATE POLICY "happyad_message_files_select_v27"
      ON storage.objects FOR SELECT TO authenticated
      USING (bucket_id = 'happyad-message-files');
    EXCEPTION WHEN others THEN RAISE NOTICE 'Policy select message-files ignorée: %', sqlerrm;
    END;

    BEGIN
      DROP POLICY IF EXISTS "happyad_message_files_insert_v27" ON storage.objects;
      CREATE POLICY "happyad_message_files_insert_v27"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'happyad-message-files' AND auth.uid() IS NOT NULL);
    EXCEPTION WHEN others THEN RAISE NOTICE 'Policy insert message-files ignorée: %', sqlerrm;
    END;
  END IF;
END $$;

-- 6) Diagnostic visible après exécution
SELECT
  id,
  name,
  public,
  created_at,
  updated_at
FROM storage.buckets
WHERE id IN ('happyad-media', 'happyad-message-files')
ORDER BY id;
