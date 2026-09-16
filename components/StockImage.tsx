import Image from "next/image";
export default function StockImage({ src, alt, className = "", eager = false, sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" }: {
  src: string; alt: string; className?: string; eager?: boolean; sizes?: string;
}) {
  if (!src) return <span className="flex h-full items-center justify-center text-gray-500">Preview unavailable</span>;
  const storage = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const optimized = src.startsWith("/") || (!!storage && src.startsWith(storage + "/storage/v1/object/public/"));
  return <Image src={src} alt={alt} fill sizes={sizes} unoptimized={!optimized}
    loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : "auto"} className={className} />;
}
