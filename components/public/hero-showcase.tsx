"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { Reveal } from "@/components/scroll/reveal";
import { RevealText } from "@/components/scroll/reveal-text";

export type HeroItem = {
  src: string;
  title: string;
  slug: string;
};

type Slot = {
  left?: string;
  right?: string;
  top: string;
  width: string;
  aspect: string;
  /** px the image drifts as the hero scrolls past (parallax depth). */
  drift: number;
  delay: number;
  priority?: boolean;
};

/* All squares (1:1). Editorial rhythm comes from varied sizes and
   staggered tops/offsets — tidy, but not a rigid grid. */

/** Scattered positions inside the LEFT gutter column. */
const LEFT_SLOTS: Slot[] = [
  { right: "4%", top: "7%", width: "clamp(175px,18vw,250px)", aspect: "1 / 1", drift: -40, delay: 0.06, priority: true },
  { left: "0%", top: "41%", width: "clamp(150px,16vw,215px)", aspect: "1 / 1", drift: 24, delay: 0.2 },
  { right: "16%", top: "72%", width: "clamp(120px,13vw,175px)", aspect: "1 / 1", drift: -16, delay: 0.3 }
];

/** Scattered positions inside the RIGHT gutter column. */
const RIGHT_SLOTS: Slot[] = [
  { left: "2%", top: "12%", width: "clamp(175px,18vw,250px)", aspect: "1 / 1", drift: 46, delay: 0.12, priority: true },
  { right: "2%", top: "44%", width: "clamp(120px,13vw,175px)", aspect: "1 / 1", drift: -26, delay: 0.16 },
  { left: "6%", top: "70%", width: "clamp(150px,16vw,215px)", aspect: "1 / 1", drift: 38, delay: 0.28 }
];

function FloatingImage({
  item,
  slot,
  progress,
  reduce
}: {
  item: HeroItem;
  slot: Slot;
  progress: MotionValue<number>;
  reduce: boolean;
}) {
  const y = useTransform(progress, [0, 1], [0, slot.drift]);

  return (
    <motion.div
      className="pointer-events-auto absolute z-0"
      style={{
        top: slot.top,
        width: slot.width,
        ...(slot.left !== undefined ? { left: slot.left } : {}),
        ...(slot.right !== undefined ? { right: slot.right } : {}),
        ...(reduce ? {} : { y })
      }}
    >
      <motion.div
        className="w-full"
        initial={reduce ? false : { opacity: 0, scale: 0.92, y: 26 }}
        animate={reduce ? false : { opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: slot.delay }}
      >
        <Link
          href={`/portfolio/${item.slug}`}
          aria-label={item.title}
          className="group block w-full overflow-hidden shadow-[0_22px_55px_-24px_rgba(0,0,0,0.5)] ring-1 ring-black/5"
        >
          <div className="relative w-full" style={{ aspectRatio: slot.aspect }}>
            <Image
              src={item.src}
              alt={item.title}
              fill
              sizes="(min-width: 1024px) 26vw, 0px"
              priority={slot.priority}
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
}

export function HeroShowcase({
  items,
  eyebrow,
  headline,
  subline
}: {
  items: HeroItem[];
  eyebrow: string;
  headline: ReactNode;
  subline: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  // Interleave so both gutters stay balanced when there are few items.
  const leftItems = items.filter((_, i) => i % 2 === 0).slice(0, LEFT_SLOTS.length);
  const rightItems = items.filter((_, i) => i % 2 === 1).slice(0, RIGHT_SLOTS.length);

  return (
    <section
      ref={ref}
      className="relative mx-auto grid min-h-[90vh] w-full max-w-[1320px] grid-cols-1 items-center overflow-hidden px-5 lg:grid-cols-[27%_1fr_27%] lg:items-stretch"
    >
      {/* Left gutter — large screens only */}
      <div className="pointer-events-none relative hidden h-full lg:block">
        {leftItems.map((item, index) => (
          <FloatingImage
            key={`${item.slug}-${index}`}
            item={item}
            slot={LEFT_SLOTS[index]}
            progress={scrollYProgress}
            reduce={reduce}
          />
        ))}
      </div>

      {/* Centered headline */}
      <div className="relative z-10 flex items-center justify-center py-20 lg:py-0">
        <div className="flex max-w-[34rem] flex-col items-center text-center">
          <RevealText as="p" className="eyebrow">
            {eyebrow}
          </RevealText>
          <RevealText as="h1" className="display-serif mt-5" delay={0.06}>
            {headline}
          </RevealText>
          <Reveal delay={0.14}>
            <p className="mt-6 flex items-center justify-center text-sm font-bold tracking-wide text-ink sm:text-base">
              {subline}
              <span className="ml-2 inline-block h-4 w-2 animate-pulse bg-ink" aria-hidden />
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/portfolio" className="button-pill button-dark">
                View Works
              </Link>
              <Link href="/contact" className="button-pill button-light">
                Hire Me
              </Link>
            </div>
          </Reveal>

          {/* Mobile / tablet fallback — a tidy thumbnail grid */}
          {items.length > 0 && (
            <div className="mt-14 grid w-full grid-cols-2 gap-3 sm:grid-cols-4 lg:hidden">
              {items.slice(0, 4).map((item) => (
                <Link
                  key={item.slug}
                  href={`/portfolio/${item.slug}`}
                  aria-label={item.title}
                  className="group block overflow-hidden ring-1 ring-black/5"
                >
                  <div className="relative aspect-square w-full">
                    <Image
                      src={item.src}
                      alt={item.title}
                      fill
                      sizes="(min-width: 640px) 25vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right gutter — large screens only */}
      <div className="pointer-events-none relative hidden h-full lg:block">
        {rightItems.map((item, index) => (
          <FloatingImage
            key={`${item.slug}-${index}`}
            item={item}
            slot={RIGHT_SLOTS[index]}
            progress={scrollYProgress}
            reduce={reduce}
          />
        ))}
      </div>
    </section>
  );
}
