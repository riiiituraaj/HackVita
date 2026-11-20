# HackVita 5.0 — website

Single-page site for **HackVita 5.0**, the 24-hour hybrid hackathon at Technovus, Jorhat Engineering College.
Built with Next.js 15 (static export), TypeScript, Tailwind CSS v4, GSAP + ScrollTrigger, Lenis and OGL (WebGL).

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static site → ./out (upload this folder to any static host)
npm run typecheck
```

---

## Updating content (no component changes needed)

Every word on the site lives in **`src/content/hackvita.ts`**. Anything not yet confirmed is `null`.
While a value is `null`, the site shows a styled `TBA` state (or hides the link). Replace the `null`
with the real value, rebuild, and the UI updates itself.

| To publish… | Edit in `src/content/hackvita.ts` | What changes on the site |
| --- | --- | --- |
| Exact dates | `event.exactDates = "14–15 February 2027"` | Hero "EXACT DATES: TBA" chip becomes the date |
| Registration link | `event.registrationUrl = "https://…"` | Every "Registration opens soon" button becomes a live **Register now** link (hero, nav pill, mobile menu, pre-footer, footer) |
| "Notify me" link (optional) | `event.notifyUrl = "https://…"` | A "Notify" link appears in the nav pill |
| Venue / reporting / remote details | `event.venue`, `event.reportingTime`, `event.remotePlatform`, `event.submissionProcess`, `event.remoteJudging` | The matching TBA chip on the Participate cards disappears and the row shows your text |
| Eligibility / fee / rulebook | `event.eligibility`, `event.registrationFee`, `event.rulebookUrl` | TBA marks on the "Solo or squad" card become values (the rulebook becomes a link) |
| Phone numbers | `contact.people[i].phoneDisplay = "+91 …"` and `phoneE164 = "+91…"` | "NUMBER: TBA" becomes a tap-to-call link with a copy button |
| Social links | `contact.socials[i].href = "https://…"` | The disabled icon becomes a working link |
| Past winners | Add objects to `editions[i].winners` (see below) | The redacted "COMPILING" dossier is replaced by real winner cards |
| Site address (for link previews) | `seo.siteUrl = "https://your-domain"` | Enables the social-share image (`public/og.png`) |

### Adding winners

Each edition in `editions` has a `winners` array. Add one object per award, following the real results
(award categories may differ per edition):

```ts
winners: [
  {
    award: "Winner",
    teamName: "Team name",
    institutions: ["Jorhat Engineering College"],
    projectName: "Project name",
    projectSummary: "One or two sentences about the project.",
    members: ["Name One", "Name Two"],
    photos: [{ src: "/winners/4-0-winner.webp", alt: "Team photo of …" }],
    links: [{ label: "Repository", href: "https://github.com/…" }],
  },
],
```

Put photos in `public/winners/` (WebP or AVIF, ~1200px wide). Once any edition has records, the
"Meet the teams that made their mark—and explore the projects behind their achievements." intro appears automatically.

---

## Images

| File | Used for | Notes |
| --- | --- | --- |
| `public/hero.webp` | Hero WebGL background (dithered pink view) | 2560×1440, an AI-edited dusk version of a JEC photo (sky, window lighting and pond edited); a stylized edit, not a documentary night photo. To swap: landscape, ≥1920px wide; lit windows/lights read best. Update `media.hero` if you change the file name. |
| `public/builder.webp` | De-pixelating portrait in the Legacy grid | 1080×1440 (3:4), an AI-generated, fictional person, not a real HackVita attendee. If you swap it, also update `media.builderAlt` to describe the new image. |
| `public/og.png` | Social-share card (1200×630) | Only used once `seo.siteUrl` is set. |
| `public/icon.svg` | Favicon | |

Photos are shown through a pink duotone + ordered-dither shader, so any well-exposed photo works.

---

## Content rules this site follows

These come from the organizer brief and should be kept when editing:

- **Invent nothing.** No dates, prizes, sponsors, judges, venues or links that the organizer has not supplied.
- The legacy figures (150+ teams, 25+ states, 4 editions, since 2023) always carry
  *"Across previous editions · organizer-reported"*. They are not 5.0 registrations, and there is no state map.
- GDGC, GLUG, E-CELL and DCODE are **community affiliations of previous editions**, not sponsors.
- HackVita 4.0's flow, judging criteria and rules are labelled
  *"From HackVita 4.0 — historical context, not the 5.0 rulebook."*

---

## Accessibility & motion

- A **reduce-motion** toggle sits bottom-left (saved in `localStorage`). It and the OS
  `prefers-reduced-motion` setting turn off smooth scrolling, pinning, glitch cuts, scrambles and the
  mosaic cursor trail, and show static, fully filled states.
- The console panel, canvases and code effects are decorative (`aria-hidden`); all real content is in the page text.
- Keyboard: skip link, focus rings, arrow keys on the winners tabs and the edition timeline, Escape closes the mobile menu.

## Project layout

```
src/content/hackvita.ts     all copy + pending (null) fields
src/components/chrome/      preloader, editor tabs, console panel, nav pill, motion toggle, grain, glitch overlay
src/components/fx/          hero shader, cursor system, scramble/glitch text, pixel dissolve, light columns, tunnel, code spawner
src/components/sections/    one file per page section
src/components/ui/          CTA button, chips, stat-card animations
src/shaders/                GLSL for the hero image and the cursor-trail render target
src/styles/                 chrome.css, sections.css (tokens live in src/app/globals.css)
```
