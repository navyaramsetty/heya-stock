import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href="/"
              className="text-xl font-bold text-black"
            >
              Heya
            </Link>

            <p className="mt-3 max-w-sm text-sm leading-6 text-gray-500">
              Discover free stock photos and videos for
              websites, social media, marketing, design
              and creative projects.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm">
            <Link
              href="/about"
              className="text-gray-600 transition hover:text-black"
            >
              About
            </Link>

            <Link
              href="/categories"
              className="text-gray-600 transition hover:text-black"
            >
              Categories
            </Link>

            <Link
              href="/license"
              className="text-gray-600 transition hover:text-black"
            >
              License
            </Link>

            <Link
              href="/privacy"
              className="text-gray-600 transition hover:text-black"
            >
              Privacy
            </Link>

            <Link
              href="/terms"
              className="text-gray-600 transition hover:text-black"
            >
              Terms
            </Link>

            <Link
              href="/contact"
              className="text-gray-600 transition hover:text-black"
            >
              Contact
            </Link>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-sm text-gray-500">
          © {new Date().getFullYear()} Heya. All rights reserved.
        </div>
      </div>
    </footer>
  );
}