"use client";

import Image from "next/image";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent
} from "react";

export type FeaturedItem = {
  slug: string;
  title: string;
  clientName: string;
  year: number;
  thumbnailUrl: string;
  /** "Apa & untuk siapa" — short brand description. */
  blurb: string;
};

const PERSPECTIVE = 1350;
const THICKNESS_LAYERS = [-3, -2, -1, 0, 1, 2, 3];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function smoothstep(value: number) {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}

export function FeaturedSlider({ items }: { items: FeaturedItem[] }) {
  const reduceMotion = useReducedMotion() ?? false;
  const carouselItems = items.slice(0, 7);
  const itemCount = carouselItems.length;
  const stageRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const frameRef = useRef(0);
  const progressRef = useRef(0);
  const impulseRef = useRef(0);
  const pointerRef = useRef({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    dragging: false,
    lastX: 0
  });
  const [cardSize, setCardSize] = useState(320);

  useEffect(() => {
    const updateSize = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const responsiveSize = viewportWidth < 640 ? viewportWidth * 0.62 : viewportWidth * 0.24;
      const heightLimit = viewportHeight * 0.46;
      setCardSize(Math.round(clamp(Math.min(responsiveSize, heightLimit), 190, 340)));
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    if (itemCount === 0) return;

    const render = () => {
      const stageWidth = stageRef.current?.clientWidth ?? window.innerWidth;
      const pointer = pointerRef.current;
      const centerDepth = cardSize < 260 ? 300 : 390;
      const adjacentDepth = cardSize < 260 ? 130 : 170;

      pointer.x += (pointer.targetX - pointer.x) * 0.075;
      pointer.y += (pointer.targetY - pointer.y) * 0.075;

      if (!reduceMotion && !pointer.dragging) {
        progressRef.current += 0.0018 + impulseRef.current;
      }
      impulseRef.current *= 0.92;

      const progress = progressRef.current;
      const rounded = Math.round(progress);
      const distanceFromCenter = progress - rounded;
      const easedDistance =
        Math.sign(distanceFromCenter) *
        (Math.pow(Math.abs(distanceFromCenter) * 2, 3.6) / 2);
      const activeIndex = rounded + easedDistance;
      const halfCount = itemCount / 2;

      cardRefs.current.forEach((card, index) => {
        if (!card) return;

        let offset = index - activeIndex;
        while (offset > halfCount) offset -= itemCount;
        while (offset < -halfCount) offset += itemCount;

        const absoluteOffset = Math.abs(offset);
        const direction = Math.sign(offset) || 1;

        if (absoluteOffset > 3.05) {
          card.style.visibility = "hidden";
          return;
        }

        card.style.visibility = "visible";

        const gap = clamp(stageWidth * 0.022, 18, 38);
        let x = 0;
        let z = 0;
        let rotationY = 0;

        if (absoluteOffset <= 1) {
          const eased = smoothstep(absoluteOffset);
          x = direction * eased * (cardSize + gap);
          z = centerDepth + eased * (adjacentDepth - centerDepth);
          rotationY = eased * 128;
        } else if (absoluteOffset <= 2) {
          const eased = smoothstep(absoluteOffset - 1);
          const edgeDepth = -70;
          const edgeScale = PERSPECTIVE / (PERSPECTIVE - edgeDepth);
          const edgeX = (stageWidth / 2 + cardSize * 0.12) / edgeScale - cardSize / 2;

          x = direction * (cardSize + gap + eased * (edgeX - cardSize - gap));
          z = adjacentDepth + eased * (edgeDepth - adjacentDepth);
          rotationY = 128 + eased * 47;
        } else {
          const eased = smoothstep(absoluteOffset - 2);
          const startDepth = -70;
          const endDepth = -280;
          const startScale = PERSPECTIVE / (PERSPECTIVE - startDepth);
          const endScale = PERSPECTIVE / (PERSPECTIVE - endDepth);
          const startX =
            (stageWidth / 2 + cardSize * 0.12) / startScale - cardSize / 2;
          const endX = (stageWidth / 2 + cardSize) / endScale + cardSize / 2;

          x = direction * (startX + eased * (endX - startX));
          z = startDepth + eased * (endDepth - startDepth);
          rotationY = 175 + eased * 20;
        }

        const centerFactor = Math.max(0, 1 - absoluteOffset);
        const tiltX = -pointer.y * 11 * centerFactor;
        const tiltY = pointer.x * 14 * centerFactor;

        card.style.zIndex = String(1000 + Math.round(z));
        card.style.opacity = String(clamp(1.2 - absoluteOffset * 0.18, 0.48, 1));
        card.style.transform = [
          `translate3d(${x.toFixed(2)}px, 0, ${z.toFixed(2)}px)`,
          `rotateX(${tiltX.toFixed(2)}deg)`,
          `rotateY(${(-direction * rotationY + tiltY).toFixed(2)}deg)`,
          "rotateZ(-2.5deg)"
        ].join(" ");
      });

      frameRef.current = requestAnimationFrame(render);
    };

    frameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frameRef.current);
  }, [cardSize, itemCount, reduceMotion]);

  const updatePointerTarget = useCallback((clientX: number, clientY: number) => {
    const bounds = stageRef.current?.getBoundingClientRect();
    if (!bounds) return;

    pointerRef.current.targetX = clamp(
      (clientX - bounds.left - bounds.width / 2) / (bounds.width / 2),
      -1,
      1
    );
    pointerRef.current.targetY = clamp(
      (clientY - bounds.top - bounds.height / 2) / (bounds.height / 2),
      -1,
      1
    );
  }, []);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointerRef.current.dragging = true;
    pointerRef.current.lastX = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    updatePointerTarget(event.clientX, event.clientY);

    if (pointerRef.current.dragging) {
      const deltaX = event.clientX - pointerRef.current.lastX;
      progressRef.current -= deltaX / Math.max(cardSize * 1.4, 280);
      impulseRef.current = 0;
      pointerRef.current.lastX = event.clientX;
    }
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointerRef.current.dragging = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    impulseRef.current += clamp(delta * 0.000035, -0.018, 0.018);
  };

  const nudge = (direction: number) => {
    progressRef.current += direction;
    impulseRef.current = 0;
  };

  if (itemCount === 0) return null;

  return (
    <div className="relative min-h-[100svh] w-full overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.08),transparent_34%)]" />

      <div className="absolute inset-x-0 top-0 z-[1200] flex items-start justify-between p-5 sm:p-7">
        <div>
          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-white/45">
            Featured Work / Interactive Archive
          </p>
          <p className="mt-2 max-w-[26ch] text-sm font-semibold leading-snug text-white/80">
            Drag or scroll through selected brand covers.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => nudge(-1)}
            className="grid size-10 place-items-center rounded-full border border-white/15 bg-white/5 text-lg text-white/80 backdrop-blur-md transition hover:bg-white hover:text-black"
            aria-label="Previous featured work"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => nudge(1)}
            className="grid size-10 place-items-center rounded-full border border-white/15 bg-white/5 text-lg text-white/80 backdrop-blur-md transition hover:bg-white hover:text-black"
            aria-label="Next featured work"
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={stageRef}
        className="relative flex h-[100svh] min-h-[620px] touch-pan-y cursor-grab items-center justify-center active:cursor-grabbing"
        style={{ perspective: `${PERSPECTIVE}px` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={() => {
          pointerRef.current.targetX = 0;
          pointerRef.current.targetY = 0;
        }}
        onWheel={handleWheel}
      >
        <div
          className="relative"
          style={{
            width: cardSize,
            height: cardSize,
            transform: cardSize < 260 ? "translateY(20px)" : undefined,
            transformStyle: "preserve-3d"
          }}
        >
          {carouselItems.map((item, index) => {
            const edition = String(index + 1).padStart(2, "0");
            const id = item.slug
              .split("-")
              .map((part) => part.slice(0, 3).toUpperCase())
              .join("-");

            return (
              <div
                key={item.slug}
                ref={(element) => {
                  cardRefs.current[index] = element;
                }}
                className="absolute inset-0 will-change-transform"
                style={{
                  width: cardSize,
                  height: cardSize,
                  transformStyle: "preserve-3d"
                }}
              >
                {THICKNESS_LAYERS.map((depth, layerIndex) => {
                  const isBack = layerIndex === 0;
                  const isFront = layerIndex === THICKNESS_LAYERS.length - 1;

                  if (!isFront && !isBack) {
                    return (
                      <div
                        key={depth}
                        className="absolute inset-0 rounded-[18px] border border-white/5 bg-[#171717]"
                        style={{ transform: `translateZ(${depth}px)` }}
                      />
                    );
                  }

                  if (isBack) {
                    return (
                      <div
                        key={depth}
                        className="absolute inset-0 overflow-hidden rounded-[18px] border border-white/15 bg-[#090909]"
                        style={{
                          transform: `translateZ(${depth}px) rotateY(180deg)`,
                          backfaceVisibility: "hidden",
                          boxShadow: "0 25px 70px rgba(0,0,0,0.55)"
                        }}
                      >
                        <Image
                          src={item.thumbnailUrl}
                          alt=""
                          fill
                          sizes={`${cardSize}px`}
                          className="scale-110 object-cover opacity-35 blur-xl"
                        />
                        <div className="absolute inset-0 bg-black/65" />
                        <div className="absolute inset-0 z-10 flex flex-col justify-between p-5 font-mono sm:p-6">
                          <div className="flex justify-between border-b border-white/15 pb-3 text-[9px] uppercase tracking-widest text-white/50">
                            <span className="font-bold text-white/85">{item.clientName}</span>
                            <span>[Case Study]</span>
                          </div>

                          <div className="space-y-2 text-[9px] uppercase sm:text-[10px]">
                            <div className="flex justify-between border-b border-white/10 pb-2">
                              <span className="text-white/40">Index</span>
                              <span>#{edition} / #{String(itemCount).padStart(2, "0")}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/10 pb-2">
                              <span className="text-white/40">Format</span>
                              <span>Brand Cover / 1:1</span>
                            </div>
                            <div className="flex justify-between border-b border-white/10 pb-2">
                              <span className="text-white/40">Published</span>
                              <span>{item.year}</span>
                            </div>
                            <p className="pt-2 normal-case leading-relaxed text-white/65">
                              {item.blurb}
                            </p>
                          </div>

                          <div className="border-t border-white/15 pt-3 text-[8px] uppercase tracking-wider text-emerald-400">
                            ● Status: Portfolio verified
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={depth}
                      className="absolute inset-0 overflow-hidden rounded-[18px] border border-white/15 bg-[#090909]"
                      style={{
                        transform: `translateZ(${depth}px)`,
                        backfaceVisibility: "hidden",
                        boxShadow:
                          "inset 0 1px 1px rgba(255,255,255,0.15), 0 25px 70px rgba(0,0,0,0.55)"
                      }}
                    >
                      <Image
                        src={item.thumbnailUrl}
                        alt={item.title}
                        fill
                        priority={index === 0}
                        sizes={`${cardSize}px`}
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-transparent to-black/90" />

                      <Link
                        href={`/portfolio/${item.slug}`}
                        className="absolute inset-0 z-10 flex flex-col justify-between p-5 sm:p-6"
                        aria-label={`View ${item.title}`}
                        draggable={false}
                      >
                        <div className="flex justify-between font-mono text-[9px] uppercase tracking-wider text-white/75">
                          <span className="rounded-full border border-white/15 bg-black/25 px-2 py-1 backdrop-blur-md">
                            Edition {edition} / {String(itemCount).padStart(2, "0")}
                          </span>
                          <span>#{id}</span>
                        </div>

                        <div>
                          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-white/55">
                            {item.year} / Brand Portfolio
                          </p>
                          <h2 className="mt-2 text-2xl font-black uppercase leading-none tracking-tight sm:text-3xl">
                            {item.clientName}
                          </h2>
                          <div className="mt-3 flex items-center justify-between border-t border-white/15 pt-3 font-mono text-[8px] uppercase tracking-wider text-white/55">
                            <span className="max-w-[70%] truncate">{item.title}</span>
                            <span>Open ↗</span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <p className="pointer-events-none absolute bottom-5 left-1/2 z-[1200] -translate-x-1/2 font-mono text-[8px] uppercase tracking-[0.22em] text-white/35">
        Continuous 3D cylinder / {String(itemCount).padStart(2, "0")} selected works
      </p>
    </div>
  );
}
