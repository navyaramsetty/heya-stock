import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type MediaItem = {
  id: number;
  title: string;
  category: string;
  image_url: string;
  status: string;
  media_type: string | null;
};

type CategoryItem = {
  name: string;
  count: number;
  previewUrl: string;
  previewType: string | null;
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

export const metadata: Metadata = {
  title: "Browse Stock Photo & Video Categories",

  description:
    "Browse free stock photo and video categories on Heya, including travel, technology, business and more.",

  alternates: {
    canonical: "/categories",
  },

  openGraph: {
    title: "Browse Stock Photo & Video Categories | Heya",
    description:
      "Explore free stock photos and videos by category on Heya.",
    url: `${baseUrl}/categories`,
    siteName: "Heya",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Browse Stock Photo & Video Categories | Heya",
    description:
      "Explore free stock photos and videos by category on Heya.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

async function getCategories(): Promise<CategoryItem[]> {
  const { data, error } = await supabase
    .from("images")
    .select(
      "id, title, category, image_url, status, media_type"
    )
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load categories:", error);
    return [];
  }

  const media = (data || []) as MediaItem[];

  const map = new Map<string, CategoryItem>();

  media.forEach((item) => {
    const category = item.category?.trim();

    if (!category) return;

    const current = map.get(category);

    if (!current) {
      map.set(category, {
        name: category,
        count: 1,
        previewUrl: item.image_url,
        previewType: item.media_type,
      });
    } else {
      current.count += 1;
    }
  });

  return Array.from(map.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

function makeSlug(category: string) {
  return encodeURIComponent(
    category.toLowerCase().replace(/\s+/g, "-")
  );
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <main className="min-h-screen bg-white text-black">
      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
            Categories
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            Browse Stock Photo & Video Categories
          </h1>

          <p className="mt-3 max-w-2xl text-gray-600">
            Explore free stock photos and videos by category.
          </p>
        </div>

        {categories.length === 0 && (
          <div className="rounded-2xl bg-gray-50 px-6 py-16 text-center">
            <h2 className="text-xl font-bold">
              No categories yet
            </h2>

            <p className="mt-2 text-gray-500">
              Approved photos and videos will appear here automatically.
            </p>
          </div>
        )}

        {categories.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => {
              const isVideo =
                category.previewType === "video";

              return (
                <a
                  key={category.name}
                  href={`/categories/${makeSlug(
                    category.name
                  )}`}
                  className="group overflow-hidden rounded-2xl border bg-white transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative h-56 overflow-hidden bg-gray-200">
                    {isVideo ? (
                      <>
                        <video
                          src={category.previewUrl}
                          muted
                          playsInline
                          preload="metadata"
                          className="h-full w-full object-cover"
                        />

                        <span className="absolute bottom-3 left-3 rounded-full bg-black/75 px-3 py-1 text-xs font-semibold text-white">
                          Video
                        </span>
                      </>
                    ) : (
                      <img
                        src={category.previewUrl}
                        alt={`${category.name} stock photos and videos`}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    )}
                  </div>

                  <div className="p-5">
                    <h2 className="text-xl font-bold">
                      {category.name}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {category.count}{" "}
                      {category.count === 1
                        ? "media item"
                        : "media items"}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}