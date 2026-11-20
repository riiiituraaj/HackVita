const CHARS = "!<>-_\\/[]{}—=+*^?#░▒▓";

const running = new WeakMap<HTMLElement, number>();

/**
 * Cycles each character through glyph noise, resolving left → right.
 * Operates on the element's text content. Returns a cancel function.
 */
export function scrambleText(el: HTMLElement, finalText?: string, duration = 550) {
  const target = finalText ?? el.dataset.text ?? el.textContent ?? "";
  el.dataset.text = target;
  const prev = running.get(el);
  if (prev) cancelAnimationFrame(prev);

  const start = performance.now();
  const len = target.length;
  let lastSwap = 0;
  let noise = target.split("");

  const frame = (now: number) => {
    const t = (now - start) / duration;
    if (t >= 1) {
      el.textContent = target;
      running.delete(el);
      return;
    }
    if (now - lastSwap > 45) {
      lastSwap = now;
      noise = target
        .split("")
        .map((c) => (c === " " ? " " : CHARS[(Math.random() * CHARS.length) | 0]));
    }
    // Each char resolves at a time proportional to its index.
    const resolved = Math.floor(Math.max(0, (t - 0.25) / 0.75) * len);
    let out = "";
    for (let i = 0; i < len; i++) out += i < resolved ? target[i] : noise[i];
    el.textContent = out;
    running.set(el, requestAnimationFrame(frame));
  };
  running.set(el, requestAnimationFrame(frame));

  return () => {
    const id = running.get(el);
    if (id) cancelAnimationFrame(id);
    running.delete(el);
    el.textContent = target;
  };
}
