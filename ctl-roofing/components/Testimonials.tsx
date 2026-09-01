import { client } from "@/client.config";
import { getReviewsPage } from "@/lib/content";
import { googleFeedConfigured } from "@/lib/googleReviews";
import { isLive } from "@/lib/routes";
import { SectionHead } from "./SectionHead";
import { GoogleReviews } from "./GoogleReviews";
import { ReviewColumns } from "./ReviewColumns";
import { MoreLink } from "./MoreLink";

/**
 * The home page’s proof band, in preference order.
 *
 * 1. The live Google feed, when a Places key is configured. Whatever
 *    three Google returns first is what a visitor sees, and the number
 *    beside them is today’s number.
 * 2. Otherwise the first three Facebook recommendations, which are real
 *    and already in the content — better than a bare link, and the
 *    reviews page below carries all ten.
 * 3. Otherwise the link to the Google listing.
 *
 * The three shown are the first three as stored, never the three that
 * flatter most. Reordering reviews by how good they make us look is the
 * behaviour the FTC’s 2024 rule on testimonials exists to stop, and it
 * is a bad trade anyway: a live rating with a count out-argues three
 * hand-picked paragraphs.
 *
 * `client.testimonials` stays supported for a client with neither.
 */
export function Testimonials() {
  const legacy = client.testimonials;
  const facebook = getReviewsPage().facebookPicks;

  return (
    <section id="testimonials" className="band bg-surface">
      <div className="section">
        <SectionHead heading={client.copy.testimonialsHeading} />

        {legacy.length > 0 ? (
          /* Quiet, ruled columns — no quote-mark icons, no card chrome */
          <div className="mt-10 grid gap-x-10 gap-y-8 border-t border-line pt-8 md:grid-cols-3">
            {legacy.map((t) => (
              <figure key={t.name} className="m-0">
                <blockquote className="m-0 text-ink">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="u-label mt-4">
                  {t.name} · {t.detail}
                </figcaption>
              </figure>
            ))}
          </div>
        ) : googleFeedConfigured() || facebook.length === 0 ? (
          <GoogleReviews />
        ) : (
          <ReviewColumns reviews={facebook.slice(0, 3)} layout="grid" />
        )}

        {isLive("/reviews/") && (
          <p className="mt-9">
            <MoreLink href="/reviews/">Reviews on Google and Facebook</MoreLink>
          </p>
        )}
      </div>
    </section>
  );
}
