import type { CtaCopy, PageMeta, Photo } from "./types";

/**
 * ════════════════════════════════════════════════════════════════════
 *  MEET THE TEAM
 *
 *  Robert is real: real photograph, real role, his own words. The
 *  group photographs are real CTL photographs.
 *
 *  The eight individual portraits are not shot yet, so the grid uses
 *  abstract placeholder tiles — deliberately not photographs of people.
 *  A stock headshot of a stranger under a CTL job title would be a lie
 *  about who works here, and it is the one thing this page must not do.
 *  Names and roles are absent for the same reason: we do not know them,
 *  so we do not print them.
 *
 *  ⚠️ See `team` in content/pending.ts for the shot brief.
 * ════════════════════════════════════════════════════════════════════
 */

export const teamPage = {
  meta: {
    title: "Meet The Team — The Crew Behind CTL",
    description:
      "The people behind CTL Pro Construction in Broussard and Lafayette — a local crew, where the person who quotes your job is the person who shows up to do it.",
    path: "/team/",
  } satisfies PageMeta,

  heading: "The people on your roof",
  lede: "We hire here. That is easy to put on a website and harder to prove, so here is the crew — starting with the person whose name is on the company.",

  photo: {
    src: "/ctl/team.jpg",
    alt: "The CTL Pro Construction team at their Lafayette office",
    width: 1200,
    height: 800,
  } satisfies Photo,

  /** Real CTL photographs of the actual team at work. */
  gallery: [
    {
      src: "/ctl/office.jpg",
      alt: "The CTL office in Lafayette, staff at their desks and a meeting under way",
      width: 1000,
      height: 1333,
      caption: "The Lafayette office",
    },
    {
      src: "/ctl/crew-two-story.jpg",
      alt: "A CTL crew working on the roof of a two-story home",
      width: 1200,
      height: 652,
      caption: "On site",
    },
  ] satisfies Photo[],

  /**
   * How many portrait slots the grid holds. Each renders a placeholder
   * tile until a real headshot replaces it — no invented names.
   */
  portraitSlots: 8,
  portraitTiles: [
    "/ctl/team/portrait-1.jpg",
    "/ctl/team/portrait-2.jpg",
    "/ctl/team/portrait-3.jpg",
  ],
  /** Visitor-facing, not an internal note. */
  portraitNote: "Crew portraits are being shot. Faces to follow.",

  values: [
    {
      title: "The person who quotes it shows up",
      body: "No commissioned salesperson handing you to a crew who never saw the conversation.",
    },
    {
      title: "A production team, not just a foreman",
      body: "Someone supervises the job against our standards and keeps you updated while the crew works.",
    },
    {
      title: "Office staff who keep the paperwork",
      body: "Payments, invoices, estimates and permits tracked and logged — which matters most a year later, when someone asks for them.",
    },
  ],

  cta: {
    heading: "Meet them on your driveway",
    body: "The free assessment is the introduction. Someone from this crew comes out, looks at the roof, and tells you what they find.",
  } satisfies CtaCopy,
};
