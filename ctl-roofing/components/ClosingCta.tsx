import { client } from "@/client.config";
import { btn } from "./Button";
import { Reveal } from "./Reveal";

/**
 * The last band names the thing that actually gets people to call — a
 * stain on the ceiling — instead of asking again for a click.
 */
export function ClosingCta() {
  return (
    <section className="on-deep band bg-brand text-ink-invert">
      <div className="section flex flex-wrap items-end justify-between gap-x-[42px] gap-y-8">
        <Reveal className="max-w-[46ch]">
          <h2 className="max-w-[16ch] text-display-2 text-ink-invert">
            {client.copy.closingHeading}
          </h2>
          <p className="mt-4 text-ink-invert/85">{client.copy.closingBody}</p>
        </Reveal>
        <Reveal delay={0.08} className="flex flex-wrap gap-2.5">
          <a href={client.bookingUrl || "#contact"} className={btn("gold")}>
            {client.copy.heroCta}
          </a>
          <a href={`tel:${client.stormPhoneHref}`} className={btn("lineDeep")}>
            Call {client.stormPhone}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
