"use client";

import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import { seedToInk, INK_VERT, INK_FRAG } from "./ink";

// WebGL driver for the ink field. Renders nothing itself — it drives the <canvas>
// owned by InkLab (passed via ref), so the markup can render before three.js loads.
// Setup runs once; name changes only swap uniforms (smooth while typing).
export function InkField({
  seed,
  canvasRef,
}: {
  seed: string;
  canvasRef: RefObject<HTMLCanvasElement | null>;
}) {
  const seedRef = useRef(seed);
  seedRef.current = seed;
  const stateRef = useRef<{
    uniforms?: Record<string, THREE.IUniform>;
    renderOnce?: () => void;
    animated?: boolean;
  }>({});

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = canvas?.parentElement;
    if (!canvas || !wrap) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true, // lets InkLab export the current frame to PNG
      });
    } catch (err) {
      console.warn("[ink] WebGL unavailable", err);
      return;
    }
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    const p = seedToInk(seedRef.current);
    const uniforms: Record<string, THREE.IUniform> = {
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uInk: { value: new THREE.Vector3(...p.ink) },
      uSheen: { value: new THREE.Vector3(...p.sheen) },
      uFlow: { value: new THREE.Vector2(...p.flow) },
      uFreq: { value: p.freq },
      uWarp: { value: p.warp },
      uContrast: { value: p.contrast },
      uGain: { value: p.gain },
      uRidged: { value: p.ridged },
    };
    const mat = new THREE.ShaderMaterial({
      vertexShader: INK_VERT,
      fragmentShader: INK_FRAG,
      uniforms,
      transparent: true,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
    scene.add(mesh);

    const t0 = performance.now();
    const renderAt = (sec: number) => {
      uniforms.uTime.value = sec;
      renderer.render(scene, camera);
    };
    stateRef.current.uniforms = uniforms;
    stateRef.current.renderOnce = () => renderAt((performance.now() - t0) / 1000);

    function resize() {
      if (!wrap) return;
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      renderer.setSize(w, h, false);
      (uniforms.uRes.value as THREE.Vector2).set(w, h);
      stateRef.current.renderOnce?.();
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    stateRef.current.animated = !reduced;

    function disposeAll() {
      ro.disconnect();
      mesh.geometry.dispose();
      mat.dispose();
      renderer.dispose();
      stateRef.current = {};
    }

    if (reduced) {
      renderAt(12);
      return disposeAll;
    }

    let raf = 0;
    let running = false;
    function tick() {
      raf = requestAnimationFrame(tick);
      renderAt((performance.now() - t0) / 1000);
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
      disposeAll();
    };
    // Setup once; seed changes are handled by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef]);

  useEffect(() => {
    const u = stateRef.current.uniforms;
    if (!u) return;
    const p = seedToInk(seed);
    (u.uInk.value as THREE.Vector3).set(...p.ink);
    (u.uSheen.value as THREE.Vector3).set(...p.sheen);
    (u.uFlow.value as THREE.Vector2).set(...p.flow);
    u.uFreq.value = p.freq;
    u.uWarp.value = p.warp;
    u.uContrast.value = p.contrast;
    u.uGain.value = p.gain;
    u.uRidged.value = p.ridged;
    if (!stateRef.current.animated) stateRef.current.renderOnce?.();
  }, [seed]);

  return null;
}
