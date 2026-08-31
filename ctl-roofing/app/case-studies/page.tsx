import { client } from "@/client.config";
import { getCaseStudies, getCaseStudiesHub, getPending } from "@/lib/content";
import { isLive } from "@/lib/routes";
import { pageMetadata } from "@/lib/meta";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { CtaBand } from "@/components/CtaBand";
import { MoreLink } from "@/components/MoreLink";
import { Pending } from "@/components/Pending";

const hub = getCaseStudiesHub();

/*
 * This route is built ahead of its content. While `caseStudies` is
 * empty the registry keeps /case-studies/ at live: false, so nothing
 * links here and the sitemap omits it — but Next still emits the file,
 * and an unfinished page a crawler can stumble onto is worse than no
 * page. Hence noindex, derived from the same flag rather than hardcoded,
 * so it lifts itself the moment the route goes live.
 */
export const metadata = pageMetadata(hub.meta, {
  noindex: !isLive(hub.meta.path),
});

export default function CaseStudiesPage() {
  const studies = getCaseStudies();

  return (
    <>
      <PageHero path={hub.meta.path} heading={hub.heading} lede={hub.lede} />

      <section className="band bg-surface">
        <div className="section">
          {studies.length === 0 ? (
            <div className="max-w-[58ch]">
              <h2 className="text-display-2">{hub.emptyHeading}</h2>
              <p className="mt-5 text-lg">{hub.emptyBody}</p>
              <p className="mt-7">
                <MoreLink href="/gallery/">See the work so far</MoreLink>
              </p>
              <Pending content={getPending("caseStudies")} className="mt-10" />
            </div>
          ) : (
            <ul className="grid list-none gap-x-8 gap-y-12 p-0 md:grid-cols-2">
              {studies.map((study, i) => (
                <Reveal as="li" key={study.slug} delay={Math.min(i, 5) * 0.05}>
                  <a
                    href={`/case-studies/${study.slug}/`}
                    className="group block no-underline"
                  >
                    {study.after && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={study.after.src}
                        alt={study.after.alt}
                        width={study.after.width}
                        height={study.after.height}
                        loading="lazy"
                        className="aspect-[3/2] w-full rounded border border-line object-cover"
                      />
                    )}
                    <p className="u-label mt-4">
                      {study.town}
                      {study.materials[0] && ` · ${study.materials[0]}`}
                    </p>
                    <h2 className="mt-2 font-display text-[27px] font-bold uppercase leading-tight text-ink transition-colors duration-150 group-hover:text-brand group-active:text-brand-strong">
                      {study.title}
                    </h2>
                    <p className="mt-2.5 max-w-[46ch] text-[15px] text-ink-soft">
                      {study.problem}
                    </p>
                  </a>
                </Reveal>
              ))}
            </ul>
          )}
        </div>
      </section>

      <CtaBand cta={hub.cta} />

      {studies.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              itemListElement: studies.map((s, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: s.title,
                url: `${client.siteUrl}/case-studies/${s.slug}/`,
              })),
            }),
          }}
        />
      )}
    </>
  );
}
