-- HAPPYAD V28 — Storage deep repair + diagnostic
-- Version nettoyée : publication happyad-media uniquement. Ne touche pas à Messages.

DO $$
BEGIN
  IF to_regclass('storage.buckets') IS NULL THEN
    RAISE EXCEPTION 'Storage cassé: table storage.buckets introuvable';
  END IF;
  IF to_regclass('storage.objects') IS NULL THEN
    RAISE EXCEPTION 'Storage cassé: table storage.objects introuvable';
  END IF;
END $$;

INSERT INTO storage.buckets (id, name, public)
VALUES ('happyad-media', 'happyad-media', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, public = true;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='storage' AND table_name='buckets' AND column_name='file_size_limit'
  ) THEN
    EXECUTE 'UPDATE storage.buckets SET file_size_limit = NULL WHERE id = ''happyad-media''';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='storage' AND table_name='buckets' AND column_name='allowed_mime_types'
  ) THEN
    EXECUTE 'UPDATE storage.buckets SET allowed_mime_types = NULL WHERE id = ''happyad-media''';
  END IF;
END $$;

GRANT USAGE ON SCHEMA storage TO anon, authenticated, service_role;
GRANT SELECT ON storage.buckets TO anon, authenticated, service_role;
GRANT SELECT ON storage.objects TO anon, authenticated, service_role;
GRANT INSERT, UPDATE, DELETE ON storage.objects TO authenticated, service_role;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE p record;
BEGIN
  FOR p IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects'
      AND (
        policyname ILIKE '%happyad_media%'
        OR coalesce(qual,'') ILIKE '%happyad-media%'
        OR coalesce(with_check,'') ILIKE '%happyad-media%'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', p.policyname);
  END LOOP;
END $$;

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

NOTIFY pgrst, 'reload schema';
SELECT pg_notify('pgrst', 'reload schema');

SELECT 'BUCKETS' AS section, to_jsonb(b) AS data
FROM storage.buckets b
WHERE id='happyad-media';

SELECT 'POLICIES' AS section, policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname='storage' AND tablename='objects'
  AND policyname ILIKE '%happyad_media%'
ORDER BY policyname;
