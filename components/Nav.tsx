import type { Content } from "@/lib/content";
import { ThemeToggle } from "./ThemeToggle";

const linkBase =
  "relative rounded-full px-3 py-1.5 transition-colors duration-200 hover:text-ink hover:bg-black/[0.04] dark:hover:bg-white/[0.06] max-sm:px-[9px]";
const navLink = `${linkBase} text-sub font-medium text-ink-2 max-sm:text-xs`;

export function Nav({ dict }: { dict: Content["nav"] }) {
  return (
    <nav
      aria-label="primary"
      className="glass shadow-pill fixed left-1/2 top-[18px] z-50 flex -translate-x-1/2 items-center gap-1 rounded-full p-1.5 max-sm:max-w-[calc(100vw-20px)] max-sm:gap-0.5 max-sm:p-[5px]"
    >
      <span
        aria-hidden
        className="ml-2 mr-1.5 h-1.5 w-1.5 rounded-full bg-[#22c55e] shadow-[0_0_0_3px_rgba(34,197,94,0.18)]"
      />
      <a href="#work" className={navLink}>
        {dict.work}
      </a>
      <a href="#studio" className={navLink}>
        {dict.studio}
      </a>
      <a href="#playground" className={`${navLink} max-[340px]:hidden`}>
        {dict.play}
      </a>
      <a href="#beliefs" className={`${navLink} max-[380px]:hidden`}>
        {dict.notes}
      </a>
      <span aria-hidden className="mx-0.5 h-3.5 w-px bg-rule-2" />
      <a href="mailto:tom@tomca.be" className={navLink}>
        {dict.contact}
      </a>
      <span aria-hidden className="mx-0.5 h-3.5 w-px bg-rule-2" />
      <ThemeToggle label={dict.theme} className={linkBase} />
    </nav>
  );
}
