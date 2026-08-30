import { client } from "@/client.config";
import { getGallery } from "@/lib/content";
import { pageMetadata } from "@/lib/meta";
import { PageHero } from "@/components/PageHero";
import { GalleryBrowser } from "@/components/GalleryBrowser";
import { CtaBand } from "@/components/CtaBand";

const meta = {
  title: "Our Work — Roofing, Metal, Patios & Remodels in Acadiana",
  description:
    "Photographs of CTL Pro Construction's own jobs across Acadiana: shingle and standing seam metal roofs, tear-offs, storm response, patio covers and interior remodels.",
  path: "/gallery/",
};

export const metadata = pageMetadata(meta);

export default function GalleryPage() {
  const shots = getGallery();

  // ImageGallery structured data, generated from the same photographs
  // the page renders.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: `${client.businessName} — recent work`,
    description: meta.description,
    url: `${client.siteUrl}${meta.path}`,
    image: shots.slice(0, 12).map((s) => `${client.siteUrl}${s.src}`),
  };

  return (
    <>
      <PageHero
        path={meta.path}
        heading="Recent work"
        lede="Every photograph here is a CTL job. Roofs, patios, interiors and full renovations across Acadiana and South Louisiana — filter by the kind of work you are weighing up."
        photo={shots[0]}
      />

      <section className="band bg-surface">
        <div className="section">
          <GalleryBrowser />
        </div>
      </section>

      <CtaBand
        cta={{
          heading: "Want this on your house?",
          body: "Start with the free roof and property assessment. We'll look at what you have, tell you what it needs, and put a written scope behind it.",
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
