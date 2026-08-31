import { client } from "@/client.config";
import { getPending, getReviewsPage } from "@/lib/content";
import { pageMetadata } from "@/lib/meta";
import { PageHero } from "@/components/PageHero";
import { SectionHead } from "@/components/SectionHead";
import { Reveal } from "@/components/Reveal";
import { CtaBand } from "@/components/CtaBand";
import { GoogleReviews } from "@/components/GoogleReviews";
import { Pending } from "@/components/Pending";
import { btn } from "@/components/Button";

const page = getReviewsPage();

export const metadata = pageMetadata(page.meta);

/*
 * ── On the AggregateRating markup that is NOT on this page ──────────
 *
 * The obvious move here is a JSON-LD AggregateRating so the listing
 * shows stars in search. Don't add it.
 *
 * Google calls a review "self-serving" when it is about entity A and
 * sits on entity A's own website — including when it arrives through an
 * embedded third-party widget, which is exactly what the band below is.
 * Since 2019 Google has not shown review snippets for self-serving
 * LocalBusiness or Organization markup, so the stars would not appear
 * anyway; marking it up regardless is what earns a structured-data
 * manual action, and those apply to the whole domain, not one page.
 *
 * The stars a searcher sees for CTL come from the Google Business
 * Profile, which is fed by the listing itself. This page's job is to
 * convert the visitor who already clicked, and it does that without
 * lying to a crawler.
 *
 * https://developers.google.com/search/docs/appearance/structured-data/review-snippet
 */

export default function ReviewsPage() {
  const pending = getPending("reviews");
  const links: Record<string, string> = {
    google: client.socials.google,
    facebookReviews: client.socials.facebookReviews,
  };

  return (
    <>
      <PageHero
        path={page.meta.path}
        heading={page.heading}
        lede={page.lede}
      />

      {/* ── Live from Google ───────────────────────────────────────── */}
      <section className="band bg-surface">
        <div className="section">
          <SectionHead
            heading="On Google"
            lede="Google shows the five most recent it considers most useful. The rest are one click away."
          />
          {/* Every review the API returns — Google caps it at five. */}
          <GoogleReviews limit={5} />
        </div>
      </section>

      {/*
        The Facebook band earns a place on the page only when there is
        something in it. An empty section whose entire message is "there
        is more of this elsewhere" is a band the visitor scrolls past,
        and the platform grid below already carries that link.
      */}
      {page.facebookPicks.length > 0 && (
        <section className="band bg-surface-alt">
          <div className="section">
            <SectionHead
              heading="On Facebook"
              lede="Recommendations customers left on our page, reproduced with their permission."
            />
            <ul className="mt-10 grid list-none gap-x-10 gap-y-9 border-t border-line pt-8 md:grid-cols-3">
              {page.facebookPicks.map((r) => (
                <Reveal key={r.name}>
                  <li>
                    <figure className="m-0">
                      <blockquote className="m-0 text-ink">
                        &ldquo;{r.quote}&rdquo;
                      </blockquote>
                      <figcaption className="u-label mt-4">
                        {r.name} · {r.detail}
                      </figcaption>
                    </figure>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── Both platforms, plainly ────────────────────────────────── */}
      <section className="band bg-surface">
        <div className="section">
          <SectionHead heading="Read them at the source" />
          <ul className="mt-10 grid list-none gap-px border border-line bg-line p-0 md:grid-cols-2">
            {page.platforms.map((p) => (
              <li key={p.name} className="bg-surface p-7">
                <h3 className="font-display text-[21px] font-bold uppercase text-ink">
                  {p.name}
                </h3>
                <p className="mt-2.5 max-w-[42ch] text-[15px]">{p.body}</p>
                <p className="mt-6">
                  <a
                    href={links[p.hrefKey]}
                    className={btn("line", "sm")}
                    rel="noopener"
                    target="_blank"
                  >
                    {p.action}
                  </a>
                </p>
              </li>
            ))}
          </ul>

          <Pending content={pending} className="mt-8" />
        </div>
      </section>

      <CtaBand cta={page.cta} />
    </>
  );
}
