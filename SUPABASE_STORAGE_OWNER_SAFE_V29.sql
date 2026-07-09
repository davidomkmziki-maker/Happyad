-- HAPPYAD V29 — Storage owner-safe diagnostic + role search_path repair
-- But: ce fichier NE modifie PAS storage.objects et NE crée PAS de policy.
-- Raison: si Supabase répond "must be owner of table objects", il faut éviter ALTER TABLE / CREATE POLICY / DROP POLICY sur storage.objects.

-- 1) Diagnostic rôle courant
SELECT
  'CURRENT_ROLE' AS section,
  current_user AS current_user,
  session_user AS session_user,
  current_setting('role', true) AS active_role;

-- 2) Diagnostic propriétaire des tables Storage
SELECT
  'STORAGE_OWNERS' AS section,
  n.nspname AS schema_name,
  c.relname AS table_name,
  pg_get_userbyid(c.relowner) AS table_owner,
  c.relrowsecurity AS rls_enabled,
  c.relforcerowsecurity AS rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'storage'
  AND c.relkind IN ('r','p')
  AND c.relname IN ('buckets','objects','migrations','s3_multipart_uploads','s3_multipart_uploads_parts')
ORDER BY c.relname;

-- 3) Vérifier les buckets HAPPYAD sans toucher aux objets Storage
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
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('happyad-message-files', 'happyad-message-files', false)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    public = false;

-- 4) Nettoyer les limites bucket si les colonnes existent
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

-- 5) Réparation douce du search_path des rôles API.
-- Si ton projet n'autorise pas ALTER ROLE, le script continue et affiche seulement une notice.
DO $$
BEGIN
  BEGIN
    EXECUTE 'ALTER ROLE anon SET search_path = public, storage, extensions';
    RAISE NOTICE 'OK: search_path anon réparé';
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'IGNORÉ: impossible ALTER ROLE anon: %', SQLERRM;
  END;

  BEGIN
    EXECUTE 'ALTER ROLE authenticated SET search_path = public, storage, extensions';
    RAISE NOTICE 'OK: search_path authenticated réparé';
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'IGNORÉ: impossible ALTER ROLE authenticated: %', SQLERRM;
  END;

  BEGIN
    EXECUTE 'ALTER ROLE service_role SET search_path = public, storage, extensions';
    RAISE NOTICE 'OK: search_path service_role réparé';
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'IGNORÉ: impossible ALTER ROLE service_role: %', SQLERRM;
  END;
END $$;

-- 6) Forcer le reload PostgREST
SELECT pg_notify('pgrst', 'reload schema') AS pgrst_reload;

-- 7) Diagnostic final visible
SELECT
  'BUCKETS' AS section,
  id,
  name,
  public,
  created_at,
  updated_at
FROM storage.buckets
WHERE id IN ('happyad-media','happyad-message-files')
ORDER BY id;

SELECT
  'ROLE_SETTINGS' AS section,
  r.rolname,
  unnest(coalesce(r.rolconfig, ARRAY[]::text[])) AS setting
FROM pg_roles r
WHERE r.rolname IN ('anon','authenticated','service_role')
ORDER BY r.rolname, setting;

SELECT
  'EXISTING_HAPPYAD_POLICIES' AS section,
  policyname,
  roles,
  cmd,
  qual,
  with_check
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
ORDER BY policyname;
