# Ridho Firdaus Portfolio Website

Modern editorial portfolio with public pages, a protected admin dashboard, and privacy-first realtime traffic analytics.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL database, Auth, and Storage)
- Zod + React Hook Form
- Framer Motion

## Setup

1. Create a project at [supabase.com](https://supabase.com).
2. In the Supabase SQL Editor, run [`supabase/schema.sql`](supabase/schema.sql) to create the tables (portfolio content **and** the `page_views` / `active_sessions` analytics tables), RLS policies, and the public `media` storage bucket.
3. Copy `.env.example` to `.env` and fill in the values from **Project Settings → API**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (keep secret — server only)

   Admin credentials are **not** stored in `.env`. Create the admin user once by passing them inline to the seed (or create the user directly in the Supabase dashboard):

   ```bash
   ADMIN_EMAIL="you@mail.com" ADMIN_PASSWORD="strong-password" npm run db:seed
   ```
4. Run:

```bash
npm install
npm run db:seed   # optional: seeds sample content (and the admin user if creds are passed)
npm run dev
```

Without Supabase environment variables, the public site renders sample projects so the design can be previewed immediately. Admin writes and analytics need a configured Supabase project.

## Admin

- Login: `/admin/login` (Supabase Auth email/password)
- Dashboard: `/admin/dashboard`
- **Live Traffic: `/admin/traffic`** (realtime visitor analytics)
- Projects: `/admin/projects`
- Brands: `/admin/brands`
- Profile: `/admin/profile`
- Messages: `/admin/messages`

Uploads accept JPG, PNG, WEBP, and MP4 through `/api/upload`, stored in the Supabase `media` bucket and served from its public URL.

## Traffic analytics

Privacy-first, admin-only realtime analytics ([`lib/analytics.ts`](lib/analytics.ts)).

- A public beacon ([`components/public/analytics-beacon.tsx`](components/public/analytics-beacon.tsx), mounted in the root layout) records a `pageview` on each route change plus a `heartbeat` every 20s. It never tracks `/admin` routes. Writes go through the service-role key in `/api/track`.
- The admin page polls `/api/admin/traffic` (auth-gated) every 7s for: online-now, today / 7d / 30d / all-time, a 14-day chart, top pages/referrers, devices and countries (counted per **unique visitor**), and recent visits.
- Storage is two tables (`page_views`, `active_sessions`) with **RLS enabled and no policies**, so the anon key can neither read nor write — traffic stays private to the owner. No raw IP/PII is stored (`visitor_hash` is a daily-salted, Asia/Jakarta-bucketed SHA-256). "Today" and day buckets use WIB (Asia/Jakarta).

### Reset / clear analytics

```bash
npm run db:reset-analytics                      # dry-run (shows what it would do)
npm run db:reset-analytics -- --yes             # wipe page_views + active_sessions
npm run db:reset-analytics -- --yes --online-only   # clear only "online now"
```

Uses the service-role key (no DB password needed) and only ever touches the two analytics tables.

## Scripts

```bash
npm run dev                  # dev server
npm run build                # production build
npm run start                # run the build
npm run lint                 # eslint
npm run db:seed              # seed sample content (+ admin user if creds passed inline)
npm run db:migrate           # create the analytics tables via a direct connection (optional — see below)
npm run db:reset-analytics   # clear analytics data (see above)
```

`npm run db:migrate` is an alternative to running `supabase/schema.sql` by hand for the analytics tables. It needs a direct Postgres connection — set `SUPABASE_DB_URL` in `.env` (Supabase → **Project Settings → Database → Connection string → URI**, with your real database password). It only runs additive `create … if not exists` statements inside one transaction and refuses any destructive keyword. If you already ran `supabase/schema.sql`, you don't need it.
