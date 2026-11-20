"use client";

import { useEffect, useRef } from "react";
import { useMotion } from "@/lib/motion";
import { observeVisibility } from "@/lib/hooks";

/**
 * Perspective "room" wireframe: a rectangular tunnel receding to a vanishing
 * point, with grid lines on all four walls. The vanishing point follows the
 * mouse (±30px) and the camera dollies in as the footer scrolls into view.
 */
export function FooterTunnel() {
  const ref = useRef<HTMLCanvasElement>(null);
  const { reduced, finePointer } = useMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    let w = 0;
    let h = 0;
    let mx = 0;
    let my = 0;
    let vx = 0;
    let vy = 0;
    let dolly = 0;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      draw(performance.now());
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      my = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };

    const draw = (now: number) => {
      const t = reduced ? 0 : now / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      vx += (mx * 30 - vx) * 0.06;
      vy += (my * 30 - vy) * 0.06;
      // Dolly-in as the footer enters (0 → 1).
      const r = canvas.getBoundingClientRect();
      const enter = Math.min(1, Math.max(0, 1 - r.top / window.innerHeight));
      dolly += (enter - dolly) * 0.1;

      const cx = w / 2;
      const cy = h / 2;
      const Vx = cx + vx;
      const Vy = cy + vy;
      const f = 1;
      const depthOf = (z: number) => f / (f + z);
      const rectAt = (s: number) => {
        const x = Vx + (cx - Vx) * s;
        const y = Vy + (cy - Vy) * s;
        return { x0: x - (w / 2) * s, y0: y - (h / 2) * s, x1: x + (w / 2) * s, y1: y + (h / 2) * s };
      };

      ctx.strokeStyle = "#000";
      // Depth rings, drifting toward the viewer.
      const spacing = 0.55;
      const drift = (t * 0.12 + dolly * 1.4) % spacing;
      const backZ = 9 - dolly * 2.5;
      for (let z = spacing - drift; z < backZ; z += spacing) {
        const s = depthOf(z);
        const a = Math.min(1, s * 1.6);
        ctx.globalAlpha = 0.18 + a * 0.5;
        ctx.lineWidth = 1;
        const q = rectAt(s);
        ctx.strokeRect(q.x0, q.y0, q.x1 - q.x0, q.y1 - q.y0);
      }
      // Back wall + its grid.
      const sb = depthOf(backZ);
      const back = rectAt(sb);
      ctx.globalAlpha = 0.85;
      ctx.lineWidth = 1.25;
      ctx.strokeRect(back.x0, back.y0, back.x1 - back.x0, back.y1 - back.y0);
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 1;
      const cols = 12;
      const rows = 8;
      ctx.beginPath();
      for (let i = 1; i < cols; i++) {
        const x = back.x0 + ((back.x1 - back.x0) * i) / cols;
        ctx.moveTo(x, back.y0);
        ctx.lineTo(x, back.y1);
      }
      for (let j = 1; j < rows; j++) {
        const y = back.y0 + ((back.y1 - back.y0) * j) / rows;
        ctx.moveTo(back.x0, y);
        ctx.lineTo(back.x1, y);
      }
      ctx.stroke();
      // Longitudinal lines on the four walls.
      const front = rectAt(1);
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      for (let i = 0; i <= cols; i++) {
        const u = i / cols;
        // top + bottom walls
        ctx.moveTo(front.x0 + (front.x1 - front.x0) * u, front.y0);
        ctx.lineTo(back.x0 + (back.x1 - back.x0) * u, back.y0);
        ctx.moveTo(front.x0 + (front.x1 - front.x0) * u, front.y1);
        ctx.lineTo(back.x0 + (back.x1 - back.x0) * u, back.y1);
      }
      for (let j = 0; j <= rows; j++) {
        const u = j / rows;
        // left + right walls
        ctx.moveTo(front.x0, front.y0 + (front.y1 - front.y0) * u);
        ctx.lineTo(back.x0, back.y0 + (back.y1 - back.y0) * u);
        ctx.moveTo(front.x1, front.y0 + (front.y1 - front.y0) * u);
        ctx.lineTo(back.x1, back.y0 + (back.y1 - back.y0) * u);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    let raf = 0;
    const loop = (now: number) => {
      draw(now);
      raf = requestAnimationFrame(loop);
    };
    const stop = observeVisibility(canvas, (v) => {
      cancelAnimationFrame(raf);
      if (v && !reduced) raf = requestAnimationFrame(loop);
      else draw(performance.now());
    });
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    if (finePointer && !reduced) window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      stop();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [reduced, finePointer]);

  return <canvas ref={ref} className="tunnel" aria-hidden="true" />;
}
