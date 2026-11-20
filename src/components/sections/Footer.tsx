"use client";

import { footer } from "@/content/hackvita";
import { glitchJump, scrollToTarget } from "@/lib/lenis";
import { FooterTunnel } from "@/components/fx/FooterTunnel";
import { CodeSpawner } from "@/components/fx/CodeSpawner";
import { PixelMark } from "@/components/chrome/PixelMark";
import { RegisterCta } from "@/components/ui/PlusButton";

export function Footer() {
  return (
    <footer id="footer" data-section="footer" className="site-footer">
      <FooterTunnel />
      <CodeSpawner targetId="footer" />
      <div className="footer__top">
        <PixelMark word="HACKVITA" className="footer__logo" title="HackVita" />
        <span className="mono-s footer__eof" aria-hidden="true">
          // EOF
        </span>
      </div>
      <button type="button" className="footer__totop" onClick={() => glitchJump(0)}>
        <span>BACK TO TOP</span>
        <span aria-hidden="true">↑</span>
      </button>
      <div className="footer__center">
        <h2 className="footer__title font-pixel">
          {footer.ctaLines.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </h2>
        <div className="footer__actions">
          <RegisterCta variant="dark" pendingLabel={footer.registerPending} />
          <button type="button" className="footer__faq gloss" onClick={() => scrollToTarget("faq")}>
            <span aria-hidden="true">→</span> {footer.faqLabel}
          </button>
        </div>
      </div>
      <div className="footer__bottom mono-s">
        {footer.meta.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </footer>
  );
}
