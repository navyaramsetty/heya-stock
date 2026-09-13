"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

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
};

export default function MediaDetailClient({
  initialMedia,
}: {
  initialMedia: MediaItem;
}) {
  const [media, setMedia] = useState<MediaItem>(initialMedia);
  const [downloading, setDownloading] = useState(false);

  const isVideo = media.media_type === "video";

  const handleDownload = async () => {
    if (downloading) return;

    try {
      setDownloading(true);

      const { error: downloadCountError } = await supabase.rpc(
        "increment_downloads",
        {
          image_id: media.id,
        }
      );

      if (downloadCountError) {
        throw downloadCountError;
      }

      const response = await fetch(media.image_url);

      if (!response.ok) {
        throw new Error(
          `Unable to download ${isVideo ? "video" : "image"}.`
        );
      }

      const blob = await response.blob();
      const contentType = blob.type || "";

      let extension = isVideo ? "mp4" : "jpg";

      if (contentType.includes("video/mp4")) {
        extension = "mp4";
      } else if (contentType.includes("video/webm")) {
        extension = "webm";
      } else if (contentType.includes("image/png")) {
        extension = "png";
      } else if (contentType.includes("image/webp")) {
        extension = "webp";
      } else if (contentType.includes("image/gif")) {
        extension = "gif";
      } else if (contentType.includes("image/jpeg")) {
        extension = "jpg";
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      const safeTitle = media.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      link.href = url;

      link.download = `${
        safeTitle ||
        (isVideo ? "heya-stock-video" : "heya-stock-photo")
      }.${extension}`;

      document.body.appendChild(link);

      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      setMedia((current) => ({
        ...current,
        downloads: (current.downloads || 0) + 1,
      }));
    } catch (error) {
      console.error("Download failed:", error);

      alert(
        error instanceof Error
          ? `Download failed: ${error.message}`
          : "Download failed. Please try again."
      );
    } finally {
      setDownloading(false);
    }
  };

  const tags = media.tags
    ? media.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

  const categorySlug = encodeURIComponent(
    media.category
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
  );

  return (
    <main className="min-h-screen bg-gray-50 text-black">
      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-2">
        {/* Preview */}
        <div className="flex min-h-[400px] items-center justify-center overflow-hidden rounded-2xl bg-black">
          {isVideo ? (
            <video
              src={media.image_url}
              controls
              playsInline
              preload="metadata"
              className="max-h-[750px] w-full object-contain"
            >
              Your browser does not support video playback.
            </video>
          ) : (
            <img
              src={media.image_url}
              alt={`${media.title} free stock photo`}
              className="max-h-[750px] w-full object-contain"
            />
          )}
        </div>

        {/* Information */}
        <div className="flex flex-col justify-center">
          <a
            href="/"
            className="mb-6 inline-block text-sm font-semibold text-gray-500 transition hover:text-black"
          >
            ← Back to Explore
          </a>

          <p className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500">
            {isVideo ? "Free Stock Video" : "Free Stock Photo"}
          </p>

          <h1 className="text-4xl font-black leading-tight">
            {media.title}
          </h1>

          {/* Category */}
          <a
            href={`/categories/${categorySlug}`}
            className="mt-3 inline-block text-sm font-semibold text-gray-500 transition hover:text-black"
          >
            {media.category}
          </a>

          {/* Description */}
          {media.description && (
            <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
              {media.description}
            </p>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-semibold text-gray-500">
                Tags
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-gray-200 px-3 py-1.5 text-sm text-gray-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Download */}
          <div className="mt-8">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="rounded-xl bg-black px-8 py-4 font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {downloading
                ? "Downloading..."
                : `↓ Download Free ${isVideo ? "Video" : "Photo"}`}
            </button>
          </div>

          {/* Stats */}
          <div className="mt-8 border-t pt-6">
            <p className="text-sm text-gray-500">
              Downloads: {media.downloads || 0}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Free to download for creative projects.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}