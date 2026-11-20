"use client";

import { createElement, useEffect, useRef } from "react";
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";
import { useMotion } from "@/lib/motion";

type Props = {
  as?: "h1" | "h2" | "h3" | "p" | "div";
  id?: string;
  className?: string;
  children: React.ReactNode;
  /** Wait for the preloader instead of scroll position (hero). */
  onBoot?: boolean;
  delay?: number;
};

/**
 * Line-mask reveal: lines rise from yPercent 110 → 0, staggered 0.08,
 * expo-out, 0.9s. The split is reverted afterwards so text reflows naturally.
 */
export function Reveal({ as = "h2", id, className, children, onBoot = false, delay = 0 }: Props) {
  const ref = useRef<HTMLElement>(null);
  const { reduced, booted } = useMotion();
  const split = useRef<SplitText | null>(null);

  // Split as soon as fonts are ready and hide lines (only when motion is on).
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    let killed = false;
    let st: ScrollTrigger | undefined;
    let tween: gsap.core.Tween | undefined;

    const run = () => {
      if (killed) return;
      // Already scrolled past (deep link / motion re-enabled mid-page): leave as is.
      if (!onBoot && el.getBoundingClientRect().bottom <= 0) return;
      split.current = new SplitText(el, { type: "lines", mask: "lines", linesClass: "split-line" });
      const lines = split.current.lines;
      gsap.set(lines, { yPercent: 110 });
      const play = () => {
        tween = gsap.to(lines, {
          yPercent: 0,
          duration: 0.9,
          stagger: 0.08,
          delay,
          ease: "expo.out",
          onComplete: () => {
            split.current?.revert();
            split.current = null;
          },
        });
      };
      if (onBoot) {
        el.dataset.revealReady = "1";
      } else {
        st = ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter: play });
      }
      (el as HTMLElement & { __play?: () => void }).__play = play;
    };

    document.fonts?.ready.then(run) ?? run();

    return () => {
      killed = true;
      st?.kill();
      tween?.kill();
      split.current?.revert();
      split.current = null;
    };
  }, [reduced, onBoot, delay]);

  // Hero: play after the preloader exits.
  useEffect(() => {
    if (!onBoot || !booted || reduced) return;
    const el = ref.current as (HTMLElement & { __play?: () => void }) | null;
    const tryPlay = () => {
      if (el?.__play) el.__play();
      else window.setTimeout(tryPlay, 50);
    };
    tryPlay();
  }, [onBoot, booted, reduced]);

  return createElement(as, { ref, id, className }, children);
}
