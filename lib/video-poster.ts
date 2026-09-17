import { cache } from "react";
import thumbnails from "./video-thumbnails.json";
import { SITE_URL } from "./seo";

const bundledThumbnails: Record<string, string> = thumbnails;

// Prefer the verified frame associated with this exact video URL. New approvals
// can still use the existing storage-side poster without a code deployment.
export const getVideoPoster = cache(async (url: string): Promise<string | null> => {
  const bundled = bundledThumbnails[url];
  if (bundled) return new URL(bundled, SITE_URL).href;

  const storage = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!storage || !url.startsWith(storage + "/storage/v1/object/public/images/")) return null;
  const poster = url + ".poster.jpg";
  try {
    const response = await fetch(poster, {
      method: "HEAD",
      signal: AbortSignal.timeout(3000),
      next: { revalidate: 300 },
    });
    return response.ok && response.headers.get("content-type")?.startsWith("image/") ? poster : null;
  } catch {
    return null;
  }
});
