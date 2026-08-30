import { UtilityBar } from "@/components/UtilityBar";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { StormStrip } from "@/components/StormStrip";
import { Services } from "@/components/Services";
import { MetalRoofing } from "@/components/MetalRoofing";
import { Process } from "@/components/Process";
import { Brands } from "@/components/Brands";
import { About } from "@/components/About";
import { Testimonials } from "@/components/Testimonials";
import { Gallery } from "@/components/Gallery";
import { Booking } from "@/components/Booking";
import { Contact } from "@/components/Contact";
import { ClosingCta } from "@/components/ClosingCta";
import { Footer } from "@/components/Footer";
import { CookieConsent } from "@/components/CookieConsent";
import { StickyCTA } from "@/components/StickyCTA";
import { Analytics } from "@/components/Analytics";

/**
 * Band order is the sales conversation in order: what CTL does, the
 * product that needs the longest explanation, how a job runs, what it's
 * built from, who's doing it, proof, and only then the ask.
 *
 * Testimonials and Booking are config-gated — testimonials render when
 * real reviews are added to client.config.ts, and Booking renders a
 * Cal.com embed if `calLink` is ever set instead of the Calendly link
 * the CTAs currently use. Both render nothing today.
 */
export default function Home() {
  return (
    <>
      <UtilityBar />
      <Nav />
      <main className="pb-14 lg:pb-0">
        <Hero />
        <StormStrip />
        <Services />
        <MetalRoofing />
        <Process />
        <Brands />
        <About />
        <Testimonials />
        <Gallery />
        <Booking />
        <Contact />
        <ClosingCta />
      </main>
      <Footer />
      <StickyCTA />
      <CookieConsent />
      <Analytics />
    </>
  );
}
