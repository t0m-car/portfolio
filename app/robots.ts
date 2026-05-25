import type { MetadataRoute } from "next";

const SITE = "https://tomca.be";

export default function robots(): MetadataRoute.Robots {
  return {
    // AI crawlers (GPTBot, ClaudeBot, …) fall under the wildcard allow — intentional, for visibility.
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
