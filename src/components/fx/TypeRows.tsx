"use client";

import { useEffect, useState } from "react";
import { useInView } from "@/lib/hooks";
import { useMotion } from "@/lib/motion";

/** Numbered terminal rows that type in, one after another, on enter. */
export function TypeRows({ rows, cps = 70 }: { rows: string[]; cps?: number }) {
  const [ref, inView] = useInView<HTMLOListElement>();
  const { reduced } = useMotion();
  const total = rows.reduce((n, r) => n + r.length, 0);
  const [chars, setChars] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setChars(total);
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const c = Math.floor(((now - t0) / 1000) * cps);
      setChars(Math.min(total, c));
      if (c < total) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced, total, cps]);

  let budget = chars;
  return (
    <ol className="typerows" ref={ref}>
      {rows.map((r, i) => {
        const shown = r.slice(0, Math.max(0, budget));
        const typing = budget > 0 && budget < r.length;
        budget -= r.length;
        return (
          <li key={i} className={`typerows__row ${shown.length ? "is-on" : ""}`}>
            <span className="typerows__n" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="typerows__arrow" aria-hidden="true">
              →
            </span>
            <span className="sr-only">{r}</span>
            <span className="typerows__text" aria-hidden="true">
              {shown}
              {typing && <span className="blink-cursor" />}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
