/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: `npm run build` emits ./out — deploy that folder to
  // Cloudflare Pages directly (no adapter, no server runtime needed).
  output: "export",
  images: {
    // Required for static export. Photos in /public are served as-is,
    // and the gallery's come pre-sized from Sanity's CDN.
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
