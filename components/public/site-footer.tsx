import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#d9d9d9] py-8">
      <div className="container-shell flex flex-col gap-4 text-[0.75rem] font-extrabold uppercase tracking-[0.12em] text-[#777777] sm:flex-row sm:items-center sm:justify-between">
        <p>Ridho Firdaus - Portfolio 2026</p>
        <div className="flex gap-4">
          <Link href="/admin/login">Admin</Link>
          <Link href="/contact">Hire Me</Link>
        </div>
      </div>
    </footer>
  );
}
