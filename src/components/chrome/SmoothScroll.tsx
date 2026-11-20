"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { getLenis, scrollState, setLenis } from "@/lib/lenis";
import { useMotion } from "@/lib/motion";
import { emit } from "@/lib/bus";

/**
 * Lenis smooth scrolling synced to the GSAP ticker, plus a section spy that
 * emits a `section` event whenever a new [data-section] reaches mid-screen.
 */
export function SmoothScroll() {
  const { reduced, booted } = useMotion();

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (!location.hash) window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (reduced) {
      setLenis(null);
      let last = window.scrollY;
      let raf = 0;
      const tick = () => {
        const y = window.scrollY;
        scrollState.velocity = y - last;
        scrollState.direction = y > last ? 1 : y < last ? -1 : scrollState.direction;
        scrollState.y = y;
        last = y;
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: false });
    setLenis(lenis);
    lenis.on("scroll", (l: Lenis) => {
      ScrollTrigger.update();
      scrollState.velocity = l.velocity;
      scrollState.direction = (l.direction as -1 | 0 | 1) || scrollState.direction;
      scrollState.y = l.scroll;
    });
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
      scrollState.velocity = 0;
    };
  }, [reduced]);

  // Hold the page still while the boot sequence runs.
  useEffect(() => {
    const l = getLenis();
    if (!booted) l?.stop();
    else {
      l?.start();
      ScrollTrigger.refresh();
    }
  }, [booted, reduced]);

  // Section spy (robust against pin spacing: reads live rects).
  useEffect(() => {
    let current = "";
    let raf = 0;
    let queued = false;
    const check = () => {
      queued = false;
      const mid = window.innerHeight * 0.5;
      const els = document.querySelectorAll<HTMLElement>("[data-section]");
      let id = "";
      els.forEach((el) => {
        if (el.getBoundingClientRect().top <= mid) id = el.dataset.section || id;
      });
      if (!id && els[0]) id = els[0].dataset.section || "";
      if (id && id !== current) {
        current = id;
        emit("section", id);
      }
    };
    const onScroll = () => {
      if (!queued) {
        queued = true;
        raf = requestAnimationFrame(check);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    check();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
