import type { Metadata, Viewport } from "next";
import { Doto, Inter_Tight, JetBrains_Mono, Silkscreen } from "next/font/google";
import { seo } from "@/content/hackvita";
import { MotionProvider, motionBootScript } from "@/lib/motion";
import { Preloader } from "@/components/chrome/Preloader";
import { SmoothScroll } from "@/components/chrome/SmoothScroll";
import { EditorTabs } from "@/components/chrome/EditorTabs";
import { ConsolePanel } from "@/components/chrome/ConsolePanel";
import { NavPill } from "@/components/chrome/NavPill";
import { MotionToggle } from "@/components/chrome/MotionToggle";
import { Grain } from "@/components/chrome/Grain";
import { GlitchOverlay } from "@/components/chrome/GlitchOverlay";
import { CursorSystem } from "@/components/fx/CursorSystem";
import { Interactions } from "@/components/fx/Interactions";
import "./globals.css";
import "../styles/chrome.css";
import "../styles/sections.css";

const sans = Inter_Tight({ subsets: ["latin"], weight: ["300", "400"], variable: "--font-inter-tight", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jetbrains", display: "swap" });
const pixel = Silkscreen({ subsets: ["latin"], weight: ["400"], variable: "--font-silkscreen", display: "swap" });
const dot = Doto({ subsets: ["latin"], weight: ["700", "900"], variable: "--font-doto", display: "swap" });

const ogImages = seo.siteUrl
  ? [{ url: "/og.png", width: 1200, height: 630, alt: "HackVita 5.0 — Coming Soon, Early 2027" }]
  : undefined;

export const metadata: Metadata = {
  metadataBase: seo.siteUrl ? new URL(seo.siteUrl) : undefined,
  title: seo.title,
  description: seo.description,
  openGraph: { title: seo.title, description: seo.description, images: ogImages, type: "website" },
  twitter: {
    card: ogImages ? "summary_large_image" : "summary",
    title: seo.title,
    description: seo.description,
    images: ogImages ? ["/og.png"] : undefined,
  },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#050006",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} ${pixel.variable} ${dot.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionBootScript }} />
        <noscript>
          <style>{`.preloader{display:none!important}`}</style>
        </noscript>
      </head>
      <body>
        <MotionProvider>
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          <Preloader />
          <SmoothScroll />
          <Interactions />
          <EditorTabs />
          <ConsolePanel />
          {children}
          <NavPill />
          <MotionToggle />
          <CursorSystem />
          <GlitchOverlay />
          <Grain />
        </MotionProvider>
      </body>
    </html>
  );
}
