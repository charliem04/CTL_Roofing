# Site optimisation — what was measured, and what is worth doing

Every number here was measured against the real build in a real browser
(Chromium, 1366×900), not estimated. Where a standard recommendation
turned out to be wrong for this site, it says so and shows the figure.

_Measured on the build of 2026-09-11._

## The short version

The site is already in good shape. Cumulative Layout Shift is close to
zero on every page, the video is not downloaded until asked for, nothing
is served that should not be, and the photographs are already encoded
tightly enough that the usual "convert everything to WebP" advice makes
them **bigger**.

Four things were found and fixed while measuring. Everything else below
is a suggestion with a measured payoff attached, so it can be judged
against the effort rather than taken on faith.

## Fixed during this pass

| What | Why it mattered |
| --- | --- |
| `npm run build` exited 1 | Three over-length meta descriptions failed `scripts/seo.mjs`. Cloudflare Pages runs that command, so **the deploy would have failed**. |
| `three`, `@react-three/fiber`, `gsap` were installed and never imported | 33MB of `node_modules` and three supply-chain dependencies for nothing. The shipped bundle was byte-identical before and after removal, which confirms they were never bundled — the cost was install and build time, not download. |
| No `Strict-Transport-Security` header | Every time somebody types `ctlpro.com`, the first request goes out over plain HTTP. Now closed for a year after the first visit. |
| The display font was discovered late | Big Shoulders could not be requested until the stylesheet had downloaded and parsed — a second round trip in front of the largest text on every page, and a visible reflow from Arial Narrow once it landed. Now preloaded from the head. |

## Measured page weight

Uncompressed bytes, so these are **worst case** — Cloudflare serves
brotli, and the compression column shows what actually crosses the wire.

| Page | Requests | Total | JS | Images | LCP | CLS |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | 46 | 2077 KB | 634 KB | 911 KB | 472 ms | 0.004 |
| `/services/` | 46 | 1946 KB | 579 KB | 834 KB | 1008 ms | 0.003 |
| `/gallery/` | 64 | 2562 KB | 576 KB | 1536 KB | 160 ms | 0.000 |
| `/storm-damage/` | 39 | 1322 KB | 634 KB | 147 KB | 176 ms | 0.002 |
| `/contact/` | 37 | 1219 KB | 576 KB | 215 KB | 180 ms | 0.000 |
| `/reviews/` | 38 | 1110 KB | 592 KB | 40 KB | 1232 ms | 0.025 |
| `/careers/` | 40 | 1270 KB | 593 KB | 148 KB | 160 ms | 0.011 |
| `/areas/` | 38 | 1188 KB | 576 KB | 131 KB | 164 ms | 0.001 |

**CLS is the number to be pleased about.** Google's "good" threshold is
0.1 and the worst page here is 0.025. That is the payoff from every
image carrying explicit `width` and `height` — which is now enforced by
`scripts/gallery.mjs` rather than remembered.

LCP was measured over localhost, so it excludes network latency and is
useful for comparing pages rather than as an absolute. `/reviews/` and
`/services/` being 5–6× the others is the signal worth keeping.

### What compression actually does

| | Raw | gzip | Saving |
| --- | --- | --- | --- |
| JS | 1033 KB | 335 KB | 68% |
| HTML | 1763 KB | 299 KB | 83% |
| CSS | 43 KB | 9 KB | 80% |

Cloudflare serves brotli, which is roughly another 15% better again. So
a page reading "1219 KB" above is closer to **250–350 KB** over the
wire, plus images.

## The recommendation NOT to follow: WebP

Converting the photography to WebP is the standard advice and it is
wrong here. Measured, re-encoding the existing JPEGs at quality 0.82:

```
    22KB ->   18KB  (18% smaller)  bath-tiled-shower.jpg
    20KB ->   16KB  (23% smaller)  bath-vanity-finished.jpg
    57KB ->   61KB  ( 7% LARGER )  carport-attached.jpg
    47KB ->   47KB  ( no change )  copper-sheet-shop.jpg
   267KB ->  293KB  (10% LARGER )  outdoor-deck.jpg
   175KB ->  167KB  ( 5% smaller)  office.jpg
   ─────────────────────────────────────────────────
   TOTAL  0.64MB -> 0.64MB         (0% smaller)
```

These JPEGs are already near the efficiency frontier for their quality.
A WebP pipeline would add a build dependency, a second copy of every
photograph, and `<picture>` elements throughout — to save nothing.

AVIF would genuinely beat these (typically 20–30% below a tuned JPEG),
but it needs a real encoder in the build and the saving is smaller than
the two items below. It is the *third* thing to do, not the first.

## Suggestions, in the order they are worth doing

### 1. The gallery's 1536 KB

`/gallery/` loads 32 thumbnails. They are already `loading="lazy"` and
already pre-cropped to 640×480, so the work left is *how many* start at
once rather than how big each one is: rendering the first row or two and
revealing the rest on scroll would cut the initial figure by two thirds.

Worth doing when the gallery grows past ~50 photos. At 32 it is a page
people deliberately opened to look at pictures.

### 2. `/reviews/` and `/services/` LCP

Both measured 5–6× the other pages. `/services/` is carrying an 182 KB
hero photograph; `/reviews/` has no large image at all, which points at
layout or font rather than bytes. Worth a look with the network throttled
before changing anything — this is the one finding here that is a lead
rather than a conclusion.

### 3. The 110 KB polyfills chunk

Next ships a legacy polyfill bundle sized by `browserslist`. This site
has no stated browser targets, so it gets the conservative default. A
`browserslist` key of `"defaults and supports es6-module"` would drop
most of it for the browsers this audience actually uses. Measure before
and after; the chunk is cached hard, so the saving is first-visit only.

### 4. The logo, and why it is last rather than first

`public/ctl/logo.png` is 552×219 and 40 KB, drawn at 141×56 — twice the
pixels a 2× display needs. A 282×112 resample measured 19 KB and is
indistinguishable from the original at the size it is actually drawn
(compared side by side in a browser at 2×).

It is last rather than first because the obvious version of the argument
is wrong twice over:

- **It is not 20 KB per page.** `/ctl/*` is cached for a day and it is
  the same URL on all 22 pages, so it is one download per visitor per
  day — not one per page view.
- **This file is also the structured-data logo.** `client.logoPath`
  feeds `Organization.logo` in the JSON-LD, which is what Google reads
  for a knowledge panel. Halving the only copy trades rich-result
  resolution for a cached 20 KB.

If it is worth doing, do it as **two files** — keep the full-resolution
original for the JSON-LD and point the header and footer `<img>` at a
282 px copy — rather than by shrinking the shared one. And re-export
from the original artwork rather than resampling the PNG.

The logo was deliberately **not** changed in this pass.

## What is already right, and should stay that way

- **The video is not downloaded.** 10 MB, `preload="none"`, on `/video/`
  only. This is the single biggest asset in the repository and it costs
  visitors nothing until they press play.
- **Caching is correct.** `/_next/static/*` is immutable for a year;
  `/ctl/*` is a day with revalidation, because a job photo gets replaced
  at the same filename.
- **No source maps ship.** Verified by `scripts/harden.mjs` on every
  build.
- **Every image declares its dimensions**, which is why CLS is ~0.
- **Static export.** No server to be slow, no cold start, no runtime.
- **Fonts.** Ten files ship (181 KB) but only the five `woff2` are ever
  downloaded — the `woff` twins are legacy fallbacks no current browser
  asks for. `font-display: swap` is set, and the display face is now
  preloaded by `scripts/fonts.mjs`, which reads the hashed filename out
  of the built CSS rather than hard-coding it. A hand-written preload
  would survive exactly until the next font package update and then
  point at a 404.

## How to re-check any of this

```bash
npm run build      # gallery, csp, cms, fonts, seo, routes, harden
npm run routes     # regenerate docs/ROUTE-MAP.md, verify every link
npm run harden     # secrets, stray files, security headers
```

The performance figures came from driving the built site in Chromium and
reading the Performance Observer API; the scripts for that are throwaway
and are not in the repository, because a number measured once and written
down beats a benchmark nobody runs twice.
