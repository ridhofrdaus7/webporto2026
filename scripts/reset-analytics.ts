/**
 * Resets the traffic-analytics data to zero — and ONLY that.
 *
 * Uses the Supabase SERVICE-ROLE key (the same one the app already uses), so
 * it needs no direct Postgres connection string. Only the two analytics
 * tables are touched; projects, brands, profile, contact_messages and media
 * are never affected.
 *
 *   npm run db:reset-analytics              # dry-run: shows what it would do
 *   npm run db:reset-analytics -- --yes     # wipe page_views + active_sessions
 *   npm run db:reset-analytics -- --yes --online-only   # only clear "online now"
 */
import { createClient } from "@supabase/supabase-js";

const onlineOnly = process.argv.includes("--online-only");
const confirmed = process.argv.includes("--yes");
const TARGETS = onlineOnly ? ["active_sessions"] : ["page_views", "active_sessions"];

if (!confirmed) {
  console.log(
    [
      "DRY RUN — nothing was deleted.",
      "",
      `This will PERMANENTLY DELETE all rows from: ${TARGETS.join(", ")}`,
      "Other tables (projects, brands, profile, contact_messages, media) are NOT touched.",
      "",
      "Confirm with:",
      `  npm run db:reset-analytics -- --yes${onlineOnly ? " --online-only" : ""}`
    ].join("\n")
  );
  process.exit(0);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env."
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

// Epoch lower-bound matches every row (created_at / last_seen are never null).
const EPOCH = "1970-01-01T00:00:00Z";
let ok = true;

console.log(`Resetting: ${TARGETS.join(", ")}…\n`);

if (!onlineOnly) {
  process.stdout.write("  → clearing page_views … ");
  const { error } = await supabase.from("page_views").delete().gte("created_at", EPOCH);
  if (error) {
    console.log("failed");
    console.error(`    ${error.message}`);
    ok = false;
  } else {
    console.log("ok");
  }
}

process.stdout.write("  → clearing active_sessions … ");
const { error: sessionError } = await supabase
  .from("active_sessions")
  .delete()
  .gte("last_seen", EPOCH);
if (sessionError) {
  console.log("failed");
  console.error(`    ${sessionError.message}`);
  ok = false;
} else {
  console.log("ok");
}

if (ok) {
  console.log(`\n✅ Reset ${TARGETS.join(", ")} to 0. Other data untouched.`);
} else {
  console.error("\n❌ Some tables could not be cleared.");
  process.exitCode = 1;
}
