import Image from "next/image";
import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { deleteProjectAction } from "@/lib/admin-actions";
import { getAdminProjectSummaries } from "@/lib/portfolio";

export default async function AdminProjectsPage({
  searchParams
}: {
  searchParams: Promise<{ demo?: string }>;
}) {
  const [{ demo }, projects] = await Promise.all([searchParams, getAdminProjectSummaries()]);

  return (
    <AdminShell>
      <div className="grid gap-8">
        <div className="flex flex-col gap-5 border-b border-[#d9d9d9] pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Manage Projects</p>
            <h1 className="mt-3 text-6xl font-black uppercase leading-none">Portfolio CMS</h1>
          </div>
          <Link href="/admin/projects/create" className="button-pill button-dark w-fit">Create Project</Link>
        </div>
        {demo && (
          <div className="border border-[#d9d9d9] bg-white p-5 font-bold text-[#777777]">
            Demo mode: connect Supabase and run the schema to persist admin changes.
          </div>
        )}
        <div className="overflow-hidden border border-[#d9d9d9] bg-white">
          <div className="hidden grid-cols-[86px_1fr_150px_170px_120px_180px] border-b border-[#d9d9d9] p-4 text-xs font-black uppercase text-[#777777] md:grid">
            <span>Image</span>
            <span>Title</span>
            <span>Category</span>
            <span>Sub Catalog</span>
            <span>Status</span>
            <span>Action</span>
          </div>
          <div className="divide-y divide-[#d9d9d9]">
            {projects.map((project) => (
              <div key={project.id} className="grid gap-4 p-4 md:grid-cols-[86px_1fr_150px_170px_120px_180px] md:items-center">
                <Image
                  src={project.thumbnailUrl}
                  alt={project.title}
                  width={72}
                  height={56}
                  sizes="72px"
                  className="h-14 w-[72px] rounded-lg object-cover"
                />
                <div>
                  <p className="font-black uppercase">{project.title}</p>
                  <p className="text-xs font-bold uppercase text-[#777777]">{project.clientName} / {project.year}</p>
                </div>
                <p className="text-sm font-bold uppercase text-[#777777]">{project.category.name}</p>
                <p className="text-sm font-bold uppercase text-[#777777]">
                  {project.catalog ? `${project.catalog.brandName} / ${project.catalog.name}` : "-"}
                </p>
                <p className="text-sm font-black uppercase">{project.status}</p>
                <div className="flex gap-2">
                  <Link href={`/admin/projects/${project.id}/edit`} className="button-pill button-light min-h-9 px-4">Edit</Link>
                  <form action={deleteProjectAction.bind(null, project.id)}>
                    <button className="button-pill button-light min-h-9 px-4">Delete</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
