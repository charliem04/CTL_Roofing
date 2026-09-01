import type { MetadataRoute } from "next";
import { client } from "@/client.config";
import { IS_PREVIEW } from "@/lib/preview";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  // A preview build turns every crawler away and advertises no sitemap.
  // The pages carry noindex too — this is the layer that stops a
  // well-behaved crawler before it ever fetches one.
  if (IS_PREVIEW) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${client.siteUrl}/sitemap.xml`,
  };
}
