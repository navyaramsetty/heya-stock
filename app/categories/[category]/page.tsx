"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ImageItem = {
  id: number;
  title: string;
  category: string;
  image_url: string;
  status: string;
};

export default function CategoryPage() {
  const params = useParams();

  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);

  const rawCategory = Array.isArray(params.category)
    ? params.category[0]
    : params.category;

  const decodedCategory = decodeURIComponent(rawCategory || "");

  const normalizedCategory = decodedCategory
    .replace(/-/g, " ")
    .trim();

  const categoryName = normalizedCategory
    .split(" ")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase()
    )
    .join(" ");

  useEffect(() => {
    const fetchCategoryImages = async () => {
      if (!normalizedCategory) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
        .from("images")
        .select("id, title, category, image_url, status")
        .eq("status", "approved")
        .ilike("category", normalizedCategory)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load category images:", error);
        setImages([]);
        setLoading(false);
        return;
      }

      setImages(data || []);
      setLoading(false);
    };

    fetchCategoryImages();
  }, [normalizedCategory]);

  return (
    <main className="min-h-screen bg-white text-black">
      <header className="border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="/" className="text-2xl font-bold">
            Heya
          </a>

          <nav className="flex gap-6 text-sm font-medium">
            <a href="/">Explore</a>
            <a href="/categories">Categories</a>
            <a href="#">About</a>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <a
          href="/categories"
          className="mb-6 inline-block text-sm font-semibold text-gray-600"
        >
          ← Back to Categories
        </a>

        <div className="mb-10">
          <h1 className="text-4xl font-bold">
            {categoryName} Stock Images
          </h1>

          <p className="mt-3 text-gray-600">
            Browse free {categoryName.toLowerCase()} images available for
            download.
          </p>
        </div>

        {loading && (
          <div className="py-16 text-center">
            <p className="text-gray-500">
              Loading images...
            </p>
          </div>
        )}

        {!loading && images.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="group overflow-hidden rounded-2xl border bg-white transition hover:-translate-y-1 hover:shadow-lg"
              >
                <a href={`/image/${image.id}`}>
                  <div className="h-72 overflow-hidden bg-gray-200">
                    <img
                      src={image.image_url}
                      alt={`${image.title} stock image`}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                </a>

                <div className="p-4">
                  <h2 className="font-bold">
                    {image.title}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {image.category}
                  </p>

                  <a
                    href={`/image/${image.id}`}
                    className="mt-4 inline-block rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
                  >
                    View Image
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && images.length === 0 && (
          <div className="rounded-2xl border bg-gray-50 p-10 text-center">
            <h2 className="text-xl font-bold">
              No images found
            </h2>

            <p className="mt-2 text-gray-500">
              There are currently no approved images in this category.
            </p>

            <a
              href="/categories"
              className="mt-6 inline-block rounded-xl bg-black px-6 py-3 font-semibold text-white"
            >
              Browse Other Categories
            </a>
          </div>
        )}
      </section>
    </main>
  );
}