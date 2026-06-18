import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminDashboardData } from "@/lib/portfolio";

export default async function DashboardPage() {
  const dashboard = await getAdminDashboardData();

  return (
    <AdminShell>
      <div className="grid gap-8">
        <div className="flex flex-col gap-5 border-b border-line pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1 className="mt-3 text-6xl font-black uppercase leading-none">Content Overview</h1>
          </div>
          <Link href="/admin/projects/create" className="button-pill button-dark w-fit">New Project</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Total Projects", dashboard.total],
            ["Published", dashboard.published],
            ["Draft", dashboard.draft]
          ].map(([label, value]) => (
            <div key={label} className="border border-line bg-card p-6">
              <p className="eyebrow">{label}</p>
              <p className="mt-4 text-6xl font-black">{value}</p>
            </div>
          ))}
        </div>
        <div className="border border-line bg-card">
          <div className="border-b border-line p-5 text-sm font-black uppercase">Recent Projects</div>
          <div className="divide-y divide-line">
            {dashboard.recentProjects.map((project) => (
              <div key={project.id} className="grid gap-3 p-5 text-sm font-bold uppercase md:grid-cols-[1fr_160px_120px]">
                <span>{project.title}</span>
                <span className="text-muted">{project.catalog?.name ?? project.category.name}</span>
                <span>{project.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
