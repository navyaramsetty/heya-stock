import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",

  description:
    "Read the Heya Terms & Conditions covering use of the platform, contributor uploads, downloads, content rights and acceptable use.",

  alternates: {
    canonical: "/terms",
  },

  openGraph: {
    title: "Terms & Conditions | Heya",
    description:
      "Read the terms that apply when browsing, downloading or contributing stock photos and videos on Heya.",
    url: "https://heya-stock.vercel.app/terms",
    siteName: "Heya",
    type: "website",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
            Legal
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            Terms & Conditions
          </h1>

          <p className="mt-4 text-gray-600">
            Last updated: September 13, 2026
          </p>
        </div>

        <div className="space-y-10 leading-7 text-gray-700">
          <section>
            <h2 className="text-2xl font-bold text-black">
              1. Acceptance of Terms
            </h2>

            <p className="mt-4">
              By accessing or using Heya, you agree to follow these
              Terms & Conditions. If you do not agree with these terms,
              you should stop using the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black">
              2. About Heya
            </h2>

            <p className="mt-4">
              Heya is a stock media platform that allows users to browse,
              download and contribute photos and videos for creative,
              marketing, design, website, social media and other projects.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black">
              3. User Accounts
            </h2>

            <p className="mt-4">
              Some features may require a user account. You are responsible
              for providing accurate information and maintaining the
              confidentiality of your login credentials.
            </p>

            <p className="mt-4">
              You are responsible for activity performed through your
              account unless otherwise required by applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black">
              4. Contributor Uploads
            </h2>

            <p className="mt-4">
              Contributors may upload photos, videos and related information
              such as titles, descriptions, tags and categories.
            </p>

            <p className="mt-4">
              By submitting content to Heya, you confirm that you own the
              content or have sufficient rights and permissions to upload
              and share it.
            </p>

            <p className="mt-4">
              You must not upload content that infringes copyright,
              trademark, privacy, publicity or other rights belonging to
              another person or organization.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black">
              5. Content Review and Moderation
            </h2>

            <p className="mt-4">
              Contributor submissions may be reviewed before becoming
              publicly available. Heya may approve, reject, restrict or
              remove content that does not meet platform requirements,
              these terms or applicable laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black">
              6. Content Rights
            </h2>

            <p className="mt-4">
              Contributors retain ownership of the content they create,
              subject to any rights or licenses they grant through the
              platform.
            </p>

            <p className="mt-4">
              By publishing content on Heya, contributors grant Heya the
              permission reasonably necessary to host, store, display,
              distribute, promote and make that content available through
              the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black">
              7. Downloads and Use of Media
            </h2>

            <p className="mt-4">
              Media available on Heya may be downloaded and used only in
              accordance with the license or usage permissions displayed
              on the platform.
            </p>

            <p className="mt-4">
              Users are responsible for ensuring that their use of media
              complies with applicable laws and any third-party rights,
              including trademark, privacy, publicity and intellectual
              property rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black">
              8. Prohibited Use
            </h2>

            <p className="mt-4">
              You must not use Heya to upload, distribute or promote
              unlawful, abusive, deceptive, harmful or infringing content.
            </p>

            <p className="mt-4">
              You must also not attempt to interfere with platform security,
              access restricted systems, misuse accounts, manipulate
              download statistics or disrupt normal operation of Heya.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black">
              9. Third-Party Services
            </h2>

            <p className="mt-4">
              Heya may rely on third-party providers for services such as
              hosting, authentication, storage, analytics or advertising.
              Those services may be subject to their own terms and policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black">
              10. Advertising
            </h2>

            <p className="mt-4">
              Heya may display advertisements or sponsored content in the
              future. The presence of advertising does not necessarily mean
              that Heya endorses a particular advertiser, product or service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black">
              11. Availability of the Platform
            </h2>

            <p className="mt-4">
              We aim to keep Heya available and reliable, but uninterrupted
              or error-free operation cannot be guaranteed. Features may be
              changed, suspended or discontinued when necessary.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black">
              12. Disclaimer
            </h2>

            <p className="mt-4">
              Heya is provided on an &quot;as available&quot; basis. We do not
              guarantee that every item of user-submitted media is suitable
              for every purpose or free from all third-party claims.
            </p>

            <p className="mt-4">
              Users should perform their own checks before using media in
              sensitive, commercial or regulated contexts.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black">
              13. Limitation of Liability
            </h2>

            <p className="mt-4">
              To the extent permitted by applicable law, Heya will not be
              responsible for indirect, incidental or consequential losses
              arising from use of the platform, downloaded content or
              third-party services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black">
              14. Changes to These Terms
            </h2>

            <p className="mt-4">
              These Terms & Conditions may be updated as Heya grows or new
              features are introduced. Updated terms will be published on
              this page with a revised date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black">
              15. Contact
            </h2>

            <p className="mt-4">
              If you have questions about these Terms & Conditions, please
              contact Heya through the Contact page.
            </p>

            <a
              href="/contact"
              className="mt-4 inline-block font-semibold text-black underline"
            >
              Contact Heya
            </a>
          </section>
        </div>
      </section>
    </main>
  );
}