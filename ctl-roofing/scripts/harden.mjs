#!/usr/bin/env node
/**
 * ════════════════════════════════════════════════════════════════════
 *  WHAT ACTUALLY SHIPPED — a check on the bytes, not on the intent.
 *
 *  This is the "HTML hardening" check, and the first thing it has to do
 *  is be honest about what that can mean.
 *
 *  ── HTML CANNOT BE ENCRYPTED, AND OBFUSCATING IT BUYS NOTHING ───────
 *
 *  A browser has to parse the markup it is sent, so it has to be able to
 *  read it, so anyone holding the browser can read it too. Every product
 *  that claims to encrypt a page really ships a decoder next to the
 *  ciphertext, which means the page is readable by anyone who presses
 *  the same button the browser does — while being invisible to search
 *  engines, broken for screen readers, and undebuggable forever.
 *
 *  Class-name and JavaScript obfuscation is the same trade in a smaller
 *  size: it inconveniences a person reading the source for an afternoon,
 *  and costs every future maintainer a readable stack trace.
 *
 *  So what is worth doing is what is actually true of the output, and
 *  that is what this checks:
 *
 *    1. Nothing secret is in it. Real keys, tokens, private key blocks,
 *       and any value from the environment that was not meant to be
 *       public.
 *    2. Nothing is in it by accident — a .env, a source map, an editor
 *       backup, a stray .git.
 *    3. The security headers that DO work are all present.
 *
 *  ── AND MINIFICATION IS ALREADY DONE ────────────────────────────────
 *
 *  Measured on this build: the HTML is emitted as one line per page with
 *  no whitespace between tags. The only comments left are React's own
 *  `<!-- -->` text separators, which are load-bearing — strip them and
 *  hydration breaks. There is nothing to gain here and a working site to
 *  lose, so nothing minifies the HTML a second time.
 * ════════════════════════════════════════════════════════════════════
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const OUT = "out";

/** Files that should never be inside a published directory. */
const FORBIDDEN_NAMES = [
  /^\.env(\..*)?$/,
  /^\.git$/,
  /^\.DS_Store$/,
  /~$/,
  /\.bak$/,
  /\.orig$/,
  /\.swp$/,
  /^npm-debug\.log$/,
  /^\.dev\.vars(\..*)?$/,
];

/**
 * Things that look like a credential.
 *
 * Tuned to what could plausibly reach a static export of THIS site
 * rather than to a generic scanner's full catalogue, because a rule
 * that fires on the Tailwind banner every build is a rule people
 * learn to ignore.
 */
const SECRET_PATTERNS = [
  [/-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/, "a private key block"],
  [/\bsk_live_[A-Za-z0-9]{16,}/, "a Stripe live secret key"],
  [/\bgh[pousr]_[A-Za-z0-9]{30,}/, "a GitHub token"],
  [/\bxox[baprs]-[A-Za-z0-9-]{10,}/, "a Slack token"],
  [/\bAKIA[0-9A-Z]{16}\b/, "an AWS access key id"],
  [/\bey[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/, "a JWT"],
  [/\bAIza[0-9A-Za-z_-]{35}\b/, "a Google API key"],
];

/**
 * Environment variables whose VALUES must never appear in the output.
 *
 * This is the check that catches the mistake nobody notices: a secret
 * pasted into a NEXT_PUBLIC_ variable, or a server-only value
 * interpolated into a component. Rather than guessing at names, it takes
 * every variable that is NOT NEXT_PUBLIC_ and looks for its literal
 * value in the built files.
 *
 * Short and common values are skipped — searching the output for "true"
 * or a port number finds nothing but noise.
 */
function leakedEnvValues(env) {
  const suspects = [];
  for (const [name, value] of Object.entries(env)) {
    if (name.startsWith("NEXT_PUBLIC_")) continue;
    if (typeof value !== "string" || value.length < 12) continue;
    // Paths and the usual shell furniture are not secrets and appear in
    // output legitimately.
    if (/^(PATH|PWD|HOME|SHELL|TERM|LANG|LS_COLORS|_)$/.test(name)) continue;
    if (value.startsWith("/") || value.includes(":/")) continue;
    suspects.push([name, value]);
  }
  return suspects;
}

function walk(dir, onFile, onDir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      onDir?.(p, name);
      walk(p, onFile, onDir);
    } else onFile(p, name);
  }
}

/** Header names that must be present for every path. */
const REQUIRED_HEADERS = [
  "Content-Security-Policy",
  "X-Content-Type-Options",
  "Referrer-Policy",
  "X-Frame-Options",
  "Permissions-Policy",
  "Strict-Transport-Security",
];

/**
 * Values this build is SUPPOSED to publish.
 *
 * Every NEXT_PUBLIC_ variable is compiled into the JavaScript by
 * definition — that is what the prefix means. Two of them are
 * credential-shaped and would otherwise trip the patterns above:
 * NEXT_PUBLIC_GOOGLE_PLACES_KEY is an `AIza…` key, and it is meant to
 * be public because it is restricted by HTTP referrer rather than by
 * secrecy.
 *
 * Without this, the build would start failing the day somebody added
 * the Google key — a check that fires on correct configuration is a
 * check people delete.
 */
function publishable(env) {
  return new Set(
    Object.entries(env)
      .filter(([k, v]) => k.startsWith("NEXT_PUBLIC_") && typeof v === "string" && v.length >= 8)
      .map(([, v]) => v)
  );
}

export function harden(env = process.env) {
  if (!existsSync(OUT)) {
    console.error(`[harden] ${OUT}/ is missing — did the build run?`);
    return false;
  }

  const problems = [];
  const notes = [];
  const envSuspects = leakedEnvValues(env);
  const allowed = publishable(env);
  let textFiles = 0;
  let mapFiles = 0;

  walk(
    OUT,
    (path, name) => {
      for (const rule of FORBIDDEN_NAMES) {
        if (rule.test(name)) problems.push(`${path} should not be published`);
      }
      if (name.endsWith(".map")) {
        mapFiles++;
        problems.push(`${path} is a source map — it exposes the original source`);
      }
      if (!/\.(html|js|css|json|txt|xml|yml|yaml|svg)$/.test(name)) return;

      textFiles++;
      const body = readFileSync(path, "utf8");

      for (const [pattern, what] of SECRET_PATTERNS) {
        // Every occurrence, not just the first: a page can carry a
        // deliberately public key AND a leaked one, and matching once
        // would let the second hide behind the first.
        for (const m of body.matchAll(new RegExp(pattern.source, pattern.flags + "g"))) {
          if (allowed.has(m[0])) continue;
          // The finding names the file and the kind, never the value.
          problems.push(`${path} contains what looks like ${what}`);
          break;
        }
      }
      for (const [nameOfVar, value] of envSuspects) {
        if (body.includes(value)) {
          problems.push(
            `${path} contains the value of ${nameOfVar}, which is not a NEXT_PUBLIC_ variable`
          );
        }
      }
    },
    (path, name) => {
      if (name === ".git") problems.push(`${path} should not be published`);
    }
  );

  /* ── Headers ────────────────────────────────────────────────────── */
  const headersPath = join(OUT, "_headers");
  if (!existsSync(headersPath)) {
    problems.push("out/_headers is missing — the site would ship with no security headers");
  } else {
    const headers = readFileSync(headersPath, "utf8");
    for (const h of REQUIRED_HEADERS) {
      if (!new RegExp(`^\\s*${h}:`, "im").test(headers)) {
        problems.push(`out/_headers does not set ${h}`);
      }
    }
  }

  /* ── Things worth saying even when nothing is wrong ─────────────── */
  notes.push(`${textFiles} text files scanned`);
  notes.push(`${mapFiles} source maps (0 is correct)`);
  notes.push(`${envSuspects.length} non-public env values checked against the output`);
  notes.push(`${allowed.size} NEXT_PUBLIC_ values treated as publishable`);

  if (problems.length) {
    console.error(
      `[harden] ${problems.length} problem${problems.length === 1 ? "" : "s"}:\n` +
        problems.map((p) => `      · ${p}`).join("\n")
    );
    return false;
  }

  console.log(`[harden] clean — ${notes.join(", ")}`);
  return true;
}

if (process.argv[1] && process.argv[1].endsWith("harden.mjs")) {
  process.exit(harden() ? 0 : 1);
}
