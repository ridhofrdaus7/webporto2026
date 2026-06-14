"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/admin/toast";

/** Maps a `?toast=<key>` value to a variant + message. */
const TOAST_MESSAGES: Record<string, { variant: "success" | "error"; message: string }> = {
  "login-success": { variant: "success", message: "Berhasil login." },
  "project-created": { variant: "success", message: "Project berhasil dibuat." },
  "project-updated": { variant: "success", message: "Project berhasil diperbarui." },
  "project-deleted": { variant: "success", message: "Project berhasil dihapus." },
  "brand-created": { variant: "success", message: "Brand berhasil dibuat." },
  "brand-deleted": { variant: "success", message: "Brand berhasil dihapus." },
  "profile-saved": { variant: "success", message: "Profil berhasil disimpan." },
  "input-error": { variant: "error", message: "Input tidak valid. Periksa kembali." },
  error: { variant: "error", message: "Terjadi kesalahan. Silakan coba lagi." }
};

/**
 * Reads `?toast=<key>` from the URL, shows the matching toast once, then
 * removes the param so it does not re-fire on refresh/back navigation.
 */
export function ToastFromParams() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const handled = useRef<string | null>(null);

  const key = params.get("toast");

  useEffect(() => {
    if (!key || handled.current === key) return;
    handled.current = key;

    const entry = TOAST_MESSAGES[key];
    if (entry) toast[entry.variant](entry.message);

    const next = new URLSearchParams(params);
    next.delete("toast");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [key, params, pathname, router, toast]);

  return null;
}
