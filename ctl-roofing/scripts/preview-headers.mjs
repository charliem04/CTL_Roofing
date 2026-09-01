/**
 * Add the preview-only response headers to the built output.
 *
 * `public/_headers` is a static file copied verbatim into out/, so it
 * cannot branch on an env var the way robots.ts and the page metadata
 * can. This appends to the built copy instead, leaving the source file
 * as the single description of production headers.
 *
 * X-Robots-Tag is here rather than only in the pages because it covers
 * what a <meta> tag cannot: the PDFs, images and any non-HTML file
 * Google will happily index on its own.
 *
 * Runs only from `npm run preview:build`. A production build never
 * calls it, so out/_headers is exactly public/_headers there.
 */
import { appendFileSync, existsSync, readFileSync } from "node:fs";

const FILE = "out/_headers";
const MARKER = "# ── preview build ──";

const BLOCK = `

${MARKER}
# This deploy is a replica of a real company's site on a temporary URL.
# Keep every crawler off it, including from files that cannot carry a
# meta tag. Removing this block is how the preview starts competing
# with ctlpro.com in search.
/*
  X-Robots-Tag: noindex, nofollow, noarchive, nosnippet, noimageindex
`;

if (!existsSync(FILE)) {
  console.error(
    `[preview] ${FILE} does not exist — run the build first, and check that public/_headers is still there.`
  );
  process.exit(1);
}

if (readFileSync(FILE, "utf8").includes(MARKER)) {
  console.log("[preview] headers already present, nothing to do");
  process.exit(0);
}

appendFileSync(FILE, BLOCK);
console.log("[preview] X-Robots-Tag: noindex added to out/_headers");
