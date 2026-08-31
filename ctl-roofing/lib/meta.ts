import type { Metadata } from "next";
import { client } from "@/client.config";
import type { PageMeta } from "@/content/types";

/**
 * Per-page <head>, built from one PageMeta so title, description,
 * canonical and OG can never disagree with each other. The site name is
 * appended here rather than repeated in every content file.
 */
export function pageMetadata(
  meta: PageMeta,
  /**
   * Keep the page out of the index. Used by a route that is built but
   * not yet live: the file has to exist for the export to compile, and
   * an unfinished page that a crawler can find is worse than no page.
   */
  opts: { noindex?: boolean } = {}
): Metadata {
  const title = `${meta.title} | ${client.businessName}`;
  return {
    title,
    ...(opts.noindex ? { robots: { index: false, follow: false } } : {}),
    description: meta.description,
    alternates: { canonical: `${client.siteUrl}${meta.path}` },
    openGraph: {
      title,
      description: meta.description,
      url: `${client.siteUrl}${meta.path}`,
      siteName: client.businessName,
      images: [{ url: client.ogImagePath, width: 1200, height: 630 }],
      type: "website",
    },
  };
}
