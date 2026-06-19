import { createHash } from "node:crypto";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

/**
 * Privacy-first traffic analytics for the single-owner portfolio.
 *
 * Collection (`recordTraffic`) runs from the public /api/track endpoint with
 * the service-role key. Reporting (`getTrafficOverview`) runs from the
 * admin-only /api/admin/traffic endpoint and the dashboard. No raw IPs or PII
 * are persisted — `visitor_hash` is a daily-rotating SHA-256 used only to
 * approximate unique visitors within a single day.
 */

const JAKARTA_TZ = "Asia/Jakarta";
const ONLINE_WINDOW_MS = 60_000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const CHART_DAYS = 14;
const MAX_WINDOW_ROWS = 5000;

// ---------------------------------------------------------------------------
// Types — the shared contract between the API routes and the dashboard widget.
// ---------------------------------------------------------------------------

export type TrafficPoint = { day: string; label: string; views: number };
export type TrafficCount = { label: string; value: number };
export type RecentView = {
  path: string;
  country: string | null;
  device: string | null;
  browser: string | null;
  at: string;
};

export type TrafficOverview = {
  /** False when Supabase isn't configured — the UI shows an empty state. */
  available: boolean;
  onlineNow: number;
  today: number;
  uniqueToday: number;
  last7d: number;
  last30d: number;
  allTime: number;
  series: TrafficPoint[];
  topPages: TrafficCount[];
  topReferrers: TrafficCount[];
  devices: TrafficCount[];
  countries: TrafficCount[];
  recent: RecentView[];
  generatedAt: string;
};

export type TrackInput = {
  type: "pageview" | "heartbeat";
  path: string;
  referrer: string | null;
  sessionId: string;
  ip: string;
  userAgent: string;
  headers: Headers;
};

type WindowRow = {
  created_at: string;
  path: string;
  referrer: string | null;
  device: string | null;
  browser: string | null;
  country: string | null;
  visitor_hash: string | null;
  session_id: string | null;
};

// ---------------------------------------------------------------------------
// User-agent + geo parsing (no external dependency).
// ---------------------------------------------------------------------------

const BOT_RE =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora|pinterest|slackbot|vkshare|w3c_validator|whatsapp|telegrambot|discordbot|headless|lighthouse|pagespeed|gtmetrix|pingdom|uptimerobot|monitor|curl|wget|python-requests|axios|node-fetch|go-http|java\//i;

export function isBotUA(ua: string): boolean {
  return BOT_RE.test(ua);
}

export function parseDevice(ua: string): string {
  if (/ipad|tablet|playbook|silk|kindle|(android(?!.*mobile))/i.test(ua)) return "Tablet";
  if (/mobi|iphone|ipod|android.*mobile|windows phone|blackberry|bb10|opera mini/i.test(ua))
    return "Mobile";
  return "Desktop";
}

export function parseBrowser(ua: string): string {
  if (/edg(a|ios)?\//i.test(ua)) return "Edge";
  if (/opr\/|opera/i.test(ua)) return "Opera";
  if (/samsungbrowser/i.test(ua)) return "Samsung";
  if (/firefox|fxios/i.test(ua)) return "Firefox";
  if (/chrome|crios/i.test(ua)) return "Chrome";
  if (/safari/i.test(ua) && !/chrome|crios|android/i.test(ua)) return "Safari";
  return "Other";
}

/** Best-effort ISO country code from Netlify / Cloudflare / Vercel headers. */
export function parseCountry(headers: Headers): string | null {
  const geo = headers.get("x-nf-geo");
  if (geo) {
    try {
      const decoded = JSON.parse(Buffer.from(geo, "base64").toString("utf8"));
      const code = decoded?.country?.code;
      if (typeof code === "string") {
        const upper = code.trim().toUpperCase();
        if (upper && upper !== "XX" && upper !== "T1") return upper;
      }
    } catch {
      /* malformed geo header — fall through */
    }
  }
  for (const value of [
    headers.get("cf-ipcountry"),
    headers.get("x-vercel-ip-country"),
    headers.get("x-country")
  ]) {
    if (value && value !== "XX" && value !== "T1") return value.toUpperCase();
  }
  return null;
}

/**
 * Daily-rotating, non-reversible visitor fingerprint (no raw IP stored). The
 * salt rotates on the Asia/Jakarta day boundary so it lines up with how the
 * dashboard buckets "today" (jakartaDayKey is hoisted from below).
 */
export function visitorHash(ip: string, ua: string, now: Date): string {
  return createHash("sha256")
    .update(`${jakartaDayKey(now)}|${ip}|${ua}`)
    .digest("hex")
    .slice(0, 32);
}

// ---------------------------------------------------------------------------
// Collection
// ---------------------------------------------------------------------------

export async function recordTraffic(input: TrackInput): Promise<void> {
  if (!isSupabaseAdminConfigured()) return;

  const now = new Date();
  const device = parseDevice(input.userAgent);
  const country = parseCountry(input.headers);
  const supabase = createSupabaseAdminClient();

  // Keep the live-session row fresh for BOTH pageviews and heartbeats so the
  // "online now" count stays accurate while a tab is open.
  await supabase.from("active_sessions").upsert(
    {
      session_id: input.sessionId,
      path: input.path,
      device,
      country,
      last_seen: now.toISOString()
    },
    { onConflict: "session_id" }
  );

  // active_sessions is ephemeral live-state; opportunistically reap rows that
  // fell out of the online window so the table can't grow without bound.
  if (Math.random() < 0.1) {
    const staleBefore = new Date(now.getTime() - 10 * 60_000).toISOString();
    await supabase.from("active_sessions").delete().lt("last_seen", staleBefore);
  }

  if (input.type !== "pageview") return;

  await supabase.from("page_views").insert({
    path: input.path,
    referrer: sameOriginSafeReferrer(input.referrer, input.headers),
    visitor_hash: visitorHash(input.ip, input.userAgent, now),
    session_id: input.sessionId,
    device,
    browser: parseBrowser(input.userAgent),
    country,
    is_bot: isBotUA(input.userAgent)
  });
}

/** Drop a referrer that points back at our own host (server-side guard). */
function sameOriginSafeReferrer(referrer: string | null, headers: Headers): string | null {
  if (!referrer) return null;
  try {
    const host = headers.get("host");
    if (host && new URL(referrer).host === host) return null;
  } catch {
    return null;
  }
  return referrer;
}

// ---------------------------------------------------------------------------
// Reporting
// ---------------------------------------------------------------------------

function jakartaDayKey(d: Date): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: JAKARTA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(d);
}

function jakartaDayLabel(ymd: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: JAKARTA_TZ,
    month: "short",
    day: "numeric"
  }).format(new Date(`${ymd}T00:00:00+07:00`));
}

/** Start of "today" in Asia/Jakarta, as a UTC instant. */
function jakartaMidnight(now: Date): Date {
  return new Date(`${jakartaDayKey(now)}T00:00:00+07:00`);
}

function buildSeriesSkeleton(now: Date): Map<string, TrafficPoint> {
  const map = new Map<string, TrafficPoint>();
  for (let i = CHART_DAYS - 1; i >= 0; i--) {
    const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const ymd = jakartaDayKey(day);
    map.set(ymd, { day: ymd, label: jakartaDayLabel(ymd), views: 0 });
  }
  return map;
}

function cleanReferrer(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const host = new URL(raw).hostname.replace(/^www\./, "");
    return host || null;
  } catch {
    return null;
  }
}

function topN(tally: Map<string, number>, n: number): TrafficCount[] {
  return [...tally.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([label, value]) => ({ label, value }));
}

function addVisitor(map: Map<string, Set<string>>, key: string, visitorId: string): void {
  const set = map.get(key);
  if (set) set.add(visitorId);
  else map.set(key, new Set([visitorId]));
}

/** Rank by number of DISTINCT visitors (not page views) per bucket. */
function topNDistinct(map: Map<string, Set<string>>, n: number): TrafficCount[] {
  return [...map.entries()]
    .map(([label, set]) => ({ label, value: set.size }))
    .sort((a, b) => b.value - a.value)
    .slice(0, n);
}

function emptyOverview(available: boolean): TrafficOverview {
  const now = new Date();
  return {
    available,
    onlineNow: 0,
    today: 0,
    uniqueToday: 0,
    last7d: 0,
    last30d: 0,
    allTime: 0,
    series: [...buildSeriesSkeleton(now).values()],
    topPages: [],
    topReferrers: [],
    devices: [],
    countries: [],
    recent: [],
    generatedAt: now.toISOString()
  };
}

export async function getTrafficOverview(): Promise<TrafficOverview> {
  if (!isSupabaseAdminConfigured()) return emptyOverview(false);

  try {
    const supabase = createSupabaseAdminClient();
    const now = new Date();
    const since30 = new Date(now.getTime() - THIRTY_DAYS_MS);
    const since7 = new Date(now.getTime() - SEVEN_DAYS_MS);
    const onlineSince = new Date(now.getTime() - ONLINE_WINDOW_MS);
    const todayStart = jakartaMidnight(now);

    // Exact, server-side counts for the headline numbers so they never get
    // truncated by the capped detail window used for the chart/tallies below.
    const countSince = (iso: string) =>
      supabase
        .from("page_views")
        .select("id", { count: "exact", head: true })
        .eq("is_bot", false)
        .gte("created_at", iso);

    const [windowRes, onlineRes, allTimeRes, recentRes, todayRes, week7Res, month30Res] =
      await Promise.all([
        supabase
          .from("page_views")
          .select("created_at, path, referrer, device, browser, country, visitor_hash, session_id")
          .eq("is_bot", false)
          .gte("created_at", since30.toISOString())
          .order("created_at", { ascending: false })
          .limit(MAX_WINDOW_ROWS),
        supabase
          .from("active_sessions")
          .select("session_id", { count: "exact", head: true })
          .gte("last_seen", onlineSince.toISOString()),
        supabase
          .from("page_views")
          .select("id", { count: "exact", head: true })
          .eq("is_bot", false),
        supabase
          .from("page_views")
          .select("path, country, device, browser, created_at")
          .eq("is_bot", false)
          .order("created_at", { ascending: false })
          .limit(12),
        countSince(todayStart.toISOString()),
        countSince(since7.toISOString()),
        countSince(since30.toISOString())
      ]);

    if (windowRes.error) throw windowRes.error;

    const rows = (windowRes.data ?? []) as WindowRow[];
    const series = buildSeriesSkeleton(now);
    const pageTally = new Map<string, number>();
    const refTally = new Map<string, number>();
    // Devices/countries are counted per DISTINCT visitor (session), so one
    // person browsing several pages stays a single visitor — not one per view.
    const deviceVisitors = new Map<string, Set<string>>();
    const countryVisitors = new Map<string, Set<string>>();
    const uniqueToday = new Set<string>();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const created = new Date(row.created_at);
      const point = series.get(jakartaDayKey(created));
      if (point) point.views += 1;

      if (created >= todayStart && row.visitor_hash) uniqueToday.add(row.visitor_hash);

      // Stable per-visitor key (fall back so a row is never miscounted as 0).
      const visitorId = row.session_id ?? row.visitor_hash ?? `row-${i}`;

      pageTally.set(row.path, (pageTally.get(row.path) ?? 0) + 1);
      const ref = cleanReferrer(row.referrer);
      if (ref) refTally.set(ref, (refTally.get(ref) ?? 0) + 1);
      if (row.device) addVisitor(deviceVisitors, row.device, visitorId);
      if (row.country) addVisitor(countryVisitors, row.country, visitorId);
    }

    const recent: RecentView[] = (recentRes.data ?? []).map((r) => {
      const row = r as Record<string, unknown>;
      return {
        path: String(row.path ?? ""),
        country: (row.country as string | null) ?? null,
        device: (row.device as string | null) ?? null,
        browser: (row.browser as string | null) ?? null,
        at: String(row.created_at ?? "")
      };
    });

    return {
      available: true,
      onlineNow: onlineRes.count ?? 0,
      today: todayRes.count ?? 0,
      uniqueToday: uniqueToday.size,
      last7d: week7Res.count ?? 0,
      last30d: month30Res.count ?? 0,
      allTime: allTimeRes.count ?? 0,
      series: [...series.values()],
      topPages: topN(pageTally, 6),
      topReferrers: topN(refTally, 6),
      devices: topNDistinct(deviceVisitors, 4),
      countries: topNDistinct(countryVisitors, 6),
      recent,
      generatedAt: now.toISOString()
    };
  } catch {
    return emptyOverview(true);
  }
}
