"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/components/admin/toast";

export function LoginForm() {
  const router = useRouter();
  const toast = useToast();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    setError("");

    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? "")
    });

    setLoading(false);
    if (signInError) {
      setError("Invalid login details.");
      toast.error("Email atau password salah.");
      return;
    }

    router.push("/admin/dashboard?toast=login-success");
    router.refresh();
  }

  return (
    <form action={submit} className="grid gap-4">
      <input name="email" type="email" required className="field" placeholder="Admin email" />
      <input name="password" type="password" required className="field" placeholder="Password" />
      <div className="min-h-6 text-sm font-bold text-[#777777]">{error}</div>
      <button className="button-pill button-dark w-fit" disabled={loading}>
        {loading ? "Checking..." : "Login"}
      </button>
    </form>
  );
}
