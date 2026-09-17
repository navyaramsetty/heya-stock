import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { categorySlug } from "./seo";
export type MediaItem = {
  id: number; title: string; category: string; tags: string | null;
  description: string | null; image_url: string; media_type: string | null;
  downloads: number; featured: boolean | null; created_at: string; status: string;
};
export const PAGE_SIZE = 24;
const fields = "id,title,category,tags,description,image_url,media_type,downloads,featured,created_at,status";
export function publicDatabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
export function pageNumber(value: string | string[] | undefined) {
  const text = typeof value === "string" ? value : "1";
  const number = Number(text);
  return /^\d+$/.test(text) && Number.isSafeInteger(number) && number > 0 && number < 1000000 ? number : 1;
}
export const getMedia = cache(async (id: string): Promise<MediaItem | null> => {
  if (!/^\d+$/.test(id) || !Number.isSafeInteger(Number(id)) || Number(id) < 1) return null;
  const { data, error } = await publicDatabase().from("images").select(fields)
    .eq("id", Number(id)).eq("status", "approved").maybeSingle();
  if (error) throw new Error("Unable to load media", { cause: error });
  return data;
});
export const getMediaPage = cache(async (page: number, search = "", type = "all", category = "") => {
  let query = publicDatabase().from("images").select(fields, { count: "exact" }).eq("status", "approved");
  if (category) query = query.ilike("category", category.replace(/[\\%_]/g, "\\$&"));
  if (type === "video") query = query.eq("media_type", "video");
  if (type === "image") query = query.or("media_type.eq.image,media_type.is.null");
  // Quote PostgREST values; escape LIKE wildcards so user input stays literal.
  if (search) {
    const escaped = search.replace(/[\\%_]/g, "\\$&");
    const pattern = JSON.stringify("%" + escaped + "%");
    query = query.or(["title", "category", "tags", "description"].map(field => field + ".ilike." + pattern).join(","));
  }
  const { data, error, count } = await query.order("created_at", { ascending: false })
    .order("id", { ascending: false }).range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (error?.code === "PGRST103" && page > 1) return { items: [] as MediaItem[], count: 0 };
  if (error) throw new Error("Unable to load catalog", { cause: error });
  return { items: (data || []) as MediaItem[], count: count || 0 };
});
export type CatalogEntry = Pick<MediaItem, "id" | "category" | "image_url" | "media_type">;
// Keyset batching also works when the API row cap is smaller than our requested batch.
export const getCatalogIndex = cache(async (): Promise<CatalogEntry[]> => {
  const items: CatalogEntry[] = [];
  let after = 0;
  while (true) {
    const { data, error } = await publicDatabase().from("images")
      .select("id,category,image_url,media_type").eq("status", "approved")
      .gt("id", after).order("id").limit(500);
    if (error) throw new Error("Unable to load catalog index", { cause: error });
    if (!data?.length) break;
    items.push(...data);
    after = data[data.length - 1].id;
  }
  return items;
});
export const getCategories = cache(async () => {
  const groups = new Map<string, { name: string; count: number; previewUrl: string; previewType: string | null }>();
  for (const item of await getCatalogIndex()) {
    if (!item.category?.trim()) continue;
    const slug = categorySlug(item.category);
    const existing = groups.get(slug);
    if (existing) existing.count++;
    else groups.set(slug, { name: item.category, count: 1, previewUrl: item.image_url, previewType: item.media_type });
  }
  return [...groups.values()].sort((a, b) => a.name.localeCompare(b.name));
});


export type RelatedMediaItem = Pick<MediaItem, "id" | "title" | "category" | "image_url" | "media_type">;

export const getRelatedMedia = cache(async (currentId: number, category: string): Promise<RelatedMediaItem[]> => {
  if (!category.trim()) return [];
  // Recommendations must never prevent the requested detail page from loading.
  try {
    const { data, error } = await publicDatabase().from("images")
      .select("id,title,category,image_url,media_type")
      .eq("status", "approved")
      .eq("category", category)
      .neq("id", currentId)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(6);
    if (error) {
      console.error("Unable to load related media:", error.message);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error("Unable to load related media:", error);
    return [];
  }
});
