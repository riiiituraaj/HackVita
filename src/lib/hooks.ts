"use client";

import { useEffect, useRef, useState } from "react";
import { useMotion } from "./motion";

export function useReducedMotion() {
  return useMotion().reduced;
}

/** Fires once (by default) when the element first enters the viewport. */
export function useInView<T extends Element>(
  options: { rootMargin?: string; threshold?: number; once?: boolean } = {},
) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  const { rootMargin = "0px 0px -12% 0px", threshold = 0, once = true } = options;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) setInView(false);
      },
      { rootMargin, threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin, threshold, once]);
  return [ref, inView] as const;
}

/** Calls `fn(visible)` whenever an element enters/leaves the viewport (for pausing loops). */
export function observeVisibility(
  el: Element,
  fn: (visible: boolean) => void,
  rootMargin = "100px",
) {
  const io = new IntersectionObserver(([e]) => fn(e.isIntersecting), { rootMargin });
  io.observe(el);
  return () => io.disconnect();
}

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Deterministic PRNG so server and client agree on "random" layouts. */
export function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const pad = (n: number, len = 3) => String(Math.max(0, Math.round(n))).padStart(len, "0");

/** Pixel bitmap font (5×7) for the HackVita mark. "1" = filled block. */
const GLYPHS: Record<string, string[]> = {
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "0": ["01110", "10011", "10101", "10101", "10101", "11001", "01110"],
  ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
  " ": ["000", "000", "000", "000", "000", "000", "000"],
};

/** Returns rows of 0/1 for a word, with a 1-column gap between glyphs. */
export function bitmap(word: string): number[][] {
  const rows: number[][] = Array.from({ length: 7 }, () => []);
  [...word.toUpperCase()].forEach((ch, i) => {
    const g = GLYPHS[ch] ?? GLYPHS[" "];
    for (let r = 0; r < 7; r++) {
      if (i > 0) rows[r].push(0);
      for (const c of g[r]) rows[r].push(c === "1" ? 1 : 0);
    }
  });
  return rows;
}
