"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useMotion } from "@/lib/motion";
import { event, legacy, media } from "@/content/hackvita";
import { Reveal } from "@/components/fx/Reveal";
import { PixelPortrait } from "@/components/fx/PixelPortrait";
import { Avatars, DotField, EditionBlocks, HourDial, Odometer } from "@/components/ui/StatCards";

type Cell = { ch?: string; label?: string; c: number; r: number; mc: number; mr: number; chrome?: boolean };

// Desktop grid: 4 cols | portrait | 4 cols × 3 rows. Mobile: 4 cols.
const CELLS: Cell[] = [
  ..."MEET".split("").map((ch, i) => ({ ch, c: i + 1, r: 1, mc: i + 1, mr: 1 })),
  { label: "edition: 5.0", c: 6, r: 1, mc: 0, mr: 0 },
  { c: 7, r: 1, mc: 0, mr: 0 },
  { label: "24h", c: 8, r: 1, mc: 0, mr: 0 },
  { c: 9, r: 1, mc: 0, mr: 0 },
  ..."HACK".split("").map((ch, i) => ({ ch, c: i + 1, r: 2, mc: i + 1, mr: 2 })),
  ..."VITA".split("").map((ch, i) => ({ ch, c: i + 6, r: 2, mc: i + 1, mr: 3 })),
  { label: "technovus", c: 1, r: 3, mc: 0, mr: 0 },
  { c: 2, r: 3, mc: 0, mr: 0 },
  { label: "early_2027", c: 3, r: 3, mc: 1, mr: 4 },
  { c: 4, r: 3, mc: 0, mr: 0 },
  { c: 6, r: 3, mc: 0, mr: 0 },
  ...["5", ".", "0"].map((ch, i) => ({ ch, c: i + 7, r: 3, mc: i + 2, mr: 4, chrome: true })),
];

type RGB = [number, number, number];
/** Dark → deep pink → light, so the crossfade never passes through grey. */
const BG_STOPS: [number, RGB][] = [
  [0, [5, 0, 6]],
  [0.5, [122, 3, 66]],
  [1, [255, 240, 248]],
];
/** Text flips from pink-100 to ink once the background is light enough. */
const FG_STOPS: [number, RGB][] = [
  [0, [255, 214, 236]],
  [0.56, [255, 214, 236]],
  [0.68, [5, 0, 6]],
  [1, [5, 0, 6]],
];
function mixStops(stops: [number, RGB][], t: number): RGB {
  for (let i = 1; i < stops.length; i++) {
    const [b, cb] = stops[i];
    if (t <= b) {
      const [a, ca] = stops[i - 1];
      const k = b === a ? 1 : (t - a) / (b - a);
      return [0, 1, 2].map((j) => ca[j] + (cb[j] - ca[j]) * k) as RGB;
    }
  }
  return stops[stops.length - 1][1];
}
const rgb = (c: RGB) => `rgb(${c.map((v) => Math.round(v)).join(" ")})`;

export function Legacy() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const { reduced, booted } = useMotion();

  // Scroll-scrubbed shift to the light background (and back to dark on exit).
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !booted) return;
    if (reduced) return; // CSS default is the fully light state
    const apply = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const enter = gsap.utils.clamp(0, 1, (vh * 0.85 - r.top) / (vh * 0.45));
      const exit = gsap.utils.clamp(0, 1, (vh * 0.7 - r.bottom) / (vh * 0.4));
      const mix = enter * (1 - exit);
      el.style.setProperty("--mix", mix.toFixed(3));
      el.style.setProperty("--legacy-bg", rgb(mixStops(BG_STOPS, mix)));
      el.style.setProperty("--legacy-fg", rgb(mixStops(FG_STOPS, mix)));
    };
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top bottom",
      end: "bottom top",
      onUpdate: apply,
      onRefresh: apply,
    });
    apply();
    return () => {
      st.kill();
      ["--mix", "--legacy-bg", "--legacy-fg"].forEach((p) => el.style.removeProperty(p));
    };
  }, [reduced, booted]);

  // Letters flip in per cell, then drift horizontally at different speeds.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || reduced || !booted) return;
    const ctx = gsap.context(() => {
      const letters = gsap.utils.toArray<HTMLElement>(".lg-letter");
      const hidden = letters.filter((l) => l.getBoundingClientRect().bottom > 0);
      gsap.set(hidden, { rotateX: 90, opacity: 0, transformOrigin: "50% 100%" });
      ScrollTrigger.batch(hidden, {
        start: "top 92%",
        once: true,
        onEnter: (els) =>
          gsap.to(els, { rotateX: 0, opacity: 1, duration: 0.9, ease: "expo.out", stagger: 0.04 }),
      });
      letters.forEach((l) => {
        const speed = Number(l.dataset.speed);
        gsap.fromTo(
          l.parentElement,
          { x: -speed },
          {
            x: speed,
            ease: "none",
            scrollTrigger: { trigger: grid, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
    }, grid);
    return () => ctx.revert();
  }, [reduced, booted]);

  const s = legacy.stats;

  return (
    <section
      id="legacy"
      data-section="legacy"
      ref={sectionRef}
      className="section legacy on-light"
      aria-labelledby="legacy-title"
    >
      <div className="wrap">
        <p className="eyebrow legacy__eyebrow">legacy.section</p>
        <h2 className="sr-only">Meet HackVita 5.0</h2>
        <div className="lg-grid" ref={gridRef}>
          {CELLS.map((cell, i) => {
            const speed = cell.ch ? ((i * 37) % 7) * 6 - 18 : 0;
            return (
              <div
                key={i}
                className={`lg-cell ${cell.ch ? "has-letter" : "is-empty"} ${cell.mc ? "" : "lg-desk"}`}
                style={
                  {
                    "--c": cell.c,
                    "--r": cell.r,
                    "--mc": cell.mc || "auto",
                    "--mr": cell.mr || "auto",
                  } as React.CSSProperties
                }
                aria-hidden="true"
              >
                {cell.ch ? (
                  <span className="lg-drift">
                    <span className={`lg-letter ${cell.chrome ? "chrome-text lg-letter--chrome" : ""}`} data-speed={speed}>
                      {cell.ch}
                    </span>
                  </span>
                ) : cell.label ? (
                  <span className="lg-label">{cell.label}</span>
                ) : (
                  <span className="lg-plus">+</span>
                )}
              </div>
            );
          })}
          <figure className="portrait">
            <PixelPortrait src={media.builder} alt={media.builderAlt} />
            <span className="portrait__chip glass">
              {legacy.portraitStatus}
              <span className="blink-cursor" />
            </span>
            <span className="portrait__corner mono-s" aria-hidden="true">
              IMG_5.0 · {event.timing.toUpperCase()}
            </span>
          </figure>
        </div>

        <div className="legacy__intro">
          <div data-skew>
            <Reveal as="h2" id="legacy-title" className="h2 h2--upper legacy__title">
              {legacy.heading}
            </Reveal>
          </div>
          <div className="legacy__promo">
            <p className="legacy__promo-title" data-reveal>
              {legacy.promoTitle}
            </p>
            <p className="body-l" data-reveal>
              {legacy.promo}
            </p>
            <p className="mono-s qualifier legacy__qualifier" data-reveal>
              * {legacy.qualifier}
            </p>
          </div>
        </div>

        <div className="bento" data-reveal-stagger>
          <article className="stat stat--pink stat--wide gloss" data-tilt="3">
            <span className="specular" />
            <header className="stat__head">
              <span className="stat__tag">legacy.teams</span>
              <span className="stat__qual">{legacy.qualifier}</span>
            </header>
            <div className="stat__body">
              <div className="stat__num stat__num--xl">
                <Odometer value={s.teams.value} suffix={s.teams.suffix} />
              </div>
              <p className="stat__label">{s.teams.label}</p>
            </div>
          </article>

          <article className="stat stat--ink gloss" data-tilt="3">
            <span className="specular" />
            <header className="stat__head">
              <span className="stat__tag">legacy.states</span>
              <span className="stat__qual">{legacy.qualifier}</span>
            </header>
            <div className="stat__split">
              <div>
                <p className="stat__num font-dot">
                  <span data-count={s.states.value} data-suffix={s.states.suffix} data-count-dur="1.4">
                    {s.states.value}
                    {s.states.suffix}
                  </span>
                </p>
                <p className="stat__label">{s.states.label}</p>
              </div>
              <DotField lit={s.states.value} total={40} />
            </div>
          </article>

          <article className="stat stat--ink gloss" data-tilt="3">
            <span className="specular" />
            <header className="stat__head">
              <span className="stat__tag">legacy.editions</span>
              <span className="stat__qual">{legacy.qualifier}</span>
            </header>
            <div className="stat__split">
              <div>
                <p className="stat__num font-dot">
                  <span data-count={s.editions.value}>{s.editions.value}</span>
                </p>
                <p className="stat__label">
                  {s.editions.label} · since {s.editions.since}
                </p>
              </div>
              <EditionBlocks />
            </div>
          </article>

          <article className="stat stat--ink gloss" data-tilt="3">
            <span className="specular" />
            <header className="stat__head">
              <span className="stat__tag">hackvita.v5.clock</span>
              <span className="stat__qual">HackVita 5.0 format</span>
            </header>
            <div className="stat__split">
              <div>
                <p className="stat__num font-dot">
                  <span data-count={s.hours.value}>{s.hours.value}</span>
                </p>
                <p className="stat__label">{s.hours.label}</p>
              </div>
              <HourDial />
            </div>
          </article>

          <article className="stat stat--pink gloss" data-tilt="3">
            <span className="specular" />
            <header className="stat__head">
              <span className="stat__tag">hackvita.v5.team</span>
              <span className="stat__qual">HackVita 5.0 format</span>
            </header>
            <div className="stat__split">
              <div>
                <p className="stat__num font-dot">
                  <span data-count={s.team.min}>{s.team.min}</span>–<span data-count={s.team.max}>{s.team.max}</span>
                </p>
                <p className="stat__label">{s.team.label}</p>
              </div>
              <Avatars />
            </div>
          </article>
        </div>
        <p className="legacy__footnote mono-s">* {legacy.footnote}</p>
      </div>
    </section>
  );
}
