"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Grid3x3, LayoutGrid, type LucideIcon, Square } from "lucide-react";
import { useMemo, useState } from "react";
import { ProjectCard } from "@/components/public/project-card";
import type { ProjectCardSummary } from "@/lib/portfolio";

/**
 * Card-size presets. `min` feeds an `auto-fill minmax()` track so the column
 * count follows the viewport automatically — bigger `min` = fewer, larger
 * cards. `sizes` is tuned to the real column count at each density (so
 * next/image doesn't under-fetch and blur), and `priority` eager-loads roughly
 * the first above-the-fold row for that density.
 */
const SIZES: {
  key: string;
  label: string;
  Icon: LucideIcon;
  min: string;
  sizes: string;
  priority: number;
}[] = [
  {
    key: "large",
    label: "Large cards",
    Icon: Square,
    min: "27rem",
    sizes: "(min-width: 768px) 50vw, calc(100vw - 40px)",
    priority: 2
  },
  {
    key: "comfort",
    label: "Medium cards",
    Icon: LayoutGrid,
    min: "20rem",
    sizes: "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, calc(100vw - 40px)",
    priority: 3
  },
  {
    key: "compact",
    label: "Compact cards",
    Icon: Grid3x3,
    min: "16rem",
    sizes: "(min-width: 1280px) 25vw, (min-width: 768px) 33vw, calc(100vw - 40px)",
    priority: 4
  }
];

/**
 * Above this many visible cards we skip the per-card layout animation on a
 * density flip: animating dozens of boxes at once thrashes layout on the very
 * interaction meant to feel fast. Filtered views are usually well under this.
 */
const LAYOUT_ANIMATION_MAX = 80;

const TITLE_SCALE =
  "text-xl @[20rem]:text-2xl @[30rem]:text-3xl @[38rem]:text-4xl";

export function PortfolioBrowser({
  projects,
  categories
}: {
  projects: ProjectCardSummary[];
  categories: { id: string; name: string; slug: string }[];
}) {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  // Default to the medium density: shows more work per screen for quick
  // scanning, while still allowing enlarge (Large) or shrink (Compact).
  const [sizeIndex, setSizeIndex] = useState(1);
  const reduce = useReducedMotion() ?? false;

  const filtered = useMemo(() => {
    return projects.filter((project) => {
      const matchesCategory = category === "all" || project.category.slug === category;
      const search = [
        project.title,
        project.clientName,
        project.category.name,
        project.catalog?.brandName,
        project.catalog?.name
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesCategory && search.includes(query.toLowerCase());
    });
  }, [category, projects, query]);

  const size = SIZES[sizeIndex];

  return (
    <div>
      <div className="mb-10 flex flex-col gap-4 border-y border-line py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory("all")}
            className={`button-pill ${category === "all" ? "button-dark" : "button-light"}`}
          >
            All
          </button>
          {categories.map((item) => (
            <button
              key={item.id}
              onClick={() => setCategory(item.slug)}
              className={`button-pill ${category === item.slug ? "button-dark" : "button-light"}`}
            >
              {item.name}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Card-size control — enlarge / shrink the grid to browse faster. */}
          <div className="flex items-center gap-2" role="group" aria-label="Card size">
            <span className="eyebrow mr-1 hidden text-muted sm:inline">Size</span>
            {SIZES.map((option, index) => {
              const isActive = index === sizeIndex;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setSizeIndex(index)}
                  aria-pressed={isActive}
                  aria-label={option.label}
                  title={option.label}
                  className={`flex size-11 items-center justify-center rounded-pill border transition-colors ${
                    isActive
                      ? "border-ink bg-ink text-card"
                      : "border-line text-ink hover:border-ink"
                  }`}
                >
                  <option.Icon className="size-4" strokeWidth={1.6} aria-hidden />
                </button>
              );
            })}
          </div>

          <input
            className="field lg:w-64"
            placeholder="Search work"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="border border-line bg-card p-10 text-xl font-black uppercase">
          No published projects found.
        </div>
      ) : (
        <div
          className="grid gap-x-6 gap-y-12"
          style={{
            gridTemplateColumns: `repeat(auto-fill, minmax(min(${size.min}, 100%), 1fr))`
          }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {filtered.map((project, index) => (
              <motion.div
                key={project.id}
                layout={!reduce && filtered.length <= LAYOUT_ANIMATION_MAX}
                initial={false}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                transition={{ duration: reduce ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <ProjectCard
                  project={project}
                  priority={index < size.priority}
                  sizes={size.sizes}
                  titleClassName={TITLE_SCALE}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
