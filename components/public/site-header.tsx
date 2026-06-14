import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="container-shell flex items-center justify-between border-b border-[#d9d9d9] py-5 text-[0.76rem] font-black uppercase tracking-[0.12em]">
      <Link href="/" className="leading-none">
        Ridho Firdaus
      </Link>
      <nav className="flex items-center gap-2 text-[#777777] sm:gap-4">
        <Link className="transition hover:text-[#050505]" href="/portfolio">
          Work
        </Link>
        <span>/</span>
        <Link className="transition hover:text-[#050505]" href="/about">
          About
        </Link>
        <span>/</span>
        <Link className="transition hover:text-[#050505]" href="/contact">
          Contact
        </Link>
      </nav>
    </header>
  );
}
