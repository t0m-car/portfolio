import type { Content } from "@/lib/content";

export function Foot({ dict }: { dict: Content["footer"] }) {
  const today = new Date();
  const fmt = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
  }).format(today);

  return (
    <footer className="mt-30 grid grid-cols-[1fr_auto] items-baseline gap-6 border-t border-rule pt-8 max-sm:grid-cols-1">
      <div>
        <div className="eyebrow mb-3.5">{dict.getInTouch}</div>
        <div className="flex flex-wrap gap-4">
          {dict.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              {...(l.external ? { target: "_blank", rel: "noreferrer" } : {})}
              className="group border-b border-transparent text-body text-ink-2 transition-colors duration-200 hover:border-rule-2 hover:text-ink"
            >
              {l.label}{" "}
              <span className="ml-1 inline-block transition-transform duration-200 [transform:translate(0,-1px)_rotate(-45deg)] group-hover:[transform:translate(2px,-3px)_rotate(-45deg)]">
                ↗
              </span>
            </a>
          ))}
        </div>
        <div className="mt-4">
          <span className="mono text-meta tracking-[0.04em] text-ink-4">{dict.stackLine}</span>
        </div>
      </div>
      <div className="text-right font-mono text-meta tracking-[0.04em] text-ink-4 max-sm:text-left">
        {dict.version}
        <br />
        {dict.updated} {fmt.toLowerCase()}
      </div>
    </footer>
  );
}
