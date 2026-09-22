import { gallery } from "./gallery";
import { galleryPhoto } from "./galleryPhoto";

/**
 * Gallery only, deliberately.
 *
 * team, reviews, case studies, careers and financing are still
 * TypeScript in ctl-roofing/content/. They move here once the gallery
 * has been through a few real edits and a few real deploys — moving
 * them all at once would make it impossible to tell which of them
 * broke.
 */
export const schemaTypes = [gallery, galleryPhoto];
