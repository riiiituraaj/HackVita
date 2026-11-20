"use client";

import { useEffect, useRef, useState } from "react";
import { on } from "@/lib/bus";
import { useMotion } from "@/lib/motion";
import { IDLE, INTRO, SECTION_BLOCKS, highlight, isWarnLine } from "./consoleScript";

const MAX_LINES = 220;

/**
 * The always-on console: types pseudo-code continuously and appends a block
 * for each section that enters. Purely decorative → aria-hidden.
 */
export function ConsolePanel() {
  const { reduced, booted } = useMotion();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [lineNo, setLineNo] = useState(0);
  const [section, setSection] = useState("index");

  useEffect(() => {
    if (!booted) return;
    const linesEl = linesRef.current!;
    const scroller = scrollerRef.current!;
    linesEl.innerHTML = "";
    const queue: string[] = [];
    let n = 0;
    let timer = 0;
    let idleIdx = 0;
    let lastBlock = "";
    let current: { el: HTMLElement; code: HTMLElement; text: string; i: number } | null = null;
    let stopped = false;

    const addRow = (text: string) => {
      n += 1;
      const row = document.createElement("div");
      row.className = "cl";
      const num = document.createElement("span");
      num.className = "cl__n";
      num.textContent = String(n).padStart(3, "0");
      const code = document.createElement("span");
      code.className = "cl__c";
      row.append(num, code);
      linesEl.appendChild(row);
      while (linesEl.childElementCount > MAX_LINES) linesEl.firstElementChild?.remove();
      setLineNo(n);
      return { el: row, code, text, i: 0 };
    };

    const finishRow = (r: NonNullable<typeof current>) => {
      r.code.innerHTML = highlight(r.text);
      if (isWarnLine(r.text)) {
        r.el.classList.add("is-warn");
        window.setTimeout(() => r.el.classList.remove("is-warn"), 1400);
      }
    };

    const scrollDown = () => {
      scroller.scrollTop = scroller.scrollHeight;
    };

    const step = () => {
      if (stopped) return;
      if (document.hidden) {
        timer = window.setTimeout(step, 400);
        return;
      }
      if (!current) {
        if (queue.length === 0) {
          // Idle heartbeat.
          timer = window.setTimeout(() => {
            queue.push("", ...IDLE[idleIdx++ % IDLE.length]);
            step();
          }, 5200 + Math.random() * 2400);
          return;
        }
        current = addRow(queue.shift()!);
        scrollDown();
      }
      if (reduced) {
        current.i = current.text.length;
      } else {
        current.i += 1 + (Math.random() < 0.25 ? 1 : 0);
      }
      if (current.i >= current.text.length) {
        finishRow(current);
        current = null;
        timer = window.setTimeout(step, reduced ? 0 : 70);
      } else {
        current.code.innerHTML = highlight(current.text.slice(0, current.i)) + '<span class="cl__cur"></span>';
        timer = window.setTimeout(step, 18 + Math.random() * 22);
      }
    };

    queue.push(...INTRO);
    step();

    const off = on("section", (id) => {
      setSection(id);
      const block = SECTION_BLOCKS[id];
      if (!block || id === lastBlock) return;
      lastBlock = id;
      queue.push("", ...block);
      if (!current && queue.length === block.length + 1) {
        window.clearTimeout(timer);
        step();
      }
    });

    return () => {
      stopped = true;
      window.clearTimeout(timer);
      off();
    };
  }, [booted, reduced]);

  return (
    <>
      <aside className={`console ${open ? "is-open" : ""}`} aria-hidden="true">
        <div className="console__tabs">
          <span className="console__tab">
            <span className="console__tab-dot" />
            console.log
          </span>
          <span className="console__tab console__tab--ghost">{section}.ts</span>
        </div>
        <div className="console__scroller" ref={scrollerRef} data-lenis-prevent>
          <div className="console__lines" ref={linesRef} />
        </div>
        <div className="console__status">
          <span className="console__run">
            <span className="console__led" /> RUNNING
          </span>
          <span>hackvita.v5</span>
          <span>ln {String(lineNo).padStart(3, "0")}</span>
        </div>
      </aside>
      <button
        type="button"
        className="console-toggle glass gloss"
        aria-expanded={open}
        aria-label={open ? "Hide decorative console" : "Show decorative console"}
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true">{open ? "×" : ">_"}</span>
        <span className="console-toggle__label" aria-hidden="true">
          console
        </span>
      </button>
    </>
  );
}
