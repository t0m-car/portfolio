import type { MetadataRoute } from "next";

const SITE = "https://tomca.be";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE, lastModified: new Date() }];
}
