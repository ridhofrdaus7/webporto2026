import { AdminShell } from "@/components/admin/admin-shell";
import { ProjectForm } from "@/components/admin/project-form";
import { createProjectAction } from "@/lib/admin-actions";
import { getBrands, getCatalogs, getCategories } from "@/lib/portfolio";

export default async function CreateProjectPage() {
  const [brands, categories, catalogs] = await Promise.all([
    getBrands(),
    getCategories(),
    getCatalogs()
  ]);

  return (
    <AdminShell>
      <div className="grid gap-8">
        <div className="border-b border-line pb-8">
          <p className="eyebrow">Create Project</p>
          <h1 className="mt-3 text-6xl font-black uppercase leading-none">New Case Study</h1>
        </div>
        <ProjectForm action={createProjectAction} brands={brands} categories={categories} catalogs={catalogs} />
      </div>
    </AdminShell>
  );
}
