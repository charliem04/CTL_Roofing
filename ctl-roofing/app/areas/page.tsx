import { client } from "@/client.config";
import { getAreas, getTownsByParish } from "@/lib/content";
import { pageMetadata } from "@/lib/meta";
import { PageHero } from "@/components/PageHero";
import { SectionHead } from "@/components/SectionHead";
import { Reveal } from "@/components/Reveal";
import { CtaBand } from "@/components/CtaBand";
import { MoreLink } from "@/components/MoreLink";
import { btn } from "@/components/Button";

const areas = getAreas();

export const metadata = pageMetadata(areas.meta);

export default function AreasPage() {
  const groups = getTownsByParish();
  const total = groups.reduce((n, g) => n + g.towns.length, 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RoofingContractor",
    name: client.businessName,
    url: `${client.siteUrl}${areas.meta.path}`,
    telephone: client.phoneHref,
    address: {
      "@type": "PostalAddress",
      streetAddress: client.address.street,
      addressLocality: client.address.city,
      addressRegion: client.address.region,
      postalCode: client.address.postalCode,
    },
    areaServed: groups.flatMap((g) =>
      g.towns.map((t) => ({
        "@type": "City",
        name: `${t.name}, ${client.address.region}`,
        containedInPlace: { "@type": "AdministrativeArea", name: g.parish },
      }))
    ),
  };

  return (
    <>
      <PageHero
        path={areas.meta.path}
        heading={areas.heading}
        lede={areas.lede}
        photo={areas.photo}
      />

      {/* ── The towns, grouped by parish ───────────────────────────── */}
      <section className="band bg-surface">
        <div className="section">
          <SectionHead
            heading={`${total} towns, six parishes`}
            lede="Grouped by parish, which is how people here describe where they live."
          />

          <div className="mt-10 grid gap-px border border-line bg-line md:grid-cols-2">
            {groups.map((g) => (
              <div key={g.parish} className="bg-surface p-6">
                <h3 className="text-display-3">{g.parish}</h3>
                <p className="u-label mt-2">
                  {g.towns.length} {g.towns.length === 1 ? "town" : "towns"}
                </p>
                <ul className="mt-4 flex list-none flex-wrap gap-2 p-0">
                  {g.towns.map((t) => (
                    <li
                      key={t.slug}
                      className="rounded border border-line px-2.5 py-1.5 font-mono text-[12px] uppercase tracking-[0.06em] text-ink"
                    >
                      {t.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why local is more than an address ──────────────────────── */}
      <section className="on-deep band seam-field relative overflow-hidden bg-surface-deep text-ink-invert-soft">
        <div className="section relative">
          <Reveal>
            <h2 className="text-display-2 text-ink-invert">
              What being local actually buys you
            </h2>
          </Reveal>
          <dl className="mt-10 grid gap-x-10 md:grid-cols-3">
            {areas.points.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.06}>
                <div className="border-t border-line-dark/20 py-5">
                  <dt className="font-display text-[21px] font-bold uppercase text-ink-invert">
                    {p.title}
                  </dt>
                  <dd className="m-0 mt-2.5 text-base">{p.body}</dd>
                </div>
              </Reveal>
            ))}
          </dl>

          <Reveal delay={0.2}>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <a href={`tel:${client.stormPhoneHref}`} className={btn("gold")}>
                Storm line {client.stormPhone}
              </a>
              <MoreLink href="/storm-damage/" tone="deep">
                How storm claims work
              </MoreLink>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Edge of the map ────────────────────────────────────────── */}
      <section className="band bg-surface-alt">
        <div className="section">
          <Reveal>
            <div className="max-w-[68ch]">
              <h2 className="text-display-2">{areas.outside.heading}</h2>
              <p className="mt-4 text-lg">{areas.outside.body}</p>
              <p className="mt-6">
                <MoreLink href="/gallery/">
                  See work from around Acadiana
                </MoreLink>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <CtaBand cta={areas.cta} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
