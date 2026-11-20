"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMotion } from "@/lib/motion";
import { bitmap, seeded } from "@/lib/hooks";
import { PixelMark } from "./PixelMark";

type Line =
  | { kind: "load"; cmd: string; comment: string }
  | { kind: "bar" }
  | { kind: "text"; text: string }
  | { kind: "chip"; text: string };

const LINES: Line[] = [
  { kind: "load", cmd: "LOAD  hackvita", comment: "// v5.0" },
  { kind: "load", cmd: "LOAD  technovus", comment: "// jorhat_engineering_college" },
  { kind: "load", cmd: "LOAD  clock", comment: "// 24h" },
  { kind: "load", cmd: "LOAD  teams", comment: "// size: 1..4" },
  { kind: "bar" },
  { kind: "text", text: "---" },
  { kind: "text", text: "Boot Complete" },
  { kind: "text", text: "Exit Code: 0" },
  { kind: "chip", text: "[ WELCOME TO HACKVITA 5.0 ]" },
];

const PAD = 19;
const lineText = (l: Line) =>
  l.kind === "load" ? l.cmd.padEnd(PAD) + l.comment : l.kind === "bar" ? "" : l.text;

/** ASCII rendition of the mark, revealed block by block. */
const ASCII = bitmap("HV").map((r) => r.map((v) => (v ? "█" : " ")).join(""));

type Phase = "typing" | "exit" | "done";

export function Preloader() {
  const { setBooted, reduced } = useMotion();
  const [t, setT] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");
  const raf = useRef(0);
  const quick = useRef(false);

  // Timing: each line starts `stagger` after the previous and types at `cps`.
  const cps = 40;
  const stagger = 0.15;
  const starts = useMemo(() => LINES.map((_, i) => i * stagger), []);
  const total = useMemo(
    () => Math.max(...LINES.map((l, i) => starts[i] + (l.kind === "bar" ? 0.55 : lineText(l).length / cps))),
    [starts],
  );

  const asciiOrder = useMemo(() => {
    const r = seeded(7);
    const cells: number[] = [];
    ASCII.forEach((row, y) => [...row].forEach((ch, x) => ch !== " " && cells.push(y * 100 + x)));
    return cells
      .map((c) => ({ c, k: r() }))
      .sort((a, b) => a.k - b.k)
      .map((o) => o.c);
  }, []);

  // Drive the clock.
  useEffect(() => {
    try {
      quick.current = sessionStorage.getItem("hv-booted") === "1";
    } catch {
      quick.current = false;
    }
    const speed = reduced ? 1000 : quick.current ? 2.6 : 1;
    const t0 = performance.now();
    const loop = (now: number) => {
      const s = ((now - t0) / 1000) * speed;
      setT(s);
      if (s < total + 0.35) raf.current = requestAnimationFrame(loop);
      else setPhase((p) => (p === "typing" ? "exit" : p));
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [total, reduced]);

  // Skip on click / key.
  useEffect(() => {
    if (phase !== "typing") return;
    const skip = () => {
      cancelAnimationFrame(raf.current);
      setT(total + 1);
      setPhase("exit");
    };
    window.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);
    return () => {
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
    };
  }, [phase, total]);

  // Exit transition → booted.
  useEffect(() => {
    if (phase !== "exit") return;
    try {
      sessionStorage.setItem("hv-booted", "1");
    } catch {
      /* ignore */
    }
    const dur = reduced ? 300 : 460;
    const id = window.setTimeout(() => {
      setPhase("done");
      setBooted(true);
    }, dur);
    // Let the hero start revealing slightly before the panel is fully gone.
    const early = window.setTimeout(() => setBooted(true), dur - 120);
    return () => {
      clearTimeout(id);
      clearTimeout(early);
    };
  }, [phase, reduced, setBooted]);

  if (phase === "done") return null;

  const typed = (l: Line, i: number) => {
    const local = t - starts[i];
    if (local <= 0) return null;
    if (l.kind === "bar") {
      const p = Math.min(1, local / 0.5);
      const n = Math.round(p * 20);
      return (
        <span>
          <span className="pl-bar">[{"█".repeat(n)}{"░".repeat(20 - n)}]</span>
          {"  "}
          {String(Math.round(p * 100)).padStart(3, " ")}%
        </span>
      );
    }
    const full = lineText(l);
    const shown = full.slice(0, Math.floor(local * cps));
    if (l.kind === "load") {
      const cmd = shown.slice(0, PAD);
      const com = shown.slice(PAD);
      return (
        <>
          <span>{cmd}</span>
          <span className="pl-com">{com}</span>
        </>
      );
    }
    if (l.kind === "chip") {
      return shown.length ? <span className="pl-chip">{shown}</span> : null;
    }
    return <span>{shown}</span>;
  };

  const asciiShown = Math.floor(
    Math.max(0, Math.min(1, (t - 0.2) / Math.max(0.5, total - 0.4))) * asciiOrder.length,
  );
  const shownSet = new Set(asciiOrder.slice(0, asciiShown));

  const content = (
    <div className="pl-inner" aria-hidden="true">
      <div className="pl-tab">
        <span className="pl-tab__dot" />
        console.log
      </div>
      <pre className="pl-lines">
        {LINES.map((l, i) => (
          <div key={i} className="pl-line">
            {typed(l, i)}
            {phase === "typing" && t > starts[i] && (i === LINES.length - 1 || t < starts[i + 1]) && (
              <span className="blink-cursor" />
            )}
          </div>
        ))}
      </pre>
      <pre className="pl-ascii">
        {ASCII.map((row, y) => (
          <div key={y}>
            {[...row].map((ch, x) => (ch !== " " && shownSet.has(y * 100 + x) ? "█" : " ")).join("")}
          </div>
        ))}
      </pre>
      <div className="pl-logo">
        <PixelMark word="HV" assemble spread={reduced ? 0 : 1.6} delay={0.1} />
      </div>
      <div className="pl-foot">
        <span>HACKVITA · TECHNOVUS · JEC</span>
        <span>{phase === "typing" ? "CLICK TO SKIP" : "EXIT 0"}</span>
      </div>
    </div>
  );

  const slices = 7;
  const rand = seeded(42);
  return (
    <div
      className={`preloader ${phase === "exit" ? "is-exit" : ""} ${reduced ? "is-reduced" : ""}`}
    >
      {phase === "exit" && !reduced ? (
        <>
          {Array.from({ length: slices }, (_, i) => (
            <div
              key={i}
              className="pl-slice"
              style={
                {
                  clipPath: `inset(${(i / slices) * 100}% 0 ${100 - ((i + 1) / slices) * 100}% 0)`,
                  "--dx": `${(rand() * 2 - 1) * 20}px`,
                  "--dx2": `${(rand() * 2 - 1) * 20}px`,
                } as React.CSSProperties
              }
            >
              {content}
            </div>
          ))}
          <div className="pl-bars" aria-hidden="true">
            {Array.from({ length: 8 + Math.floor(rand() * 7) }, (_, i) => (
              <span
                key={i}
                style={{
                  top: `${rand() * 100}%`,
                  left: `${rand() * 85}%`,
                  height: `${2 + Math.floor(rand() * 5)}px`,
                  width: `${60 + Math.floor(rand() * 240)}px`,
                  animationDelay: `${Math.floor(rand() * 4) * 60}ms`,
                }}
              />
            ))}
          </div>
          <div className="pl-scan" />
        </>
      ) : (
        content
      )}
      <span className="sr-only" role="status">
        Loading HackVita 5.0
      </span>
    </div>
  );
}
