-- HAPPYAD V27 — Réparation ciblée publication / Storage média
-- Version nettoyée : aucune table, aucun bucket et aucune policy Messages.

DO $$
BEGIN
  IF to_regclass('storage.buckets') IS NULL THEN
    RAISE EXCEPTION 'Schema Storage incomplet: table storage.buckets introuvable.';
  END IF;
  IF to_regclass('storage.objects') IS NULL THEN
    RAISE EXCEPTION 'Schema Storage incomplet: table storage.objects introuvable.';
  END IF;
END $$;

INSERT INTO storage.buckets (id, name, public)
VALUES ('happyad-media', 'happyad-media', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, public = true;

DO $$
BEGIN
  IF to_regclass('storage.objects') IS NOT NULL THEN
    DROP POLICY IF EXISTS "happyad_media_public_select_v27" ON storage.objects;
    CREATE POLICY "happyad_media_public_select_v27"
      ON storage.objects FOR SELECT TO public
      USING (bucket_id = 'happyad-media');

    DROP POLICY IF EXISTS "happyad_media_auth_insert_v27" ON storage.objects;
    CREATE POLICY "happyad_media_auth_insert_v27"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'happyad-media' AND auth.uid() IS NOT NULL);

    DROP POLICY IF EXISTS "happyad_media_auth_update_v27" ON storage.objects;
    CREATE POLICY "happyad_media_auth_update_v27"
      ON storage.objects FOR UPDATE TO authenticated
      USING (bucket_id = 'happyad-media' AND auth.uid() IS NOT NULL)
      WITH CHECK (bucket_id = 'happyad-media' AND auth.uid() IS NOT NULL);

    DROP POLICY IF EXISTS "happyad_media_auth_delete_v27" ON storage.objects;
    CREATE POLICY "happyad_media_auth_delete_v27"
      ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'happyad-media' AND auth.uid() IS NOT NULL);
  END IF;
END $$;

SELECT id,name,public,created_at,updated_at
FROM storage.buckets
WHERE id='happyad-media';
