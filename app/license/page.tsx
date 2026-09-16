import Link from "next/link";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Stock Media License", "Read the Heya License to understand how stock photos and videos downloaded from Heya may be used.", "/license");

export default function LicensePage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
            Heya License
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            Simple license for creative use
          </h1>

          <p className="mt-4 text-gray-600">
            Last updated: September 13, 2026
          </p>
        </div>

        <div className="space-y-10 leading-7 text-gray-700">
          <section>
            <h2 className="text-2xl font-bold text-black">
              What you can do
            </h2>

            <p className="mt-4">
              Unless a media item states otherwise, photos and videos
              made available for download on Heya may be used in personal
              and commercial creative projects.
            </p>

            <ul className="mt-5 list-disc space-y-3 pl-6">
              <li>
                Use media in websites, social media posts and applications.
              </li>

              <li>
                Use media in marketing and advertising materials.
              </li>

              <li>
                Use media in presentations, designs, videos and other
                creative projects.
              </li>

              <li>
                Edit, crop, resize or otherwise modify media to fit your
                project.
              </li>

              <li>
                Attribution to Heya or the contributor is appreciated,
                but not required unless specifically stated on the media page.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black">
              What you cannot do
            </h2>

            <ul className="mt-5 list-disc space-y-3 pl-6">
              <li>
                Do not sell or redistribute Heya media as an unchanged,
                standalone file.
              </li>

              <li>
                Do not upload Heya media to another stock media,
                wallpaper or download platform for redistribution.
              </li>

              <li>
                Do not claim that you created or own the original media
                when you did not.
              </li>

              <li>
                Do not use media in unlawful, misleading, defamatory
                or harmful ways.
              </li>

              <li>
                Do not use people, brands or recognizable property in
                a way that falsely suggests endorsement of a product,
                service, organization or political message.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black">
              People, brands and property
            </h2>

            <p className="mt-4">
              Some photos or videos may contain recognizable people,
              logos, trademarks, buildings or other protected property.
            </p>

            <p className="mt-4">
              The Heya License does not automatically grant rights to
              trademarks, publicity rights, privacy rights or other
              third-party rights that may appear in the media.
            </p>

            <p className="mt-4">
              You are responsible for determining whether additional
              permission is required for your intended use.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black">
              Contributor ownership
            </h2>

            <p className="mt-4">
              Contributors retain ownership of the original content
              they submit to Heya.
            </p>

            <p className="mt-4">
              By publishing content through Heya, contributors allow
              Heya to host, display, distribute and make approved media
              available to users under the applicable Heya license.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black">
              No ownership transfer
            </h2>

            <p className="mt-4">
              Downloading media from Heya gives you permission to use
              that media according to this license. It does not transfer
              copyright ownership of the original work to you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black">
              Media-specific restrictions
            </h2>

            <p className="mt-4">
              Certain media may contain additional restrictions or usage
              information. When a media page includes specific conditions,
              those conditions also apply to your use of that media.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black">
              Questions or concerns
            </h2>

            <p className="mt-4">
              If you have questions about using content from Heya or
              believe media has been published without proper permission,
              please contact us.
            </p>

            <Link prefetch={false}
              href="/contact"
              className="mt-4 inline-block rounded-xl bg-black px-6 py-3 font-semibold text-white transition hover:bg-gray-800"
            >
              Contact Heya
            </Link>
          </section>
        </div>
      </section>
    </main>
  );
}
