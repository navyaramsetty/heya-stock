import Link from "next/link";
import { getRelatedMedia } from "@/lib/catalog";
import { getVideoPoster } from "@/lib/video-poster";
import StockImage from "@/components/StockImage";
import VideoPreview from "@/components/VideoPreview";

export default async function RelatedContent({ currentId, category }: {
  currentId: number;
  category: string;
}) {
  const items = await getRelatedMedia(currentId, category);
  if (!items.length) return null;

  const cards = await Promise.all(items.map(async item => ({
    ...item,
    preview: item.media_type === "video" ? await getVideoPoster(item.image_url) : item.image_url,
  })));

  return (
    <section aria-labelledby="related-content-heading" className="border-t bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <h2 id="related-content-heading" className="text-3xl font-bold text-black">Related Content</h2>
        <p className="mt-3 text-gray-600">More stock photos and videos in {category}.</p>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(item => (
            <article key={item.id} className="overflow-hidden rounded-2xl border bg-white">
              <Link href={"/image/" + item.id} prefetch={false} className="group block focus-visible:outline-2 focus-visible:outline-offset-4">
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  {item.preview ? (
                    <StockImage src={item.preview} alt={item.title}
                      className="object-cover transition duration-300 group-hover:scale-105" />
                  ) : (
                    <VideoPreview src={item.image_url} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-black">{item.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{item.media_type === "video" ? "Stock video" : "Stock photo"}</p>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
