/**
 * Decorative pseudo-code typed by the console panel. Section blocks restate
 * facts from the content file only — no new claims.
 */

export const INTRO: string[] = [
  "hello(you) {",
  "  this.is",
  "    hackvita.v5();",
  "  print('Welcome, builder');",
  "}",
  "",
  "we.are {",
  "  builders_of(technovus);",
  "}",
  "",
  "// IDEATING",
  "while (clock.hours < 24) {",
  "  idea.prototype();",
  "  team.ship();",
  "}",
];

export const SECTION_BLOCKS: Record<string, string[]> = {
  index: [
    "// index.page",
    'hackvita.status = "coming_soon";',
    'hackvita.when = "early_2027";',
    "hackvita.dates = null; // to be announced",
  ],
  about: [
    "// about.section",
    'const fest = "technovus";',
    'const host = "jorhat_engineering_college";',
    'communities.previous = ["GDGC", "GLUG", "E-CELL", "DCODE"];',
  ],
  statements: ["// statements", "clock.set(24);", "build(solo || together);"],
  legacy: [
    "// legacy.section",
    "legacy.editions = 4;",
    "legacy.since = 2023;",
    'legacy.teams = "150+";  // organizer-reported',
    'legacy.states = "25+";  // across previous editions',
    "legacy.validate();",
  ],
  participate: [
    "// participate.section",
    'mode = ["in_person", "remote"];',
    "team.size = range(1, 4);",
    "solo.allowed = true;",
    "venue = null; // TBA",
  ],
  history: [
    "// history.section",
    'timeline = ["1.0", "2.0", "3.0", "4.0"];',
    'timeline.next = "5.0"; // early 2027',
    "rules_4_0.scope = 'historical';",
  ],
  winners: [
    "// winners.section",
    'archive.status = "compiling";',
    "archive.records = []; // awaiting records",
  ],
  communities: ["// communities", "community.list(); // affiliations, not sponsors"],
  faq: ["// faq.section", "faq.load(10);"],
  contact: [
    "// contact.section",
    "contacts.length = 3;",
    "socials = null; // official links coming soon",
  ],
  prefooter: ["hackvita.next_chapter();"],
  footer: ["// EOF", 'build("next_chapter");'],
};

/** Idle heartbeat lines, cycled while nothing else is queued. */
export const IDLE: string[][] = [
  ["clock.tick(); // 24:00:00"],
  ["registration.url = null; // opens soon", "registration.validate();"],
  ["team.sync();", "commit.push();"],
  ["idea.prototype();"],
  ["demo.validate();"],
];

const KEYWORDS =
  /^(while|if|else|return|const|let|var|this|new|class|def|true|false|null|for|in|of|await|async|import|from|range|Infinity)$/;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Minimal syntax highlighter → HTML. Handles partially typed strings. */
export function highlight(line: string): string {
  const re =
    /(\/\/.*$)|("(?:[^"\\]|\\.)*"?|'(?:[^'\\]|\\.)*'?)|([A-Za-z_$][\w$]*)(?=\s*\()|([A-Za-z_$][\w$]*)|(\b\d+(?:\.\d+)?\b)/g;
  let out = "";
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    out += esc(line.slice(last, m.index));
    const [tok, com, str, fn, word, num] = m;
    if (com) out += `<span class="tk-com">${esc(tok)}</span>`;
    else if (str) out += `<span class="tk-str">${esc(tok)}</span>`;
    else if (fn) out += KEYWORDS.test(fn) ? `<span class="tk-kw">${esc(fn)}</span>` : `<span class="tk-fn">${esc(fn)}</span>`;
    else if (word) out += KEYWORDS.test(word) ? `<span class="tk-kw">${esc(word)}</span>` : esc(word);
    else if (num) out += `<span class="tk-num">${esc(num)}</span>`;
    last = m.index + tok.length;
  }
  out += esc(line.slice(last));
  return out;
}

export const isWarnLine = (l: string) => /validate\(\)|= null;/.test(l);
