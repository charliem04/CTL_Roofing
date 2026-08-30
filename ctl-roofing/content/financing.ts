import type { CtaCopy, Faq, FinanceOffer, PageMeta, Photo } from "./types";

/**
 * ════════════════════════════════════════════════════════════════════
 *  FINANCING
 *
 *  ⚠️ The estimator prints numbers. Every one of them comes from
 *  `offers` below. There is no fallback rate, no "typical" APR and no
 *  illustrative example — with `offers: []` the estimator renders the
 *  pending panel instead of a payment. Do not add an offer until the
 *  lender's real terms are in hand; a monthly payment on this page is a
 *  quote a customer will hold you to.
 * ════════════════════════════════════════════════════════════════════
 */

export const financing = {
  meta: {
    title: "Financing — Pay For The Project Over Time",
    description:
      "Financing options for roofing and construction projects with CTL Pro Construction in Acadiana. See what a project might cost per month before you commit.",
    path: "/financing/",
  } satisfies PageMeta,

  heading: "Financing",
  lede: "A roof rarely fails at a convenient moment. Financing exists so the timing of the repair is decided by the roof, not by what happens to be in the account this month.",

  photo: {
    src: "/ctl/shop-metal-stock.jpg",
    alt: "Coils of metal roofing stock on pallets in the CTL shop",
    width: 1000,
    height: 1333,
  } satisfies Photo,

  /** Lender name, once CTL confirms it. Empty string hides the line. */
  lender: "",
  /** Prequalification link. Empty string falls back to the contact CTA. */
  prequalifyUrl: "",

  /**
   * Real terms only. Each offer drives one row of the estimator.
   * Example of the shape, for whoever fills this in:
   *   { label: "60 months", apr: 9.99, months: 60, note: "subject to credit approval" }
   */
  offers: [] as FinanceOffer[],

  /** Estimator slider bounds, in dollars. */
  estimator: {
    min: 5000,
    max: 60000,
    step: 500,
    default: 18000,
  },

  points: {
    heading: "What financing is good for",
    items: [
      {
        title: "Doing it once, properly",
        body: "The cheapest version of a job is rarely the one that lasts. Spreading the cost is often what makes the difference between a patch and the repair that ends the problem.",
      },
      {
        title: "Beating a deductible timing problem",
        body: "Insurance pays on its own schedule. Financing can bridge the gap so the work starts when the weather allows rather than when the cheque clears.",
      },
      {
        title: "Doing the whole scope at once",
        body: "Roof, siding and windows in one mobilisation costs less than three visits, and gets one consistent set of flashing details.",
      },
    ],
  },

  prepare: {
    heading: "What to have ready",
    items: [
      "The written scope and estimate from your assessment",
      "How much you want to put down, if anything",
      "The monthly figure you actually want to live with",
    ],
  },

  faqs: [
    {
      q: "Does applying affect my credit?",
      a: "That depends on the lender and whether you are prequalifying or formally applying. Ask before you submit anything — a prequalification and an application are not the same event.",
    },
    {
      q: "Do I need financing arranged before the assessment?",
      a: "No. The assessment is free and comes with a written scope. Work out how to pay for it once you know what it is.",
    },
    {
      q: "Can financing cover a whole renovation, not just a roof?",
      a: "Talk to us about the full scope. What a lender will cover is the lender's decision, and it is worth asking before splitting a project up.",
    },
  ] satisfies Faq[],

  cta: {
    heading: "See what you qualify for",
    body: "Start with the free assessment so there is a real number to finance. We can walk through the options with the written scope in front of both of us.",
  } satisfies CtaCopy,
};
