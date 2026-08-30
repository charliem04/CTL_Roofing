import { getServicesHub } from "@/lib/content";
import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";
import { ServiceCards } from "./ServiceCards";
import { MoreLink } from "./MoreLink";

/**
 * The home page's services band. The grid itself lives in
 * <ServiceCards> and is shared with the services hub; this component is
 * just the framing and the way out of it.
 */
export function Services() {
  const hub = getServicesHub();

  return (
    <section id="services" className="band bg-surface-alt">
      <div className="section">
        <SectionHead heading={hub.heading} lede={hub.lede} />
        <ServiceCards className="mt-10" />
        <Reveal delay={0.1}>
          <p className="mt-10">
            <MoreLink href="/services/">See everything we do</MoreLink>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
