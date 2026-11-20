import { closing } from "@/content/hackvita";
import { LightColumns } from "@/components/fx/LightColumns";
import { ScrambleText } from "@/components/fx/ScrambleText";
import { RegisterCta } from "@/components/ui/PlusButton";

export function PreFooter() {
  const [l1, l2] = closing.lines;
  const [first, ...rest] = l2.split(" ");
  return (
    <section id="prefooter" data-section="prefooter" className="prefooter" aria-labelledby="prefooter-title">
      <LightColumns count={15} />
      <div className="wrap prefooter__inner">
        <div className="prefooter__cta" data-skew>
          <span className="bloom prefooter__bloom" aria-hidden="true" />
          <h2 id="prefooter-title" className="prefooter__title font-pixel">
            <span className="prefooter__l1">{l1}</span>
            <span className="prefooter__l2">
              <span className="prefooter__first">{first}</span> {rest.join(" ")}
            </span>
          </h2>
          <span className="code-chip prefooter__chip" aria-hidden="true">
            <ScrambleText text="hackvita.next_chapter()" trigger="loop" every={3400} />
          </span>
        </div>
        <div className="prefooter__actions" data-reveal>
          <RegisterCta pendingLabel="Registration opens soon" />
          <p className="mono-s muted prefooter__note">{closing.note}</p>
        </div>
      </div>
    </section>
  );
}
