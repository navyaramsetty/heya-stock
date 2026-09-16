import type { MetadataRoute } from "next";
import { getCatalogIndex } from "@/lib/catalog";
import { SITE_URL, categorySlug } from "@/lib/seo";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const media = await getCatalogIndex();
  const pages: MetadataRoute.Sitemap = ["", "/categories", "/about", "/license", "/privacy", "/terms", "/contact"].map(path => ({ url: SITE_URL + path }));
  const categories = new Set(media.filter(item => item.category?.trim()).map(item => categorySlug(item.category)));
  // Omit lastmod until real modification timestamps are available.
  return [...pages, ...[...categories].map(slug => ({ url: SITE_URL + "/categories/" + slug })),
    ...media.map(item => ({
      url: SITE_URL + "/image/" + item.id,
      ...(item.media_type !== "video" && item.image_url ? { images: [item.image_url] } : {}),
    }))];
}
