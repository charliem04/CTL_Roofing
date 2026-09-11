#!/usr/bin/env node
/**
 * ════════════════════════════════════════════════════════════════════
 *  THE /admin/ PAGE, finished at build time.
 *
 *  Two things cannot be written into public/admin/ by hand, for the
 *  same reason the Content-Security-Policy cannot: they depend on the
 *  environment the build ran in.
 *
 *    1. `base_url` in config.yml — the GitHub OAuth relay. Its address
 *       is whatever the Worker was deployed to, so it arrives as
 *       CMS_AUTH_URL. Absent, the file is left alone and /admin/ shows
 *       its setup notice rather than a sign-in that cannot complete.
 *
 *    2. A Content-Security-Policy for /admin/ alone. The site's policy
 *       is deliberately tight — see scripts/csp.mjs — and the CMS needs
 *       a script from a CDN, a connection to the GitHub API, and the
 *       ability to show images from the repository. Loosening the whole
 *       site's policy to admit an admin page used by one person would
 *       trade the protection of every page for the convenience of one.
 *
 *  So this appends a path-specific block. Cloudflare Pages matches
 *  _headers rules most-specific-first per header, so the /admin/*
 *  policy replaces the site-wide one on exactly that path and nowhere
 *  else.
 *
 *  ── WHY /admin/ IS NOT A SECURITY BOUNDARY ──────────────────────────
 *
 *  It is a static page anyone can open. That is fine and is how every
 *  git-backed CMS works: the page is inert until somebody signs in with
 *  a GitHub account that has write access to the repository, and GitHub
 *  is what enforces that. Nothing secret is served here — the config
 *  names a public repository and a public OAuth client. The thing that
 *  must stay secret is the OAuth client SECRET, which lives on the
 *  Worker and never reaches this page.
 * ════════════════════════════════════════════════════════════════════
 */
import {
  appendFileSync,
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

const HEADERS = "out/_headers";
const CONFIG = "out/admin/config.yml";
const MARKER = "# ── /admin/ CMS policy (generated) ──";

/**
 * What the CMS needs that the site does not.
 *
 * Everything here is reached by the admin page and by nothing else:
 *
 *   unpkg          the CMS bundle itself
 *   api.github.com the repository read/write API, once signed in
 *   github.com     the OAuth authorise step
 *   avatars        the signed-in user's picture in the CMS chrome
 *   raw/media      previews of photos already committed
 *   blob:/data:    previews of a photo being uploaded, before it exists
 */
export function buildAdminCsp() {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://unpkg.com",
    "img-src 'self' data: blob: https://avatars.githubusercontent.com https://raw.githubusercontent.com https://media.githubusercontent.com",
    "font-src 'self' data: https://unpkg.com",
    "connect-src 'self' https://api.github.com https://unpkg.com https://raw.githubusercontent.com",
    // The sign-in happens in a popup on GitHub's own origin, which is a
    // navigation rather than a frame, so frame-src stays closed.
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    // The OAuth relay is added below when its address is known.
    "form-action 'self' https://github.com",
    "object-src 'none'",
  ];
}

/**
 * Origins that appear in out/admin/ as text rather than as something
 * fetched. The CMS bundle carries documentation URLs and the setup
 * notice names github.com in prose; neither is a subresource.
 */
const ADMIN_LINK_ONLY = new Set([
  "https://github.com",
  "https://www.netlify.com",
  "https://decapcms.org",
  "https://sveltia.dev",
  "https://developers.google.com",
  "https://schema.org",
]);

/**
 * The same no-silent-drift rule scripts/csp.mjs applies to the site,
 * applied to the admin page against its own policy.
 *
 * Without this, excluding out/admin from the site scan would create
 * exactly the hole that check exists to close: a directory whose
 * outbound origins nothing verifies. A CMS upgrade that starts pulling
 * from a second CDN should fail the build here rather than fail
 * silently in somebody's browser.
 */
function adminDrift(directives) {
  const allowed = new Set(
    [...directives.join("; ").matchAll(/https:\/\/[a-zA-Z0-9.*-]+/g)].map((m) => m[0])
  );
  const found = new Set();
  const walk = (d) => {
    if (!existsSync(d)) return;
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      if (statSync(p).isDirectory()) {
        walk(p);
        continue;
      }
      if (!/\.(html|js|css|json|yml|yaml|txt)$/.test(name)) continue;
      for (const m of readFileSync(p, "utf8").matchAll(
        /https:\/\/[a-zA-Z0-9.-]+[a-zA-Z0-9]/g
      )) {
        try {
          found.add(new URL(m[0]).origin);
        } catch {
          /* not a URL we can parse; nothing to check */
        }
      }
    }
  };
  walk("out/admin");
  return [...found].filter((o) => !allowed.has(o) && !ADMIN_LINK_ONLY.has(o));
}

export function applyCms(env = process.env) {
  if (!existsSync(HEADERS)) {
    console.error(`[cms] ${HEADERS} missing — did the build run?`);
    return false;
  }
  if (!existsSync(CONFIG)) {
    console.error(`[cms] ${CONFIG} missing — public/admin/ did not get copied.`);
    return false;
  }
  if (readFileSync(HEADERS, "utf8").includes(MARKER)) {
    console.log("[cms] already applied, nothing to do");
    return true;
  }

  const raw = (env.CMS_AUTH_URL ?? "").trim();
  let auth = "";
  if (raw) {
    try {
      // Normalised to a bare origin: the CMS appends its own paths, and
      // a trailing slash here produces a double one in the redirect.
      auth = new URL(raw).origin;
    } catch {
      console.error(
        `[cms] CMS_AUTH_URL is not a valid URL: ${JSON.stringify(raw)}\n` +
          `      Expected something like https://ctl-cms-auth.<account>.workers.dev`
      );
      return false;
    }
  }

  const directives = buildAdminCsp();
  if (auth) {
    // The relay is both navigated to (the sign-in hop) and read from
    // (the token exchange), so it has to appear in both places.
    for (let i = 0; i < directives.length; i++) {
      if (directives[i].startsWith("connect-src")) directives[i] += ` ${auth}`;
      if (directives[i].startsWith("form-action")) directives[i] += ` ${auth}`;
    }

    const config = readFileSync(CONFIG, "utf8");
    if (/^\s*base_url:/m.test(config)) {
      console.log("[cms] config.yml already carries a base_url, leaving it");
    } else {
      // Inserted into the backend block, which is the only place it is
      // meaningful. Anchored on the `branch:` line so the indentation is
      // taken from a sibling rather than assumed.
      const next = config.replace(
        /^(\s*)branch:.*$/m,
        (line, indent) => `${line}\n${indent}base_url: ${auth}`
      );
      if (next === config) {
        console.error(
          "[cms] could not find the backend `branch:` line to anchor base_url to."
        );
        return false;
      }
      writeFileSync(CONFIG, next);
      console.log(`[cms] config.yml base_url set to ${auth}`);
    }
  } else {
    console.log(
      "[cms] CMS_AUTH_URL is not set — /admin/ will render its setup notice.\n" +
        "      See ctl-roofing/docs/GALLERY-CMS.md to finish wiring it up."
    );
  }

  const drift = adminDrift(directives);
  if (drift.length) {
    console.error(
      "[cms] Origins in out/admin/ that the admin policy does not cover:\n" +
        drift.map((o) => `        ${o}`).join("\n") +
        "\n      Add each to buildAdminCsp() in scripts/cms.mjs, or to\n" +
        "      ADMIN_LINK_ONLY if it is only ever text or an href."
    );
    return false;
  }

  appendFileSync(
    HEADERS,
    `\n\n${MARKER}\n` +
      `# Generated by scripts/cms.mjs. The CMS needs origins the site does\n` +
      `# not; this keeps them on /admin/ instead of widening the site policy.\n` +
      `/admin/*\n` +
      `  Content-Security-Policy: ${directives.join("; ")}\n` +
      `  X-Robots-Tag: noindex, nofollow\n`
  );
  console.log("[cms] /admin/ policy applied");
  return true;
}

if (process.argv[1] && process.argv[1].endsWith("cms.mjs")) {
  process.exit(applyCms() ? 0 : 1);
}
