import type { CtaCopy, PageMeta, Photo } from "./types";

/**
 * ════════════════════════════════════════════════════════════════════
 *  MEET THE TEAM
 *
 *  Every photograph on this page is a real CTL photograph and every
 *  face is somebody who actually works here.
 *
 *  The crew names are taken verbatim from the filenames Robert
 *  supplied with the headshots — including the spellings. Nothing is
 *  normalised, because a surname is not ours to correct.
 *
 *  Roles are absent on purpose. We were sent faces and names, not job
 *  titles, and a guessed title under a real person's face is the one
 *  thing this page must not do.
 *
 *  ⚠️ See `team` in content/pending.ts — roles, and spelling
 *  confirmation, are still outstanding.
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
   * The crew, alphabetically — no ranking implied by the order.
   * Portraits are 4:5 crops of the headshots Robert supplied, held in
   * public/ctl/team/ under the same filename stem he used.
   */
  crew: [
    { name: "Alex Alverez", photo: "/ctl/team/alex-alverez.jpg" },
    { name: "Ceci Harper", photo: "/ctl/team/ceci-harper.jpg" },
    { name: "Jody Holliday", photo: "/ctl/team/jody-holliday.jpg" },
    { name: "JP Bourdreaux", photo: "/ctl/team/jp-bourdreaux.jpg" },
    { name: "Megan Chauvin", photo: "/ctl/team/megan-chauvin.jpg" },
    { name: "Paige Thacker", photo: "/ctl/team/paige-thacker.jpg" },
    { name: "Peyton Peltier", photo: "/ctl/team/peyton-peltier.jpg" },
    { name: "Scott Toups", photo: "/ctl/team/scott-toups.jpg" },
  ],
  /** Visitor-facing, not an internal note. */
  crewNote:
    "Not a stock photo among them. These are the people who answer the phone, price the job and get on the roof.",

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
