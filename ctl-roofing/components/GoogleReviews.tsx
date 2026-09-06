"use client";

import { useEffect, useState } from "react";
import {
  fetchGoogleReviews,
  googleFeedConfigured,
  type GooglePlace,
} from "@/lib/googleReviews";
import { client } from "@/client.config";
import { Stars } from "./Stars";
import { btn } from "./Button";

/**
 * The live Google band.
 *
 * Three states, and the third is the one that matters: when no key is
 * configured, or Google is unreachable, or the call fails, this renders
 * the honest route to the reviews instead of an error or a gap — a link
 * to the listing, where they all are anyway. A visitor never learns
 * that something was supposed to load here.
 *
 * Nothing is written to storage of any kind. See lib/googleReviews.ts
 * for why that is a rule rather than an oversight.
 *
 * `limit` is a display choice, not a filter on quality: the reviews page
 * shows every review Google returns, the home band shows the first three
 * so the page keeps moving. Google decides the order either way — we
 * never sort, score or drop a review for being unflattering.
 */
export function GoogleReviews({ limit = 3 }: { limit?: number } = {}) {
  const [place, setPlace] = useState<GooglePlace | null>(null);
  const [settled, setSettled] = useState(!googleFeedConfigured());

  useEffect(() => {
    if (!googleFeedConfigured()) return;
    const ac = new AbortController();
    fetchGoogleReviews(ac.signal)
      .then(setPlace)
      .finally(() => setSettled(true));
    return () => ac.abort();
  }, []);

  const listing = place?.mapsUri || client.socials.google;

  if (!settled) {
    return (
      <div
        className="mt-10 grid gap-x-10 gap-y-8 border-t border-line pt-8 md:grid-cols-3"
        aria-busy
      >
        {[0, 1, 2].map((i) => (
          // deliberate-ignore decorative-motion — the pulse is the only
          // signal that a network request is in flight; it stops when it lands.
          <div key={i} className="animate-pulse space-y-3">
            <div className="h-3 w-24 rounded bg-line" />
            <div className="h-3 w-full rounded bg-line" />
            <div className="h-3 w-5/6 rounded bg-line" />
            <div className="h-3 w-2/3 rounded bg-line" />
          </div>
        ))}
        <span className="sr-only">Loading reviews from Google</span>
      </div>
    );
  }

  if (!place || place.reviews.length === 0) {
    /**
     * ── THE PLACEHOLDER, AND THE TWO THINGS IT IS NOT ───────────────
     * A panel that says what will be here, not a grid of cards.
     *
     * It is not invented reviews. That is the obvious way to make this
     * band look busy and it is not available: fabricated testimonials
     * for a real business are what the FTC's 2024 rule on consumer
     * reviews exists to punish, and presenting them as Google's adds a
     * Places policy violation on top. The same reasoning is written out
     * at length in Testimonials.tsx.
     *
     * It is also not the Facebook reviews. That was tried — real,
     * attributed, honestly labelled, and still wrong, because on
     * /reviews/ the Facebook section directly below shows all ten of
     * them. Five of the same quotes twice on one page reads as padding
     * and makes the page look thinner rather than fuller. There is no
     * honest way to fill a second review grid on a page that already
     * shows every review there is.
     *
     * So the band states plainly what it is waiting for and sends
     * people to the listing. It is the one thing here that is true,
     * useful, and does not repeat the page below it.
     *
     * Nothing needs removing when the key lands. Real Google data makes
     * `place` truthy and this branch stops running.
     * ────────────────────────────────────────────────────────────────
     */
    return (
      <div className="mt-10 border-t border-line pt-8">
        <div className="rounded border border-line border-l-[3px] border-l-accent bg-surface-alt p-7 md:p-9">
          <p className="u-label">Live feed pending</p>
          <p className="mt-3 max-w-[58ch] text-lg text-ink">
            CTL’s Google reviews will load into this band automatically once
            the listing is connected — the rating, the count and the newest
            reviews, straight off the listing rather than copied here by hand.
          </p>
          <p className="mt-4 max-w-[58ch]">
            Until then they are all one click away, and the Facebook
            recommendations below are reproduced word for word.
          </p>
          <p className="mt-7">
            <a href={listing} className={btn("gold")} rel="noopener" target="_blank">
              Read the reviews on Google
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10 border-t border-line pt-8">
      <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <Stars rating={place.rating} />
        <span className="font-display text-[27px] font-bold leading-none text-ink">
          {place.rating.toFixed(1)}
        </span>
        <span className="u-label">
          from {place.total.toLocaleString()} Google reviews
        </span>
      </p>

      <ul className="mt-8 grid list-none gap-x-10 gap-y-9 p-0 md:grid-cols-3">
        {place.reviews.slice(0, limit).map((r) => (
          <li key={r.id}>
            <figure className="m-0">
              <Stars rating={r.rating} small />
              <blockquote className="m-0 mt-3 text-ink">
                &ldquo;{r.text}&rdquo;
              </blockquote>
              {/* Author name, author photo and a link back to the review
                  are all required attribution under Google’s Places
                  policy. Do not strip them for a tidier card. */}
              <figcaption className="mt-4 flex items-center gap-2.5">
                {r.authorPhoto && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={r.authorPhoto}
                    alt=""
                    aria-hidden
                    width={28}
                    height={28}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="h-7 w-7 shrink-0 rounded-full object-cover"
                  />
                )}
                <span className="u-label">
                  {r.uri ? (
                    <a
                      href={r.uri}
                      className="text-ink-faint no-underline transition-colors duration-150 hover:text-brand active:text-brand-strong"
                      rel="nofollow noopener"
                      target="_blank"
                    >
                      {r.authorName}
                    </a>
                  ) : (
                    r.authorName
                  )}
                  {r.age && ` · ${r.age}`}
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <p className="mt-9 border-t border-line pt-5 font-mono text-[12px] uppercase tracking-[0.09em] text-ink-faint">
        Reviews from Google, loaded live ·{" "}
        <a
          href={listing}
          className="text-ink-faint underline decoration-line underline-offset-4 transition-colors duration-150 hover:text-brand active:text-brand-strong"
          rel="noopener"
          target="_blank"
        >
          See all of them on Google
        </a>
      </p>
    </div>
  );
}
