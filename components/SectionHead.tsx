export function SectionHead({
  kicker,
  title,
  quiet,
}: {
  kicker: string;
  title: string;
  quiet?: string;
}) {
  return (
    <div className="mb-7 grid grid-cols-[120px_1fr] items-baseline gap-6 max-sm:grid-cols-1 max-sm:gap-1">
      <div className="eyebrow pt-1.5">{kicker}</div>
      <h2 className="tracking-[-0.02em]">
        {title}
        {quiet && <span className="font-normal text-ink-3"> · {quiet}</span>}
      </h2>
    </div>
  );
}
