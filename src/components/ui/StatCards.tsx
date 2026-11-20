"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { useInView, seeded } from "@/lib/hooks";
import { useMotion } from "@/lib/motion";
import { legacy } from "@/content/hackvita";

/* ---------------- 150+ teams: dot-matrix odometer ---------------- */

export function Odometer({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [ref, inView] = useInView<HTMLSpanElement>({ rootMargin: "0px 0px -10% 0px" });
  const { reduced } = useMotion();
  const digits = String(value).split("").map(Number);
  const on = inView || reduced;
  return (
    <span ref={ref} className="odo font-dot" aria-label={`${value}${suffix}`} role="img">
      {digits.map((d, i) => (
        <span key={i} className="odo__col" aria-hidden="true">
          <span
            className="odo__strip"
            style={{
              // 20 digits in the strip → each is 5% of its height.
              transform: `translateY(${on ? -(d + 10) * 5 : 0}%)`,
              transitionDelay: `${i * 0.12}s`,
            }}
          >
            {Array.from({ length: 20 }, (_, n) => (
              <span key={n}>{n % 10}</span>
            ))}
          </span>
        </span>
      ))}
      {suffix && (
        <span className={`odo__suffix ${on ? "is-on" : ""}`} aria-hidden="true">
          {suffix}
        </span>
      )}
    </span>
  );
}

/* ---------------- 25+ states: abstract dot field ---------------- */

export function DotField({ lit = 25, total = 40 }: { lit?: number; total?: number }) {
  const [ref, inView] = useInView<HTMLDivElement>();
  const { reduced } = useMotion();
  const order = useMemo(() => {
    const r = seeded(25);
    return Array.from({ length: total }, (_, i) => ({ i, k: r() }))
      .sort((a, b) => a.k - b.k)
      .slice(0, lit)
      .map((o) => o.i);
  }, [lit, total]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setCount(lit);
      return;
    }
    let n = 0;
    const id = window.setInterval(() => {
      n++;
      setCount(n);
      if (n >= lit) window.clearInterval(id);
    }, 55);
    return () => window.clearInterval(id);
  }, [inView, reduced, lit]);

  const litSet = new Set(order.slice(0, count));
  return (
    <div className="dotfield" ref={ref} aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={litSet.has(i) ? "is-lit" : ""} />
      ))}
    </div>
  );
}

/* ---------------- 4 editions: pixel blocks + outlined 5.0 ---------------- */

export function EditionBlocks() {
  const [ref, inView] = useInView<HTMLDivElement>();
  const { reduced } = useMotion();
  const on = inView || reduced;
  return (
    <div className={`blocks ${on ? "is-on" : ""}`} ref={ref} aria-hidden="true">
      <span className="blocks__next" style={{ transitionDelay: "0.6s" }}>
        5.0
      </span>
      {["4.0", "3.0", "2.0", "1.0"].map((v, i) => (
        <span key={v} className="blocks__b" style={{ transitionDelay: `${(3 - i) * 0.12}s` }}>
          {v}
        </span>
      ))}
    </div>
  );
}

/* ---------------- 24 hours: radial dial filled by scroll ---------------- */

export function HourDial() {
  const ref = useRef<SVGSVGElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const { reduced, booted } = useMotion();
  const R = 52;
  const C = 2 * Math.PI * R;

  useEffect(() => {
    const ring = ringRef.current;
    if (!ring || !booted) return;
    if (reduced) {
      ring.style.strokeDashoffset = "0";
      return;
    }
    const st = ScrollTrigger.create({
      trigger: ref.current,
      start: "top 95%",
      end: "center 40%",
      scrub: true,
      onUpdate: (self) => {
        ring.style.strokeDashoffset = String(C * (1 - self.progress));
      },
    });
    return () => st.kill();
  }, [reduced, booted, C]);

  return (
    <svg ref={ref} className="dial" viewBox="0 0 120 120" aria-hidden="true">
      {Array.from({ length: 24 }, (_, i) => {
        const a = (i / 24) * Math.PI * 2 - Math.PI / 2;
        const r1 = i % 6 === 0 ? 38 : 41;
        return (
          <line
            key={i}
            x1={60 + Math.cos(a) * r1}
            y1={60 + Math.sin(a) * r1}
            x2={60 + Math.cos(a) * 44}
            y2={60 + Math.sin(a) * 44}
            className="dial__tick"
          />
        );
      })}
      <circle cx="60" cy="60" r={R} className="dial__track" />
      <circle
        ref={ringRef}
        cx="60"
        cy="60"
        r={R}
        className="dial__ring"
        strokeDasharray={C}
        strokeDashoffset={C}
        transform="rotate(-90 60 60)"
      />
    </svg>
  );
}

/* ---------------- 1–4 team size: pixel avatars ---------------- */

const AVATAR = ["01110", "01110", "00100", "11111", "01110", "01010"];

export function Avatars() {
  const [ref, inView] = useInView<HTMLDivElement>();
  const { reduced } = useMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setN(4);
      return;
    }
    let k = 0;
    const id = window.setInterval(() => {
      k = k >= 4 ? 1 : k + 1;
      setN(k);
    }, 650);
    setN(1);
    return () => window.clearInterval(id);
  }, [inView, reduced]);
  return (
    <div className="avatars" ref={ref} aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <svg key={i} viewBox="0 0 5 6" className={`avatar ${i < n ? "is-on" : ""}`} shapeRendering="crispEdges">
          {AVATAR.flatMap((row, y) =>
            [...row].map((c, x) => (c === "1" ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} /> : null)),
          )}
        </svg>
      ))}
      <span className="avatars__count font-dot">{n || 1}</span>
    </div>
  );
}

export const qualifier = legacy.qualifier;
