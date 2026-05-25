import * as THREE from "three";

export function makeInkMatcap(ink: number[], sheen: number[]): THREE.Texture {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const [ih, is, il] = ink;
  const [sh, ss, sl] = sheen;

  const base = ctx.createRadialGradient(size * 0.5, size * 0.45, size * 0.05, size * 0.5, size * 0.5, size * 0.55);
  base.addColorStop(0.0, hsla(ih, is, Math.min(60, il + 12)));
  base.addColorStop(0.55, hsla(ih, is, il * 0.6));
  base.addColorStop(1.0, hsla(ih, is * 0.7, 5));
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  const spec = ctx.createRadialGradient(size * 0.36, size * 0.3, 0, size * 0.36, size * 0.3, size * 0.3);
  spec.addColorStop(0, "rgba(255,255,255,0.92)");
  spec.addColorStop(0.5, "rgba(240,242,250,0.28)");
  spec.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = spec;
  ctx.fillRect(0, 0, size, size);

  const tint = ctx.createRadialGradient(size * 0.66, size * 0.68, 0, size * 0.66, size * 0.68, size * 0.36);
  tint.addColorStop(0, hsla(sh, ss, sl, 0.7));
  tint.addColorStop(1, hsla(sh, ss, sl, 0));
  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function hsla(hue: number, sat: number, light: number, alpha = 1): string {
  return `hsla(${Math.round(hue)}, ${sat}%, ${light}%, ${alpha})`;
}
