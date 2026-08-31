import { client } from "@/client.config";
import { getCareersPage, getPending } from "@/lib/content";
import { isLive } from "@/lib/routes";
import { pageMetadata } from "@/lib/meta";
import { PageHero } from "@/components/PageHero";
import { SectionHead } from "@/components/SectionHead";
import { Reveal } from "@/components/Reveal";
import { CtaBand } from "@/components/CtaBand";
import { CareersForm } from "@/components/CareersForm";
import { Pending } from "@/components/Pending";

const page = getCareersPage();

/*
 * Built ahead of two things it depends on: the openings list, and a
 * deployed upload Worker. While either is missing the registry keeps
 * /careers/ at live: false — nothing links here and the sitemap omits
 * it — and this carries noindex, derived from the same flag so it
 * lifts itself on switch-on.
 *
 * A live "apply here" form with no endpoint behind it would take
 * somebody's résumé and drop it. That is a worse failure than the page
 * not existing, which is why the gate is the route and not a banner.
 */
export const metadata = pageMetadata(page.meta, {
  noindex: !isLive(page.meta.path),
});

export default function CareersPage() {
  const roles = page.roles;

  const jsonLd = roles.map((r) => ({
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: r.title,
    description: r.summary,
    employmentType: r.basis,
    hiringOrganization: {
      "@type": "Organization",
      name: client.businessName,
      sameAs: client.siteUrl,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: r.location ?? client.address.city,
        addressRegion: client.address.region,
        addressCountry: "US",
      },
    },
  }));

  return (
    <>
      <PageHero path={page.meta.path} heading={page.heading} lede={page.lede} />

      {/* ── Openings, or the honest absence of them ────────────────── */}
      <section className="band bg-surface">
        <div className="section">
          {roles.length === 0 ? (
            <div className="max-w-[58ch]">
              <h2 className="text-display-2">{page.openHeading}</h2>
              <p className="mt-5 text-lg">{page.openBody}</p>
              <Pending content={getPending("careers")} className="mt-10" />
            </div>
          ) : (
            <>
              <SectionHead heading="What's open" />
              <ul className="mt-10 grid list-none gap-px border border-line bg-line p-0 md:grid-cols-2">
                {roles.map((r, i) => (
                  <Reveal as="li" key={r.slug} delay={Math.min(i, 4) * 0.05} className="bg-surface p-7">
                    <p className="u-label">
                      {r.basis}
                      {r.location && ` · ${r.location}`}
                    </p>
                    <h3 className="mt-2 font-display text-[23px] font-bold uppercase text-ink">
                      {r.title}
                    </h3>
                    <p className="mt-3 max-w-[46ch] text-[15px]">{r.summary}</p>

                    {r.does.length > 0 && (
                      <>
                        <p className="u-label mt-6">The work</p>
                        <ul className="ticks mt-2.5 list-none text-[15px]">
                          {r.does.map((d) => (
                            <li key={d}>{d}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    {r.needs.length > 0 && (
                      <>
                        <p className="u-label mt-5">What you need</p>
                        <ul className="ticks mt-2.5 list-none text-[15px]">
                          {r.needs.map((n) => (
                            <li key={n}>{n}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </Reveal>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>

      {/* ── The application ────────────────────────────────────────── */}
      <section className="band bg-surface-alt">
        <div className="section">
          <SectionHead
            heading="Send it over"
            lede="Six questions and a résumé. It should take about three minutes."
          />
          <div className="mt-10">
            <CareersForm
              questions={page.questions}
              roles={roles.map((r) => ({ slug: r.slug, title: r.title }))}
              resumeLabel={page.resumeLabel}
              resumeHint={page.resumeHint}
            />
          </div>
        </div>
      </section>

      {/* ── What happens next ──────────────────────────────────────── */}
      <section className="band bg-surface">
        <div className="section">
          <SectionHead heading={page.afterHeading} />
          <ol className="mt-10 grid list-none gap-6 p-0 md:grid-cols-3">
            {page.after.map((step, i) => (
              <Reveal
                as="li"
                key={step}
                delay={i * 0.06}
                className="border-t-[3px] border-accent pt-5"
              >
                <span className="mb-2.5 block font-mono text-[13px] tracking-[0.08em] text-brand-soft">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-[15px]">{step}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <CtaBand cta={page.cta} />

      {jsonLd.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </>
  );
}
