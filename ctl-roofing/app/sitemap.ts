import type { MetadataRoute } from "next";
import { client } from "@/client.config";
import { livePaths } from "@/lib/routes";

export const dynamic = "force-static";

/**
 * Generated from the route registry, so a page that exists is listed
 * and a phase-2 route that does not exist yet is not — the sitemap
 * cannot drift from the nav because they read the same source.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return livePaths().map(({ path, priority }) => ({
    url: `${client.siteUrl}${path}`,
    priority,
    changeFrequency: path === "/" ? "weekly" : "monthly",
  }));
}
