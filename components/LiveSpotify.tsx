"use client";

import { useEffect, useState } from "react";

type NowPlaying = {
  isPlaying: boolean;
  title: string;
  artist: string;
  url: string | null;
  albumImage: string | null;
  progressMs: number | null;
  durationMs: number | null;
};

const fmtMs = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export function LiveSpotify() {
  const [track, setTrack] = useState<NowPlaying | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch("/api/now-playing");
        const data = (res.ok ? await res.json() : null) as NowPlaying | null;
        if (!alive) return;
        setTrack(data);
        setProgress(data?.progressMs ?? 0);
      } catch {
        if (alive) setTrack(null);
      } finally {
        if (alive) setLoaded(true);
      }
    };
    load();
    const id = setInterval(load, 30_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (!track?.isPlaying || track.durationMs == null) return;
    const id = setInterval(() => {
      setProgress((p) => Math.min(p + 1000, track.durationMs ?? p));
    }, 1000);
    return () => clearInterval(id);
  }, [track]);

  if (!loaded) {
    return (
      <span className="live-text">
        <span className="pulse" />
        <span className="text-ink-4">···</span>
      </span>
    );
  }

  if (!track) {
    return (
      <span className="live-text">
        <span className="pulse" />
        <span className="text-ink-3">Spotify · —</span>
      </span>
    );
  }

  const name = (
    <>
      <strong>{track.artist}</strong>
      <span className="text-ink-3"> · {track.title}</span>
    </>
  );

  return (
    <span className="live-text">
      <span className="pulse" />
      <span>
        {track.url ? (
          <a
            href={track.url}
            target="_blank"
            rel="noreferrer"
            title={`${track.artist} — ${track.title}`}
            onClick={(e) => e.stopPropagation()}
          >
            {name}
          </a>
        ) : (
          name
        )}{" "}
        <span className="mono ml-1.5 text-meta text-ink-4">
          {track.isPlaying && track.durationMs != null
            ? `${fmtMs(progress)} / ${fmtMs(track.durationMs)}`
            : "recently"}
        </span>
      </span>
    </span>
  );
}
