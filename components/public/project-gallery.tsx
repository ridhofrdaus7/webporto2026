"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { A11y, EffectCoverflow, Keyboard, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";

type GalleryMedia = {
  mediaUrl: string;
  altText: string;
  mediaType: "image" | "video";
};

/**
 * Coverflow carousel of a project's media. Slides fan out in 3D as you drag,
 * swipe, or use the arrows / keyboard; the centered asset reads full-strength
 * while its neighbours tilt away. Clicking any slide pops it open full-size in
 * an animated lightbox. Colours come from design tokens (var(--color-*)) so the
 * whole thing flips cleanly in dark mode. Built on Swiper + Framer Motion.
 */
export function ProjectGallery({ gallery }: { gallery: GalleryMedia[] }) {
  const [lightbox, setLightbox] = useState<GalleryMedia | null>(null);
  const [active, setActive] = useState(0);

  // While the popup is open: lock the page scroll and close on Escape.
  useEffect(() => {
    if (!lightbox) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox]);

  if (gallery.length === 0) return null;

  const items = gallery;
  const count = items.length;
  // Loop needs a few slides to fill the coverflow ring without gaps; below that
  // we keep it static so Swiper doesn't warn or jump.
  const loop = count > 3;
  const current = items[Math.min(active, count - 1)];

  return (
    <>
      {/* Token-driven styling for the Swiper internals (bullets, arrows, slide
          box). Kept in one place so the JSX below stays clean. */}
      <style>{css}</style>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="project-coverflow relative w-full"
      >
        <Swiper
          effect="coverflow"
          grabCursor
          centeredSlides
          slidesPerView="auto"
          loop={loop}
          keyboard={{ enabled: true }}
          coverflowEffect={{
            rotate: 38,
            stretch: 0,
            depth: 120,
            modifier: 1,
            slideShadows: true
          }}
          pagination={{ clickable: true }}
          navigation={{ nextEl: ".coverflow-next", prevEl: ".coverflow-prev" }}
          onSlideChange={(swiper) => setActive(swiper.realIndex)}
          modules={[EffectCoverflow, Pagination, Navigation, Keyboard, A11y]}
          className="coverflow-swiper"
        >
          {items.map((media, index) => (
            <SwiperSlide key={`${media.mediaUrl}-${index}`} className="coverflow-slide">
              <button
                type="button"
                onClick={() => setLightbox(media)}
                aria-label={`Open ${media.altText || `item ${index + 1}`} full size`}
                className="relative block h-full w-full overflow-hidden rounded-[18px] bg-surface-muted outline-none ring-ink/50 focus-visible:ring-2 sm:rounded-[24px]"
              >
                {media.mediaType === "video" ? (
                  <video
                    src={media.mediaUrl}
                    className="h-full w-full object-cover"
                    muted
                    loop
                    playsInline
                    autoPlay
                  />
                ) : (
                  <Image
                    src={media.mediaUrl}
                    alt={media.altText}
                    fill
                    sizes="(min-width: 768px) 460px, 82vw"
                    priority={index < 2}
                    className="object-cover"
                    draggable={false}
                  />
                )}
              </button>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Prev / next controls — hidden for a single asset. */}
        {count > 1 && (
          <>
            <button
              type="button"
              className="coverflow-prev coverflow-arrow left-1 sm:left-3"
              aria-label="Previous"
            >
              <ChevronLeft className="size-6" strokeWidth={1.75} aria-hidden />
            </button>
            <button
              type="button"
              className="coverflow-next coverflow-arrow right-1 sm:right-3"
              aria-label="Next"
            >
              <ChevronRight className="size-6" strokeWidth={1.75} aria-hidden />
            </button>
          </>
        )}
      </motion.div>

      {/* Caption + counter for the centered slide. */}
      <div className="mt-6 flex items-end justify-between gap-4 px-1">
        <p className="max-w-[70%] truncate text-sm font-semibold text-neutral-700">
          {current.altText || "Untitled"}
        </p>
        <span className="shrink-0 font-mono text-[11px] tracking-[0.2em] text-muted">
          {String(Math.min(active, count - 1) + 1).padStart(2, "0")} /{" "}
          {String(count).padStart(2, "0")}
        </span>
      </div>

      <Lightbox media={lightbox} onClose={() => setLightbox(null)} />
    </>
  );
}

const css = `
  .project-coverflow .coverflow-swiper {
    width: 100%;
    padding-bottom: 3rem;
  }
  .project-coverflow .coverflow-slide {
    width: clamp(260px, 72vw, 460px);
    height: clamp(320px, 54vh, 560px);
  }
  .project-coverflow .swiper-pagination-bullet {
    background-color: var(--color-ink);
    opacity: 0.28;
  }
  .project-coverflow .swiper-pagination-bullet-active {
    opacity: 1;
  }
  .project-coverflow .coverflow-arrow {
    position: absolute;
    top: calc(50% - 1.5rem);
    z-index: 10;
    display: flex;
    height: 2.75rem;
    width: 2.75rem;
    align-items: center;
    justify-content: center;
    transform: translateY(-50%);
    border-radius: 9999px;
    border: 1px solid var(--color-line);
    background: color-mix(in srgb, var(--color-card) 82%, transparent);
    color: var(--color-ink);
    backdrop-filter: blur(6px);
    transition: background-color 0.2s ease, transform 0.2s ease;
  }
  .project-coverflow .coverflow-arrow:hover {
    background: var(--color-ink);
    color: var(--color-paper);
  }
  .project-coverflow .swiper-button-disabled {
    opacity: 0.35;
    pointer-events: none;
  }
`;

/** Animated full-size popup. Click the backdrop, the ✕, or press Esc to close. */
function Lightbox({
  media,
  onClose
}: {
  media: GalleryMedia | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {media && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={media.altText || "Full size"}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm sm:p-10"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-2xl text-white backdrop-blur-md transition hover:bg-white hover:text-black"
          >
            ×
          </button>

          {media.mediaType === "video" ? (
            <motion.video
              src={media.mediaUrl}
              controls
              autoPlay
              onClick={(event) => event.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
              className="max-h-[92vh] max-w-[94vw] rounded-xl shadow-2xl"
            />
          ) : (
            <motion.img
              src={media.mediaUrl}
              alt={media.altText}
              onClick={(event) => event.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
              className="max-h-[92vh] max-w-[94vw] rounded-xl object-contain shadow-2xl"
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
