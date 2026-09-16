import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HomeClient from "@/components/HomeClient";
import Pagination from "@/components/Pagination";
import { getMediaPage, pageNumber } from "@/lib/catalog";
import { pageMetadata, SITE_URL, jsonLd } from "@/lib/seo";
type Search = { page?: string; q?: string; type?: string };
function filters(params: Search) {
  return { page: pageNumber(params.page), q: (typeof params.q === "string" ? params.q : "").trim().slice(0, 120), type: ["image", "video"].includes(params.type || "") ? params.type! : "all" };
}
export async function generateMetadata({ searchParams }: { searchParams: Promise<Search> }): Promise<Metadata> {
  const { page, q, type } = filters(await searchParams);
  const title = "Free Stock Photos & Videos" + (page > 1 ? " - Page " + page : "");
  const query = new URLSearchParams();
  if (q) query.set("q", q);
  if (type !== "all") query.set("type", type);
  if (page > 1) query.set("page", String(page));
  return { ...pageMetadata(title, "Discover and download free stock photos and videos for websites, social media and creative projects.", "/" + (query.size ? "?" + query : "")),
    title: { absolute: title + " | Heya" },
    ...(q || type !== "all" ? { robots: { index: false, follow: true, googleBot: { index: false, follow: true } } } : {}) };
}
export default async function HomePage({ searchParams }: { searchParams: Promise<Search> }) {
  const { page, q, type } = filters(await searchParams);
  const { items, count } = await getMediaPage(page, q, type);
  if (page > 1 && !items.length) notFound();
  const query: Record<string, string> = {};
  if (q) query.q = q;
  if (type !== "all") query.type = type;
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({
      "@context": "https://schema.org", "@graph": [
        { "@type": "Organization", "@id": SITE_URL + "/#organization", name: "Heya", url: SITE_URL },
        { "@type": "WebSite", "@id": SITE_URL + "/#website", name: "Heya", url: SITE_URL, publisher: { "@id": SITE_URL + "/#organization" } },
      ],
    }) }} />
    <HomeClient initialItems={items} search={q} filter={type as "all" | "image" | "video"} count={count} />
    <div className="pb-12"><Pagination page={page} count={count} pathname="/" query={query} /></div>
  </>;
}
