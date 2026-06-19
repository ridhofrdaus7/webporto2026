import { NextRequest, NextResponse } from "next/server";
import { recordTraffic } from "@/lib/analytics";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Legitimate beacon payloads are ~200 bytes; cap well above that. */
const MAX_BODY_BYTES = 2048;

/** Keep only a clean pathname: root-relative, no query/hash/control chars. */
function normalizePath(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/")) return null;
  const pathname = raw.split("?")[0].split("#")[0].slice(0, 256);
  // Drop ASCII control characters (0x00–0x1F and 0x7F) without a regex literal.
  let clean = "";
  for (const ch of pathname) {
    const code = ch.charCodeAt(0);
    if (code > 31 && code !== 127) clean += ch;
  }
  return clean.startsWith("/") ? clean : null;
}

/**
 * Public traffic-collection beacon. Each live visitor posts a `pageview` on
 * navigation and a `heartbeat` every ~20s. Writes go through the service-role
 * key inside recordTraffic; this route never exposes any data back.
 */
export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-nf-client-connection-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "local";

  // A live tab emits ~3 pings/min; 40/min per IP absorbs that yet blocks floods.
  if (!rateLimit(`track:${ip}`, 40, 60_000).ok) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  // Reject oversized bodies before buffering/parsing them.
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const data = (body ?? {}) as Record<string, unknown>;
  const type = data.type === "pageview" ? "pageview" : "heartbeat";
  const path = normalizePath(typeof data.path === "string" ? data.path : null);
  const sessionId = typeof data.sessionId === "string" ? data.sessionId.slice(0, 64) : null;
  const referrer = typeof data.referrer === "string" ? data.referrer.slice(0, 512) : null;

  // Ignore malformed pings and never record the admin area itself.
  if (!path || !sessionId || path.startsWith("/admin")) {
    return NextResponse.json({ ok: true });
  }

  try {
    await recordTraffic({
      type,
      path,
      referrer,
      sessionId,
      ip,
      userAgent: request.headers.get("user-agent") ?? "",
      headers: request.headers
    });
  } catch {
    // Analytics must never break the visitor experience.
  }

  return NextResponse.json({ ok: true });
}
