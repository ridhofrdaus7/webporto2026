import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { TrafficPanel } from "@/components/admin/traffic-panel";
import { getTrafficOverview } from "@/lib/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function TrafficPage() {
  const traffic = await getTrafficOverview();

  return (
    <AdminShell>
      <div className="grid gap-8">
        <div className="flex flex-col gap-5 border-b border-line pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Analytics</p>
            <h1 className="mt-3 text-6xl font-black uppercase leading-none">Live Traffic</h1>
          </div>
          <Link href="/admin/dashboard" className="button-pill button-light w-fit">
            Back to Dashboard
          </Link>
        </div>

        <TrafficPanel initial={traffic} />
      </div>
    </AdminShell>
  );
}
