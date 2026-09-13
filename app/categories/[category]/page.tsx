import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import CategoryClient from "./CategoryClient";

type MediaItem = {
  id: number;
  title: string;
  category: string;
  image_url: string;
  status: string;
  media_type: string | null;
};

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

function normalizeCategory(value: string) {
  return decodeURIComponent(value)
    .replace(/-/g, " ")
    .trim();
}

function formatCategoryName(value: string) {
  return value
    .split(" ")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase()
    )
    .join(" ");
}

async function getCategoryMedia(category: string) {
  const normalizedCategory = normalizeCategory(category);

  const { data, error } = await supabase
    .from("images")
    .select(
      "id, title, category, image_url, status, media_type"
    )
    .eq("status", "approved")
    .ilike("category", normalizedCategory)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load category media:", error);
    return [];
  }

  return (data || []) as MediaItem[];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;

  const normalizedCategory =
    normalizeCategory(category);

  const categoryName =
    formatCategoryName(normalizedCategory);

  const title = `${categoryName} Stock Photos & Videos`;

  const description = `Browse and download free ${categoryName.toLowerCase()} stock photos and videos for websites, social media, marketing, design and creative projects.`;

  const canonicalPath = `/categories/${encodeURIComponent(
    normalizedCategory.toLowerCase().replace(/\s+/g, "-")
  )}`;

  return {
    title,
    description,

    keywords: [
      `${categoryName} stock photos`,
      `${categoryName} stock videos`,
      `free ${categoryName.toLowerCase()} images`,
      `free ${categoryName.toLowerCase()} videos`,
      `${categoryName} stock media`,
    ],

    alternates: {
      canonical: canonicalPath,
    },

    openGraph: {
      title: `${title} | Heya`,
      description,
      url: `${baseUrl}${canonicalPath}`,
      siteName: "Heya",
      type: "website",
    },

    twitter: {
      card: "summary_large_image",
      title: `${title} | Heya`,
      description,
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  const normalizedCategory =
    normalizeCategory(category);

  const categoryName =
    formatCategoryName(normalizedCategory);

  const media = await getCategoryMedia(category);

  return (
    <CategoryClient
      media={media}
      categoryName={categoryName}
    />
  );
}