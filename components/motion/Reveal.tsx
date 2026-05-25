"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

// Fade + rise, once. Default triggers on scroll-into-view; `mount` triggers on load,
// for above-the-fold content. Easing matches the .row hover curve in globals.css.
// Honors prefers-reduced-motion by rendering a plain element (no transform, no opacity step).
export function Reveal({
  children,
  delay = 0,
  y = 12,
  mount = false,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  mount?: boolean;
  className?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  const target = { opacity: 1, y: 0 };
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      animate={mount ? target : undefined}
      whileInView={mount ? undefined : target}
      viewport={mount ? undefined : { once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.55, delay, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
