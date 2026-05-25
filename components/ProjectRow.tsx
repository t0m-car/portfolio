import type { WorkProject } from "@/lib/content";

export function ProjectRow({
  project,
  compact = false,
}: {
  project: WorkProject;
  compact?: boolean;
}) {
  const { kind, name, desc, tags, links } = project;
  return (
    <div className={compact ? "row compact" : "row"}>
      <div className="yr">{kind ?? ""}</div>
      <div className="body">
        <h3>{name}</h3>
        <p>{desc}</p>
        {tags && tags.length > 0 && (
          <div className="tags">
            {tags.map((t) => (
              <span className="tag" key={t}>
                {t}
              </span>
            ))}
          </div>
        )}
        {links && links.length > 0 && (
          <div className="mt-3 flex gap-3.5">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="border-b border-rule-2 text-sub text-ink-2"
              >
                {l.label} ↗
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
