"use client";

import { useEffect, useMemo, useRef } from "react";
import { useMotion } from "@/lib/motion";
import { observeVisibility, seeded } from "@/lib/hooks";
import { scrollState } from "@/lib/lenis";

/**
 * Equalizer light columns hanging from the top: heights follow smooth noise
 * and stretch with scroll velocity.
 */
export function LightColumns({ count = 14 }: { count?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { reduced } = useMotion();
  const bars = useMemo(() => {
    const r = seeded(14);
    return Array.from({ length: count }, (_, i) => ({
      left: (i + 0.5) / count + (r() - 0.5) * 0.03,
      width: 2 + Math.round(r() * 26),
      base: 0.35 + r() * 0.35,
      speed: 0.4 + r() * 0.9,
      phase: r() * 10,
    }));
  }, [count]);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = Array.from(root.children) as HTMLElement[];
    if (reduced) {
      els.forEach((el, i) => (el.style.transform = `scaleY(${bars[i].base})`));
      return;
    }
    let raf = 0;
    let boost = 0;
    const loop = (now: number) => {
      const t = now / 1000;
      boost += (Math.min(1, Math.abs(scrollState.velocity) / 30) - boost) * 0.08;
      els.forEach((el, i) => {
        const b = bars[i];
        const n =
          0.5 +
          0.3 * Math.sin(t * b.speed + b.phase) +
          0.2 * Math.sin(t * b.speed * 2.3 + b.phase * 1.7);
        const h = Math.min(1, b.base * (0.65 + 0.55 * n) + boost * 0.45);
        el.style.transform = `scaleY(${h.toFixed(3)})`;
      });
      raf = requestAnimationFrame(loop);
    };
    const stop = observeVisibility(root, (v) => {
      cancelAnimationFrame(raf);
      if (v) raf = requestAnimationFrame(loop);
    });
    return () => {
      cancelAnimationFrame(raf);
      stop();
    };
  }, [reduced, bars]);

  return (
    <div className="lightcols" ref={ref} aria-hidden="true">
      {bars.map((b, i) => (
        <span
          key={i}
          style={{ left: `${(b.left * 100).toFixed(2)}%`, width: `${b.width}px`, transform: `scaleY(${b.base})` }}
        />
      ))}
    </div>
  );
}
