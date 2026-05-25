import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Lab · Tom Cardoen",
  description:
    "Small interactive, generative experiments. Type into them: each one is deterministic, the same every time.",
};

const EXPERIMENTS = [
  { href: "/lab/signature", title: "Signature", blurb: "Your name as a single drawn stroke, in 3D." },
  { href: "/lab/ink", title: "Ink", blurb: "Your name as a whole field of ink, drifting." },
];

export default function LabPage() {
  return (
    <main className="stage">
      <Link href="/" className="mono text-meta text-ink-3 hover:text-ink">
        ← Tom Cardoen
      </Link>

      <Reveal mount>
        <header className="pt-8">
          <p className="eyebrow">Lab</p>
          <h1 className="mt-2">Small experiments</h1>
          <p className="mt-6 max-w-[56ch] text-lead text-ink-2">
            Generative, interactive things I build to learn. Type into them. Each one is
            deterministic: same input, same result, every time.
          </p>
        </header>
      </Reveal>

      <Reveal mount delay={0.08} className="mt-10 grid gap-4 sm:grid-cols-2">
        {EXPERIMENTS.map((e) => (
          <Link
            key={e.href}
            href={e.href}
            className="group rounded-xl border border-rule bg-bg-elev p-5 transition-colors hover:border-rule-2"
          >
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-item font-medium text-ink">{e.title}</h2>
              <span className="text-ink-4 transition-colors group-hover:text-accent">→</span>
            </div>
            <p className="mt-1.5 text-sub text-ink-3">{e.blurb}</p>
          </Link>
        ))}
      </Reveal>
    </main>
  );
}
