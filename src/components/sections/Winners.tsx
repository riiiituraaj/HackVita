"use client";

import { useEffect, useRef, useState } from "react";
import { editions, winners, type Edition, type WinnerRecord } from "@/content/hackvita";
import { useMotion } from "@/lib/motion";
import { Reveal } from "@/components/fx/Reveal";
import { pixelDissolveIn } from "@/components/fx/PixelDissolve";

const ordered = winners.order
  .map((id) => editions.find((e) => e.id === id))
  .filter((e): e is Edition => Boolean(e));

export function Winners() {
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const { reduced } = useMotion();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const el = panelRef.current;
    if (!el || reduced) {
      setPrev(null);
      return;
    }
    return pixelDissolveIn(el, 450, () => setPrev(null));
  }, [active, reduced]);

  const select = (i: number) => {
    if (i === active) return;
    setPrev(active);
    setActive(i);
  };

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const n = ordered.length;
    let next = -1;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (i + 1) % n;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = (i - 1 + n) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    if (next < 0) return;
    e.preventDefault();
    select(next);
    tabRefs.current[next]?.focus();
  };

  const hasAnyRecords = ordered.some((e) => e.winners.length > 0);

  return (
    <section id="winners" data-section="winners" className="section winners" aria-labelledby="winners-title">
      <div className="wrap">
        <p className="eyebrow">winners.section</p>
        <div data-skew>
          <Reveal as="h2" id="winners-title" className="h2 winners__title">
            {winners.heading}
          </Reveal>
        </div>
        {hasAnyRecords && (
          <p className="body-l muted winners__intro" data-reveal>
            {winners.introWhenAvailable}
          </p>
        )}

        <div className="winners__layout">
          <div className="winners__tabs" role="tablist" aria-orientation="vertical" aria-label="Edition">
            {ordered.map((ed, i) => (
              <button
                key={ed.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`wtab-${ed.id}`}
                aria-selected={i === active}
                aria-controls="winners-panel"
                tabIndex={i === active ? 0 : -1}
                className={`wtab ${i === active ? "is-active glass" : ""}`}
                onClick={() => select(i)}
                onKeyDown={(e) => onKey(e, i)}
              >
                <span className="wtab__bar" aria-hidden="true" />
                <span className="wtab__name">
                  {i === 0 ? `HACKVITA ${ed.version}` : ed.version}
                  <span className="wtab__year"> · {ed.year}</span>
                </span>
                <span className="wtab__state mono-s">{ed.winners.length ? `${ed.winners.length} record(s)` : "compiling"}</span>
              </button>
            ))}
          </div>

          <div className="winners__stage">
            {prev !== null && (
              <div className="winners__panel winners__panel--prev" aria-hidden="true">
                <PanelContent edition={ordered[prev]} />
              </div>
            )}
            <div
              ref={panelRef}
              className="winners__panel glass"
              role="tabpanel"
              id="winners-panel"
              aria-labelledby={`wtab-${ordered[active].id}`}
              tabIndex={0}
            >
              <PanelContent edition={ordered[active]} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PanelContent({ edition }: { edition: Edition }) {
  return edition.winners.length ? <Records edition={edition} /> : <Dossier edition={edition} />;
}

/* -------- Redacted dossier: shown until records are supplied -------- */

function Dossier({ edition }: { edition: Edition }) {
  return (
    <div className="dossier">
      <header className="dossier__head mono-s">
        <span>FILE: winners_{edition.id.replace("-", "_")}.json</span>
        <span>
          HACKVITA {edition.version} · {edition.year}
        </span>
        <span className="chip chip--tba">
          <span>STATUS: AWAITING_RECORDS</span>
        </span>
      </header>
      <div className="dossier__grid" aria-hidden="true">
        <div className="dossier__photo">
          <span className="dossier__photo-label mono-s">IMG: REDACTED</span>
        </div>
        <div className="dossier__fields">
          {[
            ["AWARD", [38]],
            ["TEAM NAME", [62]],
            ["PROJECT", [80, 54]],
            ["MEMBERS", [30, 36, 26, 32]],
            ["INSTITUTION", [70]],
          ].map(([label, bars]) => (
            <div key={label as string} className="dossier__field">
              <span className="dossier__label mono-s">{label as string}</span>
              <span className="dossier__bars">
                {(bars as number[]).map((w, i) => (
                  <span key={i} className="redact" style={{ width: `${w}%` }} />
                ))}
              </span>
            </div>
          ))}
        </div>
        <div className="dossier__stats">
          {["RANK", "TEAM", "LINKS"].map((s) => (
            <span key={s} className="chip dossier__chip">
              {s}: <span className="redact redact--inline" />
            </span>
          ))}
        </div>
      </div>
      <div className="dossier__status">
        <p className="dossier__code mono-s">
          ARCHIVE.STATUS = <span className="dossier__str">&quot;COMPILING&quot;</span>
          <span className="blink-cursor" />
        </p>
        <p className="dossier__msg">{winners.status}</p>
      </div>
    </div>
  );
}

/* -------- Record view: renders automatically once data is added -------- */

function Records({ edition }: { edition: Edition }) {
  return (
    <div className="records">
      <header className="dossier__head mono-s">
        <span>
          HACKVITA {edition.version} · {edition.year}
        </span>
        <span className="chip chip--solid">
          <span>{edition.winners.length} RECORD(S)</span>
        </span>
      </header>
      {edition.winners.map((w, i) => (
        <Record key={i} w={w} />
      ))}
    </div>
  );
}

function Record({ w }: { w: WinnerRecord }) {
  const photo = w.photos[0];
  return (
    <article className="record">
      <div className="record__media">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" />
        ) : (
          <div className="dossier__photo" aria-hidden="true" />
        )}
      </div>
      <div className="record__body">
        <p className="eyebrow">{w.award}</p>
        <h3 className="record__team">{w.teamName}</h3>
        <p className="record__project">{w.projectName}</p>
        <p className="muted">{w.projectSummary}</p>
        {w.members.length > 0 && <p className="mono-s record__members">{w.members.join(" · ")}</p>}
        {w.links.length > 0 && (
          <ul className="record__links">
            {w.links.map((l) => (
              <li key={l.href}>
                <a className="ulink" href={l.href} target="_blank" rel="noopener noreferrer">
                  {l.label} ↗
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
      <ul className="record__stats">
        <li className="chip chip--solid">{w.award}</li>
        {w.institutions.map((inst) => (
          <li key={inst} className="chip">
            {inst}
          </li>
        ))}
        {w.members.length > 0 && <li className="chip">{w.members.length} members</li>}
      </ul>
    </article>
  );
}
