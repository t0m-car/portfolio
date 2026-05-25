import type { Metadata } from "next";
import Link from "next/link";
import { SignatureLab } from "@/components/lab/SignatureLab";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "A name, as a signature · Tom Cardoen",
  description:
    "A generative signature: type a name and get one drawn stroke, in 3D. Deterministic, different for everyone.",
};

export default function SignaturePage() {
  return (
    <main className="stage">
      <Link href="/lab" className="mono text-meta text-ink-3 hover:text-ink">
        ← Lab
      </Link>

      <Reveal mount>
        <header className="pt-8">
          <p className="eyebrow">Lab</p>
          <h1 className="mt-2">A name, as a signature</h1>
          <p className="mt-6 max-w-[56ch] text-lead text-ink-2">
            Type a name. It gets one signature stroke, the same every time, different for everyone.
          </p>
        </header>
      </Reveal>

      <Reveal mount delay={0.08} className="mt-10">
        <SignatureLab />
      </Reveal>

      <div className="mt-12 flex max-w-[64ch] flex-col gap-9">
        <Reveal>
          <section className="!mt-0">
            <p className="eyebrow mb-2">The idea</p>
            <p className="text-body leading-[1.75] text-ink-2">
              Everyone’s name could carry a mark. Not a font, not initials in a circle, but a stroke
              that looks drawn. This makes one for any name you type, then spins it in 3D.
            </p>
          </section>
        </Reveal>

        <Reveal>
          <section className="!mt-0">
            <p className="eyebrow mb-2">How it works</p>
            <p className="text-body leading-[1.75] text-ink-2">
              The name seeds a small generator. It picks a style (cursive, angular, a looping
              monogram), a palette, and a pen angle, then lays down a path and inks it as a 3D ribbon.
              Same name, same stroke, every visit. Nothing is stored, nothing is random.
            </p>
          </section>
        </Reveal>

        <Reveal>
          <section className="!mt-0">
            <p className="eyebrow mb-2">Where it goes</p>
            <p className="text-body leading-[1.75] text-ink-2">
              This is the demo from the home page, given room to breathe and a download button. Let the
              same idea spill across a whole surface and you get the{" "}
              <Link href="/lab/ink" className="border-b border-rule-2 text-ink-2 hover:text-ink">
                ink field
              </Link>{" "}
              next door.
            </p>
          </section>
        </Reveal>
      </div>
    </main>
  );
}
