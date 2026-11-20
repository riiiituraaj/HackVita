import { about, communities } from "@/content/hackvita";
import { Reveal } from "@/components/fx/Reveal";

export function About() {
  const words = communities.list.map((c) => c.short);
  // Enough copies to fill wide screens; the track is duplicated for a seamless loop.
  const track = [...words, ...words, ...words];
  return (
    <section id="about" data-section="about" className="section about" aria-labelledby="about-title">
      <div className="marquee" aria-label={about.marqueeLabel}>
        <p className="marquee__label mono-s">
          <span className="eyebrow">{about.marqueeLabel}</span>
        </p>
        <div className="marquee__viewport">
          <ul className="marquee__track">
            {[0, 1].map((copy) =>
              track.map((w, i) => (
                <li key={`${copy}-${i}`} aria-hidden={copy === 1 || i >= words.length ? true : undefined}>
                  <span className="marquee__word">{w}</span>
                  <span className="marquee__sep" aria-hidden="true">
                    ✦
                  </span>
                </li>
              )),
            )}
          </ul>
        </div>
      </div>

      <div className="wrap about__body">
        <span className="bloom about__bloom" aria-hidden="true" />
        <p className="eyebrow about__eyebrow">about.section</p>
        <div data-skew>
          <Reveal as="h2" id="about-title" className="h2 about__statement">
            {about.statement}
          </Reveal>
        </div>
        <div className="about__cols">
          {about.paragraphs.map((p, i) => (
            <p key={i} className={i === 0 ? "body-l" : "muted"} data-reveal>
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
