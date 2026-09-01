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
 * `actions` is the exception, and it exists for exactly one page. On
 * /careers/ the reader is applying for a job, so closing on "schedule a
 * free assessment" and the storm line is aimed at the wrong person —
 * and the copy directly above it says to call the office. A page whose
 * audience is not a customer passes its own buttons.
 */
export function CtaBand({
  cta,
  actions,
}: {
  cta: CtaCopy;
  actions?: ReactNode;
}) {
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
              <a
                href={`tel:${client.stormPhoneHref}`}
                className={btn("lineDeep")}
              >
                Call {client.stormPhone}
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
