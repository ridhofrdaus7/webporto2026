import { motion } from "framer-motion";

/**
 * Pre-created motion components, keyed by tag name. Building them at
 * module scope (instead of `motion.create()` during render) keeps the
 * component identity stable and satisfies the static-components rule.
 */
export const MOTION_TAGS = {
  div: motion.div,
  p: motion.p,
  span: motion.span,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  aside: motion.aside,
  section: motion.section,
  article: motion.article,
  figure: motion.figure,
  li: motion.li,
  ul: motion.ul
} as const;

export type MotionTagName = keyof typeof MOTION_TAGS;
