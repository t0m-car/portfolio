"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { InkExport } from "./InkExport";

// Three.js (~140 kB) stays off the initial load: the WebGL driver is code-split and
// mounted client-side only. The canvas markup below renders immediately.
const InkField = dynamic(() => import("./InkField").then((m) => m.InkField), { ssr: false });

const QUICK = ["Tom", "Marie", "Azimut", "Nodeo", "seal"];

export function InkLab() {
  const [seed, setSeed] = useState("Tom");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const display = (seed || "tom").trim().slice(0, 24) || "tom";

  return (
    <div className="playground">
      <div className="pg-canvas-wrap">
        <canvas className="pg-canvas" ref={canvasRef} />
        <div className="pg-overlay">
          <span className="dot" />
          <span>
            ink · <span className="mono normal-case tracking-[0px]">{display}</span>
          </span>
        </div>
        <div className="pg-toolbar pg-toolbar--tr">
          <InkExport canvasRef={canvasRef} seed={seed} />
        </div>
        <InkField seed={seed} canvasRef={canvasRef} />
      </div>
      <div className="pg-foot">
        <label className="pg-input-row" htmlFor="ink-seed">
          <span className="pg-input-label">your name</span>
          <input
            id="ink-seed"
            className="pg-input"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            placeholder="Tom"
            maxLength={24}
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {QUICK.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setSeed(n)}
              className={`tag cursor-pointer ${seed === n ? "text-ink" : ""}`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
