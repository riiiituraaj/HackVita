"use client";

import { useEffect, useRef } from "react";
import { useMotion } from "@/lib/motion";
import { observeVisibility } from "@/lib/hooks";

const COLORS = ["#ff1f8f", "#ff00e5", "#ff4aaa", "#cc00b8", "#ff7ac2", "#8f0082"];

/**
 * Procedural "pixel-block video": large pink/magenta mosaic squares drifting
 * and blinking. Canvas 2D, ~30fps, only while visible.
 */
export function PixelBlocks({ seed = 1, className = "" }: { seed?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { reduced } = useMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let w = 0;
    let h = 0;
    let cell = 24;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width));
      h = Math.max(1, Math.round(r.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      cell = Math.max(18, Math.round(Math.min(w, h) / 11));
      draw(performance.now());
    };

    // Cheap deterministic noise.
    const hash = (x: number, y: number, s: number) => {
      const n = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453;
      return n - Math.floor(n);
    };
    const field = (x: number, y: number, t: number) =>
      0.5 +
      0.25 * Math.sin(x * 0.45 + t * 0.7 + seed) +
      0.2 * Math.sin(y * 0.6 - t * 0.5 + seed * 2.1) +
      0.15 * Math.sin((x + y) * 0.3 + t * 1.1);

    const draw = (now: number) => {
      const t = reduced ? 3 : now / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#0a030d";
      ctx.fillRect(0, 0, w, h);
      const drift = (t * 14) % cell;
      const cols = Math.ceil(w / cell) + 2;
      const rows = Math.ceil(h / cell) + 1;
      for (let gy = 0; gy < rows; gy++) {
        for (let gx = -1; gx < cols; gx++) {
          const wx = gx + Math.floor((t * 14) / cell);
          const v = field(wx, gy, t);
          const blink = hash(wx, gy, Math.floor(t * 2.2 + hash(wx, gy, seed) * 5)) > 0.86;
          if (v < 0.48 && !blink) continue;
          const c = COLORS[Math.floor(hash(wx, gy, seed) * COLORS.length)];
          ctx.globalAlpha = blink ? 1 : Math.min(1, (v - 0.4) * 1.6);
          ctx.fillStyle = c;
          const size = v > 0.75 ? cell - 2 : cell * 0.5;
          const off = (cell - size) / 2;
          ctx.fillRect(gx * cell - drift + off, gy * cell + off, size, size);
        }
      }
      ctx.globalAlpha = 1;
      // Scanlines
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);
    };

    let raf = 0;
    let last = 0;
    let visible = false;
    const loop = (now: number) => {
      if (now - last > 33) {
        last = now;
        draw(now);
      }
      raf = requestAnimationFrame(loop);
    };
    const stopVis = observeVisibility(canvas, (v) => {
      visible = v;
      cancelAnimationFrame(raf);
      if (visible && !reduced) raf = requestAnimationFrame(loop);
      else draw(performance.now());
    });
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => {
      cancelAnimationFrame(raf);
      stopVis();
      ro.disconnect();
    };
  }, [seed, reduced]);

  return <canvas ref={ref} className={`pixelblocks ${className}`} aria-hidden="true" />;
}
