"use client";

import { useEffect, useRef, useState } from "react";
import { LiveCommit } from "./LiveCommit";
import { LiveSpotify } from "./LiveSpotify";

function LiegeClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Brussels",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  return (
    <span className="live-text mono">
      <span className="pulse" />
      <span>
        <strong>{now ? fmt.format(now) : "--:--:--"}</strong> · Liège, BE
      </span>
    </span>
  );
}

const ClockIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const SpotifyIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M7 9.2c3.4-1 7.2-.7 10 1" />
    <path d="M7.6 12.4c2.8-.7 5.9-.4 8.3 1" />
    <path d="M8.2 15.6c2.2-.5 4.6-.2 6.5 1" />
  </svg>
);

const CommitIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 4v9a3 3 0 0 0 3 3h6" />
    <circle cx="6" cy="4" r="2" />
    <circle cx="18" cy="16" r="2" />
    <circle cx="6" cy="20" r="2" />
  </svg>
);

type State = {
  key: string;
  Icon: () => React.JSX.Element;
  Body: () => React.JSX.Element;
};

const LIVE_STATES: State[] = [
  { key: "clock", Icon: ClockIcon, Body: LiegeClock },
  { key: "spotify", Icon: SpotifyIcon, Body: LiveSpotify },
  { key: "github", Icon: CommitIcon, Body: LiveCommit },
];

export function LiveStatus() {
  const [idx, setIdx] = useState(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      if (!pausedRef.current) setIdx((i) => (i + 1) % LIVE_STATES.length);
    }, 5500);
    return () => clearInterval(id);
  }, []);

  const state = LIVE_STATES[idx];
  const { Icon, Body } = state;

  return (
    <div
      className="live"
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
      onClick={() => setIdx((i) => (i + 1) % LIVE_STATES.length)}
      role="status"
      aria-live="polite"
    >
      <span className="live-ico" key={state.key}>
        <Icon />
      </span>
      <Body />
      <span className="live-dots" aria-hidden>
        {LIVE_STATES.map((s, i) => (
          <i key={s.key} className={i === idx ? "on" : ""} />
        ))}
      </span>
    </div>
  );
}
