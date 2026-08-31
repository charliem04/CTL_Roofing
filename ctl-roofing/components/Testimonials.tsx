import { client } from "@/client.config";
import { isLive } from "@/lib/routes";
import { SectionHead } from "./SectionHead";
import { GoogleReviews } from "./GoogleReviews";
import { MoreLink } from "./MoreLink";

/**
 * The home page's proof band.
 *
 * It shows the same live Google feed the reviews page does, rather than
 * a hand-picked set of quotes: whatever three Google returns first is
 * what a visitor sees, and the number beside them is today's number.
 * Curating a home page down to the three best reviews while the listing
 * says something else is the kind of thing the FTC's review rule exists
 * to stop, and it is a bad trade anyway — a live 4.9 with a count is
 * more persuasive than three anonymous glowing paragraphs.
 *
 * `client.testimonials` stays supported for a client with no Google
 * presence. CTL has one, so it is empty and this reads from Google.
 */
export function Testimonials() {
  const legacy = client.testimonials;

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
        ) : (
          <GoogleReviews />
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
