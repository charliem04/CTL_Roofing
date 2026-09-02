import type { ReactNode } from "react";
import { client } from "@/client.config";
import type { CtaCopy } from "@/content/types";
import { btn } from "./Button";
import { Reveal } from "./Reveal";
import { MoreLink } from "./MoreLink";

/**
 * One primary action sitewide: the free roof and property assessment.
 * Every page closes on this band; only the words change, so the page
 * argues for the assessment in its own terms — the gallery says "want
 * this on your house", financing says "see what you qualify for" —
 * while the button stays the same button everywhere.
 *
 * WHICH NUMBER IT DIALS. The office, unless the page says otherwise.
 * A generic "call us" button belongs on the line staffed to answer
 * generic calls; the storm line is answered around the clock by
 * whoever is on call for emergencies, and sending a financing question
 * there at 10pm costs CTL a person's evening and trains people to use
 * the emergency line for non-emergencies.
 *
 * `line="storm"` is for pages where the reader plausibly has water
 * coming in right now. Either way the button names the line it dials,
 * so nobody reaches an emergency number without knowing it.
 *
 * `actions` replaces the buttons entirely, for a page whose audience is
 * not a customer at all — /careers/ is the only one.
 */
export function CtaBand({
  cta,
  line = "office",
  actions,
}: {
  cta: CtaCopy;
  line?: "office" | "storm";
  actions?: ReactNode;
}) {
  const storm = line === "storm";
  const href = storm ? client.stormPhoneHref : client.phoneHref;
  const label = storm ? "Storm line" : "Call the office";
  const number = storm ? client.stormPhone : client.phone;
  return (
    <section className="on-deep band bg-brand text-ink-invert">
      <div className="section flex flex-wrap items-end justify-between gap-x-[42px] gap-y-8">
        <Reveal className="max-w-[46ch]">
          <h2 className="max-w-[16ch] text-display-2 text-ink-invert">
            {cta.heading}
          </h2>
          <p className="mt-4 text-ink-invert/85">{cta.body}</p>
        </Reveal>
        <Reveal delay={0.08} className="flex flex-wrap gap-2.5">
          {actions ?? (
            <>
              <a href={client.bookingUrl || "/contact/"} className={btn("gold")}>
                {client.copy.heroCta}
              </a>
              <a href={`tel:${href}`} className={btn("lineDeep")}>
                {label} {number}
              </a>
              <MoreLink
                href="/contact/"
                tone="deep"
                className="ml-1 self-center"
              >
                Or send us the details
              </MoreLink>
            </>
          )}
        </Reveal>
      </div>
    </section>
  );
}
