"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ImageItem = {
  id: number;
  title: string;
  category: string;
  tags: string | null;
  description: string | null;
  image_url: string;
  status: string;
  downloads: number;
};

export default function ImagePage() {
  const params = useParams();

  const [image, setImage] = useState<ImageItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchImage = async () => {
      const id = Number(params.id);

      if (!id) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("images")
        .select("*")
        .eq("id", id)
        .eq("status", "approved")
        .single();

      if (error || !data) {
        console.error("Failed to load image:", error);
        setNotFound(true);
        setLoading(false);
        return;
      }

      setImage(data);
      setLoading(false);
    };

    fetchImage();
  }, [params.id]);

  const handleDownload = async () => {
    if (!image || downloading) return;

    try {
      setDownloading(true);

      // Securely increment download count
      const { error: downloadCountError } = await supabase.rpc(
        "increment_downloads",
        {
          image_id: image.id,
        }
      );

      if (downloadCountError) {
        throw downloadCountError;
      }

      // Fetch actual image file
      const response = await fetch(image.image_url);

      if (!response.ok) {
        throw new Error("Unable to download image.");
      }

      const blob = await response.blob();

      // Try to preserve the original file type
      const contentType = blob.type || "image/jpeg";

      let extension = "jpg";

      if (contentType.includes("png")) {
        extension = "png";
      } else if (contentType.includes("webp")) {
        extension = "webp";
      } else if (contentType.includes("gif")) {
        extension = "gif";
      } else if (contentType.includes("jpeg")) {
        extension = "jpg";
      }

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      const safeTitle = image.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      link.href = url;
      link.download = `${safeTitle || "heya-image"}.${extension}`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      // Update visible count instantly
      setImage((current) =>
        current
          ? {
              ...current,
              downloads: (current.downloads || 0) + 1,
            }
          : current
      );
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

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-black">
        <p className="text-lg font-semibold">
          Loading image...
        </p>
      </main>
    );
  }

  if (notFound || !image) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-black">
        <h1 className="text-3xl font-bold">
          Image not found
        </h1>

        <p className="mt-3 text-gray-500">
          This image may not exist or may not be approved yet.
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

  return (
    <main className="min-h-screen bg-gray-50 text-black">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a
            href="/"
            className="text-2xl font-bold"
          >
            Heya
          </a>

          <a
            href="/"
            className="rounded-full border px-5 py-2 text-sm font-semibold transition hover:bg-gray-50"
          >
            Back to Explore
          </a>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl bg-gray-200">
          <img
            src={image.image_url}
            alt={`${image.title} stock image`}
            className="h-full max-h-[700px] w-full object-contain"
          />
        </div>

        <div className="flex flex-col justify-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Free Stock Image
          </p>

          <h1 className="text-4xl font-bold">
            {image.title}
          </h1>

          <p className="mt-3 text-sm font-semibold text-gray-500">
            {image.category}
          </p>

          {image.description && (
            <p className="mt-5 max-w-xl text-lg leading-8 text-gray-600">
              {image.description}
            </p>
          )}

          {image.tags && (
            <div className="mt-5">
              <p className="text-sm font-semibold text-gray-500">
                Tags
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                {image.tags
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean)
                  .map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-gray-200 px-3 py-1 text-sm text-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            </div>
          )}

          <div className="mt-8">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="rounded-xl bg-black px-8 py-4 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {downloading
                ? "Downloading..."
                : "↓ Download Free"}
            </button>
          </div>

          <div className="mt-8 border-t pt-6">
            <p className="text-sm text-gray-500">
              Downloads: {image.downloads || 0}
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