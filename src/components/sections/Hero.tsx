import { event, hero } from "@/content/hackvita";
import { HeroShader } from "@/components/fx/HeroShader";
import { Reveal } from "@/components/fx/Reveal";
import { RegisterCta } from "@/components/ui/PlusButton";
import { Chip, TbaChip } from "@/components/ui/Chip";

export function Hero() {
  const [l1, l2] = hero.headlineLines;
  const [before, after] = l1.split(event.edition);
  return (
    <section id="index" data-section="index" className="hero" aria-labelledby="hero-title">
      <HeroShader />
      <div className="hero__fade" aria-hidden="true" />
      <div className="wrap hero__inner">
        <div className="hero__left">
          <p className="eyebrow hero__eyebrow">
            {event.festival} · {event.host}
          </p>
          <div className="hero__title-wrap" data-skew>
            <span className="bloom hero__bloom" aria-hidden="true" />
            <Reveal as="h1" id="hero-title" className="display-xl hero__title" onBoot>
              {before}
              <span className="chrome-text">{event.edition}</span>
              {after}
              <br />
              {l2}
            </Reveal>
          </div>
          <ul className="hero__chips" aria-label="Format" data-reveal>
            {hero.metaChips.map((c) => (
              <li key={c}>
                <Chip>{c}</Chip>
              </li>
            ))}
          </ul>
        </div>
        <div className="hero__right">
          <p className="body-l hero__desc" data-reveal>
            {hero.description}
          </p>
          <div className="hero__cta" data-reveal>
            <RegisterCta />
            {event.exactDates ? (
              <Chip variant="solid">{event.exactDates}</Chip>
            ) : (
              <TbaChip label="Exact dates" />
            )}
          </div>
        </div>
      </div>
      <div className="hero__hud wrap" aria-hidden="true">
        <span>[ SCAN.MODE ]</span>
        <span>FEED://technovus/jec</span>
        <span className="hero__hud-rec">● REC</span>
      </div>
    </section>
  );
}
