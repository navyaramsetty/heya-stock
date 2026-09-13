import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import MediaDetailClient from "./MediaDetailClient";

type MediaItem = {
  id: number;
  title: string;
  category: string;
  tags: string | null;
  description: string | null;
  image_url: string;
  status: string;
  downloads: number;
  media_type: string | null;
  created_at: string;
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

async function getMedia(id: number): Promise<MediaItem | null> {
  if (!id) return null;

  const { data, error } = await supabase
    .from("images")
    .select(
      "id, title, category, tags, description, image_url, status, downloads, media_type, created_at"
    )
    .eq("id", id)
    .eq("status", "approved")
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const media = await getMedia(Number(id));

  if (!media) {
    return {
      title: "Media Not Found",
      description:
        "The requested stock media could not be found on Heya.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const isVideo = media.media_type === "video";

  const description =
    media.description ||
    `Download this free ${
      isVideo ? "stock video" : "stock photo"
    } from Heya for websites, social media, marketing and creative projects.`;

  const keywords = media.tags
    ? media.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

  const pageTitle = `${media.title} - Free Stock ${
    isVideo ? "Video" : "Photo"
  }`;

  return {
    title: pageTitle,
    description,

    keywords: [
      media.title,
      media.category,
      isVideo ? "free stock video" : "free stock photo",
      ...keywords,
    ],

    alternates: {
      canonical: `/image/${media.id}`,
    },

    openGraph: {
      title: pageTitle,
      description,
      url: `${baseUrl}/image/${media.id}`,
      siteName: "Heya",
      type: "website",

      images: !isVideo
        ? [
            {
              url: media.image_url,
              alt: media.title,
            },
          ]
        : undefined,

      videos: isVideo
        ? [
            {
              url: media.image_url,
            },
          ]
        : undefined,
    },

    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: !isVideo ? [media.image_url] : undefined,
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-video-preview": -1,
        "max-snippet": -1,
      },
    },
  };
}

export default async function MediaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const media = await getMedia(Number(id));

  if (!media) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center text-black">
        <h1 className="text-3xl font-bold">
          Media not found
        </h1>

        <p className="mt-3 text-gray-500">
          This item may not exist or may not be approved yet.
        </p>

        <a
          href="/"
          className="mt-6 rounded-xl bg-black px-6 py-3 font-semibold text-white"
        >
          Back to Heya
        </a>
      </main>
    );
  }

  const isVideo = media.media_type === "video";

  const description =
    media.description ||
    `Free ${
      isVideo ? "stock video" : "stock photo"
    } available to download from Heya.`;

  const keywords = media.tags
    ? media.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

  const structuredData = isVideo
    ? {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: media.title,
        description,
        uploadDate: media.created_at,
        contentUrl: media.image_url,
        url: `${baseUrl}/image/${media.id}`,
        keywords: keywords.join(", "),
        genre: media.category,
      }
    : {
        "@context": "https://schema.org",
        "@type": "ImageObject",
        name: media.title,
        description,
        contentUrl: media.image_url,
        url: `${baseUrl}/image/${media.id}`,
        uploadDate: media.created_at,
        keywords: keywords.join(", "),
        genre: media.category,
        representativeOfPage: true,
      };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(
            /</g,
            "\\u003c"
          ),
        }}
      />

      <MediaDetailClient initialMedia={media} />
    </>
  );
}