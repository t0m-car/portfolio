"use client";

import { useEffect, useRef } from "react";
import { seedToSignature, SIG_POINTS, type Signature } from "../lib/signature";

const INK_W = 0.05;

function lerp(a: number, b: number, k: number): number {
  return a + (b - a) * k;
}

function lerpHue(a: number, b: number, k: number): number {
  let d = (((b - a) % 360) + 360) % 360;
  if (d > 180) d -= 360;
  return a + d * k;
}

function darkInkL(l: number): number {
  return 56 + (l - 20) * 0.45;
}

function bake(sig: Signature): Float32Array {
  const out = new Float32Array(SIG_POINTS * 3);
  for (let i = 0; i < SIG_POINTS; i++) {
    out[i * 3] = sig.pts[i].x;
    out[i * 3 + 1] = sig.pts[i].y;
    out[i * 3 + 2] = sig.pts[i].w;
  }
  return out;
}

export function Signature2DDemo({
  seed,
  label,
  hint,
}: {
  seed: string;
  label: string;
  hint: string;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const targetRef = useRef<Signature>(seedToSignature(seed));
  const targetCenterRef = useRef<Float32Array>(bake(targetRef.current));
  const inkRef = useRef<[number, number, number]>([...targetRef.current.palette.ink]);
  const progressRef = useRef(0);
  const firstRef = useRef(true);

  useEffect(() => {
    const sig = seedToSignature(seed);
    targetRef.current = sig;
    targetCenterRef.current = bake(sig);
    if (firstRef.current) {
      progressRef.current = 0;
      firstRef.current = false;
    } else {
      progressRef.current = Math.min(progressRef.current, 0.5);
    }
  }, [seed]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isDark = () => document.documentElement.dataset.theme === "dark";
    const themeState = { dark: isDark() };
    const themeObserver = new MutationObserver(() => {
      themeState.dark = isDark();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const cur = new Float32Array(targetCenterRef.current);
    let W = 0;
    let H = 0;
    let dpr = 1;

    function resize() {
      if (!wrap || !canvas) return;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = wrap.clientWidth;
      H = wrap.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const motionMql =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;

    let raf = 0;
    let running = false;
    const t0 = performance.now();

    function tick() {
      raf = requestAnimationFrame(tick);
      if (!ctx) return;
      const t = (performance.now() - t0) / 1000;
      const tgt = targetCenterRef.current;

      for (let i = 0; i < cur.length; i++) cur[i] = lerp(cur[i], tgt[i], 0.1);
      const pal = targetRef.current.palette;
      const ink = inkRef.current;
      ink[0] = lerpHue(ink[0], pal.ink[0], 0.08);
      ink[1] = lerp(ink[1], pal.ink[1], 0.08);
      ink[2] = lerp(ink[2], pal.ink[2], 0.08);
      progressRef.current = Math.min(1, progressRef.current + 0.022);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const pad = Math.min(W, H) * 0.18;
      const scale = Math.min((W - pad * 2) / 3.0, (H - pad * 2) / 1.3);
      const ox = W / 2;
      const oy = motionMql?.matches ? H / 2 : H / 2 + Math.sin(t * 0.5) * 3;
      const sx = (x: number) => ox + x * scale;
      const sy = (y: number) => oy - y * scale;

      const last = Math.max(2, Math.floor(progressRef.current * (SIG_POINTS - 1)));

      const left: number[] = [];
      const right: number[] = [];
      for (let i = 0; i <= last; i++) {
        const x = cur[i * 3];
        const y = cur[i * 3 + 1];
        const pi = Math.max(0, i - 1);
        const ni = Math.min(last, i + 1);
        const dx = cur[ni * 3] - cur[pi * 3];
        const dy = cur[ni * 3 + 1] - cur[pi * 3 + 1];
        const len = Math.max(1e-4, Math.hypot(dx, dy));
        const nx = -dy / len;
        const ny = dx / len;
        const hw = cur[i * 3 + 2] * INK_W;
        left.push(sx(x + nx * hw), sy(y + ny * hw));
        right.push(sx(x - nx * hw), sy(y - ny * hw));
      }

      const ih = ink[0].toFixed(0);
      const is = ink[1].toFixed(0);
      const il = themeState.dark ? darkInkL(ink[2]) : ink[2];
      ctx.beginPath();
      ctx.moveTo(left[0], left[1]);
      for (let i = 1; i <= last; i++) ctx.lineTo(left[i * 2], left[i * 2 + 1]);
      for (let i = last; i >= 0; i--) ctx.lineTo(right[i * 2], right[i * 2 + 1]);
      ctx.closePath();

      ctx.fillStyle = `hsl(${ih}, ${is}%, ${il.toFixed(0)}%)`;
      ctx.shadowColor = `hsla(${ih}, ${is}%, ${(il * 0.6).toFixed(0)}%, 0.4)`;
      ctx.shadowBlur = 6 * dpr;
      ctx.shadowOffsetY = 1.5 * dpr;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
    }
    function start() {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    const vis =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()))
        : null;
    if (vis) vis.observe(wrap);
    else start();

    return () => {
      stop();
      vis?.disconnect();
      ro.disconnect();
      themeObserver.disconnect();
    };
  }, []);

  const display = (seed || "tom").trim().slice(0, 20) || "tom";

  return (
    <div className="pg-canvas-wrap" ref={wrapRef}>
      <canvas className="pg-canvas" ref={canvasRef} />
      <div className="pg-overlay">
        <span className="dot" />
        <span>
          {label} ·{" "}
          <span className="mono normal-case tracking-[0px]">
            {display}
          </span>
        </span>
      </div>
      <div className="pg-hint">{hint}</div>
    </div>
  );
}
