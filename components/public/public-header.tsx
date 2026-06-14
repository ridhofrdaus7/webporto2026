import Link from "next/link";

export function PublicHeader() {
  return (
    <header className="container-shell flex items-center justify-between gap-2 border-b border-[#d9d9d9] py-5 text-[0.58rem] font-black uppercase tracking-[0.02em] sm:text-[0.75rem] sm:tracking-[0.08em]">
      <Link href="/" className="leading-none">
        RIDHO FIRDAUS
      </Link>
      <nav className="flex min-w-0 items-center gap-1.5 text-[#050505] sm:gap-7">
        <Link href="/portfolio">WORK</Link>
        <span className="text-[#777777]">/</span>
        <Link href="/about">ABOUT</Link>
        <span className="text-[#777777]">/</span>
        <Link href="/contact">CONTACT</Link>
      </nav>
    </header>
  );
}
