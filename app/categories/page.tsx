"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type ImageItem = {
  id: number;
  title: string;
  category: string;
  image_url: string;
  status: string;
};

export default function CategoriesPage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("images")
        .select("id, title, category, image_url, status")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load categories:", error);
        setImages([]);
        setLoading(false);
        return;
      }

      setImages(data || []);
      setLoading(false);
    };

    fetchImages();
  }, []);

  const categories = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        count: number;
        previewImage: string;
      }
    >();

    images.forEach((image) => {
      const category = image.category?.trim();

      if (!category) return;

      if (!map.has(category)) {
        map.set(category, {
          name: category,
          count: 1,
          previewImage: image.image_url,
        });
      } else {
        const current = map.get(category);

        if (current) {
          current.count += 1;
        }
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [images]);

  const makeSlug = (category: string) =>
    encodeURIComponent(category.toLowerCase().replace(/\s+/g, "-"));

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

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="mb-10">
          <h1 className="text-4xl font-bold">
            Browse Categories
          </h1>

          <p className="mt-3 text-gray-600">
            Explore free stock images by category.
          </p>
        </div>

        {loading && (
          <div className="py-16 text-center">
            <p className="text-gray-500">
              Loading categories...
            </p>
          </div>
        )}

        {!loading && categories.length === 0 && (
          <div className="rounded-2xl bg-gray-50 px-6 py-16 text-center">
            <h2 className="text-xl font-bold">
              No categories yet
            </h2>

            <p className="mt-2 text-gray-500">
              Approved images will appear here automatically.
            </p>
          </div>
        )}

        {!loading && categories.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <a
                key={category.name}
                href={`/categories/${makeSlug(category.name)}`}
                className="group overflow-hidden rounded-2xl border bg-white transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="h-56 overflow-hidden bg-gray-200">
                  <img
                    src={category.previewImage}
                    alt={`${category.name} stock images`}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="p-5">
                  <h2 className="text-xl font-bold">
                    {category.name}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {category.count}{" "}
                    {category.count === 1 ? "image" : "images"}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}