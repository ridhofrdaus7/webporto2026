"use client";

import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────────────────────
   STICKY CHAPTER NAVIGATION  (the homepage's primary nav)

   A cinematic "card deck": each chapter is a full-bleed editorial
   teaser that links into the portfolio. As you scroll, the next
   chapter rises from below while the current one recedes + tilts
   into depth — a stacking, scroll-scrubbed sequence that pulls the
   visitor down through the work and resolves on the About chapter.

   Rebuilt with framer-motion + CSS `position: sticky` (NOT GSAP) so
   it rides the page's single Lenis like every other scroll primitive
   here (ConvergeHeadline / FeaturedSlider) instead of spawning a
   second smooth-scroll engine. Collapses to a static editorial list
   under prefers-reduced-motion.
   ────────────────────────────────────────────────────────────── */

export type Chapter = {
  id: string;
  /** Two-digit chapter number, e.g. "01". */
  index: string;
  /** Small caps label above the title. */
  kicker: string;
  /** Display title — "\n" splits into stacked lines. */
  title: string;
  /** One-line teaser ("apa & untuk siapa"). */
  teaser: string;
  /** Category / context label, top-right. */
  meta: string;
  /** Destination of the teaser link. */
  href: string;
  /** Call-to-action label. */
  cta: string;
  /** Full-bleed cover image. */
  image: string;
  /**
   * Render as a "bare" card: the image is a finished, self-contained light
   * composition (e.g. a hero banner with its own name/copy), so it's framed
   * `object-contain` on the dark stage with NO scrim or overlay text — only a
   * small CTA. Used for the About chapter's Hello banner.
   */
  bare?: boolean;
};

/** Extra dwell (in screens) held on the final card before the deck unpins. */
const HOLD = 0.75;

/** Hidden cards start this far below their frame — clears the dark margin so
    no sliver of the next card peeks at the viewport bottom before it rises. */
const START_Y = "118%";

type PanelProps = {
  chapter: Chapter;
  i: number;
  total: number;
  seg: number;
  progress: MotionValue<number>;
  priority: boolean;
};

function ChapterPanel({ chapter, i, total, seg, progress, priority }: PanelProps) {
  const isFirst = i === 0;
  const isLast = i === total - 1;

  // Each transition spans one `seg` of progress. Card i RISES during the
  // (i-1 → i) step, then RECEDES during the (i → i+1) step.
  //
  // Every input range MUST stay inside [0, 1] and be strictly increasing:
  // framer-motion offloads scroll-linked values to a native ScrollTimeline,
  // whose WAAPI keyframe offsets ARE these progress values — an offset < 0 or
  // > 1 throws "Offsets must be ... in the range [0,1]". Progress is itself
  // always 0–1, so clamping the edges here is purely behaviour-preserving:
  // card 0 never rises (held at 0%) and the last card never recedes (held full).
  const riseStart = isFirst ? 0 : (i - 1) * seg;
  const riseEnd = isFirst ? seg : i * seg;
  const recedeStart = i * seg;
  const recedeEnd = Math.min((i + 1) * seg, 1);

  const y = useTransform(progress, [riseStart, riseEnd], isFirst ? ["0%", "0%"] : [START_Y, "0%"]);
  const imgScale = useTransform(progress, [riseStart, riseEnd], isFirst ? [1, 1] : [1.16, 1]);
  const scale = useTransform(progress, [recedeStart, recedeEnd], isLast ? [1, 1] : [1, 0.9]);
  const rotate = useTransform(progress, [recedeStart, recedeEnd], isLast ? [0, 0] : [0, -3.5]);
  const veil = useTransform(progress, [recedeStart, recedeEnd], isLast ? [0, 0] : [0, 0.55]);

  const lines = chapter.title.split("\n");

  return (
    <motion.article
      className="chapter-card absolute inset-0 overflow-hidden rounded-[24px] will-change-transform"
      style={{ y, scale, rotate, zIndex: i + 1 }}
    >
      <Link
        href={chapter.href}
        aria-label={`${chapter.kicker} — ${lines.join(" ")}`}
        className="group block h-full w-full"
      >
        {chapter.bare ? (
          <>
            {/* A finished, self-contained light banner — framed on the dark stage
                (object-contain), no scrim/overlay, just a small CTA. */}
            <div className="chapter-card-blank absolute inset-0" aria-hidden />
            {chapter.image && (
              <motion.div className="absolute inset-0" style={{ scale: imgScale }}>
                <Image
                  src={chapter.image}
                  alt={`Ridho Firdaus — ${lines.join(" ")}`}
                  fill
                  priority={priority}
                  sizes="(min-width: 1180px) 1180px, 94vw"
                  className="select-none object-contain p-3 sm:p-6"
                  draggable={false}
                />
              </motion.div>
            )}
            <div className="absolute inset-x-0 bottom-5 flex justify-center sm:bottom-8">
              <span className="inline-flex items-center gap-2.5 rounded-full border border-black/15 bg-white/85 px-5 py-2.5 text-[0.68rem] font-black uppercase tracking-[0.14em] text-black backdrop-blur-sm transition-colors duration-300 group-hover:border-black group-hover:bg-black group-hover:text-white">
                {chapter.cta}
                <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>
                  →
                </span>
              </span>
            </div>
          </>
        ) : (
          <>
            {/* Slow Ken-Burns push as the card rises into place. A missing image
                falls back to a textured dark panel (typographic card) — never an
                empty <Image src> (which throws in Next.js). */}
            {chapter.image ? (
              <motion.div className="absolute inset-0" style={{ scale: imgScale }}>
                <Image
                  src={chapter.image}
                  alt=""
                  fill
                  priority={priority}
                  sizes="(min-width: 1180px) 1180px, 94vw"
                  className="select-none object-cover"
                  draggable={false}
                />
              </motion.div>
            ) : (
              <div className="chapter-card-blank absolute inset-0" aria-hidden />
            )}

            <div className="chapter-scrim absolute inset-0" />

            <div className="relative flex h-full flex-col justify-between p-6 sm:p-10 lg:p-14">
              <div className="flex items-start justify-between gap-4">
                <span className="text-4xl font-black leading-none tabular-nums text-white/90 sm:text-6xl">
                  {chapter.index}
                </span>
                <div className="text-right">
                  <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.14em] text-white/75 sm:text-xs">
                    {chapter.kicker}
                  </p>
                  <p className="mt-1 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-white/45">
                    {chapter.meta}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-black uppercase leading-[0.84] tracking-tight text-white text-[clamp(2.7rem,8vw,6.5rem)]">
                  {lines.map((line, idx) => (
                    <span key={idx} className="block">
                      {line}
                    </span>
                  ))}
                </h3>
                <p className="mt-5 max-w-[44ch] text-sm font-medium leading-relaxed text-white/85 sm:text-lg">
                  {chapter.teaser}
                </p>
                <span className="mt-7 inline-flex items-center gap-2.5 rounded-full border border-white/40 bg-white/10 px-5 py-2.5 text-[0.68rem] font-black uppercase tracking-[0.14em] text-white backdrop-blur-sm transition-colors duration-300 group-hover:border-white group-hover:bg-white group-hover:text-black">
                  {chapter.cta}
                  <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>
                    →
                  </span>
                </span>
              </div>
            </div>
          </>
        )}

        {/* Darkens the whole card as it recedes behind the next one. */}
        <motion.div
          className="pointer-events-none absolute inset-0 bg-black"
          style={{ opacity: veil }}
          aria-hidden
        />
      </Link>
    </motion.article>
  );
}

/** Reduced-motion / fallback: a calm vertical stack of the same chapters as
    plain editorial link cards — no sticky, no transforms. */
function StaticChapterList({ chapters }: { chapters: Chapter[] }) {
  return (
    <section className="chapter-stage relative">
      <div className="container-shell grid gap-5 py-16 sm:py-24">
        {chapters.map((chapter) => (
          <Link
            key={chapter.id}
            href={chapter.href}
            className="group relative block overflow-hidden rounded-[22px]"
          >
            <div className="relative aspect-[16/10] sm:aspect-[16/7]">
              {chapter.image ? (
                <Image
                  src={chapter.image}
                  alt={chapter.bare ? "Ridho Firdaus — Graphic Designer & Video Editor" : ""}
                  fill
                  sizes="(min-width: 1180px) 1100px, 94vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="chapter-card-blank absolute inset-0" aria-hidden />
              )}
              {!chapter.bare && (
                <>
                  <div className="chapter-scrim absolute inset-0" />
                  <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-10">
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-3xl font-black tabular-nums text-white/90 sm:text-5xl">
                        {chapter.index}
                      </span>
                      <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.14em] text-white/75">
                        {chapter.kicker}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-black uppercase leading-[0.86] text-white text-[clamp(2rem,6vw,4rem)]">
                        {chapter.title.split("\n").map((line, idx) => (
                          <span key={idx} className="block">
                            {line}
                          </span>
                        ))}
                      </h3>
                      <p className="mt-3 max-w-[44ch] text-sm font-medium text-white/85">
                        {chapter.teaser}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function StickyCardNav({ chapters }: { chapters: Chapter[] }) {
  const reduce = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });

  const total = chapters.length;
  // Progress per one-screen step. The deck pins for (total-1 + HOLD) screens,
  // so each transition is exactly one screen → the rail can map an index back
  // to a scroll offset with a clean `i * innerHeight`.
  const seg = 1 / Math.max(total - 1 + HOLD, 1);

  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (total < 2) return;
    const idx = Math.round(p / seg);
    setActive(Math.min(Math.max(idx, 0), total - 1));
  });

  if (reduce || total < 2) {
    return <StaticChapterList chapters={chapters} />;
  }

  const goTo = (i: number) => {
    const top = (sectionRef.current?.offsetTop ?? 0) + i * window.innerHeight;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      className="chapter-stage relative"
      style={{ height: `${(total + HOLD) * 100}svh` }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="chapter-vignette pointer-events-none absolute inset-0 z-0" />

        {/* Chapter rail — orientation + jump navigation (desktop). */}
        <nav
          aria-label="Portfolio chapters"
          className="absolute right-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-3.5 lg:flex"
        >
          {chapters.map((chapter, i) => (
            <button
              key={chapter.id}
              type="button"
              onClick={() => goTo(i)}
              aria-current={active === i}
              aria-label={`Go to chapter ${chapter.index} — ${chapter.kicker}`}
              className="group flex items-center gap-3"
            >
              <span
                className={cn(
                  "text-[0.62rem] font-black uppercase tracking-[0.14em] tabular-nums transition-colors duration-300",
                  active === i ? "text-white" : "text-white/35 group-hover:text-white/70"
                )}
              >
                {chapter.index}
              </span>
              <span
                className={cn(
                  "h-px transition-all duration-300",
                  active === i ? "w-9 bg-white" : "w-4 bg-white/30 group-hover:w-6 group-hover:bg-white/60"
                )}
              />
            </button>
          ))}
        </nav>

        {/* The deck. */}
        <div className="relative z-10 flex h-full items-center justify-center px-4 sm:px-8">
          <div className="relative h-[86svh] w-[min(94vw,1180px)]">
            {chapters.map((chapter, i) => (
              <ChapterPanel
                key={chapter.id}
                chapter={chapter}
                i={i}
                total={total}
                seg={seg}
                progress={scrollYProgress}
                priority={i === 0}
              />
            ))}
          </div>
        </div>

        {/* Scroll cue — present only on the opening card. */}
        <div
          className={cn(
            "pointer-events-none absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 text-[0.6rem] font-black uppercase tracking-[0.22em] text-white/55 transition-opacity duration-500",
            active === 0 ? "opacity-100" : "opacity-0"
          )}
        >
          <span className="inline-block animate-bounce" aria-hidden>
            ↓
          </span>
          Scroll
        </div>
      </div>
    </section>
  );
}
