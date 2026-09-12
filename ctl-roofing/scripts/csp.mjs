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
 *  React escapes every string, and both uses of dangerouslySetInnerHTML
 *  are our own content with nothing interpolated from outside: the
 *  JSON-LD built from client.config, and the <noscript> stylesheet in
 *  app/layout.tsx that un-hides scroll-reveal content when JavaScript
 *  never arrives. If that ever stops being true — if either one starts
 *  taking a value from a URL, a form or an API — this comment is the
 *  thing to come back to.
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
  // The lender's prequalification portal. Every use of it in
  // content/financing.ts is the href of an <a> the visitor clicks —
  // nothing on this site ever fetches it, and it must stay that way:
  // the application belongs on EnerBank's origin, not on ours.
  "https://prequalification.enerbank.com",
  // Where the radar sends people when it cannot draw itself, and where
  // the attribution line under it points. Both are hrefs only — the
  // radar imagery itself comes from mapservices.weather.noaa.gov, which
  // is in the policy above.
  "https://radar.weather.gov",
  "https://www.weather.gov",
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
    // The storm radar, both halves of it. mapservices is read twice —
    // once as JSON for the service's moving time window, then as PNGs
    // in img-src below; api.weather.gov is the active watches and
    // warnings over the six served parish zones. Both are National
    // Weather Service, keyless, and CORS-open. See lib/nwsRadar.ts.
    "https://mapservices.weather.noaa.gov",
    "https://api.weather.gov",
    ...new Set(extra),
  ];

  return [
    "default-src 'self'",
    // See the header comment for why 'unsafe-inline' is here.
    "script-src 'self' 'unsafe-inline' https://plausible.io https://challenges.cloudflare.com",
    // React writes style attributes; there is no nonce for those either.
    "style-src 'self' 'unsafe-inline'",
    // data: for the inlined SVG icons; googleusercontent for the
    // reviewer avatars Google's API returns; mapservices for the radar
    // frames on /storm-damage/, which are transparent PNGs drawn over
    // our own map rather than a third-party basemap.
    "img-src 'self' data: https://*.googleusercontent.com https://mapservices.weather.noaa.gov",
    "font-src 'self'", // Fontsource bundles them, nothing external
    "media-src 'self'", // the job walkthrough mp4
    `connect-src ${connect.join(" ")}`,
    // Turnstile renders its challenge in a frame. Nothing else does:
    // the booking embed is off (client.bookingUrl is empty), and if a
    // scheduler is put back the drift check below fails the build until
    // its origin is named here.
    "frame-src https://challenges.cloudflare.com",
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
        // out/admin is the gallery CMS, and it is governed by its own
        // policy rather than this one — see scripts/cms.mjs, which
        // writes a /admin/* rule and runs the same drift check against
        // it. Scanning it here would report the CMS's origins as
        // uncovered by a policy that is not supposed to cover them, and
        // the only way to quiet that would be to allow a CDN and the
        // GitHub API across the whole site.
        if (p === join("out", "admin")) continue;
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
