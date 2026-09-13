"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

type MediaItem = {
  id: number;
  title: string;
  category: string;
  tags: string | null;
  description: string | null;
  image_url: string | null;
  media_type: string | null;
  downloads: number;
  featured: boolean | null;
  created_at: string;
};

type FilterType = "all" | "image" | "video";

export default function HomePage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    loadUser();
    loadMedia();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    setUser(session?.user ?? null);
  };

  const loadMedia = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("images")
      .select(
        "id, title, category, tags, description, image_url, media_type, downloads, featured, created_at"
      )
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load media:", error);
      setItems([]);
    } else {
      setItems(data || []);
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      const mediaType = item.media_type || "image";

      const matchesType =
        filter === "all" || mediaType === filter;

      if (!matchesType) return false;

      if (!query) return true;

      const searchableText = [
        item.title,
        item.category,
        item.tags,
        item.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [items, search, filter]);

  const photoCount = items.filter(
    (item) => (item.media_type || "image") === "image"
  ).length;

  const videoCount = items.filter(
    (item) => item.media_type === "video"
  ).length;

  return (
    <main className="min-h-screen bg-white text-black">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <a href="/" className="text-2xl font-black tracking-tight">
            Heya
          </a>

          <nav className="flex items-center gap-3 sm:gap-5">
            <a
              href="#explore"
              className="hidden text-sm font-semibold text-gray-600 transition hover:text-black sm:block"
            >
              Explore
            </a>

            <a
              href="/categories"
              className="hidden text-sm font-semibold text-gray-600 transition hover:text-black md:block"
            >
              Categories
            </a>

            <a
              href="#about"
              className="hidden text-sm font-semibold text-gray-600 transition hover:text-black lg:block"
            >
              About
            </a>

            {user ? (
              <>
                <a
                  href="/upload"
                  className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                  Upload
                </a>

                <a
                  href="/dashboard"
                  className="hidden text-sm font-semibold text-gray-600 transition hover:text-black sm:block"
                >
                  Dashboard
                </a>

                <button
                  onClick={handleLogout}
                  className="hidden text-sm font-semibold text-gray-600 transition hover:text-black md:block"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  className="text-sm font-semibold text-gray-700"
                >
                  Login
                </a>

                <a
                  href="/signup"
                  className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                  Sign Up
                </a>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="border-b bg-gray-50">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center sm:py-28">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-gray-500">
            Free creative media
          </p>

          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
            Free Stock Images & Videos
            <br />
            for Everyone
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
            Discover high-quality photos and videos for your websites,
            social media, designs and creative projects.
          </p>

          <div className="mx-auto mt-10 max-w-3xl">
            <div className="flex items-center rounded-2xl border bg-white px-5 shadow-sm">
              <span className="text-xl">⌕</span>

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search photos, videos, categories or tags..."
                className="w-full bg-transparent px-4 py-5 text-base outline-none"
              />
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                filter === "all"
                  ? "bg-black text-white"
                  : "border bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              All ({items.length})
            </button>

            <button
              onClick={() => setFilter("image")}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                filter === "image"
                  ? "bg-black text-white"
                  : "border bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Photos ({photoCount})
            </button>

            <button
              onClick={() => setFilter("video")}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                filter === "video"
                  ? "bg-black text-white"
                  : "border bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Videos ({videoCount})
            </button>
          </div>
        </div>
      </section>

      {/* EXPLORE */}
      <section
        id="explore"
        className="mx-auto max-w-7xl px-5 py-14 sm:px-6"
      >
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              Explore
            </p>

            <h2 className="mt-1 text-3xl font-black">
              {filter === "video"
                ? "Stock Videos"
                : filter === "image"
                ? "Stock Photos"
                : "Latest Media"}
            </h2>
          </div>

          {!loading && (
            <p className="text-sm text-gray-500">
              {filteredItems.length}{" "}
              {filteredItems.length === 1 ? "result" : "results"}
            </p>
          )}
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-80 animate-pulse rounded-2xl bg-gray-200"
              />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-3xl border bg-gray-50 px-6 py-20 text-center">
            <h3 className="text-2xl font-bold">
              No media found
            </h3>

            <p className="mt-2 text-gray-500">
              Try another search or choose a different filter.
            </p>
          </div>
        ) : (
          <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
            {filteredItems.map((item) => {
              const isVideo = item.media_type === "video";

              return (
                <article
                  key={item.id}
                  className="group relative mb-5 break-inside-avoid overflow-hidden rounded-2xl bg-gray-100"
                >
                  {isVideo ? (
                    <div className="relative overflow-hidden bg-black">
                      <video
                        src={item.image_url || ""}
                        controls
                        preload="metadata"
                        playsInline
                        className="max-h-[520px] w-full object-cover"
                      />

                      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                        ▶ Video
                      </span>
                    </div>
                  ) : (
                    <a href={`/image/${item.id}`} className="block">
                      <img
                        src={item.image_url || ""}
                        alt={item.title}
                        loading="lazy"
                        className="w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                    </a>
                  )}

                  <div className="bg-white p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="truncate font-bold">
                          {item.title}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          {item.category}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold">
                        {isVideo ? "Video" : "Photo"}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {item.downloads || 0} downloads
                      </span>

                      {item.featured && (
                        <span className="font-semibold text-black">
                          Featured
                        </span>
                      )}
                    </div>

                    {!isVideo && (
                      <a
                        href={`/image/${item.id}`}
                        className="mt-4 block rounded-xl border px-4 py-2 text-center text-sm font-semibold transition hover:bg-gray-50"
                      >
                        View Photo
                      </a>
                    )}

                    {isVideo && (
                      <p className="mt-4 text-xs text-gray-400">
                        Video details and download page coming next.
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ABOUT */}
      <section
        id="about"
        className="border-t bg-gray-50"
      >
        <div className="mx-auto max-w-5xl px-6 py-20 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            About Heya
          </p>

          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            Creative content for everyone.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-gray-600">
            Heya is a growing collection of stock photos and videos
            contributed by creators and made easy to discover,
            preview and download.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Heya
          </p>

          <p>
            Free Stock Images & Videos
          </p>
        </div>
      </footer>
    </main>
  );
}