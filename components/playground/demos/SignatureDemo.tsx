"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { seedToSignature, SIG_POINTS, type Signature } from "../lib/signature";
import { makeInkMatcap } from "../lib/matcap";

const TAU = Math.PI * 2;
const INK = 0.052;

function lerp(a: number, b: number, k: number): number {
  return a + (b - a) * k;
}

function lerpCircular(a: number, b: number, k: number, mod: number): number {
  let d = (((b - a) % mod) + mod) % mod;
  if (d > mod / 2) d -= mod;
  return a + d * k;
}

function bake(sig: Signature): Float32Array {
  const out = new Float32Array(SIG_POINTS * 4);
  for (let i = 0; i < SIG_POINTS; i++) {
    const p = sig.pts[i];
    const u = i / (SIG_POINTS - 1);
    out[i * 4] = p.x;
    out[i * 4 + 1] = p.y;
    out[i * 4 + 2] = Math.sin(u * TAU * sig.zFreq + sig.zPhase) * sig.zAmp;
    out[i * 4 + 3] = p.w;
  }
  return out;
}

export function SignatureDemo({
  seed,
  label,
  hint,
  onUnsupported,
}: {
  seed: string;
  label: string;
  hint: string;
  onUnsupported?: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const targetRef = useRef<Signature>(seedToSignature(seed));
  const targetCenterRef = useRef<Float32Array>(bake(targetRef.current));
  const pulseRef = useRef(1);
  const progressRef = useRef(0);
  const firstRef = useRef(true);
  // In a ref so the once-only ([]) setup effect calls the latest without re-running.
  const onUnsupportedRef = useRef(onUnsupported);
  onUnsupportedRef.current = onUnsupported;

  useEffect(() => {
    const sig = seedToSignature(seed);
    targetRef.current = sig;
    targetCenterRef.current = bake(sig);
    if (firstRef.current) {
      progressRef.current = 0;
      firstRef.current = false;
    } else {
      pulseRef.current = 1.35;
      progressRef.current = Math.min(progressRef.current, 0.5);
    }
  }, [seed]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const stateRef = { mouseX: 0, mouseY: 0, dragging: false, ampMul: 1 };

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch (err) {
      console.warn("[signature] WebGL unavailable, falling back to 2D", err);
      onUnsupportedRef.current?.();
      return;
    }
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 16 / 10, 0.1, 100);
    camera.position.set(0, 0, 4.2);

    const curInk: [number, number, number] = [...targetRef.current.palette.ink];
    const curSheen: [number, number, number] = [...targetRef.current.palette.sheen];
    let matcap = makeInkMatcap(curInk, curSheen);
    let lastInkH = curInk[0];
    let lastInkL = curInk[2];
    let lastMatcapMs = 0;

    const cur = new Float32Array(targetCenterRef.current);

    const vertCount = SIG_POINTS * 2;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(vertCount * 3);
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const index: number[] = [];
    for (let i = 0; i < SIG_POINTS - 1; i++) {
      const a = i * 2;
      index.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
    geo.setIndex(index);

    const mat = new THREE.MeshMatcapMaterial({
      matcap,
      transparent: true,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.scale.setScalar(1.18);
    scene.add(mesh);

    const T = new THREE.Vector3();
    const side = new THREE.Vector3();
    const viewDir = new THREE.Vector3(0, 0, 1);
    const pNext = new THREE.Vector3();
    const pPrev = new THREE.Vector3();

    function rebuildRibbon(ampMul: number) {
      for (let i = 0; i < SIG_POINTS; i++) {
        const cx = cur[i * 4];
        const cy = cur[i * 4 + 1];
        const cz = cur[i * 4 + 2];
        const pi = Math.max(0, i - 1);
        const ni = Math.min(SIG_POINTS - 1, i + 1);
        pPrev.set(cur[pi * 4], cur[pi * 4 + 1], cur[pi * 4 + 2]);
        pNext.set(cur[ni * 4], cur[ni * 4 + 1], cur[ni * 4 + 2]);
        T.subVectors(pNext, pPrev);
        if (T.lengthSq() < 1e-8) T.set(1, 0, 0);
        T.normalize();

        side.crossVectors(T, viewDir);
        if (side.lengthSq() < 1e-6) side.set(0, 1, 0);
        side.normalize();

        const hw = cur[i * 4 + 3] * INK * ampMul + 0.002;
        const o = i * 6;
        positions[o] = cx + side.x * hw;
        positions[o + 1] = cy + side.y * hw;
        positions[o + 2] = cz + side.z * hw;
        positions[o + 3] = cx - side.x * hw;
        positions[o + 4] = cy - side.y * hw;
        positions[o + 5] = cz - side.z * hw;
      }
      geo.attributes.position.needsUpdate = true;
      geo.computeVertexNormals();
    }

    function resize() {
      if (!wrap) return;
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    function onMove(e: PointerEvent) {
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      stateRef.mouseX = (x - 0.5) * 2;
      stateRef.mouseY = (y - 0.5) * 2;
    }
    function onLeave() {
      stateRef.mouseX = 0;
      stateRef.mouseY = 0;
    }
    function onDown(e: PointerEvent) {
      stateRef.dragging = true;
      onMove(e);
    }
    function onUp() {
      stateRef.dragging = false;
    }

    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    wrap.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    const motionMql =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;

    let raf = 0;
    let running = false;
    const t0 = performance.now();
    let curRotX = 0;
    let curRotY = 0;

    function tick() {
      raf = requestAnimationFrame(tick);
      const now = performance.now();
      const t = (now - t0) / 1000;
      const tgt = targetCenterRef.current;

      for (let i = 0; i < cur.length; i++) cur[i] = lerp(cur[i], tgt[i], 0.1);

      const pal = targetRef.current.palette;
      curInk[0] = lerpCircular(curInk[0], pal.ink[0], 0.08, 360);
      curInk[1] = lerp(curInk[1], pal.ink[1], 0.08);
      curInk[2] = lerp(curInk[2], pal.ink[2], 0.08);
      curSheen[0] = lerpCircular(curSheen[0], pal.sheen[0], 0.08, 360);
      curSheen[1] = lerp(curSheen[1], pal.sheen[1], 0.08);
      curSheen[2] = lerp(curSheen[2], pal.sheen[2], 0.08);
      if (
        (Math.abs(curInk[0] - lastInkH) > 3 || Math.abs(curInk[2] - lastInkL) > 2) &&
        now - lastMatcapMs > 90
      ) {
        mat.matcap?.dispose();
        const tex = makeInkMatcap(curInk, curSheen);
        mat.matcap = tex;
        matcap = tex;
        mat.needsUpdate = true;
        lastInkH = curInk[0];
        lastInkL = curInk[2];
        lastMatcapMs = now;
      }

      progressRef.current = Math.min(1, progressRef.current + 0.022);

      if (motionMql?.matches) {
        mesh.rotation.set(0, 0, 0);
        mesh.position.y = 0;
        rebuildRibbon(1);
      } else {
        pulseRef.current = lerp(pulseRef.current, 1, 0.1);
        const targetRotY = stateRef.mouseX * 0.38 + Math.sin(t * 0.4) * 0.14;
        const targetRotX = stateRef.mouseY * 0.26 + Math.sin(t * 0.31) * 0.05;
        curRotY = lerp(curRotY, targetRotY, 0.05);
        curRotX = lerp(curRotX, targetRotX, 0.06);
        mesh.rotation.y = curRotY;
        mesh.rotation.x = curRotX;
        mesh.position.y = Math.sin(t * 0.5) * 0.03;
        const isOver = Math.abs(stateRef.mouseX) + Math.abs(stateRef.mouseY) > 0.0001;
        const targetAmp = stateRef.dragging ? 1.3 : isOver ? 1.12 : 1.0;
        stateRef.ampMul = lerp(stateRef.ampMul, targetAmp, 0.06);
        rebuildRibbon(stateRef.ampMul * pulseRef.current);
      }

      const segs = Math.max(1, Math.floor(progressRef.current * (SIG_POINTS - 1)));
      geo.setDrawRange(0, segs * 6);

      renderer.render(scene, camera);
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
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      wrap.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      geo.dispose();
      mat.dispose();
      matcap.dispose();
      renderer.dispose();
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
