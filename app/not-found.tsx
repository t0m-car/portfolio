import Link from "next/link";
import { RandomLabLink } from "@/components/lab/RandomLabLink";
import { Reveal } from "@/components/motion/Reveal";

// Global 404 (App Router). Renders inside the root layout, so it inherits the fonts,
// theme and paper background. Kept text-first and link-light to match the site.
export default function NotFound() {
  return (
    <main className="stage">
      <Reveal mount>
        <p className="eyebrow">404</p>
        <h1 className="mt-2">This page doesn’t exist.</h1>
        <p className="mt-6 max-w-[52ch] text-lead text-ink-2">
          The link is broken, renamed, or was never here in the first place. Happens.
        </p>
      </Reveal>
      <Reveal mount delay={0.08} className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link href="/" className="border-b border-rule-2 font-medium text-ink transition-colors hover:text-accent">
          ← Back home
        </Link>
        <RandomLabLink />
      </Reveal>
    </main>
  );
}
