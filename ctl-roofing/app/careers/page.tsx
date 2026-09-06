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
import { MoreLink } from "@/components/MoreLink";
import { btn } from "@/components/Button";
import { cascade } from "@/lib/motion";

const page = getCareersPage();

/*
 * Built ahead of two things it depends on: the openings list, and a
 * deployed upload Worker. While either is missing the registry keeps
 * /careers/ at live: false — nothing links here and the sitemap omits
 * it — and this carries noindex, derived from the same flag so it
 * lifts itself on switch-on.
 *
 * A live "apply here" form with no endpoint behind it would take
 * somebody’s résumé and drop it. That is a worse failure than the page
 * not existing, which is why the gate is the route and not a banner.
 */
export const metadata = pageMetadata(page.meta, {
  noindex: !isLive(page.meta.path),
});

export default function CareersPage() {
  const roles = page.roles;

  /**
   * JobPosting structured data only when these are real, currently-open
   * vacancies. Google's JobPosting guidelines require a specific open
   * role behind every posting; emitting it for "the kinds of work we
   * hire for" is a policy violation that risks a manual action, and it
   * puts listings into Google Jobs that nobody can apply to. The list
   * still renders either way — this gates the machine-readable claim,
   * not the page.
   */
  const jsonLd = (page.postingsAreLive ? roles : []).map((r) => ({
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
              <SectionHead
                heading={page.postingsAreLive ? "What’s open" : page.rolesHeading}
                lede={page.postingsAreLive ? undefined : page.rolesLede}
              />
              <ul className="mt-10 grid list-none gap-px border border-line bg-line p-0 md:grid-cols-2">
                {roles.map((r, i) => (
                  <Reveal as="li" key={r.slug} delay={cascade(i)} className="bg-surface p-7">
                    {/* Omitted rather than guessed — see the note on
                        `basis` in content/careers.ts. */}
                    {(r.basis || r.location) && (
                      <p className="u-label">
                        {r.basis}
                        {r.basis && r.location && " · "}
                        {r.location}
                      </p>
                    )}
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
                delay={cascade(i)}
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

      {/* The one page that does not close on the assessment booking.
          Somebody applying for a job has no use for "schedule a free
          assessment", and wants an email address rather than the contact
          form. The office number matches the band's default; the rest of
          the buttons do not, which is why this passes its own. */}
      <CtaBand
        cta={page.cta}
        actions={
          <>
            <a href={`tel:${client.phoneHref}`} className={btn("gold")}>
              Call the office {client.phone}
            </a>
            <MoreLink
              href={`mailto:${client.email}`}
              tone="deep"
              className="ml-1 self-center"
            >
              Or email the office
            </MoreLink>
          </>
        }
      />

      {jsonLd.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </>
  );
}
