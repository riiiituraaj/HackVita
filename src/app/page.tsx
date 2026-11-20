import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Statements } from "@/components/sections/Statements";
import { Legacy } from "@/components/sections/Legacy";
import { Participate } from "@/components/sections/Participate";
import { History } from "@/components/sections/History";
import { Winners } from "@/components/sections/Winners";
import { Communities } from "@/components/sections/Communities";
import { Faq } from "@/components/sections/Faq";
import { Contact } from "@/components/sections/Contact";
import { PreFooter } from "@/components/sections/PreFooter";
import { Footer } from "@/components/sections/Footer";

export default function Page() {
  return (
    <>
      <main id="main" className="site-main" tabIndex={-1}>
        <Hero />
        <About />
        <Statements />
        <Legacy />
        <Participate />
        <History />
        <Winners />
        <Communities />
        <Faq />
        <Contact />
        <PreFooter />
      </main>
      <Footer />
    </>
  );
}
