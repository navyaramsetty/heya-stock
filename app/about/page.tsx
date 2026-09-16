import Link from "next/link";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "About",
  "Learn about Heya, a growing platform for discovering and downloading free stock photos and videos for websites, social media, marketing, design and creative projects.",
  "/about"
);

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      {/* Hero */}
      <section className="border-b bg-gray-50">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-gray-500">
            About Heya
          </p>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Free stock media for creative ideas.
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-600">
            Heya is a growing stock media platform created to help people
            discover useful photos and videos for websites, social media,
            marketing, design and other creative projects.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold">
              What is Heya?
            </h2>

            <p className="mt-4 leading-7 text-gray-600">
              Heya is built around a simple idea: discovering useful visual
              content should be easy. Our platform brings together stock photos
              and videos in searchable categories so visitors can quickly find
              media that fits their creative needs.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold">
              Our Mission
            </h2>

            <p className="mt-4 leading-7 text-gray-600">
              Our mission is to build an accessible and useful collection of
              stock media while creating a platform where contributors can
              share their creative work with a wider audience.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold">
              Photos & Videos
            </h2>

            <p className="mt-4 leading-7 text-gray-600">
              Heya supports both photos and videos across topics such as travel,
              technology, business and other useful categories. New approved
              content can be added as the collection continues to grow.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold">
              Quality & Moderation
            </h2>

            <p className="mt-4 leading-7 text-gray-600">
              Contributor submissions go through a review process before being
              published publicly. This helps us maintain a more useful and
              organized collection for people browsing Heya.
            </p>
          </div>
        </div>

        {/* Creator Section */}
        <div className="mt-16 rounded-3xl bg-black px-8 py-12 text-white sm:px-12">
          <h2 className="text-3xl font-bold">
            Built for creators.
          </h2>

          <p className="mt-4 max-w-3xl leading-7 text-gray-300">
            Whether you are creating a website, designing a social media post,
            producing a marketing campaign or working on a personal creative
            project, Heya aims to make discovering useful visual content simple
            and convenient.
          </p>

          <Link
            prefetch={false}
            href="/"
            className="mt-8 inline-block rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-gray-200"
          >
            Explore Stock Media
          </Link>
        </div>
      </section>
    </main>
  );
}
