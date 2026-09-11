import { Hero } from "@/components/Hero";
import { StormStrip } from "@/components/StormStrip";
import { Services } from "@/components/Services";
import { MetalSpec } from "@/components/MetalSpec";
import { Process } from "@/components/Process";
import { Brands } from "@/components/Brands";
import { About } from "@/components/About";
import { Testimonials } from "@/components/Testimonials";
import { Gallery } from "@/components/Gallery";
import { Contact } from "@/components/Contact";
import { CtaBand } from "@/components/CtaBand";
import { client } from "@/client.config";

/**
 * Band order is the sales conversation in order: what CTL does, the
 * product that needs the longest explanation, how a job runs, what it’s
 * built from, who’s doing it, proof, and only then the ask.
 *
 * Every band carries its own way onward — a service card goes to that
 * service, the storm strip to the claims page — so a visitor never has
 * to go back up to the nav to follow the thread they are already on.
 *
 * Testimonials are config-gated and render when real reviews are
 * added. The CTAs go to /contact/ rather than to an outside scheduler:
 * that page carries the phone, the storm line, the request form and —
 * when client.bookingUrl is set — the calendar, so it answers whichever
 * way in the visitor actually wanted.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <StormStrip />
      <Services />
      <MetalSpec moreHref="/services/roofing/#metal" />
      <Process />
      <Brands />
      <About />
      <Testimonials />
      <Gallery />
      <Contact />
      <CtaBand
        cta={{
          heading: client.copy.closingHeading,
          body: client.copy.closingBody,
        }}
      />
    </>
  );
}
