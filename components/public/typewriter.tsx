"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

type TypewriterProps = {
  text: string;
  className?: string;
  /** ms per character */
  speed?: number;
  /** ms before typing starts */
  startDelay?: number;
};

/**
 * Types `text` out character by character. Shows the full text instantly
 * when the user prefers reduced motion. A blinking caret trails the text.
 */
export function Typewriter({
  text,
  className,
  speed = 40,
  startDelay = 700
}: TypewriterProps) {
  const reduce = useReducedMotion() ?? false;
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (reduce) return; // render shows full text; no animation
    let current = 0;
    let typeTimer: ReturnType<typeof setTimeout>;
    const startTimer = setTimeout(function step() {
      current += 1;
      setCount(current);
      if (current < text.length) {
        typeTimer = setTimeout(step, speed);
      }
    }, startDelay);
    return () => {
      clearTimeout(startTimer);
      clearTimeout(typeTimer);
    };
  }, [text, speed, startDelay, reduce]);

  const shown = reduce ? text : text.slice(0, count);
  const done = reduce || count >= text.length;

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden>{shown}</span>
      <span
        aria-hidden
        className={`ml-1 inline-block h-[1.05em] w-[0.45rem] translate-y-[0.12em] bg-current ${
          done ? "animate-pulse" : ""
        }`}
      />
    </span>
  );
}
