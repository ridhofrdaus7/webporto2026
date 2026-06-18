"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export type FeaturedItem = {
  slug: string;
  title: string;
  clientName: string;
  year: number;
  thumbnailUrl: string;
};

const INTERVAL_MS = 1000;
const EASE = [0.22, 1, 0.36, 1] as const;

export function FeaturedSlider({ items }: { items: FeaturedItem[] }) {
  const reduce = useReducedMotion() ?? false;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    // Auto-advance every 3s. Paused on hover; disabled for reduced motion.
    if (reduce || paused || items.length <= 1) return;
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % items.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [reduce, paused, items.length]);

  if (items.length === 0) return null;
  const safeIndex = index % items.length;
  const current = items[safeIndex];

  return (
    <div
      className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Cover slider */}
      <div className="editorial-image relative aspect-[1.05/1] overflow-hidden">
        <AnimatePresence initial={false}>
          <motion.div
            key={current.slug}
            className="absolute inset-0"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.01 }}
            transition={{ duration: reduce ? 0.25 : 0.6, ease: EASE }}
          >
            <Link
              href={`/portfolio/${current.slug}`}
              aria-label={current.title}
              className="block h-full w-full"
            >
              <Image
                src={current.thumbnailUrl}
                alt={current.title}
                fill
                sizes="(min-width: 1024px) 56vw, calc(100vw - 40px)"
                className="object-cover"
                priority={safeIndex === 0}
              />
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Brand title — vertically centered against the cover */}
      <div>
        <p className="eyebrow">Featured Work / {current.year}</p>
        <div className="relative mt-5 min-h-[4.5rem] sm:min-h-[6rem]">
          <AnimatePresence initial={false}>
            <motion.div
              key={current.slug}
              className="absolute inset-x-0 top-0"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
              transition={{ duration: reduce ? 0.2 : 0.35, ease: EASE }}
            >
              <h2 className="line-clamp-1 text-4xl font-black uppercase leading-none sm:text-6xl">
                {current.clientName}
              </h2>
              <p className="mt-3 line-clamp-1 text-sm font-bold uppercase tracking-wide text-muted">
                {current.title}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <Link href={`/portfolio/${current.slug}`} className="button-pill button-dark mt-8">
          View Case Study
        </Link>
      </div>
    </div>
  );
}
