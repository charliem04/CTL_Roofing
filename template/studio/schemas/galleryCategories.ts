/**
 * ════════════════════════════════════════════════════════════════════
 *  THE CATEGORIES — the studio's copy of a list owned by the site.
 *
 *  This is NOT the source of truth. The source of truth is the
 *  TypeScript union in client-site/content/types.ts and the array of
 *  labels and service routes in client-site/content/gallery.ts, because
 *  each category maps to a service route that has to exist and is used
 *  in types across the site. A category is a business fact, not a
 *  content entry, and a CMS must not be able to invent one.
 *
 *  So this file is a mirror, and mirrors drift. client-site/scripts/
 *  gallery.mjs reads all three lists on every build and fails if they
 *  disagree — that check is the only thing
 *  keeping them honest, so do not weaken it.
 *
 *  The ids are kept one-per-line and quoted exactly like this because
 *  that check parses them. Reformat freely; keep `id:` and the quotes.
 * ════════════════════════════════════════════════════════════════════
 */
export const galleryCategories = [
  // TODO(client): must match the union in site/content/types.ts and
  // the array in site/content/gallery.ts, exactly. `npm run gallery`
  // fails the build if any of the three disagree.
  { id: "category-one", title: "Category one" },
  { id: "category-two", title: "Category two" },
  { id: "category-three", title: "Category three" },
] as const;

export type GalleryCategoryId = (typeof galleryCategories)[number]["id"];
