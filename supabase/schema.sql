-- Beacon Cover demo — Supabase schema
-- Run once in Supabase: SQL Editor -> New query -> paste all -> Run.
-- Safe to re-run: it only creates what doesn't exist yet.
--
-- Security: Row Level Security is ON for every table with NO policies, so
-- the public "anon" key can read nothing. Only the server (service_role
-- key, which bypasses RLS) can read or write. Never expose that key in the
-- browser; it lives only in Vercel's server environment variables.

-- Clients (the phone number is the login)
create table if not exists public.clients (
  id          text primary key,
  name        text not null default '',
  phone       text not null unique,
  email       text,
  id_number   text,
  created_at  timestamptz not null default now()
);

-- Applications (one per product application)
create table if not exists public.applications (
  ref           text primary key,                 -- e.g. BC-4821
  client_id     text not null references public.clients(id) on delete cascade,
  product       text not null check (product in ('motor', 'health', 'travel', 'business')),
  status        text not null check (status in (
                  'received', 'documents_checked', 'preparing_quotes',
                  'needs_info', 'quotes_ready', 'cover_chosen', 'covered')),
  step          integer not null default 0,       -- last completed flow step
  details       jsonb not null default '{}'::jsonb,
  documents     jsonb not null default '[]'::jsonb,
  submitted_at  timestamptz,                       -- null = still a draft
  updated_at    timestamptz not null default now(),
  created_at    timestamptz not null default now()
);
create index if not exists applications_client_idx on public.applications (client_id);

-- Quotes (fixture data in the demo; placeholder insurer names)
create table if not exists public.quotes (
  id               text primary key,
  application_ref  text not null references public.applications(ref) on delete cascade,
  insurer          text not null,
  cover_type       text not null,
  premium_kes      integer not null,
  excess_kes       integer,
  benefits         jsonb not null default '[]'::jsonb,
  chosen           boolean not null default false,
  created_at       timestamptz not null default now()
);
create index if not exists quotes_ref_idx on public.quotes (application_ref);

-- Conversation log per application
create table if not exists public.messages (
  id               text primary key,
  application_ref  text not null references public.applications(ref) on delete cascade,
  direction        text not null check (direction in ('in', 'out')),
  channel          text not null check (channel in ('email', 'whatsapp', 'sms')),
  body             text not null,
  read             boolean not null default false,
  created_at       timestamptz not null default now()
);
create index if not exists messages_ref_idx on public.messages (application_ref);

-- SIMULATED outbox: every message the system would have sent
create table if not exists public.outbox (
  id               text primary key,
  channel          text not null,
  recipient        text not null,
  audience         text not null check (audience in ('client', 'admin')),
  template         text not null,
  body             text not null,
  application_ref  text,
  created_at       timestamptz not null default now()
);

-- Uploaded file metadata (the file itself lives in the "documents" bucket)
create table if not exists public.files (
  id          text primary key,
  name        text not null,
  type        text not null,
  size        integer not null,
  path        text not null,
  created_at  timestamptz not null default now()
);

-- Change log: open pages poll this to refresh when something changes
create table if not exists public.changes (
  id          bigserial primary key,
  ref         text,                                -- null = affects everything (e.g. demo reset)
  created_at  timestamptz not null default now()
);
create index if not exists changes_ref_idx on public.changes (ref, id desc);

-- New application references: BC-5000, BC-5001, ...
create sequence if not exists public.application_ref_seq start 5000;
create or replace function public.next_application_ref()
returns bigint language sql as $$ select nextval('public.application_ref_seq') $$;

-- Lock everything down: RLS on, no policies (server-only access).
alter table public.clients      enable row level security;
alter table public.applications enable row level security;
alter table public.quotes       enable row level security;
alter table public.messages     enable row level security;
alter table public.outbox       enable row level security;
alter table public.files        enable row level security;
alter table public.changes      enable row level security;
revoke execute on function public.next_application_ref() from anon, authenticated;

-- Private storage bucket for logbooks, IDs, passports, certificates
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;
