/**
 * ════════════════════════════════════════════════════════════════════
 *  CONTENT-SECURITY-POLICY, generated at build time.
 *
 *  public/_headers carries the headers that never change. This one has
 *  to be generated, because three of the origins it allows are only
 *  known from the environment the build ran in: the careers Worker, the
 *  CRM webhook, and any override of the form endpoint. A hand-written
 *  policy would either omit them (breaking the feature in production
 *  and nowhere else) or allow them unconditionally (pointless).
 *
 *  ── WHY script-src CARRIES 'unsafe-inline', WHICH IS NOT IDEAL ──────
 *
 *  Next puts eight inline <script> blocks on every page — the flight
 *  data that hydrates it. A static export has no server, so there is no
 *  nonce to issue. The alternative is hashing all eight per page and
 *  writing per-path rules, and those hashes change with every build:
 *  buildId, chunk names, page content. If the generator ever drifts
 *  from the actual output by one byte, the browser blocks hydration and
 *  the site serves blank pages — a total outage caused by a security
 *  header, on a site whose job is to take phone calls.
 *
 *  So the trade is deliberate. What this policy still buys, and it is
 *  the realistic threat for a static marketing site:
 *
 *    · A script cannot be loaded from an origin not listed here. A
 *      compromised dependency that tries to phone home is blocked.
 *    · object-src 'none' and base-uri 'self' close two injection
 *      routes that do not need inline script at all.
 *    · frame-ancestors 'none' keeps the site out of anyone's iframe.
 *
 *  What it does not buy: protection against injected inline script.
 *  That is acceptable here because nothing renders user-supplied HTML —
 *  React escapes every string, and the one dangerouslySetInnerHTML is
 *  our own JSON-LD built from our own content. If that ever stops being
 *  true, this comment is the thing to come back to.
 * ════════════════════════════════════════════════════════════════════
 */
import { appendFileSync, existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const HEADERS = "out/_headers";
const MARKER = "# ── Content-Security-Policy (generated) ──";

/** Origin of a URL, or "" if it is not one. */
function origin(u) {
  try {
    return new URL(u).origin;
  } catch {
    return "";
  }
}

/**
 * Origins that appear in the built output as LINK TARGETS ONLY — an
 * href a person clicks, or a string inside JSON-LD. The browser never
 * fetches these as a subresource, so CSP has no say over them and they
 * must not be added to it just to quiet the drift check below.
 */
const LINK_ONLY = new Set([
  "https://schema.org", // JSON-LD @context, a string, never fetched
  "https://www.facebook.com",
  "https://www.instagram.com",
  "https://g.page",
  "https://www.ctlpro.com",
  // Framework strings baked into React/Next dev warnings.
  "https://nextjs.org",
  "https://react.dev",
  "https://reactjs.org",
  "https://github.com",
]);

/**
 * Origins that appear only as constants inside framework code that this
 * site does not exercise, or inside a CSS comment. Next ships a table
 * of font-provider URLs in its runtime chunk whether or not you use
 * next/font; nothing here is ever fetched, and adding them to the
 * policy would allow origins the site has no business talking to.
 *
 * Verified by grep at the time of writing: each appears in
 * out/_next/static/chunks/main-*.js as a string in Next's font
 * constants, or in the Tailwind banner comment in the CSS.
 */
const INERT = new Set([
  "https://fonts.googleapis.com",
  "https://fonts.gstatic.com",
  "https://use.typekit.net",
  "https://tailwindcss.com",
]);

export function buildCsp(env = process.env) {
  // Only the endpoints this build actually points at.
  const extra = [
    env.NEXT_PUBLIC_CAREERS_ENDPOINT, // the résumé upload Worker
    env.NEXT_PUBLIC_LEAD_WEBHOOK_URL, // optional CRM copy
    env.NEXT_PUBLIC_FORM_ENDPOINT, // only when overriding Web3Forms
  ]
    .map((u) => origin(u ?? ""))
    .filter(Boolean);

  const connect = [
    "'self'",
    "https://api.web3forms.com", // contact form
    "https://places.googleapis.com", // live Google reviews
    "https://plausible.io", // analytics events, after consent
    ...new Set(extra),
  ];

  return [
    "default-src 'self'",
    // See the header comment for why 'unsafe-inline' is here.
    "script-src 'self' 'unsafe-inline' https://plausible.io https://challenges.cloudflare.com",
    // React writes style attributes; there is no nonce for those either.
    "style-src 'self' 'unsafe-inline'",
    // data: for the inlined SVG icons; googleusercontent for the
    // reviewer avatars Google's API returns.
    "img-src 'self' data: https://*.googleusercontent.com",
    "font-src 'self'", // Fontsource bundles them, nothing external
    "media-src 'self'", // the job walkthrough mp4
    `connect-src ${connect.join(" ")}`,
    // Calendly is embedded as an iframe, not a widget script; Turnstile
    // renders its challenge in one too.
    "frame-src https://calendly.com https://challenges.cloudflare.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

/** Every https origin referenced anywhere in the built output. */
function originsInBuild(dir = "out") {
  const found = new Set();
  const walk = (d) => {
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      if (statSync(p).isDirectory()) {
        walk(p);
        continue;
      }
      if (!/\.(html|js|css|json|txt|xml)$/.test(name)) continue;
      for (const m of readFileSync(p, "utf8").matchAll(
        /https:\/\/[a-zA-Z0-9.-]+[a-zA-Z0-9]/g
      )) {
        const o = origin(m[0]);
        if (o) found.add(o);
      }
    }
  };
  walk(dir);
  return found;
}

/**
 * Fail the build on drift.
 *
 * A CSP that silently stops covering something is worse than none —
 * it reads as protection while a new embed goes unlisted, or blocks a
 * feature that shipped after the policy was written. So every origin in
 * the output has to be either allowed by the policy or declared
 * link-only above. Adding an embed now forces a decision here.
 */
function checkDrift(csp) {
  const allowed = new Set(
    [...csp.matchAll(/https:\/\/[a-zA-Z0-9.*-]+/g)].map((m) => m[0])
  );
  const unaccounted = [...originsInBuild()].filter((o) => {
    if (LINK_ONLY.has(o) || INERT.has(o)) return false;
    if (allowed.has(o)) return false;
    // Wildcard entries such as https://*.googleusercontent.com
    for (const a of allowed) {
      if (!a.includes("*")) continue;
      const re = new RegExp("^" + a.replace(/[.]/g, "\\.").replace(/\*/g, "[^.]+") + "$");
      if (re.test(o)) return false;
    }
    return true;
  });
  return unaccounted;
}

export function applyCsp(env = process.env) {
  if (!existsSync(HEADERS)) {
    console.error(`[csp] ${HEADERS} missing — did the build run?`);
    return false;
  }
  if (readFileSync(HEADERS, "utf8").includes(MARKER)) {
    console.log("[csp] already applied, nothing to do");
    return true;
  }

  const csp = buildCsp(env);

  const drift = checkDrift(csp);
  if (drift.length) {
    console.error(
      "[csp] Origins in the build that the policy does not cover:\n" +
        drift.map((o) => `        ${o}`).join("\n") +
        "\n      Add each to the policy in scripts/csp.mjs, or to LINK_ONLY\n" +
        "      if it is only ever an href a person clicks."
    );
    return false;
  }

  appendFileSync(
    HEADERS,
    `\n\n${MARKER}\n# Generated by scripts/csp.mjs. Edit the policy there, not here.\n/*\n  Content-Security-Policy: ${csp}\n`
  );
  console.log(`[csp] applied (${csp.length} chars)`);
  return true;
}

if (process.argv[1] && process.argv[1].endsWith("csp.mjs")) {
  process.exit(applyCsp() ? 0 : 1);
}
