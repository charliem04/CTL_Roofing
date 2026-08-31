import type { CtaCopy, PageMeta } from "./types";

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
 *  2. THE QUESTIONS BELOW NEED AN EMPLOYMENT ATTORNEY'S EYE. Hiring
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
  /** "Full time", "Seasonal", "Sub-contract" — CTL's own words. */
  basis: string;
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
  lede: "We hire local and we keep people. If you can do the work and turn up when you said you would, we would rather hear from you than not.",

  /**
   * ⚠️ Empty until Robert says what CTL hires for and whether they are
   * hiring now. While it is empty the page runs as a general
   * application, which is honest — it does not name a job that may not
   * exist. Fill in the Role shape above and the openings list appears.
   */
  roles: [] as Role[],

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
      label: "Do you have a valid driver's licence?",
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
    "PDF or Word (.docx), up to 5MB. Older .doc files are not accepted — open it in Word and use Save As, PDF. If you do not have a résumé written up, attach anything that lists where you have worked; we are not marking it.",

  /** What happens next, so nobody is left wondering. */
  afterHeading: "What happens next",
  after: [
    "Someone in the office reads it — not a filter, a person.",
    "If it looks like a fit we call you, usually within a week.",
    "If it is not a fit right now we keep it on file rather than deleting it, and we will call when something changes.",
  ],

  cta: {
    heading: "Rather just talk?",
    body: "Call the office. Ask for whoever is running crews this week — that is the person who actually knows what is open.",
  } satisfies CtaCopy,
};
