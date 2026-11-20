"use client";

import { useEffect, useRef } from "react";
import { useMotion } from "@/lib/motion";

const SNIPPETS = [
  "def build(self): ...",
  "team.ship()",
  "class HackVita: ...",
  "idea.prototype()",
  "while clock < 24:",
  "git push origin demo",
  "return next_chapter",
  "import technovus",
];

/** Short code snippets type themselves near the cursor and fade after ~3s (max 6). */
export function CodeSpawner({ targetId }: { targetId: string }) {
  const layerRef = useRef<HTMLDivElement>(null);
  const { reduced, finePointer } = useMotion();

  useEffect(() => {
    const layer = layerRef.current;
    const host = document.getElementById(targetId);
    if (!layer || !host || reduced || !finePointer) return;
    let live = 0;
    let last = 0;
    let idx = 0;
    const timers = new Set<number>();

    const spawn = (x: number, y: number) => {
      if (live >= 6) return;
      live++;
      const el = document.createElement("span");
      el.className = "codespawn";
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      layer.appendChild(el);
      const text = SNIPPETS[idx++ % SNIPPETS.length];
      let i = 0;
      const type = window.setInterval(() => {
        i++;
        el.textContent = text.slice(0, i);
        if (i >= text.length) {
          window.clearInterval(type);
          timers.delete(type);
        }
      }, 38);
      timers.add(type);
      const fade = window.setTimeout(() => {
        el.classList.add("is-out");
        const rm = window.setTimeout(() => {
          el.remove();
          live--;
          timers.delete(rm);
        }, 600);
        timers.add(rm);
        timers.delete(fade);
      }, 3000);
      timers.add(fade);
    };

    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - last < 380) return;
      last = now;
      const r = host.getBoundingClientRect();
      const x = e.clientX - r.left + (Math.random() - 0.3) * 120;
      const y = e.clientY - r.top + (Math.random() - 0.5) * 90;
      spawn(Math.max(8, Math.min(r.width - 220, x)), Math.max(8, Math.min(r.height - 30, y)));
    };
    host.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      host.removeEventListener("pointermove", onMove);
      timers.forEach((t) => {
        clearTimeout(t);
        clearInterval(t);
      });
      layer.innerHTML = "";
    };
  }, [targetId, reduced, finePointer]);

  return <div className="codespawns" ref={layerRef} aria-hidden="true" />;
}
