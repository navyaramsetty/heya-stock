import { cache } from "react";
// Sidecar posters are created during approval, without a database migration.
export const getVideoPoster = cache(async (url: string): Promise<string | null> => {
  const storage = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!storage || !url.startsWith(storage + "/storage/v1/object/public/images/")) return null;
  const poster = url + ".poster.jpg";
  try {
    const response = await fetch(poster, { method: "HEAD", signal: AbortSignal.timeout(3000), next: { revalidate: 300 } });
    return response.ok && response.headers.get("content-type")?.startsWith("image/") ? poster : null;
  } catch { return null; }
});
