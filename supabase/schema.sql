-- ============================================================
-- Smartara CRM — Database Schema
-- Run this once in Supabase SQL Editor (Project → SQL Editor → New query)
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
  source text not null default 'Other'
    check (source in ('WhatsApp Referral','LinkedIn','Website','Cold Outreach','Referral','Upwork/Fiverr','Other')),
  region text not null default 'gambia' check (region in ('gambia','international')),
  currency text not null default 'GMD' check (currency in ('GMD','USD')),
  estimated_value numeric(12,2) default 0,
  product_interest text default 'Client Services'
    check (product_interest in ('Blueprint','Prospect','Content OS','Client Services','Custom Build')),
  stage text not null default 'new'
    check (stage in ('new','contacted','qualified','proposal_sent','negotiation','won','lost')),
  assigned_to text not null default 'Muhammed' check (assigned_to in ('Muhammed','Rohey')),
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
  region text not null default 'gambia' check (region in ('gambia','international')),
  status text not null default 'active' check (status in ('active','paused','completed','churned')),
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
  product text not null default 'Client Services'
    check (product in ('Blueprint','Prospect','Content OS','Client Services','Custom Build')),
  status text not null default 'scoping'
    check (status in ('scoping','in_progress','review','delivered','on_hold')),
  value numeric(12,2) default 0,
  currency text not null default 'GMD' check (currency in ('GMD','USD')),
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
  related_type text not null check (related_type in ('lead','client','project')),
  related_id uuid not null,
  type text not null default 'note'
    check (type in ('call','email','whatsapp','meeting','note','stage_change')),
  content text not null,
  created_by text not null default 'Muhammed' check (created_by in ('Muhammed','Rohey')),
  created_at timestamptz not null default now()
);

create index if not exists idx_activities_related on activities (related_type, related_id, created_at desc);
create index if not exists idx_leads_stage on leads (stage);
create index if not exists idx_projects_client on projects (client_id);

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

create policy "authenticated full access" on leads
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated full access" on clients
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated full access" on projects
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated full access" on activities
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
