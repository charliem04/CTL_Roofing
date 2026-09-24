import { defineField, defineType } from "sanity";
import { galleryCategories } from "./galleryCategories";

/**
 * ════════════════════════════════════════════════════════════════════
 *  ONE PHOTOGRAPH.
 *
 *  An object rather than a document, because it lives inside the
 *  ordered array on the `gallery` document — see gallery.ts for why
 *  ordering is the whole point.
 *
 *  ── ON alt BEING REQUIRED HERE AND CHECKED AGAIN AT BUILD TIME ──────
 *
 *  `validation: required()` stops an editor publishing without alt
 *  text, and that is the right place to catch it: at the moment the
 *  person who knows what is in the frame is looking at the frame.
 *
 *  It is not, however, a guarantee. A required field is enforced by
 *  the studio, and the dataset can be written by other things — an
 *  import script, the CLI, the HTTP API, a colleague's experiment.
 *  Sanity validates on publish in the editor, not on write at the API.
 *  So the build re-checks it against the fetched data and fails naming
 *  the photo. Two checks, one of which cannot be bypassed.
 * ════════════════════════════════════════════════════════════════════
 */
export const galleryPhoto = defineType({
  name: "galleryPhoto",
  title: "Photo",
  type: "object",
  fields: [
    defineField({
      name: "image",
      title: "Photo",
      type: "image",
      // The editor picks the focal point; the build asks the CDN for a
      // 4:3 crop around it rather than centre-cropping a roofline out
      // of frame. See client-site/scripts/gallery.mjs.
      options: { hotspot: true },
      validation: (r) => r.required().error("Every entry needs a photograph."),
    }),
    defineField({
      name: "alt",
      title: "Alt text",
      type: "string",
      description:
        "What is actually in the frame — this is what a screen reader " +
        "reads aloud and what Google Images indexes. " +
        "Describe the frame, not the job: “Two fitters setting a panel " +
        "over underlayment on a low-slope section”, not “our work” and " +
        "not “Example Company Springfield”. TODO(client): rewrite this " +
        "example in the client's own trade, because it is the only " +
        "instruction the person uploading photos will read.",
      validation: (r) =>
        r
          .required()
          .min(3)
          .error("Alt text is required: describe what is in the frame.")
          .max(180)
          .warning("Long for alt text — a screen reader reads every word."),
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "string",
      description: "The short line under the photo. Optional.",
      validation: (r) => r.max(80).warning("The tile will clip a long caption."),
    }),
    defineField({
      name: "category",
      title: "Kind of work",
      type: "string",
      description:
        "Which filter it appears under, and which service page it links to.",
      options: {
        list: galleryCategories.map((c) => ({ value: c.id, title: c.title })),
        layout: "dropdown",
      },
      initialValue: "roofing",
      validation: (r) => r.required().error("Pick the kind of work."),
    }),
    defineField({
      name: "featured",
      title: "Also show on the home page",
      type: "boolean",
      description:
        "The band on the home page. Keep it to around eight — that band " +
        "is a taste of the work, not the whole gallery.",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: "caption",
      subtitle: "alt",
      category: "category",
      featured: "featured",
      media: "image",
    },
    prepare({ title, subtitle, category, featured, media }) {
      const label =
        galleryCategories.find((c) => c.id === category)?.title ?? category;
      return {
        // A photo with no caption is normal; falling back to the alt
        // text keeps every row in the list readable without opening it.
        title: title || subtitle || "Untitled photo",
        subtitle: [label, featured ? "home page" : null]
          .filter(Boolean)
          .join(" · "),
        media,
      };
    },
  },
});
