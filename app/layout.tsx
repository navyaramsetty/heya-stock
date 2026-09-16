import type { Metadata } from "next";
import { SITE_URL, DEFAULT_IMAGE } from "@/lib/seo";
import SiteShell from "@/components/SiteShell";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    SITE_URL
  ),

  title: {
    default:
      "Heya - Free Stock Photos & Videos",
    template: "%s | Heya",
  },

  description:
    "Discover and download free high-quality stock photos and videos for websites, social media, marketing, design and creative projects.",

  keywords: [
    "free stock photos",
    "free stock videos",
    "stock images",
    "stock footage",
    "free images",
    "free videos",
    "royalty free images",
    "royalty free videos",
    "photos for websites",
    "videos for social media",
    "marketing images",
    "creative assets",
    "Heya stock",
  ],

  authors: [
    {
      name: "Heya",
    },
  ],

  creator: "Heya",
  publisher: "Heya",


  openGraph: {
    images: [{ url: DEFAULT_IMAGE, width: 1200, height: 630, alt: "Heya stock photos and videos" }],
    title:
      "Heya - Free Stock Photos & Videos",

    description:
      "Discover and download free high-quality stock photos and videos for websites, social media, marketing, design and creative projects.",

    url:
      SITE_URL,

    siteName: "Heya",

    type: "website",

    locale: "en_US",
  },

  twitter: {
    images: [DEFAULT_IMAGE],
    card: "summary_large_image",

    title:
      "Heya - Free Stock Photos & Videos",

    description:
      "Discover and download free high-quality stock photos and videos for websites, social media, marketing, design and creative projects.",
  },

  robots: {

    googleBot: {

      "max-image-preview": "large",

      "max-snippet": -1,

      "max-video-preview": -1,
    },
  },

  category: "Stock Media",
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >

      <body className="flex min-h-full flex-col">
        <SiteShell>
          {children}
        </SiteShell>
      </body>
    </html>
  );
}
