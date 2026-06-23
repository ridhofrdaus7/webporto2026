"use client";

import Image from "next/image";
import {
  motion,
  type MotionValue,
  useReducedMotion,
  useScroll,
  useTransform
} from "framer-motion";
import Lenis from "lenis";
import { useEffect, useRef, useState } from "react";

export type FeaturedItem = {
  slug: string;
  title: string;
  clientName: string;
  year: number;
  thumbnailUrl: string;
  /** "Apa & untuk siapa" — short brand description. */
  blurb: string;
};

type ColumnProps = {
  covers: string[];
  y: MotionValue<number>;
  /** Starting vertical offset (Tailwind class), tuned so the column always
      fills the clipped window as it parallaxes. */
  offset: string;
  className?: string;
  priority?: boolean;
};

/**
 * One vertical lane of covers. The whole lane is translated by `y` (a scroll
 * transform), so giving each lane a different `y` range produces the depth.
 */
function ParallaxColumn({ covers, y, offset, className, priority }: ColumnProps) {
  return (
    <motion.div
      style={{ y }}
      className={`relative flex w-1/2 min-w-0 flex-col gap-[2vh] lg:w-1/4 ${offset} ${className ?? ""}`}
    >
      {covers.map((src, index) => (
        <div
          key={index}
          className="relative h-[58vh] w-full overflow-hidden rounded-[10px] bg-surface-muted"
        >
          <Image
            src={src}
            alt=""
            fill
            priority={priority && index === 0}
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="pointer-events-none select-none object-cover"
            draggable={false}
          />
        </div>
      ))}
    </motion.div>
  );
}

/**
 * Cinematic parallax gallery — four vertical columns of brand covers drifting
 * at different speeds as you scroll, on top of Lenis-smoothed scrolling. The
 * imagery is purely a visual experience: covers are not linked anywhere. Falls
 * back to a static grid when the visitor prefers reduced motion.
 */
export function FeaturedSlider({ items }: { items: FeaturedItem[] }) {
  const gallery = useRef<HTMLDivElement | null>(null);
  const reduce = useReducedMotion() ?? false;
  const [height, setHeight] = useState(0);

  const { scrollYProgress } = useScroll({
    target: gallery,
    offset: ["start end", "end start"]
  });

  // Each lane travels a different distance → parallax depth. Ranges are tuned
  // against the column height below so no empty gaps appear while in view.
  const y1 = useTransform(scrollYProgress, [0, 1], [0, height * 1.8]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, height * 3.0]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, height * 1.2]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, height * 2.6]);

  useEffect(() => {
    let lenis: Lenis | undefined;
    let raf = 0;

    if (!reduce) {
      lenis = new Lenis({ lerp: 0.09 });
      const loop = (time: number) => {
        lenis?.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    const onResize = () => setHeight(window.innerHeight);
    onResize();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
      lenis?.destroy();
    };
  }, [reduce]);

  const covers = items.map((item) => item.thumbnailUrl).filter(Boolean);
  if (covers.length === 0) return null;

  // Five covers per lane, cycled (with a staggered start per lane) so the same
  // cover rarely sits beside itself even when the archive is small.
  const PER = 5;
  const lane = (laneIndex: number) =>
    Array.from({ length: PER }, (_, k) => covers[(laneIndex * 2 + k) % covers.length]);

  // Reduced motion → a calm, fully-visible static grid (no Lenis, no parallax).
  if (reduce) {
    return (
      <section className="relative w-full overflow-hidden bg-paper py-16 text-ink">
        <GalleryHeading count={covers.length} />
        <div className="grid grid-cols-2 gap-3 px-[2vw] sm:grid-cols-3 lg:grid-cols-4">
          {covers.slice(0, 8).map((src, index) => (
            <div
              key={index}
              className="relative aspect-[4/5] w-full overflow-hidden rounded-[10px] bg-surface-muted"
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full overflow-hidden bg-paper text-ink">
      <GalleryHeading count={covers.length} />

      <div
        ref={gallery}
        className="relative flex h-[175vh] gap-[2.2vw] overflow-hidden px-[2.2vw] pb-[2.2vw]"
      >
        <ParallaxColumn covers={lane(0)} y={y1} offset="-top-[51%]" priority />
        <ParallaxColumn covers={lane(1)} y={y2} offset="-top-[86%]" />
        <ParallaxColumn covers={lane(2)} y={y3} offset="-top-[40%]" className="hidden lg:flex" />
        <ParallaxColumn covers={lane(3)} y={y4} offset="-top-[74%]" className="hidden lg:flex" />
      </div>
    </section>
  );
}

function GalleryHeading({ count }: { count: number }) {
  return (
    <div className="flex items-end justify-between gap-4 px-[2.2vw] pb-7 pt-12 sm:pt-16">
      <div>
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-muted">
          Featured Work
        </p>
      </div>
      <p className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-muted">
        ({String(count).padStart(2, "0")})
      </p>
    </div>
  );
}
