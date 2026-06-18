import { AdminShell } from "@/components/admin/admin-shell";
import { createBrandAction, deleteBrandAction } from "@/lib/admin-actions";
import { getBrands } from "@/lib/portfolio";

export default async function AdminBrandsPage({
  searchParams
}: {
  searchParams: Promise<{ demo?: string }>;
}) {
  const [{ demo }, brands] = await Promise.all([searchParams, getBrands()]);

  return (
    <AdminShell>
      <div className="grid gap-8">
        <div className="border-b border-line pb-8">
          <p className="eyebrow">Manage Brands</p>
          <h1 className="mt-3 text-6xl font-black uppercase leading-none">Brands</h1>
          <p className="mt-4 max-w-2xl font-semibold text-muted">
            Add the brands you work with. Each project is assigned to a brand, so you can
            choose which brand you are updating the portfolio for.
          </p>
        </div>

        {demo && (
          <div className="border border-line bg-card p-5 font-bold text-muted">
            Demo mode: connect Supabase and run the schema to persist brands.
          </div>
        )}

        <section className="grid gap-4 border border-line bg-card p-5">
          <p className="text-sm font-black uppercase">Add Brand</p>
          <form action={createBrandAction} className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <label className="grid gap-2">
              <span className="text-xs font-black uppercase text-muted">Brand name</span>
              <input name="name" className="field" placeholder="e.g. RTSR" required />
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-black uppercase text-muted">Slug (optional)</span>
              <input name="slug" className="field" placeholder="auto from name" />
            </label>
            <button className="button-pill button-dark w-fit">Add Brand</button>
          </form>
        </section>

        <div className="overflow-hidden border border-line bg-card">
          <div className="hidden grid-cols-[1fr_1fr_140px] border-b border-line p-4 text-xs font-black uppercase text-muted md:grid">
            <span>Name</span>
            <span>Slug</span>
            <span>Action</span>
          </div>
          {brands.length === 0 ? (
            <div className="p-8 font-bold text-muted">No brands yet. Add your first brand above.</div>
          ) : (
            <div className="divide-y divide-line">
              {brands.map((brand) => (
                <div
                  key={brand.id}
                  className="grid gap-3 p-4 md:grid-cols-[1fr_1fr_140px] md:items-center"
                >
                  <p className="font-black uppercase">{brand.name}</p>
                  <p className="text-sm font-bold uppercase text-muted">{brand.slug}</p>
                  <form action={deleteBrandAction.bind(null, brand.id)}>
                    <button className="button-pill button-light min-h-9 px-4">Delete</button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
