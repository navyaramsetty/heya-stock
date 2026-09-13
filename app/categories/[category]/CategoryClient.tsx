"use client";

type MediaItem = {
  id: number;
  title: string;
  category: string;
  image_url: string;
  status: string;
  media_type: string | null;
};

export default function CategoryClient({
  media,
  categoryName,
}: {
  media: MediaItem[];
  categoryName: string;
}) {
  return (
    <main className="min-h-screen bg-white text-black">
      <section className="mx-auto max-w-7xl px-6 py-12">
        <a
          href="/categories"
          className="mb-6 inline-block text-sm font-semibold text-gray-600 transition hover:text-black"
        >
          ← Back to Categories
        </a>

        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
            Category
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            {categoryName} Stock Photos & Videos
          </h1>

          <p className="mt-3 max-w-3xl text-gray-600">
            Browse free{" "}
            {categoryName.toLowerCase()} stock photos and
            videos available for download on Heya.
          </p>
        </div>

        {media.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {media.map((item) => {
              const isVideo =
                item.media_type === "video";

              return (
                <div
                  key={item.id}
                  className="group overflow-hidden rounded-2xl border bg-white transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <a href={`/image/${item.id}`}>
                    <div className="relative h-72 overflow-hidden bg-gray-200">
                      {isVideo ? (
                        <>
                          <video
                            src={item.image_url}
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
                          src={item.image_url}
                          alt={`${item.title} free stock photo`}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      )}
                    </div>
                  </a>

                  <div className="p-4">
                    <h2 className="font-bold">
                      {item.title}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {item.category}
                    </p>

                    <a
                      href={`/image/${item.id}`}
                      className="mt-4 inline-block rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
                    >
                      {isVideo
                        ? "View Video"
                        : "View Photo"}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {media.length === 0 && (
          <div className="rounded-2xl border bg-gray-50 p-10 text-center">
            <h2 className="text-xl font-bold">
              No media found
            </h2>

            <p className="mt-2 text-gray-500">
              There are currently no approved photos or
              videos in this category.
            </p>

            <a
              href="/categories"
              className="mt-6 inline-block rounded-xl bg-black px-6 py-3 font-semibold text-white transition hover:bg-gray-800"
            >
              Browse Other Categories
            </a>
          </div>
        )}
      </section>
    </main>
  );
}