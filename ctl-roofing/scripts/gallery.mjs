#!/usr/bin/env node
/**
 * ════════════════════════════════════════════════════════════════════
 *  GALLERY PREFLIGHT — everything the CMS cannot be asked to know.
 *
 *  content/gallery.json is written by a person in a browser at /admin/,
 *  not by a developer in an editor. That changes what the code around
 *  it owes them. Two things in particular:
 *
 *    1. Intrinsic pixel dimensions. Every photo needs width and height
 *       so the grid reserves its box before the image decodes —
 *       without them the page reflows as each one lands, which is the
 *       single most visible performance fault a photo-heavy page can
 *       have. Nobody uploading a job photo should have to open it in an
 *       image editor to find out it is 1100×825, so this reads the
 *       numbers out of the file header and records them in
 *       content/gallery.dimensions.json — a file the CMS never opens,
 *       so a save cannot drop the fields it was not told about.
 *
 *    2. Whether the file is actually there. A CMS commits the photo and
 *       the JSON entry in one operation, but a hand-edited path, a
 *       rename, or a half-applied merge all produce an entry pointing
 *       at nothing — which renders as a broken image on the page that
 *       exists to show off the work.
 *
 *  Run by `npm run build` and `npm run dev`, so the ordinary path never
 *  requires remembering it. Also available as `npm run gallery`.
 *
 *  ── ON READING IMAGE HEADERS BY HAND ────────────────────────────────
 *
 *  There is no image library in this project and this is not a good
 *  enough reason to add one. Width and height live in the first few
 *  dozen bytes of every format here, in documented, fixed positions;
 *  what follows reads exactly those bytes and nothing else. It decodes
 *  no pixels, allocates no bitmap, and cannot be made slow by a large
 *  photograph — only the header is ever read.
 * ════════════════════════════════════════════════════════════════════
 */
import { readFileSync, writeFileSync, existsSync, openSync, readSync, closeSync } from "node:fs";
import { join } from "node:path";

const JSON_PATH = "content/gallery.json";
const DERIVED_PATH = "content/gallery.generated.json";
const THUMB_DIR = "/ctl/gallery/thumb/";
const PUBLIC_DIR = "public";
const CMS_CONFIG = "public/admin/config.yml";

/** The five categories, as content/gallery.ts defines them. */
function categoriesFromSource() {
  const src = readFileSync("content/gallery.ts", "utf8");
  return new Set([...src.matchAll(/\bid:\s*"([a-z]+)"/g)].map((m) => m[1]));
}

/** The categories the CMS dropdown offers, as config.yml lists them. */
function categoriesFromCms() {
  if (!existsSync(CMS_CONFIG)) return null;
  const yml = readFileSync(CMS_CONFIG, "utf8");
  // The one `options:` list in the file belongs to the category field.
  const block = yml.match(/options:\s*\[([^\]]+)\]/);
  if (!block) return null;
  return new Set(
    block[1]
      .split(",")
      .map((s) => s.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean)
  );
}

/**
 * Intrinsic size of an image, from its header alone.
 *
 * Returns null for anything it does not recognise rather than guessing
 * — a wrong dimension is worse than a missing one, because a missing
 * one is reported and a wrong one silently distorts the grid.
 */
function imageSize(file) {
  const fd = openSync(file, "r");
  try {
    // 64KB covers a JPEG with a long EXIF block before its first frame.
    const buf = Buffer.alloc(65536);
    const read = readSync(fd, buf, 0, buf.length, 0);
    const b = buf.subarray(0, read);

    // ── PNG ──────────────────────────────────────────────────────────
    // 8-byte signature, then an IHDR chunk whose width and height are
    // big-endian uint32 at offsets 16 and 20.
    if (b.length > 24 && b.toString("hex", 0, 8) === "89504e470d0a1a0a") {
      return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
    }

    // ── GIF ──────────────────────────────────────────────────────────
    // "GIF87a"/"GIF89a", then little-endian uint16 width and height.
    if (b.length > 10 && b.toString("ascii", 0, 3) === "GIF") {
      return { width: b.readUInt16LE(6), height: b.readUInt16LE(8) };
    }

    // ── WebP ─────────────────────────────────────────────────────────
    // RIFF container; the three variants store the size differently.
    if (
      b.length > 30 &&
      b.toString("ascii", 0, 4) === "RIFF" &&
      b.toString("ascii", 8, 12) === "WEBP"
    ) {
      const kind = b.toString("ascii", 12, 16);
      if (kind === "VP8 ") {
        // Lossy: 14-bit dimensions after the 3-byte start code.
        return {
          width: b.readUInt16LE(26) & 0x3fff,
          height: b.readUInt16LE(28) & 0x3fff,
        };
      }
      if (kind === "VP8L") {
        // Lossless: 14 bits each, packed across four bytes.
        const bits = b.readUInt32LE(21);
        return {
          width: (bits & 0x3fff) + 1,
          height: ((bits >> 14) & 0x3fff) + 1,
        };
      }
      if (kind === "VP8X") {
        // Extended: 24-bit minus-one dimensions at a fixed offset.
        const w = b[24] | (b[25] << 8) | (b[26] << 16);
        const h = b[27] | (b[28] << 8) | (b[29] << 16);
        return { width: w + 1, height: h + 1 };
      }
      return null;
    }

    // ── JPEG ─────────────────────────────────────────────────────────
    // Walk the marker segments to the first start-of-frame, which is
    // the only place the real dimensions appear. Every SOFn except the
    // four that are not frames carries height then width as big-endian
    // uint16 at offsets 5 and 7 of the segment.
    if (b.length > 4 && b[0] === 0xff && b[1] === 0xd8) {
      let i = 2;
      while (i < b.length - 9) {
        if (b[i] !== 0xff) {
          i++; // resynchronise rather than give up on a padded stream
          continue;
        }
        const marker = b[i + 1];
        // Standalone markers with no length field.
        if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
          i += 2;
          continue;
        }
        const len = b.readUInt16BE(i + 2);
        const isFrame =
          marker >= 0xc0 &&
          marker <= 0xcf &&
          marker !== 0xc4 && // define Huffman table
          marker !== 0xc8 && // JPEG extension
          marker !== 0xcc; // define arithmetic coding
        if (isFrame) {
          return { width: b.readUInt16BE(i + 7), height: b.readUInt16BE(i + 5) };
        }
        if (len < 2) return null;
        i += 2 + len;
      }
    }
    return null;
  } finally {
    closeSync(fd);
  }
}

function run() {
  if (!existsSync(JSON_PATH)) {
    console.error(`[gallery] ${JSON_PATH} is missing.`);
    return false;
  }

  const raw = JSON.parse(readFileSync(JSON_PATH, "utf8"));
  const shots = Array.isArray(raw.shots) ? raw.shots : null;
  if (!shots) {
    console.error(`[gallery] ${JSON_PATH} has no "shots" array.`);
    return false;
  }

  // What the last run measured, for comparison only. Every photo is
  // re-measured below rather than skipped when an entry already exists:
  // replacing a job photo at the SAME filename is not an edge case here,
  // it is the documented assumption behind the /ctl/* cache rule in
  // public/_headers. Trusting a stale entry would keep serving the old
  // photo's aspect ratio to reserve a box for the new one, which is the
  // reflow this file exists to prevent, arrived at the long way round.
  //
  // The cost of being right is reading a 64KB header per photo.
  const previous = existsSync(DERIVED_PATH)
    ? JSON.parse(readFileSync(DERIVED_PATH, "utf8"))
    : {};
  const derived = {};
  const noThumb = [];

  const errors = [];
  const filled = [];
  const categories = categoriesFromSource();

  // The CMS dropdown and the TypeScript union are two lists of the same
  // five things, kept in two files a CMS cannot edit together. Drift
  // between them shows up as a photo that cannot be categorised, or a
  // category that renders nowhere, so it is checked rather than trusted.
  const cmsCategories = categoriesFromCms();
  if (cmsCategories) {
    const missing = [...categories].filter((c) => !cmsCategories.has(c));
    const extra = [...cmsCategories].filter((c) => !categories.has(c));
    if (missing.length || extra.length) {
      errors.push(
        `CMS category options disagree with content/gallery.ts` +
          (missing.length ? `\n        missing from ${CMS_CONFIG}: ${missing.join(", ")}` : "") +
          (extra.length ? `\n        not a real category: ${extra.join(", ")}` : "")
      );
    }
  }

  const seen = new Map();

  shots.forEach((shot, i) => {
    const where = `photo ${i + 1}`;
    const src = typeof shot.src === "string" ? shot.src : "";

    if (!src.startsWith("/")) {
      errors.push(`${where}: src must start with "/" (got ${JSON.stringify(shot.src)})`);
      return;
    }
    if (typeof shot.alt !== "string" || shot.alt.trim().length < 3) {
      errors.push(
        `${where} (${src}): needs alt text describing what is in the frame. ` +
          `It is what a screen reader reads and what Google Images indexes.`
      );
    }
    if (!categories.has(shot.category)) {
      errors.push(
        `${where} (${src}): category ${JSON.stringify(shot.category)} is not one of ` +
          `${[...categories].join(", ")}`
      );
    }

    // The same photo twice renders twice, and in a lightbox that steps
    // through the set it reads as the arrows having stuck.
    if (seen.has(src)) {
      errors.push(`${where} (${src}): already listed as photo ${seen.get(src)}`);
    } else {
      seen.set(src, i + 1);
    }

    const file = join(PUBLIC_DIR, src);
    if (!existsSync(file)) {
      errors.push(
        `${where} (${src}): no such file at ${file}. ` +
          `Either the upload did not land or the path is wrong.`
      );
      return;
    }

    const size = imageSize(file);
    if (!size) {
      errors.push(
        `${where} (${src}): could not read the image dimensions. ` +
          `Supported here: JPEG, PNG, GIF, WebP.`
      );
      return;
    }
    const entry = { w: size.width, h: size.height };

    // The grid paints a 4:3 crop, so a pre-cropped 640x480 beside the
    // original is a large saving. Whether one EXISTS is a question only
    // the filesystem can answer — deriving the path by a naming rule and
    // hoping is what broke the moment photos started arriving from a CMS
    // rather than from a developer who knew to regenerate them.
    const thumbSrc = src.startsWith("/ctl/gallery/")
      ? src.replace("/ctl/gallery/", THUMB_DIR)
      : null;
    if (thumbSrc && existsSync(join(PUBLIC_DIR, thumbSrc))) {
      entry.thumb = thumbSrc;
    } else if (thumbSrc) {
      // Not an error: the page renders the original and is correct, just
      // heavier. Reported so it can be fixed on purpose.
      noThumb.push(src);
    }

    derived[src] = entry;

    const before = previous[src];
    const unchanged =
      before &&
      before.w === entry.w &&
      before.h === entry.h &&
      before.thumb === entry.thumb;
    if (!unchanged) {
      filled.push(
        `${src} → ${size.width}×${size.height}` +
          (before && (before.w !== entry.w || before.h !== entry.h)
            ? ` (was ${before.w}×${before.h})`
            : "")
      );
    }
  });

  // A photo removed in the CMS leaves its measurement behind, and a
  // dimensions file that only ever grows is a list of things that are
  // not there any more. `dims` is rebuilt from the live list each run,
  // so this only has to count what fell out.
  const pruned = Object.keys(previous).filter((src) => !derived[src]).length;

  if (errors.length) {
    console.error(
      `[gallery] ${errors.length} problem${errors.length === 1 ? "" : "s"} in ${JSON_PATH}:\n` +
        errors.map((e) => `      · ${e}`).join("\n")
    );
    return false;
  }

  if (filled.length || pruned) {
    // Key order follows the gallery, so a diff on this file reads in the
    // same order as a diff on the one beside it.
    const ordered = {};
    for (const shot of shots) if (derived[shot.src]) ordered[shot.src] = derived[shot.src];
    writeFileSync(DERIVED_PATH, JSON.stringify(ordered, null, 2) + "\n");
  }

  if (filled.length) {
    console.log(
      `[gallery] measured ${filled.length} photo${
        filled.length === 1 ? "" : "s"
      }:\n` + filled.map((f) => `      · ${f}`).join("\n")
    );
  }
  if (pruned) {
    console.log(`[gallery] dropped ${pruned} measurement(s) for removed photos`);
  }

  if (noThumb.length) {
    console.log(
      `[gallery] ${noThumb.length} photo${noThumb.length === 1 ? " has" : "s have"} no 640×480 thumbnail, ` +
        `so the grid loads the full-size file${noThumb.length === 1 ? "" : "s"}:\n` +
        noThumb.map((s) => `      · ${s}`).join("\n") +
        `\n      The page is correct either way — this is weight, not breakage.` +
        `\n      See ctl-roofing/docs/GALLERY-CMS.md for generating them.`
    );
  }

  console.log(`[gallery] ${shots.length} photos, all present and described`);
  return true;
}

if (process.argv[1] && process.argv[1].endsWith("gallery.mjs")) {
  process.exit(run() ? 0 : 1);
}

export { run, imageSize };
