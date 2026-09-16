import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
export default function robots(): MetadataRoute.Robots {
  // Crawlers must read the existing noindex on account/admin pages.
  // Authentication and Supabase policies, not robots.txt, protect private data.
  return { rules: { userAgent: "*", allow: "/" }, sitemap: SITE_URL + "/sitemap.xml", host: SITE_URL };
}
