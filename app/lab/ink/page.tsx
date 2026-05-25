import type { Metadata } from "next";
import Link from "next/link";
import { InkLab } from "@/components/ink/InkLab";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "A name, made of ink · Tom Cardoen",
  description:
    "A generative ink field: type a name, get a flow-field shader that's yours and only yours. Deterministic, different for everyone.",
};

export default function InkLabPage() {
  return (
    <main className="stage">
      <Link href="/lab" className="mono text-meta text-ink-3 hover:text-ink">
        ← Lab
      </Link>

      <Reveal mount>
        <header className="pt-8">
          <p className="eyebrow">Lab</p>
          <h1 className="mt-2">A name, made of ink</h1>
          <p className="mt-6 max-w-[56ch] text-lead text-ink-2">
            Type a name. You get an ink field that’s yours and only yours: the same every time,
            different for everyone.
          </p>
        </header>
      </Reveal>

      <Reveal mount delay={0.08} className="mt-10">
        <InkLab />
      </Reveal>

      <div className="mt-12 flex max-w-[64ch] flex-col gap-9">
        <Reveal>
          <section className="!mt-0">
            <p className="eyebrow mb-2">The idea</p>
            <p className="text-body leading-[1.75] text-ink-2">
              On the homepage, your name becomes a signature: one stroke. This is the same trick pushed
              somewhere stranger. Not a line, but a whole field of ink, drifting. Same input, different
              medium.
            </p>
          </section>
        </Reveal>

        <Reveal>
          <section className="!mt-0">
            <p className="eyebrow mb-2">How it works</p>
            <p className="text-body leading-[1.75] text-ink-2">
              Your name is hashed into a handful of numbers. Those numbers set the knobs of a shader:
              which way the ink flows, how turbulent it gets, the two colours it lives between. Nothing
              is random at render time, so your ink never changes. Type “Marie” and you’ll never land
              on “Tom”.
            </p>
          </section>
        </Reveal>

        <Reveal>
          <section className="!mt-0">
            <p className="eyebrow mb-2">What it’s for</p>
            <p className="text-body leading-[1.75] text-ink-2">
              Nothing, yet, and I’m fine with that. I like that a name can carry a fingerprint that
              isn’t a number or a photo: something that feels made rather than assigned. If it ever
              earns a real job (a share card, an empty state, a mark that’s never twice the same), it’ll
              be because it looked good first.
            </p>
          </section>
        </Reveal>
      </div>
    </main>
  );
}
