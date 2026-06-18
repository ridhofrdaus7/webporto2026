import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { ProjectForm } from "@/components/admin/project-form";
import { updateProjectAction } from "@/lib/admin-actions";
import { getBrands, getCatalogs, getCategories, getProjectById } from "@/lib/portfolio";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProjectPage({ params }: PageProps) {
  const { id } = await params;
  const [project, brands, categories, catalogs] = await Promise.all([
    getProjectById(id),
    getBrands(),
    getCategories(),
    getCatalogs()
  ]);
  if (!project) notFound();

  return (
    <AdminShell>
      <div className="grid gap-8">
        <div className="border-b border-line pb-8">
          <p className="eyebrow">Edit Project</p>
          <h1 className="mt-3 text-6xl font-black uppercase leading-none">{project.title}</h1>
        </div>
        <ProjectForm
          action={updateProjectAction.bind(null, id)}
          brands={brands}
          categories={categories}
          catalogs={catalogs}
          project={project}
        />
      </div>
    </AdminShell>
  );
}
