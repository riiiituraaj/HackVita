import { communities } from "@/content/hackvita";
import { GlitchHeading } from "@/components/fx/GlitchHeading";

/** Generic pixel-style line icons (12×12 grid) — not community logos. */
const ICONS: Record<string, string> = {
  GDGC: "M4 3L1 6l3 3M8 3l3 3-3 3M7 2L5 10",
  GLUG: "M1 2h10v8H1zM3 5l2 1.5L3 8M6 8h3",
  "E-CELL": "M6 1a3.5 3.5 0 0 1 2 6.4V9H4V7.4A3.5 3.5 0 0 1 6 1zM4.5 11h3",
  DCODE: "M4 1H3v4L1 6l2 1v4h1M8 1h1v4l2 1-2 1v4H8",
};

export function Communities() {
  return (
    <section id="communities" data-section="communities" className="section communities" aria-labelledby="communities-title">
      <div className="wrap">
        <div data-skew>
          <GlitchHeading
            id="communities-title"
            className="h2 h2--upper communities__title"
            lines={communities.headingLines}
            chip="community.list()"
            scramble
            lineClassNames={["communities__l1", "communities__l2"]}
          />
        </div>
        <ul className="ccards" data-reveal-stagger>
          {communities.list.map((c, i) => (
            <li key={c.short} className="ccard glass gloss" data-tilt="4">
              <span className="specular" />
              <span className="ccard__video" aria-hidden="true" />
              <div className="ccard__top">
                <svg viewBox="0 0 12 12" className="ccard__icon" aria-hidden="true">
                  <path d={ICONS[c.short]} />
                </svg>
                <span className="ccard__arrow" aria-hidden="true">
                  <svg viewBox="0 0 12 12">
                    <path d="M3 9L9 3M4 3h5v5" />
                  </svg>
                </span>
              </div>
              <div className="ccard__bottom">
                <p className="ccard__idx mono-s" aria-hidden="true">
                  0{i + 1}
                </p>
                <h3 className="ccard__short font-pixel">{c.short}</h3>
                <p className="ccard__name mono-s">{c.name}</p>
                <p className="ccard__desc">{c.description}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="communities__caption mono-s muted" data-reveal>
          {communities.caption}
        </p>
      </div>
    </section>
  );
}
