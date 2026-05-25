"use client";

import { useEffect, useState } from "react";

type Commit = {
  repo: string;
  message: string;
  dateISO: string;
  url: string;
};

function relativeTime(dateISO: string): string {
  const rtf = new Intl.RelativeTimeFormat("en-GB", {
    numeric: "auto",
  });
  const sec = Math.round((Date.now() - new Date(dateISO).getTime()) / 1000);
  const min = Math.round(sec / 60);
  const hr = Math.round(min / 60);
  const day = Math.round(hr / 24);
  if (Math.abs(sec) < 60) return rtf.format(-sec, "second");
  if (Math.abs(min) < 60) return rtf.format(-min, "minute");
  if (Math.abs(hr) < 24) return rtf.format(-hr, "hour");
  return rtf.format(-day, "day");
}

const truncate = (s: string, n = 40) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

export function LiveCommit() {
  const [commit, setCommit] = useState<Commit | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [rel, setRel] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/last-commit")
      .then((res) => (res.ok ? (res.json() as Promise<Commit | null>) : null))
      .then((data) => {
        if (alive) setCommit(data);
      })
      .catch(() => {
        if (alive) setCommit(null);
      })
      .finally(() => {
        if (alive) setLoaded(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  // After mount only: computing relative time in render would break hydration.
  useEffect(() => {
    if (!commit) return;
    const tick = () => setRel(relativeTime(commit.dateISO));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [commit]);

  if (!loaded) {
    return (
      <span className="live-text">
        <span className="pulse" />
        <span className="text-ink-4">···</span>
      </span>
    );
  }

  if (!commit) {
    return (
      <span className="live-text">
        <span className="pulse" />
        <span className="text-ink-3">GitHub · —</span>
      </span>
    );
  }

  return (
    <span className="live-text">
      <span className="pulse" />
      <span>
        <a
          href={commit.url}
          target="_blank"
          rel="noreferrer"
          title={commit.message}
          onClick={(e) => e.stopPropagation()}
        >
          <strong>{commit.repo}</strong>
          <span className="mono ml-1.5 text-ink-3">
            {truncate(commit.message)}
          </span>
        </a>
        {rel && <span className="ml-1.5 text-ink-4">· {rel}</span>}
      </span>
    </span>
  );
}
