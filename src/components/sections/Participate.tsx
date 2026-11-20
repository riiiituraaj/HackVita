"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useMotion } from "@/lib/motion";
import { event, isPending, participation } from "@/content/hackvita";
import { Reveal } from "@/components/fx/Reveal";
import { PixelBlocks } from "@/components/fx/PixelBlocks";
import { TbaChip } from "@/components/ui/Chip";

const ICONS = { circle: "◎", square: "☐", plus: "+" } as const;
const TOPS = [24, 88, 152];

export function Participate() {
  const listRef = useRef<HTMLOListElement>(null);
  const { reduced, booted } = useMotion();

  // Earlier cards scale to 0.96 and darken as the next card slides over.
  useEffect(() => {
    const list = listRef.current;
    if (!list || reduced || !booted) return;
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".pcard");
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        const shade = card.querySelector(".pcard__shade");
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: next,
            start: "top bottom",
            end: () => `top ${TOPS[i + 1] + 40}px`,
            scrub: true,
          },
        });
        tl.to(card.querySelector(".pcard__inner"), { scale: 0.96, ease: "none" }, 0).to(
          shade,
          { opacity: 0.55, ease: "none" },
          0,
        );
      });
    }, list);
    return () => ctx.revert();
  }, [reduced, booted]);

  return (
    <section id="participate" data-section="participate" className="section participate" aria-labelledby="participate-title">
      <div className="wrap">
        <div className="participate__head">
          <p className="eyebrow">participate.section</p>
          <div data-skew>
            <Reveal as="h2" id="participate-title" className="h2 h2--upper">
              {participation.heading}
            </Reveal>
          </div>
          <p className="body-l muted participate__intro" data-reveal>
            {participation.intro}
          </p>
        </div>

        <ol className="pcards" ref={listRef}>
          {participation.cards.map((card, i) => (
            <li key={card.id} className="pcard" style={{ "--top": `${TOPS[i]}px`, zIndex: i + 1 } as React.CSSProperties}>
              <article className="pcard__inner glass" aria-labelledby={`pcard-${card.id}`}>
                <span className="pcard__shade" aria-hidden="true" />
                <header className="pcard__head">
                  <span className="pcard__icon" aria-hidden="true">
                    {ICONS[card.icon]}
                  </span>
                  <h3 id={`pcard-${card.id}`} className="pcard__label font-pixel">
                    {card.label}
                  </h3>
                  <span className="pcard__idx mono-s" aria-hidden="true">
                    0{i + 1} / 03
                  </span>
                </header>
                <div className="pcard__body">
                  <div className="pcard__content">
                    <p className="pcard__statement">{card.statement}</p>
                    <ul className="pcard__rows">
                      {card.rows.map((row) => {
                        const pending = row.pendingKey ? isPending(event[row.pendingKey]) : false;
                        const value = row.pendingKey && !pending ? String(event[row.pendingKey]) : null;
                        return (
                          <li key={row.title} className="pcard__row">
                            <span className="pcard__row-title">{row.title}</span>
                            <span className="pcard__row-text muted">{value ?? row.text}</span>
                            {pending && <TbaChip label={row.chip ?? row.title} className="pcard__tba" />}
                          </li>
                        );
                      })}
                    </ul>
                    <ul className="pcard__features">
                      {card.features.map((f) => {
                        const key = participation.pendingFeatures[f];
                        const value = key ? event[key] : null;
                        const pending = key ? isPending(value) : false;
                        const isUrl = typeof value === "string" && /^https?:\/\//.test(value);
                        return (
                          <li key={f} className="pcard__feature">
                            <span className="pcard__feature-icon" aria-hidden="true">
                              ▪
                            </span>
                            {isUrl ? (
                              <a className="ulink" href={value} target="_blank" rel="noopener noreferrer">
                                {f} ↗
                              </a>
                            ) : (
                              <span>{key && !pending ? `${f}: ${String(value)}` : f}</span>
                            )}
                            {pending && <span className="pcard__feature-tba">TBA</span>}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <div className="pcard__visual">
                    <PixelBlocks seed={i * 3 + 1} />
                    <span className="pcard__visual-tag mono-s" aria-hidden="true">
                      feed://{card.id}
                    </span>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ol>
        <p className="participate__foot mono-s muted" data-reveal>
          {participation.footnote}
        </p>
      </div>
    </section>
  );
}
