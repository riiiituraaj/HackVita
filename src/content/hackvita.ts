/**
 * HackVita 5.0 — single source of truth for every word on the site.
 *
 * Every value here comes from `HackVita_5.0_Event_Details.md`.
 * Anything the organizer has not supplied yet is `null`. The UI reads `null`
 * automatically: it shows a styled "TBA" state, hides dead links and disables
 * calls to action. To publish a detail, replace the `null` with the real value
 * and rebuild — no component needs to change. See README.md for a checklist.
 */

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type Pending<T> = T | null;

export interface Contact {
  name: string;
  /** Only "Organizing team" is known. Do not add titles that were not supplied. */
  role: string;
  /** Human-readable number, e.g. "+91 93947 13455". `null` shows "Number to be provided". */
  phoneDisplay: Pending<string>;
  /** E.164 form used for the tel: link, e.g. "+919394713455". */
  phoneE164: Pending<string>;
}

export interface WinnerRecord {
  /** e.g. "Winner", "1st place", "Best design". Follow the actual results. */
  award: string;
  teamName: string;
  institutions: string[];
  projectName: string;
  projectSummary: string;
  members: string[];
  /** Paths under /public, e.g. "/winners/4-0-team.webp" */
  photos: { src: string; alt: string }[];
  links: { label: string; href: string }[];
}

export interface Edition {
  id: string;
  version: string; // "1.0"
  year: string; // "2023"
  status: "Completed" | "Coming Soon";
  description: string;
  /** Set when the organizer has noted that detail is still missing. */
  detailNote: Pending<string>;
  /** Empty array = records not supplied yet → the redacted dossier is shown. */
  winners: WinnerRecord[];
}

export interface Community {
  short: string;
  name: string;
  description: string;
}

export interface Faq {
  q: string;
  a: string;
}

/* ------------------------------------------------------------------ */
/* Event facts                                                         */
/* ------------------------------------------------------------------ */

export const event = {
  name: "HackVita 5.0",
  brand: "HackVita",
  edition: "5.0",
  status: "Coming Soon",
  timing: "Early 2027",
  festival: "Technovus",
  festivalDescription: "The technical fest of Jorhat Engineering College",
  host: "Jorhat Engineering College",
  hostShort: "JEC",
  durationHours: 24,
  format: "Hybrid — in-person and remote participation",
  teamSize: { min: 1, max: 4 },
  soloAllowed: true,
  firstEdition: 2023,
  completedEditions: 4,

  /* ---- Pending: fill these in when the organizer confirms them ---- */
  /** e.g. "14–15 February 2027". `null` → "Exact dates: TBA". */
  exactDates: null as Pending<string>,
  /** Registration form URL. `null` → CTA reads "Registration opens soon" and is disabled. */
  registrationUrl: null as Pending<string>,
  /** Optional "notify me" URL for the nav pill. `null` → hidden. */
  notifyUrl: null as Pending<string>,
  venue: null as Pending<string>,
  reportingTime: null as Pending<string>,
  remotePlatform: null as Pending<string>,
  submissionProcess: null as Pending<string>,
  remoteJudging: null as Pending<string>,
  onCampusArrangements: null as Pending<string>,
  eligibility: null as Pending<string>,
  registrationFee: null as Pending<string>,
  rulebookUrl: null as Pending<string>,
};

export const registration = {
  /** Shown while `event.registrationUrl` is null. */
  pendingLabel: "Registration opens soon",
  pendingShort: "Register",
  pendingTooltip: "Registration details will be announced",
  /** Shown automatically once `event.registrationUrl` is set. */
  liveLabel: "Register now",
};

/* ------------------------------------------------------------------ */
/* Copy                                                                */
/* ------------------------------------------------------------------ */

export const hero = {
  headlineLines: ["HackVita 5.0 —", "Coming Soon, Early 2027"],
  /** Doc § 5 "Short description" */
  description:
    "HackVita 5.0 is a 24-hour hybrid hackathon coming in early 2027 during Technovus, the technical fest of Jorhat Engineering College. Participate individually or in a team of up to four, in person or remotely.",
  metaChips: ["24 HOURS", "HYBRID", "TEAMS OF 1–4", "TECHNOVUS · JEC"],
};

export const announcement = {
  heading: "HackVita 5.0 — Coming Soon, Early 2027",
  paragraphs: [
    "24 hours to turn your boldest idea into something real. HackVita returns during Technovus at Jorhat Engineering College, bringing builders together—in person and remotely—for the next chapter of innovation.",
    "Bring your team or begin on your own. With teams of one to four, HackVita 5.0 is an invitation to think boldly, build with purpose and make your ideas count.",
  ],
  pendingLine:
    "Exact dates, challenges and registration details will be announced.",
};

export const about = {
  statement:
    "Born at Jorhat Engineering College. Built for ambition across India.",
  /** Doc § 2 "About HackVita" */
  paragraphs: [
    "HackVita is a 24-hour hackathon conducted during Technovus, the technical fest of Jorhat Engineering College. It brings together ambitious builders to explore ideas, collaborate and turn real-world challenges into working prototypes.",
    "From the first spark of an idea to a demonstration of what a team has built, HackVita celebrates creativity, technical problem-solving, teamwork and the drive to make something meaningful.",
    "Since its first edition in 2023, HackVita has continued through four chapters. HackVita 5.0 carries that legacy into early 2027, welcoming individuals and teams of up to four members through both in-person and remote participation.",
  ],
  marqueeLabel: "Communities behind previous editions",
};

/** Doc § 5 "Supporting lines", broken into display lines. */
export const statements: string[][] = [
  ["ONE CLOCK.", "COUNTLESS", "POSSIBILITIES."],
  ["BUILD SOLO.", "BUILD", "TOGETHER."],
  ["FOUR EDITIONS", "BUILT THE", "LEGACY."],
  ["YOUR CHAPTER", "IS NEXT."],
];

/* ------------------------------------------------------------------ */
/* Legacy                                                              */
/* ------------------------------------------------------------------ */

export const legacy = {
  heading: "FOUR EDITIONS BUILT THE LEGACY. THE FIFTH IS YOURS TO DEFINE.",
  promoTitle:
    "Born at Jorhat Engineering College. Built for ambition across India.",
  /** Doc § 3 "Promotional description" */
  promo:
    "Across four editions, HackVita has brought together 150+ teams, with participation and engagement from 25+ states across the country. What began in 2023 continues as a meeting point for ideas, determination and the thrill of building under pressure. Now, the fifth chapter is coming—and the next story is yours to write.",
  /** Must accompany the legacy figures everywhere they appear. */
  qualifier: "Across previous editions · organizer-reported",
  footnote:
    "Across previous editions · organizer-reported · not 5.0 registrations",
  stats: {
    teams: { value: 150, suffix: "+", label: "Teams across HackVita editions" },
    states: {
      value: 25,
      suffix: "+",
      label: "States across India represented through participation and engagement",
    },
    editions: { value: 4, suffix: "", label: "Completed editions", since: 2023 },
    hours: { value: 24, suffix: "", label: "Hours on the clock" },
    team: { min: 1, max: 4, label: "Members per team · solo allowed" },
  },
  portraitStatus: 'hackvita.status = "coming_soon"',
};

/* ------------------------------------------------------------------ */
/* Participation                                                       */
/* ------------------------------------------------------------------ */

export interface ParticipationRow {
  title: string;
  text: string;
  /** If set and the value is null, a TBA chip is shown on the row. */
  pendingKey?: keyof typeof event;
  /** Short label for the TBA chip, e.g. "VENUE" → "VENUE: TBA". */
  chip?: string;
}

export interface ParticipationCard {
  id: string;
  icon: "circle" | "square" | "plus";
  label: string;
  statement: string;
  rows: ParticipationRow[];
  features: string[];
}

export const participation = {
  /** Doc § 5 supporting line */
  heading: "Build solo. Build together. Be part of what comes next.",
  /** Doc § 5 main announcement, paragraph 2 */
  intro:
    "Bring your team or begin on your own. With teams of one to four, HackVita 5.0 is an invitation to think boldly, build with purpose and make your ideas count.",
  cards: [
    {
      id: "in-person",
      icon: "circle",
      label: "IN PERSON",
      statement:
        "Participants can join HackVita 5.0 at Jorhat Engineering College.",
      rows: [
        {
          title: "Campus",
          text: "Jorhat Engineering College, during Technovus.",
        },
        {
          title: "Venue",
          text: "Exact venue will be announced.",
          pendingKey: "venue",
          chip: "Venue",
        },
        {
          title: "Reporting & arrangements",
          text: "Reporting time and on-campus arrangements will be announced.",
          pendingKey: "reportingTime",
          chip: "Reporting time",
        },
      ],
      features: ["24 hours", "Teams of 1–4", "Technovus · JEC"],
    },
    {
      id: "remote",
      icon: "square",
      label: "REMOTE",
      statement: "Remote participation is available.",
      rows: [
        {
          title: "Platform",
          text: "The online communication platform will be announced.",
          pendingKey: "remotePlatform",
          chip: "Platform",
        },
        {
          title: "Submission",
          text: "The submission process will be announced.",
          pendingKey: "submissionProcess",
          chip: "Submission",
        },
        {
          title: "Remote judging",
          text: "Remote judging arrangements will be announced.",
          pendingKey: "remoteJudging",
          chip: "Judging",
        },
      ],
      features: ["24 hours", "Hybrid format", "Teams of 1–4"],
    },
    {
      id: "solo-squad",
      icon: "plus",
      label: "SOLO OR SQUAD",
      statement:
        "Participants may compete individually or in teams of up to four members.",
      rows: [
        { title: "Solo", text: "Solo participation is allowed." },
        { title: "Squad", text: "Teams range from one to four members." },
        { title: "Duration", text: "The hackathon lasts 24 hours." },
      ],
      features: ["Eligibility", "Registration fee", "Rulebook"],
    },
  ] as ParticipationCard[],
  /** Feature chips on the solo/squad card that are still pending. */
  pendingFeatures: {
    Eligibility: "eligibility",
    "Registration fee": "registrationFee",
    Rulebook: "rulebookUrl",
  } as Record<string, keyof typeof event>,
  footnote:
    "Detailed eligibility, cross-college team rules, registration fees and the final competition rulebook have not yet been provided. The event's confirmed format does not establish identical logistics or benefits for the two participation modes.",
};

/* ------------------------------------------------------------------ */
/* History                                                             */
/* ------------------------------------------------------------------ */

export const history = {
  heading: "Four editions built the legacy. The fifth is yours to define.",
  copy: "From HackVita 1.0 in 2023 to HackVita 4.0 in 2026, every edition has added another chapter to the journey. With 150+ teams across its editions and participation and engagement spanning 25+ states across India, HackVita looks ahead to a new chapter in 2027.",
};

export const editions: Edition[] = [
  {
    id: "1-0",
    version: "1.0",
    year: "2023",
    status: "Completed",
    description: "The first chapter of HackVita.",
    detailNote: "Detailed accounts of this edition have not yet been supplied.",
    winners: [],
  },
  {
    id: "2-0",
    version: "2.0",
    year: "2024",
    status: "Completed",
    description: "The second edition, continuing the HackVita journey.",
    detailNote: "Detailed accounts of this edition have not yet been supplied.",
    winners: [],
  },
  {
    id: "3-0",
    version: "3.0",
    year: "2025",
    status: "Completed",
    description: "The third chapter in HackVita's nationwide legacy.",
    detailNote: null,
    winners: [],
  },
  {
    id: "4-0",
    version: "4.0",
    year: "2026",
    status: "Completed",
    description:
      "The fourth edition, emphasizing working prototypes, collaboration and live demonstrations.",
    detailNote: null,
    winners: [],
  },
];

export const nextEdition = {
  version: "5.0",
  year: "Early 2027",
  status: "Coming Soon" as const,
  description:
    "The upcoming 24-hour hybrid hackathon for individuals and teams of up to four.",
};

export const previousEdition = {
  title: "How HackVita 4.0 worked",
  label: "From HackVita 4.0 — historical context, not the 5.0 rulebook.",
  focus:
    "The profile described innovation, software development, AI and IoT as focus areas. Teams could solve assigned problem statements or propose original solutions, with an emphasis on creativity, technical excellence, teamwork and practical impact.",
  flow: [
    "Problem statement / idea submission.",
    "A 24-hour development sprint.",
    "Prototype demonstration and final presentation.",
    "Judging and winner announcement.",
  ],
  judging: [
    "Innovation",
    "Technical Implementation",
    "Impact",
    "Design & Usability",
    "Presentation",
  ],
  judgingNote: "No scoring weights or named judges were provided.",
  rules: [
    "Open-source tools and AI assistance were permitted.",
    "Original work was mandatory.",
    "Projects were evaluated through live demonstrations.",
    "Plagiarism resulted in disqualification.",
  ],
  demo: "Final demo: 5–7 minutes",
  fiveNote:
    "HackVita 5.0's formal tracks, judging process, submission requirements and AI-use policy remain to be announced. It has not been confirmed as an AI-only event.",
};

/* ------------------------------------------------------------------ */
/* Winners                                                             */
/* ------------------------------------------------------------------ */

export const winners = {
  heading: "Meet the teams that made their mark.",
  /** Use once records are available (doc § 7). */
  introWhenAvailable:
    "Meet the teams that made their mark—and explore the projects behind their achievements.",
  status:
    "Our past-winners archive is being prepared. Team and project details will be added as the records are compiled.",
  /** Tab order: newest first. */
  order: ["4-0", "3-0", "2-0", "1-0"],
};

/* ------------------------------------------------------------------ */
/* Communities                                                         */
/* ------------------------------------------------------------------ */

export const communities = {
  headingLines: ["THE COMMUNITIES", "BEHIND THE BUILD"],
  caption:
    "Community affiliations of previous editions. The 5.0 organizing lineup will be announced.",
  list: [
    {
      short: "GDGC",
      name: "Google Developer Group on Campus, JEC",
      description:
        "A student-run community connecting beginners and experienced developers through collaboration and peer-to-peer learning.",
    },
    {
      short: "GLUG",
      name: "GNU-Linux Users’ Group, JEC",
      description:
        "Promotes free and open-source software, GNU/Linux, computer education and interaction among technology enthusiasts.",
    },
    {
      short: "E-CELL",
      name: "Entrepreneurship-Cell, JEC",
      description:
        "Encourages innovation, leadership and startup culture through idea development, mentorship, workshops and competitions.",
    },
    {
      short: "DCODE",
      name: "DCODE, JEC",
      description:
        "JEC's coding club, promoting programming and problem-solving through coding contests, workshops and software development.",
    },
  ] satisfies Community[],
};

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */

export const faqs: Faq[] = [
  {
    q: "What is HackVita 5.0?",
    a: "The fifth edition of HackVita, a 24-hour hackathon conducted during Technovus, the technical fest of Jorhat Engineering College.",
  },
  { q: "When is it happening?", a: "Early 2027. Exact dates are to be announced." },
  {
    q: "Can I participate remotely?",
    a: "Yes. Both in-person and remote participation are available.",
  },
  {
    q: "Can I participate alone?",
    a: "Yes. Solo participation is allowed, with teams ranging from one to four members.",
  },
  { q: "How long is the hackathon?", a: "24 hours." },
  {
    q: "Where is the in-person event?",
    a: "Jorhat Engineering College. Exact venue and reporting details will be announced.",
  },
  {
    q: "Are registrations open?",
    a: "Registration details have not yet been announced.",
  },
  {
    q: "How many previous editions were held?",
    a: "Four: 1.0 in 2023, 2.0 in 2024, 3.0 in 2025 and 4.0 in 2026.",
  },
  {
    q: "What is HackVita's overall reach?",
    a: "Across previous editions, the organizer reports 150+ teams and participation and engagement from 25+ states across India.",
  },
  {
    q: "Who won previous editions?",
    a: "Previous-winner records are being compiled; names and project details have not yet been supplied.",
  },
];

/* ------------------------------------------------------------------ */
/* Contact                                                             */
/* ------------------------------------------------------------------ */

export const contact = {
  heading: "Have a question? Connect with the team behind HackVita.",
  people: [
    {
      name: "Ritu Raj Bora",
      role: "Organizing team",
      phoneDisplay: "+91 93947 13455",
      phoneE164: "+919394713455",
    },
    {
      name: "Asimangkan Boro",
      role: "Organizing team",
      phoneDisplay: "+91 97073 40741",
      phoneE164: "+919707340741",
    },
    {
      name: "Abhimanyu Saikia",
      role: "Organizing team",
      phoneDisplay: "+91 88229 16339",
      phoneE164: "+918822916339",
    },
  ] satisfies Contact[],
  pendingPhone: "Number to be provided",
  socials: [
    { id: "instagram", label: "Instagram", href: null as Pending<string> },
    { id: "linkedin", label: "LinkedIn", href: null as Pending<string> },
    { id: "whatsapp", label: "WhatsApp group", href: null as Pending<string> },
  ],
  socialsPendingTooltip: "Official links coming soon",
};

/* ------------------------------------------------------------------ */
/* Closing                                                             */
/* ------------------------------------------------------------------ */

export const closing = {
  lines: ["THE LEGACY CONTINUES.", "YOUR CHAPTER IS NEXT."],
  note: "Exact dates, challenges and registration details will be announced.",
};

export const footer = {
  ctaLines: ["BUILD THE", "NEXT CHAPTER"],
  faqLabel: "Read the FAQ",
  registerPending: "Register (soon)",
  meta: [
    "HackVita · Technovus · Jorhat Engineering College",
    "© 2027 HackVita",
    "Made by the HackVita team",
  ],
};

/* ------------------------------------------------------------------ */
/* Site chrome                                                         */
/* ------------------------------------------------------------------ */

/** Order matches the page order. `id` is the DOM id of each section. */
export const tabs = [
  { id: "index", file: "index.page", nav: null },
  { id: "about", file: "about.section", nav: "About" },
  { id: "legacy", file: "legacy.section", nav: "Legacy" },
  { id: "participate", file: "participate.section", nav: "Participate" },
  { id: "history", file: "history.section", nav: "History" },
  { id: "winners", file: "winners.section", nav: "Winners" },
  { id: "faq", file: "faq.section", nav: "FAQ" },
  { id: "contact", file: "contact.section", nav: "Contact" },
] as const;

export const media = {
  /** AI-edited dusk version of a JEC photo (landscape; cropped to cover, shown through the dither shader). */
  hero: "/hero.webp",
  /** Portrait (3:4) in the legacy grid; de-pixelates on scroll. AI-generated, fictional person. */
  builder: "/builder.webp",
  /** Describe what the photo shows; update it if you swap the image. */
  builderAlt: "A person coding on a laptop in a busy workspace, shown as a pink dithered image",
};

export const seo = {
  /**
   * Public site origin, e.g. "https://hackvita.example.org". Needed for the
   * social-share image (og.png) to resolve. `null` → share image tags omitted.
   */
  siteUrl: null as Pending<string>,
  title: "HackVita 5.0 — Coming Soon, Early 2027",
  description:
    "HackVita 5.0 is a 24-hour hybrid hackathon coming in early 2027 during Technovus, the technical fest of Jorhat Engineering College. Participate individually or in a team of up to four, in person or remotely.",
};

/* Convenience helpers ------------------------------------------------ */

export const isPending = (v: unknown) => v === null || v === undefined || v === "";
export const registrationLive = () => !isPending(event.registrationUrl);
