import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function AdminLoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/admin/dashboard");

  return (
    <main className="min-h-screen bg-paper">
      <section className="container-shell grid min-h-screen items-center py-12">
        <div className="grid gap-12 lg:grid-cols-[0.95fr_0.65fr] lg:items-end">
          <div>
            <p className="eyebrow">Owner Access</p>
            <h1 className="display-type mt-5 max-w-[10ch]">ADMIN LOGIN</h1>
          </div>
          <div className="border-y border-line py-8">
            <p className="mb-6 text-xl font-semibold leading-8 text-neutral-600">
              Login to manage published work, draft projects, profile data, and contact messages.
            </p>
            <Suspense>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </section>
    </main>
  );
}
