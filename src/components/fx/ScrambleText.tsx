"use client";

import { useEffect, useRef } from "react";
import { useMotion } from "@/lib/motion";
import { scrambleText } from "./scramble";

type Props = {
  text: string;
  trigger?: "enter" | "hover" | "loop";
  className?: string;
  duration?: number;
  /** For "loop": ms between runs. */
  every?: number;
};

/**
 * Text that resolves out of glyph noise. The visible copy is aria-hidden and a
 * screen-reader copy stays stable, so assistive tech never reads the noise.
 */
export function ScrambleText({ text, trigger = "enter", className = "", duration = 600, every = 3200 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const { reduced } = useMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    let cancel: (() => void) | undefined;

    if (trigger === "hover") {
      const host = el.parentElement ?? el;
      const onEnter = () => {
        cancel = scrambleText(el, text, duration);
      };
      host.addEventListener("pointerenter", onEnter);
      return () => {
        host.removeEventListener("pointerenter", onEnter);
        cancel?.();
      };
    }

    let timer: number | undefined;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) {
          if (trigger === "loop") window.clearInterval(timer);
          return;
        }
        cancel = scrambleText(el, text, duration);
        if (trigger === "enter") io.disconnect();
        else {
          window.clearInterval(timer);
          timer = window.setInterval(() => {
            cancel = scrambleText(el, text, duration);
          }, every);
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearInterval(timer);
      cancel?.();
    };
  }, [text, trigger, duration, every, reduced]);

  return (
    <span className={className}>
      <span ref={ref} aria-hidden="true">
        {text}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
