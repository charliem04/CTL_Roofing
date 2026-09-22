/**
 * ════════════════════════════════════════════════════════════════════
 *  THE FIVE CATEGORIES — the studio's copy of a list owned by the site.
 *
 *  This is NOT the source of truth. The source of truth is the
 *  TypeScript union in ctl-roofing/content/types.ts and the array of
 *  labels and service routes in ctl-roofing/content/gallery.ts, because
 *  each category maps to a service route that has to exist and is used
 *  in types across the site. A category is a business fact, not a
 *  content entry, and a CMS must not be able to invent one.
 *
 *  So this file is a mirror, and mirrors drift. ctl-roofing/scripts/
 *  gallery.mjs reads all three lists on every build and fails if they
 *  disagree — the same check that used to run against the Sveltia
 *  dropdown in public/admin/config.yml, pointed somewhere new.
 *
 *  The ids are kept one-per-line and quoted exactly like this because
 *  that check parses them. Reformat freely; keep `id:` and the quotes.
 * ════════════════════════════════════════════════════════════════════
 */
export const galleryCategories = [
  { id: "roofing", title: "Roofing" },
  { id: "metal", title: "Metal roofing" },
  { id: "outdoor", title: "Outdoor living" },
  { id: "remodeling", title: "Remodeling" },
  { id: "storm", title: "Storm response" },
] as const;

export type GalleryCategoryId = (typeof galleryCategories)[number]["id"];
