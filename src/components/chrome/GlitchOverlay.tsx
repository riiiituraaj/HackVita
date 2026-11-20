"use client";

import { useEffect, useState } from "react";
import { on } from "@/lib/bus";
import { useMotion } from "@/lib/motion";

type Bar = { top: number; left: number; h: number; w: number; d: number };

/**
 * Full-screen "glitch cut": horizontal tear bands offset ±20px, magenta bars,
 * scanlines, then the cover clips away top-down. `onMid` runs while covered.
 */
export function GlitchOverlay() {
  const { reduced } = useMotion();
  const [run, setRun] = useState<{ key: number; bars: Bar[]; bands: number[] } | null>(null);

  useEffect(() => {
    return on("glitch", (payload) => {
      if (reduced) {
        payload?.onMid?.();
        return;
      }
      const bars: Bar[] = Array.from({ length: 8 + Math.floor(Math.random() * 7) }, () => ({
        top: Math.random() * 100,
        left: Math.random() * 85,
        h: 2 + Math.floor(Math.random() * 5),
        w: 60 + Math.floor(Math.random() * 240),
        d: Math.floor(Math.random() * 4) * 50,
      }));
      const bands = Array.from({ length: 8 }, () => (Math.random() * 2 - 1) * 20);
      setRun({ key: Date.now(), bars, bands });
      window.setTimeout(() => payload?.onMid?.(), 210);
      window.setTimeout(() => setRun(null), 520);
    });
  }, [reduced]);

  if (!run) return null;
  return (
    <div className="gcut" key={run.key} aria-hidden="true">
      {run.bands.map((dx, i) => (
        <span
          key={i}
          className="gcut__band"
          style={
            {
              top: `${(i / run.bands.length) * 100}%`,
              height: `${100 / run.bands.length}%`,
              "--dx": `${dx}px`,
              animationDelay: `${i * 12}ms`,
            } as React.CSSProperties
          }
        />
      ))}
      <div className="gcut__bars">
        {run.bars.map((b, i) => (
          <span
            key={i}
            style={{
              top: `${b.top}%`,
              left: `${b.left}%`,
              height: b.h,
              width: b.w,
              animationDelay: `${b.d}ms`,
            }}
          />
        ))}
      </div>
      <div className="gcut__scan" />
    </div>
  );
}
