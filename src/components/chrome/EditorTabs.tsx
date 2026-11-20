"use client";

import { useEffect, useRef, useState } from "react";
import { tabs } from "@/content/hackvita";
import { scrollToTarget } from "@/lib/lenis";

const tabIds: readonly string[] = tabs.map((t) => t.id);

/** IDE-style file tabs that track the section in view. */
export function EditorTabs() {
  const [active, setActive] = useState<string>("index");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    let queued = false;
    const check = () => {
      queued = false;
      const mid = window.innerHeight * 0.5;
      let id = "index";
      for (const t of tabIds) {
        const el = document.getElementById(t);
        if (el && el.getBoundingClientRect().top <= mid) id = t;
      }
      setActive(id);
    };
    const onScroll = () => {
      if (!queued) {
        queued = true;
        raf = requestAnimationFrame(check);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    check();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Keep the active tab visible when the strip scrolls horizontally (narrow screens).
  useEffect(() => {
    const list = listRef.current;
    const btn = list?.querySelector<HTMLElement>(`[data-tab="${active}"]`);
    if (!list || !btn || list.scrollWidth <= list.clientWidth) return;
    const left = btn.offsetLeft - list.clientWidth / 2 + btn.offsetWidth / 2;
    list.scrollTo({ left, behavior: "smooth" });
  }, [active]);

  const activeIndex = tabIds.indexOf(active);

  return (
    <nav className="tabs" aria-label="Sections">
      <div className="tabs__list" ref={listRef}>
        {tabs.map((t, i) => {
          const far = Math.abs(i - activeIndex) > 2;
          return (
            <button
              key={t.id}
              type="button"
              data-tab={t.id}
              className={`tabs__tab ${t.id === active ? "is-active" : ""} ${far ? "is-far" : ""}`}
              aria-current={t.id === active ? "location" : undefined}
              onClick={() => scrollToTarget(t.id)}
            >
              <span className="tabs__icon" aria-hidden="true">
                {t.id === "index" ? "◆" : "§"}
              </span>
              {t.file}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
