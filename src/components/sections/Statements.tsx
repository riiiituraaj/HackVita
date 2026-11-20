"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { statements } from "@/content/hackvita";
import { ScrollTrigger } from "@/lib/gsap";
import { useMotion } from "@/lib/motion";
import { seeded } from "@/lib/hooks";

const FRAGMENTS = [
  "clock.start(24);",
  "team.size <= 4",
  "mode: hybrid",
  "// build.log",
  "idea → prototype → demo",
  "commit -m 'ship'",
  "while(awake){ build(); }",
  "legacy.push(chapter)",
];

const GLYPHS = "░▒▓▪▫◆◇+×·:";

/**
 * Pinned ~300vh stage showing one pixel statement at a time. Line 1 is solid;
 * the remaining lines fill from outline to solid, scrubbed by scroll. Glitch
 * cut + magenta light streak between statements.
 */
export function Statements() {
  const sectionRef = useRef<HTMLElement>(null);
  const fillRefs = useRef<(HTMLSpanElement | null)[][]>(statements.map(() => []));
  const [active, setActive] = useState(0);
  const [cut, setCut] = useState(0);
  const { reduced, booted } = useMotion();

  const glyphField = useMemo(() => {
    const r = seeded(11);
    return Array.from({ length: 2400 }, () => GLYPHS[Math.floor(r() * GLYPHS.length)]).join("");
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reduced || !booted) return;
    let current = 0;
    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "+=300%",
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        const n = statements.length;
        const p = self.progress * n;
        const idx = Math.min(n - 1, Math.floor(p));
        const local = Math.min(1, p - idx);
        if (idx !== current) {
          current = idx;
          setActive(idx);
          setCut((c) => c + 1);
        }
        statements.forEach((lines, si) => {
          const fills = lines.length - 1;
          const seg = 0.72 / Math.max(1, fills);
          for (let j = 1; j < lines.length; j++) {
            const el = fillRefs.current[si][j];
            if (!el) continue;
            let lp: number;
            if (si < idx) lp = 1;
            else if (si > idx) lp = 0;
            else lp = Math.max(0, Math.min(1, (local - 0.06 - (j - 1) * seg) / seg));
            el.style.clipPath = `inset(-20% ${(100 - lp * 100).toFixed(2)}% -20% 0)`;
          }
        });
      },
    });
    return () => st.kill();
  }, [reduced, booted]);

  const staticMode = reduced;

  return (
    <section
      id="statements"
      data-section="statements"
      ref={sectionRef}
      className={`statements ${staticMode ? "is-static" : ""}`}
      aria-label="HackVita, in four lines"
    >
      <ul className="sr-only">
        {statements.map((lines, i) => (
          <li key={i}>{lines.join(" ")}</li>
        ))}
      </ul>
      <div className="statements__stage" aria-hidden="true">
        <div className="statements__codes">
          {FRAGMENTS.map((f, i) => (
            <span key={i} className={`statements__code statements__code--${i}`} data-code={f} />
          ))}
        </div>
        <div className={`statements__frame ${active % 2 ? "is-magenta" : ""}`}>
          <span className="cross cross--tl" />
          <span className="cross cross--tr" />
          <span className="cross cross--bl" />
          <span className="cross cross--br" />
          <div className="statements__glyphs">
            <div className="statements__glyphs-inner" data-glyphs={glyphField} />
          </div>
          <span className="bloom statements__bloom" />
          {!staticMode && <span key={`streak-${cut}`} className={`statements__streak ${cut ? "is-on" : ""}`} />}
          <div className="statements__meta">
            <span>issue.log</span>
            <span>
              {String(active + 1).padStart(2, "0")} / {String(statements.length).padStart(2, "0")}
            </span>
          </div>
          <div className="statements__stack" data-skew>
            {statements.map((lines, si) => (
              <div
                key={si}
                className={`statement ${si === active ? "is-active" : ""} ${si === active && cut ? "is-cut" : ""}`}
                data-cut={si === active ? cut : undefined}
              >
                {lines.map((line, j) => (
                  <span className="statement__line" key={j}>
                    {j === 0 ? (
                      <span className="statement__solid">{line}</span>
                    ) : (
                      <>
                        <span className="statement__outline">{line}</span>
                        <span
                          className="statement__fill"
                          ref={(el) => {
                            fillRefs.current[si][j] = el;
                          }}
                        >
                          {line}
                        </span>
                      </>
                    )}
                  </span>
                ))}
              </div>
            ))}
          </div>
          <div className="statements__progress">
            {statements.map((_, i) => (
              <span key={i} className={i <= active ? "is-on" : ""} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
