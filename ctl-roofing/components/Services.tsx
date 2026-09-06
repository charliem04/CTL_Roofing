import { getServicesHub } from "@/lib/content";
import { stagger, TONES } from "@/lib/motion";
import { BandTransition } from "./BandTransition";
import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";
import { ServiceCards } from "./ServiceCards";
import { MoreLink } from "./MoreLink";

/**
 * The home page’s services band. The grid itself lives in
 * <ServiceCards> and is shared with the services hub; this component is
 * just the framing and the way out of it.
 */
export function Services() {
  const hub = getServicesHub();

  // The pale ground arrives as you scroll into the band rather than as
  // a hard edge under the storm shelf. Both tones are in the same
  // family, so the copy holds its contrast at every point of the shift
  // — see the note in BandTransition on why this is not the
  // light-to-deep crossfade it might have been.
  return (
    <BandTransition id="services" tones={TONES.light} className="band">
      <div className="section">
        <SectionHead heading={hub.heading} lede={hub.lede} />
        <ServiceCards className="mt-10" />
        <Reveal delay={stagger.loose}>
          <p className="mt-10">
            <MoreLink href="/services/">See everything we do</MoreLink>
          </p>
        </Reveal>
      </div>
    </BandTransition>
  );
}
