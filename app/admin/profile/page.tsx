import { AdminShell } from "@/components/admin/admin-shell";
import { updateProfileAction } from "@/lib/admin-actions";
import { getProfile } from "@/lib/portfolio";

export default async function AdminProfilePage({
  searchParams
}: {
  searchParams: Promise<{ demo?: string }>;
}) {
  const [{ demo }, profile] = await Promise.all([searchParams, getProfile()]);

  return (
    <AdminShell>
      <div className="grid gap-8">
        <div className="border-b border-line pb-8">
          <p className="eyebrow">Profile Settings</p>
          <h1 className="mt-3 text-6xl font-black uppercase leading-none">Owner Profile</h1>
        </div>
        {demo && (
          <div className="border border-line bg-card p-5 font-bold text-muted">
            Demo mode: profile changes need a connected PostgreSQL database.
          </div>
        )}
        <form action={updateProfileAction} className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <input name="name" className="field" defaultValue={profile.name} placeholder="Name" />
            <input name="headline" className="field" defaultValue={profile.headline} placeholder="Headline" />
          </div>
          <textarea name="bio" className="field min-h-40" defaultValue={profile.bio} placeholder="Bio" />
          <div className="grid gap-4 md:grid-cols-2">
            <input name="email" className="field" defaultValue={profile.email} placeholder="Email" />
            <input name="whatsapp" className="field" defaultValue={profile.whatsapp} placeholder="WhatsApp" />
            <input name="profileImageUrl" className="field" defaultValue={"profileImageUrl" in profile ? profile.profileImageUrl ?? "" : ""} placeholder="Profile image URL" />
            <input name="cvUrl" className="field" defaultValue={"cvUrl" in profile ? profile.cvUrl ?? "" : ""} placeholder="CV URL" />
            <input name="instagramUrl" className="field" defaultValue={profile.instagramUrl ?? ""} placeholder="Instagram URL" />
            <input name="linkedinUrl" className="field" defaultValue={profile.linkedinUrl ?? ""} placeholder="LinkedIn URL" />
          </div>
          <button className="button-pill button-dark w-fit">Save Profile</button>
        </form>
      </div>
    </AdminShell>
  );
}
