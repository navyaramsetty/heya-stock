import type { Metadata } from "next";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://heya-stock.vercel.app").replace(/\/$/, "");
export const DEFAULT_IMAGE = SITE_URL + "/share-image";
export function categorySlug(value: string) { return encodeURIComponent(value.trim().toLowerCase().replace(/\s+/g, "-")); }
export function pageMetadata(title: string, description: string, path: string, image = DEFAULT_IMAGE): Metadata {
  const socialTitle = title + " | Heya";
  return {
    title, description, alternates: { canonical: path },
    openGraph: { title: socialTitle, description, url: SITE_URL + path, siteName: "Heya", type: "website", images: [{ url: image, alt: title }] },
    twitter: { card: "summary_large_image", title: socialTitle, description, images: [image] },
  };
}
export function jsonLd(value: unknown) { return JSON.stringify(value).replace(/</g, "\\u003c"); }
