import type { GalleryCategory, GalleryShot } from "./types";
import data from "./gallery.json";
import derived from "./gallery.generated.json";

/**
 * ════════════════════════════════════════════════════════════════════
 *  RECENT WORK — every photo, in one place.
 *
 *  This is the single source for both the home page band and the
 *  gallery page: the band shows the ones marked `featured`, the page
 *  shows all of them. Before, the two were separate lists, which meant
 *  the "full gallery" could end up missing the photos on the home page.
 *
 *  Alt text describes what is actually visible in the frame. These are
 *  CTL's own job photographs — no stock, and nothing captioned as
 *  something it isn't.
 *
 *  ── WHY THE PHOTOS LIVE IN JSON NOW ─────────────────────────────────
 *
 *  They used to be an array literal in this file, which is the nicer
 *  thing to read and the wrong thing to hand to whoever is actually
 *  going to maintain the gallery. Adding a job photo meant editing
 *  TypeScript, and a misplaced comma in a source file does not produce
 *  a gallery with one photo missing — it produces a site that does not
 *  build.
 *
 *  So the list moved to content/gallery.json, which the CMS at /admin/
 *  writes (see public/admin/config.yml). This file is now the part that
 *  a CMS must never own: the category definitions, which map to real
 *  service routes, and the validation that stands between an edit made
 *  in a browser by somebody who is not a developer and the pages that
 *  render it.
 *
 *  Categories deliberately stay here as code. They are a TypeScript
 *  union used across the site, each one points at a route that has to
 *  exist, and there are five of them — a set that changes when the
 *  business changes, not when a photo is added. The CMS offers them as
 *  a fixed dropdown; scripts/gallery.mjs fails the build if that
 *  dropdown and this list ever disagree.
 *
 *  ── AND WHY THE PIXEL DIMENSIONS ARE IN A SECOND FILE ───────────────
 *
 *  Every photo needs its intrinsic width and height so the grid can
 *  reserve the box before the image decodes. Those numbers cannot live
 *  in gallery.json, because a git-based CMS writes that file from its
 *  own model of the fields its config declares — anything it was not
 *  told about is liable to be dropped on the next save. Declaring them
 *  as hidden fields would probably survive, and "probably" is the wrong
 *  guarantee for the values that stop the whole gallery reflowing.
 *
 *  So they live in gallery.generated.json, which the CMS never opens and
 *  scripts/gallery.mjs maintains by looking at the files themselves —
 *  pixel dimensions read out of each image header, and whether a
 *  pre-cropped thumbnail exists beside it. The CMS owns what a person
 *  writes; the build owns what a file measures. Neither can damage the
 *  other.
 * ════════════════════════════════════════════════════════════════════
 */

export const galleryCategories: {
  id: GalleryCategory;
  label: string;
  /** The service this work belongs to, for the way onward */
  service?: string;
}[] = [
  { id: "roofing", label: "Roofing", service: "/services/roofing/" },
  { id: "metal", label: "Metal roofing", service: "/services/roofing/#metal" },
  {
    id: "outdoor",
    label: "Outdoor living",
    service: "/services/outdoor-living/",
  },
  {
    id: "remodeling",
    label: "Remodeling",
    service: "/services/remodeling-restoration/",
  },
  { id: "storm", label: "Storm response", service: "/storm-damage/" },
];

const CATEGORY_IDS = new Set<string>(galleryCategories.map((c) => c.id));

/**
 * Keep a photo, or drop it and say why.
 *
 * ── WHY THIS DROPS RATHER THAN THROWS ───────────────────────────────
 *
 * scripts/gallery.mjs is the loud half of this: it runs before the
 * build, checks the same rules against the file on disk plus the things
 * only a filesystem can answer, and fails with a message naming the
 * photo. That is where a bad edit is meant to be caught, because a
 * build that stops with an explanation is a five-minute problem.
 *
 * This is the quiet half, and it exists for the case where the loud one
 * did not run. A marketing hire publishing a photo at 4pm should not be
 * able to take down /gallery/ — or the home page, which renders the
 * featured subset — with a missing alt attribute. One photo silently
 * absent is recoverable; a page that throws while rendering is not.
 *
 * The two together mean the ordinary path is "the build tells you",
 * and the worst path is "one photo is missing until someone looks".
 */
type CmsShot = Omit<GalleryShot, "width" | "height">;

function usable(shot: unknown, index: number): shot is CmsShot {
  const s = shot as Partial<CmsShot> | null;
  const fail = (why: string) => {
    // Visible in the build log and in the dev console, silent in a
    // production browser — there is no user-facing action to take.
    console.warn(
      `[gallery] photo ${index + 1} (${
        (s && s.src) || "no src"
      }) dropped: ${why}`
    );
    return false;
  };

  if (!s || typeof s !== "object") return fail("not an object");
  if (typeof s.src !== "string" || !s.src.startsWith("/")) {
    return fail("src must be a site-absolute path starting with /");
  }
  // Alt text is not decoration. A photo with none is invisible to a
  // screen reader and to Google Images, which is most of the reason a
  // contractor keeps a gallery at all.
  if (typeof s.alt !== "string" || s.alt.trim().length < 3) {
    return fail("alt text is missing");
  }
  if (typeof s.category !== "string" || !CATEGORY_IDS.has(s.category)) {
    return fail(`category "${s.category}" is not one of the five defined here`);
  }
  return true;
}

type Derived = { w: number; h: number; thumb?: string };
const measured: Record<string, Derived | undefined> = derived;

/**
 * The photos, with their measured dimensions attached.
 *
 * A photo with no entry in the generated file is dropped rather than
 * rendered without width and height. Without them the browser cannot
 * reserve the box, so every image below it jumps as this one decodes —
 * one missing photo is a smaller fault than a gallery that shudders its
 * way down the page. scripts/gallery.mjs runs before every build and
 * every dev server precisely so this branch stays unreached.
 */
export const gallery: GalleryShot[] = (data.shots as unknown[])
  .filter(usable)
  // Annotated rather than inferred: without it TypeScript widens the
  // mapped element to a shape whose optional `thumb` is a required
  // `string | undefined`, and the narrowing filter below then fails to
  // line up with it.
  .map((shot): GalleryShot | null => {
    const size = measured[shot.src];
    if (!size || !(size.w > 0) || !(size.h > 0)) {
      console.warn(
        `[gallery] ${shot.src} has no measured size — run \`npm run gallery\`.`
      );
      return null;
    }
    return { ...shot, width: size.w, height: size.h, thumb: size.thumb };
  })
  .filter((shot): shot is GalleryShot => shot !== null);
