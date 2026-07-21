-- ============================================================
-- Smartara CRM — Database Schema
-- Run in Supabase SQL Editor (Project → SQL Editor → New query).
-- Safe to re-run any time (e.g. after pulling schema changes) — every
-- statement either checks existence first or drops-then-recreates, so
-- running this repeatedly always converges to the state defined below,
-- without touching existing data.
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- LEADS — top-of-funnel pipeline (WhatsApp referrals, LinkedIn, cold outreach, etc.)
-- ------------------------------------------------------------
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  email text,
  phone text,
  source text not null default 'Other',
  region text not null default 'gambia',
  currency text not null default 'GMD',
  estimated_value numeric(12,2) default 0,
  product_interest text default 'Client Services',
  stage text not null default 'new',
  assigned_to text not null default 'Muhammed',
  lost_reason text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- CLIENTS — converted leads / signed accounts
-- ------------------------------------------------------------
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  email text,
  phone text,
  region text not null default 'gambia',
  status text not null default 'active',
  converted_from_lead uuid references leads(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- PROJECTS — work delivered per client (can be more than one per client)
-- ------------------------------------------------------------
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  name text not null,
  product text not null default 'Client Services',
  status text not null default 'scoping',
  value numeric(12,2) default 0,
  currency text not null default 'GMD',
  start_date date,
  deadline date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- ACTIVITIES — shared timeline for leads, clients, and projects
-- ------------------------------------------------------------
create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  related_type text not null,
  related_id uuid not null,
  type text not null default 'note',
  content text not null,
  created_by text not null default 'Muhammed',
  created_at timestamptz not null default now()
);

create index if not exists idx_activities_related on activities (related_type, related_id, created_at desc);
create index if not exists idx_leads_stage on leads (stage);
create index if not exists idx_projects_client on projects (client_id);

-- ------------------------------------------------------------
-- ENUM-STYLE CHECK CONSTRAINTS
-- Named and re-applied on every run (drop-if-exists, then add) so this
-- file is the single source of truth for allowed values — editing a list
-- here and re-running updates the live constraint, no separate ALTER
-- statements needed.
-- ------------------------------------------------------------
alter table leads drop constraint if exists leads_source_check;
alter table leads add constraint leads_source_check
  check (source in ('WhatsApp Referral','LinkedIn','Website','Cold Outreach','Referral','Upwork/Fiverr','Other'));

alter table leads drop constraint if exists leads_region_check;
alter table leads add constraint leads_region_check
  check (region in ('gambia','morocco','international'));

alter table leads drop constraint if exists leads_currency_check;
alter table leads add constraint leads_currency_check
  check (currency in ('GMD','MAD','USD'));

alter table leads drop constraint if exists leads_product_interest_check;
alter table leads add constraint leads_product_interest_check
  check (product_interest in ('Blueprint','Prospect','Content OS','Client Services','Custom Build'));

alter table leads drop constraint if exists leads_stage_check;
alter table leads add constraint leads_stage_check
  check (stage in ('new','contacted','qualified','proposal_sent','negotiation','won','lost'));

alter table leads drop constraint if exists leads_assigned_to_check;
alter table leads add constraint leads_assigned_to_check
  check (assigned_to in ('Muhammed','Rohey'));

alter table clients drop constraint if exists clients_region_check;
alter table clients add constraint clients_region_check
  check (region in ('gambia','morocco','international'));

alter table clients drop constraint if exists clients_status_check;
alter table clients add constraint clients_status_check
  check (status in ('active','paused','completed','churned'));

alter table projects drop constraint if exists projects_product_check;
alter table projects add constraint projects_product_check
  check (product in ('Blueprint','Prospect','Content OS','Client Services','Custom Build'));

alter table projects drop constraint if exists projects_status_check;
alter table projects add constraint projects_status_check
  check (status in ('scoping','in_progress','review','delivered','on_hold'));

alter table projects drop constraint if exists projects_currency_check;
alter table projects add constraint projects_currency_check
  check (currency in ('GMD','MAD','USD'));

alter table activities drop constraint if exists activities_related_type_check;
alter table activities add constraint activities_related_type_check
  check (related_type in ('lead','client','project'));

alter table activities drop constraint if exists activities_type_check;
alter table activities add constraint activities_type_check
  check (type in ('call','email','whatsapp','meeting','note','stage_change'));

alter table activities drop constraint if exists activities_created_by_check;
alter table activities add constraint activities_created_by_check
  check (created_by in ('Muhammed','Rohey'));

-- ------------------------------------------------------------
-- updated_at auto-touch trigger
-- ------------------------------------------------------------
create or replace function touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_leads_updated_at on leads;
create trigger trg_leads_updated_at before update on leads
  for each row execute procedure touch_updated_at();

drop trigger if exists trg_clients_updated_at on clients;
create trigger trg_clients_updated_at before update on clients
  for each row execute procedure touch_updated_at();

drop trigger if exists trg_projects_updated_at on projects;
create trigger trg_projects_updated_at before update on projects
  for each row execute procedure touch_updated_at();

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY
-- This is a 2-person internal tool (Muhammed + Rohey). Any authenticated
-- Supabase user (i.e. anyone you've manually added in Auth → Users) gets
-- full read/write access. There is no public signup.
-- ------------------------------------------------------------
alter table leads enable row level security;
alter table clients enable row level security;
alter table projects enable row level security;
alter table activities enable row level security;

drop policy if exists "authenticated full access" on leads;
create policy "authenticated full access" on leads
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "authenticated full access" on clients;
create policy "authenticated full access" on clients
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "authenticated full access" on projects;
create policy "authenticated full access" on projects
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "authenticated full access" on activities;
create policy "authenticated full access" on activities
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
