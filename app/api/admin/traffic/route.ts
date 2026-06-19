import { NextResponse } from "next/server";
import { getTrafficOverview } from "@/lib/analytics";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Admin-only traffic snapshot. Polled live by the dashboard widget. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const overview = await getTrafficOverview();
  return NextResponse.json(overview, {
    headers: { "cache-control": "no-store" }
  });
}
