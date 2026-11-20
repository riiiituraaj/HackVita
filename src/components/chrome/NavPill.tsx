"use client";

import { useEffect, useRef, useState } from "react";
import { event, registration, registrationLive, tabs } from "@/content/hackvita";
import { getLenis, scrollState, scrollToTarget } from "@/lib/lenis";
import { PlusIcon } from "@/components/ui/PlusButton";
import { PixelMark } from "./PixelMark";

const links = tabs.filter((t) => t.nav !== null) as unknown as { id: string; nav: string }[];

export function NavPill() {
  const [hidden, setHidden] = useState(false);
  const [overFooter, setOverFooter] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const live = registrationLive();

  // Hide on fast scroll down, return on scroll up.
  useEffect(() => {
    let raf = 0;
    let lastY = window.scrollY;
    const tick = () => {
      const y = window.scrollY;
      const dy = y - lastY;
      lastY = y;
      const v = Math.abs(scrollState.velocity) > 0 ? scrollState.velocity : dy;
      if (v > 6 && y > 200) setHidden(true);
      else if (v < -2) setHidden(false);
      if (y < 200) setHidden(false);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Fully hidden over the footer.
  useEffect(() => {
    const footer = document.getElementById("footer");
    if (!footer) return;
    const io = new IntersectionObserver(([e]) => setOverFooter(e.isIntersecting), {
      rootMargin: "0px 0px -30% 0px",
    });
    io.observe(footer);
    return () => io.disconnect();
  }, []);

  // Mobile sheet: lock scroll, Escape to close, return focus.
  useEffect(() => {
    if (!menuOpen) return;
    const lenis = getLenis();
    lenis?.stop();
    document.documentElement.classList.add("menu-open");
    const first = menuRef.current?.querySelector<HTMLElement>("button, a");
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
      if (e.key === "Tab" && menuRef.current) {
        const f = menuRef.current.querySelectorAll<HTMLElement>("button, a, [tabindex='0']");
        const a = f[0];
        const b = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) {
          e.preventDefault();
          b.focus();
        } else if (!e.shiftKey && document.activeElement === b) {
          e.preventDefault();
          a.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lenis?.start();
      document.documentElement.classList.remove("menu-open");
      toggleRef.current?.focus();
    };
  }, [menuOpen]);

  const go = (id: string) => {
    setMenuOpen(false);
    window.setTimeout(() => scrollToTarget(id), menuOpen ? 60 : 0);
  };

  const register = live ? (
    <a className="nav__register gloss" href={event.registrationUrl!} target="_blank" rel="noopener noreferrer">
      <span className="nav__plus">
        <PlusIcon />
      </span>
      <span className="nav__reg-label">Register</span>
    </a>
  ) : (
    <span
      className="nav__register is-disabled"
      role="link"
      aria-disabled="true"
      tabIndex={0}
      data-tip={registration.pendingTooltip}
      aria-label={`Register soon — ${registration.pendingTooltip}`}
    >
      <span className="nav__plus">
        <PlusIcon />
      </span>
      <span className="nav__reg-label">
        Register <span className="cta__soon">SOON</span>
      </span>
    </span>
  );

  return (
    <>
      <nav
        className={`nav ${hidden && !menuOpen ? "is-hidden" : ""} ${overFooter ? "is-gone" : ""}`}
        aria-label="Primary"
      >
        <div className="nav__pill glass">
          <button type="button" className="nav__logo" onClick={() => go("index")} aria-label="HackVita 5.0 — back to top">
            <PixelMark word="HV" className="nav__mark" />
            <span className="nav__word">HackVita</span>
          </button>
          <ul className="nav__links">
            {links.map((l) => (
              <li key={l.id}>
                <button type="button" className="nav__link" onClick={() => go(l.id)}>
                  <span>{l.nav}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="nav__right">
            {event.notifyUrl && (
              <a className="nav__ghost ulink" href={event.notifyUrl} target="_blank" rel="noopener noreferrer">
                Notify
              </a>
            )}
            {register}
          </div>
          <button
            ref={toggleRef}
            type="button"
            className="nav__menu-btn"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className={`nav__burger ${menuOpen ? "is-open" : ""}`} aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </div>
      </nav>

      <div
        id="mobile-menu"
        ref={menuRef}
        className={`sheet ${menuOpen ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        hidden={!menuOpen}
      >
        <div className="sheet__head">
          <span className="eyebrow">menu.open()</span>
          <button type="button" className="sheet__close" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            ×
          </button>
        </div>
        <ul className="sheet__links">
          {links.map((l, i) => (
            <li key={l.id} style={{ "--i": i } as React.CSSProperties}>
              <button type="button" onClick={() => go(l.id)}>
                <span className="sheet__idx">{String(i + 1).padStart(2, "0")}</span>
                {l.nav}
              </button>
            </li>
          ))}
        </ul>
        <div className="sheet__foot">{register}</div>
      </div>
    </>
  );
}
