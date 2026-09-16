import Link from "next/link";
import { PAGE_SIZE } from "@/lib/catalog";
export default function Pagination({ page, count, pathname, query = {} }: {
  page: number; count: number; pathname: string; query?: Record<string, string>;
}) {
  const pages = Math.ceil(count / PAGE_SIZE);
  if (pages < 2) return null;
  const href = (next: number) => {
    const params = new URLSearchParams(query);
    if (next > 1) params.set("page", String(next)); else params.delete("page");
    return pathname + (params.size ? "?" + params : "");
  };
  return <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-6">
    {page > 1 && <Link prefetch={false} href={href(page - 1)} rel="prev" className="rounded-xl border px-4 py-2">Previous</Link>}
    <span>Page {page} of {pages}</span>
    {page < pages && <Link prefetch={false} href={href(page + 1)} rel="next" className="rounded-xl border px-4 py-2">Next</Link>}
  </nav>;
}
