"use client";

import { useEffect, useRef } from "react";
import { useMotion } from "@/lib/motion";
import { pad } from "@/lib/hooks";

const WORDS = ["BUILD", "SHIP", "DEMO", "24H"];
const TAGS = [
  "IDEA DETECTED!",
  "PROTOTYPE READY",
  "TEAM OF 4",
  "SOLO BUILDER",
  "REMOTE NODE",
  "24:00:00",
  "COMMIT PUSHED",
  "DEMO VALIDATED!",
];
const INTERACTIVE = "a, button, [role='tab'], [role='link'], summary, label, input, [data-cursor='link']";

/**
 * Desktop-only cursor layer: global pink dot (+ ghost trail outside the hero),
 * the hero scanner reticle, and tag pops. The hero's mosaic trail lives in
 * HeroShader; this is the DOM half.
 */
export function CursorSystem() {
  const { reduced, finePointer, booted } = useMotion();
  const active = finePointer && !reduced && booted;
  const dotRef = useRef<HTMLDivElement>(null);
  const ghostRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reticleRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const coordsRef = useRef<HTMLSpanElement>(null);
  const tagsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;
    const root = document.documentElement;
    root.classList.add("has-cursor");
    const hero = document.getElementById("index");
    const dot = dotRef.current!;
    const reticle = reticleRef.current!;
    const coords = coordsRef.current!;
    const tagLayer = tagsRef.current!;
    const ghosts = ghostRefs.current.filter(Boolean) as HTMLDivElement[];

    let mx = -100;
    let my = -100;
    let dx = mx;
    let dy = my;
    let rx = mx;
    let ry = my;
    let seen = false;
    let inHero = false;
    let overLink = false;
    let lastSpawn = 0;
    let lastMove = 0;
    let liveTags = 0;
    let lastCoords = "";
    const hist: { x: number; y: number }[] = [];
    let raf = 0;

    // The hero's measured right edge excludes the console panel. (Reading
    // --console-w doesn't work: at ≥1280px it is "max(280px, 22vw)", not a number.)
    let heroRight = window.innerWidth;
    const heroHit = () => {
      if (!hero) return false;
      const r = hero.getBoundingClientRect();
      heroRight = r.right;
      return my >= r.top && my <= r.bottom && mx >= r.left && mx <= r.right;
    };

    const spawnTag = (now: number) => {
      if (now - lastSpawn < 140 || liveTags >= 8) return;
      lastSpawn = now;
      liveTags++;
      const el = document.createElement("span");
      el.className = "tagpop";
      el.textContent = TAGS[(Math.random() * TAGS.length) | 0];
      const ang = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 110;
      const x = Math.min(heroRight - 160, Math.max(8, mx + Math.cos(ang) * dist * 1.3));
      const y = Math.max(30, my + Math.sin(ang) * dist * 0.8);
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.addEventListener("animationend", () => {
        el.remove();
        liveTags--;
      });
      tagLayer.appendChild(el);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      mx = e.clientX;
      my = e.clientY;
      lastMove = performance.now();
      if (!seen) {
        seen = true;
        dx = rx = mx;
        dy = ry = my;
      }
    };
    const onOver = (e: PointerEvent) => {
      overLink = !!(e.target as Element | null)?.closest?.(INTERACTIVE);
    };
    const onLeave = () => {
      seen = false;
      mx = my = -100;
    };

    let word = 0;
    const wordTimer = window.setInterval(() => {
      word = (word + 1) % WORDS.length;
      if (labelRef.current) labelRef.current.textContent = WORDS[word];
    }, 1200);

    const loop = (now: number) => {
      dx += (mx - dx) * 0.35;
      dy += (my - dy) * 0.35;
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      inHero = seen && heroHit();

      dot.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      dot.style.opacity = seen ? "1" : "0";

      hist.unshift({ x: dx, y: dy });
      if (hist.length > 16) hist.pop();
      const trail = seen && !inHero;
      ghosts.forEach((g, i) => {
        const p = hist[Math.min(hist.length - 1, (i + 1) * 4)];
        g.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
        g.style.opacity = trail ? String([0.6, 0.35, 0.15][i]) : "0";
      });

      const state = overLink && seen ? "link" : inHero ? "hero" : "off";
      if (reticle.dataset.state !== state) reticle.dataset.state = state;
      const tx = state === "link" ? dx : rx;
      const ty = state === "link" ? dy : ry;
      reticle.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;

      if (inHero) {
        const c = `X:${pad(mx, 4)} Y:${pad(my, 4)}`;
        if (c !== lastCoords) {
          coords.textContent = c;
          lastCoords = c;
        }
        if (now - lastMove < 80 && !overLink) spawnTag(now);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(wordTimer);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      root.classList.remove("has-cursor");
      tagLayer.innerHTML = "";
    };
  }, [active]);

  if (!active) return null;

  return (
    <div className="cursor-layer" aria-hidden="true">
      <div className="tagpops" ref={tagsRef} />
      <div className="reticle" ref={reticleRef} data-state="off">
        <div className="reticle__box">
          <span className="reticle__coords" ref={coordsRef}>
            X:0000 Y:0000
          </span>
          <span className="reticle__label" ref={labelRef}>
            {WORDS[0]}
          </span>
        </div>
      </div>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="cursor-ghost"
          ref={(el) => {
            ghostRefs.current[i] = el;
          }}
        />
      ))}
      <div className="cursor-dot" ref={dotRef} />
    </div>
  );
}
