import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemas";

/**
 * ════════════════════════════════════════════════════════════════════
 *  the client ROOFING — the gallery editor.
 *
 *  Run locally with `npm run dev`, publish it to
 *  https://<name>.sanity.studio with `npm run deploy`. The deployed
 *  studio is what the office uses; it is hosted by Sanity, so there is
 *  no admin page on example.com any more and nothing to keep patched.
 *
 *  Sign-in is a Sanity account with a role on this project, invited
 *  from sanity.io/manage. That is the whole reason for this migration:
 *  the previous editor needed a GitHub account with write access to the
 *  repository per person, which is not a thing to ask of an office.
 *
 *  ── projectId AND dataset ARE NOT SECRETS ───────────────────────────
 *
 *  Both are public identifiers — they appear in every image URL the
 *  site serves. They come from the environment anyway, so that a second
 *  client's studio is a copy of this folder with a different .env
 *  rather than a fork with an edited constant.
 * ════════════════════════════════════════════════════════════════════
 */
const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET ?? "production";

if (!projectId) {
  throw new Error(
    "SANITY_STUDIO_PROJECT_ID is not set. Copy .env.example to .env and " +
      "fill it in — see docs/GALLERY-CMS.md."
  );
}

/** The gallery is one document, and there is exactly one of it. */
const GALLERY_ID = "gallery";

export default defineConfig({
  name: "client-site",
  title: "Example Company",
  projectId,
  dataset,

  plugins: [
    structureTool({
      // No document list to get lost in: the studio opens on the one
      // thing there is to edit. When team and reviews move here this
      // becomes a short list; until then, a list of one is a menu that
      // makes the user click to reach the only destination.
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Gallery")
              .id(GALLERY_ID)
              .child(
                S.document()
                  .schemaType("gallery")
                  .documentId(GALLERY_ID)
                  .title("Gallery")
              ),
          ]),
    }),
    // GROQ scratchpad. Worth keeping: when the build says a photo is
    // wrong, this is where you look at what the build actually fetched.
    visionTool({ defaultApiVersion: "2024-10-01" }),
  ],

  schema: {
    types: schemaTypes,
    // Nothing here is created from the "+" button — the gallery
    // document already exists and a second one would be ignored by the
    // build, which fetches this id and no other.
    templates: (prev) => prev.filter((t) => t.schemaType !== "gallery"),
  },

  document: {
    newDocumentOptions: (prev) =>
      prev.filter((item) => item.templateId !== "gallery"),
    actions: (prev, { schemaType }) =>
      schemaType === "gallery"
        ? // Deleting the gallery document would empty /gallery/ on the
          // next deploy, and there is no reason to ever want that. A
          // photo is removed from the list; the list itself stays.
          prev.filter(
            (action) =>
              !["delete", "duplicate", "unpublish"].includes(
                String(action.action)
              )
          )
        : prev,
  },
});
