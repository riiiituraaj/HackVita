"use client";

import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useMotion } from "@/lib/motion";
import { scrollState } from "@/lib/lenis";
import { scrambleText } from "./scramble";

/**
 * Site-wide, attribute-driven micro-interactions:
 *  [data-reveal]          paragraph fade + rise 16px on enter
 *  [data-reveal-stagger]  children stagger in (60ms)
 *  [data-count]           numbers count up on enter
 *  [data-tilt]            3D tilt (max 4°) + pointer specular
 *  [data-scramble]        text scrambles on hover
 *  [data-skew]            scroll-velocity skew (max 3°)
 */
export function Interactions() {
  const { reduced, finePointer, booted } = useMotion();

  // Reveals + counters (scroll-driven).
  useEffect(() => {
    if (!booted) return;
    if (reduced) {
      document.querySelectorAll("[data-reveal-stagger]").forEach((el) => el.classList.add("is-in"));
      document.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
        el.textContent = formatCount(el, Number(el.dataset.count));
      });
      return;
    }
    // Never hide content the visitor has already scrolled past (deep links,
    // toggling motion back on mid-page) — only what is in or below view.
    const notAbove = (el: Element) => el.getBoundingClientRect().bottom > 0;
    const ctx = gsap.context(() => {
      const singles = gsap.utils.toArray<HTMLElement>("[data-reveal]").filter(notAbove);
      gsap.set(singles, { autoAlpha: 0, y: 16 });
      ScrollTrigger.batch(singles, {
        start: "top 90%",
        once: true,
        onEnter: (els) =>
          gsap.to(els, {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "expo.out",
            stagger: 0.06,
            overwrite: true,
            clearProps: "transform,opacity,visibility",
          }),
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal-stagger]").forEach((parent) => {
        if (!notAbove(parent)) {
          parent.classList.add("is-in");
          return;
        }
        const kids = Array.from(parent.children) as HTMLElement[];
        gsap.set(kids, { autoAlpha: 0, y: 20 });
        ScrollTrigger.create({
          trigger: parent,
          start: "top 88%",
          once: true,
          onEnter: () => {
            parent.classList.add("is-in");
            gsap.to(kids, {
              autoAlpha: 1,
              y: 0,
              duration: 0.8,
              ease: "expo.out",
              stagger: 0.06,
              clearProps: "transform,opacity,visibility",
            });
          },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-count]").filter(notAbove).forEach((el) => {
        const target = Number(el.dataset.count);
        const obj = { v: 0 };
        el.textContent = formatCount(el, 0);
        ScrollTrigger.create({
          trigger: el,
          start: "top 92%",
          once: true,
          onEnter: () =>
            gsap.to(obj, {
              v: target,
              duration: Number(el.dataset.countDur ?? 1.4),
              ease: "power3.out",
              onUpdate: () => {
                el.textContent = formatCount(el, obj.v);
              },
            }),
        });
      });
    });
    // Positions depend on pins created by sections; refresh once everything is mounted.
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => {
      window.clearTimeout(id);
      ctx.revert();
    };
  }, [reduced, booted]);

  // Pointer tilt + specular, and hover scramble.
  useEffect(() => {
    if (reduced || !finePointer) return;
    let tiltEl: HTMLElement | null = null;
    const onMove = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-tilt]") ?? null;
      if (tiltEl && el !== tiltEl) resetTilt(tiltEl);
      tiltEl = el;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const max = Number(el.dataset.tilt || 4);
      el.classList.add("is-tilting");
      el.style.setProperty("--ry", `${((px - 0.5) * 2 * max).toFixed(2)}deg`);
      el.style.setProperty("--rx", `${(-(py - 0.5) * 2 * max).toFixed(2)}deg`);
      el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
      el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
    };
    const onLeaveDoc = () => {
      if (tiltEl) resetTilt(tiltEl);
      tiltEl = null;
    };
    const onOver = (e: PointerEvent) => {
      const host = (e.target as Element | null)?.closest<HTMLElement>(".chip, [data-scramble-host]");
      if (!host) return;
      const related = e.relatedTarget as Node | null;
      if (related && host.contains(related)) return;
      host.querySelectorAll<HTMLElement>("[data-scramble]").forEach((s) => scrambleText(s, undefined, 450));
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeaveDoc);
    document.addEventListener("pointerover", onOver);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeaveDoc);
      document.removeEventListener("pointerover", onOver);
      if (tiltEl) resetTilt(tiltEl);
    };
  }, [reduced, finePointer]);

  // Scroll-velocity skew with spring-back.
  useEffect(() => {
    if (reduced) return;
    let els = Array.from(document.querySelectorAll<HTMLElement>("[data-skew]"));
    let skew = 0;
    let last = 0;
    const refresh = window.setTimeout(() => {
      els = Array.from(document.querySelectorAll<HTMLElement>("[data-skew]"));
    }, 1000);
    const tick = () => {
      const target = gsap.utils.clamp(-3, 3, scrollState.velocity * 0.09);
      skew += (target - skew) * 0.12;
      if (Math.abs(skew - last) > 0.01) {
        last = skew;
        const v = `${skew.toFixed(2)}deg`;
        els.forEach((el) => el.style.setProperty("--skew", v));
      }
    };
    gsap.ticker.add(tick);
    return () => {
      window.clearTimeout(refresh);
      gsap.ticker.remove(tick);
      els.forEach((el) => el.style.removeProperty("--skew"));
    };
  }, [reduced]);

  return null;
}

function resetTilt(el: HTMLElement) {
  el.classList.remove("is-tilting");
  el.style.setProperty("--rx", "0deg");
  el.style.setProperty("--ry", "0deg");
}

function formatCount(el: HTMLElement, v: number) {
  const pad = Number(el.dataset.pad ?? 0);
  const s = String(Math.round(v)).padStart(pad, "0");
  return `${el.dataset.prefix ?? ""}${s}${el.dataset.suffix ?? ""}`;
}
