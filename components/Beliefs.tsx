import { SectionHead } from "./SectionHead";
import { Reveal } from "./motion/Reveal";
import type { Content } from "@/lib/content";

export function Beliefs({ dict }: { dict: Content["notes"] }) {
  return (
    <section>
      <Reveal>
        <SectionHead kicker={dict.kicker} title={dict.title} />
      </Reveal>
      <Reveal delay={0.08} className="flex flex-col gap-4">
        {dict.items.map((it) => (
          <div
            key={it.n}
            className="grid grid-cols-[120px_1fr] gap-6 py-1 max-sm:grid-cols-1 max-sm:gap-1.5"
          >
            <span className="pt-1 font-mono text-meta tracking-[0.06em] text-ink-4">{it.n}</span>
            <p className="text-body leading-[1.6] text-ink-2">
              <strong className="font-medium text-ink">{it.title}</strong> {it.body}
            </p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
