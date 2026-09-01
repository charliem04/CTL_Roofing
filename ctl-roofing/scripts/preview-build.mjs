/**
 * Build the preview bundle. Works on Windows as well as Unix.
 *
 * This used to be `NEXT_PUBLIC_PREVIEW=1 npm run build` in the npm
 * script, which is POSIX shell syntax. npm runs scripts through cmd.exe
 * on Windows, and cmd does not understand `VAR=value command` — it
 * reads NEXT_PUBLIC_PREVIEW as the name of a program and fails with
 * "is not recognized as an internal or external command". So the flag
 * is set here, in Node, where every platform agrees.
 *
 * Next is invoked as `node <path-to-next-bin> build` rather than by
 * spawning `next` or `npm`: on Windows those resolve to .cmd shims that
 * need shell:true to launch, and shell:true drags command-line quoting
 * differences back in. Running the JS entry point under the current
 * Node binary sidesteps all of it.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { applyPreviewHeaders } from "./preview-headers.mjs";
import { applyCsp } from "./csp.mjs";

const require = createRequire(import.meta.url);

let nextBin;
try {
  // Resolve through the package rather than hardcoding node_modules —
  // correct under npm, pnpm and yarn layouts alike.
  nextBin = require.resolve("next/dist/bin/next");
} catch {
  console.error(
    "[preview] Cannot find Next. Run `npm install` in ctl-roofing first."
  );
  process.exit(1);
}

if (!existsSync(nextBin)) {
  console.error(`[preview] Next resolved to a missing file: ${nextBin}`);
  process.exit(1);
}

console.log("[preview] building with NEXT_PUBLIC_PREVIEW=1");

const build = spawnSync(process.execPath, [nextBin, "build"], {
  stdio: "inherit",
  env: { ...process.env, NEXT_PUBLIC_PREVIEW: "1" },
});

if (build.error) {
  console.error("[preview] could not start the build:", build.error.message);
  process.exit(1);
}
if (build.status !== 0) {
  // Next already printed why. Don't apply headers to a broken build.
  process.exit(build.status ?? 1);
}

// The CSP is generated for both builds — a preview that behaves
// differently from production is a preview that proves less.
process.exit(applyCsp() && applyPreviewHeaders() ? 0 : 1);
