import { history, legacy, previousEdition } from "@/content/hackvita";
import { GlitchHeading } from "@/components/fx/GlitchHeading";
import { TypeRows } from "@/components/fx/TypeRows";
import { Timeline } from "./Timeline";

export function History() {
  const p = previousEdition;
  return (
    <section id="history" data-section="history" className="section history" aria-labelledby="history-title">
      <div className="wrap">
        <p className="eyebrow">history.section</p>
        <div className="history__head" data-skew>
          <GlitchHeading id="history-title" className="h2 history__title" lines={[history.heading]} chip="timeline.validate()" />
        </div>
        <p className="body-l muted history__copy" data-reveal>
          {history.copy}
        </p>
        <p className="mono-s qualifier" data-reveal>
          * {legacy.qualifier}
        </p>
      </div>

      <Timeline />

      <div className="wrap">
        <div className="past glass" aria-labelledby="past-title">
          <span className="cross cross--tl" aria-hidden="true" />
          <span className="cross cross--tr" aria-hidden="true" />
          <span className="cross cross--bl" aria-hidden="true" />
          <span className="cross cross--br" aria-hidden="true" />
          <header className="past__head">
            <h3 id="past-title" className="past__title">
              {p.title}
            </h3>
            <p className="chip chip--alert past__label">{p.label}</p>
          </header>
          <p className="past__focus muted" data-reveal>
            {p.focus}
          </p>

          <div className="past__grid">
            <div className="past__block">
              <h4 className="past__h4 mono-s">event.flow</h4>
              <TypeRows rows={p.flow} />
              <p className="past__demo mono-s">
                <span aria-hidden="true">◷ </span>
                {p.demo}
              </p>
            </div>

            <div className="past__block">
              <h4 className="past__h4 mono-s">judging.criteria</h4>
              <ul className="past__pills" data-reveal-stagger>
                {p.judging.map((j) => (
                  <li key={j} className="chip past__pill">
                    <span data-scramble="">{j}</span>
                  </li>
                ))}
              </ul>
              <p className="mono-s muted past__note">{p.judgingNote}</p>

              <h4 className="past__h4 mono-s">rules.documented</h4>
              <ul className="past__rules" data-reveal-stagger>
                {p.rules.map((r) => (
                  <li key={r} className="past__rule">
                    <span className="past__check" aria-hidden="true">
                      <svg viewBox="0 0 12 12">
                        <path d="M2 6.5l2.5 2.5L10 3.5" />
                      </svg>
                    </span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="past__five mono-s">
            <span className="past__five-key">hackvita_5_0.rulebook = null;</span> {p.fiveNote}
          </p>
        </div>
      </div>
    </section>
  );
}
