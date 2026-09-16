"use client";

import Link from "next/link";
import VideoPreview from "@/components/VideoPreview";
import StockImage from "@/components/StockImage";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

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

export default function HomeClient({
  initialItems, search, filter, count,
}: {
  initialItems: MediaItem[];
  search: string; filter: FilterType; count: number;
}) {
  const router = useRouter();
  const items = initialItems;
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setUser(session?.user ?? null);
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const filteredItems = items;
  return (
    <main className="bg-white text-black">
      <section className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl justify-end gap-3 px-5 py-3">
          {user ? (
            <>
              <Link prefetch={false}
                href="/upload"
                className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Upload
              </Link>

              <Link prefetch={false}
                href="/dashboard"
                className="rounded-full border px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Dashboard
              </Link>

              <button
                onClick={handleLogout}
                className="px-2 py-2 text-sm font-semibold text-gray-600 transition hover:text-black"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link prefetch={false}
                href="/login"
                className="px-3 py-2 text-sm font-semibold text-gray-700"
              >
                Login
              </Link>

              <Link prefetch={false}
                href="/signup"
                className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="border-b bg-gray-50">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center sm:py-28">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-gray-500">
            Free creative media
          </p>

          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
            Free Stock Photos & Videos
            <br />
            for bloggers, creators and small businesses
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
            Discover high-quality photos and videos for your websites,
            social media, designs and creative projects.
          </p>


          <form action="/" method="get" className="mx-auto mt-10 flex max-w-3xl flex-wrap gap-3">
            <label className="sr-only" htmlFor="media-search">Search photos and videos</label>
            <input id="media-search" type="search" name="q" defaultValue={search} key={search} maxLength={120}
              placeholder="Search photos, videos, categories or tags..." className="min-w-0 flex-1 rounded-xl border bg-white p-4" />
            <label className="sr-only" htmlFor="media-type">Media type</label>
            <select id="media-type" name="type" defaultValue={filter} key={filter} className="rounded-xl border bg-white p-4">
              <option value="all">All media</option><option value="image">Photos</option><option value="video">Videos</option>
            </select>
            <button type="submit" className="rounded-xl bg-black px-6 py-4 font-semibold text-white">Search</button>
          </form>
        </div>
      </section>

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

          <p className="text-sm text-gray-500">
            {count}{" "}
            {count === 1 ? "result" : "results"}
          </p>
        </div>

        {filteredItems.length === 0 ? (
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
                  <Link prefetch={false}
                    href={`/image/${item.id}`}
                    className="relative block aspect-[4/3]"
                  >
                    {isVideo ? (
                      <div className="relative h-full overflow-hidden bg-black">
                        <VideoPreview
                          src={item.image_url || ""}

                          className="h-full w-full object-cover"
                        />

                        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                          ▶ Video
                        </span>
                      </div>
                    ) : (
                      <StockImage
                        src={item.image_url || ""}
                        alt={item.title}
                        className="w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                    )}
                  </Link>

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

                    <Link prefetch={false}
                      href={`/image/${item.id}`}
                      className="mt-4 block rounded-xl border px-4 py-2 text-center text-sm font-semibold transition hover:bg-gray-50"
                    >
                      {isVideo ? "View Video" : "View Photo"}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="border-t bg-gray-50">
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

          <Link prefetch={false}
            href="/about"
            className="mt-7 inline-block rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Learn About Heya
          </Link>
        </div>
      </section>
    </main>
  );
}
