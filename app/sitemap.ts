import type { MetadataRoute } from "next";

const SITE = "https://tomca.be";

const ROUTES = ["/", "/lab", "/lab/signature", "/lab/ink"];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map((path) => ({ url: `${SITE}${path}`, lastModified }));
}
