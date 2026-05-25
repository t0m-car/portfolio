"use client";

import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { LiveStatus } from "./LiveStatus";
import type { Content } from "@/lib/content";

// Hero sits above the fold, so it gets a mount cascade rather than a scroll reveal.
// Easing matches the .row hover curve in globals.css; reduced-motion collapses to no movement.
export function Hero({ dict }: { dict: Content["hero"] }) {
  const reduced = useReducedMotion();
  const container: Variants = {
    hidden: {},
    show: { transition: reduced ? {} : { delayChildren: 0.05, staggerChildren: 0.08 } },
  };
  const item: Variants = {
    hidden: reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.2, 0.7, 0.2, 1] } },
  };

  return (
    <motion.header className="pt-8" variants={container} initial="hidden" animate="show">
      <motion.div variants={item} className="mb-7 flex items-center gap-2.5 text-sub text-ink-3">
        <Image
          src="/me.jpg"
          alt={dict.avatarAlt}
          width={28}
          height={28}
          priority
          className="size-7 shrink-0 rounded-full border-[0.5px] border-rule-2 object-cover"
        />
        <h1 className="text-sub font-normal tracking-normal text-ink-3">{dict.metaLine}</h1>
      </motion.div>
      <motion.h2 className="hero-statement" variants={item}>
        {dict.h1Line1}
        <br />
        {dict.h1Line2Pre}
        <span className="accent-grad">{dict.h1Line2Accent}</span>
        {dict.h1Line2Post}
      </motion.h2>
      <motion.p variants={item} className="mt-8 max-w-[56ch] text-lead text-ink-2">
        {dict.lede.map((seg, i) => {
          if (typeof seg === "string") return seg;
          if ("em" in seg) {
            return (
              <em
                key={i}
                className="border-b border-rule-2 pb-px font-medium not-italic text-ink"
              >
                {seg.em}
              </em>
            );
          }
          return (
            <a
              key={i}
              href={seg.href}
              target="_blank"
              rel="noreferrer"
              className="border-b border-rule-2 font-medium text-ink"
            >
              {seg.link}
            </a>
          );
        })}
      </motion.p>
      <motion.div variants={item}>
        <LiveStatus />
      </motion.div>
    </motion.header>
  );
}
