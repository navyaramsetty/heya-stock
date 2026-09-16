import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import CategoryClient from "./CategoryClient";
import Pagination from "@/components/Pagination";
import { getCategories, getMediaPage, pageNumber } from "@/lib/catalog";
import { categorySlug, pageMetadata } from "@/lib/seo";
type Props = { params: Promise<{ category: string }>; searchParams: Promise<{ page?: string }> };
async function resolveCategory(slug: string) {
  const category = (await getCategories()).find(item => decodeURIComponent(categorySlug(item.name)) === slug.toLowerCase());
  if (!category) notFound();
  return category;
}
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const category = await resolveCategory((await params).category);
  const page = pageNumber((await searchParams).page);
  const path = "/categories/" + categorySlug(category.name) + (page > 1 ? "?page=" + page : "");
  return pageMetadata(category.name + " Stock Photos & Videos" + (page > 1 ? " - Page " + page : ""),
    "Browse free " + category.name.toLowerCase() + " stock photos and videos for your next creative project.", path);
}
export default async function CategoryPage({ params, searchParams }: Props) {
  const { category: slug } = await params;
  const category = await resolveCategory(slug);
  const page = pageNumber((await searchParams).page);
  const path = "/categories/" + categorySlug(category.name);
  if (encodeURIComponent(slug) !== categorySlug(category.name)) permanentRedirect(path + (page > 1 ? "?page=" + page : ""));
  const { items, count } = await getMediaPage(page, "", "all", category.name);
  if (page > 1 && !items.length) notFound();
  return <><CategoryClient media={items} categoryName={category.name} />
    <div className="pb-12"><Pagination page={page} count={count} pathname={path} /></div></>;
}
