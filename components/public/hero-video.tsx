import Link from "next/link";
import type { ReactNode } from "react";
import { Typewriter } from "@/components/public/typewriter";
import { Reveal } from "@/components/scroll/reveal";
import { RevealText } from "@/components/scroll/reveal-text";

type HeroVideoProps = {
  videoSrc: string;
  eyebrow: string;
  headline: ReactNode;
  subline: string;
};

export function HeroVideo({ videoSrc, eyebrow, headline, subline }: HeroVideoProps) {
  return (
    <section className="hero-video relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden text-white">
      {/* Full-bleed 16:9 video — fills the whole hero, no blur, no bars */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      {/* Tint + focused scrim keep the white headline readable over the video */}
      <div className="absolute inset-0 bg-black/25" />
      <div className="hero-scrim absolute inset-0" />

      {/* Content */}
      <div className="container-shell relative z-10 flex flex-col items-center py-24 text-center [text-shadow:0_1px_2px_rgba(0,0,0,0.6),0_4px_22px_rgba(0,0,0,0.45)]">
        <RevealText
          as="p"
          className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/75 sm:text-sm"
        >
          {eyebrow}
        </RevealText>
        <RevealText as="h1" className="display-serif mt-5 max-w-[16ch] text-white" delay={0.06}>
          {headline}
        </RevealText>
        <Reveal delay={0.18}>
          <p className="mt-6 text-sm font-bold tracking-wide text-white/90 sm:text-base">
            <Typewriter text={subline} />
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/portfolio" className="cta-stamp cta-stamp--solid cta-stamp--on-video">
              View Works
              <span className="cta-arrow" aria-hidden>
                →
              </span>
            </Link>
            <Link href="/contact" className="cta-stamp cta-stamp--ghost cta-stamp--on-video">
              Hire Me
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
