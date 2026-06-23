"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue
} from "framer-motion";
import { useRef } from "react";
import { MOTION_TAGS, type MotionTagName } from "./motion-tags";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────────────────────
   SCATTER → CONVERGE HEADLINE  (scroll-scrubbed, in-view)

   A drop-in replacement for a plain editorial heading: the letters
   start scattered (translate + rotate + 3D depth + scale + a brief
   focus-blur) and converge into place as the heading scrolls up into
   view, then hold once assembled. Reverses on scroll-up.

   Rides the page's existing Lenis-smoothed scroll (the homepage already
   runs one Lenis via FeaturedSlider) — it never instantiates its own.

   Scatter is DETERMINISTIC (seeded sine hash, not Math.random) so the
   server and client render the same first frame — no hydration drift.
   Collapses to a plain heading under prefers-reduced-motion.
   ────────────────────────────────────────────────────────────── */

/** Progress point (0–1 across the in-view travel) at which letters finish assembling. */
const ASSEMBLE = 0.85;

/** Deterministic pseudo-random in [0, 1) from an integer seed. */
function noise(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** Deterministic signed value in [-1, 1] from a seed + channel salt. */
function spread(seed: number, salt: number) {
  return noise(seed * 1.7 + salt * 19.19) * 2 - 1;
}

type CharProps = {
  char: string;
  index: number;
  center: number;
  progress: MotionValue<number>;
};

function ConvergeChar({ char, index, center, progress }: CharProps) {
  const offset = index - center;

  // Structured drift (further-from-centre travels further) blended with
  // organic per-letter noise for a natural, non-mechanical scatter.
  const x = useTransform(progress, [0, ASSEMBLE], [offset * 16 + spread(index, 1) * 150, 0]);
  const y = useTransform(progress, [0, ASSEMBLE], [spread(index, 2) * 120, 0]);
  const rotate = useTransform(progress, [0, ASSEMBLE], [spread(index, 3) * 45, 0]);
  const rotateX = useTransform(progress, [0, ASSEMBLE], [spread(index, 4) * 70, 0]);
  const scale = useTransform(progress, [0, ASSEMBLE], [0.55, 1]);
  const opacity = useTransform(progress, [0, ASSEMBLE * 0.5], [0, 1]);

  // Focus-pull blur, but only while it matters: it resolves in the first
  // fifth of the scrub, then the filter is dropped entirely (cheaper than a
  // mounted blur(0px) layer across many letters — the main perf cost flagged
  // in review).
  const filter = useTransform(progress, (p) =>
    p >= 0.2 ? "none" : `blur(${(1 - p / 0.2) * 12}px)`
  );

  return (
    <motion.span
      aria-hidden
      // Framer Motion serialises the scroll-driven `opacity` motion value as a
      // string ("0") during SSR but as a number (0) on the client — visually
      // identical and self-corrected on the first rAF, so the attribute-level
      // hydration mismatch is suppressed rather than chased.
      suppressHydrationWarning
      className="inline-block will-change-transform"
      style={{ x, y, rotate, rotateX, scale, opacity, filter }}
    >
      {char}
    </motion.span>
  );
}

type ConvergeHeadlineProps = {
  /** Plain text to split into converging letters. */
  text: string;
  /** Heading element to render. Defaults to "h2". */
  as?: MotionTagName;
  className?: string;
};

/**
 * Editorial heading whose letters fly in from scattered positions and
 * converge as it scrolls into view. Renders a single heading element so
 * it slots in wherever a plain heading lives.
 */
export function ConvergeHeadline({ text, as = "h2", className }: ConvergeHeadlineProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({
    target: ref,
    // Converge as the heading rises from the bottom of the viewport up to
    // the vertical centre; clamps (holds assembled) past that point.
    offset: ["start end", "start center"]
  });

  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{text}</Tag>;
  }

  const MotionTag = MOTION_TAGS[as] as typeof motion.div;

  // Global character index of each word's first letter (spaces advance the
  // index too, keeping the scatter symmetric about the true centre).
  const center = (text.length - 1) / 2;
  const words = text.split(" ");
  const wordStart = (wordIndex: number) =>
    words.slice(0, wordIndex).reduce((sum, word) => sum + word.length + 1, 0);

  return (
    <MotionTag ref={ref} className={cn("scene-stage", className)} aria-label={text}>
      <span aria-hidden className="scene-3d">
        {words.map((word, wordIndex) => {
          const base = wordStart(wordIndex);
          const wordNode = (
            <span key={`w${wordIndex}`} className="inline-block whitespace-nowrap scene-3d">
              {Array.from(word).map((char, letterIndex) => (
                <ConvergeChar
                  key={letterIndex}
                  char={char}
                  index={base + letterIndex}
                  center={center}
                  progress={scrollYProgress}
                />
              ))}
            </span>
          );
          // A real (breakable) space between words lets long headlines wrap.
          return wordIndex < words.length - 1
            ? [wordNode, <span key={`s${wordIndex}`}> </span>]
            : wordNode;
        })}
      </span>
    </MotionTag>
  );
}
