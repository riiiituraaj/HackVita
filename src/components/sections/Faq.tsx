"use client";

import { useEffect, useState } from "react";
import { faqs } from "@/content/hackvita";
import { useMotion } from "@/lib/motion";
import { Reveal } from "@/components/fx/Reveal";

/** "What is HackVita 5.0?" → "what_is_hackvita_5.0 ?" */
const slug = (q: string) =>
  q
    .replace(/\?$/, "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/\s+/g, "_") + " ?";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" data-section="faq" className="section faq" aria-labelledby="faq-title">
      <div className="wrap faq__wrap">
        <div className="faq__side">
          <p className="eyebrow">faq.section</p>
          <div data-skew>
            <Reveal as="h2" id="faq-title" className="h2 h2--upper">
              Frequently asked questions
            </Reveal>
          </div>
          <p className="mono-s muted faq__count" aria-hidden="true">
            faq.length = {faqs.length}
          </p>
        </div>
        <div className="faq__list">
          {faqs.map((f, i) => (
            <FaqRow key={f.q} i={i} q={f.q} a={f.a} open={open === i} onToggle={() => setOpen(open === i ? null : i)} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqRow({ i, q, a, open, onToggle }: { i: number; q: string; a: string; open: boolean; onToggle: () => void }) {
  const { reduced } = useMotion();
  const [typed, setTyped] = useState(open ? a.length : 0);

  useEffect(() => {
    if (!open) {
      setTyped(0);
      return;
    }
    if (reduced) {
      setTyped(a.length);
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const n = Math.floor(((now - t0) / 1000) * 120);
      setTyped(Math.min(a.length, n));
      if (n < a.length) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open, reduced, a]);

  return (
    <div className={`faq__row ${open ? "is-open" : ""}`}>
      <span className="cross cross--tl" aria-hidden="true" />
      <span className="cross cross--tr" aria-hidden="true" />
      <h3 className="faq__q">
        <button
          type="button"
          id={`faq-q-${i}`}
          aria-expanded={open}
          aria-controls={`faq-a-${i}`}
          onClick={onToggle}
          className="faq__btn"
        >
          <span className="faq__prompt" aria-hidden="true">
            &gt;
          </span>
          <span className="faq__slug" aria-hidden="true">
            {slug(q)}
          </span>
          <span className="sr-only">{q}</span>
          <span className="faq__plus" aria-hidden="true">
            +
          </span>
        </button>
      </h3>
      <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} className="faq__a">
        <div className="faq__a-inner">
          <p className="faq__human muted">{q}</p>
          <p className="faq__answer">
            <span className="sr-only">{a}</span>
            <span aria-hidden="true">
              {a.slice(0, typed)}
              {typed < a.length && <span className="blink-cursor" />}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
