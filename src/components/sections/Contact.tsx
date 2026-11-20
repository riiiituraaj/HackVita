"use client";

import { useState } from "react";
import { contact, type Contact as ContactT } from "@/content/hackvita";
import { Reveal } from "@/components/fx/Reveal";
import { bitmap } from "@/lib/hooks";

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  instagram: (
    <>
      <rect x="3" y="3" width="14" height="14" rx="4" />
      <circle cx="10" cy="10" r="3.2" />
      <circle cx="14.2" cy="5.8" r="0.6" fill="currentColor" />
    </>
  ),
  linkedin: (
    <>
      <rect x="3" y="3" width="14" height="14" rx="2" />
      <path d="M6.5 8.5v5M6.5 6v.2M9.5 13.5v-5M9.5 10.5c0-1.2 1-2 2-2s2 .8 2 2v3" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M4 16l1-3.2A6.5 6.5 0 1 1 7.6 15z" />
      <path d="M8 7.5c0 2.5 2 4.5 4.5 4.5l.8-1.3-1.6-.7-.6.6c-.8-.3-1.4-.9-1.7-1.7l.6-.6-.7-1.6z" />
    </>
  ),
};

export function Contact() {
  return (
    <section id="contact" data-section="contact" className="section contact" aria-labelledby="contact-title">
      <div className="wrap">
        <p className="eyebrow">contact.section</p>
        <div data-skew>
          <Reveal as="h2" id="contact-title" className="h2 contact__title">
            {contact.heading}
          </Reveal>
        </div>
        <ul className="idcards" data-reveal-stagger>
          {contact.people.map((p, i) => (
            <li key={p.name}>
              <IdCard person={p} index={i} />
            </li>
          ))}
        </ul>
        <div className="socials" data-reveal>
          <span className="mono-s muted">socials:</span>
          <ul className="socials__list">
            {contact.socials.map((s) =>
              s.href ? (
                <li key={s.id}>
                  <a className="social glass gloss" href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                    <svg viewBox="0 0 20 20" aria-hidden="true">
                      {SOCIAL_ICONS[s.id]}
                    </svg>
                  </a>
                </li>
              ) : (
                <li key={s.id}>
                  <span
                    className="social glass is-disabled"
                    role="link"
                    aria-disabled="true"
                    tabIndex={0}
                    aria-label={`${s.label} — ${contact.socialsPendingTooltip}`}
                    data-tip={contact.socialsPendingTooltip}
                  >
                    <svg viewBox="0 0 20 20" aria-hidden="true">
                      {SOCIAL_ICONS[s.id]}
                    </svg>
                  </span>
                </li>
              ),
            )}
          </ul>
          <span className="chip chip--tba">
            <span data-scramble="">SOCIALS: TBA</span>
          </span>
        </div>
      </div>
    </section>
  );
}

function Initials({ name }: { name: string }) {
  const letters = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  // Only render glyphs our bitmap font knows; otherwise fall back to text.
  const known = /^[HACKVIT50. ]+$/.test(letters);
  if (!known) return <span className="idcard__initials font-pixel">{letters}</span>;
  const rows = bitmap(letters);
  return (
    <svg viewBox={`0 0 ${rows[0].length} 7`} className="idcard__initials-svg" shapeRendering="crispEdges">
      {rows.flatMap((r, y) => r.map((v, x) => (v ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} /> : null)))}
    </svg>
  );
}

function IdCard({ person, index }: { person: ContactT; index: number }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (!person.phoneDisplay) return;
    try {
      await navigator.clipboard.writeText(person.phoneDisplay);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = person.phoneDisplay;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        /* ignore */
      }
      ta.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <article className="idcard glass gloss" data-tilt="4">
      <span className="specular" />
      <header className="idcard__head mono-s">
        <span>ID://{String(index + 1).padStart(3, "0")}</span>
        <span className="idcard__led" aria-hidden="true" />
      </header>
      <div className="idcard__avatar" aria-hidden="true">
        <Initials name={person.name} />
      </div>
      <h3 className="idcard__name">{person.name}</h3>
      <p className="idcard__role mono-s">{person.role}</p>
      <div className="idcard__phone">
        {person.phoneDisplay && person.phoneE164 ? (
          <>
            <a className="idcard__tel ulink" href={`tel:${person.phoneE164}`}>
              {person.phoneDisplay}
            </a>
            <button type="button" className="idcard__copy" onClick={copy} aria-label={`Copy ${person.name}'s number`}>
              <svg viewBox="0 0 14 14" aria-hidden="true">
                <rect x="4.5" y="4.5" width="7" height="7" rx="1" />
                <path d="M9.5 4.5v-2h-7v7h2" />
              </svg>
            </button>
            <span className={`chip chip--alert idcard__copied ${copied ? "is-on" : ""}`} role="status" aria-live="polite">
              {copied ? "COPIED" : ""}
            </span>
          </>
        ) : (
          <>
            <span className="chip chip--tba">
              <span data-scramble="">NUMBER: TBA</span>
            </span>
            <span className="idcard__pending muted">{contact.pendingPhone}</span>
          </>
        )}
      </div>
    </article>
  );
}
