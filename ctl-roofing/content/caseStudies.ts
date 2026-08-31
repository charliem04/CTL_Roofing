import type { CaseStudy, CtaCopy, PageMeta } from "./types";

/**
 * ════════════════════════════════════════════════════════════════════
 *  CASE STUDIES
 *
 *  The page type is built. The content is not, and this file is empty
 *  on purpose — a case study is a claim about a real job on a real
 *  street, and there is no version of inventing one that is not a lie
 *  about work CTL did for somebody.
 *
 *  So `caseStudies` stays `[]` until Robert sends projects. While it is
 *  empty the route stays `live: false` in lib/routes.ts: nothing links
 *  to it, the sitemap omits it, and the index page carries `noindex`.
 *  Adding the first study and flipping that one flag is the whole
 *  switch-on — no template work, no routing, no new components.
 *
 *  ── WHAT ONE LOOKS LIKE ─────────────────────────────────────────────
 *
 *  Fill this shape per job. Everything except `parish`, `service`,
 *  `completed`, `before` and `after` is required.
 *
 *    {
 *      slug: "broussard-hail-replacement",   // becomes the URL
 *      title: "Full replacement after hail", // what happened, plainly
 *      town: "Broussard",
 *      parish: "Lafayette Parish",           // groups it on /areas/
 *      service: "/services/roofing/",        // the way onward
 *      completed: "2026-04-18",              // newest sorts first
 *      problem: "…what the customer called about, and what we found",
 *      scope:   "…what the job actually turned out to be",
 *      materials: ["GAF Timberline HDZ", "synthetic underlayment"],
 *      effort:  "Two days, six-man crew",
 *      result:  "…what the customer ended up with",
 *      before: { src: "/ctl/cases/…-before.jpg", alt: "…", width, height },
 *      after:  { src: "/ctl/cases/…-after.jpg",  alt: "…", width, height },
 *      photos: [ …detail shots… ],
 *    }
 *
 *  Two rules for filling it in:
 *
 *  1. `before` and `after` come as a pair or not at all. A lone "after"
 *     is a gallery photo; a lone "before" is a problem with no answer.
 *     The template renders the comparison only when it has both.
 *  2. `problem` and `result` are where the persuasion lives. "Roof
 *     leaked, we fixed it" is a row in a spreadsheet. What the customer
 *     had been told by somebody else, what was actually wrong, and what
 *     it cost them to leave it — that is a case study.
 *
 *  ⚠️ See `caseStudies` in content/pending.ts.
 * ════════════════════════════════════════════════════════════════════
 */

export const caseStudies: CaseStudy[] = [];

export const caseStudiesHub = {
  meta: {
    title: "Case Studies — Jobs We Have Finished",
    description:
      "Completed roofing and construction projects across Acadiana: what the problem turned out to be, what the job became, and what the customer ended up with.",
    path: "/case-studies/",
  } satisfies PageMeta,

  heading: "Jobs, start to finish",
  lede: "Not a gallery. Each one is a job with the problem, the scope it turned into, and what it took — including the parts that did not go to plan.",

  /** Shown on the index while the collection is still empty. */
  emptyHeading: "The first ones are being written up",
  emptyBody:
    "Forty photographs of finished work are already in the gallery. These pages go further — the problem behind each job and what it took to put right.",

  cta: {
    heading: "Your roof, looked at properly",
    body: "The free assessment is where every one of these started. Someone comes out, gets on the roof, and tells you what they find.",
  } satisfies CtaCopy,
};

/** Newest first. Studies without a date sort to the end. */
export function caseStudiesByDate(): CaseStudy[] {
  return [...caseStudies].sort((a, b) =>
    (b.completed ?? "").localeCompare(a.completed ?? "")
  );
}
