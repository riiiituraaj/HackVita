"use client";

import { useEffect, useRef, useState } from "react";
import { useMotion } from "@/lib/motion";
import { scrambleText } from "./scramble";

type Props = {
  lines: string[];
  as?: "h2" | "h3";
  id?: string;
  className?: string;
  /** Small code chip that flashes over the heading on enter. */
  chip?: string;
  /** Also scramble the text on enter. */
  scramble?: boolean;
  lineClassNames?: string[];
};

/**
 * On enter: the heading splits into pink + magenta layers offset ±3px with
 * 3–4 random horizontal clip slices over ~350ms, then settles. A code chip
 * overlaps it for 800ms.
 */
export function GlitchHeading({
  lines,
  as: Tag = "h2",
  id,
  className = "",
  chip = "hackvita.validate()",
  scramble = false,
  lineClassNames,
}: Props) {
  const ref = useRef<HTMLHeadingElement>(null);
  const aRef = useRef<HTMLSpanElement>(null);
  const bRef = useRef<HTMLSpanElement>(null);
  const [chipOn, setChipOn] = useState(false);
  const { reduced } = useMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const timers: number[] = [];
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const a = aRef.current!;
        const b = bRef.current!;
        const slices = 3 + Math.round(Math.random());
        const step = 350 / slices;
        for (let i = 0; i < slices; i++) {
          timers.push(
            window.setTimeout(() => {
              const t1 = Math.random() * 80;
              const t2 = Math.min(100, t1 + 8 + Math.random() * 30);
              const t3 = Math.random() * 80;
              const t4 = Math.min(100, t3 + 6 + Math.random() * 30);
              a.style.opacity = "1";
              b.style.opacity = "1";
              a.style.clipPath = `inset(${t1}% 0 ${100 - t2}% 0)`;
              b.style.clipPath = `inset(${t3}% 0 ${100 - t4}% 0)`;
              a.style.transform = `translateX(${-3 - Math.random() * 6}px)`;
              b.style.transform = `translateX(${3 + Math.random() * 6}px)`;
            }, i * step),
          );
        }
        timers.push(
          window.setTimeout(() => {
            a.style.opacity = "0";
            b.style.opacity = "0";
          }, 360),
        );
        setChipOn(true);
        timers.push(window.setTimeout(() => setChipOn(false), 800));
        if (scramble) {
          el.querySelectorAll<HTMLElement>(".glitch__base .glitch__line").forEach((ln, i) => {
            timers.push(window.setTimeout(() => scrambleText(ln, lines[i], 650), i * 90));
          });
        }
      },
      { rootMargin: "0px 0px -18% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [reduced, scramble, lines]);

  const render = (withClass: boolean) =>
    lines.map((l, i) => (
      <span key={i} className={`glitch__line ${withClass && lineClassNames ? lineClassNames[i] ?? "" : ""}`}>
        {l}
      </span>
    ));

  return (
    <Tag ref={ref} id={id} className={`glitch ${className}`}>
      <span className="glitch__base">{render(true)}</span>
      <span ref={aRef} className="glitch__layer glitch__layer--a" aria-hidden="true">
        {render(false)}
      </span>
      <span ref={bRef} className="glitch__layer glitch__layer--b" aria-hidden="true">
        {render(false)}
      </span>
      {chipOn && (
        <span className="code-chip glitch__chip" aria-hidden="true">
          {chip}
        </span>
      )}
    </Tag>
  );
}
