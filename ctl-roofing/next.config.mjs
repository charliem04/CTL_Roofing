/*
 * ── Build guard: two lead paths must never be configured at once ────
 *
 * The contact form can post either through the Cloudflare Worker
 * (NEXT_PUBLIC_LEAD_ENDPOINT, the hardened path) or straight to
 * Web3Forms (NEXT_PUBLIC_WEB3FORMS_KEY, the path where the access key
 * ships inside the JavaScript).
 *
 * Setting both looks harmless — the code prefers the Worker — but Next
 * inlines every NEXT_PUBLIC_* value at build time whether or not the
 * branch reading it ever runs. So the key would still be sitting in the
 * bundle for anyone to lift, which is precisely what routing through
 * the Worker was supposed to prevent. No amount of guarding the read in
 * source fixes that; the minifier will not reliably fold it away.
 *
 * The only reliable control is not setting the variable, so this fails
 * the build rather than trusting whoever configures Cloudflare Pages to
 * remember. Remove NEXT_PUBLIC_WEB3FORMS_KEY once the Worker is live —
 * the key belongs in `wrangler secret put WEB3FORMS_KEY` instead.
 */
if (
  process.env.NEXT_PUBLIC_LEAD_ENDPOINT &&
  process.env.NEXT_PUBLIC_WEB3FORMS_KEY
) {
  throw new Error(
    "Both NEXT_PUBLIC_LEAD_ENDPOINT and NEXT_PUBLIC_WEB3FORMS_KEY are set.\n" +
      "The Worker path is preferred at runtime, but the Web3Forms key would\n" +
      "still be compiled into the client bundle. Unset\n" +
      "NEXT_PUBLIC_WEB3FORMS_KEY and hold it as a Worker secret instead:\n" +
      "  cd workers/careers-upload && npx wrangler secret put WEB3FORMS_KEY"
  );
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: `npm run build` emits ./out — deploy that folder to
  // Cloudflare Pages directly (no adapter, no server runtime needed).
  output: "export",
  images: {
    // Required for static export. Placeholders are local SVGs anyway;
    // swap real client photos in /public and they'll be served as-is.
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
