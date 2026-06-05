"use client";

import { useEffect, useState } from "react";

// World Cup 2026 opener: 11 June 2026. Adjust to the exact kickoff if you want it
// to the minute; the offset keeps the countdown correct for every visitor.
const KICKOFF = new Date("2026-06-11T18:00:00+02:00").getTime();
// Final: 19 July 2026. After this the live angle is stale (see note in LiveStatus).
const FINAL_END = new Date("2026-07-19T23:59:59+02:00").getTime();

function parts(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400);
  const pad = (n: number) => String(n).padStart(2, "0");
  const h = pad(Math.floor((s % 86400) / 3600));
  const m = pad(Math.floor((s % 3600) / 60));
  const sec = pad(s % 60);
  return d > 0 ? `${d}d ${h}:${m}:${sec}` : `${h}:${m}:${sec}`;
}

export function LiveFootics() {
  // null until mounted: computing time in render would break hydration (cf. LiegeClock).
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) {
    return (
      <span className="live-text">
        <span className="pulse" />
        <span className="text-ink-4">···</span>
      </span>
    );
  }

  const tail =
    now < KICKOFF ? (
      <span className="mono ml-1.5 text-ink-3">· World Cup in {parts(KICKOFF - now)}</span>
    ) : now <= FINAL_END ? (
      <span className="ml-1.5 text-ink-3">· World Cup live now</span>
    ) : (
      <span className="ml-1.5 text-ink-3">· pronos with friends</span>
    );

  return (
    <span className="live-text">
      <span className="pulse" />
      <span>
        <a
          href="https://footics.app"
          target="_blank"
          rel="noreferrer"
          title="Footics: World Cup 2026 predictions with friends"
          onClick={(e) => e.stopPropagation()}
        >
          <strong>footics</strong>
        </a>
        {tail}
      </span>
    </span>
  );
}
