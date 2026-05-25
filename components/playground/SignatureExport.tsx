"use client";

import { useEffect, useRef, useState } from "react";
import { signatureToSvg, signatureToPngBlob } from "./lib/signatureExport";

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

function fileSlug(seed: string): string {
  return (
    (seed || "tom")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "tom"
  );
}

function downloadSvg(seed: string) {
  triggerDownload(new Blob([signatureToSvg(seed)], { type: "image/svg+xml" }), `signature-${fileSlug(seed)}.svg`);
}
async function downloadPng(seed: string) {
  const blob = await signatureToPngBlob(seed);
  if (blob) triggerDownload(blob, `signature-${fileSlug(seed)}.png`);
}

// No colour/background here; lives in .pg-export-btn so :hover isn't overridden.
const fmtBtn = "cursor-pointer border-none font-mono text-meta uppercase tracking-[0.06em]";

export function SignatureExport({ seed }: { seed: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (fn: (s: string) => void) => {
    fn(seed);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Exporter la signature"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex cursor-pointer items-center justify-center rounded-full border-[0.5px] border-rule-2 px-[11px] py-1 font-mono text-meta tracking-[0.06em] backdrop-blur-[10px] ${
          open ? "bg-ink text-bg" : "bg-glass text-ink-2"
        }`}
      >
        ↓
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+6px)] flex min-w-[72px] flex-col items-stretch overflow-hidden rounded-lg border-[0.5px] border-rule bg-glass shadow-[0_8px_24px_-12px_rgba(0,0,0,0.3)] backdrop-blur-[10px]"
        >
          <button
            role="menuitem"
            type="button"
            className={`pg-export-btn ${fmtBtn} px-3 py-2 text-center`}
            onClick={() => pick(downloadSvg)}
          >
            SVG
          </button>
          <button
            role="menuitem"
            type="button"
            className={`pg-export-btn ${fmtBtn} px-3 py-2 text-center`}
            onClick={() => pick(downloadPng)}
          >
            PNG
          </button>
        </div>
      )}
    </div>
  );
}
