import { SITE_URL } from "./seo";
type Video = { id: number; title: string; image_url: string; created_at: string; tags: string | null };

export function videoStructuredData(media: Video, description: string, thumbnail: string | null) {
  // Required properties: a real video thumbnail, unique name, and ISO upload date.
  // Never substitute the video file or a generic brand image for its thumbnail.
  if (!thumbnail || !media.title.trim()) return null;
  const date = new Date(media.created_at);
  if (!Number.isFinite(date.getTime())) return null;
  try {
    if (!["http:", "https:"].includes(new URL(thumbnail).protocol)) return null;
  } catch {
    return null;
  }
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: media.title,
    description,
    thumbnailUrl: [thumbnail],
    uploadDate: date.toISOString(),
    contentUrl: media.image_url,
    url: SITE_URL + "/image/" + media.id,
    keywords: media.tags || undefined,
  };
}
