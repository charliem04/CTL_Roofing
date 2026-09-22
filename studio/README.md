# The gallery studio

The editor the CTL office uses to manage the photographs at
`/gallery/` and the band on the home page. It is a Sanity Studio; it is
hosted by Sanity, not by this site.

Setup, the one-off import, the deploy hook, and the day-to-day:
**[`../docs/GALLERY-CMS.md`](../docs/GALLERY-CMS.md)**.

```bash
cp .env.example .env    # SANITY_STUDIO_PROJECT_ID at minimum
npm install
npm run dev             # http://localhost:3333
npm run deploy          # → <hostname>.sanity.studio
```

## What is in here

| Path | |
| --- | --- |
| `schemas/gallery.ts` | The one document: an ordered, drag-reorderable list |
| `schemas/galleryPhoto.ts` | One photograph — image, alt, caption, category, featured |
| `schemas/galleryCategories.ts` | The studio's copy of the five categories. **Not the source of truth** — see the file |
| `scripts/import-gallery.mjs` | The one-off that brought the original forty photographs in |
| `import/gallery.migration.json` | What the previous CMS held, as it held it |

`scripts/` and `import/` can both be deleted once the gallery has been
live from Sanity for a while. Git keeps them.

## The site does not depend on this package

`ctl-roofing` reads the gallery over Sanity's HTTP API and never
imports anything from here, with one exception: `scripts/gallery.mjs`
reads `schemas/galleryCategories.ts` as text, to check that the
dropdown the studio offers and the categories the site can render are
still the same five things. That check fails the build if the file is
missing, so do not move it without updating the path there.
