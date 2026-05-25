"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const SunIcon = () => (
  <svg
    className="size-[15px] dark:hidden"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

const MoonIcon = () => (
  <svg
    className="hidden size-[15px] dark:block"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);

export function ThemeToggle({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  const [theme, setTheme] = useState<Theme>("light");

  // Mirror data-theme post-mount (not via useState init) so aria-pressed stays hydration-safe.
  useEffect(() => {
    setTheme(
      document.documentElement.dataset.theme === "dark" ? "dark" : "light",
    );
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      console.warn("ThemeToggle: theme choice could not be persisted");
    }
    setTheme(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      aria-pressed={theme === "dark"}
      className={`${className} inline-flex items-center justify-center text-ink-4`}
    >
      <SunIcon />
      <MoonIcon />
    </button>
  );
}
