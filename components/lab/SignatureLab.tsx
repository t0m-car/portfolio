"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { PlaygroundFrame } from "@/components/playground/Frame";
import { SignatureExport } from "@/components/playground/SignatureExport";
import { hasWebGL } from "@/components/playground/lib/webgl";

// Interactive signature for the /lab/signature page. Reuses the same demo components
// as the home (3D ribbon + 2D fallback + PNG/SVG export), wrapped in its own shell so
// the lab page stays self-contained.

type Mode = "3d" | "2d";

const LABEL = "Signature";
const HINT = "type · move · feel";

function DemoShell() {
  return <div className="pg-canvas-wrap" />;
}

const SignatureDemo = dynamic(
  () => import("@/components/playground/demos/SignatureDemo").then((m) => m.SignatureDemo),
  { ssr: false, loading: () => <DemoShell /> },
);
const Signature2DDemo = dynamic(
  () => import("@/components/playground/demos/Signature2DDemo").then((m) => m.Signature2DDemo),
  { ssr: false, loading: () => <DemoShell /> },
);

export function SignatureLab() {
  const [seed, setSeed] = useState("Tom");
  const [mode, setMode] = useState<Mode>("3d");
  const [webgl, setWebgl] = useState<boolean | null>(null);

  useEffect(() => {
    setWebgl(hasWebGL());
  }, []);

  const effective3D = mode === "3d" && webgl !== false;

  const toggle = (
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
    <PlaygroundFrame
      topRight={
        <div className="inline-flex items-center gap-2">
          {toggle}
          <SignatureExport seed={seed} />
        </div>
      }
      foot={
        <>
          <label className="pg-input-row" htmlFor="sig-seed">
            <span className="pg-input-label">your name</span>
            <input
              id="sig-seed"
              className="pg-input"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder="Tom"
              maxLength={24}
              autoComplete="off"
              spellCheck={false}
            />
          </label>
          <div className="flex flex-wrap items-center justify-end gap-3.5">
            <span className="pg-meta">deterministic, unique per name</span>
          </div>
        </>
      }
    >
      {effective3D ? (
        <SignatureDemo seed={seed} label={LABEL} hint={HINT} onUnsupported={() => setWebgl(false)} />
      ) : (
        <Signature2DDemo seed={seed} label={LABEL} hint={HINT} />
      )}
    </PlaygroundFrame>
  );
}
