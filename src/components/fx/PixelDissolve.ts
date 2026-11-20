"use client";

let masks: string[] | null = null;

/** Six stepped-grid mask images: step k shows k/6 of the blocks, in random order. */
function buildMasks(): string[] {
  if (masks) return masks;
  const cols = 24;
  const rows = 16;
  const size = 20;
  const canvas = document.createElement("canvas");
  canvas.width = cols * size;
  canvas.height = rows * size;
  const ctx = canvas.getContext("2d")!;
  const order = Array.from({ length: cols * rows }, (_, i) => ({ i, k: Math.random() })).sort((a, b) => a.k - b.k);
  masks = [];
  for (let step = 1; step <= 6; step++) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000";
    const n = Math.round((step / 6) * order.length);
    for (let j = 0; j < n; j++) {
      const { i } = order[j];
      ctx.fillRect((i % cols) * size, Math.floor(i / cols) * size, size, size);
    }
    masks.push(`url(${canvas.toDataURL("image/png")})`);
  }
  return masks;
}

/**
 * Reveals `el` through a 6-step pixel dissolve over `duration` ms.
 * Returns a cancel function.
 */
export function pixelDissolveIn(el: HTMLElement, duration = 450, onDone?: () => void) {
  const steps = buildMasks();
  const style = el.style as CSSStyleDeclaration & { webkitMaskImage?: string; webkitMaskSize?: string };
  const set = (v: string) => {
    style.maskImage = v;
    style.webkitMaskImage = v;
  };
  style.maskSize = "100% 100%";
  style.webkitMaskSize = "100% 100%";
  set(steps[0]);
  const timers: number[] = [];
  const per = duration / steps.length;
  steps.forEach((m, i) => {
    if (i === 0) return;
    timers.push(window.setTimeout(() => set(m), i * per));
  });
  timers.push(
    window.setTimeout(() => {
      set("");
      onDone?.();
    }, duration),
  );
  return () => {
    timers.forEach(clearTimeout);
    set("");
  };
}
