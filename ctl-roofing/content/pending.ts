import type { CaseStudy, Post, Review, TeamMember } from "./types";

/**
 * ════════════════════════════════════════════════════════════════════
 *  PHASE 2 COLLECTIONS — typed, deliberately empty.
 *
 *  These exist now so the loader, the route registry and the components
 *  that will consume them are already the right shape. Each one is
 *  empty because the content does not exist yet, and inventing it is
 *  the one thing this file must never do.
 *
 *  Every empty collection has a matching entry in `pendingContent`
 *  below, which is what the <Pending> panels on the site actually
 *  render — so an unfinished section says what it is waiting for and
 *  who owes it, rather than showing filler.
 * ════════════════════════════════════════════════════════════════════
 */

export const team: TeamMember[] = [];
export const caseStudies: CaseStudy[] = [];
export const reviews: Review[] = [];
export const posts: Post[] = [];

export const pendingContent = {
  team: {
    needs:
      "Job titles for the eight crew headshots, plus confirmation of the name spellings — the site currently prints the filenames Robert sent verbatim (Alex Alverez, JP Bourdreaux). A line each in their own words would finish the section.",
    from: "Robert",
  },
  caseStudies: {
    needs:
      "Six to eight completed projects with before/after photos, the town, what the problem was, what the scope ended up being and what it took.",
    from: "Robert",
  },
  reviews: {
    needs:
      "Confirmation that customer reviews may be reproduced here, and the reviews themselves. Until then the Google review link stays the route to them.",
    from: "Robert",
  },
  licence: {
    needs:
      "The Louisiana contractor licence number, plus any manufacturer certifications — specifically whether CTL is FORTIFIED-certified, which is an insurance-discount trust badge in Louisiana.",
    from: "Robert",
  },
  financingTerms: {
    needs:
      "The financing partner's name, the real terms (APR and available terms in months) and the prequalification link. The payment estimator stays switched off until these are real — a monthly figure on the site is a number a customer will hold you to.",
    from: "Robert",
  },
  commercialProject: {
    needs:
      "A photo from a commercial job — a low-slope membrane, a coating in progress or a finished commercial metal roof — plus one or two reference properties if the owners are happy to be named.",
    from: "Robert",
  },
  videoDetail: {
    needs:
      "A working export of the second video — the file supplied is a 417KB truncated download that decodes one frame and stops. Plus titles in CTL's own words for each clip, and ideally captions, since the audio carries the whole message.",
    from: "Robert",
  },
  serviceArea: {
    needs: "The definitive service-area town list, before the town pages are built.",
    from: "Robert",
  },
};
