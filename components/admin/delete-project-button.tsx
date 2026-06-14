"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteProjectButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!confirm("Delete this project?")) return;
    setBusy(true);
    await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
    router.refresh();
    setBusy(false);
  }

  return (
    <button onClick={remove} disabled={busy} className="text-xs font-black uppercase tracking-[0.1em] text-red-700">
      {busy ? "Deleting" : "Delete"}
    </button>
  );
}
