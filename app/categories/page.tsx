import Link from "next/link";
import VideoPreview from "@/components/VideoPreview";
import StockImage from "@/components/StockImage";
import { getCategories } from "@/lib/catalog";
import { pageMetadata, categorySlug as makeSlug } from "@/lib/seo";
export const dynamic = "force-dynamic";
export const metadata = pageMetadata("Browse Stock Photo & Video Categories", "Browse free stock photos and videos by category, including travel, technology, business and nature.", "/categories");
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
                <Link prefetch={false}
                  key={category.name}
                  href={`/categories/${makeSlug(
                    category.name
                  )}`}
                  className="group overflow-hidden rounded-2xl border bg-white transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative h-56 overflow-hidden bg-gray-200">
                    {isVideo ? (
                      <>
                        <VideoPreview
                          src={category.previewUrl}

                          className="h-full w-full object-cover"
                        />

                        <span className="absolute bottom-3 left-3 rounded-full bg-black/75 px-3 py-1 text-xs font-semibold text-white">
                          Video
                        </span>
                      </>
                    ) : (
                      <StockImage sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
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
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
