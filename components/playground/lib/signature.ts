export const SIG_POINTS = 240;
const TAU = Math.PI * 2;

type SigPoint = { x: number; y: number; w: number };
type HSL = [number, number, number];
type Palette = { name: string; ink: HSL; sheen: HSL };
type Archetype = "cursive" | "monogram" | "angular" | "sovereign" | "vertical";

export type Signature = {
  pts: SigPoint[];
  palette: Palette;
  archetype: Archetype;
  zAmp: number;
  zFreq: number;
  zPhase: number;
  speed: number;
};

const PALETTES: Palette[] = [
  { name: "oxblood", ink: [350, 55, 34], sheen: [355, 62, 52] },
  { name: "indigo", ink: [230, 48, 40], sheen: [225, 60, 60] },
  { name: "sapin", ink: [156, 44, 30], sheen: [150, 52, 46] },
  { name: "prune", ink: [298, 36, 38], sheen: [295, 46, 58] },
  { name: "sépia", ink: [30, 46, 35], sheen: [34, 56, 52] },
  { name: "ardoise", ink: [208, 24, 38], sheen: [205, 32, 58] },
  { name: "bronze", ink: [68, 42, 33], sheen: [64, 52, 50] },
  { name: "teal", ink: [184, 50, 31], sheen: [184, 56, 48] },
  { name: "bordeaux", ink: [332, 50, 37], sheen: [330, 58, 56] },
  { name: "pétrole", ink: [200, 56, 33], sheen: [198, 64, 51] },
  { name: "terracotta", ink: [14, 56, 43], sheen: [18, 66, 59] },
  { name: "encre", ink: [25, 14, 20], sheen: [30, 20, 42] },
];

const ARCHETYPES: Archetype[] = ["cursive", "monogram", "angular", "sovereign", "vertical"];

const ARCHETYPE_WEIGHTS: Record<Archetype, number> = {
  cursive: 30,
  monogram: 15,
  angular: 25,
  sovereign: 15,
  vertical: 15,
};

function pickArchetype(r: number): Archetype {
  let total = 0;
  for (const a of ARCHETYPES) total += Math.max(0, ARCHETYPE_WEIGHTS[a]);
  if (total <= 0) return ARCHETYPES[0];
  let x = r * total;
  for (const a of ARCHETYPES) {
    const w = Math.max(0, ARCHETYPE_WEIGHTS[a]);
    if (x < w) return a;
    x -= w;
  }
  return ARCHETYPES[ARCHETYPES.length - 1];
}

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

type V2 = { x: number; y: number };
type Rand = () => number;

function dist(a: V2, b: V2): number {
  return Math.max(1e-4, Math.hypot(b.x - a.x, b.y - a.y));
}

function crSegment(p0: V2, p1: V2, p2: V2, p3: V2, n: number, out: V2[]): void {
  const alpha = 0.5;
  const t0 = 0;
  const t1 = t0 + dist(p0, p1) ** alpha;
  const t2 = t1 + dist(p1, p2) ** alpha;
  const t3 = t2 + dist(p2, p3) ** alpha;
  for (let i = 0; i < n; i++) {
    const t = t1 + ((t2 - t1) * i) / n;
    const a1x = ((t1 - t) / (t1 - t0)) * p0.x + ((t - t0) / (t1 - t0)) * p1.x;
    const a1y = ((t1 - t) / (t1 - t0)) * p0.y + ((t - t0) / (t1 - t0)) * p1.y;
    const a2x = ((t2 - t) / (t2 - t1)) * p1.x + ((t - t1) / (t2 - t1)) * p2.x;
    const a2y = ((t2 - t) / (t2 - t1)) * p1.y + ((t - t1) / (t2 - t1)) * p2.y;
    const a3x = ((t3 - t) / (t3 - t2)) * p2.x + ((t - t2) / (t3 - t2)) * p3.x;
    const a3y = ((t3 - t) / (t3 - t2)) * p2.y + ((t - t2) / (t3 - t2)) * p3.y;
    const b1x = ((t2 - t) / (t2 - t0)) * a1x + ((t - t0) / (t2 - t0)) * a2x;
    const b1y = ((t2 - t) / (t2 - t0)) * a1y + ((t - t0) / (t2 - t0)) * a2y;
    const b2x = ((t3 - t) / (t3 - t1)) * a2x + ((t - t1) / (t3 - t1)) * a3x;
    const b2y = ((t3 - t) / (t3 - t1)) * a2y + ((t - t1) / (t3 - t1)) * a3y;
    out.push({
      x: ((t2 - t) / (t2 - t1)) * b1x + ((t - t1) / (t2 - t1)) * b2x,
      y: ((t2 - t) / (t2 - t1)) * b1y + ((t - t1) / (t2 - t1)) * b2y,
    });
  }
}

function smooth(anchors: V2[], sharp: boolean): V2[] {
  if (sharp) {
    const out: V2[] = [];
    for (let i = 0; i < anchors.length - 1; i++) {
      for (let s = 0; s < 18; s++) {
        const k = s / 18;
        out.push({
          x: anchors[i].x + (anchors[i + 1].x - anchors[i].x) * k,
          y: anchors[i].y + (anchors[i + 1].y - anchors[i].y) * k,
        });
      }
    }
    out.push(anchors[anchors.length - 1]);
    return out;
  }
  const padded = [anchors[0], ...anchors, anchors[anchors.length - 1]];
  const dense: V2[] = [];
  for (let i = 1; i < padded.length - 2; i++) {
    crSegment(padded[i - 1], padded[i], padded[i + 1], padded[i + 2], 24, dense);
  }
  dense.push(anchors[anchors.length - 1]);
  return dense;
}

function resampleByArc(dense: V2[], count: number): V2[] {
  const cum = [0];
  for (let i = 1; i < dense.length; i++) cum.push(cum[i - 1] + dist(dense[i - 1], dense[i]));
  const total = cum[cum.length - 1];
  const out: V2[] = [];
  let j = 0;
  for (let i = 0; i < count; i++) {
    const target = (total * i) / (count - 1);
    while (j < cum.length - 2 && cum[j + 1] < target) j++;
    const seg = Math.max(1e-6, cum[j + 1] - cum[j]);
    const k = (target - cum[j]) / seg;
    out.push({
      x: dense[j].x + (dense[j + 1].x - dense[j].x) * k,
      y: dense[j].y + (dense[j + 1].y - dense[j].y) * k,
    });
  }
  return out;
}

function smoothstep(e0: number, e1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

type Build = { anchors: V2[]; box: [number, number]; sharp: boolean; slant: number };

function buildCursive(rand: Rand): Build {
  const slope = (rand() * 2 - 1) * 0.3;
  const hScale = 0.6 + rand() * 0.9;
  const loopiness = rand();
  const flScale = 0.7 + rand() * 1.8;
  const flDir = rand() < 0.5 ? -1 : 1;
  const flStyle = Math.floor(rand() * 3);
  const beats = 3 + Math.floor(rand() * 4);
  const dom = Math.floor(rand() * beats);
  const a: V2[] = [{ x: -0.45, y: -0.4 * hScale }];
  let x = 0;
  for (let i = 0; i < beats; i++) {
    const step = 0.45 + rand() * 0.85;
    const amp = hScale * (0.45 + rand() * 0.55) * (i === dom ? 2.3 : 1);
    const j = () => (rand() - 0.5) * 0.1 * hScale;
    if (rand() < loopiness * 0.65) {
      a.push({ x: x + step * 0.55, y: amp });
      a.push({ x: x + step * 0.28, y: amp * 0.45 + j() });
      a.push({ x: x + step, y: -0.05 * hScale + j() });
    } else if (rand() < 0.5) {
      a.push({ x: x + step * 0.5, y: amp + j() });
      a.push({ x: x + step, y: -0.05 * hScale + j() });
    } else {
      a.push({ x: x + step * 0.5, y: -amp * 0.85 + j() });
      a.push({ x: x + step, y: 0.05 * hScale + j() });
    }
    x += step;
  }
  const f = flScale;
  if (flStyle === 0) {
    a.push({ x: x + 0.4 * f, y: hScale * 0.5 * flDir });
    a.push({ x: x + 0.9 * f, y: -hScale * 0.2 });
    a.push({ x: x - 0.3 * f, y: -hScale * (0.55 + 0.25 * f) });
    a.push({ x: x + 1.0 * f, y: -hScale * 0.35 });
  } else if (flStyle === 1) {
    a.push({ x: x + 0.55 * f, y: hScale * (1.1 + 0.6 * f) });
    a.push({ x: x - 0.1 * f, y: hScale * (0.7 + 0.3 * f) });
    a.push({ x: x + 0.7 * f, y: hScale * 0.1 });
    a.push({ x: x + 1.1 * f, y: hScale * 0.45 * flDir });
  } else {
    a.push({ x: x + 0.5 * f, y: hScale * 0.4 });
    a.push({ x: x + 0.85 * f, y: -hScale * (1.2 + 0.6 * f) });
    a.push({ x: x + 0.2 * f, y: -hScale * (0.7 + 0.3 * f) });
    a.push({ x: x + 1.2 * f, y: -hScale * 0.25 });
  }
  for (const p of a) p.y += slope * p.x;
  return { anchors: a, box: [3.0, 1.3], sharp: false, slant: 0.08 + rand() * 0.24 };
}

function rot(x: number, y: number, ang: number): V2 {
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  return { x: x * c - y * s, y: x * s + y * c };
}

function buildMonogram(rand: Rand): Build {
  const a: V2[] = [];
  const variant = Math.floor(rand() * 6);
  const tilt = (rand() * 2 - 1) * Math.PI;

  const innerKind = Math.floor(rand() * 3);
  if (innerKind === 0) {
    a.push({ x: -0.28, y: 0.0 }, { x: 0.0, y: 0.36 }, { x: 0.22, y: -0.05 }, { x: -0.06, y: -0.28 });
  } else if (innerKind === 1) {
    a.push({ x: -0.36, y: -0.42 }, { x: 0.36, y: 0.46 });
  } else {
    a.push({ x: -0.36, y: 0.1 }, { x: -0.1, y: 0.42 }, { x: 0.16, y: 0.0 }, { x: 0.42, y: 0.36 });
  }

  if (variant === 5) {
    const s = 1.0 + rand() * 0.4;
    const ry = s * (0.7 + rand() * 0.5);
    for (const [cx, cy] of [[-1, -1], [1, -1], [1, 1], [-1, 1], [-1, -1]] as const) {
      a.push(rot(cx * s, cy * ry, tilt));
    }
    return { anchors: a, box: [1.7, 1.7], sharp: true, slant: 0 };
  }

  let rx = 1.0 + rand() * 0.4;
  let ry = 1.0 + rand() * 0.4;
  let turns = 1.05;
  let shrink = 1;
  if (variant === 1) ry = rx * (1.5 + rand() * 0.5);
  else if (variant === 2) rx = ry * (1.5 + rand() * 0.5);
  else if (variant === 3) {
    turns = 1.7 + rand() * 0.7;
    shrink = 0.5;
  } else if (variant === 4) turns = 0.6 + rand() * 0.2;
  const start = rand() * TAU;
  const steps = 13;
  for (let k = 0; k <= steps; k++) {
    const t = k / steps;
    const ang = start + turns * TAU * t;
    const rr = 1 - (1 - shrink) * t;
    a.push(rot(Math.cos(ang) * rx * rr, Math.sin(ang) * ry * rr, tilt));
  }
  return { anchors: a, box: [1.7, 1.7], sharp: false, slant: 0.03 + rand() * 0.07 };
}

function buildAngular(rand: Rand): Build {
  const hScale = 0.7 + rand() * 0.8;
  const beats = 3 + Math.floor(rand() * 5);
  const env = Math.floor(rand() * 4);
  const a: V2[] = [{ x: -0.4, y: -0.6 * hScale }];
  let x = 0;
  for (let i = 0; i < beats; i++) {
    const step = 0.42 + rand() * 0.6;
    const fp = beats > 1 ? i / (beats - 1) : 0;
    let envMul = 1;
    if (env === 1) envMul = 0.5 + fp;
    else if (env === 2) envMul = 1.5 - fp;
    else if (env === 3) envMul = 0.6 + Math.abs(fp - 0.5) * 1.7;
    const amp = hScale * (0.55 + rand() * 0.55) * envMul;
    a.push({ x: x + step * 0.5, y: (i % 2 ? -1 : 1) * amp });
    a.push({ x: x + step, y: (i % 2 ? 0.3 : -0.3) * hScale });
    x += step;
  }
  const crosses = 1 + Math.floor(rand() * 2);
  for (let c = 0; c < crosses; c++) {
    a.push({ x: x * (0.1 + rand() * 0.3), y: (c % 2 ? -1 : 1) * hScale * (0.6 + rand() * 0.5) });
    a.push({ x: x * (0.7 + rand() * 0.3), y: (c % 2 ? 0.3 : -0.2) * hScale });
  }
  return { anchors: a, box: [2.8, 1.5], sharp: true, slant: 0.04 + rand() * 0.16 };
}

function buildSovereign(rand: Rand): Build {
  const a: V2[] = [];
  const variant = Math.floor(rand() * 5);
  const f = 1.2 + rand() * 1.2;
  const bodyY = 0.4 + rand() * 0.4;
  const bx0 = -0.3 + (rand() - 0.5) * 0.5;
  const body = 2 + Math.floor(rand() * 2);
  let bx = bx0;
  for (let i = 0; i < body; i++) {
    a.push({ x: bx, y: bodyY + (i % 2 ? -0.2 : 0.22) }, { x: bx + 0.22, y: bodyY - 0.08 });
    bx += 0.28;
  }
  const ex = bx;
  if (variant === 0) {
    a.push({ x: ex + 0.4 * f, y: bodyY + 0.2 }, { x: ex + 1.5 * f, y: 0.0 });
    a.push({ x: ex - 1.2 * f, y: -0.7 - 0.3 * f }, { x: ex + 1.9 * f, y: -0.4 });
  } else if (variant === 1) {
    a.push({ x: ex + 0.5 * f, y: 0.1 }, { x: ex + 1.3 * f, y: -0.6 * f });
    a.push({ x: ex - 0.1 * f, y: -0.95 * f }, { x: ex + 1.1 * f, y: -1.3 * f }, { x: ex + 1.8 * f, y: -0.7 * f });
  } else if (variant === 2) {
    a.push({ x: ex + 0.3 * f, y: bodyY + 0.3 }, { x: ex + 0.2 * f, y: bodyY + 1.0 + 0.5 * f });
    a.push({ x: ex - 0.7 * f, y: bodyY + 0.6 }, { x: ex + 1.6 * f, y: 0.0 }, { x: ex + 2.0 * f, y: -0.3 });
  } else if (variant === 3) {
    a.push({ x: ex + 0.5 * f, y: 0.2 }, { x: ex + 0.9 * f, y: bodyY + 0.9 });
    a.push({ x: bx0 - 0.9 * f, y: bodyY + 0.4 }, { x: bx0 - 0.6 * f, y: -0.7 * f }, { x: ex + 1.4 * f, y: -0.3 });
  } else {
    a.push({ x: ex + 0.4 * f, y: 0.1 }, { x: ex + 1.7 * f, y: -0.1 });
    a.push({ x: ex - 1.0 * f, y: -0.5 * f }, { x: ex + 1.6 * f, y: -0.8 * f }, { x: ex - 0.8 * f, y: -1.1 * f });
  }
  return { anchors: a, box: [3.3, 1.8], sharp: false, slant: 0.05 + rand() * 0.12 };
}

function buildVertical(rand: Rand): Build {
  const variant = Math.floor(rand() * 5);
  const beats = 3 + Math.floor(rand() * 4);
  const lean = (rand() * 2 - 1) * 0.4;
  const top = 1.0;
  const H = 2.0;
  const a: V2[] = [{ x: (rand() - 0.5) * 0.2, y: top + 0.1 }];

  if (variant === 0) {
    const envType = Math.floor(rand() * 3);
    for (let i = 0; i < beats; i++) {
      const fp = beats > 1 ? i / (beats - 1) : 0;
      let env = 1;
      if (envType === 1) env = 0.4 + fp;
      else if (envType === 2) env = 1.4 - fp;
      const amp = (0.35 + rand() * 0.4) * env * (i % 2 ? -1 : 1);
      a.push({ x: amp, y: top - H * ((i + 0.5) / beats) });
    }
  } else if (variant === 1) {
    for (let i = 0; i < beats; i++) {
      const amp = (0.4 + rand() * 0.3) * (i % 2 ? -1 : 1);
      const yb = top - H * (i / beats);
      a.push({ x: amp, y: yb - (H / beats) * 0.35 });
      a.push({ x: amp * 0.4, y: yb - (H / beats) * 0.6 });
      a.push({ x: (rand() - 0.5) * 0.15, y: yb - H / beats });
    }
  } else if (variant === 2) {
    for (let i = 0; i <= beats; i++) {
      const y = top - H * (i / beats);
      a.push({ x: (rand() - 0.5) * 0.1, y });
      if (i > 0 && i < beats && rand() < 0.7) {
        a.push({ x: 0.5 + rand() * 0.2, y: y + 0.02 });
        a.push({ x: -0.45 - rand() * 0.2, y: y - 0.02 });
        a.push({ x: 0, y: y - 0.06 });
      }
    }
  } else if (variant === 3) {
    const turns = 1.5 + rand() * 1.5;
    const rad = 0.42 + rand() * 0.22;
    const steps = beats * 4;
    for (let k = 0; k <= steps; k++) {
      const t = k / steps;
      a.push({ x: Math.cos(t * turns * TAU) * rad, y: top - H * t });
    }
  } else {
    for (let i = 0; i < beats; i++) {
      const side = i % 2 ? -1 : 1;
      a.push({ x: side * (0.14 + rand() * 0.16), y: top - H * ((i + 0.5) / beats) });
    }
    a.push({ x: (0.4 + rand() * 0.5) * (rand() < 0.5 ? -1 : 1), y: top - H - 0.3 });
  }

  for (const p of a) p.x += lean * (top - p.y) * 0.4;
  return { anchors: a, box: [1.5, 2.1], sharp: false, slant: 0.02 + rand() * 0.05 };
}

const BUILDERS: Record<Archetype, (r: Rand) => Build> = {
  cursive: buildCursive,
  monogram: buildMonogram,
  angular: buildAngular,
  sovereign: buildSovereign,
  vertical: buildVertical,
};

export function seedToSignature(raw: string): Signature {
  const name = (raw ?? "").trim() || "tom";
  const rand = mulberry32(djb2(name));

  const archetype = pickArchetype(rand());
  const palette = PALETTES[Math.floor(rand() * PALETTES.length)];
  const nibAngle = (0.4 + rand() * 0.45) * Math.PI;
  const nibX = Math.cos(nibAngle);
  const nibY = Math.sin(nibAngle);

  const build = BUILDERS[archetype](rand);

  for (const p of build.anchors) p.x += build.slant * p.y;
  const dense = smooth(build.anchors, build.sharp);
  const sampled = resampleByArc(dense, SIG_POINTS);

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const p of sampled) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  const bw = Math.max(1e-3, maxX - minX);
  const bh = Math.max(1e-3, maxY - minY);
  const scale = Math.min(build.box[0] / bw, build.box[1] / bh);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  const pts: SigPoint[] = sampled.map((p, i) => {
    const prev = sampled[Math.max(0, i - 1)];
    const next = sampled[Math.min(sampled.length - 1, i + 1)];
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const len = Math.max(1e-4, Math.hypot(dx, dy));
    const perp = Math.abs((dx / len) * nibY - (dy / len) * nibX);
    const u = i / (sampled.length - 1);
    const taper = smoothstep(0, 0.04, u) * smoothstep(1, 0.96, u);
    const variance = 0.85 + 0.3 * rand();
    const wgt = (0.32 + 1.05 * perp) * variance * taper;
    return { x: (p.x - cx) * scale, y: (p.y - cy) * scale, w: wgt };
  });

  return {
    pts,
    palette,
    archetype,
    zAmp: 0.1 + rand() * 0.12,
    zFreq: 1.2 + rand() * 2.2,
    zPhase: rand() * Math.PI * 2,
    speed: 0.3 + rand() * 0.4,
  };
}
