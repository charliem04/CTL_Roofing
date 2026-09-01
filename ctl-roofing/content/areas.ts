import type { CtaCopy, PageMeta, Photo } from "./types";
import { towns } from "./towns";

/**
 * ════════════════════════════════════════════════════════════════════
 *  AREAS WE SERVE — one hub, not sixteen town pages.
 *
 *  Sixteen near-identical pages with the town name swapped in is the
 *  doorway pattern search engines demote, and it would be worse than
 *  nothing. Individual town pages earn their place once there is a real
 *  local project to put on each one, which is why the case studies come
 *  first. Until then this page does the honest version of the job:
 *  where CTL works, grouped the way people here actually describe it.
 *
 *  ⚠️ The town list came from CTL’s own site and is unconfirmed —
 *  see `serviceArea` in content/pending.ts.
 * ════════════════════════════════════════════════════════════════════
 */

/** Parish order: home parish first, then by how many towns we work in. */
const PARISH_ORDER = [
  "Lafayette Parish",
  "Vermilion Parish",
  "St. Martin Parish",
  "Acadia Parish",
  "Iberia Parish",
  "St. Landry Parish",
];

export function townsByParish() {
  const groups = new Map<string, typeof towns>();
  for (const t of towns) {
    groups.set(t.parish, [...(groups.get(t.parish) ?? []), t]);
  }
  return PARISH_ORDER.filter((p) => groups.has(p)).map((parish) => ({
    parish,
    towns: (groups.get(parish) ?? []).slice().sort((a, b) => a.name.localeCompare(b.name)),
  }));
}

export const areas = {
  meta: {
    title: "Areas We Serve — Acadiana & South Louisiana",
    description:
      "Roofing and construction across Acadiana and South Louisiana — Lafayette, Broussard, Youngsville, New Iberia, Abbeville, Breaux Bridge and more.",
    path: "/areas/",
  } satisfies PageMeta,

  heading: "Where we work",
  lede: "Committed to local is the value the company runs on, so it is worth being specific about what local means. This is the ground CTL covers, parish by parish.",

  photo: {
    src: "/ctl/gallery/shingle-aerial-finished.jpg",
    alt: "Aerial view of a finished shingle roof on a brick home in Acadiana",
    width: 1100,
    height: 619,
  } satisfies Photo,

  /** What being local actually buys the customer. */
  points: [
    {
      title: "Based in Broussard, showroom in Lafayette",
      body: "Not a franchise running dispatch from another state. The people who quote the job live in the same weather it has to survive.",
    },
    {
      title: "Close enough to come back",
      body: "A 5-year labor warranty is only worth what the drive is. Everywhere on this page is within a comfortable morning’s drive of the shop.",
    },
    {
      title: "First on the road after weather",
      body: "Storms here do not arrive one house at a time. Being local is what decides whether you are on the list on day one or day nine.",
    },
  ],

  outside: {
    heading: "Not on the list?",
    body: "The list is where we work most, not a fence. If you are near the edge of it, call — for the right job we travel, and if we are genuinely too far away we would rather tell you that than waste your week.",
  },

  cta: {
    heading: "Book an assessment in your town",
    body: "Free roof and property assessment anywhere on this page. We look at the whole property, tell you plainly what needs doing, and put it in writing.",
  } satisfies CtaCopy,
};
