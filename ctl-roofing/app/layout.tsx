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
import { JsonLd } from "@/components/JsonLd";

// All SEO metadata is driven by client.config.ts — no per-client edits here.
export const metadata: Metadata = {
  metadataBase: new URL(client.siteUrl),
  title: client.metaTitle,
  description: client.metaDescription,
  openGraph: {
    title: client.metaTitle,
    description: client.metaDescription,
    url: client.siteUrl,
    siteName: client.businessName,
    images: [{ url: client.ogImagePath, width: 1200, height: 630 }],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <JsonLd />
      </body>
    </html>
  );
}
