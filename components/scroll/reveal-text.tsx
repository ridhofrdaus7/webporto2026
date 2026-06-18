"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { MOTION_TAGS, type MotionTagName } from "./motion-tags";

type RevealTextProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  /** Element to render (e.g. "h1", "h2", "p"). Defaults to a div. */
  as?: MotionTagName;
};

/**
 * Left-to-right clip "wipe" used for large editorial headings.
 * Robust to multi-line wrapping (animates clip-path, not height).
 */
export function RevealText({
  children,
  delay = 0,
  className,
  as = "div"
}: RevealTextProps) {
  const reduce = useReducedMotion();
  const MotionTag = MOTION_TAGS[as] as typeof motion.div;

  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      initial={{ clipPath: "inset(0 100% 0 0)", opacity: 0, y: "0.12em" }}
      whileInView={{ clipPath: "inset(0 0 0 0)", opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </MotionTag>
  );
}
