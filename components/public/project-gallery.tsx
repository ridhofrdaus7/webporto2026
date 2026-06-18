"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

type GalleryMedia = {
  mediaUrl: string;
  altText: string;
  mediaType: "image" | "video";
};

export function ProjectGallery({ gallery }: { gallery: GalleryMedia[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const isOpen = activeIndex !== null;

  const close = useCallback(() => setActiveIndex(null), []);
  const show = useCallback(
    (next: number) => setActiveIndex((next + gallery.length) % gallery.length),
    [gallery.length]
  );

  useEffect(() => {
    if (!isOpen) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") setActiveIndex((current) => (current === null ? current : (current + 1) % gallery.length));
      if (event.key === "ArrowLeft") setActiveIndex((current) => (current === null ? current : (current - 1 + gallery.length) % gallery.length));
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, close, gallery.length]);

  if (gallery.length === 0) return null;

  const active = activeIndex === null ? null : gallery[activeIndex];

  return (
    <>
      <div className="grid gap-6">
        <button
          type="button"
          onClick={() => setActiveIndex(0)}
          className="editorial-image aspect-[1.85/1] block w-full cursor-zoom-in"
        >
          <Image
            src={gallery[0].mediaUrl}
            alt={gallery[0].altText}
            width={1600}
            height={900}
            sizes="calc(100vw - 40px)"
            priority
          />
        </button>

        {gallery.length > 1 && (
          <div className="grid gap-6 md:grid-cols-2">
            {gallery.slice(1).map((media, index) => {
              const realIndex = index + 1;
              return (
                <button
                  type="button"
                  key={`${media.mediaUrl}-${realIndex}`}
                  onClick={() => setActiveIndex(realIndex)}
                  className="editorial-image aspect-[1.25/1] block w-full cursor-zoom-in"
                >
                  {media.mediaType === "video" ? (
                    <video
                      src={media.mediaUrl}
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    <Image
                      src={media.mediaUrl}
                      alt={media.altText}
                      width={1100}
                      height={900}
                      sizes="(min-width: 768px) 50vw, calc(100vw - 40px)"
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {isOpen && active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.altText}
          onClick={close}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-8"
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-card/10 text-2xl font-bold text-white transition hover:bg-card/20"
          >
            ×
          </button>

          {gallery.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous"
                onClick={(event) => {
                  event.stopPropagation();
                  show(activeIndex - 1);
                }}
                className="absolute left-4 flex h-11 w-11 items-center justify-center rounded-full bg-card/10 text-2xl text-white transition hover:bg-card/20"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={(event) => {
                  event.stopPropagation();
                  show(activeIndex + 1);
                }}
                className="absolute right-4 bottom-4 flex h-11 w-11 items-center justify-center rounded-full bg-card/10 text-2xl text-white transition hover:bg-card/20 sm:bottom-auto sm:top-1/2"
              >
                ›
              </button>
            </>
          )}

          <div onClick={(event) => event.stopPropagation()} className="flex items-center justify-center">
            {active.mediaType === "video" ? (
              <video
                src={active.mediaUrl}
                controls
                autoPlay
                className="max-h-[90vh] max-w-[90vw] rounded-lg"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={active.mediaUrl}
                alt={active.altText}
                className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
