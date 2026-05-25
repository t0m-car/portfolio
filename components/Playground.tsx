"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { SectionHead } from "./SectionHead";
import { PlaygroundFrame } from "./playground/Frame";
import { SignatureExport } from "./playground/SignatureExport";
import { hasWebGL } from "./playground/lib/webgl";
import { Reveal } from "./motion/Reveal";
import type { Content } from "@/lib/content";

type SignatureMode = "3d" | "2d";

function DemoShell({ label, hint, seed }: { label?: string; hint?: string; seed?: string }) {
  const display = seed != null ? (seed || "tom").trim().slice(0, 20) || "tom" : null;
  return (
    <div className="pg-canvas-wrap">
      {label && (
        <div className="pg-overlay">
          <span className="dot" />
          <span>
            {label}
            {display && (
              <>
                {" "}
                · <span className="mono normal-case tracking-[0px]">{display}</span>
              </>
            )}
          </span>
        </div>
      )}
      {hint && <div className="pg-hint">{hint}</div>}
    </div>
  );
}

const SignatureDemo = dynamic(
  () => import("./playground/demos/SignatureDemo").then((m) => m.SignatureDemo),
  { ssr: false, loading: () => <DemoShell /> },
);
const Signature2DDemo = dynamic(
  () => import("./playground/demos/Signature2DDemo").then((m) => m.Signature2DDemo),
  { ssr: false, loading: () => <DemoShell /> },
);

export function Playground({ dict }: { dict: Content["playground"] }) {
  const [seed, setSeed] = useState("Tom");
  const [mode, setMode] = useState<SignatureMode>("3d");
  // null = not tested yet (optimistic: 3D); false = no WebGL → forced 2D.
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [armed, setArmed] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setWebgl(hasWebGL());
  }, []);

  useEffect(() => {
    if (armed) return;
    const el = stageRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setArmed(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setArmed(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [armed]);

  const effective3D = mode === "3d" && webgl !== false;

  const toggleNode = (
    <div
      role="group"
      aria-label="Render"
      className="inline-flex overflow-hidden rounded-full border-[0.5px] border-rule-2 bg-glass backdrop-blur-[10px]"
    >
      {(["3d", "2d"] as const).map((m) => {
        const disabled = m === "3d" && webgl === false;
        return (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            disabled={disabled}
            aria-pressed={mode === m}
            title={disabled ? "WebGL unavailable on this device" : undefined}
            className={`border-none px-[11px] py-1 text-meta tracking-[0.4px] ${
              mode === m ? "bg-ink text-bg" : "bg-transparent text-ink-3"
            } ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
          >
            {m.toUpperCase()}
          </button>
        );
      })}
    </div>
  );

  return (
    <section>
      <Reveal>
        <SectionHead kicker={dict.kicker} title={dict.title} />
      </Reveal>
      <Reveal delay={0.08}>
        <p className="mb-4 max-w-[60ch] text-body leading-[1.6] text-ink-2">{dict.intro}</p>
        <p className="mb-5 max-w-[60ch] text-body text-ink-3">{dict.demoIntro}</p>

        <div ref={stageRef}>
          <PlaygroundFrame
            topRight={
              <div className="inline-flex items-center gap-2">
                {toggleNode}
                <SignatureExport seed={seed} />
              </div>
            }
            foot={
              <>
                <label className="pg-input-row" htmlFor="signature-seed">
                  <span className="pg-input-label">{dict.inputLabel}</span>
                  <input
                    id="signature-seed"
                    className="pg-input"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                    placeholder={dict.inputPlaceholder}
                    maxLength={24}
                    autoComplete="off"
                    spellCheck={false}
                  />
                </label>
                <div className="flex flex-wrap items-center justify-end gap-3.5">
                  <span className="pg-meta">{dict.meta}</span>
                </div>
              </>
            }
          >
            {!armed ? (
              <DemoShell label={dict.overlayLabel} hint={dict.hint} seed={seed} />
            ) : effective3D ? (
              <SignatureDemo
                seed={seed}
                label={dict.overlayLabel}
                hint={dict.hint}
                onUnsupported={() => setWebgl(false)}
              />
            ) : (
              <Signature2DDemo seed={seed} label={dict.overlayLabel} hint={dict.hint} />
            )}
          </PlaygroundFrame>
        </div>

        <p className="mt-5">
          <Link
            href={dict.labLink.href}
            className="border-b border-rule-2 text-sub text-ink-2 transition-colors hover:text-ink"
          >
            {dict.labLink.label} →
          </Link>
        </p>

        <div className="mt-7 flex flex-col">
          {dict.projects.map((p) => (
            <div className="row" key={p.name}>
              <div className="yr">{p.kind}</div>
              <div className="body">
                <h3>{p.name}</h3>
                <p>{p.blurb}</p>
                {p.tags.length > 0 && (
                  <div className="tags">
                    {p.tags.map((t) => (
                      <span className="tag" key={t}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-3 flex gap-3.5">
                  {p.links.map((l) => (
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
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
