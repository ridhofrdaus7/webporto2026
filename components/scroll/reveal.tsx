"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { MOTION_TAGS, type MotionTagName } from "./motion-tags";

type RevealProps = {
  children: ReactNode;
  /** Seconds to wait before animating (use for stagger). */
  delay?: number;
  /** Initial vertical offset in px. */
  y?: number;
  className?: string;
  /** Element to render (e.g. "div", "aside", "li"). Defaults to a div. */
  as?: MotionTagName;
};

/**
 * Editorial fade-and-rise. Triggers once as the element scrolls into
 * view. Collapses to a plain wrapper when the user prefers reduced
 * motion.
 */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  as = "div"
}: RevealProps) {
  const reduce = useReducedMotion();
  const MotionTag = MOTION_TAGS[as] as typeof motion.div;

  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </MotionTag>
  );
}
