import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getMedia } from "@/lib/catalog";
import { getVideoPoster } from "@/lib/video-poster";
import { SITE_URL, DEFAULT_IMAGE, pageMetadata, categorySlug, jsonLd } from "@/lib/seo";
import MediaDetailClient from "./MediaDetailClient";
type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const media = await getMedia((await params).id);
  if (!media) notFound();
  const video = media.media_type === "video";
  const poster = video ? await getVideoPoster(media.image_url) : media.image_url;
  return pageMetadata(media.title + " - Free Stock " + (video ? "Video" : "Photo"),
    media.description?.trim() || "Download " + media.title + ", a free " + media.category.toLowerCase() + " stock " + (video ? "video" : "photo") + " from Heya.",
    "/image/" + media.id, poster || DEFAULT_IMAGE);
}
export default async function MediaPage({ params }: Props) {
  const { id } = await params;
  const media = await getMedia(id);
  if (!media) notFound();
  if (id !== String(media.id)) permanentRedirect("/image/" + media.id);
  const video = media.media_type === "video";
  const poster = video ? await getVideoPoster(media.image_url) : null;
  const description = media.description?.trim() || media.title + ": free " + media.category.toLowerCase() + " stock " + (video ? "video" : "photo") + " available on Heya.";
  const breadcrumb = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: media.category, item: SITE_URL + "/categories/" + categorySlug(media.category) },
      { "@type": "ListItem", position: 3, name: media.title, item: SITE_URL + "/image/" + media.id },
    ],
  };
  // A brand card is not a video thumbnail; omit incomplete VideoObject for legacy uploads.
  const object = video && !poster ? null : {
    "@context": "https://schema.org", "@type": video ? "VideoObject" : "ImageObject",
    name: media.title, description, contentUrl: media.image_url, url: SITE_URL + "/image/" + media.id,
    ...(video ? { uploadDate: media.created_at, thumbnailUrl: [poster] } : { representativeOfPage: true, datePublished: media.created_at, license: SITE_URL + "/license", acquireLicensePage: SITE_URL + "/image/" + media.id }),
    keywords: media.tags || undefined,
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(object ? [breadcrumb, object] : [breadcrumb]) }} />
    <MediaDetailClient initialMedia={{ ...media, description }} poster={poster} />
  </>;
}
