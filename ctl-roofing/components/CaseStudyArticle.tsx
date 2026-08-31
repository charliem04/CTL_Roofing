import { client } from "@/client.config";
import { getCaseStudiesHub } from "@/lib/content";
import type { CaseStudy } from "@/content/types";
import { PageHero } from "./PageHero";
import { SectionHead } from "./SectionHead";
import { Reveal } from "./Reveal";
import { CtaBand } from "./CtaBand";
import { MoreLink } from "./MoreLink";
import { BeforeAfter } from "./BeforeAfter";

/**
 * ════════════════════════════════════════════════════════════════════
 *  THE CASE STUDY TEMPLATE — built, typechecked, not yet routed.
 *
 *  Why it lives here rather than in app/case-studies/[slug]/page.tsx:
 *  `output: "export"` refuses a dynamic route whose
 *  generateStaticParams() returns an empty array — it reads "no params"
 *  as "no generateStaticParams" and fails the build. So while
 *  content/caseStudies.ts is empty there can be no detail route at all.
 *
 *  Keeping the template as a component means it is compiled and
 *  typechecked on every build instead of rotting in a branch.
 *
 *  ── TO SWITCH IT ON, once the first study is in content/caseStudies.ts
 *
 *  1. Create app/case-studies/[slug]/page.tsx containing exactly:
 *
 *       import { notFound } from "next/navigation";
 *       import { getCaseStudy, getCaseStudySlugs } from "@/lib/content";
 *       import { isLive } from "@/lib/routes";
 *       import { pageMetadata } from "@/lib/meta";
 *       import { CaseStudyArticle } from "@/components/CaseStudyArticle";
 *
 *       type Params = { params: { slug: string } };
 *
 *       export function generateStaticParams() {
 *         return getCaseStudySlugs().map((slug) => ({ slug }));
 *       }
 *
 *       export function generateMetadata({ params }: Params) {
 *         const study = getCaseStudy(params.slug);
 *         if (!study) return {};
 *         return pageMetadata(
 *           {
 *             title: `${study.title} — ${study.town}`,
 *             description: study.problem,
 *             path: `/case-studies/${study.slug}/`,
 *           },
 *           { noindex: !isLive("/case-studies/") }
 *         );
 *       }
 *
 *       export default function CaseStudyPage({ params }: Params) {
 *         const study = getCaseStudy(params.slug);
 *         if (!study) notFound();
 *         return <CaseStudyArticle study={study} />;
 *       }
 *
 *  2. Flip /case-studies/ to live: true in lib/routes.ts.
 *
 *  That is the whole switch-on. Nothing here changes.
 * ════════════════════════════════════════════════════════════════════
 */

export function CaseStudyArticle({ study }: { study: CaseStudy }) {
  const hub = getCaseStudiesHub();
  const path = `/case-studies/${study.slug}/`;

  const facts: [string, string][] = [
    ["Where", study.town],
    ["Scope", study.scope],
    ["What it took", study.effort],
  ];

  return (
    <>
      <PageHero
        path={path}
        crumbLabel={study.town}
        heading={study.title}
        lede={study.problem}
        photo={study.after}
      />

      {/* ── The pair ───────────────────────────────────────────────── */}
      {study.before && study.after && (
        <section className="band bg-surface">
          <div className="section">
            <SectionHead heading="Before and after" />
            <div className="mt-10">
              <BeforeAfter before={study.before} after={study.after} />
            </div>
          </div>
        </section>
      )}

      {/* ── The job in facts ───────────────────────────────────────── */}
      <section className="band bg-surface-alt">
        <div className="section">
          <SectionHead heading="The job" />
          <dl className="mt-10 grid gap-px border border-line bg-line md:grid-cols-3">
            {facts.map(([term, value]) => (
              <div key={term} className="bg-surface p-6">
                <dt className="u-label">{term}</dt>
                <dd className="m-0 mt-2.5 text-[15px]">{value}</dd>
              </div>
            ))}
          </dl>

          {study.materials.length > 0 && (
            <Reveal delay={0.08}>
              <div className="mt-8">
                <p className="u-label">Materials</p>
                <ul className="mt-3 flex list-none flex-wrap gap-2">
                  {study.materials.map((m) => (
                    <li
                      key={m}
                      className="rounded border border-line bg-surface px-3 py-1.5 text-[14px]"
                    >
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* ── How it ended ───────────────────────────────────────────── */}
      <section className="band bg-surface">
        <div className="section">
          <SectionHead heading="How it ended" />
          <p className="mt-8 max-w-[62ch] text-lg">{study.result}</p>

          <p className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
            {study.service && (
              <MoreLink href={study.service}>
                What this service involves
              </MoreLink>
            )}
            <MoreLink href={hub.meta.path}>Other jobs</MoreLink>
          </p>
        </div>
      </section>

      {/* ── Everything else worth showing ──────────────────────────── */}
      {study.photos.length > 0 && (
        <section className="band bg-surface-alt">
          <div className="section">
            <SectionHead heading="On site" />
            <ul className="mt-10 grid list-none gap-6 p-0 md:grid-cols-3">
              {study.photos.map((photo) => (
                <Reveal as="li" key={photo.src}>
                  <figure className="m-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      width={photo.width}
                      height={photo.height}
                      loading="lazy"
                      className="h-[240px] w-full rounded border border-line object-cover"
                    />
                    {photo.caption && (
                      <figcaption className="u-label mt-2.5">
                        {photo.caption}
                      </figcaption>
                    )}
                  </figure>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      <CtaBand cta={hub.cta} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: study.title,
            description: study.problem,
            ...(study.completed ? { datePublished: study.completed } : {}),
            image: [study.after?.src, study.before?.src]
              .filter(Boolean)
              .map((src) => `${client.siteUrl}${src}`),
            author: { "@type": "Organization", name: client.businessName },
            publisher: { "@type": "Organization", name: client.businessName },
            mainEntityOfPage: `${client.siteUrl}${path}`,
            contentLocation: {
              "@type": "Place",
              address: {
                "@type": "PostalAddress",
                addressLocality: study.town,
                addressRegion: client.address.region,
              },
            },
          }),
        }}
      />
    </>
  );
}
