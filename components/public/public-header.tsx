"use client";

import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import Link from "next/link";
import { useRef, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * Smart, transparent header.
 * - `overlay` (homepage): floats over the hero video as a hairline, text white.
 * - `solid` (other pages): transparent over paper with token text + a spacer.
 * Hides on scroll-down, reveals on scroll-up; frosts into a paper bar once
 * scrolled. Respects reduced motion (never hides).
 */
export function PublicHeader({ variant = "solid" }: { variant?: "overlay" | "solid" }) {
  const reduce = useReducedMotion() ?? false;
  const { scrollY } = useScroll();
  const lastY = useRef(0);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = lastY.current;
    setScrolled(y > 8);
    if (!reduce) {
      if (y > 96 && y > prev) setHidden(true);
      else if (y < prev) setHidden(false);
    }
    lastY.current = y;
  });

  const overlayTop = variant === "overlay" && !scrolled;

  return (
    <>
      <motion.header
        animate={{ y: hidden ? "-100%" : "0%" }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className={`header-shell fixed inset-x-0 top-0 z-50 border-b ${
          scrolled
            ? "header-frost border-line text-ink"
            : overlayTop
              ? "border-white/15 bg-transparent text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.55)]"
              : "border-line bg-transparent text-ink"
        }`}
      >
        <div className="container-shell flex items-center justify-between gap-2 py-5 text-[0.58rem] font-black uppercase tracking-[0.02em] sm:text-[0.75rem] sm:tracking-[0.08em]">
          <Link href="/" className="leading-none">
            RIDHO FIRDAUS
          </Link>
          <div className="flex min-w-0 items-center gap-2 sm:gap-5">
            <nav className="flex min-w-0 items-center gap-1.5 sm:gap-7">
              <Link href="/portfolio" className="transition-opacity hover:opacity-60">
                WORK
              </Link>
              <span className="opacity-40">/</span>
              <Link href="/about" className="transition-opacity hover:opacity-60">
                ABOUT
              </Link>
              <span className="opacity-40">/</span>
              <Link href="/contact" className="transition-opacity hover:opacity-60">
                CONTACT
              </Link>
            </nav>
            <ThemeToggle onDark={overlayTop} />
          </div>
        </div>
      </motion.header>

      {/* Reserve space on pages where the fixed header isn't meant to overlay content */}
      {variant === "solid" && <div aria-hidden className="h-[76px]" />}
    </>
  );
}
