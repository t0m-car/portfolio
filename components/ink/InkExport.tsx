"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

// Export menu for the ink field, mirroring the signature's: a ↓ pill that opens a
// PNG / MP4 menu. The clip uses the browser's MediaRecorder on the canvas stream
// (MP4 where supported, WebM fallback). No dependency. ~4s.

const CLIP_MS = 4000;

function slug(s: string): string {
  return (
    (s || "tom")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "tom"
  );
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function pickVideoMime(): string {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = ["video/mp4;codecs=avc1.640028", "video/mp4", "video/webm;codecs=vp9", "video/webm"];
  return candidates.find((c) => MediaRecorder.isTypeSupported(c)) ?? "";
}

const btn = "pg-export-btn cursor-pointer border-none font-mono text-meta uppercase tracking-[0.06em] px-3 py-2 text-center";

export function InkExport({
  canvasRef,
  seed,
}: {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  seed: string;
}) {
  const [open, setOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Stop a clip in flight if the component unmounts.
  useEffect(() => {
    return () => {
      if (recRef.current?.state === "recording") recRef.current.stop();
    };
  }, []);

  const exportPng = () => {
    setOpen(false);
    canvasRef.current?.toBlob((b) => b && triggerDownload(b, `ink-${slug(seed)}.png`), "image/png");
  };

  const exportVideo = () => {
    setOpen(false);
    const canvas = canvasRef.current;
    const mime = pickVideoMime();
    if (!canvas || !mime || typeof canvas.captureStream !== "function") {
      console.warn("[ink] video capture unsupported in this browser");
      return;
    }
    const rec = new MediaRecorder(canvas.captureStream(30), {
      mimeType: mime,
      videoBitsPerSecond: 8_000_000,
    });
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    rec.onstop = () => {
      const ext = mime.includes("mp4") ? "mp4" : "webm";
      triggerDownload(new Blob(chunks, { type: mime }), `ink-${slug(seed)}.${ext}`);
      setRecording(false);
    };
    recRef.current = rec;
    rec.start();
    setRecording(true);
    window.setTimeout(() => rec.state === "recording" && rec.stop(), CLIP_MS);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Export the ink"
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={recording}
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex cursor-pointer items-center justify-center rounded-full border-[0.5px] border-rule-2 px-[11px] py-1 font-mono text-meta tracking-[0.06em] backdrop-blur-[10px] ${
          open ? "bg-ink text-bg" : "bg-glass text-ink-2"
        } ${recording ? "cursor-default" : ""}`}
      >
        {recording ? "● REC" : "↓"}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+6px)] flex min-w-[72px] flex-col items-stretch overflow-hidden rounded-lg border-[0.5px] border-rule bg-glass shadow-[0_8px_24px_-12px_rgba(0,0,0,0.3)] backdrop-blur-[10px]"
        >
          <button role="menuitem" type="button" className={btn} onClick={exportPng}>
            PNG
          </button>
          <button role="menuitem" type="button" className={btn} onClick={exportVideo}>
            MP4
          </button>
        </div>
      )}
    </div>
  );
}
