/**
 * Shared Postgres connection helper for the one-off DB scripts
 * (db:migrate, db:reset-analytics). Reads SUPABASE_DB_URL from the env.
 */
import pg from "pg";

export type ConnConfig = {
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
export function parsePostgresUrl(raw: string): ConnConfig | null {
  const rest = raw.replace(/^postgres(?:ql)?:\/\//i, "");
  if (rest === raw) return null; // missing / invalid scheme

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

/** Read + validate SUPABASE_DB_URL, exiting with guidance if it's unusable. */
export function resolveConnConfig(scriptName: string): ConnConfig {
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
        `Run again with:  npm run ${scriptName}`
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

  return conn;
}

export function createDbClient(conn: ConnConfig): pg.Client {
  return new pg.Client({
    host: conn.host,
    port: conn.port,
    user: conn.user,
    password: conn.password,
    database: conn.database,
    ssl: { rejectUnauthorized: false }
  });
}
