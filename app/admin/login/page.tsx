import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-[#f5f5f2]">
      <section className="container-shell grid min-h-screen items-center py-12">
        <div className="grid gap-12 lg:grid-cols-[0.95fr_0.65fr] lg:items-end">
          <div>
            <p className="eyebrow">Owner Access</p>
            <h1 className="display-type mt-5 max-w-[10ch]">ADMIN LOGIN</h1>
          </div>
          <div className="border-y border-[#d9d9d9] py-8">
            <p className="mb-6 text-xl font-semibold leading-8 text-[#555555]">
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
