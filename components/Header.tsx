"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  const linkClass = (path: string) =>
    pathname === path
      ? "font-semibold text-black"
      : "text-gray-600 transition hover:text-black";

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight"
        >
          Heya
        </Link>

        <nav
          className="flex items-center gap-6 text-sm font-medium"
          aria-label="Main navigation"
        >
          <Link
            href="/"
            className={linkClass("/")}
          >
            Explore
          </Link>

          <Link
            href="/categories"
            className={linkClass("/categories")}
          >
            Categories
          </Link>

          <Link
            href="/about"
            className={linkClass("/about")}
          >
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}