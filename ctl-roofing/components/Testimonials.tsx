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
 * 2. Otherwise two Facebook recommendations, which are real and already
 *    in the content — better than a bare link, and the reviews page
 *    below carries all ten.
 * 3. Otherwise the link to the Google listing.
 *
 * ── ON CHOOSING WHICH TWO ───────────────────────────────────────────
 * This band used to take the first three as stored, and said so, on the
 * grounds that picking reviews by how well they flatter is the behaviour
 * the FTC’s 2024 rule on testimonials exists to stop.
 *
 * It now names four, in two rows of two. The criterion is length, not
 * sentiment: each row is matched so its two boxes sit level instead of
 * one running to five lines while its neighbour runs to two. Matching
 * character counts is not the same as matching line counts — an early
 * pair here were eight characters apart and still came out four lines
 * against three, because where a line breaks depends on the words.
 * That distinction is worth keeping straight, so: every entry in
 * facebookPicks is already a positive review, this choice suppresses no
 * criticism, and it changes nothing about the rating a visitor sees —
 * the live count and average still come from Google, and the reviews
 * page one link below still carries all ten in stored order.
 *
 * If a critical review is ever added to that list, this selection is the
 * thing to revisit before it silently becomes the other kind of picking.
 * ────────────────────────────────────────────────────────────────────
 *
 * `client.testimonials` stays supported for a client with neither.
 */
const HOME_PICKS = [
  // Row one, already level at four lines each.
  "Bryce Godwin",
  "Ji Daily",
  // Row two. 181 and 180 characters — a character apart, which is as
  // matched as this set gets — and they say different things from the
  // pair above: how fast the crew was and how clean they left it, then
  // what happened with the insurance company.
  "Mitch Romero",
  "Edward DeMahy",
];
export function Testimonials() {
  const legacy = client.testimonials;
  const facebook = getReviewsPage().facebookPicks;

  // Named rather than sliced, so an edit to the stored order cannot
  // silently change what the home page shows. If a name ever stops
  // matching — a review withdrawn, a spelling corrected — this falls
  // back to the stored order rather than rendering an empty band.
  const picked = HOME_PICKS.map((name) =>
    facebook.find((r) => r.name === name)
  ).filter((r): r is (typeof facebook)[number] => Boolean(r));
  const featured = picked.length === HOME_PICKS.length ? picked : facebook.slice(0, 2);

  return (
    <section id="testimonials" className="band band-seam bg-surface">
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
          <ReviewColumns reviews={featured} layout="feature" />
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
