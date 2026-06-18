import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function PublicHeader() {
  return (
    <header className="container-shell flex items-center justify-between gap-2 border-b border-line py-5 text-[0.58rem] font-black uppercase tracking-[0.02em] sm:text-[0.75rem] sm:tracking-[0.08em]">
      <Link href="/" className="leading-none">
        RIDHO FIRDAUS
      </Link>
      <div className="flex min-w-0 items-center gap-2 sm:gap-5">
        <nav className="flex min-w-0 items-center gap-1.5 text-ink sm:gap-7">
          <Link href="/portfolio">WORK</Link>
          <span className="text-muted">/</span>
          <Link href="/about">ABOUT</Link>
          <span className="text-muted">/</span>
          <Link href="/contact">CONTACT</Link>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
