-- HAPPYAD ADMIN V32 — Sponsored publication + Radar fixe DB fallback
-- Objectif: si Supabase Storage refuse l'upload image, Admin sauvegarde l'image fixe dans public.happyad_admin_radar_fixed.
-- Le site public V32 lit cette table en priorité, puis garde l'ancien Storage seulement en compatibilité.

-- 1) Colonnes sponsorisées dans happyad_posts, si la table existe.
DO $$
BEGIN
  IF to_regclass('public.happyad_posts') IS NULL THEN
    RAISE NOTICE 'Table public.happyad_posts introuvable: les colonnes sponsor ne sont pas ajoutées.';
  ELSE
    ALTER TABLE public.happyad_posts ADD COLUMN IF NOT EXISTS is_sponsored boolean DEFAULT false;
    ALTER TABLE public.happyad_posts ADD COLUMN IF NOT EXISTS sponsor_status text DEFAULT '';
    ALTER TABLE public.happyad_posts ADD COLUMN IF NOT EXISTS sponsored_at timestamptz;
    ALTER TABLE public.happyad_posts ADD COLUMN IF NOT EXISTS sponsor_started_at timestamptz;
    ALTER TABLE public.happyad_posts ADD COLUMN IF NOT EXISTS sponsor_ends_at timestamptz;
    ALTER TABLE public.happyad_posts ADD COLUMN IF NOT EXISTS sponsor_country text DEFAULT '';
    ALTER TABLE public.happyad_posts ADD COLUMN IF NOT EXISTS sponsor_level text DEFAULT '';
    ALTER TABLE public.happyad_posts ADD COLUMN IF NOT EXISTS sponsor_plan text DEFAULT '';
    ALTER TABLE public.happyad_posts ADD COLUMN IF NOT EXISTS sponsor_crystals bigint DEFAULT 0;
    ALTER TABLE public.happyad_posts ADD COLUMN IF NOT EXISTS sponsor_admin_id uuid;
  END IF;
END $$;

-- 2) Table centrale des campagnes sponsorisées Admin.
CREATE TABLE IF NOT EXISTS public.happyad_sponsor_campaigns (
  id text PRIMARY KEY,
  post_id text NOT NULL,
  creator_id text DEFAULT '',
  title text DEFAULT '',
  status text DEFAULT 'pending',
  country text DEFAULT '',
  visibility_level text DEFAULT '',
  duration_label text DEFAULT '',
  plan text DEFAULT '',
  crystals bigint DEFAULT 0,
  started_at timestamptz,
  ends_at timestamptz,
  approved_at timestamptz,
  media_url text DEFAULT '',
  admin_note text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS happyad_sponsor_campaigns_post_idx ON public.happyad_sponsor_campaigns(post_id);
CREATE INDEX IF NOT EXISTS happyad_sponsor_campaigns_status_idx ON public.happyad_sponsor_campaigns(status);
CREATE INDEX IF NOT EXISTS happyad_sponsor_campaigns_active_idx ON public.happyad_sponsor_campaigns(status, ends_at);

-- 3) Table des admins autorisés.
CREATE TABLE IF NOT EXISTS public.happyad_admin_users (
  user_id text PRIMARY KEY,
  role text DEFAULT 'OWNER',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4) Fonction admin robuste: ne suppose pas que profiles.admin_role existe.
CREATE OR REPLACE FUNCTION public.happyad_admin_is_allowed()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_uid text := auth.uid()::text;
  v_row jsonb;
  v_tbl text;
  v_role text;
  v_status text;
  v_is_admin text;
BEGIN
  IF v_uid IS NULL OR v_uid = '' THEN
    RETURN false;
  END IF;

  IF to_regclass('public.happyad_admin_users') IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.happyad_admin_users a
      WHERE a.user_id = v_uid
        AND coalesce(a.is_active, true) = true
        AND upper(coalesce(a.role, '')) IN ('OWNER','ADMIN','SUPERADMIN','MODERATOR','FINANCE','SPONSOR')
    ) THEN
      RETURN true;
    END IF;
  END IF;

  FOREACH v_tbl IN ARRAY ARRAY['public.profiles','public.happyad_profiles','public.users','public.happyad_users'] LOOP
    IF to_regclass(v_tbl) IS NOT NULL THEN
      EXECUTE format($q$
        SELECT to_jsonb(t)
        FROM %s t
        WHERE coalesce(to_jsonb(t)->>'id', '') = $1
           OR coalesce(to_jsonb(t)->>'user_id', '') = $1
           OR coalesce(to_jsonb(t)->>'uid', '') = $1
           OR coalesce(to_jsonb(t)->>'auth_id', '') = $1
        LIMIT 1
      $q$, v_tbl::regclass)
      INTO v_row
      USING v_uid;
      IF v_row IS NOT NULL THEN EXIT; END IF;
    END IF;
  END LOOP;

  IF v_row IS NULL THEN
    RETURN false;
  END IF;

  v_role := upper(trim(coalesce(
    v_row->>'admin_role',
    v_row->>'role',
    v_row->>'user_role',
    v_row->>'account_role',
    v_row->>'admin_type',
    v_row->>'type',
    ''
  )));

  v_status := lower(trim(coalesce(
    v_row->>'status',
    v_row->>'account_status',
    v_row->>'state',
    v_row->>'user_status',
    'actif'
  )));

  v_is_admin := lower(trim(coalesce(
    v_row->>'is_admin',
    v_row->>'admin',
    v_row->>'isAdmin',
    'false'
  )));

  IF v_status LIKE '%bloqu%'
     OR v_status LIKE '%suspend%'
     OR v_status IN ('banned','ban','blocked','disabled') THEN
    RETURN false;
  END IF;

  RETURN
    v_role IN ('OWNER','ADMIN','SUPERADMIN','MODERATOR','FINANCE','SPONSOR')
    OR v_is_admin IN ('true','1','yes','oui','on');
END;
$$;

GRANT EXECUTE ON FUNCTION public.happyad_admin_is_allowed() TO authenticated;
GRANT SELECT ON public.happyad_admin_users TO authenticated;
GRANT SELECT ON public.happyad_sponsor_campaigns TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.happyad_sponsor_campaigns TO authenticated;

DO $$
BEGIN
  IF to_regclass('public.happyad_posts') IS NOT NULL THEN
    GRANT SELECT ON public.happyad_posts TO anon, authenticated;
    GRANT UPDATE (
      is_sponsored,
      sponsor_status,
      sponsored_at,
      sponsor_started_at,
      sponsor_ends_at,
      sponsor_country,
      sponsor_level,
      sponsor_plan,
      sponsor_crystals,
      sponsor_admin_id
    ) ON public.happyad_posts TO authenticated;
  END IF;
END $$;

-- 5) RLS + policies pour la table campagnes.
ALTER TABLE public.happyad_sponsor_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "happyad sponsor public read approved" ON public.happyad_sponsor_campaigns;
CREATE POLICY "happyad sponsor public read approved"
ON public.happyad_sponsor_campaigns
FOR SELECT
TO anon, authenticated
USING (
  status IN ('approved','Approuvé','Approuve','Approuvé / Actif','active','Actif')
  AND (ends_at IS NULL OR ends_at > now())
);

DROP POLICY IF EXISTS "happyad sponsor admin read all" ON public.happyad_sponsor_campaigns;
CREATE POLICY "happyad sponsor admin read all"
ON public.happyad_sponsor_campaigns
FOR SELECT
TO authenticated
USING (public.happyad_admin_is_allowed());

DROP POLICY IF EXISTS "happyad sponsor admin insert" ON public.happyad_sponsor_campaigns;
CREATE POLICY "happyad sponsor admin insert"
ON public.happyad_sponsor_campaigns
FOR INSERT
TO authenticated
WITH CHECK (public.happyad_admin_is_allowed());

DROP POLICY IF EXISTS "happyad sponsor admin update" ON public.happyad_sponsor_campaigns;
CREATE POLICY "happyad sponsor admin update"
ON public.happyad_sponsor_campaigns
FOR UPDATE
TO authenticated
USING (public.happyad_admin_is_allowed())
WITH CHECK (public.happyad_admin_is_allowed());

DROP POLICY IF EXISTS "happyad sponsor admin delete" ON public.happyad_sponsor_campaigns;
CREATE POLICY "happyad sponsor admin delete"
ON public.happyad_sponsor_campaigns
FOR DELETE
TO authenticated
USING (public.happyad_admin_is_allowed());

-- 6) Policies sponsor sur happyad_posts si RLS bloque l'Admin.
DO $$
BEGIN
  IF to_regclass('public.happyad_posts') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.happyad_posts ENABLE ROW LEVEL SECURITY';

    EXECUTE 'DROP POLICY IF EXISTS "happyad admin read posts for sponsor" ON public.happyad_posts';
    EXECUTE 'CREATE POLICY "happyad admin read posts for sponsor"
      ON public.happyad_posts
      FOR SELECT
      TO authenticated
      USING (public.happyad_admin_is_allowed())';

    EXECUTE 'DROP POLICY IF EXISTS "happyad admin update sponsored fields" ON public.happyad_posts';
    EXECUTE 'CREATE POLICY "happyad admin update sponsored fields"
      ON public.happyad_posts
      FOR UPDATE
      TO authenticated
      USING (public.happyad_admin_is_allowed())
      WITH CHECK (public.happyad_admin_is_allowed())';
  END IF;
END $$;

-- 7) Bucket gardé pour compatibilité, mais V32 ne dépend plus de Storage pour l'image fixe.
DO $$
BEGIN
  IF to_regclass('storage.buckets') IS NOT NULL THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('happyad-media', 'happyad-media', true)
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, public = true;
  ELSE
    RAISE NOTICE 'storage.buckets introuvable: vérifier Supabase Storage.';
  END IF;
END $$;

-- 8) Nouvelle table DB fallback pour Image fixe Radar / publicité accueil.
CREATE TABLE IF NOT EXISTS public.happyad_admin_radar_fixed (
  id text PRIMARY KEY DEFAULT 'main',
  active boolean DEFAULT false,
  type text DEFAULT 'fixed_image',
  image_path text DEFAULT '',
  image_url text DEFAULT '',
  version bigint DEFAULT 0,
  updated_by text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

INSERT INTO public.happyad_admin_radar_fixed (id, active, type, image_path, image_url, version, updated_by, updated_at)
VALUES ('main', false, 'fixed_image', '', '', 0, '', now())
ON CONFLICT (id) DO NOTHING;

GRANT SELECT ON public.happyad_admin_radar_fixed TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.happyad_admin_radar_fixed TO authenticated;

ALTER TABLE public.happyad_admin_radar_fixed ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "happyad radar fixed public read" ON public.happyad_admin_radar_fixed;
CREATE POLICY "happyad radar fixed public read"
ON public.happyad_admin_radar_fixed
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "happyad radar fixed admin insert" ON public.happyad_admin_radar_fixed;
CREATE POLICY "happyad radar fixed admin insert"
ON public.happyad_admin_radar_fixed
FOR INSERT
TO authenticated
WITH CHECK (public.happyad_admin_is_allowed());

DROP POLICY IF EXISTS "happyad radar fixed admin update" ON public.happyad_admin_radar_fixed;
CREATE POLICY "happyad radar fixed admin update"
ON public.happyad_admin_radar_fixed
FOR UPDATE
TO authenticated
USING (public.happyad_admin_is_allowed())
WITH CHECK (public.happyad_admin_is_allowed());

DROP POLICY IF EXISTS "happyad radar fixed admin delete" ON public.happyad_admin_radar_fixed;
CREATE POLICY "happyad radar fixed admin delete"
ON public.happyad_admin_radar_fixed
FOR DELETE
TO authenticated
USING (public.happyad_admin_is_allowed());

SELECT pg_notify('pgrst', 'reload schema') AS pgrst_reload;

-- 9) Diagnostic visible après exécution.
SELECT 'SPONSOR_COLUMNS' AS section, column_name, data_type
FROM information_schema.columns
WHERE table_schema='public'
  AND table_name='happyad_posts'
  AND (column_name ILIKE 'sponsor%' OR column_name='is_sponsored')
ORDER BY column_name;

SELECT 'SPONSOR_TABLE' AS section, table_name
FROM information_schema.tables
WHERE table_schema='public'
  AND table_name='happyad_sponsor_campaigns';

SELECT 'ADMIN_ROLE_COLUMNS_FOUND' AS section, table_name, column_name
FROM information_schema.columns
WHERE table_schema='public'
  AND table_name IN ('profiles','happyad_profiles','users','happyad_users')
  AND column_name IN ('admin_role','role','user_role','account_role','admin_type','type','is_admin','admin','isAdmin','status','account_status')
ORDER BY table_name, column_name;

SELECT 'RADAR_FIXED_DB_TABLE' AS section, id, active, type, length(image_url) AS image_chars, version
FROM public.happyad_admin_radar_fixed
WHERE id='main';

SELECT 'SPONSOR_BUCKET_COMPAT' AS section, id, name, public
FROM storage.buckets
WHERE id='happyad-media';
