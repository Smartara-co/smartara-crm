-- ============================================================
-- Import website contact-form submissions into leads.
-- Safe to re-run: skips any row where a lead with the same email
-- already exists.
--
-- NOTE: the `message` text below was copied from a truncated view
-- (columns cut off in the source table) — several notes end in "..."
-- and are incomplete. Re-export the contact_form table's `message`
-- column in full and swap the notes values below before relying on
-- this for outreach.
-- ============================================================

insert into leads (name, company, email, source, region, currency, product_interest, stage, assigned_to, notes, created_at)
select v.name, v.company, v.email, 'Website', 'gambia', 'GMD', 'Client Services', v.stage, 'Muhammed', v.notes, v.created_at
from (values
  ('Ebrima Bah',         'Elite Electronics',   'ebah3628@gmail.com',       'new',       'Elite Electronics is building a trusted electronics brand ...', timestamptz '2026-06-25 19:24:26.097883+00'),
  ('Ida tralia andrews', 'Zariya Maison',        'idatralia10@icloud.com',   'new',       'I want a website to promote Zariya Maison ...',                 timestamptz '2026-06-25 22:03:05.230474+00'),
  ('Anna Darboe',        'GG OnCall Supplies',   'annadarboe7@gmail.com',    'contacted', 'I want to build GG''s OnCall Supplies into a leading healt...',  timestamptz '2026-06-26 10:21:47.657825+00'),
  ('Mansour faye',       'Little strides',       'fayemansour794@gmail.com', 'contacted', 'Little strides business, I want my business to growth to ...',  timestamptz '2026-06-26 13:18:50.889516+00'),
  ('Ibrahim Njie',       'Open Space Events',    'njibrahim01@gmail.com',    'contacted', 'We want to expand and also look professional in our wo...',     timestamptz '2026-06-27 02:46:07.543537+00'),
  ('Abdoul Aziz Jallow',  null,                  'abdoulazizj376@gmail.com', 'contacted', 'I want to build a web-based staff on boarding portal for ...',  timestamptz '2026-06-27 19:10:58.373352+00'),
  ('Ndey Amie Boye',     'Adorns bu ndey',       'ndeyamieboye55@gmail.com', 'contacted', 'A website for my brand',                                        timestamptz '2026-06-27 19:29:34.566469+00')
) as v(name, company, email, stage, notes, created_at)
where not exists (
  select 1 from leads l where l.email = v.email
);

-- Log a "Lead created" activity for every row this script actually inserted
-- (matched by email + created_at so re-runs don't duplicate activities either).
insert into activities (related_type, related_id, type, content, created_by, created_at)
select 'lead', l.id, 'note', 'Lead created from website contact form', 'Muhammed', l.created_at
from leads l
where l.source = 'Website'
  and not exists (
    select 1 from activities a
    where a.related_type = 'lead' and a.related_id = l.id and a.content = 'Lead created from website contact form'
  );
