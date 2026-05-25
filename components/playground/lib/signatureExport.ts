import { seedToSignature, type Signature } from "./signature";

const INK_W = 0.05; // must match Signature2DDemo
const PAD = 0.22;
const PAPER = "#f7f6f3"; // must match --bg (light)

type Pt = { x: number; y: number };

const ink = (s: Signature) => `hsl(${s.palette.ink[0]}, ${s.palette.ink[1]}%, ${s.palette.ink[2]}%)`;

function outline(sig: Signature): { left: Pt[]; right: Pt[] } {
  const p = sig.pts;
  const n = p.length;
  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = p[Math.max(0, i - 1)];
    const b = p[Math.min(n - 1, i + 1)];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.max(1e-4, Math.hypot(dx, dy));
    const hw = p[i].w * INK_W;
    left.push({ x: p[i].x + (-dy / len) * hw, y: p[i].y + (dx / len) * hw });
    right.push({ x: p[i].x - (-dy / len) * hw, y: p[i].y - (dx / len) * hw });
  }
  return { left, right };
}

function bounds(left: Pt[], right: Pt[]) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const p of [...left, ...right]) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, maxX, minY, maxY };
}

export function signatureToSvg(seed: string): string {
  const sig = seedToSignature(seed);
  const { left, right } = outline(sig);
  const { minX, maxX, minY, maxY } = bounds(left, right);
  const SC = 300;
  const W = Math.round((maxX - minX + PAD * 2) * SC);
  const H = Math.round((maxY - minY + PAD * 2) * SC);
  const mx = (x: number) => ((x - minX + PAD) * SC).toFixed(1);
  const my = (y: number) => ((maxY - y + PAD) * SC).toFixed(1);

  const n = left.length;
  let d = `M ${mx(left[0].x)} ${my(left[0].y)}`;
  for (let i = 1; i < n; i++) d += ` L ${mx(left[i].x)} ${my(left[i].y)}`;
  for (let i = n - 1; i >= 0; i--) d += ` L ${mx(right[i].x)} ${my(right[i].y)}`;
  d += " Z";

  const wm = Math.max(11, Math.round(H * 0.04));
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`,
    `<path d="${d}" fill="${ink(sig)}"/>`,
    `<text x="${W - PAD * SC}" y="${H - PAD * SC * 0.45}" text-anchor="end" ` +
      `font-family="ui-monospace, monospace" font-size="${wm}" fill="${ink(sig)}" opacity="0.45">tomca.be</text>`,
    `</svg>`,
  ].join("");
}

export function signatureToPngBlob(seed: string): Promise<Blob | null> {
  const sig = seedToSignature(seed);
  const { left, right } = outline(sig);
  const { minX, maxX, minY, maxY } = bounds(left, right);
  const rangeX = maxX - minX + PAD * 2;
  const rangeY = maxY - minY + PAD * 2;
  const SC = 1400 / Math.max(rangeX, rangeY);
  const W = Math.round(rangeX * SC);
  const H = Math.round(rangeY * SC);

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.resolve(null);

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  const mx = (x: number) => (x - minX + PAD) * SC;
  const my = (y: number) => (maxY - y + PAD) * SC;
  const n = left.length;
  ctx.beginPath();
  ctx.moveTo(mx(left[0].x), my(left[0].y));
  for (let i = 1; i < n; i++) ctx.lineTo(mx(left[i].x), my(left[i].y));
  for (let i = n - 1; i >= 0; i--) ctx.lineTo(mx(right[i].x), my(right[i].y));
  ctx.closePath();
  ctx.fillStyle = ink(sig);
  ctx.fill();

  const wm = Math.max(12, Math.round(H * 0.035));
  ctx.font = `${wm}px ui-monospace, monospace`;
  ctx.textAlign = "right";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = `hsla(${sig.palette.ink[0]}, 28%, 38%, 0.55)`;
  ctx.fillText("tomca.be", W - PAD * SC, H - PAD * SC * 0.5);

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
}
