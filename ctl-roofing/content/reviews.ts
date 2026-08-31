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
 *  FACEBOOK is hard-coded, and that is the only option there is. Meta
 *  deprecated Page recommendations in Graph API v22.0 and killed them
 *  across every version on 9 September 2025 — reading them now returns
 *  error code 12. There is no supported API, and scraping the page
 *  violates Meta's terms. So the recommendations below were copied
 *  across by hand from the page on the date in `facebookStat.capturedOn`.
 *
 *  THE RULES FOR EDITING THEM, which are not negotiable:
 *
 *  1. Verbatim. Every one of these is reproduced exactly as written,
 *     typos and all — "did a amazing job", the missing spaces in Sue A
 *     Roy's, the double spaces in Bryce Godwin's. Tidying a customer's
 *     grammar is editing a testimonial, and the FTC's 2024 rule on
 *     consumer reviews is specifically about testimonials altered to
 *     read better than what the person actually said. Leave them alone.
 *  2. Nobody gets added who did not write one.
 *  3. The stat is a snapshot, not a live figure, so the page prints the
 *     month it was captured. When it is refreshed, move the date with
 *     it. A stale "98%" with no date on it is a claim about today.
 *
 *  ⚠️ See `reviews` in content/pending.ts for the refresh cadence.
 * ════════════════════════════════════════════════════════════════════
 */

export const reviewsPage = {
  meta: {
    title: "Reviews — What Acadiana Says About CTL",
    description:
      "Customer reviews of CTL Pro Construction, read live from our Google listing, plus recommendations from our Facebook page.",
    path: "/reviews/",
  } satisfies PageMeta,

  heading: "What the neighbours say",
  lede: "The Google reviews below come straight off our listing as you load the page — not a screenshot, not a selection we curated. The Facebook recommendations are reproduced word for word from our page.",

  /**
   * Facebook's own recommendation figure. Read off the page by hand, so
   * it carries the date it was read. `capturedOn` is ISO; the page
   * renders it as a month, because claiming day-level accuracy on a
   * number nobody is watching daily would be its own small lie.
   */
  facebookStat: {
    percent: 98,
    people: 39,
    capturedOn: "2026-08-31",
  },

  /**
   * Copied from facebook.com/ctlprola/reviews. Verbatim — see rule 1.
   * Order is the order they were read off the page; it is not a ranking
   * and it is not sorted by how flattering they are.
   */
  facebookPicks: [
    {
      quote:
        "Incredibly thankful for Ceci and her fighting to get our roof replaced. The crew did a amazing job and we have a beautiful new roof!!",
      name: "Samantha Hoffpauir Bihm",
      source: "Facebook",
    },
    {
      quote:
        "I want to take this time to thank Jp Boudreaux with CTL roofing for all the help he’s giving our neighborhood over at Cypress Meadows. We can’t wait till we get our new storage and bathroom facility. Thank you, JP.",
      name: "Kenny LeJeune",
      source: "Facebook",
    },
    {
      quote:
        "Professionalism goes a long way, and this business certainly demonstrates it. From the way they communicate to the respect they show others, they’ve consistently presented themselves with integrity, courtesy, and professionalism. It’s refreshing to see a business that values clear communication, prompt responses, and a positive attitude. Those qualities create confidence and leave a great first impression. I appreciate the professional standard they maintain and wish them continued success. With a salesman like JP Boudreaux on the team I’m sure this will be accomplished.",
      name: "Brandy Aucoin",
      source: "Facebook",
    },
    {
      quote:
        "JP Boudreaux and his team were amazing!  Professional, timely and clean.  They provided upfront pricing and it didn't change.  Definitely will use again.  100% trust them!  Great local business!",
      name: "Bryce Godwin",
      source: "Facebook",
    },
    {
      quote:
        "John Paul Jones and CTL Pro took care of everything for me and did a fantastic job on my roof. Looks really good. Crew completed job and cleaned up faster than I thought they could.",
      name: "Mitch Romero",
      source: "Facebook",
    },
    {
      quote:
        "John Jones And CTL Pro were with me every step of the way, working with my insurance and their roofing team to give me a superior product at a competitive rate in a timely fashion.",
      name: "Edward DeMahy",
      source: "Facebook",
    },
    {
      quote:
        "Great experience,would recommend them for any roofing job.Roofing crew was great,left the yard in perfect order with a great roof application.John and his crew foreman we’re wonderful!",
      name: "Sue A Roy",
      source: "Facebook",
    },
    {
      quote:
        "We’ve worked with CTL Pro for multiple roofs for Lafayette Habitat for Humanity homes. They will bend over backwards to get the job done right and are a pleasure to work with. Very affordable prices compared with other roofers in our area.",
      name: "Ji Daily",
      source: "Facebook",
    },
    {
      quote:
        "CTL Pro was very professional and helped me understand the whole process of repairing a roof. I really appreciate everything they did.",
      name: "Valerie Hines",
      source: "Facebook",
    },
    {
      quote:
        "Great experience. Very professional group. I would highly recommend them.",
      name: "Michael Corry",
      source: "Facebook",
    },
  ] satisfies Review[],

  /** Where to go to read or leave one. */
  platforms: [
    {
      name: "Google",
      body: "The full listing, every review, sorted however you like.",
      // Set from client.socials at render time.
      hrefKey: "google" as const,
      action: "Read and leave reviews on Google",
    },
    {
      name: "Facebook",
      body: "Every recommendation, plus the day-to-day of what the crews are working on.",
      hrefKey: "facebookReviews" as const,
      action: "Read the recommendations on Facebook",
    },
  ],

  cta: {
    heading: "Worked with us? Say so",
    body: "A review takes two minutes and it is the single most useful thing a past customer can do for us. If something fell short instead, call the office first — we would rather fix it than read about it.",
  } satisfies CtaCopy,
};
