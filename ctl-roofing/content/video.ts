import type { CtaCopy, PageMeta } from "./types";

/**
 * ════════════════════════════════════════════════════════════════════
 *  VIDEO
 *
 *  CTL's own footage, re-encoded for the web: H.264 at 540px wide with
 *  faststart, so it begins before it has finished downloading. Nothing
 *  autoplays and nothing preloads — a 10MB file has no business
 *  downloading itself because someone scrolled past it.
 *
 *  ⚠️ Two source files were supplied. Only one is intact: the other
 *  (417KB for 51 seconds of 1080×1920) is a truncated download that
 *  decodes one frame and then fails. It needs re-exporting at source
 *  before it can go anywhere near a page.
 *
 *  ⚠️ Descriptions here are written from what is visible in the frames.
 *  Titles in CTL's own words, and captions for accessibility, are
 *  pending — see `videoDetail` in content/pending.ts.
 * ════════════════════════════════════════════════════════════════════
 */

export type Clip = {
  slug: string;
  title: string;
  /** What is visibly happening — not a claim about what is said */
  description: string;
  src: string;
  poster: string;
  /** Seconds, for the schema and the runtime label */
  duration: number;
  width: number;
  height: number;
};

export const videoPage = {
  meta: {
    title: "Video — On The Job With CTL",
    description:
      "Video from CTL Pro Construction job sites across Acadiana: what a roof replacement actually looks like while it is happening.",
    path: "/video/",
  } satisfies PageMeta,

  heading: "On the job",
  lede: "Photographs show you a finished roof. Video shows you the part you would otherwise only see from the driveway.",

  cta: {
    heading: "See it on your own roof",
    body: "The free assessment is the same walkthrough, on your property, with photographs of whatever we find up there.",
  } satisfies CtaCopy,
};

export const clips: Clip[] = [
  {
    slug: "job-walkthrough",
    title: "A job in progress",
    description:
      "A CTL team member walks through a replacement while the crew works behind him — underlayment down, ladder up, the old roof coming off.",
    src: "/ctl/video/job-walkthrough.mp4",
    poster: "/ctl/video/job-walkthrough.jpg",
    duration: 104,
    width: 540,
    height: 960,
  },
];
