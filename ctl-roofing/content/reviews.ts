import type { CtaCopy, PageMeta, Review } from "./types";

/**
 * ════════════════════════════════════════════════════════════════════
 *  REVIEWS
 *
 *  Two platforms, two completely different mechanics. Worth knowing
 *  before anyone changes this file:
 *
 *  GOOGLE is live. components/GoogleReviews.tsx calls the Places API
 *  from the visitor's browser on every view, so the rating on the page
 *  is the rating on the listing, and nothing is cached — which is both
 *  the honest behaviour and the one the Places policy requires. It
 *  returns a maximum of five reviews. Nothing in this file feeds it.
 *
 *  FACEBOOK has no live route, and this is not an oversight to fix
 *  later. Meta deprecated Page recommendations in Graph API v22.0 and
 *  killed them across every version on 9 September 2025 — reading them
 *  now returns error code 12. There is no supported API, and scraping
 *  the page violates Meta's terms. So Facebook recommendations can only
 *  get here one way: Robert copies them across, with the customer's
 *  permission, into `facebookPicks` below.
 *
 *  `facebookPicks` is empty. It stays empty until real ones arrive.
 *  A quote attributed to a real named customer who never said it is
 *  defamation-adjacent on a good day and an FTC problem on a bad one.
 *
 *  ⚠️ See `reviews` in content/pending.ts.
 * ════════════════════════════════════════════════════════════════════
 */

export const reviewsPage = {
  meta: {
    title: "Reviews — What Acadiana Says About CTL",
    description:
      "Customer reviews of CTL Pro Construction, read live from our Google listing, plus where to find our Facebook recommendations.",
    path: "/reviews/",
  } satisfies PageMeta,

  heading: "What the neighbours say",
  lede: "The reviews below come straight off our Google listing as you load the page — not a screenshot, not a selection we curated. Whatever is there is what you see.",

  /**
   * Recommendations copied from Facebook with permission. Empty by
   * design — see the note above. Each one needs the customer's own
   * words verbatim, their name as it appears on the recommendation,
   * and the town.
   */
  facebookPicks: [] as Review[],

  /** Where to go to read or leave one. */
  platforms: [
    {
      name: "Google",
      body: "The full listing, every review, sorted however you like.",
      // Set from client.socials.google at render time.
      hrefKey: "google" as const,
      action: "Read and leave reviews on Google",
    },
    {
      name: "Facebook",
      body: "Recommendations from customers on our page, plus the day-to-day of what the crews are working on.",
      hrefKey: "facebookReviews" as const,
      action: "Read the recommendations on Facebook",
    },
  ],

  cta: {
    heading: "Worked with us? Say so",
    body: "A review takes two minutes and it is the single most useful thing a past customer can do for us. If something fell short instead, call the office first — we would rather fix it than read about it.",
  } satisfies CtaCopy,
};
