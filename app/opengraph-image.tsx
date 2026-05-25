import { ImageResponse } from "next/og";
import { content } from "@/lib/content";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Tom Cardoen · Software Engineer · tomca.be";

// next/og (Satori) ignores global CSS, so these mirror the globals.css :root hexes (sanctioned no-inline exception).
const BG = "#f7f6f3";
const INK = "#16161a";
const INK_3 = "#6e6e76";
const INK_4 = "#a3a3aa";
const ACCENT = "#1d4ed8";

async function loadGeist(weight: number, text: string): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=Geist:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const src = css.match(/src:\s*url\((https:\/\/[^)]+)\)\s*format\('(?:opentype|truetype)'\)/);
  if (!src) throw new Error(`Geist ${weight}: no ttf/otf face in Google Fonts CSS`);
  const res = await fetch(src[1]);
  if (!res.ok) throw new Error(`Geist ${weight}: font fetch ${res.status}`);
  return res.arrayBuffer();
}

export default async function Image() {
  const [name = "Tom Cardoen", role = "", location = ""] = content.hero.metaLine.split(" · ");
  const tagline = content.hero.h1Line1;
  const url = "tomca.be";
  const eyebrow = role.toUpperCase();

  const text = `${name}${eyebrow}${tagline}${url}${location}`;

  let fonts: { name: string; data: ArrayBuffer; weight: 500 | 600; style: "normal" }[] | undefined;
  try {
    const [w500, w600] = await Promise.all([loadGeist(500, text), loadGeist(600, text)]);
    fonts = [
      { name: "Geist", data: w500, weight: 500, style: "normal" },
      { name: "Geist", data: w600, weight: 600, style: "normal" },
    ];
  } catch (err) {
    console.warn("[opengraph-image] Geist load failed, using fallback font:", err);
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "76px 88px",
          background: BG,
          color: INK,
          fontFamily: "Geist",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -260,
            right: -200,
            width: 760,
            height: 760,
            background: "radial-gradient(circle at center, rgba(29, 78, 216, 0.10), rgba(29, 78, 216, 0) 70%)",
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ width: 9, height: 9, borderRadius: 999, background: ACCENT, marginRight: 14, display: "flex" }} />
          <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: 3, color: INK_3 }}>{eyebrow}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 92, fontWeight: 600, letterSpacing: -3, lineHeight: 1, color: INK }}>{name}</div>
          <div
            style={{
              fontSize: 38,
              fontWeight: 500,
              letterSpacing: -0.5,
              lineHeight: 1.2,
              color: INK_3,
              marginTop: 26,
              maxWidth: 900,
            }}
          >
            {tagline}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.3, color: ACCENT }}>{url}</div>
          <div style={{ fontSize: 20, fontWeight: 500, letterSpacing: 0.4, color: INK_4 }}>{location}</div>
        </div>
      </div>
    ),
    { ...size, ...(fonts ? { fonts } : {}) },
  );
}
