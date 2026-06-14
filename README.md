# Ridho Firdaus Portfolio Website

Modern editorial portfolio with public pages and a protected admin dashboard.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL database, Auth, and Storage)
- Zod + React Hook Form
- Framer Motion

## Setup

1. Create a project at [supabase.com](https://supabase.com).
2. In the Supabase SQL Editor, run [`supabase/schema.sql`](supabase/schema.sql) to create the tables, RLS policies, and the public `media` storage bucket.
3. Copy `.env.example` to `.env` and fill in the values from **Project Settings → API**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (keep secret — server only)
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` (the admin login that the seed creates)
4. Run:

```bash
npm install
npm run db:seed   # creates the admin user + sample content
npm run dev
```

Without Supabase environment variables, the public site renders sample projects so the design can be previewed immediately. Admin writes need a configured Supabase project.

## Admin

- Login: `/admin/login` (Supabase Auth email/password)
- Projects: `/admin/projects`
- Profile: `/admin/profile`
- Messages: `/admin/messages`

Uploads accept JPG, PNG, WEBP, and MP4 through `/api/upload`, stored in the Supabase `media` bucket and served from its public URL.
