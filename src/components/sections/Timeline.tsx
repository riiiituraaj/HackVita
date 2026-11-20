"use client";

import { useEffect, useRef } from "react";
import { editions, nextEdition } from "@/content/hackvita";
import { useMotion } from "@/lib/motion";

/**
 * Horizontal edition timeline. Desktop: pointer drag with inertia and
 * vertical wheel → horizontal. Below 1024px: native scroll with snap.
 * Keyboard: focus the strip and use ←/→.
 */
export function Timeline() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const { reduced } = useMotion();

  useEffect(() => {
    const vp = viewportRef.current;
    const fill = fillRef.current;
    if (!vp || !fill) return;
    const desktop = window.matchMedia("(min-width: 1024px)");

    const updateFill = () => {
      const max = vp.scrollWidth - vp.clientWidth;
      const p = max > 0 ? vp.scrollLeft / max : 1;
      const base = vp.clientWidth / vp.scrollWidth;
      fill.style.transform = `scaleX(${Math.min(1, base * 0.6 + (1 - base * 0.6) * p)})`;
    };

    let dragging = false;
    let startX = 0;
    let startLeft = 0;
    let lastX = 0;
    let lastT = 0;
    let v = 0;
    let raf = 0;
    let moved = 0;

    const inertia = () => {
      v *= 0.94;
      vp.scrollLeft -= v;
      if (Math.abs(v) > 0.3) raf = requestAnimationFrame(inertia);
    };

    const onDown = (e: PointerEvent) => {
      if (!desktop.matches || e.pointerType !== "mouse" || e.button !== 0) return;
      dragging = true;
      moved = 0;
      cancelAnimationFrame(raf);
      startX = lastX = e.clientX;
      startLeft = vp.scrollLeft;
      lastT = performance.now();
      v = 0;
      vp.setPointerCapture(e.pointerId);
      vp.classList.add("is-dragging");
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      const dt = Math.max(1, now - lastT);
      v = (dx / dt) * 16;
      lastX = e.clientX;
      lastT = now;
      moved += Math.abs(dx);
      vp.scrollLeft = startLeft - (e.clientX - startX);
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      vp.releasePointerCapture(e.pointerId);
      vp.classList.remove("is-dragging");
      if (!reduced && Math.abs(v) > 0.5) raf = requestAnimationFrame(inertia);
    };
    const onClick = (e: MouseEvent) => {
      if (moved > 6) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const onWheel = (e: WheelEvent) => {
      if (!desktop.matches) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // native horizontal
      const max = vp.scrollWidth - vp.clientWidth;
      const dir = Math.sign(e.deltaY);
      const canMove = (dir > 0 && vp.scrollLeft < max - 1) || (dir < 0 && vp.scrollLeft > 1);
      // Only take over the wheel when the strip is mostly on screen.
      const r = vp.getBoundingClientRect();
      const centred = r.top < window.innerHeight * 0.75 && r.bottom > window.innerHeight * 0.25;
      if (!canMove || !centred) return;
      e.preventDefault();
      e.stopPropagation();
      cancelAnimationFrame(raf);
      vp.scrollLeft += e.deltaY * (e.deltaMode === 1 ? 32 : 1);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      cancelAnimationFrame(raf); // stop any drag inertia first
      const node = vp.querySelector<HTMLElement>(".tl__node");
      const step = node ? node.offsetWidth + 24 : vp.clientWidth * 0.6;
      vp.scrollBy({ left: e.key === "ArrowRight" ? step : -step, behavior: reduced ? "auto" : "smooth" });
    };

    vp.addEventListener("pointerdown", onDown);
    vp.addEventListener("pointermove", onMove);
    vp.addEventListener("pointerup", onUp);
    vp.addEventListener("pointercancel", onUp);
    vp.addEventListener("click", onClick, true);
    vp.addEventListener("wheel", onWheel, { passive: false });
    vp.addEventListener("keydown", onKey);
    vp.addEventListener("scroll", updateFill, { passive: true });
    window.addEventListener("resize", updateFill);
    updateFill();
    return () => {
      cancelAnimationFrame(raf);
      vp.removeEventListener("pointerdown", onDown);
      vp.removeEventListener("pointermove", onMove);
      vp.removeEventListener("pointerup", onUp);
      vp.removeEventListener("pointercancel", onUp);
      vp.removeEventListener("click", onClick, true);
      vp.removeEventListener("wheel", onWheel);
      vp.removeEventListener("keydown", onKey);
      vp.removeEventListener("scroll", updateFill);
      window.removeEventListener("resize", updateFill);
    };
  }, [reduced]);

  return (
    <div className="tl">
      <div className="tl__hint mono-s" aria-hidden="true">
        <span>drag →</span>
        <span>timeline.length = {editions.length + 1}</span>
      </div>
      <div
        className="tl__viewport"
        ref={viewportRef}
        tabIndex={0}
        role="region"
        aria-label="Edition timeline. Use the left and right arrow keys to move."
      >
        <div className="tl__track">
          <span className="tl__line" aria-hidden="true">
            <span className="tl__fill" ref={fillRef} />
          </span>
          <ol className="tl__list">
          {editions.map((ed) => (
            <li key={ed.id} className="tl__node">
              <span className="tl__dot" aria-hidden="true" />
              <article className="tl__card glass gloss" data-tilt="3">
                <span className="specular" />
                <header className="tl__card-head">
                  <span className="tl__ver font-dot">{ed.version}</span>
                  <span className="tl__year mono-s">{ed.year}</span>
                </header>
                <h3 className="tl__title">HackVita {ed.version}</h3>
                <p className="tl__desc">{ed.description}</p>
                <footer className="tl__foot">
                  <span className="chip">
                    <span data-scramble="">{ed.status.toUpperCase()}</span>
                  </span>
                  {ed.detailNote && (
                    <span className="chip chip--tba" title={ed.detailNote}>
                      <span data-scramble="">DETAILS: AWAITING_RECORDS</span>
                    </span>
                  )}
                </footer>
                {ed.detailNote && <p className="tl__note mono-s muted">{ed.detailNote}</p>}
              </article>
            </li>
          ))}
          <li className="tl__node tl__node--next">
            <span className="tl__dot tl__dot--next" aria-hidden="true" />
            <article className="tl__card tl__card--next gloss" data-tilt="3">
              <span className="specular" />
              <header className="tl__card-head">
                <span className="tl__ver font-dot chrome-on-pink">{nextEdition.version}</span>
                <span className="tl__year mono-s">{nextEdition.year}</span>
              </header>
              <h3 className="tl__title">HackVita {nextEdition.version}</h3>
              <p className="tl__desc">{nextEdition.description}</p>
              <footer className="tl__foot">
                <span className="chip tl__soon">
                  <span>{nextEdition.status.toUpperCase()}</span>
                </span>
              </footer>
            </article>
          </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
