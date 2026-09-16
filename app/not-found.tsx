import Link from "next/link";
export default function NotFound() {
  return <main className="mx-auto max-w-3xl px-6 py-24 text-center">
    <h1 className="text-4xl font-bold">Page not found</h1>
    <p className="mt-4">This page may have moved or is no longer available.</p>
    <Link href="/" className="mt-8 inline-block rounded-xl bg-black px-6 py-3 text-white">Explore Heya</Link>
  </main>;
}
