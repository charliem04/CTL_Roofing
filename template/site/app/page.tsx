import { Gallery } from "@/components/Gallery";
import { Contact } from "@/components/Contact";
import { CtaBand } from "@/components/CtaBand";
import { client } from "@/client.config";

/**
 * ════════════════════════════════════════════════════════════════════
 *  HOME — SCAFFOLDING. This is the one page you are expected to rewrite
 *  completely per client, and it is deliberately thin.
 *
 *  ── HOW TO ORDER THE BANDS ──────────────────────────────────────────
 *
 *  Band order is the sales conversation in order: what the business
 *  does, the product that needs the longest explanation, how a job
 *  runs, what it's built from, who's doing it, proof, and only then the
 *  ask. The site this template was extracted from ran nine bands in
 *  that order and converted on it.
 *
 *  Every band should carry its own way onward — a service card goes to
 *  that service — so a visitor never has to go back up to the nav to
 *  follow the thread they are already on.
 *
 *  The CTAs go to /contact/ rather than out to a calendar: that page
 *  carries the phone, the request form and the booking embed, so it
 *  answers whichever way in the visitor actually wanted rather than
 *  assuming they had already decided. See CTA_HREF in lib/routes.ts.
 *
 *  Wrap each band's contents in <Reveal> / <RevealText> so it inherits
 *  the motion system in lib/motion.ts rather than inventing timings.
 * ════════════════════════════════════════════════════════════════════
 */
export default function Home() {
  return (
    <>
      {/* TODO(client): Hero, and the bands that make the argument. */}
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
