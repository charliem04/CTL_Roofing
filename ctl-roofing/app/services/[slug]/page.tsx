import { notFound } from "next/navigation";
import { client } from "@/client.config";
import { getPending, getService, getServiceSlugs } from "@/lib/content";
import { pageMetadata } from "@/lib/meta";
import type { ServiceSection } from "@/content/types";
import { PageHero } from "@/components/PageHero";
import { SectionHead } from "@/components/SectionHead";
import { Reveal } from "@/components/Reveal";
import { FaqList } from "@/components/FaqList";
import { CtaBand } from "@/components/CtaBand";
import { MetalSpec } from "@/components/MetalSpec";
import { Pending } from "@/components/Pending";
import { OtherServices } from "@/components/OtherServices";

type Params = { params: { slug: string } };

export function generateStaticParams() {
  return getServiceSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: Params) {
  const service = getService(params.slug);
  return service ? pageMetadata(service.meta) : {};
}

export default function ServiceDetailPage({ params }: Params) {
  const service = getService(params.slug);
  if (!service) notFound();

  // Service structured data, generated from the same content the page
  // renders — provider, area, and what is actually offered.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.heading,
    description: service.meta.description,
    serviceType: service.navLabel,
    url: `${client.siteUrl}${service.meta.path}`,
    provider: {
      "@type": "RoofingContractor",
      name: client.businessName,
      telephone: client.phoneHref,
      url: client.siteUrl,
    },
    areaServed: client.about.towns.map((town) => ({
      "@type": "City",
      name: `${town}, ${client.address.region}`,
    })),
  };

  return (
    <>
      <PageHero
        path={service.meta.path}
        heading={service.heading}
        lede={service.lede}
        photo={service.photo}
      />

      {service.sections.map((section, i) => (
        <SectionBlock key={section.heading} section={section} index={i} />
      ))}

      {/* Roofing carries the metal band the home page points at. */}
      {service.slug === "roofing" && <MetalSpec />}

      {/* Commercial has no commercial-job photography yet, and a
          residential photo standing in for one would be a lie. The page
          reads fine without a gallery strip, so it simply doesn’t have
          one — this is only a reminder to us while the gap is open, and
          the whole section is compiled out of the built site. */}
      {service.slug === "commercial" &&
        process.env.NODE_ENV === "development" && (
          <section className="band bg-surface">
            <div className="section">
              <Pending content={getPending("commercialProject")} />
            </div>
          </section>
        )}

      <FaqList
        faqs={service.faqs}
        heading={`${service.navLabel} — questions people ask`}
      />

      <OtherServices currentSlug={service.slug} />

      {/* Emergency & inspections is the one service page whose reader
          may have water coming in right now; the rest are planning a
          job and belong on the office line. */}
      <CtaBand
        cta={service.cta}
        line={service.slug === "emergency-inspections" ? "storm" : "office"}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}

/**
 * A content section. Alternating grounds keep a long page from reading
 * as one undifferentiated column; list sections and prose sections get
 * different measures because they are read differently.
 */
function SectionBlock({
  section,
  index,
}: {
  section: ServiceSection;
  index: number;
}) {
  const ground = index % 2 === 0 ? "bg-surface" : "bg-surface-alt";
  const hasColumns = (section.columns?.length ?? 0) > 0;

  return (
    <section className={`band ${ground}`}>
      <div className="section">
        <SectionHead heading={section.heading} />

        {hasColumns && (
          <Reveal delay={0.06}>
            <div
              className={`mt-10 grid gap-8 ${
                section.columns!.length > 1 ? "sm:grid-cols-2" : ""
              }`}
            >
              {section.columns!.map((col, i) => (
                <div key={col.label ?? i}>
                  {col.label && <p className="u-label mb-3">{col.label}</p>}
                  <ul className="ticks m-0 list-none space-y-2.5 p-0">
                    {col.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Reveal>
        )}

        {section.body && (
          <Reveal delay={hasColumns ? 0.1 : 0.06}>
            <div className="mt-8 max-w-[68ch] space-y-4">
              {section.body.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
