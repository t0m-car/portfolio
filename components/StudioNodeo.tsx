import { SectionHead } from "./SectionHead";
import { Reveal } from "./motion/Reveal";
import type { Content } from "@/lib/content";

export function StudioNodeo({ dict }: { dict: Content["studio"] }) {
  return (
    <section>
      <Reveal>
        <SectionHead kicker={dict.kicker} title={dict.title} quiet={dict.quiet} />
      </Reveal>
      <Reveal delay={0.08}>
        <p className="max-w-[60ch] text-body leading-[1.6] text-ink-2">
          {dict.pre}
          <a
            href={dict.linkHref}
            target="_blank"
            rel="noreferrer"
            className="border-b border-rule-2 font-medium text-ink"
          >
            {dict.linkLabel}
          </a>
          {dict.post}
        </p>
      </Reveal>
    </section>
  );
}
