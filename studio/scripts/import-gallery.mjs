#!/usr/bin/env node
/**
 * ════════════════════════════════════════════════════════════════════
 *  THE ONE-OFF IMPORT — forty photographs, once.
 *
 *  Run this exactly once, when the Sanity project is new and empty. It
 *  reads import/gallery.migration.json — the file the Sveltia CMS used
 *  to write, moved here and otherwise untouched — uploads each
 *  photograph from ctl-roofing/public/, and writes the single `gallery`
 *  document in the order the JSON lists them.
 *
 *  ── THE ALT TEXT IS NOT REGENERATED, REPHRASED OR TIDIED ────────────
 *
 *  Somebody looked at each of these forty frames and wrote down what
 *  was in it. "Crew setting metal roof panels on a commercial building
 *  still in its ZIP sheathing" is a sentence that required knowing what
 *  ZIP sheathing is and seeing that it was still exposed. That is the
 *  entire value of the field, and it is not recoverable from the file
 *  name or from a model looking at the photo afterwards.
 *
 *  So alt, caption, category and featured are copied across verbatim.
 *  This script does not have an opinion about them. The only thing it
 *  adds is the asset reference, and the only thing it drops is `src` —
 *  the path to a file in the repository, which is what Sanity replaces.
 *
 *  ── IDEMPOTENCE, OR THE HONEST LACK OF IT ───────────────────────────
 *
 *  Assets are deduplicated by Sanity on content hash, so re-running
 *  will not fill the dataset with copies of the same photograph. The
 *  document write is `createOrReplace`, so a second run overwrites the
 *  gallery with the contents of this JSON file — which is correct while
 *  the JSON is still the truth, and destructive the moment somebody has
 *  edited the gallery in the studio. It refuses to run if the document
 *  already has photos in it, unless you pass --force.
 *
 *  Usage:
 *    cd studio && cp .env.example .env    # fill in the three values
 *    npm run import -- --dry-run          # says what it would do
 *    npm run import
 * ════════════════════════════════════════════════════════════════════
 */
import { readFileSync, existsSync, statSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const STUDIO = resolve(HERE, "..");
const REPO = resolve(STUDIO, "..");
const SOURCE = join(STUDIO, "import", "gallery.migration.json");
const PUBLIC_DIR = join(REPO, "ctl-roofing", "public");
const API_VERSION = "2024-10-01";
const GALLERY_ID = "gallery";

const argv = process.argv.slice(2);
const DRY = argv.includes("--dry-run");
const FORCE = argv.includes("--force");

/* ── Environment ──────────────────────────────────────────────────── */

// .env is not read by node itself and there is no dotenv here, so read
// it by hand. Only the three names this script uses, and only when the
// variable is not already set — an exported value always wins.
function loadEnvFile() {
  const path = join(STUDIO, ".env");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const value = m[2].replace(/^["']|["']$/g, "");
    if (process.env[m[1]] === undefined && value) process.env[m[1]] = value;
  }
}
loadEnvFile();

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET || "production";
const token = process.env.SANITY_IMPORT_TOKEN;

function die(message) {
  console.error(`[import] ${message}`);
  process.exit(1);
}

if (!projectId) die("SANITY_STUDIO_PROJECT_ID is not set (studio/.env).");
if (!token && !DRY) {
  die(
    "SANITY_IMPORT_TOKEN is not set. Create a token with Editor rights at\n" +
      "        sanity.io/manage → API → Tokens, put it in studio/.env, and\n" +
      "        delete it again once this has run."
  );
}

const api = `https://${projectId}.api.sanity.io/v${API_VERSION}`;

async function sanity(path, init = {}) {
  const res = await fetch(`${api}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });
  const body = await res.text();
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} on ${path}\n${body}`);
  }
  return body ? JSON.parse(body) : null;
}

/* ── What we are importing ────────────────────────────────────────── */

if (!existsSync(SOURCE)) die(`${SOURCE} is missing.`);
const source = JSON.parse(readFileSync(SOURCE, "utf8"));
const shots = Array.isArray(source.shots) ? source.shots : null;
if (!shots) die(`${SOURCE} has no "shots" array.`);

// Check every file before uploading any of them. A half-finished
// import leaves a gallery missing photos with no obvious sign of it,
// and finding out at photo 38 that photo 39 is not on disk is worse
// than finding out before anything was written.
const missing = [];
const noAlt = [];
for (const [i, shot] of shots.entries()) {
  const file = join(PUBLIC_DIR, shot.src ?? "");
  if (!shot.src || !existsSync(file) || !statSync(file).isFile()) {
    missing.push(`photo ${i + 1}: ${shot.src ?? "(no src)"}`);
  }
  if (typeof shot.alt !== "string" || shot.alt.trim().length < 3) {
    noAlt.push(`photo ${i + 1}: ${shot.src ?? "(no src)"}`);
  }
}
if (missing.length) {
  die(
    `${missing.length} photo file(s) not found under ctl-roofing/public:\n` +
      missing.map((m) => `        · ${m}`).join("\n")
  );
}
if (noAlt.length) {
  die(
    `${noAlt.length} entr(y/ies) have no usable alt text. Fix the source\n` +
      `        file rather than importing them blank:\n` +
      noAlt.map((m) => `        · ${m}`).join("\n")
  );
}

console.log(
  `[import] ${shots.length} photos in ${basename(SOURCE)}, all present on disk`
);

if (DRY) {
  for (const [i, s] of shots.entries()) {
    console.log(
      `      ${String(i + 1).padStart(2)}. ${s.src}` +
        `\n          ${s.category}${s.featured ? " · home page" : ""}` +
        `\n          alt: ${s.alt}` +
        (s.caption ? `\n          caption: ${s.caption}` : "")
    );
  }
  console.log("[import] --dry-run: nothing was uploaded or written.");
  process.exit(0);
}

/* ── Is the gallery already there? ────────────────────────────────── */

const existing = await sanity(
  `/data/query/${dataset}?query=` +
    encodeURIComponent(`*[_id == "${GALLERY_ID}"][0]{"n": count(shots)}`)
);
const already = existing?.result?.n ?? 0;
if (already > 0 && !FORCE) {
  die(
    `the gallery document already has ${already} photo(s) in it.\n` +
      `        This script replaces the whole list, so running it now would\n` +
      `        discard anything edited in the studio since. Pass --force if\n` +
      `        that is genuinely what you want.`
  );
}

/* ── Upload ───────────────────────────────────────────────────────── */

const MIME = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

async function uploadImage(src) {
  const file = join(PUBLIC_DIR, src);
  const ext = src.slice(src.lastIndexOf(".")).toLowerCase();
  const type = MIME[ext];
  if (!type) throw new Error(`${src}: not an image type this script uploads`);

  // Sanity hashes the body and returns the existing asset when the
  // same bytes have been uploaded before, so a re-run is cheap and
  // does not duplicate.
  const res = await sanity(
    `/assets/images/${dataset}?filename=${encodeURIComponent(basename(src))}`,
    {
      method: "POST",
      headers: { "Content-Type": type },
      body: readFileSync(file),
    }
  );
  return res.document;
}

const entries = [];
for (const [i, shot] of shots.entries()) {
  const asset = await uploadImage(shot.src);
  const { width, height } = asset.metadata?.dimensions ?? {};
  console.log(
    `[import] ${String(i + 1).padStart(2)}/${shots.length} ${shot.src} → ` +
      `${asset._id}${width ? ` (${width}×${height})` : ""}`
  );

  const entry = {
    _type: "galleryPhoto",
    // A stable key per photo rather than a random one, so a second run
    // produces the same document and the diff in Sanity's history is
    // empty rather than forty replaced rows.
    _key: shot.src.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, ""),
    image: { _type: "image", asset: { _type: "reference", _ref: asset._id } },
    alt: shot.alt,
    category: shot.category,
  };
  // Absent rather than empty: an optional field that is present and
  // blank reads in the studio as "somebody cleared this on purpose".
  if (shot.caption) entry.caption = shot.caption;
  if (shot.featured) entry.featured = true;
  entries.push(entry);
}

/* ── Write the document ───────────────────────────────────────────── */

await sanity(`/data/mutate/${dataset}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    mutations: [
      {
        createOrReplace: {
          _id: GALLERY_ID,
          _type: "gallery",
          shots: entries,
        },
      },
    ],
  }),
});

console.log(
  `[import] wrote ${entries.length} photos to the "${GALLERY_ID}" document ` +
    `in dataset "${dataset}".\n` +
    `      Open the studio, check the order, and publish.\n` +
    `      Then delete SANITY_IMPORT_TOKEN from studio/.env and revoke it.`
);
