import { bitmap, seeded } from "@/lib/hooks";

type Props = {
  word?: string;
  className?: string;
  /** Animate blocks in, in random order (CSS animation delays). */
  assemble?: boolean;
  /** Seconds over which all blocks appear. */
  spread?: number;
  delay?: number;
  title?: string;
};

/** The HackVita pixel mark: a word drawn from square blocks. */
export function PixelMark({ word = "HV", className = "", assemble = false, spread = 1.4, delay = 0, title }: Props) {
  const rows = bitmap(word);
  const w = rows[0].length;
  const h = rows.length;
  const rand = seeded(word.length * 97 + 13);
  const cells: { x: number; y: number; d: number }[] = [];
  rows.forEach((row, y) =>
    row.forEach((v, x) => {
      if (v) cells.push({ x, y, d: delay + rand() * spread });
    }),
  );
  return (
    <svg
      viewBox={`0 0 ${w * 10} ${h * 10}`}
      className={`pixel-mark ${assemble ? "pixel-mark--assemble" : ""} ${className}`}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      shapeRendering="crispEdges"
    >
      {cells.map((c, i) => (
        <rect
          key={i}
          x={c.x * 10 + 0.5}
          y={c.y * 10 + 0.5}
          width={9}
          height={9}
          fill="currentColor"
          style={assemble ? { animationDelay: `${c.d.toFixed(3)}s` } : undefined}
        />
      ))}
    </svg>
  );
}
