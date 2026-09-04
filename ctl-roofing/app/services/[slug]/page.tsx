import { notFound } from "next/navigation";
import { client } from "@/client.config";
import { getPending, getService, getServiceSlugs } from "@/lib/content";
import { pageMetadata } from "@/lib/meta";
import type { GalleryCategory, ServiceSection } from "@/content/types";
import { PageHero } from "@/components/PageHero";
import { SectionHead } from "@/components/SectionHead";
import { Reveal } from "@/components/Reveal";
import { FaqList } from "@/components/FaqList";
import { CtaBand } from "@/components/CtaBand";
import { MetalSpec } from "@/components/MetalSpec";
import { Pending } from "@/components/Pending";
import { OtherServices } from "@/components/OtherServices";
import { WorkStrip } from "@/components/WorkStrip";
import { MoreLink } from "@/components/MoreLink";

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

  // The first photographed section carries the link into the gallery.
  const firstPhoto = service.sections.findIndex((s) => s.photo);

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
        <SectionBlock
          key={section.heading}
          section={section}
          index={i}
          galleryCategory={
            i === firstPhoto ? service.galleryCategory : undefined
          }
        />
      ))}

      {/* Roofing carries the metal band the home page points at. */}
      {service.slug === "roofing" && <MetalSpec />}

      {/* The service’s own work, four photographs of it, and the way
          through to the rest of that category in the gallery. Renders
          nothing for a service with no photographs — see below. */}
      {service.galleryCategory && (
        <WorkStrip category={service.galleryCategory} ground="bg-surface-alt" />
      )}

      {/* Commercial has no commercial-job photography yet, and a
          residential photo standing in for one would be a lie — so it
          gets no work strip. What it gets instead is a plain statement
          of what the gallery does hold, which is a way onward without
          pretending the photos are of something they aren’t. */}
      {service.slug === "commercial" && (
        <section className="band bg-surface-alt">
          <div className="section">
            <SectionHead heading="What we have photographed" />
            <div className="mt-8 max-w-[68ch] space-y-4">
              <p>
                We haven’t photographed a commercial job yet. The gallery is
                residential work — shingle and standing seam roofs, tear-offs,
                patio covers and interior remodels — so it shows the detailing
                and the finish rather than a building like yours.
              </p>
            </div>
            <p className="mt-8">
              <MoreLink href="/gallery/">See the work we have shot</MoreLink>
            </p>
          </div>
        </section>
      )}

      {/* A standing reminder to us while that gap is open. Compiled out
          of the built site. */}
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
 *
 * A section with a photo sets it beside the reading matter — against
 * the prose where there is prose, against the list where there isn’t —
 * and the side alternates down the page, so three sections in a row
 * read as a rhythm rather than as text with pictures stapled down one
 * edge. Sections without a photo are laid out exactly as before.
 */
function SectionBlock({
  section,
  index,
  galleryCategory,
}: {
  section: ServiceSection;
  index: number;
  /**
   * Set on the first photographed section only, so the page carries a
   * way into the gallery above the fold as well as in the work strip
   * near the bottom — twice on a page is a path, five times is a nag.
   */
  galleryCategory?: GalleryCategory;
}) {
  const ground = index % 2 === 0 ? "bg-surface" : "bg-surface-alt";
  const hasColumns = (section.columns?.length ?? 0) > 0;
  const { photo } = section;
  // Odd sections put the photo on the left, so it lands under the
  // opposite side of the heading from the section above it.
  const photoLeft = index % 2 === 1;
  // A spec sheet squeezed into half the row is two cramped columns, so
  // it stacks whenever the photo is sitting next to it instead.
  const columnsAreBeside = Boolean(photo) && !section.body;

  const columns = hasColumns && (
    <Reveal delay={0.06}>
      <div
        className={`grid gap-8 ${
          section.columns!.length > 1 && !columnsAreBeside
            ? "sm:grid-cols-2"
            : ""
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
  );

  const body = section.body && (
    <Reveal delay={hasColumns ? 0.1 : 0.06}>
      {/* The measure is already held by the grid column when a photo
          sits beside the prose, so the 68ch cap would only narrow it
          twice over. */}
      <div className={`space-y-4 ${photo ? "" : "max-w-[68ch]"}`}>
        {section.body.map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
      </div>
    </Reveal>
  );

  const figure = photo && (
    <Reveal as="figure" delay={0.12} className="m-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.src}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        loading="lazy"
        className="w-full rounded border border-line object-cover"
      />
      {(photo.caption || galleryCategory) && (
        <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          {photo.caption && <span className="u-label">{photo.caption}</span>}
          {galleryCategory && (
            <MoreLink href={`/gallery/#${galleryCategory}`} className="text-sm">
              More like this
            </MoreLink>
          )}
        </figcaption>
      )}
    </Reveal>
  );

  // With no photo, the section keeps its original single-column shape.
  if (!photo) {
    return (
      <section className={`band ${ground}`}>
        <div className="section">
          <SectionHead heading={section.heading} />
          {hasColumns && <div className="mt-10">{columns}</div>}
          {body && <div className={hasColumns ? "mt-8" : "mt-10"}>{body}</div>}
        </div>
      </section>
    );
  }

  // Prose wins the photo when there is prose; otherwise the list does,
  // and a spec-sheet section keeps its full width above either way.
  const beside = body ?? columns;
  const above = body ? columns : null;

  return (
    <section className={`band ${ground}`}>
      <div className="section">
        <SectionHead heading={section.heading} />
        {above && <div className="mt-10">{above}</div>}
        <div
          className={`grid items-start gap-8 md:grid-cols-2 md:gap-12 ${
            above ? "mt-8" : "mt-10"
          }`}
        >
          <div className={photoLeft ? "md:order-2" : ""}>{beside}</div>
          <div className={photoLeft ? "md:order-1" : ""}>{figure}</div>
        </div>
      </div>
    </section>
  );
}
