# Smartara CRM

An internal CRM for Smartara — tracks leads through the pipeline (WhatsApp
referrals, LinkedIn, cold outreach, Upwork/Fiverr…) and active client
projects across Blueprint, Prospect, Content OS, and custom/client-services
work. Built for two users (Muhammed + Rohey), no public signup.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind · Supabase (Postgres + Auth) · deploys free on Netlify or Vercel.

---

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) → New project (free tier is enough).
2. Once it's up, go to **SQL Editor → New query**, paste the entire contents
   of `supabase/schema.sql`, and run it. This creates all four tables
   (`leads`, `clients`, `projects`, `activities`) with row-level security
   already locked down to authenticated users only.
3. Go to **Authentication → Users → Add user** and manually create an
   account for yourself and Rohey (email + password). There's no signup
   page in the app on purpose — this is a private tool.
4. Go to **Settings → API** and copy:
   - `Project URL`
   - `anon` `public` key

## 2. Local setup

```bash
npm install
cp .env.example .env.local
# paste your Project URL and anon key into .env.local
npm run dev
```

Visit `http://localhost:3000` — you'll land on the login screen. Sign in
with one of the accounts you created in step 1.

## 3. Website lead capture (optional)

Your website has its own Supabase project, separate from the CRM's — so
website leads don't land here automatically. `POST /api/leads` is a webhook
your website's backend can call on every form submission to create a lead
directly in this CRM.

1. In the CRM's Supabase project, go to **Settings → API** and copy the
   `service_role` key (not the `anon` key — this one bypasses row-level
   security, so it's only ever used server-side, never in `.env.local`'s
   `NEXT_PUBLIC_*` vars or in any browser code).
2. Generate a random secret for `LEADS_WEBHOOK_SECRET` (e.g.
   `openssl rand -hex 32`) and set both it and `SUPABASE_SERVICE_ROLE_KEY`
   in `.env.local` (and later in Netlify's env vars — see step 4 below).
3. From your website's backend, POST to `https://crm.smartara.co/api/leads`:

   ```bash
   curl -X POST https://crm.smartara.co/api/leads \
     -H "Content-Type: application/json" \
     -H "x-webhook-secret: <LEADS_WEBHOOK_SECRET>" \
     -d '{
       "name": "Jane Doe",
       "email": "jane@example.com",
       "phone": "+220 000 0000",
       "company": "Acme Ltd",
       "notes": "Interested in a new website"
     }'
   ```

   Only `name` is required. Omitted fields default the same way they do in
   the UI: `source` → `"Website"`, `product_interest` → `"Client Services"`,
   `region` → `"gambia"`, `currency` → `"GMD"`, `estimated_value` → `0`. Pass
   `source`, `product_interest`, `region`, or `currency` explicitly to
   override — see the allowed values in `lib/data/types.ts`
   (`LEAD_SOURCES`, `PRODUCTS`). A successful call returns
   `{ "id": "<uuid>" }` with status `201`; a wrong/missing secret returns
   `401`.

## 4. Deploy (Netlify — free)

1. Push this folder to a GitHub repo.
2. In Netlify: **Add new site → Import an existing project**, pick the repo.
   Netlify auto-detects Next.js (via the `@netlify/plugin-nextjs` build
   plugin) — no manual build config needed.
3. Under **Site settings → Environment variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` and `LEADS_WEBHOOK_SECRET` (only needed if
     you set up website lead capture in step 3)
4. Deploy. That's it — same zero-cost pattern as MinistryFlow (Next.js +
   Supabase + Netlify, free tiers all around).
5. Under **Domain management**, add `crm.smartara.co` as a custom domain and
   point its DNS (a `CNAME` record, per Netlify's instructions) at the
   Netlify site. Once it's live, update `CRM_LEADS_WEBHOOK_URL` in the
   website's env to `https://crm.smartara.co/api/leads` (see step 3 above).

(Vercel works identically if you'd rather use that — same env vars, zero
config needed since it's a native Next.js app.)

---

## What's in here

- **Pipeline (`/leads`)** — kanban board across 7 stages (New → Contacted →
  Qualified → Proposal Sent → Negotiation → Won / Lost). Each lead tracks
  region (Gambia vs. international), currency (GMD/USD), estimated value,
  source, and which Smartara product they're interested in. A lead's stage
  is shown as a small "signal strength" meter instead of a plain badge.
  Advancing a "Won" lead offers one-click conversion into a client record.
- **Clients (`/clients`)** — every converted lead or directly-added client,
  with a status (active/paused/completed/churned) and however many projects
  they have running.
- **Client detail** — each client can have multiple projects (e.g. a brand
  kit *and* a website as separate line items), each with its own product,
  status, value, and dates.
- **Activity timeline** — both leads and clients have a shared activity log
  (call, WhatsApp, email, meeting, note) so nothing lives only in your head
  or a WhatsApp thread.
- **Dashboard (`/`)** — open pipeline value split by currency, active
  clients, won-this-month, pipeline-by-stage breakdown, recent activity
  feed.

## Extending it

- Team members are currently hardcoded to `Muhammed` / `Rohey` in
  `lib/data/types.ts` (`TEAM_MEMBERS`) — add more there if the team grows.
- Lead sources, products, and stages are also defined as constants in that
  same file if you want to add/rename any of them.
- All writes go through Server Actions in `app/actions/` — that's the place
  to add things like email notifications on stage change, or a webhook to
  your WhatsApp sales group.
