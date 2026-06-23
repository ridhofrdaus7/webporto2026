"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

type GalleryMedia = {
  mediaUrl: string;
  altText: string;
  mediaType: "image" | "video";
};

/**
 * Interactive horizontal hover-expand gallery. Every asset sits as a narrow
 * strip; hovering or focusing one expands it smoothly while the rest shrink,
 * revealing a dark gradient + a short caption that fades in. Clicking an asset
 * pops it open full-size in an animated lightbox. Built on Framer Motion.
 */
export function ProjectGallery({ gallery }: { gallery: GalleryMedia[] }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState<GalleryMedia | null>(null);

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

  // The hover-expand reads best with a handful of strips; keep the strongest few.
  const items = gallery.slice(0, 9);

  // A single asset has nothing to expand against — show it on its own (still
  // clickable to open full-size).
  if (items.length === 1) {
    const only = items[0];
    return (
      <>
        <button
          type="button"
          onClick={() => setLightbox(only)}
          aria-label="View full size"
          className="relative block aspect-[1.7/1] w-full overflow-hidden rounded-[20px] bg-surface-muted sm:rounded-[32px]"
        >
          {only.mediaType === "video" ? (
            <video
              src={only.mediaUrl}
              className="h-full w-full object-cover"
              muted
              loop
              playsInline
              autoPlay
            />
          ) : (
            <Image
              src={only.mediaUrl}
              alt={only.altText}
              fill
              sizes="calc(100vw - 40px)"
              priority
              className="object-cover"
            />
          )}
        </button>
        <Lightbox media={lightbox} onClose={() => setLightbox(null)} />
      </>
    );
  }

  const count = items.length;
  // Keep the open panel at ~60% of the row no matter how many assets there are.
  const activeGrow = Math.max(4, (count - 1) * 1.5);

  return (
    <>
      <div className="flex h-[clamp(320px,54vh,600px)] w-full gap-2 sm:gap-3">
        {items.map((media, index) => {
          const isActive = index === active;
          return (
            <motion.button
              type="button"
              key={`${media.mediaUrl}-${index}`}
              onClick={() => setLightbox(media)}
              onHoverStart={() => setActive(index)}
              onFocus={() => setActive(index)}
              aria-label={`Open ${media.altText || `image ${index + 1}`}`}
              aria-pressed={isActive}
              className="group relative h-full min-w-0 basis-0 cursor-pointer overflow-hidden rounded-[18px] bg-surface-muted outline-none ring-ink/40 focus-visible:ring-2 sm:rounded-[30px]"
              initial={false}
              animate={{ flexGrow: isActive ? activeGrow : 1 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              {media.mediaType === "video" ? (
                <video
                  src={media.mediaUrl}
                  className="absolute inset-0 h-full w-full object-cover"
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
                  sizes="(min-width: 768px) 62vw, 82vw"
                  priority={index === 0}
                  className="object-cover"
                />
              )}

              <AnimatePresence>
                {isActive && (
                  <motion.div
                    key="overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/65 via-black/10 to-transparent p-5 sm:p-7"
                  >
                    <div className="flex items-end justify-between gap-3 text-white">
                      <p className="max-w-[78%] truncate text-left text-sm font-semibold sm:text-base">
                        {media.altText || "Untitled"}
                      </p>
                      <span className="shrink-0 font-mono text-[11px] tracking-[0.2em] text-white/70">
                        {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      <Lightbox media={lightbox} onClose={() => setLightbox(null)} />
    </>
  );
}

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
