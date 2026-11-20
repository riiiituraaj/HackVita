"use client";

import { useEffect, useRef } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { useMotion } from "@/lib/motion";

// Bayer 4×4 thresholds (0..15)/16
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

/** Ink → magenta → pink → pink-50 duotone ramp. */
function ramp(l: number): [number, number, number] {
  const stops: [number, [number, number, number]][] = [
    [0, [5, 0, 6]],
    [0.32, [143, 0, 130]],
    [0.62, [255, 31, 143]],
    [1, [255, 240, 248]],
  ];
  for (let i = 1; i < stops.length; i++) {
    if (l <= stops[i][0]) {
      const [a, ca] = stops[i - 1];
      const [b, cb] = stops[i];
      const t = (l - a) / (b - a);
      return [ca[0] + (cb[0] - ca[0]) * t, ca[1] + (cb[1] - ca[1]) * t, ca[2] + (cb[2] - ca[2]) * t];
    }
  }
  return stops[stops.length - 1][1];
}

/**
 * Dithered portrait that de-pixelates (block 32 → 1) as it scrolls to the
 * centre of the viewport.
 */
export function PixelPortrait({ src, alt }: { src: string; alt: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { reduced, booted } = useMotion();

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas || !booted) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dither = document.createElement("canvas");
    const small = document.createElement("canvas");
    const sctx = small.getContext("2d")!;
    let img: HTMLImageElement | null = null;
    let block = reduced ? 1 : 32;
    let lastDrawn = -1;

    const prepare = () => {
      if (!img) return;
      const r = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const w = Math.max(1, Math.round(r.width * dpr));
      const h = Math.max(1, Math.round(r.height * dpr));
      canvas.width = w;
      canvas.height = h;
      // Work at CSS-pixel resolution so the dither cell stays 2px on screen.
      const dw = Math.max(1, Math.round(r.width / 2));
      const dh = Math.max(1, Math.round(r.height / 2));
      dither.width = dw;
      dither.height = dh;
      const dctx = dither.getContext("2d", { willReadFrequently: true })!;
      const ir = img.naturalWidth / img.naturalHeight;
      const cr = dw / dh;
      let sw = img.naturalWidth;
      let sh = img.naturalHeight;
      let sx = 0;
      let sy = 0;
      if (ir > cr) {
        sw = sh * cr;
        sx = (img.naturalWidth - sw) / 2;
      } else {
        sh = sw / cr;
        sy = (img.naturalHeight - sh) / 2;
      }
      dctx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);
      const data = dctx.getImageData(0, 0, dw, dh);
      const d = data.data;
      for (let y = 0; y < dh; y++) {
        for (let x = 0; x < dw; x++) {
          const i = (y * dw + x) * 4;
          let l = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255;
          l = Math.min(1, Math.max(0, (l - 0.04) / 0.88));
          const q = Math.floor(l * 5 + BAYER[(y % 4) * 4 + (x % 4)]) / 5;
          const [cr2, cg, cb] = ramp(Math.min(1, q));
          d[i] = cr2;
          d[i + 1] = cg;
          d[i + 2] = cb;
        }
      }
      dctx.putImageData(data, 0, 0);
      lastDrawn = -1;
      draw();
    };

    const draw = () => {
      if (!img || dither.width < 2) return;
      const b = Math.max(1, Math.round(block));
      if (b === lastDrawn) return;
      lastDrawn = b;
      ctx.imageSmoothingEnabled = false;
      if (b <= 1) {
        ctx.drawImage(dither, 0, 0, canvas.width, canvas.height);
        return;
      }
      // b is in CSS px; the dither canvas is at 1/2 CSS px.
      const sw = Math.max(1, Math.round((dither.width * 2) / b));
      const sh = Math.max(1, Math.round((dither.height * 2) / b));
      small.width = sw;
      small.height = sh;
      sctx.imageSmoothingEnabled = true;
      sctx.drawImage(dither, 0, 0, sw, sh);
      ctx.drawImage(small, 0, 0, sw, sh, 0, 0, canvas.width, canvas.height);
    };

    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      img = image;
      prepare();
    };
    image.src = src;

    const ro = new ResizeObserver(() => prepare());
    ro.observe(wrap);

    let st: ScrollTrigger | undefined;
    if (!reduced) {
      st = ScrollTrigger.create({
        trigger: wrap,
        start: "top bottom",
        end: "center center",
        onUpdate: (self) => {
          // Exponential feel: 32 → 1
          block = Math.pow(32, 1 - self.progress);
          draw();
        },
        onLeave: () => {
          block = 1;
          draw();
        },
      });
    }
    return () => {
      ro.disconnect();
      st?.kill();
    };
  }, [src, reduced, booted]);

  return (
    <div className="portrait__media" ref={wrapRef}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="portrait__img" src={src} alt={alt} loading="lazy" decoding="async" />
      <canvas ref={canvasRef} className="portrait__canvas" aria-hidden="true" />
    </div>
  );
}
