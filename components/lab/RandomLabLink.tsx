"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// 404 suggestion that varies each visit. Server (and first client render) shows the
// lab hub so hydration matches; a random pick is chosen after mount.
const PICKS = [
  { href: "/lab", label: "explore the lab" },
  { href: "/lab/ink", label: "turn your name into ink" },
  { href: "/lab/signature", label: "draw your signature" },
];

export function RandomLabLink() {
  const [i, setI] = useState(0);
  useEffect(() => setI(Math.floor(Math.random() * PICKS.length)), []);
  const pick = PICKS[i];

  return (
    <Link
      href={pick.href}
      className="border-b border-rule-2 text-sub text-ink-2 transition-colors hover:text-ink"
    >
      Or {pick.label} →
    </Link>
  );
}
