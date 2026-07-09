-- HAPPYAD V25 — SQL court pour vrais messages vocaux + realtime
-- À exécuter seulement si les vocaux restent affichés comme texte ou si le realtime ne suit pas.

do $$
begin
  -- Bucket audio/fichiers messages
  if exists (select 1 from information_schema.schemata where schema_name = 'storage') then
    begin
      insert into storage.buckets (id, name, public)
      values ('happyad-message-files', 'happyad-message-files', false)
      on conflict (id) do nothing;
    exception when others then
      raise notice 'Bucket storage ignoré: %', sqlerrm;
    end;
  end if;
end $$;

-- Politiques storage simples pour utilisateurs connectés
do $$
begin
  if to_regclass('storage.objects') is not null then
    begin
      create policy "happyad_message_files_select_v25"
      on storage.objects for select to authenticated
      using (bucket_id = 'happyad-message-files');
    exception when duplicate_object then null; when others then raise notice 'Policy select ignorée: %', sqlerrm;
    end;

    begin
      create policy "happyad_message_files_insert_v25"
      on storage.objects for insert to authenticated
      with check (bucket_id = 'happyad-message-files');
    exception when duplicate_object then null; when others then raise notice 'Policy insert ignorée: %', sqlerrm;
    end;
  end if;
end $$;

-- Colonnes media sûres sur les tables messages existantes
do $$
declare
  t text;
begin
  foreach t in array array['happyad_msg_messages','happyad_messages_box'] loop
    if to_regclass('public.' || t) is null then
      continue;
    end if;

    execute format('alter table public.%I add column if not exists storage_path text', t);
    execute format('alter table public.%I add column if not exists bucket text default ''happyad-message-files''', t);
    execute format('alter table public.%I add column if not exists attachment_kind text', t);
    execute format('alter table public.%I add column if not exists file_name text', t);
    execute format('alter table public.%I add column if not exists mime_type text', t);
    execute format('alter table public.%I add column if not exists duration_ms integer', t);
    execute format('alter table public.%I add column if not exists size_bytes bigint', t);
    execute format('alter table public.%I add column if not exists file_meta jsonb default ''{}''::jsonb', t);
    execute format('alter table public.%I add column if not exists is_read boolean default false', t);
    execute format('alter table public.%I add column if not exists read_at timestamptz', t);

    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception when duplicate_object then null; when others then raise notice 'Realtime % ignoré: %', t, sqlerrm;
    end;

    begin
      execute format('alter table public.%I replica identity full', t);
    exception when others then raise notice 'Replica identity % ignoré: %', t, sqlerrm;
    end;

    begin
      execute format('create index if not exists %I on public.%I (conversation_id, created_at)', t || '_conv_created_v25_idx', t);
    exception when others then raise notice 'Index % ignoré: %', t, sqlerrm;
    end;
  end loop;

  if to_regclass('public.happyad_msg_attachments') is not null then
    begin
      alter publication supabase_realtime add table public.happyad_msg_attachments;
    exception when duplicate_object then null; when others then raise notice 'Realtime attachments ignoré: %', sqlerrm;
    end;

    begin
      alter table public.happyad_msg_attachments replica identity full;
    exception when others then raise notice 'Replica attachments ignoré: %', sqlerrm;
    end;
  end if;
end $$;
