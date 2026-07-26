-- HAPPYAD V38E3 — Déduplication sûre des notifications Push réelles.
-- Exécuter après SUPABASE_HAPPYAD_PUSH_PHASE38E1.sql.
-- Ne modifie aucune table Messages existante.

create table if not exists public.happyad_push_deliveries (
  event_type text not null,
  event_id uuid not null,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','sent','failed','no_subscription')),
  attempts integer not null default 0,
  sent_at timestamptz,
  last_attempt_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (event_type,event_id,recipient_id)
);

create index if not exists happyad_push_deliveries_recipient_idx
  on public.happyad_push_deliveries(recipient_id,created_at desc);

create index if not exists happyad_push_deliveries_status_idx
  on public.happyad_push_deliveries(status,last_attempt_at);

alter table public.happyad_push_deliveries enable row level security;
revoke all on table public.happyad_push_deliveries from anon;
revoke all on table public.happyad_push_deliveries from authenticated;
grant select,insert,update,delete on table public.happyad_push_deliveries to service_role;

comment on table public.happyad_push_deliveries is
  'Déduplication serveur des Push HAPPYAD. Aucun corps de message ni média n’est stocké.';
