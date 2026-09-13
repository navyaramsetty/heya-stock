import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://heya-stock.vercel.app"),

  title: {
    default: "Heya - Free Stock Photos & Videos",
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

  alternates: {
    canonical: "/",
  },

  openGraph: {
    title: "Heya - Free Stock Photos & Videos",
    description:
      "Discover and download free high-quality stock photos and videos for websites, social media, marketing, design and creative projects.",
    url: "https://heya-stock.vercel.app",
    siteName: "Heya",
    type: "website",
    locale: "en_US",
  },

  twitter: {
    card: "summary_large_image",
    title: "Heya - Free Stock Photos & Videos",
    description:
      "Discover and download free high-quality stock photos and videos for websites, social media, marketing, design and creative projects.",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  category: "Stock Media",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}