"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Privacy-light traffic beacon. Sends a `pageview` on every route change and a
 * `heartbeat` every 20s while the tab is visible (powers the "online now"
 * count). Never runs on /admin routes. Failures are swallowed silently.
 */

const HEARTBEAT_MS = 20_000;
const SESSION_KEY = "rf_sid";
const ENTRY_KEY = "rf_entry_sent";

function getSessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "anon";
  }
}

/** External referrer, sent only once per session (the entry source). */
function entryReferrer(): string | null {
  try {
    if (sessionStorage.getItem(ENTRY_KEY)) return null;
    sessionStorage.setItem(ENTRY_KEY, "1");
    const ref = document.referrer;
    if (ref && new URL(ref).host !== location.host) return ref;
    return null;
  } catch {
    return null;
  }
}

function send(type: "pageview" | "heartbeat", path: string, referrer: string | null) {
  const body = JSON.stringify({ type, path, referrer, sessionId: getSessionId() });
  try {
    void fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true
    }).catch(() => {});
  } catch {
    /* ignore — analytics is best-effort */
  }
}

export function AnalyticsBeacon() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    // Reset the dedupe marker on /admin so returning to the same public path
    // afterwards is counted as a fresh view.
    if (pathname.startsWith("/admin")) {
      lastPath.current = null;
      return;
    }
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    send("pageview", pathname, entryReferrer());
  }, [pathname]);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    const ping = () => {
      if (document.visibilityState === "visible") send("heartbeat", pathname, null);
    };
    const id = window.setInterval(ping, HEARTBEAT_MS);
    document.addEventListener("visibilitychange", ping);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", ping);
    };
  }, [pathname]);

  return null;
}
