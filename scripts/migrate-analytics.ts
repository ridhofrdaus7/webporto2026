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

type ConnConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
};

/**
 * Tolerant parse of a postgres connection URI. We split on structure rather
 * than feeding it to `new URL()`, so passwords containing special characters
 * (@ : # ? etc.) work WITHOUT manual percent-encoding.
 */
function parsePostgresUrl(raw: string): ConnConfig | null {
  const rest = raw.replace(/^postgres(?:ql)?:\/\//i, "");
  if (rest === raw) return null; // missing/!valid scheme

  const at = rest.lastIndexOf("@"); // last @ separates creds from host
  if (at === -1) return null;

  const creds = rest.slice(0, at);
  const hostPart = rest.slice(at + 1);

  const colon = creds.indexOf(":"); // first : separates user from password
  const user = colon === -1 ? creds : creds.slice(0, colon);
  const password = colon === -1 ? "" : creds.slice(colon + 1);
  if (!user) return null;

  const slash = hostPart.indexOf("/");
  const hostPort = slash === -1 ? hostPart : hostPart.slice(0, slash);
  let database = slash === -1 ? "postgres" : hostPart.slice(slash + 1);
  database = (database.split("?")[0] || "postgres").trim();

  const hpColon = hostPort.lastIndexOf(":");
  const host = hpColon === -1 ? hostPort : hostPort.slice(0, hpColon);
  const port = hpColon === -1 ? 5432 : Number.parseInt(hostPort.slice(hpColon + 1), 10) || 5432;
  if (!host) return null;

  return { host, port, user, password, database };
}

const rawUrl = process.env.SUPABASE_DB_URL?.trim().replace(/^['"]|['"]$/g, "");

if (!rawUrl) {
  console.error(
    [
      "Missing SUPABASE_DB_URL.",
      "",
      "Get it from Supabase → Project Settings → Database → Connection string → URI",
      '(use the "Session pooler" URI if the direct one fails), then add to .env:',
      '  SUPABASE_DB_URL="postgresql://postgres:YOUR-PASSWORD@HOST:5432/postgres"',
      "",
      "Run again with:  npm run db:migrate"
    ].join("\n")
  );
  process.exit(1);
}

// Supabase's URI tab shows the password as a literal `[YOUR-PASSWORD]` placeholder.
if (/\[?your[-_ ]?password\]?/i.test(rawUrl) || rawUrl.includes("<") || rawUrl.includes(">")) {
  console.error(
    [
      "SUPABASE_DB_URL still contains a password placeholder.",
      "Replace [YOUR-PASSWORD] (or <password>) with your real database password.",
      "Find/reset it at Supabase → Project Settings → Database → Database password."
    ].join("\n")
  );
  process.exit(1);
}

const conn = parsePostgresUrl(rawUrl);
if (!conn) {
  console.error(
    [
      "Could not parse SUPABASE_DB_URL.",
      "Expected shape:  postgresql://USER:PASSWORD@HOST:PORT/postgres",
      "Copy the exact URI from Supabase → Project Settings → Database → Connection string."
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
  host: conn.host,
  port: conn.port,
  user: conn.user,
  password: conn.password,
  database: conn.database,
  ssl: { rejectUnauthorized: false }
});

await client.connect();
console.log(`Connected to ${conn.host}:${conn.port}. Applying additive analytics migration…\n`);

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
