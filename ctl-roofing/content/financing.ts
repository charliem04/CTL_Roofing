import type {
  CtaCopy,
  Faq,
  FinanceOffer,
  FinanceProduct,
  PageMeta,
  Photo,
} from "./types";

/**
 * ════════════════════════════════════════════════════════════════════
 *  FINANCING
 *
 *  ⚠️ The estimator prints numbers. Every one of them comes from
 *  `offers` below. There is no fallback rate, no "typical" APR and no
 *  illustrative example — with `offers: []` the estimator renders the
 *  pending panel instead of a payment. Do not add an offer until the
 *  lender’s real terms are in hand; a monthly payment on this page is a
 *  quote a customer will hold you to.
 * ════════════════════════════════════════════════════════════════════
 */

/**
 * The lender's portal takes CTL's sponsor and contractor identifiers on
 * every link; only the loanCode changes between packages. Split so the
 * shared half is written once — a typo in the contractor number would
 * hand someone else's portal the application, and it would look fine.
 */
const PORTAL =
  "https://prequalification.enerbank.com/apply/loanproduct?sponsorPhoneNumber=8007747598&contractorNumber=198295&loanCode=";
const PORTAL_TAIL = "&contractorEmail=rob@ctlpro.com";

export const financing = {
  meta: {
    title: "Financing — Pay For The Project Over Time",
    description:
      "Financing options for roofing and construction projects with CTL Pro Construction in Acadiana. See what a project might cost per month before you commit.",
    path: "/financing/",
  } satisfies PageMeta,

  heading: "Financing",
  lede: "A roof rarely fails at a convenient moment. Financing exists so the timing of the repair is decided by the roof, not by what happens to be in the account this month.",

  /**
   * A finished shingle roof on an ordinary brick ranch — the thing the
   * money buys, on the kind of house whose owner is reading this page.
   * The shop-stock coils that were here before were inventory: true of
   * CTL, but nothing to do with paying for a roof over time.
   */
  photo: {
    src: "/ctl/gallery/shingle-brick-ranch.jpg",
    alt: "Brick ranch home with a completed shingle roof and mature landscaping out front",
    width: 1100,
    height: 825,
  } satisfies Photo,

  /** Lender name. EnerBank USA is Regions Bank's home improvement arm. */
  lender: "Regions Bank",
  /**
   * There is deliberately no single `prequalifyUrl` any more. Each
   * package carries its own link, because each has its own loanCode and
   * only the code differs between them — a shared link would silently
   * open the wrong application rather than fail visibly.
   */

  /**
   * The three packages as the lender advertises them, in the order they
   * appear on CTL's existing financing page.
   *
   * ⚠️ TO CONFIRM WITH CTL / THE LENDER BEFORE THIS GOES LIVE:
   *   · the term on the 8.99% installment loan. The card says only "as
   *     low as 8.99% APR" with no term. 120 months is taken from CTL's
   *     own enquiry form, which offers "8.99% for 10 years" as its
   *     example — a reasonable read, not a confirmed one.
   *   · the exact footnote each asterisk on those cards points to. The
   *     `disclosure` block below says what is known to be true and no
   *     more; the lender's own wording should replace it verbatim.
   */
  products_heading: "Popular loan packages",
  products_lede:
    "Prequalifying takes a couple of minutes and does not affect your credit score. It tells you what you would be offered before you decide anything.",

  products: [
    {
      headline: "9.99% APR",
      name: "5 year loan",
      detail: "Fixed rate over 60 months.",
      estimated: true,
      url: `${PORTAL}DEL2674${PORTAL_TAIL}`,
    },
    {
      headline: "12 months",
      name: "Same-as-cash",
      detail:
        "No payments and no interest for 12 months. Interest accrues from the day funds are disbursed and is waived only if the loan is repaid in full within the same-as-cash period.",
      url: `${PORTAL}DEL2625${PORTAL_TAIL}`,
    },
    {
      headline: "As low as 8.99% APR",
      name: "Traditional installment loan",
      detail: "The lowest rate offered on this product. Yours depends on credit.",
      estimated: true,
      url: `${PORTAL}DEL2622${PORTAL_TAIL}`,
    },
  ] satisfies FinanceProduct[],

  /**
   * Rows the estimator amortises. These are real advertised rates, which
   * is the condition the warning at the top of this file sets.
   *
   * Same-as-cash is deliberately NOT here. It has no monthly payment
   * during its promotional window, so there is no honest figure to put
   * in a "per month" column for it — running deferred interest through
   * an amortising formula would print a number that describes no
   * product anyone is being sold. It stays in `products` above, where
   * its actual terms are stated in words.
   */
  offers: [
    {
      label: "60 months",
      apr: 9.99,
      months: 60,
      note: "subject to credit approval",
    },
    {
      label: "120 months",
      apr: 8.99,
      months: 120,
      note: "lowest advertised rate — subject to credit approval",
    },
  ] satisfies FinanceOffer[],

  /**
   * Sits under the estimator and the product cards. Every asterisk on
   * this page points here.
   */
  disclosure:
    "Rates shown are the lender’s advertised rates and are subject to credit approval; the rate and term you are offered may differ. Estimated payments are illustrations produced by this page from the rates above, not offers of credit, and do not include taxes, insurance or any fees the lender may charge. Financing is provided by Regions Bank, Member FDIC, Equal Housing Lender. Prequalification does not affect your credit score.",

  /**
   * The clauses lifted out of the disclosure above. Every one is a
   * qualification rather than an inducement — what might not apply to
   * you, and the one reassurance that is unambiguously good news.
   * Emphasis that lifted the rates instead would be doing the opposite
   * job to the one small print exists for.
   */
  disclosureEmphasis: [
    "subject to credit approval",
    "the rate and term you are offered may differ",
    "not offers of credit",
    "Prequalification does not affect your credit score",
  ],

  /** The band between the hero and the packages. */
  strip: {
    label: "Before you decide anything",
    body: "Prequalifying takes a couple of minutes, shows you the rate and term you would actually be offered, and does not affect your credit score.",
  },

  /**
   * Third box beside the estimator. A page that hands somebody a slider
   * and a portal and nothing else assumes they want to do this alone,
   * and the ones who do not are exactly the ones with a complication —
   * an insurance claim half-settled, a scope that grew, a number they
   * cannot make work. The phone belongs next to the self-serve tools,
   * not three sections below them.
   */
  talk: {
    heading: "Rather talk it through?",
    body: "Bring the number you want to land on and we will work back from it. There is no application to fill in first, and nothing said on the phone commits you to anything.",
  },

  /** Sits under "What to have ready", beside the estimator. */
  how: {
    heading: "How prequalifying works",
    steps: [
      {
        title: "Check where you stand",
        body: "A few minutes online with the lender. A soft enquiry, so your credit score is untouched.",
      },
      {
        title: "See real numbers",
        body: "The rate and term you qualify for, rather than the advertised best case.",
      },
      {
        title: "Decide with the scope in hand",
        body: "Put the offer next to the written estimate from your assessment. Nothing is committed until you sign.",
      },
    ],
  },

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
        body: "Insurance pays on its own schedule. Financing can bridge the gap so the work starts when the weather allows rather than when the check clears.",
      },
      {
        title: "Doing the whole scope at once",
        body: "Roof, siding and windows in one mobilization costs less than three visits, and gets one consistent set of flashing details.",
      },
    ],
  },

  /**
   * ── ON THE SOURCE COPY ──────────────────────────────────────────
   * CTL's existing page has a "Why finance?" section. It is not used
   * here, and that is a judgement rather than an oversight: it is
   * written to fit any contractor in the country ("upgrade their living
   * space", "in many cases", "worthwhile both now and in the future"),
   * and the `points` above already make the same argument about the
   * actual purchase — a roof that failed on its own schedule.
   *
   * Its secured-versus-unsecured section is the opposite. That is real
   * information a homeowner comparing a HELOC cannot get from a rate
   * table, and nothing on this site said it. Kept for that reason, and
   * rewritten: the original spends its first clause hedging the
   * downside, and buries the strongest point — no lien on the house —
   * in a subordinate clause at the very end. Leading with the drawback
   * is what makes the rest of it credible.
   * ────────────────────────────────────────────────────────────────
   */
  secured: {
    heading: "Secured or unsecured",
    body: [
      "The rates on this page are unsecured, which means they are higher than a HELOC or a cash-out refinance. That is the honest part, and it is the first thing worth saying.",
      "What you are not paying is closing costs, an appraisal, title work, and the weeks it takes to get all three. On a job this size those charges routinely cost more than the rate difference, and an unsecured loan funds in hours rather than months — which matters when the roof is already open.",
      "The other difference only shows up if something goes wrong later: an unsecured loan does not put your house up as collateral.",
    ],
  },

  /**
   * For the homeowner the portal turns down, or prices badly. Routed to
   * the existing contact form rather than a second submission pipeline
   * of its own — see the note in app/financing/page.tsx.
   */
  fallback: {
    heading: "Didn’t prequalify, or don’t like the offer?",
    body: "The portal is one lender's answer on one day, and it is not the only one available. Tell us the monthly figure you actually want to land on and we will work back from it.",
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
      a: "Talk to us about the full scope. What a lender will cover is the lender’s decision, and it is worth asking before splitting a project up.",
    },
  ] satisfies Faq[],

  cta: {
    heading: "See what you qualify for",
    body: "Start with the free assessment so there is a real number to finance. We can walk through the options with the written scope in front of both of us.",
  } satisfies CtaCopy,
};
