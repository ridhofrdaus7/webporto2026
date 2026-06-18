import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { getCurrentUser } from "@/lib/auth";

const nav = [
  ["Dashboard", "/admin/dashboard"],
  ["Projects", "/admin/projects"],
  ["Create", "/admin/projects/create"],
  ["Brands", "/admin/brands"],
  ["Profile", "/admin/profile"],
  ["Messages", "/admin/messages"]
];

export async function AdminShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  return (
    <main className="min-h-screen bg-paper">
      <div className="container-shell grid gap-8 py-6 lg:grid-cols-[250px_1fr]">
        <aside className="lg:sticky lg:top-6 lg:h-[calc(100vh-48px)]">
          <div className="border border-line bg-card p-5">
            <Link href="/" className="text-xl font-black uppercase leading-none">
              RIDHO FIRDAUS
            </Link>
            <p className="mt-2 text-xs font-bold uppercase text-muted">{user?.email}</p>
            <nav className="mt-8 grid gap-2 text-sm font-black uppercase">
              {nav.map(([label, href]) => (
                <Link key={href} href={href} className="border-t border-line py-3">
                  {label}
                </Link>
              ))}
            </nav>
            <div className="mt-8">
              <SignOutButton />
            </div>
          </div>
        </aside>
        <section>{children}</section>
      </div>
    </main>
  );
}
