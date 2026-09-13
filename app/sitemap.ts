import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://heya-stock.vercel.app";

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
      },
    }
  );

  const { data: media, error } = await supabase
    .from("images")
    .select("id, category, created_at, media_type")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Sitemap media fetch failed:", error);
  }

  const mediaItems = media || [];

  // Main public pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Individual approved media pages
  const mediaPages: MetadataRoute.Sitemap = mediaItems.map((item) => ({
    url: `${baseUrl}/image/${item.id}`,
    lastModified: new Date(item.created_at),
    changeFrequency: "monthly",
    priority: item.media_type === "video" ? 0.8 : 0.7,
  }));

  // Unique category pages
  const categories = [
    ...new Set(
      mediaItems
        .map((item) => item.category)
        .filter((category): category is string => Boolean(category))
    ),
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map(
    (category) => ({
      url: `${baseUrl}/categories/${encodeURIComponent(
        category.toLowerCase()
      )}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    })
  );

  return [...staticPages, ...categoryPages, ...mediaPages];
}