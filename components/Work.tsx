import { Fragment } from "react";
import { SectionHead } from "./SectionHead";
import { ProjectRow } from "./ProjectRow";
import { Reveal } from "./motion/Reveal";
import type { Content, WorkEntry } from "@/lib/content";

function ExperienceRow({ years, company, role, blurb, link }: WorkEntry) {
  return (
    <article className="relative grid grid-cols-[120px_1fr] items-baseline gap-6 border-t border-rule py-5 last:border-b max-sm:grid-cols-1 max-sm:gap-2">
      <div className="pt-1 font-mono text-meta tracking-[0.04em] text-ink-3">{years}</div>
      <div>
        <div className="mb-2 flex items-baseline justify-between gap-4 max-sm:flex-col max-sm:items-start max-sm:gap-0.5">
          <h3 className="tracking-[-0.012em]">
            {link ? (
              <a href={link} target="_blank" rel="noreferrer" className="border-b border-rule-2">
                {company}
              </a>
            ) : (
              company
            )}
          </h3>
          <span className="whitespace-nowrap font-mono text-meta tracking-[0.04em] text-ink-3">{role}</span>
        </div>
        {blurb && <p className="max-w-[62ch] text-body leading-[1.55] text-ink-3">{blurb}</p>}
      </div>
    </article>
  );
}

export function Work({ dict }: { dict: Content["work"] }) {
  return (
    <section>
      <Reveal>
        <SectionHead kicker={dict.kicker} title={dict.title} />
      </Reveal>
      <Reveal delay={0.08} className="flex flex-col">
        {dict.entries.map((entry, i) => (
          <Fragment key={i}>
            <ExperienceRow {...entry} />
            {entry.projects?.map((p, j) => (
              <ProjectRow key={`${i}-${j}`} project={p} compact />
            ))}
          </Fragment>
        ))}
      </Reveal>
    </section>
  );
}
