"use client";

import type Lenis from "lenis";
import { emit } from "./bus";

let lenis: Lenis | null = null;

/** Live scroll state, written by SmoothScroll (Lenis or the native fallback). */
export const scrollState = { velocity: 0, direction: 0 as -1 | 0 | 1, y: 0 };

export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

export function getLenis() {
  return lenis;
}

/** Smooth-scroll to a section id (or a pixel offset), with a native fallback. */
export function scrollToTarget(target: string | number, opts: { immediate?: boolean } = {}) {
  const el = typeof target === "string" ? document.getElementById(target) : null;
  if (lenis) {
    lenis.scrollTo(el ?? (typeof target === "number" ? target : 0), {
      immediate: opts.immediate,
      force: true,
      duration: opts.immediate ? undefined : 1.4,
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
    });
  } else if (el) {
    el.scrollIntoView({ behavior: "auto", block: "start" });
  } else {
    window.scrollTo({ top: typeof target === "number" ? target : 0, behavior: "auto" });
  }
  // Move focus for keyboard and screen-reader users without a second jump.
  const focusTarget =
    el?.querySelector<HTMLElement>("h1, h2") ?? el ?? document.getElementById("main");
  if (focusTarget) {
    if (!focusTarget.hasAttribute("tabindex")) focusTarget.setAttribute("tabindex", "-1");
    window.setTimeout(
      () => focusTarget.focus({ preventScroll: true }),
      opts.immediate || !lenis ? 0 : 1200,
    );
  }
}

/** Jump with a full-screen glitch cut hiding the jump. */
export function glitchJump(target: string | number) {
  emit("glitch", { onMid: () => scrollToTarget(target, { immediate: true }) });
}
