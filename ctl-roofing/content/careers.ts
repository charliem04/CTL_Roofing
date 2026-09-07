import type { CtaCopy, PageMeta, Photo } from "./types";

/**
 * ════════════════════════════════════════════════════════════════════
 *  CAREERS
 *
 *  ⚠️ TWO THINGS BEFORE THIS GOES LIVE, and neither is code.
 *
 *  1. `roles` is empty because nobody has told us what CTL hires for,
 *     or whether they are hiring at all right now. An invented job
 *     opening is worse than an invented photograph: somebody rewrites
 *     a résumé for it.
 *
 *  2. THE QUESTIONS BELOW NEED AN EMPLOYMENT ATTORNEY’S EYE. Hiring
 *     questions carry real legal exposure — what you may ask, and how
 *     you must phrase it, is not a design decision. These are written
 *     conservatively:
 *       · Every one is about doing the job, not about the person.
 *       · The physical question describes the actual work and asks
 *         whether the applicant can do it, which is an essential-
 *         function question rather than a health question.
 *       · Nothing asks about criminal history, age, health, family,
 *         citizenship or anything else that draws a discrimination
 *         claim. Do not add any of those without advice.
 *     Conservative is not the same as cleared. Get them read.
 *
 *  ⚠️ THE RETENTION NUMBER IN `after` IS A PROMISE. A rule on the R2
 *  bucket enforces it (workers/careers-upload/scripts/set-retention.sh)
 *  and the privacy policy repeats it. Change one and change all three,
 *  or the page is telling applicants something untrue.
 *
 *  ── HOW AN APPLICATION ACTUALLY TRAVELS ─────────────────────────────
 *
 *  A static export cannot receive a file, so the form posts to the
 *  Cloudflare Worker in workers/careers-upload, which validates the
 *  upload and writes it to a private R2 bucket. Until
 *  NEXT_PUBLIC_CAREERS_ENDPOINT points at a deployed Worker, the form
 *  refuses and sends people to the office email.
 * ════════════════════════════════════════════════════════════════════
 */

export type Role = {
  slug: string;
  title: string;
  /**
   * "Full time", "Seasonal", "Sub-contract" — CTL’s own words.
   *
   * Optional, and currently unset on every role, because nobody has
   * said which of these are salaried, seasonal or sub-contract. The
   * card omits the line rather than printing a guess: an applicant
   * deciding whether to apply reads this one, and "Full time" invented
   * for layout's sake is a lie with consequences.
   */
  basis?: string;
  /** Where the work is, when it is not simply Acadiana. */
  location?: string;
  summary: string;
  /** What the person actually does day to day. */
  does: string[];
  /** What they must already have. Keep it to the genuine minimum. */
  needs: string[];
};

export type Question = {
  id: string;
  label: string;
  /** "short" is one line; "long" is a paragraph; "choice" is a select. */
  kind: "short" | "long" | "choice";
  options?: string[];
  required?: boolean;
  /** Shown under the field. Use it to explain why we are asking. */
  hint?: string;
};

export const careersPage = {
  meta: {
    title: "Careers — Work With CTL",
    description:
      "Roofing and construction work in Broussard, Lafayette and across Acadiana. Send a résumé and we will call you.",
    path: "/careers/",
  } satisfies PageMeta,

  heading: "Work here",
  lede: "We hire local and we keep people. If you can do the work and show up when you said you would, we would rather hear from you than not.",

  /**
   * Careers was the one interior page opening on bare navy while every
   * other one carried a photograph. A crew on a ridge is the honest
   * image for it: it is CTL's own work, it shows the job rather than the
   * finished building, and the people in it are the people this page is
   * trying to hire more of.
   */
  photo: {
    src: "/ctl/gallery/metal-crew-ridge.jpg",
    alt: "Crew setting metal roof panels on the ridge of a brick building under construction",
    width: 1100,
    height: 508,
  } satisfies Photo,

  /**
   * ⚠️ Empty until Robert says what CTL hires for and whether they are
   * hiring now. While it is empty the page runs as a general
   * application, which is honest — it does not name a job that may not
   * exist. Fill in the Role shape above and the openings list appears.
   */
  /**
   * ⚠️ FALSE until CTL confirms these are live vacancies with real
   * openings behind them. It controls two things, and both matter.
   *
   * It switches the section from "What we hire for" to "What's open",
   * and it gates the JobPosting structured data. That second one is the
   * important one: Google's JobPosting guidelines require a specific,
   * currently-open role. Emitting it for "kinds of work we hire for" is
   * a policy violation that earns a manual action, and it puts listings
   * into Google Jobs that nobody can actually apply to.
   *
   * The route is also live:false in lib/routes.ts today, so the page is
   * noindex regardless. Both switches need flipping deliberately.
   */
  postingsAreLive: false,

  /**
   * The work CTL hires for, from Robert's own list.
   *
   * ── TWO EDITS TO THAT LIST, BOTH DELIBERATE ─────────────────────
   * "DTD Salesmen" is here as "Door-to-door sales representative". A
   * gendered job title in a US job advertisement is EEOC exposure —
   * it reads as stating a preference for men, and it is the kind of
   * thing that is cheap to fix now and expensive to argue about later.
   * Same reasoning retitles "Construction Worker and Roofers" as a
   * role rather than a pair of nouns.
   *
   * ── FOUR ADDED, EACH EVIDENCED BY THE SITE ITSELF ───────────────
   * Sheet metal fabricator: the metal band on the home page is built
   * entirely on CTL forming its own copper and standing seam in the
   * shop, which is somebody's actual job.
   * Estimator: step two of the process band is "scope and estimate",
   * and the openBody on this very page already names the role.
   * Insurance claims specialist: the storm-damage page is built around
   * claims, and a Facebook review thanks a named person for "fighting
   * to get our roof replaced".
   * Consumer financing specialist: CTL's own financing page offers to
   * put applicants in touch with one by name.
   *
   * None of the four is invented; each is a job the site already says
   * somebody at CTL does. Cut any that are wrong.
   * ────────────────────────────────────────────────────────────────
   */
  roles: [
    {
      slug: "roofer",
      title: "Roofer / construction crew",
      summary:
        "The work itself — tear-off, dry-in, and putting the new roof on. Most people here started on a crew.",
      does: [
        "Tear-off, decking repair, underlayment and finish roofing",
        "Shingle, metal and flat systems across residential and commercial",
        "Leaving the site cleaner than the crew found it — this gets checked",
      ],
      needs: [
        "Comfortable working at height, on a pitch, through a Louisiana summer",
        "Turning up on the day you said you would",
      ],
    },
    {
      // Added when a fourteenth was wanted to square the grid, which is
      // the wrong reason on its own — see the note above about not
      // inventing jobs for layout. This one survives the test on its
      // own evidence: the openBody further down this file already names
      // "a good roofer, carpenter or estimator" as the three worth
      // making room for, the form's own hint lists framing, and
      // remodeling and outdoor living are two of the five services.
      // Roofer and estimator were already here; carpenter was the gap.
      slug: "carpenter",
      title: "Carpenter",
      summary:
        "Framing, decking, siding and trim — the work that holds up everything the roof sits on, and most of what a renovation actually is.",
      does: [
        "Framing and structural repair, including rotten decking and rafters",
        "Decks, patio covers and exterior carpentry on outdoor living jobs",
        "Siding, soffit, fascia and interior trim on renovation work",
      ],
      needs: [
        "Carpentry experience across framing and finish work",
        "Your own hand tools, and knowing which one the job wants",
      ],
    },
    {
      slug: "construction-manager",
      title: "Construction manager",
      summary:
        "Running jobs against the written scope: crews, sequence, materials and the homeowner's expectations.",
      does: [
        "Owning a set of live jobs from mobilisation to final walkthrough",
        "Scheduling crews, subs and material drops so nobody waits on anybody",
        "Being the person the homeowner calls, and answering",
      ],
      needs: [
        "Experience running residential or commercial construction jobs",
        "A valid driver's license — this role is on sites daily",
      ],
    },
    {
      slug: "inspector-technician",
      title: "Construction inspector / technician",
      summary:
        "Getting on the roof, finding what is actually wrong, and writing it down so the scope is honest before anyone quotes it.",
      does: [
        "Roof and property inspections, documented with photographs",
        "Diagnosing leaks and storm damage rather than guessing at them",
        "Writing findings a homeowner and an adjuster can both follow",
      ],
      needs: [
        "Roofing or building knowledge deep enough to tell wear from damage",
        "Comfortable on ladders and steep roofs",
      ],
    },
    {
      slug: "sheet-metal-fabricator",
      title: "Sheet metal fabricator",
      summary:
        "Forming panel, flashing, valley and hip in the shop. The copper on the home page came off this bench.",
      does: [
        "Brake and roll-forming standing seam panel and custom flashing",
        "Copper, steel and aluminium, cut and folded to the job's measurements",
        "Keeping tolerances tight enough that the detail closes on the roof",
      ],
      needs: [
        "Sheet metal experience, or the hands to be taught it properly",
        "Reading measurements and shop drawings without a second opinion",
      ],
    },
    {
      slug: "estimator",
      title: "Estimator",
      summary:
        "Turning an inspection into a scope and a number that holds up when the job runs.",
      does: [
        "Measuring and scoping roofing, siding, window and renovation work",
        "Pricing material and labour against what the job actually takes",
        "Writing the estimate the customer signs and the crew builds to",
      ],
      needs: [
        "Construction estimating experience, roofing especially",
        "Being right about numbers more reliably than most people are",
      ],
    },
    {
      slug: "insurance-claims-specialist",
      title: "Insurance claims specialist",
      summary:
        "Standing between a homeowner and an adjuster, with the documentation to make the case.",
      does: [
        "Documenting storm damage to the standard a carrier will accept",
        "Meeting adjusters on site and holding the scope where it should be",
        "Keeping homeowners told what is happening while claims move slowly",
      ],
      needs: [
        "Property claims experience, from either side of the table",
        "The patience to chase something for weeks without dropping it",
      ],
    },
    {
      slug: "structural-engineer",
      title: "Structural engineer",
      summary:
        "The engineering judgement behind framing, load paths and anything that needs a stamp.",
      does: [
        "Assessing structural damage and specifying the repair",
        "Reviewing framing and load paths on renovation and rebuild work",
        "Sealed drawings and letters where the work or the permit needs them",
      ],
      needs: [
        "Professional Engineer license in Louisiana",
        "Residential and light commercial structural experience",
      ],
    },
    {
      slug: "facilities-maintenance",
      title: "Facilities maintenance & management",
      summary:
        "Keeping the shop, the yard, the fleet and the equipment in a state that does not slow the crews down.",
      does: [
        "Maintaining the Broussard shop, yard and material storage",
        "Vehicle and equipment upkeep, scheduling and records",
        "Spotting what is about to fail before it fails on a job day",
      ],
      needs: [
        "Practical maintenance skill across building, vehicle and equipment",
        "A valid driver's license",
      ],
    },
    {
      slug: "sales-representative",
      title: "Door-to-door sales representative",
      summary:
        "Knocking neighbourhoods after weather, and booking free assessments for people who need one.",
      does: [
        "Canvassing storm-affected areas and talking to homeowners",
        "Booking assessments and handing them to the inspection team",
        "Representing CTL well enough that the next door opens easier",
      ],
      needs: [
        "Comfortable starting conversations with strangers, all day",
        "A valid driver's license and your own transport",
      ],
    },
    {
      slug: "customer-relations",
      title: "Customer relations",
      summary:
        "The voice on the phone. Often the only person a customer speaks to between signing and starting.",
      does: [
        "Answering calls, scheduling assessments and chasing loose ends",
        "Keeping customers updated without being asked to",
        "Handling the awkward calls properly rather than passing them on",
      ],
      needs: [
        "Composure with people who are stressed, wet, or both",
        "Writing and record-keeping you would be happy to have read back",
      ],
    },
    {
      slug: "consumer-financing-specialist",
      title: "Consumer financing specialist",
      summary:
        "Helping homeowners work out how to pay for the work, and finding terms they can live with.",
      does: [
        "Walking customers through prequalification and lender options",
        "Working backwards from the monthly figure someone can actually afford",
        "Handling the applications the portal turns down or prices badly",
      ],
      needs: [
        "Consumer lending or home improvement finance experience",
        "Explaining rates and terms plainly, without overselling them",
      ],
    },
    {
      slug: "marketing",
      title: "Marketing",
      summary:
        "Making sure the people who need a roofer in Acadiana have heard of this one.",
      does: [
        "Local campaigns, social, and the company's own photography",
        "Keeping the site, listings and reviews current and accurate",
        "Measuring what actually produced calls, not what looked busy",
      ],
      needs: [
        "Marketing experience, local and trade-focused rather than corporate",
        "Writing that sounds like a person and not a brochure",
      ],
    },
    {
      slug: "administration",
      title: "Administration",
      summary:
        "Permits, paperwork, payments and documents — the part of the job that keeps every other part legal.",
      does: [
        "Permits, certificates, warranty registration and job files",
        "Invoicing, payment tracking and supplier paperwork",
        "Keeping records straight enough to answer a question a year later",
      ],
      needs: [
        "Administrative experience, construction or trades a real advantage",
        "The kind of organised where nothing quietly goes missing",
      ],
    },
    // `satisfies` alone would narrow this to the literal shape, which
    // has no `basis` or `location` because no role sets them yet — and
    // the page would then fail to compile for reading fields the type
    // says are optional. The assertion widens it back to Role[] while
    // `satisfies` still catches a mistyped key in here.
  ] satisfies Role[] as Role[],

  /** Heading over the list once there is one. */
  rolesHeading: "What we hire for",
  rolesLede:
    "These are the jobs that exist here. We are not always actively hiring for every one of them, so if yours is on this list send your résumé anyway and we will call you when it opens.",

  /** Shown in place of the openings list while `roles` is empty. */
  openHeading: "No posted openings right now",
  openBody:
    "That does not mean no work. Crews change through the season and a good roofer, carpenter or estimator is worth making room for. Send your résumé and we will keep it on file and call you when something opens.",

  /**
   * The stock questionnaire. Short on purpose — every extra field
   * loses applicants, and anything not asked here gets asked properly
   * on the phone.
   */
  questions: [
    {
      id: "experience",
      label: "How long have you been doing this kind of work?",
      kind: "choice",
      options: [
        "Less than a year",
        "1–3 years",
        "3–7 years",
        "More than 7 years",
      ],
      required: true,
    },
    {
      id: "trades",
      label: "What are you good at?",
      kind: "short",
      required: true,
      hint: "Roofing, framing, siding, gutters, estimating, driving — whatever fits.",
    },
    {
      id: "physical",
      label:
        "This work means ladders, steep roofs and Louisiana heat. Can you do that work?",
      kind: "choice",
      options: ["Yes", "Yes, with an accommodation", "No"],
      required: true,
      hint: "We ask because it is the job, not to screen anybody out. If you need an accommodation, say so and we will talk about it.",
    },
    {
      id: "licence",
      label: "Do you have a valid driver’s license?",
      kind: "choice",
      options: ["Yes", "No"],
      required: true,
      hint: "Some roles need one because the job involves driving to sites. Plenty do not.",
    },
    {
      id: "start",
      label: "When could you start?",
      kind: "short",
      required: false,
    },
    {
      id: "anything",
      label: "Anything else we should know?",
      kind: "long",
      required: false,
    },
  ] satisfies Question[],

  /** Copy around the file field itself. */
  resumeLabel: "Your résumé",
  resumeHint:
    "PDF or Word (.docx), up to 5MB. Older .doc files are not accepted — open it in Word and use Save As, PDF. If you do not have a résumé written up, attach anything that lists where you have worked; we are not grading it.",

  /** What happens next, so nobody is left wondering. */
  afterHeading: "What happens next",
  after: [
    "Someone in the office reads it — not a filter, a person.",
    "If it looks like a fit we call you, usually within a week.",
    "If it is not a fit right now we keep it on file for a year and call you if something opens up. After that it is deleted automatically — ask sooner and we will delete it sooner.",
  ],

  cta: {
    heading: "Rather just talk?",
    body: "Call the office. Ask for whoever is running crews this week — that is the person who actually knows what is open.",
  } satisfies CtaCopy,
};
