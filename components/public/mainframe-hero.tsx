"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { siteContact } from "@/lib/site";

/**
 * Full-screen video hero (Mainframe). The background clip does NOT autoplay —
 * it scrubs forward/back with horizontal pointer movement (mouse move, or drag
 * on touch). Over it: a blurred intro label, a typed line, and action pills.
 *
 * Adapted for this Next.js portfolio: the video is scoped to the hero (not fixed
 * to the whole page) so it scrolls away cleanly into the rest of the homepage;
 * type uses the site font stack (no external webfont CDN); copy + CTAs + contact
 * are the homepage hero's own content. The shared PublicHeader renders the navbar.
 */

const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260530_042513_df96a13b-6155-4f6e-8b93-c9dee66fba08.mp4";
const SENSITIVITY = 0.8;
const EMAIL = siteContact.email;
const TYPED_LINE = "Creative, story & production for brands that want to stand out.";

// Hero CTAs — the same two actions this homepage hero used before.
const CTAS = [
  { label: "View Works", href: "/portfolio" },
  { label: "Hire Me", href: "/contact" }
];

/** Reveals `text` one character at a time after `startDelay`. Skips straight to
 *  the full string when the visitor prefers reduced motion. */
function useTypewriter(text: string, speed = 38, startDelay = 600) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let i = 0;
    let interval: ReturnType<typeof setInterval> | undefined;

    // All state writes live inside the timer callbacks (async), never in the
    // effect body — keeps typing off the initial render path.
    const start = setTimeout(
      () => {
        if (reduce) {
          setDisplayed(text);
          setDone(true);
          return;
        }
        setDisplayed("");
        setDone(false);
        interval = setInterval(() => {
          i += 1;
          setDisplayed(text.slice(0, i));
          if (i >= text.length) {
            if (interval) clearInterval(interval);
            setDone(true);
          }
        }, speed);
      },
      reduce ? 0 : startDelay
    );

    return () => {
      clearTimeout(start);
      if (interval) clearInterval(interval);
    };
  }, [text, speed, startDelay]);

  return { displayed, done };
}

export function MainframeHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const prevX = useRef<number | null>(null);
  const targetTime = useRef(0);
  const seeking = useRef(false);

  const [pillsVisible, setPillsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const { displayed, done } = useTypewriter(TYPED_LINE);

  // Pills fade/slide in shortly after load — independent of the typing.
  useEffect(() => {
    const t = setTimeout(() => setPillsVisible(true), 400);
    return () => clearTimeout(t);
  }, []);

  // Seek the video to the queued target, coalescing requests so we never flood
  // the decoder: one seek in flight at a time; onSeeked re-fires if the target
  // has since moved.
  const seek = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    seeking.current = true;
    video.currentTime = targetTime.current;
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;

    const resetAnchor = (event: PointerEvent) => {
      prevX.current = event.clientX;
    };

    const onMove = (event: PointerEvent) => {
      const duration = video.duration;
      if (!duration || Number.isNaN(duration)) return;
      if (prevX.current === null) {
        prevX.current = event.clientX;
        return;
      }
      const delta = event.clientX - prevX.current;
      prevX.current = event.clientX;
      const offset = (delta / window.innerWidth) * SENSITIVITY * duration;
      targetTime.current = Math.min(Math.max(targetTime.current + offset, 0), duration);
      if (!seeking.current) seek();
    };

    const onSeeked = () => {
      if (Math.abs(video.currentTime - targetTime.current) > 0.01) {
        seek();
      } else {
        seeking.current = false;
      }
    };

    // Render the first frame (muted + preload isn't guaranteed to paint one).
    const paintFirstFrame = () => {
      if (video.currentTime === 0) video.currentTime = 0.001;
    };

    video.addEventListener("seeked", onSeeked);
    // `loadedmetadata` fires even under preload="metadata"; nudging currentTime
    // there fetches + paints the first frame so the hero isn't blank pre-scrub.
    video.addEventListener("loadedmetadata", paintFirstFrame);
    video.addEventListener("loadeddata", paintFirstFrame);

    // Only listen for pointer scrubbing (and pay the seek/decode cost) while the
    // hero is actually on screen — once it's scrolled past, all of this stops.
    let listening = false;
    const enable = () => {
      if (listening) return;
      listening = true;
      window.addEventListener("pointerdown", resetAnchor, { passive: true });
      window.addEventListener("pointermove", onMove, { passive: true });
    };
    const disable = () => {
      if (!listening) return;
      listening = false;
      prevX.current = null;
      window.removeEventListener("pointerdown", resetAnchor);
      window.removeEventListener("pointermove", onMove);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) enable();
        else disable();
      },
      { threshold: 0.05 }
    );
    io.observe(section);

    return () => {
      io.disconnect();
      disable();
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("loadedmetadata", paintFirstFrame);
      video.removeEventListener("loadeddata", paintFirstFrame);
    };
  }, [seek]);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — no-op */
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative flex h-screen w-full flex-col justify-end overflow-hidden px-5 pb-12 sm:px-8 md:justify-center md:px-10 md:pb-0"
    >
      <style>{cursorCss}</style>

      {/* Scrub-controlled background video. `preload="metadata"` keeps the initial
          load light — frames are fetched on demand (CloudFront serves byte ranges)
          as the visitor scrubs, instead of downloading the whole clip up front. */}
      <video
        ref={videoRef}
        className="absolute inset-0 z-0 h-full w-full object-cover"
        style={{ objectPosition: "70% center" }}
        src={VIDEO_SRC}
        muted
        playsInline
        preload="metadata"
        aria-hidden
      />

      {/* ── Hero content ───────────────────────────────────────── */}
      <div className="relative z-10 max-w-xl">
        <div
          className="pointer-events-none mb-5 select-none sm:mb-6"
          style={{
            fontSize: "clamp(18px, 4vw, 26px)",
            lineHeight: 1.3,
            fontWeight: 400,
            color: "#000",
            filter: "blur(4px)"
          }}
        >
          Portfolio / Creative Designer
          <br />
          Built with intent.
        </div>

        <p
          className="mb-5 sm:mb-6"
          style={{
            color: "#000",
            fontSize: "clamp(18px, 4vw, 26px)",
            lineHeight: 1.35,
            fontWeight: 400,
            minHeight: "54px"
          }}
        >
          {displayed}
          {!done && (
            <span className="tw-cursor ml-[2px] inline-block h-[1.1em] w-[2px] bg-black align-middle" />
          )}
        </p>

        <div
          className="flex flex-wrap gap-y-1"
          style={{
            opacity: pillsVisible ? 1 : 0,
            transform: pillsVisible ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.4s ease, transform 0.4s ease"
          }}
        >
          {CTAS.map((pill) => (
            <Link
              key={pill.label}
              href={pill.href}
              className="mx-[0.2em] mb-[0.4em] inline-flex items-center justify-center whitespace-nowrap rounded-full border border-black/10 bg-white px-4 py-[0.3em] text-[13px] text-black transition-colors duration-200 hover:bg-black hover:text-white sm:px-5 sm:text-[15px]"
            >
              {pill.label}
            </Link>
          ))}

          <button
            type="button"
            onClick={copyEmail}
            aria-label={`Copy email ${EMAIL}`}
            className="mx-[0.2em] mb-[0.4em] inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white bg-transparent px-4 py-[0.3em] text-[13px] text-white transition-colors duration-200 hover:bg-white hover:text-black sm:gap-3 sm:px-5 sm:text-[15px]"
          >
            <span>
              Reach us:{" "}
              <span className="underline underline-offset-1">{EMAIL}</span>
            </span>
            {copied ? (
              <span className="text-[11px] font-medium">Copied!</span>
            ) : (
              <CopyIcon />
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

function CopyIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

const cursorCss = `
  @keyframes blink { 0%, 100% { opacity: 1 } 50% { opacity: 0 } }
  .tw-cursor { animation: blink 1s step-end infinite; }
`;
