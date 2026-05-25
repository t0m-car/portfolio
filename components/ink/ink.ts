import { seedToSignature } from "@/components/playground/lib/signature";

// Generative ink field: a name → a deterministic flow-field shader. The palette is
// pulled from the signature hash (so a name's ink matches its signature on the
// homepage); the flow knobs come from a second, decorrelated hash stream.

export type RGB = [number, number, number];

export type InkParams = {
  seed: string;
  ink: RGB;
  sheen: RGB;
  flow: [number, number];
  freq: number;
  warp: number;
  contrast: number;
  gain: number;
  ridged: number;
};

const TAU = Math.PI * 2;
const mix = (a: number, b: number, t: number): number => a + (b - a) * t;

function djb2(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hslToRgb(h: number, s: number, l: number): RGB {
  h /= 360;
  s /= 100;
  l /= 100;
  if (s === 0) return [l, l, l];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue = (t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [hue(h + 1 / 3), hue(h), hue(h - 1 / 3)];
}

export function seedToInk(raw: string): InkParams {
  const name = (raw ?? "").trim() || "tom";
  const { palette } = seedToSignature(name);
  const rand = mulberry32(djb2(name) ^ 0x9e3779b9);
  const k = Array.from({ length: 6 }, () => rand());
  const angle = k[0] * TAU;
  return {
    seed: name,
    ink: hslToRgb(palette.ink[0], palette.ink[1], palette.ink[2]),
    sheen: hslToRgb(palette.sheen[0], palette.sheen[1], palette.sheen[2]),
    flow: [Math.cos(angle), Math.sin(angle)],
    freq: mix(1.6, 5.0, k[1]),
    warp: mix(0.6, 2.7, k[2]),
    contrast: mix(1.1, 2.6, k[3]),
    gain: mix(0.45, 0.62, k[4]),
    ridged: k[5] > 0.55 ? 1 : 0,
  };
}

export const INK_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// Domain-warped fbm mapped between ink and sheen: ink diffusing in water.
export const INK_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec3 uInk;
  uniform vec3 uSheen;
  uniform vec2 uFlow;
  uniform float uFreq;
  uniform float uWarp;
  uniform float uContrast;
  uniform float uGain;
  uniform float uRidged;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 345.45));
    p += dot(p, p + 34.345);
    return fract(p.x * p.y);
  }
  float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
  mat2 rot2(float a) {
    float c = cos(a), s = sin(a);
    return mat2(c, -s, s, c);
  }
  float fbm(vec2 p, float gain) {
    float sum = 0.0, amp = 0.5;
    mat2 m = rot2(0.6);
    for (int i = 0; i < 5; i++) {
      sum += amp * vnoise(p);
      p = m * p * 2.0;
      amp *= gain;
    }
    return sum;
  }

  void main() {
    vec2 uv = vUv - 0.5;
    uv.x *= uRes.x / uRes.y;
    vec2 p = uv * uFreq;
    float t = uTime * 0.08;

    vec2 q = vec2(fbm(p + uFlow * t, uGain), fbm(p + uFlow * t + 5.2, uGain));
    vec2 r = vec2(
      fbm(p + uWarp * q + 1.7 - uFlow * t * 0.5, uGain),
      fbm(p + uWarp * q + 9.2, uGain)
    );
    float f = fbm(p + uWarp * r, uGain);
    if (uRidged > 0.5) f = 1.0 - abs(2.0 * f - 1.0);
    f = clamp((f - 0.5) * uContrast + 0.5, 0.0, 1.0);

    vec3 col = mix(uInk, uSheen, f);
    col += pow(f, 4.0) * 0.22;

    float vig = smoothstep(1.2, 0.15, length(uv));
    gl_FragColor = vec4(col, vig);
  }
`;
