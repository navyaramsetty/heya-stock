"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  featured: boolean;
};

export default function Home() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("images")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load images:", error);
        setImages([]);
        setLoading(false);
        return;
      }

      setImages(data || []);
      setLoading(false);
    };

    fetchImages();
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setUserLoggedIn(!!session);
      setAuthLoading(false);
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserLoggedIn(!!session);
      setAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();

    setUserLoggedIn(false);

    router.push("/");
    router.refresh();
  };

  const filteredImages = images.filter((image) => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return true;
    }

    return (
      image.title.toLowerCase().includes(query) ||
      image.category.toLowerCase().includes(query) ||
      image.tags?.toLowerCase().includes(query) ||
      image.description?.toLowerCase().includes(query)
    );
  });

  return (
    <main className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="/" className="text-2xl font-bold">
            Heya
          </a>

          <nav className="flex items-center gap-5 text-sm font-medium">
            <a
              href="/"
              className="transition hover:text-gray-500"
            >
              Explore
            </a>

            <a
              href="/categories"
              className="transition hover:text-gray-500"
            >
              Categories
            </a>

            <a
              href="#about"
              className="hidden transition hover:text-gray-500 md:block"
            >
              About
            </a>

            {!authLoading && !userLoggedIn && (
              <>
                <a
                  href="/login"
                  className="transition hover:text-gray-500"
                >
                  Login
                </a>

                <a
                  href="/signup"
                  className="rounded-full bg-black px-5 py-2.5 font-semibold text-white transition hover:bg-gray-800"
                >
                  Sign Up
                </a>
              </>
            )}

            {!authLoading && userLoggedIn && (
              <>
                <a
                  href="/upload"
                  className="hidden transition hover:text-gray-500 sm:block"
                >
                  Upload
                </a>

                <a
                  href="/dashboard"
                  className="rounded-full bg-black px-5 py-2.5 font-semibold text-white transition hover:bg-gray-800"
                >
                  Dashboard
                </a>

                <button
                  onClick={handleLogout}
                  className="hidden rounded-full border px-5 py-2.5 font-semibold transition hover:bg-gray-100 lg:block"
                >
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-black px-6 py-24 text-center text-white">
        <h1 className="text-4xl font-bold md:text-6xl">
          Free Stock Images for Everyone
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-300">
          Discover high-quality images for websites, social media, ads and
          creative projects.
        </p>

        <div className="mx-auto mt-8 flex max-w-2xl overflow-hidden rounded-full bg-white shadow-lg">
          <input
            type="text"
            placeholder="Search free images..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-6 py-4 text-black outline-none"
          />

          <button
            type="button"
            className="bg-gray-200 px-7 font-semibold text-black transition hover:bg-gray-300"
          >
            Search
          </button>
        </div>
      </section>

      {/* Image Section */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {search
                ? `Search Results for "${search}"`
                : "Latest Images"}
            </h2>

            {!loading && (
              <p className="mt-1 text-sm text-gray-500">
                {filteredImages.length}{" "}
                {filteredImages.length === 1
                  ? "image"
                  : "images"}
              </p>
            )}
          </div>

          <a
            href="/categories"
            className="hidden text-sm font-semibold underline sm:block"
          >
            Browse Categories
          </a>
        </div>

        {loading && (
          <div className="py-16 text-center">
            <p className="text-gray-500">
              Loading images...
            </p>
          </div>
        )}

        {!loading && filteredImages.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="group relative h-80 overflow-hidden rounded-2xl bg-gray-200"
              >
                <a
                  href={`/image/${image.id}`}
                  className="absolute inset-0 z-10"
                  aria-label={`View ${image.title}`}
                />

                <img
                  src={image.image_url}
                  alt={`${image.title} stock image`}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex items-center justify-between p-5">
                  <div>
                    <span className="block font-semibold text-white">
                      {image.title}
                    </span>

                    <span className="text-xs text-gray-200">
                      {image.category}
                    </span>
                  </div>

                  <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black">
                    View
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredImages.length === 0 && (
          <div className="rounded-2xl bg-gray-50 px-6 py-16 text-center">
            <h3 className="text-xl font-bold">
              No images found
            </h3>

            <p className="mt-2 text-gray-500">
              Try searching with another keyword or browse the categories.
            </p>

            <button
              onClick={() => setSearch("")}
              className="mt-6 rounded-xl bg-black px-6 py-3 font-semibold text-white"
            >
              Clear Search
            </button>
          </div>
        )}
      </section>

      {/* About */}
      <section
        id="about"
        className="border-t bg-gray-50 px-6 py-16"
      >
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold">
            About Heya
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-gray-600">
            Heya is a growing stock image platform where creators can
            contribute images and everyone can discover high-quality visuals
            for creative projects.
          </p>

          {!userLoggedIn && !authLoading && (
            <a
              href="/signup"
              className="mt-7 inline-block rounded-xl bg-black px-6 py-3 font-semibold text-white"
            >
              Join Heya
            </a>
          )}

          {userLoggedIn && !authLoading && (
            <a
              href="/upload"
              className="mt-7 inline-block rounded-xl bg-black px-6 py-3 font-semibold text-white"
            >
              Upload Your Images
            </a>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-gray-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Heya</p>

          <div className="flex gap-5">
            <a href="/">Explore</a>
            <a href="/categories">Categories</a>
            <a href="#about">About</a>
          </div>
        </div>
      </footer>
    </main>
  );
}