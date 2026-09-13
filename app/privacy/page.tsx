import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",

  description:
    "Read the Heya Privacy Policy to understand how information is collected, used and protected when you use our free stock photo and video platform.",

  alternates: {
    canonical: "/privacy",
  },

  openGraph: {
    title: "Privacy Policy | Heya",
    description:
      "Learn how Heya collects, uses and protects information across our stock photo and video platform.",
    url: "https://heya-stock.vercel.app/privacy",
    siteName: "Heya",
    type: "website",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
            Legal
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            Privacy Policy
          </h1>

          <p className="mt-4 text-gray-600">
            Last updated: September 13, 2026
          </p>
        </div>

        <div className="space-y-10 leading-7 text-gray-700">
          <section>
            <h2 className="text-2xl font-bold text-black">
              1. Introduction
            </h2>

            <p className="mt-4">
              Heya is a stock media platform that allows users
              to browse, download and contribute photos and videos.
              This Privacy Policy explains how information may be
              collected, used and protected when you access or use Heya.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black">
              2. Information We May Collect
            </h2>

            <p className="mt-4">
              Depending on how you use Heya, we may collect information
              such as your email address, account details, uploaded
              content, usage information and technical information
              provided by your browser or device.
            </p>

            <p className="mt-4">
              When you create an account or upload media, certain
              account information may be required to provide those
              features.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black">
              3. How We Use Information
            </h2>

            <p className="mt-4">
              Information may be used to operate and improve Heya,
              provide account features, process media submissions,
              maintain platform security, prevent abuse and improve
              the overall user experience.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black">
              4. Uploaded Content
            </h2>

            <p className="mt-4">
              Contributors may upload photos, videos and related
              information such as titles, descriptions, categories and
              tags. Approved content may become publicly accessible on
              Heya.
            </p>

            <p className="mt-4">
              Users should only upload content they have the right to
              submit and share.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black">
              5. Cookies and Similar Technologies
            </h2>

            <p className="mt-4">
              Heya may use cookies and similar technologies to support
              essential website functionality, understand usage,
              remember preferences and improve the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black">
              6. Advertising
            </h2>

            <p className="mt-4">
              Heya may display advertising in the future through
              third-party advertising services such as Google AdSense.
              Advertising providers may use cookies or similar
              technologies to show, measure and personalize ads where
              permitted.
            </p>

            <p className="mt-4">
              Third-party advertising providers may collect information
              about visits to Heya and other websites in accordance
              with their own privacy policies and applicable laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black">
              7. Google Advertising Cookies
            </h2>

            <p className="mt-4">
              If Google advertising services are used on Heya, Google
              and its advertising partners may use cookies to serve ads
              based on a user's visit to Heya or other websites.
            </p>

            <p className="mt-4">
              Users may be able to control or manage personalized
              advertising through their Google advertising settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black">
              8. Third-Party Services
            </h2>

            <p className="mt-4">
              Heya may rely on third-party services for hosting,
              authentication, storage, analytics, advertising or other
              platform functionality. These services may process
              information according to their own privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black">
              9. Data Security
            </h2>

            <p className="mt-4">
              We take reasonable measures to protect information and
              maintain the security of the platform. However, no method
              of transmission or storage over the internet can be
              guaranteed to be completely secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black">
              10. Children's Privacy
            </h2>

            <p className="mt-4">
              Heya is not intended to knowingly collect personal
              information from children where parental or guardian
              consent would be legally required.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black">
              11. Changes to This Privacy Policy
            </h2>

            <p className="mt-4">
              This Privacy Policy may be updated as Heya develops,
              introduces new features or changes the services it uses.
              Updated versions will be published on this page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black">
              12. Contact
            </h2>

            <p className="mt-4">
              If you have questions about this Privacy Policy, you can
              contact Heya through our Contact page.
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