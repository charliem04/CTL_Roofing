import type { Metadata } from "next";
// Faces are self-hosted via Fontsource (bundled at build, no CDN, no
// layout shift). Only the weights actually used are imported.
// TODO(client): if the brand needs different faces, swap these imports
// and the --font-* stacks in globals.css together.
import "@fontsource/big-shoulders-display/latin-700";
import "@fontsource/big-shoulders-display/latin-800";
import "@fontsource/ibm-plex-sans/latin-400";
import "@fontsource/ibm-plex-sans/latin-600";
import "@fontsource/ibm-plex-mono/latin-500";
import "./globals.css";
import { client } from "@/client.config";
import { IS_PREVIEW } from "@/lib/preview";
import { JsonLd } from "@/components/JsonLd";
import { PreviewBanner } from "@/components/PreviewBanner";
import { UtilityBar } from "@/components/UtilityBar";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { StickyCTA } from "@/components/StickyCTA";
import { CookieConsent } from "@/components/CookieConsent";
import { Analytics } from "@/components/Analytics";
import { InteractionTracking } from "@/components/InteractionTracking";
import { SmoothScroll } from "@/components/SmoothScroll";

// Site-level metadata. Individual pages override title/description via
// their own `metadata` export, built from lib/meta.ts.
export const metadata: Metadata = {
  metadataBase: new URL(client.siteUrl),
  // Belt and braces with the per-page noindex in lib/meta.ts, the
  // preview robots.txt and the X-Robots-Tag header: a replica of a real
  // business competing with that business in search is the expensive
  // failure, and each of these can be missed on its own.
  ...(IS_PREVIEW ? { robots: { index: false, follow: false } } : {}),
  title: client.metaTitle,
  description: client.metaDescription,
  alternates: { canonical: client.siteUrl },
  openGraph: {
    title: client.metaTitle,
    description: client.metaDescription,
    url: client.siteUrl,
    siteName: client.businessName,
    images: [{ url: client.ogImagePath, width: 1200, height: 630 }],
    type: "website",
  },
};

/**
 * The chrome lives here, not on the home page — every route gets the
 * same utility rail, header, footer and sticky bar, and a new page
 * cannot accidentally ship without them.
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {/*
          Framer serializes an animation's starting state into the HTML,
          so every element waiting to be revealed ships as
          `style="opacity:0"` — 36 of them on the home page alone. With
          JavaScript running that is invisible for a few hundred
          milliseconds and then correct. With JavaScript off or failed,
          it is a permanently blank page on a site whose entire job is
          to be found and phoned.

          Crawlers execute JavaScript and are not the reason this is
          here. The reason is the visitor on hotel wifi whose bundle
          request times out, who currently sees nothing at all and has
          no way to know there was ever anything to see.

          This is deliberately a blunt attribute selector rather than a
          class the primitives opt into: the point is to catch every
          animated element, including any added later by someone who
          never reads this file.
        */}
        <noscript>
          {/*
            dangerouslySetInnerHTML, not a string child. <style> is a
            raw-text element: React would escape the selector's quotes
            to &quot;, and the CSS parser does not decode entities, so
            the rule silently never matches. The content is a literal
            in this file with nothing interpolated into it.

            style-src allows 'unsafe-inline' (scripts/csp.mjs:114), so
            this is not blocked when JavaScript is off.
          */}
          <style
            dangerouslySetInnerHTML={{
              __html: `[style*="opacity:0"]{opacity:1!important;transform:none!important}`,
            }}
          />
        </noscript>
        {/* Renders nothing; owns the wheel-momentum scrolling for every
            route. Mounted first so it is running before anything below
            can be scrolled to. */}
        <SmoothScroll />
        <PreviewBanner />
        <UtilityBar />
        <Nav />
        {/* Bottom padding clears the mobile Call | Text | Book bar. */}
        <main className="pb-16 lg:pb-0">{children}</main>
        <Footer />
        <StickyCTA />
        <CookieConsent />
        <Analytics />
        <InteractionTracking />
        <JsonLd />
      </body>
    </html>
  );
}
