-- HAPPYAD V28 — Storage deep repair + diagnostic
-- À exécuter après V27 si l'upload affiche encore :
-- "The database schema is invalid or incompatible"
-- Ce fichier ne touche pas aux tables messages/posts. Il répare seulement les droits/policies Storage.

-- 1) Vérification Storage de base
DO $$
BEGIN
  IF to_regclass('storage.buckets') IS NULL THEN
    RAISE EXCEPTION 'Storage cassé: table storage.buckets introuvable';
  END IF;
  IF to_regclass('storage.objects') IS NULL THEN
    RAISE EXCEPTION 'Storage cassé: table storage.objects introuvable';
  END IF;
END $$;

-- 2) Buckets HAPPYAD
INSERT INTO storage.buckets (id, name, public)
VALUES ('happyad-media', 'happyad-media', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('happyad-message-files', 'happyad-message-files', false)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, public = false;

-- 3) Nettoyage paramètres optionnels du bucket média si ces colonnes existent
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='storage' AND table_name='buckets' AND column_name='file_size_limit'
  ) THEN
    EXECUTE 'UPDATE storage.buckets SET file_size_limit = NULL WHERE id IN (''happyad-media'',''happyad-message-files'')';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='storage' AND table_name='buckets' AND column_name='allowed_mime_types'
  ) THEN
    EXECUTE 'UPDATE storage.buckets SET allowed_mime_types = NULL WHERE id IN (''happyad-media'',''happyad-message-files'')';
  END IF;
END $$;

-- 4) Droits nécessaires au Storage API
GRANT USAGE ON SCHEMA storage TO anon, authenticated, service_role;
GRANT SELECT ON storage.buckets TO anon, authenticated, service_role;
GRANT SELECT ON storage.objects TO anon, authenticated, service_role;
GRANT INSERT, UPDATE, DELETE ON storage.objects TO authenticated, service_role;

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 5) Supprimer les anciennes policies HAPPYAD qui peuvent se contredire
DO $$
DECLARE p record;
BEGIN
  FOR p IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname='storage'
      AND tablename='objects'
      AND (
        policyname ILIKE '%happyad%'
        OR coalesce(qual,'') ILIKE '%happyad-media%'
        OR coalesce(with_check,'') ILIKE '%happyad-media%'
        OR coalesce(qual,'') ILIKE '%happyad-message-files%'
        OR coalesce(with_check,'') ILIKE '%happyad-message-files%'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', p.policyname);
  END LOOP;
END $$;

-- 6) Policies simples et compatibles
CREATE POLICY "happyad_media_public_read_v28"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'happyad-media');

CREATE POLICY "happyad_media_auth_insert_v28"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'happyad-media');

CREATE POLICY "happyad_media_auth_update_v28"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'happyad-media')
WITH CHECK (bucket_id = 'happyad-media');

CREATE POLICY "happyad_media_auth_delete_v28"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'happyad-media');

CREATE POLICY "happyad_message_files_auth_read_v28"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'happyad-message-files');

CREATE POLICY "happyad_message_files_auth_insert_v28"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'happyad-message-files');

CREATE POLICY "happyad_message_files_auth_update_v28"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'happyad-message-files')
WITH CHECK (bucket_id = 'happyad-message-files');

-- 7) Force reload cache API
NOTIFY pgrst, 'reload schema';
SELECT pg_notify('pgrst', 'reload schema');

-- 8) Diagnostic visible : il faut voir les buckets + policies V28
SELECT 'BUCKETS' AS section, to_jsonb(b) AS data
FROM storage.buckets b
WHERE id IN ('happyad-media','happyad-message-files')
ORDER BY id;

SELECT 'POLICIES' AS section, policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname='storage'
  AND tablename='objects'
  AND policyname ILIKE '%happyad%'
ORDER BY policyname;

SELECT 'STORAGE_TABLES' AS section, table_name
FROM information_schema.tables
WHERE table_schema='storage'
ORDER BY table_name;
