/**
 * One-shot, NON-DESTRUCTIVE migration for the traffic-analytics tables.
 *
 *   SUPABASE_DB_URL="postgresql://..." npm run db:migrate
 *
 * Every statement below is purely additive (`create ... if not exists`,
 * `enable row level security`). There is intentionally NO drop / delete /
 * truncate / alter-column anywhere, so existing tables and rows
 * (projects, brands, profile, contact_messages, …) are never touched. The
 * whole thing runs inside a single transaction: if anything fails it rolls
 * back and changes nothing.
 */
import pg from "pg";

const url = process.env.SUPABASE_DB_URL;
if (!url) {
  console.error(
    [
      "Missing SUPABASE_DB_URL.",
      "",
      "Get it from Supabase → Project Settings → Database → Connection string → URI",
      '(use the "Session pooler" URI if the direct one fails), then add to .env:',
      '  SUPABASE_DB_URL="postgresql://postgres:<password>@<host>:5432/postgres"',
      "",
      "Run again with:  npm run db:migrate"
    ].join("\n")
  );
  process.exit(1);
}

// Additive, idempotent statements ONLY.
const STATEMENTS: Array<{ label: string; sql: string }> = [
  {
    label: 'extension "pgcrypto"',
    sql: `create extension if not exists "pgcrypto"`
  },
  {
    label: "table page_views",
    sql: `create table if not exists public.page_views (
      id           uuid primary key default gen_random_uuid(),
      path         text not null,
      referrer     text,
      visitor_hash text,
      session_id   text,
      device       text,
      browser      text,
      country      text,
      is_bot       boolean not null default false,
      created_at   timestamptz not null default now()
    )`
  },
  {
    label: "index page_views_created_idx",
    sql: `create index if not exists page_views_created_idx on public.page_views(created_at desc)`
  },
  {
    label: "index page_views_path_idx",
    sql: `create index if not exists page_views_path_idx on public.page_views(path)`
  },
  {
    label: "table active_sessions",
    sql: `create table if not exists public.active_sessions (
      session_id text primary key,
      path       text,
      device     text,
      country    text,
      last_seen  timestamptz not null default now()
    )`
  },
  {
    label: "index active_sessions_last_seen_idx",
    sql: `create index if not exists active_sessions_last_seen_idx on public.active_sessions(last_seen desc)`
  },
  {
    label: "enable RLS on page_views",
    sql: `alter table public.page_views enable row level security`
  },
  {
    label: "enable RLS on active_sessions",
    sql: `alter table public.active_sessions enable row level security`
  }
];

// Safety net: refuse to run if anything destructive ever sneaks in.
const FORBIDDEN = /\b(drop|delete|truncate|alter\s+column|update)\b/i;
for (const { label, sql } of STATEMENTS) {
  if (FORBIDDEN.test(sql)) {
    console.error(`Refusing to run — "${label}" contains a destructive keyword.`);
    process.exit(1);
  }
}

const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false }
});

await client.connect();
console.log("Connected. Applying additive analytics migration…\n");

try {
  await client.query("begin");
  for (const { label, sql } of STATEMENTS) {
    process.stdout.write(`  → ${label} … `);
    await client.query(sql);
    console.log("ok");
  }
  await client.query("commit");
  console.log("\n✅ Done. 2 tables ready. No existing data was touched.");
} catch (error) {
  await client.query("rollback");
  console.error("\n❌ Migration failed and was rolled back — nothing changed.");
  console.error(error);
  process.exitCode = 1;
} finally {
  await client.end();
}
