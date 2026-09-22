import { defineField, defineType } from "sanity";

/**
 * ════════════════════════════════════════════════════════════════════
 *  THE GALLERY — one document, one ordered list.
 *
 *  ── WHY ONE DOCUMENT AND NOT ONE DOCUMENT PER PHOTO ─────────────────
 *
 *  Order is content here. The gallery page shows the list in order and
 *  the home band shows the first of the featured ones, so "which photo
 *  is first" is an editorial decision somebody makes by looking at the
 *  page — not a sort key derived from a date or a filename.
 *
 *  Sanity arrays are drag-reorderable out of the box. Documents are
 *  not: ordering a document list means an extra rank field, a plugin to
 *  maintain it, and a second thing that can be wrong. For forty photos
 *  edited by one office, the array is the smaller machine.
 *
 *  Two things follow from it that are worth knowing:
 *
 *    · Publishing is atomic. One publish moves the whole gallery from
 *      one consistent state to the next, which means one deploy hook
 *      firing per edit session rather than one per photo.
 *    · Two people editing the gallery at the same time will contend on
 *      the same document. Sanity merges at the field level and shows
 *      presence, so this is visible rather than silent — but it is the
 *      real cost, and the reason to revisit this if the gallery ever
 *      grows past a few hundred photos or gains a second editor who
 *      works in it daily.
 * ════════════════════════════════════════════════════════════════════
 */
export const gallery = defineType({
  name: "gallery",
  title: "Gallery",
  type: "document",
  fields: [
    defineField({
      name: "shots",
      title: "Photos",
      type: "array",
      of: [{ type: "galleryPhoto" }],
      description:
        "Drag to reorder. The order here is the order on /gallery/.",
      options: { layout: "grid" },
    }),
  ],
  preview: {
    select: { shots: "shots" },
    prepare({ shots }) {
      const n = Array.isArray(shots) ? shots.length : 0;
      return {
        title: "Gallery",
        subtitle: `${n} photo${n === 1 ? "" : "s"}`,
      };
    },
  },
});
